# Agent-Crypto @erith.IA — Atlas router successor contract · Pass 28

Date: 2026-08-29
Nature: COORDINATION ONLY / NON-LIVE DESIGN / NO BUILD / NO RUNTIME WRITE

## Authority

Repository HEAD before Pass28 writes: `d8e48fd0cae3fa8e58dd5e9a2f6c0f41dc097229` (Book mirror, non-Administrator runtime).
Administrator authority remains `40.4.99`, runtime commit `8a72f5b5f39345c86230bcdf362ce28c7345c83e`, status `candidate_atlas_cold_router_operator_validation_required`.
Market Core `38.15.11` remains protected.

## Problem retained from Pass20/26/27

The canonical root `administrator/app.js` owns advanced Atlas navigation. Its historical transaction resolves the manifest and DOM target before mode/auth gates. For the three cold bodies `auto-reader`, `shared-memory`, `github-memory`, the canonical target node is absent before owner hydration, so the pre-resolution `document.getElementById(id)` hard-fail remains the cold navigation boundary.

The rejected Pass25 proposal opened the lazy owner at that hard-fail and therefore could hydrate before the canonical mode/auth gates. That shape remains forbidden.

## Successor single-owner transaction

The successor must remain inside the existing canonical route owner. Conceptually split its transaction into two internal phases without adding another click/hashchange/picker owner.

### Phase A — canonical preflight, before DOM materialization

1. Normalize/decode hash/id exactly as current router.
2. Resolve `ATLAS_V2_SECTION_MANIFEST` entry by id.
3. Apply existing mode / Intermediate rules using the manifest/id, not target DOM presence.
4. From Essential, run the existing local authorization/pending-hash gate before any lazy disclosure is opened.
5. If access is denied/pending, preserve current return and pending-hash behavior; do not hydrate.
6. After authorized transition, apply the existing Advanced-mode owner exactly once.

No new authorization rule is invented. The existing code must be factored/reused rather than copied into a second helper with divergent semantics.

### Phase B — target resolution / commit

7. Resolve `document.getElementById(id)` after preflight.
8. If target exists, continue the historical synchronous transaction: visibility, owning details, picker sync, persistence, hash behavior and scroll/focus options.
9. If target is absent and id is not exactly one of `{auto-reader,shared-memory,github-memory}`, return historical `false`.
10. If target is absent and id is one of those three, hand off to the existing `atlas-peripheral-lazy.js` owner only after preflight authorization.
11. Install terminal listeners before setting existing owning `details.open=true`.
12. On matching success `{family:"atlas",key}`, re-resolve the canonical target and resume Phase B commit only if route generation/hash is still current.

## API compatibility lock

Do not globally convert `atlasV2OpenAdvancedForTarget()` to a Promise API.

- Existing/materialized target: preserve synchronous boolean behavior.
- Unknown missing target: preserve synchronous `false`.
- Authorized known cold lazy target: may synchronously report scheduled/accepted only if all historical callers are proven compatible; exact immediate-return semantics remain a static/Firefox gate.

## Race contract retained

- one pending route per lazy key;
- repeated same-key route joins the pending owner operation;
- monotonically increasing route generation;
- different/newer navigation invalidates stale continuation;
- success event must match family/key;
- close/supersession cleans route listeners/state;
- no stale scroll/focus after supersession;
- no second disclosure-triggered hydrate attempt from router code.

## Budget

The successor route itself may add no business fetch, WebSocket, storage schema/write owner, polling interval, MutationObserver, IntersectionObserver, retry loop, second hashchange owner, second Command Center owner or second module-picker owner.

It must not call private `hydrate()`, fetch `views/atlas.html`, or recreate owner body parsing.

## Explicit exclusions

Do not combine with generic Atlas residency retirement, `#atlas-local-ai-collapse`, no-local-producer/Ryzen, Learning, shared monolith, Market Core/CURRENT, Oracle or Backend/Source Intelligence.

The global `Element.prototype.insertAdjacentHTML` Atlas interception debt is already retired by 40.4.99 and is not part of this successor.

## Current status

DESIGN ONLY. No executable staging is authorized by this document. A terminal owner failure contract is still required before a successor can pass static correctness under the no-timeout/no-polling budget.
