# Agent-Crypto 40.6.482 — ORACLE EVIDENCE TIERED STORAGE FOUNDATION

## Parent terrain
40.6.481 Firefox PASS:
- Evidence & validation recovered;
- 35 607 / 35 607 rows displayed;
- 5 732 resolved;
- 29 875 pending;
- no `serialized value is too large`.

## Goal
Introduce the safe foundation for:
- **HOT** browser memory = existing Oracle Evidence IndexedDB;
- **COLD** durable memory = GitHub `public/agent_crypto_erith_ia/data/oracle_evidence`;
- **CONTROL** = Notion;
- **TRANSPORT** = future authenticated local Bridge/backend.

## Runtime
New module:
`js/oracle-evidence-tiered-storage-foundation.js`

Operator-triggered capabilities:
- load GitHub cold manifest;
- count local Evidence;
- prepare next bounded local chunk using IndexedDB `t0` cursor;
- 500 rows default, 1000 hard max;
- serialize JSONL;
- SHA-256;
- row count + first/last T0 + first/last ID + watermark;
- download one transport bundle;
- verify a published cold chunk by SHA/count/JSON parse.

## Absolute safety locks
- no local Evidence deletion;
- no retention reduction;
- no IndexedDB schema change;
- no GitHub token in browser;
- no browser-to-GitHub write;
- no automatic upload;
- no timer;
- no observer;
- no Oracle Math/model change;
- no Strategy A/profile change;
- no Market Core 38.15.11 change;
- no real order.

## Next
40.6.483 should implement the trusted Bridge/backend ingest + cold readback verification.
It must still leave browser Evidence untouched.
