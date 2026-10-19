import { Record } from '@servicenow/sdk/core'

Record({
    $id: Now.ID['159d0df13b97871064e7ecac73e45a8d'],
    table: 'sys_variable_value',
    data: {
        document: 'sys_hub_step_instance',
        document_key: '65bcc9313b97871064e7ecac73e45a2c',
        order: 25,
        value: '{"type":"ADV_NV","value":[]}',
        variable: '4328e2fb47222200b4fad7527c9a7164',
    },
})
Record({
    $id: Now.ID['35bcc9313b97871064e7ecac73e45a8a'],
    table: 'sys_variable_value',
    data: {
        document: 'sys_hub_step_instance',
        document_key: '65bcc9313b97871064e7ecac73e45a2c',
        order: 100,
        value: '1',
        variable: '58715a1c53f22010d3a8ddeeff7b1248',
    },
})
Record({
    $id: Now.ID['39bcc9313b97871064e7ecac73e45a8b'],
    table: 'sys_variable_value',
    data: {
        document: 'sys_hub_step_instance',
        document_key: '65bcc9313b97871064e7ecac73e45a2c',
        order: 12,
        value: '35aa573fd7802200bdbaee5b5e610375',
        variable: 'f11ebf865f101300a09a2abd7f466652',
    },
})
Record({
    $id: Now.ID['599d0df13b97871064e7ecac73e45a8c'],
    table: 'sys_variable_value',
    data: {
        document: 'sys_hub_step_instance',
        document_key: '65bcc9313b97871064e7ecac73e45a2c',
        order: 25,
        value: 'post',
        variable: 'e85b7ebf47222200b4fad7527c9a71e3',
    },
})
Record({
    $id: Now.ID['79bcc9313b97871064e7ecac73e45a8a'],
    table: 'sys_variable_value',
    data: {
        document: 'sys_hub_step_instance',
        document_key: '65bcc9313b97871064e7ecac73e45a2c',
        order: 10,
        value: 'af7801b13b57871064e7ecac73e45a2c',
        variable: '262882f03b23320057a4a2e334efc4f0',
    },
})
Record({
    $id: Now.ID['7dbcc9313b97871064e7ecac73e45a8b'],
    table: 'sys_variable_value',
    data: {
        document: 'sys_hub_step_instance',
        document_key: '65bcc9313b97871064e7ecac73e45a2c',
        order: 100,
        value: '60000',
        variable: '7a59009bc7522010820469467ec260c0',
    },
})
Record({
    $id: Now.ID['b9bcc9313b97871064e7ecac73e45a89'],
    table: 'sys_variable_value',
    data: {
        document: 'sys_hub_step_instance',
        document_key: '65bcc9313b97871064e7ecac73e45a2c',
        order: 100,
        value: '1',
        variable: '15288f755bd24110ab933520b881c713',
    },
})
Record({
    $id: Now.ID['bdbcc9313b97871064e7ecac73e45a8a'],
    table: 'sys_variable_value',
    data: {
        document: 'sys_hub_step_instance',
        document_key: '65bcc9313b97871064e7ecac73e45a2c',
        order: 13,
        value: '18409d8007482000dada43c0d1021e8f',
        variable: 'c30a451d2f201300a09a839fb18c95b4',
    },
})
Record({
    $id: Now.ID['dd9d0df13b97871064e7ecac73e45a8c'],
    table: 'sys_variable_value',
    data: {
        document: 'sys_hub_step_instance',
        document_key: '65bcc9313b97871064e7ecac73e45a2c',
        order: 30,
        value: '{"type":"ADV_NV","value":[{"attributes":{"mandatory":false,"omit_if_empty":false},"name":"Content-Type","value":"application/json"}]}',
        variable: '371837f1c71003007b237f48cb9763b0',
    },
})
Record({
    $id: Now.ID['f1bcc9313b97871064e7ecac73e45a8b'],
    table: 'sys_variable_value',
    data: {
        document: 'sys_hub_step_instance',
        document_key: '65bcc9313b97871064e7ecac73e45a2c',
        order: 15,
        value: '',
        variable: 'a67a8ef03b23320057a4a2e334efc472',
    },
})
Record({
    $id: Now.ID['fdbcc9313b97871064e7ecac73e45a89'],
    table: 'sys_variable_value',
    data: {
        document: 'sys_hub_step_instance',
        document_key: '65bcc9313b97871064e7ecac73e45a2c',
        order: 400,
        value: 'ef751ff07301330025d71afe2ff6a7f9',
        variable: '37be397587c03300a8cc7d5e27cb0ba2',
    },
})
Record({
        $id: Now.ID['smoker-external-llm-rest-body-value'],
        table: 'sys_variable_value',
        data: {
                document: 'sys_hub_step_instance',
                document_key: '65bcc9313b97871064e7ecac73e45a2c',
                order: 45,
                value: `{
    "model": "{{action.model}}",
    "temperature": 0.2,
    "response_format": {"type": "json_object"},
    "messages": [
        {
            "role": "system",
            "content": "Return only one JSON object for a SmokerController schema_version 2 cooking plan. Do not include reasoning, Markdown, or wrapper fields. Root fields include dish, meat_type, meat_cut, meat_weight_kg, desired_result, cooking_style, estimated_duration_minutes, recommendations, safety, and phases. cooking_style is standard or pull_apart; use pull_apart for pulled pork or shreddable meat. Follow plan_contract including pull_apart_quality and pull_apart_checkpoints from the cooking request. For pull_apart supply quality with numeric adaptive_ceiling_c, recheck_chamber_c, recheck_minutes and stall_tolerant true; choose conservative recipe-specific values, not the emergency equipment limit. All automatic targets must stay below that recipe ceiling. Require final temperature_and_time cooking with meat_target_c and positive minimum_duration_minutes, then a mandatory manual checkpoint with checkpoint tenderness, then a mandatory manual resting phase with positive minimum_duration_minutes. Put a mandatory manual uncover action checkpoint before uncovered finishing. Never equate reaching temperature with tenderness. Allowed kinds are preheating, smoking, braise, roasting, grilling, finishing, resting, checkpoint, wrapped, covered_tray, unwrapped_finishing, and uncovered_crisping. Every phase requires a unique string id, name, kind, and mode automatic or manual. completion_rule is temperature, duration, temperature_and_time, or manual. Every automatic phase requires numeric chamber_target_c; duration phases require numeric max_duration_minutes. Never use type, actions, or object-valued completion_rule. Manual phases require a message and completion_rule manual; resting is manual. Automatic phases cannot contain manual_actions. Keep every target within device_limits. Standard recipes must verify final meat temperature immediately before resting. Pull-apart recipes must verify temperature and time, then request an independent temperature and tenderness check before resting. Return only plan JSON in message.content; never return relay commands or executable instructions."
        },
        {
            "role": "system",
            "content": "Include an instructions string on every phase: 1-3 short plain-language sentences for a beginner. For automatic phases, explain what the controller regulates after approval, what the person should monitor, and when the phase completes. For manual phases, give actions in order with exact amounts and placement. Clearly distinguish a timer from a temperature check. If a final safety check repeats an earlier meat target after a finishing phase, explain that it confirms the final probe reading and completes immediately when the probe is already at the target. Avoid jargon and vague directions."
        },
        {
            "role": "user",
            "content": "{{action.cooking_request}}"
        }
    ]
}`,
                variable: '6c6073f1c71003007b237f48cb97633b',
        },
})
