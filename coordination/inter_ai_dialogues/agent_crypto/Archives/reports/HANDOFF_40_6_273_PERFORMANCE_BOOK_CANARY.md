# HANDOFF — 40.6.273 PERFORMANCE / TRANSFORMER BOOK CANARY

## Starting point
Current release after this handoff: **40.6.273**.
Rollback checkpoint: **40.6.272**.
Protected engine: **Market Core 38.15.11**.

## Why this surgery exists
The Ryzen still runs the interface, but the Transformer Book exposed a severe boot regression: the simplest Classic view could take more than three minutes and previously froze before Oracle. Historical project evidence says the Book used to run the same product reactively. Treat the Book as the performance canary; do not solve this by removing Oracle, Math Core, Intermediate or Administration from the Book.

## Root causes identified in code
1. Canonical entry `index.html` was rewriting essentially every local JS/CSS URL with `?release=<build>`. That defeats cross-release browser reuse on every release and contradicts the cache-reuse policy already established in the 40.4.63 performance audit.
2. The runtime shell already carries ~75 local scripts; canonical entry additionally injected 25 Strategy A evidence modules + 1 presentation module directly into the document.
3. Legacy `strategy-a-replay-acceptance.js` still auto-loaded seven evidence supplements on `window.load`, an obsolete second boot path.
4. Historical 40.4 performance work already established the correct architecture: resident critical engines, presentation/dossier work demand-loaded, no unnecessary closed/offscreen work.

## 40.6.273 changes
- Stable local JS/CSS URLs are no longer globally cache-busted per build.
- Strategy A evidence pack has one owner: `js/strategy-a-evidence-demand-loader.js`.
- Same evidence modules, same order, no feature deletion.
- Load begins on explicit Strategy A intent or after first paint during browser idle; one module per idle slice.
- Legacy 40.6.192 auto-bootstrap is retired and only delegates on explicit compatibility call.
- One targeted cache token was added to the changed replay-acceptance script only.

## DO NOT TOUCH
- Market Core 38.15.11.
- Oracle business logic or Math Core.
- Shared Memory schemas/data.
- Atlas CURRENT 4/4 → NØX → Aerith.
- Lecture Technique.
- Strategy A thresholds/gates/order policy.
- Web Classic.
- User's three-view contract on Book: Classic + Intermediate + Administration.
- Oracle + Math Core must remain available in Classic on Book.

## Terrain protocol
1. Ryzen: verify boot and navigation first.
2. Transformer Book: load normally; do not spam reload.
3. Success means Book can be slower than Ryzen but must not freeze, must not raise sustained Firefox slow-page warnings, and Classic must become usable in a reasonable time.
4. Verify Oracle + Math Core on Book.
5. Verify Intermediate and Administration can be entered.
6. Open Strategy A; evidence modules may appear progressively because they are now idle/demand paced.
7. If failure: STOP. Do not create 40.6.274 blindly. Profile remaining boot owners in runtime-shell/app.js against the historical 40.4.66/40.4.82 demand-residency architecture.

## Next diagnosis if Book still fails
Focus on remaining always-resident shell owners and app.js execution, especially closed/offscreen presentation, duplicated event paths, DOM detach/restore churn and per-view initialization. Do not remove functionality as a shortcut.
