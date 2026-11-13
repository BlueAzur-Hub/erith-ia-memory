# Seven Heaven — First broader bot study: fixed DCA vs bounded Spot DCA Martingale daily proxy

**2026-11-13 · HISTORICAL retrospective PAPER only; NOT OKX bot execution, not prospective validation.**

## Method

- Frozen before this replay: [DCA/Martingale protocol](../SEVEN_HEAVEN_FIXED_DCA_AND_SPOT_MARTINGALE_DAILY_CAUSAL_PROTOCOL_2026_11_13.md).
- Bitstamp BTC/USD and ETH/USD daily OHLC, three separate **1,000 USD** test budgets: calendar 2024, calendar 2025, Jan–Oct 2026.
- Four policies: no trade (CASH), immediate Buy & Hold, equal monthly purchases, bounded 40 USD + 4 safety buys after 5% drops with 1.8 multiplier and 6% prior-close take-profit (daily, next-open-only analogue).
- Hypothetical 0.10% fee + 0.05% slippage on both sides; cash earns 0%. No real orders, minSz, account access or venue-specific historical fill proof.

## Returns and drawdowns (fictitious, final liquidatable balance)

| Coin | Window | Underlying gross change | HOLD return | Fixed DCA return | Martingale proxy return | Martingale max DD | Martingale buys/sells | Martingale max committed USD |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| BTC | 2024 | 120.98% | 120.32% | 53.34% | 20.99% | -3.26% | 45/24 | 474.88 |
| BTC | 2025 | -6.27% | -6.55% | -12.19% | 1.41% | -12.82% | 18/7 | 894.78 |
| BTC | 2026_JAN_OCT | -11.50% | -11.77% | 6.63% | 12.76% | -9.47% | 18/6 | 894.78 |
| ETH | 2024 | 45.98% | 45.54% | 13.45% | 23.74% | -15.55% | 32/15 | 894.78 |
| ETH | 2025 | -10.93% | -11.20% | 5.69% | 6.19% | -44.42% | 23/8 | 894.78 |
| ETH | 2026_JAN_OCT | -24.10% | -24.32% | 3.83% | -13.43% | -37.12% | 6/1 | 894.78 |

## Risk and interpretation

1. Fair initial bankroll **is not** equal invested capital: monthly DCA and Martingale retain significant cash; compare `average_idle_cash_usd`, `max_marked_inventory_usd`, exposure days and drawdown, not return alone.
2. The Martingale trigger deliberately lacks a stop-loss and can retain a large losing inventory through declining markets. Trades counted as completed cycles must not hide still-open inventory at the final day.
3. The experiment uses **previous closed daily price** to trigger a next-open hypothetical buy/sell: it cannot claim to simulate intraday limit orders, the actual OKX Martingale bot, its user configuration or the order queue.
4. Every cohort (2024, 2025, early 2026) was already known from other Agent-Crypto studies. This is a **new strategy family**, but still an **exploratory historical comparison**, not blind validation.
5. Double-cost sensitivity and full per-event ledger are in the adjacent JSON. Do not tune the parameters on these results and then report the same periods as validation.
6. Before testing actual Spot Grid mechanisms, obtain or reconstruct sufficiently granular ordered prices. Daily OHLC alone cannot establish the order of touches within a grid.

## Preservation

- Deterministic standard-library Node.js replay: [source](../SEVEN_HEAVEN_BTC_ETH_FIXED_DCA_VS_SPOT_MARTINGALE_CAUSAL_REPLAY_2026_11_13.cjs).
- [Proof JSON including inventories and all entry/exit events](./SEVEN_HEAVEN_BTC_ETH_DCA_MARTINGALE_2026_11_13_PROOFS.json).
- No change to Administrator, Trader, Operator, Bridge, live bots or account permissions; separate strategy learning evidence only.
