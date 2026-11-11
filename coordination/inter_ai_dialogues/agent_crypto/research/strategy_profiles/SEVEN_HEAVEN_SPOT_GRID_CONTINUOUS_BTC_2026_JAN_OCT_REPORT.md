# Seven Heaven — Replay continu du Spot Grid BTC (janvier–octobre 2026)

**Statut :** étude rétrospective PAPER, capital fictif conservé, aucun ordre réel.
**Source :** dix ZIP mensuels Binance Spot BTC/USDT 1 minute, tous contrôlés par SHA-256 du Coffre.
**Couverture vérifiée :** 437 760 minutes / 304 journées UTC ; aucune lacune, aucun doublon.

## Résultats — valeur nette liquidable du portefeuille

| Scénario | Valeur finale (USDT) | Rendement | Pire baisse quotidienne | Achats fictifs | Ventes fictives |
|---|---:|---:|---:|---:|---:|
| GRID_FIXED_TOUCH | 963.53 | -3.65% | -31.60% | 36 | 31 |
| GRID_MONTHLY_RESET_TOUCH | 816.59 | -18.34% | -27.82% | 119 | 117 |
| GRID_FIXED_CLOSE | 962.15 | -3.79% | -31.59% | 35 | 30 |
| GRID_MONTHLY_RESET_CLOSE | 805.77 | -19.42% | -28.17% | 111 | 109 |
| HOLD_50 | 941.25 | -5.88% | -20.73% | — | — |
| HOLD_100 | 882.50 | -11.75% | -39.53% | — | — |
| GRID_COSTS_X2_FIXED_TOUCH | 951.44 | -4.86% | -31.94% | 36 | 31 |
| GRID_COSTS_X2_MONTHLY_RESET_TOUCH | 775.20 | -22.48% | -29.99% | 119 | 117 |
| GRID_COSTS_X2_FIXED_CLOSE | 950.33 | -4.97% | -31.94% | 35 | 30 |
| GRID_COSTS_X2_MONTHLY_RESET_CLOSE | 766.88 | -23.31% | -30.27% | 111 | 109 |

## Règles fixées sans connaissance du futur

- Janvier : 1 000 USDT, moitié BTC, moitié liquidités ; dix intervalles arithmétiques de 2% autour du cours initial, bornes ±10%.
- Grille fixe : bornes conservées pendant 304 jours, même lorsque le prix sort de la grille.
- Grille réajustée : réinitialisation le premier jour de chaque mois UTC au prix d’ouverture, liquidation des BTC restants et réallocation 50/50 ; neuf changements.
- TOUCH : plus haut/plus bas déclenche un remplissage hypothétique. CLOSE : clôture franchissant un seuil. Dans les deux cas, la limite est utilisée comme prix fictif de transaction.
- Pour chaque lot : maximum une exécution fictive par minute, jamais achat et vente du même lot dans la même bougie.
- Frais standard 0,10% par côté + glissement 0,05% par côté ; stress = 0,20% + 0,10%.
- Valorisation quotidienne nette des frais estimés de liquidation du BTC détenu. Aucun apport supplémentaire, aucun levier, aucun compte.

## Limites

- Un prix touché ne garantit pas un ordre limite exécuté. Les modèles TOUCH et CLOSE ne sont ni des bornes probabilistes, ni des preuves de profit.
- Un gap peut provoquer une exécution simulée au seuil alors que le meilleur prix exécutable serait différent.
- Le prix de marché et les frais de Binance Spot BTC/USDT ne sont pas exactement ceux du compte OKX BTC/USDC.
- Les réajustements mensuels ont été imposés avant lecture du résultat, mais le choix de ces deux politiques n’est pas optimisé ou validé hors échantillon.
- La pire baisse est mesurée à la clôture de chaque journée, pas intra-minute.
- Carnets, minimums de trading, volume réellement disponible, imposition et incidents de marché non modélisés.

## Reproductibilité

- Registre original : https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/calendar_year_hourly_shards/index.json
- Étude précédente : SEVEN_HEAVEN_SPOT_GRID_NATIVE_MINUTE_BTC_INVENTORY_REPLAY_2026_11_11
- JSON produit : `SEVEN_HEAVEN_SPOT_GRID_CONTINUOUS_BTC_2026_JAN_OCT_PROOFS.json`
- Courbes quotidiennes : `SEVEN_HEAVEN_SPOT_GRID_CONTINUOUS_BTC_2026_JAN_OCT_EQUITY_DAILY.csv`
- Script autonome : `SEVEN_HEAVEN_SPOT_GRID_BTC_2026_JAN_OCT_CONTINUOUS_REPLAY.py`

**Verdict :** les résultats sont expérimentaux ; les stratégies réelles nécessitent validation des exécutions avant toute conclusion pratique.
