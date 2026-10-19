import '@servicenow/sdk/global'
import { Acl, BusinessRule, Form, Record, RestApi, RestMessage, ScheduledScript, ScriptInclude, UiPolicy, default_view } from '@servicenow/sdk/core'

Acl({ $id: Now.ID['deny-reading-create'], type: 'record', table: 'x_tsigh_smkrctrl_temperature_reading', operation: 'create', decisionType: 'deny', condition: 'sys_idISEMPTY', adminOverrides: false, description: 'Temperature readings are script-managed.' })
Acl({ $id: Now.ID['deny-reading-write'], type: 'record', table: 'x_tsigh_smkrctrl_temperature_reading', operation: 'write', decisionType: 'deny', condition: 'sys_idISNOTEMPTY', adminOverrides: false, description: 'Temperature readings are script-managed.' })
Acl({ $id: Now.ID['deny-reading-delete'], type: 'record', table: 'x_tsigh_smkrctrl_temperature_reading', operation: 'delete', decisionType: 'deny', condition: 'sys_idISNOTEMPTY', adminOverrides: false, description: 'Temperature readings may only be deleted by scripts.' })
Acl({ $id: Now.ID['deny-action-create'], type: 'record', table: 'x_tsigh_smkrctrl_control_action', operation: 'create', decisionType: 'deny', condition: 'sys_idISEMPTY', adminOverrides: false, description: 'Control actions are script-managed.' })
Acl({ $id: Now.ID['deny-action-write'], type: 'record', table: 'x_tsigh_smkrctrl_control_action', operation: 'write', decisionType: 'deny', condition: 'sys_idISNOTEMPTY', adminOverrides: false, description: 'Control actions are script-managed.' })
Acl({ $id: Now.ID['deny-action-delete'], type: 'record', table: 'x_tsigh_smkrctrl_control_action', operation: 'delete', decisionType: 'deny', condition: 'sys_idISNOTEMPTY', adminOverrides: false, description: 'Control actions may only be deleted by scripts.' })
Acl({ $id: Now.ID['deny-alert-create'], type: 'record', table: 'x_tsigh_smkrctrl_device_alert', operation: 'create', decisionType: 'deny', condition: 'sys_idISEMPTY', adminOverrides: false, description: 'Device alerts are script-managed.' })
Acl({ $id: Now.ID['deny-alert-write'], type: 'record', table: 'x_tsigh_smkrctrl_device_alert', operation: 'write', decisionType: 'deny', condition: 'sys_idISNOTEMPTY', adminOverrides: false, description: 'Device alerts are script-managed.' })
Acl({ $id: Now.ID['deny-alert-delete'], type: 'record', table: 'x_tsigh_smkrctrl_device_alert', operation: 'delete', decisionType: 'deny', condition: 'sys_idISNOTEMPTY', adminOverrides: false, description: 'Device alerts may only be deleted by scripts.' })

export const temperatureReadingListControl = Record({
    $id: Now.ID['temperature-reading-list-control'],
    table: 'sys_ui_list_control',
    data: {name: 'x_tsigh_smkrctrl_temperature_reading', label: 'Temperature Readings', list_edit_type: 'disabled', omit_new_button: true, omit_edit_button: true},
})

export const controlActionListControl = Record({
    $id: Now.ID['control-action-list-control'],
    table: 'sys_ui_list_control',
    data: {name: 'x_tsigh_smkrctrl_control_action', label: 'Control Actions', list_edit_type: 'disabled', omit_new_button: true, omit_edit_button: true},
})

export const deviceAlertListControl = Record({
    $id: Now.ID['device-alert-list-control'],
    table: 'sys_ui_list_control',
    data: {name: 'x_tsigh_smkrctrl_device_alert', label: 'Device Alerts', list_edit_type: 'disabled', omit_new_button: true, omit_edit_button: true},
})

export const synchronizeCookingSessionLifecycle = BusinessRule({
    $id: Now.ID['synchronize-cooking-session-lifecycle'],
    name: 'Synchronize Cooking Session Lifecycle',
    table: 'x_tsigh_smkrctrl_cooking_session',
    when: 'before',
    action: ['insert', 'update'],
    order: 50,
    description: 'Keeps current phase and completion timestamps synchronized with session status.',
    script: Now.include('../server/smoker/synchronize-session-lifecycle.js'),
})

export const cookingSessionForm = Form({
    table: 'x_tsigh_smkrctrl_cooking_session',
    view: default_view,
    sections: [
        {
            caption: 'Session',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'name', type: 'table_field' },
                        { field: 'smoker_device', type: 'table_field' },
                        { field: 'status', type: 'table_field' },
                        { field: 'current_phase', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'started_at', type: 'table_field' },
                        { field: 'completed_at', type: 'table_field' },
                        { field: 'monitor_meat_temperature', type: 'table_field' },
                    ],
                },
            ],
        },
        {
            caption: 'Control and Plan Execution',
            content: [{
                layout: 'one-column',
                elements: [
                    { field: 'control_mode', type: 'table_field' },
                    { field: 'ai_control_enabled', type: 'table_field' },
                    { field: 'automatic_control_enabled', type: 'table_field' },
                    { field: 'ai_provider', type: 'table_field' },
                    { field: 'ai_plan_status', type: 'table_field' },
                ],
            }],
        },
        {
            caption: 'Meat and Targets',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'meat_type', type: 'table_field' },
                        { field: 'meat_cut', type: 'table_field' },
                        { field: 'meat_weight_kg', type: 'table_field' },
                        { field: 'target_meat_temperature_c', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'target_chamber_temperature_c', type: 'table_field' },
                        { field: 'chamber_temperature_tolerance_c', type: 'table_field' },
                        { field: 'maximum_chamber_temperature_c', type: 'table_field' },
                        { field: 'minimum_relay_switch_interval_seconds', type: 'table_field' },
                    ],
                },
            ],
        },
        {
            caption: 'After Meat Target',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'post_target_action', type: 'table_field' },
                        { field: 'post_target_chamber_temperature_c', type: 'table_field' },
                        { field: 'post_target_hold_minutes', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'post_target_started_at', type: 'table_field' },
                        { field: 'post_target_completed_at', type: 'table_field' },
                    ],
                },
            ],
        },
        {
            caption: 'After Chamber Target',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'chamber_target_hold_minutes', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'chamber_target_started_at', type: 'table_field' },
                        { field: 'chamber_target_completed_at', type: 'table_field' },
                    ],
                },
            ],
        },
        {
            caption: 'Adaptive Temperature Control',
            content: [{
                layout: 'two-column',
                leftElements: [
                    { field: 'adaptive_temperature_enabled', type: 'table_field' },
                    { field: 'adaptive_minimum_chamber_temperature_c', type: 'table_field' },
                    { field: 'adaptive_maximum_chamber_temperature_c', type: 'table_field' },
                    { field: 'adaptive_target_step_c', type: 'table_field' },
                    { field: 'adaptive_evaluation_minutes', type: 'table_field' },
                ],
                rightElements: [
                    { field: 'adaptive_minimum_meat_rise_c_per_min', type: 'table_field' },
                    { field: 'adaptive_maximum_meat_rise_c_per_min', type: 'table_field' },
                    { field: 'adaptive_current_chamber_target_c', type: 'table_field' },
                    { field: 'adaptive_last_adjusted_at', type: 'table_field' },
                ],
            }],
        },
        {
            caption: 'Notes',
            content: [{ layout: 'one-column', elements: [{ field: 'notes', type: 'table_field' }] }],
        },
        {
            caption: 'AI Cooking Plan',
            content: [{ layout: 'one-column', elements: [{ field: 'ai_current_phase', type: 'table_field' }, { field: 'ai_manual_action_required', type: 'table_field' }, { field: 'ai_manual_action_message', type: 'table_field' }, { field: 'ai_plan_json', type: 'table_field' }] }],
        },
    ],
})

export const smokerDeviceForm = Form({
    table: 'x_tsigh_smkrctrl_smoker_device',
    view: default_view,
    sections: [{ caption: 'Device Configuration', content: [{ layout: 'two-column', leftElements: [{ field: 'name', type: 'table_field' }, { field: 'active', type: 'table_field' }, { field: 'polling_enabled', type: 'table_field' }, { field: 'api_base_url', type: 'table_field' }], rightElements: [{ field: 'polling_interval_seconds', type: 'table_field' }, { field: 'request_timeout_seconds', type: 'table_field' }, { field: 'offline_after_failures', type: 'table_field' }, { field: 'fail_safe_seconds', type: 'table_field' }, { field: 'chamber_anticipation_seconds', type: 'table_field' }] }] }],
})

export const temperatureReadingForm = Form({
    table: 'x_tsigh_smkrctrl_temperature_reading',
    view: default_view,
    sections: [{ caption: 'Reading', content: [{ layout: 'two-column', leftElements: [{ field: 'smoker_device', type: 'table_field' }, { field: 'cooking_session', type: 'table_field' }, { field: 'recorded_at', type: 'table_field' }, { field: 'reading_status', type: 'table_field' }], rightElements: [{ field: 'chamber_temperature_c', type: 'table_field' }, { field: 'meat_temperature_c', type: 'table_field' }, { field: 'relay_state', type: 'table_field' }, { field: 'device_uptime_seconds', type: 'table_field' }] }] }] ,
})

export const controlActionForm = Form({
    table: 'x_tsigh_smkrctrl_control_action',
    view: default_view,
    sections: [{ caption: 'Control Decision', content: [{ layout: 'two-column', leftElements: [{ field: 'smoker_device', type: 'table_field' }, { field: 'cooking_session', type: 'table_field' }, { field: 'action', type: 'table_field' }, { field: 'source', type: 'table_field' }], rightElements: [{ field: 'result', type: 'table_field' }, { field: 'requested_at', type: 'table_field' }, { field: 'response_http_status', type: 'table_field' }, { field: 'response_message', type: 'table_field' }] }, { layout: 'one-column', elements: [{ field: 'reason', type: 'table_field' }] }] }],
})

export const deviceAlertForm = Form({
    table: 'x_tsigh_smkrctrl_device_alert',
    view: default_view,
    sections: [{ caption: 'Alert', content: [{ layout: 'two-column', leftElements: [{ field: 'smoker_device', type: 'table_field' }, { field: 'cooking_session', type: 'table_field' }, { field: 'alert_type', type: 'table_field' }, { field: 'severity', type: 'table_field' }], rightElements: [{ field: 'state', type: 'table_field' }, { field: 'opened_at', type: 'table_field' }, { field: 'resolved_at', type: 'table_field' }] }, { layout: 'one-column', elements: [{ field: 'message', type: 'table_field' }] }] }],
})

export const aiConfigurationForm = Form({
    table: 'x_tsigh_smkrctrl_ai_configuration',
    view: default_view,
    sections: [
        {
            caption: 'AI Provider',
            content: [{
                layout: 'two-column',
                leftElements: [
                    { field: 'name', type: 'table_field' },
                    { field: 'active', type: 'table_field' },
                    { field: 'default_provider', type: 'table_field' },
                    { field: 'external_llm_enabled', type: 'table_field' },
                ],
                rightElements: [
                    { field: 'external_model', type: 'table_field' },
                    { field: 'flow_action_name', type: 'table_field' },
                    { field: 'request_timeout_seconds', type: 'table_field' },
                ],
            }],
        },
        {
            caption: 'Cooking Plan Safety',
            content: [{
                layout: 'two-column',
                leftElements: [
                    { field: 'minimum_meat_temperature_c', type: 'table_field' },
                    { field: 'maximum_chamber_temperature_c', type: 'table_field' },
                ],
                rightElements: [
                    { field: 'maximum_plan_phases', type: 'table_field' },
                    { field: 'schema_version', type: 'table_field' },
                ],
            }],
        },
    ],
})

export const smokerRelayApi = RestApi({
    $id: Now.ID['smoker-relay-api'],
    name: 'Smoker Relay API',
    serviceId: 'smoker_relay',
    consumes: 'application/json',
    routes: [
        {
            $id: Now.ID['smoker-relay-api-post'],
            name: 'setRelay',
            method: 'POST',
            path: '/relay',
            script: Now.include('../server/smoker/relay-api.js'),
        },
        {
            $id: Now.ID['smoker-polling-api-post'],
            name: 'setPolling',
            method: 'POST',
            path: '/polling',
            script: Now.include('../server/smoker/polling-api.js'),
        },
        {
            $id: Now.ID['smoker-session-status-api-post'],
            name: 'setSessionStatus',
            method: 'POST',
            path: '/session-status',
            script: Now.include('../server/smoker/session-status-api.js'),
        },
        {
            $id: Now.ID['smoker-cooking-plan-api-post'],
            name: 'saveCookingPlan',
            method: 'POST',
            path: '/cooking-plan',
            script: Now.include('../server/smoker/cooking-plan-api.js'),
        },
        {
            $id: Now.ID['smoker-cooking-plan-generate-api-post'],
            name: 'generateExternalCookingPlan',
            method: 'POST',
            path: '/cooking-plan/generate',
            script: Now.include('../server/smoker/external-llm-api.js'),
        },
        {
            $id: Now.ID['smoker-clear-history-api-post'],
            name: 'clearHistory',
            method: 'POST',
            path: '/clear-history',
            script: Now.include('../server/smoker/clear-history-api.js'),
        },
    ],
})

export const showAfterMeatTargetWhenMonitoringMeat = UiPolicy({
    $id: Now.ID['show-after-meat-target-section'],
    table: 'x_tsigh_smkrctrl_cooking_session',
    shortDescription: 'Show After Meat Target fields only when meat monitoring is enabled',
    conditions: 'monitor_meat_temperature=true',
    onLoad: true,
    reverseIfFalse: true,
    actions: [
        { field: 'post_target_action', visible: true },
        { field: 'post_target_chamber_temperature_c', visible: true },
        { field: 'post_target_hold_minutes', visible: true },
        { field: 'post_target_started_at', visible: true },
        { field: 'post_target_completed_at', visible: true },
    ],
})

export const showAfterChamberTargetWhenNotMonitoringMeat = UiPolicy({
    $id: Now.ID['show-after-chamber-target-section'],
    table: 'x_tsigh_smkrctrl_cooking_session',
    shortDescription: 'Show After Chamber Target fields only when meat monitoring is disabled',
    conditions: 'monitor_meat_temperature=false',
    onLoad: true,
    reverseIfFalse: true,
    actions: [
        { field: 'chamber_target_hold_minutes', visible: true },
        { field: 'chamber_target_started_at', visible: true },
        { field: 'chamber_target_completed_at', visible: true },
    ],
})

export const hideSmokerApiKeyOnNewForm = UiPolicy({
    $id: Now.ID['hide-smoker-api-key-new-form'],
    table: 'x_tsigh_smkrctrl_smoker_device',
    shortDescription: 'Hide encrypted API key on new device form',
    conditions: 'sys_idISEMPTY',
    onLoad: true,
    reverseIfFalse: false,
    actions: [{ field: 'api_key', visible: false }],
})

export const hideSmokerApiKeyOnExistingForm = UiPolicy({
    $id: Now.ID['hide-smoker-api-key-existing-form'],
    table: 'x_tsigh_smkrctrl_smoker_device',
    shortDescription: 'Hide encrypted API key on existing device form',
    conditions: 'sys_idISNOTEMPTY',
    onLoad: true,
    reverseIfFalse: false,
    actions: [{ field: 'api_key', visible: false }],
})

export const smokerStatusApi = RestMessage({
    $id: Now.ID['smoker-status-api'],
    name: 'Smoker Controller API',
    endpoint: '${baseUrl}',
    description: 'Reads smoker relay and temperature status from the microcontroller.',
    authenticationType: 'noAuthentication',
    functions: [
        {
            name: 'getStatus',
            httpMethod: 'GET',
            endpoint: '${baseUrl}/api/status',
            variables: [
                {
                    $id: Now.ID['smoker-status-api-base-url-variable'],
                    name: 'baseUrl',
                },
            ],
        },
        {
            name: 'relayOn',
            httpMethod: 'GET',
            endpoint: '${baseUrl}/api/relay/on',
            variables: [
                {
                    $id: Now.ID['smoker-relay-on-base-url-variable'],
                    name: 'baseUrl',
                },
            ],
        },
        {
            name: 'relayOff',
            httpMethod: 'GET',
            endpoint: '${baseUrl}/api/relay/off',
            variables: [
                {
                    $id: Now.ID['smoker-relay-off-base-url-variable'],
                    name: 'baseUrl',
                },
            ],
        },
    ],
})


export const smokerRelayControl = ScriptInclude({
    $id: Now.ID['smoker-relay-control'],
    name: 'SmokerRelayControl',
    active: true,
    description: 'Safely controls the smoker relay and records each manual action.',
    script: Now.include('../server/smoker/relay-control.js'),
})

export const smokerCookingQuality = ScriptInclude({
    $id: Now.ID['smoker-cooking-quality'],
    name: 'SmokerCookingQuality',
    active: true,
    description: 'Validates recipe-specific pull-apart cooking limits and tenderness checkpoints.',
    script: Now.include('../server/smoker/cooking-quality.js'),
})

export const smokerStatusPolling = ScheduledScript({
    $id: Now.ID['smoker-status-polling'],
    name: 'Smoker Status Polling',
    active: true,
    frequency: 'periodically',
    executionInterval: { seconds: 20 },
    timeZone: 'UTC',
    script: Now.include('../server/smoker/poll-status.js'),
})