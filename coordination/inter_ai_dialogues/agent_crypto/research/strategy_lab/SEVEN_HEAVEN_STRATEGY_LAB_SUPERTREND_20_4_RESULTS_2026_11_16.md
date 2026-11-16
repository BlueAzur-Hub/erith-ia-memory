# SEVEN HEAVEN · Strategy Lab — SuperTrend 20/4 · Résultats 1h et 4h

**Date UTC :** 2026-11-16  
**Statut :** expérience pré-enregistrée exécutée  
**Source :** Binance Spot BTC/USDT certifié 2024–2025  
**Runtime V4.6.2 :** non modifié  
**Mode :** PAPER only

## Règle testée

- ATR Wilder 20 ;
- multiplicateur 4 ;
- entrée sur basculement baissier → haussier ;
- sortie sur basculement haussier → baissier ;
- aucun filtre de distance ;
- aucun RSI / volume ;
- next-bar-open ;
- coûts du Lab inchangés.

Les horizons 1h et 4h ont été déclarés avant lecture des résultats.

## Résultats

### 2024 — research replay

| Horizon | Zéro friction | Coûts de base | Coûts ×2 | Fills | Frais base | DD base |
|---|---:|---:|---:|---:|---:|---:|
| 1h | +38,76 % | +12,98 % | −8,01 % | 137 | 1 286,39 USDT | −36,12 % |
| 4h | **+57,36 %** | **+49,09 %** | **+41,25 %** | **36** | **443,06 USDT** | −30,10 % |

### 2025 — known-market validation

| Horizon | Zéro friction | Coûts de base | Coûts ×2 | Fills | Frais base | DD base |
|---|---:|---:|---:|---:|---:|---:|
| 1h | −30,95 % | −44,61 % | −55,57 % | 147 | 1 171,43 USDT | −49,62 % |
| 4h | **−6,90 %** | **−11,26 %** | −15,42 % | **32** | **294,13 USDT** | −38,24 % |

## Lecture

Le passage 1h → 4h améliore simultanément :

- la fréquence ;
- les frais ;
- le rendement 2024 ;
- la résistance au stress de coûts ;
- le résultat 2025, même s'il reste négatif.

Le SuperTrend 20/4 4h ne souffre donc pas principalement d'une suractivité comparable au MACD 1h.

En 2025, il perd déjà −6,90 % sans friction : le défaut restant est surtout directionnel / de régime.

## Comparaison qualitative

Le SuperTrend 4h est, parmi les stratégies techniques testées jusqu'ici, l'une des plus économiquement propres sur 2024 :

- peu de transactions ;
- faible érosion par friction relative ;
- résultat encore positif avec coûts ×2.

Mais il ne bat pas la règle fondamentale de robustesse : **il ne reste pas positif sur 2025**.

## Décision

Ne pas tuner 20/4 après ce résultat.

Le filtre « distance au SuperTrend < 1 % » existe déjà dans la piste externe étudiée avant cette expérience. Il pourra être testé plus tard comme **nouvelle expérience explicitement séparée**, sans prétendre qu'il s'agit d'un holdout.

La prochaine famille indépendante reste SAR parabolique ou Donchian selon le protocole de recherche.

**SuperTrend 4h réduit le problème de friction. Il ne supprime pas le problème de régime.**
