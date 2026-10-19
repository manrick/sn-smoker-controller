import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['92fe49793b97871064e7ecac73e45ad0'],
    table: 'sys_element_mapping',
    data: {
        field: 'application',
        id: '0afe49793b97871064e7ecac73e45a96',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['5efe49793b97871064e7ecac73e45acf'],
    table: 'sys_element_mapping',
    data: {
        field: 'base_url',
        id: '0afe49793b97871064e7ecac73e45a96',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['defe49793b97871064e7ecac73e45acd'],
    table: 'sys_element_mapping',
    data: {
        field: 'body',
        id: '0afe49793b97871064e7ecac73e45a96',
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
      "content": "Generate only schema_version 1 JSON matching the SmokerController cooking-plan contract. Never return relay commands, API calls, credentials, JavaScript, or executable instructions. Use manual checkpoints when a food condition cannot be determined from thermometer readings."
    },
    {
      "role": "user",
      "content": "{{action.cooking_request}}"
    }
  ]
}`,
    },
})
Record({
    $id: Now.ID['1afe49793b97871064e7ecac73e45acf'],
    table: 'sys_element_mapping',
    data: {
        field: 'capabilities',
        id: '0afe49793b97871064e7ecac73e45a96',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['9efe49793b97871064e7ecac73e45ace'],
    table: 'sys_element_mapping',
    data: {
        field: 'connection_alias',
        id: '0afe49793b97871064e7ecac73e45a96',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['1efe49793b97871064e7ecac73e45ad0'],
    table: 'sys_element_mapping',
    data: {
        field: 'connection_timeout',
        id: '0afe49793b97871064e7ecac73e45a96',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['d2fe49793b97871064e7ecac73e45acf'],
    table: 'sys_element_mapping',
    data: {
        field: 'headers',
        id: '0afe49793b97871064e7ecac73e45a96',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['56fe49793b97871064e7ecac73e45acd'],
    table: 'sys_element_mapping',
    data: {
        field: 'honor_duplicate_headers',
        id: '0afe49793b97871064e7ecac73e45a96',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['16fe49793b97871064e7ecac73e45ace'],
    table: 'sys_element_mapping',
    data: {
        field: 'honor_duplicate_query_params',
        id: '0afe49793b97871064e7ecac73e45a96',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['5afe49793b97871064e7ecac73e45ace'],
    table: 'sys_element_mapping',
    data: {
        field: 'http_method',
        id: '0afe49793b97871064e7ecac73e45a96',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['d6fe49793b97871064e7ecac73e45ad0'],
    table: 'sys_element_mapping',
    data: {
        field: 'query_params',
        id: '0afe49793b97871064e7ecac73e45a96',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['9afe49793b97871064e7ecac73e45acd'],
    table: 'sys_element_mapping',
    data: {
        field: 'retry_policy',
        id: '0afe49793b97871064e7ecac73e45a96',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
