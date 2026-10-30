# Seven Heaven — R11.2 : partitions scellées conservées dans GitHub

Date : 8 octobre 2026. Statut : évolution additive indépendante de R10/R9.

**Source canonique :** archives R2 et deltas R8, 21 séries USDT, bornées à 100 deltas. La collection compacte R9 et le Coffre Firefox demeurent inchangés.

**Nouvelle destination :** public/agent_crypto_erith_ia/data/historical_archive_prototype/partitions_r11/ avec index.json actualisable et blocs gzip à noms contenant leurs empreintes SHA-256. Aucune partition existante n'est remplacée ou effacée. Les index antérieurs sont vérifiés pour refuser la disparition ou la mutation de leurs séries scellées.

Découpage : UTC jour (24h/5m), semaine commençant le lundi (7j/1h), mois (30j/4h). IMPORTANT : les données seed commencent parfois à l'intérieur d'une période calendaire. Le champ boundary_kind marque ce premier bloc scellé comme partial_origin, distinct de full_period. Il n'est scellé qu'une fois son extrémité temporelle clôturée. Les queues non clôturées ne sont pas publiées en bloc et demeurent référencées via R8/R9 : R11 n'est donc pas encore un archiveur autonome de données récentes.

Un bloc scellé doit passer la vérification longueur gzip, SHA-256, identité des séries, huit colonnes OHLCV, dates UTC et reconstruction sans trou ni doublon. Si un bloc/index antérieur diffère : arrêt, sans remplacement. La publication sur GitHub n'implique pas une rétention WORM contre la réécriture des historiques par un administrateur.

**Workflow R11 :** agent-crypto-historical-partitions-r11.yml ; tests R8/R9, tests négatifs, lecteur Node et reconstruction R11 en dossier temporaire avant publication, puis commit atomique des seuls fichiers partitions_r11. Déclenchement sur changement du code, déclenchement manuel et programme UTC à minute 52. ATTENTION : un commit R10 créé par le jeton GitHub Actions ne redéclenche pas via push un autre workflow ; l'horloge R11 reste indépendante, et le fonctionnement effectif du schedule doit être prouvé par une exécution event=schedule. La cadence prévue n'est pas une garantie.

**Exemples CLI :**
- python public/agent_crypto_erith_ia/tools/build_historical_partitions_r11.py --self-test
- python public/agent_crypto_erith_ia/tools/build_historical_partitions_r11.py --plan
- python public/agent_crypto_erith_ia/tools/build_historical_partitions_r11.py --publish
- python public/agent_crypto_erith_ia/tools/build_historical_partitions_r11.py --verify --target public/agent_crypto_erith_ia/data/historical_archive_prototype/partitions_r11

Protections : Administrator 40.6.624, Market Core 38.15.11, Graphiques Ligne/Bougies, Trader, Bridge, Backend, IndexedDB, archives d'origine et workflow collecteur R10 intact. Pas d'ordre financier. Le lecteur R11 dans le Coffre et le traitement de la limite de 100 deltas restent de futurs chantiers à valider.
