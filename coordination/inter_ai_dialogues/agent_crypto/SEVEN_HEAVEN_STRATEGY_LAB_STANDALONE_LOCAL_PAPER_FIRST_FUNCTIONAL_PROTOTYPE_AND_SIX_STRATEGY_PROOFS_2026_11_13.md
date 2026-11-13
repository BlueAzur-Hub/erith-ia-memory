# Seven Heaven Strategy Lab — First independent executable PAPER prototype

**Owner:** Christophe, with optional later presentation to Yoann.  
**Name:** **Seven Heaven Strategy Lab** (user approved).  
**Date:** 13 November 2026 UTC.  
**Status:** Independent local application tested on real historical January 2026 BTCUSDT data; no integration into TRADUS, Administrator or Operator. No exchange credentials or real orders.

## 1. What has actually been built

Standalone repository folder:
`seven_heaven_strategy_lab/`

- `web/index.html`, `web/styles.css`, `web/app.js`: French browser interface, strategy selection, numeric parameters, fee % normalization, SVG equity chart, results table, saved config profiles and historical report list.
- `src/engine.py`: independent deterministic Python long-only Spot PAPER engine with cash and BTC inventory, market-like simulated fills at the **next bar's OPEN** from closed-bar signals only. EMA crossover, Bollinger reversion, DCA, Hold 50%, Hold 100%, cash; wallet accounting, assumed taker fees, slippage, drawdown, marked inventory and cost ledger.
- `src/reference_data.py`: **on-click only** public download of the already archived Binance January 2026 BTCUSDT 1m ZIP from the project's GitHub Release. Requires exact original ZIP size and SHA-256, strict 12-column full-month timestamps and native close times, and verifies normalized CSV SHA-256 **before** saving locally. No market API and no account data.
- `src/server.py`: loopback-only JSON API and static server. Persist user profiles and every complete simulation JSON locally in the `workspace` directory. No `/api/trade` or remote-order endpoint exists.
- `Dockerfile`, `compose.yaml`: tiny Python container, no Freqtrade/Hummingbot installed, dropped Linux capabilities, read-only root, no privilege escalation, host binding **127.0.0.1:8777** (not an Internet server).
- `START_SEVEN_HEAVEN_STRATEGY_LAB_WINDOWS.cmd`, `STOP_SEVEN_HEAVEN_STRATEGY_LAB_WINDOWS.cmd`: Windows convenience launchers; Docker Desktop is required on the PC. A USB SSD can carry `seven_heaven_strategy_lab` and `workspace`; Docker itself remains installed on the PC.
- `README_FR.md`, `tests/test_lab.py`: plain-language operating guide and 14 deterministic unit tests.

### Data and numeric contract

- Asset: BTC/USDT, **Binance Spot 1-minute January 2026**, not current OKX prices or OKX EEA pair execution.
- Frozen ZIP source: `d28b369da32a6ea84ba0af517b1847ab67b2fcc1e0e111c1b24d56ae07240cb9`.
- Normalized 44,640-candle CSV: `38a2e6ce6e76ccfeca2e421679ee39ef4467f0426cf0064610b25100307f54c4`.
- Default budget: 1,000 USDT PAPER.
- Default taker fee: **0,10%** per side, represented as fraction **0.001** internally; **0,08% Maker** is displayed as an observed OKX fee but NOT used in this market-fill model.
- Assumed slippage: **0,05%** per side (fraction 0.0005).
- Quantity step 0.00000001 BTC and minimum notional 5 USDT are **LAB ASSUMPTIONS**, NOT historically verified Binance/OKX instrument rules.
- Signal at preceding 1-minute close -> hypothetical fill at the following 1-minute open. No knowledge of future candles; no spread orderbook/queue simulation.
- Total equity = cash + BTC * last known close; no liquidation of the remaining inventory at the period end.
- No leverage, no short positions, no API keys, no real orders.

## 2. CI evidence already executed

Successful actual GitHub Actions runs:
- https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43371647767
- https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43371764153

Verified:
- Python and JavaScript source syntax.
- **14/14 unit tests** including causal lookback, no future information, fees, cash/inventory, no orders, invalid inputs, reference hash rejection.
- Exact original **44,640 historical minutes** downloaded, SHA checked and normalized with exact expected SHA.
- Six strategy programs **actually executed** on the full same historical month.
- Python HTTP server handled a real `/api/run`, saved profile and report history, and rejected non-existent `/api/trade` with 404.
- A real **Docker build + localhost HTTP health probe passed** in GitHub Actions.
- A complete named portable ZIP was created and uploaded as a CI artifact with SHA-256.
- **Windows Firefox user acceptance NOT yet performed.** Linux HTTP and Docker smoke are not the same as Windows UI validation.

Machine-readable proof: `coordination/inter_ai_dialogues/agent_crypto/research/strategy_lab/SEVEN_HEAVEN_STRATEGY_LAB_FIRST_SIX_PAPER_MODELS_HISTORICAL_BTCUSDT_JANUARY_2026_EXECUTED_PROOF.json`.

## 3. First reproducible six-model PAPER results

All have exactly the same 44,640-bar market window and 1,000 USDT initial notional. However the **trading rules are not equal**, because they represent different choices.

| Model | Return | Final marked portfolio | Fees | Hypothetical fills |
|---|---:|---:|---:|---:|
| EMA_CROSS (10/30) | −92.20371% | 77.962934 USDT | 614.195579 USDT | 1642 |
| BOLLINGER (20, sigma 2) | −77.95277% | 220.472267 USDT | 546.834457 USDT | 1015 |
| DCA (50 USDT daily) | −14.81025% | 851.897513 USDT | 0.998992 USDT | 20 |
| HOLD_50 | −5.14847% | 948.515296 USDT | 0.499500 USDT | 1 |
| HOLD_100 | −10.29695% | 897.030501 USDT | 0.999001 USDT | 1 |
| CASH | 0.00000% | 1000.000000 USDT | 0 | 0 |

**Interpretation:** unfiltered minute-scale EMA/Bollinger configurations made many hypothetical trades; their cumulative fees consumed substantial capital. This is a warning against optimizing only headline signals, not proof that all EMA/Bollinger methods fail. No parameter tuning or out-of-sample evidence yet; no maker fills, partial fills, Binance historical fees, actual minimum order sizes or orderbook latency.

**Do NOT** confuse these original engine figures with Hummingbot's earlier +8.83 USDT per-executor result, which ended mid-January with another strategy, fill model, and accounting.

## 4. How Christophe can use it

Download the **Seven Heaven Strategy Lab portable ZIP** (published through the project Release after successful merged-main CI), unzip the complete folder to SSD or PC, ensure Docker Desktop is installed and started, and double-click `START_SEVEN_HEAVEN_STRATEGY_LAB_WINDOWS.cmd`.

Visit `http://127.0.0.1:8777`, click the source verification button once (Internet for this **public GitHub artifact** only), then launch PAPER. Results and profiles persist under `workspace/`. Stop via `STOP_SEVEN_HEAVEN_STRATEGY_LAB_WINDOWS.cmd` and safely eject SSD. Freqtrade and Hummingbot are not required for v0.1.

Do not represent the ZIP as a standalone Windows executable. The source package requires either installed Docker Desktop or Python 3.11+ on the host.

## 5. Future engine adapters and operator scope

The verified user-provided source ZIPs for Freqtrade/Hummingbot are already retained in the shared source Release:
https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-external-bot-source-archives-2026-11-13

**Recommended order:**
1. First Windows Firefox user acceptance with no exchange account keys; verify labels, profile persistence, UI results and stop/restart workflow.
2. Add **Freqtrade backtesting as a separate tested research adapter**, preserving the actual upstream version/commit, identical data hashes, signal timing and costs. Freqtrade native results must have a distinct `engine` label; default Freqtrade order execution assumptions are not a direct clone of our source engine. Prevent `trade` / live mode entirely.
3. Add Hummingbot only after an offline Spot inventory/order-budget contract and model parity study, building on the already verified native simulator evidence in the Coffre.
4. Add user-defined strategy parameters and safe rules, then optional owner-created strategies only after input validation. No untrusted Python execution from the browser.
5. Add other periods and walk-forward validation, volatility and liquidity stress, maker/taker realism, and performance benchmarks vs HOLD/CASH.
6. Share source and result schema with Yoann **only if he asks**, without assuming access to his private TRADUS or his Bridge.

### Privacy and deployment

This prototype is **for Christophe**. Neither `public/agent_crypto_erith_ia/administrator`, `BlueAzur-Hub/agent-crypto-operator`, Trader MASTER, TRADUS, nor Bridge is modified. The project stores no creator private memory or account identifiers and does not open network-facing listen addresses on the host.

**Status:** actual independent PAPER engine PASS, 14 tests PASS, immutable data replay PASS, Docker HTTP PASS; Freqtrade native integration NOT BUILT; Hummingbot native adapter NOT BUILT; Windows UI and SSD physical test PENDING.
