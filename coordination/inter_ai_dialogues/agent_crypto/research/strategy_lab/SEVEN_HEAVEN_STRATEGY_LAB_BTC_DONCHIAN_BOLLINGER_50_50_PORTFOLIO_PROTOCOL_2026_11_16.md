# SEVEN HEAVEN · Strategy Lab — Portefeuille bi-mécanisme BTC 4h

**Date :** 2026-11-16  
**Statut :** protocole gelé avant résultat  
**Actif :** Binance Spot BTC/USDT  
**Timeframe :** 4h  
**Mode :** PAPER only

## Question

Deux mécanismes différents appliqués au même marché réduisent-ils la fragilité observée lorsqu'un seul modèle traverse un mauvais régime ?

## Portefeuille fixé avant résultat

Capital total fictif : **10 000 USDT**.

Deux poches indépendantes :
- **5 000 USDT Donchian 55/20 4h**
- **5 000 USDT Bollinger 20/2 4h**

Aucun transfert entre les poches.

Aucun rééquilibrage périodique.

Le cash d'une stratégie reste dans sa poche.

## Exécution commune

- même série BTC/USDT certifiée ;
- bougies 1h agrégées causalement en 4h ;
- signal sur bougie clôturée ;
- fill PAPER à l'ouverture 4h suivante ;
- frais : 0,10 % / côté ;
- glissement : 0,05 % / côté ;
- long-only ;
- aucun levier ;
- aucune liquidation forcée de fin.

## Périodes indépendantes

1. 2024-01-01 → 2024-12-31
2. 2025-01-01 → 2025-12-31
3. 2026-01-01 → 2026-10-31

Chaque période repart avec 10 000 USDT.

## Références

Comparer le portefeuille 50/50 à :
- Donchian seul avec 10 000 USDT ;
- Bollinger seul avec 10 000 USDT ;
- Cash 10 000 USDT.

Aucun composant ne sera retiré après résultat.

## Mesures

Pour chaque période :
- rendement portefeuille ;
- drawdown maximal portefeuille sur clôtures 4h ;
- frais totaux ;
- fills totaux ;
- rendement/DD de chaque poche ;
- corrélation des rendements 4h des deux poches ;
- fraction du temps où les deux stratégies sont simultanément exposées.

## Interprétation

La réussite ne signifie pas « stratégie validée ».

Une amélioration de drawdown qui ne provient que d'une moindre exposition doit être décrite comme telle.

Si les deux mécanismes perdent simultanément, le portefeuille peut encore échouer.

## Stop Gate

- pas de modification des poids 50/50 après résultat ;
- pas de tuning Donchian ;
- pas de tuning Bollinger ;
- pas de filtre de régime ;
- pas de transfert dynamique ;
- aucune intégration runtime.

**Même marché, deux mécanismes, deux poches, aucun choix après coup.**
