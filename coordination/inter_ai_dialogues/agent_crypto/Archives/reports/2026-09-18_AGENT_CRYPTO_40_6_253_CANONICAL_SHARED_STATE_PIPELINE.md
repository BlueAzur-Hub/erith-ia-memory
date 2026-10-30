# AGENT-CRYPTO 40.6.253 — DECISION INTELLIGENCE CANONICAL SHARED-STATE PIPELINE

Date: 2026-09-18
Release: **40.6.253**
Parent: **40.6.252**
Stability reference: **40.6.251**
Last pre-regression Firefox boundary: **40.6.242**
Market Core: **38.15.11**
Mode: **PAPER ONLY**
G3: **PENDING**
G9: **LOCKED**

## Why

40.6.252 proved that the presentation itself was not the Firefox problem, but it was only a diagnostic substitute.

The original Decision Intelligence chain recomputed the same owners recursively:
Event Memory → Historical Analogs → Regime → Calibration → Capital Survival → Acceptance → Explainability.

Static audit also found repeated Collector snapshot/clone work inside Event Memory archive projection.

## Canonical repair

Active owner:

`js/decision-intelligence-current-truth.js`

No build number exists in the active filename or function identities.

`administrator/index.html` is restored byte-for-byte to the stable 40.6.242 canonical-entry wiring.

`runtime-shell.html` loads the stable canonical owner once.

Legacy files remain preserved but are not loaded:
- `js/decision-intelligence-current-truth-406243.js`
- `js/decision-intelligence-current-truth-lite-406252.js`

## Shared-state pipeline

One manual open prepares:

1. current News event;
2. one Collector snapshot / records array;
3. one Event Memory archive;
4. one semantic cluster map;
5. one +24h Analog result;
6. one +48h Analog result;
7. one +24h Regime result;
8. one +48h Regime result;
9. one Calibration object;
10. one Capital Survival evaluation;
11. one architecture/safety Acceptance matrix;
12. one Explainability output.

Prepared objects are passed forward. Downstream owners no longer need to recursively recompute the earlier stages for this surface.

The resulting state is cached for the same current event and invalidated when the canonical CURRENT finalization event fires.

## Canonical file changes

- `js/event-memory.js`
  - one shared Collector snapshot per projection;
  - no double `source()` read per event.

- `js/historical-analog-engine-405015.js`
  - accepts prepared Memory archive and cluster map.

- `js/regime-qualified-analogs.js`
  - accepts a prepared Analog result.

- `js/horizon-calibration.js`
  - accepts prepared +24h/+48h qualified results.

- `js/decision-explainability.js`
  - accepts prepared Calibration, Survival and Acceptance.

- `js/decision-intelligence-acceptance.js`
  - architecture/safety only;
  - does not call runtime `.current()` owners.

- `js/decision-intelligence-current-truth.js`
  - stable canonical UI/state owner;
  - no hard-coded runtime build;
  - no fetch/timer/observer/storage/order.

- `runtime-shell.html`
  - loads the stable owner once.

- `index.html`
  - restored exactly to 40.6.242 canonical entry;
  - no build-specific Decision Intelligence injection.

## Commits

- Event Memory sharing: `3196d7a77458cc22633c5b38f4a02da97b1bcc27`
- Analog prepared inputs: `e6887ac3b4c413218963385c42a0948c3f58e2f0`
- Regime prepared Analog: `d2f3ed0cf802962db57792c912a3dfee5a198d13`
- Calibration prepared horizons: `9612ab50b1547aa7171540d8bb0f78ce528f128d`
- Explainability prepared inputs: `ff50d6e4d812bb3842763821d36cb74e11066895`
- Acceptance architecture-only: `9ce4c4fb5d22987fc5cd33dcd990da891b8b9de1`
- Canonical current-truth owner: `e23b3785196c02e4da8121f64b878ee565edf506`
- Stable runtime-shell wiring: `6d925cd9d4029ffdc79e4b7770786736890b13c4`
- Stable canonical index: `af7e98f0350657cbcd2326ab33a5273c92b964df`
- Release manifest: `a3d7ea883f92dc50f51cb6cf7faada38e00f7b82`

## Static proof

- all changed JavaScript parses: **PASS**
- build.json parses: **PASS**
- active build: **40.6.253**
- index.html exact 40.6.242 content: **PASS**
- stable canonical current-truth loaded: **YES**
- 40.6.243 heavy current-truth loaded: **NO**
- 40.6.252 lite current-truth loaded: **NO**
- hard-coded `40.6.253` in active current-truth module: **NO**
- active current-truth fetch: **NO**
- active current-truth timer: **NO**
- active current-truth observer: **NO**
- Acceptance runtime `.current()` calls: **NO**
- Event Memory duplicate `source()` records pattern: **REMOVED**
- shared Memory archive: **YES**
- shared semantic clusters: **YES**
- shared calibration inputs: **YES**
- Explainability prepared inputs: **YES**

## Protected / unchanged

- Market Core 38.15.11
- Strategy A business logic
- News owner and News archive
- Atlas CURRENT
- Oracle
- Lecture Technique
- Aether
- Window Manager
- Web Classique
- real trading remains disabled

## Firefox proof

Wait for:

`Build 40.6.253 · Administrator`

Then:

1. hard reload once;
2. confirm normal scrolling;
3. open **Decision Intelligence · vérité courante** once;
4. if News already has an event, Event must not remain stale merely because the panel mounted earlier;
5. let the one calculation finish;
6. close and reopen once — same event should reuse cached state;
7. PASS = no Firefox slowdown banner and fans settle after the one calculation.

No further version should be created until this terrain proof exists.
