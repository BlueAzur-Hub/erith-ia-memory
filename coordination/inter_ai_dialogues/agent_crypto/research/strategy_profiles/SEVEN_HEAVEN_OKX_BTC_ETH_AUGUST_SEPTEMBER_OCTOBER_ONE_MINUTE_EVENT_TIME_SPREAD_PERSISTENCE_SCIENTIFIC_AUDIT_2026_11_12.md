# Seven Heaven — OKX Spot BTC/ETH USDC : persistance des spreads à la minute et entre événements, trois dates historiques

**Date de l'étude : 12 novembre 2026** · Sources : archives publiques officielles OKX Spot 400lv L2 · Journées UTC : **15 août, 15 septembre, 15 octobre 2026** · Paires : **BTC-USDC et ETH-USDC** · **Research/PAPER uniquement : aucun ordre, aucune clé de compte, aucune surveillance automatique.**

## Synthèse — Résultat vérifié

**Cette phase répond à la question restée ouverte après le 15 octobre : les épisodes de spread plus large se répètent-ils de manière similaire sur août et septembre ?** Non, pas dans les trois archives choisies : la part du temps de carnet reconstruit au-dessus des mêmes seuils et la durée des épisodes **varient fortement selon la journée et l'actif**.

Les **quatre archives nouvelles** ont été entièrement rejouées suivant les mêmes règles figées que pour octobre, sans modification des seuils ou des dates. En réunissant les études validées, nous disposons de **six archives entières**, **9 628 137 événements L2**, **8 640 observations minute** (3 jours × 2 actifs × 1 440), **4 320 couples de spreads BTC/ETH**, ainsi que six intégrations des durées entre tous les événements de chacune des archives.

**Important :** les six archives ne constituent **ni trois mois de données continues, ni une vraie estimation de la distribution de marché**, ni une validation prospective. Les fractions de temps sont obtenues en supposant chaque état du carnet constant de son événement source `ts_i` au timestamp de l'événement `ts_(i+1)`. Cette hypothèse ne prouve pas l'absence de trous dans la source initiale.

## 1. Dates, intégrité, comparabilité

[**Protocole gelé AVANT de rejouer les quatre archives août/septembre**](./SEVEN_HEAVEN_OKX_BTC_ETH_AUGUST_SEPTEMBER_ONE_MINUTE_SPREAD_PERSISTENCE_FROZEN_PROTOCOL_2026_11_12.md), commit `91a0b96c3c5367e7dae48292c58ab80fa7e05d5a`.

- Dates choisies par calendrier : **15 août, 15 septembre, 15 octobre** ; octobre déjà validé et non réoptimisé. Paires immuables **BTC-USDC**, **ETH-USDC**.
- Seuils fixés **strictement supérieurs à 0,1 / 0,5 / 1,0 / 2,0 bp** ; 1 bp = 0,01 %. Calcul `(best ask - best bid) / mid × 10 000`.
- **1 440 horloges UTC de 00:00 à 23:59** pour chaque jour et actif. Sélection du premier carnet valide à ou après l'heure de la minute, dans une fenêtre maximale de 60 secondes ; zéro interpolation.
- **96/96** anciennes ancres du quart d'heure par archive retrouvées exactement, dont les prix bid/ask, les timestamps, les numéros d'événements et les cinq coûts fictifs achat/vente.
- Chaque archive lue complètement en flux gzip/tar/NDJSON, **SHA-256 complet compressé, SHA-256 complet du membre `.data`, CRC gzip** contrôlés. Aucune archive géante committée.
- Contrôle des dates/instruments, horodatages monotones, book non croisé, `snapshot` avant les deltas, suppression des niveaux de quantité zéro.
- **Absence de chaîne vérifiable `seqId/prevSeqId`** ; l'intégrité du fichier reçu n'atteste pas l'exhaustivité logique des messages produits en amont.

| Journée UTC | BTC événements L2 | ETH événements L2 |
|---|---:|---:|
| 15 août | 301 816 | 277 791 |
| 15 septembre | 1 811 678 | 1 717 498 |
| 15 octobre | 2 346 486 | 3 172 868 |
| **Total** | **4 459 980** | **5 168 157** |

[**GitHub Actions : quatre nouveaux replays complets BTC/ETH, tous SUCCESS**](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43276237813). [**Preuves détaillées des quatre nouvelles sources en JSON/CSV**](./okx_l2_aug_sep_one_minute_event_time_spread_persistence_2026_11_12_evidence/).

## 2. Fraction du temps où le spread dépasse les quatre seuils

Les parts représentent **la durée cumulée au-dessus du seuil divisée par le temps couvert entre premier et dernier événement de la journée**, et non la part des ordres exécutés ni des transactions au carnet.

| Date | Instrument | >0,1 bp | >0,5 bp | >1,0 bp | >2,0 bp |
|---|---|---:|---:|---:|---:|
| 15 août | BTC-USDC | **25,229 %** | 3,663 % | 0,0649 % | 0,00023 % |
| 15 août | ETH-USDC | **86,056 %** | **76,939 %** | **51,803 %** | 0,147 % |
| 15 septembre | BTC-USDC | **49,698 %** | 27,507 % | 12,453 % | 3,943 % |
| 15 septembre | ETH-USDC | **93,349 %** | **87,846 %** | **60,972 %** | 9,139 % |
| 15 octobre | BTC-USDC | **3,146 %** | 1,874 % | 0,805 % | 0,0726 % |
| 15 octobre | ETH-USDC | **27,412 %** | 17,308 % | 10,962 % | 2,785 % |

**Observation :** l'octobre étudié est significativement plus serré sur notre métrique que les deux dates précédentes, en particulier sur les seuils **0,1 et 0,5 bp**. Pour Ethereum, sur septembre, le spread reconstruit est supérieur à **1 bp sur environ 61 %** du temps archivé ; en octobre cette fraction n'est plus que **environ 11 %**.

**Nuance :** ces chiffres ne permettent pas de déterminer pourquoi les spreads diffèrent : activité de marché, profondeur, volatilité, horaires, politique d'archivage ou éventuelles omissions de données ne sont pas isolés causalement.

## 3. Combien de temps dure un épisode continu ?

Un épisode de spread strictement supérieur au seuil commence dès l'état archivé qui le franchit, et se termine à l'événement suivant qui repasse sous ou sur le seuil. Les événements simultanés n'ajoutent **aucun temps**. Les épisodes de durée zéro ne sont pas comptés. Un état encore ouvert au dernier événement est marqué **censuré à droite** sans extrapolation à 24:00.

**Plus long épisode, en durée temporelle observée :**

| Date | Actif | >0,1 bp | >0,5 bp | >1,0 bp | >2,0 bp |
|---|---|---:|---:|---:|---:|
| 15 août | BTC | **6 min 0,83 s** | 1 min 13,26 s | 1,04 s | 0,02 s |
| 15 août | ETH | **35 min 58,79 s** | **18 min 42,59 s** | 7 min 46,59 s | 12,93 s |
| 15 septembre | BTC | 1 min 52,68 s | 50,76 s | 30,68 s | 10,80 s |
| 15 septembre | ETH | **6 min 9,70 s** | 6 min 9,60 s | 1 min 2,30 s | 10,91 s |
| 15 octobre | BTC | 6,71 s | 1,03 s | 0,85 s | 0,42 s |
| 15 octobre | ETH | 1 min 47,53 s | 10,74 s | 7,58 s | 2,32 s |

**Le changement est considérable :** sur **ETH le 15 août**, la plus longue période archivée **> 0,1 bp** approche **36 minutes** ; le **15 octobre**, elle dure moins de **deux minutes**. Sur BTC, elle passe de **6 minutes en août** à **moins de 7 secondes en octobre**.

### Cas des épisodes censurés à droite

- **ETH du 15 août** : un épisode encore ouvert au dernier événement pour les seuils **>0,1** et **>0,5 bp**.
- **ETH du 15 septembre** : épisode ouvert au dernier événement pour **>0,1**, **>0,5** et **>1,0 bp**.
- Tous les autres couples de jour/actif/seuil sont marqués non censurés à droite.

Les maxima du tableau correspondent à la plus longue durée **déjà observée** dans le fichier et ne sont pas prolongés au-delà du dernier message. Le fait qu'un épisode soit censuré ne veut pas dire qu'il aurait nécessairement duré davantage dans le marché réel.

## 4. Comparaison des moyennes — grille minute et durée événementielle

Deux moyennes sur la même journée, mais avec deux pondérations :

| Date | BTC moyenne des 1 440 minutes | BTC pondérée par durée | ETH moyenne des 1 440 minutes | ETH pondérée par durée |
|---|---:|---:|---:|---:|
| 15 août | 0,100005 bp | **0,095017 bp** | 0,905464 bp | **0,900607 bp** |
| 15 septembre | 0,376792 bp | **0,393435 bp** | 1,211328 bp | **1,193970 bp** |
| 15 octobre | 0,038135 bp | **0,035277 bp** | 0,308639 bp | **0,293647 bp** |

La première attribue le même poids à chaque minute fixe ; la seconde suppose un spread constant entre événements et pondère par la durée de ces intervalles. Elles ne sont pas identiques et **ne sont pas une estimation des frais payés**.

### Statistiques regroupées sur ces trois journées seulement

Si l'on additionne **les trois périodes observées, sans combler les jours entre elles**, le spread moyen pondéré par durée devient **0,174577 bp pour BTC** et **0,796075 bp pour ETH**. La fraction des périodes archivées au-dessus de **0,1 bp** représente respectivement **26,024 % pour BTC** et **68,939 % pour ETH**.

**Ne pas généraliser** ces fractions à tout août–octobre 2026. Il s'agit de la moyenne de **trois journées isolées**, non d'une période temporelle ininterrompue.

## 5. Comparaison BTC/ETH minute par minute

Sur les **4 320 instants UTC appariés** issus des trois dates, le spread relatif ETH/USDC est plus large que celui de BTC/USDC **4 089 fois** ; BTC est plus large **231 fois** ; aucune égalité. Les deux paires sont relevées au premier événement suivant l'heure fixe, **sans capture atomique commune**.

Les seuils portent sur **des spreads relatifs**, pas sur une mesure complète de liquidité. Pour des transactions importantes, la profondeur des niveaux beyond best bid/ask et les frais réels peuvent rendre l'exécution plus coûteuse ou moins coûteuse que ne le suggère le spread seul.

## 6. Reproductibilité et livrables

- [**Protocole multi-date gelé avant les nouvelles analyses minute/événement**](./SEVEN_HEAVEN_OKX_BTC_ETH_AUGUST_SEPTEMBER_ONE_MINUTE_SPREAD_PERSISTENCE_FROZEN_PROTOCOL_2026_11_12.md), commit `91a0b96c3c5367e7dae48292c58ab80fa7e05d5a`.
- [**Script Python de reconstruction intégrale en flux et durée entre événements**](./SEVEN_HEAVEN_OKX_BTC_ETH_AUGUST_SEPTEMBER_ONE_MINUTE_EVENT_TIME_SPREAD_PERSISTENCE_REPLAY_2026_11_12.py), commit `cd9373b37c5a33b4567f4d591434e3d56370a328`.
- [**Preuves JSON et CSV sources des quatre replays août/septembre**](./okx_l2_aug_sep_one_minute_event_time_spread_persistence_2026_11_12_evidence/), [**GitHub Actions : 4/4 analyses SUCCESS**](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43276237813).
- [**Preuves déjà publiées du 15 octobre, BTC/ETH, 1 440 minutes et temps événementiel**](./SEVEN_HEAVEN_OKX_BTC_ETH_ONE_MINUTE_AND_EVENT_TIME_SPREAD_PERSISTENCE_SCIENTIFIC_AUDIT_2026_11_12.md).
- [**Synthèse JSON comparée de six sources épinglées, 8 640 minutes et quatre seuils**](./SEVEN_HEAVEN_OKX_BTC_ETH_THREE_DAYS_ONE_MINUTE_EVENT_TIME_PERSISTENCE_COMPARATIVE_PROOFS_2026_11_12.json), Git blob `3790a41c05be23ec001f799cd5e48e3ce28720ec`.
- [**CSV de 4 320 spreads BTC/ETH appariés à dates et minutes fixes**](./SEVEN_HEAVEN_OKX_BTC_ETH_THREE_DAYS_PAIRED_MINUTE_SPREADS_4320_ROWS_2026_11_12.csv), Git blob `0c06f32548ff6fa240a8b7040d8f9c0dc23da05c`.
- [**Programme Python indépendant hors réseau vérifiant six Git blobs sources, les minutes, les épisodes et les fractions temporelles**](./SEVEN_HEAVEN_OKX_BTC_ETH_THREE_DAYS_MINUTE_EVENT_TIME_PERSISTENCE_INDEPENDENT_REPRODUCTION_2026_11_12.py).
- [**Preuve du second contrôle Python**](./okx_l2_three_days_eventtime_persistence_independent_2026_11_12_evidence/SEVEN_HEAVEN_OKX_THREE_DAYS_ONE_MINUTE_EVENTTIME_INDEPENDENT_RECALC_PROOFS.json), Git blob `054608ae8b3eeb78973fe6406fd8bb6e82616d7a`, [**GitHub Actions de reproduction : SUCCESS**](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43277250677).

**Portée EXACTE du second contrôle :** les six fichiers JSON complets des preuves sources ont été épinglés par SHA de blob Git ; le vérificateur Python a indépendamment recalculé les statistiques de minutes, les **4 320 lignes couplées**, les agrégats de chaque seuil et la conservation des épisodes. **Il n'a pas redécompressé indépendamment une seconde fois les 9,6 millions de messages L2 originaux.** Ces derniers ont été intégralement traités par les premiers scripts, avec SHA-256 et CRC.

## 7. Limites et décision pour le chantier Crypto

**Fait :** l'ampleur et la durée des spreads varient selon les trois dates ; sous la méthode événementielle retenue, un élargissement peut durer quelques millisecondes, secondes ou minutes.

**Hypothèses non démontrées :** les différences ne sont pas imputées à une annonce, une liquidation, un « régime haussier » ou à une dégradation permanente de la liquidité. Les archives ne disposent pas de la chaîne `seqId/prevSeqId` requise pour certifier la continuité logique amont ; il reste possible que des événements aient été omis avant archivage.

**Conséquence opérationnelle pour les études PAPER :** le spread relatif instantané ne suffit pas à représenter toute la friction. Une future simulation réaliste devra distinguer au minimum **spread, profondeur, prix de marché théorique, frais documentés et latence**, sans confondre les sources OKX/USDC avec le backtest **Bitstamp/USD** des EMA.

**Direction utile suivante, non réalisée dans ce rapport :** étudier la **densité temporelle des variations de profondeur et les coûts selon des montants modestes** sur les mêmes trois dates, puis distinguer coûts liés à la taille de l'ordre et coûts dus aux frais documentés. Cela restera une étude fictive, sans ordre réel.

**Aucune modification Administrator/Operator/Trader/Bridge. Aucune surveillance récurrente ni exécution de trading.**
