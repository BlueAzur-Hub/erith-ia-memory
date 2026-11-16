# Seven Heaven Strategy Lab — 2022–2023 source gate failure and segmented holdout preregistration

**Date:** 16 November 2026  
**Status:** source gate documented · replacement experiment preregistered before performance  
**Mode:** PAPER only · no account · no order · no gap filling

## 1. Original preregistered holdout did not reach performance

Original preregistration:

`SEVEN_HEAVEN_STRATEGY_LAB_2024_2025_RESULTS_AND_2022_2023_HOLDOUT_PREREG_2026_11_16.md`

The first 2022–2023 holdout workflow stopped during source validation, before any strategy result existed.

Evidence:

- workflow: `43789885758`;
- source-only diagnostic workflow: `43790016054`;
- performance runs during source diagnostics: **0**;
- 23/24 monthly archives strict-clean;
- one anomalous month: **2023-03**.

Therefore the original continuous 24-month experiment is **invalid / not executed**, not a strategy failure.

## 2. Exact source anomaly

Official Binance Spot BTC/USDT 1h archive:

- month: March 2023;
- archive SHA-256: `7f2afb8e0179a57ac31eab5205660298ba5eb77039ac2e21aef9b715ff3d06ce`;
- rows: 743 instead of 744;
- duplicate timestamps: 0;
- off-order timestamps: 0;
- missing open: **2023-03-24 13:00 UTC**;
- preceding 12:00 candle exists but has an irregular close;
- expected close for 12:00 candle: `1679662799999` ms;
- actual close: `1679661581646` ms;
- early-close delta: **-1,218,353 ms**.

Policy:

- do not interpolate the 13:00 candle;
- do not stretch the 12:00 candle;
- do not let a PAPER position cross this source discontinuity;
- do not relax the V4.6.2 strict validator.

## 3. Replacement holdout — preregistered segmentation

This replacement design is committed **before any OWNER/RSI45 performance is calculated on 2022–2023**.

### Segment A

Use only strict-valid hourly candles from:

- start: 2022-01-01 00:00 UTC;
- end: 2023-03-24 11:00 UTC inclusive.

The anomalous 12:00 candle is excluded.

### Gap / excluded source

Exclude:

- 2023-03-24 12:00 UTC — irregular close;
- 2023-03-24 13:00 UTC — absent.

### Segment B

Use only strict-valid hourly candles from:

- start: 2023-03-24 14:00 UTC;
- end: 2023-12-31 23:00 UTC inclusive.

### Portfolio rule

Each segment starts with:

- fresh fictitious capital: 10,000 USDT;
- zero BTC inventory;
- no position transfer across the source gap.

Results from Segment A and Segment B are **independent experiments**. They are never compounded across the missing-data boundary.

## 4. Fixed hypothesis — unchanged

OWNER:
- timeframe 4h;
- EMA 11/31;
- entry: price above slow EMA;
- RSI period 15;
- RSI entry <61;
- exit: price below slow EMA;
- stop 20%;
- target disabled;
- fee 0.10% per side;
- slippage 0.05% per side.

CANDIDATE:
- identical to OWNER;
- **only change: RSI entry <45**.

No other filter, EMA pair, stop, target, fee, slippage, timeframe or rule may be selected after seeing the results.

## 5. Fixed decision rule

The candidate is classified **SUPPORTED ON THIS SEGMENTED HOLDOUT** only if all conditions are true:

1. Candidate net return > OWNER net return on **Segment A**.
2. Candidate net return > OWNER net return on **Segment B**.
3. Candidate max drawdown is not more than **5 percentage points worse** than OWNER on Segment A.
4. Candidate max drawdown is not more than **5 percentage points worse** than OWNER on Segment B.

If any condition fails, the preregistered hypothesis fails.

### Secondary diagnostics — never used to change the verdict

Report:

- fills;
- fees;
- turnover;
- closed positions;
- win rate;
- profit factor;
- time in position;
- Cash;
- Hold 50%;
- zero-friction counterfactual.

## 6. Scientific interpretation rule

Even a PASS means only:

`RSI<45 improved this exact historical segmented PAPER experiment under the fixed assumptions.`

It does **not** establish future profitability.

A FAIL must be kept as a valid learning result. No threshold may be retuned on these same segments after viewing the outcome.

