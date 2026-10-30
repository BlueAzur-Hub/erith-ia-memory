# Agent-Crypto 40.6.341 — Storage PRIMARY stable retirement

Date: 2026-09-22
Parent: 40.6.340
Market Core: 38.15.11 unchanged
Aether: 40.6.322 frozen / unchanged
Safe frozen global checkpoint: 40.6.336
Terrain: PENDING Firefox Ryzen

## Proven cause repaired

The canonical Storage Relief owner in `administrator/app.js` allowed this sequence:

1. async-primary write scheduled with `verified:false`;
2. operator `copyTargets()` marks the IDB record verified;
3. an already queued async write can land after that proof and restore `verified:false`;
4. `retireVerified()` then refuses both targets.

This matches the recorded .289 terrain: PRIMARY 2/2 followed by 0 B reclaimed and `REFUSÉ · IDB PRIMARY NON VÉRIFIÉ`.

## Bounded repair

40.6.341 changes only the existing canonical Storage Relief owner.

For each async-primary target during operator verify/retire:

- take a per-key PRIMARY lock;
- let any already running deferred write finish;
- keep new writes in the existing pending slot while the lock is held;
- flush the newest pending payload into IndexedDB;
- compute SHA-256;
- read the payload back from IndexedDB;
- write/read the verified record;
- if another write arrived during any await, repeat before proceeding;
- on retirement, remove localStorage only after a stable proof and in the same synchronous window;
- reread through the PRIMARY mirror immediately after removal;
- if reread is inconsistent, restore the local copy and report refusal;
- release the lock and resume any write that arrived after the stable window.

Maximum stabilization attempts are bounded. No background loop is added.

## Protected invariants

- no IndexedDB schema change;
- no IndexedDB delete/clear;
- no generic localStorage cleanup;
- no automatic retirement;
- full backup + browser confirmation remain required by the .289 operator surface;
- Market REVIEW_REQUIRED keys untouched;
- Market Core 38.15.11 unchanged;
- Aether 40.6.322 unchanged;
- Oracle unchanged;
- Lecture Technique unchanged;
- Strategy A / Gates unchanged;
- PAPER ONLY / no real order / no wallet / no secret.

## Firefox terrain proof requested

System → Storage Observatory:

1. click **1 · Comprendre / vérifier**;
2. expect both targets: **VÉRIFIÉ · IDB PRIMARY STABLE**;
3. click **2 · Backup + retirer copies locales**;
4. confirm only after the backup download appears;
5. expect reclaimed localStorage bytes **> 0** and both targets **RETIRÉ DU LOCALSTORAGE · IDB PRIMARY STABLE**;
6. reload Firefox;
7. verify Scanner / Graph consultation still works and Storage remains reduced.

If any target says REFUSÉ, stop. Do not retry by force and do not manually delete a key.
