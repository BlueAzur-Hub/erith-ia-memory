# AGENT-CRYPTO 40.6.249 — DECISION INTELLIGENCE NON-DESTRUCTIVE REFRESH LOCK

Date: 2026-09-18
Release: **40.6.249**
Parent: **40.6.248**
Market Core: **38.15.11**
Mode: **PAPER ONLY**
G3: **PENDING**
G9: **LOCKED**

## Context

Firefox terrain on 40.6.248 reported a page-slowdown state while **Decision Intelligence · vérité courante** was open.

40.6.247 remains the last confirmed Firefox terrain PASS baseline.

## Root cause

The 40.6.248 repair added an explicit-open refresh to the existing Decision Intelligence `<details>` owner.

The same `toggle` event called `refresh()`, while `refresh()` removed the open `<details>`, recreated it, restored `open=true`, and rebound the same toggle handler.

That creates a local re-entry / refresh-loop risk:

`toggle → refresh → remove details → recreate open details → toggle → refresh → ...`

The expensive current-truth snapshot chain was therefore repeatedly recomputed on the Firefox main thread.

## Repair

Modified:

- `public/agent_crypto_erith_ia/administrator/js/decision-intelligence-current-truth-406243.js`
- `public/agent_crypto_erith_ia/administrator/build.json`

The 40.6.248 Version Truth acceptance fix is preserved unchanged.

The Decision Intelligence wrapper is now stable:

- the `<details>` node is never destroyed by its own refresh;
- opening the panel still requests a fresh current-truth snapshot;
- only `#decisionIntelligenceCurrentTruth406243` is replaced in place;
- open / closed state is therefore not re-triggered by reconstruction.

## Commits

- Runtime repair: `2f6ae1ec83829e04a0111cfe863e9e0e29a67567`
- Release manifest: `c33dd500a455c45be6d3402b29c97bc0ff3a55e9`

## Static proof

- JavaScript syntax: **PASS**
- build.json parse: **PASS**
- build: **40.6.249**
- parent: **40.6.248**
- destructive `details.remove()`: **absent**
- in-place host refresh: **present**
- new timer: **none**
- new observer: **none**

## Protected

Unchanged:

- Market Core 38.15.11
- Web Classique
- Window Manager
- Aether
- News source owner
- Atlas CURRENT
- Oracle
- Lecture Technique
- Strategy A business logic
- Gate state
- Decision Intelligence acceptance contract from 40.6.248

No new fetch.
No timer.
No observer.
No storage owner.
No order.

## Firefox proof

Reload until:

`Build 40.6.249 · Administrator`

Then open only:

`Analyse & décision → Decision Intelligence · vérité courante`

Expected:

1. panel opens normally;
2. no Firefox “Cette page ralentit Firefox” loop;
3. page remains scrollable;
4. collapse / reopen the panel two or three times;
5. Decision Intelligence remains responsive and recomputes its current-truth cards.

One screenshot of this panel is sufficient.
