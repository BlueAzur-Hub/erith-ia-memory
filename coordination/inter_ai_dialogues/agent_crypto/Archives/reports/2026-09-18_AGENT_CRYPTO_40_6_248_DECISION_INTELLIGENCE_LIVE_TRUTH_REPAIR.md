# AGENT-CRYPTO 40.6.248 — DECISION INTELLIGENCE LIVE TRUTH REPAIR

Date: 2026-09-18
Release: **40.6.248**
Parent: **40.6.247**
Market Core: **38.15.11**
Mode: **PAPER ONLY**
G3: **PENDING**
G9: **LOCKED**

## Context

40.6.247 restored the stable pre-cascade runtime after 40.6.244 → 40.6.246 were rejected on Firefox terrain.

The next repair is deliberately local to **Analyse & décision**.

## Root cause

The existing Event Intelligence chain already reads the canonical News owner dynamically:

`AgentCryptoNewsEventSource -> AtlasEventIntelligence -> AtlasEventMemory -> Analogs -> Regime -> Calibration -> Capital Survival`

No new data owner is needed.

Two local presentation/acceptance defects remained:

1. the 40.6.243 Decision Intelligence surface could stay frozen on its startup state when opened only after News had already hydrated;
2. the acceptance matrix still required a legacy `snapshot().false_propagation` field that the current canonical `ErithVersionTruth` owner no longer exposes.

## Repair

Modified:

- `js/decision-intelligence-current-truth-406243.js`
- `js/decision-intelligence-acceptance.js`

The surface now refreshes on:

- its own explicit open;
- `erith:presentation-resident`;
- the already existing Aether-News and current-finalized events.

The acceptance matrix now checks the current Version Truth invariants:

- single visible owner;
- build.json authority;
- version branching disabled;
- reload_current_build disabled.

The Version Truth owner itself is **not modified**.

## Commits

- Acceptance contract repair: `90775949c3649262a4b97635e9b78b40836bf028`
- Current-truth open/residency refresh: `6fab822a5b4be53cc4526e08b2429c78b482ef3c`
- Release: `4a434ee761f9c1bab4958a8318d3ed56ce97ce04`

## Protected

Unchanged:

- Market Core 38.15.11
- Web Classique
- Aether owner
- News fetch owner
- Atlas CURRENT
- Oracle
- Lecture Technique
- Strategy A business logic
- Gate state

No new timer.
No observer.
No storage owner.
No order.

## Firefox proof

Reload to:

`Build 40.6.248 · Administrator`

Open:

`Analyse & décision → Decision Intelligence · vérité courante`

One screenshot is sufficient.
