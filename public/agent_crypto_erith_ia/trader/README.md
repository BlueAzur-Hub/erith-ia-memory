# ERITH.IA Trading Desk — 40.6.597

## Objet
Déboguer la synchronisation générale avant d’ajouter OKX compte / BUY / SELL.

Le Fil Crypto impose déjà :
**PAIR sélectionnée = vérité centrale de la Trading Page.**

40.6.597 matérialise enfin cette règle avec un owner léger :
`trader/pair-central-truth.js`.

## PAIR centrale
La sélection Market produit une seule vérité :
- id CoinGecko / id externe ;
- symbole ;
- quote réelle ;
- PAIR ;
- devise d’affichage ;
- contexte New Listing ou Market ;
- révision de sélection.

Un chip visible dans le header affiche :
- **SYNC** : les owners interrogés sont cohérents ;
- **SYNCING** : un owner charge encore ;
- **MISMATCH** : incohérence prouvée.

## Owners audités
- Market ;
- Graphique Ligne ;
- Bougies ;
- Profondeur ;
- Lecture Technique ;
- Math Core ;
- Source Dock.

Aucun ordre, aucune clé privée, aucun nouveau backend.

## Correctifs de débogage inclus
1. La fiche Market flottante est maintenant fermée immédiatement quand une autre PAIR est sélectionnée. Elle ne doit plus rester visuellement sur un ancien actif.
2. Market ne modifie plus directement le DOM de Lecture Technique. Chaque surface garde son owner ; Market ne possède que la sélection centrale.

## Protégé
- Administrator 40.6.571 ;
- Market Core 38.15.11 ;
- Graphique historique 40.6.594 ;
- Interface filtrée 40.6.595 ;
- Source Dock 40.6.596 ;
- Bougies / Profondeur / EUR-USD / Math Core / Lecture Technique.

## Terrain
Tester BTC → ETH → SOL → un autre actif.
La PAIR du header et toutes les surfaces actives doivent converger sur le même actif.
