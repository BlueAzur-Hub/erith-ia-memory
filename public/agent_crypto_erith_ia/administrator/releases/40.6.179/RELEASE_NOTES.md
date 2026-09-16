# Agent-Crypto 40.6.179 — Strategy A Evidence Dossier Integration

## Terrain 40.6.178
- Build 40.6.178 visible dans Firefox.
- Le dossier Strategy A existant est visible.
- Aucun marqueur `STRATEGY A · EVIDENCE SUPPLEMENTS · 40.6.178` dans l'export terrain.
- Aucun `0 / 3 PANNEAUX` dans l'export terrain.
- Après le dossier visible, le flux passe directement à TRADUS/YOHAN.

## Cause retenue
Le second host de preuve n'apporte aucune valeur : les trois renderers `.169/.171/.172`
cherchent déjà `#strategyADossier`. Le propriétaire visuel prouvé est donc le dossier existant.

## Correction 40.6.179
Nouveau module : `strategy-a-evidence-dossier-supplement-integrator.js`.

Il :
1. garantit l'existence du dossier existant ;
2. restaure le contrat G3 `.165` si nécessaire ;
3. crée trois placeholders visibles directement dans le dossier ;
4. appelle les owners `.169`, `.171`, `.172` ;
5. ordonne les trois panneaux après le G3/contrat existant et avant le footer du dossier ;
6. recrée cette intégration après `agent-crypto:evidence-view-refreshed`.

Ordre attendu :
- G1 After-Cost Data Truth
- G3 Historical Dataset Discovery
- G3 Realistic Replay Contract
- G3 Structured Data Truth
- G3 History Owner Discovery
- G3 Historical Evidence Adapter
- footer PAPER ONLY
- puis TRADUS/YOHAN

## Garde-fous
- pas de timer récurrent ;
- pas de MutationObserver ;
- pas de nouvel owner de stockage ;
- pas de requête réseau métier ;
- aucun self-test automatique ;
- aucun ordre réel ;
- aucune modification de seuil Strategy A, Risk ou lifecycle ;
- Market Core 38.15.11 protégé ;
- G3 reste PENDING ;
- G9 reste LOCKED.

## Terrain
Firefox : PENDING jusqu'au prochain reload/export.
