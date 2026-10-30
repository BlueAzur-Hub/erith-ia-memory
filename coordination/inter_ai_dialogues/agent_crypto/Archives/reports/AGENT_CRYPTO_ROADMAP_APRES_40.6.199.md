# AGENT-CRYPTO — ROADMAP IMMÉDIATE APRÈS 40.6.199

## STOP POINT ACTUEL
Ne pas construire 40.6.200 avant d'avoir lu le panneau `G3 · CASCADE CHECKPOINT · 40.6.199`.

## Arbre de décision

### TEMPORAL_WINDOW_NOT_CERTIFIED
→ .200 = correctif unique du contrat temporel / owner prouvé.

### NO_CERTIFIED_T0_DECISION
→ .200 = capture prospective t0 dans Experiment Ledger.
→ .201 = receipt terrain d'un nouveau cycle.
→ .202 = recheck dataset.

### NO_T0_DECISION_INSIDE_CERTIFIED_WINDOW
→ attendre un cycle naturel dans la fenêtre, sauf bug timestamp prouvé.

### READY_FOR_DECISION_REPLAY
→ .200 = Post-Horizon Outcome Owner.
→ .201 = Execution + Cost Model.
→ .202 = Net Economic Replay.
→ .203 = Acceptance Receipt / G4 Handoff.

## Interdits
- aucun backfill ;
- aucun lookahead ;
- aucun Oracle actuel appliqué au passé ;
- aucun faux PASS ;
- aucun ordre réel ;
- G9 reste LOCKED ;
- Market Core 38.15.11 protégé.
