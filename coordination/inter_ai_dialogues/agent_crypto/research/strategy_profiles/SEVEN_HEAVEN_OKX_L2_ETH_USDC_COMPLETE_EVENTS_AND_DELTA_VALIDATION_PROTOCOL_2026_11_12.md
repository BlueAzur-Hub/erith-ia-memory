# Seven Heaven — ETH/USDC Spot OKX L2 : premier préfixe complet, protocole gelé

**12 novembre 2026 — publié AVANT lecture supplémentaire du fichier ETH.** Un seul instrument, un seul jour UTC, lecture de données publiques sans compte ou ordre réel.

## Contexte et source épinglée

Le format d'archive [déjà inspecté sans décompresser le fichier entier](./okx_historical_l2_format_probe_2026_11_12_evidence/SEVEN_HEAVEN_OKX_HISTORICAL_L2_ARCHIVE_FORMAT_EVIDENCE.json), Git blob `216875ba0d5af88d0acffc2cfc495e659c9fad2f`, établit la présence du membre `ETH-USDC-L2orderbook-400lv-2026-10-15.data` dans une archive `.tar.gz` officielle de l'**ETH-USDC Spot du 15 octobre 2026**. La taille décompressée annoncée du membre est **776 655 177 octets**. Les 16 premiers Kio contenaient seulement le début d'une première `snapshot` JSON avec `instId=ETH-USDC` et `ts=1792022400001`.

## Méthode figée avant données

Reprendre **les mêmes règles** que la [vérification BTC du 12 novembre](./SEVEN_HEAVEN_OKX_L2_BTC_USDC_COMPLETE_EVENTS_AND_DELTA_VALIDATION_PROTOCOL_2026_11_12.md), avec seulement l'identifiant, l'URL du fichier et le nom du membre remplacés par ETH.

- Source unique `https://static.okx.com/cdn/okx/match/orderbook/pro/L2/400lv/daily/20261015/ETH-USDC-L2orderbook-400lv-2026-10-15.tar.gz`.
- HTTP GET public, `Range: bytes=0-2097151` ; **2 Mio compressés lus au maximum** ; `tar.gz` ouvert en flux, **524 288 octets décompressés maximum** du premier fichier régulier, aucune écriture du fichier géant.
- **20 premières lignes NDJSON intégralement terminées par `\n`**, chacune au plus **100 000 octets**. Rejeter une ligne partielle ; dater chaque événement en UTC 2026-10-15.
- `snapshot` initialise un carnet strictement ordonné (asks croissants, bids décroissants), `update` modifie les tailles ou supprime avec `size=0` ; vérifier `best_bid < best_ask`, tailles et prix valides, chrono non décroissante, paires identifiées exactement.
- Si `seqId/prevSeqId` sont observés, contrôler leur chaîne localement. Si absents, statut explicite **continuité logique non prouvée**, même si les 20 événements semblent cohérents. Aucune supposition de présence de checksum.
- Publier dans les preuves JSON SHA-256 **des seuls préfixes**, SHA de chacune des lignes complètes, nombres de snapshot/update, actions observées et meilleurs prix. Si erreur, conserver le statut exact, **pas de résultat fabriqué**.

## Critère pour passer à la journée complète

Uniquement si le préfixe donne une `snapshot` complète puis des événements `update` valides, avec règles de suppression locales cohérentes. Sinon corriger le modèle avant toute lecture de 777 Mo. Un succès n'est **pas** une validation globale du flux : les données complètes devront ensuite être lues et vérifiées avec CRC gzip, SHA-256 de l'archive entière et contrôles aux heures **00, 06, 12, 18 UTC** prédéfinies. Montants à conserver : 10, 100, 1 000, 10 000 et 100 000 USDC achat/vente.

**Coffre :** `coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/`. Aucun changement Administrator/Operator/Trader/Bridge, aucune tâche récurrente et aucun ordre.