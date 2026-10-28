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
