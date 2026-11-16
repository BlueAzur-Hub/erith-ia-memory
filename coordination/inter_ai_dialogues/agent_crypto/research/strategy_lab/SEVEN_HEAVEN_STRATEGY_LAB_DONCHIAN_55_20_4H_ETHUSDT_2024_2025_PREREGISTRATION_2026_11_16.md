# SEVEN HEAVEN · Strategy Lab — Donchian 55/20 4h · Validation multi-actif ETH/USDT

**Date :** 2026-11-16  
**Statut :** protocole gelé avant lecture des résultats ETH  
**Stratégie :** Donchian 55/20 4h inchangé  
**Nouvelle variable unique :** BTC/USDT → ETH/USDT  
**Source :** Binance Spot public monthly 1h, 2024–2025  
**Mode :** PAPER only

## 1. But

Donchian 55/20 4h a montré des résultats intéressants sur BTC/USDT, mais une stratégie qui ne fonctionne que sur un seul actif peut simplement exploiter une particularité de cet actif.

Cette étude change uniquement le marché :

- BTC/USDT → **ETH/USDT**.

La logique, les paramètres, les coûts et le timeframe restent identiques.

## 2. Data Gate obligatoire

Avant tout calcul de performance, les 24 archives mensuelles ETHUSDT 1h de 2024–2025 doivent être certifiées avec les mêmes exigences que BTC :

- ZIP officiel Binance ;
- fichier `.CHECKSUM` correspondant ;
- SHA-256 concordant ;
- une seule entrée CSV sûre ;
- 12 colonnes ;
- OHLC cohérents ;
- volume non négatif ;
- ordre strict des bougies ;
- aucune heure manquante ou dupliquée ;
- compte exact du calendrier ;
- millisecondes en 2024 ;
- microsecondes en 2025 ;
- continuité entre mois.

Si un mois échoue, l'année continue n'est pas reconstruite artificiellement.

## 3. Stratégie verrouillée

- entrée : clôture > plus haut des 55 bougies 4h précédentes ;
- sortie : clôture < plus bas des 20 bougies 4h précédentes ;
- timeframe : 4h ;
- capital : 10 000 USDT ;
- frais : 0,10 % / côté ;
- glissement : 0,05 % / côté ;
- spot long-only ;
- next-bar-open ;
- aucune liquidation forcée ;
- aucun filtre.

## 4. Fenêtres

Si le Data Gate est complet :

- ETH/USDT 2024 ;
- ETH/USDT 2025.

Chaque année repart de 10 000 USDT et zéro ETH.

## 5. Scénarios de coût

- zéro friction ;
- coûts de base ;
- coûts ×2.

## 6. Interprétation

Résultat positif sur ETH ne prouverait pas une robustesse future.

Résultat négatif ne supprimerait pas les résultats BTC ; il montrerait une dépendance à l'actif.

La question est uniquement :

> le comportement Donchian 55/20 4h observé sur BTC se reproduit-il sur un second grand marché spot avec exactement la même règle ?

## 7. Stop Gate

- aucun tuning ETH ;
- aucune longueur spécifique à ETH ;
- ne pas retirer une année négative ;
- ne pas mélanger BTC et ETH dans un même portefeuille ;
- aucune intégration runtime automatique.

**Même stratégie. Même coût. Même horizon. Un autre actif.**
