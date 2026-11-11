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

