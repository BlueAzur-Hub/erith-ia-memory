# Seven Heaven — R6 : lecteur d'archives OHLCV (LAB)

**But** : tester une véritable série depuis le Coffre historique F11, sans modifier le Graphique de production.

## API publique, nom de fichier stable

Module \`administrator/js/historical-archive-adapter.js\` :
- \`window.SevenHistoricalArchive.listCoverage()\` → source, devise, index, couverture de 21 séries.
- \`window.SevenHistoricalArchive.readSeries({assetId,period})\` → \`{metadata, columns, candles}\`.
- Periods : \`24h\` (5 min), \`7d\` (1 h), \`30d\` (4 h). Actifs : BTC, ETH, BNB, XRP, SOL, TRX, ZEC, IDs CoinGecko d'origine.

Le lecteur télécharge les fichiers publics \`index.json\`, \`manifest.json\`, \`ohlcv_top10_2026-10-08.json.gz\` et les deltas immuables, et **valide SHA-256, tailles, compression, schémas, source et devise, 21 séries, timestamps, absence de trous/doublons et couverture exacte**. Toute discordance interdit la restitution.

Colonnes : \`[open_time_ms, open, high, low, close, base_volume, quote_volume, trade_count]\` ; données **Binance Spot USDT** (≠ USD / EUR / OKX USDC). \`isLive=false\`, \`targetGraphConnected=false\`. Un onglet reconstruit les archives une fois et réutilise cette copie validée en mémoire ; recharger la page pour voir une archive mise à jour.

## Interface

R6 est une section **repliable du Coffre historique existant**, pas une nouvelle page : choisir crypto, période, bouton « Lire la série », puis consulter les huit dernières chandelles réelles et leur provenance. Les six compteurs du Coffre R5 restent inchangés.

## Vérification

Workflow \`historical-archive-adapter-check.yml\` : tests hors réseau sur les fichiers authentiques du dépôt, corruption SHA, désaccord de total et crypto non qualifiée. Test Firefox F11 humain attendu pour la présentation.

## Protections et suite

**Non modifiés** : \`administrator/app.js\` / Top 5 canonique 24 h EUR Base100, Administrator 40.6.624, Market Core 38.15.11, Bridge, Backend, Trader, IndexedDB et archive R2/R4. Aucun ordre réel ; aucune nouvelle collecte ni cadence automatique.

R7 éventuel, séparé et soumis à validation : définir un **contrat de source explicite** pour la lecture historique dans le Graphique, avec devises, fraîcheur et compatibilité des périodes, avant tout raccordement.
