# Now Assist Cooking Plan Skill

## Purpose

Generate a safe, reviewable cooking plan for the SmokerController application. The skill recommends phases and techniques; it does not operate relays, call device APIs, modify records, or bypass application validation.

## Skill Input

The server action should provide a JSON object with:

```json
{
  "dish": "Smoked chicken",
  "meat_type": "chicken",
  "meat_cut": "thighs",
  "meat_weight_kg": 1.8,
  "desired_result": "Smoky and tender with crisp skin",
  "available_sensors": ["chamber_temperature", "meat_temperature"],
  "device_limits": {
    "maximum_chamber_temperature_c": 250,
    "minimum_meat_temperature_c": 74
  },
  "available_phases": [
    "preheating",
    "smoking",
    "wrap_checkpoint",
    "wrapped",
    "covered_tray",
    "unwrapped_finishing",
    "uncovered_crisping",
    "grilling",
    "resting"
  ]
}
```

## Required Output

Return JSON only. Do not add Markdown fences or explanatory text outside the JSON object.

```json
{
  "schema_version": 2,
  "dish": "Smoked chicken",
  "meat_type": "chicken",
  "meat_cut": "thighs",
  "meat_weight_kg": 1.8,
  "desired_result": "Smoky and tender with crisp skin",
  "estimated_duration_minutes": 210,
  "recommendations": [
    "Inspect the surface before wrapping.",
    "Allow the meat to rest before serving."
  ],
  "safety": {
    "minimum_meat_temperature_c": 74,
    "maximum_chamber_temperature_c": 250
  },
  "phases": [
    {
      "id": "preheat",
      "name": "preheating",
      "kind": "preheating",
      "mode": "automatic",
      "chamber_target_c": 120,
      "instructions": "Wait for the smoker chamber to reach 120 C before placing the chicken inside.",
      "completion_rule": "temperature"
    },
    {
      "id": "smoke",
      "name": "smoking",
      "kind": "smoking",
      "mode": "automatic",
      "chamber_target_c": 120,
      "max_duration_minutes": 60,
      "instructions": "Keep the chamber at 120 C for 60 minutes to add smoke flavor. Then move the chicken to the covered-tray checkpoint; the later meat-probe target confirms it is safe before resting.",
      "completion_rule": "duration"
    },
    {
      "id": "prepare-tray",
      "name": "wrap_checkpoint",
      "kind": "checkpoint",
      "mode": "manual",
      "message": "Transfer the smoked chicken to a metal tray, add the braising liquid, and cover the tray tightly.",
      "instructions": "Move the chicken into a metal tray. Pour 0.33 cup of broth into the bottom of the tray, then cover the tray tightly with foil.",
      "manual_actions": [
        {"action": "transfer_to_vessel", "vessel": "metal_tray"},
        {"action": "add_liquid", "liquid_type": "chicken broth or beer", "amount": 0.33, "unit": "cup", "placement": "bottom_of_tray"},
        {"action": "cover", "cover_type": "foil"}
      ],
      "completion_rule": "manual"
    },
    {
      "id": "covered-braise",
      "name": "covered_tray",
      "kind": "braise",
      "mode": "automatic",
      "chamber_target_c": 165,
      "meat_target_c": 74,
      "max_duration_minutes": 60,
      "instructions": "Keep the covered tray in the smoker at 165 C. Watch the meat probe and continue until the center reaches at least 74 C; do not use the timer as a substitute for that reading.",
      "completion_rule": "temperature"
    },
    {
      "id": "uncover-checkpoint",
      "name": "uncover_checkpoint",
      "kind": "checkpoint",
      "mode": "manual",
      "message": "Remove the tray cover and, if crisp skin is desired, move the chicken to the smoker grate.",
      "instructions": "Carefully remove the hot tray cover. If you want crisp skin, move the chicken to the smoker grate; otherwise leave it in the tray and continue.",
      "optional": true,
      "manual_actions": [
        {"action": "uncover"},
        {"action": "reposition_to_grate", "optional": true}
      ],
      "completion_rule": "manual"
    },
    {
      "id": "crisp-skin",
      "name": "uncovered_crisping",
      "kind": "uncovered_crisping",
      "mode": "automatic",
      "chamber_target_c": 190,
      "max_duration_minutes": 10,
      "instructions": "If crisp skin is desired, keep the uncovered chicken at 190 C for up to 10 minutes. Stay nearby and stop this optional step if the surface is browning too quickly.",
      "optional": true,
      "completion_rule": "duration"
    },
    {
      "id": "final-meat-check",
      "name": "unwrapped_finishing",
      "kind": "finishing",
      "mode": "automatic",
      "chamber_target_c": 190,
      "meat_target_c": 74,
      "instructions": "Before resting, confirm the meat probe still reads at least 74 C. If it already does after crisping, this check completes immediately; otherwise continue heating until it does.",
      "completion_rule": "temperature"
    },
    {
      "id": "rest",
      "name": "resting",
      "kind": "resting",
      "mode": "manual",
      "message": "Remove the meat and let it rest before serving.",
      "instructions": "Remove the chicken from the smoker and let it rest before slicing.",
      "completion_rule": "manual"
    }
  ]
}
```

## Allowed Phase Kinds

- `preheating`
- `smoking`
- `braise`
- `roasting`
- `finishing`
- `checkpoint`
- `wrap_checkpoint`
- `wrapped`
- `covered_tray`
- `unwrapped_finishing`
- `uncovered_crisping`
- `grilling`
- `resting`

`covered_tray` means pan-braising in a covered metal tray and does not mean wrapping the meat. Use `uncovered_crisping` as an optional short high-heat phase after removing the cover to restore crisp skin.

Schema version 2 adds a unique phase `id`, a stable `kind`, optional `technique` metadata, optional `manual_actions`, and an optional phase flag. Supported technique values include vessels such as `grate`, `metal_tray`, `roasting_pan`, `pot`, `foil`, and `butcher_paper`; covers such as `none`, `foil`, `lid`, and `butcher_paper`; and manual actions such as `transfer_to_vessel`, `add_liquid`, `add_sauce`, `cover`, `uncover`, `baste`, `turn`, `reposition_to_grate`, `remove`, and `rest`.

## Rules

1. Use schema version 2 for new plans. Schema version 1 remains supported for existing plans.
1a. Every schema-v2 plan must include `safety.minimum_meat_temperature_c` at or above the device minimum and an automatic temperature phase whose `meat_target_c` reaches the highest meat target in the plan.
2. Use only phase kinds supplied by `available_phases` and give every phase a unique id and name.
3. Use `automatic` mode only for temperature-controlled or duration-controlled phases.
4. Use `manual` mode for wrapping, tray transfer, inspection, sauce application, turning, removal, and resting.
5. Every manual phase requires a concise `message` and `completion_rule: "manual"`.
6. Every automatic phase requires `completion_rule: "temperature"` or `completion_rule: "duration"`.
6a. Every phase should include 1-3 short `instructions` sentences for a beginner. Explain the human action, what the controller handles automatically after approval, and exactly when the phase completes.
7. Put physical operations in `manual_actions` on manual phases only; do not treat them as relay operations.
8. An `add_liquid` action must always include `liquid_type`, positive numeric `amount`, `unit`, and `placement`. Never write only "add liquid".
9. An `add_sauce` action must always include `sauce` and `placement`. Never write only "add sauce".
10. A `transfer_to_vessel` action must include `vessel`, and a `cover` action must include `cover_type`.
11. Never return relay commands, JavaScript, REST requests, database operations, credentials, or executable instructions.
12. Never set a chamber target above `device_limits.maximum_chamber_temperature_c`.
13. Never set a meat target below `device_limits.minimum_meat_temperature_c` when that limit is supplied.
14. If the plan ends with a resting phase and a meat thermometer is available, the immediately preceding phase must be automatic, use `completion_rule: "temperature"`, and include a safe `meat_target_c`.
14a. If that final safety check repeats a target reached earlier, explain that it checks the probe after any later finishing phase and completes immediately if the probe already meets the target; do not describe it as another timed hold.
15. Do not treat elapsed time alone as proof that meat is safe to eat when a meat thermometer is available.
16. Treat missing or invalid thermometer values as unknown; request a manual inspection or pause recommendation instead of guessing.
17. Include a manual checkpoint when the food condition cannot be determined from the available sensors, such as bark development or surface crispness.
18. Keep recommendations practical and separate from the executable phase targets.

## Failure Output

If the request lacks enough information for a safe plan, return:

```json
{
  "schema_version": 1,
  "error": {
    "code": "insufficient_information",
    "message": "A meat cut and at least one valid target or manual checkpoint are required."
  }
}
```

The server must reject this failure object for plan saving and present the message to the user without starting a cooking session.

## Verification Examples

The skill should be tested with:

- Chicken thighs with a meat thermometer
- A whole chicken without a meat thermometer
- A plan whose requested chamber target exceeds the device limit
- A missing meat weight
- An invalid or disconnected sensor
- A request to control the relay directly
- A request to skip the final safe meat temperature
- A plan requiring wrapping or visual bark inspection
