# SEVEN HEAVEN · Strategy Lab — Cartographie mensuelle descriptive 2024–2025

**Date UTC :** 2026-11-16  
**Statut :** étude pré-enregistrée terminée  
**Source :** Binance Spot BTC/USDT · 1h · 24/24 mois 2024–2025 certifiés  
**Fenêtres actives :** 23 mois indépendants, février 2024 → décembre 2025  
**Warmup :** 720 h avant chaque mois, zéro fill pendant le préchauffage  
**Capital :** 10 000 USDT remis à zéro pour chaque mois  
**Mode :** PAPER ONLY · zéro ordre réel

## Méthode

Chaque mois est une expérience indépendante. Les rendements ne sont pas cumulés.

Pour chaque mois :

- rendement BTC ;
- volatilité réalisée annualisée ;
- drawdown du marché ;
- six stratégies gelées : EMA 10/30, Bollinger 20/2, DCA, Hold 50 %, Hold 100 %, Cash.

Les métriques de marché restent **descriptives** et ne servent à aucun signal d'entrée.

## Résumé 23 mois

| Modèle | Mois positifs | Bat Cash | Bat Hold 100 | Médiane mensuelle | Corr. rendement BTC | Corr. volatilité |
|---|---:|---:|---:|---:|---:|---:|
| EMA 10/30 | 8/23 | 8 | 7 | **-1,94 %** | **0,818** | 0,021 |
| Bollinger | 13/23 | 13 | 8 | **+0,66 %** | **0,800** | -0,310 |
| DCA | 13/23 | 13 | 10 | **+0,13 %** | **0,954** | 0,020 |
| Hold 50 % | 13/23 | 13 | 10 | **+1,40 %** | **1,000** | -0,025 |
| Hold 100 % | 13/23 | 13 | 0 | **+2,80 %** | **1,000** | -0,025 |
| Cash | 0/23 | 0 | 10 | 0,00 % | n/a | n/a |

## Extrêmes

### EMA 10/30
- meilleur mois : **2024-11, +30,22 %**
- pire mois : **2025-12, -18,44 %**
- médiane négative : **-1,94 %**

### Bollinger
- meilleur mois : **2024-02, +15,28 %**
- pire mois : **2025-11, -13,81 %**
- médiane légèrement positive : **+0,66 %**

### DCA
- meilleur mois : **2024-02, +3,65 %**
- pire mois : **2025-02, -1,68 %**
- médiane : **+0,13 %**

### Hold 100 %
- meilleur mois : **2024-02, +43,35 %**
- pire mois : **2025-02, -17,77 %**
- médiane : **+2,80 %**

## Lecture scientifique

### 1. EMA 10/30 reste très directionnelle

Corrélation avec le rendement mensuel BTC : **0,818**.

Elle ne crée donc pas une protection indépendante du marché. Elle amplifie souvent la direction dominante, tout en ajoutant beaucoup de transactions et de frictions.

Seulement **8 mois positifs sur 23** et une médiane mensuelle négative.

### 2. Bollinger est plus régulier mensuellement, mais reste dépendant du marché

- 13 mois positifs sur 23 ;
- médiane +0,66 % ;
- corrélation au rendement BTC encore élevée : **0,800**.

Sa corrélation négative modérée à la volatilité (-0,310) mérite une étude spécifique, mais ne prouve pas encore qu'elle « aime » les marchés calmes. La relation peut être indirecte et doit être contrôlée avant toute conclusion.

### 3. DCA est presque un proxy d'exposition directionnelle

Corrélation au rendement BTC : **0,954**.

Le DCA réduit l'amplitude mensuelle par rapport au Hold 100 %, mais reste très largement dépendant de la direction du BTC.

Il bat Hold 100 % dans **10 mois sur 23**, surtout parce que son capital est investi progressivement plutôt qu'immédiatement.

### 4. Hold 50 / Hold 100 donnent le repère directionnel

Leur corrélation de 1,000 avec le rendement BTC est attendue : ils servent de contrôle.

Cash bat Hold 100 % dans **10 mois sur 23**, ce qui montre simplement qu'environ dix mois de l'échantillon sont défavorables à une exposition initiale intégrale.

### 5. La volatilité seule n'explique pas les modèles

Les corrélations rendement-stratégie / volatilité sont faibles pour EMA, DCA et Hold.

Bollinger présente -0,310, suffisamment différent pour justifier une étude, mais pas assez pour parler d'une loi.

## Conclusion

Le premier enseignement de régime n'est pas « choisir une stratégie selon un label bull/bear ».

Il est plus fondamental :

- EMA 10/30 est très dépendante de la direction et fragile aux frictions ;
- DCA et Hold restent essentiellement des formes différentes d'exposition BTC ;
- Bollinger est la seule famille actuelle dont le comportement semble un peu moins trivial, mais ses coûts restent un problème majeur ;
- Cash demeure une référence indispensable dans les mois défavorables.

La prochaine étude logique est donc **Bollinger : relation entre fréquence, volatilité, amplitude des bandes et coûts**, sans tuning sur le holdout.

**Observer d'abord. Expliquer ensuite. Optimiser seulement après.**
