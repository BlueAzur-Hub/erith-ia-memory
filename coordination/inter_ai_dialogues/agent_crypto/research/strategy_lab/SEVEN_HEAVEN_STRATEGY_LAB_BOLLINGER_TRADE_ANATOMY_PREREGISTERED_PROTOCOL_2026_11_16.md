# SEVEN HEAVEN · Strategy Lab — Protocole pré-enregistré Bollinger Trade Anatomy 2024–2025

**Date :** 2026-11-16  
**Statut :** gelé avant lecture des résultats trade-level  
**Base :** Bollinger 20 / 2 sigma · PAPER ONLY · paramètres inchangés  
**Source :** Binance Spot BTC/USDT 1h certifiée 2024–2025  
**Fenêtres :** expériences mensuelles indépendantes avec 720 h de warmup

## Objectif

Comprendre ce qui différencie un round-trip Bollinger gagnant d'un round-trip perdant, sans créer de nouveau filtre.

## Mesures par round-trip clôturé

- mois ;
- année ;
- timestamp d'entrée ;
- timestamp de sortie ;
- prix d'entrée fictif ;
- prix de sortie fictif ;
- PnL net ;
- rendement net sur coût ;
- durée en heures ;
- largeur relative des bandes à l'entrée ;
- profondeur du prix sous la bande basse à l'entrée ;
- largeur relative des bandes à la sortie ;
- profondeur du prix au-dessus de la bande haute à la sortie ;
- MFE : excursion favorable maximale pendant la position ;
- MAE : excursion adverse maximale pendant la position.

MFE/MAE sont calculés à partir des high/low des bougies 1h comprises entre le fill d'entrée et le fill de sortie, relativement au prix d'entrée PAPER.

## Comparaisons pré-enregistrées

Comparer :

- gagnants vs perdants ;
- 2024 vs 2025 ;
- durée gagnants vs perdants ;
- largeur d'entrée gagnants vs perdants ;
- profondeur d'entrée gagnants vs perdants ;
- MFE gagnants vs perdants ;
- MAE gagnants vs perdants ;
- corrélation durée ↔ rendement ;
- corrélation largeur d'entrée ↔ rendement ;
- corrélation profondeur d'entrée ↔ rendement ;
- corrélation MFE ↔ rendement ;
- corrélation MAE ↔ rendement.

## Interdictions

- aucun seuil transformé en filtre ;
- aucun changement de période/sigma ;
- aucun stop/target ajouté ;
- aucun tuning après résultat ;
- aucune utilisation du holdout pour sélectionner un nouveau paramètre ;
- aucune modification de V4.6.2 stable.

## But

Identifier si les pertes proviennent surtout :

- d'entrées trop tardives ;
- de bandes trop larges ;
- de positions qui stagnent trop longtemps ;
- d'excursions adverses importantes ;
- ou d'un mécanisme plus structurel.

**Diagnostiquer d'abord. Filtrer éventuellement dans une expérience future séparée.**
