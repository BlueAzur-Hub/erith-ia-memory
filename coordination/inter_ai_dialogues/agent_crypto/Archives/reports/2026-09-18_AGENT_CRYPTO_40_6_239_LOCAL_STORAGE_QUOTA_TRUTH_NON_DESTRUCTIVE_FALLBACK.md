# AGENT-CRYPTO 40.6.239 — LOCAL STORAGE QUOTA TRUTH / NON-DESTRUCTIVE VOLATILE FALLBACK

Date: 2026-09-18  
Repository: `BlueAzur-Hub/erith-ia-memory`  
Administrator: `public/agent_crypto_erith_ia/administrator/`  
Release: **40.6.239**  
Parent: **40.6.238**  
Market Core: **38.15.11**  
Mode: **PAPER ONLY**  
Gate 3: **PENDING**  
Gate 9: **LOCKED**

## 1. Terrain trigger

The Firefox proof for 40.6.238 shows:

- Build 40.6.238 active
- Market Core 38.15.11 active
- Binance LIVE 5/5
- Graph Context V7: DB OK
- localStorage: `QuotaExceededError`

The quota warning is therefore treated as a real degraded-storage fact.

## 2. Existing contract recovered

Current runtime code already contains consumers of:

`globalThis.AtlasStorageRelief.readSync`

and:

`globalThis.AtlasStorageRelief.writeSync`

with direct localStorage fallback when no producer exists.

40.6.239 restores one stable producer before runtime execution.

It does not restore a historical heavy migration system.

## 3. New bounded owner

File:

`js/storage-quota-truth-406239.js`

Contract:

`AtlasStorageRelief`

Primary persistence remains:

`localStorage`

### Normal path

If localStorage accepts the write:

- value is written normally
- volatile shadow is removed
- persistence remains unchanged

### Quota path

If the browser raises QuotaExceededError:

- no existing key is deleted
- no cache is purged
- no IndexedDB migration is started
- the attempted value is retained in a volatile in-memory Map for the current page session
- same-session `readSync` returns that volatile value
- the API returns false for persistence success
- the UI may report `LS QUOTA · fallback session`

The fallback deliberately makes no persistence-across-reload claim.

## 4. Window Manager

`js/core/admin-window-manager.js` now routes its storage helpers through the stable AtlasStorageRelief contract when available.

This allows current-session window state to remain coherent under quota pressure without deleting operator state.

No Window Manager geometry policy or membership logic is changed.

## 5. Canonical boot order

`administrator/index.html` injects:

`./js/storage-quota-truth-406239.js`

into the runtime shell head before the normal runtime scripts execute.

The module is therefore available to existing AtlasStorageRelief consumers before their fallback paths are evaluated.

## 6. Protected surfaces

Unchanged:

- Market Core 38.15.11
- Web Classique
- Aether
- Atlas CURRENT
- Oracle
- Lecture Technique
- Strategy A business logic
- Gate states
- real-order behavior

## 7. Storage safety

40.6.239 adds:

- no IndexedDB schema
- no IndexedDB store
- no IndexedDB PUT
- no IndexedDB DELETE
- no IndexedDB CLEAR
- no automatic localStorage deletion
- no automatic retirement plan
- no recurring timer
- no MutationObserver
- no network request

This is a non-destructive degraded-mode continuity layer only.

## 8. 40.6.238 closure

The supplied Firefox export proves the 40.6.238 presentation single-owner behavior:

- one G3 era map
- settled mount reason
- no duplicate evidence surface
- Atlas / Oracle runtime still active

The 40.6.238 orchestration debt is closed.

## 9. Commits

Storage quota guard:

`b12ee068e962a4b92ee2bbad8dd270eb4faf6423`

Canonical early-load routing:

`2580d4a15912cd7c2249b6877cb8a79bd807d357`

Window Manager storage routing:

`555671f974e1dd5fa20789690041f4fce348a800`

Release manifest:

`076a4fa5f209a0203ebac800471c410aef101beb`

## 10. Firefox proof required

Reload until:

`Build 40.6.239 · Administrator`

Then verify:

1. Graph/Workspace area;
2. if quota remains full, expected wording is controlled degraded truth such as `LS QUOTA · fallback session`, not an unexplained raw failure;
3. open System / Storage Health and inspect the localStorage probe;
4. move/minimize/restore one Administrator window during the same page session;
5. do not trigger any storage deletion/retirement action;
6. export one Firefox markdown proof.

A reload is allowed after this same-session check, but volatile-only writes are not expected to survive that reload.

Stop after proof.
