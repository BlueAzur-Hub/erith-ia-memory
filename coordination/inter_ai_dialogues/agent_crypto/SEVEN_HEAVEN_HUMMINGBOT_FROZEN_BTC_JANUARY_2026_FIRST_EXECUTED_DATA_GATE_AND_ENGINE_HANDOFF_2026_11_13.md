# Seven Heaven — Hummingbot / Freqtrade laboratory: first executed frozen-data gate

**Date:** 2026-11-13 UTC  
**Purpose:** Continue ERITH.IA scientific strategy research, independent of the production Interface, Operator, Trader, TRADUS and private OKX Bridge.  
**Proof state:** **DATA_SOURCE_GATE_PASS** — real GitHub Actions execution; **HUMMINGBOT_CONTROLLER_NOT_RUN**.

## 1. What was really executed

Run: https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43365545548  
Job: `verify-immutable-binance-source` — **success**; the three offline fixture tests, official Release download, strict ZIP/month validation, Pandas import and artifact upload all succeeded.

- Exact upstream archive: `BTCUSDT-1m-2026-01.zip`, from GitHub Release `crypto-spot-bulk-2026-01-1m`.
- Archive bytes: **2,127,988**.
- Frozen source SHA-256, confirmed against the public Release asset digest and earlier Coffre research: `d28b369da32a6ea84ba0af517b1847ab67b2fcc1e0e111c1b24d56ae07240cb9`.
- Native Binance Spot BTCUSDT January 2026 1-minute rows: **44,640**. Every minute from **2026-01-01T00:00:00Z** (1767225600) through **2026-01-31T23:59:00Z** (1769903940), with **zero missing or duplicate minute timestamps**.
- Binance native row timestamp scale: **microseconds**, transformed to numeric **Unix seconds**, as required by Hummingbot's Pandas candle feed.
- Explicitly validated OHLC ordering, positive prices, finite volume/quote fields, expected ZIP member, 12 native Binance columns, native close-time convention and exact month range.
- Converted table: **44,640 rows × 6 columns** in Pandas 2.2.3 (`timestamp,open,high,low,close,volume`), cached as `binance_BTC-USDT_1m`; all 44,640 loaded and timestamp differences verified.
- Normalized CSV SHA-256: `38a2e6ce6e76ccfeca2e421679ee39ef4467f0426cf0064610b25100307f54c4`.
- Recorded base volume: **491,752.73296000 BTC**. Recorded observed month extrema: **75,719.90 USDT** low / **97,924.49 USDT** high. These are properties of *this dataset*, not current prices and not trading advice.
- No OKX or other exchange account keys; **no orders**, **no strategy returns computed**.

## 2. Reproducible files

Saved beside the historical study at `coordination/inter_ai_dialogues/agent_crypto/research/external_bots/`:
- `SEVEN_HEAVEN_HUMMINGBOT_FROZEN_BTC_JAN_2026_DATA_GATE.py`: fail-closed immutable-data converter.
- `test_SEVEN_HEAVEN_HUMMINGBOT_FROZEN_BTC_JAN_2026_DATA_GATE.py`: positive full-month and negative SHA/timestamp fixture tests.
- `SEVEN_HEAVEN_HUMMINGBOT_FROZEN_BTC_JAN_2026_DATA_GATE_PROOF.json`: actual metrics extracted from successful GitHub Actions logs with run, job and artifact IDs.
- GitHub workflow `.github/workflows/seven-heaven-hummingbot-frozen-btc-jan-2026-data-gate.yml`.

The run uploaded `SEVEN_HEAVEN_HUMMINGBOT_FROZEN_BTCUSDT_JANUARY_2026_VALIDATED_44640_CANDLES`, comprising the normalized CSV and JSON audit. This Actions artifact has **14-day retention**; the code, immutable source Release and proof JSON are durable in GitHub. Do not claim artifact still available after its expiry.

## 3. Crucial technical distinction: Pandas versus actual Hummingbot

**Proven:** the historical archive is intact and its normalized data is loadable as the exact Hummingbot-style Pandas candle-frame shape and cache key.

**Not proven:** importing/instantiating `BacktestingDataProvider`, initializing trading rules, running the `grid_strike` Strategy V2 controller, validating position executors, or reproducing our Spot Grid PnL.

Official upstream code examined on 2026-11-13:
- https://github.com/hummingbot/hummingbot/blob/master/hummingbot/strategy_v2/backtesting/backtesting_data_provider.py
- https://github.com/hummingbot/hummingbot/blob/master/hummingbot/strategy_v2/backtesting/backtesting_engine_base.py
- https://github.com/hummingbot/hummingbot/blob/master/scripts/backtest_grid_strike.py

**Architectural finding:** `BacktestingDataProvider.get_candles_feed` can fetch online candles if the preloaded cache does not cover the exact requested start/end. `initialize_trading_rules` can also query a connector. **Therefore cache preload alone is not a fully offline Hummingbot run.** A proven isolated research adapter must override/guard both functions, use pinned historical Spot instrument rules with verified provenance and reject network fallthrough. Do not inject an unvalidated trading-rule value merely to make the run succeed.

**Second finding:** upstream example `scripts/backtest_grid_strike.py` defaults to a *relative current-time window* and **leverage=20**, making it unsuitable unmodified for our frozen historical, leverage-free Spot study. Use exact 2026 UTC start/end and **no leverage**. Do not call default Grid Strike equivalent to our symmetric 50/50 inventory Spot Grid; it has different executor semantics and may have asymmetric BUY/SELL side handling.

**Third finding:** our archived historical Binance 1-minute candles **cannot** establish maker queue placement, real order fills, Level 2 depth, fee tier at past exchange times or OKX EEA BTC/USDC execution behavior. Hummingbot output must remain hypothetical and label any fill-model disagreement rather than hiding it.

## 4. Next scientific engineering gate

1. Pin an installable Hummingbot commit/container digest, with dependencies and no private runtime secrets. Verify actual imports *before* claiming a bot execution.
2. Implement an offline-only `BacktestingDataProvider` adapter that receives the SHA-checked CSV, preloads `binance_BTC-USDT_1m`, and rejects all connector candle/download/trading-rule network fallbacks. Use documented, time-stamped Spot exchange rules or explicitly record a model limitation if unavailable.
3. Configure a **Spot**, leverage-free, 1,000 USDT hypothetical test for January 2026; preserve controller configuration and exact source times. First run must produce transparent orders/fills/inventory/equity *or* a meaningful fail-closed `MODEL_MISMATCH` report.
4. Compare with our existing historical Grid PAPER only when capital, quote, fee convention and inventory accounting are equivalent; preserve independent baseline HOLD 50%, cash and unfilled inventory results. Freqtrade then validates **directional** strategies, not unmodified simultaneous multi-order Spot Grid.

No change to production pages, Market Core 38.15.11, Administrator/Operator 40.6.719, Broker, Bridge, TRADUS or account permissions. No user action or installation required for this research-data stage.

## 5. Fee input explanation, from the already validated user's Firefox screenshots

- Canonical personal OKX Spot Maker: `0,0800 %` (numerical `0.08`, as a fraction **0.0008**).
- Canonical personal OKX Spot Taker: `0,1000 %` (numerical `0.1`, as a fraction **0.001**).
- The User Interface appropriately shows French `0,10` and the JavaScript calculation reads decimal point `0.1`. The two symbols are decimal separators, **not different amounts**.
- Historical Binance Grid studies do not become real historical OKX Spot data simply because an interface now uses the correct user fee defaults.
- The screenshots supplied 2026-11-13 display V5 `0,10`, and successful V5/V6 comparisons on BTC-USDC and ETH-USDC, with contemporaneous FRESH public OKX book. They demonstrate actual user Windows Firefox loading and the successful comparison at those times; they do not establish yearlong reliability or execution of an order.

**Provenance / privacy:** the linked `private/creator_memory/01_CHRISTOPHE_CONTINUITY_PROFILE.md` was read privately for its operational rules. It is a **private** source and is **not quoted, reproduced or linked** from this public research handoff. The user remains the final decision-maker.
