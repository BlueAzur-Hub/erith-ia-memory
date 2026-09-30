# HANDOFF — Agent-Crypto 40.6.486

## Canonical checkpoint entering this build

40.6.485 terrain PASS:
- Bridge V1.9.13 READY;
- GitHub local READY;
- one real 500-Evidence chunk VERIFIED;
- archived_rows = 500;
- chunks = 1;
- public readback = PUBLISHED_VERIFY_PASS;
- local Evidence count did not decrease.

## 40.6.486 mission

Remove the need for roughly 70 operator clicks.

## Queue model

At queue start:
1. fetch Bridge status and authoritative VERIFIED watermark;
2. count local Evidence;
3. snapshot the latest local row as a fixed target;
4. estimate current backlog = local rows - already archived rows.

Loop:
1. read next 500 rows after current watermark, never beyond startup target;
2. build proven 40.6.482 bundle schema;
3. POST to Bridge 8787;
4. require VERIFIED;
5. advance watermark from the verified bundle;
6. repeat.

## Important live-system rule

Rows produced after the startup target are not chased during the current pass. They remain local and are archived by a later pass.

## Pause / Stop semantics

Pause and Stop are **after current chunk** only.

No request is force-aborted while Bridge may be committing to GitHub.

## Resume

A fresh Start always resumes from the Bridge/GitHub VERIFIED watermark, not from browser memory.

## No-retention lock

40.6.486 still performs no local deletion.

Retention/HOT-window work remains a later project after multiple cold chunks are proven durable.
