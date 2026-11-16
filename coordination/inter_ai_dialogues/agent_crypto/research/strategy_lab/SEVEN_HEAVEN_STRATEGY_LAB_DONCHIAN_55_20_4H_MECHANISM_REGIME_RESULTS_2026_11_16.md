# SEVEN HEAVEN · Strategy Lab — Donchian 55/20 4h · Mécanisme et régimes 2024–2025

**Date UTC :** 2026-11-16  
**Statut :** étude descriptive pré-enregistrée terminée  
**Périmètre :** BTC/USDT, ETH/USDT, BNB/USDT, XRP/USDT, SOL/USDT · 2024–2025  
**Data Gate :** 120/120 archives mensuelles certifiées  
**Stratégie :** Donchian 55/20 4h inchangé  
**Mode :** PAPER only · aucun filtre · aucun tuning · zéro ordre réel

## 1. Échantillon trade-level

- fenêtres actif×année : **10**
- round-trips clôturés : **136**
- gagnants : **54**
- perdants : **82**

Le nombre de trades gagnants est inférieur au nombre de perdants. Le rendement global des bonnes fenêtres vient donc principalement de quelques tendances longues et importantes, pas d'un taux de réussite élevé.

## 2. Gagnants vs perdants

| Variable | Gagnants | Perdants |
|---|---:|---:|
| Trades | 54 | 82 |
| Rendement net médian | **+7,76 %** | **-5,66 %** |
| Durée médiane | **69 bougies 4h** | **26,5 bougies 4h** |
| MFE médiane | **+15,16 %** | **+2,84 %** |
| MAE médiane | **-1,47 %** | **-6,62 %** |
| Breakout excess médian | 0,783 % | 0,796 % |
| Largeur canal 55 médiane | 9,93 % | 11,16 % |
| Rendement directionnel 55 médian | 5,18 % | 5,96 % |
| Efficiency ratio 55 médian | 0,131 | 0,117 |
| ATR20 relatif médian | 1,56 % | 1,78 % |

## 3. Lecture trade-level

### Breakout excess

Presque aucune séparation :

- gagnants : 0,783 %
- perdants : 0,796 %

La simple force du dépassement du canal ne semble donc pas fournir, à elle seule, une distinction exploitable.

### Largeur du canal et volatilité locale

Les gagnants apparaissent avec des canaux un peu plus étroits et un ATR relatif légèrement inférieur :

- canal : 9,93 % vs 11,16 %
- ATR20 : 1,56 % vs 1,78 %

Différence descriptive, mais insuffisante pour inventer un seuil.

### Efficiency ratio 55

L'ER55 est légèrement plus élevé chez les gagnants :

- 0,131 vs 0,117

Cela va dans le sens d'un chemin pré-entrée un peu plus directionnel, mais la séparation reste faible au niveau trade individuel.

### La vraie séparation apparaît après l'entrée

Les gagnants durent beaucoup plus longtemps :

- 69 bougies 4h contre 26,5.

Ils subissent aussi beaucoup moins d'excursion adverse :

- MAE -1,47 % contre -6,62 %.

Et produisent des tendances favorables beaucoup plus fortes :

- MFE +15,16 % contre +2,84 %.

Donchian fonctionne donc ici comme une stratégie de **faible taux de réussite mais gros gagnants prolongés**.

## 4. Régimes annuels — corrélations descriptives

Sur seulement dix fenêtres actif×année :

- rendement sous-jacent ↔ rendement Donchian : **0,839**
- efficiency ratio annuel ↔ rendement Donchian : **0,811**
- drawdown sous-jacent ↔ rendement Donchian : **0,309**
- % des closes au-dessus SMA200 ↔ rendement Donchian : **0,295**
- volatilité réalisée ↔ rendement Donchian : **0,133**

Ces valeurs sont descriptives : **n = 10**, donc aucune corrélation ne doit être présentée comme robuste ou prédictive.

## 5. Exemples de régimes

### BTC 2024
- sous-jacent : +121,31 %
- efficiency ratio annuel : 0,047
- Donchian : +71,39 %
- DD Donchian : -21,90 %

### XRP 2024
- sous-jacent : +238,52 %
- efficiency ratio annuel : 0,064
- Donchian : +142,62 %

### BNB 2024 — contre-exemple important
- sous-jacent : +125,17 %
- efficiency ratio annuel : 0,037
- Donchian : **-1,03 %**

Une année très haussière ne suffit donc pas. La structure des ruptures/faux breakouts reste déterminante.

### SOL 2025
- sous-jacent : -34,16 %
- Donchian : -17,72 %

### XRP 2025
- sous-jacent : -11,58 %
- Donchian : -21,40 %

## 6. Conclusion

Deux niveaux se distinguent :

1. **régime global** : Donchian profite surtout des marchés dont le déplacement annuel est directionnel et efficace ;
2. **trade individuel** : la qualité de l'entrée est difficile à distinguer avec les cinq variables pré-enregistrées ; la réussite devient surtout visible après l'entrée, lorsqu'une tendance persiste longtemps avec peu de MAE.

Cela interdit de transformer immédiatement l'ER55, l'ATR ou la largeur de canal en filtre.

La meilleure prochaine action est une contre-épreuve sans nouveau paramètre :

> **Donchian 55/20 4h inchangé sur BTC/USDT janvier→octobre 2026**, source déjà certifiée avant cette décision.

Ce test sera une confirmation de stratégie sur une nouvelle période, pas un holdout de marché totalement aveugle puisque 2026 a déjà été observé dans d'autres études.

**Comprendre le régime ne justifie pas encore de le filtrer.**
