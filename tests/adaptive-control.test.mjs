import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import vm from 'node:vm';

const pollSource = readFileSync(new URL('../src/server/smoker/poll-status.js', import.meta.url), 'utf8');
const startSource = readFileSync(new URL('../src/server/smoker/session-status-api.js', import.meta.url), 'utf8');
const qualitySource = readFileSync(new URL('../src/server/smoker/cooking-quality.js', import.meta.url), 'utf8');
const now = Date.parse('2026-10-18T12:00:00Z');

function record(values = {}) {
  return {
    values,
    getValue(field) { return this.values[field] ?? ''; },
    setValue(field, value) { this.values[field] = value; },
    getUniqueValue() { return 'session'; },
    update() {},
  };
}

function setup(overrides = {}, rate = 0) {
  const session = record({
    status: 'cooking',
    ai_control_enabled: 'true',
    ai_plan_status: 'active',
    ai_phase_index: '0',
    ai_current_phase: 'smoking',
    ai_plan_json: JSON.stringify({phases: [{name: 'smoking', mode: 'automatic', chamber_target_c: 110, meat_target_c: 74, completion_rule: 'temperature'}]}),
    adaptive_temperature_enabled: 'true',
    adaptive_minimum_chamber_temperature_c: '110',
    adaptive_maximum_chamber_temperature_c: '170',
    maximum_chamber_temperature_c: '200',
    adaptive_current_chamber_target_c: '165',
    adaptive_evaluation_minutes: '3',
    adaptive_target_step_c: '10',
    adaptive_minimum_meat_rise_c_per_min: '0.4',
    adaptive_maximum_meat_rise_c_per_min: '0.8',
    chamber_temperature_tolerance_c: '3',
    target_chamber_temperature_c: '150',
    target_meat_temperature_c: '74',
    monitor_meat_temperature: 'true',
    ...overrides,
  });
  const readings = [
    {recorded_at: now, meat_temperature_c: 50},
    {recorded_at: now - 180000, meat_temperature_c: 50 - rate * 3},
  ];
  function GlideDateTime(value) {
    this.getNumericValue = () => value === undefined ? now : Number(value);
  }
  function GlideRecord(table) {
    if (table === 'x_tsigh_smkrctrl_cooking_session') {
      Object.assign(this, session);
      this.next = () => true;
    } else {
      let index = -1;
      this.next = () => ++index < readings.length;
      this.getValue = field => readings[index]?.[field] ?? '';
    }
    this.get = () => true;
    for (const method of ['addQuery', 'addNotNullQuery', 'orderByDesc', 'setLimit', 'query']) this[method] = () => {};
  }
  const context = vm.createContext({GlideDateTime, GlideRecord, Class: {create: () => function() {}}});
  vm.runInContext(qualitySource, context);
  vm.runInContext(pollSource.slice(0, pollSource.indexOf('\nvar devices =')), context);
  const decisions = [];
  context.forceRelayOffForSafety = (_device, _session, reason) => {
    decisions.push({action: 'safety_off', reason});
    return {success: true};
  };
  context.recordAdaptiveAdjustment = (...args) => decisions.push({action: 'adjustment', args});
  context.recordControllerDecision = (_device, _session, action, reason) => {
    decisions.push({action, reason});
    return {success: true};
  };
  context.canSwitchRelay = () => true;
  context.projectedChamberTemperature = (_id, chamber) => chamber;
  context.resolveManualActionAlert = () => {};
  const device = record();
  const adapt = (chamber = 165, meat = 50) => context.adaptChamberTarget(session, 'device', chamber, meat, 110, 200, 'test', true);
  return {context, session, device, decisions, adapt};
}

test('slow or falling meat temperature raises the target only to the operating ceiling', () => {
  for (const rate of [0, -0.5, 0.2]) {
    const {adapt, session} = setup({}, rate);
    assert.equal(adapt(), 170);
    assert.equal(session.getValue('adaptive_current_chamber_target_c'), 170);
  }
});

test('stall at operating ceiling keeps normal heating active without faulting', () => {
  const {context, session, device, decisions} = setup({adaptive_current_chamber_target_c: '170'});
  context.evaluateAiPlanController(device, {chamberTemperature: 160, meatTemperature: 50});
  assert.equal(session.getValue('status'), 'cooking');
  assert.equal(session.getValue('ai_plan_status'), 'active');
  assert.equal(session.getValue('adaptive_current_chamber_target_c'), '170');
  assert.equal(decisions.at(-1).action, 'relay_on');
});

test('relay cycles off above the operating band without triggering a safety fault', () => {
  const {context, session, device, decisions} = setup({adaptive_current_chamber_target_c: '170'});
  context.evaluateAiPlanController(device, {chamberTemperature: 173, meatTemperature: 50});
  assert.equal(decisions.at(-1).action, 'relay_off');
  assert.equal(session.getValue('status'), 'cooking');
});

test('high heating rate can reduce the target and normal rate keeps it unchanged', () => {
  assert.equal(setup({}, 1).adapt(), 155);
  assert.equal(setup({}, 0.6).adapt(), 165);
});

test('existing targets above a newly lowered ceiling are clamped and persisted', () => {
  const {adapt, session} = setup({adaptive_current_chamber_target_c: '190'});
  assert.equal(adapt(), 170);
  assert.equal(session.getValue('adaptive_current_chamber_target_c'), 170);
});

test('missing or unsafe adaptive limits stop heating and fault an AI session', () => {
  for (const overrides of [
    {adaptive_maximum_chamber_temperature_c: ''},
    {adaptive_maximum_chamber_temperature_c: '200'},
    {adaptive_maximum_chamber_temperature_c: '197'},
    {adaptive_minimum_chamber_temperature_c: '180'},
    {adaptive_maximum_chamber_temperature_c: '-1'},
  ]) {
    const {context, session, device, decisions} = setup(overrides);
    context.evaluateAiPlanController(device, {chamberTemperature: 150, meatTemperature: 50});
    assert.equal(decisions.at(-1).action, 'safety_off');
    assert.equal(session.getValue('status'), 'fault');
    assert.equal(session.getValue('ai_plan_status'), 'paused');
  }
});

test('hard safety cutoff still stops heating and pauses the AI plan', () => {
  const {context, session, device, decisions} = setup();
  context.canSwitchRelay = () => false;
  context.evaluateAiPlanController(device, {chamberTemperature: 200, meatTemperature: 50});
  assert.equal(decisions.at(-1).action, 'safety_off');
  assert.equal(session.getValue('status'), 'fault');
  assert.equal(session.getValue('ai_plan_status'), 'paused');
});

test('changing only status to cooking cannot restart a paused automatic phase', () => {
  const {context, session, device, decisions} = setup({ai_plan_status: 'paused'});
  context.evaluateAiPlanController(device, {chamberTemperature: 79, meatTemperature: 50});
  assert.equal(decisions.at(-1).action, 'safety_off');
  assert.equal(session.getValue('ai_plan_status'), 'paused');
});

test('manual checkpoints remain paused and turn heating off', () => {
  const {context, device, decisions} = setup({
    ai_plan_status: 'paused',
    ai_current_phase: 'wrap_checkpoint',
    ai_plan_json: JSON.stringify({phases: [{name: 'wrap_checkpoint', mode: 'manual', message: 'Wrap the meat.'}]}),
  });
  context.createManualActionAlert = () => {};
  context.evaluateAiPlanController(device, {chamberTemperature: 120, meatTemperature: 74});
  assert.equal(decisions.at(-1).action, 'safety_off');
});

test('non-AI adaptive control respects operating ceiling and faults on missing configuration', () => {
  for (const ceiling of ['170', '']) {
    const {context, session, device, decisions} = setup({adaptive_maximum_chamber_temperature_c: ceiling, adaptive_current_chamber_target_c: '170'});
    context.evaluateDryRunController(device, {chamberTemperature: 160, meatTemperature: 50});
    assert.equal(session.getValue('status'), ceiling ? 'cooking' : 'fault');
    assert.equal(decisions.at(-1).action, ceiling ? 'relay_on' : 'safety_off');
  }
});

test('non-adaptive targets are unchanged', () => {
  assert.equal(setup({adaptive_temperature_enabled: 'false'}).adapt(), 110);
});

test('missing adaptive ceiling cannot fall through to non-AI heating without a meat target', () => {
  const {context, session, device, decisions} = setup({
    adaptive_maximum_chamber_temperature_c: '', target_meat_temperature_c: '',
  });
  context.evaluateDryRunController(device, {chamberTemperature: 79, meatTemperature: null});
  assert.equal(session.getValue('status'), 'fault');
  assert.equal(decisions.at(-1).action, 'safety_off');
});

test('start API rejects missing or unsafe ceilings and caps valid initial targets', () => {
  for (const ceiling of ['', '200', '197', '170']) {
    const {context, session} = setup({
      status: 'planned', ai_plan_status: 'approved',
      adaptive_maximum_chamber_temperature_c: ceiling,
      target_chamber_temperature_c: '180',
    });
    let status;
    context.request = {body: {dataString: JSON.stringify({sessionId: 'session', action: 'start'})}};
    context.response = {setStatus(value) {status = value;}, setBody() {}};
    vm.runInContext(startSource, context);
    assert.equal(status, ceiling === '170' ? 200 : 409);
    if (status === 409) assert.equal(session.getValue('status'), 'planned');
    else assert.ok(session.getValue('adaptive_current_chamber_target_c') <= 170);
  }
});

test('hard cutoff faults non-AI sessions and bypasses normal relay switch intervals', () => {
  const {context, session, device, decisions} = setup();
  context.canSwitchRelay = () => false;
  context.evaluateDryRunController(device, {chamberTemperature: 200, meatTemperature: 50});
  assert.equal(session.getValue('status'), 'fault');
  assert.equal(decisions.at(-1).action, 'safety_off');
});

function resumeRequest(overrides = {}, deviceOverrides = {}) {
  const phase = {name: 'wrapped', mode: 'automatic', chamber_target_c: 120, meat_target_c: 90, completion_rule: 'temperature'};
  const state = setup({
    status: 'fault', ai_plan_status: 'paused', ai_phase_index: '3',
    ai_current_phase: 'wrapped', ai_phase_started_at: String(now - 3600000),
    started_at: String(now - 7200000), smoker_device: 'device',
    control_mode: 'automatic', automatic_control_enabled: 'true',
    ai_plan_json: JSON.stringify({phases: [phase, phase, phase, phase,
      {...phase, name: 'unwrapped_finishing', chamber_target_c: 150, meat_target_c: 95},
      {name: 'resting', mode: 'manual', completion_rule: 'manual', message: 'Rest for 30 minutes.'}]}),
    ...overrides,
  });
  const device = record({
    active: 'true', polling_enabled: 'true', connection_status: 'online',
    last_successful_contact: String(now), last_chamber_temperature_c: '80',
    last_meat_temperature_c: '85', ...deviceOverrides,
  });
  const OriginalGlideRecord = state.context.GlideRecord;
  state.context.GlideRecord = function(table) {
    if (table !== 'x_tsigh_smkrctrl_smoker_device') return new OriginalGlideRecord(table);
    Object.assign(this, device);
    this.get = () => deviceOverrides.exists !== false;
  };
  let updates = 0;
  state.session.update = () => { updates++; };
  let status;
  let body;
  state.context.request = {body: {dataString: JSON.stringify({sessionId: 'session', action: 'resume'})}};
  state.context.response = {setStatus(value) {status = value;}, setBody(value) {body = value;}};
  const before = {...state.session.values};
  vm.runInContext(startSource, state.context);
  return {...state, status, body, before, updates};
}

test('resume preserves the saved phase and plan, resets its clock and safely reinitializes adaptive target', () => {
  for (const status of ['fault', 'cooking', 'preheating', 'holding']) {
    const result = resumeRequest({status, adaptive_current_chamber_target_c: '190'});
    assert.equal(result.status, 200);
    assert.equal(result.updates, 1);
    assert.equal(result.session.getValue('status'), 'cooking');
    assert.equal(result.session.getValue('ai_plan_status'), 'active');
    assert.equal(result.session.getValue('ai_phase_index'), '3');
    assert.equal(result.session.getValue('ai_current_phase'), 'wrapped');
    assert.equal(result.session.getValue('ai_plan_json'), result.before.ai_plan_json);
    assert.equal(result.session.getValue('started_at'), result.before.started_at);
    assert.equal(result.session.getValue('adaptive_current_chamber_target_c'), 120);
    assert.equal(result.session.getValue('ai_phase_started_at').getNumericValue(), now);
    assert.equal(result.decisions.length, 0, 'resume must leave relay decisions to the polling controller');
  }
});

test('resume rejects invalid workflow states and malformed plans without changing records', () => {
  for (const overrides of [
    {status: 'planned'}, {status: 'completed'}, {status: 'stopped'},
    {ai_control_enabled: 'false'}, {ai_plan_status: 'active'}, {ai_plan_status: 'rejected'},
    {ai_manual_action_required: 'true'}, {ai_manual_action_required: '1'},
    {ai_phase_index: ''}, {ai_phase_index: '-1'}, {ai_phase_index: '3.5'}, {ai_phase_index: '99'},
    {ai_phase_index: '5'}, {ai_plan_json: '{'}, {ai_plan_json: '{}'}, {ai_plan_json: 'null'},
    {control_mode: 'automatic', automatic_control_enabled: 'false'},
  ]) {
    const result = resumeRequest(overrides);
    assert.ok([409, 422].includes(result.status), JSON.stringify(overrides));
    assert.equal(result.body.success, false);
    assert.ok(result.body.message);
    assert.deepEqual(result.session.values, result.before);
    assert.equal(result.updates, 0);
  }
});

test('resume requires safe adaptive limits and valid current temperatures below the cutoff', () => {
  for (const overrides of [
    {adaptive_maximum_chamber_temperature_c: ''},
    {maximum_chamber_temperature_c: '170'},
    {maximum_chamber_temperature_c: ''},
    {adaptive_minimum_chamber_temperature_c: '180'},
    {chamber_temperature_tolerance_c: '-1'},
    {monitor_meat_temperature: 'false'},
  ]) {
    const result = resumeRequest(overrides);
    assert.equal(result.status, 409, JSON.stringify(overrides));
    assert.deepEqual(result.session.values, result.before);
    assert.equal(result.updates, 0);
  }
  for (const overrides of [
    {exists: false}, {active: 'false'}, {polling_enabled: 'false'}, {connection_status: 'offline'},
    {last_successful_contact: ''}, {last_successful_contact: String(now - 60001)},
    {last_successful_contact: String(now + 1)}, {last_chamber_temperature_c: ''},
    {last_meat_temperature_c: ''}, {last_chamber_temperature_c: '200'},
  ]) {
    const result = resumeRequest({}, overrides);
    assert.equal(result.status, 409, JSON.stringify(overrides));
    assert.deepEqual(result.session.values, result.before);
    assert.equal(result.updates, 0);
  }
  assert.equal(resumeRequest({}, {last_successful_contact: String(now - 60000)}).status, 200);
});

test('resumed controller heats the saved phase or advances already-reached targets to manual rest', () => {
  const heating = resumeRequest();
  heating.context.evaluateAiPlanController(heating.device, {chamberTemperature: 80, meatTemperature: 85});
  assert.equal(heating.session.getValue('ai_phase_index'), '3');
  assert.equal(heating.decisions.at(-1).action, 'relay_on');
  const finishedTargets = resumeRequest({}, {last_meat_temperature_c: '98'});
  finishedTargets.context.createManualActionAlert = () => {};
  for (let index = 0; index < 2; index++) {
    finishedTargets.context.evaluateAiPlanController(finishedTargets.device, {chamberTemperature: 80, meatTemperature: 98});
  }
  assert.equal(finishedTargets.session.getValue('ai_phase_index'), 5);
  assert.equal(finishedTargets.session.getValue('ai_current_phase'), 'resting');
  assert.equal(finishedTargets.session.getValue('ai_plan_status'), 'paused');
  assert.equal(finishedTargets.session.getValue('ai_manual_action_required'), true);
  assert.equal(finishedTargets.decisions.at(-1).action, 'safety_off');
  assert.ok(finishedTargets.decisions.every(decision => decision.action !== 'relay_on'));
  finishedTargets.session.setValue('ai_manual_action_required', '1');
  finishedTargets.context.request.body.dataString = JSON.stringify({sessionId: 'session', action: 'checkpoint', decision: 'continue'});
  vm.runInContext(startSource, finishedTargets.context);
  assert.equal(finishedTargets.session.getValue('status'), 'completed');
  assert.equal(finishedTargets.session.getValue('ai_plan_status'), 'completed');
});

test('resume restarts only the current duration phase timer and validates completion rules', () => {
  const phase = {name: 'smoking', mode: 'automatic', chamber_target_c: 120, completion_rule: 'duration', max_duration_minutes: 30};
  const result = resumeRequest({ai_phase_index: '0', ai_plan_json: JSON.stringify({phases: [phase]})});
  assert.equal(result.status, 200);
  result.context.evaluateAiPlanController(result.device, {chamberTemperature: 80, meatTemperature: 50});
  assert.equal(result.session.getValue('status'), 'cooking');
  assert.equal(result.decisions.at(-1).action, 'relay_on');
  for (const changes of [
    {completion_rule: 'manual'}, {max_duration_minutes: 0},
    {chamber_target_c: 200}, {chamber_target_c: null}, {meat_target_c: 'bad'},
  ]) {
    const invalid = resumeRequest({ai_phase_index: '0', ai_plan_json: JSON.stringify({phases: [{...phase, ...changes}]})});
    assert.ok([409, 422].includes(invalid.status));
    assert.equal(invalid.updates, 0);
  }
});

test('dashboard hides inactive targets and clearly reports fault and pause states', () => {
  const source = readFileSync(new URL('../pages/smokercontrolroom/page.js', import.meta.url), 'utf8');
  const targetMethod = source.slice(source.indexOf('  _effectiveChamberTarget(session) {'), source.indexOf('  _chamberTargetLabel(session) {'));
  const controllerMethod = source.slice(source.indexOf('  _renderControllerStatus(device, session) {'), source.indexOf('  _renderTabs(device) {'));
  const resumeMethod = source.slice(source.indexOf('  _canResumeAi(session) {'), source.indexOf('  async _setSessionStatus(action) {'));
  const context = vm.createContext({
    getValue: (session, field) => session?.[field],
    getRecords: rows => rows || [],
    toNumber: value => value === '' || value === undefined || value === null ? null : Number(value),
    isEnabled: value => value === 'true',
    isMeatMonitoringEnabled: () => true,
    i18n: {getMessage: text => text},
    formatTemperature: value => String(value),
    formatControllerAction: value => String(value),
    html: (strings, ...values) => strings.reduce((text, part, index) => text + part + (values[index] ?? ''), ''),
    nothing: '',
  });
  const methods = vm.runInContext(`({${targetMethod},${controllerMethod},${resumeMethod}})`, context);
  const page = {
    ...methods,
    _currentData: () => ({actions: []}),
    _aiPlanStatus: session => session.ai_plan_status,
    _aiPlanTargets: () => ({chamber: 110}),
  };
  for (const session of [
    {status: 'fault', ai_plan_status: 'paused'},
    {status: 'cooking', ai_plan_status: 'paused'},
    {status: 'completed'},
    {status: 'stopped'},
  ]) assert.equal(page._effectiveChamberTarget(session), null);
  assert.match(page._renderControllerStatus({}, {status: 'fault', ai_plan_status: 'paused'}), /Heating stopped: safety fault/);
  assert.match(page._renderControllerStatus({}, {status: 'cooking', ai_plan_status: 'paused'}), /AI heating paused/);
  const paused = {status: 'fault', ai_plan_status: 'paused', ai_control_enabled: 'true'};
  assert.match(page._renderControllerStatus({}, paused), /Resume AI cooking<\/button>/);
  for (const session of [
    {...paused, ai_manual_action_required: 'true'},
    {...paused, status: 'completed'}, {...paused, status: 'planned'},
    {...paused, ai_control_enabled: 'false'}, {...paused, ai_plan_status: 'active'},
  ]) assert.equal(page._canResumeAi(session), false);
  assert.doesNotMatch(page._renderControllerStatus({}, {...paused, ai_manual_action_required: 'true'}), /Resume AI cooking<\/button>/);
  const active = {
    status: 'cooking', ai_plan_status: 'active', control_mode: 'automatic',
    automatic_control_enabled: 'true', adaptive_temperature_enabled: 'true',
    adaptive_current_chamber_target_c: '170', adaptive_maximum_chamber_temperature_c: '170',
  };
  assert.match(page._renderControllerStatus({}, active), /Operating limit reached; monitoring meat temperature/);
  assert.doesNotMatch(page._renderControllerStatus({}, {...active, adaptive_current_chamber_target_c: '160'}), /Operating limit reached/);
});

test('resume confirmation calls the session API and surfaces validation errors instead of success', async () => {
  const source = readFileSync(new URL('../pages/smokercontrolroom/page.js', import.meta.url), 'utf8');
  const statusMethod = source.slice(source.indexOf('  async _setSessionStatus(action) {'), source.indexOf('  async _setAiCheckpoint(decision) {'));
  const confirmMethod = source.slice(source.indexOf('  async _confirmAction() {'), source.indexOf('  _renderGauge('));
  for (const outcome of ['success', 'http-error', 'transport-error']) {
    const calls = [];
    let refreshes = 0;
    const context = vm.createContext({
      getValue: (session, field) => session[field],
      i18n: {getMessage: text => text},
      aiuxFetch: async (url, options) => {
        calls.push({url, payload: JSON.parse(options.body)});
        if (outcome === 'transport-error') throw {response: {data: {result: {message: 'Unsafe adaptive limits'}}}};
        return {ok: outcome === 'success', json: async () => ({result: {message: 'Unsafe adaptive limits'}})};
      },
    });
    const page = {
      ...vm.runInContext(`({${statusMethod},${confirmMethod}})`, context),
      confirmAction: 'resume', refreshing: false,
      _device: () => ({}), _deviceSession: () => ({sys_id: 'session'}),
      requestUpdate() {}, _refresh: async () => { refreshes++; },
    };
    await page._confirmAction();
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, '/api/x_tsigh_smkrctrl/smoker_relay/session-status');
    assert.deepEqual(calls[0].payload, {sessionId: 'session', action: 'resume'});
    assert.equal(page.confirmAction, null);
    assert.equal(page.refreshing, false);
    assert.equal(refreshes, outcome === 'success' ? 1 : 0);
    assert.match(page.actionMessage, outcome === 'success' ? /AI cooking resumed/ : /Unsafe adaptive limits/);
  }
});

test('real relay wrapper bypasses switch delay only for a safety shutdown', () => {
  const source = readFileSync(new URL('../src/server/smoker/relay-control.js', import.meta.url), 'utf8');
  let requests = 0;
  function GlideRecord(table) {
    Object.assign(this, record({
      active: '1', connection_status: 'online', minimum_relay_switch_interval_seconds: '60',
      action: 'relay_on', requested_at: String(now), request_timeout_seconds: '5',
    }));
    this.get = () => true;
    this.initialize = () => {};
    this.insert = () => {};
    this.getElement = () => ({getDecryptedValue: () => 'test-key'});
    for (const method of ['addQuery', 'orderByDesc', 'setLimit', 'query']) this[method] = () => {};
    this.next = () => table === 'x_tsigh_smkrctrl_control_action';
  }
  function GlideDateTime(value) { this.getNumericValue = () => value === undefined ? now : Number(value); }
  function RESTMessageV2() {
    for (const method of ['setStringParameterNoEscape', 'setRequestHeader', 'setHttpTimeout']) this[method] = () => {};
    this.execute = () => {
      requests++;
      return {getStatusCode: () => 200, getBody: () => JSON.stringify({status: 'success', relay_active: false})};
    };
  }
  const context = vm.createContext({Class: {create: () => function() {}}, GlideRecord, GlideDateTime, sn_ws: {RESTMessageV2}});
  vm.runInContext(source, context);
  const relay = new context.SmokerRelayControl();
  assert.equal(relay.setRelay('device', false, 'session', 'automatic_rule', 'Normal cycling').result, 'blocked');
  assert.equal(requests, 0);
  assert.equal(relay.setRelay('device', false, 'session', 'safety_logic', 'Safety cutoff').success, true);
  assert.equal(requests, 1);
});

function qualityPlan() {
  return {
    schema_version: 2, dish: 'Pulled pork', cooking_style: 'pull_apart',
    safety: {minimum_meat_temperature_c: 74},
    quality: {adaptive_ceiling_c: 130, recheck_chamber_c: 120, recheck_minutes: 20, stall_tolerant: true},
    phases: [
      {id: 'unwrap', name: 'unwrap', kind: 'checkpoint', mode: 'manual', completion_rule: 'manual', message: 'Unwrap the meat.', manual_actions: [{action: 'uncover'}]},
      {id: 'finish', name: 'finish', kind: 'unwrapped_finishing', mode: 'automatic', chamber_target_c: 120, meat_target_c: 95, completion_rule: 'temperature_and_time', minimum_duration_minutes: 60},
      {id: 'tenderness', name: 'check_tenderness', kind: 'checkpoint', checkpoint: 'tenderness', mode: 'manual', completion_rule: 'manual', message: 'Check temperature independently and probe tenderness.'},
      {id: 'rest', name: 'resting', kind: 'resting', mode: 'manual', completion_rule: 'manual', minimum_duration_minutes: 30, message: 'Rest after removing the meat.'},
    ],
  };
}

function qualityState(overrides = {}, plan = qualityPlan()) {
  return setup({
    ai_plan_json: JSON.stringify(plan), ai_phase_index: '1', ai_current_phase: 'finish',
    ai_phase_started_at: String(now - 60000), adaptive_current_chamber_target_c: '120',
    ...overrides,
  });
}

function checkpointRequest(state, decision) {
  let status;
  let body;
  state.context.request = {body: {dataString: JSON.stringify({sessionId: 'session', action: 'checkpoint', decision})}};
  state.context.response = {setStatus(value) {status = value;}, setBody(value) {body = value;}};
  vm.runInContext(startSource, state.context);
  return {status, body};
}

test('both plan entry points accept complete generated quality policies and reject incomplete ones', () => {
  const {context} = setup();
  const saveSource = readFileSync(new URL('../src/server/smoker/cooking-plan-api.js', import.meta.url), 'utf8');
  const generationSource = readFileSync(new URL('../src/server/smoker/external-llm-api.js', import.meta.url), 'utf8');
  for (const source of [saveSource, generationSource]) {
    vm.runInContext(source.slice(0, source.indexOf('(function process(')), context);
    const validate = plan => source === saveSource ? context.validatePlan(plan, 74) : context.validatePlan(plan, 200, 74);
    assert.equal(validate(qualityPlan()), null);
    for (const mutate of [
      plan => { delete plan.quality; },
      plan => { plan.quality.adaptive_ceiling_c = 110; },
      plan => { plan.quality.recheck_minutes = 0; },
      plan => { plan.quality.recheck_minutes = 121; },
      plan => { plan.quality.recheck_chamber_c = 150; },
      plan => { plan.quality.stall_tolerant = false; },
      plan => { delete plan.phases[1].minimum_duration_minutes; },
      plan => { plan.phases[1].completion_rule = 'temperature'; },
      plan => { plan.phases[2].optional = true; },
      plan => { delete plan.phases[2].checkpoint; },
      plan => { plan.phases[0].manual_actions = []; },
      plan => { plan.phases[0].optional = true; },
      plan => { plan.phases[3].minimum_duration_minutes = -1; },
      plan => { plan.phases[3].optional = true; },
    ]) {
      const plan = qualityPlan();
      mutate(plan);
      assert.ok(validate(plan), JSON.stringify(plan));
    }
  }
});

test('quality generation normalization cannot synthesize an immediate temperature-only bypass', () => {
  const {context} = setup();
  const source = readFileSync(new URL('../src/server/smoker/external-llm-api.js', import.meta.url), 'utf8');
  vm.runInContext(source.slice(0, source.indexOf('(function process(')), context);
  const plan = qualityPlan();
  const normalized = context.normalizePlan(plan, {dish: 'Pulled pork'}, 74, 200);
  assert.equal(normalized.phases.length, 4);
  assert.equal(normalized.phases[2].checkpoint, 'tenderness');
  assert.equal(normalized.phases[3].minimum_duration_minutes, 30);
  assert.equal(context.validatePlan(normalized, 200, 74), null);
});

test('high meat readings cannot bypass the recipe minimum time or the tenderness checkpoint', () => {
  const state = qualityState();
  state.context.createManualActionAlert = () => {};
  state.context.evaluateAiPlanController(state.device, {chamberTemperature: 120, meatTemperature: 98});
  assert.equal(state.session.getValue('ai_phase_index'), '1');
  assert.equal(state.session.getValue('ai_plan_status'), 'active');
  state.session.setValue('ai_phase_started_at', String(now - 3600000));
  state.context.evaluateAiPlanController(state.device, {chamberTemperature: 120, meatTemperature: 94.9});
  assert.equal(state.session.getValue('ai_phase_index'), '1');
  state.context.evaluateAiPlanController(state.device, {chamberTemperature: 120, meatTemperature: 95});
  assert.equal(state.session.getValue('ai_phase_index'), 2);
  assert.equal(state.session.getValue('ai_plan_status'), 'paused');
  assert.equal(state.session.getValue('ai_manual_action_required'), true);
  assert.equal(state.decisions.at(-1).action, 'safety_off');
});

test('quality recipe clamps stale adaptive targets and tolerates stalls without upward adjustments', () => {
  const state = qualityState({adaptive_current_chamber_target_c: '170'});
  state.context.evaluateAiPlanController(state.device, {chamberTemperature: 120, meatTemperature: 80});
  assert.equal(state.session.getValue('adaptive_current_chamber_target_c'), 130);
  const {context, session} = qualityState({adaptive_current_chamber_target_c: '120'});
  for (const meat of [80, 79, 81]) {
    assert.equal(context.adaptChamberTarget(session, 'device', 120, meat, 120, 200, 'test', true, qualityPlan().quality), 120);
  }
  const nonadaptive = qualityState({adaptive_temperature_enabled: 'false'});
  assert.equal(nonadaptive.context.adaptChamberTarget(nonadaptive.session, 'device', 100, 80, 170, 200, 'test', true, qualityPlan().quality), 130);
});

test('quality trend uses sustained median buckets and ignores an isolated extreme reading', () => {
  const state = qualityState();
  let index = -1;
  const samples = Array.from({length: 10}, (_, sample) => ({
    recorded_at: String(now - sample * 20000),
    meat_temperature_c: sample === 0 ? 99 : 80,
  }));
  state.context.GlideRecord = function() {
    this.next = () => ++index < samples.length;
    this.getValue = field => samples[index]?.[field] ?? '';
    for (const method of ['addQuery', 'addNotNullQuery', 'orderByDesc', 'setLimit', 'query']) this[method] = () => {};
  };
  assert.equal(state.context.adaptChamberTarget(state.session, 'device', 120, 80, 120, 200, 'test', true, qualityPlan().quality), 120);
  index = -1;
  for (let sample = 0; sample < samples.length; sample++) samples[sample].meat_temperature_c = 85 - sample * 0.5;
  assert.equal(state.context.adaptChamberTarget(state.session, 'device', 120, 85, 120, 200, 'test', true, qualityPlan().quality), 110);
});

test('tenderness repeat uses recipe settings, keeps the plan unchanged and waits the full interval', () => {
  const plan = qualityPlan();
  const state = resumeRequest({
    ai_phase_index: '2', ai_current_phase: 'check_tenderness', ai_manual_action_required: 'true',
    ai_plan_json: JSON.stringify(plan), status: 'cooking',
  }, {last_meat_temperature_c: '98'});
  const beforePlan = state.session.getValue('ai_plan_json');
  assert.equal(checkpointRequest(state, 'repeat').status, 200);
  assert.equal(state.session.getValue('ai_phase_index'), 1);
  assert.equal(state.session.getValue('ai_quality_retry'), true);
  assert.equal(state.session.getValue('adaptive_current_chamber_target_c'), 120);
  assert.equal(state.session.getValue('ai_plan_json'), beforePlan);
  assert.equal(state.decisions.length, 0);
  state.context.createManualActionAlert = () => {};
  state.session.setValue('ai_quality_retry', 'true');
  state.context.evaluateAiPlanController(state.device, {chamberTemperature: 110, meatTemperature: 98});
  assert.equal(state.decisions.at(-1).action, 'relay_on');
  assert.equal(state.session.getValue('ai_phase_index'), 1);
  state.session.setValue('ai_phase_started_at', String(now - 20 * 60000));
  state.context.evaluateAiPlanController(state.device, {chamberTemperature: 110, meatTemperature: 98});
  assert.equal(state.session.getValue('ai_phase_index'), 2);
  assert.equal(state.session.getValue('ai_plan_status'), 'paused');
  assert.equal(state.decisions.at(-1).action, 'safety_off');
});

test('mandatory unwrap and tenderness checkpoints cannot be skipped and rest is server-timed', () => {
  const state = qualityState({ai_phase_index: '2', ai_plan_status: 'paused', ai_manual_action_required: 'true'});
  assert.equal(checkpointRequest(state, 'skip').status, 409);
  assert.equal(checkpointRequest(state, 'continue').status, 200);
  assert.equal(state.session.getValue('ai_phase_index'), 3);
  assert.equal(state.session.getValue('ai_plan_status'), 'paused');
  state.session.setValue('ai_manual_action_required', 'true');
  state.session.setValue('ai_phase_started_at', String(now));
  assert.equal(checkpointRequest(state, 'continue').status, 409);
  assert.equal(checkpointRequest(state, 'skip').status, 409);
  state.session.setValue('ai_phase_started_at', String(now - 30 * 60000 + 1));
  assert.equal(checkpointRequest(state, 'continue').status, 409);
  state.session.setValue('ai_phase_started_at', String(now - 30 * 60000));
  assert.equal(checkpointRequest(state, 'continue').status, 200);
  assert.equal(state.session.getValue('status'), 'completed');
  const unwrap = qualityState({ai_phase_index: '0', ai_plan_status: 'paused', ai_manual_action_required: 'true'});
  assert.equal(checkpointRequest(unwrap, 'skip').status, 409);
  assert.equal(checkpointRequest(unwrap, 'repeat').status, 409);
  assert.equal(checkpointRequest(unwrap, 'continue').status, 200);
  assert.equal(unwrap.session.getValue('ai_phase_index'), 1);
});

test('malformed or faulted checkpoint requests cannot complete the plan', () => {
  for (const overrides of [
    {ai_plan_json: '{'}, {ai_plan_json: 'null'}, {ai_phase_index: '99'}, {status: 'fault'},
  ]) {
    const state = qualityState({ai_phase_index: '2', ai_plan_status: 'paused', ai_manual_action_required: 'true', ...overrides});
    const before = {...state.session.values};
    assert.ok([409, 422].includes(checkpointRequest(state, 'continue').status));
    assert.deepEqual(state.session.values, before);
  }
});

test('quality policy never disables the safety cutoff or allows unsafe retries', () => {
  const state = qualityState();
  state.context.evaluateAiPlanController(state.device, {chamberTemperature: 200, meatTemperature: 98});
  assert.equal(state.session.getValue('status'), 'fault');
  assert.equal(state.decisions.at(-1).action, 'safety_off');
  for (const overrides of [{connection_status: 'offline'}, {last_chamber_temperature_c: '200'}]) {
    const retry = resumeRequest({
      status: 'cooking', ai_phase_index: '2', ai_manual_action_required: 'true', ai_plan_json: JSON.stringify(qualityPlan()),
    }, overrides);
    const before = {...retry.session.values};
    assert.equal(checkpointRequest(retry, 'repeat').status, 409);
    assert.deepEqual(retry.session.values, before);
  }
});

test('generated recipes carry quality guidance to the provider and incomplete output is not saved', () => {
  const source = readFileSync(new URL('../src/server/smoker/external-llm-api.js', import.meta.url), 'utf8');
  const start = source.indexOf('(function process(');
  for (const outcome of ['complete', 'missing-policy', 'missing-style']) {
    const {context, session} = setup({status: 'planned'});
    vm.runInContext(source.slice(0, start), context);
    context.getConfiguration = () => ({
      flowActionName: 'test', model: 'test', requestTimeoutSeconds: 60,
      maximumChamber: 200, minimumMeat: 74,
    });
    let inputs;
    let status;
    let body;
    let updates = 0;
    session.update = () => {updates++;};
    const plan = qualityPlan();
    if (outcome === 'missing-policy') delete plan.quality;
    if (outcome === 'missing-style') delete plan.cooking_style;
    const runner = {
      action() {return this;}, inForeground() {return this;}, timeout() {return this;},
      withInputs(value) {inputs = value; return this;},
      run() {return {getOutputs: () => ({response: {choices: [{message: {content: JSON.stringify(plan)}}]}})};},
    };
    context.sn_fd = {FlowAPI: {getRunner: () => runner}};
    context.request = {body: {dataString: JSON.stringify({sessionId: 'session', dish: 'Pulled pork', desired_result: 'Pull-apart tender'})}};
    context.response = {setStatus(value) {status = value;}, setBody(value) {body = value;}};
    vm.runInContext(source.slice(start), context);
    const cookingRequest = JSON.parse(JSON.parse(inputs.cooking_request));
    assert.match(cookingRequest.plan_contract.pull_apart_quality, /recheck_minutes/);
    assert.match(cookingRequest.plan_contract.pull_apart_checkpoints, /temperature_and_time/);
    assert.equal(status, outcome === 'complete' ? 200 : 422, JSON.stringify(body));
    assert.equal(updates, outcome === 'complete' ? 1 : 0);
    if (outcome === 'complete') {
      assert.equal(session.getValue('ai_plan_status'), 'draft');
      assert.equal(JSON.parse(session.getValue('ai_plan_json')).quality.adaptive_ceiling_c, 130);
    }
  }
  const flowMetadata = readFileSync(new URL('../src/fluent/generated/other/sys-variable-value/sys_hub_step_instance_65bcc9313b97871064e7ecac73e45a2c.now.ts', import.meta.url), 'utf8');
  assert.match(flowMetadata, /temperature_and_time/);
  assert.match(flowMetadata, /checkpoint tenderness/);
});

test('quality recipe start and resume validate policy and preserve repeat cooking mode', () => {
  const plan = qualityPlan();
  const resumed = resumeRequest({
    ai_phase_index: '1', ai_plan_json: JSON.stringify(plan), ai_quality_retry: 'true',
    adaptive_current_chamber_target_c: '170',
  });
  assert.equal(resumed.status, 200);
  assert.equal(resumed.session.getValue('ai_quality_retry'), 'true');
  assert.equal(resumed.session.getValue('adaptive_current_chamber_target_c'), 120);
  const state = qualityState({status: 'planned', ai_plan_status: 'approved'});
  let status;
  state.context.request = {body: {dataString: JSON.stringify({sessionId: 'session', action: 'start'})}};
  state.context.response = {setStatus(value) {status = value;}, setBody() {}};
  vm.runInContext(startSource, state.context);
  assert.equal(status, 200);
  assert.equal(state.session.getValue('ai_phase_index'), 0);
  const invalid = qualityPlan();
  delete invalid.quality;
  assert.equal(resumeRequest({ai_phase_index: '1', ai_plan_json: JSON.stringify(invalid)}).status, 409);
  assert.equal(resumeRequest({
    ai_phase_index: '1', ai_plan_json: JSON.stringify(plan),
    adaptive_temperature_enabled: 'false', maximum_chamber_temperature_c: '133',
  }).status, 409, 'recipe ceiling plus tolerance must be strictly below the cutoff even without adaptive control');
});

test('UI presents tenderness actions, mandatory rest timing and effective recipe targets', () => {
  const source = readFileSync(new URL('../pages/smokercontrolroom/page.js', import.meta.url), 'utf8');
  const renderMethod = source.slice(source.indexOf('  _renderAiPlan(session) {'), source.indexOf('  _renderSession(session) {'));
  const targetsMethod = source.slice(source.indexOf('  _aiPlanTargets(session) {'), source.indexOf('  _chamberTargetLabel(session) {')).replace('\n  _effectiveChamberTarget', ',\n  _effectiveChamberTarget');
  const context = vm.createContext({
    getValue: (session, field) => session[field] ?? '',
    isEnabled: value => value === 'true',
    toNumber: value => value === undefined || value === null || value === '' ? null : Number(value),
    i18n: {getMessage: text => text},
    formatTemperature: value => String(value), formatDate: value => String(value),
    html: (strings, ...values) => strings.reduce((text, part, index) => text + part + (values[index] ?? ''), ''),
    nothing: '',
  });
  const methods = vm.runInContext(`({${renderMethod},${targetsMethod}})`, context);
  const page = {
    ...methods, aiDraft: {}, _aiPlan: () => qualityPlan(),
    _aiPlanStatus: session => session.ai_plan_status,
  };
  const session = {status: 'cooking', ai_plan_status: 'paused', ai_manual_action_required: 'true', ai_phase_index: '2'};
  const tenderness = page._renderAiPlan(session);
  assert.match(tenderness, /Continue cooking<\/button>/);
  assert.match(tenderness, /begin resting<\/button>/);
  assert.doesNotMatch(tenderness, />Skip<\/button>/);
  const rest = page._renderAiPlan({...session, ai_phase_index: '3'});
  assert.match(rest, /server enforces/);
  assert.doesNotMatch(rest, /Continue cooking<\/button>/);
  assert.doesNotMatch(rest, />Skip<\/button>/);
  const active = {status: 'cooking', ai_plan_status: 'active', ai_phase_index: '1', adaptive_temperature_enabled: 'true', adaptive_current_chamber_target_c: '170'};
  assert.equal(page._effectiveChamberTarget(active), 130);
  assert.equal(page._aiPlanTargets({...active, ai_quality_retry: 'true'}).chamber, 120);
});

test('unconnected Now Assist cannot silently substitute a fixed chicken recipe', async () => {
  const source = readFileSync(new URL('../pages/smokercontrolroom/page.js', import.meta.url), 'utf8');
  const method = source.slice(source.indexOf('  async _createAiDraft() {'), source.indexOf('  async _approveAiPlan('));
  const context = vm.createContext({i18n: {getMessage: text => text}});
  const page = {
    ...vm.runInContext(`({${method}})`, context),
    _device: () => ({}), _deviceSession: () => ({}), aiDraft: {provider: 'now_assist'},
    requestUpdate() {},
  };
  await page._createAiDraft();
  assert.match(page.actionMessage, /not connected/);
  assert.equal(page.refreshing, false);
});

test('manual Finish can stop heating but cannot certify an unfinished quality recipe as completed', () => {
  for (const quality of [true, false]) {
    const state = quality ? qualityState({smoker_device: 'device'}) : setup({smoker_device: 'device'});
    let commands = 0;
    let responseBody;
    state.context.SmokerRelayControl = function() {
      this.setRelay = (_device, relayOn) => {
        assert.equal(relayOn, false);
        commands++;
        return {success: true};
      };
    };
    state.context.request = {body: {dataString: JSON.stringify({sessionId: 'session', action: 'finish'})}};
    state.context.response = {setStatus() {}, setBody(value) {responseBody = value;}};
    vm.runInContext(startSource, state.context);
    assert.equal(commands, 1);
    assert.equal(responseBody.status, quality ? 'stopped' : 'completed');
    assert.equal(state.session.getValue('status'), quality ? 'stopped' : 'completed');
  }
});
