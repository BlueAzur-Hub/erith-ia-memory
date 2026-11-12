# Seven Heaven — OKX BTC/ETH Spot USDC, extension L2 à trois journées calendaires

**Protocole figé le 12 novembre 2026, AVANT récupération des nouvelles archives des 15 août et 15 septembre 2026.** Research-only, lecture publique, aucun ordre, aucune surveillance continue.

## Calendrier fixé sans sélection rétrospective des spreads

Choisir le **15 de chaque mois** d'août, septembre et octobre 2026 : **2026-08-15, 2026-09-15, 2026-10-15**. Cette règle calendaire ne sélectionne **ni une tendance ni un régime de marché**. Les deux premières dates sont **nouvelles** et doivent être testées; la troisième est notre référence antérieurement validée. Limiter le nouveau traitement aux quatre jeux **BTC-USDC/ETH-USDC × 15 août/15 septembre**. Ne pas remplacer une date si la source manque.

## Vérifications d'accès et garde-fous préalables

- Vérifier sur l'API publique officielle OKX `GET /api/v5/public/market-data-history` la présence effective de **l'archive quotidienne L2 400 niveaux** (`module=4`, `instType=SPOT`, `dateAggrType=daily`, `instIdList`, date UTC), pour la paire et date exactes.
- N'accepter que les noms `<PAIR>-L2orderbook-400lv-YYYY-MM-DD.tar.gz` sur le domaine `static.okx.com`, sous `/cdn/okx/match/orderbook/pro/L2/400lv/daily/YYYYMMDD/`. Si absent, dossier `unavailable`; **ne pas substituer USDT à USDC** ni une autre date.
- Pour chacun des quatre fichiers : HTTP GET public en flux, calcul SHA-256 de **l'ensemble** des octets compressés et du membre `.data`, vérification gzip jusqu'au footer/CRC, absence de fichier supplémentaire non prévu, horodatages L2 monotones dans la date UTC et `instId` exact.
- **Borne dure par fichier : 230 000 000 octets compressés et 1 400 000 000 octets décompressés**, pour prévenir un téléchargement ou décompactage inattendu. Un seul membre `.data`, aucune extraction sur disque et pas de données brutes géantes commitées.
- Parser les lignes NDJSON intégralement terminées, `snapshot/update`, taille=0 supprime un niveau, tailles positives mettent à jour. Refuser carnet vide/croisé et lignes JSON tronquées. `seqId/prevSeqId` à contrôler **s'ils existent** ; si absents, **ne pas prétendre une continuité logique certifiée**. Les SHA/CRC prouvent l'intégrité de la copie reçue, pas l'absence de pertes en amont.

## Échantillonnage préfixé identique au 15 octobre

Sur chaque jour et actif, sélectionner le **premier état de carnet reconstruit à ou après** 00:00, 06:00, 12:00 et 18:00 UTC (**retard <= 60 secondes**, sinon ancre manquante et dossier incomplet). À chaque ancre :
- prix best bid/ask, spread en bp vs mid, nombre de niveaux actifs, horodatage réel, n° d'événement ;
- étude PAPER du coût de prix théorique **hors frais** sur cinq notionnels USDC **10, 100, 1 000, 10 000, 100 000**, séparément achat asks et vente bids ; profondeur insuffisante = `insufficient_visible_depth`, **aucun prix inventé** ;
- les résultats ne sont **pas** des exécutions réelles ni des frais personnels.

## Comparaison scientifique autorisée

Garder les preuves déjà épinglées du 15/10 :
- [BTC full-day](./okx_l2_btc_usdc_full_day_four_anchors_2026_11_12_evidence/SEVEN_HEAVEN_OKX_BTC_L2_FULL_DAY_FOUR_ANCHORS_PROOFS.json), Git blob `a80617f03e2c00856c2e8ccb2ec2c7eb26fcbf40`.
- [ETH full-day](./okx_l2_eth_usdc_full_day_four_anchors_2026_11_12_evidence/SEVEN_HEAVEN_OKX_ETH_L2_FULL_DAY_FOUR_ANCHORS_PROOFS.json), Git blob `621c7edd2367d1cc9acb3bb13d6c11838df0fb86`.

Si toutes les archives demandées passent, comparer les **12 ancres par actif sur trois dates** ; présenter les 12 points, la moyenne/médiane **de ces 12 points seulement**, et les différences couplées BTC/ETH, ainsi que les coûts théoriques par notionnel. 12 relevés ne permettent **pas** une distribution représentative du marché ni de définir les régimes. En cas d'archive manquante/échec, publier les cellules manquantes et conserver exactement les dates.

## Publication et arrêt

Pour chaque paire/jour : fichier JSON compact avec SHA-256 et comptages intégraux, CSV des 40 côtés, rapport synthétique. Un rapport combiné conditionné à la qualité, puis une mise à jour de passation inter-IA dans `coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/`.

Pas de réoptimisation des EMA, aucune substitution de données Bitstamp/USD par OKX/USDC et aucun recalcul abusif des 122 trades fictifs de 2024–2026. Aucun compte, aucune clé privée, aucune écriture dans Administrator, Trader, Operator ou Bridge. **Action GitHub ponctuelle, pas de `schedule`.**
