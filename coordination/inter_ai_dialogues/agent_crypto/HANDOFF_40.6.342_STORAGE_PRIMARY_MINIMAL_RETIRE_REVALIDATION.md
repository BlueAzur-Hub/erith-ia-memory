# Agent-Crypto 40.6.342 — Storage PRIMARY minimal retire revalidation

Date: 2026-09-22
Parent runtime: **40.6.340**
Rejected predecessor: **40.6.341**
Market Core: **38.15.11 unchanged**
Aether: **40.6.322 frozen / unchanged**
Terrain: **PENDING Firefox Ryzen**

## Why this build exists

40.6.341 was rejected because its broad Storage block replacement introduced a JavaScript syntax regression in `administrator/app.js`. The runtime was rolled back exactly to 40.6.340.

40.6.342 does not reuse that integration.

## Minimal repair

Only the async-primary branch inside:
`AtlasStorageRelief40278.retireVerified()`

is changed.

`schedulePut()` is unchanged.
`copyTargets()` is unchanged.
No new lock owner, DB, timer, observer or network request is added.

At retirement time the branch now:

1. waits up to 6 seconds for an already scheduled PRIMARY write to finish;
2. refuses if a write is still scheduled or a pending payload exists;
3. reads the current IndexedDB PRIMARY payload;
4. computes SHA-256;
5. writes a verified record for that exact current payload;
6. reads it back and recomputes SHA-256;
7. checks synchronously that no scheduled/pending write appeared;
8. removes only the matching localStorage backup;
9. immediately rereads through the PRIMARY mirror;
10. restores the local copy and refuses if the reread disagrees.

## Static gate before publication

- full `administrator/app.js` parsed successfully with V8 `new Function(source)`;
- exactly one `retireVerified()`;
- exactly one `schedulePut()`;
- exactly one `copyTargets()`;
- no orphan 40.6.341 `try {` fragment;
- 40.6.340 is the actual runtime parent.

## Protected invariants

- no IndexedDB schema change;
- no IndexedDB clear/delete;
- no generic localStorage cleanup;
- no automatic retirement;
- backup + confirmation remain operator requirements;
- Market REVIEW_REQUIRED untouched;
- Market Core 38.15.11 unchanged;
- Aether 40.6.322 unchanged;
- Oracle unchanged;
- Lecture Technique unchanged;
- Strategy A / Gates unchanged;
- PAPER ONLY / no real order / no wallet / no secret.

## Firefox terrain order

**Before touching Storage**, verify normal boot:
- Build 40.6.342;
- Prix live Binance 5/5;
- Veille loaded;
- Graph historical consultation loaded;
- Oracle/DB/Atlas normal.

Only if boot is healthy:

1. System → Storage Observatory;
2. run the understanding/verification step;
3. run Backup + retirer copies locales;
4. confirm only after backup export;
5. expect >0 bytes reclaimed only for stable proven targets;
6. reload Firefox;
7. verify Scanner/Graph consultation still works.

If any Storage target says REFUSÉ, stop. Do not force or manually delete.
