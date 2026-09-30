# Oracle Evidence · Cold Archive

Current transport build: **40.6.483**.

Architecture:
- Browser / IndexedDB = HOT working memory.
- GitHub `data/oracle_evidence` = COLD durable memory.
- Notion = human control plane / handoff.
- Local Bridge `127.0.0.1:8791` = authenticated operator-triggered transport.

## 40.6.482 terrain proof

The foundation passed Firefox terrain:
- a real 500-row bundle was prepared and downloaded;
- SHA-256: `0492dd842d38040854d445d40f51e2030d43d474d6e934d65b8d3aed6871a66f`;
- 500 JSONL rows parsed;
- the local Evidence counter did not decrease;
- no local purge occurred.

## 40.6.483 safety lock

40.6.483 adds the trusted local transport owner while preserving the 40.6.482 foundation.

The browser:
1. prepares a bounded bundle through the existing 40.6.482 foundation;
2. sends it only on an explicit operator click to `http://127.0.0.1:8791`;
3. never receives or stores a GitHub credential;
4. never deletes IndexedDB rows.

The Bridge:
1. validates bundle and chunk schemas;
2. recalculates SHA-256;
3. validates row_count, IDs, T0 and watermark;
4. atomically commits the JSONL chunk plus a `WRITTEN_PENDING_VERIFY` manifest entry;
5. reads the committed chunk back from GitHub;
6. recalculates SHA-256, row_count and JSON parsing;
7. commits the manifest entry as `VERIFIED`.

## Local Bridge

Owner:
`public/agent_crypto_erith_ia/tools/oracle_evidence_cold_bridge.py`

The Bridge binds to loopback only and resolves GitHub authentication server-side from:
- `ERITH_GITHUB_TOKEN`;
- `GITHUB_TOKEN`;
- or the local `gh auth token` credential.

Example:

`python public/agent_crypto_erith_ia/tools/oracle_evidence_cold_bridge.py serve`

No credential belongs in browser JavaScript or in this repository.

## Retention remains locked

40.6.483 still does **not** release or delete local Evidence.

A future 40.6.484 may consider a bounded HOT window only after multiple cold chunks are VERIFIED and only for rows covered by those verified chunks.
