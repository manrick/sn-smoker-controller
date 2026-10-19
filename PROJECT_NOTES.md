# SmokerController project notes

## Project overview

This repository is a ServiceNow AIUX application named SmokerController.

Key files:
- `aiux.json` — app metadata and landing page
- `application.js` — global nav and app setup
- `theme.js` — app theme configuration
- `pages/` — page routes and UI screens
- `widgets/` — widget code
- `now.config.json` — ServiceNow app configuration
- `package.json` — scripts and dependencies

## Verified commands

From the project root:

```bash
cd /Users/A36690209/_Internal_Work_/ServiceNow/AIExperience_LUX/Projects/SmokerController/smokercontroller
pnpm install
pnpm build
pnpm dev
```

Useful script aliases:

```bash
pnpm build
pnpm dev
pnpm lint
pnpm run deploy
pnpm run deploy:reinstall
```

Important: in this project, the correct deploy command is `pnpm run deploy`, not `pnpm deploy`.

## Deployment workflow

### Install to the configured ServiceNow instance

```bash
pnpm run deploy
```

This was verified successfully in the project. The SDK completed the installation and reported the app URL:

```text
https://tsystemsinternationalgmbhdemo2.service-now.com/sys_app.do?sys_id=5af6a15d9c02476aaf43057e85994c60
```

If you need to overwrite the app completely:

```bash
pnpm run deploy:reinstall
```

## Local dev workflow

### Start the dev server

```bash
pnpm dev
```

The project uses the ServiceNow SDK dev server, which may proxy through the configured instance.

### Open the app

The local preview URL is typically printed by the dev server, such as:

```text
http://localhost/aiux/smokercontroller/.widget-sandbox
http://localhost/aiux/smokercontroller/home
```

## Known issues and fixes

### 1) Port 3101 conflict

If the dev server fails with:

```text
Error running script: listen EADDRINUSE: address already in use 127.0.0.1:3101
```

then an old node process is still holding the port. Kill it and restart:

```bash
ps -fp 10250
kill 10250
pnpm dev
```

### 2) Expired ServiceNow auth token

If the dev server reports that the access token expired:

```text
[now-sdk] Access Token has expired, refreshing token
```

or it does not start properly, refresh the auth alias:

```bash
pnpm exec now-sdk auth --list
pnpm exec now-sdk auth --use tsystemsinternationalgmbhdemo2
pnpm dev
```

### 3) Local preview redirects to ServiceNow login

This is expected when the dev server is proxying through the instance. If the browser shows the ServiceNow login page, sign in to the instance session and reload the local preview page.

This app was validated to work when the instance auth session is active and the server is connected to the ServiceNow demo instance.

## Build verification

The project was successfully built with:

```bash
pnpm build
```

Verified output included:
- 11 pages built
- 40 record(s) produced
- build completed successfully

## Cleanup performed

Empty unused placeholder directories were removed:
- `pages/incidents`
- `pages/home/[deviceId]`

The project was rebuilt successfully after cleanup.

## Important notes

- The dev server is not a plain static page server; it is an AIUX app that proxies through a ServiceNow instance.
- A valid ServiceNow session/auth is required for the local UI to work.
- If the browser lands on a ServiceNow login page, it is not a code regression but an auth/session issue.

## Recommended preparation for the next session

1. Run:
   ```bash
   pnpm install
   pnpm build
   ```
2. If auth is stale, run:
   ```bash
   pnpm exec now-sdk auth --list
   pnpm exec now-sdk auth --use tsystemsinternationalgmbhdemo2
   ```
3. Start:
   ```bash
   pnpm dev
   ```
4. Open the local preview URL from the terminal output.

## Current working state

The app is currently working locally when the ServiceNow instance session is valid and the dev server is running without port conflicts.

## AI cooking plan contract

Adaptive control has a separate `adaptive_maximum_chamber_temperature_c` operating ceiling (170 C default for new sessions). `maximum_chamber_temperature_c` remains the hard safety cutoff. Configure the operating ceiling and relay tolerance strictly below the cutoff, with additional headroom appropriate to the equipment's overshoot; the software cannot determine that physical margin. Existing sessions missing the operating ceiling must be configured before adaptive heating can run. No live records are migrated automatically.

At the operating ceiling, slow or stalled meat heating does not raise the target further or fault the session. Normal relay cycling continues. The existing configured heating-rate thresholds remain unchanged; phase-dependent stall thresholds and sensor-noise filtering are not introduced by this change.

Invalid adaptive limits stop heating and fault the session. A hard cutoff also stops heating and faults the session. A paused automatic AI phase cannot resume by changing only the session status to Cooking. After reviewing the fault and correcting the settings, use **Resume AI cooking** in the control-room pause/fault alert and confirm. This preserves the saved plan, phase index, and original session start time; it resets the current phase clock (including any duration requirement) so downtime cannot complete a timed phase. Earlier phases are not replayed. The adaptive target is reinitialized from the saved phase target within the configured operating limits, rather than reusing a stale elevated target.

The resume API accepts only paused automatic AI phases in Cooking, Preheating, Holding, or Fault sessions. It validates the current phase, safety cutoff, adaptive limits, and automatic-control prerequisites; the smoker must be active, online, polling, and have valid temperature data no older than 60 seconds, with the chamber below the hard cutoff. Invalid requests return an explicit error without changing the session or sending relay commands. A successful resume enables evaluation on the next normal poll; it does not issue a relay command directly or bypass the safety cutoff.

Temperature-only targets already reached may advance immediately after resume, without reheating. Resume does not insert missing physical-action checkpoints or change the saved recipe: review and perform instructions such as unwrapping before confirming. Manual checkpoints do not use Resume. Legacy manual resting steps without `minimum_duration_minutes` remain user-timed; new quality recipes enforce the declared waiting period on the server. The dashboard hides inactive chamber targets and displays a fault/pause notification.

Run the controller boundary tests with `node --test tests/adaptive-control.test.mjs`. These use mocked records and relay calls; they do not contact an instance or operate hardware.

The control room loads `ai_phase_index` with the session so gauge targets and the current meat target follow the active AI phase. For example, a smoking phase targeting 74 C must not display a later finishing phase's 95 C target. Phases without a meat target retain the plan-wide fallback.

Starting a session with adaptive temperature control enabled requires meat monitoring, a chamber target, and a positive maximum chamber temperature on the session record, even when an AI plan has been approved. Missing prerequisites return HTTP 409 without starting cooking. The control room displays the server's explanation for both returned HTTP errors and rejected browser transport requests.

Cooking plans use schema version 2 for new plans and continue to accept schema version 1 for backward compatibility. Plans are saved as JSON on a cooking session only after server-side validation. A plan contains a dish, optional meat metadata, ordered phases, optional recommendations, an estimated duration, optional safety metadata, and (in v2) structured technique metadata plus manual physical-cooking actions. The controller uses only validated temperature, duration, and safety fields for relay decisions; technique metadata is displayed as human-confirmed instructions.

Each phase has a supported name, either `automatic` or `manual` mode, and a completion rule. Automatic phases must complete by temperature or duration. Manual phases must complete through a user checkpoint and include a message. The supported phases are `preheating`, `smoking`, `wrap_checkpoint`, `wrapped`, `covered_tray`, `unwrapped_finishing`, `uncovered_crisping`, `grilling`, and `resting`. `covered_tray` represents pan-braising in a covered metal tray without requiring foil-wrapping, and `uncovered_crisping` represents an optional final uncovered high-heat step for the skin.

The plan contract is provider-neutral. Now Assist and external LLM adapters must produce this same structure; the deterministic controller remains responsible for validating limits and operating the relay.

## Pull-apart cooking quality

New external generations must declare `cooking_style` as `standard` or `pull_apart`. The AI must choose `pull_apart` for pulled pork or another shreddable result and generate recipe-specific settings rather than asking the user to invent temperatures or times. Both the Flow action system prompt and the generation request describe this contract. Missing cooking-style classification or incomplete quality settings produce an explicit validation error; no replacement recipe or invented timing is silently supplied.

A schema v2 pull-apart plan requires:

- `quality.adaptive_ceiling_c`: recipe operating ceiling, separate from the session's equipment safety cutoff.
- `quality.stall_tolerant: true`: normal stalls do not cause upward adaptive target steps. The recipe starts from each phase's chamber target, not the equipment maximum. Sustained rapid-rise reductions use median buckets from at least nine valid readings spanning 80% of the configured trend window, excluding earlier phases.
- `quality.recheck_chamber_c` and `quality.recheck_minutes`: the recipe's controlled additional-cooking temperature and recheck interval (1-120 minutes), within the recipe ceiling.
- Final automatic cooking with `completion_rule: "temperature_and_time"`, `meat_target_c`, and a positive `minimum_duration_minutes`. Both conditions must hold before advancing; this is phase elapsed time, not a claim of time spent above a collagen-conversion temperature.
- A mandatory manual `kind: "checkpoint"` phase with `checkpoint: "tenderness"` immediately after final cooking. The UI requests independent temperature verification and a probe-tenderness check. **Continue cooking** re-enters the preceding cooking phase for the recipe recheck interval, using `ai_quality_retry` without rewriting the plan. Reaching the meat target early cannot end that interval. The controller returns to the tenderness checkpoint afterward; further intervals require another user decision.
- A mandatory manual `kind: "resting"` phase immediately after tenderness, with positive `minimum_duration_minutes`. **Tender and removed - begin resting** acknowledges physical removal and starts the resting clock. Continue before the waiting period ends returns HTTP 409. Resting still requires final user confirmation, not automatic completion.
- A mandatory manual `uncover` action before an unwrapped finishing or uncovered crisping phase. Mandatory quality checkpoints and timed rest cannot be skipped through the checkpoint API.

Recipe ceilings clamp chamber targets even when adaptive control is disabled. With adaptive control enabled, the effective ceiling is the lower of recipe and session ceilings. Safety checks, online/fresh-reading requirements for resume or additional cooking, and the hard cutoff remain independent. A quality recipe never declares tenderness from a probe value or elapsed time alone; AI estimates and the physical probe still require human review.

The general **Finish cooking** action still turns heating off immediately when requested. For a quality recipe it records **Stopped**, not **Completed**, so it cannot bypass the mandatory quality workflow and report a successful recipe completion. Complete the final resting checkpoint for normal completion. Legacy plans retain their existing manual-finish behavior.

Existing saved plans and live sessions are not rewritten or upgraded. Generate a new reviewed plan to use the quality workflow; legacy temperature-only and manual checkpoint behavior remains available. The previous unconnected Now Assist UI branch returned a fixed chicken recipe regardless of the requested dish; it now reports that generation is not connected instead of offering a misleading draft. External LLM and reviewed manual plans remain supported.
