# External LLM Setup

The Flow Action, REST step, HTTP connection defaults, and Connection & Credential Alias template are defined in Fluent source. The API key value is the only provider setting that must be supplied on each ServiceNow instance.

## Instance setup

1. Install the built SmokerController app.
2. Open the `Smoker Connection Alias` and configure a connection using the `Smoker External LLM Connection` template.
3. Enter the provider URL in the template's connection field and confirm the `Authorization` header with the `Bearer` prefix.
4. Enter the API key in the masked `api_key` credential field and save it on the instance.

Do not store the API key in project files, action inputs, cooking sessions, or browser requests. The action receives only `model` and `cooking_request`.

## Application endpoint

Call the server-side endpoint:

```text
POST /api/x_tsigh_smkrctrl/smoker_relay/cooking-plan/generate
```

Example request:

```json
{
  "sessionId": "COOKING_SESSION_SYS_ID",
  "dish": "Smoked chicken",
  "meat_type": "chicken",
  "meat_cut": "thighs",
  "meat_weight_kg": 1.8,
  "desired_result": "Smoky and tender with crisp skin",
  "model": "configured-model"
}
```

The endpoint saves the provider response as a validated `draft` plan. Approval is still required before AI control can start. The adapter expects an OpenAI-compatible response with plan JSON in `choices[0].message.content` and rejects malformed, unsafe, or unsupported plans.