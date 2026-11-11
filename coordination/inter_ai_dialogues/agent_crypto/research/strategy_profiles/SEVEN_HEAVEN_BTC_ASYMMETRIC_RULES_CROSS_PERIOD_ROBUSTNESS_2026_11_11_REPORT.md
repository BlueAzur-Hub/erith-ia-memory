# Seven Heaven — Robustesse inter-périodes des confirmations asymétriques BTC

**11 novembre 2026 · Étude documentaire PAPER, fondée sur les preuves publiées.**

## Périmètre et prudence méthodologique

- Source : `SEVEN_HEAVEN_BTC_ENTRY_EXIT_ASYMMETRIC_CONFIRMATION_AUDIT_2026_11_11_PROOFS.json` (empreinte SHA-256 dans le JSON ci-joint), couvrant 19 ZIP Binance BTCUSDT 1m, déjà vérifiés par la recherche source.
- Quatre fenêtres **déjà examinées** : 2023 mai–juin (61 j), 2024 fév.–mars (60 j), 2025 fév.–mars (59 j), 2026 fév.–oct. (273 j).
- Comparaison **figée des variantes** E1/S1, E3/S1, E1/S3, E2/S2 pour chaque famille EMA, SuperTrend, consensus (2 sur 3). Tous les résultats ci-dessous sont extraits sans modifier le calcul primaire.
- Définition : E1/S3 = achat dès 1 clôture haussière, vente après 3 clôtures baissières ; E3/S1 = entrée lente / sortie rapide.
- Capital fictif initial 1 000 USDT et coûts identiques à l’étude source ; retour, stress de coûts ×2 et drawdown journalier.
- **Ceci n’est pas une validation indépendante.** Les séries 2023–2026 et les candidats sont déjà connus ; la sélection leave-one-out est purement diagnostique.

## Tableau de robustesse descriptif (4 fenêtres)

| Famille | Règle | Fenêtres nettes positives | Fenêtres devant Buy & Hold | Pire rendement | Pire drawdown | Médiane écart vs Hold (pp) |
|---|---|---:|---:|---:|---:|---:|
| EMA | ENTRY1_EXIT1 | 2/4 | 2/4 | -5.78 % | -20.53 % | -2.12 |
| EMA | ENTRY3_EXIT1 | 1/4 | 1/4 | -7.67 % | -15.24 % | -7.36 |
| EMA | ENTRY1_EXIT3 | 2/4 | 2/4 | -6.02 % | -16.12 % | -1.67 |
| EMA | ENTRY2_EXIT2 | 2/4 | 2/4 | -4.92 % | -15.24 % | -2.02 |
| SUPERTREND | ENTRY1_EXIT1 | 3/4 | 2/4 | -25.93 % | -25.93 % | -1.44 |
| SUPERTREND | ENTRY3_EXIT1 | 3/4 | 1/4 | -20.00 % | -20.00 % | -1.31 |
| SUPERTREND | ENTRY1_EXIT3 | 3/4 | 2/4 | -27.43 % | -31.83 % | -2.19 |
| SUPERTREND | ENTRY2_EXIT2 | 3/4 | 2/4 | -17.22 % | -21.55 % | -0.10 |
| CONSENSUS | ENTRY1_EXIT1 | 2/4 | 2/4 | -4.70 % | -15.99 % | +0.63 |
| CONSENSUS | ENTRY3_EXIT1 | 1/4 | 1/4 | -10.40 % | -15.36 % | -7.65 |
| CONSENSUS | ENTRY1_EXIT3 | 2/4 | 2/4 | -4.22 % | -15.24 % | +1.56 |
| CONSENSUS | ENTRY2_EXIT2 | 2/4 | 2/4 | -7.07 % | -15.24 % | -0.19 |

Les quatre fenêtres n’ont pas la même durée. Les valeurs de chaque portefeuille **ne sont ni additionnées ni présentées comme un capital continu**. La médiane des écarts en points de pourcentage est descriptive, non une espérance de rendement.

## Diagnostic anti-surajustement : une période laissée de côté

Algorithme à titre de contrôle : pour chaque période, sélectionner le couple famille/règle maximisant la médiane des **log-croissances relatives quotidiennes** sur les trois autres périodes (déjà connues du laboratoire), puis examiner sa performance sur la quatrième.
| Période évaluée | Règle choisie sur les trois autres | Retour évalué | Buy & Hold | Écart (pp) |
|---|---|---:|---:|---:|
| 2023 | SUPERTREND ENTRY2_EXIT2 | +1.29 % | +3.93 % | -2.64 |
| 2024 | SUPERTREND ENTRY1_EXIT1 | +31.02 % | +66.90 % | -35.88 |
| 2025 | SUPERTREND ENTRY1_EXIT1 | -25.93 % | -19.65 % | -6.28 |
| 2026 | SUPERTREND ENTRY3_EXIT1 | +24.44 % | -1.77 % | +26.21 |

Le sélecteur descriptif bat Buy & Hold dans **1/4** évaluations. Cela **ne constitue pas un score hors échantillon**, car les quatre périodes ont déjà participé à la recherche et à la sélection des idées.

## Coût asymétrique du retard : comparaisons appariées

Le CSV `SEVEN_HEAVEN_BTC_ASYMMETRIC_RULES_CROSS_PERIOD_ROBUSTNESS_2026_11_11_PAIRED_DIFFS.csv` compare séparément pour chaque famille les variantes à E1/S1 (rendement net, stress de coûts, drawdown), sans confondre les changements d’exposition avec le coût d’une transaction unique.

## Décision scientifique

- Aucun résultat ne suffit à promouvoir une politique asymétrique comme choix universel. Les rendements dépendent fortement du contexte et du temps d’exposition.
- Les alternatives E3/S1 (sortie rapide) et E1/S3 (entrée rapide) décrivent des risques de nature différente ; les deux restent à examiner dans un jeu *réellement inédit*.
- Le protocole 2022 Q2 est gelé dans un document séparé avant d’accéder à la série nouvelle ; il permettra un vrai test après vérification des ZIP.

## Reproduction pour les autres IA

- Script : `SEVEN_HEAVEN_BTC_ASYMMETRIC_RULES_CROSS_PERIOD_ROBUSTNESS_2026_11_11.py` — Python 3 standard library, aucun accès réseau ni compte.
- Entrée : `SEVEN_HEAVEN_BTC_ENTRY_EXIT_ASYMMETRIC_CONFIRMATION_AUDIT_2026_11_11_PROOFS.json` issue du Coffre, SHA-256 contrôlé.
- Sorties : `SEVEN_HEAVEN_BTC_ASYMMETRIC_RULES_CROSS_PERIOD_ROBUSTNESS_2026_11_11_PROOFS.json`, `_CANDIDATE_PANEL.csv`, `_SCORECARD.csv`, `_PAIRED_DIFFS.csv`, `_LOO_DIAGNOSTIC.csv`.
- Sans exécution d’ordre ni modification d’Administrator, Operator, Trader ou Bridge.
