# SEVEN HEAVEN · Strategy Lab — V4.6 Extended Historical Research · Source and Verification Plan
**Date:** 2026-11-13 · **State:** research specification only; **V4.6 is NOT built, released, tested or installed**  
**Main workspace:** `coordination/inter_ai_dialogues/agent_crypto/research/strategy_lab/`  
**Program baseline:** V4.5.0 user Firefox UI received; release in [central registry](./README.md); [V4.5 evidence](./SEVEN_HEAVEN_STRATEGY_LAB_V4_5_OWNER_FIREFOX_ACCEPTANCE_AND_RESEARCH_HANDOFF_2026_11_13.md).

## 1 · Scientific goal

Move from recent 30/90-day market snapshots toward *reproducible, multi-regime* studies without pretending longer history improves profitability by itself. Priority windows: **2019–2021** and **2024–2025**, examined as **separate blocks** (do not fabricate the missing 2022–2023 bridge). Compare fixed strategy definitions on the same instrument, interval, exact UTC period, initial capital and fee/slippage assumptions. Explicitly report 0-trade configurations as **staying in cash**, not winning strategies.

**No real orders, API keys, account reads, Freqtrade or Hummingbot runtime dependency.** This source extension is not a migration of Trader, Administrator, Operator or OKX Bridge.

## 2 · Official historical source and contract

Preferred public reference: [Binance Public Data, official repository](https://github.com/binance/binance-public-data/blob/master/README.md), publication at [data.binance.vision](https://data.binance.vision/).

- Dataset: **Spot BTCUSDT** (BTC/USDT), interval **1h** initially, monthly CSV-in-ZIP files.
- Official URL *pattern* (example only, do not claim every requested file has been tested): `https://data.binance.vision/data/spot/monthly/klines/BTCUSDT/1h/BTCUSDT-1h-2020-01.zip`. Sibling file: `.zip.CHECKSUM`.
- Each download must be checked against its publisher-provided ZIP SHA-256 checksum; save the actual expected digest, downloaded ZIP digest and normalized CSV digest separately. A SHA-256 digest without a trusted expected value detects *subsequent changes*, not the origin by itself.
- **IMPORTANT FORMAT CHANGE:** Spot open and close timestamps use **milliseconds** before January 2025 and **microseconds** from 2025-01-01; convert both to UTC seconds with explicit magnitude checks. Never mistake 2025 microseconds for milliseconds.
- Validate CSV schema: `open_time,open,high,low,close,volume,close_time,...`, finite positive OHLC, volume nonnegative, `high>=max(open,close)`, `low<=min(open,close)`, one-hour alignment, strictly ascending timestamps, no duplicates, missing bars, rows from the wrong UTC month or unexpected row count.
- Do not assume BTC/USDT historical Binance prices are interchangeable with OKX BTC/USDC. Record source, venue, base/quote, UTC boundaries, and source sample resolution per independent study.
- Verify market-specific trading minimums, maker/taker fees and hypothetical slippage independently. Use transparent scenario sensitivity when historical account-specific fees are unknown.

## 3 · Safe first implementation slice — NOT YET IMPLEMENTED

**A. Download/import pilot (offline-first and bounded):** choose *one* known monthly ZIP, validate checksum, parse and normalize the 1h CSV, then report missing/duplicate timestamps, sample span, OHLC sanity, CSV SHA and provenance. No autobulk download. Bound network size and ZIP decompression; reject path traversal/multiple unexpected entries/zip bombs. Reject failure rather than inventing candles.

**B. Compatibility adapter:** retain V4.5 `workspace/` and its caches untouched. Add a separate, tagged `BINANCE_SPOT_BTCUSDT_1H_MONTHLY` source variant after tests; store only approved normalized data with a deterministic, versioned manifest. Never silently overwrite any existing artifact, nor mix with the OKX loader.

**C. Long blocks:** assemble contiguous validated months for each chosen period; report unsupported/missing months explicitly. Never join 2021→2024 into a synthetic unbroken history. If source length exceeds UI / RAM / compute limits, create *bounded chronological research slices*, not an unreviewed change to every limit.

**D. Research comparison:** run fixed EMA, Bollinger, DCA, Buy&Hold and CASH references first, then predeclared RSI filters and new strategy families as independently scoped releases. Compare net return, maximum drawdown, fees, number of fills, exposure, no-trade frequency, trade win rate (closed positions only) and holdout results; show data gaps and uncertainty.

## 4 · Hardware and safety budget

- User operates a Windows/Python 3.13 laboratory on a small USB drive; the last owner UI reported approximately **4.06 GB free** and a **2.5 GB protected reserve**. These are observations, not a standing guarantee of current free space.
- Prefer 1h (or eventually 4h) data to avoid 1m import explosion. Check free bytes **before** downloads and **before** extraction; reserve space for the owner's other archived documents. A future 32 GB USB is optional, not assumed present.
- All network traffic for this module is read-only public market data; no credentials. Failing checksum, size, market identity, continuity or storage gates must stop the import without modifying any existing workspace.
- Before upgrading the runtime, independently back up `E:\seven_heaven_strategy_lab\workspace\`. Do not copy this personal folder to a public GitHub repository.

## 5 · Acceptance evidence required before calling it V4.6

1. Deterministic fixture tests: 2020 **milliseconds**, 2025 **microseconds**, leap-day/month boundaries, malformed row, wrong month, duplicate/out-of-order/missing candles, invalid OHLC, checksum mismatch, malicious ZIP paths, excessive size, insufficient disk reserve.
2. A small real *public* archived month download with its matching checksum; record verified SHA, market, timeframe, row count, UTC start/end and explicit gaps. **This plan does not claim it has been downloaded.**
3. Independently reproduce the normalized sample in the existing PAPER engine *without changing its baseline*, and compare against identical source/fee assumptions. Report any deviations.
4. Windows Python 3.13 test and browser acceptance, then owner Firefox/USB confirmation. **GitHub CI success is not owner USB acceptance.**
5. One full versioned release ZIP only after all gates, SHA-256 published and receipt confirmed; keep the active USB runtime and private `workspace/` clean.

## 6 · Sequencing

- **Now completed:** V4.5 owner UI acceptance evidence and continuity reconciliation in the shared registry/manifest; source research and scoped technical plan.
- **Next engineering deliverable:** single-module, deterministic Binance monthly 1h archive validator with tests and real sample provenance (before any UI change).
- **Later:** safely integrate validated monthly historical sources, broader multi-regime comparisons, capital sizing, then optional independent Freqtrade/Hummingbot PAPER comparisons.
- **V5:** a separate, explicitly controlled PAPER bot study, *not* real trading.

**Rule:** evidence first; quality of historical data second; strategy research third; bots last. No promises of gains and no changes to user data through documentation work.
