# Seven Heaven — ETH/USDC OKX L2 400lv : lecture intégrale en flux et quatre horaires gelés

**Protocole publié le 12 novembre 2026 AVANT toute lecture intégrale de l'archive ETH.** L'exécution est **conditionnée au succès du premier contrôle de 20 événements ETH**, et n'est ni un ordre de marché ni une tâche récurrente.

## Sources et données déjà connues

- Archive Spot officielle du **15 octobre 2026** : `https://static.okx.com/cdn/okx/match/orderbook/pro/L2/400lv/daily/20261015/ETH-USDC-L2orderbook-400lv-2026-10-15.tar.gz`.
- Métadonnées OKX : environ **93,60 Mo compressés annoncés**. Membre tar interne `ETH-USDC-L2orderbook-400lv-2026-10-15.data`, **776 655 177 octets décompressés annoncés**.
- [Preuve préliminaire de structure](./okx_historical_l2_format_probe_2026_11_12_evidence/SEVEN_HEAVEN_OKX_HISTORICAL_L2_ARCHIVE_FORMAT_EVIDENCE.json), Git blob `216875ba0d5af88d0acffc2cfc495e659c9fad2f`. Le premier fragment ETH a `instId:"ETH-USDC"`, `action:"snapshot"`, `ts:"1792022400001"`, mais n'inclut pas l'événement complet.
- [Programme BTC validé sur 2 346 486 événements](./SEVEN_HEAVEN_OKX_L2_BTC_USDC_FULL_DAY_STREAMING_FOUR_ANCHORS_2026_11_12.py) et [preuve complète BTC, même jour](./okx_l2_btc_usdc_full_day_four_anchors_2026_11_12_evidence/SEVEN_HEAVEN_OKX_BTC_L2_FULL_DAY_FOUR_ANCHORS_PROOFS.json). **Le protocole ETH ne réoptimise rien en fonction des spreads BTC**.

## Précondition bloquante

Le [contrôle des 20 premiers événements JSON ETH](./SEVEN_HEAVEN_OKX_L2_ETH_USDC_COMPLETE_EVENTS_AND_DELTA_VALIDATION_PROTOCOL_2026_11_12.md) doit être **publié, vérifié par relecture GitHub, et réussir** : première snapshot avec asks/bids, updates correctement appliquées, sans incohérence d'identité, d'horodatage, de prix ou de suppression. Les 20 empreintes SHA-256 des lignes deviennent une **référence épinglée** à comparer avant les calculs de la journée complète. Si ce prérequis échoue, pas de workflow intégral ni de conclusion de spread.

## Même méthode que BTC, différences autorisées explicitement

Le seul changement de périmètre est l'actif ETH et les limites de volume :
- HTTP GET public de l'unique fichier ETH ci-dessus. Lire gzip + tar **en flux**, sans enregistrer le `.data` ni le `.tar.gz` dans GitHub.
- **180 000 000 octets maximum compressés** ; **1 000 000 000 octets maximum de fichier décompressé** ; taille tar **exactement** 776 655 177 octets ; membres réguliers conformes au nom attendu ; refus de tout membre supplémentaire inattendu.
- SHA-256 calculés sur **l'intégralité** des octets `.tar.gz` et `.data`, gzip lu jusqu'au footer et CRC, compteur d'événements et des snapshots/deltas, compteurs de suppressions. Respect strict de **150 000 octets maximum par ligne JSON** ; refuser une ligne tronquée ou un événement non parsable.
- Conserver l'ordre des enregistrements, `ts` UTC 2026-10-15 non décroissants, `instId=ETH-USDC`, `action=snapshot` ou `update` seulement ; prix strictement positif, taille positive sauf suppression `size=0`. Vérifier carnet bid/ask non vide et non croisé après chaque événement. Contrôler une chaîne `seqId/prevSeqId` si elle existe ; sinon afficher la limite **continuité logique non prouvée**. Des SHA/CRC valides prouvent que nous avons traité le fichier sans altération détectée, **pas** l'absence de trous de séquence antérieurs.
- Comparer impérativement les **20 premières lignes** de l'archive complète avec leurs SHA épinglés de l'audit préliminaire ETH ; refus en cas d'écart.

## Quatre heures communes fixes, sans sélection ex post

Mesurer le **premier état complet validé à ou après** 2026-10-15 **00:00, 06:00, 12:00, 18:00 UTC**, avec décalage réel **<= 60 secondes**. Si une heure est manquante, dossier marqué incomplet, sans interpolation ni remplacement.

Pour chaque heure, enregistrer best bid/ask, spread en bp depuis le mid, niveaux visibles, n° de l'événement, timestamp exact, et coût de prix théorique **sans frais** :
- Notionnels **10, 100, 1 000, 10 000 et 100 000 USDC**, identiques à BTC.
- Achat : dépenser le montant dans les asks ; vente : céder quantité ETH `notionnel/mid` dans les bids ; profondeur insuffisante = refus chiffrage, sans extrapolation.
- Publier les **40 résultats** (4 heures × 5 montants × achat/vente), et les SHA intégraux dans un JSON compact, un CSV et un rapport Markdown. Aucune taille minimum de compte ni frais réellement payés ne sont prétendus.

## Interprétation & critères d'arrêt

Un jour ETH et un jour BTC permettent **une comparaison intra-date à quatre horaires** ; ils ne représentent pas une distribution mensuelle/annuelle ni une validation d'exécution réelle. En cas d'archive tronquée, CRC incorrecte, lignes invalides, décalage trop important ou préfixe incohérent, **ne pas qualifier les données valides**. Les tailles USDC ne sont ni des ordres réellement exécutés ni des positions EMA.

Aucun compte OKX, aucun ordre, aucun secret, aucun Bridge / Trader / Operator / Administrator modifié. Code, preuves et rapport enregistrés exclusivement dans `coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/`. Pas d'exécution périodique programmée.