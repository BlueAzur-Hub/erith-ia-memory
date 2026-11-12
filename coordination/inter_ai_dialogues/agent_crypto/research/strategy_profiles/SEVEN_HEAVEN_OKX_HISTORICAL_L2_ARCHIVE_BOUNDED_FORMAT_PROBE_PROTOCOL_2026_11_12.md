# Seven Heaven — Inspection bornée du format des archives L2 officielles OKX

**12 novembre 2026 — préenregistré avant inspection des octets compressés.** Recherche publique, sans compte ni ordre.

## Sources attestées par métadonnées, pas encore par contenu décompressé

Une requête OKX `GET /api/v5/public/market-data-history` sur **le 15 octobre 2026**, `module=4`, `instType=SPOT`, `dateAggrType=daily` a retourné deux fichiers officiels :
- `BTC-USDC-L2orderbook-400lv-2026-10-15.tar.gz` : **54,28 Mo annoncés** ;
- `ETH-USDC-L2orderbook-400lv-2026-10-15.tar.gz` : **93,60 Mo annoncés**.

Preuves [JSON](./okx_historical_l2_archive_discovery_2026_11_12_evidence/SEVEN_HEAVEN_OKX_HISTORICAL_L2_DISCOVERY_EVIDENCE.json), Git blob `e07fd6eecf3c794ea69e4e0f133329463db67614`.

## Test limité, pas de téléchargement complet

Tester les **noms internes, le format des premières lignes et les horodatages éventuels**. Accepter exclusivement les deux fichiers ci-dessus, sur `https://static.okx.com/cdn/okx/match/orderbook/pro/L2/400lv/daily/20261015/`.

- **Maximum 2 000 000 octets compressés lus par instrument**, fermetures immédiates des réponses après inspection.
- **Maximum 16 Ko de contenu décompressé** du premier fichier régulier, et au plus 5 lignes lisibles tronquées. Ne jamais extraire l'archive intégrale ni la committer.
- Archiver les horodatages UTC, en-têtes HTTP utiles, octets réellement lus, SHA-256 **du préfixe reçu seulement** (pas du ZIP complet), noms internes et avertissements de format.
- En cas de refus d'accès, de gzip/tar tronqué ou de format ambigu, publier une erreur descriptive **sans fabriquer des colonnes ou des valeurs**.
- Aucun diagnostic de qualité de carnet, de spreads, de coût d'ordres réels ni de régime de marché déduit de ce préfixe.

La prochaine extraction devra respecter le format réellement constaté, sélectionner **à l'avance** des horaires UTC comparables, contrôler toute la source et ne conserver dans GitHub que les tableaux condensés et les empreintes. Pas de `schedule`, de compte ou d'ordre réel. Aucun changement Administrator/Operator/Trader/Bridge.