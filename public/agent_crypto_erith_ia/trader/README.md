# ERITH.IA Trading Desk — 40.6.572

Fondation de la page Trader — **NON VALIDÉE terrain tant que Christophe ne l’a pas acceptée**.

## Correction de disposition

La première publication de la fondation plaçait le Market à gauche du Graphique. Cette interprétation était incorrecte.

Le Fil Crypto et l’interface Administrator existante imposent de **conserver l’agencement déjà connu** :

### Desktop

1. En haut :
   - Graphique / Bougies
   - à droite : Profondeur au-dessus de Lecture Technique
2. En dessous :
   - Market
   - Math Core à droite du Market
   - actions Achat/Vente futures dans cette même zone latérale

Le Trader doit donc retrouver immédiatement la géométrie de lecture de l’interface existante, au lieu de réinventer une nouvelle grille.

### Mobile

Même HTML responsive :
- PAIR
- Graphique
- Profondeur
- Lecture Technique
- Math Core / Vente / REDIVIDER
- Market deviendra un drawer

## Canon technique

- Dossier : `public/agent_crypto_erith_ia/trader/`
- Entrée : `trading-desk.html`
- Même application Agent-Crypto.
- Aucun moteur métier dupliqué.
- Administrator 40.6.571 reste intact et protégé.
- Market Core 38.15.11 reste intact.
- Aucune clé OKX.
- Aucun ordre réel.
- Aucun ticket Achat/Vente actif à cette étape.

## Propriétaires à réutiliser

- Market : Administrator `marketSnapshotPanel`
- Bougies : `administrator/js/market-microscope-candles.js`
- Profondeur : `administrator/js/okx-microstructure-406499.js`
- Lecture Technique : Administrator `detailPanel`
- Math Core : Administrator `math`
- EUR/USD : `administrator/js/quote-currency-architecture-406497.js`

Cette fondation pose uniquement la surface et les points de montage.
La prochaine étape ne doit commencer qu’après validation de cette géométrie.
