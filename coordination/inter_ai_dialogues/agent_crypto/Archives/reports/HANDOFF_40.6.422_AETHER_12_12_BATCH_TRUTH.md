# HANDOFF — AGENT-CRYPTO 40.6.422 · AETHER 12/12 BATCH TRUTH

## État
- Build : **40.6.422**
- Parent : **40.6.421**
- Market Core : **38.15.11**
- PAPER only · G3 PENDING · G9 LOCKED

## Symptôme terrain
Aether : 3–4 News répétées, puis bande vide avant retour du menu, malgré un News Sentinel riche.

## Preuve
Le dump 40.6.421 contient 115 événements uniques.
Le sélecteur Aether courant peut former 12 événements distincts.

## Root cause
- pulse JS rejeté quand `document.hidden`;
- cadence CSS indépendante pouvant avancer ;
- classement des 12 recalculé à chaque pulse, donc index sur liste mouvante.

## Chirurgie
### js/aether.js
- batch d'identités figé ;
- curseur sans wrap ;
- pause/resume liée à `visibilitychange`;
- diagnostics 12/12.

### admin-ribbons.css
- quand `data-aether-cadence-paused=1`, toute animation du command-bar est pausée comme une seule horloge.

## Non modifié
Collector News · Taxonomy 40.6.421 · Market Core · Oracle · LT · Atlas CURRENT · Strategy · Storage.

## Terrain attendu
12 affichées · 12 uniques · 0 doublon · complete=true · SYSTEM après 12/12 · aucun blackout.

## Prochain chantier
40.6.423 Storyline Clustering / Diversity.
