# HANDOFF — Agent-Crypto 40.6.476

## Objet unique

Empêcher la disparition du panneau PROSPECTIVE après les rerenders de présentation, sans modifier sa plomberie métier.

## Firefox

1. Ctrl+F5.
2. Vérifier **Build 40.6.476 · Administrator**.
3. Section 04 → Simulation.
4. Vérifier **STRATEGY A · PROSPECTIVE OUTCOME + OKX COST EVIDENCE · 40.6.476**.
5. Le panneau doit apparaître juste après **EXECUTION COST EVIDENCE CAPTURE · 40.6.469**.
6. Ligne **Montage** : ancre attendue `strategyAExecutionCostEvidenceCapture`.
7. Laisser passer au moins un cycle Auto A et une actualisation de présentation.
8. Le panneau doit rester présent ; s'il a été retiré par un rerender, `réparations` doit augmenter et le panneau doit revenir automatiquement.

La plomberie .475 reste attendue :
- event = résolu ;
- mode `LEDGER_BY_ID` ;
- erreur `—`.

Aucun COST_GATE_WAIT n'est requis pour tester le montage.
