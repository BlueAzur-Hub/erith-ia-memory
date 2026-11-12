# Seven Heaven — 20 premiers événements complets BTC-USDC L2 OKX : audit vérifié

**12 novembre 2026 — lecture publique, aucun ordre réel, aucun compte.**

## Résultat acquis

Pour l'archive officielle `BTC-USDC-L2orderbook-400lv-2026-10-15.tar.gz` (membre `.data` de 457 277 836 octets annoncés), le programme Python a téléchargé **71 680 octets compressés** via HTTP **206 Partial Content** et lu **524 288 octets décompressés** du début. Il a identifié puis contrôlé **20 événements NDJSON complets** :
- **1 snapshot** contenant **400 ask et 400 bid** ;
- **19 updates** appliquées par prix ; une taille zéro supprime le niveau, une taille positive le met à jour ; les meilleurs cours ne sont jamais croisés dans cet échantillon ;
- Événements observés du **2026-10-15 00:00:00.005 UTC** au **00:00:00.315 UTC** ;
- Premier `best_bid=81588` et `best_ask=81588.1` (USDC/BTC) ; **spread calculé 0,0122567 bp** ;
- À la vingtième mise à jour, `best_bid=81599.6` et `best_ask=81599.7` ; **spread 0,01225495 bp**.

**Résultat scientifique déterminant :** les 20 JSON examinés ont les clés `action, asks, bids, instId, ts` mais **ne contiennent pas de `seqId`, `prevSeqId` ou `checksum`**. Le programme vérifie l'ordre de lecture, les timestamps et les états reconstruits, **mais il ne peut pas attester l'absence de messages omis par numérotation de séquence**. La CRC et le SHA-256 d'un futur fichier entier ne résoudront pas à eux seuls ce problème de continuité logique.

## Traçabilité

- [**Protocole figé avant extraction, 20 lignes JSON et borne 2 MiB**](./SEVEN_HEAVEN_OKX_L2_BTC_USDC_COMPLETE_EVENTS_AND_DELTA_VALIDATION_PROTOCOL_2026_11_12.md), commit `4f73f2549aea8029989f011835bd28cfc4e4efb7`.
- [**Programme Python de reconstruction locale**](./SEVEN_HEAVEN_OKX_L2_BTC_USDC_COMPLETE_EVENT_PREFIX_RECONSTRUCTOR_2026_11_12.py), commit `39f5661`.
- [**JSON de preuves : SHA de préfixe, hash de chaque ligne et premiers états du carnet**](./okx_l2_btc_usdc_complete_event_prefix_2026_11_12_evidence/SEVEN_HEAVEN_OKX_L2_BTC_COMPLETE_EVENT_PREFIX_PROOFS.json), Git blob `c47e3844788efbe8e55bf357db9b6a2675bf474f`.
- [**GitHub Actions : succès de la compilation, autotest et lecture bornée**](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43257608393).

Seuls **les 20 premiers événements** du jour ont été validés ; l'archive complète est nettement plus grande et n'a pas été téléchargée durant ce contrôle. Ce n'est **pas une distribution de spread** représentative ni une validation des 122 ordres fictifs EMA.

## Étape engagée après cet audit

Le [protocole de journée complète, gelé AVANT le téléchargement intégral](./SEVEN_HEAVEN_OKX_L2_BTC_USDC_FULL_DAY_STREAMING_FOUR_ANCHORS_FROZEN_PROTOCOL_2026_11_12.md), commit `14b8009`, prévoit de reconstituer le carnet en flux à partir des événements `snapshot/update`, vérifier le SHA-256 de l'archive et du membre, la CRC gzip, l'égalité des 20 premiers hashes, puis enregistrer **exactement 4 horaires fixes** (00 h, 06 h, 12 h et 18 h UTC) et les coûts de carnet pour 10–100 000 USDC. **Aucun résultat de cette journée complète n'est revendiqué dans le présent audit.**

Le livre sans numéros de séquence demeure **une limitation**, même si le scanner de journée complète réussit techniquement. Il serait incorrect d'annoncer une intégrité de séquence de toutes les mises à jour sans preuve indépendante.

Aucune modification de Trader, Operator, Administrator ou Bridge.