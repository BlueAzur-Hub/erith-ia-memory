# Seven Heaven — Archives L2 historiques OKX Spot : disponibilité et format inspecté

**12 novembre 2026 · Étude documentaire et échantillonnage binaire limité · Pas d'ordre réel.**

## Résumé

L'API publique officielle `GET /api/v5/public/market-data-history` a effectivement **référencé deux archives L2 quotidiennes de 400 niveaux**, pour BTC-USDC et ETH-USDC Spot le **15 octobre 2026**. Les liens ont été récupérés par un programme sans API privée, avec preuve JSON et SHA-256 de chaque réponse. Un **deuxième programme a ouvert les deux archives sur le CDN OKX avec la requête HTTP Range**, et lu **seulement 10 240 octets compressés par paire** avant de prélever **16 384 octets décompressés du premier fichier régulier**. Aucun ZIP quotidien n'a été téléchargé intégralement.

**Le format de départ est désormais observé, mais une journée entière de carnet n'est pas encore reconstruite.** L'archive se présente en `.tar.gz`, contenant un fichier `.data`, dont les premiers octets ressemblent à une structure JSON de carnet : `instId`, `action:"snapshot"`, `ts`, `asks`. Le préfixe inspecté **ne contient pas la totalité du premier enregistrement JSON**, donc on ne peut pas encore certifier la structure JSON complète, la présence/position de tous les champs ni les règles de séquence du carnet.

## 1. Métadonnées API officiellement obtenues

Requêtes figées **avant récupération** sur la journée UTC du 15 octobre 2026 : `module=4` (400 niveaux), `instType=SPOT`, `dateAggrType=daily`, `instIdList` limité à chacune de nos deux paires.

| Paire | Fichier L2 listé par OKX | Taille compressée annoncée |
|---|---|---:|
| BTC-USDC | `BTC-USDC-L2orderbook-400lv-2026-10-15.tar.gz` | **54,28 Mo** |
| ETH-USDC | `ETH-USDC-L2orderbook-400lv-2026-10-15.tar.gz` | **93,60 Mo** |

- [Lien archive BTC/USD**C** sur CDN OKX](https://static.okx.com/cdn/okx/match/orderbook/pro/L2/400lv/daily/20261015/BTC-USDC-L2orderbook-400lv-2026-10-15.tar.gz)
- [Lien archive ETH/USDC sur CDN OKX](https://static.okx.com/cdn/okx/match/orderbook/pro/L2/400lv/daily/20261015/ETH-USDC-L2orderbook-400lv-2026-10-15.tar.gz)

Réponse officielle HTTP 200, code métier `0`, une entrée `data[]` par paire. Hashs SHA-256 des réponses JSON brutes, **pas** des archives : BTC `a79abc35b2b2ee2e8f12a772b501c5f725630aa9a7d8c028c4231b216dd86b7f` ; ETH `9b29a1b012f3efd9a10ae58f5875ab68c0e8ec2cbefe065074c654afeb59c063`.

[Preuves officielles métadonnées et détails](./okx_historical_l2_archive_discovery_2026_11_12_evidence/SEVEN_HEAVEN_OKX_HISTORICAL_L2_DISCOVERY_EVIDENCE.json), Git blob `e07fd6eecf3c794ea69e4e0f133329463db67614`.

## 2. Contrôle direct, borné, des deux `.tar.gz`

| Contrôle | BTC-USDC | ETH-USDC |
|---|---|---|
| HTTP CDN | **206 Partial Content** | **206 Partial Content** |
| Octets compressés effectivement lus | **10 240** | **10 240** |
| Premier membre tar | `BTC-USDC-L2orderbook-400lv-2026-10-15.data` | `ETH-USDC-L2orderbook-400lv-2026-10-15.data` |
| Taille annoncée du membre décompressé | **457 277 836 octets** | **776 655 177 octets** |
| Échantillon décompressé consulté | **16 384 octets** | **16 384 octets** |
| Premier `instId` | BTC-USDC | ETH-USDC |
| Première `action` lisible | `snapshot` | `snapshot` |
| Premier `ts` lisible (Unix ms) | 1792022400005 | 1792022400001 |

Les timestamps des premiers enregistrements correspondent à **00:00:00.005 UTC** et **00:00:00.001 UTC** sur le 15 octobre. La première structure visible contient le tableau de niveaux `asks`, chaque niveau avec prix et quantité, parfois un troisième champ indiquant un décompte. **Le début de l'échantillon seul n'établit pas que toutes les lignes et toutes les mises à jour respectent ce schéma.**

Les preuves conservent séparément :
- SHA-256 du **préfixe de 10 240 octets compressés** lu pour chaque archive ;
- SHA-256 des **16 384 octets de contenu extrait du premier membre** ;
- nom interne et taille du premier membre tar ;
- premiers fragments texte tronqués et heures UTC de récupération.

**Il serait faux de présenter l'un de ces hashes comme SHA-256 du fichier `.tar.gz` complet ou du membre `.data` complet.**

[Preuves de format, données brutes limitées et hash de préfixe](./okx_historical_l2_format_probe_2026_11_12_evidence/SEVEN_HEAVEN_OKX_HISTORICAL_L2_ARCHIVE_FORMAT_EVIDENCE.json), Git blob `216875ba0d5af88d0acffc2cfc495e659c9fad2f`.

## 3. Conséquences techniques et scientifiques

1. La bonne source pour une étude de **spread historique** existe, du moins **pour cette journée et ces paires**, et les archives référencées sont accessibles par lecture HTTP partielle.
2. Les fichiers **décompressés atteignent environ 1,23 Go au total**. Ne pas dupliquer les archives géantes dans GitHub : un extracteur devra lire en **flux** les mises à jour, conserver seulement les états et statistiques contrôlés et publier les références vers les originaux.
3. L'extraction d'un spread à une heure précise exige **un carnet reconstruit correctement à cet instant**. Les mises à jour JSON peuvent être incrémentales : prendre seulement la première ligne, un ticker ou une estimation naïve à partir de prix incomplets n'est pas scientifiquement recevable.
4. Il faut d'abord lire **au moins un premier enregistrement JSON complet** afin de vérifier l'existence des `bids`, les identifiants de séquence, la gestion des suppressions (`size=0`) et le sens de `action`. Avant de les avoir observés, **aucun algorithme de replay L2 ne peut être déclaré validé**.
5. Ce contrôle est **sur des prix OKX/USDC** et sur des dates où les instruments étaient listés (le `listTime` public était le 21 août 2025) ; il ne reconstitue pas rétroactivement les données OKX de 2024 sur ces mêmes paires.
6. Il ne permet **aucune distribution de coûts**, aucun quantile de spread, aucune performance nouvelle EMA, ni une validation des frais du compte.

## 4. Preuves et reproduction dans le Coffre inter-IA

- [Protocole de découverte préenregistré](./SEVEN_HEAVEN_OKX_HISTORICAL_L2_BTC_ETH_USDC_ARCHIVE_DISCOVERY_PROTOCOL_2026_11_12.md), [programme de découverte](./SEVEN_HEAVEN_OKX_HISTORICAL_L2_ARCHIVE_METADATA_DISCOVERY_2026_11_12.py) et [exécution GitHub Actions #1 SUCCESS](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43254623603).
- [Protocole de sonde de format bornée préenregistré](./SEVEN_HEAVEN_OKX_HISTORICAL_L2_ARCHIVE_BOUNDED_FORMAT_PROBE_PROTOCOL_2026_11_12.md), [programme de lecture partielle](./SEVEN_HEAVEN_OKX_HISTORICAL_L2_BOUNDED_FORMAT_PROBE_2026_11_12.py) et [exécution GitHub Actions #1 SUCCESS](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43255641337).
- [Preuve JSON du premier test de format](./okx_historical_l2_format_probe_2026_11_12_evidence/SEVEN_HEAVEN_OKX_HISTORICAL_L2_ARCHIVE_FORMAT_EVIDENCE.json).

**Suite scientifique, sans travail promis en arrière-plan :** documenter la structure d'un premier événement JSON complet avec une nouvelle lecture strictement bornée et un protocole séparé, puis seulement développer un rejeu d'ordres à temps fixes. Aucun accès au Trader, Operator, Administrator ou Bridge ; aucun ordre ni surveillance récurrente.
