# Seven Heaven — EMA, SuperTrend et volatilité : sélection mensuelle Spot Grid ou conservation Bitcoin

**Date de recherche :** 11 novembre 2026  
**Statut :** recherche rétrospective PAPER ; sans ordres, sans automatisation de marché ni prévision démontrée.  
**Périmètre :** Binance Spot BTC/USDT ; janvier–mars 2024 (91 jours), janvier–mars 2025 (90 jours), janvier–octobre 2026 (304 jours). Les trois périodes sont disjointes.

## Question expérimentale

Une règle d'état du marché fondée sur les seuls cours quotidiens déjà clôturés permet-elle de choisir, le premier jour de chaque mois, entre **Buy & Hold 100 % BTC** et **Spot Grid ±20 %**, sans regarder les cours des jours à venir ?

## Contrôles de source

- **16 fichiers ZIP** officiels Binance Spot 1 minute conservés par le Coffre, empreintes SHA-256 vérifiées ; **698 400 bougies** consécutives (260 640 sur 2024–2025, 437 760 sur 2026) ; aucun doublon ni trou dans chaque période.
- Pas de données simulées, aucune utilisation d'ordres réels ; les touches de prix de grille restent des **remplissages hypothétiques** (TOUCH / CLOSE).
- Capital fictif **1 000 USDT par période**, conservé pendant chaque période (aucune injection mensuelle) ; frais **0,10 %/côté**, glissement **0,05 %/côté**. Stress : les deux coûts sont doublés.
- À chaque premier du mois UTC : signal calculé sur la **clôture quotidienne de la veille (UTC)**, puis portefeuille liquidé et réengagé au cours d'ouverture courant. L'éventuel saut de prix entre les deux jours est reflété dans la valorisation de liquidation au nouvel open.
- Dans tout mois choisi en Grid : dix intervalles arithmétiques, centre fixé à l'ouverture du mois, bornes ±20 %, départ 50 % BTC / 50 % liquidités. Les profils sont liquidés/réalloués lors de chaque transition mensuelle. Les témoins « continus » ne sont pas réinitialisés.
- Faute de **30 journées closes**, le mois initial de chaque période suit un **Buy & Hold 50 %** préfixé (phase de chauffage). Le retour à Grid est décidé automatiquement par les signaux du mois précédent.

## Règles annoncées sans calibrage optimisé

1. **EMA10/30** : marché haussier si `EMA10 > EMA30` et `clôture > EMA30` ; sinon Grid20.
2. **SuperTrend** : bandes quotidiennes basées sur ATR de Wilder 14 jours et multiplicateur 3, direction haussière = Hold100, sinon Grid20.
3. **EMA + SuperTrend + volatilité** : si ATR14/prix > **5 %**, Hold50 ; sinon Hold100 lorsque EMA et SuperTrend sont tous deux haussiers, et Grid20 dans les autres cas.

Chaque décision est figée pour le mois suivant, sans connaissance anticipée de son résultat. Ce contrôle de causalité ne rend pas l'étude prospective ou véritablement hors échantillon : les règles ont été élaborées après la connaissance générale de ces historiques.

## Rendements nets simulés — valeur liquidable de fin de période

| Politique | 2024 T1 | 2025 T1 | 2026 jan–oct |
|---|---:|---:|---:|
| EMA 10/30 | +23.28 % | -12.00 % | -14.94 % |
| SuperTrend ATR14 ×3 | +23.28 % | -12.00 % | +5.20 % |
| EMA + SuperTrend + ATR >5 % | +23.28 % | -12.00 % | -16.79 % |
| Grid ±20 % réinitialisée mensuellement | +21.19 % | -2.18 % | -9.89 % |
| Grid ±30 % réinitialisée mensuellement | +23.75 % | -4.26 % | -8.56 % |
| Buy & Hold 50 % continu | +34.04 % | -6.02 % | -5.88 % |
| Buy & Hold 100 % continu | +68.07 % | -12.05 % | -11.75 % |
| Grid ±20 % continue | +9.35 % | +1.21 % | +0.17 % |
| Grid ±30 % continue | +11.89 % | -0.19 % | +3.92 % |

### Effet des frais doublés et de la convention de remplissage

| Politique | 2026 coût standard TOUCH | Coûts doublés TOUCH | Convention CLOSE | Pire baisse quotidienne TOUCH |
|---|---:|---:|---:|---:|
| EMA 10/30 | -14.94 % | -17.31 % | -15.24 % | -25.07 % |
| SuperTrend ATR14 ×3 | +5.20 % | +2.10 % | +5.20 % | -23.51 % |
| EMA + SuperTrend + ATR >5 % | -16.79 % | -18.95 % | -17.09 % | -26.70 % |
| Grid ±20 % continue | +0.17 % | -0.62 % | — | -29.00 % |
| Grid ±30 % continue | +3.92 % | +3.24 % | — | -23.51 % |

## Journal des sélections mensuelles du SuperTrend

### 2024 — Décisions SuperTrend (calculées le dernier jour du mois précédent)
| Mois | Signal retenu | Fin de mois (USDT) | Rendement mensuel du profil |
|---|---|---:|---:|
| 2024-01 | HOLD50 | 1002.00 | +0.20 % |
| 2024-02 | GRID20 | 1060.43 | +5.83 % |
| 2024-03 | HOLD100 | 1232.78 | +16.25 % |

### 2025 — Décisions SuperTrend (calculées le dernier jour du mois précédent)
| Mois | Signal retenu | Fin de mois (USDT) | Rendement mensuel du profil |
|---|---|---:|---:|
| 2025-01 | HOLD50 | 1045.67 | +4.57 % |
| 2025-02 | HOLD100 | 858.52 | -17.90 % |
| 2025-03 | GRID20 | 879.97 | +2.50 % |

### 2026 — Décisions SuperTrend (calculées le dernier jour du mois précédent)
| Mois | Signal retenu | Fin de mois (USDT) | Rendement mensuel du profil |
|---|---|---:|---:|
| 2026-01 | HOLD50 | 947.84 | -5.22 % |
| 2026-02 | GRID20 | 880.45 | -7.11 % |
| 2026-03 | GRID20 | 907.47 | +3.07 % |
| 2026-04 | HOLD100 | 1011.57 | +11.47 % |
| 2026-05 | HOLD100 | 973.24 | -3.79 % |
| 2026-06 | GRID20 | 830.67 | -14.65 % |
| 2026-07 | GRID20 | 860.45 | +3.58 % |
| 2026-08 | HOLD100 | 1071.95 | +24.58 % |
| 2026-09 | HOLD100 | 1137.31 | +6.10 % |
| 2026-10 | HOLD100 | 1051.99 | -7.50 % |

## Interprétation et limites

- En 2026, le choix SuperTrend atteint **+5,20 %** dans la simulation TOUCH, contre **+3,92 %** pour une Grid ±30 % figée durant dix mois. Mais sa pire baisse quotidienne reste proche de **−23,51 %** et les coûts doublés ramènent la performance à **+2,10 %**.
- **Échec hors de ce profil :** les trois filtres étudiés rendent environ **−12,00 %** en 2025 T1, alors qu'une Grid ±20 % fixe continue produit **+1,21 %**. Un filtre différé peut conserver une exposition élevée lors du retournement qui suit un mois haussier.
- **2024 T1 :** les trois règles ne se différencient pas car elles font les mêmes choix mensuels. Le Buy & Hold 100 % continu surpasse largement les politiques de sélection : **+68,07 %**, contre **+23,28 %** pour les sélections.
- Les politiques opèrent à la fréquence mensuelle ; le signal EMA/SuperTrend est calculé sur un nombre limité de mois. **Aucune supériorité généralisable** démontrée. Les fenêtres ont déjà été connues lors de la conception, donc il ne s'agit pas d'un essai prospectif indépendant.
- Les résultats sont sensibles au chemin des cours, aux hypothèses de remplissage des limites, aux interruptions, aux frais exacts OKX, à la différence de paire BTC/USDC et au caractère figé du paramétrage Grid. Les rendements « TOUCH » ne sont pas une promesse.
- Prochaine vérification recommandée : **séries 2024/2025 plus longues avec règles préenregistrées**, puis flux PAPER prospectif et contrôles de carnets / lots minimaux avant toute conclusion d'exécutabilité.

## Fichiers de preuve

- `SEVEN_HEAVEN_EMA_SUPERTREND_VOLATILITY_GRID_HOLD_REGIME_STUDY_2026_11_11_PROOFS.json` — empreintes et toutes les variantes.
- `SEVEN_HEAVEN_EMA_SUPERTREND_VOLATILITY_GRID_HOLD_REGIME_STUDY_2026_11_11_MONTHLY_DECISIONS.csv` — signaux calculés sur la dernière journée close et décision du mois suivant.
- `SEVEN_HEAVEN_EMA_SUPERTREND_VOLATILITY_GRID_HOLD_REGIME_STUDY_2026_11_11_EQUITY_DAILY.csv` — séries journalières du capital fictif.
- `SEVEN_HEAVEN_EMA_SUPERTREND_VOLATILITY_GRID_HOLD_REGIME_STUDY_2026_11_11.py` — script de reproduction à partir des ZIP originaux, avec dépendance explicite sur le moteur trimestriel (réutilisation du parseur/verrou SHA et du moteur de grille).
- Toutes les sources restent documentaires. **Administrator, Operator, Trader et Bridge inchangés**.
