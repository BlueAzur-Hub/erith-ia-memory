# Agent-Crypto — Audit du trajet d'un prix historique EUR / USD

**Date :** 26 octobre 2026  
**Périmètre :** Administrator 40.6.640, cinq actifs BTC/ETH/BNB/XRP/SOL, comparaison Base 100 et rendu du tableau.  
**Sources :** `app(20261026-055035).js` (68 106 lignes ; identique au fichier `main` GitHub blob `c7a8905d956462c3944933558a110ca2742ac1eb`), export Firefox `historique-eur-usd-preuves.json` (`2026-10-26T06:37:46.401Z`, 23 séries), module GitHub `graph-native-usd-406520.js`.  
**Statut :** constat de code et test isolé seulement ; aucune révision, aucun changement des données locales, aucun test graphique end-to-end dans Firefox.

## Réponse principale

**Il n'est pas nécessaire de reconstruire les courbes Base 100.** Le moteur conserve pour chaque point le prix de la série originale dans `rawPrice`, à côté de l'ordonnée `y` normalisée. Il faut en revanche **démontrer la devise de cette série** avant de présenter ce prix en EUR ou en USD. La rupture la plus visible survient plus tard, au moment où le tableau de prix est construit : en comparaison USD/24h, il présente un cours *Market actuel* (ou `—`) à la place de ce `rawPrice` historique.

## Cartographie vérifiée : du prix jusqu'à l'écran

| Étape | Fonction, lignes du fichier transmis | État/risque |
| --- | --- | --- |
| Acquisition comparaison | `atlasFetchComparisonSeriesResilient` 50440–50550 ; `renderComparisonAnalystPanel` 12424–12458 | `rank-5` 24 h sélectionne de façon explicite Binance **EUR** ; les autres modes peuvent suivre les wrappers CoinGecko **USD**. |
| Conservation historique | `atlasStoreChartResult` 5753–5767 ; `atlasGetStoredChartResult` 5770–5809 | Ancienne clé id:période:famille **sans devise**. Validateur de relecture vérifie temporalité et prix positifs, pas la devise de `result.series`. Cache de ce magasin plafonné à 80 entrées. |
| Comparaison | `atlasBuildAlignedComparisonEntries` 11800–11849 | `x=row.t`, `y=row.price/first*100`, **`rawPrice=row.price`** ; pas de perte des prix d'origine à ce stade. |
| Envoi au Chart.js | `drawComparisonChart` 11941–12112 | Enregistre `entry.data` dans chaque dataset. Les options `atlasChartMetadata` ne précisent pas `quoteCurrency`. |
| Devise du graphe | `atlasChartMetadataPlugin.beforeInit` 7288–7305 | `chart.$atlasQuoteCurrency = options.quoteCurrency || 'EUR'` : devise par défaut, pas preuve de la série affichée. |
| Lecture du point | `atlasComparisonTooltipRows` 6712–6733 | Restitue `point.rawPrice` et `point.x` du dataset. Le bon chemin historique est disponible **à condition que les points viennent de la devise demandée**. |
| Tableau au survol | `atlasExternalChartTooltip` 6873–7016 | Pour Top3/Top5/Hausses/Baisses/Volumes **USD et 24h**, choisit `atlasChartMarketUsdObservation` (spot Market) ou `—` au lieu de `row.rawPrice`. Hors de cette exception, le formateur se base sur `chart.$atlasQuoteCurrency`, qui peut encore être « EUR » à tort. |
| Route USD parallèle | `graph-native-usd-406520.js` : `canonicalTop5History`, wrappers et `top5Tooltip` | `rank-5` 24h garde la route canonique EUR même quand USD est choisi. La couche USD de l'écran ne certifie donc pas la devise des séries Base100. Un autre wrapper peut renommer des mentions EUR par simple substitution. |
| Comparaison au marché | `atlasValidateChartSeries` 5663–5727 | Compare `lastPrice` à `c.price` sans paramètre de devise ; `atlasMergeSpotBookIntoCoins` 17178–17195 place le prix **EUR** dans `c.price`. Les avertissements ~12 % sur certaines séries USD sont compatibles avec une comparaison interdevises ; validation `ok=true` peut coexister avec cet avertissement. |
| Sélection du volume | `atlasScannerPool` 15253–15294 | Classe sur `volume24h` sans politique USD commune ; la présentation d'un volume USD est corrigée ailleurs. |

### Démonstration exécutée localement, sur la vraie fonction originale

Test Node.js `audit_tooltip_circuit_existant.cjs` : extraction de **la fonction originale** `atlasExternalChartTooltip` du fichier source transmis, invocation dans un contexte DOM simulé ; les entrées sont fictives pour révéler l'effet de la fonction, ce n'est pas une observation live :

| Cas | `rawPrice` d'entrée | Spot Market simulé | Prix effectivement rendu |
| --- | ---: | ---: | --- |
| Comparaison USD 24h avec spot | 71 366,61 | 80 000 USD | **80 000 USD** (pas le prix historique) |
| Comparaison USD 24h sans spot | 71 366,61 | absent | **—** |
| Comparaison EUR 24h sans spot | 71 366,61 | absent | **71 366,61 EUR** |

Les trois assertions ont réussi et montrent **le comportement actuel**, non la conformité souhaitée. Ne surtout pas « corriger » le problème en remettant aveuglément `rawPrice` sous le libellé USD : l'historique Top5 24h canonique peut venir de Binance **EUR**.

## Échantillon réel Firefox : 23 séries sur cinq actifs

L'export contient **14 clés USD** et **9 anciennes clés sans devise**. Un exemple important, `bitcoin:1:coingecko`, est une ancienne clé *sans devise* dont `declaredCurrency` et `quoteCurrency` sont pourtant **USD** : les formats de clés anciens ne peuvent pas être assimilés globalement à EUR.

Derniers points observés (sources et dates distinctes, non comparables comme cours synchrones) :

| Actif | Échantillon Binance EUR 24h | Échantillon CoinGecko USD |
| --- | --- | --- |
| BTC | 71 366,61 (26/10 05:35Z) | 80 159,31 (26/10 05:50Z, 24h) |
| ETH | 2 066,62 (26/10 05:35Z) | 2 323,48 (25/10 10:33Z, 24h) |
| BNB | 660,72 (26/10 05:35Z) | 737,37 (25/10 10:33Z, 24h) |
| XRP | 1,1478 (26/10 05:35Z) | 1,28763 (26/10 05:07Z, **7j**) |
| SOL | 90,18 (26/10 05:30Z) | 101,45 (25/10 07:08Z, 24h) |

Une source « Binance EUR » se déduit ici du champ de provenance de la série, pas de la seule ancienne clé. L'export ne livre que trois points par série, insuffisants pour auditer tous les points ou recalculer entièrement les courbes.

## Contrat fonctionnel à réaliser AVANT changement de production

1. Une série doit porter **coinId, currency, source/instrument, period, horodatages réels, points, état de validation** et être identifiée en cache par la devise réelle. Éviter de déduire la devise d'un texte sur l'écran.
2. Séparer explicitement **cours historique** `P(coin, timestamp, devise)` et **cours spot** `P(coin, maintenant, devise)` ; chacun a son label, sa source et son horodatage. La courbe normalisée peut garder `rawPrice` mais doit conserver sa preuve de devise par dataset.
3. Partager un même contrat d'acquisition et de lecture de cache pour Solo, Top3, Top5, Hausses, Baisses et Volumes ; retirer les exceptions seulement une fois couvertes par ce circuit commun.
4. Vérifier ensemble les invariants EUR↔USD, temps, source, cache, graphiques et panneaux, puis Market et Lecture Technique, et seulement ensuite modifier ou retirer les wrappers devenus obsolètes.
5. Ne pas effacer/écraser IndexedDB ; protéger la version publiée et Market Core. Une migration doit pouvoir lire les anciens caches sans les rebaptiser sans preuve.

## Ce qui reste non prouvé

La devise de **chaque point** du cache historique, la couverture réelle de toutes les combinaisons (six modes × sept périodes × deux devises), l'ordre effectif de tous les wrappers dans Firefox, la disponibilité réseau, et la fiabilité du Market/Lecture Technique sur tous les actifs. Une lecture de source **ne remplace pas** un test de bout en bout.

**Bilan :** le cœur graphique possède les prix historiques dans sa structure ; le travail prioritaire est de **reconstruire le contrat de devise et d'identité entre l'acquisition et la restitution**, pas de redessiner l'Interface ou ajouter une septième couche de correction.