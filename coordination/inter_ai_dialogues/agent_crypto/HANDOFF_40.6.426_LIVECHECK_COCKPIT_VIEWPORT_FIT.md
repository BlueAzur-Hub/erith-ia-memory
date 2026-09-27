# HANDOFF — AGENT-CRYPTO 40.6.426 · LIVECHECK COCKPIT / F11 VIEWPORT FIT

## État
- Build : **40.6.426**
- Parent : **40.6.425**
- Market Core : **38.15.11**
- Aether .425 : inchangé
- PAPER only · G3 PENDING · G9 LOCKED

## Demande opérateur

Le raccourci **Livecheck** doit cadrer le viewport ainsi :

`MENU/AETHER → GRAPHIQUE + LECTURE TECHNIQUE → TARGET TOP 5`

Target Top 5 est la dernière bande visible. **Market Flow reste intact juste après dans le document, mais sous le fold.**

En F11, le couple Graphique + Lecture technique absorbe l'espace vertical supplémentaire ; Target Top reste terminal ; Market Flow reste hors cadre. À la sortie de F11, le cadrage revient automatiquement.

## Chirurgie

### admin-livecheck-cockpit-406426.css
- scope uniquement sous `data-atlas-livecheck-cockpit="1"` ;
- hauteur bornée de `#market-zone` ;
- `#analyste`, chart-panel et chart-shell remplissent ce budget ;
- Lecture technique suit la hauteur de son parent ;
- aucun sélecteur Market Flow.

### js/livecheck-cockpit-406426.js
- activation uniquement au raccourci Livecheck ;
- mesure du viewport, Menu/Aether, gaps naturels, Target Top ;
- écrit une seule variable CSS de hauteur ;
- scroll immédiat de Livecheck au haut du viewport ;
- recalcul uniquement sur `resize`, coalescé par un requestAnimationFrame ;
- désactivation sur autre raccourci principal.

## Interdits respectés
- Market Flow ni caché ni déplacé ni redimensionné ;
- aucun reparent DOM ;
- aucun timer récurrent ;
- aucun MutationObserver ;
- aucun stockage ;
- aucune requête réseau ;
- aucune écriture Window Manager ;
- Market Core / Aether / Oracle / Math / Strategy inchangés.

## Test prioritaire
Normal : **Livecheck → Target Top terminal → Market Flow hors cadre**.  
F11 : **même cadrage étendu**.  
Sortie F11 : retour propre.  
Scroll bas : Market Flow visible et fonctionnel.

## Suite
Après PASS Firefox : **40.6.427 — Storyline Clustering / Diversity**.
