# Agent-Crypto — Strategy Core Priority Scheduler Recovery

Build **40.6.409** · parent **40.6.408** · rollback sain **40.6.407** · Market Core **38.15.11**.

## Correction unique

40.6.408 a prouvé que `yieldMain(160)` + `sleep(18)` entre les modules Strategy Core pouvaient dériver jusqu'à plusieurs dizaines de secondes.

40.6.409 retire uniquement ces deux attentes dans la boucle des **8 modules Strategy Core**.

Conservés :
- même ordre des 8 modules ;
- même `loadOne()` séquentiel ;
- mêmes modules ;
- mêmes règles Strategy / Auto A ;
- même découplage Simulation / Evidence ;
- même Market Core 38.15.11 ;
- même sonde Residency Pipeline de 40.6.408.

Les schedulers Secondary, TRADUS et Market Demand ne sont pas modifiés.

## Preuve attendue

Dans `RESIDENCY PIPELINE DIAGNOSTIC` :
- `queue_wait_ms` Strategy doit devenir quasi nul ;
- `yield_wait_ms` Strategy = 0 ;
- `sleep_wait_ms` Strategy = 0 ;
- `Strategy Core ready` doit fortement avancer si le diagnostic 40.6.408 était correct.

Les éventuels coûts `eval/load_event_ms` restants seront traités séparément seulement s'ils persistent.

## Test Firefox

1. Ctrl+F5.
2. Vérifier **Build 40.6.409 · Administrator**.
3. Ne pas ouvrir Evidence au premier boot.
4. Attendre la stabilisation.
5. Rapport de démarrage → Actualiser → Copier.
6. Envoyer `READINESS EVENT TRACE`, `POSTBOOT MODULE COST TRACE`, `RESIDENCY PIPELINE DIAGNOSTIC`, `TOP MARK GAPS`.

**STOP : aucune autre optimisation avant cette preuve.**
