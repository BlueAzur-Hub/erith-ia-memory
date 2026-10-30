# Seven Heaven — Preuve d'acquisition serveur EUR (28 octobre 2026)

## Résultat observé — preuve réelle, diagnostic isolé

Le collecteur générique de la PR [#700](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/700) a été exécuté sur un serveur GitHub Actions, sans clé CoinGecko Demo présente dans l'environnement de l'exécution. L'essai **a réussi pour cinq identifiants distincts** : réponses HTTP 200, statut `ready`, 289 points de prix historiques en EUR par actif, sans conversion navigateur ni substitution.

- CI et preuve : [exécution #40649033551](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/40649033551).
- Artefact exact [scanner-eur-pr700-diagnostic](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/40649033551/artifacts/12798697337), ID `12798697337` ; conservation GitHub annoncée jusqu'au **04/11/2026 à 07:18 UTC**.
- Horloge d'acquisition : `2026-10-28T07:17:50.825Z` → `2026-10-28T07:18:39.829Z`.
- Requête par actif : `GET /api/v3/coins/{id}/market_chart?vs_currency=eur&days=1&precision=full`.
- Source canonique du panier de diagnostic : snapshot public [CoinGecko Top 250](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/a6d3bf05a012d750a3d917f0e2dbd4be93936dd6/public/agent_crypto_erith_ia/data/crypto/latest.json), ID `coingecko-top250-usd-ecb-eur-github_2026-10-28T06:15:24.810Z`.
- Méthode de figement du panier : cinq plus fortes baisses 24 h de ce **snapshot archivé** dans le Top 100 ; variations du snapshot en USD, mais historiques demandés **directement en EUR**. Il ne s'agit **PAS** du Market Frame courant de Firefox.

| ID CoinGecko | Réponse | Points EUR 24 h | Validation |
|---|---:|---:|---|
| `pearl-2` | HTTP 200 | 289 | ready |
| `pancakeswap-token` | HTTP 200 | 289 | ready |
| `rain` | HTTP 200 | 289 | ready |
| `beldex` | HTTP 200 | 289 | ready |
| `venice-token` | HTTP 200 | 289 | ready |

**RAIN** (ID CoinGecko `rain`) : historique EUR natif réussi, HTTP 200, 289 points, première valeur `0.006383988253047189` EUR, dernière valeur `0.006350397010983844` EUR sur la fenêtre acquise. Ces nombres sont des observations du diagnostic, **pas une prévision ni un cours actuel exploitable après cette collecte**.

## Intégrité des preuves

- Empreinte calculée du JSON de collecte, vérifiée indépendamment sur les octets canoniques : `sha256:eb988e1ec0cf9da544db82d0338d4a81017c41934c535073cd06afb09c7b4920`.
- Empreinte du ZIP de l'artefact GitHub Actions : `sha256:7f3557ee2a553e08d706e89b87a0ef6947e11f86da632fed21292097b6b845a0`.
- Le fichier d'artefact contient `frozen_diagnostic_cohort.json` et `scanner_server_history.json`. L'empreinte SHA-256 atteste l'intégrité du fichier enregistré, **pas une signature cryptographique de CoinGecko**.
- La CI a réussi **14/14 tests** après correction d'un défaut d'intégrité : une série ayant un trou intérieur supérieur à 30 minutes est désormais rejetée. Commits de code `f1a0c76981bf5f586ccde04f1671b3c94fce0f7d` et `6725761b9809674ac064fcaabf361c3d02353ca5` sur la branche de la PR #700.
- Le diagnostic PR-only a été déclenché par la synchronisation de la PR et non par `workflow_dispatch` : le workflow manuel ne se trouve pas sur `main`.

## Ce que cette preuve n'établit pas

Elle démontre qu'un serveur GitHub Actions est parvenu à récupérer des historiques EUR 24 h **pour un panier cohérent de diagnostic comprenant RAIN**. Elle ne démontre **pas** que le panier utilisateur actuellement affiché dans Firefox a été acquis, ni que les graphiques sont désormais 5/5, ni que toutes les requêtes futures réussiront.

La PR #700 demeure en brouillon et **n'est pas fusionnée**. Les PR #695, #696, #699 restent séparées. Aucune modification des graphes, du Trader, du Market Core, du Bridge, des ordres ou du Coffre.

## Suite technique — une seule porte à franchir

Transmettre à un collecteur serveur les **cinq identifiants réellement figés par le propriétaire du Market Frame de l'Interface**, avec leur provenance, leur horodatage et la devise, puis faire accepter le JSON seulement si le frame et la période correspondent exactement. Implémenter ensuite le lecteur navigateur sous garde-fou dans une PR distincte, et mesurer en Firefox. Ne jamais substituer un autre actif ou construire une série artificielle.

Cette note reste disponible dans le dépôt partagé après l'expiration de l'artefact GitHub Actions.
