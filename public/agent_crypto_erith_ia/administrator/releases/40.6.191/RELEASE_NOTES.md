# Agent-Crypto 40.6.191 — Strategy A Foundation Proof Integrity

Parent: 40.6.190

## Correction
- A current `FOUNDATION_PASS` now requires an **explicit operator test** bound to the exact builds currently loaded for Replay, Paper Lifecycle, After-Cost Metrics and Auto Lifecycle Bridge.
- A historical receipt without a tested-module build manifest remains historical evidence only; it cannot silently become a current PASS.
- A missing module/method, missing build identity or build drift invalidates the current PASS.
- `strategy-a-foundation-applicability-truth.js` now owns the same truth for the visible matrix, public API and JSON export.
- The export button is intercepted by that strict owner, removing the old UI/API/export contradiction.

## Static acceptance
- Exact current builds + explicit passing test => current PASS.
- Build drift after PASS => PASS rejected.
- Required module missing after PASS => PASS rejected / INCOMPLETE.
- Historical unbound receipt alone => no current PASS.
- Pure self-test of these four cases: PASS in local Node validation before publish.

## Protected
- Market Core 38.15.11 unchanged.
- Operator, Web Classique, Atlas CURRENT, Oracle, Aether, Lecture Technique and TRADUS unchanged.
- No implicit foundation test, no business-network request, recurring timer, observer or real order added.
- Strategy A live business rules unchanged. PAPER ONLY. G3 PENDING. G9 LOCKED.

## Terrain
1. Reload Administrator until `Build 40.6.191 · Administrator` is visible.
2. Before running tests, verify an unbound old receipt is **not** shown as a current FOUNDATION_PASS.
3. Click `TESTS EXPLICITES` once. If every current module/preflight is ready, verify the proof says it is bound to current builds.
4. Export `STRATEGY_A_CERTIFICATION_MATRIX.json` and verify Gate 2/7 and `foundation_truth` exactly match the visible matrix.
