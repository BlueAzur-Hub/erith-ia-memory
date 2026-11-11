# Seven Heaven — Confirmation des retournements : coût du retard et faux signaux

**11 novembre 2026 · recherche PAPER documentaire · aucune exécution d’ordre.**

## Objet et sources

- 16 fichiers ZIP natifs Binance Spot BTC/USDT 1m vérifiés SHA-256 : **698,400 minutes**.
- Échantillons 2024 T1, 2025 T1 et janvier–octobre 2026 ; janvier sert à initialiser les indicateurs, l’étude des portefeuilles commence au 1er février.
- Trois états existants et inchangés : EMA 10/30 (et close > EMA30), SuperTrend ATR14×3, consensus 2/3 EMA/MACD/ADX.
- Confirmation symétrique : état brut (C1), 2 clôtures consécutives (C2), 3 clôtures (C3). Position initiale cash, jusqu’à premier signal haussier confirmé.
- Toute décision est prise à la clôture UTC du jour D avec exécution fictive à l’ouverture de D+1.
- Capital 1 000 USDT, frais 0,10 % et glissement 0,05 % par côté ; deuxième scénario à coûts doublés ; mark-to-liquidation quotidien.

## Résultats : rentabilité / baisse maximale / transactions / liquidités

### 2024 — 60 jours PAPER

| Stratégie | Rendement net | Coûts ×2 | Drawdown | Opérations | Cash jours | Allers-retours cash ≤7j |
|---|---:|---:|---:|---:|---:|---:|
| EMA 1 clôture(s) | +45.86 % | +44.99 % | -20.53 % | 3 | 8 | 1 |
| EMA 2 clôture(s) | +56.92 % | +56.45 % | -15.24 % | 1 | 8 | 0 |
| EMA 3 clôture(s) | +50.78 % | +50.33 % | -15.24 % | 1 | 9 | 0 |
| SUPERTREND 1 clôture(s) | +31.02 % | +30.62 % | -15.24 % | 2 | 21 | 0 |
| SUPERTREND 2 clôture(s) | +41.65 % | +41.22 % | -15.24 % | 2 | 21 | 0 |
| SUPERTREND 3 clôture(s) | +35.21 % | +34.80 % | -15.24 % | 2 | 21 | 0 |
| CONSENSUS 1 clôture(s) | +41.60 % | +40.75 % | -15.99 % | 3 | 13 | 1 |
| CONSENSUS 2 clôture(s) | +51.65 % | +50.74 % | -15.24 % | 3 | 14 | 1 |
| CONSENSUS 3 clôture(s) | +41.74 % | +40.89 % | -15.24 % | 3 | 15 | 1 |

### 2025 — 59 jours PAPER

| Stratégie | Rendement net | Coûts ×2 | Drawdown | Opérations | Cash jours | Allers-retours cash ≤7j |
|---|---:|---:|---:|---:|---:|---:|
| EMA 1 clôture(s) | -5.78 % | -6.34 % | -5.78 % | 4 | 57 | 1 |
| EMA 2 clôture(s) | -4.90 % | -5.19 % | -4.90 % | 2 | 57 | 0 |
| EMA 3 clôture(s) | -6.02 % | -6.30 % | -6.02 % | 2 | 53 | 0 |
| SUPERTREND 1 clôture(s) | -25.93 % | -26.37 % | -25.93 % | 4 | 27 | 1 |
| SUPERTREND 2 clôture(s) | -17.22 % | -17.72 % | -21.55 % | 4 | 26 | 1 |
| SUPERTREND 3 clôture(s) | -21.61 % | -22.08 % | -26.38 % | 4 | 25 | 1 |
| CONSENSUS 1 clôture(s) | +0.00 % | +0.00 % | 0.00 % | 0 | 59 | 0 |
| CONSENSUS 2 clôture(s) | +0.00 % | +0.00 % | 0.00 % | 0 | 59 | 0 |
| CONSENSUS 3 clôture(s) | +0.00 % | +0.00 % | 0.00 % | 0 | 59 | 0 |

### 2026 — 273 jours PAPER

| Stratégie | Rendement net | Coûts ×2 | Drawdown | Opérations | Cash jours | Allers-retours cash ≤7j |
|---|---:|---:|---:|---:|---:|---:|
| EMA 1 clôture(s) | +3.24 % | -0.42 % | -11.76 % | 24 | 163 | 8 |
| EMA 2 clôture(s) | +3.03 % | +1.19 % | -9.61 % | 12 | 161 | 1 |
| EMA 3 clôture(s) | -2.45 % | -3.90 % | -13.33 % | 10 | 163 | 0 |
| SUPERTREND 1 clôture(s) | +15.80 % | +15.11 % | -14.78 % | 4 | 101 | 0 |
| SUPERTREND 2 clôture(s) | +15.86 % | +15.17 % | -15.16 % | 4 | 101 | 0 |
| SUPERTREND 3 clôture(s) | +22.14 % | +21.41 % | -14.02 % | 3 | 101 | 0 |
| CONSENSUS 1 clôture(s) | +8.12 % | +5.24 % | -14.37 % | 18 | 164 | 4 |
| CONSENSUS 2 clôture(s) | +8.85 % | +7.22 % | -9.65 % | 10 | 162 | 0 |
| CONSENSUS 3 clôture(s) | -0.05 % | -1.54 % | -13.33 % | 10 | 162 | 0 |

## Sorties fictives : ce que Bitcoin fait dans les sept jours

La classification suivante est faite **après les sept jours** et **n’entre jamais dans un signal**. Pour chaque vente fictive, le cours BTC de clôture à J+7 est comparé au prix d’ouverture de vente. Un retour >+3 % signale une reprise potentiellement manquée, une baisse <-3 % une exposition potentiellement évitée. Certaines stratégies rachètent avant J+7 : les catégories **ne sont pas des profits ou des économies réalisées**.

### 2024

| Méthode | Sorties J+7 BTC ≥ +3 % | Sorties J+7 BTC ≤ −3 % | Neutres | Censurées |
|---|---:|---:|---:|---:|
| EMA C1 | 1 | 0 | 0 | 0 |
| EMA C2 | 0 | 0 | 0 | 0 |
| EMA C3 | 0 | 0 | 0 | 0 |
| SUPERTREND C1 | 1 | 0 | 0 | 0 |
| SUPERTREND C2 | 1 | 0 | 0 | 0 |
| SUPERTREND C3 | 1 | 0 | 0 | 0 |
| CONSENSUS C1 | 1 | 0 | 0 | 0 |
| CONSENSUS C2 | 1 | 0 | 0 | 0 |
| CONSENSUS C3 | 1 | 0 | 0 | 0 |

### 2025

| Méthode | Sorties J+7 BTC ≥ +3 % | Sorties J+7 BTC ≤ −3 % | Neutres | Censurées |
|---|---:|---:|---:|---:|
| EMA C1 | 0 | 1 | 1 | 0 |
| EMA C2 | 0 | 0 | 1 | 0 |
| EMA C3 | 0 | 0 | 1 | 0 |
| SUPERTREND C1 | 1 | 1 | 0 | 0 |
| SUPERTREND C2 | 1 | 0 | 1 | 0 |
| SUPERTREND C3 | 1 | 0 | 1 | 0 |
| CONSENSUS C1 | 0 | 0 | 0 | 0 |
| CONSENSUS C2 | 0 | 0 | 0 | 0 |
| CONSENSUS C3 | 0 | 0 | 0 | 0 |

### 2026

| Méthode | Sorties J+7 BTC ≥ +3 % | Sorties J+7 BTC ≤ −3 % | Neutres | Censurées |
|---|---:|---:|---:|---:|
| EMA C1 | 2 | 2 | 8 | 0 |
| EMA C2 | 1 | 2 | 3 | 0 |
| EMA C3 | 1 | 1 | 3 | 0 |
| SUPERTREND C1 | 0 | 1 | 0 | 1 |
| SUPERTREND C2 | 0 | 1 | 0 | 1 |
| SUPERTREND C3 | 0 | 1 | 0 | 0 |
| CONSENSUS C1 | 1 | 0 | 8 | 0 |
| CONSENSUS C2 | 1 | 1 | 3 | 0 |
| CONSENSUS C3 | 1 | 1 | 3 | 0 |

## Lecture critique

- **Un signal confirmé fait moins de transactions, mais peut sortir plus tard.** Il faut regarder simultanément rendement, drawdown, jours en liquidités et rebonds après vente.
- Les séries 2024–2026 sont **déjà exploitées** par les études précédentes : elles ne peuvent ni servir de holdout inédit, ni donner un gagnant universel. Comparaison de sensibilité seulement.
- Un « faux signal » est un jugement rétrospectif ; notre définition opérationnelle d’un aller-retour est vente puis rachat en ≤7 jours, tandis que la classe de J+7 étudie le comportement du prix. Ces mesures ne doivent pas être confondues.
- Une stratégie passant 100 % de la fenêtre en liquidités peut afficher 0 % en évitant tout risque BTC, mais ne produit aucune alpha ; elle peut manquer tout un marché haussier.
- Aucun prix de carnet ni contrôle de file d’attente ; les frais OKX européens et tailles minimales ne sont pas renseignés. Les valorisations et les transactions sont seulement simulées.

## Passation inter-IA : reproduire

- Programme : `SEVEN_HEAVEN_BTC_CONFIRMATION_DELAY_FALSE_EXITS_REBOUND_AUDIT_2026_11_11.py` (nécessite Python 3 et numpy).
- Preuves détaillées : `SEVEN_HEAVEN_BTC_CONFIRMATION_DELAY_FALSE_EXITS_REBOUND_AUDIT_2026_11_11_PROOFS.json`, empreintes SHA-256 des 16 mois et journal de transactions inclus.
- Sorties : `SEVEN_HEAVEN_BTC_CONFIRMATION_DELAY_FALSE_EXITS_REBOUND_AUDIT_2026_11_11_SALE_EVENTS_7D.csv`, `SEVEN_HEAVEN_BTC_CONFIRMATION_DELAY_FALSE_EXITS_REBOUND_AUDIT_2026_11_11_CASH_WINDOWS.csv`, `SEVEN_HEAVEN_BTC_CONFIRMATION_DELAY_FALSE_EXITS_REBOUND_AUDIT_2026_11_11_EQUITY_DAILY.csv`.
- Script source dépend du moteur confirmé publié : `SEVEN_HEAVEN_BTC_REVERSAL_CONFIRMATION_FALSE_SIGNALS_CASH_COST_2026_11_11.py` et de ses modules antérieurs dans le même dossier.
- Les ZIP d’origine restent des actifs GitHub Releases, ne pas les dupliquer dans Git. Les audits locaux vérifient leur SHA-256 avant toute analyse.
- Contrôle causal : **279 comparaisons préfixes/série complète** et concordance exacte des rendements avec les modèles C1/C2 de l’étude précédente.
- Pour une validation indépendante sans réutiliser ces fenêtres, ouvrir une série chronologique non déjà étudiée (par exemple 2023), geler les seuils C1/C2/C3 ici définis, et vérifier coût de la sortie tardive ainsi que les occasions manquées.

**Aucune modification de l’Administrator, Operator, Trader ou Bridge. Aucune transaction réelle.**
