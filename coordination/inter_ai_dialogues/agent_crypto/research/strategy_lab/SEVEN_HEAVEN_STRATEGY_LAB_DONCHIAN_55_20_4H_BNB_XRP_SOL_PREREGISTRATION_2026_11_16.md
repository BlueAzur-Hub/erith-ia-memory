# SEVEN HEAVEN · Strategy Lab — Donchian 55/20 4h · Panier multi-actif BNB/XRP/SOL

**Date :** 2026-11-16  
**Statut :** protocole gelé avant lecture des résultats BNB/XRP/SOL  
**Stratégie :** Donchian 55/20 4h inchangé  
**Actifs fixés avant résultat :** BNB/USDT, XRP/USDT, SOL/USDT  
**Source :** Binance Spot public monthly 1h, 2024–2025  
**Mode :** PAPER only

## 1. But

Après BTC/USDT et ETH/USDT, cette étude étend la falsification à trois autres grands actifs déjà présents dans le Top 5 du cockpit utilisateur.

Le panier est fixé **avant** lecture de ses résultats :

1. BNB/USDT ;
2. XRP/USDT ;
3. SOL/USDT.

Aucun actif ne sera retiré parce que son résultat est mauvais.

## 2. Variable unique

La stratégie ne change pas :

- entrée : clôture > plus haut des 55 bougies 4h précédentes ;
- sortie : clôture < plus bas des 20 bougies 4h précédentes ;
- timeframe : 4h ;
- capital : 10 000 USDT par actif et par année indépendante ;
- frais : 0,10 % / côté ;
- glissement : 0,05 % / côté ;
- spot long-only ;
- next-bar-open ;
- aucun filtre ;
- aucun tuning ;
- aucune liquidation forcée de fin.

Seul l'actif change.

## 3. Data Gate obligatoire

Pour chaque actif, les 24 mois 2024–2025 doivent d'abord passer :

- ZIP officiel Binance ;
- `.CHECKSUM` officiel correspondant ;
- SHA-256 concordant ;
- une seule entrée CSV sûre ;
- schéma 12 colonnes ;
- OHLC cohérents ;
- volume non négatif ;
- ordre horaire strict ;
- zéro trou ;
- zéro doublon ;
- compte exact du calendrier ;
- millisecondes en 2024 ;
- microsecondes en 2025 ;
- continuité inter-mois.

Si une source échoue, aucune performance n'est inventée pour cette fenêtre.

## 4. Fenêtres

Pour chaque actif dont les 24 mois passent :

- 2024 ;
- 2025.

Chaque année repart de 10 000 USDT et zéro inventaire.

## 5. Scénarios de coût

- zéro friction ;
- coûts de base ;
- coûts ×2.

## 6. Critère d'interprétation

Cette étude cherche à falsifier le candidat, pas à maximiser un classement.

Résultat possible :

- positif sur les trois actifs : renforcement du candidat, sans preuve future ;
- mixte : sensibilité à l'actif ;
- négatif sur plusieurs actifs : limite importante du candidat ;
- source rejetée : donnée insuffisante, pas résultat de stratégie.

Les résultats BTC et ETH déjà connus restent visibles, mais ne changent pas le panier.

## 7. Stop Gate

Après résultat :

- ne pas modifier 55/20 ;
- ne pas changer 4h ;
- ne pas supprimer un actif défavorable ;
- ne pas créer un score de sélection après coup ;
- ne pas intégrer au runtime stable ;
- ne pas créer V4.7 automatiquement.

**Même règle. Trois actifs fixés. Tous les résultats conservés.**
