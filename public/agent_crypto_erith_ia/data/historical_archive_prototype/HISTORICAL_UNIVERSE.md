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

Le nouvel outil `tools/extend_historical_universe.py` lit le catalogue Universe d'origine et contrôle les 15 blocs SHA-256 avant d'accepter toute écriture. Sa **première collecte réelle du 9 octobre 2026** a ajouté 135 chandelles closes dans 10 segments incrémentaux sans modifier le pilote original ([run validé](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/37942209146), [commit](https://github.com/BlueAzur-Hub/erith-ia-memory/commit/daba66a472f8c6cae8e7d091c42725a394326595)). Il ne recalcule jamais les bougies initiales et n'écrit ni dans `universe/index.json` ni dans `universe/blocks/`, ni dans le Graphique, le Trader ou l'Administrator.

- `python public/agent_crypto_erith_ia/tools/extend_historical_universe.py --verify` : lecture et vérification hors réseau de l'archive initiale et de toute la chaîne incrémentale.
- `python public/agent_crypto_erith_ia/tools/extend_historical_universe.py --plan` : fenêtres éligibles hors réseau, nombre de nouvelles bougies et reste à rattraper.
- `python public/agent_crypto_erith_ia/tools/historical_universe_incremental_test.py` : régressions simulées hors réseau (absence, trou, arrêt, reprise, paire incorrecte, SHA-256).
- `python public/agent_crypto_erith_ia/tools/extend_historical_universe.py --collect --enable-network` : uniquement après décision explicite, avec accès aux endpoints publics Binance Spot. Sur GitHub : Actions → **Agent Crypto Historical Universe Incremental — manual protected append** → Run workflow → **collect**.

Le ledger `universe/incremental/index.json` est séparé du pilote et référence des blocs `universe/incremental/blocks/` immuables, chacun avec SHA-256 et chaîne temporelle sans trou. Un bloc ne contient que des chandelles closes, attachées à l'actif, à la paire, à la période et à la devise USDT. Les données ne deviennent publiques dans le catalogue qu'après validation complète. La répétition d'une collecte sans nouvelle bougie close est un NOOP, sans écriture.

Le lot est limité aux **5 actifs approuvés du pilote** et à **288 nouvelles chandelles par actif et par période** à chaque lancement ; les intervalles 5 min, 1 h, 4 h sont conservés. L'outil rattrape progressivement les interruptions sans sauter le temps : en cas de retard, plusieurs lancements distincts permettent le rattrapage. Si Binance refuse une paire ou retourne une série incomplète, la publication échoue sans modifier le ledger. La collecte automatique est limitée à **une exécution quotidienne à 03:37 UTC** par GitHub Actions (workflow `agent-crypto-historical-universe-incremental.yml`). Les événements push et PR ne déclenchent que les tests hors réseau ; les collectes peuvent aussi être lancées manuellement avec `collect`. Sans nouvelles bougies closes, le résultat est NOOP. Les conditions de sûreté (paire, continuité, empreintes, limite à 288 points par série et par passage) restent identiques. Aucun ordre réel ni conversion USDT/USD. **GitHub Actions peut retarder ou manquer des exécutions planifiées** : le journal reprend par continuité à la prochaine collecte. Si plus de 288 bougies de 5 min manquent, un seul lancement ne rattrape pas tout ; répéter manuellement jusqu'à zéro retard. **Le nombre maximal de 5 000 segments est un arrêt de sécurité, pas une stratégie pérenne pour 250 actifs** : préparer une politique de partitions scellées avant d'atteindre cette limite.

**Étapes encore nécessaires :** prouver le premier déclenchement **planifié** après fusion (le code seul ne garantit pas que GitHub exécutera le cron), gérer la rétention en partitions durables avant 5 000 segments, étendre progressivement la qualification Top 50/100/250 et raccorder les nouveaux segments au lecteur existant du Trader. La validation Firefox DOGE 24h ne concerne encore que le snapshot initial.


## Qualification Top 50 — nouveau lot indépendant

Le dossier `universe/cohorts/top50/` est une future **archive OHLCV indépendante**. Le collecteur `tools/collect_historical_cohort.py` n'est exécuté sur le réseau que par lancement manuel explicite, après le plan et les tests. Il ne modifie pas les données initiales R10/Universe, le ledger incrémental existant, le Trader ou l'Interface.

- Plan hors réseau : `python public/agent_crypto_erith_ia/tools/collect_historical_cohort.py --plan`.
- Test hors réseau : `python public/agent_crypto_erith_ia/tools/historical_cohort_test.py`.
- Vérification : `python public/agent_crypto_erith_ia/tools/collect_historical_cohort.py --verify`. Si le nouveau lot n'a pas encore été collecté, renvoie `NOT_COLLECTED`.
- Collecte contrôlée : GitHub Actions → **Agent Crypto Historical Cohort — qualified Top 50** → **Run workflow** → `collect`. Pas de collecte sur `push`, PR ou `schedule`.

L'inventaire classe chaque ligne réelle du **Top 50**, en distinguant 12 actifs déjà archivés, des candidats nouvellement approuvés et des identités qui nécessitent une enquête. Le registre `historical-cohort-instruments.json` sélectionne 13 nouvelles associations CoinGecko ID ↔ symbole, sous réserve de l'existence réelle d'une paire Binance Spot / USDT ouverte, avec baseAsset, quoteAsset, permission SPOT et status TRADING concordants. Toute série doit comprendre la totalité des bougies clôturées attendues aux horizons 24 h (5 min), 7 j (1 h) et 30 j (4 h), sinon l'actif est explicitement marqué incomplet et non publié. Le ZIP GitHub Actions accompagne chaque run.

**Il ne s'agit pas encore d'une couverture historique intégrale des 50 actifs** : les instruments non qualifiés et les 12 actifs déjà archivés ne sont pas duplicés. La collecte validée constitue un premier lot ponctuel ; la durabilité incrémentale et sa lecture dans Trader nécessitent une extension ultérieure, après contrôle des données réellement produites. Les identités atypiques `FIGR_HELOC`, `GRAM`, `M` ou `BUIDL` ne sont pas automatiquement converties en paires Binance.


## Top 50 · journal incrémental des 12 nouveaux actifs

La première collecte Top 50 du 9 octobre est validée : [GitHub Actions #37945474055](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/37945474055), [commit b962cd10d](https://github.com/BlueAzur-Hub/erith-ia-memory/commit/b962cd10d8b33f91ae833491ae8efe0a0abf27ac), soit **12 nouveaux actifs / 36 séries / 7 632 bougies Binance Spot USDT**. CRO a échoué à la consultation `exchangeInfo`; ce n'est pas une archive. Au total, 24 actifs distincts sont archivés dans les trois familles existantes.

Le nouveau script `tools/extend_historical_cohort.py` reprend les validations de `extend_historical_universe.py` et l'index déjà vérifié de `collect_historical_cohort.py`. Il **ne réécrit jamais** `universe/cohorts/top50/index.json`, ni les blocs d'origine, ni les archives Universe 5 actifs, ni R10/R11. Les données ajoutées sont conservées dans `universe/cohorts/top50/incremental/` (index séparé + blocs gzip immuables SHA-256), chaque segment débutant immédiatement après la dernière chandelle vérifiée de sa série. Paires USDT non équivalentes au prix USD CoinGecko.

Commandes sûres :
- `python public/agent_crypto_erith_ia/tools/extend_historical_cohort.py --plan` : plan lecture seule, **sans réseau**.
- `python public/agent_crypto_erith_ia/tools/extend_historical_cohort.py --verify` : vérifie les 36 blocs d'origine et tous les nouveaux segments.
- `python public/agent_crypto_erith_ia/tools/historical_cohort_incremental_test.py` : tests hors réseau (continuité, NOOP, lacunes, falsification SHA, paire incorrecte, archive originelle modifiée).
- GitHub Actions → **Agent Crypto Historical Cohort Incremental — protected manual append** → `Run workflow` → `collect` : première collecte réelle explicite, avec `--enable-network`.

La limite est de **288 nouvelles bougies par paire/période/passage**, pour 12 actifs et trois résolutions : 5 min (24 h), 1 h (7 j), 4 h (30 j). Si la fenêtre ancienne comporte davantage de données manquantes, les relances continueront dans l'ordre sans trous. Un NOOP n'écrit aucun fichier. Les `push` et PR n'effectuent **aucune collecte réseau**. Aucun horaire automatisé n'est ajouté au nouveau lot avant une première preuve réelle et l'analyse de capacité. L'ancien workflow quotidien Universe 5 actifs n'est pas modifié.

Attention : les archives cumulatives nouvelles ne sont **pas encore exploitées par le panneau historique du Trader**. La validation DOGE concerne le snapshot Universe 5 actifs, pas cette nouvelle famille. La généralisation à Top 100/250 et la rotation des archives (cap de 5 000 segments) restent à concevoir et à valider. La première collecte réelle du nouveau journal n'a pas encore été exécutée à la livraison du code.
