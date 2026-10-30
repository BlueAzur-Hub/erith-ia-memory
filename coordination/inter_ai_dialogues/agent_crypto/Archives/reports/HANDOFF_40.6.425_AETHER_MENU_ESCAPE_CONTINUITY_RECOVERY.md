# HANDOFF — AGENT-CRYPTO 40.6.425 · AETHER MENU ESCAPE / CONTINUITY RECOVERY

## État
- Build : **40.6.425**
- Parent : **40.6.424**
- Market Core : **38.15.11**
- PAPER only · G3 PENDING · G9 LOCKED

## Défaut confirmé en .424
`♥ VEILLE` est câblé comme HOLD persistant : `manualPaused=true`, timeout supprimé, reprise explicite requise.
Le contrat humain attendu est : **VEILLE ramène au menu, puis Aether reprend seul**.

## Chirurgie
### js/aether.js
- menu escape sans pause manuelle ;
- timeout canonique conservé ;
- reprise automatique à la prochaine échéance ;
- garde-fou `remaining<=0 → nextAction` immédiat ;
- snapshot enrichi : timer_pending / generation / menu_escape.

### js/aether-operator-bridge.js
- délégation au propriétaire canonique ;
- résultat vérifié ;
- plus de contrat persistent_until_resume_or_reload.

## Terrain attendu
`NEWS → ♥ VEILLE → MENU → reprise automatique`, sans Ctrl+F5.

## Non-changements
Market Core 38.15.11 · News collector · Oracle · Math · LT · Strategy · Storage · Window Manager.

## Suite
Après PASS Firefox : **40.6.426 — Storyline Clustering / Diversity**.
