# SEVEN HEAVEN · Strategy Lab — Bloc de confirmation indépendant 2026

**Date :** 2026-11-16  
**Statut :** protocole fixé avant lecture des résultats 2026  
**Source cible :** Binance Spot BTC/USDT · 1h · archives mensuelles officielles + .CHECKSUM  
**Période :** janvier 2026 → octobre 2026 inclus  
**Novembre 2026 :** exclu car mois non terminé

## But

Créer une nouvelle période indépendante pour confirmer ou réfuter les futures hypothèses issues des études Bollinger 2024–2025.

Le bloc 2026 ne doit pas être utilisé pour choisir :
- la durée d'un time-stop ;
- un seuil de drawdown ;
- un sigma ;
- une période Bollinger ;
- un filtre.

Il intervient seulement **après** qu'une règle a été sélectionnée sur le bloc de recherche déjà observé.

## Gate de données

Chaque mois doit passer :
- CHECKSUM officiel ;
- SHA-256 ;
- schéma 12 colonnes ;
- timestamps microsecondes ;
- continuité horaire ;
- aucun doublon ;
- aucun trou ;
- OHLC cohérents ;
- nombre exact de bougies du calendrier.

Aucune interpolation.

## Sécurité

- PAPER ONLY ;
- zéro ordre réel ;
- zéro clé exchange ;
- aucun fichier du workspace propriétaire ;
- aucune modification du runtime V4.6.2.

## Règle de lecture

Si un seul mois échoue au gate strict, le bloc continu 2026 doit être traité comme incomplet jusqu'à décision explicite.

**Le bloc 2026 doit confirmer une hypothèse, jamais la fabriquer.**
