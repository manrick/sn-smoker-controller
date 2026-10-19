import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['277fc5f93b97871064e7ecac73e45ac3'],
    table: 'sys_element_mapping',
    data: {
        field: 'application',
        id: '637fc5f93b97871064e7ecac73e45a96',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['ef7fc5f93b97871064e7ecac73e45ac2'],
    table: 'sys_element_mapping',
    data: {
        field: 'base_url',
        id: '637fc5f93b97871064e7ecac73e45a96',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['637fc5f93b97871064e7ecac73e45ac1'],
    table: 'sys_element_mapping',
    data: {
        field: 'body',
        id: '637fc5f93b97871064e7ecac73e45a96',
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
      "content": {{action.cooking_request}}
    }
  ]
}`,
    },
})
Record({
    $id: Now.ID['ab7fc5f93b97871064e7ecac73e45ac2'],
    table: 'sys_element_mapping',
    data: {
        field: 'capabilities',
        id: '637fc5f93b97871064e7ecac73e45a96',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['237fc5f93b97871064e7ecac73e45ac2'],
    table: 'sys_element_mapping',
    data: {
        field: 'connection_alias',
        id: '637fc5f93b97871064e7ecac73e45a96',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['af7fc5f93b97871064e7ecac73e45ac3'],
    table: 'sys_element_mapping',
    data: {
        field: 'connection_timeout',
        id: '637fc5f93b97871064e7ecac73e45a96',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['677fc5f93b97871064e7ecac73e45ac2'],
    table: 'sys_element_mapping',
    data: {
        field: 'headers',
        id: '637fc5f93b97871064e7ecac73e45a96',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['e77fc5f93b97871064e7ecac73e45ac0'],
    table: 'sys_element_mapping',
    data: {
        field: 'honor_duplicate_headers',
        id: '637fc5f93b97871064e7ecac73e45a96',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['a77fc5f93b97871064e7ecac73e45ac1'],
    table: 'sys_element_mapping',
    data: {
        field: 'honor_duplicate_query_params',
        id: '637fc5f93b97871064e7ecac73e45a96',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['eb7fc5f93b97871064e7ecac73e45ac1'],
    table: 'sys_element_mapping',
    data: {
        field: 'http_method',
        id: '637fc5f93b97871064e7ecac73e45a96',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['6b7fc5f93b97871064e7ecac73e45ac3'],
    table: 'sys_element_mapping',
    data: {
        field: 'query_params',
        id: '637fc5f93b97871064e7ecac73e45a96',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['2f7fc5f93b97871064e7ecac73e45ac0'],
    table: 'sys_element_mapping',
    data: {
        field: 'retry_policy',
        id: '637fc5f93b97871064e7ecac73e45a96',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
