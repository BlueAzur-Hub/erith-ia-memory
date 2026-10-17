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

## Dossier DNA — lecture IA et humaine

Le Trader réutilise toujours exactement le runtime `administrator/index.html?surface=trader`, sans nouveau propriétaire du Market, des bougies, du graphique ni du carnet. Le script déjà chargé `trader-runtime-mirror.js` installe uniquement le déclencheur de présentation **« DNA · Cas d'école »**, replié par défaut, accessible au clavier et refermable avec `Échap`.

La page autonome `trader/dna-case-study.html` affiche une étude de cas sur NeoSoul / DNA, sans images et sans ordres. Elle réutilise exclusivement les sources canoniques :

- `../data/trader_flux/dna_paper/state.json` via le routeur du Coffre Pages (lien direct Raw GitHub pour IA et consultation hors Pages) ;
- `../laboratoire/dna-decision-review.js` pour les seuils rétrospectifs PAPER et le contrôle d'identité ;
- `../laboratoire/dna-paper.html` et `cas-ecole-neosoul-dna.md` pour le protocole scientifique.

La page présente séparément **faits, dates, dernier carnet, résultats fictifs, observations, interprétations, limites et résumé JSON de lecture IA**. Les relevés sont Spot **Bitget DNAUSDT**, pas des exécutions ; le Futures **OKX DNAUSD UM X-Perp** n'est pas substitué à ces données. Aucun nouvel accès Bridge, aucun suivi de compte privé, aucune simulation de liquidation Futures.

Les tests du contrat documentaire sont dans `trader/test-dna-case-study.cjs`, invoqués par `Agent-Crypto Trader Current`. Ils vérifient la conservation de l'unique script d'entrée, l'accessibilité et la mise en échec en cas de source invalide.

## Sécurité

READ ONLY. Aucun ordre réel. Aucune clé privée. Aucun nouveau transport.
