# Seven Heaven — Agent Crypto shared research handoff (11 November 2026)

**Canonical shared location:** `coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles` on `BlueAzur-Hub/erith-ia-memory`, branch `main`.

**Purpose:** allow Aerith-7, Aerith-8, Aerith-9, Aerith-6 and other collaborating AI assistants to resume these studies **from the repository, without reading any ChatGPT conversation**. These are research-only findings: no account access, no orders, no automatic strategy activation.

## Start here

1. Read this handoff and [strategy index](./README.md).
2. Read the relevant **report**, then its **PROOFS.json** and study **.py**. Summary JSON omits some event and transaction detail.
3. Use the CSV equity / decision / event files to re-check reported outcomes.
4. Retrieve the original minute ZIP archives via the public **GitHub Releases** (not from these Markdown reports), check their SHA-256 against the [canonical hourly-shard registry](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/calendar_year_hourly_shards/index.json) and verify timestamps, counts and continuous coverage.
5. Before reproducing the scripts, read their local dependency imports; keep dependent Python files together. Python packages include `numpy` and, for grid processing, `numba`. Input ZIPs and binary data are **not committed** in this research folder.
6. Preserve research-only mode. A backtest outcome is not evidence that a hypothetical order executed on a live exchange.

## Published and verified studies

### 1. Spot Grid 2026 (continuous 304 days)

2026-01 to 2026-10, 437,760 native Binance BTCUSDT 1m candles; initial 1000 USDT; compare fixed and monthly-reset grids with hold baselines. Published example: fixed ±10% TOUCH -3.65%; monthly reset ±10% TOUCH -18.34%; hold 50% -5.88%, hold 100% -11.75%. Do not interpret completed cycles as whole-portfolio profit.

- [Report](./SEVEN_HEAVEN_SPOT_GRID_CONTINUOUS_BTC_2026_JAN_OCT_REPORT.md) — `SEVEN_HEAVEN_SPOT_GRID_CONTINUOUS_BTC_2026_JAN_OCT_REPORT.md`
- [Full structured evidence](./SEVEN_HEAVEN_SPOT_GRID_CONTINUOUS_BTC_2026_JAN_OCT_PROOFS.json) — `SEVEN_HEAVEN_SPOT_GRID_CONTINUOUS_BTC_2026_JAN_OCT_PROOFS.json`
- [Daily equity](./SEVEN_HEAVEN_SPOT_GRID_CONTINUOUS_BTC_2026_JAN_OCT_EQUITY_DAILY.csv) — `SEVEN_HEAVEN_SPOT_GRID_CONTINUOUS_BTC_2026_JAN_OCT_EQUITY_DAILY.csv`
- [Reproduction source](./SEVEN_HEAVEN_SPOT_GRID_BTC_2026_JAN_OCT_CONTINUOUS_REPLAY.py) — `SEVEN_HEAVEN_SPOT_GRID_BTC_2026_JAN_OCT_CONTINUOUS_REPLAY.py`

### 2. Spot Grid Q1 2024 and Q1 2025 (181 days)

2024-01..03 and 2025-01..03 separately, 260,640 native BTCUSDT 1m candles. Four grid widths ±5/10/20/30%, hold 50/100%, costs sensitivity and rebalance variants; capital stays within each quarter.

- [Report](./SEVEN_HEAVEN_SPOT_GRID_BTC_2024_2025_Q1_CONTINUOUS_REPLAY_2026_11_11_REPORT.md) — `SEVEN_HEAVEN_SPOT_GRID_BTC_2024_2025_Q1_CONTINUOUS_REPLAY_2026_11_11_REPORT.md`
- [Full structured evidence](./SEVEN_HEAVEN_SPOT_GRID_BTC_2024_2025_Q1_CONTINUOUS_REPLAY_2026_11_11_PROOFS.json) — `SEVEN_HEAVEN_SPOT_GRID_BTC_2024_2025_Q1_CONTINUOUS_REPLAY_2026_11_11_PROOFS.json`
- [Daily equity](./SEVEN_HEAVEN_SPOT_GRID_BTC_2024_2025_Q1_CONTINUOUS_REPLAY_2026_11_11_EQUITY_DAILY.csv) — `SEVEN_HEAVEN_SPOT_GRID_BTC_2024_2025_Q1_CONTINUOUS_REPLAY_2026_11_11_EQUITY_DAILY.csv`
- [Reproduction source](./SEVEN_HEAVEN_SPOT_GRID_BTC_2024_2025_Q1_CONTINUOUS_REPLAY_2026_11_11.py) — `SEVEN_HEAVEN_SPOT_GRID_BTC_2024_2025_Q1_CONTINUOUS_REPLAY_2026_11_11.py`

### 3. EMA / SuperTrend / ATR market-regime selection

Three disjoint historical windows, 698,400 source minutes total; monthly decisions use only previously closed daily data. Selection between Grid and hold is exploratory, not a validated regime classifier.

- [Report](./SEVEN_HEAVEN_EMA_SUPERTREND_VOLATILITY_GRID_HOLD_REGIME_STUDY_2026_11_11_REPORT.md) — `SEVEN_HEAVEN_EMA_SUPERTREND_VOLATILITY_GRID_HOLD_REGIME_STUDY_2026_11_11_REPORT.md`
- [Full structured evidence](./SEVEN_HEAVEN_EMA_SUPERTREND_VOLATILITY_GRID_HOLD_REGIME_STUDY_2026_11_11_PROOFS.json) — `SEVEN_HEAVEN_EMA_SUPERTREND_VOLATILITY_GRID_HOLD_REGIME_STUDY_2026_11_11_PROOFS.json`
- [Daily equity](./SEVEN_HEAVEN_EMA_SUPERTREND_VOLATILITY_GRID_HOLD_REGIME_STUDY_2026_11_11_EQUITY_DAILY.csv) — `SEVEN_HEAVEN_EMA_SUPERTREND_VOLATILITY_GRID_HOLD_REGIME_STUDY_2026_11_11_EQUITY_DAILY.csv`
- [Monthly decision log](./SEVEN_HEAVEN_EMA_SUPERTREND_VOLATILITY_GRID_HOLD_REGIME_STUDY_2026_11_11_MONTHLY_DECISIONS.csv) — `SEVEN_HEAVEN_EMA_SUPERTREND_VOLATILITY_GRID_HOLD_REGIME_STUDY_2026_11_11_MONTHLY_DECISIONS.csv`
- [Reproduction source](./SEVEN_HEAVEN_EMA_SUPERTREND_VOLATILITY_GRID_HOLD_REGIME_STUDY_2026_11_11.py) — `SEVEN_HEAVEN_EMA_SUPERTREND_VOLATILITY_GRID_HOLD_REGIME_STUDY_2026_11_11.py`

### 4. Reversal timing: EMA / SuperTrend / volatility

Daily signals, theoretical next-day openings, costs, sell/rebuy delays, false trend recoveries. February 2025 shows delayed SuperTrend exit. Explicitly not a Spot Grid execution test.

- [Report](./SEVEN_HEAVEN_BTC_REVERSAL_LATENCY_EMA_SUPERTREND_VOLATILITY_2026_11_11_REPORT.md) — `SEVEN_HEAVEN_BTC_REVERSAL_LATENCY_EMA_SUPERTREND_VOLATILITY_2026_11_11_REPORT.md`
- [Full structured evidence](./SEVEN_HEAVEN_BTC_REVERSAL_LATENCY_EMA_SUPERTREND_VOLATILITY_2026_11_11_PROOFS.json) — `SEVEN_HEAVEN_BTC_REVERSAL_LATENCY_EMA_SUPERTREND_VOLATILITY_2026_11_11_PROOFS.json`
- [Daily equity](./SEVEN_HEAVEN_BTC_REVERSAL_LATENCY_EMA_SUPERTREND_VOLATILITY_2026_11_11_EQUITY_DAILY.csv) — `SEVEN_HEAVEN_BTC_REVERSAL_LATENCY_EMA_SUPERTREND_VOLATILITY_2026_11_11_EQUITY_DAILY.csv`
- [Drawdown events](./SEVEN_HEAVEN_BTC_REVERSAL_LATENCY_EMA_SUPERTREND_VOLATILITY_2026_11_11_DRAWDOWN_EVENTS.csv) — `SEVEN_HEAVEN_BTC_REVERSAL_LATENCY_EMA_SUPERTREND_VOLATILITY_2026_11_11_DRAWDOWN_EVENTS.csv`
- [Reproduction source](./SEVEN_HEAVEN_BTC_REVERSAL_LATENCY_EMA_SUPERTREND_VOLATILITY_2026_11_11.py) — `SEVEN_HEAVEN_BTC_REVERSAL_LATENCY_EMA_SUPERTREND_VOLATILITY_2026_11_11.py`

### 5. RSI / MACD / ADX dip-versus-reversal research

16 monthly source ZIPs; 698,400 native minute candles. RSI14, MACD12/26/9, ADX14/DI and EMA/SuperTrend comparisons; 31-day warm-up; trading windows begin 1 February. Retrospective labels PERSISTENT/RECOVERED/CENSORED use future observations only for evaluation, not for signals.

- [Report](./SEVEN_HEAVEN_BTC_RSI_MACD_ADX_MARKET_REVERSAL_RESEARCH_2026_11_11_REPORT.md) — `SEVEN_HEAVEN_BTC_RSI_MACD_ADX_MARKET_REVERSAL_RESEARCH_2026_11_11_REPORT.md`
- [Machine-readable summary](./SEVEN_HEAVEN_BTC_RSI_MACD_ADX_MARKET_REVERSAL_RESEARCH_2026_11_11_SUMMARY.json) — `SEVEN_HEAVEN_BTC_RSI_MACD_ADX_MARKET_REVERSAL_RESEARCH_2026_11_11_SUMMARY.json`
- [Full structured evidence](./SEVEN_HEAVEN_BTC_RSI_MACD_ADX_MARKET_REVERSAL_RESEARCH_2026_11_11_PROOFS.json) — `SEVEN_HEAVEN_BTC_RSI_MACD_ADX_MARKET_REVERSAL_RESEARCH_2026_11_11_PROOFS.json`
- [Daily equity](./SEVEN_HEAVEN_BTC_RSI_MACD_ADX_MARKET_REVERSAL_RESEARCH_2026_11_11_EQUITY_DAILY.csv) — `SEVEN_HEAVEN_BTC_RSI_MACD_ADX_MARKET_REVERSAL_RESEARCH_2026_11_11_EQUITY_DAILY.csv`
- [Drawdown events](./SEVEN_HEAVEN_BTC_RSI_MACD_ADX_MARKET_REVERSAL_RESEARCH_2026_11_11_DRAWDOWN_EVENTS.csv) — `SEVEN_HEAVEN_BTC_RSI_MACD_ADX_MARKET_REVERSAL_RESEARCH_2026_11_11_DRAWDOWN_EVENTS.csv`
- [Reproduction source](./SEVEN_HEAVEN_BTC_RSI_MACD_ADX_MARKET_REVERSAL_RESEARCH_2026_11_11.py) — `SEVEN_HEAVEN_BTC_RSI_MACD_ADX_MARKET_REVERSAL_RESEARCH_2026_11_11.py`

## Original Binance Spot BTCUSDT minute archives (public releases)

Release tag format: `crypto-spot-bulk-YYYY-MM-1m`; asset name: `BTCUSDT-1m-YYYY-MM.zip`.
Periods analyzed:

- 2024-01, 2024-02, 2024-03 (91 days)
- 2025-01, 2025-02, 2025-03 (90 days)
- 2026-01 to 2026-10 inclusive (304 days)

These 16 distinct month archives represent **698,400 native minute candles**. Recalculate the study-specific SHA-256 and continuity checks before relying on any outcome. The user provided these ZIPs in the research session; they are available as immutable release assets rather than tracked source files here.

## Critical interpretation rules for subsequent AI

- Pair and provider: **Binance Spot BTCUSDT**, not OKX BTCUSDC; do not transfer exact P&L or liquidity assumptions to the Administrator/Trader.
- Cost models are study-specific, usually 0.10% fee plus 0.05% slippage on each side, with a doubled-cost stress experiment. Read each study's proof file.
- TOUCH and CLOSE grid fills are OHLC-based hypothetical execution policies, not verified limit-order fills. Intra-minute event ordering, spread, queue position, execution latency, minimum size and taxes are not simulated.
- Value the **whole portfolio** (cash and residual BTC), not only gains from completed grid cycles.
- Historical windows are heterogeneous; Q1 2024 and 2025 are shorter than Jan–Oct 2026. January-only warm-up in trend studies must not be confused with the Grid study's January trades.
- The tested thresholds and policies were evaluated retrospectively and have not passed independent prospective out-of-sample validation. Don't claim predictive accuracy or superiority.
- Reproduce SHA, resulting daily curves and trade counts before extending the research. If a source is inaccessible, ask the user for that exact ZIP instead of implying the market data is missing.
- Source code, structured evidence, reports and human-readable index are committed. **Administrator, Operator, Trader, Market Core and Bridge R31 were not modified** by these research publications.

## Next work package

Use a strict walk-forward design with predeclared thresholds and a fresh time window. Compare missed rallies, late exits, cash drag, trading frequency, estimated costs, maximum daily drawdown and total portfolio liquidation value. Mark all results PAPER. Do not tune thresholds on the same test window then present it as independent proof.

## Confirmation des retournements et coût des liquidités — 11 novembre 2026

**Étude additionnelle de stabilité des signaux EMA, SuperTrend, MACD et consensus EMA/MACD/ADX**, sur 16 archives natives Binance Spot BTCUSDT 1m déjà vérifiées (698 400 minutes ; 2024 T1, 2025 T1, 2026 janvier–octobre). Réglages : 2 clôtures consécutives pour confirmation, contre signal immédiat ; contrôle asymétrique sortie 1 jour / entrée 3 jours. Décision en fin de journée UTC, transaction fictive à l’ouverture suivante. Capital 1 000 USDT par période, coût 0,10 % + glissement 0,05 % par côté.

- **Accès inter-IA complet :** [Rapport](./SEVEN_HEAVEN_BTC_REVERSAL_CONFIRMATION_FALSE_SIGNALS_CASH_COST_2026_11_11_REPORT.md) · [Script reproductible](./SEVEN_HEAVEN_BTC_REVERSAL_CONFIRMATION_FALSE_SIGNALS_CASH_COST_2026_11_11.py) · [Preuves JSON](./SEVEN_HEAVEN_BTC_REVERSAL_CONFIRMATION_FALSE_SIGNALS_CASH_COST_2026_11_11_PROOFS.json) · [Fenêtres cash CSV](./SEVEN_HEAVEN_BTC_REVERSAL_CONFIRMATION_FALSE_SIGNALS_CASH_COST_2026_11_11_CASH_WINDOWS.csv) · [Valeurs quotidiennes CSV](./SEVEN_HEAVEN_BTC_REVERSAL_CONFIRMATION_FALSE_SIGNALS_CASH_COST_2026_11_11_EQUITY_DAILY.csv) · [Contrôles](./SEVEN_HEAVEN_BTC_REVERSAL_CONFIRMATION_FALSE_SIGNALS_CASH_COST_2026_11_11_RUN_LOG.txt).
- En 2026, EMA immédiate : 24 opérations hypothétiques, 8 retours en cash de ≤7 jours, +3,24 % ; EMA confirmée 2 jours : 12 opérations, 1 retour court, +3,03 %.
- Consensus 2 jours : +8,85 % en 2026 contre +8,12 % sans confirmation, mais **162/273 jours en liquidités**, avec des reprises parfois manquées. SuperTrend reste variable selon l’année.
- **Définitions :** faux aller-retour = SELL suivi de BUY en ≤7 jours ; hausse manquée = variation brute du BTC pendant un intervalle en cash, étiquetée **a posteriori**, pas un profit réalisé. Les pourcentages des fenêtres ne constituent pas des rendements cumulables.
- **Vérification :** ZIP et continuité SHA dans les parseurs canoniques, 267 tests de causalité/unité sur le moteur original, JSON reconstruit indépendamment depuis les CSV publiés ; le script régénère des registres d’opérations fictives à partir des ZIP sources.
- **Réserve obligatoire :** étude déjà exposée aux périodes antérieures, sans validation hors échantillon, sans exécution observée sur Binance ou OKX, et **aucun ordre réel**. Ne pas intégrer comme déclencheur automatique dans Administrator, Trader, Operator ou Bridge.
