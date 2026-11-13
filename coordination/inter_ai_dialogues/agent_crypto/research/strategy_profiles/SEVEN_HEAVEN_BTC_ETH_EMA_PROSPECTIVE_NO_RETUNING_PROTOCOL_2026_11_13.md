# Seven Heaven — BTC/ETH EMA: frozen protocol for a genuinely future observation

**Research freeze date:** 2026-11-13, Europe/Paris (early morning).  
**Status:** PRE-REGISTERED before requesting any new Bitstamp OHLC after 2026-10-31 in this research session.  
**Scope:** Read-only, no real orders, no change to Administrator, Trader, Operator or Bridge.

## Fundamental distinction

- **Historical derivation/exploration:** UTC 2024-01-01 through 2026-10-31, already researched extensively.
- **Later-date diagnostic:** UTC 2026-11-01 through the last fully closed UTC candle at the time of collection. Although later than the earlier backtest window, these November days **already occurred before this document**; they are NOT prospective and must NOT be described as a blind forward test.
- **Genuinely prospective cohort:** Start with the **first fully closed UTC day whose open is strictly after this protocol's publication**: **2026-11-14 00:00:00 UTC**. Earliest such datum is available after **2026-11-15 00:00:00 UTC**. November 13 is a transition day excluded from the scored prospective series. No rules, fees, capital allocation or thresholds may be changed based on these outcomes.

## Immutable methods, all calculated from previous UTC daily closes

The source is **Bitstamp native Spot BTC/USD and ETH/USD**. Warm EMA values from the daily history starting 2023-04-01, without restarting indicators at new calendar boundaries. Seed each EMA with the first close in the warmup. Formula `EMA_N[t] = EMA_N[t-1] + 2/(N+1)*(close[t]-EMA_N[t-1])`.

Three portfolios **per asset**, each evaluated on the same dates and using the same starting cash at the *first day of each evaluation window*, not mixing comparisons across windows:
1. `HOLD`: 100% asset from the first eligible opening (without signal).
2. `FAST`: 100% asset iff `EMA5 > EMA13 AND close > EMA13` as of the **previous** closed day; otherwise 100% fiat USD.
3. `SLOW`: 100% asset iff `EMA10 > EMA30 AND close > EMA30` as of the **previous** closed day; otherwise 100% fiat USD.

Four **diagnostic-only** comparators already evaluated on historical dates may be displayed but are **not eligible for rule selection**: FAST AND SLOW; SLOW two- or three-consecutive-close confirmation; sell on one negative daily state/reenter after two positive daily states. Neither a comparator nor any altered configuration may be presented as a newly discovered winner.

Capital: nominal **1,000 USD per standalone asset simulation** or two independent 500 USD sleeves for descriptive 50/50 with no rebalancing. Long-only spot, no borrowing, no leverage. Market prices are fictional fills at the **next UTC day opening**, with **0.10% fee and 0.05% slippage on each side**, checked once also at exactly doubled costs. Mark to liquidation at each UTC daily close, including hypothetical exit cost. No taxes, minimum sizes, API latency, spreads, liquidity, USD/USDT/USDC parity or futures.

**Start-of-window position:** cash at the first evaluation day, then on its opening take the position dictated by **yesterday's** signal; this is a new 1000 USD hypothetical evaluation. Do not join portfolio PnL from the pre-2026-11-01 backtest to the diagnostic/prospective cohort, and do not treat incomplete cycles as closed.

## Evidence admissibility and acceptance

- Fetch **only closed daily candles** from the official Bitstamp public API `/api/v2/ohlc/{market_symbol}/` with `step=86400`, `exclude_current_candle=true`; explicitly bounded request timestamps.
- Require exact pair identity, consecutive UTC-midnight opens, nonnegative base volume, valid OHLC, no duplicated/contradictory day. Hash the raw API JSON responses and canonical selected OHLC CSV. Preserve links, request UTC time, HTTP/format errors; never replace gaps with generated candles.
- Analysis is date-scoped: number of days, signal states, hypothetical fills with costs, mark-to-liquidation drawdown, cash exposure, trade count; report opportunity cost from completed cash windows only, mark end-censored windows separately.
- The November 1–12 retrospective diagnostic must be reported independently of the true prospective results and must **not** affect parameters.
- Minimum observation checkpoints for forward tracking: **14, 30 and 90 fully closed UTC days**; do not declare generalizable outperformance before 90 observations; even 90 days cannot validate general profitability by itself.
- Compare simultaneously BTC vs ETH and slow vs fast vs HOLD with identical fee/slippage, and report stress ×2. Any account fee quoted is the existing PAPER assumption, not personal Bitstamp history.
- Any source or code failure is a **failed or incomplete test**, not a fabricated zero return. Never claim a successful run without reading its confirmed status.
- The strongest admissible verdict is **observational, preliminary, non-predictive** until a genuinely new corpus exists; no trading advice or activation.

## Original frozen reference

Reference report (November 13): `SEVEN_HEAVEN_BTC_ETH_DAILY_CASH_OPPORTUNITY_CONFIRMATION_AND_RISK_REPORT_2026_11_13.md`, proof JSON of the same stem, and the read-only JavaScript reproducible replay. Existing native source SHA values: BTC `89a85a2f419244b3140f0518fb731f37c06abc3b73734433eb3fbf4642907dbb`, ETH `881227ba20481322b6829c19d97b799d11a73ae155be8868cf5ec943039c6b49`.

**Stop:** An unobserved future outcome is not a result. One completed diagnostic + a frozen independent forward-test setup is useful; further retrospective overfitting is not.

## Timing erratum — corrected before any forward-day replay

The original 13-Nov first-day boundary was too early: this protocol was committed **after 2026-11-13 00:00 UTC**, so the first hours of the proposed day were already in the past at freeze. The first strictly forward UTC day is **2026-11-14** (first fully closed on **2026-11-15 at 00:00 UTC**). This corrects temporal eligibility only; **EMA rules, fees, slippage, capital, comparison policies and historical 1–12 November diagnostic are unchanged**. No forward-day test had been run before the correction. November 13 data are used only to warm the EMA signal, never scored as a prospective return.
