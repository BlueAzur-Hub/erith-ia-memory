# HANDOFF — Agent-Crypto 40.6.485

## Checkpoint

40.6.485 — ORACLE EVIDENCE GITHUB TRANSPORT RESILIENCE.

## Reproduced terrain before repair

R16 / V1.9.12:
- Bridge READY;
- GitHub local READY;
- two ingest attempts;
- same failure: write operation timed out;
- archived_rows remained 0;
- chunks remained empty;
- local Evidence remained intact.

## Repair owner

Bridge R17 / V1.9.13:
- 180 s large-write timeout;
- one bounded retry;
- 120 s cold readback;
- >1 MiB readback through Git Blob;
- explicit timeout/network diagnostics.

Administrator 40.6.485:
- requires Bridge V1.9.13;
- allows 300 s for ingest response.

## Next terrain sequence

R17 running
→ Administrator authenticated
→ Tester Bridge 8787
→ READY V1.9.13
→ Envoyer 500 Evidence
→ require BRIDGE_8787_INGEST_VERIFIED
→ verify published chunk after Pages propagation
→ require PUBLISHED_VERIFY_PASS
→ local Evidence count must not decrease.

No HOT-window/retention work until real cold chunks are VERIFIED.
