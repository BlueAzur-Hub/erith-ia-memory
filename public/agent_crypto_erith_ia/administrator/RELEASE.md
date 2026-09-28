# Agent-Crypto 40.6.454 — STRATEGY EXPERIMENT CYCLE EVENT WIRING

## Objet unique
Raccorder l'événement `agent-crypto:strategy-a-experiment-cycle` au vrai propriétaire des cycles Auto A / Experiment Ledger.

## Cause prouvée
Les trois modules d'audit écoutaient déjà cet événement :
- `strategy-a-cost-wait-outcome-audit.js` ;
- `strategy-a-oracle-cost-calibration-audit.js` ;
- `strategy-a-execution-cost-truth.js`.

Le vrai cycle était bien produit par `strategyAAutoCycle()` puis enregistré par `strategyAExperimentRecord()`, mais aucun producteur courant n'émettait l'événement après l'enregistrement du cycle.

## Correction
Propriétaire unique modifié : `app.js`.

Après ajout du vrai cycle au ledger et tentative de persistance existante, `strategyAExperimentRecord()` émet exactement une fois `agent-crypto:strategy-a-experiment-cycle`.

Le détail expose seulement : `cycle_id`, `cycle_number`, `captured_at`, `trigger`, `phase`, `persisted`, `build`.

La panne éventuelle de localStorage n'empêche pas la notification d'un cycle déjà présent dans le ledger runtime ; le champ `persisted` indique la réussite de la persistance existante.

## Invariants
Aucun nouveau timer, observer, fetch, WebSocket, stockage, ordre, seuil Strategy, Cost Gate, Oracle, Risk, Paper, Backend, Aether ou Market Core 38.15.11.

## Checkpoint parent
40.6.453 est désormais PASS terrain.
