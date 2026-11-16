# SEVEN HEAVEN · Strategy Lab — Donchian 55/20 4h · Panier BNB/XRP/SOL

**Date UTC :** 2026-11-16  
**Statut :** falsification multi-actif pré-enregistrée exécutée  
**Panier fixé avant résultat :** BNB/USDT, XRP/USDT, SOL/USDT  
**Source :** Binance Spot public monthly 1h · 2024–2025  
**Data Gate :** **72/72 mois certifiés, 0 rejet**  
**Stratégie :** Donchian 55/20 4h inchangé  
**Mode :** PAPER only · zéro ordre réel

## 1. Data Gate

Pour chacun des trois actifs, les 24 mois 2024–2025 ont passé :

- ZIP officiel + `.CHECKSUM` ;
- SHA-256 concordant ;
- schéma Binance strict ;
- OHLC cohérents ;
- ordre horaire strict ;
- zéro trou ;
- zéro doublon ;
- continuité inter-mois ;
- millisecondes en 2024 ;
- microsecondes en 2025.

Empreintes des ensembles normalisés :

- BNB/USDT : `6c17c3b7db746a6fae4c4d701aa8586474df8a8c4bf98718893602e4f9536474`
- XRP/USDT : `197adb30ca53f43f7e22fe3a6be40bf129eb0d79873b0ceb0ba6abea27c7cbc4`
- SOL/USDT : `f7d157001e82a6b1784f773de8fef269ef1a431c14649fd48ffedf3a8f62320b`

Aucune interpolation et aucune donnée utilisateur privée.

## 2. Règle inchangée

- entrée : clôture > plus haut des 55 bougies 4h précédentes ;
- sortie : clôture < plus bas des 20 bougies 4h précédentes ;
- next-bar-open ;
- capital 10 000 USDT par actif/année ;
- frais 0,10 % / côté ;
- glissement 0,05 % / côté ;
- coûts ×2 : 0,20 % + 0,10 % / côté ;
- aucun filtre ;
- aucun tuning.

## 3. Résultats

| Actif | Année | Marché sous-jacent | Zéro friction | Coûts base | Coûts ×2 | Fills | DD base |
|---|---:|---:|---:|---:|---:|---:|---:|
| BNB/USDT | 2024 | +125,17 % | +3,69 % | **−1,03 %** | −5,52 % | 31 | −43,04 % |
| BNB/USDT | 2025 | +23,07 % | +19,49 % | **+14,92 %** | +10,53 % | 26 | −19,13 % |
| XRP/USDT | 2024 | +238,52 % | +152,27 % | **+142,62 %** | +133,34 % | 26 | −42,64 % |
| XRP/USDT | 2025 | −11,58 % | −18,03 % | **−21,40 %** | −24,64 % | 28 | −51,96 % |
| SOL/USDT | 2024 | +86,11 % | +39,88 % | **+33,72 %** | +27,84 % | 30 | −44,05 % |
| SOL/USDT | 2025 | −34,16 % | −13,93 % | **−17,72 %** | −21,34 % | 30 | −41,86 % |

## 4. Lecture

Le panier fixé avant résultat fournit une falsification claire de l'hypothèse « Donchian 55/20 4h fonctionne partout ».

Chaque actif possède :

- une année positive ;
- une année négative.

### BNB

2024 est un échec remarquable : le marché sous-jacent monte d'environ +125 %, mais Donchian finit légèrement négatif après coûts.

Cela montre qu'une forte tendance annuelle ne suffit pas : la structure des ruptures et faux breakouts compte.

### XRP

2024 est extrêmement favorable à Donchian, mais 2025 inverse le signe et produit un drawdown supérieur à 50 %.

Le résultat 2024 ne peut donc pas être extrapolé.

### SOL

2024 est positif ; 2025 est nettement négatif. Le modèle perd moins que le sous-jacent sur l'année baissière, mais reste une perte importante.

## 5. Vue multi-actif consolidée

Fenêtres annuelles 2024–2025 avec coûts de base :

- BTC : +71,39 %, +8,12 %
- ETH : +48,73 %, +18,04 %
- BNB : −1,03 %, +14,92 %
- XRP : +142,62 %, −21,40 %
- SOL : +33,72 %, −17,72 %

Sur les 10 fenêtres annuelles BTC/ETH/BNB/XRP/SOL :

- **7 positives**
- **3 négatives**

Ce « 7/10 » n'est pas une probabilité future, ni un taux de réussite de trades, ni un score de robustesse.

Ajoutés aux cinq blocs BTC anciens (3 positifs / 2 négatifs), les résultats confirment une stratégie **fortement dépendante du régime et de l'actif**.

## 6. Conclusion scientifique

Donchian 55/20 4h reste un **candidat de recherche utile**, surtout parce que :

- sa rotation est faible ;
- ses coûts ne dominent généralement pas le résultat ;
- il traverse plusieurs fenêtres positivement ;
- il échoue aussi de façon nette sur plusieurs fenêtres, ce qui empêche une conclusion triomphante.

Le prochain problème n'est plus « quel paramètre choisir ? ».

Le prochain problème est :

> **quelles caractéristiques observables avant l'entrée différencient les régimes où Donchian fonctionne de ceux où il échoue ?**

Cette question doit être étudiée descriptivement avant toute création d'un filtre de régime.

## 7. Décision

- **aucun tuning 55/20** ;
- aucun actif retiré ;
- aucune V4.7 ;
- aucune intégration runtime ;
- passer à une cartographie de régimes explicable ;
- un éventuel filtre de régime devra devenir une nouvelle expérience et être testé sur des fenêtres séparées.

**La falsification multi-actif a réussi : Donchian est intéressant, mais pas universel.**
