# Seven Heaven — OKX BTC/USDC Spot L2 400lv : journée complète lue en flux, protocole gelé

**Préenregistrement : 12 novembre 2026, avant téléchargement intégral de l'archive BTC.**
Aucun ordre, aucun compte, aucune surveillance périodique.

## État acquis avant ce protocole

L'archive officielle BTC-USDC du **15 octobre 2026** a été référencée via API OKX ; une lecture **de 71 680 octets compressés** a permis de reconstruire localement **20 événements JSON complets** : une snapshot de 400 asks/bids, puis 19 deltas. [Preuve JSON](./okx_l2_btc_usdc_complete_event_prefix_2026_11_12_evidence/SEVEN_HEAVEN_OKX_L2_BTC_COMPLETE_EVENT_PREFIX_PROOFS.json), Git blob `c47e3844788efbe8e55bf357db9b6a2675bf474f`. **Aucun `seqId`, `prevSeqId` ni `checksum` dans les 20 premiers événements** : l'absence de trous de messages ne peut pas être certifiée par séquences sur ce préfixe.

## Source et contraintes immuables

- UNE archive seulement : `https://static.okx.com/cdn/okx/match/orderbook/pro/L2/400lv/daily/20261015/BTC-USDC-L2orderbook-400lv-2026-10-15.tar.gz`, membre `BTC-USDC-L2orderbook-400lv-2026-10-15.data`.
- Archive compressée annoncée **54,28 Mo**, membre décompressé annoncé **457 277 836 octets**. Limiter la lecture comprimée à **120 000 000 octets** et le volume de données .data décodé à **600 000 000 octets**. Bloquer au dépassement. Ne **jamais écrire les 457 Mo** en fichiers intermédiaires ni dans GitHub.
- HTTP GET public direct, pas de credentials, pas d'ordres. Lire les octets compressés avec SHA-256 et compteur. Décoder gzip et tar **en flux** ; parcourir entièrement les événements NDJSON du membre ; terminer le flux gzip jusqu'au footer CRC pour valider sa complétude. Calculer aussi SHA-256 **du membre complet**, compteur de lignes et SHA-256 de chaque premier événement préenregistré ; comparer les 20 premiers événements avec la preuve de préfixe antérieure.
- Événements strictement JSON, `instId=BTC-USDC`, `action=snapshot/update`, `ts` dans **2026-10-15 UTC**, dates non décroissantes, prix >0, quantité >=0 ; snapshot tailles >0 et ordre du carnet croissant asks/décroissant bids ; `size=0` suppression. En cas de snapshot ultérieure, remise à zéro. **Refuser un delta sans snapshot, un carnet croisé/vide, une ligne de longueur excessive ou un chemin de membre différent**.
- Rejeter des `prevSeqId` incohérents si ces champs existent. Si les archives n'ont pas de numérotation, **ne pas qualifier la chaîne de messages globalement vérifiée**, même si chaque événement est parsé et monotone.

## Sélection FIXE des horaires, AVANT de voir les résultats

Quatre ancres UTC de la même journée : **00:00, 06:00, 12:00, 18:00**. Choisir le **premier état reconstruit valide à ou après chaque ancre** (et <=60 secondes après), noter le timestamp exact, l'écart en millisecondes et le nombre de deltas appliqués depuis la snapshot. Si aucune donnée acceptable, marquer `missing_anchor`, ne rien interpoler.

Pour chaque ancre :
- meilleurs bid/ask, spread en bp vs mid, nombre de niveaux actifs, timestamp UTC ;
- pour **10, 100, 1 000, 10 000, 100 000 USDC** : achat fictif au carnet visible et vente de quantité équivalente à notionnel/mid, VWAP et écart en bp ; si manque de profondeur, `insufficient_depth` et aucune estimation ;
- la taille/quantité est en actif de base. Aucune grille de frais personnels : publier **la friction du carnet uniquement**, sans présenter les coûts comme des exécutions réelles.

## Limites interprétatives et livrables

**Une journée BTC seule ne donne pas une distribution représentative de 2024–2026** ; quatre ancres ne sont pas un échantillon aléatoire. Même si l'archive complète, son SHA et sa CRC sont validés, **l'absence de séquence rend la continuité logique de l'ordre des événements non prouvable**. Si des anomalies apparaissent, produire un rapport d'échec descriptif et ne pas annoncer quatre chiffres comme validés.

Publier uniquement preuves compactes (JSON : SHA-256 archive complète/membre, taille, contrôles, compteurs, ancres), CSV des cinq notionnels aux quatre horaires, rapport humain, code et contrôle synthétique. Emplacement : `coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/`. Workflow GitHub Actions **ponctuel** et sans `schedule`. Aucun ordre ni changement Administrator / Trader / Operator / Bridge.
