# Seven Heaven — What successful professional crypto traders actually do (documented methods, not performance claims)

**Date:** 2026-11-13 UTC  
**Audience:** Aerith-7/8/9, MASTER/Operator research, Yoann TRADUS.  
**Scope:** Publicly documented professional trading practices, open-source source code actually supplied by the user, and scientific research; not a list of firms whose annual audited profits have been verified, not investment advice.

## 1. Evidence discipline

**Known:** algorithmic and professional crypto desks use systems for market making, hedged relative-value/arbitrage, carry/basis, momentum/trend, statistical modelling and risk-managed execution, often combining several approaches. They invest heavily in liquidity data, fees, inventory, portfolio risk and resilient infrastructure.

**Not known from public sources:** exact private profitable algorithms, risk limits, net audited returns by individual strategy, or a guaranteed profitable universal configuration. Marketing claims and published backtests are not proof of deployable edge. Many professional setups require substantial capital, multi-exchange access, low fees and low latency.

### High-quality references
- Wintermute's own strategy/infrastructure description: https://www.wintermute.com/algorithmic-trading — firm says it combines low-latency servers, proprietary quant models, order execution and delta-neutral short-term arbitrage across CeFi/DeFi. **This describes their operations; it is not independent proof of their profitability.**
- BIS Working Paper 1087, *Crypto carry* (2023): https://www.bis.org/publications/working-paper-1087-crypto-carry — spot-long/futures-short carry and its risks (margin spikes, liquidation and crash risk).
- Deprez & Frömmel, *Are simple technical trading rules profitable in bitcoin markets?* (2024): https://biblio.ugent.be/publication/01HY3C3S169G1N6QNYR55NZMFB — tested **75,360** technical trading rules, accounting for data mining and transaction costs.
- *Wish or reality? On the exploitability of triangular arbitrage in cryptocurrency markets* (2025): https://www.sciencedirect.com/science/article/pii/S154461232401537X — many apparent triangular arbitrage opportunities become **unprofitable after fees, slippage and orderbook depth**.
- *The good, the bad, and latency* (2025): https://www.tandfonline.com/doi/abs/10.1080/14697688.2025.2515933 — empirical high-frequency experiment: actual fill prices and rejection likelihood differ from orderbook snapshots due to latency and adverse selection.
- Freqtrade lookahead tests: https://www.freqtrade.io/en/stable/lookahead-analysis/ — checking backtests for future-information leakage.
- Freqtrade caveats and dry runs: https://www.freqtrade.io/en/stable/strategy-101/ — an attractive backtest is not an achieved live return; use forward/dry-run testing.
- Wintermute/BIS sources describe practices, not audited net returns. Scientific papers describe observations and methodological limitations, not guaranteed profitable algorithms.

## 2. Concrete families professionals can use

| Family | Source of theoretical edge | Models / tools | Critical risk | Fit for current project |
|---|---|---|---|---|
| **Market making** | Earn part of bid-ask spread while quoting buys/sells | Dynamic quotes, inventory-aware spread, orderbook L2, maker orders, hedges | Adverse selection, trending inventory, queue/latency, fees | **High research priority**, Hummingbot; Spot PAPER first |
| **Spot grid / adaptive grid** | Capture oscillations through repeated limit orders | Fixed/adaptive levels, inventory ledger, re-centering | One-way trends, open inventory losses, stop conditions | **Already substantial reference research**; measure model parity next |
| **Momentum / trend following** | Persistent price movements after breakout or regime shift | EMA, Donchian, MACD, SuperTrend, momentum, vol sizing | Choppy lateral markets and false breakouts | **High**, Freqtrade validation |
| **Mean reversion / pairs** | Return toward relative/equilibrium price | Bollinger, VWAP deviations, z-scores, spread-ratio models | Price does not revert, correlation breaks | **High**, test on BTC/ETH and out-of-sample |
| **Cash-and-carry / basis / funding** | Price difference between spot and futures/funding | Spot long + futures short, basis monitoring | Liquidation, margin, basis convergence, venue failure | **Documentation and PAPER only for now**, not current Spot-only live app |
| **Cross-exchange / triangular arbitrage** | Price inconsistencies between venues/pairs | Exchange orderbook routing, precision fees, atomicity constraints | Latency, bridge/transfer risk, partial fill; opportunity gone after fees | **Observation-only**, since professional latency edge cannot be assumed |
| **Volatility/options strategies** | Differences between implied vs realized volatility | Options pricing, skew, dynamic delta hedging | Tail risk, volatility spikes and hedging error | Later specialty, avoid implying OKX EEA eligibility |
| **Discretionary macro/risk overlay** | Event/catalyst interpretation with explicit risk budget | Macro monitoring, scenario analysis, position sizing | Subjectivity, news timing, leverage | Documentation, not an autonomous signal |

**Winning is not a synonym for high number of trades.** Profit after friction, inventory mark-to-market and worst-case drawdown determines quality. A strategy can generate a positive closed-cycle PnL while the total portfolio is negative (already observed in ERITH.IA's 2026 Grid research).

## 3. What professionals configure beyond indicator parameters

A professional-grade strategy is a **stack**, not simply “EMA 9/21”:

```text
Market data provenance and clock (OHLCV/L2, latency)
  → Regime filter (trend/sideways/volatility)
  → Signal or quoting strategy (parameters fixed ex ante)
  → Risk budget (max base exposure, concentration, stop/kill, liquidity bounds)
  → Execution policy (maker/taker, spread, order size, queue and rejection)
  → Portfolio ledger (cash + BTC/ETH inventory + fees + realized/unrealized PnL)
  → Audit trail (every hypothetical order, fills, errors, timestamps)
  → Validation (walk-forward, untouched periods, sensitivity, baseline)
```

Access and infrastructure, latency, fee tiers, market-making obligations, risk capital and 24/7 monitoring can be as important as the nominal indicator rule. In market making, the **quote price depends on inventory**: accumulated BTC may prompt reduced bid appetite and more attractive sell quotes; risk limits and volatility can widen spreads or stop quoting.

## 4. Specific tools now present in verified original ZIPs

Uploaded source ZIPs were preserved **byte-identically** in the user's shared GitHub Release (see [ZIP registry](./SEVEN_HEAVEN_HUMMINGBOT_FREQTRADE_EXACT_SOURCE_ZIP_ARCHIVES_REGISTRY_2026_11_13.md)). Code paths were actually listed in the uploaded archives:

**Hummingbot / market-maker and portfolio research:**
- `controllers/market_making/pmm_simple.py`, `pmm_dynamic.py` — compare static with adaptive quoting.
- `controllers/generic/grid_strike.py`, `multi_grid_strike.py` — grid controllers; scrutinize leverage default and execution semantics, do not reuse on Spot unchanged.
- `controllers/generic/stat_arb.py` — statistical/relative-value concepts.
- `controllers/generic/hedge_asset.py` and `xemm_multiple_levels.py` — hedge/market-making logic to study in simulation.
- `hummingbot/strategy_v2/backtesting/executors_simulator/grid_executor_simulator.py` — actual hypothetical Grid execution already tested on 44,640 BTC candles, **non-equivalent** to the ERITH Spot Grid.

**Freqtrade / directional experiments and bias control:**
- `freqtrade/optimize/backtesting.py` — independent backtesting.
- `freqtrade/optimize/hyperopt/hyperopt.py` — parameter optimization; increases overfitting risk if used on a common training/test sample.
- `tests/optimize/test_lookahead_analysis.py` and `test_recursive_analysis.py` — useful testing patterns; never interpret a successful code test as proof of strategy alpha.
- Snapshot `freqtrade-develop.zip` is 2026.11 development code, not a stable installed release.

## 5. ERITH.IA research priorities (sequential; simulations only)

1. **Execution realism, not new indicators first:** freeze proper spot lot/tick/size constraints with dated exchange source; reject unaffordable fill; compute wallet cash/asset inventory; handle stale/partial/nonfilled orders; keep 0.08% Maker and 0.10% Taker as user's **observed current OKX tier**, not as retroactively actual Binance historical charges.
2. **Independent full-period parity** between our Grid and Hummingbot on common BTC/USDT frozen dates, capital and fee assumptions. If not equivalent, publish `MODEL_MISMATCH` and explain it rather than rank raw PnL.
3. **Freqtrade directional benchmark suite:** EMA vs breakout vs mean reversion vs HOLD and CASH with exact data timestamps, fee/slippage assumptions, lookahead and recursive diagnostics; preserve train/test split and untouched periods.
4. **Portfolio/regime/risk lab:** adjust sizing/spread to volatility, stress returns and liquidity, add capital loss thresholds and inventory limit; compare worst-case loss and downside drawdown, not only headline profits.
5. **Read-only evidence into the UI** (MASTER, inherited Trader, separate Operator/Yoann TRADUS via shared JSON reference); only promote tested modules. Private Bridge and any live execution remain out of scope.

### Stop conditions

- No claimed profitability from unexecuted configs or backtests without untouched validation.
- No real account keys/order endpoints/futures leverage needed to study professional strategies.
- No copying Freqtrade GPLv3 code into distributed ERITH proprietary modules before review.
- No user action required to use research registry; avoid repeatedly requesting already documented fee information.

**Conclusion:** build professional-grade **research and risk infrastructure**, not a claim to own a “secret winning bot.” The robust part to imitate is the discipline: quantified capital constraints, cost-aware execution, independent validation and reproducible audit.
