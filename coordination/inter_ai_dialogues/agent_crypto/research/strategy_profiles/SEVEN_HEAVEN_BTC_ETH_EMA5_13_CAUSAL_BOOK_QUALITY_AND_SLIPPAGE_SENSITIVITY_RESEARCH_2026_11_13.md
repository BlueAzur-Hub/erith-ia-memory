# Seven Heaven — BTC/ETH USDC, EMA 5/13: causal book quality and slippage sensitivity

**Research date:** 2026-11-13  
**Status:** Read-only retrospective reanalysis of existing verified research inputs. New calculations checked against the six published 5-bp baselines. No live/paper order submitted and no production code changed.  
**Scope:** BTC-USDC and ETH-USDC (OKX Spot) on three **isolated** UTC days: 2026-08-15, 2026-09-15 and 2026-10-15. These are **not** three months of continuous backtesting.

## 1. Existing evidence preserved

The native replay studies published on 2026-11-13 cover 4,459,980 BTC L2 events and 5,168,157 ETH L2 events, 900 confirmed 15-minute OHLC candles per asset across three disjoint 300-candle windows, and 49 fictional V5 actions paired with an L2 source timestamp strictly earlier than the simulated next-candle opening (25 BTC, 24 ETH). These pairings are timestamp-based, **not** proven executable fills. Source L2 upstream sequencing, network delivery at execution time, exact historical personal trading fees, and real latency are not established.

Primary source repository: `BlueAzur-Hub/erith-ia-memory`, branch `main`.

- [BTC study](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_BTC_USDC_EMA5_13_AUGUST_SEPTEMBER_OCTOBER_PREOPEN_L2_SCIENTIFIC_COMPARISON_2026_11_13.md)
- [BTC consolidated proofs](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_BTC_USDC_EMA5_13_THREE_DAYS_PREOPEN_L2_EXECUTION_COMPARATIVE_PROOFS_2026_11_13.json)
- [ETH study](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_ETH_USDC_EMA5_13_AUGUST_SEPTEMBER_OCTOBER_PREOPEN_L2_SCIENTIFIC_COMPARISON_2026_11_13.md)
- [ETH/BTC consolidated proofs](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_ETH_USDC_EMA5_13_THREE_DAYS_PREOPEN_L2_AND_BTC_COMPARATIVE_PROOFS_2026_11_13.json)
- [ETH native V5 JS validation, GitHub Actions](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43332184629)
- [Notion canonical reference, OKX MEMORY CORE sections 01 and 05](https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099)

## 2. Additional audit: complete-cycle book age

Count a **complete intra-day cycle** only when an entry and an exit both occur on the same UTC day; preserve but do not include carry-in exits and carry-out entries in this daily-reset performance illustration. A complete cycle qualifies for a book-age threshold only when **both sides** meet it.

| Instrument/day | Completed cycles | Both book ages <= 1,000 ms | Both book ages <= 10,000 ms |
|---|---:|---:|---:|
| BTC 2026-08-15 | 5 | 3 | 5 |
| BTC 2026-09-15 | 1 | 1 | 1 |
| BTC 2026-10-15 | 6 | 6 | 6 |
| ETH 2026-08-15 | 4 | 1 | 3 |
| ETH 2026-09-15 | 4 | 4 | 4 |
| ETH 2026-10-15 | 3 | 3 | 3 |
| **Total** | **23** | **18** | **22** |

Thus 18/23 complete cycles (78.26%) have both quotes <=1 s; 22/23 (95.65%) have both <=10 s. All five cycles failing the stricter 1-second test are from **15 August** (2 BTC, 3 ETH). ETH's 2026-08-15 exit at 20:30 UTC has an 11,888-ms book age and fails even the 10-second gate. **Do not treat the previously reported full-sample book-price PnL as an all-qualified result.** The present audit does not recompute filtered equity paths, which would require replaying cycle selection and compounding after each exclusion.

## 3. Additional sensitivity: re-price fixed V5 dates, same model

**Only one variable changes:** assumed slippage per side. These are hypothetical settings (0, 2, 5, 10 basis points), **not measured slippage values**. Use exactly the same daily completed V5 EMA5/13 operations and native `next_open_price` recorded in the six individual `SEVEN_HEAVEN_{BTC|ETH}_USDC_V5_EMA5_13_2026_{08|09|10}_15_CAUSAL_L2_PROOFS.json` files.

For every UTC day: start with 1,000 USDC fictional cash; ignore an inherited sell preceding that day's first buy; exclude a buy remaining unclosed at day's end. For each completed buy/sell cycle, with fee `f = 0.001` (0.10% per side), hypothesized slip `s`, and prices `B` and `S` from the stored `next_open_price` fields, recursively compute:

```
cash_after_sell = cash_before_buy / (B * (1+s) * (1+f)) * (S * (1-s)) * (1-f)
PnL_daily_USDC = cash_final - 1000
```

This formula follows the daily-reset illustrative V5 calculation, not the native V5 PnL across all 300 candles. Book-reference notional was fixed at 1,000 USDC in the original book-based study; this sensitivity test **does not** use hypothetical book VWAP and is distinct from that earlier comparison.

| Instrument/day | 0 bp/side | 2 bp/side | **5 bp/side — original V5** | 10 bp/side |
|---|---:|---:|---:|---:|
| BTC 2026-08-15 | -11.605771 | -13.580584 | -16.535408 | -21.440461 |
| BTC 2026-09-15 | -14.677811 | -15.071861 | -15.662640 | -16.646486 |
| BTC 2026-10-15 | -17.637711 | -19.992554 | -23.514238 | -29.355614 |
| ETH 2026-08-15 | -9.938732 | -11.521563 | -13.891067 | -17.827627 |
| ETH 2026-09-15 | -43.606803 | -45.135808 | -47.424735 | -51.227428 |
| ETH 2026-10-15 | +17.274353 | +16.054356 | +14.227103 | +11.188980 |

**Cross-check:** the 5-bp column exactly reproduces the six independently published original daily-reset V5 PnL values to the displayed 0.000001 USDC precision. This confirms the consistency of this *re-pricing formula* with the archived baselines, not the profitability of V5 in real trading.

**Bounded finding:** five of the six instrument-days remain loss-making even at **zero fictional slippage** with 10 bp taker fees on each side; only ETH 2026-10-15 remains positive for all four hypothetical slippage settings. Thus reducing spread/depth friction alone would not have cured most losses **in this specific sample**. The days are not independent stochastic replicates of a full strategy's monthly performance, the signal times vary across assets, and daily capital is reset, so do not sum daily PnLs to claim an investor return.

## 4. Frozen next cohort — selection BEFORE examining their PnLs

Choose the immediately preceding **three calendar 15ths** prior to the already-studied August date, without inspecting subsequent EMA PnLs: **2026-05-15, 2026-06-15, 2026-07-15**, each for **BTC-USDC and ETH-USDC Spot**. The selection rule is simple, predetermined, and does not claim to sample every market regime. Classify observed volatility/trend conditions **after collecting objective data** rather than retroactively selecting a positive or negative trading day.

Run lightweight **availability preflight first**, *before* any heavy L2 download:

1. For each exact pair/date, confirm the OKX official daily L2 archive listing and filename, archive size where exposed, and confirmed native 15-minute OHLC coverage sufficient for each 300-candle window. OKX's general historical-data page states L2 histories exist from March 2023; this **does not confirm the specific six date/pair archives**. [OKX historical data](https://www.okx.com/historical-data).
2. Save immutable source addresses, publication time if known, UTC bounds, raw response and source SHA. Missing coverage is recorded as **missing**, never replaced with a nearby more profitable date after seeing PnL.
3. After confirmation, replay full archives with SHA-256/CRC, reconstructed book states, native confirmed OHLC, EMA5/13 cross, and independent original V5 JS timestamp equality; pair **only** with the latest L2 source timestamp `< next.open T`.
4. Record book-age gates 100 ms, 1 s, 10 s; complete-cycle eligibility **both sides**; source-delivery / latency unknown; inherited exits and unclosed entries; fixed 1,000 USDC notional and explicitly hypothetical 0.10% taker fees.
5. Publish both *all timestamp-matched* and *age-qualified* tables; evaluate V5 `s={0,0.0002,0.0005,0.001}` without using the observed outcomes to choose a default setting. Preserve current V5/V6 defaults and production UI.

**Preflight status as of this note:** The historical OKX documentation and the repository's existing multi-date replay implementation have been inspected, but direct official listing requests for **these six new date/pair archives have not succeeded from the available research interface**. Their existence, hashes, and eligibility remain **UNVERIFIED**, not missing and not available. No additional 2026-05/06/07 L2 event was downloaded or replayed in this session.

## 5. Decision and stop point

The immediate follow-up study is complete as a **sensitivity and evidence-eligibility audit**, not a new L2-date replay. Keep V5's current PAPER assumptions **taker 0.10% per side** and **fixed slippage 0.05% per side** unchanged. The next concrete operation is metadata-only preflight for the preselected May/June/July archives; only if available should the larger replay be started. No Trader/Administrator/Operator/Bridge change, no Notion write, and no real order. This research report is archived as a documentation-only commit in the shared GitHub directory.