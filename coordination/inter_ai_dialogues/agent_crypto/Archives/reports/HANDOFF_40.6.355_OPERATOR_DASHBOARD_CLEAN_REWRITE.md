# Agent-Crypto 40.6.355 — OPERATOR DASHBOARD CLEAN REWRITE

Date: 2026-09-22
Parent: **40.6.354**
Scope: **operator dashboard rewrite only**

## Terrain evidence
The 40.6.354 screenshots exposed a structural regression:
- when Kill was opened, the MINI Kill circle could remain visible below the open panel;
- visual behavior had drifted because the operator module accumulated successive CSS override layers from 40.6.346 through 40.6.354.

This was no longer a pixel-only issue.

## 40.6.355
The operator dashboard is rewritten as a clean single-authority module:
- one DOM structure;
- one CSS block;
- explicit mutually exclusive modes: NORMAL / MINI / HIDDEN;
- hard exclusivity so MINI cannot remain visible in NORMAL;
- Math and Kill MINI share one geometry authority;
- both MINI outer boxes = 104×104;
- both inner circles = 94×94;
- same bottom baseline and symmetric left/right offsets;
- Math ring remains proportional to the canonical Atlas Math score;
- Kill ring remains full 360° ruby with gold accent;
- Kill tactile grow remains x1.10 on active click;
- MINI + MINI remains the boot state;
- bounded Math hydration remains 30 × 500 ms max and stops when ready;
- hidden recall remains available per wing.

## Safety / ownership
No new computation or execution owner is introduced.
KILL SWITCH delegates only to the existing Auto A Paper owner:
- strategyAAutoStop() when resident;
- existing STOP controls as fallback.

No change to:
- administrator/app.js;
- Atlas Math computation;
- canonical #scoreRing implementation;
- Market Core 38.15.11;
- Graph;
- Storage;
- Aether;
- Oracle;
- Lecture Technique;
- Strategy thresholds;
- Gates;
- orders / wallet logic.

## Static acceptance
- V8 parse: **PASS**
- single dashboard style authority: **PASS**
- exclusive state contract: **PASS**
- Math canonical score percentage ring: **PASS**
- full Kill ring: **PASS**
- Kill owner preserved: **PASS**
- no new interval / observer / storage / network owner: **PASS**
- Firefox terrain: **PENDING**

## Firefox acceptance
1. fresh Ctrl+F5 → both wings MINI;
2. Math and Kill MINI visibly aligned;
3. Math ring percentage follows canonical score;
4. Kill ring is complete 360°;
5. click/press Kill produces only tactile grow before existing confirmation/action;
6. open Kill → MINI Kill disappears completely;
7. minimize Kill → open panel disappears completely;
8. same exclusivity for Math;
9. hide → only recall appears;
10. no duplicate / ghost circle remains anywhere.
