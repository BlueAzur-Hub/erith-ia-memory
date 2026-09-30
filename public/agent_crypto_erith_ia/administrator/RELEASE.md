# Agent-Crypto 40.6.487 — ORACLE EVIDENCE AUTO ARCHIVE SAFETY GATES

## Why 40.6.487

40.6.485 proved the full cold path with one real 500-Evidence chunk and public readback PASS.

40.6.486 introduced the automatic sequential queue, but before asking the operator to archive tens of thousands of rows, the Astra audit identified three safety requirements that must be explicit:

1. READY must require Bridge Oracle Evidence `enabled=true`;
2. only one archive owner may be active at a time;
3. public proof must verify the exact receipt produced by the current archive session, not an arbitrary latest VERIFIED row.

40.6.487 adds those gates before terrain automation.

## Runtime

- Administrator: 40.6.487
- Bridge: Atlas-10 Crypto Bridge V1.9.13 on 127.0.0.1:8787
- Private Backend: V1.4.2 on 127.0.0.1:8790, unchanged/read-only
- Seven Vault: 127.0.0.1:8780, independent
- chunk size: 500
- source bundle schema/build: proven 40.6.482 contract

## Automatic queue

One click on **Archiver automatiquement**:
- checks Bridge V1.9.13 and `enabled=true`;
- reads the GitHub VERIFIED watermark through Bridge status;
- freezes the latest local Evidence as the target for the pass;
- reads the next 500 rows after the watermark;
- sends exactly one chunk;
- requires VERIFIED;
- advances the in-memory watermark only after VERIFIED;
- continues sequentially until the frozen target is reached.

Rows created after Start are intentionally deferred to the next pass.

## Concurrency lock

Manual and automatic archive owners share:
`__ATLAS_ORACLE_EVIDENCE_ARCHIVE_LOCK__`

The AUTO panel disables the manual 500-row button.

The manual owner also refuses mass archive after bootstrap once Bridge reports archived rows > 0.

## Exact public proof

The final public verification is bound to the exact receipt from the current session:
- relative_path match;
- SHA-256 match;
- row_count match;
- status VERIFIED;
- public JSONL re-read and verified.

Success state:
`FINAL_PUBLIC_EXACT_VERIFY_PASS`

The legacy manual surface also verifies an exact receipt:
`PUBLISHED_EXACT_VERIFY_PASS`

## Pause / Stop

Pause and Stop take effect only after the current in-flight chunk finishes at a safe boundary.

No GitHub request is force-aborted mid-commit.

## Resume

After reload/stop, a new Start obtains the current Bridge/GitHub VERIFIED watermark and resumes from there.

## Historical CI cleanup

Broad historical package workflows 40.6.477 and 40.6.481-.486 are manual-only archives.

They no longer generate irrelevant failures when a later build updates index/build/runtime files.

## Safety

- no IndexedDB delete/clear/put;
- local DB opened read-only;
- no local retention reduction;
- no browser GitHub credential;
- no browser GitHub write;
- no parallel upload;
- Market Core 38.15.11 unchanged;
- Strategy A unchanged;
- Oracle Math unchanged;
- no real order.
