# Agent-Crypto 40.6.187 — Evidence Single-Owner Firefox Repair

## Type
Runtime stabilization / anti-amplification repair.

## Terrain trigger
Build 40.6.186 was visibly loaded in Firefox, but Firefox still raised the page-slowdown warning. The 40.6.184/40.6.185 gate-label hook was already rolled back, so 40.6.187 targets the remaining Evidence refresh architecture rather than adding another presentation patch.

## Surgery
- Retire the 40.6.181 monkey-patch that wrapped `AgentCryptoStrategyAEvidenceDossier.render()` and queued supplement hydration after every dossier render.
- Retire autonomous refresh listeners from `strategy-a-evidence-dossier-supplement-integrator.js`.
- Keep the initial supplement mount owned by the canonical Administrator entry.
- Make `strategy-a-evidence-lifecycle-truth.js` the explicit refresh owner: one dossier render, one supplement mount, one gate-truth render.
- Replace the legacy fan-out receipt `agent-crypto:evidence-view-refreshed` with `agent-crypto:evidence-refresh-complete` in this lifecycle layer.
- Retire lifecycle boot auto-refresh; operator refresh, evidence-data change, and BFCache restore remain explicit triggers.

## Protected invariants
- Market Core 38.15.11 unchanged.
- Web Classique unchanged.
- Atlas CURRENT unchanged.
- Oracle unchanged.
- Lecture Technique unchanged.
- Aether unchanged.
- No Strategy A threshold or business-logic change.
- No new recurring timer or MutationObserver.
- No new storage owner or business-network request.
- PAPER ONLY; no real-order path.
- G3 remains PENDING.
- G9 remains LOCKED.
- No profitability claim.

## Terrain proof still required
1. Reload / Bridge restart on Firefox and verify normal Administrator initialization remains responsive.
2. Verify the Evidence Dossier still contains the three G3 supplemental panels.
3. Trigger `Actualiser preuves` once and verify a single stable refresh without a Firefox slowdown warning.

This release does not mark Firefox terrain proof as PASS before those checks are observed.
