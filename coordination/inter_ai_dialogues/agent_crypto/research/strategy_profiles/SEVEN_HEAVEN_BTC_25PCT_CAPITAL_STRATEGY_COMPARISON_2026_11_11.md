# SEVEN HEAVEN — Douze stratégies Bitcoin à exposition réduite (25 %)

**Étude : 11 novembre 2026.** **Fenêtre : du 1er janvier 2019 au 30 septembre 2026.**
**Statut : recherche historique uniquement, aucun ordre réel.**

## Question testée

Une stratégie du catalogue peut-elle dépasser Donchian 55 (à 25 % du capital disponible engagé lors de chaque entrée),
tout en gardant un drawdown quotidien historique inférieur ou égal en valeur absolue ?

Il s'agit d'une comparaison DES DEUX MESURES HISTORIQUES, pas d'une promesse de moindre risque global ni d'une sélection automatique.

## Règles communes et vérification

- Source **Binance Spot BTC/USDT**, 3 075 bougies quotidiennes dans l'archive d'origine, empreinte SHA-256 contrôlée par le moteur canonique.
- Fenêtre identique : 2 830 journées de 2019 à septembre 2026, capital initial fictif **1 000 USDT**, non réinitialisé chaque année.
- Frais 0,10 % par côté, glissement présumé de 0,05 % par côté, ordre à l'ouverture quotidienne suivante ; long ou liquidités, sans levier.
- À chaque entrée, engager **25 % des liquidités disponibles**, conserver le reste, réinvestir seulement lors d'un prochain signal ; sans rééquilibrage annuel.
- Les **règles d'entrée, sortie, ATR et durée maximale** sont celles de chaque méthode déjà enregistrée : elles ne sont pas ajustées en fonction des résultats.
- Chaque original à 100 % est recomputé et comparé CHAMP PAR CHAMP au référentiel existant ; les comptes d'opérations à 25 % doivent également correspondre.
- Stress séparé avec frais et glissement doublés (0,20 % et 0,10 % par côté).
- Le drawdown est évalué quotidiennement sur le portefeuille fictif complet, liquidités comprises.

## Résultats sur la même période

| Méthode | Capital final USDT | Gain net | Drawdown max. | Opérations G/P | Temps avec BTC | Gain si coûts doublés | Pareto face à Donchian 25 % ? |
|---|---:|---:|---:|---:|---:|---:|---|
| Tendance EMA20 > EMA50 (EMA20_50) | 3,458.00 | +245.800% | -21.090% | 22 (10/12) | 55.87% | +239.377% | NON |
| Momentum positif 90 jours (MOM90) | 3,142.41 | +214.241% | -28.205% | 48 (15/33) | 56.89% | +202.565% | NON |
| Clôture au-dessus de EMA200 (PRICE_EMA200) | 2,702.19 | +170.219% | -34.392% | 42 (11/31) | 60.57% | +161.368% | NON |
| Tendance EMA50 > EMA200 (EMA50_200) | 2,575.70 | +157.570% | -37.584% | 7 (5/2) | 64.31% | +155.797% | NON |
| Momentum positif 180 jours (MOM180) | 2,446.09 | +144.609% | -37.137% | 27 (13/14) | 60.60% | +139.316% | NON |
| Cassure 20 j, sortie 10 j (DON20) | 1,843.16 | +84.316% | -16.597% | 51 (20/31) | 38.62% | +77.294% | NON |
| Cassure 55 j, sortie 20 j (DON55) | 1,618.72 | +61.872% | -12.018% | 29 (16/13) | 29.19% | +58.310% | RÉFÉRENCE |
| Repli EMA10 avec filtre EMA50/200 (PULLBACK_FILTERED) | 1,577.82 | +57.782% | -13.914% | 79 (25/54) | 24.70% | +48.566% | NON |
| Cassure 20 j avec filtre EMA50/200 (DON20_TREND) | 1,452.29 | +45.229% | -14.246% | 36 (14/22) | 25.12% | +41.327% | NON |
| Retour à la moyenne, écart-type 2 sur 20 j (MEANREV_Z2) | 1,149.51 | +14.951% | -17.608% | 71 (38/33) | 18.30% | +8.787% | NON |
| Rebond RSI35 sans filtre EMA200 (ablation) (REBOUND_UNFILTERED) | 1,052.15 | +5.215% | -6.481% | 38 (23/15) | 9.75% | +2.261% | NON |
| Rebond RSI35 au-dessus de EMA200 (REBOUND_FILTERED) | 1,040.92 | +4.092% | -4.124% | 12 (6/6) | 2.40% | +3.163% | NON |

## Verdict de recherche

- Donchian 55 à 25 % : **+61.872 %** de variation finale, **-12.018 %** de pire baisse quotidienne, sur **29 opérations**.
- Méthodes dépassant son rendement sans dépasser son drawdown historique : **0**.
- **Aucune méthode n'atteint les deux critères sur cette fenêtre historique.** Cela ne signifie pas que Donchian 55 est optimal ou sûr.

## Exemples de situations difficiles : années 2022, 2025 et 2026 (partielle)

| Méthode | 2022 | 2025 | 2026 janv.-sept. |
|---|---:|---:|---:|
| EMA20_50 | -10.894% | +0.321% | +1.181% |
| MOM90 | -9.634% | +3.739% | -2.733% |
| PRICE_EMA200 | -2.022% | -2.520% | +3.318% |
| EMA50_200 | -2.339% | -0.773% | +1.972% |
| MOM180 | -2.790% | +1.501% | +5.211% |
| DON20 | -10.711% | -1.763% | +2.303% |
| DON55 | -2.674% | -0.935% | -0.877% |
| PULLBACK_FILTERED | +0.000% | +2.397% | -0.124% |
| DON20_TREND | +0.000% | -1.763% | -0.937% |
| MEANREV_Z2 | -13.165% | +5.042% | -6.003% |
| REBOUND_UNFILTERED | -0.388% | -1.783% | -0.911% |
| REBOUND_FILTERED | +0.000% | -2.336% | +0.000% |

## Réserves indispensables

- Les données historiques ont déjà servi au développement des hypothèses : **aucune validation prospective indépendante** n'a été faite ici.
- Douze méthodes apparentées ont été comparées après coup : **biais de sélection / multiple testing** ; une supériorité apparente ne devient pas une règle fiable.
- Un plus faible drawdown passé ne signifie pas une moindre perte possible à l'avenir : liquidité, sauts de cours, dysfonctionnements d'exchange, et exécution des stops ne sont pas garantis.
- Le système n'est pas un trader multi-actifs : les fonds non investis sont supposés rester disponibles en USDT et n'intègrent ni taux, ni risque propre au stablecoin.
- Les transactions historiques restent modélisées avec des bougies OHLC journalières ; pas de carnet historique ni de test de gap d'exécution réel.
- Ce test **n'utilise pas le BTC/USDC d'OKX** ni les bougies intrajournalières 15 min affichées dans l'Administrator. Les signaux ne sont pas transposables tels quels.
- Aucune donnée de portefeuille utilisateur, aucun ordre, aucune écriture dans Administrator, Trader, Operator ou Bridge.

## Fichiers partagés

- **Script** : SEVEN_HEAVEN_BTC_25PCT_CAPITAL_STRATEGY_COMPARISON_2026_11_11.py
- **Données structurées** : SEVEN_HEAVEN_BTC_25PCT_CAPITAL_STRATEGY_COMPARISON_2026_11_11.json
- **Trajectoires quotidiennes** : SEVEN_HEAVEN_BTC_25PCT_CAPITAL_STRATEGY_COMPARISON_2026_11_11.csv

Tous les fichiers sont sous coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/.
