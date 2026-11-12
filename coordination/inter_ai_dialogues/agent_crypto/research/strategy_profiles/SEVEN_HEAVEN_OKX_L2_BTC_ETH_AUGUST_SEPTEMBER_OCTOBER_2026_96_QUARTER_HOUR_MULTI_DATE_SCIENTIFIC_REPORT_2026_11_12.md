# Seven Heaven — BTC/ETH OKX Spot USDC : 576 états L2 sur trois dates, 96 quarts d’heure par journée

**Rapport publié le 12 novembre 2026** · Source : archives historiques officielles OKX L2 Spot 400 niveaux · Périmètre : **15 août, 15 septembre, 15 octobre 2026**, BTC-USDC et ETH-USDC · Recherche **PAPER**, lecture seule, **aucun ordre réel**.

## Résumé des travaux vérifiés

**Objectif atteint :** une méthode déjà validée sur octobre a été rejouée sans modifier les règles sur les archives des 15 août et 15 septembre. Le résultat réunit **6 archives complètes**, **9 628 137 événements JSON**, **576 états de carnet échantillonnés** (3 journées × 2 actifs × 96 horaires de 15 minutes), **288 comparaisons de spreads BTC contre ETH** et **2 880 comparaisons de coûts théoriques par côté** (soit 5 760 coûts individuels avant frais).

**Fait observé :** sur ces **288 couples à dates et horaires communs**, le spread relatif ETH/USDC est plus large que celui de BTC/USDC **276 fois** ; BTC est plus large **12 fois**, aucune égalité. Les spreads d'octobre sont beaucoup plus resserrés dans cette grille que ceux des deux autres journées. Ces différences apparaissent déjà au sein des trois journées et restent **descriptives**, pas une loi générale de marché.

Les quatre nouvelles archives, leurs 96 états par actif, les coûts, les SHA-256 intégraux et la concordance des quatre références historiques 00/06/12/18 UTC sont publiés sur `main`. Un second programme **Python hors réseau**, indépendant des agrégats initiaux, a recalculé les **576 états**, les **288 couples de spreads**, les **2 880 couples de coûts** et toutes les statistiques publiées. [Contrôle indépendant GitHub Actions : SUCCESS](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43270275600).

## 1. Méthode publiée avant lecture des nouvelles archives

- [**Protocole gelé avant l'extension à 96 horaires d'août et septembre**](./SEVEN_HEAVEN_OKX_BTC_ETH_AUGUST_SEPTEMBER_2026_NINETY_SIX_QUARTER_HOURS_FROZEN_PROTOCOL_2026_11_12.md), commit `da2450eea42fe5e351bebe680aa1a2179fdc620e`.
- Deux nouvelles journées (**15 août et 15 septembre 2026**), deux actifs (**BTC-USDC et ETH-USDC**) : aucune substitution de date ou de monnaie. Les archives du 15 octobre restent la référence précédemment validée.
- **96 horaires UTC prédéterminés** par date/actif, du `00:00` au `23:45` toutes les quinze minutes. Le **premier état reconstruit valide à ou après** chacun des horaires, retard maximum **60 s** ; pas d'interpolation ni de sélection ex post.
- Chaque archive relue intégralement en **flux** `gzip → tar → NDJSON` ; contrôles CRC gzip, SHA-256 du fichier compressé **complet** et du membre `.data` **complet** ; enveloppe de sécurité **230 Mo compressés / 1,4 Go décompressés par source**. Aucun gros fichier brut committé.
- **20 premiers hashes JSON** et les **4 anciennes ancres** par fichier doivent correspondre exactement aux précédentes études. Refus d'un ordrebook croisé/vide, d'un delta avant snapshot, d'une identité erronée, d'un timestamp impossible ou d'un prix/size invalide.
- Les snapshots complètes réelles sont comptées et horodatées séparément. **96 snapshots vérifiées par archive**, décalées de **0 à 9 ms** après les horaires fixes selon l'actif/la date. Les 576 états retenus correspondent ainsi à des snapshots réelles, pas à des extrapolations.
- Pour chaque état : spread relatif en bp, meilleur bid/ask, profondeur et prix moyen de carnet (VWAP fictif vs mid) pour **10, 100, 1 000, 10 000 et 100 000 USDC**, sur les côtés **achat et vente**, **hors frais** et **sans exécution**.

[GitHub Actions : quatre nouveaux replays intégraux et publication, SUCCESS](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43269358892).

## 2. Résultats — échantillon dense de 96 horaires par journée

*Un point de base (bp) correspond à 0,01 %. Les percentiles sont des percentiles empiriques interpolés de type 7, non des garanties de coût ou des statistiques continues du marché.*

| Jour UTC | Actif | Moyenne des 96 spreads (bp) | Médiane (bp) | 90e percentile (bp) | Max observé (bp) |
|---|---|---:|---:|---:|---:|
| 15 août | BTC-USDC | **0,108302** | 0,015880 | 0,365162 | 0,872803 |
| 15 août | ETH-USDC | **0,854503** | 0,903002 | 1,488657 | 1,703324 |
| 15 septembre | BTC-USDC | **0,322991** | 0,052425 | 0,717806 | **3,577582** |
| 15 septembre | ETH-USDC | **1,250564** | 1,327484 | **2,106836** | **2,765846** |
| 15 octobre | BTC-USDC | **0,023063** | 0,012281 | 0,012384 | 0,887892 |
| 15 octobre | ETH-USDC | **0,245866** | 0,042243 | 0,669417 | 2,603805 |

**Observation principale :** les trois journées diffèrent très nettement. Sur notre grille, septembre présente les spreads moyens les plus larges pour BTC et ETH ; octobre présente les plus faibles. Les **maxima** peuvent être très différents de la médiane et indiquent des épisodes ponctuels à auditer, **sans preuve de leur cause**.

### Pourquoi quatre horaires étaient insuffisants

Les premières études utilisaient **00:00, 06:00, 12:00, 18:00 UTC seulement**. La comparaison **sur les mêmes archives** des moyennes calculées sur quatre points puis sur 96 points montre le risque d'un échantillonnage trop sparse :

| Jour | BTC 4 h (bp) | BTC 96 points (bp) | ETH 4 h (bp) | ETH 96 points (bp) |
|---|---:|---:|---:|---:|
| 15 août | 0,317521 | **0,108302** | 1,316726 | **0,854503** |
| 15 septembre | 0,326848 | **0,322991** | 0,840008 | **1,250564** |
| 15 octobre | 0,012295 | **0,023063** | 0,041804 | **0,245866** |

En août, les **quatre points surestimaient** la moyenne de notre grille plus dense ; en octobre, ils la **sous-estimaient**. On ne doit donc pas utiliser les quatre heures pour prétendre obtenir la distribution d'une journée. **Même la moyenne à 96 points n'est pas la moyenne pondérée par le temps de tous les états intermédiaires.**

## 3. Trois dates combinées — uniquement 288 points par actif

En réunissant **les 96 observations de chacune des trois dates** sans leur attribuer de représentativité mensuelle :

| Statistique descriptive sur 288 points/actif | BTC-USDC | ETH-USDC |
|---|---:|---:|
| Moyenne du spread (bp) | **0,151452** | **0,783644** |
| Médiane (bp) | 0,015855 | 0,795563 |
| 90e percentile empirique (bp) | 0,466913 | 1,554063 |
| Minimum (bp) | 0,012132 | 0,040159 |
| Maximum (bp) | **3,577582** | **2,765846** |
| Nombre de valeurs >0,1 bp | 79/288 | 193/288 |
| Nombre de valeurs >0,5 bp | 26/288 | 174/288 |

**ETH présente le spread le plus large sur 276/288 observations appariées**, mais pas partout et pas toujours. En particulier, le maximum BTC atteint **3,5776 bp** dans l'archive du 15 septembre, supérieur au maximum ETH de ces trois dates.

Une moyenne fondée sur **trois dates fixes** n'est pas une moyenne de toutes les journées d'août, septembre ou octobre. Ces journées n'ont pas été classées au préalable par régime haussier, latéral ou baissier.

## 4. Effet de la profondeur : achats/ventes fictifs, hors frais

La friction calculée est l'écart du prix moyen de carnet depuis le mid au même instant. Pour un achat, le notionnel USDC consomme les asks ; pour une vente, la quantité d'actif est `notionnel/mid` et consomme les bids. Le carnet est **figé** au moment de la simulation, sans latence, annulation ni garantie de transaction.

**Moyenne des 288 observations par actif et côté :**

| Notionnel / côté | BTC-USDC (bp) | ETH-USDC (bp) |
|---|---:|---:|
| 1 000 USDC — achat | 0,137466 | 0,564372 |
| 1 000 USDC — vente | 0,137572 | 0,541997 |
| 100 000 USDC — achat | **1,849004** | **5,042260** |
| 100 000 USDC — vente | **1,638030** | **5,085002** |

**90e percentiles empiriques sur les mêmes 288 états :**

| Notionnel / côté | BTC-USDC (bp) | ETH-USDC (bp) |
|---|---:|---:|
| 1 000 USDC — achat | 0,371655 | 1,105339 |
| 1 000 USDC — vente | 0,376449 | 1,012190 |
| 100 000 USDC — achat | 3,261758 | 7,909267 |
| 100 000 USDC — vente | 3,028711 | 7,456919 |

Sur ces dates et heures, les achats/ventes fictifs de **100 000 USDC** sont plus coûteux en **variation de prix théorique** pour ETH que pour BTC en moyenne, dans les deux sens. Cela reflète la profondeur visible retenue, et **non** les frais réels d'OKX ou un rendement de stratégie.

Les **2 880 couples de coût BTC/ETH** ont tous trouvé une profondeur visible suffisante sur ces instants ; aucune valeur n'a été interpolée. Un réel ordre de marché peut subir des frais, annulations, latence et conditions d'exécution que cette étude ne mesure pas.

## 5. Traçabilité et vérification indépendante

- [**Protocole préenregistré d'août et septembre (avant l'étude dense)**](./SEVEN_HEAVEN_OKX_BTC_ETH_AUGUST_SEPTEMBER_2026_NINETY_SIX_QUARTER_HOURS_FROZEN_PROTOCOL_2026_11_12.md), commit `da2450eea42fe5e351bebe680aa1a2179fdc620e`.
- [**Code de lecture intégrale des quatre archives en flux**](./SEVEN_HEAVEN_OKX_L2_BTC_ETH_AUGUST_SEPTEMBER_2026_96_QUARTER_HOUR_STREAMED_REPLAY.py).
- [**Preuves JSON et CSV des quatre nouvelles archives 96 × 2 × 2**](./okx_l2_aug_sep_96_quarter_hour_2026_11_12_evidence/), [**exécution GitHub Actions SUCCESS**](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43269358892).
- [**Étude déjà publiée sur le 15 octobre, 96 × 2**](./SEVEN_HEAVEN_OKX_L2_BTC_ETH_2026_10_15_96_QUARTER_HOUR_INTRADAY_SPREAD_AND_DEPTH_SCIENTIFIC_REPORT_2026_11_12.md).
- [**Synthèse comparative JSON des six sources Git blob épinglées, six hashes d'archives, statistiques sur 288 points/actif**](./SEVEN_HEAVEN_OKX_L2_BTC_ETH_AUGUST_SEPTEMBER_OCTOBER_2026_96_QUARTER_HOUR_THREE_DAY_AGGREGATED_PROOFS_2026_11_12.json), blob `22f8306b9e1ef0fe19198dbb7573537c61aec75d`.
- [**CSV des 288 spreads BTC/ETH appariés**](./SEVEN_HEAVEN_OKX_L2_BTC_ETH_AUGUST_SEPTEMBER_OCTOBER_2026_96_QUARTER_HOUR_PAIRED_SPREADS_288_ROWS_2026_11_12.csv).
- [**CSV des 2 880 couples de coûts de carnet au même horaire**](./SEVEN_HEAVEN_OKX_L2_BTC_ETH_AUGUST_SEPTEMBER_OCTOBER_2026_96_QUARTER_HOUR_PAIRED_DEPTH_COSTS_2880_ROWS_2026_11_12.csv).
- [**Programme Python indépendant sans réseau, recalcul complet de tous les chiffres sur les six sources épinglées**](./SEVEN_HEAVEN_OKX_L2_BTC_ETH_AUGUST_SEPTEMBER_OCTOBER_2026_96_QUARTER_HOUR_INDEPENDENT_REPRODUCTION.py).
- [**Preuve de reproduction indépendante**](./okx_l2_three_days_96_quarter_hours_independent_2026_11_12_evidence/SEVEN_HEAVEN_OKX_L2_THREE_DATES_96_QUARTER_HOUR_INDEPENDENT_PROOFS.json), blob `8d1667020766683edc8a64fef104d33de3e17d04`. [**GitHub Actions SUCCESS**](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43270275600).

**Statut indépendant vérifié :** `SIX_ARCHIVES_576_STATES_288_SPREADS_2880_COST_PAIRS_INDEPENDENTLY_REPRODUCED`, avec **9 628 137 événements L2** issus des six fichiers complets.

## 6. Limites non négociables

1. **Chronologie** : ces trois dates sont toutes antérieures à l'étude du 12/11/2026. La sélection calendaire a été fixée avant le nouveau replay dense, mais ne constitue **pas** un véritable test prospectif hors échantillon.
2. **Couverture** : 576 états = 96 snapshots × 2 actifs × 3 journées. Nous n'avons **pas** pris les millions d'états possibles entre les quarts d'heure pour mesurer une durée de spread. Aucun intervalle de confiance universel n'est revendiqué.
3. **Intégrité logique** : SHA-256 de l'archive complète et CRC gzip sont vérifiés, mais les archives ne comportent pas de chaîne exploitable `seqId/prevSeqId`. Il est impossible de certifier qu'aucun message a été omis **en amont** de ces fichiers.
4. **Exécution** : zéro ordre réel. Prix et profondeur historiques **ne prouvent pas** que le même coût pouvait être exécuté après délai. Pas de frais de compte, limites régionales, slippage effectif, queue priority ou partial fills observés.
5. **EMA** : ne pas appliquer ces observations Spot OKX/USDC à la performance des stratégies EMA sur historiques Bitstamp/USD, ni recalculer arbitrairement les 122 opérations PAPER de 2024–2026.

## 7. Direction de recherche logique

**La phase 96 quarts d'heure sur trois dates est achevée et reproductible.** Pour affiner les conclusions, nous pouvons :

- analyser **la durée** et la fréquence des élargissements en rejouant des états plus rapprochés (par exemple une grille fixe toutes les minutes) sur des journées préenregistrées ; distinguer un élargissement fugace d'un état persistant ;
- élargir le calendrier avec des dates supplémentaires choisies **avant** les observations, en documentant les régimes selon une source indépendante ;
- comparer les estimations de carnet **avant frais** aux paramètres de frais OKX **documentés** dans une étude distincte, sans activer de trading.

Aucune surveillance récurrente n'a été programmée et aucun changement Administrator/Trader/Operator/Bridge n'a été réalisé.
