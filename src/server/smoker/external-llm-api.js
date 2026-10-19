/* global GlideDateTime, GlideRecord, SmokerCookingQuality, request, response, sn_fd */

var DEFAULT_FLOW_ACTION_NAME = 'x_tsigh_smkrctrl.generate_external_cooking_plan';
var SCHEMA_VERSIONS = {1: true, 2: true};
var ALLOWED_PHASES = {preheating: true, smoking: true, wrap_checkpoint: true, wrapped: true, covered_tray: true, unwrapped_finishing: true, uncovered_crisping: true, grilling: true, resting: true};
var V2_PHASE_KINDS = {preheating: true, smoking: true, braise: true, roasting: true, grilling: true, finishing: true, resting: true, checkpoint: true, wrapped: true, covered_tray: true, unwrapped_finishing: true, uncovered_crisping: true};
var V2_AUTOMATIC_KINDS = {preheating: true, smoking: true, braise: true, roasting: true, grilling: true, finishing: true, wrapped: true, covered_tray: true, unwrapped_finishing: true, uncovered_crisping: true};
var TECHNIQUE_VESSELS = {none: true, grate: true, metal_tray: true, roasting_pan: true, pot: true, foil: true, butcher_paper: true};
var TECHNIQUE_COVERS = {none: true, foil: true, lid: true, butcher_paper: true};
var MANUAL_ACTIONS = {transfer_to_vessel: true, add_liquid: true, add_sauce: true, cover: true, uncover: true, baste: true, turn: true, reposition_to_grate: true, remove: true, rest: true};

function fail(statusCode, message) {
    response.setStatus(statusCode);
    response.setBody({success: false, message: message});
}

function getConfiguration() {
    var configuration = {
        flowActionName: DEFAULT_FLOW_ACTION_NAME,
        model: 'configured-model',
        requestTimeoutSeconds: 60,
        maximumChamber: 250,
        minimumMeat: 74,
    };
    var record = new GlideRecord('x_tsigh_smkrctrl_ai_configuration');
    record.addQuery('active', true);
    record.orderBy('name');
    record.setLimit(1);
    record.query();
    if (!record.next()) return configuration;
    configuration.flowActionName = String(record.getValue('flow_action_name') || configuration.flowActionName);
    configuration.model = String(record.getValue('external_model') || configuration.model);
    var configuredRequestTimeout = Number(record.getValue('request_timeout_seconds'));
    if (isFinite(configuredRequestTimeout) && configuredRequestTimeout > 0) {
        configuration.requestTimeoutSeconds = Math.max(60, configuredRequestTimeout);
    }
    configuration.maximumChamber = Number(record.getValue('maximum_chamber_temperature_c')) || configuration.maximumChamber;
    configuration.minimumMeat = Math.max(74, Number(record.getValue('minimum_meat_temperature_c')) || configuration.minimumMeat);
    return configuration;
}

function validNumber(value) {
    return typeof value === 'number' && isFinite(value);
}

function validText(value, maximumLength) {
    return typeof value === 'string' && value.trim() && value.length <= maximumLength;
}

function normalizeVessel(value) {
    var vessel = String(value || '').trim().toLowerCase().replace(/[\s-]+/g, '_');
    var aliases = {
        aluminum_tray: 'metal_tray',
        aluminium_tray: 'metal_tray',
        disposable_aluminum_tray: 'metal_tray',
        disposable_aluminium_tray: 'metal_tray',
        metal_baking_tray: 'metal_tray',
    };
    return aliases[vessel] || vessel;
}

function normalizeLegacyManualActions(sourcePhase, manualPhase) {
    if (!manualPhase) return;
    var actions = Array.isArray(manualPhase.manual_actions) ? manualPhase.manual_actions.slice() : [];
    var transfer = sourcePhase.transfer_to_vessel;
    if (transfer && typeof transfer === 'object') actions.push({action: 'transfer_to_vessel', vessel: normalizeVessel(transfer.vessel)});
    var liquid = sourcePhase.add_liquid;
    if (liquid && typeof liquid === 'object') {
        var liquidAmount = Number(liquid.amount);
        var liquidUnit = String(liquid.unit || '');
        if (liquidUnit.toLowerCase() === 'ml' && liquidAmount > 100) {
            liquidAmount /= 1000;
            liquidUnit = 'l';
        }
        actions.push({
            action: 'add_liquid',
            liquid_type: liquid.liquid_type,
            amount: liquidAmount,
            unit: liquidUnit,
            placement: liquid.placement,
        });
    }
    var sauce = sourcePhase.add_sauce;
    if (sauce && typeof sauce === 'object') {
        var sauceAction = {action: 'add_sauce', sauce: sauce.sauce, placement: sauce.placement};
        if (sauce.amount !== undefined) sauceAction.amount = Number(sauce.amount);
        if (sauce.unit !== undefined) sauceAction.unit = String(sauce.unit);
        actions.push(sauceAction);
    }
    var cover = sourcePhase.cover;
    if (cover && typeof cover === 'object') actions.push({action: 'cover', cover_type: cover.cover_type});
    if (actions.length) manualPhase.manual_actions = actions;
    if (manualPhase !== sourcePhase) {
        delete sourcePhase.transfer_to_vessel;
        delete sourcePhase.add_liquid;
        delete sourcePhase.add_sauce;
        delete sourcePhase.cover;
    }
}

function normalizePlan(plan, cookingRequest, minimumMeat, maximumChamber) {
    if (!plan || !Array.isArray(plan.phases)) return plan;
    if (!plan.schema_version) plan.schema_version = 2;
    if (!plan.dish && cookingRequest) plan.dish = cookingRequest.dish;
    if (!plan.safety || typeof plan.safety !== 'object' || Array.isArray(plan.safety)) plan.safety = {};
    var planSafetyMinimum = Number(plan.safety.minimum_meat_temperature_c);
    if (!isFinite(planSafetyMinimum) || planSafetyMinimum < minimumMeat) planSafetyMinimum = minimumMeat;
    plan.safety.minimum_meat_temperature_c = planSafetyMinimum;
    var kindAliases = {
        preheat: 'preheating',
        smoke: 'smoking',
        transfer: 'checkpoint',
        manual_transfer: 'checkpoint',
        wrap_checkpoint: 'checkpoint',
        pan_braise: 'braise',
        final_heat: 'finishing',
        rest: 'resting',
    };
    var precedingManualPhase = null;
    var lastChamberTarget = null;
    for (var index = 0; index < plan.phases.length; index += 1) {
        var phase = plan.phases[index];
        if (!phase) continue;
        if (phase.instructions === undefined && typeof phase.beginner_instructions === 'string') phase.instructions = phase.beginner_instructions;
        delete phase.beginner_instructions;
        if (typeof phase.id === 'number' && isFinite(phase.id)) phase.id = String(phase.id);
        if (phase.chamber_target_c === undefined && phase.target_chamber_c !== undefined) phase.chamber_target_c = phase.target_chamber_c;
        delete phase.target_chamber_c;
        var candidateKind = phase.kind || phase.supported_kind || phase.type;
        candidateKind = kindAliases[candidateKind] || candidateKind;
        if (!V2_PHASE_KINDS[candidateKind] && V2_PHASE_KINDS[phase.name]) candidateKind = phase.name;
        if (V2_PHASE_KINDS[candidateKind]) phase.kind = candidateKind;
        delete phase.supported_kind;
        delete phase.type;
        if (phase.completion_rule && typeof phase.completion_rule === 'object') {
            var completion = phase.completion_rule;
            var completionTarget = Number(completion.target_c);
            if (isFinite(completionTarget)) {
                if (completion.sensor === 'meat_temperature' && phase.meat_target_c === undefined) phase.meat_target_c = completionTarget;
                else if (completion.sensor === 'chamber_temperature' && phase.chamber_target_c === undefined) phase.chamber_target_c = completionTarget;
            }
            phase.completion_rule = completion.type;
        } else if (typeof phase.completion_rule === 'string') {
            var completionMatch = /^(temperature|duration)\s*:\s*(\d+(?:\.\d+)?)\s*(?:°?\s*(?:c|m|min|minutes))?$/i.exec(phase.completion_rule.trim());
            if (completionMatch) {
                phase.completion_rule = completionMatch[1].toLowerCase();
                var completionValue = Number(completionMatch[2]);
                if (phase.completion_rule === 'temperature' && phase.chamber_target_c === undefined) phase.chamber_target_c = completionValue;
                if (phase.completion_rule === 'duration' && phase.max_duration_minutes === undefined) phase.max_duration_minutes = completionValue;
            } else {
                phase.completion_rule = phase.completion_rule.split(':')[0].trim().toLowerCase();
            }
        }
        if (typeof phase.chamber_target_c === 'string' && phase.chamber_target_c.trim()) phase.chamber_target_c = Number(phase.chamber_target_c);
        if (typeof phase.meat_target_c === 'string' && phase.meat_target_c.trim()) phase.meat_target_c = Number(phase.meat_target_c);
        if (phase.mode === 'automatic') {
            if (phase.chamber_target_c === undefined && lastChamberTarget !== null) phase.chamber_target_c = lastChamberTarget;
            if (validNumber(phase.chamber_target_c)) lastChamberTarget = phase.chamber_target_c;
        }
        if (phase.mode === 'manual') {
            normalizeLegacyManualActions(phase, phase);
            precedingManualPhase = phase;
        } else {
            normalizeLegacyManualActions(phase, precedingManualPhase);
        }
    }
    var finalMeatTarget = Math.max(minimumMeat, planSafetyMinimum);
    for (var plannedTargetIndex = 0; plannedTargetIndex < plan.phases.length; plannedTargetIndex += 1) {
        var existingMeatTarget = Number(plan.phases[plannedTargetIndex] && plan.phases[plannedTargetIndex].meat_target_c);
        if (isFinite(existingMeatTarget) && existingMeatTarget > finalMeatTarget) finalMeatTarget = existingMeatTarget;
    }
    // Quality recipes must supply their own timed finish and checkpoints; never synthesize them.
    if (plan.cooking_style === 'pull_apart' || plan.quality) return plan;
    var finalPhase = plan.phases[plan.phases.length - 1];
    if (finalPhase && (finalPhase.kind === 'resting' || String(finalPhase.name).toLowerCase() === 'resting')) {
        var restMinutes = Number(finalPhase.max_duration_minutes);
        finalPhase.mode = 'manual';
        finalPhase.completion_rule = 'manual';
        delete finalPhase.max_duration_minutes;
        if (!validText(finalPhase.message, 1000)) {
            finalPhase.message = restMinutes > 0
                ? 'Remove the meat and let it rest for ' + restMinutes + ' minutes before serving.'
                : 'Remove the meat and let it rest before serving.';
        }
        var donenessIndex = plan.phases.length - 2;
        var donenessPhase = plan.phases[donenessIndex];
        if (donenessPhase && donenessPhase.mode === 'automatic' && donenessPhase.completion_rule === 'temperature') {
            if (!validNumber(donenessPhase.meat_target_c) || donenessPhase.meat_target_c < finalMeatTarget) {
                donenessPhase.meat_target_c = finalMeatTarget;
            }
        } else if (plan.phases.length < 12) {
            var usedIds = {};
            for (var phaseIndex = 0; phaseIndex < plan.phases.length; phaseIndex += 1) {
                if (plan.phases[phaseIndex] && plan.phases[phaseIndex].id) usedIds[plan.phases[phaseIndex].id] = true;
            }
            var verificationId = 'final-meat-verification';
            var verificationSuffix = 1;
            while (usedIds[verificationId]) {
                verificationId = 'final-meat-verification-' + verificationSuffix;
                verificationSuffix += 1;
            }
            var verificationChamberTarget = lastChamberTarget === null ? Math.min(120, maximumChamber) : lastChamberTarget;
            plan.phases.splice(donenessIndex + 1, 0, {
                id: verificationId,
                name: 'unwrapped_finishing',
                kind: 'finishing',
                mode: 'automatic',
                chamber_target_c: verificationChamberTarget,
                meat_target_c: finalMeatTarget,
                completion_rule: 'temperature',
                is_final_temperature_check: true,
            });
        }
    }
    var hasSafeMeatCheck = false;
    for (var checkIndex = 0; checkIndex < plan.phases.length; checkIndex += 1) {
        var checkPhase = plan.phases[checkIndex];
        if (checkPhase && checkPhase.mode === 'automatic' && checkPhase.completion_rule === 'temperature' && validNumber(checkPhase.meat_target_c) && checkPhase.meat_target_c >= finalMeatTarget) {
            hasSafeMeatCheck = true;
            break;
        }
    }
    if (!hasSafeMeatCheck && plan.phases.length < 12) {
        var verificationInsertionIndex = finalPhase && (finalPhase.kind === 'resting' || String(finalPhase.name).toLowerCase() === 'resting') ? plan.phases.length - 1 : plan.phases.length;
        var finalCheckIds = {};
        for (var finalCheckIndex = 0; finalCheckIndex < plan.phases.length; finalCheckIndex += 1) {
            if (plan.phases[finalCheckIndex] && plan.phases[finalCheckIndex].id) finalCheckIds[plan.phases[finalCheckIndex].id] = true;
        }
        var finalCheckId = 'final-meat-verification';
        var finalCheckSuffix = 1;
        while (finalCheckIds[finalCheckId]) {
            finalCheckId = 'final-meat-verification-' + finalCheckSuffix;
            finalCheckSuffix += 1;
        }
        plan.phases.splice(verificationInsertionIndex, 0, {
            id: finalCheckId,
            name: 'unwrapped_finishing',
            kind: 'finishing',
            mode: 'automatic',
            chamber_target_c: lastChamberTarget === null ? Math.min(120, maximumChamber) : lastChamberTarget,
            meat_target_c: finalMeatTarget,
            completion_rule: 'temperature',
            is_final_temperature_check: true,
        });
    }
    return plan;
}

function validateTechnique(phase, index) {
    if (phase.technique !== undefined) {
        if (!phase.technique || typeof phase.technique !== 'object') return 'The external LLM returned an invalid technique';
        if (phase.technique.vessel !== undefined && !TECHNIQUE_VESSELS[phase.technique.vessel]) return 'The external LLM returned an unsupported vessel';
        if (phase.technique.cover !== undefined && !TECHNIQUE_COVERS[phase.technique.cover]) return 'The external LLM returned an unsupported cover';
        if (phase.technique.liquid !== undefined && (!phase.technique.liquid || typeof phase.technique.liquid !== 'object' || !validText(phase.technique.liquid.type, 100))) return 'The external LLM returned an invalid liquid';
        if (phase.technique.sauce !== undefined && !validText(phase.technique.sauce, 100)) return 'The external LLM returned an invalid sauce';
    }
    if (phase.manual_actions !== undefined) {
        if (!Array.isArray(phase.manual_actions) || phase.manual_actions.length > 8) return 'The external LLM returned too many manual actions';
        if (phase.mode !== 'manual') return 'The external LLM returned manual actions on an automatic phase';
        for (var actionIndex = 0; actionIndex < phase.manual_actions.length; actionIndex += 1) {
            var action = phase.manual_actions[actionIndex];
            if (!action || !MANUAL_ACTIONS[action.action]) return 'The external LLM returned an unsupported manual action';
            if (action.vessel !== undefined && !TECHNIQUE_VESSELS[action.vessel]) return 'The external LLM returned an unsupported manual-action vessel';
            if (action.cover_type !== undefined && !TECHNIQUE_COVERS[action.cover_type]) return 'The external LLM returned an unsupported manual-action cover';
            if (action.action === 'transfer_to_vessel' && !action.vessel) return 'The external LLM must specify a vessel for transfer_to_vessel';
            if (action.action === 'add_liquid' && (!validText(action.liquid_type, 100) || !validText(action.unit, 20) || !validText(action.placement, 50) || !validNumber(action.amount) || action.amount <= 0 || action.amount > 100)) return 'The external LLM must specify liquid type, amount, unit, and placement';
            if (action.action === 'add_sauce' && (!validText(action.sauce, 100) || !validText(action.placement, 50))) return 'The external LLM must specify sauce and placement';
            if (action.action === 'cover' && !action.cover_type) return 'The external LLM must specify a cover type';
            if (['uncover', 'baste', 'turn', 'reposition_to_grate', 'remove', 'rest'].indexOf(action.action) !== -1 && action.instruction !== undefined && !validText(action.instruction, 200)) return 'The external LLM returned an invalid manual instruction';
            if (action.optional !== undefined && typeof action.optional !== 'boolean') return 'The external LLM returned an invalid optional manual action';
        }
    }
    return null;
}

function validatePlan(plan, maximumChamber, minimumMeat) {
    if (!plan || typeof plan !== 'object' || !SCHEMA_VERSIONS[plan.schema_version] || typeof plan.dish !== 'string' || !plan.dish.trim()) return 'The external LLM did not return a valid plan header';
    if (!Array.isArray(plan.phases) || plan.phases.length === 0 || plan.phases.length > 12) return 'The external LLM returned an invalid phase list';
    if (plan.schema_version === 2 && (!plan.safety || typeof plan.safety !== 'object' || !validNumber(plan.safety.minimum_meat_temperature_c) || plan.safety.minimum_meat_temperature_c < minimumMeat)) return 'The plan must declare a safe minimum meat temperature at or above the configured minimum';
    var requiredMeatTarget = Math.max(minimumMeat, plan.safety && validNumber(plan.safety.minimum_meat_temperature_c) ? plan.safety.minimum_meat_temperature_c : 0);
    for (var requiredTargetIndex = 0; requiredTargetIndex < plan.phases.length; requiredTargetIndex += 1) {
        var requiredPhaseTarget = Number(plan.phases[requiredTargetIndex] && plan.phases[requiredTargetIndex].meat_target_c);
        if (isFinite(requiredPhaseTarget) && requiredPhaseTarget > requiredMeatTarget) requiredMeatTarget = requiredPhaseTarget;
    }
    var previousName = '';
    var phaseIds = {};
    for (var index = 0; index < plan.phases.length; index += 1) {
        var phase = plan.phases[index];
        if (!phase || (plan.schema_version === 1 && !ALLOWED_PHASES[phase.name]) || (plan.schema_version === 1 && phase.name === previousName)) return 'The external LLM returned an unsupported phase';
        if (plan.schema_version === 2 && (!validText(phase.id, 80) || phaseIds[phase.id] || !validText(phase.name, 100) || !V2_PHASE_KINDS[phase.kind])) return 'The external LLM returned an invalid schema v2 phase';
        if (plan.schema_version === 2) phaseIds[phase.id] = true;
        if (phase.mode !== 'automatic' && phase.mode !== 'manual') return 'The external LLM returned an invalid phase mode';
        if (phase.mode === 'manual' && (phase.completion_rule !== 'manual' || typeof phase.message !== 'string' || !phase.message.trim())) return 'The external LLM returned an incomplete manual checkpoint';
        if (phase.mode === 'automatic' && ['temperature', 'duration', 'temperature_and_time'].indexOf(phase.completion_rule) === -1) return 'The external LLM returned an incomplete automatic phase';
        if (phase.mode === 'automatic' && !(plan.schema_version === 1 ? ALLOWED_PHASES[phase.name] : V2_AUTOMATIC_KINDS[phase.kind])) return 'Phase ' + index + ' (' + phase.name + ') must be a manual phase';
        if (phase.chamber_target_c !== undefined && (!validNumber(phase.chamber_target_c) || phase.chamber_target_c < 0 || phase.chamber_target_c > maximumChamber)) return 'The external LLM returned an unsafe chamber target';
        if (phase.meat_target_c !== undefined && (!validNumber(phase.meat_target_c) || phase.meat_target_c < minimumMeat || phase.meat_target_c > 100)) return 'The external LLM returned a meat target below the configured minimum';
        if (phase.mode === 'automatic' && (!validNumber(phase.chamber_target_c) ||
            (phase.completion_rule === 'duration' && (!validNumber(phase.max_duration_minutes) || phase.max_duration_minutes <= 0 || phase.max_duration_minutes > 1440)))) return 'The external LLM returned an invalid automatic target or duration';
        var techniqueError = validateTechnique(phase, index);
        if (techniqueError) return techniqueError;
        previousName = phase.name;
    }
    var qualityError = new SmokerCookingQuality().validate(plan);
    if (qualityError) return qualityError;
    var finalPhase = plan.phases[plan.phases.length - 1];
    if (finalPhase.kind === 'resting' || finalPhase.name.toLowerCase() === 'resting') {
        var donenessPhase = plan.phases[plan.phases.length - (plan.quality ? 3 : 2)];
        if (!donenessPhase || donenessPhase.mode !== 'automatic' || ['temperature', 'temperature_and_time'].indexOf(donenessPhase.completion_rule) === -1 || !validNumber(donenessPhase.meat_target_c) || donenessPhase.meat_target_c < requiredMeatTarget) return 'The external LLM plan must verify the final meat temperature before resting';
    }
    if (plan.schema_version === 2) {
        var hasSafeMeatCheck = false;
        for (var meatCheckIndex = 0; meatCheckIndex < plan.phases.length; meatCheckIndex += 1) {
            var meatCheck = plan.phases[meatCheckIndex];
            if (meatCheck && meatCheck.mode === 'automatic' && ['temperature', 'temperature_and_time'].indexOf(meatCheck.completion_rule) !== -1 && validNumber(meatCheck.meat_target_c) && meatCheck.meat_target_c >= requiredMeatTarget) {
                hasSafeMeatCheck = true;
                break;
            }
        }
        if (!hasSafeMeatCheck) return 'The plan must include an automatic meat-temperature check at or above its declared safe target';
    }
    return null;
}

function responsePlan(payload) {
    if (typeof payload === 'string') {
        try {
            payload = JSON.parse(payload);
        } catch (error) {
            return null;
        }
    }
    var content = payload && payload.choices && payload.choices[0] && payload.choices[0].message && payload.choices[0].message.content;
    if (typeof content === 'object') return content;
    if (typeof content !== 'string') return null;
    try {
        return JSON.parse(content);
    } catch (error) {
        return null;
    }
}

(function process(request, response) {
    var body;
    try {
        body = JSON.parse(request.body.dataString || '{}');
    } catch (error) {
        fail(400, 'Request body must contain valid JSON');
        return;
    }
    var sessionId = String(body.sessionId || '');
    if (!sessionId) {
        fail(400, 'sessionId is required');
        return;
    }
    var session = new GlideRecord('x_tsigh_smkrctrl_cooking_session');
    if (!session.get(sessionId)) {
        fail(404, 'Cooking session not found');
        return;
    }
    if (['planned', 'preheating'].indexOf(session.getValue('status')) === -1) {
        fail(409, 'An external plan can only be generated for a planned or preheating session');
        return;
    }
    var configuration = getConfiguration();
    var maximumChamber = Number(session.getValue('maximum_chamber_temperature_c')) || configuration.maximumChamber;
    var minimumMeat = Math.max(configuration.minimumMeat, Number(session.getValue('target_meat_temperature_c')) || 0);
    var cookingRequest = {
        dish: String(body.dish || session.getValue('meat_type') || 'barbecue'),
        meat_type: String(body.meat_type || session.getValue('meat_type') || ''),
        meat_cut: String(body.meat_cut || session.getValue('meat_cut') || ''),
        meat_weight_kg: body.meat_weight_kg === undefined ? Number(session.getValue('meat_weight_kg')) || null : Number(body.meat_weight_kg),
        desired_result: String(body.desired_result || ''),
        available_sensors: ['chamber_temperature', 'meat_temperature'],
        device_limits: {
            maximum_chamber_temperature_c: maximumChamber,
            minimum_meat_temperature_c: minimumMeat,
            adaptive_operating_ceiling_c: Number(session.getValue('adaptive_maximum_chamber_temperature_c')) || null,
            relay_tolerance_c: session.getValue('chamber_temperature_tolerance_c') === '' ? 3 : Number(session.getValue('chamber_temperature_tolerance_c')),
        },
        plan_contract: {
            schema_version: 2,
            safety_minimum_meat_temperature_c: minimumMeat,
            require_automatic_meat_temperature_check: true,
            require_manual_resting: true,
            require_cooking_style: true,
            pull_apart_quality: 'Classify the requested result as cooking_style standard or pull_apart. For pulled pork, shreddable meat or another pull-apart result, use pull_apart and provide quality: {adaptive_ceiling_c, recheck_chamber_c, recheck_minutes, stall_tolerant: true}. Choose recipe-specific numeric values based on the cut, weight and desired result, not the equipment emergency limit. Every automatic chamber target must be at or below this recipe ceiling. Use conservative low-and-slow temperatures and tolerate a natural stall; never promise tenderness from temperature alone.',
            pull_apart_checkpoints: 'For pull_apart: final cooking must use completion_rule temperature_and_time with meat_target_c and a positive recipe-specific minimum_duration_minutes. Follow immediately with a mandatory manual kind checkpoint phase with checkpoint tenderness, then a mandatory manual kind resting phase with positive minimum_duration_minutes. The tenderness message must request an independent temperature check and probe-tenderness check; the UI offers more cooking for quality.recheck_minutes at quality.recheck_chamber_c or Begin resting. The resting message must instruct removal from the smoker before confirmation. Put a mandatory manual uncover action checkpoint before any unwrapped_finishing or uncovered_crisping phase. Do not ask the user to invent recipe times or temperatures.',
        },
        available_phases: ['preheating', 'smoking', 'wrap_checkpoint', 'wrapped', 'covered_tray', 'unwrapped_finishing', 'uncovered_crisping', 'grilling', 'resting'],
        phase_guidance: {
            beginner_instructions: 'Include an instructions string for every phase: 1-3 short sentences for a beginner. Explain what the person should do, what the controller regulates after approval, what to monitor, and the exact completion condition. Give manual actions in order with quantities and placement. Distinguish timer steps from temperature checks. Explain any final temperature recheck and state that it passes immediately if the probe already meets the target.',
            wrap_checkpoint: 'Manual transfer or preparation step. For pan-braising, move the smoked meat into a metal tray, add liquid, and cover the tray; this does not mean wrapping the meat itself.',
            wrapped: 'Automatic cooking phase for meat enclosed in a wrap or covered vessel when that technique is explicitly requested.',
            covered_tray: 'Automatic pan-braising phase in a covered metal tray. Use a meat-temperature target when a meat sensor is available.',
            unwrapped_finishing: 'Automatic uncovered finishing phase after a covered or wrapped phase.',
            uncovered_crisping: 'Optional short automatic high-heat phase after removing the cover to restore crisp skin.',
            schema_rules: 'Return schema_version 2 and cooking_style standard or pull_apart. Every phase must have a unique string id, a name, and kind from preheating, smoking, braise, roasting, grilling, finishing, resting, checkpoint, wrapped, covered_tray, unwrapped_finishing, or uncovered_crisping. mode must be automatic or manual. completion_rule must be exactly temperature, duration, temperature_and_time, or manual; never append a target or unit. Every automatic phase requires numeric chamber_target_c; duration phases also require numeric max_duration_minutes. temperature_and_time requires meat_target_c and minimum_duration_minutes. Never use type, actions, or an object-valued completion_rule. Manual phases require a non-empty message and completion_rule manual; resting must be manual; automatic phases must not include manual_actions. Keep targets within device_limits. For standard recipes verify final meat temperature immediately before rest; for pull_apart insert the mandatory tenderness checkpoint between the timed temperature finish and rest. add_liquid requires liquid_type, positive amount, unit, and placement; add_sauce requires sauce and placement; transfer_to_vessel requires vessel; cover requires cover_type.',
        },
    };
    // The Flow REST step currently inserts this String input as a JSON value. Encode twice so its resolved value is text inside the LLM content part.
    var cookingRequestJson = JSON.stringify(JSON.stringify(cookingRequest));
    var actionInputs = {
        model: String(body.model || configuration.model),
        cooking_request: cookingRequestJson,
    };
    try {
        var actionResult = sn_fd.FlowAPI.getRunner()
            .action(configuration.flowActionName)
            .inForeground()
            .timeout(configuration.requestTimeoutSeconds * 1000)
            .withInputs(actionInputs)
            .run();
        var actionPayload = actionResult && (actionResult.getOutputs ? actionResult.getOutputs() : actionResult.outputs || actionResult);
        var plan = responsePlan(actionPayload && (actionPayload.response || actionPayload.plan || actionPayload));
        if (!plan && actionPayload && actionPayload.response) plan = responsePlan(actionPayload.response);
        plan = normalizePlan(plan, cookingRequest, minimumMeat, maximumChamber);
        if (!plan || ['standard', 'pull_apart'].indexOf(plan.cooking_style) === -1) {
            fail(422, 'The generated plan must classify its cooking_style as standard or pull_apart');
            return;
        }
        var validationError = validatePlan(plan, maximumChamber, minimumMeat);
        if (!validationError && plan.quality) validationError = new SmokerCookingQuality().validateLimits(plan, session);
        if (validationError) {
            fail(422, validationError);
            return;
        }
        session.setValue('ai_provider', 'external_llm');
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
        response.setBody({success: true, status: 'draft', provider: 'external_llm', version: session.getValue('ai_plan_version'), plan: plan});
    } catch (error) {
        fail(502, 'External LLM action failed: ' + error.message);
    }
})(request, response);