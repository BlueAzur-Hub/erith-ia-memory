# Seven Heaven — BTC/USDC OKX L2 : inspection d'événements complets et contrôle des mises à jour

**Protocole figé le 12 novembre 2026, avant la nouvelle lecture des événements.** Échantillon limité, recherche PAPER publique, aucune transaction.

## Motif et source
Le contrôle antérieur a vérifié que l'archive officielle du **15 octobre 2026** `BTC-USDC-L2orderbook-400lv-2026-10-15.tar.gz` est lisible par `Range`, mais que les **16 384 octets décompressés** ne contiennent pas le premier enregistrement JSON complet. Son membre est `BTC-USDC-L2orderbook-400lv-2026-10-15.data` (**457 277 836 octets annoncés**). Source canonique publique : `https://static.okx.com/cdn/okx/match/orderbook/pro/L2/400lv/daily/20261015/BTC-USDC-L2orderbook-400lv-2026-10-15.tar.gz`.

## Décision préenregistrée : BTC seulement
- Une unique archive, **BTC-USDC Spot, 15/10/2026**. Pas d'ETH tant que les événements BTC ne sont pas décodés ; pas de nouveaux jours ni de recherche des « bons » moments.
- `HTTP GET` avec `Range: bytes=0-2097151` (au maximum **2 Mio compressés lus**, même si le serveur ignore Range).
- Ouverture `tar.gz` en flux avec `tarfile.open(mode="r|gz")`. Uniquement le **premier fichier régulier**, jamais d'extraction sur disque.
- Lire au plus **524 288 octets décompressés** de ce membre, et analyser **les 20 premières lignes JSON complètes au maximum**. Ne jamais utiliser une ligne tronquée comme preuve. Limite de longueur par événement **100 000 octets**. Si format différent de NDJSON, arrêt descriptif.
- Archiver SHA-256 du **préfixe compressé consommé**, SHA-256 des **lignes JSON complètes examinées**, URL canonique, horaire et nom du membre. Aucun hash de préfixe ne doit être présenté comme celui d'une archive intégrale.
- Vérifier `instId`, `action`, `ts`, présence `asks` et `bids`, taille et prix valides, et l'existence de `seqId/prevSeqId/checksum` **si** les champs apparaissent. La doc actuelle indique que le checksum peut être déprécié ; ne pas supposer son rôle sans voir les données. <https://www.okx.com/docs-v5/en/>.
- Initialiser le carnet à la première `snapshot`. Pour chaque `update`, `size=0` supprime le niveau, `size>0` insère ou modifie la taille (si cette sémantique est compatible avec les champs réellement observés). `snapshot` ultérieure réinitialise. Vérifier `best_bid < best_ask`, prix ordonnés, temps non décroissant et, **si présents**, la chaîne `seqId/prevSeqId`. Ne pas déclarer une continuité de messages si la source n'a pas de compteurs de séquence.
- Stopper au premier événement incohérent, documenter index et cause. Aucune interpolation ni niveau inventé.
- Si l'échantillon contient uniquement une `snapshot` sans mise à jour, indiquer `snapshot_only`; ne pas prétendre valider le mécanisme incrémental. Si les mises à jour existent mais sans séquence, noter `local_aggregation_valid_no_global_sequence_proof`.

## Résultats attendus
Preuve JSON compacte (champs, types, longueurs, nombres de niveaux, timestamps, états reconstruit sur **ce préfixe seulement**, statut de continuité), CSV éventuel des 20 premiers événements, rapport Markdown avec erreurs éventuelles, code Python et tests synthétiques. Une seule exécution GitHub Actions, **aucune programmation récurrente**. Aucun fichier L2 complet committé.

### Critère d'arrêt et interprétation
La réussite valide au plus **le décodage du début de journée et sa reconstruction locale**, jamais la totalité des 457 Mo, ni les quantiles de spread de cette journée, ni les coûts historiques EMA. Les captures OKX/USDC ne sont pas les cours Bitstamp/USD de nos replays EMA. Toute étude complète doit être préenregistrée séparément avec les contrôles nécessaires.

**Coffre :** `coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/`. Aucune modification Administrator, Operator, Trader, Bridge, ni ordre réel.