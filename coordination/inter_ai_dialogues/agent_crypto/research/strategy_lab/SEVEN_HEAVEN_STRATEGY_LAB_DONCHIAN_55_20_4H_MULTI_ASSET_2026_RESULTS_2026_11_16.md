# SEVEN HEAVEN · Strategy Lab — Donchian 55/20 4h · Panel 2026 BTC/ETH/BNB/XRP/SOL

**Date UTC :** 2026-11-16  
**Statut :** falsification multi-actif 2026 terminée  
**Période :** janvier → octobre 2026  
**Stratégie :** Donchian 55/20 4h inchangé  
**Mode :** PAPER only · zéro ordre réel

## Data Gate

- BTC : 10/10 mois certifiés
- ETH : 10/10
- BNB : 10/10
- XRP : 10/10
- SOL : 10/10

Pour chaque actif :
- 7 296 bougies 1h continues
- 1 824 bougies 4h
- timestamps microsecondes
- aucune interpolation
- aucun mois rejeté

## Résultats 2026

| Actif | Zéro friction | Coûts base | Coûts ×2 | Fills | DD base |
|---|---:|---:|---:|---:|---:|
| BTC/USDT | -1,84 % | **-5,03 %** | -8,11 % | 22 | -17,37 % |
| ETH/USDT | -15,15 % | **-17,91 %** | -20,57 % | 22 | -22,42 % |
| BNB/USDT | -25,50 % | **-28,78 %** | -31,91 % | 30 | -29,71 % |
| XRP/USDT | -27,84 % | **-30,19 %** | -32,45 % | 22 | -36,40 % |
| SOL/USDT | -8,33 % | **-11,30 %** | -14,18 % | 22 | -40,12 % |

## Lecture

Les cinq actifs sont négatifs **avant même les frais et le glissement**.

Le classement des pertes change selon l'actif, mais le signe ne change pas :

- BTC : -1,84 % sans friction
- SOL : -8,33 %
- ETH : -15,15 %
- BNB : -25,50 %
- XRP : -27,84 %

Les coûts aggravent les pertes mais ne sont pas la cause fondamentale.

## Ce que cela change dans l'évaluation Donchian

### 2024–2025

Donchian 55/20 4h avait produit :
- BTC : 2/2 années positives
- ETH : 2/2
- BNB : 1/2
- XRP : 1/2
- SOL : 1/2

Soit 7/10 fenêtres annuelles positives.

### Jan–Oct 2026

- BTC : négatif
- ETH : négatif
- BNB : négatif
- XRP : négatif
- SOL : négatif

Soit **0/5** sur le nouveau panel 2026.

Ce contraste est une falsification forte de toute lecture « Donchian robuste sur plusieurs actifs ».

## Conclusion scientifique

Donchian 55/20 4h est une stratégie de **capture de tendance dépendante du régime** :

- faible rotation ;
- coûts généralement secondaires ;
- quelques longues tendances gagnantes peuvent payer de nombreux faux breakouts ;
- mais un régime défavorable peut rendre le modèle négatif sur plusieurs actifs simultanément.

Les résultats 2026 montrent que diversifier les actifs ne suffit pas quand le mécanisme de stratégie est exposé au même type de régime.

## Décision

- arrêter le tuning Donchian à ce stade ;
- conserver 55/20 comme référence trend-following du Lab ;
- ne pas créer un filtre post-hoc pour réparer 2026 ;
- ne pas intégrer au runtime stable ;
- passer à une autre famille de stratégie afin d'élargir l'apprentissage.

**Donchian a appris quelque chose au Lab : une bonne stratégie de tendance n'est pas une stratégie tous-régimes.**
