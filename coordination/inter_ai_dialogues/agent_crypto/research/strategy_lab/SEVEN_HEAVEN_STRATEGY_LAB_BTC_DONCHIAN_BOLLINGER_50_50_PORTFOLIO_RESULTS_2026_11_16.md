# SEVEN HEAVEN · Strategy Lab — Portefeuille BTC Donchian 55/20 + Bollinger 20/2 · 50/50

**Date UTC :** 2026-11-16  
**Statut :** expérience pré-enregistrée terminée  
**Actif :** Binance Spot BTC/USDT  
**Timeframe :** 4h  
**Capital :** 10 000 USDT, deux poches indépendantes de 5 000 USDT  
**Mode :** PAPER only · zéro ordre réel · aucun transfert · aucun rééquilibrage

## Méthode

Deux mécanismes appliqués à la même série certifiée :

- poche A : Donchian 55/20 4h ;
- poche B : Bollinger 20/2 4h.

Les deux implémentations ont passé un garde de parité contre leurs simulateurs canoniques avant agrégation du portefeuille.

Les périodes sont indépendantes :

- 2024
- 2025
- janvier→octobre 2026

## Résultats

| Période | Portefeuille 50/50 | DD portefeuille | Donchian seul | DD Donchian | Bollinger seul | DD Bollinger |
|---|---:|---:|---:|---:|---:|---:|
| 2024 | **+34,47 %** | **-20,22 %** | +71,39 % | -21,90 % | -2,45 % | -25,11 % |
| 2025 | **+14,02 %** | **-20,72 %** | +8,12 % | -11,48 % | +19,91 % | -32,86 % |
| 2026 Jan–Oct | **-6,52 %** | **-17,82 %** | -5,03 % | -17,37 % | -8,01 % | -29,09 % |

## Corrélation des deux mécanismes

Corrélation des variations d'equity 4h entre les deux poches :

- 2024 : **0,099**
- 2025 : **0,027**
- 2026 Jan–Oct : **0,107**

Les courbes de stratégie sont donc faiblement corrélées dans ces trois fenêtres.

## Exposition simultanée

Temps où les deux mécanismes sont simultanément exposés :

- 2024 : **7,15 %**
- 2025 : **1,19 %**
- 2026 Jan–Oct : **5,43 %**

La faible corrélation n'est donc pas surprenante : les deux modèles détiennent souvent des états de portefeuille différents.

## Lecture par période

### 2024

Le portefeuille réduit légèrement le drawdown face à Donchian :

- portefeuille : -20,22 %
- Donchian : -21,90 %

Mais il abandonne une grande partie du rendement, car la moitié du capital est confiée à un Bollinger négatif :

- portefeuille : +34,47 %
- Donchian : +71,39 %
- Bollinger : -2,45 %

C'est une diversification défensive, pas une amélioration de rendement.

### 2025

Les deux stratégies sont positives :

- Donchian +8,12 %
- Bollinger +19,91 %

Le portefeuille obtient +14,02 %, logiquement entre les deux.

Son drawdown (-20,72 %) est meilleur que Bollinger (-32,86 %) mais moins bon que Donchian (-11,48 %).

Il ne domine donc aucun composant sur les deux dimensions rendement + drawdown.

### 2026 Jan–Oct

Les deux mécanismes perdent :

- Donchian -5,03 %
- Bollinger -8,01 %
- portefeuille -6,52 %

Le portefeuille est alors légèrement **plus mauvais que Donchian seul à la fois en rendement et en drawdown** :

- portefeuille DD -17,82 %
- Donchian DD -17,37 %

La diversification des mécanismes ne peut pas produire un avantage lorsque les deux modèles échouent dans la même période, même avec une faible corrélation de court terme.

## Frais et activité

### 2024
- portefeuille : 75 fills
- frais : 432,78 USDT

### 2025
- 78 fills
- 463,54 USDT

### 2026 Jan–Oct
- 65 fills
- 293,85 USDT

La poche Bollinger reste la principale source de rotation.

## Conclusion scientifique

L'expérience confirme une idée importante :

> **faible corrélation entre stratégies ≠ portefeuille automatiquement supérieur.**

La diversification de mécanisme peut :

- lisser certains drawdowns ;
- éviter une dépendance totale à un seul modèle ;
- mais aussi diluer une stratégie très favorable ;
- ou ajouter une seconde stratégie perdante dans un mauvais régime.

Aucune pondération 50/50 ne peut donc être déclarée supérieure sur ces trois périodes.

Le résultat suggère que la prochaine question n'est plus « quelle pondération aurait mieux marché ? », car ce serait du tuning rétrospectif.

La question utile devient :

> quelles stratégies méritent d'être intégrées comme **moteurs de recherche natifs** dans le Strategy Lab, afin que les comparaisons futures soient standardisées, reproductibles et visibles dans la même interface ?

**Diversification de mécanisme : utile comme outil de risque, non démontrée comme alpha autonome.**
