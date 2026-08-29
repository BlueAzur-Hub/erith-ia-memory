# Pass25 Atlas Router — Static Assertions

Base: sealed Administrator `40.4.98` / runtime commit `d2cb4bb778df51a5a03fcdcce01027a7cd6530b6`.

## Proven on current runtime

- `atlasV2OpenAdvancedForTarget()` remains the canonical route owner.
- Exact current hard-fail remains: canonical `document.getElementById(id)` followed by `if (!target) return false`.
- Exactly three affected cold ids: `auto-reader`, `shared-memory`, `github-memory`.
- Existing `atlas-peripheral-lazy.js` remains build `40.4.35` and private hydration owner.
- Owner success emits bubbling `erith:presentation-resident {family:"atlas", key, build:"40.4.35"}`.
- Owner failure sets `data-atlas-hydration40425="error"` and emits no failure event.
- Owner public contract exposes diagnostics/state only, including `hydrated()`, not an imperative hydrate API.

## Prototype budget

The staging proposal adds only:
- one in-memory Set of exactly 3 ids;
- one in-memory pending Map;
- one monotonically increasing in-memory generation;
- one bounded `erith:presentation-resident` listener per pending key;
- one bounded owner `toggle` listener per pending key;
- one bounded cleanup timeout per pending key.

It adds no:
- business/network fetch;
- WebSocket;
- storage schema or writer;
- interval/polling loop;
- MutationObserver;
- IntersectionObserver;
- retry policy;
- second hashchange owner;
- second Command Center click owner;
- second module-picker owner;
- DOM source parser;
- direct call to private owner hydrate.

## Functional invariants required before executable integration

1. Existing-target path must remain synchronous and functionally byte-equivalent after target resolution.
2. Unknown missing target must still return `false`.
3. Known cold lazy target may synchronously return `true` only as accepted/scheduled; this requires Firefox caller validation.
4. A later route intent must invalidate stale lazy continuation.
5. Repeated same-key intent must join/update one pending operation, not cause a second hydration trigger.
6. `details.open=true` remains the only hydration trigger invoked by the router.
7. Success must re-resolve canonical id and re-enter the existing router exactly once.
8. Close-during-load must clean pending state without retry.
9. Terminal source error must eventually clean pending state without retry; the proposal uses bounded timeout only because owner emits no error event.
10. Generic Atlas residency remains untouched until this router is proven in Firefox.

## Static status

`PASS FOR DESIGN ISOLATION / NOT A RUNTIME PASS / FIREFOX REQUIRED`

The proposal file is intentionally not referenced by `administrator/index.html` or any runtime manifest and therefore cannot alter the live Administrator.
