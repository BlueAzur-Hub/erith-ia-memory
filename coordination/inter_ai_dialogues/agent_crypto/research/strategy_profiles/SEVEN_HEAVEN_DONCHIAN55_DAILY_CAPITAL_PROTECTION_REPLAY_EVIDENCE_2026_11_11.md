# Seven Heaven — Donchian 55: daily replay and capital protection

Study: 11 November 2026. Historical window: 2019-01-01 to 2026-09-30.
Research-only simulation, not an account statement or a trading instruction.

## What was actually replayed

- Original locally archived Binance Spot BTC/USDT daily candles, 3,075 rows, SHA-256 checked against the canonical source.
- Identical 55-day high breakout, 20-day low exit, 3 × ATR14 trailing stop, 120-day maximum holding duration and next-day opens.
- Same fees (0.10% per side) and assumed slippage (0.05% per side); double-cost stress also calculated.
- Fictitious 1,000 USDT initial portfolio, long or cash only, no leverage.
- Each entry deploys 100%, 50% or 25% of THEN-AVAILABLE CASH. The uninvested fraction remains cash. No annual rebalancing.
- The daily portfolio is valued as retained cash plus the approximated net liquidation value of BTC.
- Verification requires the 100% strategy to reproduce all canonical fields and every allocation to retain the same 29 trade dates.

## Results (daily maximum drawdown, not year-end drawdown)

| Allocation per entry | Final capital USDT | Total return | Maximum drawdown | 2022 return | Trades W/L | Double-cost return |
|---|---:|---:|---:|---:|---:|---:|
| 100% | 4,871.15 | +387.115% | -33.530% | -10.695% | 29 (16/13) | +347.486% |
| 50% | 2,460.48 | +146.048% | -20.796% | -5.347% | 29 (16/13) | +135.543% |
| 25% | 1,618.72 | +61.872% | -12.018% | -2.674% | 29 (16/13) | +58.310% |

## Annual returns, continuous portfolio

| Year | 100% | 50% | 25% |
|---|---:|---:|---:|
| 2019 | +67.413% | +32.643% | +16.005% |
| 2020 | +56.394% | +29.122% | +14.671% |
| 2021 | +19.757% | +11.259% | +6.050% |
| 2022 | -10.695% | -5.347% | -2.674% |
| 2023 | +27.382% | +14.091% | +7.129% |
| 2024 | +48.174% | +24.184% | +12.073% |
| 2025 | -4.033% | -1.920% | -0.935% |
| 2026 (Jan-Sep) | -3.962% | -1.832% | -0.877% |

## Ledger of the 29 historical trades, 100% allocation

All three allocations have identical entry and exit dates; allocation-specific trade P/L is in the JSON.

| # | Buy UTC | Sell UTC | Net profit/loss USDT | Net return on deployed stake |
|---:|---|---|---:|---:|
| 1 | 2019-02-24 | 2019-02-24 | -88.76 | -8.88% |
| 2 | 2019-04-03 | 2019-05-17 | +393.34 | +43.17% |
| 3 | 2019-05-27 | 2019-06-27 | +369.55 | +28.33% |
| 4 | 2020-01-15 | 2020-02-25 | +88.86 | +5.31% |
| 5 | 2020-05-08 | 2020-05-10 | -262.24 | -14.87% |
| 6 | 2020-06-02 | 2020-08-02 | +61.64 | +4.11% |
| 7 | 2020-08-18 | 2020-09-03 | -180.17 | -11.53% |
| 8 | 2020-10-22 | 2020-11-26 | +406.06 | +29.38% |
| 9 | 2020-12-01 | 2021-01-11 | +1178.65 | +65.91% |
| 10 | 2021-02-09 | 2021-02-23 | +47.37 | +1.60% |
| 11 | 2021-03-14 | 2021-04-18 | -308.70 | -10.24% |
| 12 | 2021-07-31 | 2021-09-07 | +250.79 | +9.27% |
| 13 | 2021-10-07 | 2021-11-16 | +179.14 | +6.06% |
| 14 | 2022-03-28 | 2022-04-10 | -335.34 | -10.69% |
| 15 | 2023-01-13 | 2023-02-10 | +383.04 | +13.68% |
| 16 | 2023-02-16 | 2023-03-03 | -307.62 | -9.66% |
| 17 | 2023-03-18 | 2023-04-21 | +9.52 | +0.33% |
| 18 | 2023-06-22 | 2023-07-25 | -87.03 | -3.02% |
| 19 | 2023-10-24 | 2024-01-12 | +703.96 | +25.16% |
| 20 | 2024-02-13 | 2024-03-05 | +768.97 | +21.96% |
| 21 | 2024-03-12 | 2024-03-19 | -500.78 | -11.72% |
| 22 | 2024-10-16 | 2024-12-20 | +1515.02 | +40.18% |
| 23 | 2025-05-02 | 2025-06-05 | +321.18 | +6.08% |
| 24 | 2025-07-11 | 2025-08-02 | -147.47 | -2.63% |
| 25 | 2025-08-14 | 2025-08-18 | -386.85 | -7.09% |
| 26 | 2026-01-14 | 2026-01-20 | -346.22 | -6.83% |
| 27 | 2026-04-18 | 2026-05-18 | -73.24 | -1.55% |
| 28 | 2026-08-20 | 2026-09-16 | +408.20 | +8.77% |
| 29 | 2026-09-22 | 2026-09-30 | -189.71 | -3.75% |

## Scientific limitations

- A daily OHLC-based simulated stop does not guarantee that price or execution on an exchange.
- Daily maximum drawdown is NOT a worst possible loss; intraday gaps, order book depth, and exchange outages are not modeled.
- Historical results are in-sample, not prospective validation. Fees and slippage are simplified assumptions.
- These figures relate to Binance BTC/USDT, NOT OKX BTC/USDC; currencies and data origins must not be conflated.
- The prior annual-allocation document is a different, approximate annual-rebalancing experiment, not a trade-by-trade replay.
- This study makes no change to the Trader, Administrator, Bridge, exchange account or real portfolio.

## Reproducibility

Engine: coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_BTC_SWING_WIN_LOSS_CATALOG_2026_11_10.py
Baseline: coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_BTC_SWING_WIN_LOSS_VERIFIED_EVIDENCE_2026_11_10.json
Archive: public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/bitcoin-Max.json.gz
