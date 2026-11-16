# SEVEN HEAVEN · Strategy Lab — SAR parabolique 0,02 / 0,20 · Résultats

**Date UTC :** 2026-11-16  
**Statut :** expérience pré-enregistrée exécutée  
**Source :** Binance Spot BTC/USDT certifié 2024–2025  
**Runtime V4.6.2 :** non modifié  
**Mode :** PAPER only

## Paramètres

- AF initial / incrément : 0,02 ;
- AF maximum : 0,20 ;
- aucun filtre ;
- next-bar-open ;
- coûts Lab inchangés ;
- horizons 1h et 4h déclarés avant résultat.

## 2024 — research replay

| Horizon | Zéro friction | Coûts base | Coûts ×2 | Fills | Frais base | DD base |
|---|---:|---:|---:|---:|---:|---:|
| 1h | +52,63 % | −45,45 % | −80,51 % | 686 | 5 704,98 USDT | −54,41 % |
| 4h | **+80,91 %** | **+39,56 %** | **+7,67 %** | 173 | 1 846,39 USDT | −33,69 % |

## 2025 — known-market validation

| Horizon | Zéro friction | Coûts base | Coûts ×2 | Fills | Frais base | DD base |
|---|---:|---:|---:|---:|---:|---:|
| 1h | +7,63 % | −63,45 % | −87,59 % | 720 | 4 582,38 USDT | −64,83 % |
| 4h | **−30,30 %** | **−47,74 %** | −60,82 % | 192 | 1 446,90 USDT | −52,24 % |

## Lecture

### 1h

Le signal brut reste positif sur les deux années, mais la fréquence est extrême :

- 686 fills en 2024 ;
- 720 fills en 2025.

Les frictions suffisent à renverser complètement les résultats. Sous les hypothèses actuelles du Lab, SAR 1h est économiquement non viable.

### 4h

La cadence baisse fortement.

En 2024, SAR 4h conserve un avantage important même avec coûts et reste positif sous stress ×2.

En 2025, le signal lui-même devient mauvais : −30,30 % sans friction. La perte n'est donc pas réparable par une simple baisse des coûts.

## Décision

Ne pas ajuster l'AF après lecture.

Le SAR rejoint MACD et SuperTrend sur une conclusion générale :

> une fréquence plus lente peut rendre les coûts acceptables, mais aucune de ces stratégies directionnelles ne résout seule le changement de régime 2025.

La prochaine famille doit donc être étudiée indépendamment, sans chercher à « sauver » SAR.

**SAR 1h : trop actif. SAR 4h : viable en coûts, instable en régime.**
