# Seven Heaven — OKX BTC/ETH USDC L2 : 96 états par jour, protocole préenregistré

**Publié le 12 novembre 2026, AVANT toute nouvelle analyse des états à 15 minutes.** Étude rétrospective PAPER uniquement. Aucune donnée de compte, ordre, veille récurrente ou modification Trader/Bridge.

## Question et limites initiales

Nos 6 archives Spot L2 officielles OKX sur les 15 août, 15 septembre et 15 octobre 2026 ont été intégralement traitées, mais **seuls 4 instants par jour** ont été exploités dans les comparaisons. Notre nouveau but est de tester une grille plus dense **sur le seul 15 octobre 2026** (BTC-USDC et ETH-USDC) en conservant le replay exact du carnet, sans confondre la présence de 96 événements `snapshot` avec une distribution représentative de toutes les secondes.

## Sélection FIXÉE indépendamment des spreads

**96 horaires théoriques fixes : toutes les 15 minutes de 2026-10-15 00:00 UTC à 23:45 UTC**, bornes incluses. Chaque état est le **premier carnet complet valide reconstruit à ou après** l'heure cible avec tolérance maximale de **60 000 ms**. L'archive doit avoir un état initial `snapshot` avant toute mise à jour ; sinon fail. Toutes les dates et heures sont UTC, avec dates conservées en ISO 8601. En l'absence d'un état dans la fenêtre, la cellule `missing_anchor` reste vide : **ne jamais interpoler ni choisir l'heure suivante**.

Distinguer :
1. La grille des **96 états échantillonnés** : elle repose sur le calendrier, pas sur les événements snapshot.
2. Les **96 éventuelles photos `action=snapshot`** archivées : collecter leurs vrais timestamps/numéros d'événement, **sans supposer qu'elles tombent parfaitement à 15 minutes ni qu'elles sont exactement 96**. Comparer l'écart à la grille en ms, compter les photos qui manquent des créneaux, les duplicates et décalages ; ne pas corriger les données après coup.
3. Les **quatre sous-ancres historiques 00/06/12/18 UTC** : vérifier indépendamment l'égalité des spreads, meilleurs prix et timestamp des relevés déjà publiés, avant de déclarer la nouvelle extraction cohérente.

## Sources figées et vérifications de qualité

- Source BTC : `https://static.okx.com/cdn/okx/match/orderbook/pro/L2/400lv/daily/20261015/BTC-USDC-L2orderbook-400lv-2026-10-15.tar.gz`. SHA-256 complet attendu `3b543b7333a6c71f4a8bf0ddf4e058fa84f61ad58092b3250784acc0964c7b44` ; membre décompressé 457277836 octets, SHA-256 `a8a3231d34d03a0d261ac9952f1ba2a953a4d31986e04c8bbbbdc61c06264963`.
- Source ETH : `https://static.okx.com/cdn/okx/match/orderbook/pro/L2/400lv/daily/20261015/ETH-USDC-L2orderbook-400lv-2026-10-15.tar.gz`. SHA-256 complet attendu `048d039eed1d6a18c166f022e8fe02359308445be682d1405df09b61fbc03546` ; membre décompressé 776655177 octets, SHA-256 `a47f70abc79c28bdb52831e0dfdce32e1bf48ca962c3d2f5e8bc9e233a430d5d`.
- Quatre relevés déjà vérifiés : [preuves BTC](./okx_l2_btc_usdc_full_day_four_anchors_2026_11_12_evidence/SEVEN_HEAVEN_OKX_BTC_L2_FULL_DAY_FOUR_ANCHORS_PROOFS.json) et [preuves ETH](./okx_l2_eth_usdc_full_day_four_anchors_2026_11_12_evidence/SEVEN_HEAVEN_OKX_ETH_L2_FULL_DAY_FOUR_ANCHORS_PROOFS.json) ; mêmes identifiants, même date et mêmes algorithmes de calcul. Épingler leurs Git blobs.
- Lire entièrement les archives `.tar.gz` en **flux** ; SHA-256 des octets complets, membre unique attendu, CRC gzip jusqu'au footer ; **230 Mo compressés maximum** et **1,4 Go décompressés maximum** par archive ; jamais de membre `.data` géant stocké ou committé.
- Valider chaque événement NDJSON, identité, horodatages non décroissants, ordre snapshot/update, suppression `size=0`, quantité et prix, carnet non vide et non croisé. Si `seqId/prevSeqId` absents, ne **jamais** déclarer la continuité logique amont prouvée, malgré SHA et CRC valides.

## Mesures fixées pour 96 états

À chaque horaire : temps réel, décalage ms, meilleur bid/ask, spread relatif en bp, nombre de niveaux actifs, type de dernier événement et nombre d'événements appliqués ; pour **10, 100, 1 000, 10 000, 100 000 USDC**, coût théorique par côté sur asks/bids visibles, mêmes règles que les études déjà publiées (VWAP vs mid, **hors frais**, profondeur insuffisante = vide).

Après validation des deux archives : **192 états maximum et 1 920 coûts théoriques maximum**, si tous les créneaux sont présents. Calculer la moyenne, la médiane, les percentiles empiriques 10/90, la plage min/max et le nombre effectif des **96 instants d'une journée par actif**. Rapporter également les quatre échantillons existants pour comparaison. Les quantiles sont **descriptifs de la grille 15 minutes d'une seule journée**, pas une distribution globale de tous les événements ou de plusieurs mois. Comparer les actifs uniquement aux 96 heures appariées réellement valides ; pas d'extrapolation sur un créneau manquant.

## Critères d'arrêt et publication

Une archive invalide SHA/CRC, un croisement de carnet, un delta avant snapshot, un horaire absent ou un désaccord avec les quatre points de référence doit être **documenté**, non corrigé silencieusement. Publier preuves JSON complètes **compactes**, CSV des 96 états, CSV des coûts fixes, résumé technique et passation inter-IA exclusivement dans `coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/`.

GitHub Actions ponctuel, sans `schedule` ; ne pas modifier EMA 10/30, ni prétendre estimer la rentabilité des 122 trades historiques Bitstamp/USD à partir d'OKX/USDC. Aucun ordre réel.
