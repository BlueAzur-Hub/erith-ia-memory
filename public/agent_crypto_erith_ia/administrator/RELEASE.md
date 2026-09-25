# Agent-Crypto — Aether-First Strategy Scheduler

Build **40.6.410** · parent **40.6.409** · rollback sain **40.6.407** · Market Core **38.15.11**.

## Pourquoi

40.6.409 a supprimé la starvation Strategy : les 8 modules sont passés à queue/yield/sleep quasi nuls et Strategy Core a avancé à ~37,5 s.

Mais cette priorité a retardé le cockpit : Aether est passé à ~176,8 s et Consultation est restée incomplète pendant le boot.

## Correction unique

Strategy reste **100 % automatique**, mais ne démarre plus au `DOMContentLoaded`.

Le démarrage se fait par la chaîne existante :

`Aether ready → scheduleAfterAether → start() → loadStrategyCoreNow(postboot-join)`

Entre les 8 modules Strategy Core :
- même ordre ;
- même `loadOne()` séquentiel ;
- aucun `requestIdleCallback` ;
- aucun `sleep(18)` ;
- une seule frontière de tâche `MessageChannel` entre deux modules.

## Invariants

- Strategy métier inchangée ;
- Auto A inchangé ;
- Cost Gate / Risk Governor / Paper inchangés ;
- Simulation / Evidence inchangés ;
- Secondary / TRADUS / Market Demand inchangés ;
- Market Core 38.15.11 inchangé ;
- sonde Residency Pipeline conservée.

## PASS attendu

- Consultation / Aether redeviennent disponibles avant Strategy ;
- Strategy démarre automatiquement ensuite ;
- `queue_wait_ms` Strategy reste borné ;
- `sleep_wait_ms = 0` ;
- pas de retour aux dizaines de secondes de `requestIdleCallback` ;
- aucune régression fonctionnelle.

## Test Firefox

1. Ctrl+F5.
2. Vérifier **Build 40.6.410 · Administrator**.
3. Ne pas ouvrir Evidence au premier boot.
4. Utiliser l'interface normalement et attendre stabilisation.
5. Rapport de démarrage → Actualiser → Copier.
6. Envoyer `READINESS EVENT TRACE`, `POSTBOOT MODULE COST TRACE`, `RESIDENCY PIPELINE DIAGNOSTIC`, `TOP MARK GAPS`.

**Aucune 40.6.411 avant analyse terrain 40.6.410.**
