# Seven Heaven — Crypto bot strategy families and AI research learning curriculum

**13 November 2026 · Shared research · Spot/PAPER only · No execution authority**

## Purpose

The next Agent-Crypto research is **not another EMA-only parameter search**. It is a controlled comparison of diverse hypotheses actually used in algorithmic trading, with reproducible data, stop conditions and cross-agent retention. Distinguish a chart indicator, a signal strategy, a bot execution mechanism, and a risk-management rule. Never present screenshots or marketing backtests as measured out-of-sample returns.

### What has already been learned — do not repeat it

- Existing archive: ten-strategy continuous BTC replay (Nov 11); EMA/SuperTrend/regime studies; ETH EMA native Bitstamp vs Binance (Nov 12); frozen BTC/ETH 2024–Oct 2026 comparisons (Nov 13). Use the GitHub `strategy_profiles` research directory and [cash/EMA synthesis](./SEVEN_HEAVEN_BTC_ETH_DAILY_CASH_OPPORTUNITY_CONFIRMATION_AND_RISK_REPORT_2026_11_13.md).
- EMA5/13 and EMA10/30 performance strongly depends on market/date/costs; overlapping lookbacks are **not** independent validation; combinations and confirmation delays did **not** uniformly improve performance. Large drawdowns remain.
- Historical V5 and instant-book V6 are PAPER only. A separate [spot lot/inventory adapter](./SEVEN_HEAVEN_OKX_SPOT_PAPER_LOT_MINIMUM_INVENTORY_ADAPTER_2026_11_13.cjs) now validates known public `minSz`, `lotSz` and a hypothetical base-inventory sell on **synthetic fixtures**, not broker account permissions.
- Chart “Options” profiles `MA, EMA, S/R, SuperTrend, Bollinger, SAR, VWAP, volume profile` are **indicator/display configurations**. These are not necessarily order-execution algorithms. Never turn a saved indicator profile into an order or into proven strategy PnL.

## 1. Taxonomy — what bots and traders actually configure

| Class | Representative study | Decision or operation | Minimum parameters to preserve | Adversarial risk test | Phase |
|---|---|---|---|---|---|
| Baseline | Buy & Hold | Permanent long exposure | first day, asset, starting capital | long bear drawdown, asset choice | Reference |
| Baseline | No trade / fiat cash | No market exposure | cash yield=0, currency | opportunity cost, currency exposure | Reference |
| Accumulation | Fixed periodic DCA | Repeated equal-quote buys without price forecast | cash schedule, finite contribution budget, end policy | terminal inventory, comparison at identical total deposits | A |
| Accumulation / *different* | Spot DCA Martingale | Conditional additional buys after price drops, increasing size | step %, volume multiplier, maximum safety orders, total reserved capital, TP, stop | uninterrupted waterfall; insolvency/capital lock | A / high risk |
| Range | Spot Grid | Range-limited staggered buys/sells | lower/upper band, count/arithmetic vs geometric grid, entry inventory, fee hurdle, stop outside band | strong one-way trend and unfilled inventory | A |
| Trend | MA/EMA crossover and state filter | Position on signal/previous close | periods, timeframe, signal type, exposure | chop/whipsaw, high turnover | Existing reference |
| Trend | Donchian / Turtle breakout | Enter after previous N-bar high; exit on distinct trailing low | N, exit M, delay, size | stop-run false breakouts and gaps | B |
| Trend | SuperTrend / ATR | Follow volatililty-adjusted trend | ATR N, multiplier, trailing exit | regime turns, slippage on high-volatility exits | Existing + B |
| Trend | MACD | Momentum crossover and zero-line regime | fast, slow, signal windows, trend gate | noisy sideways market | B |
| Momentum | Time-series / cross-sectional momentum | Rank own or cross-asset returns | ranking window, universe, rebalance, exclusions, survival bias | winners delist, turnover, regime crash | B |
| Mean reversion | Bollinger / RSI reversion | Buy oversold and sell on normalized return | oscillator N, bands, max hold, veto on strong trend | “oversold” stays oversold; fatal averaging | B |
| Mean reversion | VWAP deviation | Buy after price/volume deviation with specified reset | session anchor, venue volume, band, session timezone | 24/7 session ambiguity and trend persistence | B |
| Structure | Support/resistance / pivot | Rules around observed levels | level formation past-only, confirmation, invalidation | lookahead in level identification | B |
| Volatility | ATR sizing / risk parity | Adapt exposure to estimated volatility | historical lookback, target exposure, cap, turnover | volatility spikes/correlation changes | C |
| Portfolio | Threshold rebalancing | Return multiasset weights to targets | targets, threshold, schedule, min trade | rotation costs, correlation drawdown | C |
| Portfolio | Smart Portfolio | Automatic target weights with rebalancing | weights, rebalance event, cash buffer | bear market in all correlated assets | C |
| Execution *not alpha* | TWAP | Slice an existing intended order over time | size, duration, interval, price constraints | market drift vs completion | Mechanics only |
| Execution *not alpha* | VWAP execution | Target observed volume profile during execution | participation cap, forecast volumes, end policy | unreliable 24/7 venue volume | Mechanics only |
| Execution *not alpha* | Iceberg | Hide portions of a pre-authorized order | total size, visible slice, price, exposure | detection and non-execution | Mechanics only |
| Microstructure | Passive market making | Bid/ask around a fair mid | spread, quote sizes, inventory skew, cancel/replace | adverse selection, queue nonfills, maker fee | Advanced, observation only |
| Cross-venue | Spot arbitrage | Compare executable prices across venues | depth, transfer/rebalance costs, clock, inventory | latency, settlement, fees, unavailable balances | Advanced, no live |
| Statistical | Pairs spread mean reversion | Hedge relative asset divergence | cointegration, hedge ratio, liquidity | structural breaks, hedge/slippage | Advanced |
| Risk | Stop-loss / trailing stop | Limit model losses, not guaranteed fills | trigger price, close type, gaps, leverage forbidden | fast gap, spread spike, stop hunts | Every phase |
| Risk | Circuit breaker / cooldown | Disable new entries under degradation | drawdown threshold, stale price, timeout, max frequency | fail-open checks and re-entry loops | Every phase |

**Off limits for first implementation:** leveraged futures grids, perpetual funding/carry, borrowed positions, real market making, unhedged cross-exchange transfers and “AI guaranteed profit” subscriptions. Research them conceptually without live orders; margin/liquidation/multi-account requirements would confound the current small-budget Spot PAPER study.

## 2. OKX’s *actual* publicly documented bot catalogue is jurisdiction dependent

- OKX **Europe EEA help**, updated **27 August 2026**, identifies **Spot Grid** and **Spot DCA (Martingale)** as its EEA bots: https://www.okx.com/fr-fr/help/what-are-okx-eeas-crypto-trading-bots-and-how-do-i-utilize-them
- OKX broad international bot guide lists **Futures Grid, Smart Portfolio, recurring buy, arbitrage, Iceberg, TWAP**, among others: https://www.okx.com/fr-fr/learn/trading-bot . This is **research taxonomy, NOT proof that the user’s French/EEA account can launch them**.
- Official **Spot Grid** explanation (upper/lower band, finite grids, buy-low/sell-high, variable outcomes): https://www.okx.com/fr-fr/help/whats-the-spot-grid-bot-and-how-do-i-use-it
- Official **Spot DCA Martingale**: https://www.okx.com/fr-fr/help/whats-spot-dca-martingale-bot-and-how-to-use-it . This is **not** equivalent to fixed periodic DCA. It increases buying into price declines and needs a hard capital ceiling.
- Open-source **Freqtrade**: https://www.freqtrade.io/en/latest/strategy-customization/ and https://www.freqtrade.io/en/stable/lookahead-analysis/ . Lookahead and recursive bias can distort backtests; do not adopt community profiles without causal validation.
- Open-source **Hummingbot**: https://hummingbot.org/ . Useful for architectural study of market making, execution controllers and inventory risk; not a library to bolt onto our static UI or an endorsement of profitable strategies.
- **No reliable universal statistic** for the most popular or most profitable strategy among all traders was established by these references. Marketing examples and exchange “AI presets” need independent audit.

## 3. AI research curriculum: distinct experiments, not “more variants forever”

### Phase A — three priority comparisons (spot only)

1. **Periodic DCA vs Martingale DCA vs lump-sum Buy & Hold**, identical total external capital supplied and investment horizon. Martingale: **cap all safety orders and reserve cash from the start**; risk of larger exposure to falling prices must be quantified. At every timestamp compare holdings and *total capital contributed*, never equity alone.
2. **Spot Grid vs HOLD vs CASH vs EMA regime**: choose **one frozen grid geometry**, lower/upper limits from an earlier training interval, model actual stock of base and quote, all fills with conservative bid/ask and `minSz/lotSz`, count fee events, and close with inventory valuation. Out-of-range trend is a required failure scenario.
3. **EMA/SuperTrend trend vs Bollinger/RSI mean reversion**, with exactly matching OHLC, fees, capital, size constraints and out-of-sample dates. Test whether regime identification helps, without tuning the classifier on evaluation results.

### Phase B — widen *economic hypotheses*

- Donchian breakout and momentum (trend), Bollinger/RSI and anchored VWAP (reversion), defensive cash states, and fixed-volatility position sizing.
- Do not call chart overlays “strategies” until a specific causal entry/exit, size and forced liquidation rule is written and frozen.
- Compare the same pair across **OKX Spot USDC** where available and one independent venue, with explicit unit/market differences; do not claim Bitstamp USD = OKX USDC.

### Phase C — advanced microstructure, observation only

- Passive quoting, spread capture, imbalance and arbitrage: historical L2 can assess market structure, but does **not** establish queue position or real fill. Treat TWAP, VWAP-execution and Iceberg as *execution mechanisms*, not stand-alone predictive signals.

## 4. Required artifact schema for every AI experiment

Every agent must produce a short `STRATEGY_CARD.md` and machine-verifiable `EVIDENCE.json` with:

- identity, immutable strategy family/variant, code commit and precise source paths;
- source venue and currency pair (BTC-USDC is not BTC/USD), raw hashes, real coverage and admissibility gaps;
- frozen timestamp and training / validation / prospectively acquired datasets with no leakage;
- exact causal signals, indicator warmup, fill timing, fees, size/lot/min validation, max capital, no leverage;
- buy/sell inventory and net equity ledger; rejected orders, partial fills, stale data and missing venue permission;
- net return, max drawdown, trade count, exposure, loss streak, costs, idle-cash opportunity cost and high-risk stress regimes;
- reference HOLD/CASH and (where meaningful) previously frozen EMA benchmark on **the same dates**;
- falsification findings, failure conditions, sensitivity with costs ×2, and genuinely untouched dates;
- mandatory verdict one of **`REJECT` / `OBSERVE` / `RESEARCH_BENCHMARK`**, never `PROFITABLE_LIVE` from a backtest.

## 5. Master Interface / Trader / Operator architecture and next gates

**Verified November 13:** public MASTER at `BlueAzur-Hub/erith-ia-memory`, published 40.6.719 / Market Core 38.15.11. MASTER Trader `trader/trading-desk.html` loads `../administrator/index.html?surface=trader`, so one shared change benefits both. The Operator repo `BlueAzur-Hub/agent-crypto-operator` displays the same build but has **different** HTML / Trader shim, despite identical V5 and V6 module blob SHAs. Exact build number is not proof of full functional parity.

**Delivery discipline:**
- One **read-only PAPER comparison panel** in the MASTER Interface Options/Bougies, shared by its Trader. Existing V5/V6 logic unchanged; no historical-PnL rewrite, no live trade path.
- Run reproducible Node tests + existing V5/V6 suites + UI no-secret/no-order checks on a review branch. **A green test is not a Firefox visual/user acceptance test.**
- After MASTER publication and visual verification, carry **only the compatible UI files/paths and their dependencies** to the Operator code, preserving Yoann’s separate Aether/Bridge roles, Trader and TRADUS; prefer a genuinely shared source rather than recurring scattered ports.
- Never overwrite the Operator private environment or infer operator account permissions from public OKX listings.
- No live orders, no new live bot configuration, no spending of funds.

## 6. What human help would genuinely add evidence

**Optional, never required for the research work above:** screenshots of the **public, non-sensitive** OKX Europe **Spot Grid** and **Spot DCA** settings (parameters only, not balances, IDs, accounts, API keys or active positions), to map user-visible configuration to a frozen simulation card. The AI can research without them. Such screenshots **are not** evidence of backtest profitability.

**Stop condition for this batch:** publish this taxonomy, a small frozen set of Phase A protocols and a tested PAPER comparison UI. New live trading capabilities are **out of scope**.
