# Agent-Crypto 40.6.192 — Strategy A Replay State Integrity

Parent: 40.6.191

## Correction
- Replay self-tests no longer call the history-writing replay path. The 7 acceptance scenarios are evaluated through a pure function.
- The 64-row replay history therefore remains byte-for-byte unchanged when `self_test()` runs, even when already full.
- Replay IDs now use a monotonic runtime sequence independent of `RESULTS.length`, so saturation cannot recycle IDs.
- Numeric validation rejects `null`, `undefined`, booleans and blank strings; they can no longer become zero through `Number(...)` coercion.
- Replay Acceptance now makes history preservation part of the final verdict. A changed replay store cannot report PASS.

## Static acceptance
- 7/7 deterministic scenario paths: PASS.
- Self-test store unchanged: PASS.
- Self-test replay sequence unchanged: PASS.
- `expected_move_pct: null` and blank => COST WAIT, not zero-valued evidence.
- `authorized_notional_eur: null` => RISK STOP.
- 70 manual replay runs with a 64-row cap => 64 rows retained, 64 unique replay IDs.
- Replay Acceptance => PASS only when scenarios and state-integrity proof both pass.

## Protected
- Market Core 38.15.11 unchanged.
- Operator, Web Classique, Atlas CURRENT, Oracle, Aether, Lecture Technique and TRADUS unchanged.
- Paper portfolio/ledger is not touched by these tests.
- No fetch, WebSocket, recurring timer, observer, storage write or real order added.
- Strategy A live business rules unchanged. PAPER ONLY. G3 PENDING. G9 LOCKED.

## Terrain
1. Reload Administrator until `Build 40.6.192 · Administrator` is visible.
2. Run `REPLAY ACCEPTANCE MATRIX · EXÉCUTER 7/7` and confirm `PASS · 7/7 · état replay PRÉSERVÉ`.
3. If replay history already contains rows, run acceptance again and confirm those rows remain intact.
4. Rerun `TESTS EXPLICITES`: Replay is now build 40.6.192, so a previous exact-build foundation proof must correctly require renewal.
