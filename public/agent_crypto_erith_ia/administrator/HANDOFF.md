# Agent-Crypto — Handoff

Build **40.6.411** · parent **40.6.410** · rollback **40.6.407**.

## Mission

Identifier le propriétaire réel des lenteurs encore visibles sans refaire l'architecture.

## Vérité acquise

40.6.410 conserve le cockpit avant Strategy.
Le prochain P0 est le chemin :

`Livecheck → Market → CURRENT → Graph → Consultation/Aether`.

Les anciennes valeurs `eval/event` ne prouvent pas qu'un petit script exécute réellement pendant 5–19 secondes.

## Sonde 40.6.411

Le Rapport de démarrage expose maintenant :

- chronométrage des fonctions critiques ;
- séparation `responseEnd / eval-enter / eval-exit / load-event` ;
- dérive réelle du timer postboot de 1500 ms ;
- ressources externes précoces ;
- Residency Pipeline et Top Mark Gaps conservés.

## Discipline

- aucune correction métier dans cette build ;
- pas de suppression de module ;
- pas de refonte Strategy/Aether ;
- pas de modification Market Core ;
- attendre une session Firefox 40.6.411 avant de choisir le propriétaire suivant.

**STOP après collecte du rapport.**
