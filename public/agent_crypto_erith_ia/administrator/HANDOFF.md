# HANDOFF — Agent-Crypto 40.6.482

## Current checkpoint
40.6.481 is terrain PASS and frozen as the Oracle Evidence read-recovery checkpoint.

40.6.482 adds only the cold-storage foundation.

## Operator terrain
Open Oracle → Evidence & validation.

A card must appear:
`MÉMOIRE FROIDE · GITHUB · 40.6.482`

Initial expected truth:
- Local = current Oracle Evidence count;
- Archived = 0;
- Chunks = 0;
- Transport = PENDING_SAFE_BRIDGE;
- local retention = forbidden.

Press:
1. **Lire manifest GitHub**
2. **Préparer 500 Evidence**
3. **Télécharger le lot**

Expected:
- one bounded bundle is created;
- SHA-256 visible;
- local Evidence count does not decrease.

## Stop rule
Do NOT implement browser GitHub credentials.
Do NOT purge IndexedDB.
Do NOT lower the 50 000 retention cap as a workaround.

## Next sister task
40.6.483 = safe local Bridge ingest:
transport bundle → validate → GitHub JSONL → manifest update → readback → SHA/count/parse proof.

Only a later build may introduce local retention after verified cold copies exist.
