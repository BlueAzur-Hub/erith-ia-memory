# Agent-Crypto — Postboot Module Cost Trace

Build **40.6.404** · parent **40.6.403** · Market Core **38.15.11**.

But unique : transformer les trous anonymes de la trace 40.6.403 en propriétaires de modules nommés.

Preuve 40.6.403 :
- Cold Boot owners eux-mêmes courts ;
- PRE-AETHER et script Aether quasi instantanés ;
- Consultation First atteint tous ses signaux mais tardivement ;
- grands trous entre marqueurs, notamment plusieurs postboot-module → postboot-module ;
- symptôme compatible avec une starvation du main thread provoquée par l'évaluation/cascade de certains modules.

40.6.404 ajoute uniquement de l'instrumentation :
- strategy-core-module-cycle-start / load-start / load-end ;
- postboot-module-cycle-start / load-start / load-end ;
- load_ms = chargement + évaluation du script ;
- cycle_ms = attente coopérative + chargement + évaluation ;
- POSTBOOT MODULE COST TRACE : top 20 modules par cycle_ms ;
- TOP MARK GAPS affiche maintenant le nom du fichier source lorsque disponible.

Inchangés : ordre des modules, listes de modules, scheduler, Strategy A métier, Market Core 38.15.11, Math, Aether métier, Oracle, Lecture Technique, REDIVIDER, Storage schemas et demand policy.

Terrain Firefox : **PENDING**.
