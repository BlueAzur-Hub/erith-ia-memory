# Seven Heaven — passation canonique du Coffre historique Crypto

**Clôture de fil : 10 octobre 2026 — Aerith-7 vers la prochaine Aerith.**
**Fichier stable de reprise ; lire ensuite les index et workflows sur `main` qui restent seuls canoniques.**
Cette passation documente des résultats effectivement observés ; les nombres peuvent progresser ultérieurement.

## A — Situation réelle vérifiée

- **113 / 250 cryptomonnaies** possèdent **au moins un mois natif complet archivé** (**45,2 %**). Il manque **12 actifs pour 125**, **37 pour 150**, **87 pour 200**, **137 pour 250**.
- **106 Binance Spot USDT** : source `data/historical_archive_prototype/top250_history_catalog/index.json`, **84 117 600 bougies 1 minute**.
- **7 Bitget Spot USDT** : source `data/historical_archive_prototype/bitget_verified_views/index.json`, **570 240 bougies 1 minute** ; actifs exacts : `hyperliquid/HYPE`, `cosmos/ATOM`, `lighter/LIT`, `stable-2/STABLE`, `bittorrent/BTT`, `terra-luna/LUNC`, `zebec-network/ZBCN`.
- **84 687 840 bougies natives 1 minute** dans le catalogue fédéré `top250_multisource_coverage/index.json`.
- **Profondeur Binance (distincte de la largeur)** : **80 actifs avec au moins 12 mois consécutifs**, **25 avec au moins 24 mois**. L'index `year_depth_index.json` a été recalculé à **106 actifs Binance**, avec BTC à partir de **2024-06** (premier mois archivé, PAS date de naissance ou première transaction).
- **Lecteur annuel** : `calendar_year_hourly_shards/index.json` matérialise **2 actifs (BTC/ETH)** et leurs blocs historiques 2024–2026. Étendre progressivement aux autres actifs sans réécrire les moteurs de contrôle.
- **Dernier ajout prouvé** : `zebec-network` / ZBCNUSDT (rang 171), septembre 2026, ZIP Bitget Spot 43 200 bougies + manifeste. Release : https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/crypto-spot-bitget-2026-09-1m-zebec-network ; commit de fédération `6960ed4f0376f356e89eaeb845fe5246ea574de6`.
- Publication vérifiée : collecteur Bitget [run 38075876919](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/38075876919) **SUCCESS** ; fédération [run 38075997062](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/38075997062) **SUCCESS** ; Pages [run 38076066032](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/38076066032) **SUCCESS**, sur commit `6960ed4f`.
- Le registre `top250-alt-market-evidence.json` a examiné **81 candidats** ; **7 correspondances CoinGecko exact-ID + Bitget Spot instrument** qualifiées et désormais archivées. **73 erreurs source indisponible**, 3 marchés non confirmés et 1 pagination incomplète restent un goulot réel : un symbole similaire n'est PAS une preuve d'identité.
- La référence `main` immédiatement avant la passation documentaire était `6960ed4f0376f356e89eaeb845fe5246ea574de6`. Tous chiffres doivent être relus au réveil de la prochaine IA.

## B — Architecture existante et résultats R12–R14

**Une interface utilisateur historique canonique :**
https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/administrator/historical-vault.html

- PR #255 / commit `abe41b880a` : le Coffre unique fédère Binance + Bitget, affiche Top 250, lecteur des bougies, bloc annuel BTC/ETH et diagnostics repliables. Ne pas recréer de page concurrente sans nécessité démontrée.
- PR #256 / commit `6deb10360` : correction de la chaîne `undefined (ATOMUSDT)` en utilisant le symbole authentifié. Vérification visuelle Firefox transmise par l'utilisateur pour ATOM : 8 640 bougies 5 minutes affichées sur 30 jours.
- PR #257 / commit `50be51eb0e` : déblocage des nouveaux candidats Bitget au-delà des trois premiers et rotation des erreurs CoinGecko anciennes.
- PR #258 / commit `560e149277` : collecte déclenchée après une preuve Spot exact-ID nouvellement publiée.
- PR #259 / commit `f30903f251` : Coffre tolérant un index annuel **vérifié mais plus ancien** que l'index Binance, sans cacher tout le tableau, et reconstruction annuelle chaînée au catalogue. Les tests annuels ont abandonné une date BTC figée `2024-08` car les vraies sources attestent `2024-06`.
- PR #260 / commit `3c45467a57` : priorité conservée des instruments Spot officiels même quand Binance s'enrichit ; réexamen équitable des requêtes source en erreur.
- PR #261 / commit `d78a4c0cb7` : chaînage correct du workflow de découverte vers la collecte Bitget (les commits issus du `GITHUB_TOKEN` ne suffisent pas à déclencher tous les `push` en cascade), plus **4 passages quotidiens à 01:29, 07:29, 13:29 et 19:29 UTC**, toujours dans le **même collecteur**, lot maximal **3 actifs** et écriture sérialisée. Tests PR réussis.
- Les workflows existants restent : `agent-crypto-top250-alt-venues.yml`, `agent-crypto-bitget-native-monthly.yml`, `agent-crypto-federated-spot-views.yml`, `agent-crypto-top250-history-catalog.yml`, `agent-crypto-historical-year-depth.yml`, et les pipelines historiques Binance/backfill et vues horaires.
- Archives et preuves conservées : ZIP mensuels natifs dans Releases, SHA-256, identité CoinGecko exacte + instrument Spot officiel, intégrité temporelle UTC, refus des mois partiels, pas de bougies interpolées ou d'historique fabriqué. Bitget a **7 champs natifs** et ne comporte pas une colonne `nombre de transactions` artificielle. Les cotations Binance/Bitget sont des paires **USDT** et ne sont pas automatiquement des dollars fiat.
- **Un mois archivé n'est pas un an**. Aucun `404`, absence de source, premier ZIP ou premier prix disponible ne peut, seul, prouver la création du token ni sa première transaction.

## D — Destination et liberté opérationnelle accordée par l'utilisateur

**Constituer la base réelle de 250 cryptomonnaies, avec historique de prix et chandelles d'au moins 12 mois quand l'âge et les données le permettent ; puis remonter chaque historique vers sa première cotation réellement disponible. Étendre ensuite au Top 500, puis à environ 1 000.**

L'utilisateur a expressément laissé la liberté de faire **évoluer le projet et son architecture**. Ce n'est plus une interdiction générale de modifier des modules : optimiser les collecteurs, la topologie de stockage, la reprise incrémentale, les formats historiques et les lecteurs si nécessaire, avec audits de code, tests de non-régression, sauvegardes et commits vérifiables. Préserver la stabilité du Trader, du Bridge et du Market Core, et ne les modifier que lorsqu'un besoin de données ou d'interopérabilité clairement vérifié le justifie. **Aucune restriction créative**, mais aucune donnée fictive ni publication non vérifiée.

**L'audit général des bots/workflows redondants est reporté** jusqu'à une couverture historique substantielle : ne pas se détourner du chantier pour refaire le catalogue des automations. Réutiliser les collecteurs existants tant qu'ils progressent. Ne pas multiplier inutilement les pages et les agents.

## Prochain ordre de travail : agir, vérifier, poursuivre

1. **Relire l'état vivant** : `main`, les cinq index et les Releases, les derniers workflows et le Notion AETHER. Recalculer les deux indicateurs : (A) actifs avec ≥1 mois, (B) actifs avec ≥12 mois consécutifs. Ne jamais utiliser un chiffre historique de ce document sans le contrôler.
2. **Accélérer largeur 113 → 125 → 150 → 200 → 250**. Goulot immédiat : beaucoup de marchés CoinGecko/OKX/Bitget sont encore `source_unavailable`; poursuivre les lots à quotas et requalifications exact-ID, puis compléter un mois de bougies 1m natif. Utiliser intelligemment les autres sources Spot réellement authentifiables et publiques ; une source instrument n'autorise pas l'assimilation d'un autre token ayant le même ticker.
3. **Accélérer la profondeur en parallèle**. Les nouveaux HYPE/BTT/LUNC/ZBCN n'ont qu'un mois ; remonter mois par mois lorsqu'ils existent. Binance déjà 106 actifs, 80 ont ≥12 mois ; compléter les trous et étendre les blocs annuels multi-actifs avec des vues légères indexées, sans forcer un énorme téléchargement Firefox. Sur Bitget, le nouveau scheduler prend le mois UTC complet récent encore manquant, puis recule, 3 candidats qualifiés max par run.
4. **Construire l'évolutivité vers 500/1000** : archiver les identités, classements et versions des univers sans détruire l'univers Top250 existant ; partitionner les collectes et les lectures, bornes de débit, backfill résumable, manifestes SHA et index de couverture par source et période.
5. **Livrer par lots fiables** : commit `main`, contrôles PR/CI, ZIP source et manifeste ou données indexées réellement publiés, catalogue fédéré recalculé, GitHub Pages si la consultation change, test de lecture quand nécessaire, puis Notion. Si des Actions continuent, ne pas les déclarer réussies prématurément.
6. **Pas de répétition de questions utilisateur** : l'accord de poursuivre le Coffre et d'améliorer l'architecture est donné. En l'absence d'une décision indispensable, choisir une prochaine action concrète, puis la réaliser. S'il faut arrêter à la limite de chat, actualiser ce même fichier et transmettre la suite plutôt que recréer l'histoire.

**Suivi programmé déjà actif** : vérification environ toutes les 4 heures du Coffre, avec notification uniquement lors d'un changement significatif attesté ou d'un blocage ; ne pas créer un deuxième suivi redondant.

## Références canoniques

- Dépôt : https://github.com/BlueAzur-Hub/erith-ia-memory
- Handoff : https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/SEVEN_HEAVEN_COFFRE_HISTORIQUE_PASSATION.md
- Catalogue fédéré : https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/top250_multisource_coverage/index.json
- Vues Bitget : https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/bitget_verified_views/index.json
- Catalogue Binance : https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/top250_history_catalog/index.json
- Profondeur annuelle : https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/year_depth_index.json
- Coffre Firefox : https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/administrator/historical-vault.html
- Bureaux Notion : https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099
- Routage mémoire Seven : lire la source privée `core/SEVEN_TOP_OF_MIND.md` via Aether Router et seulement les modules nécessaires ; ne pas charger massivement toute la mémoire.

## Prompt de reprise prêt à exécuter

> Active Aerith-7 / Seven Heaven comme cadre principal. Lis cette passation canonique sur GitHub `main` et les derniers Bureaux AETHER Notion. Vérifie les cinq index du Coffre, les Releases et les GitHub Actions récents : le dernier point de référence prouvé est **113/250 (106 Binance + 7 Bitget), 84 687 840 bougies natives 1m, 80 Binance avec ≥12 mois et 25 avec ≥24 mois**. L'objectif D est une base réelle Top250, puis 500/1000, chaque actif ayant ≥12 mois lorsque possible et un backfill jusqu'à la première cotation réellement accessible. Ne confonds jamais largeur et profondeur. L'utilisateur autorise l'évolution nécessaire de l'architecture ; privilégie néanmoins les outils et pages déjà opérationnels. Fais avancer un lot authentifié et publie une preuve commit/CI/ZIP/index, puis mets Notion à jour. N'invente aucune donnée. Ne demande pas de nouveau feu vert pour les étapes ordinaires du Coffre. Si tu atteins la limite de fil, actualise la passation et transmets l'état sans rien prétendre d'inachevé.
