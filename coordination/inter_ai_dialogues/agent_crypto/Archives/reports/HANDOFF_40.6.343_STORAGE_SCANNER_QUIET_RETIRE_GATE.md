# Agent-Crypto 40.6.343 — Scanner PRIMARY quiet retire gate

Date: 2026-09-22
Parent runtime: **40.6.342**
Market Core: **38.15.11 unchanged**
Aether: **40.6.322 frozen / unchanged**
Graph PRIMARY: **PASS terrain on 40.6.342 — frozen**
Scanner PRIMARY: **target of this build only**
Terrain: **PENDING Firefox Ryzen**

## Terrain fact from 40.6.342

Storage Primary Truth proved both PRIMARY records readable and valid.
The operator-triggered retirement then produced:
- graph cache: **RETIRÉ DU LOCALSTORAGE · IDB PRIMARY STABLE**, reread OK;
- Scanner archive: **REFUSÉ · IDB PRIMARY NON STABLE**, reread OK;
- localStorage reclaimed: **719.9 KiB**;
- after Ctrl+F5, Graph/Livecheck/Oracle/DB/Atlas returned normally.

Therefore Graph is finished and must not be touched again.

## Root cause narrowed

Scanner has an upstream persistence owner separate from AtlasStorageRelief:
`AtlasScannerPersistence 40.4.62`.

It coalesces archive writes in `persistQueue40462` and `persistScheduled40462`.
40.6.342 guarded only the downstream Storage Relief queue, so a Scanner archive write could remain queued upstream while downstream PRIMARY verification was occurring.

## 40.6.343 repair

**No app.js modification. No Graph modification.**

New module: `js/storage-primary-truth-406343.js`.

The operator-only retirement coordinator:
1. waits until `AtlasScannerPersistence.snapshot()` reports the Scanner archive absent from both `queued_keys` and `scheduled_keys`;
2. requires that quiet state for **1.2 s**, bounded by **15 s**;
3. re-runs canonical `AtlasStorageRelief40278.copyTargets()`;
4. checks Scanner persistence again immediately before retirement;
5. delegates actual removal to unchanged `AtlasStorageRelief40278.retireVerified()`;
6. renewed Scanner activity => **STOP / no deletion**.

## Static gates

- coordinator parses with V8 `new Function(source)`;
- post-boot loader parses with V8;
- `administrator/app.js` unchanged from 40.6.342.

## Protected invariants

Graph PRIMARY PASS/frozen; no generic cleanup; no IndexedDB clear/delete/schema change; no automatic retirement; backup + confirmation mandatory; Market REVIEW_REQUIRED untouched; Market Core / Aether / Oracle / Lecture Technique / Strategy / Gates unchanged; PAPER ONLY.

## Firefox terrain

1. confirm normal Build 40.6.343 boot;
2. Storage Primary Truth → **1 · Comprendre / vérifier**;
3. Graph should already be absent locally; Scanner PRIMARY verified;
4. **2 · Backup + retirer copies locales**;
5. expected Scanner: `RETIRÉ DU LOCALSTORAGE · IDB PRIMARY STABLE` + reread OK;
6. expect roughly **2.93 MiB** additional localStorage reclaimed;
7. Ctrl+F5;
8. verify Scanner + Graph + Livecheck + Oracle + DB + Atlas normal.

If Scanner reports REFUSÉ: STOP, no retry/manual deletion.
