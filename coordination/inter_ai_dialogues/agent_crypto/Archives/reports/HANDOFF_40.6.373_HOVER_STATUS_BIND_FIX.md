# HANDOFF — Agent-Crypto 40.6.373

Runtime target: **40.6.373 — HOVER STATUS BIND FIX**

Screenshot diagnosis: the visible REDIVIDER was in NORMAL mode, but 40.6.372 had two defects:
1. hover listeners were installed only when opening confirmation;
2. target selectors excluded the NORMAL ring.

40.6.373 fixes both. No click should be necessary.

Terrain proof:
- hover visible NORMAL REDIVIDER -> status line appears above it;
- active text = 100% PRÊT / CHARGÉ / stopper;
- stopped text = COUPÉ / relancer;
- Math NORMAL/MINI hover works too;
- pointer leave hides the line.
