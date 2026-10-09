# Seven Heaven — Base historique extensible (premier lot Top 20)

## Destination

Un univers dynamique, alimenté par le Market existant, distinct des archives pilotes R2–R11. Le but est la conservation durable de prix et chandelles réellement sourcés, non un nouveau tableau HTML. Le Trader et l'Administrator ne sont pas modifiés.

## État et garde-fous

- Market : data/crypto/latest.json, univers rangé, prix et identifiants CoinGecko. Un snapshot de prix n'est pas une chandelle OHLCV.
- Legacy : data/historical_archive_prototype/ohlcv_spot_pilot et compact_v1 / partitions_r11, sept actifs et 21 séries à préserver, sans migration ou recollecte dans ce pilote.
- Registre : historical-universe-instruments.json associe explicitement l'identifiant CoinGecko au symbole, mode legacy ou pilot. Un ticker non approuvé ne devient pas un instrument.
- Extensions : universe/ contient uniquement les nouveaux blocs gzip immuables SHA-256 et leur index. Ce répertoire est créé uniquement sur collecte manuelle réussie.
- Les bougies Binance sont des données Spot en USDT, distinctes de USD, EUR et USDC. Aucune transaction réelle, clé privée, modification Firefox, Market Core, Bridge ou Backend.

## Qualification Top 20

Le collecteur lit les vingt premiers actifs du Market actuel. Les sept actifs R10 sont marqués legacy_preserved. Les nouveaux candidats approuvés sont USDC, DOGE, LINK, ADA et XLM, sous réserve de validation de paire réelle Binance Spot (base asset exact, quote USDT, TRADING, permission SPOT). Les autres sont identity_review_required ; aucune substitution ou fausse bougie.

## Commandes

- Offline : python public/agent_crypto_erith_ia/tools/collect_historical_universe.py --self-test
- Tests : python public/agent_crypto_erith_ia/tools/historical_universe_test.py
- Inventaire : python public/agent_crypto_erith_ia/tools/collect_historical_universe.py --plan --limit 20
- Collecte manuelle sur GitHub : Actions → Agent Crypto Historical Universe — bounded pilot → Run workflow → collect. Le défaut est plan sans réseau.
- Contrôle : python public/agent_crypto_erith_ia/tools/collect_historical_universe.py --verify

Le programme ne fait aucune requête avec --plan. --collect nécessite explicitement --enable-network. Par actif qualifié : bougies closes 24h / 5min / 288 points, 7d / 1h / 168 points, 30d / 4h / 180 points. Séries trouées ou incohérentes rejetées. Le workflow ne comporte aucun schedule et ne collecte jamais sur un push.

## Limites connues

Ce pilote est une première archive ponctuelle, pas encore un collecteur incrémental multi-années. Un index existant bloque toute deuxième collecte implicite ; la stratégie durable ultérieure est partitions scellées + queue active, après mesure de la volumétrie. Le lecteur historique R9 du Trader ne lit pas encore ce catalogue : le raccordement Trader-only est une étape ultérieure, après validation de données réelles. Le ZIP est disponible comme artefact GitHub Actions ; le premier --collect manuel doit réussir avant toute affirmation que de nouveaux OHLCV Binance ont été archivés.
