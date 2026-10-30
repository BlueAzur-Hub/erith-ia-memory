# AGENT-CRYPTO 40.6.240 — COMMAND CENTER ROUTING COMPLETION

Date: 2026-09-18
Repository: `BlueAzur-Hub/erith-ia-memory`
Administrator: `public/agent_crypto_erith_ia/administrator/`
Release: **40.6.240**
Parent: **40.6.239**
Market Core: **38.15.11**
Mode: **PAPER ONLY**
Gate 3: **PENDING**
Gate 9: **LOCKED**

## Purpose

Complete routing for the existing Command Center.

No second navigation menu is created.

## Terrain basis

The Firefox screenshot supplied after 40.6.239 confirms:

- Build 40.6.239 active
- Market Core 38.15.11 active
- Binance 5/5
- the existing Command Center is visible and already serves as the canonical operator navigation surface
- the Graphique memorized-space strip reports `DB OK · LS ok`

Therefore 40.6.239 is closed on the normal localStorage path.

## Static Command Center audit

The canonical shell contains 19 direct quick-link routes.

Some targets exist directly in the shell.
Others are intentionally lazy or detached and are restored by current presentation owners.

The canonical `ErithPresentationLifecycle` already exposes:

`restoreForHash(hash)`

and already bridges hash navigation to detached-body restoration.

40.6.240 reuses this owner instead of creating a second lifecycle.

## New bounded router

File:

`js/command-center-routing-406240.js`

Responsibilities:

- preserve native quick-link href behavior
- observe existing Command Center route requests
- call `ErithPresentationLifecycle.restoreForHash`
- open ancestor `<details>` when needed
- allow lazy owners to settle for at most 10 animation frames
- resolve the real current target
- scroll to that target
- close the existing Command Center using its current close control
- report route success/failure through one diagnostic event

Diagnostic event:

`agent-crypto:command-center-route`

No route is allowed to create another navigation surface.

## Module picker

`atlasV2AdvancedModuleSelect` + `btnOpenAdvancedModule` use the same bounded route completion path.

Existing module owners remain authoritative.

## Protected surfaces

Unchanged:

- Market Core 38.15.11
- Web Classique
- Aether
- Atlas CURRENT
- Oracle
- Lecture Technique
- Strategy A business logic
- Gate state
- storage ownership
- real-order behavior

No recurring timer.
No MutationObserver.
No storage write.
No network owner.

## Commits

Command Center router:

`c28f2f7ea205cd78688dabdec826ee9fad671fd3`

Canonical load:

`ed3decd787d22e1175f180724942fa47988718ac`

Release manifest:

`23979af59df42e0931e53af71e875b6dfdbf27dd`

## Firefox proof required

Reload until:

`Build 40.6.240 · Administrator`

Then test:

1. Command Center → Graphique
2. Command Center → Lecture
3. Command Center → Mémoire
4. optionally Command Center → Sécurité or Tests

Expected behavior:

- current Command Center closes
- the existing target opens/restores if necessary
- the page lands on that target
- no duplicate panel appears

Stop after proof.
