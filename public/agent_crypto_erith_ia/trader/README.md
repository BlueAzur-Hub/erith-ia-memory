# ERITH.IA Trading Desk — 40.6.575

Version suivante de la fondation Trader, destinée à vérifier visuellement que l'agencement canonique a été compris.

## Intention unique

**Retrouver l'interface Agent-Crypto connue, mais allégée pour le trading. Ne pas refaire la roue.**

### En haut

- menu minimal ;
- aucun fil Aether ;
- aucune section Atlas ;
- aucun Oracle ;
- aucune Veille / Sources / Decision Board / autre section Administrator ;
- Graphique / Bougies = surface principale ;
- Profondeur à droite, repliable ;
- Lecture Technique à droite, repliable ;
- boutons Trader ronds, dans le langage visuel des boutons Math Core / Redivider actuels ;
- REDIVIDER reste le Kill Switch.

### En dessous

- Market large ;
- Math Core à droite du Market.

## Sécurité et réutilisation

Cette version reste une **coquille de disposition** :
- aucun moteur métier n'est recopié ;
- aucun ordre réel ;
- aucune clé OKX ;
- BUY / SELL / STOP désactivés ;
- Administrator 40.6.571 intact ;
- Market Core 38.15.11 intact.

Les blocs métier seront remontés depuis leurs propriétaires existants uniquement après validation opérateur de cette géométrie.


## Intégration 40.6.575 — première vraie brique

Une seule responsabilité : **monter le propriétaire Bougies déjà existant dans la surface Trader**.

Chargés directement depuis Administrator :
- `js/quote-currency-architecture-406497.js`
- `js/okx-local-backend-transport.js`
- `js/market-microscope-candles.js`

Le Trader fournit uniquement les points DOM attendus par le propriétaire existant :
- `#analyste .chart-v2-control-deck`
- `#analyste .chart-shell`

Le module Administrator reste propriétaire du rendu, des indicateurs, des intervalles, du zoom/pan, des requêtes OKX publiques via Backend local et de la persistance de ses préférences.

Market, Profondeur, Lecture Technique et Math Core restent des emplacements non montés dans cette version.


## Intégration 40.6.575 — Profondeur réelle

Une seule responsabilité supplémentaire : **monter le propriétaire Profondeur / Carnet existant**.

Chargé directement depuis Administrator :
- `js/okx-microstructure-406499.js`

Le module conserve son comportement validé :
- body portal indépendant ;
- lecture seule ;
- Backend local 8790 ;
- USD => préférence USDC puis USDT ;
- rafraîchissement toutes les 2 s uniquement lorsque la fenêtre est ouverte ;
- commandes natives réduire / détacher / agrandir / masquer ;
- aucun ordre, aucune API privée, aucun wallet.

Dans Trader, `#detailPanel` reste le panneau Lecture Technique sous-jacent. Profondeur se superpose dessus comme dans Administrator ; fermer Profondeur révèle Lecture Technique.

Market, Lecture Technique métier et Math Core restent encore non montés.
