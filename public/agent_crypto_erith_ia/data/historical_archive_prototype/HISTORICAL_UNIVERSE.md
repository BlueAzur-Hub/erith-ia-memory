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

L'index originel Universe reste une archive ponctuelle et immuable. Les 15 séries / 3 180 bougies initiales de 5 nouveaux actifs ont été capturées et vérifiées. Le Trader lit les nouveaux blocs via son panneau Historique R9 + UNIVERS (DOGE 24 h vérifié dans Firefox). Le lecteur Trader affiche encore le snapshot d'origine, et **ne lit pas les segments incrémentaux** : leur exploitation est un chantier ultérieur. Les ZIP sont des artefacts GitHub Actions.


## Extension cumulative manuelle et sûre (après le pilote)

Le nouvel outil `tools/extend_historical_universe.py` lit le catalogue Universe d'origine et contrôle les 15 blocs SHA-256 avant d'accepter toute écriture. Il ne recalcule jamais les bougies initiales et n'écrit ni dans `universe/index.json` ni dans `universe/blocks/`, ni dans le Graphique, le Trader ou l'Administrator.

- `python public/agent_crypto_erith_ia/tools/extend_historical_universe.py --verify` : lecture et vérification hors réseau de l'archive initiale et de toute la chaîne incrémentale.
- `python public/agent_crypto_erith_ia/tools/extend_historical_universe.py --plan` : fenêtres éligibles hors réseau, nombre de nouvelles bougies et reste à rattraper.
- `python public/agent_crypto_erith_ia/tools/historical_universe_incremental_test.py` : régressions simulées hors réseau (absence, trou, arrêt, reprise, paire incorrecte, SHA-256).
- `python public/agent_crypto_erith_ia/tools/extend_historical_universe.py --collect --enable-network` : uniquement après décision explicite, avec accès aux endpoints publics Binance Spot. Sur GitHub : Actions → **Agent Crypto Historical Universe Incremental — manual protected append** → Run workflow → **collect**.

Le ledger `universe/incremental/index.json` est séparé du pilote et référence des blocs `universe/incremental/blocks/` immuables, chacun avec SHA-256 et chaîne temporelle sans trou. Un bloc ne contient que des chandelles closes, attachées à l'actif, à la paire, à la période et à la devise USDT. Les données ne deviennent publiques dans le catalogue qu'après validation complète. La répétition d'une collecte sans nouvelle bougie close est un NOOP, sans écriture.

Le lot est limité aux **5 actifs approuvés du pilote** et à **288 nouvelles chandelles par actif et par période** à chaque lancement ; les intervalles 5 min, 1 h, 4 h sont conservés. L'outil rattrape progressivement les interruptions sans sauter le temps : en cas de retard, plusieurs lancements distincts permettent le rattrapage. Si Binance refuse une paire ou retourne une série incomplète, la publication échoue sans modifier le ledger. Pas de planification horaire, pas d'ordre, pas de conversion USDT/USD.

**Étapes non encore réalisées :** une première collecte réseau incrémentale réelle, une automatisation supervisée, l'extension Top 50/100/250 et le raccordement des nouveaux segments au lecteur du Trader. Aucun de ces points ne doit être annoncé comme terminé sur le seul résultat des tests hors réseau.
