# ERITH.IA Trading Desk — 40.6.579

## Intention

Transposer le haut de l'Administrator au lieu de réinventer sa géométrie.

### Trio prioritaire

- **Graphique / Bougies** : owner existant `market-microscope-candles.js`.
- **Lecture Technique** : structure native `#detailPanel`, `#detailPanelToggle`, `#detailPanelBody`, `#detailPanelRail`.
- **Profondeur** : owner existant `okx-microstructure-406499.js`, docké sur le vrai `#detailPanel`.

La correction 40.6.576 qui fabriquait un rail Trader de 42 px est retirée. Le Trader reprend la mécanique Clean Lens de l'Interface.

## Options Lecture Technique transposées

Même logique que dans Administrator :
- AUTO ;
- AUBE ;
- JOUR ;
- SOIR ;
- NUIT ;
- LUNE ;
- RND sur 21 images ;
- image privée choisie localement par clic sur le portrait ;
- stockage IndexedDB `agent_crypto_private_visuals` / slot `technical-reading`.

Plages AUTO :
- Aube 05:30–09:00
- Jour 09:00–17:30
- Soir 17:30–21:30
- Nuit 21:30–00:30
- Lunaire 00:30–05:30

Le bridge Support/Résistance reste celui du owner Bougies ; aucune nouvelle formule S/R n'est créée.

## Sécurité

- aucun ordre réel ;
- BUY / SELL / STOP toujours désactivés ;
- Administrator 40.6.571 inchangé ;
- Market Core 38.15.11 inchangé ;
- Market + Math Core restent la prochaine transposition après validation terrain du haut.

## 40.6.579 — Market natif transposé

Le placeholder Market est remplacé par la structure Administrator : Market Snapshot, recherche, filtres, vues 50/100/250/500/1000, colonnes Essentiel/Complet et tris.

Données : mêmes archives publiques que l'Administrator, `../data/crypto/latest.json` et `extended.json` à la demande.

La sélection Market devient le premier owner de la PAIR Trader et resynchronise Graphique/Bougies + Profondeur via leurs owners existants. Aucune requête CoinGecko directe navigateur n'est ajoutée.

## 40.6.579 — Math Core V3 transposé

Le placeholder Math est remplacé par la structure native Administrator : score ring, verdict factuel, résumé Série/Volatilité/Drawdown/VaR, détails et dock Dessus/Latéral/Réduire.

La formule d'indice reprend `scoreCoin` de l'Administrator. Les mesures historiques viennent uniquement des vraies bougies du propriétaire `AgentCryptoMarketMicroscope` : pas médian, complétude, volatilité de fenêtre, drawdown maximal et VaR historique 95 % par pas.

Aucun nouveau modèle prédictif n'est ajouté. Aucune exécution réelle.
