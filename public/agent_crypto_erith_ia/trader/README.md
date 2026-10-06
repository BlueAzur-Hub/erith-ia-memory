# ERITH.IA Trading Desk — 40.6.577

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
