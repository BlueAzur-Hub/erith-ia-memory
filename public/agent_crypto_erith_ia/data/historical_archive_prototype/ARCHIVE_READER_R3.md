# R3 — Historical Archive Reader · Seven Heaven

## Mission
Lire dans **Firefox via GitHub Pages** la véritable archive de chandelles R2, sans modifier l'Interface Administrator 40.6.624, le Market Core 38.15.11, le Trader, le Bridge ou la mémoire locale.

- Page : `administrator/historical-archive-reader.html`.
- Source unique : `data/historical_archive_prototype/ohlcv_spot_pilot/manifest.json`.
- Archive : fichier `ohlcv_top10_YYYY-MM-DD.json.gz` indiqué par le manifeste.
- Déclenchement manuel : bouton **Vérifier l'archive** (aucune lecture automatique).
- Validation : taille gzip, SHA-256, décompression via API Firefox `DecompressionStream`, taille JSON, schémas, sources/quotes, nombres d'actifs, trois périodes, absence de trous, chandelles clôturées, OHLC, volumes.
- Affichage : nombre de chandelles par crypto, horaires UTC, actifs absents, rapport copiable ne contenant aucun prix.

## Règles
La source est Binance Spot **USDT**, pas USD, pas EUR, pas OKX, et non assimilable à une série CoinGecko. Si un contrôle échoue, l'archive est rejetée. Aucune écriture IndexedDB/localStorage, aucun ordre, aucun transfert de données privées vers GitHub. Aucun raccordement au Graphique avant validation Firefox.

## Succession
R4 (non fait) : manifeste/index cumulatif, append par chandelles manquantes, idempotence et test de deux collectes, rétention.
R5 (non fait) : adaptateur de lecture explicite avec source, devise, fraîcheur et cache, sans changer les propriétaires historiques du Graphique avant preuve.
R6 (non fait) : Top 50 uniquement après mesure de la volumétrie/quotas.

Dossier de livraison : ZIP compact en plus du commit GitHub.
