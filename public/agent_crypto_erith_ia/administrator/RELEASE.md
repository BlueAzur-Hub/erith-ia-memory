# Agent-Crypto — Secondary Postboot Split Probe

Build **40.6.413** · parent **40.6.412** · rollback sain **40.6.407** · Market Core **38.15.11**.

## Preuve 40.6.412

La correction Decision Board a fonctionné :
- 2 rendus réels ;
- 25 différés ;
- 9 dédupliqués ;
- 0 erreur.

Le faux coût Strategy est également résolu : `strategy-a-canonical-spec.js` est revenu à ≈145 ms total.

Le postboot reste cependant long, avec cinq suspects principaux :
- `analysis-aux-demand-loader.js` ≈17,4 s ;
- `market-reading-depth.js` ≈8,6 s ;
- `layout-repair.js` ≈5,1 s ;
- `admin-theme-glass.js` ≈4,9 s ;
- `market-stack.js` ≈4,6 s.

## Changement unique 40.6.413

**Diagnostic seulement.**

Chaque suspect reçoit deux marqueurs sans modifier sa logique :
- `probe-script-eval-enter` ;
- `probe-script-eval-exit`.

Le rapport calcule ensuite :

`responseEnd → eval-enter → eval-exit → load-event`

Les cinq URLs postboot reçoivent uniquement un token de cache `40.6.413-probe` afin d'éviter une copie CDN antérieure pendant le test.

## Invariants

- Decision Board coalescing 40.6.412 conservé ;
- Market Core 38.15.11 inchangé ;
- Strategy métier inchangée ;
- Aether métier inchangé ;
- Oracle / Math / Lecture Technique inchangés ;
- aucun nouveau fetch métier ;
- aucun stockage ajouté ;
- aucun timer récurrent ;
- aucun MutationObserver ;
- aucun ordre réel.

## Test Firefox

1. Ctrl+F5.
2. Vérifier **Build 40.6.413 · Administrator**.
3. Utiliser souris / scroll normalement.
4. Ne pas ouvrir Evidence pendant le premier boot.
5. Attendre **Runtimes secondaires prêts**.
6. Rapport de démarrage → **Actualiser** → **Copier**.
7. Envoyer le rapport complet, surtout :
   - `SECONDARY SCRIPT RESPONSE / EVAL / LOAD SPLIT · 40.6.413`;
   - `POSTBOOT MODULE COST TRACE`;
   - `RESIDENCY PIPELINE DIAGNOSTIC`;
   - `READINESS EVENT TRACE`;
   - `TOP MARK GAPS`.

## Stop

**Aucune chirurgie secondaire avant cette preuve.**
