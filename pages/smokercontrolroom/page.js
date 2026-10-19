import {html, css, nothing, isServer} from 'lit';
import {customElement} from 'lit/decorators.js';
import {AIUXElement, aiuxFetch} from '@servicenow/aiux/aiux-components-core';
import {i18n} from '@servicenow/aiux/aiux-services';
import {navigate} from '@servicenow/aiux-client';
import '@servicenow/aiux/aiux-components-list';
import '@servicenow/aiux/aiux-components-visualizations-arc';
import '@servicenow/aiux/aiux-components-tabs';
import '@servicenow/aiux/aiux-components-dialog';
import '@servicenow/aiux/aiux-components-loader';
import '@servicenow/aiux-components-alert';
import {ListDataManager} from '@servicenow/aiux/aiux-components-list';

const smokerImage = 'data:image/png;base64,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';

const DEVICE_TABLE = 'x_tsigh_smkrctrl_smoker_device';
const READING_TABLE = 'x_tsigh_smkrctrl_temperature_reading';
const SESSION_TABLE = 'x_tsigh_smkrctrl_cooking_session';
const ACTION_TABLE = 'x_tsigh_smkrctrl_control_action';
const ALERT_TABLE = 'x_tsigh_smkrctrl_device_alert';
const REFRESH_MS = 20000;

function getRecords(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.records)) return data.records;
  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.result?.records)) return data.result.records;
  const layout = data?.data?.GlideNowListLayoutComposite_Query?.getNowListLayoutComposite?.nowListLayout;
  const rows = layout?.rowDefinitions?.rows;
  if (Array.isArray(rows)) {
    return rows.filter(row => row.type === 'default').map(row => {
      const record = {sys_id: row.key};
      for (const cell of row.cells || []) {
        const value = cell.value;
        const metadataValue = cell.metadata?.internalValue;
        record[cell.name] = value && typeof value === 'object'
          ? value.value ?? value.booleanValue ?? value.stringValue ?? value.numberValue ?? value.displayValue ?? value.display_value ?? metadataValue ?? cell.label ?? null
          : value ?? metadataValue ?? cell.label ?? null;
      }
      return record;
    });
  }
  return [];
}

function getValue(record, field) {
  const value = record?.[field];
  if (value && typeof value === 'object') {
    return value.value ?? value.booleanValue ?? value.stringValue ?? value.numberValue ?? value.internalValue ?? value.display_value ?? value.displayValue ?? value.label ?? null;
  }
  return value ?? null;
}

function toNumber(value) {
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function isEnabled(value) {
  if (value && typeof value === 'object') {
    return isEnabled(value.value ?? value.booleanValue ?? value.stringValue ?? value.internalValue ?? value.displayValue ?? value.display_value);
  }
  return value === true || value === 'true' || value === '1' || value === 1;
}

function isMeatMonitoringEnabled(session) {
  const value = session?.monitor_meat_temperature;
  if (value !== null && value !== undefined && !(typeof value === 'string' && value.trim() === '')) {
    return isEnabled(value) || String(value).toLowerCase() === 'yes' || String(value).toLowerCase() === 'on';
  }
  return isEnabled(value)
    || String(value).toLowerCase() === 'yes'
    || String(value).toLowerCase() === 'on'
    || toNumber(getValue(session, 'target_meat_temperature_c')) !== null;
}

function formatSessionStatus(value) {
  const labels = {
    planned: 'Planned',
    preheating: 'Preheating',
    cooking: 'Cooking',
    holding: 'Holding',
    completed: 'Completed',
    stopped: 'Stopped',
    fault: 'Fault'
  };
  return labels[String(value).toLowerCase()] || value || i18n.getMessage('Unknown');
}

function formatControllerAction(value) {
  const labels = {relay_on: 'Relay On', relay_off: 'Relay Off', no_action: 'No Action'};
  return labels[String(value).toLowerCase()] || value || i18n.getMessage('No decision');
}

function referenceId(record, field) {
  const value = record?.[field];
  if (value && typeof value === 'object') return value.value ?? value.sys_id ?? value.sysId ?? null;
  return value ?? null;
}

function gaugeData(label, value) {
  return {
    metadata: {columns: {value: {type: 'numerical', meaning: 'metric', label, order: 0, groupedBy: []}}},
    data: value === null ? [] : [[value]],
    rendering: {columns: {value: {role: 'value'}}}
  };
}

function temperatureRules(max) {
  const scale = max / 250;
  return [
    {operator: 'less_equal', operand: String(40 * scale), applies: {color: '#38bdf8'}},
    {operator: 'less_equal', operand: String(80 * scale), applies: {color: '#22c55e'}},
    {operator: 'less_equal', operand: String(130 * scale), applies: {color: '#f59e0b'}},
    {operator: 'less_equal', operand: String(max), applies: {color: '#ef4444'}}
  ];
}

function chamberTemperatureRules() {
  return [
    {operator: 'less_equal', operand: '120', applies: {color: '#38bdf8'}},
    {operator: 'less_equal', operand: '200', applies: {color: '#ef4444'}},
    {operator: 'less_equal', operand: '250', applies: {color: '#94a3b8'}},
  ];
}

function meatTemperatureRules(target) {
  const safeTarget = Number.isFinite(target) && target > 0 ? target : 74;
  return [
    {operator: 'less_equal', operand: '40', applies: {color: '#38bdf8'}},
    {operator: 'less_equal', operand: String(Math.max(40, safeTarget - 10)), applies: {color: '#f59e0b'}},
    {operator: 'less_equal', operand: String(safeTarget), applies: {color: '#eab308'}},
    {operator: 'less_equal', operand: String(Math.min(100, safeTarget + 5)), applies: {color: '#22c55e'}},
    {operator: 'less_equal', operand: '100', applies: {color: '#ef4444'}},
  ];
}

function gaugeLegend(label, target) {
  if (label === i18n.getMessage('Chamber temperature')) {
    return [
      {color: '#38bdf8', text: i18n.getMessage('Smoke 0-120 C')},
      {color: '#ef4444', text: i18n.getMessage('BBQ 120-200 C')},
      {color: '#94a3b8', text: i18n.getMessage('High 200-250 C')},
    ];
  }
  const safeTarget = Number.isFinite(target) && target > 0 ? target : 74;
  return [
    {color: '#38bdf8', text: i18n.getMessage('Cold below 40 C')},
    {color: '#f59e0b', text: i18n.getMessage('Heating to {0} C', String(Math.max(40, safeTarget - 10)))},
    {color: '#eab308', text: i18n.getMessage('Approaching {0} C', String(safeTarget))},
    {color: '#22c55e', text: i18n.getMessage('Ready to {0} C', String(Math.min(100, safeTarget + 5)))},
    {color: '#ef4444', text: i18n.getMessage('Over {0} C', String(Math.min(100, safeTarget + 5)))},
  ];
}

function formatTemperature(value) {
  return value === null ? i18n.getMessage('No reading') : `${new Intl.NumberFormat(undefined, {maximumFractionDigits: 1}).format(value)} °C`;
}

function formatDate(value) {
  if (!value) return i18n.getMessage('Never');
  const numericValue = Number(value);
  const date = Number.isFinite(numericValue) && numericValue > 100000000000
    ? new Date(numericValue)
    : Number.isFinite(numericValue) && numericValue > 1000000000
      ? new Date(numericValue * 1000)
    : new Date(String(value).replace(' ', 'T') + (String(value).endsWith('Z') ? '' : 'Z'));
  if (Number.isNaN(date.valueOf())) return value;
  const pad = number => String(number).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

@customElement('x-tsigh-smkrctrl-home-page')
export default class HomePage extends AIUXElement {
  static styles = css`
    :host { display: block; }
    .temperature-card aiux-visualizations-arc { width: min(100%, 360px); height: 240px; }
    @media (forced-colors: active) {
      .action-button { forced-color-adjust: none; border: 2px solid ButtonBorder; }
      .action-button:hover, .action-button:focus-visible { background: Highlight; color: HighlightText; border-color: Highlight; }
      .panel { background: Canvas; color: CanvasText; border-color: CanvasText; }
    }
  `;

  static async loader(ctx) {
    const devices = await ListDataManager.fetch({
      table: DEVICE_TABLE,
      query: 'ORDERBYname',
      view: '',
      columns: ['sys_id', 'name', 'active', 'polling_enabled', 'connection_status', 'last_relay_state', 'last_successful_contact', 'last_error_message', 'last_chamber_temperature_c', 'last_meat_temperature_c', 'device_uptime_seconds', 'consecutive_failures']
    });
    const deviceRecords = getRecords(devices);
    const deviceId = ctx?.query?.deviceId || getValue(deviceRecords[0], 'sys_id');
    const deviceQuery = deviceId ? `smoker_device=${deviceId}` : 'sys_idISEMPTY';
    const results = await Promise.allSettled([
      Promise.resolve(devices),
      ListDataManager.fetch({table: READING_TABLE, query: `${deviceQuery}^ORDERBYDESCrecorded_at`, view: ''}),
      ListDataManager.fetch({
        table: SESSION_TABLE,
        query: `${deviceQuery}^ORDERBYDESCsys_created_on`,
        view: '',
        columns: ['sys_id', 'name', 'smoker_device', 'status', 'current_phase', 'meat_type', 'meat_cut', 'meat_weight_kg', 'monitor_meat_temperature', 'target_chamber_temperature_c', 'target_meat_temperature_c', 'chamber_temperature_tolerance_c', 'maximum_chamber_temperature_c', 'adaptive_temperature_enabled', 'adaptive_maximum_chamber_temperature_c', 'adaptive_current_chamber_target_c', 'ai_control_enabled', 'automatic_control_enabled', 'control_mode', 'ai_provider', 'ai_plan_status', 'ai_plan_json', 'ai_phase_index', 'ai_phase_started_at', 'ai_quality_retry', 'ai_current_phase', 'ai_manual_action_required', 'ai_manual_action_message', 'started_at', 'completed_at']
      }),
      ListDataManager.fetch({
        table: ACTION_TABLE,
        query: `${deviceQuery}^ORDERBYDESCrequested_at`,
        view: '',
        columns: ['sys_id', 'smoker_device', 'cooking_session', 'action', 'source', 'result', 'reason', 'requested_at', 'response_http_status', 'response_message']
      }),
      ListDataManager.fetch({
        table: ALERT_TABLE,
        query: `${deviceQuery}^ORDERBYDESCopened_at`,
        view: '',
        columns: ['sys_id', 'smoker_device', 'cooking_session', 'alert_type', 'severity', 'state', 'message', 'opened_at', 'resolved_at']
      })
    ]);
    return {
      devices: results[0].status === 'fulfilled' ? results[0].value : null,
      readings: results[1].status === 'fulfilled' ? results[1].value : null,
      sessions: results[2].status === 'fulfilled' ? results[2].value : null,
      actions: results[3].status === 'fulfilled' ? results[3].value : null,
      alerts: results[4].status === 'fulfilled' ? results[4].value : null,
      deviceId,
      sessionId: ctx?.query?.sessionId || getValue(getRecords(results[2].status === 'fulfilled' ? results[2].value : null)[0], 'sys_id'),
      hasError: results.some(result => result.status === 'rejected')
    };
  }

  constructor() {
    super();
    this.selectedDeviceId = '';
    this.selectedSessionId = '';
    this.dashboardData = null;
    this.confirmAction = null;
    this.refreshing = false;
    this.aiPlanGenerating = false;
    this.actionMessage = '';
    this._refreshTimer = null;
    this._refreshOnResume = this._handleRefreshOnResume.bind(this);
    this.currentTime = 0;
    this.aiDraft = {dish: '', meatType: '', meatCut: '', weightKg: '', desiredResult: '', provider: 'external_llm'};
    this.manualPlanJson = '';
    this.generatedAiPlan = null;
    this.aiPlanOpen = false;
    this.aiClearConfirm = false;
    this.clearHistoryConfirm = false;
    this.clearHistoryProgress = false;
  }

  connectedCallback() {
    super.connectedCallback();
    if (!isServer) {
      this.currentTime = Date.now();
      this._refreshTimer = window.setInterval(() => this._refresh(), REFRESH_MS);
      window.addEventListener('focus', this._refreshOnResume);
      document.addEventListener('visibilitychange', this._refreshOnResume);
      this._refresh();
    }
  }

  disconnectedCallback() {
    if (this._refreshTimer) window.clearInterval(this._refreshTimer);
    if (!isServer) {
      window.removeEventListener('focus', this._refreshOnResume);
      document.removeEventListener('visibilitychange', this._refreshOnResume);
    }
    super.disconnectedCallback();
  }

  _handleRefreshOnResume() {
    if (!document.hidden) this._refresh();
  }

  async _refresh() {
    if (this.refreshing) return;
    this.refreshing = true;
    this.currentTime = Date.now();
    this.requestUpdate();
    try {
      const data = await this.constructor.loader({query: {deviceId: this.selectedDeviceId, sessionId: this.selectedSessionId}});
      this.dashboardData = data;
    } finally {
      this.refreshing = false;
      this.requestUpdate();
    }
  }

  async _setPolling(enabled) {
    const device = this._device();
    if (!device) return;
    this.actionMessage = enabled ? i18n.getMessage('Starting temperature polling...') : i18n.getMessage('Stopping temperature polling...');
    this.requestUpdate();
    try {
      const response = await aiuxFetch('/api/x_tsigh_smkrctrl/smoker_relay/polling', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({deviceId: this._deviceId(device), enabled})
      });
      if (!response.ok) throw new Error(enabled ? i18n.getMessage('Polling could not be started.') : i18n.getMessage('Polling could not be stopped.'));
      this.actionMessage = enabled ? i18n.getMessage('Temperature polling started.') : i18n.getMessage('Temperature polling stopped.');
      await this._refresh();
    } catch (error) {
      this.actionMessage = error.message || i18n.getMessage('Polling change failed.');
      this.requestUpdate();
    }
  }

  _currentData() { return this.dashboardData || this.loaderData; }
  _devices() { return getRecords(this._currentData()?.devices); }
  _sessions() { return getRecords(this._currentData()?.sessions); }
  _device() {
    const devices = this._devices();
    if (!this.selectedDeviceId) this.selectedDeviceId = this._currentData()?.deviceId || getValue(devices[0], 'sys_id');
    return devices.find(device => getValue(device, 'sys_id') === this.selectedDeviceId) || devices[0] || null;
  }
  _deviceId(device) { return getValue(device, 'sys_id') || getValue(device, 'sysId'); }
  _deviceReadings(device) {
    const id = this._deviceId(device);
    return getRecords(this._currentData()?.readings).filter(reading => referenceId(reading, 'smoker_device') === id);
  }
  _deviceSession(_device) {
    const sessions = this._sessions();
    if (!this.selectedSessionId) this.selectedSessionId = this._currentData()?.sessionId || getValue(sessions[0], 'sys_id');
    return sessions.find(session => getValue(session, 'sys_id') === this.selectedSessionId) || sessions[0] || null;
  }
  _isStale(device) {
    const last = getValue(device, 'last_successful_contact');
    if (!last) return true;
    const numericValue = Number(last);
    const timestamp = Number.isFinite(numericValue) && numericValue > 100000000000
      ? numericValue
      : Number.isFinite(numericValue) && numericValue > 1000000000
        ? numericValue * 1000
        : new Date(String(last).replace(' ', 'T') + (String(last).endsWith('Z') ? '' : 'Z')).valueOf();
    return !Number.isFinite(timestamp) || Date.now() - timestamp > 60000;
  }

  _requestAction(action) { this.confirmAction = action; this.requestUpdate(); }
  _closeAction() { this.confirmAction = null; }

  _canResumeAi(session) {
    return isEnabled(getValue(session, 'ai_control_enabled')) &&
      this._aiPlanStatus(session) === 'paused' &&
      !isEnabled(getValue(session, 'ai_manual_action_required')) &&
      ['fault', 'cooking', 'preheating', 'holding'].includes(String(getValue(session, 'status')).toLowerCase());
  }

  async _setSessionStatus(action) {
    const session = this._deviceSession(this._device());
    if (!session || this.refreshing) return;
    this.refreshing = true;
    this.actionMessage = action === 'resume' ? i18n.getMessage('Resuming AI cooking...') : action === 'start' ? i18n.getMessage('Starting cooking session...') : i18n.getMessage('Finishing cooking session...');
    this.requestUpdate();
    try {
      const response = await aiuxFetch('/api/x_tsigh_smkrctrl/smoker_relay/session-status', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({sessionId: getValue(session, 'sys_id'), action})
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.result?.message || errorBody.message || (action === 'resume' ? i18n.getMessage('Could not resume AI cooking.') : action === 'start' ? i18n.getMessage('Could not start the cooking session.') : i18n.getMessage('Could not finish the cooking session.')));
      }
      const result = action === 'finish' ? await response.json() : null;
      const stoppedEarly = (result?.result?.status || result?.status) === 'stopped';
      this.actionMessage = action === 'resume' ? i18n.getMessage('AI cooking resumed from the saved phase. The controller will evaluate the latest temperatures on its next poll.') : action === 'start' ? i18n.getMessage('Cooking session started.') : stoppedEarly ? i18n.getMessage('Heating stopped. The recipe was stopped early, not completed.') : i18n.getMessage('Cooking session finished.');
      this.refreshing = false;
      await this._refresh();
    } catch (error) {
      const errorBody = error.response?.data;
      this.actionMessage = errorBody?.result?.message || errorBody?.message || error.message || i18n.getMessage('Cooking session update failed.');
    } finally {
      this.refreshing = false;
      this.requestUpdate();
    }
  }

  async _setAiCheckpoint(decision) {
    const session = this._deviceSession(this._device());
    if (!session) return;
    this.refreshing = true;
    this.actionMessage = i18n.getMessage('Updating cooking checkpoint...');
    this.requestUpdate();
    try {
      const response = await aiuxFetch('/api/x_tsigh_smkrctrl/smoker_relay/session-status', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({sessionId: getValue(session, 'sys_id'), action: 'checkpoint', decision}),
      });
      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(errorBody.result?.message || errorBody.message || i18n.getMessage('The cooking checkpoint could not be updated.'));
      }
      this.actionMessage = decision === 'repeat' ? i18n.getMessage('Additional cooking started. The controller will request another tenderness check after the recipe interval.') : decision === 'stop' ? i18n.getMessage('Cooking stopped.') : i18n.getMessage('Cooking checkpoint confirmed.');
      this.refreshing = false;
      await this._refresh();
    } catch (error) {
      this.refreshing = false;
      const errorBody = error.response?.data;
      this.actionMessage = errorBody?.result?.message || errorBody?.message || error.message || i18n.getMessage('The cooking checkpoint could not be updated.');
      this.requestUpdate();
    }
  }

  _phaseInstructionFallback(phase) {
    if (phase.mode === 'manual') return phase.message || i18n.getMessage('Complete the manual actions listed below, then confirm this step.');
    const chamberValue = toNumber(phase.chamber_target_c);
    const chamberTarget = chamberValue === null ? i18n.getMessage('the current chamber setting') : formatTemperature(chamberValue);
    if (phase.completion_rule === 'duration') {
      return i18n.getMessage('Keep the smoker at {0} for {1} minutes. The controller advances when the timer ends.', chamberTarget, String(phase.max_duration_minutes || 0));
    }
    const meatValue = toNumber(phase.meat_target_c);
    if (meatValue !== null) {
      return i18n.getMessage('Keep the smoker at {0}. Monitor the meat probe; this step completes when it reads {1} or higher.', chamberTarget, formatTemperature(meatValue));
    }
    if (phase.name === 'preheating') return i18n.getMessage('Wait for the chamber to reach {0} before placing the food inside.', chamberTarget);
    return i18n.getMessage('Keep the chamber at {0} until this step is complete.', chamberTarget);
  }

  _aiPlan(session) {
    const rawPlan = getValue(session, 'ai_plan_json');
    let plan = null;
    if (rawPlan) {
      try {
        plan = JSON.parse(rawPlan);
      } catch (error) {
        return null;
      }
    } else {
      plan = this.generatedAiPlan?.sessionId === getValue(session, 'sys_id') ? this.generatedAiPlan.plan : null;
    }
    if (!plan || !Array.isArray(plan.phases)) return plan;
    const displayPlan = JSON.parse(JSON.stringify(plan));
    for (const phase of displayPlan.phases) {
      if (!phase) continue;
      const instructions = typeof phase.instructions === 'string' && phase.instructions.trim()
        ? phase.instructions.trim()
        : phase.message || this._phaseInstructionFallback(phase);
      phase.message = i18n.getMessage('Instructions: {0}', instructions);
    }
    return displayPlan;
  }

  _aiPlanStatus(session) {
    const status = getValue(session, 'ai_plan_status') || 'none';
    if (status !== 'none') return status;
    return this.generatedAiPlan?.sessionId === getValue(session, 'sys_id') ? 'draft' : status;
  }

  _aiPlanTargets(session) {
    const plan = this._aiPlan(session);
    const planStatus = String(this._aiPlanStatus(session)).toLowerCase();
    if (!['approved', 'active', 'paused'].includes(planStatus) || !plan || !Array.isArray(plan.phases)) return {chamber: null, meat: null};
    const phaseIndex = Math.max(0, Number(getValue(session, 'ai_phase_index')) || 0);
    const currentPhase = plan.phases[phaseIndex] || plan.phases[0];
    const meatTargets = plan.phases.map(phase => toNumber(phase.meat_target_c)).filter(value => value !== null);
    return {
      chamber: isEnabled(getValue(session, 'ai_quality_retry')) && plan.quality ? plan.quality.recheck_chamber_c : toNumber(currentPhase?.chamber_target_c),
      meat: toNumber(currentPhase?.meat_target_c) ?? (meatTargets.length ? Math.max(...meatTargets) : null),
      ceiling: toNumber(plan.quality?.adaptive_ceiling_c),
    };
  }

  _effectiveChamberTarget(session) {
    if (['fault', 'stopped', 'completed'].includes(getValue(session, 'status')) || this._aiPlanStatus(session) === 'paused') return null;
    const adaptiveEnabled = isEnabled(getValue(session, 'adaptive_temperature_enabled'));
    const adaptiveTarget = toNumber(getValue(session, 'adaptive_current_chamber_target_c'));
    const planTargets = this._aiPlanTargets(session);
    const target = adaptiveEnabled && adaptiveTarget !== null ? adaptiveTarget : planTargets.chamber ?? toNumber(getValue(session, 'target_chamber_temperature_c'));
    return target === null ? null : Math.min(target, planTargets.ceiling ?? Infinity);
  }

  _chamberTargetLabel(session) {
    return isEnabled(getValue(session, 'adaptive_temperature_enabled')) && toNumber(getValue(session, 'adaptive_current_chamber_target_c')) !== null
      ? i18n.getMessage('Adaptive chamber target')
      : i18n.getMessage('Target');
  }

  _prepareAiDraft(session) {
    if (!session) return;
    this.aiDraft = {
      dish: '',
      meatType: '',
      meatCut: getValue(session, 'meat_cut') || '',
      weightKg: getValue(session, 'meat_weight_kg') || '',
      desiredResult: '',
      provider: getValue(session, 'ai_provider') || 'external_llm',
    };
    this.manualPlanJson = '';
  }

  _updateAiDraft(field, value) {
    this.aiDraft = {...this.aiDraft, [field]: value};
    this.requestUpdate();
  }

  async _createAiDraft() {
    const session = this._deviceSession(this._device());
    if (!session) return;
    this.refreshing = true;
    if (this.aiDraft.provider === 'manual') {
      let plan;
      try {
        plan = JSON.parse(this.manualPlanJson);
      } catch (error) {
        this.actionMessage = i18n.getMessage('Manual plan must be valid JSON.');
        this.refreshing = false;
        this.requestUpdate();
        return;
      }
      try {
        const response = await aiuxFetch('/api/x_tsigh_smkrctrl/smoker_relay/cooking-plan', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({sessionId: getValue(session, 'sys_id'), provider: 'manual', plan}),
        });
        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          throw new Error(errorBody.message || i18n.getMessage('The manual plan could not be saved.'));
        }
        if (this.generatedAiPlan?.sessionId === getValue(session, 'sys_id')) this.generatedAiPlan = null;
        this.actionMessage = i18n.getMessage('Manual plan draft saved. Review it before approval.');
        this.refreshing = false;
        await this._refresh();
      } catch (error) {
        this.actionMessage = error.message || i18n.getMessage('The manual plan could not be saved.');
        this.refreshing = false;
        this.requestUpdate();
      }
      return;
    }
    if (this.aiDraft.provider === 'external_llm') {
      this.aiPlanGenerating = true;
      this.actionMessage = i18n.getMessage('Requesting a cooking plan from the external LLM...');
      this.requestUpdate();
      try {
        const response = await aiuxFetch('/api/x_tsigh_smkrctrl/smoker_relay/cooking-plan/generate', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            sessionId: getValue(session, 'sys_id'),
            dish: this.aiDraft.dish.trim(),
            meat_type: this.aiDraft.meatType.trim(),
            meat_cut: this.aiDraft.meatCut.trim(),
            meat_weight_kg: Number(this.aiDraft.weightKg),
            desired_result: this.aiDraft.desiredResult.trim(),
          }),
        });
        if (!response.ok) {
          let message = i18n.getMessage('The external LLM could not generate a cooking plan.');
          try {
            const errorBody = await response.json();
            message = errorBody.message || message;
          } catch (error) {
            // Keep the generic message when the server does not return JSON.
          }
          throw new Error(message);
        }
        const result = await response.json().catch(() => null);
        if (!result?.plan || !Array.isArray(result.plan.phases)) {
          throw new Error(i18n.getMessage('The external LLM could not generate a cooking plan.'));
        }
        this.generatedAiPlan = {sessionId: getValue(session, 'sys_id'), plan: result.plan};
        this.aiPlanGenerating = false;
        this.refreshing = false;
        this.actionMessage = i18n.getMessage('External LLM draft saved. Review it before approval.');
        this.requestUpdate();
        await this._refresh();
      } catch (error) {
        this.aiPlanGenerating = false;
        this.actionMessage = error.message || i18n.getMessage('The external LLM could not generate a cooking plan.');
        this.refreshing = false;
        this.requestUpdate();
      }
      return;
    }
    this.actionMessage = i18n.getMessage('Now Assist plan generation is not connected. Select External LLM for a generated recipe, or supply a reviewed manual plan.');
    this.refreshing = false;
    this.requestUpdate();
  }

  async _approveAiPlan(action = 'approve') {
    const session = this._deviceSession(this._device());
    if (!session) return;
    this.refreshing = true;
    this.actionMessage = action === 'restart' ? i18n.getMessage('Reapproving cooking plan...') : i18n.getMessage('Approving cooking plan...');
    this.requestUpdate();
    try {
      const response = await aiuxFetch('/api/x_tsigh_smkrctrl/smoker_relay/cooking-plan', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action, sessionId: getValue(session, 'sys_id')}),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || i18n.getMessage('The cooking plan could not be approved.'));
      }
      this.actionMessage = action === 'restart' ? i18n.getMessage('Cooking plan reapproved and ready to start.') : i18n.getMessage('Cooking plan approved.');
      this.refreshing = false;
      await this._refresh();
    } catch (error) {
      this.refreshing = false;
      this.actionMessage = error.message || i18n.getMessage('The cooking plan could not be approved.');
      this.requestUpdate();
    }
  }

  async _clearAiPlan() {
    const session = this._deviceSession(this._device());
    if (!session) return;
    this.aiClearConfirm = false;
    this.refreshing = true;
    this.actionMessage = i18n.getMessage('Clearing cooking plan...');
    this.requestUpdate();
    try {
      const response = await aiuxFetch('/api/x_tsigh_smkrctrl/smoker_relay/cooking-plan', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action: 'clear', sessionId: getValue(session, 'sys_id')}),
      });
      if (!response.ok) throw new Error(i18n.getMessage('The cooking plan could not be cleared.'));
      this.actionMessage = i18n.getMessage('Cooking plan cleared.');
      if (this.generatedAiPlan?.sessionId === getValue(session, 'sys_id')) this.generatedAiPlan = null;
      this.aiPlanOpen = false;
      this.aiDraft = {dish: '', meatType: '', meatCut: '', weightKg: '', desiredResult: '', provider: 'external_llm'};
      this.manualPlanJson = '';
      this.refreshing = false;
      await this._refresh();
    } catch (error) {
      this.refreshing = false;
      this.actionMessage = error.message || i18n.getMessage('The cooking plan could not be cleared.');
      this.requestUpdate();
    }
  }

  async _clearHistory() {
    const device = this._device();
    if (!device) return;
    this.clearHistoryConfirm = false;
    this.clearHistoryProgress = true;
    this.refreshing = true;
    this.actionMessage = i18n.getMessage('Clearing smoker history...');
    this.requestUpdate();
    try {
      const response = await aiuxFetch('/api/x_tsigh_smkrctrl/smoker_relay/clear-history', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({deviceId: this._deviceId(device)}),
      });
      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || i18n.getMessage('Smoker history could not be cleared.'));
      }
      this.actionMessage = i18n.getMessage('Temperature readings, control actions, and alerts were cleared.');
      await this._refresh();
    } catch (error) {
      this.actionMessage = error.message || i18n.getMessage('Smoker history could not be cleared.');
      this.requestUpdate();
    } finally {
      this.clearHistoryProgress = false;
      this.refreshing = false;
      this.requestUpdate();
    }
  }

  _openAiPlan() {
    this._prepareAiDraft(this._deviceSession(this._device()));
    this.aiPlanOpen = true;
    this.requestUpdate();
  }

  _closeAiPlan() {
    this.aiPlanOpen = false;
    this.requestUpdate();
  }

  _aiPlanButtonLabel(session) {
    const status = this._aiPlanStatus(session);
    if (status === 'none' || status === 'rejected') return i18n.getMessage('Create AI plan');
    if (status === 'draft') return i18n.getMessage('Review AI plan');
    return i18n.getMessage('View AI plan');
  }

  async _confirmAction() {
    const device = this._device();
    const action = this.confirmAction;
    if (!device || !action) return;
    this.confirmAction = null;
    if (action === 'resume') {
      await this._setSessionStatus('resume');
      return;
    }
    this.actionMessage = i18n.getMessage('Sending relay command...');
    this.requestUpdate();
    try {
      const response = await aiuxFetch('/api/x_tsigh_smkrctrl/smoker_relay/relay', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({deviceId: this._deviceId(device), action})
      });
      if (!response.ok) throw new Error(i18n.getMessage('The relay command was rejected.'));
      this.actionMessage = action === 'on' ? i18n.getMessage('Smoker turned on.') : i18n.getMessage('Smoker turned off.');
      await this._refresh();
    } catch (error) {
      this.actionMessage = error.message || i18n.getMessage('The relay command failed.');
    }
    this.requestUpdate();
  }

  _renderGauge(label, value, max, _target, measuredAt) {
    const session = this._deviceSession(this._device());
    const planTargets = this._aiPlanTargets(session);
    const effectiveTarget = label === i18n.getMessage('Chamber temperature')
      ? this._effectiveChamberTarget(session)
      : planTargets.meat ?? _target;
    const rules = label === i18n.getMessage('Chamber temperature')
      ? chamberTemperatureRules()
      : meatTemperatureRules(effectiveTarget);
    const legend = gaugeLegend(label, effectiveTarget);
    const targetLabel = label === i18n.getMessage('Chamber temperature') ? this._chamberTargetLabel(session) : i18n.getMessage('Target');
    return html`
      <section class="temperature-card aiux-card border border-base-300 bg-base-100 shadow-sm">
        <div class="aiux-card-body items-center gap-1 p-4">
          <div class="flex w-full flex-wrap items-baseline justify-between gap-2">
            <h2 class="aiux-card-title text-base-content">${label}</h2>
            <span class="text-xs text-base-content">${measuredAt ? `${i18n.getMessage('Last updated')}: ${formatDate(measuredAt)}` : i18n.getMessage('No reading time')}</span>
          </div>
          <div class="relative -mt-6 flex w-full justify-center" aria-label=${value === null ? i18n.getMessage('No temperature reading') : `${formatTemperature(value)}`}>
            <aiux-visualizations-arc type="gauge" min="0" max=${max} .showNumbers=${true} .centerContent=${{mode: 'custom', size: 'small', label: '', value: formatTemperature(value)}} .data=${gaugeData('', value)} .renderingOverrides=${{columns: {value: {rules}}}}></aiux-visualizations-arc>
          </div>
          <p class="-mt-6 text-sm font-semibold text-base-content">${effectiveTarget === null ? i18n.getMessage('Target not set') : `${targetLabel}: ${formatTemperature(effectiveTarget)}`}</p>
          <div class="flex w-full flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-base-content" aria-label=${i18n.getMessage('{0} gauge legend', label)}>${legend.map(item => html`<span class="inline-flex items-center gap-1"><span class="h-2 w-2 shrink-0 rounded-full" style=${`background-color: ${item.color}`}></span>${item.text}</span>`)}</div>
        </div>
      </section>
    `;
  }

  _renderStatus(device, session) {
    const status = getValue(device, 'connection_status');
    const relay = getValue(device, 'last_relay_state');
    const stale = this._isStale(device);
    const unavailable = status !== 'online' || stale;
    const connectionClass = status === 'online' ? 'text-success' : 'text-base-content';
    const relayClass = String(relay).toLowerCase() === 'on'
      ? 'text-success'
      : String(relay).toLowerCase() === 'off'
        ? 'text-error'
        : 'text-base-content';
    const sessionStatus = String(getValue(session, 'status') || '').toLowerCase();
    const phaseLabel = sessionStatus === 'completed'
      ? i18n.getMessage('Finished')
      : sessionStatus === 'stopped'
        ? i18n.getMessage('Stopped')
        : sessionStatus === 'fault'
          ? i18n.getMessage('Fault')
          : getValue(session, 'current_phase') || sessionStatus || i18n.getMessage('No session selected');
    return html`
      ${unavailable ? html`<aiux-alert-message type="critical" alert-title=${stale ? i18n.getMessage('Smoker data is stale') : i18n.getMessage('Smoker connection problem')} message=${getValue(device, 'last_error_message') || i18n.getMessage('Automatic control is unavailable until fresh data returns.')} autofocus-controls="false"></aiux-alert-message>` : nothing}
      <section class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label=${i18n.getMessage('Smoker status')}>
        <div class="aiux-stat panel min-w-0 border border-base-300 bg-base-100"><div class="aiux-stat-title">${i18n.getMessage('Connection')}</div><div class="aiux-stat-value break-words text-xl capitalize sm:text-2xl ${connectionClass}">${status || i18n.getMessage('Unknown')}</div><div class="aiux-stat-desc break-words">${isEnabled(getValue(device, 'polling_enabled')) ? i18n.getMessage('Polling enabled') : i18n.getMessage('Polling stopped')} · ${stale ? i18n.getMessage('Stale') : i18n.getMessage('Fresh')}</div></div>
        <div class="aiux-stat panel min-w-0 border border-base-300 bg-base-100"><div class="aiux-stat-title">${i18n.getMessage('Heating')}</div><div class="aiux-stat-value break-words text-xl capitalize sm:text-2xl ${relayClass}">${relay || i18n.getMessage('Unknown')}</div><div class="aiux-stat-desc break-words">${i18n.getMessage('Last confirmed state')}</div></div>
        <div class="aiux-stat panel min-w-0 border border-base-300 bg-base-100"><div class="aiux-stat-title">${i18n.getMessage('Last contact')}</div><div class="aiux-stat-value break-all text-sm leading-tight sm:text-base lg:text-lg">${formatDate(getValue(device, 'last_successful_contact'))}</div><div class="aiux-stat-desc break-words">${i18n.getMessage('Successful poll')}</div></div>
        <div class="aiux-stat panel min-w-0 border border-base-300 bg-base-100"><div class="aiux-stat-title">${i18n.getMessage('Cooking phase')}</div><div class="aiux-stat-value break-words text-base leading-tight sm:text-lg capitalize">${phaseLabel}</div><div class="aiux-stat-desc break-words">${sessionStatus === 'completed' ? i18n.getMessage('Session finished') : getValue(session, 'meat_type') || i18n.getMessage('Session not started')}</div></div>
      </section>
    `;
  }

  _renderAiPlan(session) {
    const plan = this._aiPlan(session);
    const planStatus = this._aiPlanStatus(session);
    const draft = this.aiDraft;
    const canEdit = ['none', 'draft', 'rejected'].indexOf(planStatus) !== -1;
    const canApprove = planStatus === 'draft' && Boolean(plan);
    const canRestart = ['completed', 'stopped', 'rejected'].includes(planStatus) && Boolean(plan) && String(getValue(session, 'status')).toLowerCase() === 'planned';
    const canClear = ['planned', 'stopped', 'fault'].indexOf(String(getValue(session, 'status')).toLowerCase()) !== -1 && planStatus !== 'none';
    const manualAction = isEnabled(getValue(session, 'ai_manual_action_required'));
    const currentPhase = plan?.phases?.[Number(getValue(session, 'ai_phase_index'))];
    const tenderness = currentPhase?.checkpoint === 'tenderness';
    const canSkipCheckpoint = !tenderness && !currentPhase?.minimum_duration_minutes && (!plan?.quality || currentPhase?.optional === true);
    const phaseCompletion = phase => {
      if (phase.completion_rule === 'temperature_and_time') return i18n.getMessage('Next step: after at least {0} minutes and when the meat reaches {1}. A tenderness check is still required before resting.', String(phase.minimum_duration_minutes), formatTemperature(phase.meat_target_c));
      if (phase.mode === 'manual' && phase.minimum_duration_minutes) return i18n.getMessage('Confirm this step only after at least {0} minutes. The server enforces the waiting time.', String(phase.minimum_duration_minutes));
      if (phase.completion_rule === 'duration' && phase.max_duration_minutes !== undefined) return `${i18n.getMessage('Next step')}: ${phase.max_duration_minutes} ${i18n.getMessage('minutes later')}`;
      if (phase.completion_rule === 'temperature' && phase.meat_target_c !== undefined) return `${i18n.getMessage('Next step')}: ${i18n.getMessage('when the meat reaches')} ${formatTemperature(phase.meat_target_c)}`;
      if (phase.completion_rule === 'temperature' && phase.chamber_target_c !== undefined) return `${i18n.getMessage('Next step')}: ${i18n.getMessage('when the chamber reaches')} ${formatTemperature(phase.chamber_target_c)}`;
      return `${i18n.getMessage('Next step')}: ${i18n.getMessage('you confirm this step')}`;
    };
    const phaseTechnique = phase => {
      const details = [];
      if (phase.technique?.vessel) details.push(`Vessel: ${phase.technique.vessel.replaceAll('_', ' ')}`);
      if (phase.technique?.cover) details.push(`Cover: ${phase.technique.cover.replaceAll('_', ' ')}`);
      if (phase.technique?.liquid?.type) details.push(`Liquid: ${phase.technique.liquid.amount !== undefined ? `${phase.technique.liquid.amount} ${phase.technique.liquid.unit || ''} ` : ''}${phase.technique.liquid.type}${phase.technique.liquid.placement ? ` (${phase.technique.liquid.placement})` : ''}`);
      if (phase.technique?.sauce) details.push(`Sauce: ${phase.technique.sauce}`);
      for (const action of phase.manual_actions || []) {
        let detail = `${action.optional ? 'Optional: ' : ''}${String(action.action).replaceAll('_', ' ')}`;
        if (action.action === 'add_liquid') detail += `: ${action.amount} ${action.unit} ${action.liquid_type} (${action.placement})`;
        if (action.action === 'add_sauce') detail += `: ${action.sauce} (${action.placement})`;
        if (action.action === 'transfer_to_vessel') detail += `: ${String(action.vessel).replaceAll('_', ' ')}`;
        if (action.action === 'cover') detail += `: ${String(action.cover_type).replaceAll('_', ' ')}`;
        if (action.instruction) detail += ` - ${action.instruction}`;
        details.push(detail);
      }
      return details.join(' · ');
    };
    return html`
      <section class="aiux-card border border-base-300 bg-base-100 shadow-sm">
        <div class="aiux-card-body p-5">
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <h2 class="aiux-card-title">${i18n.getMessage('AI cooking plan')}</h2>
            <span class="aiux-badge aiux-badge-outline">${planStatus === 'none' ? i18n.getMessage('No plan') : planStatus}</span>
          </div>
          <p class="mt-2 text-sm text-base-content">${i18n.getMessage('Generate a recipe with External LLM or supply a manual plan. Review the cooking method, limits, timings, and checkpoints before approval. Existing plans are not upgraded automatically.')}</p>
          ${manualAction ? html`
            <aiux-alert-message class="mt-3" type="warning" alert-title=${tenderness ? i18n.getMessage('Check tenderness before resting') : i18n.getMessage('Manual action required')} message=${getValue(session, 'ai_manual_action_message') || i18n.getMessage('Complete the cooking action before continuing.')} autofocus-controls="false"></aiux-alert-message>
            ${currentPhase?.minimum_duration_minutes ? html`<p class="mt-3 break-words text-sm">${i18n.getMessage('This step started at {0}. Wait at least {1} minutes before confirming; the server enforces this time.', formatDate(getValue(session, 'ai_phase_started_at')), String(currentPhase.minimum_duration_minutes))}</p>` : nothing}
            ${tenderness ? html`<p class="mt-3 break-words text-sm">${i18n.getMessage('Verify the internal temperature independently and check that a probe enters with little resistance. If not tender, continue cooking for {0} minutes at {1}, then check again. To begin resting, confirm tenderness and remove the meat from the smoker first.', String(plan.quality.recheck_minutes), formatTemperature(plan.quality.recheck_chamber_c))}</p>` : nothing}
            <div class="mt-3 flex flex-wrap gap-2">
              ${tenderness ? html`<button class="aiux-btn aiux-btn-outline" type="button" ?disabled=${this.refreshing} @click=${() => this._setAiCheckpoint('repeat')}>${i18n.getMessage('Continue cooking')}</button>` : nothing}
              <button class="aiux-btn aiux-btn-primary" type="button" ?disabled=${this.refreshing} @click=${() => this._setAiCheckpoint('continue')}>${tenderness ? i18n.getMessage('Tender and removed — begin resting') : i18n.getMessage('Continue')}</button>
              ${canSkipCheckpoint ? html`<button class="aiux-btn aiux-btn-outline" type="button" ?disabled=${this.refreshing} @click=${() => this._setAiCheckpoint('skip')}>${i18n.getMessage('Skip')}</button>` : nothing}
              <button class="aiux-btn aiux-btn-error" type="button" ?disabled=${this.refreshing} @click=${() => this._setAiCheckpoint('stop')}>${i18n.getMessage('Stop cooking')}</button>
            </div>
          ` : nothing}
          ${canEdit ? html`
            <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label class="flex min-w-0 flex-col gap-1 text-sm font-semibold sm:col-span-2" for="ai-dish">${i18n.getMessage('Dish')}<input id="ai-dish" class="aiux-input w-full" type="text" placeholder=${i18n.getMessage('For example smoked chicken')} .value=${draft.dish} @input=${event => this._updateAiDraft('dish', event.target.value)} /></label>
              <label class="flex min-w-0 flex-col gap-1 text-sm font-semibold" for="ai-meat-type">${i18n.getMessage('Meat type')}<input id="ai-meat-type" class="aiux-input w-full" type="text" placeholder=${i18n.getMessage('For example chicken')} .value=${draft.meatType} @input=${event => this._updateAiDraft('meatType', event.target.value)} /></label>
              <label class="flex min-w-0 flex-col gap-1 text-sm font-semibold" for="ai-meat-cut">${i18n.getMessage('Meat cut')}<input id="ai-meat-cut" class="aiux-input w-full" type="text" placeholder=${i18n.getMessage('For example chicken thighs')} .value=${draft.meatCut} @input=${event => this._updateAiDraft('meatCut', event.target.value)} /></label>
              <label class="flex min-w-0 flex-col gap-1 text-sm font-semibold" for="ai-weight">${i18n.getMessage('Weight (kg)')}<input id="ai-weight" class="aiux-input w-full" type="number" inputmode="decimal" min="0.1" step="0.01" .value=${draft.weightKg} @input=${event => this._updateAiDraft('weightKg', event.target.value)} /></label>
              <label class="flex min-w-0 flex-col gap-1 text-sm font-semibold" for="ai-provider">${i18n.getMessage('Plan source')}<select id="ai-provider" class="aiux-select w-full" .value=${draft.provider} @change=${event => this._updateAiDraft('provider', event.target.value)}><option value="manual">${i18n.getMessage('Manual plan')}</option><option value="external_llm">${i18n.getMessage('External LLM')}</option><option value="now_assist">${i18n.getMessage('Now Assist')}</option></select></label>
              <label class="flex min-w-0 flex-col gap-1 text-sm font-semibold sm:col-span-2" for="ai-result">${i18n.getMessage('Desired result')}<textarea id="ai-result" class="aiux-textarea min-h-20 w-full" .value=${draft.desiredResult} @input=${event => this._updateAiDraft('desiredResult', event.target.value)}></textarea></label>
              ${draft.provider === 'manual' ? html`<label class="flex min-w-0 flex-col gap-1 text-sm font-semibold sm:col-span-2" for="manual-plan-json">${i18n.getMessage('Manual plan JSON')}<textarea id="manual-plan-json" class="aiux-textarea min-h-48 w-full font-mono text-xs" placeholder=${i18n.getMessage('Paste a schema version 2 cooking plan JSON object')} .value=${this.manualPlanJson} @input=${event => { this.manualPlanJson = event.target.value; }}></textarea></label>` : nothing}
            </div>
            <div class="mt-4 flex flex-wrap gap-3">
              <button class="aiux-btn aiux-btn-primary min-w-40" type="button" ?disabled=${this.refreshing || this.aiPlanGenerating} aria-busy=${this.aiPlanGenerating ? 'true' : 'false'} @click=${() => this._createAiDraft()}>${this.aiPlanGenerating ? i18n.getMessage('Generating plan...') : i18n.getMessage('Create draft plan')}</button>
              ${this.aiPlanGenerating ? html`<span class="inline-flex min-h-10 items-center gap-2" role="status" aria-live="polite"><aiux-loader size="xs"></aiux-loader>${i18n.getMessage('Waiting for the external plan')}</span>` : nothing}
            </div>
          ` : nothing}
          ${plan ? html`
            <div class="mt-5 border-t border-base-300 pt-4">
              <h3 class="text-base font-semibold">${plan.dish || i18n.getMessage('Cooking plan')}</h3>
              ${plan.quality ? html`<p class="mt-2 break-words text-sm">${i18n.getMessage('Recipe chamber ceiling: {0}. Natural stalls do not increase the target. Temperature and time do not guarantee tenderness; your confirmation is required before resting.', formatTemperature(plan.quality.adaptive_ceiling_c))}</p>` : nothing}
              ${Array.isArray(plan.recommendations) && plan.recommendations.length ? html`<section class="mt-3" aria-label=${i18n.getMessage('Plan notes')}><h4 class="text-sm font-semibold">${i18n.getMessage('Plan notes')}</h4><ul class="mt-1 list-inside list-disc text-sm text-base-content">${plan.recommendations.map(note => html`<li>${note}</li>`)}</ul></section>` : nothing}
              <ol class="mt-3 flex flex-col gap-3" aria-label=${i18n.getMessage('Cooking plan phases')}>
                ${(plan.phases || []).map((phase, index) => html`<li class="border-l-4 border-base-300 pl-3"><p class="font-semibold capitalize">${index + 1}. ${phase.name.replaceAll('_', ' ')}${phase.optional ? ` (${i18n.getMessage('optional')})` : nothing}</p><p class="text-sm text-base-content">${phase.mode === 'manual' ? html`<span class="aiux-badge aiux-badge-warning">${i18n.getMessage('Manual')}</span>` : html`<span class="aiux-badge aiux-badge-info">${i18n.getMessage('Smoker')}</span>`}${phase.chamber_target_c !== undefined ? ` · ${i18n.getMessage('Chamber')}: ${formatTemperature(phase.chamber_target_c)}` : nothing}${phase.meat_target_c !== undefined && phase.completion_rule === 'temperature' ? ` · ${i18n.getMessage('Final meat temperature')}: ${formatTemperature(phase.meat_target_c)}` : nothing}</p><p class="text-sm text-base-content">${phaseCompletion(phase)}</p>${phaseTechnique(phase) ? html`<p class="mt-1 text-sm text-base-content">${phaseTechnique(phase)}</p>` : nothing}${phase.message ? html`<p class="mt-1 text-sm">${phase.message}</p>` : nothing}</li>`)}
              </ol>
              ${canApprove ? html`<button class="aiux-btn aiux-btn-success mt-4" type="button" ?disabled=${this.refreshing} @click=${() => this._approveAiPlan()}>${i18n.getMessage('Approve plan')}</button>` : nothing}
              ${canRestart ? html`<button class="aiux-btn aiux-btn-success mt-4" type="button" ?disabled=${this.refreshing} @click=${() => this._approveAiPlan('restart')}>${i18n.getMessage('Reapprove plan')}</button>` : nothing}
              ${canClear ? html`<button class="aiux-btn aiux-btn-outline mt-4" type="button" ?disabled=${this.refreshing} @click=${() => { this.aiClearConfirm = true; this.requestUpdate(); }}>${i18n.getMessage('Clear plan')}</button>` : nothing}
            </div>
          ` : nothing}
        </div>
      </section>
    `;
  }

  _renderSession(session) {
    if (!session) return html`<div class="aiux-alert aiux-alert-info"><span>${i18n.getMessage('No active cooking session for this smoker.')}</span></div>`;
    const monitorsMeat = isMeatMonitoringEnabled(session);
    const status = String(getValue(session, 'status') || '').toLowerCase();
    const completed = status === 'completed' || Boolean(getValue(session, 'completed_at'));
    const aiPhase = getValue(session, 'ai_current_phase');
    const manualAction = isEnabled(getValue(session, 'ai_manual_action_required'));
    const aiPlanStatus = this._aiPlanStatus(session);
    const planTargets = this._aiPlanTargets(session);
    const targetChamber = this._effectiveChamberTarget(session);
    const targetMeat = planTargets.meat ?? toNumber(getValue(session, 'target_meat_temperature_c'));
    const planPhaseLabel = status === 'planned' && aiPlanStatus === 'approved' ? i18n.getMessage('Ready to start') : aiPhase;
    const chamberTargetLabel = isEnabled(getValue(session, 'adaptive_temperature_enabled')) && toNumber(getValue(session, 'adaptive_current_chamber_target_c')) !== null ? i18n.getMessage('Adaptive chamber target') : i18n.getMessage('Plan chamber target');
    return html`<section class="aiux-card border border-base-300 bg-base-100 shadow-sm"><div class="aiux-card-body p-5"><h2 class="aiux-card-title">${getValue(session, 'name') || i18n.getMessage('Cooking session')}</h2>${completed ? html`<p class="mt-3 text-base-content">${i18n.getMessage('This cooking session is finished.')}</p>` : nothing}<dl class="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3"><div><dt>${i18n.getMessage('Status')}</dt><dd class="font-semibold">${formatSessionStatus(status)}</dd></div><div><dt>${i18n.getMessage('Meat')}</dt><dd class="font-semibold">${[getValue(session, 'meat_type'), getValue(session, 'meat_cut')].filter(Boolean).join(' / ') || i18n.getMessage('Not specified')}</dd></div><div><dt>${i18n.getMessage('Meat monitoring')}</dt><dd class="font-semibold">${monitorsMeat ? i18n.getMessage('Active') : i18n.getMessage('Not monitored')}</dd></div><div><dt>${chamberTargetLabel}</dt><dd class="font-semibold">${formatTemperature(targetChamber)}</dd></div>${monitorsMeat ? html`<div><dt>${i18n.getMessage('Current meat target')}</dt><dd class="font-semibold">${formatTemperature(targetMeat)}</dd></div>` : nothing}</dl><div class="mt-4 border-t border-base-300 pt-4"><p class="text-sm font-semibold">${i18n.getMessage('AI cooking plan')}: ${aiPlanStatus === 'none' ? i18n.getMessage('No plan') : aiPlanStatus}</p>${planPhaseLabel ? html`<p class="mt-1 text-sm">${status === 'planned' && aiPlanStatus === 'approved' ? i18n.getMessage('Plan status') : i18n.getMessage('AI phase')}: <span class="font-semibold capitalize">${planPhaseLabel}</span></p>` : nothing}${manualAction ? html`<aiux-alert-message class="mt-3" type="warning" alert-title=${i18n.getMessage('Manual action required')} message=${getValue(session, 'ai_manual_action_message') || i18n.getMessage('Complete the cooking action before continuing.')} autofocus-controls="false"></aiux-alert-message>` : nothing}</div></div></section>`;
    return html`<section class="aiux-card border border-base-300 bg-base-100 shadow-sm"><div class="aiux-card-body p-5"><div class="flex flex-wrap items-baseline justify-between gap-2"><h2 class="aiux-card-title">${getValue(session, 'name') || i18n.getMessage('Cooking session')}</h2></div>${completed ? html`<p class="mt-3 text-base-content">${i18n.getMessage('This cooking session is finished.')}</p>` : nothing}<dl class="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-3"><div><dt class="text-base-content">${i18n.getMessage('Status')}</dt><dd class="font-semibold">${formatSessionStatus(status)}</dd></div><div><dt class="text-base-content">${i18n.getMessage('Meat')}</dt><dd class="font-semibold">${[getValue(session, 'meat_type'), getValue(session, 'meat_cut')].filter(Boolean).join(' / ') || i18n.getMessage('Not specified')}</dd></div><div><dt class="text-base-content">${i18n.getMessage('Meat monitoring')}</dt><dd class="font-semibold">${monitorsMeat ? i18n.getMessage('Active') : i18n.getMessage('Not monitored')}</dd></div><div><dt class="text-base-content">${i18n.getMessage('Target chamber')}</dt><dd class="font-semibold">${formatTemperature(toNumber(getValue(session, 'target_chamber_temperature_c')))}</dd></div>${monitorsMeat ? html`<div><dt class="text-base-content">${i18n.getMessage('Target meat')}</dt><dd class="font-semibold">${formatTemperature(toNumber(getValue(session, 'target_meat_temperature_c')))}</dd></div>` : nothing}</dl><div class="mt-4 border-t border-base-300 pt-4"><p class="text-sm font-semibold">${i18n.getMessage('AI cooking plan')}: ${aiPlanStatus === 'none' ? i18n.getMessage('No plan') : aiPlanStatus}</p>${aiPhase ? html`<p class="mt-1 text-sm">${i18n.getMessage('AI phase')}: <span class="font-semibold capitalize">${aiPhase}</span></p>` : nothing}${manualAction ? html`<aiux-alert-message class="mt-3" type="warning" alert-title=${i18n.getMessage('Manual action required')} message=${getValue(session, 'ai_manual_action_message') || i18n.getMessage('Inspect the food before continuing.') } autofocus-controls="false"></aiux-alert-message>` : nothing}</div></div></section>`;
  }

  _renderSessionAnalytics(device, session) {
    if (!device || !session) return nothing;
    const sessionId = getValue(session, 'sys_id');
    const readings = this._deviceReadings(device).filter(reading => referenceId(reading, 'cooking_session') === sessionId || (!referenceId(reading, 'cooking_session') && String(getValue(reading, 'smoker_device') || '').toLowerCase() === String(this._deviceId(device) || '').toLowerCase()));
    const recent = [...readings].sort((a, b) => Number(getValue(b, 'recorded_at') || 0) - Number(getValue(a, 'recorded_at') || 0)).slice(0, 12);
    const chamberValues = recent.map(reading => toNumber(getValue(reading, 'chamber_temperature_c'))).filter(value => value !== null);
    const meatValues = recent.map(reading => toNumber(getValue(reading, 'meat_temperature_c'))).filter(value => value !== null);
    const chamberAverage = chamberValues.length ? chamberValues.reduce((sum, value) => sum + value, 0) / chamberValues.length : null;
    const meatAverage = meatValues.length ? meatValues.reduce((sum, value) => sum + value, 0) / meatValues.length : null;
    const latestChamber = chamberValues.length ? chamberValues[0] : null;
    const latestMeat = meatValues.length ? meatValues[0] : null;
    const peakChamber = chamberValues.length ? Math.max(...chamberValues) : null;
    const startedAt = getValue(session, 'started_at');
    const endedAt = getValue(session, 'completed_at') || this.currentTime;
    const sessionMinutes = startedAt ? Math.max(0, (new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 60000) : 0;

    return html`
      <section class="aiux-card border border-base-300 bg-base-100 shadow-sm">
        <div class="aiux-card-body p-5">
          <div class="flex flex-wrap items-baseline justify-between gap-2">
            <h2 class="aiux-card-title">${i18n.getMessage('Session analytics')}</h2>
            <span class="text-sm text-base-content">${recent.length} ${i18n.getMessage('recent readings')}</span>
          </div>
          <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div class="aiux-stat panel min-w-0 border border-base-300 bg-base-100"><div class="aiux-stat-title">${i18n.getMessage('Latest chamber')}</div><div class="aiux-stat-value text-xl sm:text-2xl">${formatTemperature(latestChamber)}</div><div class="aiux-stat-desc">${i18n.getMessage('Current trend')}</div></div>
            <div class="aiux-stat panel min-w-0 border border-base-300 bg-base-100"><div class="aiux-stat-title">${i18n.getMessage('Peak chamber')}</div><div class="aiux-stat-value text-xl sm:text-2xl">${formatTemperature(peakChamber)}</div><div class="aiux-stat-desc">${i18n.getMessage('Highest observed')}</div></div>
            <div class="aiux-stat panel min-w-0 border border-base-300 bg-base-100"><div class="aiux-stat-title">${i18n.getMessage('Average chamber')}</div><div class="aiux-stat-value text-xl sm:text-2xl">${formatTemperature(chamberAverage)}</div><div class="aiux-stat-desc">${i18n.getMessage('Recent sample')}</div></div>
            <div class="aiux-stat panel min-w-0 border border-base-300 bg-base-100"><div class="aiux-stat-title">${i18n.getMessage('Session runtime')}</div><div class="aiux-stat-value text-xl sm:text-2xl">${Math.round(sessionMinutes)} min</div><div class="aiux-stat-desc">${i18n.getMessage('Session duration')}</div></div>
          </div>
          ${meatValues.length ? html`<div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div class="rounded-box border border-base-300 bg-base-200/40 p-3"><p class="text-xs uppercase tracking-[0.15em] text-base-content/70">${i18n.getMessage('Latest meat')}</p><p class="mt-2 text-xl font-semibold">${formatTemperature(latestMeat)}</p></div>
            <div class="rounded-box border border-base-300 bg-base-200/40 p-3"><p class="text-xs uppercase tracking-[0.15em] text-base-content/70">${i18n.getMessage('Average meat')}</p><p class="mt-2 text-xl font-semibold">${formatTemperature(meatAverage)}</p></div>
          </div>` : nothing}
          ${recent.length ? html`<div class="mt-4 overflow-hidden rounded-box border border-base-300">
            <table class="table table-zebra table-sm w-full">
              <thead><tr><th>${i18n.getMessage('Time')}</th><th>${i18n.getMessage('Chamber')}</th><th>${i18n.getMessage('Meat')}</th></tr></thead>
              <tbody>
                ${recent.map(reading => html`<tr><td>${formatDate(getValue(reading, 'recorded_at'))}</td><td>${formatTemperature(toNumber(getValue(reading, 'chamber_temperature_c')))}</td><td>${formatTemperature(toNumber(getValue(reading, 'meat_temperature_c')))}</td></tr>`)}
              </tbody>
            </table>
          </div>` : nothing}
        </div>
      </section>
    `;
  }

  _renderControllerStatus(device, session) {
    const actions = getRecords(this._currentData()?.actions).filter(action => getValue(action, 'source') === 'automatic_rule');
    const latest = actions[0] || null;
    const automatic = isEnabled(getValue(session, 'automatic_control_enabled'));
    const configuredMode = getValue(session, 'control_mode') || (automatic ? 'automatic' : 'dry_run');
    const physicalControl = configuredMode === 'automatic' && automatic;
    const status = String(getValue(session, 'status') || '').toLowerCase();
    if (status === 'fault' || this._aiPlanStatus(session) === 'paused') {
      const manualCheckpoint = isEnabled(getValue(session, 'ai_manual_action_required'));
      return html`<aiux-alert-message type=${status === 'fault' ? 'error' : 'warning'} alert-title=${status === 'fault' ? i18n.getMessage('Heating stopped: safety fault') : i18n.getMessage('AI heating paused')} message=${manualCheckpoint
        ? i18n.getMessage('Heating is off for a manual checkpoint. Open the AI plan, complete the instruction, then select Continue.')
        : i18n.getMessage('No active heating target. Review the fault and correct the safety settings, then select Resume AI cooking to continue from the saved phase. Changing the session status alone does not resume the plan.')} autofocus-controls="false">
        ${this._canResumeAi(session) ? html`<button class="aiux-btn aiux-btn-primary mt-3" type="button" aria-haspopup="dialog" ?disabled=${this.refreshing} @click=${() => this._requestAction('resume')}>${i18n.getMessage('Resume AI cooking')}</button>` : nothing}
      </aiux-alert-message>`;
    }
    const phase = getValue(session, 'current_phase') || status || 'waiting';
    const holding = status === 'holding' || phase === 'post-target hold';
    const monitorsMeatForTarget = isMeatMonitoringEnabled(session);
    const target = holding && monitorsMeatForTarget
      ? toNumber(getValue(session, 'post_target_chamber_temperature_c'))
      : this._effectiveChamberTarget(session);
    if (status === 'planned') {
      const readiness = configuredMode === 'automatic' && !physicalControl
        ? i18n.getMessage('Automatic mode is selected, but physical control is unavailable. Enable Automatic Control and verify the device is online and polling.')
        : configuredMode === 'automatic'
          ? i18n.getMessage('The approved plan is ready. Physical control will begin when cooking starts.')
          : configuredMode === 'manual'
            ? i18n.getMessage('The plan is ready. Relay operation will remain under user control.')
            : i18n.getMessage('The plan is ready for testing. Relay commands will not be sent in dry-run mode.');
      return html`<section class="aiux-card border border-base-300 bg-base-100 shadow-sm"><div class="aiux-card-body p-5"><div class="flex flex-wrap items-baseline justify-between gap-2"><h2 class="aiux-card-title">${i18n.getMessage('Controller readiness')}</h2><span class="aiux-badge ${physicalControl ? 'aiux-badge-warning' : 'aiux-badge-outline'}">${configuredMode === 'automatic' ? (physicalControl ? i18n.getMessage('Ready for automatic control') : i18n.getMessage('Setup required')) : configuredMode === 'manual' ? i18n.getMessage('Manual mode') : i18n.getMessage('Dry-run mode')}</span></div><p class="mt-2 text-sm text-base-content">${readiness}</p><dl class="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4"><div><dt class="text-base-content">${i18n.getMessage('Session status')}</dt><dd class="font-semibold">${i18n.getMessage('Planned')}</dd></div><div><dt class="text-base-content">${i18n.getMessage('Configured chamber target')}</dt><dd class="font-semibold">${formatTemperature(target)}</dd></div><div><dt class="text-base-content">${i18n.getMessage('Tolerance')}</dt><dd class="font-semibold">${formatTemperature(toNumber(getValue(session, 'chamber_temperature_tolerance_c')))}</dd></div><div><dt class="text-base-content">${i18n.getMessage('Controller activity')}</dt><dd class="font-semibold">${i18n.getMessage('Not started')}</dd></div></dl></div></section>`;
    }
    const recipeCeiling = this._aiPlanTargets(session).ceiling;
    const sessionCeiling = toNumber(getValue(session, 'adaptive_maximum_chamber_temperature_c'));
    const operatingCeiling = recipeCeiling === null || recipeCeiling === undefined ? sessionCeiling : sessionCeiling === null ? recipeCeiling : Math.min(recipeCeiling, sessionCeiling);
    const atOperatingCeiling = isEnabled(getValue(session, 'adaptive_temperature_enabled')) && operatingCeiling !== null && target !== null && target >= operatingCeiling;
    const modeHelp = atOperatingCeiling
      ? i18n.getMessage('Operating limit reached; monitoring meat temperature. The heater cycles to maintain the chamber target; slow meat heating does not increase the operating limit.')
      : configuredMode === 'automatic' && !physicalControl
      ? i18n.getMessage('Automatic mode is selected, but physical control is unavailable. Enable Automatic Control and verify the device is online and polling.')
      : configuredMode === 'automatic'
        ? i18n.getMessage('The approved plan may operate the relay. The controller anticipates chamber temperature rise before switching off.')
        : configuredMode === 'manual'
          ? i18n.getMessage('The plan provides instructions; relay operation remains under user control.')
          : i18n.getMessage('The controller records decisions for testing but does not operate the relay.');
    return html`<section class="aiux-card border border-base-300 bg-base-100 shadow-sm"><div class="aiux-card-body p-5"><div class="flex flex-wrap items-baseline justify-between gap-2"><h2 class="aiux-card-title">${i18n.getMessage('Controller status')}</h2><span class="aiux-badge ${physicalControl ? 'aiux-badge-warning' : 'aiux-badge-outline'}">${configuredMode === 'automatic' ? (physicalControl ? i18n.getMessage('Automatic control') : i18n.getMessage('Automatic control unavailable')) : configuredMode === 'manual' ? i18n.getMessage('Manual control') : i18n.getMessage('Dry-run')}</span></div><p class="mt-2 text-sm text-base-content">${modeHelp}</p><dl class="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4"><div><dt class="text-base-content">${i18n.getMessage('Controller phase')}</dt><dd class="font-semibold capitalize">${phase}</dd></div><div><dt class="text-base-content">${i18n.getMessage('Active chamber target')}</dt><dd class="font-semibold">${formatTemperature(target)}</dd></div><div><dt class="text-base-content">${i18n.getMessage('Tolerance')}</dt><dd class="font-semibold">${formatTemperature(toNumber(getValue(session, 'chamber_temperature_tolerance_c')))}</dd></div><div><dt class="text-base-content">${i18n.getMessage('Last decision')}</dt><dd class="font-semibold">${formatControllerAction(getValue(latest, 'action'))}</dd></div></dl>${latest ? html`<p class="mt-4 text-sm text-base-content"><strong>${i18n.getMessage('Decision reason')}:</strong> ${getValue(latest, 'reason') || i18n.getMessage('No reason recorded.')}<br><span>${i18n.getMessage('Decision time')}: ${formatDate(getValue(latest, 'requested_at'))}</span></p>` : html`<p class="mt-4 text-sm text-base-content">${i18n.getMessage('No controller decision recorded yet.')}</p>`}</div></section>`;
  }

  _renderTabs(device) {
    const id = this._deviceId(device);
    const actionQuery = `smoker_device=${id}^ORDERBYDESCrequested_at`;
    const alertQuery = `smoker_device=${id}^ORDERBYDESCopened_at`;
    const tabs = [
      {id: 'history', label: i18n.getMessage('History'), content: html`<aiux-list-connected table=${READING_TABLE} columns="recorded_at,chamber_temperature_c,meat_temperature_c,relay_state" query=${`smoker_device=${id}^ORDERBYDESCrecorded_at`} .data=${this._currentData()?.readings} .pageSize=${20} .listOptions=${{heading: i18n.getMessage('Temperature history'), selectionEnabled: false, showRefreshButton: false, showZingSearch: false, showCount: true, showEditColumnsButton: false, wrapLineCount: 1}}></aiux-list-connected>`},
      {id: 'activity', label: i18n.getMessage('Activity'), content: html`<div class="flex flex-col gap-6"><aiux-list-connected table=${ACTION_TABLE} columns="requested_at,action,result,source" query=${actionQuery} .data=${this._currentData()?.actions} .pageSize=${10} .listOptions=${{heading: i18n.getMessage('Control actions'), selectionEnabled: false, showRefreshButton: false, showZingSearch: false, showCount: true, showEditColumnsButton: false, wrapLineCount: 1}}></aiux-list-connected><aiux-list-connected table=${ALERT_TABLE} columns="opened_at,alert_type,severity,state" query=${alertQuery} .data=${this._currentData()?.alerts} .pageSize=${10} .listOptions=${{heading: i18n.getMessage('Device alerts'), selectionEnabled: false, showRefreshButton: false, showZingSearch: false, showCount: true, showEditColumnsButton: false, wrapLineCount: 1}}></aiux-list-connected></div>`}
    ];
    return html`<section class="aiux-card border border-base-300 bg-base-100 shadow-sm"><div class="aiux-card-body p-5"><aiux-tab-group variant="bordered" .tabs=${tabs} tablist-label=${i18n.getMessage('Dashboard views')}></aiux-tab-group></div></section>`;
  }

  render() {
    const dashboardData = this._currentData();
    if (!dashboardData) return html`<main class="mx-auto max-w-7xl p-4 lg:p-8"><div class="aiux-skeleton h-12 w-2/3"></div><div class="mt-6 grid gap-4 md:grid-cols-2"><div class="aiux-skeleton h-64"></div><div class="aiux-skeleton h-64"></div></div></main>`;
    const device = this._device();
    const session = this._deviceSession(device);
    const monitorsMeat = isMeatMonitoringEnabled(session);
    const reading = this._deviceReadings(device)[0];
    const chamber = toNumber(getValue(device, 'last_chamber_temperature_c') ?? getValue(reading, 'chamber_temperature_c'));
    const meat = toNumber(getValue(device, 'last_meat_temperature_c') ?? getValue(reading, 'meat_temperature_c'));
    const relayEnabled = device && getValue(device, 'connection_status') === 'online' && !this._isStale(device);
    return html`
      <main class="mx-auto flex max-w-7xl flex-col gap-4 p-3 sm:p-4 lg:p-6">
        <header class="relative flex flex-col gap-3 border-b border-base-300 pb-3">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1"><p class="text-sm text-base-content">${i18n.getMessage('Live temperature intelligence, safe control, and clear cooking progress.')}</p></div>
            <img class="pointer-events-none hidden h-16 w-auto shrink-0 object-contain sm:block lg:h-20" src=${smokerImage} alt=${i18n.getMessage('Electric smoker')} style="margin-top: 0px; margin-right: 0; align-self: flex-start;" />
          </div>
          <div class="grid w-full max-w-3xl grid-cols-1 gap-2 sm:grid-cols-2">
            <label class="flex min-w-0 flex-col gap-1 text-sm font-semibold" for="smoker-device-selector">${i18n.getMessage('Smoker device')}<select id="smoker-device-selector" class="aiux-select w-full" .value=${this.selectedDeviceId} @change=${event => { navigate(`/home?deviceId=${event.target.value}`); }}>${this._devices().map(item => html`<option value=${this._deviceId(item)}>${getValue(item, 'name')}${isEnabled(getValue(item, 'active')) ? nothing : ` (${i18n.getMessage('inactive')})`}</option>`)}</select></label>
            ${this._sessions().length ? html`<div class="flex min-w-0 items-end gap-2"><label class="flex min-w-0 flex-1 flex-col gap-1 text-sm font-semibold" for="cooking-session-selector">${i18n.getMessage('Cooking session')}<select id="cooking-session-selector" class="aiux-select w-full" .value=${this.selectedSessionId} @change=${event => { navigate(`/home?deviceId=${this._deviceId(this._device())}&sessionId=${event.target.value}`); }}>${this._sessions().map(item => html`<option value=${getValue(item, 'sys_id')}>${getValue(item, 'name') || i18n.getMessage('Unnamed session')}</option>`)}</select></label>${session && String(getValue(session, 'status')).toLowerCase() !== 'completed' ? html`<button class="aiux-btn aiux-btn-primary shrink-0" type="button" @click=${() => this._openAiPlan()}>${this._aiPlanButtonLabel(session)}</button>` : nothing}</div>` : nothing}
          </div>
        </header>
        ${dashboardData.hasError ? html`<aiux-alert-message type="warning" alert-title=${i18n.getMessage('Dashboard data unavailable')} message=${i18n.getMessage('Some dashboard records could not be loaded.')} autofocus-controls="false"></aiux-alert-message>` : nothing}
        ${device ? html`${this._renderStatus(device, session)}<div class="flex flex-wrap items-center gap-3" role="group" aria-label=${i18n.getMessage('Polling and heating controls')}><button class="aiux-btn aiux-btn-primary" ?disabled=${this.refreshing || !isEnabled(getValue(device, 'active')) || isEnabled(getValue(device, 'polling_enabled'))} type="button" @click=${() => this._setPolling(true)}>${i18n.getMessage('Start polling')}</button><button class="aiux-btn aiux-btn-outline" ?disabled=${this.refreshing || !isEnabled(getValue(device, 'polling_enabled'))} type="button" @click=${() => this._setPolling(false)}>${i18n.getMessage('Stop polling')}</button>${isEnabled(getValue(device, 'polling_enabled')) && session && String(getValue(session, 'status')).toLowerCase() === 'planned' ? html`<button class="aiux-btn aiux-btn-success" ?disabled=${this.refreshing} type="button" @click=${() => this._setSessionStatus('start')}>${i18n.getMessage('Start cooking')}</button>` : nothing}${isEnabled(getValue(device, 'polling_enabled')) && session && ['cooking', 'preheating', 'holding'].includes(String(getValue(session, 'status')).toLowerCase()) ? html`<button class="aiux-btn aiux-btn-error" ?disabled=${this.refreshing} type="button" @click=${() => this._setSessionStatus('finish')}>${i18n.getMessage('Finish cooking')}</button>` : nothing}<button class="action-button aiux-btn aiux-btn-success" ?disabled=${!relayEnabled || this.refreshing} type="button" @click=${() => this._requestAction('on')}>${i18n.getMessage('Heat on')}</button><button class="action-button aiux-btn aiux-btn-error" ?disabled=${!relayEnabled || this.refreshing} type="button" @click=${() => this._requestAction('off')}>${i18n.getMessage('Heat off')}</button><button class="aiux-btn aiux-btn-ghost" ?disabled=${this.refreshing} type="button" @click=${() => this._refresh()}>${this.refreshing ? i18n.getMessage('Refreshing...') : i18n.getMessage('Refresh')}</button><span class="text-sm text-base-content" role="status">${this.actionMessage}</span></div><section class="grid grid-cols-1 gap-4 md:grid-cols-2" aria-label=${i18n.getMessage('Current temperatures')}>${this._renderGauge(i18n.getMessage('Chamber temperature'), chamber, 250, toNumber(getValue(session, 'target_chamber_temperature_c')), getValue(device, 'last_successful_contact'))}${monitorsMeat ? this._renderGauge(i18n.getMessage('Meat temperature'), meat, 100, toNumber(getValue(session, 'target_meat_temperature_c')), getValue(device, 'last_successful_contact')) : html`<section class="aiux-card border border-base-300 bg-base-100"><div class="aiux-card-body justify-center p-5"><h2 class="aiux-card-title">${i18n.getMessage('Meat temperature')}</h2><p class="text-base-content">${i18n.getMessage('Not monitored for this session.')}</p></div></section>`}</section>${this._renderSession(session)}${this._renderControllerStatus(device, session)}${this._renderTabs(device)}` : html`<aiux-alert-message type="info" alert-title=${i18n.getMessage('No smoker configured')} message=${i18n.getMessage('Create a Smoker Device record to select it here.')} autofocus-controls="false"></aiux-alert-message>`}
        ${device ? html`<section class="aiux-card border border-error/30 bg-base-100 shadow-sm"><div class="aiux-card-body flex flex-wrap items-center justify-between gap-3 p-4"><div><h2 class="text-base font-semibold">${i18n.getMessage('History maintenance')}</h2><p class="text-sm text-base-content">${i18n.getMessage('Delete temperature readings, control actions, and alerts for this smoker. Cooking sessions and device settings are kept.')}</p></div><button class="aiux-btn aiux-btn-error aiux-btn-outline" type="button" ?disabled=${this.refreshing || ['planned', 'preheating', 'cooking', 'holding'].includes(String(getValue(session, 'status')).toLowerCase())} @click=${() => { this.clearHistoryConfirm = true; this.requestUpdate(); }}>${i18n.getMessage('Clear smoker history')}</button></div></section>` : nothing}
        <aiux-dialog ?open=${this.aiPlanOpen} size="xl" .customSize=${{width: 'min(96vw, 920px)', height: 'min(88vh, 760px)'}} dialog-label=${i18n.getMessage('AI cooking plan')} @aiux-dialog-close=${this._closeAiPlan}>
          <div slot="header">${i18n.getMessage('AI cooking plan')}</div>
          <div class="min-h-0 w-full pr-2">
            ${session ? this._renderAiPlan(session) : nothing}
          </div>
          <div slot="footer" class="flex flex-wrap justify-end gap-2"><button class="aiux-btn aiux-btn-ghost" type="button" @click=${this._closeAiPlan}>${i18n.getMessage('Close')}</button></div>
        </aiux-dialog>
        <aiux-dialog ?open=${this.clearHistoryConfirm} dialog-label=${i18n.getMessage('Confirm clearing smoker history')} @aiux-dialog-close=${() => { this.clearHistoryConfirm = false; this.requestUpdate(); }}>
          <div slot="header">${i18n.getMessage('Clear smoker history')}</div>
          <p>${i18n.getMessage('This permanently deletes temperature readings, control actions, and alerts for the selected smoker. Cooking sessions and device settings will remain. Continue?')}</p>
          <div slot="footer" class="flex flex-wrap justify-end gap-2"><button class="aiux-btn aiux-btn-ghost" type="button" @click=${() => { this.clearHistoryConfirm = false; this.requestUpdate(); }}>${i18n.getMessage('Cancel')}</button><button class="aiux-btn aiux-btn-error" type="button" ?disabled=${this.refreshing} @click=${() => this._clearHistory()}>${i18n.getMessage('Delete history')}</button></div>
        </aiux-dialog>
        <aiux-dialog ?open=${this.clearHistoryProgress} dialog-label=${i18n.getMessage('Clearing smoker history')}>
          <div class="flex min-w-64 flex-col items-center gap-4 p-6 text-center" role="status" aria-live="polite">
            <aiux-loader size="sm"></aiux-loader>
            <div><h2 class="text-lg font-semibold">${i18n.getMessage('Clearing smoker history')}</h2><p class="mt-1 text-sm text-base-content">${i18n.getMessage('Please wait while temperature readings, control actions, and alerts are deleted.')}</p></div>
          </div>
        </aiux-dialog>
        <aiux-dialog ?open=${this.aiClearConfirm} dialog-label=${i18n.getMessage('Confirm clearing cooking plan')} @aiux-dialog-close=${() => { this.aiClearConfirm = false; this.requestUpdate(); }}>
          <div slot="header">${i18n.getMessage('Clear cooking plan')}</div>
          <p>${i18n.getMessage('Clear this cooking plan and its approval? The normal cooking session settings will remain unchanged.')}</p>
          <div slot="footer" class="flex flex-wrap justify-end gap-2"><button class="aiux-btn aiux-btn-ghost" type="button" @click=${() => { this.aiClearConfirm = false; this.requestUpdate(); }}>${i18n.getMessage('Cancel')}</button><button class="aiux-btn aiux-btn-error" type="button" ?disabled=${this.refreshing} @click=${() => this._clearAiPlan()}>${i18n.getMessage('Clear plan')}</button></div>
        </aiux-dialog>
        <aiux-dialog ?open=${Boolean(this.confirmAction)} dialog-label=${i18n.getMessage('Confirm heating action')} @aiux-dialog-close=${this._closeAction}>
          <div slot="header">${i18n.getMessage('Confirm heating action')}</div>
          ${this.confirmAction === 'resume' ? html`
            <p class="break-words">${i18n.getMessage('Resume the saved AI phase after reviewing the fault? Automatic mode may switch heating on after the safety checks pass.')}</p>
            <p class="mt-3 break-words">${i18n.getMessage('Earlier phases will not restart. The current phase timer restarts so paused time is not counted. Temperature targets already reached may advance immediately to the next step. Review the plan and complete any physical instructions, including unwrapping, before confirming.')}</p>
          ` : html`<p>${this.confirmAction === 'on' ? i18n.getMessage('Turn the smoker heat on now?') : i18n.getMessage('Turn the smoker heat off now?')}</p>`}
          <div slot="footer" class="flex flex-wrap justify-end gap-2"><button class="aiux-btn aiux-btn-ghost" type="button" @click=${this._closeAction}>${i18n.getMessage('Cancel')}</button><button class="aiux-btn ${this.confirmAction === 'off' ? 'aiux-btn-error' : 'aiux-btn-success'}" type="button" ?disabled=${this.refreshing} @click=${() => this._confirmAction()}>${this.confirmAction === 'resume' ? i18n.getMessage('Resume AI cooking') : i18n.getMessage('Confirm')}</button></div>
        </aiux-dialog>
      </main>
    `;
  }
}
