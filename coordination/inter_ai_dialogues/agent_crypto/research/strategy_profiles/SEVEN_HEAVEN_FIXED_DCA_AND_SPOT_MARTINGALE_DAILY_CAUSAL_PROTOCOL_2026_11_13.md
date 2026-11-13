# Seven Heaven — Frozen research question: Fixed DCA vs Spot DCA Martingale vs Buy & Hold

**Frozen 13 November 2026 · Educational research only · Historical retrospective, NOT a blind out-of-sample test**

## Question

Can a bounded, decline-triggered **Spot DCA Martingale analogue** on BTC and ETH preserve more wealth or avoid drawdowns than **fixed monthly DCA** and **Buy & Hold**, when all methods share a **single 1,000 USD initial bankroll** and realistic hypothetical transaction costs?

This is a **causal daily-close/next-open proxy**, not an emulation of OKX's live intraday safety-order bots. OKX EEA publicly documents Spot DCA (Martingale), but the user's account-specific product availability and order rules remain independent. We prohibit leverage, real orders and API-account access.

## Frozen cohorts before examining the new strategy results

Three **separate**, explicitly labeled evaluation windows, each starting with 1,000 fictitious USD and no external deposits:
- `2024-01-01 → 2024-12-31` (366 daily observations);
- `2025-01-01 → 2025-12-31` (365);
- `2026-01-01 → 2026-10-31` (304).

Two independent historical Bitstamp Spot assets: BTC/USD and ETH/USD, using the preexisting native daily CSV (2023-04-01 → 2026-10-31, 1,310 consecutive days). **Not** OKX BTC-USDC or ETH-USDC. No 1-minute limit-order/grids are implied by this daily source.

## Shared accounting (all methods)

- 1,000 USD reserved in the portfolio on the first day. Cash earns 0; no deposits, no credit, no leverage, no real orders, no borrow.
- BUY entry at that day's documented UTC **open × 1.0005**; fee **0.10%** charged in quote budget; base quantity = quote debit / (hypothetical fill × 1.001). SELL at documented open **× 0.9995**; net quote = qty × fill × 0.999.
- After each closed daily candle, equity = idle cash + full base inventory hypothetically liquidated at its close × 0.9995 × 0.999. Measured drawdowns use **daily liquidation value**, not intraday worst-case.
- Do not use an intraday high/low to assume fill sequencing or bot profitability. BUY/SELL decisions are made using only the previous *fully closed* UTC daily candle, except pre-scheduled monthly buys and initial day purchases. No lookahead.
- No order book, lot/min-size, real exchange fee currency, actual quote-notional minimum, tax, interest or missed real fill; all are **modelling limitations**.
- Price source hashes, exact dates, actions and fees will be stored in an immutable proof. Compare at **same capital made available**, NOT equivalent invested amount or equivalent trading risk.

## Four fixed policies

1. `CASH`: keep the full 1,000 USD unexposed.
2. `HOLD`: at first opening, buy BTC/ETH with the full 1,000 USD, hold to end-of-window fictitious liquidation.
3. `MONTHLY_DCA`: at the first opening of each calendar month (12/12/10 buys depending cohort), spend **1,000 / N_months** of the initial reserved cash. Do not reinvest sale proceeds because no intrawindow sales; no external contributions.
4. `SPOT_DCA_MARTINGALE_DAILY_PROXY`: start one cycle with a **40 USD** initial hypothetical BUY at the first opening. On subsequent daily closes, if previous close drops at least **5% below the last bought fill**, place a safety BUY at the *next* daily open. A maximum of **4 safety buys per cycle**, each safety budget `40 × 1.8^k`, for k=1…4. Total planned quote per fully deployed cycle = **894.784 USD**, not an unlimited Martingale. If a scheduled safety amount exceeds available cash, **skip rather than overspend**; preserve all cash and document rejected attempts. If the previous close reaches **6% above average all-in purchase cost per unit** (including buy fees), SELL the entire available inventory at the next opening, then **remain flat until the next daily opening** and restart with a 40 USD entry. Trigger precedence: if both could occur, TP SELL precedes BUY. No stop-loss; the consequence must be measured explicitly. No final liquidation order is fired: mark open inventory at end-of-window.
 
**These are fixed, illustrative parameters, not an optimized or endorsed preset.** Comparing a strategy that may leave most cash idle with one that fully invests must always show exposure. An unprofitable result is informative; a profitable result is not a reliable prediction.

## Rejection and evidence rules

- For each asset/window/policy, report net percent return, final USD, maximum drawdown, buy/sell count, max base market exposure in USD, average % of days with asset inventory, cash remaining, open inventory, and price-change regime.
- Additionally show number of finished Martingale cycles, safety buys per cycle, skipped safety buys and cases with 4/4 safety orders exhausted while underwater.
- Cross-check reserve identity and nonnegative cash for every action. A duplicated day, missing data, wrong SHA or invalid OHLC must fail the run. Compare costs doubled `0.20% fee + 0.10% slippage` per side without retuning triggers.
- Do not pick a “winner” from 2024/2025/2026 after viewing results: the whole 2024–2026 horizon is previously researched. **Exploratory only**, not prospective. A future closed-day cohort must be separately precommitted before claiming a blind result.
- This research is distinct from **Spot Grid**: genuine grid fills require path/touch sequence and enough intraday market-depth data. Do not pretend daily OHLC validates a grid.
 
**Authoritative bot descriptions:** https://www.okx.com/fr-fr/help/what-are-okx-eeas-crypto-trading-bots-and-how-do-i-utilize-them and https://www.okx.com/fr-fr/help/whats-spot-dca-martingale-bot-and-how-to-use-it .
