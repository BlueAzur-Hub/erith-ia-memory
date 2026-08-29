# Agent-Crypto @erith.IA — Candidate Atlas Router · Pass 25 · 40.4.98

Nature: COORDINATION ONLY / NON-LIVE STAGING / NO BUILD

## PASS26 STATUS

`STATICALLY REJECTED / FROZEN / DO NOT INTEGRATE`

Runtime authority remains:
- Administrator `40.4.98`
- runtime commit `d2cb4bb778df51a5a03fcdcce01027a7cd6530b6`
- Market Core `38.15.11` PROTECTED

No runtime/load-graph/manifest file is modified by this staging.

## What remains proven

The sealed 40.4.98 `atlasV2OpenAdvancedForTarget()` still resolves the canonical DOM node before its mode/auth transaction and returns `false` when the node is absent. The cold-router debt therefore remains OPEN for exactly:
- `auto-reader`
- `shared-memory`
- `github-memory`

`atlas-peripheral-lazy.js` 40.4.35 remains the only source-fetch/body-hydration owner. Opening the connected `details[data-collapse-key]` triggers its private hydration. Success emits `erith:presentation-resident {family:"atlas", key, build:"40.4.35"}`. Failure sets `data-atlas-hydration40425="error"` and emits no terminal failure event.

## Pass26 static rejection reason A — auth/mode ordering

Pass20 proved the canonical order:
1. manifest entry;
2. `document.getElementById(id)`;
3. missing target => `false`;
4. only then mode/intermediate/auth/pending-hash logic;
5. visibility/details/persistence/hash/scroll.

The Pass25 proposal inserted cold scheduling at step 3 and set `owner.open = true`. For a cold advanced target this can therefore start owner hydration before the canonical authorization/mode gate that would normally run after target resolution.

That is a semantic change and violates the staging requirement to preserve existing auth/mode behavior. Firefox cannot turn a known static ownership/order violation into an acceptable first candidate. The proposal is frozen before executable integration.

## Pass26 static rejection reason B — timeout is not owner truth

The fixed 15 s cleanup timeout was introduced because the owner has no failure event. Static audit shows there is no exact existing push signal that can replace it without changing scope:
- success event exists;
- close/toggle exists;
- failure only mutates owner dataset/error UI;
- no failure CustomEvent/public Promise is exposed.

Removing the timeout can leave stale pending state after terminal source failure. Keeping a fixed timeout can abandon a legitimate slow hydration that succeeds after the cutoff. Reading the dataset continuously would require polling or an observer, both excluded by the first-candidate budget.

Therefore 15 s is not a valid runtime semantic boundary and this proposal cannot be promoted under the current constraints.

## What is NOT being done

No second router, hashchange owner, Command Center handler or picker handler. No fetch/hydrate duplication. No MutationObserver/polling/retry. No Atlas generic residency retirement. No `insertAdjacentHTML` work. No `#atlas-local-ai-collapse`, no-local-producer/Ryzen, Learning, shared monolith, Market Core/CURRENT, Oracle or Backend changes.

## Next admissible design work

Before another Atlas-router staging proposal, prove an authorization-preserving insertion/refactor on the exact 40.4.98 canonical function and define a terminal owner handoff that is event-driven or otherwise semantically bounded. Do not duplicate auth logic speculatively and do not modify the lazy owner in the same first candidate without a separately justified scope decision.

Until then: runtime `40.4.98` remains authority and this folder is an audit artifact only.
