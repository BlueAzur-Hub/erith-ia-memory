# SEVEN HEAVEN — TECHNICAL READING & SCANNER HANDOFF
Date: 2026-10-28. Status: factual relay for the next IA operator.

## 1. Current protected state
- Public Administrator: Build 40.6.640; Market Core 38.15.11. Production `main` must not be modified by this handoff.
- [PR #696](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/696) is OPEN, DRAFT, NOT MERGED: head `030781eda3a109f7d09e1352fd83e09b14b132cd`, branch `fix/technical-reading-comparison-sync-20261028`.
- The PR contains **one added line in one file**: `public/agent_crypto_erith_ia/administrator/app.js`, in `atlasRenderComparisonDetail`, calling the already existing `atlasRenderCompactDetailSummary(primary)` after `atlasBrokerSeedSpot(primary)`. This updates the compact Technical Reading header when a comparison is committed; no price, graph, ranking, cache or currency formulas were changed.
- PR #697 was a duplicate with the same corrected app.js blob and was closed unmerged. Do not recreate or merge it.
- [PR #695](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/695), scanner Market-frame freshness and EUR/USD integrity, remains OPEN DRAFT and distinct. Its 24/24 targeted regression tests are not proof of live Firefox rendering; it is not merged.
- On PR #696, targeted local checks and JavaScript syntax passed, and some GitHub CI is green; Top5 USD, Trader, Laboratory, and Seven CI failures have not been resolved. No blanket CI certification, production deployment or merge is claimed.

## 2. User Firefox observations (screenshots supplied in the 2026-10-28 conversation)
- The user opened the exact PR #696 preview via third-party `raw.githack.com` (not the official GitHub Pages deployment).
- USD: after switching comparison modes, the compact Technical Reading primary matches the visible chart and detailed card (BTW for Hausses 5, QNT for Baisses 5). The first run may display 4/5.
- EUR: initial Hausses 5 displayed 4/5, **BTW missing** (PEPE was the first available curve and compact primary); initial Baisses 5 displayed 4/5, **RAIN missing** (QNT primary). Repeated mode switches later displayed 5/5, direct/cache mixtures, with compact and detailed asset identity matching. Latest screenshots show 5/5 direct for EUR Hausses 5 (BTW/PEPE/M/ZEC/NEAR) and 5/5 direct for EUR Baisses 5 (QNT/XMR/FIGR_HELOC/RAIN/RLUSD).
- The relative Market snapshot in multiple screenshots was from 2026-10-28 03:20:56; the Firefox checks took place much later. Do not interpret that snapshot as a current market ranking or compare unlike timestamps as if equivalent.
- Crucially, the Firefox console expression reading `state.dataBroker?.chart?.result?.scanner` produced **`manquants: []`, `rejets: []`, five requested, five displayed** on the **latest successfully committed** 5/5 comparison. This does **not** recover the preceding 4/5 failure reasons; the current chart state has replaced that record.
- Firefox showed CORS failures on local Bridge endpoints such as `http://127.0.0.1:8790/system` and `http://127.0.0.1:8787/scanner-snapshot` from the `raw.githack.com` origin. These indicate that the third-party preview cannot freely access these localhost endpoints; they do not establish a CoinGecko fault, defective market candles, or the exact reason BTW/RAIN were missing. Do not ask for more console gymnastics on this basis.
- The user requested a clean final handoff and a fresh conversation. Do not make them retest completed screens.

## 3. Verified scanner control flow in branch #696
File: `public/agent_crypto_erith_ia/administrator/app.js`.
- `atlasScannerRun` tests cached histories first, queues direct acquisitions, preserves validated archive fallback, and commits a partial basket if `atlasScannerAligned` returns at least one compatible series.
- `atlasScannerSeriesCoversWindow` checks 24-hour point count and that the first/last timestamps cover the frozen 24-hour window (12-minute tolerance).
- `atlasScannerAligned` selects the largest temporally compatible subset of the **original five IDs**, without replacing a missing candidate with a lower-ranked coin; it also enforces at least 23.5 hours of common coverage for a 24-hour comparison.
- `atlasScannerFetchDirect` already has native USD CoinGecko fetching with retry; EUR tries CoinGecko direct, optionally local Bridge and verified Binance. Do NOT add unconditional retries without a demonstrated cause.
- `atlasScannerCommit` saves `scanner.unavailableIds`, `scanner.requestedIds`, `scanner.displayedIds`, and `scanner.rejected`. However, `rejected` is populated for explicit fetch failures, **not** for every series excluded by the final temporal-alignment subset. An absent series can therefore have **no individual rejection reason** recorded. This is an observability gap, not proof of a specific provider failure.
- The screenshots establish WHO was missing (BTW, RAIN) and that both were recovered on later runs, but they do not prove WHETHER the original cause was API rate limiting/network, 24h coverage, chart overlap/alignment, or another rejection. Do not invent a root cause.

## 4. Next action — one focused step for the next IA
Investigate the **first partial scanner commit diagnostic**, in read-only mode initially. Identify the smallest safe way to retain an explicit per-candidate reason (fetch failure vs missing 24h coverage vs compatibility/alignment) at the **moment of the 4/5 commit**, and make it readable without a console challenge. Do not alter PR #696 or user-proven historical curves merely to obtain logs. For any proposed code change: isolate it in its own branch/PR and add deterministic tests for 4/5, 5/5, EUR/USD, changing Market frames and interrupted scans, preserving the existing five canonical IDs; do not merge to main without live acceptance.
Then separately address the stale Market frame with PR #695 as intended; keep source timestamps honest.
Do not alter Market Core, Trader, Operator, price histories, Coffre, source identifiers, FX data or USD-by-default contract as collateral. User prefers one concrete step at a time and actual GitHub delivery.

## 5. Handoff integrity
- This file is documentation only, committed to shared coordination on `main`. It does NOT deploy the frontend or merge any PR.
- No private data, API secrets, account details, or screenshots are copied into this relay.
- Next IA should start by checking current PR #696 and #695 state and read this relay rather than repeating past tests.
