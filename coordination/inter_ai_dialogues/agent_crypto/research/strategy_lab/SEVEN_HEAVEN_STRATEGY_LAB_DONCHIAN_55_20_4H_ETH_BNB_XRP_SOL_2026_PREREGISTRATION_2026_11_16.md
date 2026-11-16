# SEVEN HEAVEN · Strategy Lab — Donchian 55/20 4h · ETH/BNB/XRP/SOL Jan–Oct 2026

**Date :** 2026-11-16  
**Statut :** protocole gelé avant lecture des résultats  
**Stratégie :** Donchian 55/20 4h inchangé  
**Actifs fixés avant résultat :** ETH/USDT, BNB/USDT, XRP/USDT, SOL/USDT  
**Source :** Binance Spot public monthly 1h · janvier à octobre 2026  
**Mode :** PAPER only

## 1. But

Après le replay BTC 2026 négatif, vérifier si le comportement est spécifique au BTC ou partagé par d'autres grands actifs.

Les quatre actifs sont fixés avant lecture :
1. ETH/USDT
2. BNB/USDT
3. XRP/USDT
4. SOL/USDT

Aucun actif ne sera retiré après résultat.

## 2. Règle inchangée

- entrée : clôture > plus haut des 55 bougies 4h précédentes ;
- sortie : clôture < plus bas des 20 bougies 4h précédentes ;
- signal sur bougie clôturée ;
- fill PAPER à l'ouverture suivante ;
- capital : 10 000 USDT par actif ;
- frais : 0,10 % / côté ;
- glissement : 0,05 % / côté ;
- long-only ;
- aucun filtre ;
- aucun tuning ;
- aucune liquidation forcée de fin.

## 3. Data Gate

Pour chaque actif, les dix mois janvier→octobre 2026 doivent passer :

- ZIP + .CHECKSUM officiels ;
- SHA-256 ;
- une entrée CSV sûre ;
- 12 colonnes ;
- OHLC cohérents ;
- timestamps microsecondes ;
- ordre horaire strict ;
- zéro trou ;
- zéro doublon ;
- compte exact du calendrier ;
- continuité inter-mois.

Un actif dont la source échoue ne reçoit aucun résultat inventé.

## 4. Scénarios

- zéro friction ;
- coûts de base ;
- coûts ×2.

## 5. Interprétation

Le but est de falsifier, pas de sélectionner l'actif qui plaît.

- 4/4 positifs : renforcement du candidat sur 2026 ;
- résultat mixte : dépendance à l'actif ;
- plusieurs négatifs : fragilité 2026 généralisée ;
- négatif même à zéro friction : problème de signal/régime ;
- positif sans friction mais négatif net : friction flip.

## 6. Stop Gate

- aucun changement de 55/20 ;
- aucun changement de 4h ;
- aucun actif supprimé ;
- aucun score optimisé après résultat ;
- aucune intégration runtime automatique.

**Même stratégie. Quatre actifs fixés. Tous les résultats conservés.**
