# Seven Heaven Strategy Lab — Actual Windows USB validation and EMA fee/timeframe diagnostics

**Date:** 13 November 2026  
**Repository:** `BlueAzur-Hub/erith-ia-memory`  
**Shared destination:** `coordination/inter_ai_dialogues/agent_crypto/`

## 1. Actual user test, not CI alone

The owner supplied genuine screenshots of the installed standalone Strategy Lab running from `ENUODA (E:)\seven_heaven_strategy_lab`, a **currently sufficient 8 GB USB thumb drive**, under their already installed Windows Python **3.13**:

- Windows CMD reports the local PAPER-only server bound to `http://127.0.0.1:8777`.
- Firefox displays the interface successfully. Local source import reports **44,640 SHA-256 authenticated** Binance Spot BTC/USDT 1-minute candles (January 2026).
- Owner clicked **Lancer la simulation PAPER** with EMA(10,30) and a fictional 1000 USDT. Firefox displays the correctly matched original GitHub CI reference metrics:
  - Ending marked portfolio: **77.96 USDT** / **−92.20%**.
  - 821 BUY + 821 SELL events (1642 assumed executions).
  - Cumulative simulated fees **614.20 USDT**; maximum historical drawdown −92.26%.
  - Final cash 77.96 USDT, no BTC inventory.
  - Baseline HOLD 50% BTC **−5.15%**; CASH 0%.
- Journal of the run was written locally in `workspace/results`, not in GitHub.
- This **does** establish first on-device Windows/Python/Firefox execution and UI result rendering. Do **not** claim SSD testing (the user is using a USB flash drive), 24/7 reliability, proof of fills, or live exchange connectivity.
- Back up `workspace/` independently before removing or formatting the USB. Do not stop a running process by pulling the drive.

## 2. Why 1-minute EMA 10/30 was poor: 20 real additional experiments

**Actual executed workflow:** https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43375218684  
**Code:** `research/strategy_lab/SEVEN_HEAVEN_STRATEGY_LAB_EMA_FEE_FREQUENCY_SENSITIVITY_2026_01.py`  
**Machine proof:** `research/strategy_lab/SEVEN_HEAVEN_STRATEGY_LAB_EMA_FEE_AND_FREQUENCY_JAN_2026_20_EXECUTED_CASES_PROOF.json`  
**Full workflow artifact:** `SEVEN_HEAVEN_STRATEGY_LAB_EMA_FEES_AND_FREQUENCY_JAN_2026_20_CASES` (retained 30 days).

All 20 combinations were fixed before looking at the results: timeframe **1, 5, 15, 60, 240 minutes** × friction **both**, **fee-only**, **slippage-only**, **ideal zero cost**. The historical dataset, starting balance and nominal EMA lengths remain unchanged.

| Bars | Fills, fee + slippage | PAPER return (fee 0.10% plus slippage 0.05%, each side) | Counterfactual ZERO FRICTION return |
|---|---:|---:|---:|
| 1m | 1642 | **−92.20371%** | **−8.47210%** |
| 5m | 359 | −45.66149% | −6.89458% |
| 15m | 110 | −19.53146% | −5.09596% |
| 1h | 22 | −7.44012% | −4.33469% |
| 4h | 6 | −2.23387% | The raw machine proof contains the exact value |

At 1-minute timeframe, further diagnostics:
- Fees 0.10%, **zero slippage**: **−82.28086%** (1642 hypothetical fills).
- No fees, slippage 0.05%: **−59.72849%** (1642 fills).
- Both costs 0: **−8.47210%** (1642 fills).
- Both costs as above: **−92.20371%**.

**Interpretation:** The result reflects a poor short-timeframe signal-to-friction balance; costs strongly compound as the simulated cash base shrinks. The cumulated 614 USDT paid as fees is not mathematically equal to the difference in final equity against zero-cost runs, because trading capital changes after every fill. Fees and slippage effects are **not additive** under compounding.

**Important model trap:** “EMA 10/30” on a 4h chart is EMA of **40h and 120h**, while on a 1m chart it is **10m and 30m**; these are genuinely different holding horizons, not identical strategy parameters. The 4h example still lost money on this month. Do **not** select a “winner” based on these 20 in-sample configurations or claim future expectancy.

## 3. Exact data and runtime boundaries

- January 2026 Binance Spot BTC/USDT; 44,640 continuous one-minute candles; normalized CSV SHA-256 `38a2e6ce6e76ccfeca2e421679ee39ef4467f0426cf0064610b25100307f54c4`.
- Tested calculations are from original local **Seven Heaven Strategy Lab** Python PAPER engine, **not Freqtrade and not Hummingbot**.
- All profits/losses are imaginary; full fills are assumed at next-bar opening price, with a fixed slippage model, no genuine order-book or historic venue precision/capacity verification.
- Fee `0.10%` is user's **observed current OKX taker** used as a parameter; it is **not** verified historical Binance fee and does not imply OKX account access.
- Unfilled/partially filled orders, queue behavior, volatility spikes and other realistic execution constraints remain outside this first model.
- Neither the Administrator nor Operator/Trader/TRADUS/Bridge runtime was modified.

## 4. Next independent check: actual Freqtrade backtesting

- The owner’s original `freqtrade-develop.zip` is preserved byte-exactly in the shared Release `seven-heaven-external-bot-source-archives-2026-11-13`, with license and SHA-256 in the registry.
- Freqtrade's official backtesting documentation (2026) confirms explicit historical input format `--data-format-ohlcv json`, explicit `--fee` and next-bar-open entry/exit assumptions. It also documents that default backtests **assume fills** and omit slippage unless additional modelling is introduced.
- Before claiming independent verification, the actual Freqtrade engine must be imported and executed on the **same verified immutable 44,640-bar history**; record its exact version/image hash, entry/exit logic, fee assumptions and exposure/ROI parameters. Its default wallet sizing, stoploss/ROI, initial indicator warmup and trade concurrency can differ materially from our engine.
- Any inability to execute offline, validate exchange rules or preserve same source means `FREQTRADE_ENGINE_NOT_VERIFIED`, not a fabricated cross-engine result.
- Use Freqtrade for independent **directional strategy** tests; Hummingbot for Grid and Market Making only under separately audited Spot inventory constraints.

**Next owner action:** none necessary for this analysis. The owner can keep using the first local application with the 8 GB USB until a validated new software release explicitly adds capabilities.
