# Seven Heaven — Retards asymétriques à l’entrée et à la sortie BTC

**Étude du 11 novembre 2026 · uniquement PAPER, aucun ordre, aucune modification de l’interface.**

## Méthode et antériorité

- Protocole de ce test : `SEVEN_HEAVEN_BTC_ENTRY_EXIT_ASYMMETRIC_CONFIRMATION_AUDIT_2026_11_11_PROTOCOL.md`, avec les 9 combinaisons par famille fixées avant ce calcul.
- **829,440 bougies natives BTCUSDT 1m**, 19 ZIP d’origine validés SHA-256 (2023 Q2, 2024 Q1, 2025 Q1, 2026 janvier–octobre).
- Les indicateurs sont inchangés : EMA10/30 (+ close > EMA30), SuperTrend ATR14×3 et consensus 2/3 EMA/MACD/ADX.
- Une confirmation de N jours = N clôtures journalières UTC consécutives identiques. Entrée (achat BTC) et sortie (vente BTC) peuvent attendre un nombre différent de clôtures.
- Portefeuille : 1 000 USDT, une position intégrale BTC ou cash, signal après clôture D et exécution fictive à l’ouverture D+1, frais 0,10 % et glissement 0,05 % par côté.
- Comparer aussi les coûts ×2 et les drawdowns quotidiens. Aucune année n’est réinitialisée à l’intérieur de sa période simulée.
- **Limite impérative : 2023, 2024, 2025, 2026 ont déjà été exploitées par notre équipe. Cette étude n’est PAS un test hors échantillon inédit.**

## Résultat : comparaison asymétrique pré-déclarée

Signification : `E1/S1` = entrée après 1 clôture, sortie après 1 ; `E3/S1` = entrée lente, sortie rapide ; `E1/S3` = entrée rapide, sortie lente. Valeurs nettes simulées, en %.

### 2023 — 2023-05-01 à 2023-06-30

| Indicateur | E1/S1 | E3/S1 | E1/S3 | E2/S2 | E3/S3 | E3/S1 : écart au témoin | E1/S3 : écart au témoin |
|---|---:|---:|---:|---:|---:|---:|---:|
| EMA | -5.31 % | -4.90 % | -4.56 % | -4.92 % | -7.58 % | +0.42 pp | +0.76 pp |
| SUPERTREND | +7.32 % | +1.66 % | +7.32 % | +1.29 % | +1.66 % | -5.66 pp | +0.00 pp |
| CONSENSUS | -4.70 % | -2.73 % | -4.22 % | -7.07 % | -5.47 % | +1.97 pp | +0.47 pp |

Témoin Buy & Hold 100 % BTC : +3.93 % net.

### 2024 — 2024-02-01 à 2024-03-31

| Indicateur | E1/S1 | E3/S1 | E1/S3 | E2/S2 | E3/S3 | E3/S1 : écart au témoin | E1/S3 : écart au témoin |
|---|---:|---:|---:|---:|---:|---:|---:|
| EMA | +45.86 % | +45.95 % | +60.24 % | +56.92 % | +50.78 % | +0.09 pp | +14.38 pp |
| SUPERTREND | +31.02 % | +27.85 % | +38.56 % | +41.65 % | +35.21 % | -3.17 pp | +7.54 pp |
| CONSENSUS | +41.60 % | +34.03 % | +49.75 % | +51.65 % | +41.74 % | -7.58 pp | +8.15 pp |

Témoin Buy & Hold 100 % BTC : +66.90 % net.

### 2025 — 2025-02-01 à 2025-03-31

| Indicateur | E1/S1 | E3/S1 | E1/S3 | E2/S2 | E3/S3 | E3/S1 : écart au témoin | E1/S3 : écart au témoin |
|---|---:|---:|---:|---:|---:|---:|---:|
| EMA | -5.78 % | -2.05 % | -6.02 % | -4.90 % | -6.02 % | +3.73 pp | -0.24 pp |
| SUPERTREND | -25.93 % | -20.00 % | -27.43 % | -17.22 % | -21.61 % | +5.93 pp | -1.50 pp |
| CONSENSUS | +0.00 % | +0.00 % | +0.00 % | +0.00 % | +0.00 % | +0.00 pp | +0.00 pp |

Témoin Buy & Hold 100 % BTC : -19.65 % net.

### 2026 — 2026-02-01 à 2026-10-31

| Indicateur | E1/S1 | E3/S1 | E1/S3 | E2/S2 | E3/S3 | E3/S1 : écart au témoin | E1/S3 : écart au témoin |
|---|---:|---:|---:|---:|---:|---:|---:|
| EMA | +3.24 % | -7.67 % | +1.56 % | +3.03 % | -2.45 % | -10.91 pp | -1.68 pp |
| SUPERTREND | +15.80 % | +24.44 % | +13.67 % | +15.86 % | +22.14 % | +8.64 pp | -2.14 pp |
| CONSENSUS | +8.12 % | -10.40 % | +9.50 % | +8.85 % | -0.05 % | -18.53 pp | +1.38 pp |

Témoin Buy & Hold 100 % BTC : -1.77 % net.

## Coût du retard d’un côté, sans le confondre avec le rendement complet

Les changements de position survenant après un renversement d’état brut sont rapprochés **uniquement** si les deux simulations effectuent le même côté (achat ou vente) pendant la **même séquence ininterrompue** du signal brut.
Pour une entrée retardée, une hausse du prix entre les deux achats est défavorable ; pour une vente retardée, une baisse est défavorable. Ces mouvements de prix sont **des diagnostics locaux, jamais un P&L additionnable**. Les transitions sans paire comparable restent marquées `matched=false` dans le CSV.

| Période | Famille | Entrées comparables | Entrée retardée : médiane jours | Mouvement adverse médian | Sorties comparables | Sortie retardée : médiane jours | Mouvement adverse médian |
|---|---|---:|---:|---:|---:|---:|---:|
| 2023 | EMA | 2 | 2.0 | 1.9838 % | 1 | 2 | 2.8203 % |
| 2023 | SUPERTREND | 1 | 2 | 5.5706 % | 0 | — | — % |
| 2023 | CONSENSUS | 2 | 2.0 | 1.1753 % | 2 | 2.0 | -0.2962 % |
| 2024 | EMA | 2 | 2.0 | 0.1574 % | 0 | — | — % |
| 2024 | SUPERTREND | 1 | 2 | 2.4764 % | 1 | 2 | -5.754 % |
| 2024 | CONSENSUS | 2 | 2.0 | 2.8444 % | 1 | 2 | -5.754 % |
| 2025 | EMA | 0 | — | — % | 1 | 2 | 1.2365 % |
| 2025 | SUPERTREND | 1 | 2 | -7.4128 % | 2 | 2.0 | 0.7539 % |
| 2025 | CONSENSUS | 0 | — | — % | 0 | — | — % |
| 2026 | EMA | 7 | 2 | 1.5026 % | 8 | 2.0 | 0.7072 % |
| 2026 | SUPERTREND | 2 | 2.0 | -3.5238 % | 1 | 2 | 1.3278 % |
| 2026 | CONSENSUS | 7 | 2 | 1.5026 % | 6 | 2.0 | 0.4856 % |

## Contrôles effectués

- **1053 assertions de causalité** par préfixe de séries et **12684 comparaisons** du portefeuille avec un livre comptable indépendant.
- **36 résultats symétriques** (C1/C2/C3) retrouvés exactement dans les études antérieures.
- Les chemins de portefeuille divergent quand on modifie les délais ; un écart de rendement global ne peut pas être imputé à une seule transaction.
- Les performances d’une stratégie en liquidités peuvent refléter une hausse manquée ; une sortie rapide peut aussi éviter une baisse. Examiner ensemble rendement, capital final, drawdown, coûts et temps d’exposition.

## Reproductibilité et passation

- Code : `SEVEN_HEAVEN_BTC_ENTRY_EXIT_ASYMMETRIC_CONFIRMATION_AUDIT_2026_11_11.py`; protocole : `SEVEN_HEAVEN_BTC_ENTRY_EXIT_ASYMMETRIC_CONFIRMATION_AUDIT_2026_11_11_PROTOCOL.md`.
- JSON détaillé avec sources SHA, matrice complète, stress de coûts, contrôle causal : `SEVEN_HEAVEN_BTC_ENTRY_EXIT_ASYMMETRIC_CONFIRMATION_AUDIT_2026_11_11_PROOFS.json`.
- Résumé tabulaire : `SEVEN_HEAVEN_BTC_ENTRY_EXIT_ASYMMETRIC_CONFIRMATION_AUDIT_2026_11_11_RESULTS.csv` ; courbes quotidiennes : `SEVEN_HEAVEN_BTC_ENTRY_EXIT_ASYMMETRIC_CONFIRMATION_AUDIT_2026_11_11_EQUITY_DAILY.csv` ; appariement des délais : `SEVEN_HEAVEN_BTC_ENTRY_EXIT_ASYMMETRIC_CONFIRMATION_AUDIT_2026_11_11_MATCHED_TRANSITIONS.csv`.
- Modules source requis : précédents scripts d’indicateurs, de simulation, de parsing, et de validation 2023 déjà publiés dans le répertoire partagé.
- Les ZIP binaires de marché restent dans GitHub Releases ; ils ne sont pas dupliqués dans Git main.
- **Il faut geler une règle retenue et l’évaluer sur une nouvelle période non encore explorée avant toute conclusion de robustesse.**

**Aucun ordre réel, aucune mise à jour du Trader, Operator, Administrator ou Bridge.**
