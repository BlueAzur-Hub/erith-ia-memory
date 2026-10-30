# AGENT-CRYPTO 40.6.238 — ADMINISTRATOR PRESENTATION REFRESH SINGLE SETTLED OWNER

Date: 2026-09-18  
Repository: `BlueAzur-Hub/erith-ia-memory`  
Administrator: `public/agent_crypto_erith_ia/administrator/`  
Release: **40.6.238**  
Parent: **40.6.237**  
Market Core: **38.15.11**  
Mode: **PAPER ONLY**  
Gate 3: **PENDING**  
Gate 9: **LOCKED**

## 1. Responsibility

One responsibility only:

**Centralize Administrator presentation refresh behind one settled presentation owner/event.**

This is a presentation-orchestration repair.

It does not alter market logic, Strategy A business logic, Evidence truth, Gate truth or real-order behavior.

## 2. Terrain basis

The Firefox export immediately before this repair confirms:

- Build 40.6.237 active
- Market Core 38.15.11 active
- Binance LIVE 5/5
- Administrator active
- Strategy A historical truth still visible and frozen
- presentation density remains large enough to justify the bounded orchestration repair

The 40.6.237 audit established:

`EVENT_DRIVEN_PRESENTATION_CHURN_OVER_LARGE_RUNTIME_SURFACE`

## 3. Code changes

### administrator-operator-focus-406216.js

The owner now uses:

`agent-crypto:administrator-presentation-settled`

as the single effective presentation-refresh entrance.

Raw lifecycle signals call the settlement scheduler first.

The scheduler:

- accumulates raw reasons
- coalesces them through the existing double-requestAnimationFrame boundary
- dispatches one settled presentation event
- performs presentation refresh only from that settled event

Removed from the presentation path:

- direct per-event refresh
- delegated Foundation re-run from presentation refresh
- `agent-crypto:market-series-updated` as a presentation trigger
- redundant click-settled trigger

Retained as bounded inputs:

- runtime modules ready
- system hydrated
- Evidence data changed
- Evidence refresh complete
- Strategy A Evidence Dossier mounted
- Strategy A details toggle
- pageshow
- load / DOM readiness

No recurring timer.

No MutationObserver.

### administrator/index.html

Canonical mount now requests:

`AgentCryptoAdministratorOperatorFocus.requestSettled("canonical-mount")`

instead of bypassing settlement with:

`AgentCryptoAdministratorOperatorFocus.refresh("canonical-mount")`

The remaining reference to `refresh` in the canonical entry is availability introspection only, not an invocation.

## 4. Static verification

The modified presentation JavaScript passed a parse-only JavaScript syntax validation before publication.

No duplicate Evidence module was introduced.

No new presentation module was introduced.

## 5. Protected surfaces

Unchanged:

- Market Core 38.15.11
- Web Classique
- Aether
- Atlas CURRENT
- Oracle
- Lecture Technique
- Strategy A business logic
- Gate state
- real-order behavior
- historical Evidence values

## 6. Strategy A state

Still:

- PAPER ONLY
- G3 PENDING
- G9 LOCKED
- strict data/outcomes authority: 40.6.228
- execution-realism authority: 40.6.229
- historical Evidence chain frozen after 40.6.236

Natural PAPER evidence remains a separate track.

## 7. Commits

Presentation owner surgery:

`e8d3923148835134c2e82d03f264b483871dfcad`

Canonical-entry routing:

`75c96f3f18a3619935b0fe95ae00a7a73cd58db9`

Release manifest:

`e6b631092b91774c5de48523e13886eddedf952f`

## 8. Firefox terrain proof required

Reload until:

`Build 40.6.238 · Administrator`

Then verify:

1. normal load settles without repeated visible panel repositioning;
2. Strategy A / Evidence can be opened and closed once without creating a duplicate G3 era map;
3. Atlas remains present;
4. Oracle remains present;
5. Lecture Technique remains intact;
6. G3 era map remains one stable surface;
7. export one Firefox markdown after settlement.

If these conditions pass, close the 40.6.238 presentation-orchestration debt.

Do not broaden the repair before that proof.
