/* global GlideDateTime, GlideRecord, SmokerCookingQuality, request, response */

var ALLOWED_PHASES = {
    preheating: true,
    smoking: true,
    wrap_checkpoint: true,
    wrapped: true,
    covered_tray: true,
    unwrapped_finishing: true,
    uncovered_crisping: true,
    grilling: true,
    resting: true,
};

var AUTOMATIC_PHASES = {
    preheating: true,
    smoking: true,
    wrapped: true,
    covered_tray: true,
    unwrapped_finishing: true,
    uncovered_crisping: true,
    grilling: true,
};

var V2_PHASE_KINDS = {
    preheating: true,
    smoking: true,
    braise: true,
    roasting: true,
    grilling: true,
    finishing: true,
    resting: true,
    checkpoint: true,
    wrapped: true,
    covered_tray: true,
    unwrapped_finishing: true,
    uncovered_crisping: true,
};
var V2_AUTOMATIC_KINDS = {preheating: true, smoking: true, braise: true, roasting: true, grilling: true, finishing: true, wrapped: true, covered_tray: true, unwrapped_finishing: true, uncovered_crisping: true};
var TECHNIQUE_VESSELS = {none: true, grate: true, metal_tray: true, roasting_pan: true, pot: true, foil: true, butcher_paper: true};
var TECHNIQUE_COVERS = {none: true, foil: true, lid: true, butcher_paper: true};
var MANUAL_ACTIONS = {transfer_to_vessel: true, add_liquid: true, add_sauce: true, cover: true, uncover: true, baste: true, turn: true, reposition_to_grate: true, remove: true, rest: true};
var COOKING_PLAN_SCHEMA_VERSIONS = {1: true, 2: true};

function fail(statusCode, message) {
    response.setStatus(statusCode);
    response.setBody({success: false, message: message});
}

function isNumber(value) {
    return typeof value === 'number' && isFinite(value);
}

function validText(value, maximumLength) {
    return typeof value === 'string' && value.trim() && value.length <= maximumLength;
}

function validateTechnique(phase, index) {
    if (phase.technique !== undefined) {
        if (!phase.technique || typeof phase.technique !== 'object') return 'Phase ' + index + ' technique must be an object';
        if (phase.technique.vessel !== undefined && !TECHNIQUE_VESSELS[phase.technique.vessel]) return 'Phase ' + index + ' has an unsupported vessel';
        if (phase.technique.cover !== undefined && !TECHNIQUE_COVERS[phase.technique.cover]) return 'Phase ' + index + ' has an unsupported cover';
        if (phase.technique.liquid !== undefined && (!phase.technique.liquid || typeof phase.technique.liquid !== 'object')) return 'Phase ' + index + ' liquid must be an object';
        if (phase.technique.liquid) {
            if (!validText(phase.technique.liquid.type, 100)) return 'Phase ' + index + ' liquid type is required';
            if (phase.technique.liquid.amount !== undefined && (!isNumber(phase.technique.liquid.amount) || phase.technique.liquid.amount <= 0 || phase.technique.liquid.amount > 100)) return 'Phase ' + index + ' liquid amount is invalid';
            if (phase.technique.liquid.unit !== undefined && !validText(phase.technique.liquid.unit, 20)) return 'Phase ' + index + ' liquid unit is invalid';
            if (phase.technique.liquid.placement !== undefined && !validText(phase.technique.liquid.placement, 50)) return 'Phase ' + index + ' liquid placement is invalid';
        }
        if (phase.technique.sauce !== undefined && !validText(phase.technique.sauce, 100)) return 'Phase ' + index + ' sauce is invalid';
    }
    if (phase.manual_actions !== undefined) {
        if (!Array.isArray(phase.manual_actions) || phase.manual_actions.length > 8) return 'Phase ' + index + ' manual_actions must contain at most 8 items';
        if (phase.mode !== 'manual') return 'Phase ' + index + ' manual_actions require a manual phase';
        for (var actionIndex = 0; actionIndex < phase.manual_actions.length; actionIndex += 1) {
            var action = phase.manual_actions[actionIndex];
            if (!action || !MANUAL_ACTIONS[action.action]) return 'Phase ' + index + ' has an unsupported manual action';
            if (action.vessel !== undefined && !TECHNIQUE_VESSELS[action.vessel]) return 'Phase ' + index + ' manual action vessel is unsupported';
            if (action.cover_type !== undefined && !TECHNIQUE_COVERS[action.cover_type]) return 'Phase ' + index + ' manual action cover is unsupported';
            if (action.action === 'transfer_to_vessel' && !action.vessel) return 'Phase ' + index + ' transfer_to_vessel requires a vessel';
            if (action.action === 'add_liquid' && (!validText(action.liquid_type, 100) || !validText(action.unit, 20) || !validText(action.placement, 50) || !isNumber(action.amount) || action.amount <= 0 || action.amount > 100)) return 'Phase ' + index + ' add_liquid requires liquid type, amount, unit, and placement';
            if (action.action === 'add_sauce' && (!validText(action.sauce, 100) || !validText(action.placement, 50))) return 'Phase ' + index + ' add_sauce requires sauce and placement';
            if (action.action === 'cover' && !action.cover_type) return 'Phase ' + index + ' cover requires a cover type';
            var textFields = ['liquid_type', 'sauce', 'placement', 'instruction'];
            for (var fieldIndex = 0; fieldIndex < textFields.length; fieldIndex += 1) {
                var field = textFields[fieldIndex];
                if (action[field] !== undefined && !validText(action[field], 200)) return 'Phase ' + index + ' manual action ' + field + ' is invalid';
            }
            if (action.amount !== undefined && (!isNumber(action.amount) || action.amount <= 0 || action.amount > 100)) return 'Phase ' + index + ' manual action amount is invalid';
            if (action.optional !== undefined && typeof action.optional !== 'boolean') return 'Phase ' + index + ' manual action optional must be boolean';
        }
    }
    return null;
}

function validatePhase(phase, index, previousName, schemaVersion, phaseIds) {
    if (!phase || typeof phase !== 'object') return 'Phase ' + index + ' must be an object';
    if (schemaVersion === 1 && (typeof phase.name !== 'string' || !ALLOWED_PHASES[phase.name])) return 'Phase ' + index + ' has an unsupported name';
    if (schemaVersion === 2) {
        if (!validText(phase.id, 80) || phaseIds[phase.id]) return 'Phase ' + index + ' must have a unique id';
        if (typeof phase.kind !== 'string' || !V2_PHASE_KINDS[phase.kind]) return 'Phase ' + index + ' has an unsupported kind';
        if (!validText(phase.name, 100)) return 'Phase ' + index + ' requires a name';
        phaseIds[phase.id] = true;
    }
    if (phase.name === previousName && schemaVersion === 1) return 'Phase ' + index + ' repeats the previous phase';
    if (phase.mode !== 'automatic' && phase.mode !== 'manual') return 'Phase ' + index + ' must declare automatic or manual mode';
    if (phase.mode === 'manual' && (typeof phase.message !== 'string' || !phase.message.trim())) return 'Manual phase ' + index + ' requires a message';
    if (phase.mode === 'automatic' && !(schemaVersion === 1 ? AUTOMATIC_PHASES[phase.name] : V2_AUTOMATIC_KINDS[phase.kind])) return 'Phase ' + index + ' cannot be automatic';
    if (phase.mode === 'automatic' && phase.chamber_target_c === undefined) return 'Automatic phase ' + index + ' requires a chamber target';
    if (phase.mode === 'automatic' && ['temperature', 'duration', 'temperature_and_time'].indexOf(phase.completion_rule) === -1) return 'Automatic phase ' + index + ' requires a temperature, duration, or temperature_and_time completion rule';
    if (phase.mode === 'manual' && phase.completion_rule !== 'manual') return 'Manual phase ' + index + ' requires a manual completion rule';
    if (phase.chamber_target_c !== undefined && (!isNumber(phase.chamber_target_c) || phase.chamber_target_c < 0 || phase.chamber_target_c > 350)) return 'Phase ' + index + ' has an unsafe chamber target';
    if (phase.meat_target_c !== undefined && (!isNumber(phase.meat_target_c) || phase.meat_target_c < 0 || phase.meat_target_c > 100)) return 'Phase ' + index + ' has an invalid meat target';
    if (phase.max_duration_minutes !== undefined && (!isNumber(phase.max_duration_minutes) || phase.max_duration_minutes <= 0 || phase.max_duration_minutes > 1440)) return 'Phase ' + index + ' has an invalid maximum duration';
    if (phase.message !== undefined && (typeof phase.message !== 'string' || phase.message.length > 1000)) return 'Phase ' + index + ' has an invalid message';
    if (phase.completion_rule !== undefined && ['temperature', 'duration', 'temperature_and_time', 'manual'].indexOf(phase.completion_rule) === -1) return 'Phase ' + index + ' has an unsupported completion rule';
    var techniqueError = validateTechnique(phase, index);
    if (techniqueError) return techniqueError;
    return null;
}

function validatePlan(plan, minimumMeat) {
    if (!plan || typeof plan !== 'object') return 'plan must be an object';
    if (!COOKING_PLAN_SCHEMA_VERSIONS[plan.schema_version]) return 'plan.schema_version must be 1 or 2';
    if (typeof plan.dish !== 'string' || !plan.dish.trim()) return 'plan.dish is required';
    if (plan.schema_version === 2 && (!plan.safety || typeof plan.safety !== 'object' || !isNumber(plan.safety.minimum_meat_temperature_c) || plan.safety.minimum_meat_temperature_c < minimumMeat)) return 'A schema v2 plan must declare a safe minimum meat temperature at or above the configured minimum';
    if (plan.meat_weight_kg !== undefined && (!isNumber(plan.meat_weight_kg) || plan.meat_weight_kg <= 0 || plan.meat_weight_kg > 100)) return 'plan.meat_weight_kg must be between 0 and 100';
    if (plan.recommendations !== undefined && (!Array.isArray(plan.recommendations) || plan.recommendations.length > 12)) return 'plan.recommendations must contain at most 12 items';
    if (Array.isArray(plan.recommendations)) {
        for (var recommendationIndex = 0; recommendationIndex < plan.recommendations.length; recommendationIndex += 1) {
            if (typeof plan.recommendations[recommendationIndex] !== 'string' || plan.recommendations[recommendationIndex].length > 1000) return 'Recommendation ' + recommendationIndex + ' is invalid';
        }
    }
    if (plan.estimated_duration_minutes !== undefined && (!isNumber(plan.estimated_duration_minutes) || plan.estimated_duration_minutes <= 0 || plan.estimated_duration_minutes > 2880)) return 'plan.estimated_duration_minutes is invalid';
    if (plan.safety !== undefined) {
        if (!plan.safety || typeof plan.safety !== 'object') return 'plan.safety must be an object';
        if (plan.safety.minimum_meat_temperature_c !== undefined && (!isNumber(plan.safety.minimum_meat_temperature_c) || plan.safety.minimum_meat_temperature_c < 0 || plan.safety.minimum_meat_temperature_c > 100)) return 'plan.safety.minimum_meat_temperature_c is invalid';
        if (plan.safety.maximum_chamber_temperature_c !== undefined && (!isNumber(plan.safety.maximum_chamber_temperature_c) || plan.safety.maximum_chamber_temperature_c < 0 || plan.safety.maximum_chamber_temperature_c > 350)) return 'plan.safety.maximum_chamber_temperature_c is invalid';
    }
    if (!Array.isArray(plan.phases) || plan.phases.length === 0 || plan.phases.length > 12) return 'plan.phases must contain between 1 and 12 phases';
    var previousName = '';
    var phaseIds = {};
    for (var index = 0; index < plan.phases.length; index += 1) {
        var error = validatePhase(plan.phases[index], index, previousName, plan.schema_version, phaseIds);
        if (error) return error;
        previousName = plan.phases[index].name;
    }
    var qualityError = new SmokerCookingQuality().validate(plan);
    if (qualityError) return qualityError;
    var requiredMeatTarget = Math.max(minimumMeat, plan.safety && isNumber(plan.safety.minimum_meat_temperature_c) ? plan.safety.minimum_meat_temperature_c : 0);
    for (var targetIndex = 0; targetIndex < plan.phases.length; targetIndex += 1) {
        var phaseMeatTarget = plan.phases[targetIndex].meat_target_c;
        if (isNumber(phaseMeatTarget) && phaseMeatTarget > requiredMeatTarget) requiredMeatTarget = phaseMeatTarget;
    }
    if (plan.schema_version === 2) {
        var hasSafeMeatCheck = false;
        for (var checkIndex = 0; checkIndex < plan.phases.length; checkIndex += 1) {
            var checkPhase = plan.phases[checkIndex];
            if (checkPhase.mode === 'automatic' && ['temperature', 'temperature_and_time'].indexOf(checkPhase.completion_rule) !== -1 && isNumber(checkPhase.meat_target_c) && checkPhase.meat_target_c >= requiredMeatTarget) {
                hasSafeMeatCheck = true;
                break;
            }
        }
        if (!hasSafeMeatCheck) return 'A schema v2 plan must include an automatic meat-temperature check at or above its declared safe target';
    }
    var finalPhase = plan.phases[plan.phases.length - 1];
    if (finalPhase.kind === 'resting' || String(finalPhase.name).toLowerCase() === 'resting') {
        var donenessPhase = plan.phases[plan.phases.length - (plan.quality ? 3 : 2)];
        var minimumFinalMeat = Math.max(minimumMeat, plan.schema_version === 2 ? requiredMeatTarget : 0);
        if (!donenessPhase || donenessPhase.mode !== 'automatic' || ['temperature', 'temperature_and_time'].indexOf(donenessPhase.completion_rule) === -1 || !isNumber(donenessPhase.meat_target_c) || donenessPhase.meat_target_c < minimumFinalMeat) return 'The plan must verify the final meat temperature before resting';
    }
    return null;
}

(function process(request, response) {
    var body;
    try {
        body = JSON.parse(request.body.dataString || '{}');
    } catch (error) {
        fail(400, 'Request body must contain valid JSON');
        return;
    }

    var action = String(body.action || 'save');
    var sessionId = String(body.sessionId || '');
    var provider = String(body.provider || '');
    var plan = body.plan;
    if (!sessionId || ['save', 'approve', 'restart', 'clear'].indexOf(action) === -1) {
        fail(400, 'sessionId and a supported action are required');
        return;
    }

    var session = new GlideRecord('x_tsigh_smkrctrl_cooking_session');
    if (!session.get(sessionId)) {
        fail(404, 'Cooking session not found');
        return;
    }
    if (action === 'clear') {
        if (['planned', 'stopped', 'fault'].indexOf(session.getValue('status')) === -1) {
            fail(409, 'Stop the cooking session before clearing its AI plan');
            return;
        }
        session.setValue('ai_plan_status', 'none');
        session.setValue('ai_plan_json', '');
        session.setValue('ai_plan_version', 0);
        session.setValue('ai_phase_index', 0);
        session.setValue('ai_phase_started_at', '');
        session.setValue('ai_quality_retry', false);
        session.setValue('ai_current_phase', '');
        session.setValue('ai_manual_action_required', false);
        session.setValue('ai_manual_action_message', '');
        session.setValue('ai_plan_generated_at', '');
        session.setValue('ai_plan_approved_at', '');
        session.setValue('ai_control_enabled', false);
        session.update();
        response.setStatus(200);
        response.setBody({success: true, status: 'none'});
        return;
    }
    if (['planned', 'preheating'].indexOf(session.getValue('status')) === -1) {
        fail(409, 'An AI plan can only be created for a planned or preheating session');
        return;
    }

    if (action === 'approve') {
        if (session.getValue('ai_plan_status') !== 'draft' || !session.getValue('ai_plan_json')) {
            fail(409, 'Only a saved draft AI plan can be approved');
            return;
        }
        session.setValue('ai_plan_status', 'approved');
        session.setValue('ai_plan_approved_at', new GlideDateTime());
        session.update();
        response.setStatus(200);
        response.setBody({success: true, status: 'approved', version: session.getValue('ai_plan_version')});
        return;
    }

    if (action === 'restart') {
        if (session.getValue('status') !== 'planned' || ['completed', 'stopped', 'rejected'].indexOf(session.getValue('ai_plan_status')) === -1 || !session.getValue('ai_plan_json')) {
            fail(409, 'Only a completed, stopped, or rejected plan can be reapproved for a planned session');
            return;
        }
        var restartPlan;
        try {
            restartPlan = JSON.parse(session.getValue('ai_plan_json'));
        } catch (error) {
            fail(422, 'The saved AI cooking plan is invalid');
            return;
        }
        if (!restartPlan.phases || !restartPlan.phases.length) {
            fail(422, 'The saved AI cooking plan has no phases');
            return;
        }
        session.setValue('ai_plan_status', 'approved');
        session.setValue('ai_phase_index', 0);
        session.setValue('ai_phase_started_at', '');
        session.setValue('ai_current_phase', restartPlan.phases[0].name);
        session.setValue('ai_manual_action_required', false);
        session.setValue('ai_manual_action_message', '');
        session.setValue('ai_plan_approved_at', new GlideDateTime());
        session.update();
        response.setStatus(200);
        response.setBody({success: true, status: 'approved', version: session.getValue('ai_plan_version')});
        return;
    }

    if (['manual', 'now_assist', 'external_llm'].indexOf(provider) === -1) {
        fail(400, 'A supported provider is required when saving a plan');
        return;
    }
    var maximumChamber = Number(session.getValue('maximum_chamber_temperature_c'));
    var minimumMeat = Math.max(74, Number(session.getValue('target_meat_temperature_c')) || 0);
    var validationError = validatePlan(plan, minimumMeat);
    if (!validationError && plan.quality) validationError = new SmokerCookingQuality().validateLimits(plan, session);
    if (validationError) {
        fail(422, validationError);
        return;
    }
    for (var phaseIndex = 0; phaseIndex < plan.phases.length; phaseIndex += 1) {
        if (isFinite(maximumChamber) && plan.phases[phaseIndex].chamber_target_c !== undefined && plan.phases[phaseIndex].chamber_target_c > maximumChamber) {
            fail(422, 'Phase ' + phaseIndex + ' exceeds the session maximum chamber temperature');
            return;
        }
        if (plan.phases[phaseIndex].meat_target_c !== undefined && plan.phases[phaseIndex].meat_target_c < minimumMeat) {
            fail(422, 'Phase ' + phaseIndex + ' has a meat target below the configured minimum');
            return;
        }
    }

    session.setValue('ai_provider', provider);
    session.setValue('ai_plan_status', 'draft');
    session.setValue('ai_plan_json', JSON.stringify(plan));
    session.setValue('ai_quality_retry', false);
    session.setValue('ai_plan_version', (parseInt(session.getValue('ai_plan_version'), 10) || 0) + 1);
    session.setValue('ai_current_phase', plan.phases[0].name);
    session.setValue('ai_manual_action_required', plan.phases[0].mode === 'manual');
    session.setValue('ai_manual_action_message', plan.phases[0].message || '');
    session.setValue('ai_plan_generated_at', new GlideDateTime());
    session.update();

    response.setStatus(200);
    response.setBody({success: true, status: 'draft', provider: provider, version: session.getValue('ai_plan_version')});
})(request, response);