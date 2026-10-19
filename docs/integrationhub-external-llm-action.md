# Fluent External LLM Action

The Flow Action, REST step, SmokerController Connection & Credential Alias, and its alias template are source-managed in Fluent. The action keeps the API name `x_tsigh_smkrctrl.generate_external_cooking_plan`, so the server-side `FlowAPI` call remains unchanged.

## Action contract
    {
      "role": "system",
      "content": "Include an instructions string on every phase: 1-3 short plain-language sentences for a beginner. For automatic phases, explain what the controller regulates after approval, what the person should monitor, and when the phase completes. For manual phases, give actions in order with exact amounts and placement. Clearly distinguish a timer from a temperature check. If a final safety check repeats an earlier meat target after a finishing phase, explain that it confirms the final probe reading and completes immediately if the probe already meets the target. Avoid jargon and vague directions."
    },

| Direction | Name | Type |
| --- | --- | --- |
| Input | `model` | String |
| Input | `cooking_request` | String |
| Output | `response` | String |

The REST step sends a `POST` request to the provider URL configured by the alias template, sets `Content-Type: application/json`, and maps its response body to `response`. Its JSON body uses the action inputs:

```json
{
  "model": "{{action.model}}",
  "temperature": 0.2,
  "response_format": {"type": "json_object"},
  "messages": [
    {
      "role": "system",
      "content": "Return only one JSON object for a SmokerController cooking plan. Do not include reasoning, Markdown, or wrapper fields. Follow schema_version 2 exactly: root fields include schema_version set to 2, dish, meat_type, meat_cut, meat_weight_kg, desired_result, estimated_duration_minutes, recommendations, safety, and phases. Allowed kinds are preheating, smoking, braise, roasting, grilling, finishing, resting, checkpoint, wrapped, covered_tray, unwrapped_finishing, and uncovered_crisping. Every phase requires a unique string id, name from available_phases, kind from that allowed list, and mode automatic or manual. completion_rule must be exactly temperature, duration, or manual; never append a target or unit. Every automatic phase requires numeric chamber_target_c; duration phases also require numeric max_duration_minutes. Never use type, actions, or object-valued completion_rule. Use meat_target_c, message, optional, technique, and manual_actions only as defined by the schema. Manual phases require a non-empty message and completion_rule manual; resting must always be manual. Automatic phases must not contain manual_actions. Keep every target within device_limits. If resting is last and a meat sensor is available, the preceding phase must be automatic, use temperature, and include meat_target_c at or above the minimum. Return only plan JSON in message.content; never return relay commands or executable instructions."
    },
    {
      "role": "user",
      "content": "{{action.cooking_request}}"
    }
  ]
}
```

## Instance setup

After installing the app, configure the `Smoker Connection Alias` using its `Smoker External LLM Connection` template. Enter the provider URL in the instance-managed connection field; the template supplies `Authorization: Bearer` header metadata. Enter the API key in the instance-managed `api_key` password field. Neither endpoint URL nor API key is stored in project source or action inputs.

## Application endpoint

The application invokes the action from the server side at:

```text
POST /api/x_tsigh_smkrctrl/smoker_relay/cooking-plan/generate
```

The endpoint validates the returned plan against schema versions 1 and 2, device limits, supported phase kinds, technique metadata, and manual actions before saving it as a draft. User approval is still required before AI control can start.