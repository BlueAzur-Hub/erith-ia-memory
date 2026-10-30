# AGENT-CRYPTO ADMINISTRATOR 40.6.705 — RECOVERY HANDOFF

Date: 2026-10-30. Branch: `test/administrator-40.6.705-recovery`.
Origin: commit `281d1f9d806a183e930640b3994d68a246de213a` from `test/administrator-406650-canonical-top5-integrity`.
No cherry-pick of PR #704, no changes to main.

## Purpose
Restore a single new version identity for the **latest** 40.6.650 recovery work without touching chart/data business logic. First 40.6.705 checkpoint, not a Firefox-certified release.

## Included in parent
- Canonical Top3 BTC ETH BNB / Top5 BTC ETH BNB XRP SOL.
- Strict historical gaps and unverified price spike handling.
- EUR/USD rate-change/cache fixes, preservation of comparison extrema.
- Max 3 comparison workers with spaced provider requests, historical Solo hover.
- Legacy Analyse and Base100 preserved in the original branch.

## 40.6.705 changes
- `administrator/build.json`: preview build identity 40.6.705, parent 40.6.650; production status false.
- `administrator/index.html`: embedded runtime and references aligned with 40.6.705.
- Existing targeted regression test now expects preview build 40.6.705.
- No live market data or manual Firefox proof fabricated.

## Release gates
1. JavaScript syntax checks for `app.js` and `js/graph-native-usd-406520.js`.
2. Targeted Node regression for canonical Top3/Top5, currency, cache, gaps, spikes, extrema, Solo tooltip.
3. Live Firefox EUR Solo > Top3 > Top5 > Hausses5 > Baisses5 > Volumes5; repeat USD. Show actual source/age for all 5 series, never fabricate 5/5.
4. Verify preservation of Analyze display, Base 100, ribbons, and volume/OHLC semantics.

## Rollback
Leave `main` unchanged. This branch can be abandoned at any time. Original source commit and the other 40.6.650 branches remain intact.

## Truth
This checkpoint **does not yet correct** all OHLC/volume shortcomings, certify 5/5 in Firefox or demonstrate better provider latency. Never advertise it as a production release.
