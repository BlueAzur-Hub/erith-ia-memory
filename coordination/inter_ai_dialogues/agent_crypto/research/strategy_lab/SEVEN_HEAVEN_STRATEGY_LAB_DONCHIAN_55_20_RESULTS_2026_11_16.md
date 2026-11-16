# SEVEN HEAVEN · Strategy Lab — Donchian 55/20 · Résultats 1h et 4h

**Date UTC :** 2026-11-16  
**Statut :** expérience pré-enregistrée exécutée  
**Source :** Binance Spot BTC/USDT certifié 2024–2025  
**Runtime V4.6.2 :** non modifié  
**Mode :** PAPER only

## Règle testée

- entrée : clôture au-dessus du plus haut des 55 bougies précédentes ;
- sortie : clôture sous le plus bas des 20 bougies précédentes ;
- canal ne contenant jamais la bougie signal ;
- fill hypothétique à l'ouverture suivante ;
- capital 10 000 USDT ;
- frais 0,10 % / côté ;
- glissement 0,05 % / côté ;
- 1h et 4h déclarés avant résultat.

## 2024 — research replay

| Horizon | Zéro friction | Coûts base | Coûts ×2 | Fills | Frais base | DD base |
|---|---:|---:|---:|---:|---:|---:|
| 1h | +46,61 % | +22,64 % | +2,59 % | 119 | 1 318,70 USDT | −22,29 % |
| 4h | **+78,74 %** | **+71,39 %** | **+64,34 %** | **28** | **428,80 USDT** | **−21,90 %** |

## 2025 — known-market validation

| Horizon | Zéro friction | Coûts base | Coûts ×2 | Fills | Frais base | DD base |
|---|---:|---:|---:|---:|---:|---:|
| 1h | −4,94 % | −20,60 % | −33,68 % | 120 | 1 088,98 USDT | −25,80 % |
| 4h | **+12,08 %** | **+8,12 %** | **+4,30 %** | **24** | **260,02 USDT** | **−11,48 %** |

## Lecture

Donchian 55/20 4h est la première stratégie active de ce lot à rester positive, avec les coûts du Lab, sur les deux années testées.

Elle présente également :

- une fréquence faible ;
- une érosion par friction limitée ;
- un drawdown 2025 inférieur à celui des autres stratégies directionnelles étudiées ;
- un résultat encore positif avec coûts ×2 sur les deux années.

### Comparaison avec les références 2025

Sur 2025 :

- CASH : 0 %
- Hold 50 % : −3,24 %
- Hold 100 % : −6,48 %
- DCA : −9,37 %
- SuperTrend 20/4 4h : −11,26 %
- Donchian 55/20 4h : **+8,12 %**

Cette comparaison reste descriptive : les familles n'ont pas toutes été conçues ou sélectionnées au même moment.

## Limite cruciale

2025 n'est plus un holdout untouched.

Le marché 2025 a déjà été observé pendant les baselines, MACD, SuperTrend et SAR avant l'exécution Donchian.

Il serait donc méthodologiquement faux d'annoncer :

- « Donchian validé hors échantillon » ;
- « stratégie robuste » ;
- « stratégie profitable » ;
- « avantage futur démontré ».

Le résultat autorise uniquement une **contre-épreuve sur des données non encore utilisées pour cette règle**.

## Décision scientifique

Ne pas optimiser 55/20.

Ne pas ajouter un filtre.

Ne pas intégrer au runtime.

La prochaine action est prioritaire sur toute nouvelle famille :

> rejouer Donchian 55/20 4h, exactement inchangé, sur plusieurs blocs continus strictement certifiés de 2019–2021, avec capital neuf pour chaque bloc.

Ces blocs doivent être choisis **avant lecture de leurs résultats**.

**Donchian 55/20 4h est un candidat de recherche. Pas encore une conclusion.**
