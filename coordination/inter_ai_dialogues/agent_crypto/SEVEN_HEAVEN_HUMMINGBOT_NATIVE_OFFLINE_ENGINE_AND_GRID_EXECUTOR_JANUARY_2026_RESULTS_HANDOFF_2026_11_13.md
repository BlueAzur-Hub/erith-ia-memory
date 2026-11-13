# Seven Heaven — Actual Hummingbot engine import and first native Grid Executor replay

**Date:** 2026-11-13 UTC  
**Destination:** Shared inter-AI coordination `coordination/inter_ai_dialogues/agent_crypto/`  
**Owners:** MASTER research; downstream consumers Operator Yoann / Trader / TRADUS only after validation.  
**Status:** **TWO REAL GITHUB ACTIONS EXPERIMENTS PASS**; true Hummingbot engine import/offline candles and native GridExecutorSimulator replay. **NOT** a full Strategy V2 controller test or certified OKX Spot Grid simulation.

## 1. Checked pre-existing foundation

- The previous [immutable 44,640-minute dataset gate](./SEVEN_HEAVEN_HUMMINGBOT_FROZEN_BTC_JANUARY_2026_FIRST_EXECUTED_DATA_GATE_AND_ENGINE_HANDOFF_2026_11_13.md) succeeded on GitHub Actions. The historical source is the release `crypto-spot-bulk-2026-01-1m/BTCUSDT-1m-2026-01.zip`, original SHA-256 `d28b369da32a6ea84ba0af517b1847ab67b2fcc1e0e111c1b24d56ae07240cb9`.
- Normalized 1-minute candle CSV SHA-256: `38a2e6ce6e76ccfeca2e421679ee39ef4467f0426cf0064610b25100307f54c4`.
- 2026 January 1 to 31 UTC, **44,640 consecutive minute bars**, Binance Spot BTCUSDT. Not OKX BTC/USDC; no orderbook, account or live fills.
- The raw ZIP and normalized CSV are never silently substituted. Each new Actions run re-downloads the frozen public source and validates its digest before any Hummingbot code is invoked.

## 2. Experiment A: actual Hummingbot engine import and provider cache

**Successful executed run:** https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43366839385

**Code:** `research/external_bots/SEVEN_HEAVEN_HUMMINGBOT_NATIVE_OFFLINE_PROVIDER_PROBE.py`  
**Machine proof:** `research/external_bots/SEVEN_HEAVEN_HUMMINGBOT_NATIVE_OFFLINE_PROVIDER_PROBE_PROOF.json`

- Used **official Docker Hummingbot image**, pinned to `hummingbot/hummingbot@sha256:b676cb7279ca147b76a510777abf515a0d2f1b17e45a70da4831bb03a587c8e1`.
- Real classes instantiated: `hummingbot.strategy_v2.backtesting.backtesting_engine_base.BacktestingEngineBase` and native `BacktestingDataProvider`.
- Real `get_candles_feed` and `get_candles_df` calls returned **44,640 rows** from key `binance_BTC-USDT_1m`.
- `CandlesFactory.get_candle` fallback attempts: **zero**. Docker's `--network none` ensured offline execution. No exchange keys, order endpoints or controller signals.
- Container reported Python **3.13.15** / pandas **3.0.6**.
- The initial run failed at the import path because the research script ran outside the application's Python path; the second run imported the engine and failed only when saving to a non-root Docker-writable directory. Both were corrected, and the **third run succeeded**. Earlier red runs are preserved as evidence, not disguised.

**Scope:** Actual engine imported + data read. No initialized Spot trading rules and no strategy or simulated orders at this gate.

## 3. Experiment B: actual Hummingbot native GridExecutorSimulator replay

**Successful executed run:** https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43367180118

**Code:** `research/external_bots/SEVEN_HEAVEN_HUMMINGBOT_NATIVE_GRID_EXECUTOR_HYPOTHETICAL_REPLAY.py`  
**Machine proof:** `research/external_bots/SEVEN_HEAVEN_HUMMINGBOT_NATIVE_GRID_EXECUTOR_HYPOTHETICAL_REPLAY_PROOF.json`

The native Python class `hummingbot.strategy_v2.backtesting.executors_simulator.grid_executor_simulator.GridExecutorSimulator` was invoked on exactly the same SHA-verified data, under the pinned Hummingbot Docker digest and `--network none`.

Experimental configuration:
- `BTC-USDT`, BUY-side directional grid, **leverage 1**, 1,000 USDT notional parameter.
- Fixed lower/upper grid bounds **78,883.389 / 96,413.031 USDT**, 10 generated levels.
- TP per filled entry: 1.00%; input `min_spread_between_orders=0.022`; `max_open_orders=10` configuration.
- Exchange `trading_rules=None`: **no verified tick size, lot/minSize, notional rules or exact historical exchange matching**.
- Full source feed: 44,640 bars; GridExecutorSimulator **terminated after 19,609 bars** at its TAKE_PROFIT global barrier (2026-01-14T14:48:00Z). Not a month-long simulated strategy!

| Fee fraction per side, hypothetical | Entry events | Take-profit events | Unclosed difference | Accumulated fees in simulator | Native simulator net PnL |
|---|---:|---:|---:|---:|---:|
| `0.001` = **0.10%** per fill (Taker-style scenario) | 12 | 11 | 1 | 2.40 USDT | **+8.82658659 USDT** |
| `0.0008` = **0.08%** per fill (Maker-style scenario) | 12 | 11 | 1 | 1.92 USDT | **+9.30658659 USDT** |

These are **Hummingbot native simulator metrics**, not realized profits, not a verified portfolio return, not actual Maker fills and **not equivalent to the MASTER Spot Grid**. The 0.10% and 0.08% values come from user's documented OKX Spot account, applied only as illustrative assumptions to historical **Binance** prices, not historical Binance fees. Maker/Taker classes are not validated for individual simulated fills.

**Critical model mismatches (not optional footnotes):**
1. This implementation uses **historical low/high thresholds** to assume entries and exits. Touch does not establish real queue placement, latency or order fill.
2. It is a directional GridExecutor with TP/global exit and **not** the symmetric Spot Grid with 50% initial BTC and a separately accounted cash/inventory ledger.
3. `max_open_orders` may not be enforced in the simulator path. Do not infer simultaneous-order affordability from its configuration value.
4. It uses no frozen Binance or OKX instrument constraints; exact minSize/lotSz/tickSz and fees cannot be claimed.
5. Its global exit occurred halfway into January; comparing its +8.83 USDT PnL against a 10-month GRID_FIXED_TOUCH historical result or any January monthly portfolio return would be materially misleading.
6. The `open_entry_events_minus_tp_events=1` field is an **event-count difference**, not proof of actual inventory, margin, cash balance or remaining order profitability.
7. Simulator outputs per-executor net PnL; **do not treat 1,000 + reported PnL as verified ending equity**.

## 4. Why this is a meaningful advance

- The strategy research no longer depends solely on ERITH.IA's own JavaScript/Python paper models.
- Official Hummingbot source actually ran on an immutable historical dataset, produced hypothetical events and observed the distinction between model and live execution.
- We now have a real case where **different strategy rules change the evaluation horizon** (automatic TAKE_PROFIT after 19,609 bars). Any leaderboard must preserve elapsed window, base allocation and model assumptions.
- Fee sensitivity within the same hypothetical execution path is **0.48 USDT**, while the larger uncertainty is the fill mechanism, grid definition, inventory and rules. Thus focus first on **model parity**, not superficial optimization.

## 5. Next gate, in priority order

1. Add an **offline-only Hummingbot Spot controller contract** with verified and timestamped `trading_rules`, proper cash/base inventory and explicit no-network protection. Do not invent exchange rules to make it pass.
2. Check **execution semantics** against the existing ERITH.IA continuous 2026 Grid PAPER reference on a **common full window**. Keep HOLD-50 and cash baselines, but do not compare non-equivalent PnL as annualized returns.
3. Require actual runnable CI proof of budget conservation, maker/taker accounting, partial/missed fills and cutoff handling. Stop with `MODEL_MISMATCH` if parity cannot be established.
4. Only then use the same public research JSON in MASTER/Operator/Trader and TRADUS read-only. No private Bridge changes and no real orders.
5. Freqtrade will cover *independent directional strategy verification* on the same dated source, not be presented as an exact multi-order Spot Grid clone.

## 6. Delivery contract and limitations

All study code, proof JSON and this handoff live under **`coordination/inter_ai_dialogues/agent_crypto/`** (subfolder `research/external_bots/` for machine artifacts). The workflow itself lives under **`.github/workflows/`** because GitHub requires this location.

No UI deployment, no changed Master/Operator build labels, no TRADUS code, no account secrets, no Bridge permissions, no actual trading. The image is a pinned digest; runtime itself is isolated by Docker networking. The machine result artifacts on GitHub Actions expire after their 14-day retention, so their verified contents are also committed to the durable research folder.

**Status: Engine data-cache PASS, native GridExecutor hypothetical replay PASS, Spot Grid execution/model parity NOT YET VALIDATED.** Another Aerith should continue from these exact files and source hashes without repeating the original dataset research.
