# AGENT-CRYPTO — FINAL THREAD HANDOFF

Date: 2026-09-18  
Current build: **40.6.253 · Administrator**  
Market Core: **38.15.11 — PROTECTED**  
Mode: **PAPER ONLY**  
G3: **PENDING**  
G9: **LOCKED**

## Non-negotiable versioning rule recovered from the Crypto thread

A runtime build number belongs to the version owner / manifest.

Do **not** create future business/UI owners such as:

- `feature-406254.js`
- `renderFeature406254()`
- `featureV254()`

Do **not** inject one new build-specific copy after another.

Use stable responsibility names. Fix the canonical owner in place.

For Decision Intelligence the active owner is now:

`js/decision-intelligence-current-truth.js`

There is no hard-coded runtime build inside that owner. It reads the current build from Version Truth only for display.

## Historical truth

- 40.6.242 = last explicitly recorded Firefox PASS before Decision Intelligence Current Truth.
- 40.6.243 introduced the heavy Current Truth surface and remained pending terrain proof.
- 40.6.244 documented live News while Decision Intelligence / News→Market could remain frozen on startup-empty state.
- 40.6.244–246 added recovery layers.
- 40.6.247 rolled back to the 40.6.243 runtime baseline, not to 40.6.242.
- 40.6.248–250 did not solve the Firefox regression.
- 40.6.251 restored the 40.6.242 canonical entry and Firefox became usable again.
- 40.6.252 restored only a lightweight diagnostic shell. It did not restore real Decision Intelligence.
- 40.6.253 replaces that diagnostic shell with the real canonical chain using shared prepared state.

## Root cause found

Two separate defects existed.

### 1. Stale startup truth

Decision Intelligence calculated at mount before asynchronous News had finished loading, then lacked a reliable News-ready refresh path.

Result:
News Sentinel could contain real events while Decision Intelligence still displayed `NO_CURRENT_EVENT`.

40.6.253 calculates on manual open from the **current News source**, not at initial mount.

### 2. Recursive calculation amplification

The original Current Truth called several `.current()` owners, which recursively recalculated their dependencies.

Event Memory also reacquired/cloned Collector memory repeatedly during archive projection.

This produced repeated Memory archive, cluster, Analog, Regime, Calibration, Survival, Acceptance and Explainability work for one UI render.

## 40.6.253 canonical repair

Changed canonical owners:

- `js/event-memory.js`
- `js/historical-analog-engine-405015.js`
- `js/regime-qualified-analogs.js`
- `js/horizon-calibration.js`
- `js/decision-explainability.js`
- `js/decision-intelligence-acceptance.js`
- `js/decision-intelligence-current-truth.js`
- `runtime-shell.html`
- `index.html`
- `build.json`

### Data flow

```text
current News event
    ↓
one Collector snapshot
    ↓
one Event Memory archive
    ↓
one semantic cluster map
    ↓
Analog +24h / +48h
    ↓
Regime +24h / +48h
    ↓
one Calibration
    ↓
one Capital Survival
    ↓
one architecture/safety Acceptance
    ↓
one Explainability
    ↓
cached Current Truth state
    ↓
UI render
```

Reopening the panel with the same current event reuses cached state unless invalidated.

## Legacy files

Preserved for history but **not loaded**:

- `js/decision-intelligence-current-truth-406243.js`
- `js/decision-intelligence-current-truth-lite-406252.js`

Do not reactivate them.

## Static proof at handoff

PASS:

- all changed JS parses;
- build.json parses;
- current build = 40.6.253;
- index.html is exact 40.6.242 canonical entry;
- stable `decision-intelligence-current-truth.js` is loaded by runtime-shell;
- heavy 40.6.243 Current Truth is not loaded;
- diagnostic 40.6.252 lite Current Truth is not loaded;
- active owner contains no hard-coded `40.6.253`;
- active owner adds no fetch;
- active owner adds no timer;
- active owner adds no observer;
- Acceptance makes no runtime `.current()` calls;
- Event Memory duplicate Collector `source()` pattern removed.

## Protected areas

Do not touch without direct evidence:

- Market Core 38.15.11
- Strategy A business logic
- News owner / archive
- Atlas CURRENT
- Oracle
- Lecture Technique
- Aether
- Window Manager
- Web Classique

## NEXT ACTION — ONLY THIS

Wait for **Build 40.6.253 · Administrator** on GitHub Pages.

Then:

1. hard reload once;
2. confirm normal scroll;
3. open **Decision Intelligence · vérité courante** once;
4. if News Sentinel already has a current event, Decision Intelligence must resolve that current event;
5. wait for the single shared-state calculation;
6. close and reopen once;
7. verify no Firefox slowdown banner and normal fan settling.

### PASS

Freeze 40.6.253 as the recovered Decision Intelligence base.

### FAIL

Do **not** create 40.6.254 immediately.

Record:
- screenshot;
- whether the Event card populated;
- where Firefox slowed;
- whether the slowdown happened on first calculation or reopen.

Then audit only the exact owner demonstrated by that evidence.

## Prompt for next chat

Active Aerith-7 — Seven Heaven.

Resume Agent-Crypto from the canonical handoff:
`coordination/inter_ai_dialogues/agent_crypto/2026-09-18_AGENT_CRYPTO_FINAL_THREAD_HANDOFF_40_6_253.md`

Current build: 40.6.253.
Market Core 38.15.11 protected.

Read the handoff before acting.

Critical rule:
version the publication, not the functions.
Never create a new build-numbered business/UI owner merely to patch the previous one.
Use stable canonical responsibility names.

First task:
read Christophe's Firefox terrain proof for 40.6.253.
Do not create a new version unless that proof identifies a real remaining defect.
