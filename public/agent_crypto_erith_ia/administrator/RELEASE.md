# Agent-Crypto — 40.6.427 · Native Cockpit CSS Geometry

Parent accepté : **40.6.425**  
Build rejeté non repris : **40.6.426**  
Market Core : **38.15.11**

## Correction demandée

Correction **uniquement CSS native** de la géométrie du bloc central.

Règle canonique modifiée dans `style.css` :

- avant : `clamp(507px, calc(59vh + 42px), 647px)`
- après : `clamp(540px, calc(64vh + 42px), 760px)`

Effet attendu :
- Livecheck conserve uniquement son rôle existant de positionnement/navigation ;
- Graphique + Lecture technique sont plus hauts dès le rendu ;
- Target Top 5 reste la dernière bande visible ;
- Market Flow reste intact juste dessous, hors cadre ;
- F11 agrandit naturellement via `vh`, sans aucun code runtime.

## Interdits respectés

- aucun JS ajouté ;
- aucun JS modifié ;
- aucun listener resize/F11 ;
- aucun requestAnimationFrame ;
- aucun timer ;
- aucun observer ;
- aucun déplacement DOM ;
- aucun masquage Market Flow ;
- aucun changement Target Top 5 ;
- aucun changement Window Manager / Aether / Oracle / Math / Strategy / Storage / Market Core.

## Test terrain

1. Ctrl+F5 et vérifier **Build 40.6.427**.
2. Cliquer Livecheck pour positionner la vue.
3. Vérifier : Menu/Aether haut → Graphique + Lecture technique centre → Target Top 5 bas.
4. Market Flow doit être sous le bord inférieur.
5. F11 : même composition, agrandie nativement.
6. Sortie F11 : retour natif sans script.
