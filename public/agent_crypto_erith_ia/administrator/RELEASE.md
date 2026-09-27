# Agent-Crypto 40.6.441 — BACKEND/API VALIDATED BEHAVIOR RESTORE

## Objectif unique
Restaurer le comportement validé : ouvrir Backend/API ne doit plus attendre l'arrivée tardive du post-boot secondaire pour obtenir Source Truth.

## Changement
Le propriétaire canonique existant :
`js/views/private-backend-sources.js`
est chargé directement depuis `index.html`, juste avant `post-boot-runtime-loader.js`.

Il est donc déjà résident quand l'opérateur ouvre Backend/API. Son mécanisme existant `erith:system-hydrated` reste responsable du montage dans le corps Backend hydraté.

## Inchangé
- private-backend-sources.js : byte-identique
- private-source-demand-loader.js : byte-identique
- post-boot-runtime-loader.js : byte-identique
- style.css : byte-identique
- app.js : byte-identique
- Aether
- Market Core 38.15.11
- Oracle / Risk / Paper
- Strategy métier
- Execution Cost Truth

Aucun rollback global.
