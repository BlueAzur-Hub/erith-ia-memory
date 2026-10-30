# AGENT-CRYPTO 40.6.237 — ADMINISTRATOR HYDRATION CURRENT-TRUTH AUDIT

Date: 2026-09-18  
Repository: `BlueAzur-Hub/erith-ia-memory`  
Administrator: `public/agent_crypto_erith_ia/administrator/`  
Release: **40.6.237**  
Parent: **40.6.236**  
Market Core: **38.15.11**  
Mode: **PAPER ONLY**  
Gate 3: **PENDING**  
Gate 9: **LOCKED**

## Purpose

Audit-only release.

This version explains the visible Administrator presentation churn before any corrective surgery.

No runtime HTML, JavaScript, CSS, Market Core, Oracle, Atlas, Risk, Strategy A business logic, threshold, Gate state or real-order behavior is changed.

## Terrain evidence

The Firefox export supplied after 40.6.236 confirms:

- Build 40.6.236 is active.
- Market Core 38.15.11 is active.
- Binance LIVE 5/5 is active.
- All four Administrator parcours are present in the document flow.
- Parcours 01, 02 and 04 are expanded in the captured state.
- Parcours 03 is collapsed in the captured state.
- The G3 era map remains visible exactly once.
- Current Strategy A truth remains 40.6.228 + 40.6.229.

## Canonical architecture audit

Measured from the canonical source:

- `runtime-shell.html`: 429283 characters
- unique DOM ids in runtime shell: 680
- external script tags in runtime shell: 74
- `<details>` elements in runtime shell: 22
- canonical Evidence modules injected by `administrator/index.html`: 25
- Administrator presentation modules injected by `administrator/index.html`: 1
- overlap between the 25 Evidence module paths and the 74 runtime-shell external script paths: 0

The canonical entry therefore expands an already large runtime surface with a separate Evidence stack.

## Event-driven presentation refresh

`administrator-operator-focus-406216.js` can schedule presentation refresh from:

- `agent-crypto:runtime-modules-ready`
- `erith:system-hydrated`
- `agent-crypto:evidence-data-changed`
- `agent-crypto:evidence-refresh-complete`
- `agent-crypto:strategy-a-evidence-dossier-mounted`
- `agent-crypto:market-series-updated`
- `toggle`
- `click`
- `pageshow`
- `load`
- DOMContentLoaded or script-load initial path

The scheduler is bounded by a queued flag and double requestAnimationFrame.

There is no recurring timer and no MutationObserver in this owner.

## Diagnosis

The current visible "valse" does not require a hidden polling loop to exist.

The source is sufficiently explained by:

1. a large runtime shell,
2. 25 additional canonical Evidence modules,
3. a canonical mount chain that calls multiple Evidence owners,
4. multiple event-driven presentation refresh paths,
5. lazy or user-triggered panels that can appear after the initial presentation pass,
6. re-anchoring of presentation surfaces as owners become available.

Canonical diagnosis:

`EVENT_DRIVEN_PRESENTATION_CHURN_OVER_LARGE_RUNTIME_SURFACE`

## What 40.6.238 may change

One responsibility only:

**centralize Administrator presentation refresh behind one settled presentation owner/event.**

40.6.238 must not:

- modify Market Core 38.15.11
- modify Web Classique
- modify Atlas CURRENT
- modify Oracle
- modify Lecture Technique
- modify Strategy A business logic
- modify Gate state
- delete historical evidence
- invent new evidence
- add a recurring timer
- add a MutationObserver

The underlying evidence owners remain authoritative.

The correction is presentation orchestration only.

## Strategy A

Unchanged:

- PAPER ONLY
- G3 PENDING
- G9 LOCKED
- strict data/outcomes authority: 40.6.228
- execution-realism authority: 40.6.229
- natural PAPER evidence required for further Gate-3 progress

## Release commit

`805a5d58bdce4380f04cd05dd95a9c4f6e9bcb22`

## Stop condition

Audit complete.

Do not refactor the whole Administrator.

Proceed only with the bounded 40.6.238 presentation-orchestration repair.
