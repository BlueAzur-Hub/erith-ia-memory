# ERITH.IA — Bots et ordres : parcours de développement sécurisé

**18 octobre 2026 · Seven Heaven · Trader · moteur PAPER exclusivement.**

Le projet possède déjà le ticket de brouillon `trader/ct-order-draft.js` pour **CT/USDC sur OKX** : ses règles, soldes et coûts privés ne doivent jamais être mélangés avec les marchés publics CT/USDT. Ce brouillon reste volontairement non exécutable. Le moteur `trader/spot-paper-order-engine.js` ajoute un **cycle d'ordres limites fictifs** pour Q/USDT (Bitget), ICNT/USDT (Bitget), FLUID/USDT (OKX) et SAND/USDT (Binance), dans un modèle sans I/O.

## Niveau actuel : moteur d'ordres PAPER isolé

- Création d'un portefeuille USDT **fictif**, sans conversion USD/EUR ou lien au Bridge.
- Ordre **LIMIT** Spot à prix et quantité décimaux exacts, sans arrondi silencieux; minQty, lotStep, tickSize et minNotional explicitement exigés.
- Limite par ordre en points de base du capital PAPER, contrôle du solde fictif, frais taker et réserve prudente de glissement hypothétiques.
- Ordre en attente, remplissage partiel au **meilleur niveau visible** uniquement si le carnet est postérieur au brouillon, frais et quantité restants; annulation, expiration après 1 h et coupe-circuit manuel (aucun nouvel ordre).
- Refus des marchés erronés, du marché dérivé, des mauvaises devises, du carnet trop ancien/croisé, des spreads hors limite, des règles de lot et des fonds insuffisants.
- `network=false`, `bridge=false`, `storage=false`, `tradeEndpoint=null`, `realOrders=false`. Aucune clé ou donnée de compte. Un remplissage fictif n'est **jamais** une promesse d'exécution réelle.

**Limite :** une profondeur au meilleur prix peut changer avant qu'un ordre n'arrive à la bourse. Ce moteur ne certifie ni temps de latence, maker/taker effectif, volume réellement servi, slippage réel, performance ou identité exacte du contrat CoinGecko. Il n'exécute pas encore un robot autonome et n'est pas branché sur le graphique du Trader. Les nouvelles fonctions ne justifient pas de trading réel.

## Ordre des futurs jalons

1. **PAPER / simulation déterministe** : tests de multiples scénarios, annulation, carnet périmé, limites de risque, historique d'événements, refus d'ordre. Comparer avec des snapshots d'archives réellement publiés.
2. **Bot à stratégie déclarée avant test** : entrée/sortie, taille maximale, frais, stop-loss, fréquence limitée, répétition contrôlée et comparaison à BTC. Journal prospectif indépendant, protection contre look-ahead.
3. **Interface Trader repliable** : simulation à partir de la sélection et de la paire Spot *certifiées* ; la décision reste lisible et aucun ordre n'est transmis. Tests Firefox et CI avant mise à disposition.
4. **Préparation du Bridge d'exécution** : spécification d'un adaptateur séparé avec permissions minimales (jamais retrait), limites quotidiennes, idempotence d'ordres, journal/audit privé, contrôle soldes Spot disponibles, modes sandbox/testnet et secret local. Ne pas committer de credentials ni copier les données privées vers GitHub Pages.
5. **Réel — étape distincte, fermée actuellement** : tests sandbox puis décision humaine explicite sur chaque activation et ses montants, revue des droits des clés, autorisation d'arrêt, contrôle post-trade et retour à lecture seule. Aucune permission Trade n'est ajoutée au cours de ce jalon.

## Univers de recherche parallèle

Cas prospectifs actuels : Q, ICNT, FLUID. Développement des dossiers supplémentaires : SAND, LIT, KMNO, A, RSR, MINA, NMR et autres candidats du Radar Top 1000 avec marché Spot documenté. BTC demeure **témoin**, CT et DNA cas d'école de synchronisation du Trader. La qualification historique du 17 octobre n'est pas une cotation live ni une sélection d'achats. L'absence de preuve de contrat jeton↔paire CEX interdit toute équivalence affirmée.

**Séparation conservée :** Interface/Trader et Market Core 38.15.11, graphiques, carnet existant, expérience Radar20 fixe, historique de Q et Coffre restent inchangés. Aucun changement de version du Trader sur un simple ajout de moteur inactif.
