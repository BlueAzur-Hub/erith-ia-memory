# SEVEN HEAVEN · Strategy Lab — Donchian 55/20 4h · BTC/USDT Jan–Oct 2026

**Date UTC :** 2026-11-16  
**Statut :** replay pré-enregistré terminé  
**Source :** Binance Spot BTC/USDT 1h · janvier à octobre 2026  
**Data Gate :** 10/10 mois certifiés · 7 296 bougies 1h continues · 1 824 bougies 4h  
**Stratégie :** Donchian 55/20 4h inchangé  
**Mode :** PAPER only · zéro ordre réel

## Résultats

| Scénario | Rendement | Drawdown max | Fills | Frais |
|---|---:|---:|---:|---:|
| Zéro friction | **-1,84 %** | -16,62 % | 22 | 0 |
| Coûts base | **-5,03 %** | -17,37 % | 22 | 208,69 USDT |
| Coûts ×2 | **-8,11 %** | -18,11 % | 22 | 410,49 USDT |

- 11 achats
- 11 ventes
- aucun inventaire ouvert en fin de période.

## Lecture

Le signe est négatif **avant même les coûts** :

- zéro friction : -1,84 %
- coûts de base : -5,03 %

Le problème principal est donc le comportement du signal/régime sur cette période, pas seulement la friction.

La faible fréquence continue de protéger Donchian contre l'érosion extrême observée sur EMA/MACD/SAR 1h, mais elle ne garantit pas un rendement positif.

## Place dans l'historique Donchian

BTC/USDT :

- 2019 Jan–Fév : +2,69 %
- 2019 Sep–Oct : -0,74 %
- 2020 Jul–Oct : +42,30 %
- 2021 Mai–Juil : +5,95 %
- 2021 Oct–Nov : -6,77 %
- 2024 : +71,39 %
- 2025 : +8,12 %
- 2026 Jan–Oct : **-5,03 %**

Donchian 55/20 4h reste intéressant, mais la nouvelle période confirme sa dépendance au régime.

## Décision

- ne pas modifier 55/20 ;
- ne pas ajouter un filtre pour réparer 2026 ;
- ne pas intégrer au runtime ;
- conserver la période négative dans toute synthèse future.

La prochaine question utile est de savoir si **2026 est hostile à Donchian sur plusieurs actifs**, ou si l'échec est spécifique au BTC.

Une éventuelle extension 2026 multi-actif doit conserver exactement la même règle et fixer les actifs avant résultat.

**Nouvelle période, résultat négatif, candidat conservé comme objet de recherche — pas comme stratégie validée.**
