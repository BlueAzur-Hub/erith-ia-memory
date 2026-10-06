# ERITH.IA Trading Desk — 40.6.595

## Objet
Faire du Trader une **lecture filtrée de l'Interface Administrator**, et non une application reconstruite à côté.

## Actif
Marché, Graphique Ligne, Bougies, Profondeur, Lecture Technique, EUR/USD, Fiche, Math Core, Nouveaux listings.

## Mémoire grisée
Les zones exclues gardent une empreinte visuelle à leur place logique :
- sous le couple Graphique / Lecture Technique : Oracle, Atlas, Décision, Analyse ;
- après Market / Math Core, dans l'ordre de l'Interface : Multi Horizon, News Sentinel, Lecture froide, Watchlist, Risques, Impact, No FOMO, Sources, Système, Projets, Aether.

## Règle technique
Ces surfaces grisées sont du **HTML/CSS uniquement** :
- aucun owner métier ;
- aucun listener ;
- aucun fetch ;
- aucun état restauré ;
- `pointer-events:none`.

## Protégé
40.6.594 : Graphique Ligne, prix historiques, point de survol, variation par période, EUR/USD.
Administrator 40.6.571 et Market Core 38.15.11 restent inchangés.

## Terrain
Firefox opérateur : **PENDING CHRISTOPHE**.
