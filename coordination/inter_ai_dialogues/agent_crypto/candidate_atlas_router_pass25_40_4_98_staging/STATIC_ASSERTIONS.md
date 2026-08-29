# Pass25 Atlas Router — Static Assertions

Base: sealed Administrator `40.4.98` / runtime commit `d2cb4bb778df51a5a03fcdcce01027a7cd6530b6`.

## PASS26 verdict

`STATIC FAIL / PROPOSAL FROZEN / NOT FIREFOX-READY / NO BUILD`

## Proven current-runtime facts

- `atlasV2OpenAdvancedForTarget()` is the canonical route owner.
- Its order remains: manifest entry -> DOM target lookup -> missing target false -> mode/intermediate/auth -> visibility/details/persistence/hash/scroll.
- Exactly three affected cold ids: `auto-reader`, `shared-memory`, `github-memory`.
- `atlas-peripheral-lazy.js` 40.4.35 remains private source/hydration owner.
- Owner success emits `erith:presentation-resident {family:"atlas", key, build:"40.4.35"}`.
- Owner terminal failure sets `data-atlas-hydration40425="error"`, renders owner error UI, returns false, and emits no failure event.

## Static failure A — authorization ordering

The Pass25 proposal handles a missing known lazy target by scheduling hydration and setting the owner disclosure open at the current hard-fail boundary. Because canonical mode/auth checks occur only after the DOM target has been resolved, this causes hydration to begin before those canonical checks for cold advanced targets.

Required invariant violated:

`existing auth/mode semantics preserved before advanced content hydration`

This is a static architectural failure. Do not send this exact proposal to Firefox as a viable candidate.

## Static failure B — fixed timeout ambiguity

The owner exposes no terminal failure event or imperative/public hydration Promise. Existing signals are insufficient to distinguish all outcomes without an added mechanism:
- success: resident event;
- close: toggle event;
- failure while still open: dataset/error UI only.

Consequences:
- no timeout => pending listener/map can remain stale after terminal error;
- fixed timeout => a legitimate slow success after the cutoff loses its router continuation;
- polling/MutationObserver => violates the zero-polling/zero-observer budget;
- invented retry => prohibited;
- direct hydrate/fetch => prohibited.

Therefore `15000 ms` is cleanup policy, not owner truth, and cannot be promoted as a correctness boundary.

## Race/supersession review

The proposal's per-key Map and generation token are directionally correct for same-key deduplication and stale resident events. The close listener also bounds close-during-load. These properties do not cure the two blocking failures above.

The canonical synchronous path requirement remains binding: do not convert the whole router to Promise/async and do not fork steps after target resolution.

## Budget remains protected

No runtime integration has occurred. No business fetch, WebSocket, storage writer/schema, recurring interval, observer, polling, retry, second hashchange/router, source parser, direct hydrate or generic-residency retirement was introduced.

## Gate

A successor design must first prove BOTH:
1. authorization/mode gate is preserved before any cold advanced hydration starts, without speculative duplicate auth ownership;
2. terminal pending cleanup has an owner-grounded semantic handoff, or a separately approved scope change explicitly supplies one.

Until both are proven: `NO EXECUTABLE CANDIDATE / NO BUILD`.
