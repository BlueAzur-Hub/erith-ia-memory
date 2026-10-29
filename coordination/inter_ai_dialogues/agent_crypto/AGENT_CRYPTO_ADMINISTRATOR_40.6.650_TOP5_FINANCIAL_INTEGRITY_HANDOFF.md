# AGENT-CRYPTO ADMINISTRATOR 40.6.650 — ISOLATED RESTORATION AND FINANCIAL INTEGRITY

## Source of truth
- Production base: 1e50f2145abf6679546ae049726bc35a833491ed; **main is unchanged**.
- Test branch: `test/administrator-406650-canonical-top5-integrity`.
- Version: **40.6.650 PREVIEW ONLY**; Firefox not yet certified.
- Notion: https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099 (audit published before branch modifications).

## Changes
- restore canonical Top 3/5 identities
- restore market-frame reference baskets
- protect Target banner while Solo
- preserve raw historical peaks
- refuse 24h gaps and unqualified x8 spikes
- protect Solo historical hover
- preserve extrema in comparison downsampling
- pair USD with USD variation
- remove incompatible cache key override
- update module self-test fixture
- preview script cache-bust/index build 14
- Intentionally unchanged: Market Core 38.15.11, Trader, Bridge, real-order controls, and prior Base100 & Analyse rendering.

## Known limits / no overclaiming
- URL preview is a branch checkout, not production deployment and not a substitute for Firefox verification.
- Network latency remains potentially high because five comparison histories are fetched sequentially; no claim of performance repair.
- No comprehensive full-app CI run is claimed. The new targeted Node regression is included.
- New strict gap and spike checks can reject incomplete or unverified histories; preserve source observations in acquisition diagnostics rather than silently inventing points.
- 5/5 is not promised when providers cannot prove five complete histories.
- Full alignment of all EUR/USD spot owners and real browser tooltip paths needs integration verification.
- No ZIP packaged by this Git-object-only pass; branch files and this handoff are durable and reviewable.

## Required acceptance matrix
1. EUR then USD: Solo BTC, Top3 BTC/ETH/BNB, Top5 BTC/ETH/BNB/XRP/SOL; Hausses/Baisses/Volumes remain dynamic.
2. USD 110/+5% vs EUR 100/+10% must never be crossed; cache writes remain native-quote keyed.
3. 22-hour missing interval rejected as complete 24h, raw 100/101/1000/102 not silently filtered.
4. Last historical Solo hover stays historical; sampled historical peak survives.
5. No regression in Base100 and restored legacy Analyse (no MKT/HIST).
6. Test Firefox including cold and warm caches and rapid EUR→USD switches before considering a merge.
