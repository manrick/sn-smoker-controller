/* global GlideDateTime, GlideRecord, SmokerCookingQuality, SmokerRelayControl, gs, sn_ws */

function createReading(deviceId, values) {
    var reading = new GlideRecord('x_tsigh_smkrctrl_temperature_reading');
    reading.initialize();
    reading.setValue('smoker_device', deviceId);
    reading.setValue('recorded_at', new GlideDateTime());
    if (values.chamberTemperature !== undefined) {
        reading.setValue('chamber_temperature_c', values.chamberTemperature);
    }
    if (values.meatTemperature !== undefined) {
        reading.setValue('meat_temperature_c', values.meatTemperature);
    }
    if (values.relayState !== undefined) {
        reading.setValue('relay_state', values.relayState ? 'on' : 'off');
    }
    if (values.uptime !== undefined) {
        reading.setValue('device_uptime_seconds', values.uptime);
    }
    reading.setValue('reading_status', values.status);
    if (values.httpStatus !== undefined) {
        reading.setValue('http_status', values.httpStatus);
    }
    if (values.errorMessage) {
        reading.setValue('error_message', values.errorMessage);
    }
    reading.insert();
}

function updateOfflineAlert(deviceId, message) {
    var openAlert = new GlideRecord('x_tsigh_smkrctrl_device_alert');
    openAlert.addQuery('smoker_device', deviceId);
    openAlert.addQuery('alert_type', 'device_offline');
    openAlert.addQuery('state', 'open');
    openAlert.setLimit(1);
    openAlert.query();
    if (openAlert.next()) {
        openAlert.setValue('message', message);
        openAlert.update();
        return;
    }

    var alert = new GlideRecord('x_tsigh_smkrctrl_device_alert');
    alert.initialize();
    alert.setValue('smoker_device', deviceId);
    alert.setValue('alert_type', 'device_offline');
    alert.setValue('severity', 'critical');
    alert.setValue('state', 'open');
    alert.setValue('message', message);
    alert.setValue('opened_at', new GlideDateTime());
    alert.insert();
}

function resolveOfflineAlert(deviceId) {
    var alert = new GlideRecord('x_tsigh_smkrctrl_device_alert');
    alert.addQuery('smoker_device', deviceId);
    alert.addQuery('alert_type', 'device_offline');
    alert.addQuery('state', 'open');
    alert.query();
    while (alert.next()) {
        alert.setValue('state', 'resolved');
        alert.setValue('resolved_at', new GlideDateTime());
        alert.update();
    }
}

function numericValue(record, field) {
    var value = record.getValue(field);
    if (value === null || value === undefined || String(value).trim() === '') return null;
    var number = Number(value);
    return isFinite(number) ? number : null;
}

function normalizeTemperature(value) {
    if (value === null || value === undefined || String(value).trim() === '') return null;
    var number = Number(value);
    if (!isFinite(number)) return null;
    if (number <= -100 || number >= 1000) return null;
    return number;
}

function recordDryRunDecision(deviceId, sessionId, action, reason) {
    var controlAction = new GlideRecord('x_tsigh_smkrctrl_control_action');
    controlAction.initialize();
    controlAction.setValue('smoker_device', deviceId);
    if (sessionId) controlAction.setValue('cooking_session', sessionId);
    controlAction.setValue('action', action);
    controlAction.setValue('source', 'automatic_rule');
    controlAction.setValue('result', action === 'no_action' ? 'blocked' : 'requested');
    controlAction.setValue('reason', 'Dry-run controller: ' + reason);
    controlAction.setValue('requested_at', new GlideDateTime());
    controlAction.insert();
}

function recordControllerDecision(device, session, action, reason) {
    var configuredMode = session.getValue('control_mode');
    var automaticControl = (session.getValue('automatic_control_enabled') === '1' || session.getValue('automatic_control_enabled') === 'true') && configuredMode !== 'dry_run' && configuredMode !== 'manual';
    var currentRelayState = device.getValue('last_relay_state');
    var requestedRelayState = action === 'relay_on' ? 'on' : action === 'relay_off' ? 'off' : '';
    if (automaticControl && requestedRelayState && currentRelayState === requestedRelayState) {
        recordDryRunDecision(device.getUniqueValue(), session.getUniqueValue(), 'no_action', reason + ' Relay is already confirmed ' + requestedRelayState + '.');
        return {success: true, dryRun: true, result: 'unchanged'};
    }
    if (!automaticControl || action === 'no_action') {
        var suffix = action === 'no_action' ? ' No relay command sent; current relay state is preserved.' : ' No relay command sent; automatic control is disabled.';
        recordDryRunDecision(device.getUniqueValue(), session.getUniqueValue(), action, reason + suffix);
        return {success: true, dryRun: true};
    }
    return new SmokerRelayControl().setRelay(device.getUniqueValue(), action === 'relay_on', session.getUniqueValue(), 'automatic_rule', reason);
}

function forceRelayOffForSafety(device, sessionId, reason) {
    return new SmokerRelayControl().setRelay(device.getUniqueValue(), false, sessionId || '', 'safety_logic', reason, true);
}

function isMonitoringMeat(session) {
    return session.getValue('monitor_meat_temperature') === '1' || session.getValue('monitor_meat_temperature') === 'true';
}

function completeSession(session) {
    var monitorsMeat = isMonitoringMeat(session);
    session.setValue('status', 'completed');
    if (session.getValue('ai_plan_json')) {
        session.setValue('ai_current_phase', 'finished');
        session.setValue('ai_phase_index', 0);
        session.setValue('ai_phase_started_at', '');
    }
    if (session.getValue('ai_plan_status') === 'active' || session.getValue('ai_plan_status') === 'paused') session.setValue('ai_plan_status', 'completed');
    session.setValue('ai_manual_action_required', false);
    session.setValue('completed_at', new GlideDateTime());
    session.setValue(monitorsMeat ? 'post_target_completed_at' : 'chamber_target_completed_at', new GlideDateTime());
    session.update();
}

function enterHolding(session) {
    if (session.getValue('status') !== 'holding') {
        var monitorsMeat = isMonitoringMeat(session);
        session.setValue('status', 'holding');
        session.setValue('current_phase', 'post-target hold');
        session.setValue(monitorsMeat ? 'post_target_started_at' : 'chamber_target_started_at', new GlideDateTime());
        session.setValue('completed_at', '');
        session.setValue(monitorsMeat ? 'post_target_completed_at' : 'chamber_target_completed_at', '');
        session.update();
    }
}

function synchronizeSessionLifecycle(session) {
    var status = session.getValue('status');
    var phase = session.getValue('current_phase');
    var monitorsMeat = isMonitoringMeat(session);
    var completedField = monitorsMeat ? 'post_target_completed_at' : 'chamber_target_completed_at';
    var expectedPhase = {
        planned: 'planned',
        preheating: 'preheating',
        cooking: 'cooking',
        holding: phase === 'post-target hold' ? 'post-target hold' : 'holding',
        completed: 'finished',
        stopped: 'stopped',
        fault: 'fault'
    }[status];
    if (expectedPhase && phase !== expectedPhase) {
        session.setValue('current_phase', expectedPhase);
    }
    if (status === 'completed' && !session.getValue('completed_at')) {
        session.setValue('completed_at', new GlideDateTime());
    }
    if (status !== 'completed' && session.getValue('completed_at')) {
        session.setValue('completed_at', '');
        session.setValue(completedField, '');
    }
    session.update();
}

function holdDurationExpired(session) {
    var monitorsMeat = isMonitoringMeat(session);
    var minutesField = monitorsMeat ? 'post_target_hold_minutes' : 'chamber_target_hold_minutes';
    var startedField = monitorsMeat ? 'post_target_started_at' : 'chamber_target_started_at';
    var minutes = parseInt(session.getValue(minutesField), 10) || 0;
    if (minutes <= 0) return false;
    var started = session.getValue(startedField);
    if (!started) return false;
    var startedAt = new GlideDateTime(started).getNumericValue();
    return new GlideDateTime().getNumericValue() >= startedAt + (minutes * 60000);
}

function minimumRelaySwitchDelaySeconds(session) {
    var value = parseInt(session.getValue('minimum_relay_switch_interval_seconds'), 10);
    return Number.isFinite(value) && value > 0 ? value : 0;
}

function projectedChamberTemperature(deviceId, currentChamber, anticipationSeconds) {
    if (!anticipationSeconds || anticipationSeconds <= 0) return currentChamber;
    var readings = new GlideRecord('x_tsigh_smkrctrl_temperature_reading');
    readings.addQuery('smoker_device', deviceId);
    readings.addQuery('reading_status', 'valid');
    readings.orderByDesc('recorded_at');
    readings.setLimit(2);
    readings.query();
    if (!readings.next() || !readings.next()) return currentChamber;

    var previousChamber = numericValue(readings, 'chamber_temperature_c');
    var previousRecordedAt = readings.getValue('recorded_at');
    if (previousChamber === null || !previousRecordedAt) return currentChamber;

    var elapsedSeconds = (new GlideDateTime().getNumericValue() - new GlideDateTime(previousRecordedAt).getNumericValue()) / 1000;
    if (elapsedSeconds <= 0) return currentChamber;

    var ratePerSecond = (currentChamber - previousChamber) / elapsedSeconds;
    return currentChamber + (ratePerSecond * anticipationSeconds);
}

function adaptiveTemperatureEnabled(session) {
    return session.getValue('adaptive_temperature_enabled') === '1' || session.getValue('adaptive_temperature_enabled') === 'true';
}

function recordAdaptiveAdjustment(deviceId, sessionId, previousTarget, nextTarget, meatRate, reason) {
    var adjustment = new GlideRecord('x_tsigh_smkrctrl_control_action');
    adjustment.initialize();
    adjustment.setValue('smoker_device', deviceId);
    adjustment.setValue('cooking_session', sessionId);
    adjustment.setValue('action', 'no_action');
    adjustment.setValue('source', 'automatic_rule');
    adjustment.setValue('result', 'requested');
    var meatRateDescription = meatRate === null ? 'Meat target reached.' : 'Meat rise ' + meatRate.toFixed(3) + 'C/min.';
    adjustment.setValue('reason', 'Adaptive target ' + previousTarget + 'C to ' + nextTarget + 'C; ' + meatRateDescription + ' ' + reason);
    adjustment.setValue('requested_at', new GlideDateTime());
    adjustment.insert();
}

function adaptiveOperatingMaximum(session, maximum) {
    var operatingMaximum = numericValue(session, 'adaptive_maximum_chamber_temperature_c');
    var tolerance = numericValue(session, 'chamber_temperature_tolerance_c');
    tolerance = tolerance === null ? 3 : tolerance;
    var configuredMinimum = numericValue(session, 'adaptive_minimum_chamber_temperature_c');
    if (operatingMaximum === null || operatingMaximum <= 0 || maximum === null ||
        tolerance < 0 || operatingMaximum + tolerance >= maximum ||
        (configuredMinimum !== null && (configuredMinimum < 0 || configuredMinimum > operatingMaximum))) return null;
    return operatingMaximum;
}

function adaptChamberTarget(session, deviceId, chamber, meat, baseTarget, maximum, source, allowBelowBase, quality) {
    if (quality) baseTarget = Math.min(baseTarget, quality.adaptive_ceiling_c);
    if (!adaptiveTemperatureEnabled(session)) return baseTarget;
    maximum = adaptiveOperatingMaximum(session, maximum);
    if (maximum === null) return null;
    if (quality) maximum = Math.min(maximum, quality.adaptive_ceiling_c);
    baseTarget = Math.min(baseTarget, maximum);
    var minimumTarget = numericValue(session, 'adaptive_minimum_chamber_temperature_c');
    minimumTarget = minimumTarget === null
        ? baseTarget
        : allowBelowBase
            ? Math.max(0, minimumTarget)
            : Math.max(baseTarget, minimumTarget);
    if (allowBelowBase) minimumTarget = Math.min(minimumTarget, maximum);
    var currentTarget = numericValue(session, 'adaptive_current_chamber_target_c');
    currentTarget = currentTarget === null ? Math.max(baseTarget, minimumTarget) : currentTarget;
    if (currentTarget > maximum) {
        session.setValue('adaptive_current_chamber_target_c', maximum);
        session.setValue('adaptive_last_adjusted_at', new GlideDateTime());
        session.update();
        recordAdaptiveAdjustment(deviceId, session.getUniqueValue(), currentTarget, maximum, null, 'Clamped to the adaptive operating ceiling.');
        return maximum;
    }
    if (currentTarget < minimumTarget) {
        session.setValue('adaptive_current_chamber_target_c', minimumTarget);
        session.setValue('adaptive_last_adjusted_at', new GlideDateTime());
        session.update();
        recordAdaptiveAdjustment(deviceId, session.getUniqueValue(), currentTarget, minimumTarget, 0, (source || 'controller') + ': Restored the configured adaptive minimum target.');
        return minimumTarget;
    }
    if (meat === null) return currentTarget;
    var windowMinutes = parseInt(session.getValue('adaptive_evaluation_minutes'), 10) || 10;
    var lastAdjusted = session.getValue('adaptive_last_adjusted_at');
    if (lastAdjusted && new GlideDateTime().getNumericValue() - new GlideDateTime(lastAdjusted).getNumericValue() < windowMinutes * 60000) return currentTarget;
    if (chamber < currentTarget - (numericValue(session, 'chamber_temperature_tolerance_c') || 3)) return currentTarget;

    var readings = new GlideRecord('x_tsigh_smkrctrl_temperature_reading');
    readings.addQuery('smoker_device', deviceId);
    readings.addQuery('reading_status', 'valid');
    readings.addNotNullQuery('meat_temperature_c');
    if (session.getValue('started_at')) readings.addQuery('recorded_at', '>=', session.getValue('started_at'));
    if (quality && session.getValue('ai_phase_started_at')) readings.addQuery('recorded_at', '>=', session.getValue('ai_phase_started_at'));
    readings.orderByDesc('recorded_at');
    readings.setLimit(100);
    readings.query();
    var newest = null;
    var oldest = null;
    var samples = [];
    var cutoff = new GlideDateTime().getNumericValue() - windowMinutes * 60000;
    while (readings.next()) {
        var recordedAt = new GlideDateTime(readings.getValue('recorded_at')).getNumericValue();
        if (recordedAt < cutoff) break;
        var sampleMeat = numericValue(readings, 'meat_temperature_c');
        if (sampleMeat === null) continue;
        samples.push({time: recordedAt, meat: sampleMeat});
        if (!newest) newest = {time: recordedAt, meat: numericValue(readings, 'meat_temperature_c')};
        oldest = {time: recordedAt, meat: numericValue(readings, 'meat_temperature_c')};
    }
    if (!newest || !oldest || newest.meat === null || oldest.meat === null || newest.time <= oldest.time) return currentTarget;
    var meatRate = (newest.meat - oldest.meat) / ((newest.time - oldest.time) / 60000);
    if (quality) {
        if (samples.length < 9 || newest.time - oldest.time < windowMinutes * 60000 * 0.8) return currentTarget;
        var bucketSize = Math.floor(samples.length / 3);
        function medianBucket(start) {
            var values = samples.slice(start, start + bucketSize).map(function(sample) { return sample.meat; });
            values.sort(function(left, right) { return left - right; });
            var middle = Math.floor(values.length / 2);
            return values.length % 2 ? values[middle] : (values[middle - 1] + values[middle]) / 2;
        }
        var oldestStart = samples.length - bucketSize;
        var bucketSpan = (samples[0].time + samples[bucketSize - 1].time - samples[oldestStart].time - samples[samples.length - 1].time) / 2 / 60000;
        if (bucketSpan <= 0) return currentTarget;
        meatRate = (medianBucket(0) - medianBucket(oldestStart)) / bucketSpan;
    }
    var minimumRate = numericValue(session, 'adaptive_minimum_meat_rise_c_per_min');
    var maximumRate = numericValue(session, 'adaptive_maximum_meat_rise_c_per_min');
    var step = numericValue(session, 'adaptive_target_step_c') || 5;
    var nextTarget = currentTarget;
    var reason = '';
    if (!(quality && quality.stall_tolerant) && minimumRate !== null && meatRate < minimumRate && currentTarget < maximum) {
        nextTarget = Math.min(maximum, currentTarget + step);
        reason = 'Meat is heating too slowly.';
    } else if (maximumRate !== null && meatRate > maximumRate && currentTarget > minimumTarget) {
        nextTarget = Math.max(minimumTarget, currentTarget - step);
        reason = 'Meat is heating faster than the configured upper rate.';
    }
    if (nextTarget !== currentTarget) {
        session.setValue('adaptive_current_chamber_target_c', nextTarget);
        session.setValue('adaptive_last_adjusted_at', new GlideDateTime());
        session.update();
        recordAdaptiveAdjustment(deviceId, session.getUniqueValue(), currentTarget, nextTarget, meatRate, (source || 'deterministic controller') + ': ' + reason);
    }
    return nextTarget;
}

function planMeatPriorityTarget(plan, phaseIndex, session) {
    var priorityTarget = numericValue(session, 'target_meat_temperature_c');
    var planSafetyTarget = Number(plan.safety && plan.safety.minimum_meat_temperature_c);
    if (isFinite(planSafetyTarget) && (priorityTarget === null || planSafetyTarget > priorityTarget)) priorityTarget = planSafetyTarget;
    for (var index = 0; index <= phaseIndex; index += 1) {
        var phaseTarget = plan.phases[index] && plan.phases[index].meat_target_c;
        if (phaseTarget !== undefined && phaseTarget !== null && phaseTarget !== '' && isFinite(Number(phaseTarget)) && (priorityTarget === null || Number(phaseTarget) > priorityTarget)) {
            priorityTarget = Number(phaseTarget);
        }
    }
    return priorityTarget;
}

function chamberTargetAfterMeatReached(session, phaseTarget, maximum) {
    var reducedTarget = phaseTarget;
    var postTargetAction = session.getValue('post_target_action');
    var postTarget = numericValue(session, 'post_target_chamber_temperature_c');
    if (postTarget !== null && ['hold_at_temperature', 'reduce_chamber_temperature'].indexOf(postTargetAction) !== -1 && postTarget < reducedTarget) {
        reducedTarget = postTarget;
    }
    var adaptiveMinimum = numericValue(session, 'adaptive_minimum_chamber_temperature_c');
    if (adaptiveMinimum !== null && adaptiveMinimum < reducedTarget) reducedTarget = adaptiveMinimum;
    var currentAdaptiveTarget = numericValue(session, 'adaptive_current_chamber_target_c');
    if (currentAdaptiveTarget !== null && currentAdaptiveTarget < reducedTarget) reducedTarget = currentAdaptiveTarget;
    if (reducedTarget >= phaseTarget) reducedTarget = 0;
    if (maximum !== null) reducedTarget = Math.min(reducedTarget, maximum);
    return Math.max(0, reducedTarget);
}

function persistMeatPriorityTarget(session, deviceId, previousTarget, reducedTarget, source) {
    var currentAdaptiveTarget = numericValue(session, 'adaptive_current_chamber_target_c');
    var previous = currentAdaptiveTarget === null ? previousTarget : currentAdaptiveTarget;
    if (previous <= reducedTarget) return;
    session.setValue('adaptive_current_chamber_target_c', reducedTarget);
    session.setValue('adaptive_last_adjusted_at', new GlideDateTime());
    session.update();
    recordAdaptiveAdjustment(deviceId, session.getUniqueValue(), previous, reducedTarget, null, (source || 'controller') + ': Chamber target reduced because meat reached its target.');
}

function canSwitchRelay(sessionId, nextAction) {
    if (!sessionId || !nextAction || nextAction === 'no_action') return true;
    var minimumDelaySeconds = new GlideRecord('x_tsigh_smkrctrl_cooking_session');
    if (!minimumDelaySeconds.get(sessionId)) return true;
    var intervalSeconds = minimumRelaySwitchDelaySeconds(minimumDelaySeconds);
    if (intervalSeconds <= 0) return true;

    var latestAction = new GlideRecord('x_tsigh_smkrctrl_control_action');
    latestAction.addQuery('cooking_session', sessionId);
    latestAction.addQuery('action', 'IN', 'relay_on,relay_off');
    latestAction.orderByDesc('requested_at');
    latestAction.setLimit(1);
    latestAction.query();
    if (!latestAction.next()) return true;

    var lastAction = latestAction.getValue('action');
    if (lastAction === nextAction) return true;

    var lastRequestedAt = latestAction.getValue('requested_at');
    if (!lastRequestedAt) return true;

    var lastRequestTime = new GlideDateTime(lastRequestedAt).getNumericValue();
    var now = new GlideDateTime().getNumericValue();
    return (now - lastRequestTime) >= (intervalSeconds * 1000);
}

function createManualActionAlert(deviceId, sessionId, message) {
    var existing = new GlideRecord('x_tsigh_smkrctrl_device_alert');
    existing.addQuery('smoker_device', deviceId);
    existing.addQuery('cooking_session', sessionId);
    existing.addQuery('alert_type', 'manual_action_required');
    existing.addQuery('state', 'open');
    existing.setLimit(1);
    existing.query();
    if (existing.next()) {
        existing.setValue('message', message);
        existing.update();
        return;
    }
    var alert = new GlideRecord('x_tsigh_smkrctrl_device_alert');
    alert.initialize();
    alert.setValue('smoker_device', deviceId);
    alert.setValue('cooking_session', sessionId);
    alert.setValue('alert_type', 'manual_action_required');
    alert.setValue('severity', 'warning');
    alert.setValue('state', 'open');
    alert.setValue('message', message);
    alert.setValue('opened_at', new GlideDateTime());
    alert.insert();
}

function resolveManualActionAlert(deviceId, sessionId) {
    var alert = new GlideRecord('x_tsigh_smkrctrl_device_alert');
    alert.addQuery('smoker_device', deviceId);
    alert.addQuery('cooking_session', sessionId);
    alert.addQuery('alert_type', 'manual_action_required');
    alert.addQuery('state', 'open');
    alert.query();
    while (alert.next()) {
        alert.setValue('state', 'resolved');
        alert.setValue('resolved_at', new GlideDateTime());
        alert.update();
    }
}

function setAiPhase(session, phaseIndex, phase, status, quality) {
    session.setValue('ai_phase_index', phaseIndex);
    session.setValue('ai_current_phase', phase.name);
    session.setValue('ai_phase_started_at', new GlideDateTime());
    session.setValue('ai_quality_retry', false);
    if (quality && phase.mode === 'automatic') {
        session.setValue('adaptive_current_chamber_target_c', Math.min(phase.chamber_target_c, quality.adaptive_ceiling_c));
        session.setValue('adaptive_last_adjusted_at', new GlideDateTime());
    }
    session.setValue('ai_plan_status', status);
    session.setValue('ai_manual_action_required', phase.mode === 'manual');
    session.setValue('ai_manual_action_message', phase.message || '');
    session.update();
}

function evaluateAiPlanController(device, status) {
    var session = new GlideRecord('x_tsigh_smkrctrl_cooking_session');
    session.addQuery('smoker_device', device.getUniqueValue());
    session.addQuery('status', 'IN', 'cooking,preheating,holding');
    session.addQuery('ai_control_enabled', true);
    session.addQuery('ai_plan_status', 'IN', 'approved,active,paused');
    session.orderByDesc('sys_created_on');
    session.setLimit(1);
    session.query();
    if (!session.next()) return false;

    var plan;
    try {
        plan = JSON.parse(session.getValue('ai_plan_json') || '{}');
    } catch (error) {
        session.setValue('status', 'fault');
        session.setValue('ai_plan_status', 'rejected');
        session.update();
        return true;
    }
    if (!Array.isArray(plan.phases) || !plan.phases.length) return false;

    var sessionId = session.getUniqueValue();
    var qualityValidator = new SmokerCookingQuality();
    var qualityError = qualityValidator.validate(plan) || (plan.quality && qualityValidator.validateLimits(plan, session));
    if (qualityError) {
        forceRelayOffForSafety(device, sessionId, 'Invalid cooking quality policy: ' + qualityError);
        session.setValue('status', 'fault');
        session.setValue('ai_plan_status', 'paused');
        session.update();
        return true;
    }
    var phaseIndex = parseInt(session.getValue('ai_phase_index'), 10) || 0;
    var phase = plan.phases[phaseIndex];
    if (session.getValue('ai_plan_status') === 'paused' && (!phase || phase.mode !== 'manual')) {
        forceRelayOffForSafety(device, sessionId, 'AI plan is paused; automatic heating remains stopped until explicitly resumed.');
        return true;
    }
    if (!phase) {
        var finalResult = recordControllerDecision(device, session, 'relay_off', 'AI cooking plan completed.');
        if (finalResult.success || finalResult.dryRun) completeSession(session);
        return true;
    }
    if (session.getValue('ai_plan_status') === 'approved' || session.getValue('ai_current_phase') !== phase.name) {
        setAiPhase(session, phaseIndex, phase, phase.mode === 'manual' ? 'paused' : 'active', plan.quality);
    }
    if (phase.mode === 'manual') {
        var manualShutdown = forceRelayOffForSafety(device, sessionId, 'Manual cooking action required: ' + phase.message);
        if (!manualShutdown.success) {
            session.setValue('status', 'fault');
            session.setValue('ai_plan_status', 'rejected');
            session.setValue('ai_manual_action_required', false);
            session.update();
            return true;
        }
        createManualActionAlert(device.getUniqueValue(), sessionId, phase.message);
        return true;
    }
    resolveManualActionAlert(device.getUniqueValue(), sessionId);
    var chamber = status.chamberTemperature;
    var meat = status.meatTemperature;
    var maximum = numericValue(session, 'maximum_chamber_temperature_c');
    if (maximum !== null && chamber >= maximum) {
        forceRelayOffForSafety(device, sessionId, 'AI safety stop: chamber temperature reached the maximum limit.');
        session.setValue('status', 'fault');
        session.setValue('ai_plan_status', 'paused');
        session.update();
        return true;
    }
    var targetChamber = phase.chamber_target_c === undefined ? null : Number(phase.chamber_target_c);
    if (adaptiveTemperatureEnabled(session) && adaptiveOperatingMaximum(session, maximum) === null) {
        forceRelayOffForSafety(device, sessionId, 'Adaptive heating blocked: configure an operating ceiling below the safety cutoff, including relay tolerance.');
        session.setValue('status', 'fault');
        session.setValue('ai_plan_status', 'paused');
        session.update();
        return true;
    }
    var targetMeat = phase.meat_target_c === undefined ? null : Number(phase.meat_target_c);
    var quality = plan.quality;
    var qualityRetry = session.getValue('ai_quality_retry') === '1' || session.getValue('ai_quality_retry') === 'true';
    if (quality) targetChamber = Math.min(qualityRetry ? quality.recheck_chamber_c : targetChamber, quality.adaptive_ceiling_c);
    var meatPriorityTarget = planMeatPriorityTarget(plan, phaseIndex, session);
    var meatTargetReached = meat !== null && meatPriorityTarget !== null && meat >= meatPriorityTarget;
    var startedAt = session.getValue('ai_phase_started_at');
    var elapsedMinutes = startedAt ? (new GlideDateTime().getNumericValue() - new GlideDateTime(startedAt).getNumericValue()) / 60000 : 0;
    var complete = phase.completion_rule === 'duration'
        ? elapsedMinutes >= Number(phase.max_duration_minutes || 0)
        : (targetMeat !== null ? meat !== null && meat >= targetMeat : (meatTargetReached || (targetChamber !== null && chamber >= targetChamber)));
    if (phase.completion_rule === 'temperature_and_time') complete = complete && elapsedMinutes >= phase.minimum_duration_minutes;
    if (qualityRetry && quality) complete = meat !== null && targetMeat !== null && meat >= targetMeat && elapsedMinutes >= quality.recheck_minutes;
    if (complete) {
        var nextIndex = phaseIndex + 1;
        if (nextIndex >= plan.phases.length) {
            var completionResult = recordControllerDecision(device, session, 'relay_off', 'Final AI cooking phase completed.');
            if (completionResult.success || completionResult.dryRun) completeSession(session);
            return true;
        }
        var nextPhase = plan.phases[nextIndex];
        if (nextPhase.mode === 'manual') {
            var checkpointShutdown = forceRelayOffForSafety(device, sessionId, 'Manual cooking action required: ' + nextPhase.message);
            if (!checkpointShutdown.success) {
                session.setValue('status', 'fault');
                session.setValue('ai_plan_status', 'rejected');
                session.update();
                return true;
            }
        }
        setAiPhase(session, nextIndex, nextPhase, nextPhase.mode === 'manual' ? 'paused' : 'active', quality);
        if (nextPhase.mode === 'manual') createManualActionAlert(device.getUniqueValue(), sessionId, nextPhase.message);
        return true;
    }
    if (targetChamber === null) {
        recordControllerDecision(device, session, 'relay_off', 'AI phase has no chamber target while it is still in progress.');
        return true;
    }
    if (qualityRetry && quality) {
        targetChamber = Math.min(targetChamber, adaptiveTemperatureEnabled(session) ? adaptiveOperatingMaximum(session, maximum) : targetChamber);
        session.setValue('adaptive_current_chamber_target_c', targetChamber);
        session.update();
    } else if (meatTargetReached && !quality) {
        var reducedTarget = chamberTargetAfterMeatReached(session, targetChamber, maximum);
        persistMeatPriorityTarget(session, device.getUniqueValue(), targetChamber, reducedTarget, 'AI phase ' + phase.name);
        targetChamber = reducedTarget;
    } else {
        targetChamber = adaptChamberTarget(session, device.getUniqueValue(), chamber, meat, targetChamber, maximum, 'AI phase ' + phase.name, true, quality);
    }
    if (targetChamber === null) {
        forceRelayOffForSafety(device, sessionId, 'Adaptive heating blocked: configure an operating ceiling below the safety cutoff, including relay tolerance.');
        session.setValue('status', 'fault');
        session.setValue('ai_plan_status', 'paused');
        session.update();
        return true;
    }
    var tolerance = numericValue(session, 'chamber_temperature_tolerance_c') || 3;
    var projected = projectedChamberTemperature(device.getUniqueValue(), chamber, parseInt(device.getValue('chamber_anticipation_seconds'), 10) || 0);
    var action = projected < targetChamber - tolerance ? 'relay_on' : projected >= targetChamber + tolerance ? 'relay_off' : 'no_action';
    if (!canSwitchRelay(sessionId, action)) action = 'no_action';
    return recordControllerDecision(device, session, action, 'AI phase ' + phase.name + ' is controlling the chamber temperature.');
}

function evaluateDryRunController(device, status) {
    var session = new GlideRecord('x_tsigh_smkrctrl_cooking_session');
    session.addQuery('smoker_device', device.getUniqueValue());
    session.addQuery('status', 'IN', 'preheating,cooking,holding');
    session.orderByDesc('sys_created_on');
    session.setLimit(1);
    session.query();
    if (!session.next()) return;
    synchronizeSessionLifecycle(session);
    if (session.getValue('status') === 'completed') return;

    var sessionId = session.getUniqueValue();
    var chamber = status.chamberTemperature;
    var meat = status.meatTemperature;
    var tolerance = numericValue(session, 'chamber_temperature_tolerance_c');
    var maximum = numericValue(session, 'maximum_chamber_temperature_c');
    var target = numericValue(session, 'target_chamber_temperature_c');
    var meatTarget = numericValue(session, 'target_meat_temperature_c');
    var monitorsMeat = session.getValue('monitor_meat_temperature') === '1' || session.getValue('monitor_meat_temperature') === 'true';
    var intendedTarget = target;
    var reason = '';
    var action = 'no_action';

    if (adaptiveTemperatureEnabled(session) && adaptiveOperatingMaximum(session, maximum) === null) {
        forceRelayOffForSafety(device, sessionId, 'Adaptive heating blocked: configure an operating ceiling below the safety cutoff, including relay tolerance.');
        session.setValue('status', 'fault');
        session.update();
        return;
    }

    if (session.getValue('status') === 'holding' && holdDurationExpired(session)) {
        var holdCompleteResult = recordControllerDecision(device, session, 'relay_off', monitorsMeat ? 'Post-target hold duration expired; complete session.' : 'Chamber target hold duration expired; complete session.');
        if (holdCompleteResult.success || holdCompleteResult.dryRun) completeSession(session);
        return;
    }

    if (maximum !== null && chamber >= maximum) {
        forceRelayOffForSafety(device, sessionId, 'Safety stop: chamber temperature is at or above the maximum limit.');
        session.setValue('status', 'fault');
        session.update();
        return;
    }
    if (monitorsMeat && meatTarget !== null && meat >= meatTarget) {
        var postTargetAction = session.getValue('post_target_action') || 'complete_immediately';
        if (postTargetAction === 'complete_immediately') {
            var completionReason = 'Meat target reached: complete immediately.';
            var relayResult = recordControllerDecision(device, session, 'relay_off', completionReason);
            if (relayResult.success || relayResult.dryRun) {
                completeSession(session);
            }
            return;
        }
        enterHolding(session);
        intendedTarget = chamberTargetAfterMeatReached(session, target, maximum);
        persistMeatPriorityTarget(session, device.getUniqueValue(), target, intendedTarget, 'Target-based cooking');
        reason = 'Meat target reached: use post-target holding behavior.';
    } else if (!monitorsMeat && target !== null && chamber >= target - tolerance) {
        var targetHoldMinutes = parseInt(session.getValue('chamber_target_hold_minutes'), 10) || 0;
        if (targetHoldMinutes > 0) {
            enterHolding(session);
            intendedTarget = target;
            reason = 'Chamber target reached: begin configured hold period before completion.';
        } else {
            var chamberCompletion = recordControllerDecision(device, session, 'relay_off', 'Chamber target reached: complete immediately because no hold period is configured.');
            if (chamberCompletion.success || chamberCompletion.dryRun) {
                completeSession(session);
            }
            return;
        }
    }
    if (session.getValue('status') === 'holding' && monitorsMeat) {
        intendedTarget = chamberTargetAfterMeatReached(session, target, maximum);
        persistMeatPriorityTarget(session, device.getUniqueValue(), target, intendedTarget, 'Post-target hold');
    }
    if (session.getValue('status') === 'cooking' && monitorsMeat && meatTarget !== null && meat < meatTarget && intendedTarget !== null) {
        intendedTarget = adaptChamberTarget(session, device.getUniqueValue(), chamber, meat, intendedTarget, maximum, 'Deterministic controller', true);
    }
    if (intendedTarget === null) {
        session.setValue('status', 'fault');
        session.update();
        forceRelayOffForSafety(device, sessionId, 'Control blocked: configure valid chamber targets and an adaptive operating ceiling below the safety cutoff, including relay tolerance.');
        return;
    }
    tolerance = tolerance === null ? 3 : tolerance;
    var anticipationSeconds = parseInt(device.getValue('chamber_anticipation_seconds'), 10) || 0;
    var projectedChamber = projectedChamberTemperature(device.getUniqueValue(), chamber, anticipationSeconds);
    if (projectedChamber < intendedTarget - tolerance) {
        action = 'relay_on';
        reason = reason || 'Chamber is below the lower hysteresis threshold.';
    } else if (projectedChamber >= intendedTarget + tolerance) {
        action = 'relay_off';
        reason = reason || 'Chamber has reached the upper hysteresis threshold.';
    } else {
        reason = reason || 'Chamber is inside the hysteresis band; keep the current relay state.';
    }

    if (!canSwitchRelay(sessionId, action)) {
        recordDryRunDecision(device.getUniqueValue(), sessionId, 'no_action', 'Minimum relay switch interval not reached; keeping the current heater state.');
        return {success: true, dryRun: true, result: 'blocked'};
    }

    return recordControllerDecision(device, session, action, reason);
}

function pollDevice(device) {
    var deviceId = device.getUniqueValue();
    var timeoutSeconds = parseInt(device.getValue('request_timeout_seconds'), 10) || 5;
    var failureCount = parseInt(device.getValue('consecutive_failures'), 10) || 0;
    var offlineAfter = parseInt(device.getValue('offline_after_failures'), 10) || 3;
    var request = new sn_ws.RESTMessageV2('Smoker Controller API', 'getStatus');
    var apiKey = String(device.getElement('api_key').getDecryptedValue() || '').trim();
    request.setStringParameterNoEscape('baseUrl', device.getValue('api_base_url'));
    request.setRequestHeader('X-API-Key', apiKey);
    request.setHttpTimeout(timeoutSeconds * 1000);

    try {
        if (!apiKey || /^[*\u2022]+$/.test(apiKey)) {
            throw new Error('API key is empty or masked; re-enter it on the Smoker Device record');
        }
        var response = request.execute();
        var httpStatus = response.getStatusCode();
        var body = response.getBody();
        if (httpStatus !== 200) {
            throw new Error('HTTP status ' + httpStatus);
        }

        var payload = JSON.parse(body);
        var chamberTemperature = normalizeTemperature(payload.chamber_temp_c);
        var meatTemperature = normalizeTemperature(payload.meat_temp_c);
        var uptime = Number(payload.uptime_seconds);
        if (!isFinite(chamberTemperature) || chamberTemperature < 0 || typeof payload.relay_active !== 'boolean' || !isFinite(uptime)) {
            throw new Error('Invalid status payload');
        }

        var status = {
            chamberTemperature: chamberTemperature,
            meatTemperature: meatTemperature,
            relayActive: payload.relay_active,
        };
        createReading(deviceId, {
            status: 'valid',
            httpStatus: httpStatus,
            chamberTemperature: chamberTemperature,
            meatTemperature: meatTemperature,
            relayState: payload.relay_active,
            uptime: uptime,
        });
        device.setValue('connection_status', 'online');
        device.setValue('consecutive_failures', 0);
        device.setValue('last_successful_contact', new GlideDateTime());
        device.setValue('last_relay_state', payload.relay_active ? 'on' : 'off');
        device.setValue('last_chamber_temperature_c', chamberTemperature);
        device.setValue('last_meat_temperature_c', meatTemperature === null ? '' : meatTemperature);
        device.setValue('device_uptime_seconds', uptime);
        device.setValue('last_error_message', '');
        device.update();
        resolveOfflineAlert(deviceId);
            var aiHandled = evaluateAiPlanController(device, status);
            if (!aiHandled) evaluateDryRunController(device, status);
    } catch (error) {
        failureCount += 1;
        var message = error.message || String(error);
        createReading(deviceId, {
            status: 'error',
            errorMessage: message,
        });
        device.setValue('consecutive_failures', failureCount);
        device.setValue('last_error_message', message);
        device.setValue('connection_status', failureCount >= offlineAfter ? 'offline' : 'error');
        device.update();
        var failSafeSeconds = parseInt(device.getValue('fail_safe_seconds'), 10) || 0;
        var lastContact = device.getValue('last_successful_contact');
        var lastContactAt = lastContact ? new GlideDateTime(lastContact).getNumericValue() : 0;
        var failSafeExpired = failSafeSeconds > 0 && lastContactAt > 0 && (new GlideDateTime().getNumericValue() - lastContactAt) >= failSafeSeconds * 1000;
        if (failSafeExpired && device.getValue('last_relay_state') === 'on') {
            var failSafeResult = forceRelayOffForSafety(device, '', 'Device status polling exceeded the configured fail-safe interval.');
            if (!failSafeResult.success) {
                device.setValue('last_error_message', message + ' Fail-safe relay shutdown failed: ' + failSafeResult.message);
                device.update();
            }
        }
        if (failureCount >= offlineAfter) {
            updateOfflineAlert(deviceId, 'Smoker device has failed ' + failureCount + ' consecutive status polls: ' + message);
        }
        gs.error('Smoker status polling failed for device ' + deviceId + ': ' + message);
    }
}

var devices = new GlideRecord('x_tsigh_smkrctrl_smoker_device');
devices.addQuery('active', true);
devices.addQuery('polling_enabled', true);
devices.query();
while (devices.next()) {
    pollDevice(devices);
}