# Agent-Crypto 40.6.484 — ORACLE EVIDENCE EXISTING BRIDGE INTEGRATION

## Why 40.6.484

40.6.482 proved the HOT/COLD chunk foundation in Firefox.

40.6.483 created a standalone 8791 transport candidate, but the operator had not installed it. Re-reading the actual local architecture showed that Agent-Crypto already has an authenticated Atlas-10 Crypto Bridge on 8787 and a separate read-only Private Backend on 8790.

40.6.484 therefore corrects the architecture **before operator deployment**.

## Runtime truth

- Administrator: 40.6.484
- Market Core: 38.15.11
- Control Center: 2.3.2R16
- Atlas-10 Crypto Bridge: V1.9.12 · 127.0.0.1:8787
- Private Backend: V1.4.2 · 127.0.0.1:8790 · unchanged/read-only
- Seven Vault: 127.0.0.1:8780 · independent/outside scope

## Added

Browser owner:
`js/oracle-evidence-existing-bridge-integration.js`

Bridge capabilities:
- `oracle_evidence.read`
- `oracle_evidence.publish`

Bridge routes:
- `GET /oracle-evidence/status`
- `POST /oracle-evidence/ingest`

## Removed from active runtime

- standalone browser owner `js/oracle-evidence-safe-bridge-ingest.js`
- standalone local service `tools/oracle_evidence_cold_bridge.py`
- active port 8791 requirement

Historical 40.6.483 package artifacts remain historical evidence; they are not loaded by 40.6.484.

## Preserved

- 40.6.482 Oracle Evidence chunk-preparation foundation
- 40.6.481 cursor recovery
- Market Core 38.15.11
- Strategy A business logic / Solo Progression 1 000 EUR
- Oracle Math
- Atlas CURRENT
- Aether
- Lecture Technique
- Web Classique
- IndexedDB schema
- local Evidence rows
- Private Backend V1.4.2

## Safety

- no GitHub token in browser;
- no automatic upload;
- owner-only Bridge capability;
- no generic GitHub-write capability;
- no local Evidence delete;
- no retention reduction;
- no real order.

## Operator terrain

1. replace/start Control Center R16 / Bridge V1.9.12;
2. open Administrator 40.6.484 and authenticate normally;
3. Oracle → Evidence & validation;
4. **Tester Bridge 8787** → require READY V1.9.12 + GitHub local PRÊT;
5. **Envoyer 500 Evidence** → require VERIFIED;
6. after GitHub Pages propagation, **Vérifier dernier chunk publié** → require PASS;
7. local Evidence count must remain unchanged or higher.
