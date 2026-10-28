# Seven Heaven — Audit causal des 4/5 historiques EUR, 28 octobre 2026

## Constat Firefox réel

Dans la prévisualisation `0b24db64be7bdc0a27d7b1d743571c3ffc84e825` (PR [#702](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/702)), « Baisses 5 · 24 h · Base 100 · EUR » montre **4/5**. La sélection du Market est : **QNT, RAIN, ENA, FIGR_HELOC, HBAR**. QNT/RAIN/ENA/HBAR ont des courbes ; **FIGR_HELOC** est absent. Capture Firefox de l'utilisateur datée 28/10/2026 vers 08 h 54 (Paris).

PR #702 valide la logique par 39 tests automatisés, mais **elle ne relie pas le collecteur serveur #700 à l'Interface**. Les modifications de #695/#696/#699 garantissent surtout la cohérence Market Frame / devises / bandeau technique / diagnostic 4/5. Elles ne réparent pas les données historiques indisponibles.

## Propriétaires relus dans administrator/app.js

- `atlasScannerMarketBasis`, `atlasScannerPool`, `atlasScannerStart` : classement du Market et cinq identifiants figés.
- `atlasScannerStoredHistory` et `atlasScannerRun` : caches, acquisition individuelle, alignement et transaction finale.
- `atlasScannerFetchDirect` : CoinGecko `market_chart?vs_currency=eur&days=1&precision=full` directement dans Firefox ; en cas d'échec, Bridge local puis Binance **uniquement si l'actif a une paire réellement vérifiée**.
- `atlasScannerSeriesCoversWindow`, `atlasScannerAligned` et `atlasValidateChartSeries` : couverture 24 h et compatibilité des vrais points. Refus si moins de 23,5 h de couverture comparable.

Le classement n'ajoute pas de sixième actif et le rendu 4/5 ne doit pas être déclaré 5/5.

## Preuve réseau serveur reproductible pour les CINQ identités exactes de la capture

[PR #703 — diagnostic isolé](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/703).
[GitHub Actions #40653563384](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/40653563384).
[Artefact brut exact-five](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/40653563384/artifacts/12799764044), rétention prévue jusqu'au 4 novembre 2026.

Collecte serveur le 28/10/2026 entre 07:59:25 et 08:00:39 UTC. Résultat du collecteur : `partial`, `readyCount=4`. JSON et empreinte interne `sha256` revérifiés depuis l'archive :

| Identité CoinGecko | État | HTTP | Points |
|---|---|---|---|
| `quant-network` | ready | 200 | 289 |
| `rain` | ready | 200 | 289 |
| `ethena` | ready | 200 | 289 |
| `figure-heloc` | unavailable | **pas de statut HTTP** | 0 ; `Upstream timeout` après 25 s |
| `hedera-hashgraph` | ready | 200 | 288 |

Aucune preuve d'un HTTP 429 ou 404 pour FIGR_HELOC. Pas de conversion USD→EUR.

## Variations officielles de la requête CoinGecko : source EUR, sans fabrication

1. [GitHub Actions #40654089787](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/40654089787), requête `/coins/figure-heloc/market_chart?vs_currency=eur&days=1` (sans `precision=full`) : **HTTP 200 en environ 1 seconde**, **243 points sur seulement 20,125 h**, couverture insuffisante pour une série annoncée 24 h.
2. [GitHub Actions #40654287784](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/40654287784), requête `/coins/figure-heloc/market_chart?vs_currency=eur&days=2` : **HTTP 200**, 43 points en tout ; seulement **23 points couvrant 21,072 h** dans la fenêtre des dernières 24 h. La granularité est plus grossière ; la fenêtre 24 h n'est pas reconstruite.

La requête sans précision peut rendre le réseau plus exploitable, mais **ne remplit pas la couverture manquante** : ne pas l'afficher comme un historique 24 h complet. Une réponse HTTP 200 ne constitue pas une certification d'historique utilisable.

Sources externes : [identité CoinGecko Figure Heloc](https://www.coingecko.com/en/coins/figure-heloc), [doc CoinGecko erreurs et timeout](https://support.coingecko.com/articles/5483692520-why-am-i-getting-an-error-or-timeout-when-calling-the-coingecko-api-endpoint), [API publique Figure Markets](https://figuremarkets.dev/api-docs/public-api/markets/).

Figure Markets propose des chandelles en USD sur son marché FIGR_HELOC/USD, **pas une source native EUR connue et validée** dans cet audit. Les présenter comme une série EUR native serait interdit ; une conversion USD→EUR exigerait un mode distinct et une étiquette de conversion explicite, et ne serait pas équivalente à la demande utilisateur.

## Verdict / suite architecturale

**Vérifié :** l'échec 4/5 du navigateur se reproduit dans le serveur exact-five sur FIGR_HELOC ; un simple hébergement serveur ne garantit donc pas 5/5. Le défaut est dépendant de la **couverture historique effectivement retournée pour chaque actif** et de la fiabilité des transports. L'hypothèse « c'est seulement Firefox/CORS » est invalidée.

**Non prouvé :** panne permanente de CoinGecko, indisponibilité à toute heure, HTTP 429, nécessité de refondre Market Core, possibilité de 5/5 EUR natif pour chaque panier à n'importe quel moment.

**Action à retenir :** séparer le classement (cinq vrais actifs) de la couverture historique (0–5 séries certifiées), publier des preuves serveur réutilisables et fraîches pour les actifs de chaque cohorte, vérifier les identités, la devise, les bornes et les prix natifs, et afficher honnêtement les états incomplets sans substitution. Étudier d'autres sources EUR natives seulement si leur identité et disponibilité sont vérifiées. Ne pas augmenter aveuglément les retries ni insérer un cours FX sous une étiquette EUR native.

**État GitHub :** #703 et #702 en brouillon non fusionnées ; aucune modification de l'app de production, du Market Core, du Trader, de l'Operator, du Bridge privé ou du Coffre. Éviter de redemander F12 et Ctrl+F5 pour cette même preuve.

En bref : tests réussis ne signifient pas historique disponible ; **5/5 honnête doit être mesuré, jamais forcé**.

## 28 octobre 2026 — suite structurelle, sans traitement par actif (CI 08:14 UTC)

- La [PR #703](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/703) porte désormais un **correctif du collecteur générique** : quand une réponse CoinGecko EUR native est HTTP 200 mais ne couvre pas 24 h, ses vrais points peuvent être conservés sous `observedSeries`. Seul un historique ayant réussi `validatePoints` reçoit la propriété `series` et le statut `ready`. Deux variantes de requête documentées (`precision=full`, puis précision par défaut en cas de défaut de couverture ou erreur réseau) sont essayées par le même code **pour n'importe quel ID**, sans règle de symbole ; refus explicite des HTTP 4xx/5xx, pas de requalification USD.
- Nouveau module `scanner_rolling_eur_history.cjs` : rapproche plusieurs preuves serveur d'un même identifiant CoinGecko et d'une même devise native EUR, refuse les divergences de prix, les gros trous, les anciennes preuves, les identités trompeuses et les devises incompatibles ; ne publie `series` que si la fenêtre commune couvre vraiment 24 h. Aucune interpolation, aucune conversion de devises. C'est **une bibliothèque testée, pas encore un collecteur récurrent déployé**, et aucun graphique n'y est raccordé.
- [GitHub Actions #40655343016](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/40655343016) : **26/26 tests réussis, 0 échec** (collecteur et réunion cumulative, dont actifs arbitraires).
- [GitHub Actions réel #40655342900](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/40655342900), [preuve ZIP 12801431448](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/40655342900/artifacts/12801431448) : QNT, RAIN, ENA, HBAR historiques EUR 24 h `ready` ; **FIGR_HELOC HTTP 200 et 245 points EUR authentiques couvrant 20,306 h**, statut `unavailable` / `Frozen 24 h window not covered`. Ces 245 points sont maintenant gardés en `observedSeries` dans le JSON : une première pierre d'archive, **pas un 5/5**. ZIP à durée de conservation limitée.
- Les deux workflows de sondage réseau ponctuels ont été retirés de la branche après production des artefacts, pour éviter d'émettre des requêtes répétées à chaque commit. La PR #703 reste **DRAFT, NON FUSIONNÉE**. Aucun changement du graphique public, Trader, Bridge, Coffre ou Market Core.
- **Prochaine porte réelle et unique :** stockage automatique et cumulatif des `observedSeries` authentifiées côté serveur (enveloppes horodatées, partition par ID/devise, rétention bornée), qualification d'une fenêtre 24 h depuis plusieurs collectes, puis lecture graphique sur preuve fraîche du Market Frame, sans liste figée de tokens. La qualité des données sources et les limites d'API rendent impossible de garantir 5/5 sur tous les actifs en toute circonstance.

## 28 octobre 2026 — Relais autonome après demande de pause (PR #703, CI validée)

**Contexte :** après environ 21 heures consacrées au projet, le créateur a demandé que Seven reprenne seule la recherche et l'architecture commune, sans nouveau test Firefox ni corrections par crypto. La dernière capture publique « Hausses 5 » affichait 5/5 historiques mais seulement **1 direct + 4 caches récents** ; ce n'est pas un contrat de collecte pour le prochain panier.

### Sources recoupées

- Relu le grand fil `Fil.Inteface.Crypto.GPT(20261028-064512).md`, notamment les règles de continuité et de correction à la racine (CM-REL-0078/0079), plus les échanges récents du présent fil.
- Bureau Notion canonique : [AETHER · AGENT-CRYPTO INTERFACE](https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099).
- Dépôt : [PR #703](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/703) et les scripts serveur déjà présents, avec validation contre le vrai [snapshot Market](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/latest.json).
- CoinGecko confirme [la granularité automatiquement variable du plan public](https://support.coingecko.com/articles/5723073761-what-granularity-do-you-support-for-historical-data) : une demande historique 24 h et une demande 48 h ne fournissent pas les mêmes pas temporels. Il est interdit de présenter l'échantillonnage plus grossier comme un historique haute résolution complet.
- GitHub confirme que les [workflows programmés ne s'exécutent que sur la branche par défaut](https://github.com/github/docs/blob/main/content/actions/how-tos/troubleshoot-workflows.md) : une PR test ne vaut pas mise en service d'un collecteur périodique.

### Production réelle sur la branche d'essai

La PR #703 contient désormais :

1. `tools/scanner_verified_history.cjs` : conserve les observations partielles EUR natives en `observedSeries`, sans valider artificiellement une couverture de 24 h.
2. `tools/scanner_rolling_eur_history.cjs` : union temporelle par ID exact, sans interpolation ni conversion de devise, avec refus des trous et des contradictions.
3. `tools/scanner_market_eur_archive.cjs` : planifie depuis le vrai snapshot du Market les paniers dynamiques Hausses 5 / Baisses 5 / Volumes 5, puis des actifs supplémentaires par rotation ; lots de cinq, quota 5–25, intégrité SHA-256 de chaque enveloppe, archivage strictement natif EUR par identifiant, conservation maximale de 24 captures sur 48 h. **Aucun identifiant de crypto n'est codé en dur.**
4. `tools/run_scanner_market_eur_archive.cjs` : point d'entrée **plan seul par défaut, zéro réseau**. Une acquisition impose simultanément `--mode=collect`, `--network=yes` et `ERITH_EUR_ARCHIVE_NETWORK=1`. Écriture limitée au dossier dédié `data/crypto/scanner_eur_archives`. Pas de commit automatique, pas d'ordre, pas de modification navigateur.
5. Tests unitaires et workflow CI isolé `.github/workflows/seven-scanner-rolling-eur-contract.yml`.

**Validation vérifiée :** [run GitHub Actions #40661110044](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/40661110044) : **40 tests PASS / 0 FAIL** et vérification du planificateur sur le snapshot réel. Ce snapshot est daté du **28/10/2026 07:25:28 UTC**, et le plan de 20 ID se décompose en quatre groupes de cinq. Premier groupe de ce snapshot : `bitway`, `memecore`, `pepe`, `zcash`, `layerzero`. Ce résultat **ne garantit pas** une correspondance avec la sélection live Firefox une heure plus tard.

### Interdits et prochaine porte

- **Non déployé :** le producteur n'est ni programmé ni raccordé au navigateur. Pas de série 5/5 réelle nouvelle démontrée aujourd'hui ; pas de modifications `main` dans les fichiers d'Administrator/Trader/Bridge/Coffre.
- **Non garanti :** 1000 actifs ne sont pas acquis en un seul cycle ; le Market public inspecté contient 250 actifs. Le planificateur refuse un univers de rangs plus large que la source réellement disponible.
- **À faire lors de la prochaine session :** valider avec supervision la première exécution réseau bornée, enregistrer durablement les vrais fichiers d'archives en respectant le budget de requêtes, puis définir un lecteur qui vérifie l'ID, le Market Frame et les timestamps avant affichage. La mise en place d'une programmation GitHub Actions et l'intégration navigateur restent des étapes distinctes, exigeant validation.

**Passation :** PR #703 conservée **OPEN / DRAFT / UNMERGED**, tête `4dd730970079e8ef6ef47daf77d9bb5174bfaad7` ; documentation publique mise à jour sans modifier les circuits financiers.
