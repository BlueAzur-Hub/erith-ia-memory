# Agent-Crypto 40.6.193 — Gate 1 / Gate 3 Temporal Coverage Truth

Parent: 40.6.192

## Correction
- The selected 24h screen period can no longer prove source period.
- Valid point percentage and temporal coverage are independent metrics.
- Source cadence must be explicit metadata; unknown cadence remains unknown.
- Actual span, max gap, gap count, span coverage and temporal coverage are exposed.
- A 24h owner becomes `STRUCTURED_24H_QUALITY_PROVEN` only when source period and temporal coverage contract both pass.
- Historical adapter rejects BTC EUR prices less than or equal to zero.
- `time_truth` is recognized as strict time semantics by the G3 readers.

## Static acceptance
- 2 points / 5 min with a 24h source => not temporally complete.
- 4 points spanning 24h with a 1430-minute hole => rejected; gap detected.
- 7-day source with a 24h-like display context => remains 7-day, not 24h.
- 289 points every 5 minutes spanning 24h => temporal quality passes.
- BTC EUR 0 and -1 => historical input not ready.
- All three module self-tests PASS; Node syntax checks PASS.

## Protected
- Market Core 38.15.11 unchanged.
- Operator, Web Classique, Atlas CURRENT, Oracle, Aether, Lecture Technique and TRADUS unchanged.
- Replay 40.6.192 and Foundation 40.6.191 logic unchanged.
- No fetch, WebSocket, recurring timer, observer, storage write or real order added.
- PAPER ONLY. G3 PENDING. G9 LOCKED.

## Terrain
1. Reload until `Build 40.6.193 · Administrator` is visible.
2. In Structured Data Truth, verify `Points valides` and `Couverture temps` are distinct.
3. In History Owner Discovery, `QUALITY_PENDING` is valid when cadence metadata is absent; do not force `PROVEN`.
4. Historical Evidence Adapter must report `Prix ≤ 0 = 0` on clean real data.
5. The next functional step is the first complete t0 decision row (`NO_TRADE` allowed), not another label patch.
