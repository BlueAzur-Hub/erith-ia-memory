# Seven Heaven — Swing Trading : reprendre l'étude avec les pratiques réelles des traders

**Édition : 10 novembre 2026. Destination : IA Seven Heaven, Coffre crypto.**
**Statut : recherche expérimentale reproductible ; aucun signal financier ; aucune stratégie validée pour des ordres réels.**
**Programme central intégralement préservé** : aucun changement Administrator, Trader, Bridge, opérateurs ou comptes OKX.

## Conclusion lisible par le créateur

**Le Swing Trading n'est pas inutile.** Notre premier essai, avec seulement 20 % du capital engagé et des sorties très rapides, était un **test d'une seule règle**, pas un verdict sur toutes les façons de pratiquer le Swing Trading.

Pour reprendre sérieusement, nous avons étudié trois familles de configurations explicites, en prenant des précautions méthodologiques : **repli dans une tendance**, **cassure de résistance** et **rebond après un excès de baisse**. Ce sont des familles effectivement décrites dans la documentation de Charles Schwab, mais les paramètres exacts ci-dessous restent **nos hypothèses de laboratoire**.

**Constat majeur :** la méthode « attendre un repli puis une reprise » est intéressante dans une phase baissière/irrégulière : **+9,25 % simulé en 2025 avec l'exposition maximale**, contre **−6,62 %** pour un achat-conservation sur la même année et avec les mêmes coûts. **Mais les années 2023–2024, fortement haussières, favorisent massivement le Buy & Hold.** Le Swing reste à valider, et une méthode ne sera pas sélectionnée simplement parce qu'une période lui est favorable.

## Sources professionnelles, hypothèses et limites

**Pratique documentée (hors projet)**
- [Charles Schwab, « What Is Swing Trading and How Does It Work? », 11 août 2026](https://www.schwab.com/learn/story/swing-trading-strategies) : horizons de quelques jours/semaines, pullback, cassure, mean-reversion, règles d'entrée/sortie, stops, gestion des risques.
- [Charles Schwab, « The Ins and Outs of a Swing Trade », 7 mars 2025](https://www.schwab.com/learn/story/ins-and-outs-swing-trade) : trois étapes (direction, objectif, risque), rebond, cassure, exécution fictive.
- [CFA Institute, Backtesting & Simulation, programme 2026](https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/backtesting-and-simulation) : backtests, stress tests et sensibilité.
- [Deprez et Frömmel (2024), « Are simple technical trading rules profitable in bitcoin markets? »](https://doi.org/10.1016/j.iref.2024.05.003) : analyse de 75 360 règles BTC, prise en compte coûts, sur-ajustement et tests hors échantillon. **Ce papier ne valide pas nos propres règles.**

**Source du Coffre :** [archive native quotidienne BTC](../../../../../public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/index.json) : 3 075 journées consécutives de prix **Binance Spot BTC/USDT** entre mai 2018 et septembre 2026 (archive gz SHA-256 `812acb4a087cc43163760a6b397506bb7cb4bbcf8eca692fc686ef9f618b8bfd`).
  
**Programme de reproduction :** [trois méthodes, contrôle chronologique, frais doubles](./SEVEN_HEAVEN_BTC_SWING_THREE_METHODS_WALK_FORWARD_RESEARCH_2026_11_10.cjs).
**Audit et preuves :** [PR #742, script et résultats des tests GitHub Actions](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/742).

## Règles d'entrée et de sortie — non optimisées sur le résultat

| Famille de swing | Entrée à la clôture du jour, exécution le lendemain | Sortie de position | Durée maximale |
|---|---|---|---:|
| **Repli de tendance** | Tendance longue favorable (EMA50 > EMA200), prix au-dessus EMA50, retour du cours au-dessus EMA10 après un repli | Sortie sur clôture sous EMA20 ; stop suiveur 2,5 × ATR14 | 30 jours |
| **Cassure** | Prix franchissant en clôture le **plus haut des 20 jours précédents**, EMA50 > EMA200 | Sortie sous plus bas des 10 jours précédents ; stop suiveur 3 × ATR14 | 60 jours |
| **Rebond** | RSI14 revient au-dessus de 35 après être descendu sous 35 ; prix au-dessus EMA200 | Clôture au-dessus EMA20 ou RSI >= 60 ; stop suiveur 2 × ATR14 | 15 jours |

**Hypothèses communes :** une position BTC longue à la fois, sans effet de levier ni vente à découvert. 1 000 USDT fictifs au début de chaque année ; le capital revient à 1 000 le 1er janvier pour éviter de confondre les résultats d'années distinctes. Deux plafonds d'engagement testés séparément : 25 % et 100 % des liquidités disponibles. Pas de versement de capitaux supplémentaires. Frais 0,10 % + glissement 0,05 % **à chaque côté** de chaque ordre fictif. Stops estimés à partir de l'ATR connu avant la bougie ; un gap sous le stop utilise le prix d'ouverture moins favorable, non un stop garanti. **Aucune décision ne dépend d'une clôture future.**

**Benchmark :** Buy & Hold simulé avec 25 % ou 100 % d'exposition initiale selon le test, même date, même frais/glissement, valorisé après liquidation fictive en fin de fenêtre. Attention : un investisseur Buy & Hold réel n'est pas obligé de vendre en fin d'année.

### Validation chronologique (historique, et non essai prospectif)

- **2020–2022** : période de diagnostic initial / conception ; comprend une forte baisse en 2022.
- **2023–2024** : période de validation historique, sans ajuster les paramètres après observation des résultats.
- **2025–30 septembre 2026** : période de confirmation historique, sans ajuster de nouveau les paramètres ; **2026 est incomplet**.
- Il s'agit d'un **découpage chronologique d'un historique déjà disponible**. Cela ne représente **pas** des gains observés en direct ni une authentique validation prospective.

## Résultats annuels — exposition maximale de 100 % (cas de recherche risqué)

| Année | Swing repli | Swing cassure | Swing rebond | Buy & Hold |
|---|---:|---:|---:|---:|
| 2020 | +78,85 % | +86,65 % | −3,46 % | **+300,78 %** |
| 2021 | −6,02 % | −9,24 % | +13,45 % | **+59,31 %** |
| 2022 | **0,00 %** | **0,00 %** | **0,00 %** | −64,31 % |
| 2023 | +10,65 % | +51,76 % | +7,32 % | **+154,85 %** |
| 2024 | +38,12 % | +24,92 % | +1,73 % | **+120,64 %** |
| 2025 | **+9,25 %** | −7,66 % | −9,35 % | −6,62 % |
| 2026 jusqu'au 30 septembre | −0,58 % | −3,75 % | **0,00 %** | −4,88 % |

Toutes les valeurs sont **fictives et nettes des coûts modélisés**. La stratégie peut être totalement en liquidités sans trade ; le **0 % de 2022** signifie **aucune position**, pas un rendement de gestion du risque garanti. Une exposition à 100 % sur une configuration Swing est agressive et ne constitue pas une recommandation.

**Risque observé aux clôtures :** pour la méthode repli, perte maximale de portefeuille simulée **−34,89 % en 2021** et **−16,81 % en 2023**. Pour la cassure, elle a atteint **−44,23 % en 2021** et **−35,42 % en 2024**. Les pertes intrajournalières et les gaps peuvent être pires ; ces chiffres ne sont pas des limites maximales assurées.

**Nombre d'opérations simulées sur les sept années / les méthodes à 100 %** :
- Repli : **70** positions (30 sur 2020–2022, 27 sur 2023–2024 et 13 sur 2025–septembre 2026).
- Cassure : **32** positions (13, 12 puis 7).
- Rebond : **11** positions (5, 5 puis 1).

Le taux de victoire seul ne garantit rien : il faut examiner la taille des gains et des pertes et la distribution par année.

## Contrôle du biais de taille de position — 25 % au lieu de 100 %

La première étude limitait mécaniquement les gains possibles à une petite fraction du capital. Nous conservons maintenant **deux expositions explicites**, en comparant chaque méthode au Buy & Hold avec **la même proportion initiale**.

Sur les années récentes **2025 et janvier–septembre 2026**, *en recomposant mathématiquement deux années fictives à capital réinitialisé*, on obtient :

| Méthode | 25 % engagé au maximum | 100 % engagé au maximum |
|---|---:|---:|
| Swing repli | **+2,27 %** | **+8,62 %** |
| Swing cassure | −2,68 % | −11,12 % |
| Swing rebond | −2,34 % | −9,35 % |
| Buy & Hold à même exposition initiale | −2,85 % | −11,17 % |

**Important :** les résultats combinés ci-dessus sont les **produits des rendements de deux fenêtres annuelles indépendantes**, et non une vraie série continue avec gestion de position et capital reportés d'une année sur l'autre.

## Validation additionnelle : frais et glissement doublés

Sur **2023–septembre 2026**, avec plafond de capital 100 % et **frais + glissement doublés sur chaque côté** (0,20 % + 0,10 %), le produit mathématique des rendements annuels fictifs aboutit à **+47,22 % pour le repli**, **+59,24 % pour la cassure** et **−2,74 % pour le rebond**. Le Buy & Hold sur ces fenêtres apparaît à +393,53 % **avec coûts doublés** et même méthode d'agrégation annualisée. Cela montre que les conclusions dépendent fortement des phases de marché, même quand les coûts doublent.

## Ce que les IA sont autorisées à conclure

**Faits du laboratoire :**
- Dans l'historique Binance étudié, la méthode de repli montre un rendement positif en 2025, sur 11 opérations (4 gagnantes), alors que la conservation BTC sur la même fenêtre reculait.
- Les méthodes de repli et de cassure évitent les achats en 2022 grâce au filtre de tendance, mais peuvent subir de fortes pertes pendant d'autres années.
- Ni le repli ni la cassure ne reproduit les grands gains du Buy & Hold pendant les fortes tendances haussières de 2020, 2023 ou 2024.
- Doubler les coûts ne rend pas automatiquement ces approches inutiles, mais réduit leurs résultats.
- Les EMA et les règles de risque sont des outils ; les *paramètres retenus ici* ne sont pas une pratique unique ni officielle.

**Ce qui n'a PAS été démontré :**
- Qu'une méthode swing « bat le marché » de façon stable, hors échantillon réel et **sur plusieurs cryptomonnaies**.
- Qu'il est possible de réaliser les stops, les quantités, et les prix fictifs avec des ordres OKX Europe réels ; cette étude ne contrôle pas les carnets.
- Que les actualités ou les liquidations sont des prédicteurs fiables de signaux d'entrée/sortie. L'Observatoire peut en faire des **dossiers d'explication**, pas attribuer des causalités sans preuves.
- Qu'il faille acheter, vendre ou conserver les BTC personnels du créateur aujourd'hui.

## Recommandation concrète et limitée : continuer la recherche, pas déployer une stratégie

**La piste à conserver prioritairement est le Swing de repli dans la tendance**, et la **cassure** sert de comparaison. Le **rebond RSI filtré** a généré trop peu d'occasions sur les dernières fenêtres pour justifier une conclusion.

**Rectification de cadrage (10 novembre 2026) :** l'étude Swing continue sur les années historiques Binance BTC/USDT déjà vérifiées ; la validation d'anciennes archives OKX n'est **pas un préalable obligatoire**. Le contrôle indépendant OKX BTC/USDC d'avril à septembre 2026 est déjà réalisé et préservé. L'accès à davantage d'archives OKX reste un contrôle de robustesse complémentaire, et non un problème technique bloquant. Pour améliorer la fiabilité des résultats, réserver une période future **PAPER non utilisée pour sélectionner les règles**, avec journal de positions et coûts, sans modifier le Trader ou le Bridge. Les observations d'actualité/liquidation restent un contexte d'étude et ne deviennent pas des signaux sans preuves.

**Ne pas optimiser indéfiniment** des dizaines de variantes sur les mêmes données. Avant de tester une nouvelle variante, documenter la raison économique du changement et réserver des données non utilisées pour sélectionner la méthode.

**Verdict actuel :** le Swing Trading est une famille de méthodes réelles qui peut avoir une valeur de recherche. Notre première règle n'était pas représentative ; la nouvelle étude trouve des régimes où des méthodes swing limitent l'exposition et d'autres où elles manquent les grandes hausses. **Viabilité commerciale ou opérationnelle sur OKX : NON DÉMONTRÉE.**
