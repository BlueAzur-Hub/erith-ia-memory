# Agent-Crypto — Handoff

Build **40.6.408** · rollback **40.6.407** · Market Core **38.15.11**.

## Objet

Mesurer pourquoi certains modules passent des dizaines de secondes entre
`cycle-start` et `load-end`, sans modifier leur comportement.

## Diagnostic attendu

Pour chaque module Strategy/Postboot :

- queue wait ;
- yield wait ;
- sleep wait ;
- Resource Timing ;
- évaluation / load-event tail ;
- cache / transfer / protocole ;
- Long Task overlap si supporté par Firefox.

## Protections

- `.407` reste le checkpoint sain ;
- Auto A inchangé ;
- Simulation/Evidence inchangés ;
- aucune modification métier ;
- aucun réordonnancement ;
- aucun preload ;
- aucun timer récurrent ;
- PerformanceObserver uniquement pour `longtask` si supporté ;
- aucun réseau métier ou stockage ajouté.

## Test

Ctrl+F5 → attendre stabilisation → Rapport de démarrage → Actualiser → Copier.

Ne pas ouvrir les preuves complètes avant la première copie du rapport.

**Aucune 40.6.409 avant analyse du rapport 40.6.408.**
