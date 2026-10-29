# Administrator 40.6.650 — Canonical recovery handoff
Date: 2026-10-29. Base: main commit cde863b81960f69fe2dc39fa1cb39097d33b6d7b. Test branch: test/administrator-40.6.650-canonical-recovery.

## Audit first
Notion source: https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099
The top-of-page toggle "AUDIT DE REPRISE SEVEN" was saved before this implementation. Astra's financial audit is preserved immediately below.

## Root causes confirmed
- 2026-10-27 commit b4368d6 removed canonical Top 3/Top 5 arrays and ranked stablecoins together with BTC/ETH/BNB/XRP/SOL.
- Target Top 5 HTML still existed but its cycle renderer replaced its identity with SOLO.
- USD presentation read the EUR generic change24h rather than a USD change.
- Legacy USD helper overrode the central quote-scoped cache key, ignoring explicit currency.
- Chart validation trusted endpoints while ignoring large internal gaps.
- Sanitizer silently dropped >8x observations; stride sampling lost real extrema.
- Solo tooltip could replace last historical point with current spot.
- Top comparison used serial awaits with multiple timeouts; old BTC chart remained during atomic load.

## Isolated code corrections
1. Canonical Top 3=BTC ETH BNB; Top 5=BTC ETH BNB XRP SOL across Market Frame, curated button, ribbon and snapshot. Dynamic scanner baskets unchanged.
2. Target Top 5 ribbon label and identity stay fixed; cycle to Solo/Hausses/Baisses/Volumes remains available; current mode is readable in chart/cycle title.
3. USD live change24hUsd and usdUpdatedAt pair with priceUsd; missing change/time => no false percentage.
4. Remove USD override of atlasChartStorageKey; central owner uses acquisition quote. Legacy cache only read when proven.
5. Validate strict time order and internal 24h gaps; reject unverified jumps, preserving raw rows passed to the validator, no silent interpolation.
6. Preserve per-bucket high and low in comparison downsample; no silent extrema removal.
7. Solo tooltip stays historical including last observed point; live quote is separate.
8. Canonical Top 3/5 use at most two fetch workers and a shared request-spacing queue, keeping atomic 5/5/3/3 commit rules.

## Limitations / acceptance
- This is NOT a claim of live-market / Firefox validation, and does not certify all values as correct.
- Extreme jumps are rejected pending independent evidence, not rendered as verified spikes. Rejected network responses are not yet durably archived.
- Top 5 may still fail if a provider lacks a true historic; do not invent values. Waiting duration is improved structurally, not measured in user's Firefox.
- No new OHLC or volume module implementation in this build. Astra's remaining source-specific OHLC / volume cautions still apply.
- Production main, Market Core 38.15.11, Trader, Bridge and real orders remain untouched.

## Gate
Node syntax checks + targeted regression on the real branch sources; ZIP and SHA256 archived by branch-only GitHub Action. Then Firefox: EUR Solo, Top3, Top5, Hausses, Baisses, Volumes; then USD; cache empty/full, switching, actual 24h coverage and historical tooltips. Merge to main only after user acceptance.
