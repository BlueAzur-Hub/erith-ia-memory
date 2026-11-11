# Seven Heaven — Donchian 55 : vérification indépendante OKX BTC/USDC

Étude du 11 novembre 2026. Recherche historique uniquement, aucun ordre réel.

## Sources et règles inchangées

- Binance Spot BTC/USDT : 3 075 bougies, archive SHA-256 vérifiée.
- OKX Spot BTC/USDC : bougies 1Dutc confirmées, collecte publique sans API privée, période du 2025-08-21 au 2026-11-10.
- Les deux devises de cotation sont différentes (USDT et USDC).
- Entrée si clôture au-dessus du plus haut des 55 jours précédents ; sortie si clôture sous le plus bas des 20 jours précédents ; stop suiveur à 3 fois ATR14, durée maximale 120 jours.
- Capital fictif 1 000 unités, 25 % des liquidités engagées à chaque entrée, sans levier.
- Coûts : frais 0,10 % et glissement fictif 0,05 % par côté ; stress à coûts doublés.
- Vérification préalable automatique : les résultats canoniques Binance 2019–septembre 2026 sont reproduits à 100 % et à 25 %, dont les 29 transactions.

## Résultats comparés

| Source | Fenêtre | Opérations | Rendement net Donchian 25 % | Baisse maximale quotidienne | Acheter et conserver 25 % | Donchian 25 % coûts doublés |
|---|---|---:|---:|---:|---:|---:|
| OKX | overlap (183 jours) | 3 | +0.811 % | -2.916 % | +5.580 % | +0.583 % |
| OKX | recent (41 jours) | 0 | +0.000 % | 0.000 % | -3.010 % | +0.000 % |
| OKX | combined (224 jours) | 3 | -0.261 % | -3.919 % | +1.974 % | -0.485 % |
| BINANCE | overlap (183 jours) | 3 | +0.843 % | -2.894 % | +5.524 % | +0.615 % |

## Concordance des signaux Binance / OKX

- 183 jours en commun ; 0 divergences de signaux de cassure journalière.
- Dates précises des divergences et données OKX conservées dans le JSON partagé.

## Limites

- Ces résultats ne sont pas une validation prospective aveugle.
- Peu de transactions sur une fenêtre courte ne prouvent aucune fiabilité future.
- Les stops simulés sur bougies quotidiennes ne garantissent aucune exécution réelle.
- Un bilan en fin de fenêtre impose une liquidation fictive pour comparer les études, sans recommander une vente réelle.
- Le plan Swing Trading / Buy & Hold personnel reste indépendant de ce laboratoire.
- Aucun changement à Administrator, Trader, Operator, Bridge ou aux actifs du compte.

## Fichiers

- Programme : SEVEN_HEAVEN_DONCHIAN55_OKX_INDEPENDENT_VALIDATION_2026_11_11.py
- Données et transactions : SEVEN_HEAVEN_DONCHIAN55_OKX_INDEPENDENT_VALIDATION_2026_11_11.json
