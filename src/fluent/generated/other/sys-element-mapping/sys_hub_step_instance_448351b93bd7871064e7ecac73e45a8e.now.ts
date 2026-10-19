import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['088351b93bd7871064e7ecac73e45abb'],
    table: 'sys_element_mapping',
    data: {
        field: 'application',
        id: '448351b93bd7871064e7ecac73e45a8e',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['c08351b93bd7871064e7ecac73e45abb'],
    table: 'sys_element_mapping',
    data: {
        field: 'base_url',
        id: '448351b93bd7871064e7ecac73e45a8e',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['448351b93bd7871064e7ecac73e45ab9'],
    table: 'sys_element_mapping',
    data: {
        field: 'body',
        id: '448351b93bd7871064e7ecac73e45a8e',
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
          "text": "Return only valid JSON matching schema_version 1. The root object must contain schema_version, dish, meat_type, meat_cut, meat_weight_kg, desired_result, estimated_duration_minutes, recommendations, safety, and phases. Each phase must contain name, mode, and completion_rule. Allowed phase names are preheating, smoking, wrap_checkpoint, wrapped, unwrapped_finishing, grilling, and resting. Automatic phases must use mode automatic and completion_rule temperature or duration. Automatic temperature fields are chamber_target_c and meat_target_c. Time limits use max_duration_minutes. Manual phases must use mode manual, completion_rule manual, and include message. Never use phase, chamber_temperature_c, meat_temperature_c, or duration_minutes. Never return relay commands, API calls, credentials, JavaScript, or executable instructions. Return JSON only without Markdown fences."
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
    $id: Now.ID['8c8351b93bd7871064e7ecac73e45aba'],
    table: 'sys_element_mapping',
    data: {
        field: 'capabilities',
        id: '448351b93bd7871064e7ecac73e45a8e',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['048351b93bd7871064e7ecac73e45aba'],
    table: 'sys_element_mapping',
    data: {
        field: 'connection_alias',
        id: '448351b93bd7871064e7ecac73e45a8e',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['808351b93bd7871064e7ecac73e45abc'],
    table: 'sys_element_mapping',
    data: {
        field: 'connection_timeout',
        id: '448351b93bd7871064e7ecac73e45a8e',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['488351b93bd7871064e7ecac73e45aba'],
    table: 'sys_element_mapping',
    data: {
        field: 'headers',
        id: '448351b93bd7871064e7ecac73e45a8e',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['c88351b93bd7871064e7ecac73e45ab8'],
    table: 'sys_element_mapping',
    data: {
        field: 'honor_duplicate_headers',
        id: '448351b93bd7871064e7ecac73e45a8e',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['888351b93bd7871064e7ecac73e45ab9'],
    table: 'sys_element_mapping',
    data: {
        field: 'honor_duplicate_query_params',
        id: '448351b93bd7871064e7ecac73e45a8e',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['cc8351b93bd7871064e7ecac73e45ab9'],
    table: 'sys_element_mapping',
    data: {
        field: 'http_method',
        id: '448351b93bd7871064e7ecac73e45a8e',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['4c8351b93bd7871064e7ecac73e45abb'],
    table: 'sys_element_mapping',
    data: {
        field: 'query_params',
        id: '448351b93bd7871064e7ecac73e45a8e',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['008351b93bd7871064e7ecac73e45ab9'],
    table: 'sys_element_mapping',
    data: {
        field: 'retry_policy',
        id: '448351b93bd7871064e7ecac73e45a8e',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
