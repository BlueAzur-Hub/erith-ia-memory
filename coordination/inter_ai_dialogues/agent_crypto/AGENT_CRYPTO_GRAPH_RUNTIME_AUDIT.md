# Agent-Crypto — graph runtime audit and evidence

## 2026-10-30 — Administrator 40.6.711 / Market Core 38.15.11

**Status:** confirmed static-code defects and missing instrumentation. NO claim of a measured HTTP bottleneck or production fix.

Evidence: user's Firefox screenshots at roughly 09:38–09:49. The Top5 USD 24h shows BTC/ETH/BNB/XRP/SOL 5/5, **2 direct + 3 cached**, only after a long retained BTC graph. Manual Q/KNTQ/BEAM/HYPE/CAP shows 5/5, **1 direct + 4 cached**. Later **Hausses 5 shows only 3/3** (Q/KNTQ/BEAM) instead of five. The screenshots cannot prove individual HTTP timings or how many requests were restarted.

Production code checked by reading the whole Git blob **9459b633f3f63ff5d4a123909d33e5dbcc7c0e8e** for `public/agent_crypto_erith_ia/administrator/app.js`, and the native USD owner `administrator/js/graph-native-usd-406520.js`.

## 1 — Top 5 comparison re-entrancy (source-level risk)

In `app.js`, `renderComparisonAnalystPanel()` near line 12681 always clears retry/completion timers, increments `comparisonRenderToken`, and aborts `state.chartEngineV2.controller` before starting a new controller and its workers (lines ~12702–12716). It **does not compare the currently running request signature** (preset, sorted IDs, period, expected currency) against an identical in-flight request.

Meanwhile `renderAll()` schedules `renderAnalystPanel({renderAll:true})` on a new animation frame (line ~57362); recovery from the Market cache also calls `renderAll()` (lines ~45105 and 19667). These paths can restart a graph. This is a **provable missing dedup guard**, but there is no Firefox transaction trace yet proving a restart caused the observed four-minute delay.

`renderAnalystPanel()` has a `activeRequestKey` guard in its SOLO branch (~13372), while the comparison branch is dispatched **before** that guard (~13368). Reuse the principle in the comparison path, with a key that includes **currency**, preset, period, and exact requested IDs. A genuinely different selection must abort the old request; a duplicate must join or leave the existing request untouched.

## 2 — Five requests and incomplete telemetry

`renderComparisonAnalystPanel()` runs up to three workers for nonannual comparison and a single worker for annual native-USD Top 5 (lines ~12857–12863). It waits for all workers before verifying currency and alignment and rendering the complete basket. Keeping the last complete chart while waiting is intentional and MUST remain; however the UI must clearly identify that it is a retained old chart, not the requested active basket.

`state.dataBroker.chart.latencyMs` is hardcoded to `null` for a completed comparison (~12954); the data does not provide per-coin queue delay, HTTP duration, cache hit, provider rejection, alignment failure, retry or abort counts.

Code timing parameters: `ATLAS_COMPARISON_DIRECT_TIMEOUT_MS=24000`, minimum start spacing 1100ms (<60d) or 2200ms (>=60d). `atlasFetchJson()` now begins its HTTP timeout after getting a network permit; the governor has 2 chart permits and 1 non-chart permit. This does not prove any real CoinGecko rate-limit behavior; never attribute 4 min to HTTP 429 without logged evidence.

`atlasChartNeedsRefresh()` has a special clock-based 24h freshness check (~5953) and all other periods share the savedAt/rules path. Do not replace this with a weak write-time-only freshness check or relabel cached currencies.

Native USD `cmp()` now tries the already verified USD cache before fetching CoinGecko, for 24h as well as 7/30/60/90d; 365d Top 5 has its dedicated cache-first routine. Thus **the fix was NOT restricted to 60d**, despite the previous conversation's misleading focus.

## 3 — Scanner 3/3 represented under Hausses 5 (confirmed functionality defect)

- `ATLAS_SCANNER_TARGET=5`; `atlasScannerStart()` freezes five Market candidates (lines ~16650–16688).
- `atlasScannerAligned()` explicitly searches for smaller compatible subsets down to 1 (from ~15965).
- `atlasScannerCommit()` accepts `prevalidated.length > 0` and `<=5` (line ~16083), marks `status:"partial"` if missing (~16115), but the chart and comparison summary may still display `3/3` and a « comparaison complète » caption based on the three plotted rows.
- Therefore the screenshot showing **Hausses 5 / 3/3** is consistent with this intentional partial path, yet does **not** satisfy the user's explicit 5/5 requirement. The dashboard must say **« 3/5 historiques qualifiés ; deux manquants »**, identify the missing symbols and never mark it as a 5/5 complete basket.
- Preserve the three native source histories; either keep the last verified complete five-curve basket and show a non-blocking pending/partial state, or display the three authentic curves explicitly labeled *partiel 3/5*, subject to user-approved display semantics. Do not invent two curves or substitute different coins.

## 4 — Future correction — source-wide, not 60d-only

1. **Create an end-to-end transaction ID** for every chart request: selected IDs, preset, period, requested quote and start time. Deduplicate identical in-flight requests. Abort only on genuine context changes or explicit cancellation. Reset the in-flight state in success/failure/abort `finally`.
2. **Read-only timing** per asset: cache lookup elapsed, cache accepted/rejected reason, provider, governor queueMs, fetchMs, response status, retry/waitMs, validationMs, abort cause, alignedCount and total time-to-commit. No API keys or user-specific data. Add bounded ring-buffer diagnostics accessible without developer-console actions; no unsolicited overlay obstructing the graph.
3. **Preserve the EUR/USD contracts** and the five canonical Top5 BTC/ETH/BNB/XRP/SOL; verify cache-first across all periods, including special EUR 24h, scanner USD, annual USD and MAX. CoinGecko USD must never be inferred from EUR, USDT or USDC.
4. **Scanner strict target vs displayed-count**: separate `requestedCount=5` from `displayedCount`, preserve frozen Market identities, and do not claim `complete` until five native compatible histories exist.
5. Test **24h, 7d, 30d, 60d, 90d, 1y, MAX** in **both EUR and USD**, cold and warm cache, same-context auto refresh, repeated user clicks, currency switch, background pulse, vendor 429/timeout and interrupted request. Keep atomic five-curve integrity and legitimate previously acquired histories.
6. Release candidate only after tests on the **complete GitHub repository**, then commit+ZIP+SHA and explicit GitHub Pages dispatch according to `AGENT_CRYPTO_DEPLOYMENT_PROTOCOL.md`. Validate the actual loaded build and elapsed seconds in Firefox separately.

**Current disposition:** 40.6.711 can eventually show 5/5, but the delay remains unresolved. No .712 released by this audit. Do not claim performance improvement from isolated Node tests alone.
