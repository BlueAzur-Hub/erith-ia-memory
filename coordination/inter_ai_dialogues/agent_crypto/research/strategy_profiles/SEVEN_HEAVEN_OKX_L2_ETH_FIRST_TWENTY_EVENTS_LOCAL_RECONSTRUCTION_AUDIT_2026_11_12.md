# Seven Heaven — ETH/USDC OKX L2 : premiers 20 événements JSON reconstitués

**12 novembre 2026 — contrôle publié et vérifié.** Périmètre : archive officielle ETH-USDC Spot, journée UTC du **15 octobre 2026**, uniquement préfixe de fichier ; **aucune opération réelle**.

## Résultat observé sur GitHub Actions

[Exécution GitHub Actions SUCCESS](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43260305866) : compilation et autotest, lecture bornée HTTP **206 Partial Content**, parsing JSON, reconstruction locale et publication des preuves ont réussi.

- 71 680 octets compressés consommés dans une fenêtre HTTP Range plafonnée à 2 Mio, **524 288 octets décompressés** du premier membre.
- Membre attendu `ETH-USDC-L2orderbook-400lv-2026-10-15.data`, **776 655 177 octets décompressés annoncés** ; aucune archive complète n'a été téléchargée lors de ce préflight.
- **20 événements NDJSON complets** : **1 `snapshot`** initiale à **2026-10-15 00:00:00.001 UTC**, 400 niveaux bid et 400 niveaux ask, suivie de **19 `update`** jusqu'à **00:00:00.191 UTC**.
- Première meilleure vente **2 419,08 USDC** et premier meilleur achat **2 419,07 USDC** par ETH, spread **0,04133811 bp**.
- Au 20e événement, meilleur ask **2 419,85 USDC**, bid **2 419,50 USDC**, spread **1,44647525 bp**.
- Clés présentes sur les premiers événements : `action`, `asks`, `bids`, `instId`, `ts`. Les champs `seqId`, `prevSeqId`, `checksum` ne sont pas présents ; **19 updates ne disposent donc d'aucune chaîne de séquence vérifiable**.

**Interprétation prudente :** ces 20 événements ont été décodés et appliqués correctement selon leurs prix et quantités ; l'absence de `seqId` empêche de prouver qu'aucun message amont ne manque. L'augmentation du spread au 20e événement concerne **190 millisecondes de données**, pas une tendance quotidienne.

## Preuves, code et protocole

- [**Protocole prépublié avant cette collecte**](./SEVEN_HEAVEN_OKX_L2_ETH_USDC_COMPLETE_EVENTS_AND_DELTA_VALIDATION_PROTOCOL_2026_11_12.md), commit `4d73c0cd55c4fb58525a5405af2c108c4864c12a`.
- [**Script Python ETH du préfixe borné**](./SEVEN_HEAVEN_OKX_L2_ETH_USDC_COMPLETE_EVENT_PREFIX_RECONSTRUCTOR_2026_11_12.py), commit `d6ca5e3d5e53616b4071cc83720c4848ac1bdc61`.
- [**Preuves JSON : 20 empreintes SHA-256 d'événements, états et hashes de préfixe**](./okx_l2_eth_usdc_complete_event_prefix_2026_11_12_evidence/SEVEN_HEAVEN_OKX_L2_ETH_COMPLETE_EVENT_PREFIX_PROOFS.json), Git blob `8edbfef935c47f23d39e09600564497f2c4d309e`.
- [**GitHub Actions SUCCESS**](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43260305866).

## État du chantier intégral

Le [protocole gelé de journée complète ETH](./SEVEN_HEAVEN_OKX_L2_ETH_USDC_FULL_DAY_STREAMING_FOUR_ANCHORS_FROZEN_PROTOCOL_2026_11_12.md), commit `a24df8ebc60573d1a0a5f119ecf64ace8debcf13`, est maintenant éligible à exécution : il demande le **même jour et les mêmes quatre heures UTC 00/06/12/18** que BTC, les mêmes notionnels 10 à 100 000 USDC, la validation de l'archive entière et la concordance SHA des 20 premières lignes.

Ce préflight ETH ne prétend ni analyser les 777 Mo du fichier entier, ni mesurer une distribution de spreads, ni valider des coûts historiques EMA. Aucune modification du Trader, Bridge, Operator ou Administrator ; aucun ordre.