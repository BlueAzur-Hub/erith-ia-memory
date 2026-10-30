# Seven Heaven — Historique vérifié R9 dans Trader + relais d'automatisation
8 octobre 2026. Demande opérateur : « vasy y fait le ».

## Architecture et fichiers

**Trader 40.6.624 reste l'iframe Administrator 40.6.624.** Le fichier `trader-runtime-mirror.js` ne fait qu'insérer `trader-historical-panel.js` dans ce runtime sur la surface Trader. Panneau repliable à la fin de la zone Marché, fermé par défaut, visible seulement dans Trader. Aucun second moteur du graphique n'est créé.

À l'ouverture, charge à la demande `administrator/js/historical-compact-reader.js` et réutilise l'API existante `SevenCompactArchiveReader.refreshIndex()` + `readSeries({assetId,period})`. Il ne récupère qu'un index et le fichier gzip de la série explicitement sélectionnée, sous vérification SHA-256 et cohérence des données. Affiche 12 dernières bougies OHLCV, l'instrument Binance Spot **USDT**, bornes UTC, date du snapshot et **NON LIVE**. Choix 24h/5min, 7j/1h, 30j/4h. La sélection est reliée uniquement à l'identifiant canonique `getSelectedCoin().id` et à `agent-crypto:selected-market-changed`. S'il n'y a pas de couverture (notamment OKB), message **archive non disponible**, jamais de substitution BTC. Jeton de requête invalidant réponses tardives BTC→OKB. Panneau fermé : aucune lecture réseau, aucun polling. Les Bougies OKX USDC et la Profondeur restent strictement indépendantes ; pas de conversion USDT↔USDC/USD, pas d'ordre.

## Automatisation

Commit des workflows relais : https://github.com/BlueAzur-Hub/erith-ia-memory/commit/6b1d80ddf4562a90cbd492595a1d254d4a4adcd6

- R10 `schedule: 17 * * * *` reste en place ; ajout `workflow_run` après `Atlas Public Crypto Market` qui réussit par événement `schedule`, sur main. Nouveau job `cadence` : si la dernière capture R8 date de moins de 52 minutes, le job de collecte est sauté. Les push / déclenchements manuels restent autorisés. Limite R8 à 100 deltas et contrôles prépublication inchangés.
- R11 `schedule: 52 * * * *` reste en place ; ajout `workflow_run` après la réussite de R10 sur main, y compris lors des commits R10 via `GITHUB_TOKEN`. Les archives partitionnées ne sont publiées qu'après replay et contrôles d'immutabilité.

**Preuve initiale relayée :** R10 push [37739074821](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/37739074821) SUCCESS ; première mise à jour de R8+R9 à 2026-10-08 06:43:28 UTC, **4 914 chandelles / 6 deltas**, contre 4 746 / 5 ; [R11 workflow_run 37739223186](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/37739223186) a été déclenché après R10. Confirmation de sa conclusion et du premier véritable déclenchement R10 `workflow_run` depuis un Atlas `schedule` encore nécessaires ; ne pas déclarer autonomie horaire achevée uniquement sur ces premiers runs. Les chemins historiques source-of-truth sont intacts hors publication additive validée.

## Tests attendus

CI Node VM : fermeture sans réseau, ouverture index + une seule série, réponse indisponible pour OKB, période sans récharger le catalogue, ancienne réponse BTC ignorée après sélection OKB, syntaxe JS, absence de nouveau moteur. Tests R9/R10 précédents et correction Market/Profondeur protégés. Validation Firefox limitée : déplier Historique vérifié en bas du Trader, BTC→OKB, vérifier que l'archive BTCUSDT se charge et que OKB indique non disponible. Les graphiques live demeurent OKX USDC.

## Interdits maintenus

Ne pas modifier Market Core 38.15.11, Administrator 40.6.624, app.js, Bougies, Lecture Technique, Profondeur, Graphique Ligne, Source Dock, Bridge, Backend, IndexedDB ni échanger implicitement USD/USDC/USDT. Aucun ordre financier.
