# Agent-Crypto 40.6.483 — ORACLE EVIDENCE SAFE BRIDGE INGEST + COLD VERIFY

## Parent

40.6.482 — ORACLE EVIDENCE TIERED STORAGE FOUNDATION.

The 40.6.482 browser/IndexedDB foundation is preserved as the chunk-preparation owner.

## Added

- `js/oracle-evidence-safe-bridge-ingest.js`
- `tools/oracle_evidence_cold_bridge.py`
- operator-triggered loopback Bridge at `127.0.0.1:8791`
- GitHub cold ingest with atomic chunk + pending-manifest commit
- independent GitHub readback before VERIFIED
- SHA-256 / row_count / JSONL / manifest-commit verification
- browser button to test Bridge, send the next 500 Evidence, and verify published cold data

## Preserved

- Market Core 38.15.11
- Strategy A business logic
- Solo Progression 1 000 EUR profile
- Oracle Math
- Aether
- Lecture Technique
- Web Classique
- Atlas CURRENT
- IndexedDB schema
- 40.6.481 cursor recovery
- 40.6.482 HOT/COLD foundation

## Safety

No GitHub token in browser.
No automatic upload.
No local Evidence delete.
No retention reduction.
No real order.

## Terrain

40.6.482 is frozen PASS after a real 500-Evidence bundle test.

40.6.483 requires operator terrain:
1. start the local Bridge;
2. click **Tester Bridge**;
3. click **Envoyer 500 au Bridge**;
4. require `VERIFIED`;
5. after Pages propagation, click **Vérifier dernier chunk publié**;
6. confirm the local Evidence count did not decrease.
