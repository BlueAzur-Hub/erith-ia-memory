# SEVEN HEAVEN · Strategy Lab — Donchian 55/20 · Preregistration

**Date :** 2026-11-16  
**Statut :** protocole gelé avant résultats Donchian  
**Périmètre :** recherche isolée, aucune intégration V4.6.2  
**Source :** Binance Spot BTC/USDT certifié 2024–2025  
**Mode :** PAPER only, long-only, next-bar-open

## 1. Hypothèse

Tester une famille de breakout Donchian indépendante des stratégies de croisement et de trailing stop déjà étudiées.

Le projet avait identifié « Donchian 55 » comme piste. Pour rendre l'expérience entièrement définie, cette étude fixe :

- entrée : canal **55 barres** ;
- sortie : canal **20 barres**.

Cette expérience est nommée Donchian 55/20 afin de ne pas masquer la règle de sortie.

## 2. Paramètres gelés

- période d'entrée : **55**
- période de sortie : **20**
- capital : 10 000 USDT
- frais : 0,10 % par côté
- glissement : 0,05 % par côté
- spot long-only
- levier : 1
- aucun filtre supplémentaire
- aucune liquidation forcée de fin

Horizons déclarés avant résultat :

- 1h
- 4h

## 3. Règle d'entrée

Sur la dernière bougie clôturée :

- calculer le plus haut des **55 bougies précédentes**, sans inclure la bougie signal ;
- si la clôture de la bougie signal est strictement supérieure à ce plus haut et qu'aucune position n'est ouverte :
  - BUY PAPER à l'ouverture suivante.

L'utilisation de la clôture rend ce test volontairement plus conservateur qu'un déclenchement au simple passage intrabougie du canal.

## 4. Règle de sortie

Sur la dernière bougie clôturée :

- calculer le plus bas des **20 bougies précédentes**, sans inclure la bougie signal ;
- si la clôture est strictement inférieure à ce plus bas et qu'une position est ouverte :
  - SELL PAPER à l'ouverture suivante.

## 5. Causalité

La bougie d'exécution n'entre dans aucun calcul.

Les canaux sont construits uniquement avec des bougies antérieures à la bougie signal, elle-même déjà clôturée.

## 6. Fenêtres

- 2024 : research replay ;
- 2025 : known-market validation.

Aucun holdout untouched n'est revendiqué.

## 7. Coûts

Trois scénarios pré-enregistrés :

- zéro friction ;
- coûts de base ;
- coûts ×2.

## 8. Mesures

- rendement ;
- drawdown ;
- fills ;
- frais ;
- inventaire final ;
- temps de détention indirectement visible via les séquences de fills ;
- stabilité 2024 / 2025 ;
- différence 1h / 4h.

## 9. Stop Gate

- ne pas modifier 55/20 après lecture ;
- une autre longueur devient une nouvelle expérience ;
- ne pas ajouter de filtre de régime rétroactivement ;
- aucune intégration runtime automatique.

**Donchian 55/20 teste la rupture confirmée, pas la poursuite intrabougie.**
