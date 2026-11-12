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

## Audit supplémentaire — confirmation 1/2/3 clôtures, retard et faux signaux (11 novembre 2026)

Étude PAPER **recalculée sur 698 400 bougies originales (16 ZIP contrôlés SHA-256)** avec **279 assertions de causalité** : étude de sensibilité aux confirmations 1, 2 et 3 clôtures pour EMA 10/30, SuperTrend ATR14×3 et consensus EMA/MACD/ADX. Portefeuilles BTC/liquidités uniquement, opérations fictives à l'ouverture suivante après clôture UTC.

- **[Rapport de comparaison](./SEVEN_HEAVEN_BTC_CONFIRMATION_DELAY_FALSE_EXITS_REBOUND_AUDIT_2026_11_11_REPORT.md)** ; **[code Python reproductible](./SEVEN_HEAVEN_BTC_CONFIRMATION_DELAY_FALSE_EXITS_REBOUND_AUDIT_2026_11_11.py)** ; **[preuves structurées JSON](./SEVEN_HEAVEN_BTC_CONFIRMATION_DELAY_FALSE_EXITS_REBOUND_AUDIT_2026_11_11_PROOFS.json)**.
- **[Événements de vente et issue BTC J+7](./SEVEN_HEAVEN_BTC_CONFIRMATION_DELAY_FALSE_EXITS_REBOUND_AUDIT_2026_11_11_SALE_EVENTS_7D.csv)** ; **[fenêtres en liquidités](./SEVEN_HEAVEN_BTC_CONFIRMATION_DELAY_FALSE_EXITS_REBOUND_AUDIT_2026_11_11_CASH_WINDOWS.csv)** ; **[valorisation quotidienne](./SEVEN_HEAVEN_BTC_CONFIRMATION_DELAY_FALSE_EXITS_REBOUND_AUDIT_2026_11_11_EQUITY_DAILY.csv)**.
- En 2026 : EMA C1/C2/C3 = **+3,24 / +3,03 / −2,45 %** ; consensus = **+8,12 / +8,85 / −0,05 %** ; SuperTrend = **+15,80 / +15,86 / +22,14 %**. Le troisième délai améliore cette dernière simulation mais **SuperTrend C3 perd −21,61 % en 2025**.
- Les « faux signaux » sont évalués seulement après coup : aller-retour SELL→BUY en ≤7j, et variation du cours BTC à J+7 après une vente fictive. Un mouvement J+7 n'est ni un P&L effectivement réalisé ni une preuve qu'une sortie était erronée.
- **Aucune fenêtre réellement hors échantillon :** 2024–2026 a déjà servi aux études précédentes. Les résultats peuvent orienter de nouvelles hypothèses, pas sélectionner ou déployer une stratégie gagnante. Un jeu de prix chronologiquement inédit est requis avant toute conclusion robuste.
- Reproduction : placer le script nouveau et sa dépendance `SEVEN_HEAVEN_BTC_REVERSAL_CONFIRMATION_FALSE_SIGNALS_CASH_COST_2026_11_11.py` avec les modules précédents et les 16 ZIP originaux ; exécuter `python SEVEN_HEAVEN_BTC_CONFIRMATION_DELAY_FALSE_EXITS_REBOUND_AUDIT_2026_11_11.py` après installation de numpy. Aucun accès API exchange, compte ou ordre.

## Protocole de test indépendant 2023 Q2 — paramètres figés avant les ZIP

**[Voir le protocole figé](./SEVEN_HEAVEN_BTC_CONFIRMATION_INDEPENDENT_2023_APR_JUN_FROZEN_PROTOCOL_2026_11_11.md)** — 3 archives BTCUSDT Binance Spot vérifiées par le registre GitHub Releases (avril 2023 warmup ; mai–juin 2023 test PAPER), SHA-256 enregistrés, 1/2/3 clôtures pour EMA, SuperTrend et consensus, plus Buy & Hold ; décisions sur clôtures antérieures seulement, frais et coûts doublés. **Statut historique au moment du figement :** les ZIP 2023 n'avaient pas encore été reçus ; voir le résultat du test, publié séparément ci-dessous. Aucune nouvelle optimisation des paramètres après lecture des prix. Ne pas utiliser ce protocole comme signal réel.

## Résultat post-figement : test 2023 Q2 réalisé et vérifié

Le [protocole préenregistré](./SEVEN_HEAVEN_BTC_CONFIRMATION_INDEPENDENT_2023_APR_JUN_FROZEN_PROTOCOL_2026_11_11.md) a été conservé **intact**. Les trois ZIP 2023 ont ensuite été reçus et leurs SHA-256 ont été contrôlés : 131 040 bougies 1m continues ; **avril = 30 jours d'initialisation**, **mai–juin = 61 jours PAPER**, capital 1 000 USDT, frais de 0,10 % + glissement de 0,05 % par côté. 128 contrôles causaux de préfixes, valorisations comptables indépendamment recoupées. Aucune modification de paramètres décidée après lecture des cours.

- **[Rapport 2023 indépendant](./SEVEN_HEAVEN_BTC_CONFIRMATION_INDEPENDENT_2023_APR_JUN_REPLAY_2026_11_11_REPORT.md)** · **[programme de reproduction](./SEVEN_HEAVEN_BTC_CONFIRMATION_INDEPENDENT_2023_APR_JUN_REPLAY_2026_11_11.py)** · **[preuves détaillées et ledger](./SEVEN_HEAVEN_BTC_CONFIRMATION_INDEPENDENT_2023_APR_JUN_REPLAY_2026_11_11_PROOFS.json)**.
- [Valorisations quotidiennes](./SEVEN_HEAVEN_BTC_CONFIRMATION_INDEPENDENT_2023_APR_JUN_REPLAY_2026_11_11_EQUITY_DAILY.csv) · [Fenêtres en liquidités](./SEVEN_HEAVEN_BTC_CONFIRMATION_INDEPENDENT_2023_APR_JUN_REPLAY_2026_11_11_CASH_WINDOWS.csv) · [Ventes fictives et évolution du BTC à J+7](./SEVEN_HEAVEN_BTC_CONFIRMATION_INDEPENDENT_2023_APR_JUN_REPLAY_2026_11_11_SALES_7D.csv).
- **Résultats nets en mai–juin 2023 :** EMA C1/C2/C3 **−5,31 / −4,92 / −7,58 %** ; SuperTrend **+7,32 / +1,29 / +1,66 %** ; consensus EMA/MACD/ADX **−4,70 / −7,07 / −5,47 %** ; Buy & Hold BTC **+3,93 %**.
- **Conclusion à transmettre :** sur cette fenêtre hors exploration, la confirmation à deux clôtures **n'améliore pas systématiquement** les stratégies. Elle est légèrement favorable à EMA, défavorable à SuperTrend et au consensus. Ne pas présenter C2 comme gain général prouvé. SuperTrend C1 n'entre qu'au 21 juin, avec 51/61 jours en cash ; cette faible exposition distingue sa performance du Buy & Hold investi dès le 1er mai.
- **Portée limitée :** 61 jours, un actif BTCUSDT Binance, exécutions et coûts simulés, pas d'ordres réels ; résultats 2023 hors échantillon par rapport à l'exploration antérieure, mais ne prouvent aucune performance future.

## Audit du 11 novembre 2026 — Confirmation asymétrique des entrées et sorties

La confirmation d'un **achat** et celle d'une **vente** sont deux paramètres distincts. Simulation PAPER rétrospective des **9 combinaisons entrée 1/2/3 × sortie 1/2/3** pour EMA10/30, SuperTrend ATR14×3 et consensus 2/3 EMA/MACD/ADX, sur **2023 mai–juin, 2024 février–mars, 2025 février–mars, 2026 février–octobre** (19 ZIP natifs SHA-256 vérifiés, 829 440 minutes). Aucun ordre, aucune exécution OKX.

- [**Rapport intégral**](./SEVEN_HEAVEN_BTC_ENTRY_EXIT_ASYMMETRIC_CONFIRMATION_AUDIT_2026_11_11_REPORT.md) · [**Protocole figé avant le calcul**](./SEVEN_HEAVEN_BTC_ENTRY_EXIT_ASYMMETRIC_CONFIRMATION_AUDIT_2026_11_11_PROTOCOL.md) · [**Code Python**](./SEVEN_HEAVEN_BTC_ENTRY_EXIT_ASYMMETRIC_CONFIRMATION_AUDIT_2026_11_11.py).
- [**Preuves JSON (19 SHA, 108 scénarios, 1 053 contrôles causaux, 12 684 contrôles comptables, 36 replays exacts)**](./SEVEN_HEAVEN_BTC_ENTRY_EXIT_ASYMMETRIC_CONFIRMATION_AUDIT_2026_11_11_PROOFS.json) · [**Tableau CSV des 108 scénarios**](./SEVEN_HEAVEN_BTC_ENTRY_EXIT_ASYMMETRIC_CONFIRMATION_AUDIT_2026_11_11_RESULTS.csv) · [**Capital quotidien CSV**](./SEVEN_HEAVEN_BTC_ENTRY_EXIT_ASYMMETRIC_CONFIRMATION_AUDIT_2026_11_11_EQUITY_DAILY.csv) · [**Retards d'opération appariés CSV**](./SEVEN_HEAVEN_BTC_ENTRY_EXIT_ASYMMETRIC_CONFIRMATION_AUDIT_2026_11_11_MATCHED_TRANSITIONS.csv).
- **Constat :** le coût de confirmation dépend du côté et du régime. En 2026, SuperTrend entrée C3/sortie C1 donne +24,44 % contre +15,80 % pour C1/C1, mais EMA entrée C3/sortie C1 tombe à −7,67 % contre +3,24 %. En 2025, entrer plus tard limite certaines pertes. En 2024, vendre plus tard peut capter une hausse.
- **Prudence :** les quatre fenêtres ont déjà été étudiées ; ce nouveau balayage est **exploratoire, pas indépendant**. Écarts de prix de transactions appariées ≠ rendement de portefeuille ; pas de transfert automatique au Trader ni d'optimisation revendiquée.

## Contrôle inter-périodes et test figé 2022 Q2 — 11 novembre 2026

**Point méthodologique :** les quatre fenêtres 2023, 2024, 2025 et 2026 ont déjà été explorées. La nouvelle étude est un **diagnostic de transportabilité et de surajustement**, non une validation indépendante. Elle compare, sans recalcul des bougies 1m, les preuves comptables et les performances de **12 politiques préexistantes** (EMA, SuperTrend, consensus × E1/S1, E3/S1, E1/S3, E2/S2). Un sélecteur leave-one-window-out fondé sur les trois autres fenêtres bat Buy & Hold dans **1/4 des évaluations**, mais ces fenêtres sont déjà connues et le score n'est pas un holdout inédit.

- [**Rapport de robustesse des confirmations asymétriques**](./SEVEN_HEAVEN_BTC_ASYMMETRIC_RULES_CROSS_PERIOD_ROBUSTNESS_2026_11_11_REPORT.md) · [**Programme Python**](./SEVEN_HEAVEN_BTC_ASYMMETRIC_RULES_CROSS_PERIOD_ROBUSTNESS_2026_11_11.py) · [**Preuves JSON et SHA de la source**](./SEVEN_HEAVEN_BTC_ASYMMETRIC_RULES_CROSS_PERIOD_ROBUSTNESS_2026_11_11_PROOFS.json).
- [**Tableau des 48 résultats**](./SEVEN_HEAVEN_BTC_ASYMMETRIC_RULES_CROSS_PERIOD_ROBUSTNESS_2026_11_11_CANDIDATE_PANEL.csv) · [**Scorecard par politique**](./SEVEN_HEAVEN_BTC_ASYMMETRIC_RULES_CROSS_PERIOD_ROBUSTNESS_2026_11_11_SCORECARD.csv) · [**Différences appariées**](./SEVEN_HEAVEN_BTC_ASYMMETRIC_RULES_CROSS_PERIOD_ROBUSTNESS_2026_11_11_PAIRED_DIFFS.csv) · [**Diagnostic de transfert entre fenêtres**](./SEVEN_HEAVEN_BTC_ASYMMETRIC_RULES_CROSS_PERIOD_ROBUSTNESS_2026_11_11_LOO_DIAGNOSTIC.csv).
- **[Protocole figé pour le nouveau jeu 2022 Q2](./SEVEN_HEAVEN_BTC_ASYMMETRIC_CONFIRMATION_2022_APR_JUN_FROZEN_HOLDOUT_PROTOCOL_2026_11_11.md)** — avril pour préchauffer les indicateurs ; mai–juin pour simuler 61 journées, **avant toute lecture de prix 2022**, 13 politiques fixes (3 familles × 4 variantes, plus Buy & Hold). SHA des archives d'avril/mai/juin inscrits avant réception.
- **[Programme de replay 2022 prêt](./SEVEN_HEAVEN_BTC_ASYMMETRIC_CONFIRMATION_2022_APR_JUN_FROZEN_HOLDOUT_REPLAY_2026_11_11.py)** — option `--selftest` validée avec une série synthétique (**144 vérifications causales et 1 586 écritures de capital indépendantes**) ; **replay historique 2022 désormais exécuté et documenté dans les liens ci-dessous**.

**Procédure pour les autres IA :** consulter le protocole figé et le scorecard, récupérer les ZIP *2022-04, 2022-05, 2022-06* dans les Releases du Coffre ; placer les ZIP originaux avec les scripts dépendants du laboratoire, exécuter le replay et publier ses sorties sans modifier les règles, puis documenter les éventuels échecs. Ne pas interpréter un résultat sur 61 jours comme performance prospective. Aucune activation de stratégie, aucune opération réelle, aucun changement des interfaces ou du Bridge.

## Résultat du holdout 2022 Q2 — replay historique achevé

**Date : 11 novembre 2026.** Les ZIP 2022-04, 2022-05 et 2022-06 fournis par l'utilisateur correspondent aux trois SHA-256 du protocole figé ; **131 040 minutes** continues vérifiées. Avril sert à initialiser les indicateurs ; la période simulée **1er mai–30 juin 2022** dure **61 journées UTC**.

- **[Rapport du test indépendant](./SEVEN_HEAVEN_BTC_ASYMMETRIC_CONFIRMATION_2022_APR_JUN_FROZEN_HOLDOUT_REPLAY_2026_11_11_REPORT.md)** · [**Résultats des 13 politiques (CSV)**](./SEVEN_HEAVEN_BTC_ASYMMETRIC_CONFIRMATION_2022_APR_JUN_FROZEN_HOLDOUT_REPLAY_2026_11_11_RESULTS.csv) · [**Portefeuilles quotidiens (CSV)**](./SEVEN_HEAVEN_BTC_ASYMMETRIC_CONFIRMATION_2022_APR_JUN_FROZEN_HOLDOUT_REPLAY_2026_11_11_EQUITY_DAILY.csv).
- **[Preuves SHA-256 / 144 tests de causalité / 1 586 écritures comptables et transactions fictives (JSON)](./SEVEN_HEAVEN_BTC_ASYMMETRIC_CONFIRMATION_2022_APR_JUN_FROZEN_HOLDOUT_REPLAY_2026_11_11_PROOFS.json)** · [**Code reproductible prépublié**](./SEVEN_HEAVEN_BTC_ASYMMETRIC_CONFIRMATION_2022_APR_JUN_FROZEN_HOLDOUT_REPLAY_2026_11_11.py) · [**Protocole gelé avant accès aux cours**](./SEVEN_HEAVEN_BTC_ASYMMETRIC_CONFIRMATION_2022_APR_JUN_FROZEN_HOLDOUT_PROTOCOL_2026_11_11.md).
- **Résultat :** les 12 politiques de filtrage (EMA, SuperTrend, consensus × E1/S1, E3/S1, E1/S3, E2/S2) restent en cash pendant 61/61 jours, **0 ordre simulé et 0,00 % de rendement**. Le Buy & Hold fictif achète au début de mai, puis finit à **−47,1644 % net**. Les périodes en cash ont préservé les 1 000 USDT hypothétiques, sans gain généré.
- **Conclusion méthodologique :** cet échantillon baissier supplémentaire n'est **pas discriminant** entre les quatre règles d'entrée/sortie ; il montre seulement que les états baissiers n'ont pas initié d'entrée. Ce n'est ni une validation prospective, ni une stratégie prouvée, ni une preuve d'exécution réelle.

**Statut documentaire : PUBLIE ET VERIFIE.** Les ZIP originaux restent dans GitHub Releases, pas dans le dépôt Git principal. Administrator, Operator, Trader et Bridge inchangés.

## Diagnostic événementiel : durabilité des signaux et coût du délai C3 (22 ZIP)

**Étude publiée le 11 novembre 2026 ; analytique et rétrospective uniquement.** Après les tests asymétriques E1/S1 et E3/S1, cette étude examine les changements d'état bruts des indicateurs dans les cinq fenêtres déjà exploitées, sans nouvelle optimisation ni nouvel ordre simulé.

- [Rapport — durabilité des signaux](./SEVEN_HEAVEN_BTC_SIGNAL_DURABILITY_DELAY_COST_AUDIT_2026_11_11_REPORT.md) · [Code reproductible Python](./SEVEN_HEAVEN_BTC_SIGNAL_DURABILITY_DELAY_COST_AUDIT_2026_11_11.py) · [Preuves SHA-256 et synthèse JSON](./SEVEN_HEAVEN_BTC_SIGNAL_DURABILITY_DELAY_COST_AUDIT_2026_11_11_PROOFS.json) · [Journal événementiel CSV](./SEVEN_HEAVEN_BTC_SIGNAL_DURABILITY_DELAY_COST_AUDIT_2026_11_11_TRANSITION_EVENTS.csv).
- **22 archives BTC/USDT minute, 960 480 bougies natives vérifiées**, cinq périodes 2022–2026, **126 contrôles de causalité**.
- Parmi 69 changements d'état bruts : EMA **13/34** épisodes de moins de 3 jours, consensus **5/25**, SuperTrend **0/10**. Une transition brute n'est pas forcément une transaction.
- Parmi les événements encore admissibles après trois jours, le déplacement de cours médian associé au délai C3 est **défavorable de +1,447 %** pour l'EMA (17/21 cas défavorables), **+1,307 %** pour le consensus (14/20 cas défavorables) ; SuperTrend **−2,189 %** (9 cas, 4 défavorables). Les variations locales ne sont **pas** un rendement de portefeuille.
- Parmi les 13 épisodes EMA de moins de 3 jours, **1** est suivi d'un mouvement BTC favorable au signal d'au moins 3 % à J+7, **4** défavorables et **8** neutres ; classification uniquement *ex post*.
- **Interprétation :** C3 filtre des bascules courtes mais retarde aussi des mouvements durables ; aucune supériorité générale démontrée, aucune modification du Trader ou Bridge.

## Trois bougies quotidiennes : rebond, creux, volumes et EMA — 11 novembre 2026

Étude **PAPER rétrospective**, distincte du filtrage EMA/SuperTrend précédent. Analyse des panneaux illustrant « observer trois jours » : une clôture en 15 minutes ne constitue pas une clôture quotidienne, et les probabilités illustratives 40/35/25 **ne sont pas calibrées**.

- **Sources :** 22 ZIP Binance Spot BTC/USDT 1m, SHA-256 contrôlés, 960 480 minutes / 667 journées UTC, cinq périodes **déjà explorées** (2022–2026) ; **ce n'est PAS un test indépendant**.
- **Protocole publié avant calcul :** [règles arrêtées](./SEVEN_HEAVEN_BTC_THREE_DAILY_CANDLES_REBOUND_STRUCTURE_VOLUME_AUDIT_2026_11_11_PROTOCOL.md) (commit `42c4be6`) : première clôture montante après baisse ≥5 % depuis le sommet des 30 dernières clôtures, comparaison C1 vs 3 clôtures quotidiennes ascendantes C3, creux ascendants, volumes Binance et EMA ; valorisation fictive au même jour J+10.
- **Bilan :** [rapport](./SEVEN_HEAVEN_BTC_THREE_DAILY_CANDLES_REBOUND_STRUCTURE_VOLUME_AUDIT_2026_11_11_REPORT.md) — 22 reprises candidates dont **20 évaluables**, **4** confirmées en C3, **16** refusées, dont **4** où l'entrée C1 aurait gagné et **12** où elle aurait perdu sur la même fenêtre. Les épisodes sont isolés, leurs retours ne se cumulent pas.
- **Exécution et preuve :** [script Python](./SEVEN_HEAVEN_BTC_THREE_DAILY_CANDLES_REBOUND_STRUCTURE_VOLUME_AUDIT_2026_11_11.py) · [manifestes et résultats JSON](./SEVEN_HEAVEN_BTC_THREE_DAILY_CANDLES_REBOUND_STRUCTURE_VOLUME_AUDIT_2026_11_11_PROOFS.json) · [45 épisodes haussiers/baissiers CSV](./SEVEN_HEAVEN_BTC_THREE_DAILY_CANDLES_REBOUND_STRUCTURE_VOLUME_AUDIT_2026_11_11_EVENTS.csv) · [667 journées OHLCV/EMA CSV](./SEVEN_HEAVEN_BTC_THREE_DAILY_CANDLES_REBOUND_STRUCTURE_VOLUME_AUDIT_2026_11_11_DAILY_FEATURES.csv). **224 contrôles causaux et comptables** et vérification des 22 ZIP.
- **Verdict :** ces petits effectifs ne permettent ni de prédire la reprise, ni de classer C3 comme stratégie gagnante. Les fréquences ex post ne sont pas des probabilités prévisionnelles. Aucune intégration dans Administrator / Trader / Bridge.

## Rebond BTC : échantillon élargi, creux ascendants, volumes et étude de source YouTube — 11 novembre 2026

**Recherche PAPER exploratoire** — 22 archives Binance BTC/USDT 1m SHA-256 contrôlées, 960 480 minutes sur 667 jours et 5 fenêtres disjointes déjà utilisées. Le protocole a été **figé avant le calcul** (commit `79b8946`). Le seuil de repli a été abaissé à **2,5 %**, avec 10 jours d'espacement, pour augmenter le nombre d'épisodes observés sans prétendre à un test prospectif.

- **[Audit critique de la chaîne « Les Rois du Bitcoin »](./SEVEN_HEAVEN_LES_ROIS_DU_BITCOIN_CHANNEL_SOURCE_AUDIT_2026_11_11.md)** — titres et descriptions documentés : supports, volumes, stratégie des « 4 Rois », liens d'affiliation ; **origine précise de la « règle des trois jours » non retrouvée**, ne pas lui attribuer cette règle.
- **[Protocole figé](./SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_EXPANDED_EVENTS_PROTOCOL_2026_11_11.md)** · **[rapport complet](./SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_EXPANDED_EVENTS_2026_11_11_REPORT.md)** · [code Python](./SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_EXPANDED_EVENTS_2026_11_11.py) · [preuves JSON](./SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_EXPANDED_EVENTS_2026_11_11_PROOFS.json) · [43 événements CSV](./SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_EXPANDED_EVENTS_2026_11_11_EVENTS.csv) · [résumé des groupes CSV](./SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_EXPANDED_EVENTS_2026_11_11_GROUPS.csv).
- **Résultats :** 43 rebonds candidats dont **40 évaluables**, 10 confirmés sur 3 clôtures (C3), 6 avec creux ascendants, 5 avec volume BTC supérieur à sa moyenne 20 jours, et seulement 2 qui remplissent aussi les filtres de tendance. Parmi les dix C3, les creux ascendants sont associés à **2/6** résultats positifs, le volume supérieur à **2/5**, les EMA haussières à **3/5**. **Effectifs insuffisants** pour démontrer l'utilité additionnelle de ces filtres.
- **Méthode :** issue comparée sur **un même horizon J+3→J+10** après frais/glissement ; rendements par épisode indépendants, **non composables en portefeuille continu** ; ancien critère 5 % / 21 jours reproduit comme contrôle. 342 assertions de cohérence et causalité. **Aucune prévision fiable, aucun changement Administrator/Trader/Bridge, aucun ordre réel.**

## Audit documentaire : stratégie des 4 Rois (source publique) — 11 novembre 2026

- [**Lire l'audit des 4 Rois : rôles ♣/♠/♦/♥, MACD, RSI, OBV, Fibonacci, preuves et limites**](./SEVEN_HEAVEN_FOUR_KINGS_STRATEGY_PUBLIC_RULES_CRITICAL_AUDIT_2026_11_11.md).
- **Source primaire consultée :** https://www.4-kings.fr/strategie — rôles publics des quatre « Rois » : ♣ double bottom hebdomadaire, ♠ pullback, ♦ ventes partielles (+110 % / +410 % cités), ♥ sortie finale et conservation résiduelle.
- **Distinction essentielle :** ces principes sont libres d'accès mais ne spécifient pas une stratégie calculable de bout en bout ; aucun backtest reproductible ni rendement audité n'a été établi à partir de la page consultée. Les affirmations de « risque nul » et les pourcentages 90 % / 8 sur 10 ne sont pas étayés sur cette page.
- **Consigne inter-IA :** ne pas assimiler les anciens replays EMA/MACD/volumes du Coffre à une validation des 4 Rois. Toute implémentation doit être appelée **variante publique Seven**, avec règles figées, preuves et témoins, jamais reproduction certifiée des auteurs. Aucun achat de contenu payant ni ordre réel.

## Extension BTC 2019–2021 : rebonds, creux ascendants, volume et EMA — 11 novembre 2026

Étude PAPER **nouvelle couverture chronologique** sur la source quotidienne BTC/USDT réconciliée du Coffre. [Protocole préenregistré](./SEVEN_HEAVEN_BTC_REBOUND_2019_2021_DAILY_OUT_OF_SAMPLE_PROTOCOL_2026_11_11.md), commit `2bd4c0d`, publié avant les résultats ; **2019–2020 descriptif, 2021 année de contrôle non ajustée**.

- [**Rapport de résultats 2019–2021**](./SEVEN_HEAVEN_BTC_REBOUND_2019_2021_DAILY_HOLDOUT_AUDIT_2026_11_11_REPORT.md) · [script Python autonome](./SEVEN_HEAVEN_BTC_REBOUND_2019_2021_DAILY_HOLDOUT_AUDIT_2026_11_11.py) · [preuves JSON](./SEVEN_HEAVEN_BTC_REBOUND_2019_2021_DAILY_HOLDOUT_AUDIT_2026_11_11_PROOFS.json) · [76 événements CSV](./SEVEN_HEAVEN_BTC_REBOUND_2019_2021_DAILY_HOLDOUT_AUDIT_2026_11_11_EVENTS.csv).
- **Source SHA vérifiée** : `public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/bitcoin-Max.json.gz` ; 3 075 journées 1d complètes 2018–2026, dont 1 096 journées auditées 2019–2021. Série réconciliée : **5 881 minutes historiques restent manquantes**, aucune prétention à l'intégrité minute.
- **Bilan : 76 candidats, 73 évaluables (3 censurés), 18 C3 confirmés dont 11 résultats nets positifs.** 2021 : 27 candidats, 26 évaluables, 9 C3, 5 positifs ; décalage médian de l'entrée retardée **+9,08 %**. Creux ascendants 3 positifs/3 événements, volume fort 3/5 : trop peu de cas pour établir une valeur prédictive. 173 contrôles de cohérence/causalité.
- **Usage inter-IA** : ne pas cumuler les rendements isolés comme un portefeuille ; ne pas présenter les fréquences comme des probabilités ; aucun signal automatique. Les paramètres 2021 ne doivent pas être optimisés a posteriori. Ne pas confondre Binance BTC/USDT et OKX BTC/USDC.

## Robustesse croisée des creux et volumes BTC, 2019–2026 (12 novembre 2026)

**Recherche documentaire exploratoire (PAPER), sans changement de stratégie active.** Deux jeux d'événements préexistants sont harmonisés sans modifier leurs seuils : 2019–2021 (**trois années complètes**, source quotidienne BTCUSDT Binance réconciliée) et 2022–2026 (**fenêtres incomplètes**, source 22 ZIP minute agrégés en 1d). La couverture 1d ne signifie pas que les 5 881 minutes historiques absentes ont été reconstituées.

- [**Protocole de consolidation figé avant calcul**](./SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_2019_2026_CROSS_COHORT_PROTOCOL_2026_11_12.md) ; [**rapport de recherche et limites**](./SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_2019_2026_CROSS_COHORT_AUDIT_2026_11_12_REPORT.md).
- [**Preuves JSON et comparaisons entre années**](./SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_2019_2026_CROSS_COHORT_AUDIT_2026_11_12_PROOFS.json) · [**119 événements harmonisés CSV**](./SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_2019_2026_CROSS_COHORT_AUDIT_2026_11_12_UNIFIED_EVENTS.csv) · [**script Python reproductible, standard library**](./SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_2019_2026_CROSS_COHORT_AUDIT_2026_11_12.py).
- **119 épisodes candidats**, **113 évaluables**, **28** validés par trois clôtures montantes, **16** résultats nets positifs dans les 28 cas ; rendements hypothétiques d'épisodes isolés J+3→J+10, **non composables en portefeuille**.
- Au sein de C3 : creux ascendants **10/17** positifs contre **6/11** sans ; volume élevé **7/15** contre **9/13** ; EMA haussières **12/19** contre **4/9**. Le rendement moyen des creux perd son avantage si on retire 2021 ; le volume ne montre pas d'avantage ; les EMA restent seulement une **hypothèse à revalider**, les effectifs par année étant faibles.
- **Ne pas adopter une politique du Trader sur la base de ces observations** : toutes les périodes sont déjà explorées, données d'années incomplètes mélangées avec des années complètes uniquement pour une synthèse explicative, petits groupes, aucun test prospectif ni validation sur OKX BTC/USDC.

## EMA 2018 non sélectionné et portefeuille continu 2018–2021 — 12 novembre 2026

**Statut : historique PAPER, source quotidienne validée par SHA-256, aucun ordre réel.** La recherche teste d'une part l'EMA sur **mai–décembre 2018 non utilisé lors de la sélection initiale** et d'autre part une **nouvelle politique d'exposition** BTC/cash EMA10>EMA30, clôture>EMA30, exécutée fictivement à l'ouverture quotidienne suivante.

- [Protocole figé avant calcul](./SEVEN_HEAVEN_BTC_EMA_FILTER_2018_HOLDOUT_CONTINUOUS_PORTFOLIO_2026_11_12_PROTOCOL.md) · [Rapport avec interprétation et limites](./SEVEN_HEAVEN_BTC_EMA_FILTER_2018_HOLDOUT_CONTINUOUS_PORTFOLIO_2026_11_12_REPORT.md) · [Programme Python autonome](./SEVEN_HEAVEN_BTC_EMA_FILTER_2018_HOLDOUT_CONTINUOUS_PORTFOLIO_2026_11_12.py).
- [Preuves structurées](./SEVEN_HEAVEN_BTC_EMA_FILTER_2018_HOLDOUT_CONTINUOUS_PORTFOLIO_2026_11_12_PROOFS.json) · [Capital quotidien sans reset, CSV](./SEVEN_HEAVEN_BTC_EMA_FILTER_2018_HOLDOUT_CONTINUOUS_PORTFOLIO_2026_11_12_EQUITY_DAILY.csv) · [Transactions fictives](./SEVEN_HEAVEN_BTC_EMA_FILTER_2018_HOLDOUT_CONTINUOUS_PORTFOLIO_2026_11_12_TRADES.csv) · [Épisodes de rebond 2018](./SEVEN_HEAVEN_BTC_EMA_FILTER_2018_HOLDOUT_CONTINUOUS_PORTFOLIO_2026_11_12_2018_REBOUND_EVENTS.csv).
- **Source** : BTCUSDT Binance Spot 1d réconcilié, `btc_native_daily_reconciliation/bitcoin-Max.json.gz` ; 3 075 clôtures de mai 2018 à septembre 2026, SHA-256 `812acb4a087cc43163760a6b397506bb7cb4bbcf8eca692fc686ef9f618b8bfd` ; archive 1m non exhaustive (5 881 minutes manquantes).
- **Contrôle 2018 (1 000 USDT)** : EMA −19,53 % ; Buy & Hold 100 % −49,99 % ; Buy & Hold 50 % −24,99 % ; liquidités 0 %. L'EMA reste en BTC environ 14,88 % des journées et demeure **perdante**. Parmi trois C3 retenus, **zéro** C3+EMA : **aucune validation événementielle de l'hypothèse C3+EMA**.
- **Portefeuille continu mai 2018–déc. 2021 sans remise à zéro** : EMA +877,59 % (70 opérations, baisse max −44,35 %) ; Buy & Hold 100 % +524,19 % (baisse max −63,34 %) ; Hold 50 % +262,10 %. Effet fort du chemin historique, pas une preuve de supériorité future ; risque USDT et fills non modélisés.
- **Reproductibilité** : calcul effectif effectué via décompression et vérification SHA en JavaScript ; le script Python miroir a passé la compilation et des tests synthétiques, mais son exécution intégrale sur l'archive gzip canonique dans ce conteneur reste **non vérifiée** (accès binaire bloqué). Aucune affirmation de double validation indépendante du calcul.
- **Priorité suivante** : nouvel actif ETH ou période réellement inédite, règles EMA inchangées, et contrôle des périodes en liquidités ; aucun déploiement Trader/Administrator/Operator/Bridge.

## Ethereum : transfert de la politique EMA 10/30 sur 2022 et 2024–2026 (12 novembre 2026)

**Statut : recherche ETH/USDT Spot Binance, rétrospective PAPER, sans ordre.** Les mêmes critères EMA10>EMA30 et clôture>EMA30 utilisés dans l'étude BTC ont été transférés sur ETH sans optimiser les paramètres ; capital 1 000 USDT, coûts 0,10 % frais + 0,05 % glissement de chaque côté.

- **[Protocole figé avant calcul](./SEVEN_HEAVEN_ETH_EMA_CROSS_ASSET_2022_2024_2026_FROZEN_PROTOCOL_2026_11_12.md)** — première publication `46bf35f`, puis erratum de comptage 2022 (334 jours, pas 333 ; dates inchangées).
- **[Rapport avec limites et risque](./SEVEN_HEAVEN_ETH_EMA_CROSS_ASSET_2022_2024_2026_REPLAY_2026_11_12_REPORT.md)** — EMA **−46,92 % en 2022**, **−9,01 % en 2024**, **+93,72 % en 2025**, **+8,51 % janvier–octobre 2026**. Portefeuille **2024–octobre 2026 continu : +91,27 %, baisse maximale −53,82 %**. Les périodes ont des capitalisations de départ distinctes, sauf la ligne continue.
- **[Preuves structurées et empreintes des cinq shards gzip](./SEVEN_HEAVEN_ETH_EMA_CROSS_ASSET_2022_2024_2026_REPLAY_2026_11_12_PROOFS.json)** — **40 200 bougies 1h vérifiées SHA-256**, 1 675 journées complètes UTC réparties entre 2022 et avril 2023–octobre 2026. ETH 2018–2021 reste fragmentaire : aucune continuité inventée.
- **[Script Python autonome reproductible](./SEVEN_HEAVEN_ETH_EMA_CROSS_ASSET_2022_2024_2026_REPLAY_2026_11_12.py)** · [**Courbes quotidiennes CSV**](./SEVEN_HEAVEN_ETH_EMA_CROSS_ASSET_2022_2024_2026_REPLAY_2026_11_12_EQUITY_DAILY.csv) · [**Transactions fictives CSV**](./SEVEN_HEAVEN_ETH_EMA_CROSS_ASSET_2022_2024_2026_REPLAY_2026_11_12_TRADES.csv).
- **Reproductibilité :** script compilé et testé sur série synthétique ; le calcul historique principal a été exécuté par le moteur de l'étude et archivé, mais la réexécution complète du script Python à partir des cinq gzip reste **à confirmer**. L'option `--check-proofs` sert à confronter ses résultats au JSON publié ; ne pas affirmer ce contrôle achevé sans le lancer.
- **Conclusion :** résultats inter-actifs hétérogènes ; **2024 est un contre-exemple EMA** (EMA négative, Buy & Hold ETH positif). Le portefeuille continu reste exposé à une baisse maximale supérieure à 50 %. Aucun signal à promouvoir dans le Trader.

**Suite :** comparer BTC et ETH sur **les mêmes dates** (BTC source quotidienne s'achève en septembre 2026), puis évaluer une combinaison BTC/ETH à pondérations fixées en amont, toujours PAPER.

## BTC + ETH aux mêmes dates : portefeuilles EMA 50/50 (12 novembre 2026)

- **[Rapport BTC+ETH sur 1 035 jours : EMA 50/50 contre Buy & Hold 50/50](./SEVEN_HEAVEN_BTC_ETH_EQUAL_DATE_EMA_DUAL_PORTFOLIO_REPLAY_2026_11_12_REPORT.md)** · [protocole figé](./SEVEN_HEAVEN_BTC_ETH_EQUAL_DATE_EMA_DUAL_PORTFOLIO_FROZEN_PROTOCOL_2026_11_12.md), commit `63164145e`, publié avant simulation.
- **[Code Python reproductible](./SEVEN_HEAVEN_BTC_ETH_EQUAL_DATE_EMA_DUAL_PORTFOLIO_REPLAY_2026_11_12.py)** · [preuves JSON / huit SHA-256](./SEVEN_HEAVEN_BTC_ETH_EQUAL_DATE_EMA_DUAL_PORTFOLIO_REPLAY_2026_11_12_PROOFS.json) · [courbes 1 035 jours CSV](./SEVEN_HEAVEN_BTC_ETH_EQUAL_DATE_EMA_DUAL_PORTFOLIO_REPLAY_2026_11_12_EQUITY_DAILY.csv) · [opérations fictives CSV](./SEVEN_HEAVEN_BTC_ETH_EQUAL_DATE_EMA_DUAL_PORTFOLIO_REPLAY_2026_11_12_TRADES.csv).
- **Sources communes** : 8 shards officiels Binance Spot BTCUSDT/ETHUSDT agrégés à partir de 62 880 heures vérifiées (2023 avril–décembre pour initialisation, 2024–octobre 2026 pour portefeuille). Aucun transfert de capital entre les deux poches, pas de rebalancement, pas de levier, transactions fictives à l'ouverture suivant la clôture du signal.
- **Résultats PAPER** : EMA 50/50 **+79,20 %**, drawdown **−41,92 %**, **124** opérations ; Buy & Hold 50/50 **+40,74 %**, drawdown **−58,50 %**. Sur 2024 isolé, le Buy & Hold est supérieur ; en janvier–octobre 2026, EMA 50/50 **+2,74 % devient −0,24 %** avec coûts doublés.
- **Lecture critique** : pas un nouvel échantillon inédit, opérations supposées exécutées au prix d'ouverture, coûts et risque USDT non exhaustifs. Script compilé/testé synthétiquement ; reproduction indépendante intégrale sur les huit shards encore à confirmer. Aucun ordre réel ni modification de l'Administrator, du Trader, de l'Operator ou du Bridge.

## Corrélation BTC/ETH, baisses conjointes et rôle des liquidités EMA — 12 novembre 2026

**Étude complémentaire PAPER, publiée dans le Coffre partagé**, fondée sur le CSV quotidien déjà publié du portefeuille BTC/ETH à dates identiques (1 035 valorisations, 1 034 variations journalières). Aucun nouveau paramétrage, aucune opération réelle.

- [**Rapport complet et limites**](./SEVEN_HEAVEN_BTC_ETH_CORRELATION_DOWNSIDE_AND_EMA_CASH_RESEARCH_2026_11_12_REPORT.md)
- [**Programme Python de reproduction, lecture seule**](./SEVEN_HEAVEN_BTC_ETH_CORRELATION_DOWNSIDE_AND_EMA_CASH_RESEARCH_2026_11_12.py)
- [**Preuves structurées et statistiques par année**](./SEVEN_HEAVEN_BTC_ETH_CORRELATION_DOWNSIDE_AND_EMA_CASH_RESEARCH_2026_11_12_PROOFS.json)

**Constats vérifiés :** corrélation quotidienne BTC/ETH **0,820** sur 1 034 variations ; **417 jours** de baisse simultanée ; ETH baisse pendant **51 des 52** pires journées BTC. La corrélation 2026 (janv.–oct.) atteint **0,912**. Le Buy & Hold BTC/ETH initial 50/50 non rééquilibré a une baisse maximale de **−58,50 %**, contre **−52,97 %** pour BTC seul ; la diversification n'annule donc pas le risque commun. Le portefeuille EMA 50/50 a passé **473 jours sur 1 035** avec les deux poches en liquidités et affiche une baisse maximale historique de **−41,92 %** ; ne pas attribuer cette protection à la seule diversification.

**Contrôle :** CSV canonique Git blob SHA-1 `c8ed2a206ea616ea87eeb83e31f7138d5b131588` vérifié, 1 035 lignes réconciliées, calculs comparés aux séries déjà publiées. Script Python autocontrôlé sur données synthétiques ; reproduction intégrale depuis le CSV sur Python externe encore à effectuer. Huit archives Binance brutes non rechargées pour cette extension. **Aucun nouveau signal de Trader, aucune modification Administrator / Operator / Bridge.**

## Contrôle indépendant de la source BTC : Binance BTC/USDT contre Bitstamp BTC/USD — 12 novembre 2026

**Étude PAPER supplémentaire effectivement calculée et publiée sur MASTER.** La règle EMA10>EMA30 et clôture>EMA30, les 275 jours d'initialisation, les dates 2024-01-01→2026-10-31, l'exécution fictive à l'ouverture suivante et les coûts de 0,10 % + glissement 0,05 % de chaque côté ont été **figés avant le replay Bitstamp**.

- [**Protocole prépublié (commit c81886c)**](./SEVEN_HEAVEN_BTC_EMA10_30_BINANCE_VS_BITSTAMP_SECOND_SOURCE_FIXED_PROTOCOL_2026_11_12.md).
- [**Rapport complet avec limites et comparaisons**](./SEVEN_HEAVEN_BTC_EMA10_30_BINANCE_VS_BITSTAMP_SECOND_SOURCE_REPORT_2026_11_12.md).
- [**Programme Python autonome de reproduction à partir de blobs SHA immuables**](./SEVEN_HEAVEN_BTC_EMA10_30_BINANCE_VS_BITSTAMP_SECOND_SOURCE_REPLAY_2026_11_12.py).
- [**Preuves JSON, contrôles de calendrier et écarts de signaux**](./SEVEN_HEAVEN_BTC_EMA10_30_BINANCE_VS_BITSTAMP_SECOND_SOURCE_EVIDENCE_2026_11_12.json).

**Faits numériques :** sur 1 035 journées, la stratégie BTC EMA donne **+67,14 %** sur Binance (BTC/USDT) contre **+65,78 %** sur Bitstamp (BTC/USD), tous deux avec **68 opérations fictives** et drawdowns **−34,21 % / −34,48 %**. Les états d'exposition concordent sur **1 034/1 035 jours** ; seule divergence **17 juillet 2026**, liée à des EMA Bitstamp presque égales la veille. Corrélation des rendements journaliers **0,999883** ; résultats EMA coûts doublés : Binance **+50,91 %**, Bitstamp **+49,69 %**. **Buy & Hold BTC fait mieux en rendement total** sur les deux places (**+82,93 % / +82,68 %**) mais subit des drawdowns plus sévères (environ −53 %).

**Discipline :** deux prix du même BTC sont très corrélés ; la période est déjà explorée, donc ce contrôle ne valide ni une performance future ni une généralisation à ETH. Les paires de cotation diffèrent USD/USDT ; les copies sont SHA vérifiées, mais le miroir Bitstamp tiers n'est pas signé par Bitstamp ; aucune exécution réelle. Le replay historique est effectivement calculé sur les CSV par le moteur de recherche ; **le script Python publié reste à réexécuter séparément**. **Aucun changement Administrator, Operator, Trader ou Bridge.**

**Suite utile :** récupérer une série ETH/USD quotidienne extérieure à Binance, vérifier ses dates et ses empreintes, puis rejouer *sans aucun nouvel ajustement* le même test sur ETH. Si la seconde source ETH est inaccessible, expliquer cet obstacle sans prétendre disposer d'une validation inter-exchange ETH.

## Ethereum : contrôle EMA sur deuxième fournisseur de données — 12 novembre 2026

**Travail réellement calculé et publié dans le Coffre partagé.** Recherche du transfert EMA10/30 sans retoucher paramètres, après l'étude BTC Binance/Bitstamp. La nouvelle source est **Yahoo Finance ETH-USD**, archivage GitHub tiers [SeedFlora](https://github.com/SeedFlora/idx-daily-data/blob/main/data/ETH-USD.csv), Git blob SHA-1 `f92d8c4fce1ea30f16b0195d0ea5f05b9e4fe185` ; le [README](https://github.com/SeedFlora/idx-daily-data/blob/main/README.md) explique ce processus. **Elle ne prouve pas une seconde plateforme de trading authentifiée.**

- [**Protocole prépublié, fenêtre de test figée avant le calcul**](./SEVEN_HEAVEN_ETH_USD_SECOND_PROVIDER_EMA_CONTIGUOUS_HOLDOUT_FROZEN_PROTOCOL_2026_11_12.md), commit `f8b1bfb`.
- [**Rapport complet et interprétation critique**](./SEVEN_HEAVEN_ETH_USD_SECOND_PROVIDER_EMA_CONTIGUOUS_RESEARCH_REPORT_2026_11_12.md).
- [**Code Python autonome et sources immuables SHA**](./SEVEN_HEAVEN_ETH_USD_SECOND_PROVIDER_EMA_CONTIGUOUS_REPLAY_2026_11_12.py).
- [**Preuves chiffrées, journal d'opérations fictives et lacunes**](./SEVEN_HEAVEN_ETH_USD_SECOND_PROVIDER_EMA_CONTIGUOUS_EVIDENCE_2026_11_12.json).
- [**CSV explicite des dates de désaccord, 0 ligne**](./SEVEN_HEAVEN_ETH_USD_SECOND_PROVIDER_EMA_CONTIGUOUS_DISAGREEMENT_DAYS_2026_11_12.csv).

**Qualité du fichier :** 462 journées documentées mais trois trous de **13, 3 et 24 jours** en 2026. Refus de fabriquer ou d'interpoler ces 40 journées. **Seul bloc acceptable : 399 jours consécutifs 2025-06-28→2026-07-31**, avec 90 jours de chauffe, puis **309 jours PAPER du 2025-09-26 au 2026-07-31**. Binance garde sa chauffe originale depuis 2023 ; l'écart d'initialisation doit rester visible.

**Résultats de la seconde source, 1 000 USD fictifs :** EMA10/30 **−21,77 %**, drawdown **−28,96 %**, 13 opérations et 83 jours exposés ; avec coûts doublés **−23,40 %**. Buy & Hold ETH **−51,73 %** et drawdown **−66,62 %**. Les **309/309 décisions ETH ou liquidités coïncident** avec le témoin Binance sur les mêmes dates ; corrélation des 308 variations quotidiennes **0,999665**. Cette concordance ne prouve aucune performance gagnante : l'EMA reste perdante, et la source Yahoo peut agréger des prix dont le fournisseur d'exécution n'est pas certifié.

**Preuves et limites :** SHA des deux CSV vérifiés, 309 contrôles de préfixes des EMA, conformité OHLC et calendrier, aucun ordre réel. Calcul effectué sur les deux CSV ; script Python publié pour reproduction, **mais réexécution intégrale indépendante en Python non encore vérifiée**. Étude par fournisseur sur période déjà étudiée, **PAS** validation temporelle indépendante ni analyse Ethereum 2024–2026 complète. Aucun changement Administrator, Operator, Trader ou Bridge.

**Prochaine direction utile :** une source ETH/USD native de plateforme, OHLCV quotidienne sans trous sur avril 2023–octobre 2026, à empreintes figées, puis refaire le replay sur les 1 035 jours sans modifier les EMA. À défaut, ne pas élargir la conclusion aux journées manquantes.

## ETH/USD Bitstamp natif — REPLAY 2024–2026 PUBLIÉ ET VALIDÉ (12 novembre 2026)

**La dette scientifique de collecte native ETH/USD est soldée pour le calendrier 2024–octobre 2026.** GitHub Actions [run #3 : SUCCESS](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43234052193) a téléchargé les bougies officielles **Bitstamp Spot ETH/USD** sur **1 310 journées UTC continues** (2023-04-01→2026-10-31), dont 275 jours de chauffe et **1 035 jours PAPER** (2024-01-01→2026-10-31). Les CSV, JSON et le rapport généré sont bien présents sur `main`. La première exécution avait réussi les calculs mais échoué au `git diff --check` à cause des fins de ligne CSV **CRLF** ; le générateur a été corrigé en **LF** seulement, sans retoucher les EMA ni les coûts.

- [**Audit scientifique comparatif Bitstamp/Binance, conclusions et limites**](./SEVEN_HEAVEN_ETH_BITSTAMP_NATIVE_VS_BINANCE_EMA10_30_COMPARATIVE_AUDIT_2026_11_12.md).
- [**CSV natif Bitstamp 1 310 journées**](./native_bitstamp_eth_2024_2026_evidence/bitstamp_ethusd_daily_2023_2026.csv), SHA-256 `881227ba20481322b6829c19d97b799d11a73ae155be8868cf5ec943039c6b49`.
- [**Preuves JSON officielles de notre replay et collectes**](./native_bitstamp_eth_2024_2026_evidence/eth_ema_bitstamp_native_proofs.json).
- [**Rapport machine généré**](./native_bitstamp_eth_2024_2026_evidence/SEVEN_HEAVEN_ETH_BITSTAMP_NATIVE_2024_2026_REPLAY_REPORT.md).
- [**CSV des désaccords, un seul jour : 2025-06-19**](./native_bitstamp_eth_2024_2026_evidence/eth_ema_binance_bitstamp_disagreements.csv).
- [**Protocole figé avant la collecte**](./SEVEN_HEAVEN_ETH_BITSTAMP_NATIVE_DAILY_EMA10_30_2024_2026_FROZEN_PROTOCOL_2026_11_12.md), commit `75a7c15` ; [**programme Python de reproduction**](./SEVEN_HEAVEN_ETH_BITSTAMP_NATIVE_REPLAY_2026_11_12.py), [**tests de sécurité**](./test_seven_heaven_eth_bitstamp_native_replay.py) et [**workflow Github Actions**](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/workflows/seven-heaven-eth-bitstamp-native-research.yml).

**Bilan historique PAPER 2024–oct. 2026 (mêmes paramètres EMA10/30) :**
Bitstamp **EMA +89,55 %**, perte maximale **−54,10 %**, **54 opérations** et **442 journées exposées**. Binance **EMA +91,27 %**, perte maximale **−53,82 %**, **56 opérations** et **443 journées exposées**. Concordance des états ETH/cash **1 034/1 035 jours (99,90 %)** ; corrélation des 1 034 rendements quotidiens **0,999923**. Coûts ×2 : **+74,79 % / +75,84 %**. Buy & Hold Bitstamp **−1,62 %**, Binance **−1,44 %**.

**Limites à préserver :** mêmes années déjà étudiées ; aucune validation prospective hors-échantillon, risque de baisse importante toujours présent, USD ≠ USDT, frais et exécution fictifs. Distinguer clairement les performances des données natives Bitstamp du contrôle Yahoo 309 jours (fenêtre différente). **Aucun ordre réel ni modification Administrator, Trader, Operator ou Bridge.** Prochain travail : analyses de risque du portefeuille BTC/ETH sur les mêmes dates, puis validation prospective ou période réellement inédite.


## BTC/ETH 50/50 — Reproduction complète sur Bitstamp NATIF et Binance (12 novembre 2026)

**CHANTIER SCIENTIFIQUE TERMINÉ ET PUBLIÉ SUR `main`** : deux poches indépendantes, EMA 10/30 **inchangées**, prix officiels **Bitstamp Spot BTC/USD + ETH/USD** contre archives **Binance Spot BTC/USDT + ETH/USDT** sur les **mêmes 1 035 journées** du 2024-01-01 au 2026-10-31, après **275 jours de chauffe**. Aucune optimisation, aucun ordre et aucun accès à un compte.

- [**Rapport scientifique détaillé : robustesse, baisses communes, volatilité, périodes cash et limites**](./SEVEN_HEAVEN_BTC_ETH_NATIVE_BITSTAMP_50_50_ROBUSTNESS_AND_DOWNSIDE_AUDIT_2026_11_12.md).
- [**Protocole figé avant l'extraction BTC native**](./SEVEN_HEAVEN_BTC_ETH_50_50_NATIVE_BITSTAMP_VS_BINANCE_FROZEN_PROTOCOL_2026_11_12.md) — commit `a62234ee956601fc9567813a8009928d0a2ade96`.
- [**Programme Python du replay natif BTC/ETH**](./SEVEN_HEAVEN_BTC_ETH_50_50_NATIVE_BITSTAMP_VS_BINANCE_REPLAY_2026_11_12.py) ; [**cinq tests synthétiques**](./test_seven_heaven_btc_eth_native_bitstamp_dual_replay.py).
- [**Preuves JSON après exécution**](./native_bitstamp_btc_eth_2024_2026_evidence/bitstamp_btc_eth_50_50_proofs.json) (Git blob `ab15dc23da2e5b8adc5e72ea0eef893b79b79aeb`) ; [**courbes journalières Bitstamp 1 035 jours**](./native_bitstamp_btc_eth_2024_2026_evidence/bitstamp_btc_eth_50_50_daily_equity_2024_2026.csv).
- [**BTC/USD natif 1 310 jours**](./native_bitstamp_btc_eth_2024_2026_evidence/bitstamp_btcusd_daily_2023_2026.csv), SHA-256 `89a85a2f419244b3140f0518fb731f37c06abc3b73734433eb3fbf4642907dbb` ; [**ETH/USD natif antérieur 1 310 jours**](./native_bitstamp_eth_2024_2026_evidence/bitstamp_ethusd_daily_2023_2026.csv), SHA-256 `881227ba20481322b6829c19d97b799d11a73ae155be8868cf5ec943039c6b49`.
- [**Workflow GitHub Actions #2 : succès des cinq tests, de l'API native BTC et de la publication**](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43237341563). Première tentative échouée uniquement par attente trop stricte dans un test de pagination synthétique (1000/1000 au lieu de 1000/310) ; corrigée **sans changer cours, paramètres ni simulations**.

**Comparaison PAPER 2024–octobre 2026 :**

| Mesure | Bitstamp BTC/ETH USD | Binance BTC/ETH USDT |
|---|---:|---:|
| EMA 50/50 rendement net | **+77,67 %** | **+79,20 %** |
| EMA 50/50 baisse maximale | **−42,15 %** | **−41,92 %** |
| EMA 50/50 coûts doublés | +62,24 % | +63,38 % |
| Buy & Hold 50/50 rendement net | +40,53 % | +40,74 % |
| Buy & Hold 50/50 baisse maximale | −58,58 % | −58,50 % |
| Nombre d'opérations EMA | 122 | 124 |

**Robustesse des signaux :** **1 033/1 035 journées** avec le même couple de positions BTC/ETH ; divergences le **2025-06-19 (ETH)** et le **2026-07-17 (BTC)**. BTC et ETH chutent ensemble **415 journées sur 1 034 variations**, corrélation quotidienne **0,820549**. Parmi ces 415 baisses communes, **201 journées avec les deux poches cash**, **141 avec les deux positions exposées** et 73 avec une seule exposée. Les 1 035 journées Bitstamp comprennent **474 journées en cash sur les deux poches**.

**Interprétation obligatoire :** la moindre volatilité / baisse du portefeuille EMA provient largement de ses passages en cash, **pas seulement du mélange BTC/ETH**. Le 50/50 Buy & Hold est plus volatil que BTC Buy & Hold seul sur ces dates. La baisse maximale EMA 50/50 est plus faible que celle d'ETH EMA seul, mais plus forte que celle de BTC EMA seul. **Même période historique déjà étudiée ≠ validation chronologique inédite ; aucun rendement futur démontré**. USD ≠ USDT, cours d'ouverture et coûts d'exécution fictifs, risques de garde non modélisés.

**Direction suivante :** définir un protocole de validation *walk-forward* sur dates nouvelles, sans optimiser les EMA à partir des données 2024–2026 ; explorer la sensibilité aux coûts réalistes avant d'envisager une utilisation. Aucune modification Administrator, Trader, Operator ou Bridge.


## Étude des coûts — BTC/ETH EMA10/30 50/50, robustesse fictive vérifiée (12 novembre 2026)

**Étude de stress coûts FINIE, vérifiée, publiée dans le Coffre partagé.** Les EMA10/30, leurs décisions à l'ouverture du lendemain et les **122 opérations fictives** restent **rigoureusement inchangées**. Deux archives natives Bitstamp Spot BTC/USD et ETH/USD (1 310 jours chacune), simulation 2024-01-01→2026-10-31 (1 035 jours) et deux poches de 500 USD sans rebalancement. Le [protocole a été committé AVANT les nouvelles grilles](./SEVEN_HEAVEN_BTC_ETH_50_50_EMA_TRANSACTION_COST_STRESS_FROZEN_PROTOCOL_2026_11_12.md), commit `a1fe8f5880be265f2bbb66d947f1f221ad31e69f`.

- [**Rapport scientifique complet, 8 facteurs de coût, risques, limites**](./SEVEN_HEAVEN_BTC_ETH_50_50_EMA_TRANSACTION_COST_STRESS_RESEARCH_REPORT_2026_11_12.md).
- [**Preuves JSON du premier calcul sur archives SHA-pinnées**](./SEVEN_HEAVEN_BTC_ETH_50_50_EMA_TRANSACTION_COST_STRESS_EVIDENCE_2026_11_12.json).
- [**Programme Python indépendant, relisant les CSV et rapprochant chaque résultat**](./SEVEN_HEAVEN_BTC_ETH_50_50_EMA_TRANSACTION_COST_STRESS_REPLAY_2026_11_12.py).
- [**Preuves JSON de reproduction Python confirmée**](./transaction_cost_stress_evidence/SEVEN_HEAVEN_BTC_ETH_50_50_COST_STRESS_PYTHON_VERIFICATION.json) ; [**grille CSV de tous les facteurs**](./transaction_cost_stress_evidence/SEVEN_HEAVEN_BTC_ETH_50_50_COST_STRESS_GRID.csv).
- [**GitHub Actions : SUCCESS, recalcul Python des 8 scénarios, contrôle SHA et signaux invariants**](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43245735625).

**Sensibilité au coût fictif par côté** (frais + glissement) :

| Coût / côté | EMA BTC/ETH 50/50 | Buy & Hold 50/50 |
|---|---:|---:|
| 0,15 % (référence) | **+77,67 %** | +40,53 % |
| 0,30 % | +62,24 % | +40,11 % |
| 0,45 % | +48,16 % | +39,69 % |
| 0,60 % | +35,31 % | +39,27 % |
| 0,90 % | +12,87 % | +38,43 % |
| 1,20 % | **−5,83 %** | +37,60 % |

**Seuils historiques purement descriptifs** : l'avantage EMA face au Hold disparaît autour de **0,550629 % de coût fictif par côté**, EMA tombe à rendement final nul vers **1,100460 % de coût fictif par côté**. Ce ne sont **pas** des tarifs applicables d'exchange et aucune reconstitution réelle du carnet à la date des ouvertures n'a été faite. Le modèle comporte 122 opérations EMA contre 2 achats de poche Buy & Hold. Le drawdown historique EMA avec frais de base reste **−42,15 %**, pouvant dépasser −55 % au facteur 10.

**Méthode et limite** : seule une **sensibilité conditionnelle** des résultats historiques a été validée par reproduction Python ; **aucune performance future démontrée**, aucun spread historique effectivement observé, pas de mesure des coûts d'un compte OKX/Bitstamp, pas de trading réel. La fenêtre 2024–2026 est déjà connue. Les données immuables et les scripts ont été vérifiés ; ne pas chercher de meilleurs EMA après lecture de ces résultats.

**Prochaine étude utile** : préenregistrer un échantillon **postérieur au 12 novembre 2026**, conserver EMA10/30 et les deux poches, documenter en parallèle les spread/depth à l'instant du trade simulé ; ne pas publier un chiffre de résultat jusqu'à avoir de vraies bougies nouvelles et un horizon assez long. Aucun changement Administrator / Trader / Operator / Bridge.

