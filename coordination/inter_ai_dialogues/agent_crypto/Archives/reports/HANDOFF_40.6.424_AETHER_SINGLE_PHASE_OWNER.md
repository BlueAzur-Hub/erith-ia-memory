# HANDOFF — AGENT-CRYPTO 40.6.424 · AETHER SINGLE PHASE OWNER

## État
- Build : **40.6.424**
- Parent : **40.6.423**
- Market Core : **38.15.11**
- PAPER only · G3 PENDING · G9 LOCKED

## Terrain
La ligne vide persiste en .423 malgré les overlaps. Le menu natif automatique interrompt aussi volontairement le fil.

## Audit
Le problème est architectural : 6 animations/horloges différentes se partagent une ligne physique qui reste haute même lorsque tous les enfants sont invisibles.

`aether-operator-bridge.js` historique restait aussi un propriétaire secondaire de visibilité/reset.

## Chirurgie
### js/aether.js
Machine d'état unique :
INFO 15 s → 12 News × 18 s → SYSTEM 9 s → INFO.
Une seule échéance timeout pending.

### admin-ribbons.css
Plus aucune keyframe de phase.
Affichage dérivé uniquement de `#livecheck[data-aether-phase]`.

### js/aether-operator-bridge.js
Menu natif manuel délégué à la machine d'état.
Aucune écriture directe phase visibility.
Aucun `offsetWidth` de restart.

## Menu
Automatique : **retiré**.
Manuel : conservé.

## Terrain attendu
Aucune frame sans propriétaire visible.
Aucun menu automatique.
Pause onglet et pause manuelle reprennent au même point.

## Suite
40.6.425 Storyline Clustering / Diversity après PASS.
