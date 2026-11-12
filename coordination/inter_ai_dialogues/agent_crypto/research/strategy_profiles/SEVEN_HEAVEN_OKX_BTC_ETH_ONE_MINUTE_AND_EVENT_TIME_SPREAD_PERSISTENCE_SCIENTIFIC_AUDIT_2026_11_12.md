# Seven Heaven — BTC/ETH OKX Spot USDC : persistance des élargissements de spread, minute et temps d'événements

**Rapport scientifique du 12 novembre 2026** · Données archivées : **15 octobre 2026 UTC** · Sources officielles OKX Spot L2 400 niveaux · **Aucun compte, aucune transaction, aucun ordre réel**.

## Résumé scientifique

Les deux archives historiques **BTC-USDC et ETH-USDC** ont été entièrement rejouées, soit **5 519 354 événements** (BTC **2 346 486**, ETH **3 172 868**). Cette étude ajoute deux méthodes **préenregistrées** aux 96 snapshots à 15 minutes précédemment publiées :

1. **1 440 observations à une minute fixe par actif** sur la même journée, appariées à l'horaire UTC.
2. **Une mesure des durées calculée sur chaque intervalle entre événements L2 successifs** : après un événement `i`, on suppose que le carnet reconstruit reste constant jusqu'au timestamp de l'événement `i+1`. Les durées sont des **durées d'états archivés sous cette hypothèse**, pas une mesure certifiée des durées d'exécution réelle du marché.

### Résultat central

**L'élargissement du spread n'est pas seulement une question d'amplitude ; sa durée change radicalement selon le seuil et l'actif.** Dans cette unique journée, Ethereum conserve un spread **> 0,1 bp** sur **27,41 %** du temps couvert par les événements de l'archive, contre **3,15 %** pour Bitcoin. Mais la majorité des passages au-dessus de ce seuil sont **très brefs**, et les grands élargissements tendent à être encore moins persistants.

## 1. Conformité au protocole fixé avant le traitement

[**Protocole One Minute + Event Time figé AVANT le replay**](./SEVEN_HEAVEN_OKX_BTC_ETH_ONE_MINUTE_SPREAD_PERSISTENCE_FROZEN_PROTOCOL_2026_11_12.md), commit `67c8532cff103c9cc5cb439d7a7bb87a5d642f4e`.

| Vérification | BTC-USDC | ETH-USDC |
|---|---:|---:|
| Octets de l'archive et du membre `.data` validés SHA-256 intégralement | Oui | Oui |
| Gzip footer/CRC validé | Oui | Oui |
| Événements complets rejoués | **2 346 486** | **3 172 868** |
| Grille minute valide | **1 440/1 440** | **1 440/1 440** |
| **96 anciens états L2** contrôlés exactement (timestamp, bid/ask, spread, cinq coûts achat/vente) | **96/96** | **96/96** |
| 20 premiers hashes JSON vs préflight antérieur | OK | OK |
| Lien de séquence amont `seqId/prevSeqId` attestant tous les événements | **Non disponible** | **Non disponible** |

Les empreintes des archives compressées déjà épinglées sont BTC `3b543b7333a6c71f4a8bf0ddf4e058fa84f61ad58092b3250784acc0964c7b44` et ETH `048d039eed1d6a18c166f022e8fe02359308445be682d1405df09b61fbc03546`. Aucun `.tar.gz` ni gros `.data` n'a été committé.

- [**GitHub Actions — les deux replays complets BTC/ETH, leurs tests et publication : SUCCESS**](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43272575944).
- [**Programme Python streaming minute et durée événementielle**](./SEVEN_HEAVEN_OKX_BTC_ETH_ONE_MINUTE_SPREAD_PERSISTENCE_FULL_ARCHIVE_STREAMED_REPLAY_2026_11_12.py).

## 2. Échantillon 96 snapshots vs 1 440 minutes vs durée entre événements

Trois moyennes sur **la même journée UTC**, mais avec des pondérations et échantillonnages **différents** :

| Méthode | BTC-USDC (bp) | ETH-USDC (bp) |
|---|---:|---:|
| Moyenne simple des **96 snapshots à 15 min** | **0,023063** | **0,245866** |
| Moyenne simple des **1 440 minutes fixes** | **0,038135** | **0,308639** |
| Moyenne **pondérée par durée** des états entre événements L2 | **0,035277** | **0,293647** |

La moyenne à 15 minutes **n'avait pas capté certains épisodes** qui apparaissent à une minute. La moyenne minute et celle pondérée par les durées ne sont pas identiques, ce qui est attendu : la première pondère chaque minute fixe de la même manière, la seconde pondère les états du carnet par leur durée entre deux messages.

**Maxima observés à chacune des deux grilles :**

| Actif | Maximum sur 96 quarts d'heure | Maximum sur 1 440 minutes |
|---|---:|---:|
| BTC-USDC | 0,887892 bp à **15:15 UTC** | **2,266004 bp à 13:38 UTC** |
| ETH-USDC | 2,603805 bp à **02:30 UTC** | **8,661348 bp à 02:29 UTC** |

**Avertissement :** le maximum à une minute n'est **pas** le maximum de tous les événements de la journée. Un état de spread encore plus large peut apparaître entre deux échantillons. Ces chiffres sont seulement les maxima **des grilles indiquées**.

## 3. Part du temps de carnet archivé au-dessus des seuils gelés

**Seuil strict : spread > valeur**, en points de base, sans réajustement après lecture. Pour chaque intervalle, le spread retenu est celui de l'état juste **après** le premier message, maintenu fictivement jusqu'au suivant ; les événements de même timestamp ne contribuent **aucune durée**.

Durée couverte par les **intervalles entre événements** : BTC **86 399 930 ms**, ETH **86 399 965 ms**, soit presque 24 heures, en excluant les quelques millisecondes avant le premier et après le dernier événement.

| Seuil strict (bp) | BTC, part du temps couvert | ETH, part du temps couvert |
|---|---:|---:|
| **> 0,1** | **3,1457 %** | **27,4118 %** |
| **> 0,5** | **1,8738 %** | **17,3080 %** |
| **> 1,0** | **0,8052 %** | **10,9623 %** |
| **> 2,0** | **0,0726 %** | **2,7854 %** |

Ces proportions sont des mesures **sur le flux reconstruit**. Elles ne garantissent pas l'absence d'un message omis en amont, car les séquences ne peuvent pas être chaînées avec `seqId/prevSeqId`.

### Comparaison à la grille minute

| Seuil | BTC, minutes au-dessus / 1 440 | ETH, minutes au-dessus / 1 440 |
|---|---:|---:|
| > 0,1 bp | **60** | **421** |
| > 0,5 bp | **26** | **277** |
| > 1,0 bp | **11** | **162** |
| > 2,0 bp | **1** | **37** |

Au total, ETH présente le spread le plus large sur **1 398 des 1 440 minutes appariées**, BTC sur les **42** autres. Aucune égalité. Les deux relevés d'une paire surviennent à des timestamps parfois différents dans la minute : le décalage relatif maximal des points retenus est **1 730 ms**. Il ne s'agit **pas** de captures atomiquement simultanées.

## 4. Durées maximales et fréquence des épisodes

Un « épisode » est une **période continue des états archivés au-dessus d'un seuil**, arrêtée au premier état inférieur ou égal. Les micro-épisodes à **zéro milliseconde** sont exclus des effectifs ; les épisodes ouverts au dernier message sont marqués « censurés à droite » et leur durée n'est pas extrapolée jusqu'à 24:00.

| Seuil | Plus long épisode BTC | Plus long épisode ETH |
|---|---:|---:|
| **> 0,1 bp** | **6,71 s** | **107,53 s** |
| **> 0,5 bp** | **1,03 s** | **10,74 s** |
| **> 1,0 bp** | **0,85 s** | **7,58 s** |
| **> 2,0 bp** | **0,42 s** | **2,32 s** |

**Nombre d'épisodes positifs au-dessus de 0,1 bp :** BTC **64 350**, ETH **147 981**. Mais les épisodes d'au moins **une seconde** sont seulement **29** pour BTC et **3 404** pour ETH. Ceux d'au moins **dix secondes** : **0** pour BTC, **29** pour ETH. Ceux d'au moins **60 secondes** : **0** BTC, **3** ETH.

Ce contraste est important : un carnet peut connaître des dizaines de milliers de micro-élargissements sans qu'ils représentent autant de périodes longues ou exploitables. Les événements ne sont **ni indépendants ni des ordres de marché**.

**Plus long épisode >0,1 bp dans l'archive ETH :** de **21:47:19.243** à **21:49:06.773 UTC**, durée **107,530 secondes**. Dans l'archive BTC : de **21:43:53.727** à **21:44:00.437 UTC**, durée **6,710 secondes**.

**Épisode le plus long >2 bp :** BTC **420 ms** ; ETH **2 320 ms**. Cela ne démontre pas qu'un algorithme pouvait exploiter ces épisodes : latence, profondeur exécutée, compte régional et frais ne sont pas mesurés ici.

## 5. Preuves compactes, code et vérification hors réseau

- [**Protocole scientifique gelé avant le nouveau calcul des durées et des 1 440 minutes**](./SEVEN_HEAVEN_OKX_BTC_ETH_ONE_MINUTE_SPREAD_PERSISTENCE_FROZEN_PROTOCOL_2026_11_12.md).
- [**Reconstructeur Python des archives entières, minutes et durées par événement**](./SEVEN_HEAVEN_OKX_BTC_ETH_ONE_MINUTE_SPREAD_PERSISTENCE_FULL_ARCHIVE_STREAMED_REPLAY_2026_11_12.py).
- [**Preuves BTC : SHA complets, 1 440 minutes, 96 anciennes ancres et quatre seuils d'épisodes**](./okx_l2_btc_eth_2026_10_15_minute_spread_persistence_evidence/btc_usdc/SEVEN_HEAVEN_OKX_L2_ONE_MINUTE_PERSISTENCE_SOURCE_PROOFS.json), Git blob `ce90a9d8e84bb257eafe994d1d31a4ffae51f0b9`.
- [**Preuves ETH : mêmes contrôles, propres à l'archive Ethereum**](./okx_l2_btc_eth_2026_10_15_minute_spread_persistence_evidence/eth_usdc/SEVEN_HEAVEN_OKX_L2_ONE_MINUTE_PERSISTENCE_SOURCE_PROOFS.json), Git blob `589778261ecd2ce419c6df2f0fba3e44e195439d`.
- [**Synthèse numérique appariée, sur les deux preuves GitHub épinglées, durées et seuils**](./SEVEN_HEAVEN_OKX_BTC_ETH_ONE_MINUTE_SPREAD_PERSISTENCE_AGGREGATED_EVIDENCE_2026_11_12.json), Git blob `f2f27d004500454010fa9a5226d1cd97bf08702a`.
- [**CSV des 1 440 minutes BTC/ETH appariées**](./SEVEN_HEAVEN_OKX_BTC_ETH_ONE_MINUTE_PAIRED_SPREADS_1440_ROWS_2026_11_12.csv).
- [**CSV BTC des 20 plus longs épisodes par seuil**](./okx_l2_btc_eth_2026_10_15_minute_spread_persistence_evidence/btc_usdc/SEVEN_HEAVEN_OKX_L2_EVENT_TIME_LONGEST_SPREAD_EPISODES.csv) ; [**équivalent ETH**](./okx_l2_btc_eth_2026_10_15_minute_spread_persistence_evidence/eth_usdc/SEVEN_HEAVEN_OKX_L2_EVENT_TIME_LONGEST_SPREAD_EPISODES.csv).
- [**Vérificateur Python hors réseau : contrôles indépendants sur les quatre blobs publiés, 1 440 minutes, les 96 anciennes références et conservation des durées et des épisodes**](./SEVEN_HEAVEN_OKX_BTC_ETH_ONE_MINUTE_SPREAD_PERSISTENCE_INDEPENDENT_EVIDENCE_AUDIT_2026_11_12.py).
- [**Preuve de ce second audit**](./okx_l2_one_minute_event_time_independent_validation_2026_11_12_evidence/SEVEN_HEAVEN_OKX_MINUTE_SPREAD_PERSISTENCE_OFFLINE_INDEPENDENT_PROOFS.json), blob `e3eab77292b0b5a8133aa55d2fc8b725c1abd777`, [**workflow GitHub Actions SUCCESS**](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43273786205).

**Portée exacte du second audit :** il reproduit **hors réseau** l'arithmétique et les valeurs par minute à partir des JSON source GitHub épinglés, et vérifie la conservation des durées et les fenêtres des épisodes ; il **ne décode pas une seconde fois les 5,5 millions de messages bruts**. La reconstruction brute reste contrôlée par les deux replays complets et les SHA/CRC.

Le premier passage du vérificateur hors réseau a échoué à cause d'un **champ de clé nommé `git_blob_sha1` au lieu de `sha`** dans le fichier comparatif, puis le vérificateur a été corrigé sans modifier les données ; le nouveau passage [a réussi](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43273786205).

## 6. Interprétation pour les stratégies et limites

Cette étude **ne suffit pas à établir le coût historique des stratégies EMA** : elle examine le **15 octobre 2026** sur OKX Spot **BTC/ETH cotés en USDC**, tandis que les simulations EMA utilisent **Bitstamp/USD** et une autre plage de dates. La fraction du temps à spread élevé **n'est pas** une probabilité de remplir un ordre, ni un rendement exploitable.

La métrique « événement jusqu'à événement » s'appuie sur une hypothèse d'état constant. L'archive peut contenir des événements manquants avant sa publication, faute de chaîne de numéros de séquence. Des micro-variations en millisecondes peuvent ne pas exister comme opportunités négociables, d'autant que le carnet peut disparaître avant l'arrivée d'un ordre.

Les résultats suggèrent **une prochaine hypothèse vérifiable** : plutôt que fixer un glissement uniforme fondé sur quelques snapshots, étudier plusieurs journées distinctes **à la minute et en temps d'événements**, en y ajoutant des frais documentés et des tailles d'ordres réalistes, tout en gardant les simulations PAPER et sans réoptimiser les EMA sur les résultats.

**Aucune tâche périodique créée, aucun ordre réel, aucun changement du Bridge, Trader, Operator ou Administrator.**
