import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['e8433c423b9b4b1064e7ecac73e45ac0'],
    table: 'sys_element_mapping',
    data: {
        field: 'application',
        id: '60433c423b9b4b1064e7ecac73e45a84',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['24433c423b9b4b1064e7ecac73e45ac0'],
    table: 'sys_element_mapping',
    data: {
        field: 'base_url',
        id: '60433c423b9b4b1064e7ecac73e45a84',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['a8433c423b9b4b1064e7ecac73e45abd'],
    table: 'sys_element_mapping',
    data: {
        field: 'body',
        id: '60433c423b9b4b1064e7ecac73e45a84',
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
          "text": "Return only valid JSON matching schema_version 1. Do not return Markdown, explanations, or code fences. The root object must contain schema_version, dish, meat_type, meat_cut, meat_weight_kg, desired_result, estimated_duration_minutes, recommendations, safety, and phases. Set schema_version to the number 1. recommendations must always be an array of strings. safety must always be an object containing minimum_meat_temperature_c and maximum_chamber_temperature_c as numeric values. phases must be an array with between 1 and 12 phase objects. Each phase must contain name, mode, and completion_rule. Allowed phase names are preheating, smoking, wrap_checkpoint, wrapped, unwrapped_finishing, grilling, and resting. Use each phase name at most once and preserve the logical cooking order. Automatic phases must use mode automatic and completion_rule temperature or duration. Automatic phases may use chamber_target_c as a numeric chamber temperature, meat_target_c as a numeric meat temperature, and max_duration_minutes as a numeric time limit. Manual phases must use mode manual, completion_rule manual, and a non-empty message. The phases wrap_checkpoint and resting must always be manual phases and must never be automatic. Use manual checkpoints for wrapping, inspecting bark, applying sauce, turning or repositioning meat, removing meat, and resting when these actions cannot be determined from thermometer readings. Never use the property names phase, chamber_temperature_c, meat_temperature_c, or duration_minutes. Never return relay commands, API calls, credentials, JavaScript, database operations, or executable instructions. Never set a chamber target above device_limits.maximum_chamber_temperature_c. Never set a meat target below device_limits.minimum_meat_temperature_c when that limit is provided. Do not treat elapsed time alone as proof that meat is safe to eat when a meat thermometer is available. Use the available thermometer values and device limits from the user request. Return only the final JSON object. Every meat_target_c value must be greater than or equal to device_limits.minimum_meat_temperature_c. Never generate a meat_target_c below that minimum, even for an intermediate phase. Use duration-only completion for earlier phases when appropriate, and use the safe meat temperature for the final doneness phase."
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
    $id: Now.ID['6c433c423b9b4b1064e7ecac73e45abf'],
    table: 'sys_element_mapping',
    data: {
        field: 'capabilities',
        id: '60433c423b9b4b1064e7ecac73e45a84',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['ec433c423b9b4b1064e7ecac73e45abe'],
    table: 'sys_element_mapping',
    data: {
        field: 'connection_alias',
        id: '60433c423b9b4b1064e7ecac73e45a84',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['68433c423b9b4b1064e7ecac73e45ac1'],
    table: 'sys_element_mapping',
    data: {
        field: 'connection_timeout',
        id: '60433c423b9b4b1064e7ecac73e45a84',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['a4433c423b9b4b1064e7ecac73e45abf'],
    table: 'sys_element_mapping',
    data: {
        field: 'headers',
        id: '60433c423b9b4b1064e7ecac73e45a84',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['a4433c423b9b4b1064e7ecac73e45abc'],
    table: 'sys_element_mapping',
    data: {
        field: 'honor_duplicate_headers',
        id: '60433c423b9b4b1064e7ecac73e45a84',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['60433c423b9b4b1064e7ecac73e45abe'],
    table: 'sys_element_mapping',
    data: {
        field: 'honor_duplicate_query_params',
        id: '60433c423b9b4b1064e7ecac73e45a84',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['28433c423b9b4b1064e7ecac73e45abe'],
    table: 'sys_element_mapping',
    data: {
        field: 'http_method',
        id: '60433c423b9b4b1064e7ecac73e45a84',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['a0433c423b9b4b1064e7ecac73e45ac1'],
    table: 'sys_element_mapping',
    data: {
        field: 'query_params',
        id: '60433c423b9b4b1064e7ecac73e45a84',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
Record({
    $id: Now.ID['64433c423b9b4b1064e7ecac73e45abd'],
    table: 'sys_element_mapping',
    data: {
        field: 'retry_policy',
        id: '60433c423b9b4b1064e7ecac73e45a84',
        table: 'var__m_sys_flow_step_definition_input_07a762fb47222200b4fad7527c9a7129',
    },
})
