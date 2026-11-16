# SEVEN HEAVEN · Strategy Lab — Protocole pré-enregistré Bollinger 2024–2025

**Date :** 2026-11-16  
**Statut :** gelé avant lecture des diagnostics détaillés  
**Source :** Binance Spot BTC/USDT · 1h · 24/24 mois 2024–2025 certifiés  
**Base moteur :** V4.6.2 · PAPER ONLY  
**Fenêtres actives :** février 2024 → décembre 2025  
**Warmup :** 720 h avant chaque mois, zéro fill pendant le préchauffage

## Question

Pourquoi Bollinger 20 / 2 sigma est-il parfois positif sans friction mais négatif après frais/glissement ?

## Paramètres gelés

- Bollinger période : 20
- sigma : 2
- capital : 10 000 USDT
- frais : 0,10 % par côté
- glissement : 0,05 % par côté
- timeframe : 1h
- spot long-only
- fill PAPER à l'ouverture de la bougie suivante
- aucune liquidation forcée

## Mesures par mois

Pour chaque mois actif, calculer :

- rendement net Bollinger ;
- rendement Bollinger zéro friction ;
- différence de rendement entre zéro friction et net ;
- frais payés ;
- nombre de fills ;
- positions clôturées ;
- durée moyenne des positions clôturées ;
- temps en position ;
- rendement BTC du mois ;
- volatilité réalisée ;
- drawdown du marché ;
- largeur relative de bande au signal d'achat ;
- largeur relative de bande au signal de vente ;
- distance du prix au bord de bande lors du signal.

La largeur relative de bande est définie comme :

`(BB_upper - BB_lower) / BB_middle × 100`

Elle est calculée uniquement à partir du `signal_context` déjà produit par le moteur. Aucun nouveau signal n'est créé.

## Analyses autorisées

Après calcul des 23 mois :

- corrélation fills ↔ perte de friction ;
- corrélation frais ↔ perte de friction ;
- corrélation volatilité ↔ largeur de bande ;
- corrélation largeur de bande ↔ rendement net ;
- comparaison mois positifs / négatifs ;
- comparaison mois où zéro friction est positif mais net est négatif.

## Interdictions

- aucun tuning de période ou sigma ;
- aucun seuil de largeur de bande utilisé comme filtre ;
- aucun paramètre modifié après lecture ;
- aucune optimisation sur 2025 ;
- aucune conclusion de rentabilité ;
- aucune modification de V4.6.2 stable.

## But

Séparer trois causes possibles :

1. **signal mauvais** : même zéro friction perd ;
2. **signal acceptable mais suractivité** : zéro friction gagne, net perd ;
3. **friction tolérable** : brut et net conservent le même signe.

**Comprendre le mécanisme avant de toucher aux paramètres.**
