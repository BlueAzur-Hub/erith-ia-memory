# Seven Heaven — Bibliothèque documentaire des stratégies crypto

> **Passation pour les autres IA (études Bitcoin 2024–2026) :** [ouvrir le dossier d'exploitation avec code, preuves JSON, séries CSV et sources](./SEVEN_HEAVEN_CRYPTO_STRATEGY_RESEARCH_HANDOFF_2026_11_11.md). Les recherches sont PAPER et ne remplacent aucune validation sur OKX.


**Édition :** 7 novembre 2026 · **Public :** Christophe, Yoann et assistants documentaires · **Statut :** LECTURE SEULE / RECHERCHE.

Ce répertoire du Coffre Agent-Crypto partage **sept fiches pédagogiques approfondies**, un rapport historique de référence et une comparaison par **états du marché**. Aucune stratégie n'est importable ni activée ; aucun ordre, clé API ou bot exécutable.


## Mise à jour du 11 novembre 2026 — catalogue de recherche global

L'étude **ne se limite pas à Donchian 55** : le Coffre contient un catalogue pédagogique de **19 profils** (10 protocoles simulés en 2022–2025, neuf méthodes/indicateurs documentés sans résultats inventés), ainsi qu'un second catalogue de **12 variantes quantitatives + 2 témoins**, avec un protocole distinct (2019–2026).

- **[Matrice commune — toutes les stratégies, leurs statuts, les données du Coffre et les sources externes vérifiées](./SEVEN_HEAVEN_ALL_STRATEGIES_SOURCE_COVERAGE_AND_RESEARCH_MATRIX_2026_11_11.md)**. Ce document est le **point d'entrée actuel** pour les autres IA ; il explique ce qui a été testé, ce qui reste documentaire et la manière d'étudier la suite sans mélanger les protocoles.
- **[Étude achevée : les 12 règles quantitatives sur OKX BTC/USDC et Binance BTC/USDT, mêmes journées](./SEVEN_HEAVEN_TWELVE_STRATEGIES_INDEPENDENT_OKX_BINANCE_STRESS_2026_11_11.md)** — résultats des douze variantes à 25 %, 183 jours appariés, 224 jours OKX continus, frais doublés et échecs conservés. [Preuves JSON](./SEVEN_HEAVEN_TWELVE_STRATEGIES_INDEPENDENT_OKX_BINANCE_STRESS_2026_11_11.json). Validation rétrospective, non prospective.
- Sources prioritaires : archive Binance BTC/USDT du Coffre (multicycle), série OKX BTC/USDC validée (447 jours), archives officielles Binance Data Vision et Kraken pour les prochains recoupements. Les anciens ZIP OKX minute 2023–2024 avec `confirm=0` restent en quarantaine.
- **Aucun signal ni ordre réel.** Les stratégies personnelles Swing / Buy & Hold ne sont pas modifiées par les simulations.

## Étude transversale : DCA, EMA rapides, MACD, Bollinger et SuperTrend

- [Audit de résilience des **10 stratégies pédagogiques** sur 2022, 2023, 2024 et 2025](./SEVEN_HEAVEN_BTC_TEN_STRATEGY_2022_2025_RESILIENCE_AUDIT_2026_11_11.md) : performances, drawdowns, nombre d'opérations, écarts face à Buy & Hold, y compris les méthodes perdantes.
- [Résultats structurés](./SEVEN_HEAVEN_BTC_TEN_STRATEGY_2022_2025_RESILIENCE_AUDIT_2026_11_11.json) et [script de reproduction](./SEVEN_HEAVEN_BTC_TEN_STRATEGY_2022_2025_RESILIENCE_AUDIT_2026_11_11.py).
- **Limite :** réanalyse de simulations déjà archivées avec capital réinitialisé chaque année. Ce n'est **pas** un nouveau backtest continu ni une validation prospective ; ne pas fusionner avec les douze variantes du second catalogue.

## Backtest continu 2019–2026 — dix méthodes pédagogiques

- **[Backtest continu des dix méthodes du guide P01–P10 (2019–septembre 2026)](./SEVEN_HEAVEN_TEN_STRATEGIES_CONTINUOUS_BTC_BINANCE_OKX_BACKTEST_2026_11_11.md)** : capital fictif non réinitialisé, allocation 100 % et 25 %, frais / glissement simulés, drawdowns, durées sous sommet, DCA à budget fixe, résultats défavorables conservés.
- [**Données des simulations et journal des positions**](./SEVEN_HEAVEN_TEN_STRATEGIES_CONTINUOUS_BTC_BINANCE_OKX_BACKTEST_2026_11_11.json) · [**courbes quotidiennes CSV**](./SEVEN_HEAVEN_TEN_STRATEGIES_CONTINUOUS_BTC_BINANCE_OKX_BACKTEST_2026_11_11.csv) · [**script de reproduction**](./SEVEN_HEAVEN_TEN_STRATEGIES_CONTINUOUS_BTC_BINANCE_OKX_BACKTEST_2026_11_11.py).
- **Contrôle indépendant** : 183 jours appariés Binance BTC/USDT – OKX BTC/USDC, plus OKX continu sur 224 jours. Sur cette fenêtre OKX, DCA sur 12 mois n'a pas encore investi toutes ses mensualités : **ne pas le comparer à un DCA entièrement déployé**.
- **Différence méthodologique** : les règles pédagogiques du 7 novembre sont réimplémentées explicitement dans le nouveau moteur (notamment convention illustrative SuperTrend), sans prétendre reproduire à l'identique l'ancien simulateur annuel. La comparaison doit être lue comme **une nouvelle expérience exploratoire**, pas une performance prouvée.

## Nouvelle validation D13/D18 — Rééquilibrage BTC/ETH et source VWAP

- [**Audit et backtest du rééquilibrage 50 % BTC / 25 % ETH / 25 % liquidités**](./SEVEN_HEAVEN_BTC_ETH_USDT_REBALANCING_VWAP_SOURCE_AUDIT_2026_11_11.md) : comparaison passif, mensuel, trimestriel et témoins, de janvier 2024 à octobre 2026, sur **six archives binaires horaires Binance Spot USDT vérifiées SHA-256**.
- [**JSON : empreintes, séries, frais et rendements, défauts de source VWAP**](./SEVEN_HEAVEN_BTC_ETH_USDT_REBALANCING_VWAP_SOURCE_AUDIT_2026_11_11.json) · [**moteur Python**](./SEVEN_HEAVEN_BTC_ETH_USDT_REBALANCING_VWAP_SOURCE_AUDIT_2026_11_11.py) — preuves structurées accessibles aux IA.
- Contrôle D18 : volumes de base et de cotation présents dans les deux séries, 24 840 heures par actif ; leur ratio permet une **référence VWAP de session**, **pas encore une stratégie d'entrée/sortie évaluée**.
- **Limites :** USDT supposé stable, capital fictif, aucune prévision, rééquilibrages mensuels ou trimestriels testés sur Binance uniquement, pondérations choisies comme expérience et non optimisées.

## D19 — SAR parabolique : étude historique vérifiée

- [**SAR classique, lent et rapide : backtest Bitcoin 2019–2026 et contrôle indépendant OKX**](./SEVEN_HEAVEN_PARABOLIC_SAR_BTC_CONTINUOUS_BINANCE_OKX_RESEARCH_2026_11_11.md). Trois sensibilités annoncées avant le test, portefeuilles à 25 % / 100 % de liquidités, frais simulés, drawdowns, achats, stress coûts doublés.
- [**Preuves JSON : flips, transactions, comparatif avec Buy & Hold**](./SEVEN_HEAVEN_PARABOLIC_SAR_BTC_CONTINUOUS_BINANCE_OKX_RESEARCH_2026_11_11.json) · [**script de calcul reproductible**](./SEVEN_HEAVEN_PARABOLIC_SAR_BTC_CONTINUOUS_BINANCE_OKX_RESEARCH_2026_11_11.py).
- Le SAR quotidien est évalué **après clôture** et une transaction hypothétique ne survient qu'à **l'ouverture suivante**. La convention de démarrage et de retournement est documentée et ne prouve pas l'égalité avec l'indicateur SAR 1h de l'Administrator. Le SAR lent s'est montré performant sur certaines fenêtres passées, **sans preuve prospective**.

## D18 — VWAP : backtest BTC et ETH, signal vs indicateur

- [**Étude VWAP BTC/ETH 2024–octobre 2026 — quatre variantes et trois témoins**](./SEVEN_HEAVEN_BTC_ETH_VWAP_STRATEGIES_CONTINUOUS_BACKTEST_2026_11_11.md) : à partir des archives horaires Binance vérifiées, comparaison VWAP fenêtre 300h, séance UTC, volume quote/base 24h et variante filtrée EMA.
- [**Preuves structurées : pertes, transactions, drawdowns et coûts doublés**](./SEVEN_HEAVEN_BTC_ETH_VWAP_STRATEGIES_CONTINUOUS_BACKTEST_2026_11_11.json) · [**moteur Python reproductible**](./SEVEN_HEAVEN_BTC_ETH_VWAP_STRATEGIES_CONTINUOUS_BACKTEST_2026_11_11.py).
- **Résultat négatif conservé :** les croisements VWAP non filtrés déclenchent de nombreux faux signaux et frais ; l'étude ne démontre pas qu'une stratégie VWAP soit rentable. Le VWAP du graphique Administrator est un **cumul HLC3×volume sur les bougies chargées**, **non** un reset quotidien. Le test de fenêtre 300h est un proxy et **non** l'équivalent de l'interface OKX 15m.
- Les profils existants **Tendance, Volatilité, Niveaux, Tous, Aucun** ne changent pas. Aucune mutation des indicateurs ni du Trader.

## D11 — Spot Grid : risque de sortie de fourchette et faisabilité des exécutions

- [**Rapport Spot Grid — 54 configurations, BTC/ETH, 2024–octobre 2026**](./SEVEN_HEAVEN_SPOT_GRID_BTC_ETH_HOURLY_FEASIBILITY_2026_11_11.md) : durée dans une grille fixe, temps sous les bornes, palier touché vs ordre exécuté, calcul conditionnel d'un seul lot.
- [**Preuves JSON, empreintes et 54 cas**](./SEVEN_HEAVEN_SPOT_GRID_BTC_ETH_HOURLY_FEASIBILITY_2026_11_11.json) · [**programme Python reproductible**](./SEVEN_HEAVEN_SPOT_GRID_BTC_ETH_HOURLY_FEASIBILITY_2026_11_11.py).
- Les six archives horaires Binance Spot ont été vérifiées. **Aucun bénéfice de bot n'est affirmé**, car les OHLC horaires ne révèlent ni l'ordre des traversées des niveaux ni les remplissages réels. Le résultat scientifique est un **audit de faisabilité**, pas un backtest de rentabilité.
- Les cinq profils de l'Administrator et les positions Swing / Buy & Hold personnelles restent inchangés.

## D11 — Exploitation des ZIP Binance natifs à la minute

**Étude réalisée le 11 novembre 2026 — quatre mois BTC/USDT en données natives 1 minute, sources déjà conservées en GitHub Releases :** 2024-01, 2025-01, 2026-01 et 2026-10. Les quatre SHA-256 natifs et la réconciliation 1m→1h ont été vérifiés sans reproduire les gros ZIP dans le dépôt.

- [**Rapport Spot Grid minute — deux hypothèses de remplissage et valeur totale du capital**](./SEVEN_HEAVEN_SPOT_GRID_NATIVE_MINUTE_BTC_INVENTORY_REPLAY_2026_11_11.md) : comparaison à Buy & Hold 50 % / 100 %, frais et glissement fictifs, positions ouvertes et liquidités disponibles.
- [**Preuves JSON : 178 560 minutes contrôlées, P&L réalisé / latent, 4 × 2 trajectoires de simulation**](./SEVEN_HEAVEN_SPOT_GRID_NATIVE_MINUTE_BTC_INVENTORY_REPLAY_2026_11_11.json) · [**script Python reproductible**](./SEVEN_HEAVEN_SPOT_GRID_NATIVE_MINUTE_BTC_INVENTORY_REPLAY_2026_11_11.py).
- **Distinction fondamentale :** la présence d'un prix limite dans les OHLC d'une minute **n'est pas un ordre réellement rempli**. Les deux scénarios *TOUCH* et *CLOSE* sont des hypothèses d'exécution, pas des performances certifiées ni une fourchette probabiliste.
- **Cas janvier 2026 :** malgré environ +42,28 USDT de lots clôturés dans le mode TOUCH, l'inventaire BTC restant présentait environ −98,12 USDT de perte latente ; le portefeuille finit à −5,58 %. Le fait de réaliser des gains sur des cycles ne garantit pas que l'ensemble du bot soit bénéficiaire.
- **Ne pas fusionner les mois** : chaque mois reprend 1 000 USDT fictifs et redéfinit la grille ; l'étude annuelle précédente fige les niveaux pour une année entière. Les cinq profils du graphique Administrator ne sont pas concernés.

## Atlas illustré — page HTML autonome

- [Ouvrir l’Atlas Seven Heaven des stratégies crypto (HTML avec 5 slides intégrées)](https://blueazur-hub.github.io/erith-ia-memory/assets/strategy_library/seven-heaven-crypto-strategy-atlas.html) — sept fiches, états de marché, résultats 2022–2025, courbes comparatives et calculateur de risque strictement pédagogique. Aucune connexion réseau requise une fois le fichier enregistré ; aucune opération de marché.
- [Accéder au code HTML source et l'enregistrer](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/assets/strategy_library/seven-heaven-crypto-strategy-atlas.html) — format unique, auto-contenu et consultable hors ligne.

## Observations du marché — Recherches 08 et 08B

- [**Ouvrir les études 08 / 08B dans le répertoire partagé**](../market_observations/README.md) — classification rétrospective sans anticipation, qualité des historiques, AKE/OKX, distinction Spot et perpétuels ; **aucun changement logiciel**.

## Commencer ici

- [Comparaison des profils selon l'état du marché](./SEVEN_HEAVEN_AGENT_CRYPTO_STRATEGY_PROFILES_MARKET_REGIMES_EDUCATIONAL_COMPARISON_2026_11_07.md) — tableau des environnements (hausse, baisse, range, volatilité, accumulation), correspondances avec les fiches, chiffres 2022–2025, drawdowns et limites.
- [Étude transversale du Coffre — méthodes et résultats 2022–2025](./SEVEN_HEAVEN_AGENT_CRYPTO_STRATEGY_FIELD_GUIDE_COFFRE_SIMULATIONS_AND_PAPER_PROFILES_2026_11_07.md) — 10 méthodes/protocoles testés expérimentalement et 9 méthodes documentées sans performances inventées.
- [Index source des bougies historiques BTC/USDT](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/index.json) — archive Binance Spot de la recherche, distincte du flux OKX BTC/USDC du Trader.

## Les sept fiches

1. [**01 — Spot Grid** : grille de prix, profits de grille versus variation du portefeuille, limites des bougies 1j](./SEVEN_HEAVEN_AGENT_CRYPTO_STRATEGY_PROFILE_01_SPOT_GRID_OKX_EEA_EDUCATIONAL_FIELD_GUIDE_2026_11_07.md)
2. [**02 — DCA classique versus Martingale** : épargne régulière, renforcement lors des baisses et risque de capital](./SEVEN_HEAVEN_AGENT_CRYPTO_STRATEGY_PROFILE_02_DCA_CLASSIC_VS_SPOT_DCA_MARTINGALE_OKX_EDUCATIONAL_FIELD_GUIDE_2026_11_07.md)
3. [**03 — RSI et Bollinger** : rebond et retour à la moyenne, signaux trompeurs](./SEVEN_HEAVEN_AGENT_CRYPTO_STRATEGY_PROFILE_03_RSI_BOLLINGER_MOMENTUM_AND_MEAN_REVERSION_EDUCATIONAL_FIELD_GUIDE_2026_11_07.md)
4. [**04 — MACD et SuperTrend** : momentum, tendance, retards et volatilité](./SEVEN_HEAVEN_AGENT_CRYPTO_STRATEGY_PROFILE_04_MACD_SUPERTREND_TREND_FOLLOWING_EDUCATIONAL_FIELD_GUIDE_2026_11_07.md)
5. [**05 — Breakout / Support / Résistance** : cassures confirmées et faux franchissements](./SEVEN_HEAVEN_AGENT_CRYPTO_STRATEGY_PROFILE_05_BREAKOUT_SUPPORT_RESISTANCE_FALSE_BREAKOUT_EDUCATIONAL_FIELD_GUIDE_2026_11_07.md)
6. [**06 — Swing Trading** : horizon multi-jours, setup, déclencheur, sortie et durée](./SEVEN_HEAVEN_AGENT_CRYPTO_STRATEGY_PROFILE_06_SWING_TRADING_SETUPS_AND_RISK_EDUCATIONAL_FIELD_GUIDE_2026_11_07.md)
7. [**07 — Gestion du risque** : tailles, frais, stops, objectifs, drawdowns](./SEVEN_HEAVEN_AGENT_CRYPTO_STRATEGY_PROFILE_07_RISK_MANAGEMENT_POSITION_SIZING_STOPS_DRAWDOWN_EDUCATIONAL_FIELD_GUIDE_2026_11_07.md)

## Comparaison : comment utiliser le dossier

1. **Observer** : identifier une hypothèse de tendance, de range ou de volatilité avec seulement les données disponibles à la date étudiée.
2. **Comprendre** : lire la fiche correspondant à la famille, et les situations où elle échoue.
3. **Comparer** : lire la recherche historique, y compris le drawdown, les coûts, le nombre de trades et l'année.
4. **Critiquer** : aucun rendement futur n'est garanti ; une année connue après coup n'est pas un filtre de trading utilisable en direct.

Les chiffres du Coffre sont issus de **BTC/USDT Binance Spot**, 1j, **1 000 USDT fictifs** par année du **22 janvier au 31 décembre**, frais hypothétiques **0,10 % par côté** et glissement **0,05 % par côté**, sans levier. Les backtests ont été calculés séparément de la V5 OKX BTC/USDC. Les méthodes Grid Spot, Martingale, Swing autonome, arbitrage, TWAP, Iceberg et scalping **ne reçoivent pas** de rendements inventés.

## Frontières de sécurité

- Code Administrator, Operator, Trader, Market Core, Backend et Bridge inchangés.
- Aucun ordre ni aucune modification du compte OKX.
- Aucun changement Notion dans cette publication.
- Aucun profil exécutable, aucune stratégie imposée comme paramètre par défaut.
- Pour de futures écritures GitHub, suivre le garde-fou de mémoire privée **GITHUB WRITE GUARD** : modifications explicitement demandées, nécessaires, bornées, vérifiables.

**Point d'arrêt documentaire :** les sept fiches sont réunies ; la comparaison pédagogique est publiée.

## Études continues partagées — Spot Grid et filtres de marché, 11 novembre 2026

Les rapports suivants ont été réalisés avec des archives **Binance Spot BTC/USDT 1m** du Coffre, vérifiées par SHA-256. Ils sont **rétrospectifs, PAPER uniquement**, sans ordre ni modification des profils Administrator, Operator ou Trader.

- **[Spot Grid 2026, janvier–octobre continus](./SEVEN_HEAVEN_SPOT_GRID_CONTINUOUS_BTC_2026_JAN_OCT_REPORT.md)** — 304 jours, 437 760 bougies, capital conservé, grille fixe et recentrage mensuel. [Preuves JSON](./SEVEN_HEAVEN_SPOT_GRID_CONTINUOUS_BTC_2026_JAN_OCT_PROOFS.json) · [Courbe CSV](./SEVEN_HEAVEN_SPOT_GRID_CONTINUOUS_BTC_2026_JAN_OCT_EQUITY_DAILY.csv).
- **[Spot Grid 2024 et 2025, deux trimestres continus](./SEVEN_HEAVEN_SPOT_GRID_BTC_2024_2025_Q1_CONTINUOUS_REPLAY_2026_11_11_REPORT.md)** — 181 journées, 260 640 bougies, comparaisons ±5/10/20/30 %, Buy & Hold, coûts doublés. [Courbes CSV](./SEVEN_HEAVEN_SPOT_GRID_BTC_2024_2025_Q1_CONTINUOUS_REPLAY_2026_11_11_EQUITY_DAILY.csv).
- **[EMA, SuperTrend et volatilité : sélection mensuelle Grid / Hold](./SEVEN_HEAVEN_EMA_SUPERTREND_VOLATILITY_GRID_HOLD_REGIME_STUDY_2026_11_11_REPORT.md)** — trois périodes disjointes, 698 400 minutes, indicateurs calculés à la clôture précédente ; signal non prédictif et dépendant de la fenêtre. [Journal des décisions](./SEVEN_HEAVEN_EMA_SUPERTREND_VOLATILITY_GRID_HOLD_REGIME_STUDY_2026_11_11_MONTHLY_DECISIONS.csv).

**Limite méthodologique :** les niveaux touchés dans des bougies OHLC ne prouvent pas l'exécution d'ordres limites ; les ajustements de grille restent théoriques. La recherche ne constitue ni une validation prospective ni un conseil financier.

## Retournements BTC : délai de réaction EMA / SuperTrend / ATR — 11 novembre 2026

Étude de la **latence des signaux** réalisée sur les 16 archives Binance Spot BTC/USDT 1 minute déjà vérifiées SHA-256 (698 400 minutes). Les positions BTC / cash sont simulées après clôture journalière, avec exécution hypothétique à l'ouverture suivante. Cette expérience est **distincte** des stratégies Spot Grid ; janvier sert au chauffage et les portefeuilles commencent au 1er février de chaque période.

- **[Rapport : EMA 10/30, SuperTrend ATR14 ×3, volatilité ATR 5 %, stop de baisse 10 % / reprise 5 %](./SEVEN_HEAVEN_BTC_REVERSAL_LATENCY_EMA_SUPERTREND_VOLATILITY_2026_11_11_REPORT.md)** — cas documentés de février–mars 2025 et mars 2024, résultats 2026, latences, drawdowns, faux signaux, frais normaux et doublés.
- **[Preuves JSON et transactions fictives](./SEVEN_HEAVEN_BTC_REVERSAL_LATENCY_EMA_SUPERTREND_VOLATILITY_2026_11_11_PROOFS.json)** · [**Courbes quotidiennes CSV**](./SEVEN_HEAVEN_BTC_REVERSAL_LATENCY_EMA_SUPERTREND_VOLATILITY_2026_11_11_EQUITY_DAILY.csv) · [**Épisodes de drawdown CSV**](./SEVEN_HEAVEN_BTC_REVERSAL_LATENCY_EMA_SUPERTREND_VOLATILITY_2026_11_11_DRAWDOWN_EVENTS.csv).
- **[Script Python reproductible](./SEVEN_HEAVEN_BTC_REVERSAL_LATENCY_EMA_SUPERTREND_VOLATILITY_2026_11_11.py)** · dépendances source [**moteur EMA/SuperTrend précédent**](./SEVEN_HEAVEN_EMA_SUPERTREND_VOLATILITY_GRID_HOLD_REGIME_STUDY_2026_11_11.py) et [**parseur / moteur Spot Grid trimestriel**](./SEVEN_HEAVEN_SPOT_GRID_BTC_2024_2025_Q1_CONTINUOUS_REPLAY_2026_11_11.py) désormais publiées dans ce répertoire.

**Statut :** recherche rétrospective et explicative, non test prospectif et non conseil d'investissement. Les stratégies ont des performances variables selon la fenêtre ; les sorties sont fictives au cours d'ouverture, et le seuil de drawdown est une règle de test, pas un signal validé sur OKX. **Aucun ordre, aucune modification des interfaces ou du Bridge.**

## RSI, MACD et ADX — repli ou retournement BTC, 11 novembre 2026

Nouvelle recherche exploratoire sur **16 archives Binance Spot BTCUSDT 1 minute** fournies par l'utilisateur (2024 T1, 2025 T1 et 2026 janvier–octobre), toutes vérifiées SHA-256 et sans lacune interne : **698 400 bougies**. Après un chauffage de 31 jours en janvier, les portefeuilles PAPER commencent au 1er février de chaque période. Chaque signal provient d'une journée UTC clôturée et ne déclenche une opération fictive qu'à l'ouverture suivante.

- [**Rapport : RSI14, MACD12/26/9, ADX14 avec +DI/−DI, comparaison EMA/SuperTrend**](./SEVEN_HEAVEN_BTC_RSI_MACD_ADX_MARKET_REVERSAL_RESEARCH_2026_11_11_REPORT.md) — rendements, pertes maximales, fréquence des transactions et frais doublés sur trois périodes distinctes.
- [**Synthèse JSON lisible par les IA**](./SEVEN_HEAVEN_BTC_RSI_MACD_ADX_MARKET_REVERSAL_RESEARCH_2026_11_11_SUMMARY.json) — 7 méthodes, 3 fenêtres et 6 épisodes de baisse, dont un censuré ; le fichier contient les résultats résumés, **pas** toutes les opérations individuelles.
- [**Épisodes de baisse observés (CSV)**](./SEVEN_HEAVEN_BTC_RSI_MACD_ADX_MARKET_REVERSAL_RESEARCH_2026_11_11_DRAWDOWN_EVENTS.csv) · [**Courbes de capital quotidien (CSV)**](./SEVEN_HEAVEN_BTC_RSI_MACD_ADX_MARKET_REVERSAL_RESEARCH_2026_11_11_EQUITY_DAILY.csv).
- [**Script Python de calcul reproductible**](./SEVEN_HEAVEN_BTC_RSI_MACD_ADX_MARKET_REVERSAL_RESEARCH_2026_11_11.py) · [**JSON détaillé : simulations et preuves**](./SEVEN_HEAVEN_BTC_RSI_MACD_ADX_MARKET_REVERSAL_RESEARCH_2026_11_11_PROOFS.json). **Tous deux publiés et relus après commit** (respectivement `6edf060` et `05400b3`). Le script requiert les modules de recherche précédents et les ZIP Binance 1m dont les SHA sont enregistrés dans le Coffre ; les ZIP sources restent dans GitHub Releases.

**Règle de discernement :** les étiquettes « PERSISTENT / RECOVERED / CENSORED » servent à juger a posteriori les baisses ; les 14 jours futurs ne sont jamais employés pour générer les signaux. Il n'existe aucun modèle prospectif validé, aucun ordre réel ni modification Administrator, Operator, Trader ou Bridge R31.

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
