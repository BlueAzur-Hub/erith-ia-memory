# Seven Heaven — BTC/USDC OKX : 2,35 millions d'événements de carnet L2 traités en flux

**Rapport du 12 novembre 2026** — Données de marché Spot du **15 octobre 2026 UTC**. Recherche publique en lecture seule, PAPER, **aucun ordre réel**.

## Résumé exécutif

La première lecture limitée avait décodé 20 événements L2 complets. **La journée entière BTC/USDC du 15 octobre 2026 a désormais été téléchargée et traitée en flux** dans GitHub Actions, avec contrôle intégral de l'archive compressée et du membre tar décompressé. Le programme a appliqué **2 346 390 deltas** après les snapshots, sans conserver les 457 Mo décompressés sur disque ni les déposer sur GitHub.

Résultat : **2 346 486 événements JSON traités**, **96 snapshots** et **2 346 390 updates**, **4 946 749 suppressions de niveaux appliquées**, quatre états du carnet reconstitués aux horaires prédéfinis (00 h, 06 h, 12 h, 18 h UTC) et 40 simulations de lecture de profondeur (4 heures × 5 montants × achat/vente).

**Limite centrale : aucun des événements du début de journée n'avait de seqId / prevSeqId / checksum, et les 2 346 390 updates ont été marquées non séquencées dans ce rejeu**. Nous avons validé l'ordre des lignes et leur cohérence locale, pas l'absence de messages omis par la source avant archivage. L'intégrité du fichier n'est pas une preuve d'intégrité logique du flux de marché.

## 1. Protocole préenregistré

- [**Protocole figé AVANT de télécharger l'archive complète**](./SEVEN_HEAVEN_OKX_L2_BTC_USDC_FULL_DAY_STREAMING_FOUR_ANCHORS_FROZEN_PROTOCOL_2026_11_12.md), commit `14b8009d344a2866571e056369eec33e9d8ba27e`.
- [**Programme Python de lecture gzip+tar en flux, décodeur NDJSON et carnet par prix**](./SEVEN_HEAVEN_OKX_L2_BTC_USDC_FULL_DAY_STREAMING_FOUR_ANCHORS_2026_11_12.py).
- [**GitHub Actions : exécution réussie**](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43258907031). Compilation, contrôles synthétiques, traitement complet, contrôles des preuves et publication ont tous réussi.

Archive unique : `BTC-USDC-L2orderbook-400lv-2026-10-15.tar.gz` téléchargée en **GET public**, issue de [l'archive historique officielle L2 400lv OKX](https://www.okx.com/historical-data). Le membre interne est `BTC-USDC-L2orderbook-400lv-2026-10-15.data`.

## 2. Vérification des octets de la source

| Contrôle | Résultat |
|---|---|
| Nombre d'octets compressés téléchargés | **56 920 312** (≈54,3 Mio) |
| SHA-256 de l'archive `.tar.gz` **entière** | `3b543b7333a6c71f4a8bf0ddf4e058fa84f61ad58092b3250784acc0964c7b44` |
| Nombre d'octets du membre `.data` **entier** | **457 277 836** |
| SHA-256 de ce membre entier | `a8a3231d34d03a0d261ac9952f1ba2a953a4d31986e04c8bbbbdc61c06264963` |
| gzip lu jusqu'au footer et contrôle CRC effectué | **Oui** |
| Compte du membre vs annonce du tar | **Identique** |
| 20 premières lignes vs preuves antérieures | **20/20 SHA-256 identiques** |
| Événements JSON `snapshot/update` acceptés | **2 346 486** |
| Première heure d'événement UTC | **00:00:00.005** |
| Dernière heure d'événement UTC | **23:59:59.935** |
| Plus grand intervalle entre deux événements | **2 190 ms** |
| Liens `seqId/prevSeqId` disponibles pour attester la continuité | **0** |

La vérification CRC et les SHA-256 établissent l'intégrité **de notre copie téléchargée et traitée**, sans constituer une signature cryptographique d'OKX ni prouver qu'aucun message n'a été omis lors de la collecte initiale.

## 3. Quatre observations de carnet fixées AVANT le replay

**Sélection : premier état entièrement reconstruit à ou juste après 00 h, 06 h, 12 h et 18 h UTC**. Décalage 3–9 ms suivant l'heure. La somme des notions d'achat et de vente est calculée **sans frais de plateforme** ; aucune quantité n'a été exécutée.

| Heure cible UTC | Décalage réel | Meilleur bid BTC/USDC | Meilleur ask BTC/USDC | Spread (bp) |
|---|---:|---:|---:|---:|
| 00 h | +5 ms | 81 588,0 | 81 588,1 | **0,01225670** |
| 06 h | +3 ms | 80 508,1 | 80 508,2 | **0,01242110** |
| 12 h | +9 ms | 80 898,2 | 80 898,3 | **0,01236121** |
| 18 h | +8 ms | 82 355,9 | 82 356,0 | **0,01214241** |

Le spread est `(ask-bid)/mid*10 000`. La présence de quatre spreads voisins est un résultat **de ces quatre horaires**, pas une preuve de stabilité toute la journée. Le programme a traité tous les événements mais **n'a calculé les métriques de spread qu'aux quatre ancres**, selon le protocole préenregistré.

## 4. Marcher le carnet : impact théorique avant frais

Le coût est la variation moyenne du prix par rapport au **mid** (bp). Pour un achat, on consomme les asks jusqu'à dépenser le notionnel USDC ; pour une vente, on consomme les bids pour vendre une quantité BTC égale à `notionnel/mid`. Les montants sont **par côté**, calculés sur la quantité visible à l'instant échantillonné.

| Horaire UTC | Achat de 1 000 USDC | Vente équivalente | Achat de 100 000 USDC | Vente équivalente |
|---|---:|---:|---:|---:|
| 00 h | 0,0061 bp | 0,0061 bp | 1,6653 bp | 0,0061 bp |
| 06 h | 0,0062 bp | 0,0062 bp | 0,8139 bp | 1,8281 bp |
| 12 h | 0,0265 bp | 0,0062 bp | 1,5889 bp | 0,3884 bp |
| 18 h | 0,0061 bp | 0,0259 bp | 0,5675 bp | 1,0389 bp |

À titre illustratif, **l'achat 100 000 USDC à 00 h** consomme les quatre meilleurs niveaux, alors que **la vente notionnelle correspondante** tient sur le meilleur bid à cet instant. À 12 h, l'achat de même taille traverse **13 niveaux**, alors que la vente en traverse quatre.

Ce sont des **VWAP calculés à partir d'un carnet gelé**, sans preuve de profondeur exécutable après latence, sans frais, sans validation des limites de compte et sans transaction. Le calcul n'est pas un ordre d'achat ou de vente.

## 5. Ce que l'étude démontre et ce qu'elle ne démontre pas

**Vérifié :** un pipeline peut télécharger en flux ≈57 Mo compressés, analyser **457 Mo de texte L2 sans fichier temporaire géant**, lire 2,35 millions d'événements dans l'ordre, appliquer les mises à jour, calculer des états du carnet et publier seulement des fichiers compacts. Les quatre mesures retenues respectent les horaires fixés avant les calculs.

**Non vérifié :** absence de deltas manquants en amont de l'archive, disponibilité exécutable du carnet, frais de compte, slippage réalisé, régime statistique inter-journalier, stabilité des spreads toute la journée, lien causal avec les performances EMA et coût historique des 122 opérations fictives déjà étudiées. Les carnets BTC/USDC sont distincts des anciennes clôtures Bitstamp BTC/USD.

La dépréciation des checksums des flux d'orderbook OKX ne doit **pas** être interprétée comme preuve que l'archive sans seqId peut être validée intégralement par SHA seul. Notre rapport conserve donc `global_logical_continuity_proven=false`.

## 6. Sources de preuve reproductibles

- [**Preuves JSON, SHA-256 COMPLETS du .tar.gz et du .data, comptes, 4 relevés et 20 simulations**](./okx_l2_btc_usdc_full_day_four_anchors_2026_11_12_evidence/SEVEN_HEAVEN_OKX_BTC_L2_FULL_DAY_FOUR_ANCHORS_PROOFS.json), blob Git `a80617f03e2c00856c2e8ccb2ec2c7eb26fcbf40`.
- [**CSV compact des 40 valeurs (achat/vente × 5 montants × 4 horaires)**](./okx_l2_btc_usdc_full_day_four_anchors_2026_11_12_evidence/SEVEN_HEAVEN_OKX_BTC_L2_FULL_DAY_FOUR_ANCHORS_COSTS.csv).
- [**Rapport automatique de l'exécution**](./okx_l2_btc_usdc_full_day_four_anchors_2026_11_12_evidence/SEVEN_HEAVEN_OKX_BTC_L2_FULL_DAY_FOUR_ANCHORS_REPORT.md).
- [**Reconstruction locale des 20 premiers événements, contrôlée et figée**](./SEVEN_HEAVEN_OKX_L2_BTC_FIRST_TWENTY_EVENTS_LOCAL_RECONSTRUCTION_AUDIT_2026_11_12.md).
- [**Code du pipeline**](./SEVEN_HEAVEN_OKX_L2_BTC_USDC_FULL_DAY_STREAMING_FOUR_ANCHORS_2026_11_12.py), [**workflow exécuté**](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43258907031).

## 7. Direction scientifique suivante

Faire le **même traitement sur ETH/USDC le 15 octobre 2026**, après protocole séparé et vérification de son premier événement ; son archive est plus lourde (~93,60 Mo compressés, ~777 Mo décompressés). Ce sera une seconde paire, **pas** un deuxième jour ou un échantillon représentatif. La comparaison simultanée ne pourra être revendiquée que si les quatre horaires UTC sont sélectionnés par les mêmes règles.

Ensuite, sur plusieurs journées différentes préenregistrées, comparer les dispersions et queues de distribution des coûts théoriques de carnet, sans optimiser les règles EMA à partir des résultats. Les archives natives restent sur OKX, leurs SHA et mesures condensées restent dans le Coffre.

**Aucune opération réelle et aucun changement Administrator, Operator, Trader ou Bridge.**