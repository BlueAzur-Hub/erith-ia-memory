# Seven Heaven — VWAP : étude réelle des signaux sur BTC et ETH

**11 novembre 2026.** Etude rétrospective ; prix et volume issus des archives du Coffre.

## Ce que fait réellement le graphique Bougies

La fonction vwap(rows) de market-microscope-candles.js calcule un cumul du prix typique (haut+bas+clôture)/3 multiplié par le volume des bougies CHARGÉES. Elle ne se réinitialise pas chaque jour.
Le profil Niveaux inclut déjà VWAP. Aucun nouveau profil ou changement de l'interface n'est nécessaire.
La capture montre du BTC/USDC OKX en 15 minutes : nos expériences portent sur BTC/USDT et ETH/USDT Binance en 1 heure. Le VWAP 300 heures glissant n'est donc PAS identique au VWAP calculé sur les ~300 bougies de 15 minutes du graphique.

## Paramètres déclarés avant les résultats

- WINDOW300 : prix traversant le VWAP HLC3 pondéré sur les 300 heures écoulées, fenêtre glissante. Proxy pédagogique du VWAP fenêtre, pas son implémentation exacte en continu.
- SESSION_UTC : VWAP HLC3 pondéré depuis le début de la journée UTC. Les inversions au passage de minuit sont ignorées pour éviter de faux signaux ; une position peut rester ouverte plusieurs jours.
- QUOTE24 : ratio cumulé volume de cotation / volume de base sur 24 heures, franchissement par le cours.
- FILTER24 : au moins deux clôtures au-dessus de QUOTE24 de 0,5 % et EMA24 supérieure à EMA72 pour entrer ; au moins deux clôtures sous QUOTE24 de 0,5 % OU EMA24 sous EMA72 pour sortir.
- Témoins : EMA5/13 horaire, Buy & Hold, liquidités.
- Aucun short, aucune optimisation à partir des résultats, aucun horizon futur connu des règles de décision.

## Données et protocole

- Six fichiers historiques horaires BTC/USDT et ETH/USDT, années 2024, 2025 et janvier–octobre 2026, SHA-256 et continuité vérifiés avant calcul.
- 24 840 heures par actif ; du 1er janvier 2024 au 31 octobre 2026. Test continu du 1er février 2024 au 31 octobre 2026, préchauffage de plus de 300 heures.
- Capital initial 1 000 USDT ; exposition fictive 100 % ou 25 % des liquidités à chaque entrée ; frais 0,1 % / côté et glissement supposé 0,05 % / côté ; test à coûts doublés.
- Signal uniquement sur bougie horaire clôturée ; achat ou vente fictif à l'ouverture de l'heure suivante ; liquidations de fin d'étude pour valoriser le capital.
- Drawdown calculé sur valeur liquidable aux clôtures journalières, non sur les pires mouvements intrajournaliers.
- Résultats annuels séparés : le capital repart à 1 000 USDT en 2024, 2025 et 2026 ; ne pas additionner ces trois expériences au résultat continu.
- La comparaison ETH teste un deuxième actif, pas une deuxième plateforme ; l'étude n'est ni prospective ni une évaluation de carnets d'ordres.

## BTC/USDT — historique continu (allocation 25 %)

| Méthode | Rendement | Pire drawdown | Achats | Gains/pertes des transactions | Coûts doublés |
|---|---:|---:|---:|---:|---:|
| HLC3 × volume, VWAP glissant 300 heures | -12.65% | -22.94% | 349 | 41/308 | -32.74% |
| HLC3 × volume, VWAP séance UTC | -70.74% | -71.70% | 1873 | 361/1512 | -92.80% |
| Volumes base/quote, VWAP glissant 24 heures | -57.47% | -59.96% | 1310 | 231/1079 | -84.04% |
| VWAP quote/base 24h + EMA24/72 + écart 0,5 %, deux confirmations | -0.44% | -15.68% | 244 | 82/162 | -17.09% |
| Croisement EMA5/13 horaire (témoin) | -41.41% | -44.95% | 930 | 222/708 | -70.79% |
| Buy & Hold (témoin) | +20.41% | -26.12% | 1 | 1/0 | +20.28% |
| Liquidités (témoin) | +0.00% | 0.00% | 0 | 0/0 | +0.00% |

## ETH/USDT — contrôle sur un autre actif (allocation 25 %)

| Méthode | Rendement | Drawdown | Achats |
|---|---:|---:|---:|
| HLC3 × volume, VWAP glissant 300 heures | -4.86% | -22.80% | 362 |
| HLC3 × volume, VWAP séance UTC | -64.48% | -64.95% | 1823 |
| Volumes base/quote, VWAP glissant 24 heures | -53.86% | -56.65% | 1354 |
| VWAP quote/base 24h + EMA24/72 + écart 0,5 %, deux confirmations | -9.44% | -19.43% | 289 |
| Croisement EMA5/13 horaire (témoin) | -41.51% | -45.10% | 956 |
| Buy & Hold (témoin) | -0.38% | -27.89% | 1 |
| Liquidités (témoin) | +0.00% | 0.00% | 0 |

## Fenêtres annuelles indépendantes (allocation 25 %)

| Stratégie | BTC 2024 | BTC 2025 | BTC 2026 | ETH 2025 |
|---|---:|---:|---:|---:|
| HLC3 × volume, VWAP glissant 300 heures | +3.41% | -10.69% | -5.42% | -9.69% |
| HLC3 × volume, VWAP séance UTC | -28.07% | -37.96% | -34.44% | -27.60% |
| Volumes base/quote, VWAP glissant 24 heures | -20.92% | -29.05% | -24.20% | -24.52% |
| VWAP quote/base 24h + EMA24/72 + écart 0,5 %, deux confirmations | +11.03% | -8.06% | -2.48% | -8.57% |
| Croisement EMA5/13 horaire (témoin) | -10.53% | -21.40% | -16.68% | -19.82% |
| Buy & Hold (témoin) | +29.78% | -1.65% | -2.94% | -2.81% |
| Liquidités (témoin) | +0.00% | +0.00% | +0.00% | +0.00% |

## Principales limites

- Le volume-quote / volume-base reflète le prix moyen pondéré dans les agrégats Binance, alors que l'indicateur Administrator calcule HLC3 pondéré ; ces deux mesures diffèrent.
- Les croisements fréquents peuvent engendrer de nombreux frais ; une stratégie qui évite les pertes dans un test peut rater les hausses dans un autre.
- Aucun prix VWAP ni signal de ce rapport ne doit être pris comme la valeur instantanée du graphique OKX en 15 min.
- Données historiques déjà connues ; aucun test hors-échantillon prospectif ni preuve que ces paramètres soient optimaux.
- Les actifs BTC personnels conservés en Swing / Buy & Hold ne sont pas modélisés dans ces portefeuilles fictifs.

## Reproduction et sources

- Script : SEVEN_HEAVEN_BTC_ETH_VWAP_STRATEGIES_CONTINUOUS_BACKTEST_2026_11_11.py
- JSON : SEVEN_HEAVEN_BTC_ETH_VWAP_STRATEGIES_CONTINUOUS_BACKTEST_2026_11_11.json
- Archives : public/agent_crypto_erith_ia/data/historical_archive_prototype/calendar_year_hourly_shards/
- Graphique Administrator : public/agent_crypto_erith_ia/administrator/js/market-microscope-candles.js
- Référence pédagogique : https://fr.tradingview.com/support/solutions/43000502018/
