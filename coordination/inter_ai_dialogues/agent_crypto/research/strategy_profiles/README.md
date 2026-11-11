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
