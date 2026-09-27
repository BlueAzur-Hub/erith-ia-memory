# Agent-Crypto — 40.6.428 · NATIVE CSS COCKPIT FIT CORRECTION

Source fonctionnelle : **40.6.425**.  
Tentatives rejetées non héritées : **40.6.426**, **40.6.427**.  
Market Core : **38.15.11**.

## Correction

Une seule correction fonctionnelle dans `style.css` :

`#analyste ... .chart-shell`

- avant : `clamp(507px, calc(59vh + 42px), 647px)`
- après : `clamp(525px, calc(61.5vh + 42px), 720px)`

Le but est de donner au bloc **Graphique + Lecture technique** une taille native plus grande dès le chargement, tout en laissant **Target Top 5 entièrement visible** au bas du viewport et **Market Flow intact sous le fold**.

## Interdits respectés

- aucun JavaScript ajouté ou modifié ;
- aucune fonction de redimensionnement ;
- aucun listener resize/F11 ;
- aucun requestAnimationFrame ;
- aucun déplacement DOM ;
- aucun changement Target Top 5 ;
- aucun changement Market Flow ;
- aucun changement Window Manager ;
- Aether .425 inchangé ;
- Market Core 38.15.11 inchangé.

## Test Firefox

Ctrl+F5 → Build 40.6.428 → Livecheck pour positionner la vue seulement.

Attendu normal et F11 :
Menu/Aether → Graphique + Lecture technique → Target Top 5 entier → Market Flow hors cadre.
