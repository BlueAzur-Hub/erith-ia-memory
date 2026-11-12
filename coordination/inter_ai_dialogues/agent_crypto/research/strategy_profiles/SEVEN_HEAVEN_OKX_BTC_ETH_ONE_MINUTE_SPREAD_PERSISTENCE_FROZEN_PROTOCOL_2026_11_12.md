# Seven Heaven — OKX Spot BTC/ETH USDC, grille 1 minute et durée des élargissements de spread

**Protocole gelé le 12 novembre 2026 AVANT toute nouvelle reconstruction des carnets à 1 minute ou calcul des durées des élargissements.** Archive : **15 octobre 2026 UTC**, instruments **BTC-USDC et ETH-USDC** OKX Spot 400 niveaux uniquement ; aucune transaction ni clé API.

## Question

Les pics de spread relevés à 15 minutes sont-ils des épisodes de quelques millisecondes/secondes, ou des conditions plus longues ? Les anciennes études montrent des maxima ponctuels, par exemple BTC **0,8879 bp à 15:15 UTC** et ETH **2,6038 bp à 02:30 UTC**, mais n'en établissent pas la durée.

Deux analyses distinctes, préenregistrées :
1. **1 440 observations par actif**, premier carnet reconstruit à ou juste après chaque minute **00:00 à 23:59 UTC**, délai de l'observation `<= 60 000 ms`, enregistrements sans remplacement si manquants. À chaque minute, conserver timestamps exacts, prix bid/ask, spread en **bp** et n° de l'événement ; ne pas interpoler.
2. **Durées d'état en temps événementiel**, calculées sur **chaque ligne JSON de mise à jour du carnet**, pas seulement les instantanés minute. L'état `book_i` observé à `ts_i` est supposé maintenu **sur l'intervalle demi-ouvert [ts_i,ts_{i+1})**, seulement à l'intérieur de l'archive ; les événements ayant le même `ts` contribuent **zéro milliseconde**. Ne rien inférer entre le dernier événement et 24:00 ni entre 00:00 et le premier événement. La couverture observée est **`last_ts-first_ts`**, pas nécessairement 86 400 000 ms.

## Seuils fixes et statistique d'épisodes

Élargissement lorsque **spread >0,1 bp**, **>0,5 bp**, **>1,0 bp** ou **>2,0 bp** (strictement supérieur, pas supérieur ou égal). Utiliser les mêmes seuils pour BTC/ETH, ne jamais déplacer les seuils après avoir lu les valeurs.

Mesurer, pour chaque seuil :
- **durée cumulée au-dessus** en millisecondes (somme des intervalles portant un état au-dessus), **fraction du temps effectivement couvert** ; comparaison à la **fraction des 1 440 observations minute** au-dessus du même seuil ;
- **nombre d'épisodes ayant une durée strictement positive**, temps maximal continu au-dessus, début/fin UTC de l'épisode maximal ; nombre d'épisodes de durée au moins **1 seconde, 10 secondes et 60 secondes** ;
- statut `right_censored` d'un épisode encore ouvert au dernier événement, avec fermeture analytique **au timestamp du dernier événement** sans prolongation. Les épisodes de durée zéro (plusieurs updates dans une même milliseconde) sont exclus du nombre d'épisodes positifs ;
- **spread moyen pondéré par la durée des intervalles entre événements** (`Σ spread_après_événement × (ts_suivant-ts_actuel) / Σ Δt`). Ne pas confondre avec la moyenne simple des observations minute, la moyenne des 96 snapshots ou la durée des frais exécutés.

Les durées sont des **estimations à états constants entre événements archivés** et **ne prouvent pas** la durée réelle d'un spread si des messages amont ont été omis.

## Contrôles bloquants

- Relire intégralement chaque archive `.tar.gz` officielle sur le CDN OKX, en flux gzip+tar NDJSON : BTC SHA-256 `3b543b7333a6c71f4a8bf0ddf4e058fa84f61ad58092b3250784acc0964c7b44` ; ETH `048d039eed1d6a18c166f022e8fe02359308445be682d1405df09b61fbc03546`. Vérifier aussi le SHA-256 des membres `.data`, leurs tailles attendues, CRC gzip au footer et les 20 premiers hashes JSON contre préflight épinglé.
- Vérifier le replay complet `snapshot/update`, timestamps monotones, carnet bid/ask non croisé, prix/quantités et suppressions `size=0`. Utiliser des seuils de taille **230 000 000 octets compressés**, **1 400 000 000 décompressés** par source, sans déposer les archives géantes sur GitHub.
- Recalculer et comparer **les 96 relevés historiques de chaque actif**, à 00:00, 00:15, …, 23:45, contre les fichiers déjà publiés : timestamp, événement, bid/ask, spread et **tous les 10 coûts de carnet** sur 5 montants. Les **96 snapshots réelles** sont également comparées par timestamp et événement.
- Vérifier que les relevés minute aux quarts d'heure correspondent aux **96 anciennes ancres** et que **1 440 minutes sont présentes**, sinon documenter précisément les minutes manquantes, sans les remplacer et **sans proclamer « 1 440/1 440 validées »**.
- Test synthétique préalable : épingles SHA, temps événementiel zéro si même timestamp, épisode qui franchit un seuil, épisode censuré à droite, vérification des minutes.

## Sorties autorisées et interprétation

JSON compact pour les preuves SHA, total événements, intégrité et statistiques de durées ; deux CSV des **1 440 minutes par actif** et du journal condensé des épisodes (ex. 20 plus longs par seuil) ; rapport comparatif des seuils et divergences entre fractions minute et fractions temporelles. **Ne pas publier les millions de messages bruts** ni attribuer des valeurs de coût d'ordre de 2024–2026 à ces carnets distincts.

**Limite fondamentale :** les archives n'ont pas de chaîne `seqId/prevSeqId` attestant l'absence de pertes avant archivage. SHA-256/CRC attestent seulement la copie lue. Les épisodes reconstitués sont les durées observées dans l'archive, pas une garantie de continuité du marché réel. Une seule journée, pas une généralisation multi-date ou prospective. **Aucun ordre, aucune surveillance récurrente, aucun changement Administrator / Operator / Trader / Bridge.**
