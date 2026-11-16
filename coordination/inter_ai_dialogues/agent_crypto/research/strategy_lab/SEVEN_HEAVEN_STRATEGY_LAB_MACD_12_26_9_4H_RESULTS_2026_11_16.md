# SEVEN HEAVEN · Strategy Lab — MACD 12/26/9 · Résultat 4h

**Date UTC :** 2026-11-16  
**Statut :** expérience 4h pré-enregistrée exécutée  
**Source :** Binance Spot BTC/USDT certifié 2024–2025, agrégé de 1h vers 4h  
**Intégration runtime :** non  
**Mode :** PAPER only

## Paramètres inchangés

- MACD 12 / 26 / signal 9 ;
- capital 10 000 USDT ;
- frais 0,10 %/côté ;
- glissement 0,05 %/côté ;
- long-only ;
- next-bar-open ;
- aucun filtre ajouté.

Seule variable changée par rapport à l'expérience précédente : **1h → 4h**.

## Résultats

| Fenêtre | Zéro friction | Coûts de base | Coûts ×2 | Fills | Frais de base | DD base |
|---|---:|---:|---:|---:|---:|---:|
| 2024 research replay | +49,74 % | **+15,51 %** | −10,89 % | 173 | 1 755,38 USDT | −36,51 % |
| 2025 known-market validation | **−17,87 %** | **−36,17 %** | −50,39 % | 168 | 1 394,98 USDT | −40,77 % |

2024 : 87 achats, 86 ventes, inventaire ouvert en fin de fenêtre.  
2025 : 84 achats, 84 ventes, aucun inventaire final.

## Comparaison avec MACD 1h

| Fenêtre | MACD 1h net | MACD 1h zéro friction | Fills 1h | MACD 4h net | MACD 4h zéro friction | Fills 4h |
|---|---:|---:|---:|---:|---:|---:|
| 2024 | −53,40 % | +26,17 % | 664 | **+15,51 %** | **+49,74 %** | 173 |
| 2025 | −60,16 % | +7,86 % | 664 | **−36,17 %** | **−17,87 %** | 168 |

## Lecture

Le passage 1h → 4h réduit la rotation d'environ trois quarts et améliore fortement le résultat net sous coûts.

En 2024, cela suffit pour rendre le MACD positif avec les hypothèses de coût du Lab.

En 2025, la réduction des coûts améliore le résultat, mais le scénario zéro-friction devient lui-même négatif. Le problème n'est donc plus seulement la friction : le signal MACD 12/26/9 sur 4h est défavorable sur cette année.

## Décision

Ne pas chercher maintenant un couple MACD « magique » en optimisant 12/26/9 après lecture des résultats.

Le MACD a apporté sa leçon :

- 1h : signal brut positif mais suractivité extrême ;
- 4h : fréquence plus saine, résultat 2024 positif, mais robustesse inter-régime insuffisante.

La famille reste intéressante pour une future étude de **filtre de régime**, mais un tel filtre serait une nouvelle hypothèse et devra être évalué séparément.

La prochaine famille indépendante peut maintenant être étudiée : **SuperTrend**, sans intégrer MACD au runtime V4.6.2.

**Réduire la fréquence aide. Cela ne transforme pas un signal instable en stratégie robuste.**
