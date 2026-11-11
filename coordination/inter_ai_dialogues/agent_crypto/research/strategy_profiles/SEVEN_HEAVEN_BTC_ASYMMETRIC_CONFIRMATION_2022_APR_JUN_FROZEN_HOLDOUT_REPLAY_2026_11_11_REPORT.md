# Seven Heaven — Validation historique 2022 Q2 des entrées/sorties BTC asymétriques

**Test rétrospectif figé avant accès aux cours. Binance Spot BTCUSDT, PAPER uniquement.**

- Source : trois ZIP originaux SHA-256 vérifiés ; 131 040 minutes du 1er avril au 30 juin 2022.
- Avril = chauffe seulement ; résultats du 1er mai au 30 juin, 61 jours continus, 1 000 USDT fictifs.
- EMA10/30, SuperTrend ATR14×3, consensus EMA/MACD/ADX et Buy & Hold. Quatre règles E1/S1, E3/S1, E1/S3 et E2/S2, identiques au protocole prépublié.
- Exécution fictive au prochain open UTC après signal clôturé; frais 0,10% et slippage 0,05% / côté.

| Famille | Politique | Rendement | Coûts ×2 | Drawdown max | Transactions | Jours cash |
|---|---|---:|---:|---:|---:|---:|
| EMA | E1_S1 | +0.00% | +0.00% | 0.00% | 0 | 61 |
| EMA | E3_S1 | +0.00% | +0.00% | 0.00% | 0 | 61 |
| EMA | E1_S3 | +0.00% | +0.00% | 0.00% | 0 | 61 |
| EMA | E2_S2 | +0.00% | +0.00% | 0.00% | 0 | 61 |
| SUPERTREND | E1_S1 | +0.00% | +0.00% | 0.00% | 0 | 61 |
| SUPERTREND | E3_S1 | +0.00% | +0.00% | 0.00% | 0 | 61 |
| SUPERTREND | E1_S3 | +0.00% | +0.00% | 0.00% | 0 | 61 |
| SUPERTREND | E2_S2 | +0.00% | +0.00% | 0.00% | 0 | 61 |
| CONSENSUS | E1_S1 | +0.00% | +0.00% | 0.00% | 0 | 61 |
| CONSENSUS | E3_S1 | +0.00% | +0.00% | 0.00% | 0 | 61 |
| CONSENSUS | E1_S3 | +0.00% | +0.00% | 0.00% | 0 | 61 |
| CONSENSUS | E2_S2 | +0.00% | +0.00% | 0.00% | 0 | 61 |
| BENCHMARK | BUY_HOLD_BTC | -47.16% | -47.32% | -52.20% | 1 | 0 |

## Interprétation

Ce jeu de 61 jours constitue un historique inédit *dans cette ligne de recherche* mais ne transforme pas les simulations de transactions en exécutions réelles. Le gagnant du tableau ne peut pas être choisi a posteriori pour prétendre à une supériorité généralisable.

- Contrôles : 144 préfixes causaux et 1586 valorisations indépendantes (coûts normaux et doublés).
- Sources de preuve : `SEVEN_HEAVEN_BTC_ASYMMETRIC_CONFIRMATION_2022_APR_JUN_FROZEN_HOLDOUT_REPLAY_2026_11_11_PROOFS.json`, `SEVEN_HEAVEN_BTC_ASYMMETRIC_CONFIRMATION_2022_APR_JUN_FROZEN_HOLDOUT_REPLAY_2026_11_11_RESULTS.csv`, `SEVEN_HEAVEN_BTC_ASYMMETRIC_CONFIRMATION_2022_APR_JUN_FROZEN_HOLDOUT_REPLAY_2026_11_11_EQUITY_DAILY.csv`, `SEVEN_HEAVEN_BTC_ASYMMETRIC_CONFIRMATION_2022_APR_JUN_FROZEN_HOLDOUT_REPLAY_2026_11_11.py`.
- Aucune modification du système de trading, aucune connexion OKX, aucun ordre réel.
