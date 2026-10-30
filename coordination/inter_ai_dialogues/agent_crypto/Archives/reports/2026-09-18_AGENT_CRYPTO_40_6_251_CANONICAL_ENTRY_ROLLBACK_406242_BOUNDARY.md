# AGENT-CRYPTO 40.6.251 — CANONICAL ENTRY WIRING ROLLBACK TO 40.6.242 BOUNDARY

Date: 2026-09-18
Release: **40.6.251**
Parent: **40.6.250**
Firefox terrain baseline: **40.6.242**
Market Core: **38.15.11**
Mode: **PAPER ONLY**
G3: **PENDING**
G9: **LOCKED**

## Trigger

Firefox terrain on 40.6.250 remained difficult to use:
- page slowdown warning;
- fans saturated during heavy subsection opens;
- live News visible while Decision Intelligence could still show startup-empty truth;
- several lazy/resident subsections appeared empty or stalled.

## Historical finding

40.6.242 is the last build explicitly recorded as Firefox terrain PASS before the current-truth Decision Intelligence surface was introduced.

40.6.243 added the canonical-entry injection of:

`js/decision-intelligence-current-truth-406243.js`

40.6.243 itself remained pending Firefox proof.

40.6.244 subsequently documented the same regression family seen again on terrain:
live News available while Decision Intelligence / News→Market could remain frozen on startup-empty state.

40.6.247 later rolled back to the **40.6.243 runtime baseline**, not to 40.6.242.

Therefore 40.6.247-40.6.250 never actually restored the last proven canonical-entry boundary.

## 40.6.251 repair

One responsibility only:

**restore `administrator/index.html` to the exact canonical-entry wiring of 40.6.242.**

The following 40.6.243 entry wiring was removed:

- `DECISION_INTELLIGENCE_CURRENT_TRUTH_MODULE`
- `injectDecisionIntelligenceCurrentTruth(...)`
- the `patchShell(...)` call that injected that module.

The module file itself is **not deleted**. It remains preserved in the repository and Git history, but is inert in 40.6.251.

## Exact proof

After removing only that injection from the current `administrator/index.html`:

- candidate length: **14409 chars**
- 40.6.242 index length: **14409 chars**
- exact content equality: **TRUE**
- 40.6.242 index blob SHA: `65ac8bc4bee31e88c8288a4260d07f04f391df30`

This is not a visual approximation or a reconstruction. It is the exact 40.6.242 canonical-entry wiring.

## Commits

- Canonical-entry rollback: `b77f88240167e151ab55b27ab8713880dd1f73f2`
- Release manifest: `ec3d29d6be5452144dae2c956ad142b8caceaa10`

## Protected / unchanged

No modification to:

- Market Core 38.15.11
- runtime-shell.html
- app.js
- News Sentinel owner/data
- Strategy A business logic
- Atlas CURRENT
- Oracle
- Lecture Technique
- Aether
- Window Manager
- Web Classique
- source thresholds
- current market archives

No new:
- timer
- observer
- fetch
- storage owner
- hydration layer
- recovery scheduler
- trading path

The 40.6.244 / 40.6.245 / 40.6.246 recovery modules are **not reintroduced** in this build.

## Firefox acceptance

Wait for:

`Build 40.6.251 · Administrator`

Then:

1. hard reload once;
2. scroll normally first;
3. open **one** formerly empty/lazy subsection;
4. wait for it to settle before opening another;
5. do not search for the 40.6.243 Decision Intelligence Current Truth surface — it is intentionally not loaded in 40.6.251.

### PASS

- no “Cette page ralentit Firefox” banner;
- page remains scrollable;
- fan load settles after normal boot;
- the tested lazy/resident subsection hydrates instead of remaining an empty shell.

### FAIL

If the slowdown or empty-body behavior survives with the exact 40.6.242 entry wiring restored, the next owner is below the canonical entry and must be isolated from the 40.6.242 runtime itself. Do not reintroduce Decision Intelligence first.

## Stop

No further runtime surgery in this release.
