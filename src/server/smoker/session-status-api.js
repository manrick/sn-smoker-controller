/* global GlideDateTime, GlideRecord, SmokerCookingQuality, SmokerRelayControl, request, response */

(function process(request, response) {
    var body = request.body.dataString || '{}';
    var payload = JSON.parse(body);
    var sessionId = String(payload.sessionId || '');
    var action = String(payload.action || '');
    var session = new GlideRecord('x_tsigh_smkrctrl_cooking_session');

    if (!sessionId || !action) {
        response.setStatus(400);
        response.setBody({success: false, message: 'A sessionId and action are required'});
        return;
    }
    if (!session.get(sessionId)) {
        response.setStatus(404);
        response.setBody({success: false, message: 'Cooking session not found'});
        return;
    }

    function heatingReadiness(phase) {
        var maximum = parseFloat(session.getValue('maximum_chamber_temperature_c'));
        var target = phase.chamber_target_c;
        if (!isFinite(maximum) || maximum <= 0 || typeof target !== 'number' || !isFinite(target) || target <= 0 || target >= maximum ||
            (phase.meat_target_c !== undefined && (typeof phase.meat_target_c !== 'number' || !isFinite(phase.meat_target_c)))) {
            return 'Configure a valid safety cutoff above the saved phase chamber target and review the phase temperatures';
        }
        var device = new GlideRecord('x_tsigh_smkrctrl_smoker_device');
        if (!session.getValue('smoker_device') || !device.get(session.getValue('smoker_device')) ||
            (device.getValue('active') !== '1' && device.getValue('active') !== 'true') ||
            (device.getValue('polling_enabled') !== '1' && device.getValue('polling_enabled') !== 'true') ||
            device.getValue('connection_status') !== 'online') return 'Continuing cooking requires an active, online smoker with polling enabled';
        var contact = device.getValue('last_successful_contact');
        var age = contact ? new GlideDateTime().getNumericValue() - new GlideDateTime(contact).getNumericValue() : NaN;
        var chamber = parseFloat(device.getValue('last_chamber_temperature_c'));
        var meat = parseFloat(device.getValue('last_meat_temperature_c'));
        if (!isFinite(age) || age < 0 || age > 60000 || !isFinite(chamber) || (phase.meat_target_c !== undefined && !isFinite(meat))) return 'Wait for fresh, valid smoker temperature readings before continuing cooking';
        if (chamber >= maximum) return 'The chamber is still at or above the safety cutoff; heating cannot resume';
        if (session.getValue('control_mode') === 'automatic' && session.getValue('automatic_control_enabled') !== '1' && session.getValue('automatic_control_enabled') !== 'true') return 'Automatic control mode requires Automatic Control Enabled';
        return null;
    }

    if (action === 'start' || action === 'resume') {
        var resuming = action === 'resume';
        var resumePhase;
        if (resuming) {
            if (['fault', 'cooking', 'preheating', 'holding'].indexOf(session.getValue('status')) === -1 ||
                session.getValue('ai_plan_status') !== 'paused' ||
                (session.getValue('ai_control_enabled') !== '1' && session.getValue('ai_control_enabled') !== 'true')) {
                response.setStatus(409);
                response.setBody({success: false, message: 'Only a paused AI plan in an active or faulted session can be resumed'});
                return;
            }
            var resumePlan;
            try {
                resumePlan = JSON.parse(session.getValue('ai_plan_json') || '{}');
            } catch (error) {
                response.setStatus(422);
                response.setBody({success: false, message: 'The saved AI cooking plan is invalid'});
                return;
            }
            var indexValue = session.getValue('ai_phase_index');
            var resumeIndex = Number(indexValue);
            resumePhase = resumePlan && Array.isArray(resumePlan.phases) && indexValue !== '' && indexValue !== null &&
                isFinite(resumeIndex) && resumeIndex >= 0 && Math.floor(resumeIndex) === resumeIndex
                ? resumePlan.phases[resumeIndex] : null;
            if (!resumePhase || !resumePhase.name || ['automatic', 'manual'].indexOf(resumePhase.mode) === -1) {
                response.setStatus(422);
                response.setBody({success: false, message: 'The saved AI phase is invalid; review the cooking plan'});
                return;
            }
            if (resumePhase.mode === 'manual' || session.getValue('ai_manual_action_required') === '1' || session.getValue('ai_manual_action_required') === 'true') {
                response.setStatus(409);
                response.setBody({success: false, message: 'Use Continue at the manual checkpoint instead of Resume AI cooking'});
                return;
            }
            if (['temperature', 'duration', 'temperature_and_time'].indexOf(resumePhase.completion_rule) === -1 ||
                (resumePhase.completion_rule === 'duration' && (!isFinite(Number(resumePhase.max_duration_minutes)) || Number(resumePhase.max_duration_minutes) <= 0))) {
                response.setStatus(422);
                response.setBody({success: false, message: 'The saved AI phase has an invalid completion rule'});
                return;
            }
            var resumeError = heatingReadiness(resumePhase);
            if (resumeError) {
                response.setStatus(409);
                response.setBody({success: false, message: resumeError});
                return;
            }
        }
        if (!resuming && session.getValue('status') !== 'planned') {
            response.setStatus(409);
            response.setBody({success: false, message: 'Only a planned session can be started'});
            return;
        }
        if (!resuming && (session.getValue('ai_control_enabled') === '1' || session.getValue('ai_control_enabled') === 'true') && session.getValue('ai_plan_status') !== 'approved') {
            response.setStatus(409);
            response.setBody({success: false, message: 'An approved AI cooking plan is required before starting AI control'});
            return;
        }
        if (session.getValue('control_mode') === 'automatic' && session.getValue('automatic_control_enabled') !== '1' && session.getValue('automatic_control_enabled') !== 'true') {
            response.setStatus(409);
            response.setBody({success: false, message: 'Automatic control mode requires Automatic Control Enabled'});
            return;
        }
        var qualityPlan = resuming ? resumePlan : null;
        if (!resuming && (session.getValue('ai_control_enabled') === '1' || session.getValue('ai_control_enabled') === 'true')) {
            try { qualityPlan = JSON.parse(session.getValue('ai_plan_json') || '{}'); } catch (error) {
                response.setStatus(422);
                response.setBody({success: false, message: 'The saved AI cooking plan is invalid'});
                return;
            }
        }
        if (qualityPlan) {
            var qualityValidator = new SmokerCookingQuality();
            var qualityError = qualityValidator.validate(qualityPlan) || qualityValidator.validateLimits(qualityPlan, session);
            if (qualityError) {
                response.setStatus(409);
                response.setBody({success: false, message: qualityError});
                return;
            }
        }
        var adaptiveEnabled = session.getValue('adaptive_temperature_enabled') === '1' || session.getValue('adaptive_temperature_enabled') === 'true';
        if (adaptiveEnabled) {
            var monitorsMeat = session.getValue('monitor_meat_temperature') === '1' || session.getValue('monitor_meat_temperature') === 'true';
            var baseTarget = parseFloat(session.getValue('target_chamber_temperature_c'));
            if (resuming) baseTarget = resumePhase.chamber_target_c;
            var minimumTarget = parseFloat(session.getValue('adaptive_minimum_chamber_temperature_c'));
            var maximumTarget = parseFloat(session.getValue('maximum_chamber_temperature_c'));
            var operatingMaximum = parseFloat(session.getValue('adaptive_maximum_chamber_temperature_c'));
            var toleranceValue = session.getValue('chamber_temperature_tolerance_c');
            var tolerance = toleranceValue === null || toleranceValue === '' ? 3 : Number(toleranceValue);
            if (!isFinite(operatingMaximum) || operatingMaximum <= 0 || !isFinite(tolerance) || tolerance < 0 ||
                !isFinite(maximumTarget) || operatingMaximum + tolerance >= maximumTarget ||
                (isFinite(minimumTarget) && (minimumTarget < 0 || minimumTarget > operatingMaximum))) {
                response.setStatus(409);
                response.setBody({success: false, message: 'Configure an adaptive operating ceiling below the safety cutoff with room for the relay tolerance, and a minimum no higher than that ceiling'});
                return;
            }
            if (!monitorsMeat || !isFinite(baseTarget) || !isFinite(maximumTarget) || maximumTarget <= 0) {
                response.setStatus(409);
                response.setBody({success: false, message: 'Adaptive temperature control requires meat monitoring, a chamber target, and a maximum chamber temperature'});
                return;
            }
            if (!resuming && (session.getValue('ai_control_enabled') === '1' || session.getValue('ai_control_enabled') === 'true')) {
                try {
                    var adaptivePlan = JSON.parse(session.getValue('ai_plan_json') || '{}');
                    var firstPhase = adaptivePlan.phases && adaptivePlan.phases[0];
                    if (firstPhase && isFinite(Number(firstPhase.chamber_target_c))) baseTarget = Number(firstPhase.chamber_target_c);
                } catch (error) {
                    // AI plan approval is validated separately before the session can start.
                }
            }
            session.setValue('adaptive_current_chamber_target_c', Math.min(operatingMaximum, Math.max(baseTarget, isFinite(minimumTarget) ? minimumTarget : baseTarget)));
            if (qualityPlan && qualityPlan.quality) {
                var recipeBase = resuming ? resumePhase.chamber_target_c : qualityPlan.phases[0].chamber_target_c;
                if (recipeBase === undefined) recipeBase = baseTarget;
                if (resuming && (session.getValue('ai_quality_retry') === '1' || session.getValue('ai_quality_retry') === 'true')) recipeBase = qualityPlan.quality.recheck_chamber_c;
                session.setValue('adaptive_current_chamber_target_c', Math.min(qualityPlan.quality.adaptive_ceiling_c, operatingMaximum, recipeBase));
            }
            session.setValue('adaptive_last_adjusted_at', '');
        }
        session.setValue('status', 'cooking');
        if (resuming) {
            session.setValue('ai_plan_status', 'active');
            session.setValue('ai_current_phase', resumePhase.name);
            session.setValue('ai_phase_started_at', new GlideDateTime());
            session.setValue('ai_manual_action_required', false);
            session.setValue('ai_manual_action_message', '');
        } else if (session.getValue('ai_control_enabled') === '1' || session.getValue('ai_control_enabled') === 'true') {
            session.setValue('ai_quality_retry', false);
            var plan;
            try { plan = JSON.parse(session.getValue('ai_plan_json') || '{}'); } catch (error) { plan = null; }
            if (plan && Array.isArray(plan.phases) && plan.phases.length) {
                session.setValue('ai_plan_status', plan.phases[0].mode === 'manual' ? 'paused' : 'active');
                session.setValue('ai_phase_index', 0);
                session.setValue('ai_current_phase', plan.phases[0].name);
                session.setValue('ai_phase_started_at', new GlideDateTime());
                session.setValue('ai_manual_action_required', plan.phases[0].mode === 'manual');
                session.setValue('ai_manual_action_message', plan.phases[0].message || '');
            }
        }
        if (!session.getValue('started_at')) session.setValue('started_at', new GlideDateTime());
        session.update();
        response.setStatus(200);
        response.setBody({success: true, status: 'cooking'});
        return;
    }

    if (action === 'checkpoint') {
        var decision = String(payload.decision || '');
        if (['continue', 'skip', 'stop', 'repeat'].indexOf(decision) === -1) {
            response.setStatus(400);
            response.setBody({success: false, message: 'A checkpoint decision must be continue, skip, or stop'});
            return;
        }
        if (session.getValue('ai_plan_status') !== 'paused' ||
            (session.getValue('ai_manual_action_required') !== '1' && session.getValue('ai_manual_action_required') !== 'true') ||
            ['cooking', 'preheating', 'holding'].indexOf(session.getValue('status')) === -1) {
            response.setStatus(409);
            response.setBody({success: false, message: 'This session is not waiting for an AI manual checkpoint'});
            return;
        }
        if (decision === 'stop') {
            var stopDeviceId = session.getValue('smoker_device');
            var stopResult = stopDeviceId
                ? new SmokerRelayControl().setRelay(stopDeviceId, false, sessionId, 'manual_user', 'AI manual checkpoint stopped the cooking session.')
                : {success: false, message: 'The cooking session has no smoker device.'};
            if (!stopResult.success) {
                session.setValue('status', 'fault');
                session.setValue('ai_plan_status', 'rejected');
                session.setValue('ai_manual_action_required', false);
                session.update();
                response.setStatus(409);
                response.setBody({success: false, status: 'fault', message: 'The smoker could not be turned off: ' + stopResult.message});
                return;
            }
            session.setValue('status', 'stopped');
            session.setValue('ai_plan_status', 'rejected');
            session.setValue('ai_manual_action_required', false);
            session.update();
            response.setStatus(200);
            response.setBody({success: true, status: 'stopped'});
            return;
        }
        var checkpointPlan;
        try { checkpointPlan = JSON.parse(session.getValue('ai_plan_json') || '{}'); } catch (error) { checkpointPlan = null; }
        var checkpointIndex = Number(session.getValue('ai_phase_index'));
        var checkpointValidator = new SmokerCookingQuality();
        var checkpointError = checkpointValidator.validate(checkpointPlan);
        var checkpointPhase = checkpointPlan && checkpointPlan.phases && checkpointPlan.phases[checkpointIndex];
        if (checkpointError || !checkpointPhase || checkpointPhase.mode !== 'manual') {
            response.setStatus(422);
            response.setBody({success: false, message: checkpointError || 'The saved manual checkpoint is invalid'});
            return;
        }
        if (decision === 'repeat' && checkpointPhase.checkpoint !== 'tenderness') {
            response.setStatus(409);
            response.setBody({success: false, message: 'Additional cooking is only available at a tenderness checkpoint'});
            return;
        }
        if (decision === 'skip' && (checkpointPhase.checkpoint === 'tenderness' || checkpointPhase.minimum_duration_minutes || (checkpointPlan.quality && checkpointPhase.optional !== true))) {
            response.setStatus(409);
            response.setBody({success: false, message: 'This recipe checkpoint cannot be skipped'});
            return;
        }
        if (decision === 'repeat') {
            var retryPhase = checkpointPlan.phases[checkpointIndex - 1];
            var retryError = checkpointValidator.validateLimits(checkpointPlan, session) || heatingReadiness(retryPhase);
            if (retryError) {
                response.setStatus(409);
                response.setBody({success: false, message: retryError});
                return;
            }
            session.setValue('ai_phase_index', checkpointIndex - 1);
            session.setValue('ai_current_phase', retryPhase.name);
            session.setValue('ai_phase_started_at', new GlideDateTime());
            session.setValue('ai_plan_status', 'active');
            session.setValue('ai_manual_action_required', false);
            session.setValue('ai_manual_action_message', '');
            session.setValue('ai_quality_retry', true);
            session.setValue('adaptive_current_chamber_target_c', Math.min(checkpointPlan.quality.adaptive_ceiling_c, checkpointPlan.quality.recheck_chamber_c));
            session.setValue('adaptive_last_adjusted_at', new GlideDateTime());
            session.update();
            response.setStatus(200);
            response.setBody({success: true, status: 'active', phase: retryPhase.name});
            return;
        }
        if (checkpointPhase.minimum_duration_minutes) {
            var checkpointStart = session.getValue('ai_phase_started_at');
            var checkpointElapsed = checkpointStart ? (new GlideDateTime().getNumericValue() - new GlideDateTime(checkpointStart).getNumericValue()) / 60000 : NaN;
            if (!isFinite(checkpointElapsed) || checkpointElapsed < checkpointPhase.minimum_duration_minutes) {
                response.setStatus(409);
                response.setBody({success: false, message: 'The recipe resting or checkpoint time has not elapsed yet'});
                return;
            }
        }
        var nextIndex = checkpointIndex + 1;
        if (!checkpointPlan.phases[nextIndex]) {
            session.setValue('status', 'completed');
            session.setValue('ai_plan_status', 'completed');
            session.setValue('ai_manual_action_required', false);
            session.setValue('completed_at', new GlideDateTime());
            session.update();
            response.setStatus(200);
            response.setBody({success: true, status: 'completed'});
            return;
        }
        var nextPhase = checkpointPlan.phases[nextIndex];
        session.setValue('ai_phase_index', nextIndex);
        session.setValue('ai_current_phase', nextPhase.name);
        session.setValue('ai_phase_started_at', new GlideDateTime());
        session.setValue('ai_quality_retry', false);
        if (checkpointPlan.quality && nextPhase.mode === 'automatic') {
            session.setValue('adaptive_current_chamber_target_c', Math.min(nextPhase.chamber_target_c, checkpointPlan.quality.adaptive_ceiling_c));
            session.setValue('adaptive_last_adjusted_at', new GlideDateTime());
        }
        session.setValue('ai_plan_status', nextPhase.mode === 'manual' ? 'paused' : 'active');
        session.setValue('ai_manual_action_required', nextPhase.mode === 'manual');
        session.setValue('ai_manual_action_message', nextPhase.message || '');
        session.update();
        response.setStatus(200);
        response.setBody({success: true, status: session.getValue('ai_plan_status'), phase: nextPhase.name});
        return;
    }

    if (action === 'finish') {
        if (['cooking', 'preheating', 'holding'].indexOf(session.getValue('status')) === -1) {
            response.setStatus(409);
            response.setBody({success: false, message: 'Only an active session can be finished'});
            return;
        }
        var deviceId = session.getValue('smoker_device');
        var finishResult = deviceId
            ? new SmokerRelayControl().setRelay(deviceId, false, sessionId, 'manual_user', 'Cooking finished manually.')
            : {success: false, message: 'The cooking session has no smoker device.'};
        if (!finishResult.success) {
            session.setValue('status', 'fault');
            session.setValue('ai_plan_status', 'rejected');
            session.setValue('ai_manual_action_required', false);
            session.update();
            response.setStatus(409);
            response.setBody({success: false, status: 'fault', message: 'The smoker could not be turned off: ' + finishResult.message});
            return;
        }
        var finishPlan;
        try {
            finishPlan = JSON.parse(session.getValue('ai_plan_json') || '{}');
        } catch (error) {
            session.setValue('status', 'fault');
            session.update();
            response.setStatus(422);
            response.setBody({success: false, message: 'Heating was turned off, but the saved cooking plan is invalid; review the session'});
            return;
        }
        var stoppedEarly = finishPlan && finishPlan.quality;
        session.setValue('status', stoppedEarly ? 'stopped' : 'completed');
        if (stoppedEarly) {
            session.setValue('ai_plan_status', 'rejected');
            session.setValue('ai_manual_action_required', false);
        }
        session.update();
        response.setStatus(200);
        response.setBody({success: true, status: stoppedEarly ? 'stopped' : 'completed'});
        return;
    }

    response.setStatus(400);
    response.setBody({success: false, message: 'Unsupported action'});
})(request, response);
