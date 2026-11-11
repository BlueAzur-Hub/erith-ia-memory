# Seven Heaven — Bibliothèque documentaire des stratégies crypto

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
