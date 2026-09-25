# Agent-Crypto — Strategy status relocation

Build **40.6.407** · parent **40.6.406** · Market Core **38.15.11**.

## Correction unique

Le badge **STRATEGY A · AUTO A ACTIF** ajouté en 40.6.406 dans le bandeau supérieur Administrator est **retiré du menu**.

Le même état de lecture seule est désormais affiché **uniquement dans la section Simulation**, juste sous son en-tête.

## Invariants

Inchangés :
- Auto A / autostart Strategy ;
- Strategy A métier et seuils ;
- Cost Gate / Risk Governor / Paper ;
- découplage Simulation / Evidence 40.6.406 ;
- résumé léger G1 → G9 ;
- Evidence complet sur demande explicite ;
- Market Core **38.15.11** ;
- Math, Aether, Oracle, Lecture Technique, REDIVIDER, Storage.

Aucun ordre réel.

## Test Firefox

1. Ctrl+F5.
2. Vérifier **Build 40.6.407 · Administrator**.
3. Vérifier que le header ne contient plus **STRATEGY A · AUTO A ACTIF** et retrouve sa géométrie normale.
4. Ouvrir **Simulation**.
5. Vérifier que le statut Strategy est présent dans Simulation uniquement.
6. Vérifier que Strategy démarre toujours automatiquement.
7. Vérifier que l'ouverture de Simulation ne déclenche toujours pas Evidence 28/28.

Terrain : **PENDING**.
