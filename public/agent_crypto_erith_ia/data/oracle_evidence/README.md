# Oracle Evidence · Cold Archive

Current integration build: **40.6.484**.

Architecture:
- Firefox / IndexedDB = HOT working memory.
- Atlas-10 Crypto Bridge **V1.9.12** on `127.0.0.1:8787` = authenticated transport owner.
- GitHub `data/oracle_evidence` = COLD durable memory.
- Notion = human control plane / handoff.
- Private Backend V1.4.2 on `127.0.0.1:8790` remains read-only and is not the archive writer.

## 40.6.482 terrain proof

The preparation foundation passed Firefox terrain:
- real 500-row bundle prepared and downloaded;
- SHA-256 `0492dd842d38040854d445d40f51e2030d43d474d6e934d65b8d3aed6871a66f`;
- 500 JSONL rows parsed;
- local Evidence count did not decrease;
- no local purge occurred.

## 40.6.483 disposition

40.6.483 introduced a standalone transport candidate on port 8791.

The operator did **not** install/use that candidate. After the real local architecture was re-read, this owner was superseded before terrain deployment.

40.6.484 removes the active 8791 owner and reuses the already-established Bridge 8787.

## 40.6.484 existing-Bridge contract

Browser:
1. uses the preserved 40.6.482 foundation to prepare 500 rows;
2. reuses the existing Administrator Bridge session token;
3. calls only `/oracle-evidence/status` and `/oracle-evidence/ingest` on 8787;
4. never receives a GitHub credential;
5. never deletes IndexedDB rows.

Bridge V1.9.12:
1. requires owner session + bounded capability;
2. validates schema / SHA-256 / row_count / IDs / T0 / watermark / JSONL;
3. commits JSONL chunk + `WRITTEN_PENDING_VERIFY` manifest atomically;
4. reads that exact GitHub commit back;
5. recomputes SHA-256 / row_count / JSON parsing;
6. commits manifest state `VERIFIED`.

## Retention remains locked

40.6.484 still does **not** release or delete local Evidence.

A later retention/HOT-window build is allowed only after multiple chunks are genuinely VERIFIED and the Firefox storage cost has been measured.
