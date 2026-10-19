import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['1c22dd353bd7871064e7ecac73e45a8d'],
    table: 'sys_element_mapping',
    data: {
        field: 'application',
        id: '0422dd353bd7871064e7ecac73e45a3b',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['d422dd353bd7871064e7ecac73e45a8d'],
    table: 'sys_element_mapping',
    data: {
        field: 'base_url',
        id: '0422dd353bd7871064e7ecac73e45a3b',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['5822dd353bd7871064e7ecac73e45a8b'],
    table: 'sys_element_mapping',
    data: {
        field: 'body',
        id: '0422dd353bd7871064e7ecac73e45a3b',
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
          "text": "Return only valid JSON matching this exact schema. Do not use alternative property names.

The root object must contain:
schema_version, dish, meat_type, meat_cut, meat_weight_kg, desired_result, estimated_duration_minutes, recommendations, safety, phases.

Each phase must contain:
name, mode, completion_rule.

Allowed phase names:
preheating, smoking, wrap_checkpoint, wrapped, unwrapped_finishing, grilling, resting.

For automatic phases:
- mode must be "automatic"
- completion_rule must be "temperature" or "duration"
- use chamber_target_c for chamber temperature
- use meat_target_c for meat temperature
- use max_duration_minutes for a time limit

For manual phases:
- mode must be "manual"
- completion_rule must be "manual"
- message is required

Never use these alternative property names:
phase, chamber_temperature_c, meat_temperature_c, duration_minutes.

Never return relay commands, API calls, credentials, JavaScript, or executable instructions.
Return JSON only, without Markdown fences."
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "{{action.cooking_request}}"
        }
      ]
    }
  ]
}`,
    },
})
Record({
    $id: Now.ID['9022dd353bd7871064e7ecac73e45a8d'],
    table: 'sys_element_mapping',
    data: {
        field: 'capabilities',
        id: '0422dd353bd7871064e7ecac73e45a3b',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['1822dd353bd7871064e7ecac73e45a8c'],
    table: 'sys_element_mapping',
    data: {
        field: 'connection_alias',
        id: '0422dd353bd7871064e7ecac73e45a3b',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['9422dd353bd7871064e7ecac73e45a8e'],
    table: 'sys_element_mapping',
    data: {
        field: 'connection_timeout',
        id: '0422dd353bd7871064e7ecac73e45a3b',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['5c22dd353bd7871064e7ecac73e45a8c'],
    table: 'sys_element_mapping',
    data: {
        field: 'headers',
        id: '0422dd353bd7871064e7ecac73e45a3b',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['dc22dd353bd7871064e7ecac73e45a8a'],
    table: 'sys_element_mapping',
    data: {
        field: 'honor_duplicate_headers',
        id: '0422dd353bd7871064e7ecac73e45a3b',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['9c22dd353bd7871064e7ecac73e45a8b'],
    table: 'sys_element_mapping',
    data: {
        field: 'honor_duplicate_query_params',
        id: '0422dd353bd7871064e7ecac73e45a3b',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['d022dd353bd7871064e7ecac73e45a8c'],
    table: 'sys_element_mapping',
    data: {
        field: 'http_method',
        id: '0422dd353bd7871064e7ecac73e45a3b',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['5022dd353bd7871064e7ecac73e45a8e'],
    table: 'sys_element_mapping',
    data: {
        field: 'query_params',
        id: '0422dd353bd7871064e7ecac73e45a3b',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['1422dd353bd7871064e7ecac73e45a8b'],
    table: 'sys_element_mapping',
    data: {
        field: 'retry_policy',
        id: '0422dd353bd7871064e7ecac73e45a3b',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
