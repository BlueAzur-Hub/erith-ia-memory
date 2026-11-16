# SEVEN HEAVEN · Strategy Lab — Bollinger Trade Aging 2024–2025

**Date UTC :** 2026-11-16  
**Statut :** étude pré-enregistrée terminée  
**Source :** Binance Spot BTC/USDT 1h certifiée 2024–2025  
**Base :** Bollinger 20 / 2 sigma · PAPER ONLY · aucun time-stop appliqué

## Résultat principal

La probabilité de récupération d'un trade Bollinger se dégrade fortement avec l'âge **si la position est encore négative**.

| Âge | Positions encore ouvertes | Taux de gain final | Si actuellement négative | Si actuellement positive |
|---|---:|---:|---:|---:|
| 12 h | 166 | 59,6 % | **46,8 %** | **76,4 %** |
| 24 h | 114 | 43,9 % | **22,7 %** | **84,6 %** |
| 36 h | 84 | 34,5 % | **13,3 %** | **87,5 %** |
| 48 h | 59 | 27,1 % | **8,9 %** | **85,7 %** |
| 72 h | 27 | 18,5 % | **4,5 %** | **80,0 %** |

## Rendement final moyen des positions encore ouvertes

### Toutes positions
- 12 h : **-0,13 %**
- 24 h : **-0,74 %**
- 36 h : **-1,34 %**
- 48 h : **-2,00 %**
- 72 h : **-3,58 %**

### Positions actuellement négatives
- 12 h : **-0,75 %**
- 24 h : **-1,69 %**
- 36 h : **-2,35 %**
- 48 h : **-3,06 %**
- 72 h : **-4,42 %**

### Positions actuellement positives
- 12 h : **+0,69 %**
- 24 h : **+1,10 %**
- 36 h : **+1,20 %**
- 48 h : **+1,39 %**
- 72 h : **+0,12 %**

## État marqué causal à l'horizon

Les positions négatives se dégradent aussi dans leur état courant :

- 12 h : PnL marqué moyen **-1,18 %**, MAE déjà subie **-2,36 %**
- 24 h : **-1,89 %**, MAE **-3,10 %**
- 36 h : **-2,48 %**, MAE **-4,47 %**
- 48 h : **-3,18 %**, MAE **-5,11 %**
- 72 h : **-4,48 %**, MAE **-6,74 %**

## 2024 vs 2025

La dégradation existe dans les deux années.

### À 24 h
- 2024 : 46,4 % de gains finaux
- 2025 : 41,4 %

### À 36 h
- 2024 : 41,5 %
- 2025 : 27,9 %

### À 48 h
- 2024 : 33,3 %
- 2025 : 21,9 %

### À 72 h
- 2024 : 23,1 %
- 2025 : 14,3 %

Le phénomène n'est donc pas propre à une seule année.

## Lecture scientifique

Le point important n'est pas simplement « les trades longs sont mauvais ».

Il est plus précis :

> **un trade qui reste ouvert longtemps ET qui est encore négatif voit ses chances de récupération s'effondrer.**

Un trade encore positif à 24–48 h reste au contraire très souvent gagnant à la fin.

Cela suggère qu'un éventuel futur mécanisme ne devrait probablement pas être un time-stop aveugle appliqué à tous les trades.

La prochaine hypothèse naturelle est une sortie conditionnelle du type :

- âge minimal atteint ;
- position encore sous son prix d'entrée / encore négative ;
- sortie PAPER à l'open suivant.

Mais cette règle n'est **pas encore validée**.

## Limite méthodologique importante

Nous avons maintenant observé 2025 dans les diagnostics.

Par conséquent, si une règle est construite à partir de ces observations, **2025 ne peut plus être présenté comme un holdout totalement aveugle** pour cette nouvelle règle.

La prochaine expérimentation doit donc :

1. définir la règle à partir des constats déjà enregistrés ;
2. l'évaluer séparément sur 2024 et 2025 en assumant que 2025 est une validation connue ;
3. réserver une nouvelle période indépendante pour une confirmation plus forte.

**L'étude observe l'âge. Elle ne coupe encore aucun trade.**
