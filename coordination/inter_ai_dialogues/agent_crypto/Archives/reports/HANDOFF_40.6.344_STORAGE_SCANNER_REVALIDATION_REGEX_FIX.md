# Agent-Crypto 40.6.344 — Scanner PRIMARY revalidation regex fix

Date: 2026-09-22
Parent runtime: **40.6.343**
Graph PRIMARY: **PASS / frozen**
Scanner PRIMARY: **sole target**
Market Core: **38.15.11 unchanged**
Aether: **40.6.322 frozen / unchanged**
Terrain: **PENDING Firefox Ryzen**

## Evidence from 40.6.343

Step 1 proved Scanner PRIMARY verified and the Scanner local copy retireable (~2.93 MiB). Graph localStorage was already absent and its PRIMARY remained verified.

Step 2 exported the complete localStorage backup first, then stopped with:
`STOP : Scanner PRIMARY non revalidé après fenêtre calme`.

The backup contains `agent_crypto_scanner_live_archive_v1` and does not contain the already-retired Graph cache.

## Root cause

40.6.343 successfully reached the Scanner quiet-window stage. The false STOP was caused only by the fresh verification RegExp:
- wrong: `/VÉRIFIÉ\\s*·\\s*IDB PRIMARY/i`
- correct: `/VÉRIFIÉ\s*·\s*IDB PRIMARY/i`

The wrong literal looked for a literal backslash-s sequence. The canonical state is `VÉRIFIÉ · IDB PRIMARY`, so fresh verification false-negative STOPped despite a valid PRIMARY.

## 40.6.344 fix

Only that fresh verification literal changes.
Everything else is unchanged:
- same Scanner quiet gate (1.2 s stable / 15 s bound);
- same fresh canonical copyTargets() call;
- same final Scanner-busy check;
- same canonical retireVerified();
- same backup-before-confirmation;
- same STOP-on-uncertainty;
- app.js unchanged;
- Graph untouched/frozen.

## Static gates

- 40.6.344 coordinator V8 parse: PASS;
- post-boot loader V8 parse: PASS;
- bad doubly escaped fresh regex: removed;
- correct whitespace regex used for prepare + fresh revalidation.

## Firefox terrain

1. confirm normal Build 40.6.344 boot;
2. Storage Primary Truth → step 1;
3. expect Scanner = sole retireable target ~2.93 MiB, Graph absent/local blocked;
4. step 2 → backup download → confirm;
5. expected Scanner = `RETIRÉ DU LOCALSTORAGE · IDB PRIMARY STABLE` + reread OK;
6. expected additional reclaim ~2.93 MiB;
7. Ctrl+F5;
8. verify Scanner + Graph + Livecheck + Oracle + DB + Atlas.

Any REFUS/STOP => no retry, no manual deletion.
