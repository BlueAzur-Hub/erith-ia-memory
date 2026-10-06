# ERITH.IA Trading Desk — 40.6.598

## Objet
Corriger le bug terrain visible en 40.6.597 :

> **Graphique Ligne indisponible · NetworkError when attempting to fetch resource**

alors qu'une série historique réelle reste déjà affichée.

## Cause
Le Trader appelait CoinGecko directement mais ne possédait pas encore la résilience du Graphique Administrator :
- fallback Microscope uniquement en 24 h ;
- aucun cache exact pour 7j / 30j / 60j / 90j / 1a / Max ;
- une actualisation réseau intermittente pouvait donc poser un état erreur au-dessus d'une série réelle déjà chargée.

## Correctif
`line-chart-native.js` reprend le principe de l'Interface :
- cache navigateur exact **coin + devise + période** ;
- maximum 14 contextes Trader ;
- lecture possible du cache historique Administrator déjà présent sur la même origine ;
- si une actualisation du **même contexte exact** échoue, la dernière série réelle reste utilisée ;
- la vérité passe en **CACHE / REPLI** ;
- l'overlay `Graphique Ligne indisponible` n'apparaît plus tant qu'une série exacte réelle est disponible.

Aucune donnée d'une autre PAIR, devise ou période n'est recyclée.

## Protégé
- 40.6.594 : prix historiques / tooltip / EUR-USD ;
- 40.6.595 : Interface filtrée ;
- 40.6.596 : Source Dock natif ;
- 40.6.597 : PAIR centrale + audit SYNC/MISMATCH ;
- Bougies / Profondeur / Market / Math Core / Lecture Technique.

## Terrain
Tester plusieurs périodes, notamment **60j**, celle de la capture ayant reproduit le défaut.
