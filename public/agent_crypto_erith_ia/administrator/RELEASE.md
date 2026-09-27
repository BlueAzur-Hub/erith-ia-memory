# Agent-Crypto 40.6.440 — BACKEND/API DETERMINISTIC RESIDENCY RECOVERY

## Cause terrain
40.6.439 est rejetée : Backend/API pouvait être ouvert avant l’arrivée de son loader, ce qui perdait le signal de demande et laissait uniquement le bloc statique.

## Correction bornée
- replay immédiat si Backend/API est déjà ouvert ;
- suppression d’un script Source Truth échoué/périmé avant nouvelle tentative ;
- retry réel ;
- timeout de chargement Source Truth : 7 s ;
- montage explicite de private-backend-sources.js après chargement ;
- attente downstream bornée à 4,5 s ;
- cache-buster 40.6.440 sur l’entrée private-source-demand-loader dans le post-boot.

## Non touché
- private-backend-sources.js
- style.css
- app.js
- Aether
- Market Core 38.15.11
- Oracle / Risk / Paper
- Strategy business logic
- Execution Cost Truth

Les audits Strategy A de 40.6.439 restent chargés uniquement à la demande.
