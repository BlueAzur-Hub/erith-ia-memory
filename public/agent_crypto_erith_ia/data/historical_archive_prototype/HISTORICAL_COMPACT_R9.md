# R9 · Seven Heaven · Blocs historiques compacts immuables

## Objet et périmètre
Prototype **lecture seule, réversible**, séparé de la collecte R8 et des Graphiques. Les chandelles qualifiées Binance Spot USDT (7 actifs × 3 horizons) sont recopiées **sans transformation numérique** depuis l'archive R2 et les deltas R4/R8 validés, dans **21 fichiers gzip immuables** indexés par paire/période.

- Répertoire **nouveau** : \`data/historical_archive_prototype/compact_v1/\`.
- Catalogue \`compact_v1/index.json\` : source, devise, empreinte SHA-256 de l'**index R8 exact utilisé pour la construction**, âge de la capture, couverture et chemin/empreinte SHA-256 de chaque bloc.
- Blocs : \`compact_v1/series/<coin>_<period>_<sha16>.json.gz\` (nom fondé sur le contenu). Les fichiers existants **ne sont jamais écrasés** ; en cas de divergence pour un même nom, l'opération échoue fermée. Une nouvelle capture R8 peut créer de nouveaux blocs, les précédents restent intacts.
- Données : ordre exact des 8 colonnes OHLCV initiales ; aucun prix inventé, aucune conversion USDT→USD/EUR, aucune substitution des instruments non qualifiés.
- Lecteur \`administrator/js/historical-compact-reader.js\` : \`SevenCompactArchiveReader.listCoverage()\`, \`readSeries({assetId,period})\`. Pour une série, **1 catalogue + 1 bloc** seulement ; contrôle SHA-256 du bloc, sa cohérence et les 8 valeurs OHLCV. Pas de téléchargement des 21 blocs.
- UI : **section repliable R9 dans le Coffre F11 existant**, sans nouvelle page ni régression des sections R5/R6/R7. Choix BTC/ETH/BNB/XRP/SOL/TRX/ZEC, 24h/7j/30j, aperçu de six dernières chandelles.
- Le lecteur indique **SNAPSHOT NON LIVE**. Le SHA source et la date de capture sont enregistrés : lorsque R8 continue d'évoluer, ce prototype R9 reste un instantané exact **de la date source**, pas une source continuellement synchronisée.

## Contrôle des erreurs
- Le générateur \`tools/build_historical_compact_r9.py\` relit et vérifie les archives physiques R2+deltas puis la concordance de \`ohlcv_spot_pilot/index.json\`.
- Après construction, \`--verify\` recalcule les 21 SHA-256 et **compare chaque ligne numérique** avec la source originale. Aucune duplication ou omission tolérée.
- Les tests de lecture ciblée utilisent uniquement les vrais fichiers du dépôt, localement dans GitHub Actions. Corruption SHA, devises/identifiants non qualifiés et absence de lecture automatique sont testés.
- La construction via GitHub Actions est initialement déclenchée au push du script/workflow ou manuellement, **pas** par un nouveau calendrier. Pas de nouvelle écriture dans Firefox, ni d'ordre financier.

## Limite essentielle
**R9 ne remplace pas R8 ni les lecteurs R6/R7**. Le plafond conservatoire de **100 deltas R8** demeure inchangé ; ce prototype seul **ne permet pas encore de le relever**. Avant une phase R10, il faudra coordonner la reconstruction continue des blocs, le versionnement du catalogue, la conservation du journal brut et les lecteurs, sans perdre la preuve d'équivalence.

## Protections
Administrator 40.6.624, Market Core 38.15.11, Graphiques Ligne/Bougies, Top 5, Trader, Bridge, IndexedDB et originaux R2/R4/R8 **inchangés**. Pas de suppression ni relecture obligatoire du nouveau format côté production.
