# Historical Vault V1 — Long History / Multi-actifs

## But

Faire entrer la profondeur historique déjà certifiée du projet Seven Heaven dans le Strategy Lab sans confondre **archive indexée** et **source localement simulable**.

## Provenance canonique

Snapshot local : `data/historical_vault_v1.json`.

Source : `BlueAzur-Hub/erith-ia-memory/public/agent_crypto_erith_ia/data/historical_archive_prototype/year_depth_index.json`.

Git blob épinglé : `f97dc90291ec67661ff2b263de1de78a56f8a100`.

Schéma source : `aerith.public.ohlcv.top250.verifiable-year-depth.v1`.

Le snapshot retient le Top 5 de recherche actuel : BTC, ETH, BNB, XRP et SOL. Il ne copie aucune bougie OHLCV distante dans le programme.

## Lecture du Coffre

Le panneau affiche notamment :

- 250 identités classées dans l'index source ;
- 122 actifs avec archives vérifiées ;
- 108 avec au moins 12 mois fermés consécutifs ;
- 90 avec au moins 24 mois fermés consécutifs ;
- 248 087 520 minutes natives référencées dans le catalogue source.

Ces chiffres décrivent l'index canonique. Ils ne signifient pas que toutes ces bougies sont déjà installées sur la clé locale.

## Installation V1

V1 autorise uniquement les années complètes **2024** et **2025** pour BTC/ETH/BNB/XRP/SOL. Ces dix combinaisons possèdent 12/12 mois dans le snapshot canonique.

Sur action explicite :

1. le serveur construit uniquement l'URL fixe Binance Public Data de la paire/année autorisée ;
2. il télécharge chaque ZIP mensuel 1m et son `.CHECKSUM` ;
3. SHA-256 ZIP = checksum publié ;
4. le ZIP doit contenir exactement le CSV attendu ;
5. toutes les minutes du mois doivent être continues, sans doublon ni trou ;
6. OHLCV est vérifié ;
7. 60 minutes closes sont agrégées en une bougie 1h ;
8. les 12 mois doivent former une année horaire continue ;
9. seuls `bars.csv` 1h + `manifest.json` sont écrits dans `workspace/catalog_sources/` ;
10. le chargeur générique Source Catalog relit et revalide la source avant qu'elle soit déclarée utilisable.

Aucun ZIP brut n'est conservé.

## Sécurité / portée

- Public market data uniquement.
- Aucun compte Binance, aucune API key, aucun wallet.
- Aucun endpoint d'ordre.
- PAPER uniquement.
- Réserve locale de 2,5 Go protégée avant installation.
- Une erreur sur un seul mois refuse l'année entière.
- 2019–2021 reste visible comme profondeur indexée partielle ; V1 ne fabrique pas une année complète à partir de trous.

## Étapes suivantes possibles

Après réception V1 :

- installer et tester un millésime 2024/2025 réel dans Firefox ;
- comparer une même StrategySpec sur plusieurs actifs et années ;
- ouvrir ensuite les blocs historiques partiels 2019–2021 comme séquences certifiées, sans les présenter comme années complètes ;
- étendre progressivement au-delà du Top 5 seulement lorsque le besoin scientifique le justifie.
