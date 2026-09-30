# Agent-Crypto 40.6.485 — ORACLE EVIDENCE GITHUB TRANSPORT RESILIENCE

## Trigger

40.6.484 / Bridge V1.9.12 reached READY with GitHub local credential READY, but two real 500-Evidence ingest attempts failed on a GitHub write timeout.

No cold chunk was verified and no local Evidence was deleted.

## Correction

- Bridge target: V1.9.13 / Control Center 2.3.2R17.
- Browser ingest wait: 300 s.
- GitHub large blob write timeout: 180 s.
- One bounded retry on timeout/network failure.
- GitHub cold readback timeout: 120 s.
- Chunks >1 MiB are re-read through Git Blob after object-metadata lookup.
- Exhausted failures use explicit GITHUB_TIMEOUT / GITHUB_NETWORK_ERROR diagnostics.

## Preserved

40.6.482 preparation foundation.
Bridge 8787 architecture.
Private Backend V1.4.2 on 8790 read-only.
Seven Vault 8780 independent.
Market Core 38.15.11.
Strategy A.
Oracle Math.
IndexedDB schema and retention.
No real order.

## Terrain

Install/start R17 / Bridge V1.9.13, authenticate normally, test Bridge 8787, then send the same 500-Evidence lot. Success requires VERIFIED and no decrease of local Evidence.
