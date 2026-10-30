# Seven Heaven — Audit de cohérence BTC / CT / Market / Graphique / Math / News

**Date de référence :** 24 octobre 2026, Europe/Paris. **Capture utilisateur :** environ 01 h 10 Paris. **Contrôle des deux archives :** relevés CoinGecko de 01 h 13 Paris (23 octobre 23:13 UTC). **Nature :** audit technique et documentaire, **lecture seule**, aucune opération financière et aucun changement de code ou de mémoire locale.

**Périmètre préservé :** Interface Administrator et Trader MASTER, Market Core `38.15.11`, historiques V7/IndexedDB, Oracle, Graphique, Bridge, séparation Operator Yoann.

## Verdict exécutif

- **PASSÉ / visible Firefox :** univers `rang ≤ 1000`, pagination `1–100 / 1000`, Core 250 + Extended 750. Les critères `Avec prix / À qualifier / Actions / ETF` reflètent l'audit précédent : TEST002, XWDC, spreads élevés.
- **PASSÉ / archive GitHub :** `latest.json` contient 250 IDs/rangs distincts (1–250) ; `extended.json` contient 750 IDs/rangs distincts (251–1000). **1 000 IDs distincts, 1 000 rangs distincts, zéro doublon entre archives et zéro rang manquant** dans la paire de snapshots inspectée. Horodatages générés : Core `2026-10-23T23:13:12.791Z` ; Extended `2026-10-23T23:13:10.903Z`.
- **Non homogène par conception :** cours Binance Top 5, cours CoinGecko du Market, historique graphique et meilleures offres OKX sont quatre canaux avec fournisseurs, calculs et dates potentiellement distincts. Aucun signal financier ne doit être assemblé en « live global » sans synchronisation explicite.
- **Défauts CONFIRMÉS dans le code :** (1) Market Flow appelle « données historiques anciennes » la source `public-current` ; (2) News Sentinel privilégie l'étiquette de fraîcheur conservée dans le JSON plutôt que recalculée au rendu ; (3) Math Core convertit `null` en `0` lors de la cohérence des horizons et lors de l'étiquette d'amplitude.
- **Aucun bug d'identité graphique BTC/CT prouvé** par les éléments disponibles ; pas de correction d'exécution sans reproduction synchronisée Firefox.

## Vérification détaillée

| Sous-système | Observation / preuve | État | Limite |
|---|---|---|---|
| Market / 1000 rangs | Vue Firefox 1–100/1000 ; deux archives public GitHub 250+750 IDs et rangs sans conflit | Vérifié | Le classement est une photo publique, non le marché négociable à l'instant |
| Qualité des champs Core | 250 prix USD + 250 variations 24 h + 250 variations 7 j ; **1 variation 30 j absente : `OUSD` rang 83** | Vérifié | Absence ≠ 0 |
| Qualité des champs Extended | 750 prix USD ; **12 variations 24 h absentes, 4 variations 7 j absentes, 16 variations 30 j absentes** | Vérifié | Ex. `AXIS` rang 480, `DNA` rang 759, `XDP` rang 905 : 30 j absents |
| Binance | Bandeau utilisateur « Prix live Binance · 5/5 » | Visible, non contre-vérifié | La lecture directe du runtime du Firefox, des cinq timestamps et des paires n'est pas disponible ici |
| CoinGecko | Snapshot public `github_actions_public_archive`, `changeQuoteCurrency: USD`; BTC dans relevé 01:13 à `80 506,22 USD`, variation 24 h `−0,92665 %` | Vérifié dans archive datée | À 01:10, la capture reflétait un **autre** instant ; ne pas le comparer comme une cotation simultanée |
| Graphique BTC | 24 h, 289 points, cache CoinGecko, série 00:45:30, information différée de ~24 min ; légende −0,25 % | Visible + méthode code vérifiée | Mesure du rendement de la **série affichée**, pas le `change24h` du flux de marché |
| Fiche / Marché BTC | −0,78 % dans capture antérieure ; 24 h issu de `atlasMarketSnapshotSurface` (priorité quote directe utilisable, sinon market) | Propriétaires de données vérifiés | Il faut capturer source exacte, paire et timestamps à la même seconde pour conclure à un bug d'écart |
| CT | Dans capture : `CT/USDC` OKX, variation native convertie en USD ; aussi `CT/USDT` OKX et `CT/USDT` Bitget dans le regroupement | Visible + archive réelle | Un identifiant d'actif peut porter trois marchés : ne pas mélanger prix, carnet, quote et dates |
| CT fraîcheur | Archive `captured_at_utc=2026-10-23T22:01:33.647Z` (00:01 Paris), `CT-USDC` dernier natif `0.2012` USDC ; `CT-USDT` dernier `0.20221` USDT | Vérifié | Validité UI maximale 90 min pour un `quote_snapshot` exact. À 01:10 Paris : environ 69 minutes, pas une cotation live |
| Math Core | Calculs de qualité, historique et heuristiques présents dans app.js ; score math réel indisponible dans les captures | Code examiné / capture insuffisante | Le `49/100` de REDIVIDER n'est pas automatiquement le score Math Core |
| News Sentinel | Événement CryptoTicker IBIT 665 M, `event_time=2026-10-23T09:17:57Z`, `impact.score=87`, `market_reaction.status=not_measured`, `causal_claim=false` | Archive vérifiée | Score **d'impact heuristique**, pas preuve de flux, impact mesuré ou variation BTC |
| Watchlist | Le code distingue suivi/alertes de détention ; aucune exportation du stockage local utilisateur jointe | Périmètre vérifié / état inconnu | N'inférer aucun actif détenu, ni aucun solde ni transaction |
| Bridges / Yoann | Contexte séparé documenté ; aucun accès ni test machine de Yoann dans cette revue | Non modifié | Ne pas conclure à une vérification en conditions réelles |

### Contradiction apparente BTC : graphique vs Market

Dans `administrator/app.js`, `atlasValidateChartSeries` calcule :

`changePct = (lastPrice - firstPrice) / firstPrice * 100`.

`atlasChartV2RenderLegend` affiche `result.integrity.metrics.changePct`. En revanche, `atlasMarketSnapshotSurface` calcule `observedChange24h` à partir de `quote.change24h` si usable, sinon `coin.marketChange24h` ou `coin.change24h`.

**Le `−0,25 %` graphique vs `−0,78 %` fiche représente 0,53 point d'écart mais des définitions/horizons/sources non forcément identiques.** Il faut améliorer les libellés ou afficher la source et le début/fin de période ; aucune suppression de série ni correction de prix sans preuve supplémentaire.

### Défaut confirmé A — Market Flow

`atlasMarketTruth()` retourne `level = public-current` si un snapshot `github-public` est dans son seuil de fraîcheur. Mais `atlasRenderMarketFlowRibbon()` reconnaît seulement `direct` et `direct-conserved` comme labels non « historiques anciens » ; **tous les autres** deviennent `CoinGecko · données historiques anciennes`, même `public-current`. Cela explique l'incohérence visible entre l'heure récente « 01:08:44 » et le mot « anciennes ». **Correction recommandée :** map explicite `public-current` → « snapshot public récent », `public-delayed` → « snapshot public retardé », distinct de `stale-cache` et `blocked`. Ne pas modifier la donnée ni le Core.

### Défaut confirmé B — News Sentinel

L'événement `feed_12059c6cfba5fb4d` a été enregistré `2026-10-23T09:17:57Z`. Son champ JSON `freshness.label = Fraîche · moins de 12 h` reflète une évaluation antérieure : `freshness.hours=11.38`. À 01:10 Paris le 24 octobre, l'âge est environ **13 h 52 min**. Les routines `renderNewsSentinel` et `renderNewsFeedOverview` préfèrent `current?.freshness?.label || newsFeedAgeLabel(...)` ; une étiquette préexistante bloque le recalcul. **Correction recommandée :** calculer l'ancienneté de l'article au rendu à partir de `event_time` (ou `published_at` si justifié), garder la date d'archive séparée. L'impact `87/100` est `impact.score`, `market_reaction.status = not_measured` ; aucune causalité prouvée. Préserver la source et l'article original.

### Défaut confirmé C — Math Core / null vs 0

`atlasMathHorizonCoherence(coin)` utilise :

`[coin?.change24h, coin?.change7d, coin?.change30d].map(Number).filter(Number.isFinite)`

Or `Number(null)===0`. Exemple `{change24h:-1,change7d:null,change30d:null}` devient `[-1,0,0]` et la routine retourne **« Mixte »** au lieu de **« Données insuffisantes »**. `atlasMathAmplitudeLabel(null)` utilise également `Number(null)`, et peut afficher **« Faible »** à la place de **« Non mesurée »**. C'est un défaut de sémantique confirmé dans le code, **pas une preuve d'erreur du score BTC actuellement affiché**. Correction chirurgicale avec tests de non-régression seulement après validation de portée et conservation de la version Market Core protégée.

### Notes sur l'identité CT

- Le regroupement `CT` est multi-place : ne pas réduire `CT/USDC` et `CT/USDT` à une seule paire. Le fichier public `new-listings-public-feed.json` contient les relevés OKX natifs ; Bitget relève de son autre transport.
- `observedOKXTicker` exige Spot exact, quote exacte, `last/open24h` positifs, volume connu, âge max 90 min et permissions personnelles marquées **false**. Ce garde-fou est cohérent avec le statut « cours public » de l'interface.
- Un clic Solo doit être contrôlé séparément de la fiche au survol ; la vue Fiche d'un autre actif peut être affichée sans que le graphe principal ait changé. Pas de confusion d'identité démontrée.

## Ordre de traitement recommandé, sans chantier parallèle

1. **P1 :** corrigendum des libellés `Market Flow` et `News Sentinel` (deux défauts démontrés), avec tests déterministes `public-current` et horodatage d'article vieilli. Aucun changement de flux réseau, données ou métriques.
2. **P1 :** corriger la prise en compte des `null` pour la cohérence et l'amplitude Math ; tests `null`, `undefined`, `0` vrai, valeurs mesurées et isolations BTC/CT. **Aucun recalibrage du Market Core**.
3. **P2 :** ajouter à la présentation du graphique un libellé « variation de la série » et ses bornes temporelles, distinct du « 24 h marché ». Prioriser preuve d'affichage avant d'éditer.
4. **P2 :** recette Firefox synchronisée avec horodatages, source/quote et identité : BTC graphique + Market + fiche + Math ; puis CT/USDC vs CT/USDT ; retour BTC. Sans reset, écriture, purge ni ordre.
5. **P2 :** contrôle des prochaines archives horaires OKX et de leur expiration, distinct de la qualité du rendu ; aucune requalification « live » à partir d'une archive ancienne.

## SOURCES et preuves

- [Code MASTER `administrator/app.js`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/administrator/app.js) : fonctions `atlasValidateChartSeries`, `atlasChartV2RenderLegend`, `atlasMarketSnapshotSurface`, `atlasMarketTruth`, `atlasRenderMarketFlowRibbon`, `atlasMathHorizonCoherence`, `atlasMathAmplitudeLabel`, `renderNewsSentinel`.
- [Core 250 public](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/latest.json) · [Extended 750 public](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/extended.json).
- [Relevés publics OKX](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/administrator/data/new-listings-public-feed.json) · [présentation nouveaux listings](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/administrator/js/new-listings-native-category.js).
- [Archive News Sentinel](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/news/latest.json) · [statut collecte News](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/news/status.json).
- Capture Firefox de l'opérateur le **24 octobre 2026 vers 01:10 Paris** et texte exporté de l'Administrator. Pas de test interactif direct dans son Firefox ni accès à son IndexedDB, à la Watchlist ou au compte OKX dans cet audit.

**STOP POINT :** inventaire et diagnostic terminés ; trois défauts de lecture prouvés, aucun bogue de donnée ou d'identité CT/BTC prouvé ; aucun correctif d'exécution ni ordre réel pendant cet audit. Les corrections devront avoir leurs propres branches et tests.
