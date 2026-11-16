# SEVEN HEAVEN · Strategy Lab — Donchian 55/20 4h · ETH/USDT 2024–2025

**Date UTC :** 2026-11-16  
**Statut :** validation multi-actif pré-enregistrée exécutée  
**Source :** Binance Spot ETH/USDT 1h, archives mensuelles publiques officielles  
**Data Gate :** **24/24 mois certifiés, 0 rejet**  
**Runtime V4.6.2 :** non modifié  
**Mode :** PAPER only

## 1. Data Gate

Les 24 mois ETHUSDT de janvier 2024 à décembre 2025 ont été téléchargés avec leurs `.CHECKSUM` et contrôlés avec le validateur multi-actif de recherche.

Contrôles :

- SHA-256 du ZIP ;
- nom du ZIP et du CSV ;
- une seule entrée sûre ;
- schéma 12 colonnes ;
- OHLC cohérents ;
- volume non négatif ;
- ordre strict des heures ;
- zéro trou ;
- zéro doublon ;
- compte exact du calendrier ;
- millisecondes en 2024 ;
- microsecondes en 2025 ;
- continuité inter-mois.

Bougies :

- 2024 : 8 784 bougies 1h → 2 196 bougies 4h ;
- 2025 : 8 760 bougies 1h → 2 190 bougies 4h.

Aucune interpolation.

## 2. Donchian inchangé

- entrée 55 ;
- sortie 20 ;
- 4h ;
- capital 10 000 USDT par année indépendante ;
- frais 0,10 % / côté ;
- glissement 0,05 % / côté ;
- long-only ;
- next-bar-open ;
- aucun filtre ;
- aucun tuning ETH.

## 3. Résultats ETH/USDT

| Année | Zéro friction | Coûts base | Coûts ×2 | Fills | Frais base | DD base |
|---|---:|---:|---:|---:|---:|---:|
| 2024 | +54,65 % | **+48,73 %** | **+43,05 %** | 26 | 356,05 USDT | −27,85 % |
| 2025 | +22,36 % | **+18,04 %** | **+13,86 %** | 24 | 290,01 USDT | −31,89 % |

Les deux années se terminent sans inventaire ouvert.

## 4. Comparaison descriptive avec BTC/USDT

### 2024
- BTC Donchian 55/20 4h : +71,39 %
- ETH Donchian 55/20 4h : +48,73 %

### 2025
- BTC : +8,12 %
- ETH : +18,04 %

Dans les quatre fenêtres annuelles BTC/ETH 2024–2025, Donchian 55/20 4h reste positif avec les coûts de base.

Il reste également positif sous coûts ×2 dans les quatre fenêtres.

## 5. Limites

Cela ne prouve pas une robustesse générale.

Les marchés 2024–2025 ne sont pas des holdouts inconnus après toutes les recherches précédentes.

Les deux actifs sont fortement corrélés à l'écosystème crypto et ne représentent pas des univers indépendants.

Les résultats historiques ne prouvent aucune performance future.

## 6. État du candidat

Avec les cinq blocs BTC anciens et les quatre fenêtres annuelles BTC/ETH récentes :

- BTC ancien : 3 blocs positifs / 5 ;
- BTC 2024–2025 : 2 / 2 positifs ;
- ETH 2024–2025 : 2 / 2 positifs.

Donchian reste donc **candidat prioritaire de recherche**, pas stratégie validée.

## 7. Prochaine falsification

Avant toute intégration :

- étendre le test à un petit panier d'actifs fixé avant résultat ;
- conserver 55/20 et 4h inchangés ;
- certifier chaque source avant simulation ;
- conserver les échecs ;
- ne créer aucun score composite après coup.

**Le passage BTC → ETH ne casse pas Donchian 55/20 4h. Il faut maintenant vérifier si cela tient au-delà de ces deux actifs.**
