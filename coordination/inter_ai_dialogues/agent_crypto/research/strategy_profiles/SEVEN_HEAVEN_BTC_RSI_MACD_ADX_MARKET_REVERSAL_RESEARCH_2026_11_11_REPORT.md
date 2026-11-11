# Seven Heaven — Distinguer le repli et le retournement : RSI / MACD / ADX / ATR

**Date :** 11 novembre 2026  
**Mode :** recherche historique, 100 % PAPER, lecture seule, aucune exécution réelle.

## Périmètre de vérité

- 16 archives ZIP originales BTCUSDT Binance Spot à la minute (2024 T1, 2025 T1, 2026 janvier–octobre), chaque SHA-256 vérifié ; 698 400 bougies vérifiées sans interruption à l’intérieur de chaque période.
- Signaux évalués sur la dernière **journée UTC clôturée**, achat/vente **fictifs à l’ouverture suivante**, jamais sur la clôture ayant déclenché le signal.
- Janvier sert de chauffage. Trois simulations distinctes démarrent au 1er février avec 1 000 USDT, sans apport en cours de période.
- Coût simulé par opération : frais 0,10 % par côté et glissement 0,05 % ; contrôle de sensibilité avec frais et glissement doublés.
- Les réglages RSI14, MACD12/26/9, ADX14 seuil 20, EMA10/30, SuperTrend ATR14 ×3 et consensus 2/3 sont documentés dans le code. Aucun réglage optimisé sur les rendements observés.

## Rendements nets des portefeuilles fictifs

| Méthode | Fév.–mars 2024 | Fév.–mars 2025 | Fév.–oct. 2026 |
|---|---:|---:|---:|
| BUY_HOLD | +66.90 % | -19.65 % | -1.77 % |
| EMA10_30 | +45.86 % | -5.78 % | +3.24 % |
| SUPERTREND_ATR14_X3 | +31.02 % | -25.93 % | +15.80 % |
| RSI14_50 | +42.92 % | -19.37 % | +7.77 % |
| MACD_12_26_9 | +36.33 % | +0.00 % | -4.45 % |
| ADX14_DI_20 | +25.81 % | -0.97 % | -1.12 % |
| TWO_OF_THREE | +41.60 % | +0.00 % | +8.12 % |

## Dégradation des rendements lorsque les coûts doublent

| Méthode | 2024 | 2025 | 2026 |
|---|---:|---:|---:|
| BUY_HOLD | +66.40 % | -19.89 % | -2.06 % |
| EMA10_30 | +44.99 % | -6.34 % | -0.42 % |
| SUPERTREND_ATR14_X3 | +30.62 % | -26.37 % | +15.11 % |
| RSI14_50 | +41.21 % | -20.57 % | +3.02 % |
| MACD_12_26_9 | +35.52 % | +0.00 % | -7.00 % |
| ADX14_DI_20 | +25.06 % | -1.27 % | -2.88 % |
| TWO_OF_THREE | +40.75 % | +0.00 % | +5.24 % |

## Risque, fréquence des ordres et pertes transitoires

| Période | Stratégie | Drawdown quotidien maximum | Opérations fictives | Exposition BTC (jours) | Intervalles longs moins de 4 jours |
|---|---|---:|---:|---:|---:|
| 2024 | BUY_HOLD | -15.24 % | 1 | 60/60 | 0 |
| 2024 | EMA10_30 | -20.53 % | 3 | 52/60 | 0 |
| 2024 | SUPERTREND_ATR14_X3 | -15.24 % | 2 | 39/60 | 0 |
| 2024 | RSI14_50 | -20.53 % | 7 | 56/60 | 1 |
| 2024 | MACD_12_26_9 | -10.64 % | 4 | 35/60 | 0 |
| 2024 | ADX14_DI_20 | -15.99 % | 3 | 42/60 | 0 |
| 2024 | TWO_OF_THREE | -15.99 % | 3 | 47/60 | 0 |
| 2025 | BUY_HOLD | -23.50 % | 1 | 59/59 | 0 |
| 2025 | EMA10_30 | -5.78 % | 4 | 2/59 | 2 |
| 2025 | SUPERTREND_ATR14_X3 | -25.93 % | 4 | 32/59 | 0 |
| 2025 | RSI14_50 | -19.37 % | 10 | 8/59 | 4 |
| 2025 | MACD_12_26_9 | 0.00 % | 0 | 0/59 | 0 |
| 2025 | ADX14_DI_20 | -0.97 % | 2 | 2/59 | 1 |
| 2025 | TWO_OF_THREE | 0.00 % | 0 | 0/59 | 0 |
| 2026 | BUY_HOLD | -28.69 % | 1 | 273/273 | 0 |
| 2026 | EMA10_30 | -11.76 % | 24 | 110/273 | 7 |
| 2026 | SUPERTREND_ATR14_X3 | -14.78 % | 4 | 172/273 | 0 |
| 2026 | RSI14_50 | -14.78 % | 30 | 138/273 | 8 |
| 2026 | MACD_12_26_9 | -14.37 % | 18 | 74/273 | 2 |
| 2026 | ADX14_DI_20 | -13.80 % | 12 | 97/273 | 3 |
| 2026 | TWO_OF_THREE | -14.37 % | 18 | 109/273 | 4 |

## Mesurer le repli et le retournement

Une **baisse de 10 % depuis le plus haut de clôture des 30 jours précédents** sert ici de marqueur d’épisode, pas de prédicteur. Pour qualifier rétrospectivement un épisode de **persistant**, le prix doit encore être à au moins 5 % sous son sommet de référence 14 jours plus tard. En cas de fin de série, l’épisode est indiqué « CENSORED » plutôt que de deviner la suite.

Ce label utilise les prix FUTURS uniquement pour **évaluer a posteriori**. Aucune stratégie de ce rapport ne peut lire cette étiquette.

| Année | Date seuil −10 % | Repli 14 jours après | EMA déjà en liquidités | MACD déjà en liquidités | RSI déjà en liquidités | ADX déjà en liquidités |
|---|---|---|---|---|---|---|
| 2024 | 2024-03-16 | RECOVERED | non | oui | non | non |
| 2025 | 2025-02-24 | PERSISTENT | oui | oui | oui | oui |
| 2026 | 2026-02-01 | PERSISTENT | oui | oui | oui | oui |
| 2026 | 2026-03-27 | RECOVERED | oui | oui | oui | oui |
| 2026 | 2026-05-28 | PERSISTENT | oui | oui | oui | oui |
| 2026 | 2026-10-30 | CENSORED | oui | oui | oui | oui |

## Contrôles, interprétation et limites

- Les prix historiques, la rentabilité fictive et les épisodes de baisse sont des résultats descriptifs, non des probabilités de gains futurs.
- L’ADX exprime la force d’une tendance, **pas sa direction** : ici, +DI et −DI définissent le sens ; l’ATR exprime l’amplitude, **pas une prévision**.
- Les indicateurs plus rapides peuvent sortir tôt, mais peuvent multiplier les faux signaux et les frais. Les filtres lents peuvent protéger contre le bruit, mais leur retard coûte pendant une chute brutale.
- Périodes non synchrones et courtes pour 2024–2025 ; aucune preuve statistique de supériorité, aucun test prospectif en conditions OKX.
- Les prix sont Binance BTCUSDT, non OKX BTCUSDC. Pas de carnet, file d’attente, liquidité disponible, contraintes de lot, fiscalité ni frais réels du compte.
- L’étude ne modifie ni Administrator, Trader, Operator, Market Core, Bridge ou stratégie en service.
- Preuves : SEVEN_HEAVEN_BTC_RSI_MACD_ADX_MARKET_REVERSAL_RESEARCH_2026_11_11_PROOFS.json ; séries SEVEN_HEAVEN_BTC_RSI_MACD_ADX_MARKET_REVERSAL_RESEARCH_2026_11_11_EQUITY_DAILY.csv et épisodes SEVEN_HEAVEN_BTC_RSI_MACD_ADX_MARKET_REVERSAL_RESEARCH_2026_11_11_DRAWDOWN_EVENTS.csv ; script SEVEN_HEAVEN_BTC_RSI_MACD_ADX_MARKET_REVERSAL_RESEARCH_2026_11_11.py

## Arrêt de recherche

Décision : ne pas déclarer de règle gagnante ; le prochain vrai test serait une validation sur des mois ultérieurs encore non étudiés, en conservant les mêmes seuils **sans optimisation**. Aucun ordre, aucune action sur l’interface.
