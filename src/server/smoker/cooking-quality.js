/* global Class */

var SmokerCookingQuality = Class.create();
SmokerCookingQuality.prototype = {
    initialize: function() {},

    validate: function(plan) {
        if (!plan || !Array.isArray(plan.phases)) return 'A cooking plan with phases is required';
        var quality = plan.quality;
        if (plan.cooking_style !== undefined && ['standard', 'pull_apart'].indexOf(plan.cooking_style) === -1) return 'Unsupported cooking style';
        if (plan.cooking_style === 'pull_apart' && (!quality || plan.schema_version !== 2)) return 'Pull-apart cooking requires a schema v2 recipe quality policy';
        if (quality && plan.cooking_style !== 'pull_apart') return 'Recipe quality settings require the pull_apart cooking style';
        function numberInRange(value, minimum, maximum) {
            return typeof value === 'number' && isFinite(value) && value >= minimum && value <= maximum;
        }
        if (quality && (!numberInRange(quality.adaptive_ceiling_c, 1, 350) ||
            !numberInRange(quality.recheck_chamber_c, 1, quality.adaptive_ceiling_c) ||
            !numberInRange(quality.recheck_minutes, 1, 120) || quality.stall_tolerant !== true)) {
            return 'The generated recipe must specify a chamber ceiling, a controlled recheck temperature, a 1-120 minute recheck interval, and stall_tolerant true';
        }
        var tendernessIndex = -1;
        for (var index = 0; index < plan.phases.length; index++) {
            var phase = plan.phases[index];
            if (!phase) return 'A cooking phase is missing';
            if (phase.minimum_duration_minutes !== undefined && !numberInRange(phase.minimum_duration_minutes, 1, 1440)) return 'Minimum phase duration must be between 1 and 1440 minutes';
            if (phase.minimum_duration_minutes !== undefined && phase.mode === 'automatic' && phase.completion_rule !== 'temperature_and_time') return 'Automatic minimum durations require the temperature_and_time completion rule';
            if (phase.completion_rule === 'temperature_and_time' &&
                (phase.mode !== 'automatic' || !numberInRange(phase.meat_target_c, 0, 100) || !numberInRange(phase.minimum_duration_minutes, 1, 1440))) {
                return 'Temperature-and-time phases require a meat target and a positive minimum duration';
            }
            if (phase.checkpoint !== undefined && phase.checkpoint !== 'tenderness') return 'Unsupported cooking checkpoint';
            if (phase.checkpoint === 'tenderness') {
                if (!quality || tendernessIndex !== -1 || phase.mode !== 'manual' || phase.kind !== 'checkpoint' || phase.completion_rule !== 'manual' || phase.optional === true) return 'Tenderness must be a single mandatory manual checkpoint';
                tendernessIndex = index;
            }
            if (quality && phase.mode === 'automatic' && (!numberInRange(phase.chamber_target_c, 1, quality.adaptive_ceiling_c))) return 'An automatic chamber target exceeds the recipe operating ceiling';
            if (quality && (['unwrapped_finishing', 'uncovered_crisping'].indexOf(phase.kind) !== -1 ||
                ['unwrapped_finishing', 'uncovered_crisping'].indexOf(phase.name) !== -1)) {
                var preparation = plan.phases[index - 1];
                var actions = preparation && preparation.manual_actions;
                var hasUncover = false;
                for (var actionIndex = 0; Array.isArray(actions) && actionIndex < actions.length; actionIndex++) {
                    if (actions[actionIndex].action === 'uncover' && actions[actionIndex].optional !== true) hasUncover = true;
                }
                if (!preparation || preparation.mode !== 'manual' || preparation.optional === true || !hasUncover) return 'Uncovered finishing requires a mandatory manual uncover checkpoint immediately before it';
            }
        }
        if (quality) {
            var finishing = plan.phases[tendernessIndex - 1];
            var resting = plan.phases[tendernessIndex + 1];
            if (tendernessIndex !== plan.phases.length - 2 || !finishing || finishing.mode !== 'automatic' ||
                finishing.completion_rule !== 'temperature_and_time' || !resting || resting.kind !== 'resting' ||
                resting.mode !== 'manual' || resting.optional === true || !numberInRange(resting.minimum_duration_minutes, 1, 1440)) {
                return 'Pull-apart recipes require final temperature-and-time cooking, a tenderness checkpoint, then a mandatory timed manual rest';
            }
        }
        return null;
    },

    validateLimits: function(plan, session) {
        var quality = plan && plan.quality;
        var adaptive = session.getValue('adaptive_temperature_enabled');
        if (!quality && adaptive !== '1' && adaptive !== 'true') return null;
        if (quality && session.getValue('monitor_meat_temperature') !== '1' && session.getValue('monitor_meat_temperature') !== 'true') return 'Pull-apart cooking requires meat temperature monitoring';
        var maximum = Number(session.getValue('maximum_chamber_temperature_c'));
        var toleranceValue = session.getValue('chamber_temperature_tolerance_c');
        var tolerance = toleranceValue === '' || toleranceValue === null ? 3 : Number(toleranceValue);
        if (!isFinite(maximum) || maximum <= 0 || !isFinite(tolerance) || tolerance < 0) return 'Configure a positive safety cutoff and nonnegative relay tolerance';
        if (quality && quality.adaptive_ceiling_c + tolerance >= maximum) return 'The recipe chamber ceiling plus relay tolerance must be below the equipment safety cutoff';
        if (adaptive === '1' || adaptive === 'true') {
            var ceiling = Number(session.getValue('adaptive_maximum_chamber_temperature_c'));
            var minimum = Number(session.getValue('adaptive_minimum_chamber_temperature_c'));
            if (!isFinite(ceiling) || ceiling <= 0 || ceiling + tolerance >= maximum ||
                !isFinite(minimum) || minimum < 0 || minimum > ceiling) return 'Configure an adaptive operating ceiling below the safety cutoff with room for the relay tolerance, and a minimum no higher than that ceiling';
        }
        return null;
    },

    type: 'SmokerCookingQuality'
};
