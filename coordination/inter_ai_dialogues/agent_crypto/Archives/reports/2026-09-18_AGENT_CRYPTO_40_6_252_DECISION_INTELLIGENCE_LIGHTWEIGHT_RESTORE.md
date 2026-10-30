# AGENT-CRYPTO 40.6.252 — DECISION INTELLIGENCE LIGHTWEIGHT READ-ONLY RESTORE

Date: 2026-09-18
Release: **40.6.252**
Parent: **40.6.251**
Stability base: **40.6.251**
Last Firefox-proven pre-regression boundary: **40.6.242**
Market Core: **38.15.11**
Mode: **PAPER ONLY**
G3: **PENDING**
G9: **LOCKED**

## Goal

Restore the missing **Decision Intelligence · vérité courante** subsection without restoring the heavy 40.6.243 computation path that correlated with Firefox slowdown.

## Design

New active module:

`public/agent_crypto_erith_ia/administrator/js/decision-intelligence-current-truth-lite-406252.js`

The old heavy module remains preserved but is not loaded:

`js/decision-intelligence-current-truth-406243.js`

## Lightweight contract

The 40.6.252 surface:

- reads only already-rendered DOM truth;
- does not call EventMemory;
- does not call Historical Analogs;
- does not call Regime;
- does not call Calibration;
- does not call Capital Survival;
- does not call Decision Explainability;
- does not fetch;
- does not create timers;
- does not create observers;
- does not write storage;
- does not create an order;
- does not recreate its <details> wrapper.

Refresh occurs only when the user manually opens the disclosure, and only shallow DOM text is read.

## Honest degraded fields

During this recovery stage:

- Event can reflect already-rendered News→Market truth.
- Market confirmation can reflect already-rendered News→Market truth.
- Analogues = NON CALCULÉ.
- Régime = NON CALCULÉ.
- Calibration = NON CALCULÉ.
- Capital Survival = lecture seule / paper only.

No missing result is invented.

## Commits

- lightweight module: `20ee00ce91dc45ddd5d719b6f41f383f2ca90c29`
- canonical wiring: `c511acc5633eacd50d6dfa7236c20c77521eeb5c`
- release manifest: `81adb9b8faf311c9e6db8aacc0e58438ea7f5a2d`

## Static proof

- JavaScript syntax: PASS
- build.json parse: PASS
- active build: 40.6.252
- lightweight module loaded by index.html: YES
- heavy 40.6.243 module loaded by index.html: NO
- heavy owner API names in lightweight module: NONE
- timer: NONE
- observer: NONE
- fetch: NONE
- storage access: NONE

## Protected

Unchanged:

- Market Core 38.15.11
- Strategy A business logic
- News owner
- Atlas CURRENT
- Oracle
- Lecture Technique
- Aether
- Window Manager
- Web Classique
- current market archives

## Firefox acceptance

Wait for:

`Build 40.6.252 · Administrator`

Then:

1. hard reload once;
2. confirm ordinary scrolling is still responsive;
3. open **Decision Intelligence · vérité courante** once;
4. expected badge: **LÉGER**;
5. expected: no long computation, no Firefox slowdown banner;
6. close and reopen once.

A single screenshot of the opened lightweight panel is sufficient.

## Stop

Do not restore the 40.6.243 heavy current-truth engine until this lightweight surface is terrain-proven.
