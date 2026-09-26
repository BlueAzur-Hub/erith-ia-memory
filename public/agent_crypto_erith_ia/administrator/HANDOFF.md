# Agent-Crypto — Handoff Seven

Build **40.6.419** · parent **40.6.418** · Market Core **38.15.11**.

## Pourquoi cette version

40.6.418 a correctement livré le relevance gate News mais a raté le contrat de démarrage Aether : le ruban devenait visible avant les News et montrait des placeholders.

40.6.419 ne cherche plus à améliorer l'état vide. **Elle supprime son exposition.**

## Invariant opérateur

Avant la fin du cycle initial News :
- menu normal visible ;
- Aether techniquement résident mais visuellement absent ;
- aucun `EN ATTENTE`, `NON DISPONIBLE` ou `News Sentinel non chargée` dans le ruban.

Après News :
- lot qualifié pluriel requis (>=2 événements) ;
- Aether apparaît déjà rempli ;
- cadence historique conservée.

## Owners modifiés

- `administrator/js/aether.js` — causalité / gate d'exposition.
- `administrator/admin-ribbons.css` — garde de visibilité avant News-set-ready.
- identité de build/release + snapshot.

## Owners protégés

News collector et Event Core 40.6.418, Market Core 38.15.11, Window Manager, Watch, géométrie/F11, Oracle, LT, Strategy, Storage.

## Terrain

Firefox uniquement :
`Ctrl+F5 → menu normal reste stable → News finit → Aether apparaît déjà rempli`.

Pas de nouvelle version cosmétique si ce contrat échoue.
