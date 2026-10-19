import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['ee85bff73b9b071064e7ecac73e45a9e'],
    table: 'sys_element_mapping',
    data: {
        field: 'application',
        id: '6285bff73b9b071064e7ecac73e45a62',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['2a85bff73b9b071064e7ecac73e45a9e'],
    table: 'sys_element_mapping',
    data: {
        field: 'base_url',
        id: '6285bff73b9b071064e7ecac73e45a62',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['ae85bff73b9b071064e7ecac73e45a9b'],
    table: 'sys_element_mapping',
    data: {
        field: 'body',
        id: '6285bff73b9b071064e7ecac73e45a62',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
        value: `{
  "model": "{{action.model}}",
  "temperature": 0.2,
  "response_format": {
    "type": "json_object"
  },
  "messages": [
    {
      "role": "system",
      "content": [
        {
          "type": "text",
          "text": "Return only valid JSON matching SmokerController cooking-plan schema_version 2. Do not return Markdown, explanations, or code fences.

The root object must contain:
schema_version, dish, meat_type, meat_cut, meat_weight_kg, desired_result, estimated_duration_minutes, recommendations, safety, and phases.

Set schema_version to the number 2. recommendations must always be an array of strings. safety must always be an object containing numeric minimum_meat_temperature_c and maximum_chamber_temperature_c values.

phases must be an array containing between 1 and 12 phase objects. Every phase must contain:
id, name, kind, mode, and completion_rule.

Every phase id must be unique. Preserve the logical cooking order.

Allowed phase kinds are:
preheating, smoking, braise, roasting, grilling, finishing, resting, checkpoint, wrapped, covered_tray, unwrapped_finishing, and uncovered_crisping.

Automatic phases must use mode automatic and completion_rule temperature or duration. Automatic phases may contain numeric chamber_target_c, meat_target_c, and max_duration_minutes values.

Manual phases must use mode manual, completion_rule manual, and a non-empty message.

Physical cooking operations must be represented in manual_actions on manual phases only. Allowed manual actions are:
transfer_to_vessel, add_liquid, add_sauce, cover, uncover, baste, turn, reposition_to_grate, remove, and rest.

Use technique metadata when relevant. Supported vessels are:
grate, metal_tray, roasting_pan, pot, foil, and butcher_paper.

Supported covers are:
none, foil, lid, and butcher_paper.

A technique object may contain vessel, cover, liquid, and sauce. A liquid may contain type, amount, unit, and placement. Manual actions may contain vessel, cover_type, liquid_type, sauce, amount, unit, placement, instruction, and optional.

Use manual checkpoints for transferring meat, adding liquid or sauce, covering, uncovering, basting, turning, repositioning, removing, resting, or any other action that cannot be determined from thermometer readings.

Use covered_tray for pan-braising in a covered metal tray. Do not interpret covered_tray as wrapping the meat.

Use wrapped only when the user explicitly requests foil, butcher paper, or another wrapping technique.

Use uncovered_crisping as an optional short finishing phase after a covered or wrapped phase when crisp skin or surface texture is desired.

Never return relay commands, API calls, credentials, JavaScript, database operations, or executable instructions.

Never set a chamber target above device_limits.maximum_chamber_temperature_c.

Never set a meat target below device_limits.minimum_meat_temperature_c when that limit is provided. Every meat_target_c must be greater than or equal to device_limits.minimum_meat_temperature_c, including intermediate phases.

Do not treat elapsed time alone as proof that meat is safe to eat when a meat thermometer is available.

Treat missing or invalid thermometer values as unknown. Use a manual checkpoint or pause recommendation instead of guessing.

Never use the property names:
phase, chamber_temperature_c, meat_temperature_c, or duration_minutes.

Use max_duration_minutes instead of duration_minutes, chamber_target_c instead of chamber_temperature_c, and meat_target_c instead of meat_temperature_c.

Return only the final JSON object."
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": {{action.cooking_request}}
        }
      ]
    }
  ]
}`,
    },
})
Record({
    $id: Now.ID['6285bff73b9b071064e7ecac73e45a9e'],
    table: 'sys_element_mapping',
    data: {
        field: 'capabilities',
        id: '6285bff73b9b071064e7ecac73e45a62',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['e285bff73b9b071064e7ecac73e45a9d'],
    table: 'sys_element_mapping',
    data: {
        field: 'connection_alias',
        id: '6285bff73b9b071064e7ecac73e45a62',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['2685bff73b9b071064e7ecac73e45aac'],
    table: 'sys_element_mapping',
    data: {
        field: 'connection_timeout',
        id: '6285bff73b9b071064e7ecac73e45a62',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['aa85bff73b9b071064e7ecac73e45a9d'],
    table: 'sys_element_mapping',
    data: {
        field: 'headers',
        id: '6285bff73b9b071064e7ecac73e45a62',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['aa85bff73b9b071064e7ecac73e45a9a'],
    table: 'sys_element_mapping',
    data: {
        field: 'honor_duplicate_headers',
        id: '6285bff73b9b071064e7ecac73e45a62',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['6685bff73b9b071064e7ecac73e45a9c'],
    table: 'sys_element_mapping',
    data: {
        field: 'honor_duplicate_query_params',
        id: '6285bff73b9b071064e7ecac73e45a62',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['2e85bff73b9b071064e7ecac73e45a9c'],
    table: 'sys_element_mapping',
    data: {
        field: 'http_method',
        id: '6285bff73b9b071064e7ecac73e45a62',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['a685bff73b9b071064e7ecac73e45a9f'],
    table: 'sys_element_mapping',
    data: {
        field: 'query_params',
        id: '6285bff73b9b071064e7ecac73e45a62',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['6a85bff73b9b071064e7ecac73e45a9b'],
    table: 'sys_element_mapping',
    data: {
        field: 'retry_policy',
        id: '6285bff73b9b071064e7ecac73e45a62',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
