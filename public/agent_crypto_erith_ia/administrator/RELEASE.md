# Agent-Crypto 40.6.486 — ORACLE EVIDENCE AUTOMATIC SEQUENTIAL COLD ARCHIVE

## Why this build

40.6.485 validated the complete cold path with one real 500-Evidence chunk:

IndexedDB -> Bridge 8787 V1.9.13 -> GitHub cold archive -> VERIFIED manifest -> GitHub Pages -> published readback PASS.

The remaining usability problem was operational: roughly 35k local Evidence would require about 70 manual clicks at 500 rows per chunk.

40.6.486 automates that queue without weakening any safety lock.

## Behavior

One operator click:
- reads the authoritative Bridge VERIFIED watermark;
- snapshots the current last local Evidence as a fixed target;
- reads the next 500 local rows after the VERIFIED watermark;
- builds the same proven 40.6.482 transport bundle format;
- sends exactly one chunk to Bridge 8787;
- waits for VERIFIED;
- advances the in-memory watermark only after VERIFIED;
- repeats until the fixed target is reached.

New Evidence created while the queue is running are intentionally left for the next pass. This prevents an endless queue on a live system.

## Controls

- **Archiver automatiquement**
- **Pause après ce chunk**
- **Reprendre**
- **Arrêter après ce chunk**

Pause and Stop never abort an in-flight GitHub commit. They take effect only after the current chunk reaches a safe VERIFIED boundary.

## Resume

If the page is reloaded or the queue is stopped, the next start asks Bridge 8787 for the current GitHub VERIFIED watermark and resumes from there.

## Safety

- 500 rows per chunk;
- one chunk at a time;
- no parallel upload;
- VERIFIED required before next chunk;
- IndexedDB opened read-only;
- no local delete/clear/put;
- no GitHub token in browser;
- no browser GitHub write;
- no retention reduction;
- no storage schema change;
- no Strategy A / Oracle Math / Market Core change;
- no real order.

## Historical workflow hygiene

40.6.482 / .483 / .484 / .485 package workflows are now manual-only archives. They no longer relaunch and fail on every later Agent-Crypto build or Oracle Evidence runtime commit.

## Terrain

Start with Bridge V1.9.13 READY and Administrator authenticated.

Click **Archiver automatiquement** once.

Expected:
- progression advances chunk by chunk;
- every chunk ends VERIFIED before the next begins;
- Pause/Stop occur after safe chunk boundaries;
- local Evidence count never decreases;
- queue reaches AUTO_COMPLETE for the startup snapshot.

After the queue has finished and GitHub Pages catches up:
- read the manifest;
- verify the last published chunk once;
- require PUBLISHED_VERIFY_PASS.
