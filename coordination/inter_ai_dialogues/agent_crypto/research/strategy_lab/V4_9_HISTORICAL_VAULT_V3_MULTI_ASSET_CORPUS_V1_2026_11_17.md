# Seven Heaven Strategy Lab — V4.9 Historical Vault V3 + Multi-Asset Corpus V1

Date : 17 novembre 2026

## Résultat

- Historical Bundle V3 : 10 années-actifs BTC/ETH/BNB/XRP/SOL × 2024/2025.
- Six nouveaux shards BNB/XRP/SOL pris directement dans le Coffre public Seven et revalidés localement.
- Moteur PAPER SHA-256 inchangé : f4de4a9cb8dbfd17a665785b6b06cfff3473039624457e721d3f3fd9e2aeb7c2.
- Workspace canonique : 52 profils + 52 StrategySpecs + 52 simulations + 16 comparaisons.
- Aucun ordre réel, aucune clé de compte, aucune lecture de compte.

## Bundle V3

| Actif | Année | Bougies 1h | Span | SHA-256 |
|---|---:|---:|---:|---|
| BTC | 2024 | 8784 | 13 | 5add63d3d29bd8a8ef80b6ec16f288fe36de5c9db0ff8d8119bcd732129f9ef5 |
| BTC | 2025 | 8760 | 13 | 291bc87ca5aace394fde51a43edc7f5fdb25da1213fd8343b19ff154ff370d0f |
| ETH | 2024 | 8784 | 13 | 12f5c738eac80ba281614e1f20fb42d3d255514a87bb1af90828a917e8133f4e |
| ETH | 2025 | 8760 | 13 | a1abd476dd694759650799a51c6450c4614a085623b1b7c8e7a17b7ba4640ba6 |
| BNB | 2024 | 8784 | 12 | 71f3bdf96f2cbcf5b5cf7bf8d748305e65348cc6156bb8e31246377cfe2d96ab |
| BNB | 2025 | 8760 | 12 | d375d3e3998eb7a026ab3c63251af0cfea2b711b68fd3bd91da081a356ea1101 |
| XRP | 2024 | 8784 | 11 | 08b34cc0934cccca851e4040bf552cb30250d96947001a2eff19b87f95bcd983 |
| XRP | 2025 | 8760 | 11 | 7844ff01623f7ed959f4bd87e782504a448ad6de863f64964bcdc594539391dd |
| SOL | 2024 | 8784 | 5 | 6001789aadec0df0153e076c2dd0f652250c7123afac5757e257a730af3a9b59 |
| SOL | 2025 | 8760 | 5 | f3be42dcc50d4ff898a835128dbaa47a0e79a0a7501ca1f222c6eb92e0031da3 |

## Résultats canoniques nouveaux — BNB / XRP / SOL

| Source | Méthode | Rendement PAPER | Drawdown max | Frais | Fills |
|---|---|---:|---:|---:|---:|
| CAT_BINANCE_BNBUSDT_1H_2024 | BOLLINGER | +28.20 % | -39.13 % | 225.46 | 192 |
| CAT_BINANCE_BNBUSDT_1H_2024 | DCA | +126.63 % | -42.65 % | 1.00 | 20 |
| CAT_BINANCE_BNBUSDT_1H_2024 | DONCHIAN | +7.69 % | -25.22 % | 142.16 | 118 |
| CAT_BINANCE_BNBUSDT_1H_2024 | EMA_CROSS | +8.53 % | -29.02 % | 353.52 | 309 |
| CAT_BINANCE_BNBUSDT_1H_2025 | BOLLINGER | -8.39 % | -31.69 % | 202.31 | 210 |
| CAT_BINANCE_BNBUSDT_1H_2025 | DCA | +22.70 % | -40.89 % | 1.00 | 20 |
| CAT_BINANCE_BNBUSDT_1H_2025 | DONCHIAN | -20.80 % | -29.67 % | 108.90 | 126 |
| CAT_BINANCE_BNBUSDT_1H_2025 | EMA_CROSS | -30.00 % | -42.84 % | 293.97 | 343 |
| CAT_BINANCE_SOLUSDT_1H_2024 | BOLLINGER | +62.70 % | -43.06 % | 289.40 | 204 |
| CAT_BINANCE_SOLUSDT_1H_2024 | DCA | +92.61 % | -46.52 % | 1.00 | 20 |
| CAT_BINANCE_SOLUSDT_1H_2024 | DONCHIAN | -15.61 % | -39.83 % | 97.25 | 121 |
| CAT_BINANCE_SOLUSDT_1H_2024 | EMA_CROSS | +28.10 % | -36.07 % | 360.51 | 295 |
| CAT_BINANCE_SOLUSDT_1H_2025 | BOLLINGER | -26.12 % | -46.82 % | 161.70 | 197 |
| CAT_BINANCE_SOLUSDT_1H_2025 | DCA | -39.14 % | -65.90 % | 1.00 | 20 |
| CAT_BINANCE_SOLUSDT_1H_2025 | DONCHIAN | -46.44 % | -62.94 % | 99.28 | 124 |
| CAT_BINANCE_SOLUSDT_1H_2025 | EMA_CROSS | -62.18 % | -73.26 % | 213.05 | 322 |
| CAT_BINANCE_XRPUSDT_1H_2024 | BOLLINGER | +12.55 % | -39.28 % | 187.92 | 206 |
| CAT_BINANCE_XRPUSDT_1H_2024 | DCA | +258.67 % | -45.79 % | 1.00 | 20 |
| CAT_BINANCE_XRPUSDT_1H_2024 | DONCHIAN | +120.25 % | -41.11 % | 94.68 | 104 |
| CAT_BINANCE_XRPUSDT_1H_2024 | EMA_CROSS | +95.03 % | -46.86 % | 268.20 | 329 |
| CAT_BINANCE_XRPUSDT_1H_2025 | BOLLINGER | -33.23 % | -55.35 % | 160.13 | 199 |
| CAT_BINANCE_XRPUSDT_1H_2025 | DCA | -27.92 % | -51.21 % | 1.00 | 20 |
| CAT_BINANCE_XRPUSDT_1H_2025 | DONCHIAN | +3.73 % | -31.00 % | 110.86 | 102 |
| CAT_BINANCE_XRPUSDT_1H_2025 | EMA_CROSS | -47.22 % | -57.43 % | 244.48 | 310 |

## Artefacts

- SEVEN_HEAVEN_STRATEGY_LAB_V4_9_HISTORICAL_VAULT_V3_MULTI_ASSET_CORPUS_V1_DEV.zip — SHA-256 d7e7aee85c44c583d6eb0de55256dee443bbb603853dd29cbc853b393d8cfd16
- SEVEN_HEAVEN_STRATEGY_LAB_WORKSPACE_CANONICAL_V4_BTC_ETH_BNB_XRP_SOL_2024_2025_2026_11_17.zip — SHA-256 b9a80821ea97a7a3c8c60c0efb9eb2e33a8c4927f4f1a634ad11d485441195c5
- SEVEN_HEAVEN_STRATEGY_LAB_HISTORICAL_BUNDLE_V3_TOP5_2024_2025_2026_11_17.zip — SHA-256 733fa799f5f3121c04935d99a356b4e519db908f2b4496df5d9b7f0aea04d7ad

## Validation

- Suite Python : voir GitHub Actions du build V4.9.
- JavaScript : node --check PASS sur app.js, historical-vault.js, lab-help-layer.js.
- Rebuild : les dix années sont installées avant reset/rejeu ; les sources sont préservées pendant la reconstruction.
- Réception visuelle Firefox Windows propriétaire : encore requise ; elle reste distincte des tests automatisés.

## Gate suivant

Exploiter ce corpus 5×2 pour une comparaison transversale de la même StrategySpec entre actifs, années et régimes. Ne pas ouvrir V5 Robot PAPER avant cette lecture multi-actifs.
