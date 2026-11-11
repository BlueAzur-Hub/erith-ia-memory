# Seven Heaven — Validation historique hors exploration : BTC 2023 Q2, confirmations C1 / C2 / C3

**11 novembre 2026 · PAPER uniquement · aucune connexion aux comptes ni ordre.**

## Protocole préenregistré et sources

- Règles gelées avant réception des données : `SEVEN_HEAVEN_BTC_CONFIRMATION_INDEPENDENT_2023_APR_JUN_FROZEN_PROTOCOL_2026_11_11.md`. Aucun nouveau seuil.
- ZIP originaux Binance Spot BTC/USDT à la minute ; les trois SHA-256 coïncident exactement avec le protocole et le registre public.
- 131 040 bougies 1m strictement consécutives / 91 jours UTC, OHLC journaliers reconstruits et contrôlés.
- **Avril (30 jours) : chauffage des indicateurs, aucune opération. Mai–juin : 61 jours, capital de 1 000 USDT, pas de réinitialisation en juin.**
- Politiques : EMA10/30 (avec clôture > EMA30), SuperTrend ATR14×3, consensus haussier si au moins 2/3 EMA/MACD12/26/9/ADX14≥20 +DI > −DI.
- C1/C2/C3 : 1, 2 ou 3 clôtures consécutives, règle symétrique pour entrer/sortir, sans accès aux clôtures futures.
- Achat/vente fictifs à l’ouverture du lendemain ; 0,10 % frais + 0,05 % glissement par côté et contrôle à coûts doublés ; valorisation nette des frais de liquidation.

## Résultats nets, risques et faux allers-retours

| Portefeuille | Rendement net | Coûts ×2 | Baisse journalière max. | Opérations | Jours en cash | Allers-retours ≤7j |
|---|---:|---:|---:|---:|---:|---:|
| EMA_C1 | -5.31 % | -6.16 % | -7.14 % | 5 | 47/61 | 1 |
| EMA_C2 | -4.92 % | -5.77 % | -6.47 % | 5 | 47/61 | 1 |
| EMA_C3 | -7.58 % | -8.13 % | -8.78 % | 3 | 50/61 | 0 |
| SUPERTREND_C1 | +7.32 % | +7.00 % | -2.00 % | 1 | 51/61 | 0 |
| SUPERTREND_C2 | +1.29 % | +0.99 % | -2.00 % | 1 | 52/61 | 0 |
| SUPERTREND_C3 | +1.66 % | +1.35 % | -2.00 % | 1 | 53/61 | 0 |
| CONSENSUS_C1 | -4.70 % | -5.55 % | -6.53 % | 5 | 48/61 | 1 |
| CONSENSUS_C2 | -7.07 % | -7.90 % | -8.58 % | 5 | 48/61 | 1 |
| CONSENSUS_C3 | -5.47 % | -6.04 % | -6.70 % | 3 | 51/61 | 0 |
| HOLD_BTC | +3.93 % | +3.61 % | -14.83 % | 1 | 0/61 | 0 |

## Sorties et étiquettes futures uniquement pour évaluer

À chaque vente hypothétique, l’étude marque ensuite (a posteriori) le prix BTC à la clôture sept jours plus tard : hausse ≥3 %, baisse ≤−3 %, neutre ou censuré. Un intervalle de cash commencé à la vente puis terminé à l’achat ≤7 jours est un aller-retour court. **Ces variations du prix ne sont ni des rendements de portefeuille ni un bénéfice réalisable.**

| Portefeuille | Sorties suivies de BTC +3 % | Sorties suivies de BTC −3 % | Neutres | Censurées |
|---|---:|---:|---:|---:|
| EMA_C1 | 0 | 1 | 1 | 0 |
| EMA_C2 | 0 | 1 | 1 | 0 |
| EMA_C3 | 0 | 0 | 1 | 0 |
| SUPERTREND_C1 | 0 | 0 | 0 | 0 |
| SUPERTREND_C2 | 0 | 0 | 0 | 0 |
| SUPERTREND_C3 | 0 | 0 | 0 | 0 |
| CONSENSUS_C1 | 0 | 1 | 1 | 0 |
| CONSENSUS_C2 | 0 | 1 | 1 | 0 |
| CONSENSUS_C3 | 0 | 0 | 1 | 0 |
| HOLD_BTC | 0 | 0 | 0 | 0 |

## Contrôles et lecture critique

- **128 tests d’invariance des signaux par recalcul sur les préfixes**, avant toute décision future.
- Empreintes, continuité à chaque minute et au passage de chaque mois, agrégats journaliers, ledger de positions et équité du portefeuille recoupés indépendamment.
- Les politiques n’ont pas été adaptées aux rendements observés en 2023 : il s’agit d’une vraie fenêtre de contrôle post-figement, bien que rétrospective.
- Un seul échantillon indépendant, seulement 61 jours, ne suffit pas pour proclamer une supériorité statistique.
- Tous les coûts sont des hypothèses ; le carnet et les frais exacts du compte OKX ne sont pas simulés.

## Passation inter-IA et reproduction

- Source Python : `SEVEN_HEAVEN_BTC_CONFIRMATION_INDEPENDENT_2023_APR_JUN_REPLAY_2026_11_11.py` ; dépend des sources d’indicateurs et de parseur déjà publiées dans le même répertoire.
- Lancer le script après avoir placé les trois ZIP 2023 dans le dossier des scripts ; aucune clé API requise.
- JSON structuré : `SEVEN_HEAVEN_BTC_CONFIRMATION_INDEPENDENT_2023_APR_JUN_REPLAY_2026_11_11_PROOFS.json`, courbe quotidienne `SEVEN_HEAVEN_BTC_CONFIRMATION_INDEPENDENT_2023_APR_JUN_REPLAY_2026_11_11_EQUITY_DAILY.csv`, cash `SEVEN_HEAVEN_BTC_CONFIRMATION_INDEPENDENT_2023_APR_JUN_REPLAY_2026_11_11_CASH_WINDOWS.csv`, événements de vente `SEVEN_HEAVEN_BTC_CONFIRMATION_INDEPENDENT_2023_APR_JUN_REPLAY_2026_11_11_SALES_7D.csv`.
- Ne pas publier les ZIP de données dans Git main ; utiliser les GitHub Releases en contrôlant les empreintes.
- Les liens vers le protocole figé et les preuves sont dans l’index de la bibliothèque.

**Statut : étude PAPER, lecture seule. Aucun changement aux interfaces, Trader, Operator ou Bridge.**
