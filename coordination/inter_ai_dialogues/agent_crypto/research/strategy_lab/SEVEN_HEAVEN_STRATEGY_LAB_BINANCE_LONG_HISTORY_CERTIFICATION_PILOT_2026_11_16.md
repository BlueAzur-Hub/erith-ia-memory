# Seven Heaven Strategy Lab — Binance long-history certification pilot

**Date:** 16 November 2026  
**Status:** research evidence — no runtime integration  
**Scope:** Binance Spot BTC/USDT, monthly public klines, 1h  
**Target windows:** 2019–2021 and 2024–2025  
**Safety:** PAPER only · no account · no credential · no order · no workspace modification

## Purpose

Test the existing V4.6.2 monthly validator against a broader official Binance public-history corpus before changing the Strategy Lab runtime.

The research branch is:

`research/strategy-lab-binance-long-history-pilot-20261116`

The successful GitHub Actions evidence run is:

`43788573841`

The V4.6.2 runtime itself was not modified.

## Method

For every target month:

1. download the official monthly Binance Spot BTCUSDT 1h ZIP;
2. download the matching publisher `.CHECKSUM`;
3. verify SHA-256;
4. verify the expected CSV name and ZIP safety constraints;
5. parse all 12 Binance kline columns;
6. verify timestamp unit:
   - milliseconds before 2025;
   - microseconds from 2025-01-01;
7. verify exact hourly alignment;
8. verify expected close timestamp;
9. verify month row count and continuity;
10. never invent or interpolate a missing candle.

Official Binance public-data documentation states that Spot timestamps switch to microseconds from 2025-01-01 and that each ZIP is accompanied by a `.CHECKSUM`.

## Result

**60 months inspected.**

- **43 months strict-valid**
- **17 months rejected by the strict continuity rule**
- **31,488 hourly candles accepted in strict-valid months**
- **2024 and 2025: all 24 months strict-valid**
- no duplicate open timestamps found;
- no off-grid open timestamps found;
- anomalous months are concentrated in 2019–2021.

The four representative pilot months all passed:

| Month | Rows | Timestamp unit | Result |
|---|---:|---|---|
| 2019-01 | 744 | milliseconds | PASS |
| 2021-05 | 744 | milliseconds | PASS |
| 2024-01 | 744 | milliseconds | PASS |
| 2025-01 | 744 | microseconds | PASS |

## Anomalous months

| Month | Rows / expected | Missing hours | Close mismatches | Observation |
|---|---:|---:|---:|---|
| 2019-03 | 738 / 744 | 6 | 0 | six consecutive hours absent on 12 March |
| 2019-05 | 734 / 744 | 10 | 0 | ten consecutive hours absent on 15 May |
| 2019-06 | 720 / 720 | 0 | 1 | one candle closes early |
| 2019-08 | 736 / 744 | 8 | 0 | eight consecutive hours absent on 15 August |
| 2019-11 | 716 / 720 | 4 | 0 | two separate two-hour gaps |
| 2020-02 | 690 / 696 | 6 | 1 | gaps plus one early-closing candle |
| 2020-03 | 743 / 744 | 1 | 1 | one missing hour after early close |
| 2020-04 | 718 / 720 | 2 | 0 | two consecutive hours absent |
| 2020-06 | 717 / 720 | 3 | 0 | three consecutive hours absent |
| 2020-11 | 719 / 720 | 1 | 0 | one hour absent |
| 2020-12 | 740 / 744 | 4 | 1 | two gap clusters plus early close |
| 2021-02 | 671 / 672 | 1 | 1 | one missing hour after early close |
| 2021-03 | 743 / 744 | 1 | 0 | one hour absent |
| 2021-04 | 715 / 720 | 5 | 1 | two gap clusters plus early close |
| 2021-08 | 740 / 744 | 4 | 1 | four-hour gap; preceding close is 999 ms early |
| 2021-09 | 718 / 720 | 2 | 0 | two consecutive hours absent |
| 2021-12 | 744 / 744 | 0 | 1 | one close timestamp is 5.637 s early |

Detailed timestamps and SHA-256 values are retained in the workflow artifact:
`strategy-lab-binance-long-history-pilot-evidence`.

## Scientific decision

Do **not** loosen the V4.6.2 validator and do **not** synthesize missing candles.

The strict validator is doing its job: it distinguishes a fully continuous monthly source from an official archive that contains an interruption or an irregular close.

For long-history research:

- clean months may be concatenated only when the month boundary is also exactly continuous;
- a missing-hour gap is an explicit boundary;
- no PAPER position may silently cross an unmodelled source gap;
- anomalous months require segmentation or exclusion, not interpolation;
- results produced on different contiguous segments must remain separate unless the methodology explicitly defines aggregation.

## Next research step

Use the fully clean **2024–2025** corpus first:

- 24 consecutive monthly archives;
- verify cross-month continuity;
- create one in-memory 1h research corpus;
- replay the existing internal strategies with identical capital, fees and slippage;
- then apply chronological validation / walk-forward methods.

After that, return to 2019–2021 as a segmented historical corpus.

No V4.7 release is implied by this research step.
