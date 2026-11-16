# Seven Heaven Strategy Lab — Long History Phase 1 Results

**Date:** 16 November 2026  
**Status:** Phase 1 complete — source certification + long replay + chronological validation + preregistered holdout  
**Canonical runtime:** V4.6.2 · PAPER only  
**Runtime change:** none in this phase

## Executive result

Phase 1 materially changes the research picture.

1. The existing V4.6.2 monthly validator scales beyond the January 2020 pilot and correctly rejects real historical discontinuities instead of inventing candles.
2. The official Binance Spot BTC/USDT 1h target corpus for 2019–2021 + 2024–2025 contains 60 inspected months: 43 are strict-valid and 17 contain source irregularities.
3. All 24 months of 2024–2025 are strict-valid and form one continuous 17,544-hour corpus.
4. The current owner custom 4h profile is highly sensitive to turnover and friction.
5. Aether Scientific does not find robust later-window performance for that profile.
6. Aether Research shows a concrete selection-bias case: a volume filter wins on training and loses later.
7. RSI<45 looked less bad than RSI61 on the already-observed 2024–2025 validation windows, so it was preregistered as a single new hypothesis before testing an unseen historical period.
8. The original 2022–2023 continuous holdout was blocked before performance by one real source discontinuity in March 2023.
9. A segmented replacement holdout was preregistered before performance, with no position crossing the gap.
10. RSI<45 then **failed the preregistered segmented holdout on both segments**. It is therefore **not adopted**.

No claim of future profitability follows from any of these results.

---

## 1. Historical source certification

Durable source-evidence document:

`SEVEN_HEAVEN_STRATEGY_LAB_BINANCE_LONG_HISTORY_CERTIFICATION_PILOT_2026_11_16.md`

Successful evidence runs:

- representative four-month pilot: `43788122366`;
- complete 60-month map: `43788379819`;
- detailed anomaly diagnostics: `43788573841`.

### Target windows

- 2019–2021
- 2024–2025

### Result

- months attempted: **60**
- strict-valid months: **43**
- anomalous months: **17**
- strict-valid hourly candles: **31,488**
- duplicate open timestamps in diagnosed anomalies: **0**
- off-grid open timestamps in diagnosed anomalies: **0**
- policy: **no gap filling, no interpolation**

The 17 anomalies are concentrated in 2019–2021 and consist of missing hours plus a small number of early / irregular close timestamps.

### Clean first long corpus

2024–2025:

- 24/24 months strict-valid;
- 17,544 continuous 1h candles;
- month boundaries verified;
- combined research-corpus SHA-256:
  `221385b41243bf4a332cdc77cdb11a63a95c13022fea20219e2cb9309718f5b9`.

---

## 2. Long 2024–2025 seven-model replay

Evidence run: `43789015410`.

Configuration:

- timeframe: **4h**
- fictitious capital: **10,000 USDT**
- fee: **0.10% per side**
- slippage: **0.05% per side**
- current owner custom profile from the supplied 16 November screenshot

| Model | 2024 reset | 2025 reset | 2024→2025 continuous |
|---|---:|---:|---:|
| EMA 11/31 | +88.631% | -33.849% | +23.023% |
| Bollinger | -2.447% | +19.914% | +19.608% |
| DCA | +62.024% | -9.368% | +51.760% |
| Hold 50% | +60.487% | -3.238% | +53.488% |
| Hold 100% | +120.974% | -6.475% | +106.976% |
| Cash | 0.000% | 0.000% | 0.000% |
| Owner custom RSI<61 | +26.969% | -35.096% | **-16.712%** |

These are historical PAPER results, not forecasts.

### Owner custom continuous diagnostics

- return: **-16.71182%**
- max drawdown: **-39.94964%**
- fills: **264**
- simulated commissions: **2,891.38 USDT**
- zero-friction counterfactual return: **+23.75536%**

The zero-friction result is a separate portfolio path and must not be treated as an additive fee subtraction. It nevertheless shows that turnover / friction is a first-order research problem for this profile.

---

## 3. Aether Scientific on the same clean corpus

Evidence run: `43789262049`.

Aether Scientific used chronological expanding training followed by strictly later verification windows, fresh capital per verification window, prior-history indicator warmup with zero fills, and the small fixed EMA candidate grid already present in V4.6.2.

Summary:

- verification windows: **2**
- positive verification windows: **0**
- mean later-window return: **-15.09377%**
- worst later-window return: **-26.70224%**
- worst later-window drawdown: **-32.97376%**
- mean later-window return with fee + slippage doubled: **-23.49276%**
- selected EMA in both folds: **12/32**

| Fold | Training return | Later verification | Hold 50 | Costs ×2 |
|---|---:|---:|---:|---:|
| 1 | +50.003% | -3.485% | +6.263% | -12.583% |
| 2 | +44.775% | -26.702% | -8.794% | -34.403% |

Conclusion: a nearby EMA optimization does not rescue this strategy family on later data.

---

## 4. Aether Research — entry-filter-only study

Evidence run: `43789470558`.

Only the entry filter changed. All other active owner rules, dates, capital, fees, slippage and execution model remained fixed.

The training-selected filter in both folds was **Volume ≥1.2×**.

Later verification showed:

- mean selected return: **-22.70251%**
- mean owner RSI<61 return: **-18.52812%**
- selected minus owner: **-4.17439 percentage points**
- selected positive windows: **0**
- mean selected return with doubled costs: **-28.81171%**

This is a useful negative result: the strongest training filter failed to generalize.

### All later-window candidate results

Fold 1:

- owner RSI<61: -9.699%
- no filter: -20.445%
- RSI<60: -8.537%
- RSI<45: **-7.670%**
- volume ≥1.2×: -20.009%

Fold 2:

- owner RSI<61: -27.357%
- no filter: -33.673%
- RSI<60: -27.093%
- RSI<45: **-17.336%**
- volume ≥1.2×: -25.396%

Because those windows had already been observed, RSI<45 could only become a **new hypothesis**, not a winner.

---

## 5. Preregistered 2022–2023 holdout source gate

Preregistration was committed to `main` before 2022–2023 performance was inspected:

`SEVEN_HEAVEN_STRATEGY_LAB_2024_2025_RESULTS_AND_2022_2023_HOLDOUT_PREREG_2026_11_16.md`

The continuous 24-month experiment stopped at the source gate before any strategy performance result.

Evidence:

- attempted holdout workflow: `43789885758`
- source-only diagnostic workflow: `43790016054`
- performance runs during source diagnostics: **0**
- source: **23 clean months / 24**
- anomalous month: **2023-03**

Exact anomaly:

- irregular candle open: **2023-03-24 12:00 UTC**
- expected close: `1679662799999` ms
- actual close: `1679661581646` ms
- early-close delta: **-1,218,353 ms**
- missing open: **2023-03-24 13:00 UTC**
- duplicate opens: **0**

The strict validator was not relaxed.

---

## 6. Preregistered segmented replacement holdout

Replacement protocol:

`SEVEN_HEAVEN_STRATEGY_LAB_2022_2023_SOURCE_GATE_AND_SEGMENTED_HOLDOUT_PREREG_2026_11_16.md`

The final 4h alignment correction was also committed before performance.

### Fixed segmentation

Segment A:

- 2022-01-01 00:00 UTC
- through 2023-03-24 11:00 UTC
- 10,740 strict-valid 1h candles

Excluded source discontinuity:

- 12:00 irregular close
- 13:00 missing

4h alignment buffer excluded:

- 14:00
- 15:00

Segment B:

- 2023-03-24 16:00 UTC
- through 2023-12-31 23:00 UTC
- 6,776 strict-valid 1h candles

Each segment started with fresh 10,000 USDT fictitious capital and zero BTC inventory. No position or indicator state crossed the source gap.

### Fixed hypothesis

OWNER:
- RSI entry <61

CANDIDATE:
- RSI entry <45

Only `rsi_entry_max` changed.

Decision required the candidate to beat OWNER on net return on **both** segments, while not worsening max drawdown by more than 5 percentage points on either segment.

### Result

Successful evidence run: `43790425129`.

| Segment | OWNER RSI<61 | RSI<45 | Candidate delta | OWNER DD | RSI45 DD |
|---|---:|---:|---:|---:|---:|
| A | -1.957% | **-22.350%** | -20.393 pt | -35.402% | -27.786% |
| B | -1.088% | **-4.106%** | -3.018 pt | -20.361% | -13.193% |

Activity / fee reduction was real:

Segment A:
- OWNER fills: 131
- RSI45 fills: 60
- OWNER fees: 1,129.51 USDT
- RSI45 fees: 498.43 USDT

Segment B:
- OWNER fills: 96
- RSI45 fills: 52
- OWNER fees: 875.40 USDT
- RSI45 fees: 496.53 USDT

But the preregistered primary criterion failed on **both** segments.

**Verdict: `PREREGISTERED_SEGMENTED_HYPOTHESIS_FAIL`.**

RSI<45 reduced activity, fees and drawdown, but lost more money than RSI<61 on both untouched segments. It is **not adopted**.

---

## 7. Current scientific conclusions

### Keep

- strict source validation;
- checksum-gated historical imports;
- explicit source-gap boundaries;
- fresh portfolio resets across missing-data gaps;
- chronological later-window validation;
- all-candidate disclosure;
- preregistration before new untouched holdouts;
- cost / turnover diagnostics as a central research dimension.

### Reject / do not promote

- RSI<45 as a replacement for the current owner RSI61 threshold;
- volume ≥1.2× as a winner merely because it looked strongest in training;
- EMA 12/32 as a robust improvement merely because it was selected on training;
- any method that interpolates or silently bridges historical source gaps.

### New research priority

The strongest signal from Phase 1 is not a magic indicator value. It is **turnover control**.

Future research should therefore investigate predeclared methods that reduce unnecessary entries / exits without selecting them on already-observed holdouts, for example:

- minimum hold / cooldown rules;
- confirmation over multiple closed candles;
- regime gating;
- volatility / trend filters with fixed preregistration;
- trade-frequency caps or cost-aware entry criteria.

Any such candidate needs a fresh holdout period or a properly segmented unused corpus.

---

## 8. Runtime decision

**Do not publish V4.7 yet.**

V4.6.2 remains the canonical accepted runtime.

This phase produced research evidence, not a runtime feature requirement. The next runtime version should be justified only after a research method survives preregistered validation strongly enough to deserve productization.
