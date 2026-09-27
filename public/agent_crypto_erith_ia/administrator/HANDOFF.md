# Agent-Crypto — Handoff Seven

Build **40.6.426 — LIVECHECK COCKPIT / F11 VIEWPORT FIT**  
Parent **40.6.425** · Market Core **38.15.11**.

## État précédent

40.6.425 stabilise le contrat Aether :
`♥ VEILLE → MENU → reprise automatique`.

## Destination 40.6.426

Le raccourci **Livecheck** devient l'entrée du cadrage cockpit :

`Menu/Aether → Graphique + Lecture technique → Target Top 5`

Target Top 5 doit terminer le viewport. Market Flow reste le bloc suivant, intact et fonctionnel, mais sous le fold.

## Propriétaires

- CSS : `admin-livecheck-cockpit-406426.css`
- Runtime : `js/livecheck-cockpit-406426.js`

Le runtime ne déplace aucun nœud. Il mesure le budget vertical et écrit uniquement la variable CSS de hauteur du `#market-zone`. F11 est traité par le resize natif, coalescé dans un requestAnimationFrame unique.

## Interdits respectés

- pas de display:none sur Market Flow ;
- pas de reparent DOM ;
- pas de timer récurrent ;
- pas de MutationObserver ;
- pas de stockage ;
- pas de Window Manager write ;
- pas de changement Market Core / Aether / Oracle / Math / Strategy.

## Test prioritaire

**Normal : Livecheck → Target Top terminal → Market Flow hors cadre.**  
**F11 : même composition étendue → Target Top terminal → Market Flow hors cadre.**  
Scroll bas : Market Flow réapparaît normalement.

## Suite

Si PASS : **40.6.427 Storyline Clustering / Diversity**.
