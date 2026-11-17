# Seven Heaven Strategy Lab — V4.8 Historical Vault V2 + Workspace Steward V3

Date : 17 novembre 2026

## Livraison

- Historical Vault V2 : bundle vérifié BTC/ETH 2024/2025 installé dans le workspace canonique.
- Workspace Steward V3 : profils et StrategySpecs manuels autorisés dans des namespaces utilisateur séparés ; runs/comparaisons manuels restent exploratoires.
- Moteur PAPER inchangé. Aucun ordre réel, aucune clé de compte.

## Recette

- 155 tests + 12 sous-tests : PASS.
- Source Catalog : 26 sources locales vérifiées.
- Historical Vault : 4 années `LOCAL · UTILISABLE`.
- Corpus canonique : 28 profils, 28 StrategySpecs, 28 runs, 10 comparaisons.
- Recette visuelle DOM : 1600 px sans débordement horizontal, 0 exception JavaScript, boutons Enregistrer profil/StrategySpec actifs.
- Chromium système : navigation localhost bloquée par politique administrateur ; la recette visuelle utilise donc le même HTML/CSS/JS avec réponses API capturées sur le serveur réel.

## Provenance historique installée

Les quatre années proviennent du catalogue partagé `calendar_year_hourly_shards`, lui-même dérivé des ZIP mensuels Binance Spot 1m vérifiés. Chaque année conserve la provenance mensuelle et son SHA-256.

- BTC/USDT 2024 : 8 784 bougies 1h — `5add63d3d29bd8a8ef80b6ec16f288fe36de5c9db0ff8d8119bcd732129f9ef5`
- BTC/USDT 2025 : 8 760 bougies 1h — `291bc87ca5aace394fde51a43edc7f5fdb25da1213fd8343b19ff154ff370d0f`
- ETH/USDT 2024 : 8 784 bougies 1h — `12f5c738eac80ba281614e1f20fb42d3d255514a87bb1af90828a917e8133f4e`
- ETH/USDT 2025 : 8 760 bougies 1h — `a1abd476dd694759650799a51c6450c4614a085623b1b7c8e7a17b7ba4640ba6`

Le workflow de bundle partagé est :
`.github/workflows/seven-heaven-strategy-lab-historical-bundle.yml`.

## Workspace Steward V3

Décision corrigée après revue utilisateur :

- les sauvegardes manuelles de profils restent autorisées ;
- les sauvegardes manuelles de StrategySpecs restent autorisées ;
- elles vont dans `workspace/user_profiles` et `workspace/user_strategy_specs` ;
- le corpus canonique reste séparé dans `profiles`, `strategy_specs`, `results` et `comparisons` ;
- les runs/comparaisons exploratoires ne polluent pas le corpus canonique quand le workspace est sous gestion Seven.

Ainsi Yoann peut créer et conserver ses propres stratégies sans modifier les preuves canoniques.

## Résultats annuels PAPER — paramètres canoniques

| Source | Méthode | Rendement | Fills | Frais quote |
|---|---|---:|---:|---:|
| CAT_BINANCE_BTCUSDT_1H_2024 | EMA_CROSS | +38.78345% | 281 | 311.299178 |
| CAT_BINANCE_BTCUSDT_1H_2024 | BOLLINGER | +9.41469% | 216 | 241.317251 |
| CAT_BINANCE_BTCUSDT_1H_2024 | DONCHIAN | +22.63999% | 119 | 131.870019 |
| CAT_BINANCE_BTCUSDT_1H_2024 | DCA | +113.79989% | 20 | 0.998997 |
| CAT_BINANCE_BTCUSDT_1H_2025 | EMA_CROSS | -56.16029% | 300 | 215.873348 |
| CAT_BINANCE_BTCUSDT_1H_2025 | BOLLINGER | -22.06379% | 199 | 182.626821 |
| CAT_BINANCE_BTCUSDT_1H_2025 | DONCHIAN | -20.60039% | 120 | 108.898184 |
| CAT_BINANCE_BTCUSDT_1H_2025 | DCA | -10.22776% | 20 | 0.998993 |
| CAT_BINANCE_ETHUSDT_1H_2024 | EMA_CROSS | -1.22493% | 302 | 285.312818 |
| CAT_BINANCE_ETHUSDT_1H_2024 | BOLLINGER | +19.55613% | 220 | 252.755092 |
| CAT_BINANCE_ETHUSDT_1H_2024 | DONCHIAN | +8.93176% | 120 | 131.936378 |
| CAT_BINANCE_ETHUSDT_1H_2024 | DCA | +38.60886% | 20 | 0.999001 |
| CAT_BINANCE_ETHUSDT_1H_2025 | EMA_CROSS | -55.31790% | 329 | 197.450569 |
| CAT_BINANCE_ETHUSDT_1H_2025 | BOLLINGER | +21.86058% | 228 | 266.272610 |
| CAT_BINANCE_ETHUSDT_1H_2025 | DONCHIAN | -21.59303% | 117 | 81.133937 |
| CAT_BINANCE_ETHUSDT_1H_2025 | DCA | -12.03763% | 20 | 0.999001 |

Ces résultats décrivent uniquement les historiques testés avec les hypothèses du Lab ; ils ne prédisent pas les gains futurs.

## Artefacts figés

- `SEVEN_HEAVEN_STRATEGY_LAB_V4_8_HISTORICAL_VAULT_V2_WORKSPACE_STEWARD_V3_DEV.zip`
  - 1 821 960 octets
  - SHA-256 `f21c8b1660d6139ac5987a4eaa979926065c1540c4447118335ed78844745893`
- `SEVEN_HEAVEN_STRATEGY_LAB_WORKSPACE_CANONICAL_V3_BTC_ETH_2024_2025_2026_11_17.zip`
  - 2 883 215 octets
  - SHA-256 `69caebebd77a3d1c644dced24416a8147f58b1956ee4618d7b5925b77ba8de7d`
- `SEVEN_HEAVEN_STRATEGY_LAB_HISTORICAL_BUNDLE_BTC_ETH_2024_2025_2026_11_17.zip`
  - 1 254 329 octets
  - SHA-256 `c0637023bf3f6aeb38f25b38602d65510dc16d65bda476e37240b5ef40d2d0df`

Les binaires sont des artefacts de livraison du fil ; le dépôt partagé conserve ici le manifeste, les hashes, la provenance et les règles nécessaires à la reprise.

## Étape suivante

Étendre le même pipeline **bundle → installation → rebuild canonique** à **BNB/XRP/SOL 2024/2025**, puis exploiter ce corpus long dans Scientific/Research et les comparaisons multi-actifs.
