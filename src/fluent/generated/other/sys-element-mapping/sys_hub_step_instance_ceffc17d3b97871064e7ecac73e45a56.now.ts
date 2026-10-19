import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['82ffc17d3b97871064e7ecac73e45a84'],
    table: 'sys_element_mapping',
    data: {
        field: 'application',
        id: 'ceffc17d3b97871064e7ecac73e45a56',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['4effc17d3b97871064e7ecac73e45a83'],
    table: 'sys_element_mapping',
    data: {
        field: 'base_url',
        id: 'ceffc17d3b97871064e7ecac73e45a56',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['ceffc17d3b97871064e7ecac73e45a81'],
    table: 'sys_element_mapping',
    data: {
        field: 'body',
        id: 'ceffc17d3b97871064e7ecac73e45a56',
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
          "text": "Generate only schema_version 1 JSON matching the SmokerController cooking-plan contract. Never return relay commands, API calls, credentials, JavaScript, or executable instructions."
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "{\\"dish\\":\\"Smoked and grilled chicken thighs\\",\\"meat_type\\":\\"chicken\\",\\"meat_cut\\":\\"boneless chicken thighs\\",\\"meat_weight_kg\\":1.8,\\"desired_result\\":\\"Tender and juicy inside, with a smoky flavor and lightly crisp exterior\\",\\"available_sensors\\":[\\"chamber_temperature\\",\\"meat_temperature\\"],\\"device_limits\\":{\\"maximum_chamber_temperature_c\\":250,\\"minimum_meat_temperature_c\\":74},\\"available_phases\\":[\\"preheating\\",\\"smoking\\",\\"wrap_checkpoint\\",\\"wrapped\\",\\"unwrapped_finishing\\",\\"grilling\\",\\"resting\\"]}"
        }
      ]
    }
  ]
}`,
    },
})
Record({
    $id: Now.ID['0affc17d3b97871064e7ecac73e45a83'],
    table: 'sys_element_mapping',
    data: {
        field: 'capabilities',
        id: 'ceffc17d3b97871064e7ecac73e45a56',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['8effc17d3b97871064e7ecac73e45a82'],
    table: 'sys_element_mapping',
    data: {
        field: 'connection_alias',
        id: 'ceffc17d3b97871064e7ecac73e45a56',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['0effc17d3b97871064e7ecac73e45a84'],
    table: 'sys_element_mapping',
    data: {
        field: 'connection_timeout',
        id: 'ceffc17d3b97871064e7ecac73e45a56',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['c2ffc17d3b97871064e7ecac73e45a83'],
    table: 'sys_element_mapping',
    data: {
        field: 'headers',
        id: 'ceffc17d3b97871064e7ecac73e45a56',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['46ffc17d3b97871064e7ecac73e45a81'],
    table: 'sys_element_mapping',
    data: {
        field: 'honor_duplicate_headers',
        id: 'ceffc17d3b97871064e7ecac73e45a56',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['06ffc17d3b97871064e7ecac73e45a82'],
    table: 'sys_element_mapping',
    data: {
        field: 'honor_duplicate_query_params',
        id: 'ceffc17d3b97871064e7ecac73e45a56',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['4affc17d3b97871064e7ecac73e45a82'],
    table: 'sys_element_mapping',
    data: {
        field: 'http_method',
        id: 'ceffc17d3b97871064e7ecac73e45a56',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['c6ffc17d3b97871064e7ecac73e45a84'],
    table: 'sys_element_mapping',
    data: {
        field: 'query_params',
        id: 'ceffc17d3b97871064e7ecac73e45a56',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['8affc17d3b97871064e7ecac73e45a81'],
    table: 'sys_element_mapping',
    data: {
        field: 'retry_policy',
        id: 'ceffc17d3b97871064e7ecac73e45a56',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
