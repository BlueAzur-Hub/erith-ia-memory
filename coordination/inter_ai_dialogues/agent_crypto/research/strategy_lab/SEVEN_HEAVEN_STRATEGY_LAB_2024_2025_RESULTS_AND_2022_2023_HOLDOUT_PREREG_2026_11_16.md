# Seven Heaven Strategy Lab — 2024–2025 long-history results and 2022–2023 holdout preregistration

**Date:** 16 November 2026  
**Status:** research result + preregistered next experiment  
**Mode:** local research / PAPER only / no account / no order  
**Runtime reference:** Seven Heaven Strategy Lab V4.6.2

## 1. Source corpus actually tested

The first long clean corpus uses official Binance Spot monthly public archives for **BTC/USDT 1h**.

- period: 2024-01-01 00:00 UTC → 2025-12-31 23:00 UTC;
- 24/24 months strict-valid;
- 17,544 hourly candles;
- no interpolation;
- exact 1h continuity including month boundaries;
- combined research-corpus SHA-256: `221385b41243bf4a332cdc77cdb11a63a95c13022fea20219e2cb9309718f5b9`;
- monthly ZIP CHECKSUM and timestamp-unit rules verified before PAPER replay.

This corpus is distinct from OKX BTC/USDC archives and is never merged with them.

## 2. Fixed owner-profile configuration used

The replay reproduces the configuration visible in the owner screenshot supplied on 16 November 2026:

- timeframe: 4h;
- fictitious capital: 10,000 USDT;
- fee: 0.10% per side;
- slippage: 0.05% per side;
- EMA fast / slow: 11 / 31;
- entry: price above slow EMA;
- entry filter: RSI below 61;
- exit: price below slow EMA;
- RSI period: 15;
- RSI exit field: 71 (inactive because exit rule is price below EMA);
- volume period / multiplier: 21 / 1 (inactive because entry filter is RSI);
- fictitious stop: 20%;
- target: disabled.

Fills remain hypothetical next-candle-open fills.

## 3. Seven-model baseline — 4h

| Model | 2024 reset | 2025 reset | 2024→2025 continuous |
|---|---:|---:|---:|
| EMA 11/31 | +88.631% | -33.849% | +23.023% |
| Bollinger | -2.447% | +19.914% | +19.608% |
| DCA | +62.024% | -9.368% | +51.760% |
| Hold 50% | +60.487% | -3.238% | +53.488% |
| Hold 100% | +120.974% | -6.475% | +106.976% |
| Cash | 0% | 0% | 0% |
| Owner custom RSI<61 | +26.969% | -35.096% | **-16.712%** |

These are PAPER results on historical data, not future expectations.

### Owner custom continuous diagnostics

- final equity: 8,328.82 USDT;
- return: -16.71182%;
- max drawdown: -39.94964%;
- 132 closed positions;
- 28 winning / 104 losing;
- win rate: 21.212%;
- profit factor: 0.8926;
- 264 fills;
- simulated commissions: 2,891.38 USDT;
- turnover: 2,891,378.56 USDT;
- time in position: 38.463%.

Counterfactual with both fee and slippage set to zero:

- return: **+23.75536%**;
- final equity: 12,375.54 USDT.

This counterfactual is not an additive fee decomposition because the portfolio path changes. It nevertheless shows that friction/turnover is a first-order problem for this profile.

## 4. Aether Scientific — expanding chronological validation

Aether Scientific tested the same custom rule family while allowing only the small predefined EMA grid to be selected on earlier training data.

Summary:

- verification windows: 2;
- positive verification windows: 0;
- mean verification return: **-15.09377%**;
- worst verification return: **-26.70224%**;
- worst verification drawdown: **-32.97376%**;
- mean return with fee+slippage ×2: **-23.49276%**.

Both training selections chose EMA 12/32.

| Fold | Training return | Later verification | Hold 50 benchmark | Costs ×2 |
|---|---:|---:|---:|---:|
| 1 | +50.003% | -3.485% | +6.263% | -12.583% |
| 2 | +44.775% | -26.702% | -8.794% | -34.403% |

Conclusion: selecting a nearby EMA pair on the past does not rescue the strategy on later data.

## 5. Aether Research — entry filter only

Five predefined filters were compared while all other owner rules stayed fixed.

Training-selected filter in both folds: **Volume ≥1.2×**.

But on later verification:

- mean selected return: **-22.70251%**;
- mean owner RSI<61 return: **-18.52812%**;
- selected minus owner: **-4.17439 percentage points**;
- selected positive windows: 0;
- mean selected return with doubled costs: **-28.81171%**.

This is a clear example of a filter looking strong in training and failing to generalize.

### Full later-window disclosure

Fold 1:
- owner RSI<61: -9.699%;
- no filter: -20.445%;
- RSI<60: -8.537%;
- **RSI<45: -7.670%**;
- volume ≥1.2×: -20.009%.

Fold 2:
- owner RSI<61: -27.357%;
- no filter: -33.673%;
- RSI<60: -27.093%;
- **RSI<45: -17.336%**;
- volume ≥1.2×: -25.396%.

RSI<45 is therefore an interesting **new hypothesis**, but it is not a validated winner: these holdouts have now been observed.

---

# 6. PREREGISTRATION — untouched 2022–2023 test

This section is committed **before** any 2022–2023 performance data are downloaded or inspected for this experiment.

## Question

Does changing only the owner entry threshold from **RSI <61 to RSI <45** reduce overtrading/friction and improve net PAPER performance on an unseen historical period?

## Reserved source

Official Binance Spot BTC/USDT monthly 1h archives for:

- 2022-01 through 2023-12;
- 24 months;
- source accepted only if every month passes the existing strict V4.6.2 validation:
  checksum, schema, timestamp unit, exact hourly continuity, exact close timestamp, OHLC consistency;
- if the 24-month source is not strictly continuous, **no performance conclusion is allowed** from this preregistered test.

No missing candle may be synthesized.

## Fixed comparison

Two strategies only:

### OWNER
Exactly the current owner profile above, including:
- EMA 11/31;
- price above slow EMA entry;
- RSI period 15;
- RSI entry <61;
- price below slow EMA exit;
- stop 20%;
- no target;
- 4h;
- capital 10,000 USDT;
- fee 0.10%/side;
- slippage 0.05%/side.

### CANDIDATE
Identical to OWNER except:

`rsi_entry_max = 45`

No other field may change after source inspection.

## Benchmarks

Report, but do not use to choose the candidate:

- Cash;
- Hold 50%.

## Primary criterion

Candidate must have a higher **net continuous 2022→2023 return** than OWNER.

## Risk guardrail

Candidate max drawdown must not be more than **5 percentage points worse** than OWNER.

## Replication criterion

Candidate must beat OWNER on **both** independent annual-reset experiments:

- 2022 reset;
- 2023 reset.

If it wins only the combined period but fails either annual replication, classify the hypothesis as unstable rather than validated.

## Secondary diagnostics

Report without changing the decision rule:

- fills;
- commissions;
- turnover;
- closed positions;
- win rate;
- profit factor;
- time in position;
- zero-friction counterfactual.

## Stop rule

After the 2022–2023 result is revealed:

- do not tune RSI again on the same holdout;
- do not choose another filter because it would have done better;
- record pass/fail exactly as preregistered;
- any new hypothesis requires a new untouched period.

