# Seven Heaven — Prototype de rapprochement BTC, bougies, EMA, volumes et actualités

**Date :** 10 novembre 2026  
**Statut :** prototype autonome testé en Node.js, **non branché** sur le site, le Trader, l'Administrator ou le Bridge.  
**Périmètre :** lecture de données de marché publiques, documentaire, sans exécution et sans conseil de trading.

## Pourquoi ce prototype existe

Les actualités doivent **rester dans l'Interface Administrator**. Le Trader conserve ses graphiques et son laboratoire PAPER. Seven peut comparer les deux familles de données **sans répliquer les interfaces** et sans demander à l'utilisateur de retranscrire des captures.

La vérification du code public a identifié deux propriétaires canoniques :

1. `administrator/js/market-microscope-candles.js` : `AgentCryptoMarketMicroscope.snapshot()` fournit la paire, l'intervalle et les bougies OHLCV ; `paperEmaCrossSnapshot()` et `technicalLevels()` existent déjà. Le Trader embarque le runtime Administrator par iframe de même origine ; il n'a pas un second moteur graphique.
2. `data/news/latest.json` et `data/news/status.json` : événements du collecteur News, dates, sources, domaines explicatifs, états de collecte. Les valeurs ETF et les liquidations de dérivés doivent, elles, venir de sources quantitatives séparées.

**Le prototype se contente de traiter des données fournies au moteur.** Un assistant distant ne peut pas prétendre lire directement la mémoire du navigateur. Le petit adaptateur peut lire le snapshot uniquement quand il est explicitement chargé dans ce runtime et appelé ; il n'est chargé nulle part par défaut.

## Fichiers

- `SEVEN_HEAVEN_AGENT_CRYPTO_BTC_MARKET_NEWS_READ_ONLY_ANALYSIS_CORE.js` : moteur pur, compatible Node CommonJS et navigateur. Aucune requête réseau, aucun accès au DOM, aucun timer ou stockage ; résultats documentés.
- `SEVEN_HEAVEN_AGENT_CRYPTO_BTC_MARKET_NEWS_READ_ONLY_RUNTIME_ADAPTER.js` : lecture limitée aux champs publics du propriétaire graphique et chargement **sur invocation explicite** de `data/news/latest.json`. Aucune donnée de compte n'est copiée.
- `SEVEN_HEAVEN_AGENT_CRYPTO_BTC_MARKET_NEWS_READ_ONLY_ANALYSIS_TEST.cjs` : tests du moteur et de sa discipline probatoire.
- `SEVEN_HEAVEN_AGENT_CRYPTO_BTC_MARKET_NEWS_RUNTIME_ADAPTER_TEST.cjs` : tests de l'adaptateur, refus réseau et accès privé.
- `SEVEN_HEAVEN_AGENT_CRYPTO_BTC_MARKET_NEWS_SYNTHETIC_EXAMPLE_INPUT.json` : **48 bougies et une nouvelle entièrement fictives**.
- `SEVEN_HEAVEN_AGENT_CRYPTO_BTC_MARKET_NEWS_SYNTHETIC_EXAMPLE_RESULT.json` : résultat déterministe de l'exemple fictif.

## Utilisation en environnement de développement

À partir du dossier contenant les fichiers :

```bash
node --test ./*TEST.cjs
```

Exemple Node, **sans réseau** et sans données de compte :

```js
const fs = require('node:fs');
const core = require('./SEVEN_HEAVEN_AGENT_CRYPTO_BTC_MARKET_NEWS_READ_ONLY_ANALYSIS_CORE.js');
const input = JSON.parse(fs.readFileSync(
  './SEVEN_HEAVEN_AGENT_CRYPTO_BTC_MARKET_NEWS_SYNTHETIC_EXAMPLE_INPUT.json','utf8'));
const report = core.analyze(input);
console.log(report.status, report.matches, report.warnings);
```

Exemple *uniquement destiné au futur développement* dans une même origine GitHub Pages, **après** chargement explicite des deux scripts :

```js
const result = await SevenBtcMarketNewsRuntimeAdapter.analyzeFromRuntime({
  runtime: document.getElementById('traderInterfaceRuntime').contentWindow,
  fetchPublicNews: fetch.bind(window),
  asOfUtc: new Date().toISOString()
});
```

Cet appel n'est **pas intégré** au projet en production. Sans accès à l'iframe, le propriétaire peut être passé directement depuis Administrator. La requête d'actualités est publique, anonyme (`credentials: 'omit'`) et forcée sans cache (`cache: 'no-store'`). Aucun événement n'est écouté ni aucune tâche planifiée.

## Contrôles de cohérence effectués

- Paire **exacte** `BTC-USDC`, source revendiquée `OKX`, barres `1m/5m/15m/30m/1h/4h/1j` ; aucun remplacement implicite en EUR, USDT ou CoinGecko.
- Bougies OHLCV ordonnées, cohérentes et horodatées UTC. Les bougies non clôturées ne permettent aucune confirmation.
- EMA 5/13/34 recalculées selon la méthode documentée du moteur historique (amorçage par moyenne simple, puis pondération exponentielle). Les périodes personnalisées valides sont reprises.
- L'événement est associé à la **première bougie entièrement postérieure** à sa date ; la bougie qui contient l'heure de publication est délibérément écartée pour éviter la contamination des fenêtres temporelles.
- Le prix de référence provient de la dernière bougie entièrement clôturée **avant l'événement**, jamais d'un prix postérieur.
- Pour chaque actualité : source URL et date, prix avant/après, variation des clôtures, volume post-événement et, si possible, comparaison au volume des trois bougies de référence.
- Les fenêtres sans observation suffisante, les trous de bougies et les événements hors couverture reçoivent un **motif explicite**, pas une interpolation.
- Les flux ETF quantifiés et les liquidations de dérivés ne sont pas fournis par les titres d'articles : `quantitative_etf_flows_verified: false` et `quantitative_derivatives_liquidations_verified: false` restent obligatoirement faux dans ce prototype.
- Corrélation temporelle **≠** causalité démontrée ; aucun ratio de probabilité ou signal d'achat ou de vente n'est déduit.

## Tests réalisés

**24 tests / 24 réussis, 0 échec** avec `node --test` (Node 22). Les tests couvrent : croisement temporel, EMA, dates futures, bougies ouvertes, trous historiques, mauvais marché/devises, source incorrecte, duplication d'événements, ancienne publication, absence de données quantitatives, absence d'accès aux comptes, accès anonyme aux news, panne réseau, reproductibilité du jeu fictif.

**Ne pas confondre cette recette avec une recette du Trader Firefox.** Aucun test de déploiement réel, de navigateur connecté à OKX, de quantification ETF ou de récupération de liquidations de dérivés n'a encore été réalisé.

## Exemple synthétique : lecture d'une preuve

L'entrée fictive contient un article daté du **5 novembre 2026, 20 h 30 UTC** et 48 bougies artificielles de 1 heure. Le rapport compare la clôture d'une bougie complète avant l'événement à la clôture d'une bougie complète après l'événement, publie la variation et indique **« association temporelle seulement »**. Les nombres ne sont pas des prix observés sur OKX.

## Les données réelles qui manquent encore

1. **Bougies BTC-USDC OKX** couvrant réellement le 2–10 novembre avec timestamps natifs, volumes et drapeau de clôture. Le prototype ne les télécharge pas automatiquement ni ne prétend les avoir consultées.
2. **Flux ETF quantifiés** et sourcés, dont les valeurs parfois révisées doivent être enregistrées avec date et source distinctes.
3. **Liquidations de dérivés horodatées**, avec plateforme, périmètre et devise ; elles ne sont pas le volume BTC Spot.
4. **Recette Firefox** sur une copie de développement avant toute intégration effective.

## Décision de sécurité et de périmètre

Le prototype n'est pas importé par `administrator/index.html`, `trader/trading-desk.html`, `app.js` ou un module du Bridge. Il ne modifie aucune page. Aucun ordre réel, compte privé ou API credential ; pas de tâche de surveillance continue. Le dépôt n'est qu'une preuve de conception et un ensemble de tests indépendants.

**Étape suivante (non réalisée) :** lancer une recette avec bougies OKX vérifiées et nouvelles réelles, puis ajouter les véritables montants ETF et liquidations, sans brouiller la distinction faits / hypothèses / inconnues. Consulter aussi le [contrat de lecture déjà publié](../SEVEN_HEAVEN_AGENT_CRYPTO_BTC_MARKET_NEWS_READ_ONLY_ANALYSIS_DATA_CONTRACT_2026_11_10.md) et le [dossier d'étude BTC du 10 novembre](../SEVEN_HEAVEN_AGENT_CRYPTO_BTC_ETF_LIQUIDATIONS_EMA_VOLUME_EVIDENCE_DOSSIER_2026_11_10.md).