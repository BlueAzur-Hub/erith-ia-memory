# Seven Heaven — Protocole de consolidation rebond / creux / volume, 2019–2026

**12 novembre 2026 — étude exploratoire documentaire, PAPER, sans exécution réelle.**

## Objet et sources déjà publiées

Déterminer si les **creux quotidiens ascendants (LOW3)**, les **volumes relatifs** et les **EMA 10/30** ajoutent une information aux **trois clôtures strictement montantes (C3)** dans nos études de rebonds BTC/USDT. Vérifier la cohérence entre régimes et années plutôt que d'optimiser des paramètres sur les mêmes données.

Sources immuables lues depuis ce répertoire :
- `SEVEN_HEAVEN_BTC_REBOUND_2019_2021_DAILY_HOLDOUT_AUDIT_2026_11_11_EVENTS.csv` — 2019–2021, données quotidiennes Binance Spot 1d réconciliées (archive 3 075 jours, SHA-256 `812acb4a087cc43163760a6b397506bb7cb4bbcf8eca692fc686ef9f618b8bfd`).
- `SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_EXPANDED_EVENTS_2026_11_11_EVENTS.csv` — périodes **incomplètes** de 2022–2026, agrégations quotidiennes de 22 fichiers BTC/USDT 1m SHA-256 vérifiés (960 480 minutes).

Ces deux cohortes utilisent le même schéma de décision : première clôture montante après baisse de 2,5 % depuis un sommet de 30 clôtures, espacement minimal de 11 jours, C3 et LOW3 sur J0–J+2, volume à J+2 comparé aux 20 jours précédents, tendance EMA10 > EMA30 et clôture > EMA30 ; scénario nominal entrée fictive à l'ouverture J+3 et valeur à la clôture J+10 avec 0,1 % frais + 0,05 % glissement par côté. Sans réinitialisation fictive du prix final lors des sous-groupes.

## Analyses figées

1. Ne combiner que les événements évaluables (`right_censored=false`). Publier candidats, censurés, C3, C3+LOW3, C3+VOL, C3+EMA, C3+LOW3+VOL+EMA et témoins non-C3.
2. Pour chaque sous-groupe C3, calculer **effectif, nombre de résultats nets positifs, proportion, moyenne et médiane du rendement net fictif** ; calculer le contraste YES−NO pour LOW3, VOL et EMA. La comparaison principale doit rester conditionnelle à C3 ; aucune interprétation du taux de validation en probabilité future.
3. Refaire séparément 2019–2021, 2022–2026, et par année, en reconnaissant que les plages 2022–2026 sont seulement des fragments de l'année.
4. Rendre explicites les **années ayant les deux modalités** (oui et non). Pour ne pas confondre années et filtres, calculer une différence des moyennes des rendements à l'intérieur de chaque année admissible, puis une moyenne pondérée par son nombre d'épisodes C3. Pas d'inférence causale.
5. Incertitude des proportions par intervalle de Wilson descriptif et contrôle d'instabilité *leave-one-year-out* du contraste global. Ne pas faire de sélection adaptative à partir des résultats obtenus.
6. Publier la table unifiée normalisée, un JSON de preuves, un script autonome reproductible lisant les CSV sources, et un rapport narratif. Contrôles : schémas attendus, dates uniques, types booléens, bornes de valeurs, aucune fuite d'observations censurées, régularité des noms de colonnes, total cohérent, et relecture GitHub après publication.

## Précautions et conclusion admissible

Les années ont **déjà servi à l'exploration** et 2021 a précédemment été annoncé comme année de contrôle : le panel combiné **ne constitue pas une validation hors échantillon neuve**. Les indicateurs ne sont pas causalement assignés ; les épisodes restent dépendants de l'état du marché, même après espacement. Le calcul d'une fraction gagnante n'est pas une probabilité prévisionnelle. Les résultats J+3→J+10 des épisodes isolés ne correspondent pas à un portefeuille exécutable ou composé. Les données quotidiennes réconciliées gardent 5 881 minutes natives absentes, ne jamais prétendre l'inverse. Aucune modification de l'Administrator, de l'Operator, du Trader ou du Bridge.
