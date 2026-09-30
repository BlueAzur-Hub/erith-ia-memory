# HANDOFF — Agent-Crypto 40.6.484

## Canonical checkpoint

**40.6.484 — ORACLE EVIDENCE EXISTING BRIDGE INTEGRATION**

40.6.483 is superseded before operator installation.

## Proven foundation

40.6.481:
- Firefox cursor recovery PASS.

40.6.482:
- real 500-row bundle PASS;
- SHA-256 `0492dd842d38040854d445d40f51e2030d43d474d6e934d65b8d3aed6871a66f`;
- 500 JSONL rows valid;
- local count not decreased;
- zero local purge.

## Local architecture

- Seven Vault 8780: independent.
- Atlas-10 Bridge 8787: trusted authenticated owner.
- Private Backend 8790: read-only market-source backend.
- no 8791 process.

## 40.6.484 owner map

Preparation:
`administrator/js/oracle-evidence-tiered-storage-foundation.js` (40.6.482 preserved)

Browser transport:
`administrator/js/oracle-evidence-existing-bridge-integration.js`

Trusted writer:
Atlas-10 Crypto Bridge V1.9.12 / 127.0.0.1:8787

Cold truth:
`data/oracle_evidence/manifest.json`

## Invariant

40.6.484 NEVER deletes local Evidence.

## Terrain sequence

R16 Bridge running
→ Administrator authenticated
→ Tester Bridge 8787
→ READY V1.9.12 / GitHub PRÊT
→ Envoyer 500 Evidence
→ Bridge validates and writes PENDING
→ exact GitHub readback
→ VERIFIED manifest commit
→ local count checked
→ published verifier after Pages propagation.

## Future

Do not start local retention merely because one chunk passes.

Require multiple VERIFIED chunks first, then measure actual Firefox Evidence size / RAM / IndexedDB pressure before defining a HOT window.
