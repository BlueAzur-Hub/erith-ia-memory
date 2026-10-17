# ERITH.IA Trading Desk — 40.6.601

## INTERFACE RUNTIME MIRROR

40.6.600 est rejetée comme architecture finale.

Le diagnostic complet montre que le Graphique de l'Interface n'est pas un simple lecteur de cache exportable : il appartient au runtime vivant `administrator/app.js`, avec son état, ses périodes, sa validation, son rendu Chart.js, ses refreshs et ses propriétaires additionnels.

Depuis 40.6.589, le Trader reconstruisait progressivement ses propres propriétaires. Cette branche est arrêtée.

## Décision 40.6.601

Le Trader monte directement :

`../administrator/index.html`

dans une frame same-origin, puis `trader-runtime-mirror.js` applique uniquement un filtre de présentation.

Le Trader utilise donc réellement :

- le même `administrator/app.js` ;
- le même Graphique ;
- le même Market ;
- la même Lecture Technique ;
- le même Math Core ;
- les mêmes Bougies ;
- la même Profondeur ;
- la même architecture EUR/USD ;
- les mêmes caches localStorage / IndexedDB ;
- le même Bridge / transport OKX ;
- les mêmes règles réseau et Data Truth.

Aucune copie du moteur Graphique, Market, Math ou Detail n'est chargée par `trading-desk.html`.

## Présentation Trader

Le runtime reste Administrator, mais la page Trader masque seulement les grandes familles hors mission. Sont conservés :

- header de vérité ;
- Marché ;
- Graphique ;
- Lecture Technique ;
- Market ;
- Math Core ;
- Bougies ;
- Profondeur ;
- EUR/USD.

Le filtrage ne modifie aucun owner métier Administrator.

## Fichiers Trader historiques

Les anciens fichiers tels que `line-chart-native.js`, `market-transpose.js`, `math-core-transpose.js`, etc. restent dans le dépôt pour l'historique Git, mais **ne sont plus chargés par la page Trader**.

## Diagnostic futur

Si un défaut apparaît :

1. reproduire la même action dans Administrator ;
2. si Administrator et Trader échouent pareil : bug owner Administrator ;
3. si Administrator fonctionne et Trader échoue : bug du filtre `trader-runtime-mirror.js` ;
4. ne jamais recréer un owner Trader parallèle.

## Dossier DNA — lecture IA et humaine (Cas d'école natif)

Le Trader garde son unique runtime Administrator et son emplacement historique `#traderOkbCaseStudy` sous le graphique. **Aucun bouton flottant, aucune fenêtre doublon et aucune nouvelle section**. Le script Trader `trader-runtime-mirror.js` utilise le Cas d'école natif : il affiche DNA uniquement lorsque le propriétaire « Nouveaux listings » et la courbe publiée identifient ensemble `neosoul` / `DNA`. BTC et CT conservent leur Cas d'école antérieur. La section reste repliable par défaut et se charge uniquement à l'ouverture.

`trader/dna-case-study.html` fournit la lecture humaine (données, provenance, résultats PAPER 10/25/100 USDC, alertes rétrospectives et limites) et la synthèse JSON lisible par IA. Il ne produit pas de second graphe ni de source dupliquée et interroge uniquement `data/trader_flux/dna_paper/state.json` avec le routeur public du Coffre. Son lien Raw GitHub donne accès au fichier canonique. Le bug de formatage numérique `minimumFractionDigits:2 > maximumFractionDigits:1` est corrigé. Si le journal n'est pas accessible, aucune donnée n'est inventée.

Les données sont Bitget `DNAUSDT` **Spot**, pas OKX `DNAUSD UM X-Perp`. Aucun ordre, aucune clé, aucun Bridge modifié. `trader/test-dna-case-study.cjs` vérifie l'unicité de la section, son ancrage, l'intégrité de la source, le rendu numérique et la lecture seule.

## Sécurité

READ ONLY. Aucun ordre réel. Aucune clé privée. Aucun nouveau transport.
