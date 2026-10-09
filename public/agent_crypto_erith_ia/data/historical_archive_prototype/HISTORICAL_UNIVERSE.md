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

La limite est de **288 nouvelles bougies par paire/période/passage**, pour 12 actifs et trois résolutions : 5 min (24 h), 1 h (7 j), 4 h (30 j). Si la fenêtre ancienne comporte davantage de données manquantes, les relances continueront dans l'ordre sans trous. Un NOOP n'écrit aucun fichier. Les `push` et PR n'effectuent **aucune collecte réseau**. La **première collecte réelle a été validée le 9 octobre 2026** ([run #37947804350](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/37947804350), [commit d2af317](https://github.com/BlueAzur-Hub/erith-ia-memory/commit/d2af31766a4127d892200887849b164192b01b59)) : 432 nouvelles chandelles closes, 24 blocs pour les 12 actifs (408 bougies 5 min et 24 bougies 1 h). Le workflow Top 50 incrémental est désormais **programmé quotidiennement à 04:17 UTC**, décalé du lot Universe à 03:37 UTC ; les événements PR/push n'exécutent que des vérifications hors réseau. La cadence planifiée ne sera considérée comme prouvée qu'après son premier run `schedule` et un éventuel commit de bougies supplémentaires. Les jobs GitHub peuvent être différés ou supprimés, et la collecte doit alors rattraper les lacunes au fil des passages. L'ancien workflow quotidien Universe 5 actifs n'est pas modifié.

Attention : les archives cumulatives nouvelles ne sont **pas encore exploitées par le panneau historique du Trader**. La validation DOGE concerne le snapshot Universe 5 actifs, pas cette nouvelle famille. La généralisation à Top 100/250 et la rotation des archives (cap de 5 000 segments) restent à concevoir et à valider. La première collecte réelle du nouveau journal n'a pas encore été exécutée à la livraison du code.


### Limite avant généralisation

Ce journal garde sa limite de sécurité de **5 000 blocs** et la collecte quotidienne peut générer jusqu'à **36 segments par jour** (12 actifs, 3 périodes) ; sans rotation, l'arrêt de sûreté interviendrait en environ quatre à cinq mois selon les disponibilités. **Ne pas étendre automatiquement la cadence à 50/100/250 actifs** avant d'avoir mis en place des partitions historiques scellées et un catalogue conservant leur continuité. Le premier déploiement de cette cadence n'ajoute aucune fenêtre au Trader ; ce dernier ne lit pas encore les incréments du Top 50.


## Rétrocollecte des périodes longues : 60/90 jours, un an, Max

Une extension indépendante `tools/backfill_historical_periods.py` lit l'inventaire déjà vérifié des 24 actifs historiques, sans modifier les trois familles R10/Universe/Top50, ni Trader/Administrator.

- `--plan` : sans réseau, identifie les propriétaires d'archives admissibles.
- `--verify` : vérifie tous les blocs SHA-256 déjà publiés dans `universe/long-periods/` ; sans archive, renvoie `NOT_COLLECTED`.
- `--collect --enable-network` : rétrocollecte manuelle seulement après tests et accord explicite. Workflow `Agent Crypto Historical Long Periods — validated backfill` → mode `collect`, aucun déclenchement sur push/PR.
- Après qualification d'une paire **Binance Spot USDT**, 90 jours = 540 bougies 4 h et un an = 365 bougies quotidiennes, si les séries sont effectivement disponibles, complètes, clôturées et continues. **60 jours** = découpe d'un bloc 90 jours validé ; si le 90 jours manque, tentative d'un bloc séparé 60 jours = 360 bougies 4 h. Le manifeste distingue `verified`, `derived_from_90d` et `unavailable` ; aucune fausse bougie pour un actif trop récent.
- **Max n'est pas couvert par une photographie d'un an** : la page peut seulement proposer Max lorsqu'un futur archivage paginé, depuis la première cotation vérifiable et jusqu'à la date demandée, aura prouvé sa couverture réelle.
- L'index `universe/long-periods/index.json` est publié après validation ; fichiers gzip immuables par SHA-256, source et devise explicites, aucune fusion silencieuse avec le prix CoinGecko USD. Il s'agit de snapshots historiques initiaux : leur actualisation cumulative réclamera une extension distincte.
- Les nouvelles périodes ne sont pas encore affichées par le lecteur historique actuel du Trader. Aucun nouveau panneau ou Graphique n'a été créé.

**État de preuve :** tests hors réseau avant première collecte réelle ; ne pas annoncer de couverture 90 j/1 an sur les 24 actifs tant que le manifeste Binance réel et les contrôles GitHub ne l'ont pas établie.

## Partitions scellées des journaux incrémentaux (métadonnées SHA-256)

Le module commun `tools/historical_archive_partitions.py` étend les lecteurs **existants** `extend_historical_universe.py` et `extend_historical_cohort.py` sans créer un deuxième collecteur. Le dépôt garde **toutes les bougies gzip d'origine exactement à leur emplacement actuel** ; aucun fichier `blocks/` n'est déplacé, remplacé ou supprimé. Ce sont uniquement les **références du journal** qui sont déplacées vers des manifestes scellés, vérifiés par SHA-256.

Chaque racine `incremental/index.json` peut désormais contenir deux listes : `partitions` (anciens manifestes gzip immuables) et `chunks` (références actives). L'ancien format contenant seulement `chunks` reste accepté ; aucun changement des 10 blocs Universe et des 24 blocs Top50 n'est nécessaire. Le lecteur de vérification reconstitue l'ordre **partitions → chunks actifs** ; il contrôle à chaque passage le hash du manifeste, toutes les bougies originales, leurs paires Binance/USDT et la continuité de chaque série. Les compteurs de l'inventaire cumulent les anciens segments scellés et les segments encore actifs pour éviter une fausse baisse de couverture après rotation.

**Rotation automatique uniquement après une collecte validée :** seuil de **360** références actives ; conservation de **72** références dans l'index actif, scellage du reste en un ou plusieurs manifestes de taille bornée, écriture du manifeste scellé **avant** la publication atomique de l'index. Cette rotation n'a pas d'effet sur les périodes du Graphique ou du Trader et ne réclame pas de manipulation Firefox. Les seuils sont des mesures de protection des manifestes, pas des limites de rétention OHLCV : les blocs historiques restent durablement référencés et vérifiés. Pas d'effacement automatique ni de compression irréversible des chandelles.

**Test de sûreté :** `python public/agent_crypto_erith_ia/tools/historical_archive_partitions_test.py` reproduit deux collectes successives pour Universe et Top50, une reprise et un NOOP, puis falsifie alternativement une partition SHA et une bougie gzip pour vérifier le rejet. Les workflows quotidiens exécutent ce test **hors réseau** avant tout accès Binance ; les événements PR/push ne collectent aucune bougie.

**Limites :** maximum de **10 000 manifestes** de métadonnées scellées, soit un horizon très supérieur aux 5 000 anciennes références actives, mais pas une preuve de stockage illimité. Pour 50/100/250 actifs, surveiller la taille de GitHub, le coût des vérifications intégrales et envisager des contrôles incrémentaux par période. Une rotation n'a pas encore eu lieu dans les archives réelles, car leurs journaux contiennent actuellement 10 et 24 entrées. La première rotation en production reste à confirmer ; ne pas annoncer une rotation réussie avant les preuves GitHub.



## Les 26 actifs restants du Top 50 figé : qualification explicite, sans confusion des paires

Source : le **catalogue Top 50 figé du 9 octobre 2026** dans `universe/cohorts/top50/index.json` (ne pas le remplacer avec `data/crypto/latest.json`, qui évolue). Total initial : **24 actifs déjà archivés et 26 encore sans archive**. Aucun recouvrement autorisé avec les propriétaires existants R10, Universe cinq actifs ou première cohorte Top50.

La seconde cohorte complémentaire utilise `historical-remaining-instruments.json` : **15 correspondances proposées CoinGecko ID → symbole** (HYPE, USDS, XMR, LEO, USDE, DAI, USD1, QNT, XAUT, USDG, CRO, PYUSD, OKB, PUMP, RLUSD) et **11 examens manuels** (USDT en tant que devise elle-même, FIGR_HELOC, WBT, RAIN, CC, BTW, GRAM ≠ TON, USYC, USDY, M, BUIDL). Une proposition de symbole n'est **pas** une paire Binance prouvée, ni une crypto archivée : le collecteur doit vérifier `exchangeInfo` pour la base, la devise USDT, le statut TRADING et la permission SPOT. Les instruments absents ou refusés restent non qualifiés. Pour l'API, une erreur de réseau est distinguée d'un marché effectivement absent : ne jamais substituer arbitrairement BTC, TON ou un contrat perpétuel.

**Nouveau flux isolé** : `tools/collect_historical_remaining.py --plan` (hors réseau), `--probe --enable-network` (lecture Binance sans aucune écriture), `--collect --enable-network` (lancement manuel seulement), `--verify` (vérification locale SHA-256). Il réutilise `collect_historical_cohort.py` pour construire et vérifier les **trois séries OHLCV entières** par crypto (24 h 5 min / 7 j 1 h / 30 j 4 h). Si une période manque, l'actif entier est classé `historical_data_incomplete`, sans trois séries artificiellement partielles. Le résultat est un catalogue immuable sous `universe/cohorts/top50-additional/`. Pas de modification du snapshot précédent, du Market, du Graphique, du Trader, du Bridge ou des journaux déjà validés.

L'inventaire `tools/audit_historical_coverage.py` compte les éventuels actifs supplémentaires **uniquement si le nouveau manifeste et ses fichiers SHA-256 sont présents et vérifiés**. Avant un premier run réseau réussi, la couverture reste **24/50**. Le registre conserve 11 dossiers de correspondance pour évaluation spécifique OKX/Bitget ou recherche de provenance ultérieure. Attention : une paire quote USDC ne devient pas une paire quote USDT, et aucune conversion USD ↔ USDT n'est faite dans cette étape.

Le workflow GitHub Actions `agent-crypto-historical-remaining.yml` propose `plan` (défaut), `probe` et `collect` par `workflow_dispatch` ; ses push et PR ne font que tests/plan **hors réseau**. **Exception contrôlée et unique :** le workflow séparé `agent-crypto-historical-remaining-bootstrap.yml` est déclenché uniquement par l'**ajout initial** du fichier d'autorisation `historical-remaining-bootstrap.json` sur la branche `main`, après fusion de la PR approuvée. Il refuse tout autre changement de ce fichier, exécute les tests hors réseau avant la collecte, vérifie les paires Binance Spot, publie seulement l'archive complémentaire et se termine. L'archive publiée ne contient pas le marqueur et ne peut donc pas redéclencher ce bootstrap. La PR seule n'exécute aucune collecte. Le ZIP est une pièce jointe Actions, pas un nouveau panneau CSS. **La collecte réelle n'est pas acquise par le succès des tests** ; vérifier ensuite le commit journal, la liste exacte des paires qualifiées, les trois séries par actif et la couverture révisée, puis préparer leur suivi incrémental, sans attendre une collecte nocturne hypothétique.
