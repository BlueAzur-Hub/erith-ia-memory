# Agent-Crypto — Decision Board Boot Coalescing

Build **40.6.412** · parent **40.6.411** · rollback sain **40.6.407** · Market Core **38.15.11**.

## Preuve 40.6.411

La sonde a confirmé deux faits :

- `strategy-a-canonical-spec.js` ne consomme pas 16 s de JavaScript : réseau ≈ 161 ms, attente avant eval ≈ 16,2 s, eval réelle ≈ 0 ms ;
- `renderDecisionBoard()` est un propriétaire lourd réel : plusieurs passages synchrones observés autour de 1,2–1,4 s chacun.

## Correction unique 40.6.412

Le propriétaire final `renderDecisionBoard35` est enveloppé par un gate de présentation :

1. les rendus passifs Decision Board sont différés pendant le boot critique ;
2. un rendu en attente est libéré à `agent-crypto:strategy-core-ready` ;
3. `agent-crypto:postboot-runtime-ready` sert de fallback borné ;
4. après ouverture du gate, deux rendus passifs sur le même état sont dédupliqués ;
5. le bouton opérateur **Actualiser** force toujours un rendu immédiat.

La signature de déduplication suit le snapshot marché, l'actif sélectionné, la révision mémoire et les fingerprints CURRENT / Shared Synthesis.

## Invariants

- Market Core 38.15.11 inchangé ;
- Strategy métier inchangée ;
- Aether métier inchangé ;
- Oracle / Math / Lecture Technique inchangés ;
- aucun nouveau timer récurrent ;
- aucun MutationObserver ;
- aucun nouveau fetch ;
- aucun nouveau propriétaire de stockage ;
- aucun ordre réel.

## Diagnostic conservé

La sonde 40.6.411 est prolongée en **40.6.412** et ajoute :

- `DECISION BOARD COALESCING · 40.6.412` ;
- rendered / deferred / deduped / forced / errors ;
- état du gate Strategy / Postboot ;
- dernier coût de rendu.

Les traces `FUNCTION TIMINGS`, `SCRIPT RESPONSE / EVAL / LOAD SPLIT`, `POSTBOOT TIMER`, `READINESS EVENT TRACE` et `TOP MARK GAPS` restent disponibles.

## Test Firefox

1. Ctrl+F5.
2. Vérifier **Build 40.6.412 · Administrator**.
3. Utiliser souris / scroll normalement.
4. Ne pas ouvrir Evidence pendant le premier boot.
5. Attendre Strategy Core puis stabilisation.
6. Rapport de démarrage → **Actualiser** → **Copier**.
7. Envoyer le rapport complet.

## PASS attendu

- forte baisse du nombre de rendus Decision Board pendant le boot ;
- au plus un rendu de flush principal avant stabilisation, hors action opérateur ;
- réduction de la contention main-thread ;
- réduction de la dérive du timer Postboot ;
- aucun changement fonctionnel Market / Strategy / Aether.

**STOP après preuve Firefox.**
