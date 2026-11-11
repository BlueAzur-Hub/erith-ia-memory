# Seven Heaven — Rééquilibrage BTC / ETH / liquidités et qualification du VWAP

Étude du 11 novembre 2026. Binance Spot BTC/USDT et ETH/USDT. Portefeuilles fictifs ; aucune connexion de compte.

## Sources contrôlées

- Coffre public : calendar_year_hourly_shards/index.json et six fichiers .json.gz (BTC, ETH ; 2024, 2025, janvier–octobre 2026).
- Taille et SHA-256 de chaque shard vérifiés contre l'index, identité Binance Spot / USDT, mois natifs documentés.
- 24 840 heures sans trou par actif, horodatages exactement identiques entre BTC et ETH : 1 035 journées du 1er janvier 2024 au 31 octobre 2026.
- Volumes base/quote et OHLC vérifiés, sans interpolation, aucun prix novembre 2026.
- SHA-256 de l'index : d9614ca008077222446ad8d46c64bcc664ba737ceebcaccf4e1ad0a59f58f81d

## Comparaison fixée avant le calcul

- Capital initial : 1 000 USDT fictifs ; panier 50 % BTC, 25 % ETH, 25 % liquidités, acheté au premier open UTC.
- Référence passive : mêmes quantités conservées jusqu'au 31 octobre 2026.
- Méthodes actives : rétablir les poids 50/25/25 le premier jour UTC de chaque mois ou trimestre.
- Autres témoins : 100 % BTC, 100 % ETH, 100 % liquidités. Les niveaux de risque ne sont pas égaux.
- Frais simulés 0,10 % et glissement 0,05 % de chaque côté ; stress avec coûts doublés.
- Valorisation quotidienne au produit de vente fictive après coûts. Pas d'intérêt sur le cash, pas de fiscalité ni financement.

## Résultats des portefeuilles

| Stratégie | Final USDT | Rendement | Drawdown max. | Sous sommet (max) | Dates de rééquilibrage, initial compris | Coûts doublés : rendement |
|---|---:|---:|---:|---:|---:|---:|
| Panier 50/25/25 passif | 1,411.04 | +41.10% | -50.12% | 390 j | 1 | +40.76% |
| Panier 50/25/25 mensuel | 1,501.83 | +50.18% | -46.89% | 390 j | 34 | +49.58% |
| Panier 50/25/25 trimestriel | 1,547.23 | +54.72% | -47.08% | 444 j | 12 | +54.18% |
| 100 % BTC | 1,829.30 | +82.93% | -52.97% | 390 j | 1 | +82.38% |
| 100 % ETH | 985.55 | -1.44% | -67.55% | 515 j | 1 | -1.74% |
| 100 % liquidités | 1,000.00 | +0.00% | 0.00% | 0 j | 1 | +0.00% |

## D18 — VWAP : contrôle de la source, pas une stratégie inventée

Les bougies horaires possèdent volume de base et volume en USDT de cotation. Leur rapport sur une heure, puis le rapport des sommes sur une session UTC, est une mesure de prix pondéré par le volume des échanges Binance.
Cela ne définit ni entrée ni sortie, et ne doit pas être présenté comme la stratégie VWAP du Trader.
- bitcoin : 24840 heures à volume positif ; 0 ratios horaires hors OHLC (tolérance 0,1 %), 0 sessions hors extrêmes ; 0 heures sans volume.
- ethereum : 24840 heures à volume positif ; 0 ratios horaires hors OHLC (tolérance 0,1 %), 0 sessions hors extrêmes ; 0 heures sans volume.

## Contrôle des autres profils documentaires

| Profil | État après audit | Condition du prochain backtest |
|---|---|---|
| D13 Rééquilibrage BTC/ETH/cash | TESTÉ sur archives horaires vérifiées | Pondérations supplémentaires figées, frais comparables OKX, prospectif |
| D18 VWAP | Source de volume horaire qualifiée, ratio base/quote contrôlé | Règles d'entrée/sortie fixées et validation distincte |
| D19 SAR parabolique | OHLC quotidiennes disponibles | Formule SAR, AF, initialisation, inversions à figer avant le test |
| D11 Spot Grid | Archives horaires disponibles, exécution non certifiable | Ordre des touches intrahoraires, remplissages réels, frais maker |
| D12 Spot DCA Martingale | Documentation disponible, non testé | Taille et plafond des renforts, gaps, pire cas sans rebond |
| D14 Arbitrage | Les deux actifs ne sont pas deux places d'exécution | Carnets synchronisés multi-plateformes + coûts de transfert |
| D15 TWAP | Données horaires grossières seulement | Carnet et exécution de lots, fenêtres plus fines |
| D16 Iceberg | Non vérifiable à partir des OHLC | Ordres limites, queue et exécutions partielles |
| D17 Scalping | Données horaires insuffisantes | Séries minute/seconde et spread/exécutions |

## Incertitudes et limites

- Rééquilibrer n'assure pas moins de pertes : acheter un actif qui baisse peut augmenter le risque. Les résultats sont rétrospectifs et non validés sur un second exchange.
- L'USDT est valorisé comme liquidité stable, sans défaut d'émetteur, rendement ni risque de change.
- Les paramètres 50/25/25 ont été choisis à titre pédagogique, non optimisés ; le portefeuille d'origine n'est pas celui de l'utilisateur.
- Les volumes de cotation ne sont pas des preuves d'exécution possible d'un ordre de taille donnée.
- La simulation n'emploie aucun prix ultérieur à la date d'exécution ; rééquilibrages aux ouvertures calendrier connues.

## Reproduction

- Script : SEVEN_HEAVEN_BTC_ETH_USDT_REBALANCING_VWAP_SOURCE_AUDIT_2026_11_11.py
- Rapport : SEVEN_HEAVEN_BTC_ETH_USDT_REBALANCING_VWAP_SOURCE_AUDIT_2026_11_11.md
- Résultats, sources, SHA et trajectoires quotidiennes : SEVEN_HEAVEN_BTC_ETH_USDT_REBALANCING_VWAP_SOURCE_AUDIT_2026_11_11.json
