# Agent-Crypto Atlas Wake Event Audit

Status: WORKING BRANCH ONLY
Branch: `seven/agent-crypto-consolidation`

## Proven historical breakpoints

### 40.4.67 — DOM/runtime ownership rupture
Commit: `750f40c749fdf42cbfe16c043968ac90e69a6c8f`

Observed change:
- Atlas/OpenAI/Simulation presentation bodies were replaced by source-lazy shells;
- hydration became dependent on a later disclosure/preload path;
- the shared runtime still contained logic written for owners that historically existed at boot.

Conclusion:
40.4.67 is a genuine architectural breakpoint, not merely a visual refactor.

### 40.4.79 — HOT-core recovery
Commit: `90e309095d3dca36f17c190e242b6a51f4220bee`

Observed change:
- explicit Atlas internal HOT residency was introduced;
- `#atlas-local-ai-collapse` and core Atlas/Aerith cockpit selectors were kept resident;
- heavier peripheral bodies remained WARM/COLD.

Conclusion:
The project already recognized that Atlas core cannot depend on disclosure hydration.

### 40.4.90 — missed-transition / lost-wakeup family
Commit: `ce02d2a8189662b05c4fd69e74e0d3d6acff04fd`

Observed change:
- recurring 20 s heartbeat fallback was removed;
- AUTO became transition/event driven;
- `atlasLocalReportsAutoGateSync()` returns without re-evaluation when the computed gate string is unchanged.

Conclusion:
40.4.90 created a real lost-wakeup risk: readiness may become processable without a later event that changes the gate and causes a new evaluation.

## Canonical recovery contract

### 40.4.137 / cumulative 40.4.138
Historical owner:
`atlasCurrentPendingMarket137`

Required contract:
- genuinely new canonical becomes PENDING;
- PENDING survives readiness misses;
- existing readiness owners re-evaluate the same PENDING;
- exactly one Atlas AUTO is armed once ready;
- same completed snapshot is a no-op;
- UI disclosure is not an owner.

40.4.138 acceptance explicitly required Atlas + Auto Reader + Shared Memory + GitHub Memory to stay collapsed while a new canonical completes one automatic CURRENT.

## Current 40.4.275 layering

The current runtime is not a single clean generation. It contains cumulative layers with different historical responsibilities:

1. root `administrator/app.js` — current business/CURRENT runtime, now build 40.4.275;
2. `js/views/atlas-presentation.js` — precompiled HOT shell strategy inherited from the 40.4.99 family;
3. `js/views/view-lifecycle.js` — 40.4.99 R1 lifecycle layer and market-pulse visibility refinement;
4. `js/views/atlas-family-demand-residency.js` — 40.4.139 collapsed-UI / HOT-core boundary;
5. `js/atlas-heartbeat-rearm.js` — 40.4.212 boot-complete one-shot canonical rearm;
6. 40.4.137 wrappers retained inside root app around `atlasAfterLivecheck` / exchange-feed readiness;
7. 40.4.273 Bridge/Auth recovery;
8. 40.4.274 hidden-document source-state decoupling;
9. 40.4.275 failure-stickiness / retry-budget hardening.

This is the architectural reason one symptom can be influenced by several generations of code.

## Important current facts

### HOT root is still intentionally excluded from detach
Current `atlas-family-demand-residency.js` keeps:
- HOT root `#atlas-local-ai-collapse`;
- `hot_root_registered_for_detach:false`;
- only Auto Reader / Shared Memory / GitHub Memory are registered as closed-body demand-resident peripherals.

Therefore, the current top-level Atlas cockpit should remain resident while visually collapsed.

### Current lifecycle still owns a visibility monkey-patch
Current `view-lifecycle.js` replaces `globalThis.atlasPulseVisible` with a document-hidden predicate inherited from 40.4.99 R1.

This is a legacy monkey-patch layer sitting above current root app logic. 40.4.274 later changed hidden-document source-state behavior, so this ownership overlap must be removed or formally reconciled before the architecture can be called consolidated.

### Heartbeat rearm is boot-only
Current `atlas-heartbeat-rearm.js` performs exactly one `load` / boot-complete rearm and then stops.

It cannot guarantee a wake for a canonical snapshot arriving much later in the session.

This means long-session reliability must come from the canonical 40.4.137 pending/readiness owner, not from the 40.4.212 heartbeat.

## Latest Firefox evidence

40.4.275 successfully completed a new CURRENT for snapshot `06/09/2026 17:27:27`, ending 4/4 -> NØX -> Aerith -> REPOS.

The operator opened Atlas near the apparent start of that cycle.

This observation is compatible with an accidental disclosure/lifecycle wake, but timing alone is not proof of causality. The regression contract therefore requires a deterministic test where Atlas remains collapsed for the complete N+1 wake.

## Root architectural diagnosis

The main issue is not "Atlas needs another defibrillator".

The project has accumulated several wake/residency layers around one canonical CURRENT owner. Some are recovery layers for previous recovery layers.

The target architecture must therefore remove redundant wake ownership rather than add another fallback.

## Consolidation target

Keep exactly:
- one canonical market producer;
- one browser canonical ingestion owner;
- one PENDING CURRENT owner (`atlasCurrentPendingMarket137` semantics, eventually renamed only when safely consolidated);
- one readiness evaluator;
- one automatic scheduling owner;
- one Bridge/Auth state owner;
- one sequential report owner;
- one CURRENT close owner.

Presentation lifecycle must only present/detach allowed peripheral UI. It must not monkey-patch market/CURRENT wake eligibility.

## Candidate retirement / reconciliation order

1. retain root 40.4.275 CURRENT logic as current authority;
2. preserve the 40.4.137 pending semantics;
3. preserve 40.4.273 auth semantics;
4. preserve 40.4.274 source-state hidden-document semantics;
5. keep HOT Atlas root outside detach;
6. audit and retire the 40.4.99 R1 `atlasPulseVisible` monkey-patch from presentation lifecycle once equivalent current behavior is proven in root runtime;
7. retire the 40.4.212 boot heartbeat if the canonical pending owner is proven to re-evaluate correctly without it;
8. do not add a new scheduler, timer, observer, pending owner or wake wrapper.

## Required proof before main

A deterministic fixture must exercise the real owner sequence, not mocked status strings:

- N -> CLOSED;
- N+1 arrives while Atlas collapsed;
- readiness initially incomplete;
- readiness becomes complete;
- same pending N+1 is re-evaluated;
- exactly one AUTO cycle is armed;
- opening Atlas is never invoked;
- cycle completes 4/4 -> NØX -> Aerith -> CLOSED;
- repeating N+1 produces zero new cycle.

Only after that proof may the branch propose a product release.
