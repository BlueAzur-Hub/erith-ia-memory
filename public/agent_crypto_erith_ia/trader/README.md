# ERITH.IA Trading Desk — 40.6.572

Première fondation de la page Trader.

## Canon

- Dossier : `public/agent_crypto_erith_ia/trader/`
- Entrée : `trading-desk.html`
- Même application Agent-Crypto.
- Aucun moteur métier dupliqué.
- Administrator 40.6.571 reste intact et protégé.
- Market Core 38.15.11 reste intact.
- Aucune clé OKX.
- Aucun ordre réel.
- Aucun ticket Achat/Vente actif à cette étape.

## Architecture déjà décidée

Desktop :
- Market
- Graphique Bougies
- Profondeur au-dessus de Lecture Technique
- Math Core
- Achat/Vente
- REDIVIDER comme Kill Switch

Mobile :
- même HTML responsive
- PAIR
- Graphique
- Profondeur
- Lecture Technique
- Math Core / Vente / REDIVIDER
- Market deviendra un drawer

## Propriétaires à réutiliser

- Market : Administrator `marketSnapshotPanel`
- Bougies : `administrator/js/market-microscope-candles.js`
- Profondeur : `administrator/js/okx-microstructure-406499.js`
- Lecture Technique : Administrator `detailPanel`
- Math Core : Administrator `math`
- EUR/USD : `administrator/js/quote-currency-architecture-406497.js`

Cette version crée uniquement le contrat de page et ses points de montage.
La prochaine étape doit brancher les propriétaires existants sans recopier leur logique.
