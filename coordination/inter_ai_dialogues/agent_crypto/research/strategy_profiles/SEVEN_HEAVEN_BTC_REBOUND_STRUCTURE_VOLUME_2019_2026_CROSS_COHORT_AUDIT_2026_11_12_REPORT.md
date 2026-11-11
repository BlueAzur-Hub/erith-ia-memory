# Seven Heaven — Robustesse croisée des creux ascendants, volumes et EMA, BTC 2019–2026

**12 novembre 2026 — recherche documentaire PAPER, lecture seule.**

## Résumé exécutif

Sur **119 rebonds candidats**, **113 évaluables** à J+10 et **28 validés** par trois clôtures quotidiennes ascendantes (« C3 »), le choix supplémentaire de **creux ascendants** ne se révèle pas robuste d'une période à l'autre ; le volume relatif élevé **n'améliore pas** les résultats observés ; le filtre **EMA10/EMA30** donne une différence descriptive favorable, mais les sous-groupes par année sont trop petits pour conclure à une efficacité prédictive.

Le protocole a été publié **avant la consolidation** : `SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_2019_2026_CROSS_COHORT_PROTOCOL_2026_11_12.md`, commit `a66a5ba`. Les événements proviennent de **deux études antérieures** déjà effectuées ; cette analyse **n'est pas une nouvelle validation indépendante** et ne valide aucun signal de trading.

## Cohortes et provenance

| Cohorte | Couverture | Candidats | Évaluables | C3 | C3 positifs | Rendement moyen C3 |
|---|---|---:|---:|---:|---:|---:|
| 2019–2021 | 3 années complètes, source 1d réconciliée | 76 | 73 | 18 | 11 | +4,09 % |
| 2022–2026 | 5 **fragments** d'années, source 1m agrégée en 1d | 43 | 40 | 10 | 5 | −0,61 % |
| **Ensemble** | 8 années représentées, couverture inégale | **119** | **113** | **28** | **16** | **+2,41 %** |

Le résultat C3 positif correspond à un rendement net > 0 % entre **l'ouverture J+3 et la clôture J+10** d'un achat hypothétique. **Les épisodes sont indépendants : ces pourcentages ne sont ni un rendement de portefeuille continu ni composables**. Coûts fictifs : frais 0,10 % et glissement 0,05 % par côté, avec stress coûts ×2. L'intervalle descriptif de Wilson à 95 % pour **16 positifs sur 28** est **[39,07 % ; 73,49 %]** : large et insuffisant pour parler de précision prédictive.

## Valeur marginale des trois filtres, conditionnellement à C3

| Filtre ajouté | Avec : succès / épisodes | Avec : rendement moyen | Sans : succès / épisodes | Sans : rendement moyen | Différence moyenne avec−sans |
|---|---:|---:|---:|---:|---:|
| Creux ascendants LOW3 | 10 / 17 | +3,66 % | 6 / 11 | +0,49 % | **+3,18 points** |
| Volume BTC >= moyenne des 20 jours précédents | 7 / 15 | +0,49 % | 9 / 13 | +4,64 % | **−4,15 points** |
| EMA10 > EMA30 et clôture > EMA30 | 12 / 19 | +5,17 % | 4 / 9 | −3,41 % | **+8,58 points** |
| LOW3 + volume + EMA (tous ensemble) | 4 / 7 | +3,86 % | — | — | Aucun contraste valide isolable |

Les différences avec/sans **ne démontrent pas une contribution causale** : le filtre EMA est corrélé à la phase de marché, et les sous-groupes sont parfois quasi vides. **Aucun des trois filtres ne doit être recommandé pour une exécution automatique** sur cette base.

## Épreuve de stabilité : retirer une année

- **LOW3 :** différence globale **+3,18 points**, mais devient **−0,75 point lorsque 2021 est retirée**. L'avantage apparent des creux n'est donc pas stable.
- **Volume :** différence globale **−4,15 points**. Elle reste négative lors de chacun des huit retraits d'année (variation environ **−2,10 à −6,27 points**). Il ne faut pas inverser ce résultat pour fabriquer une règle « faible volume = bon achat » ; la comparaison est historique, non causale.
- **EMA :** différence globale **+8,58 points** et reste positive aux retraits d'une année (**+4,27 à +10,51 points**). MAIS une vraie comparaison des deux modalités **dans une même année** n'est possible que sur **2019, 2021 et 2026** ; l'essentiel de la variation interannuelle demeure non contrôlé. Le résultat est une **piste**, pas une validation.

## En quoi la nouvelle étude améliore-t-elle la précédente ?

1. L'analyse initiale des captures et de la règle des trois jours comptait vingt épisodes, puis quarante épisodes évaluables sur 2022–2026. En ajoutant **2019, 2020 et 2021**, elle atteint **113 épisodes évaluables** sur huit années représentées, sans inventer les mois manquants de 2022–2026.
2. Le même événement est noté avec et sans LOW3/VOL/EMA ; **les métriques sont calculées sur le même horizon J+3→J+10** et les mêmes coûts. Pas de rebalance mensuel ni de signal antérieur alimenté avec des cours futurs.
3. Les analyses **leave-one-year-out** repèrent les conclusions trop dépendantes d'une seule année. Les effectifs par année et les deux cohortes sont publiés séparément pour éviter une impression trompeuse de robustesse.
4. Les volumes sont les **volumes de base Binance Spot BTC/USDT**, pas des flux mondiaux ni des volumes OKX BTC/USDC ; leurs variations ne permettent pas d'identifier à elles seules acheteurs et vendeurs.

## Audit de sources et reproductibilité

- **Protocole pré-consolidation :** `SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_2019_2026_CROSS_COHORT_PROTOCOL_2026_11_12.md`.
- **Script autonome :** `SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_2019_2026_CROSS_COHORT_AUDIT_2026_11_12.py` (standard library Python 3, aucune connexion de compte ni dépendance externe). Lire les deux CSV sources existants dans ce dossier, contrôler les schémas, calculer les groupes et comparer au JSON de preuves avec `--check-proof`.
- **Preuve structurée complète :** `SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_2019_2026_CROSS_COHORT_AUDIT_2026_11_12_PROOFS.json` : métriques, années, cohortes, exclusions, intervalles de Wilson, contrastes intra-année et retraits d'années, blobs Git des sources.
- **Événements harmonisés :** `SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_2019_2026_CROSS_COHORT_AUDIT_2026_11_12_UNIFIED_EVENTS.csv` : 119 événements, dont 6 censurés et exclus des indicateurs de performance.
- **Source amont 2019–2021 :** `SEVEN_HEAVEN_BTC_REBOUND_2019_2021_DAILY_HOLDOUT_AUDIT_2026_11_11_EVENTS.csv`, tiré de la référence quotidienne BTC/USDT réconciliée du Coffre (SHA-256 gzip `812acb4a087cc43163760a6b397506bb7cb4bbcf8eca692fc686ef9f618b8bfd`). La couverture **quotidienne** est continue, mais **5 881 minutes sources** restent absentes ; ce document ne réclame pas leur intégrité minute.
- **Source amont 2022–2026 :** `SEVEN_HEAVEN_BTC_REBOUND_STRUCTURE_VOLUME_EXPANDED_EVENTS_2026_11_11_EVENTS.csv`, calculé depuis 22 ZIP BTCUSDT minute déjà SHA-256 vérifiés, **uniquement les fenêtres disponibles** : 2022 mai–juin ; 2023 avril–juin ; 2024 janvier–mars ; 2025 janvier–mars ; 2026 janvier–octobre.

## Résultat et décision scientifique

**Ne pas intégrer les creux ascendants, volumes ni EMA comme filtre automatique du Trader.** Le critère LOW3 perd son avantage si on retire 2021, et l'information apportée par les volumes n'est pas démontrée. Les EMA méritent une recherche mieux contrôlée **sur des périodes vraiment inédites ou un autre instrument**, sans adapter les seuils aux résultats. Un bon modèle descriptif n'est pas un prédicteur démontré.

**Statut :** publication documentaire et scientifique dans le Coffre inter-IA, PAPER uniquement. Aucun ordre et aucune modification de l'Administrator, Operator, Trader ou Bridge.
