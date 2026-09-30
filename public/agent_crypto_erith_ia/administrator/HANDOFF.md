# HANDOFF — Agent-Crypto 40.6.483

## Canonical checkpoint

**40.6.483 — ORACLE EVIDENCE SAFE BRIDGE INGEST + COLD VERIFY**

Parent: 40.6.482.

## Proven before this build

40.6.481 Firefox PASS:
- cursor reader restored full Evidence access;
- no `serialized value is too large`.

40.6.482 Firefox PASS:
- real 500-Evidence transport bundle produced;
- SHA-256 `0492dd842d38040854d445d40f51e2030d43d474d6e934d65b8d3aed6871a66f`;
- 500 JSONL rows valid;
- local Evidence count did not decrease;
- no local purge.

## 40.6.483 mission

Add a trusted local write owner without moving GitHub credentials into the public browser.

Browser -> loopback Bridge -> GitHub cold storage.

## Required invariant

40.6.483 still NEVER deletes local Evidence.

## Operator test

1. Start `tools/oracle_evidence_cold_bridge.py serve`.
2. Oracle -> Evidence & validation.
3. In **BRIDGE SÛR · GITHUB COLD VERIFY · 40.6.483**, click **Tester Bridge**.
4. Require Bridge READY and GitHub auth PRÊTE.
5. Click **Envoyer 500 au Bridge**.
6. Require `BRIDGE_INGEST_VERIFIED`.
7. Record write commit + verify commit.
8. After GitHub Pages propagation, click **Vérifier dernier chunk publié**.
9. Require `PUBLISHED_VERIFY_PASS`.
10. Confirm local Evidence count has not decreased.

## Next scope only after multiple VERIFIED chunks

40.6.484 — VERIFIED LOCAL RETENTION / HOT WINDOW.

Do not invent the HOT window size.
Measure average Evidence storage cost and Firefox memory first.
