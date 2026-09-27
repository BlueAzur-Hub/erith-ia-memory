# Agent-Crypto 40.6.439 — PROGRESSIVE RECOVERY · STRATEGY AUDITS ON DEMAND

## Base protégée
40.6.438 reste la base vivante restaurée depuis 40.6.425.

Les blobs suivants restent strictement inchangés :
- style.css
- app.js
- js/post-boot-runtime-loader.js
- js/views/private-source-demand-loader.js

## Réintroduction bornée
Deux modules seulement :
- Strategy A Cost-Wait Outcome Audit
- Strategy A Oracle / Cost Calibration Truth

Ils ne sont plus résidents au boot. Le loader `strategy-a-audit-demand-loader.js` les charge uniquement à l’ouverture de Simulation.

## Durcissement inclus
- chargement retentable après échec ;
- attente bornée à 6 s par module ;
- Exporter répétable ;
- aucun recalcul/rendu d’audit quand Simulation est fermée ;
- Execution Cost Truth reste hors résidence.

## Interdits respectés
Aucun changement CSS/Aether/Market Core/Oracle math/Risk/Paper/Strategy business logic.
Aucun ordre réel. Aucun timer récurrent. Aucun observer. Aucun stockage nouveau.
