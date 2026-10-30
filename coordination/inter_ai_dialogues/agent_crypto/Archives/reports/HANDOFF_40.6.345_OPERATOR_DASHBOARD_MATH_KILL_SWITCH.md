# Agent-Crypto 40.6.345 — Operator Dashboard · Math Core + Kill Switch

Parent: **40.6.344**
Terrain: **PENDING Firefox Ryzen**

## Requested operator surface
A floating, discreet but substantial dashboard:
- left: **MATH CORE**, sourced from the existing Math Core;
- right: explicit **KILL SWITCH**;
- NORMAL + MINI + HIDDEN;
- MINI = score only on the left; **KILL SWITCH + STOP + OUVRIR** on the right.

## Math truth
No new score is calculated. The module reads:
- `#scoreValue`
- `#scoreLabel`
- `#atlasMathContextLine`
- `#atlasHumanVerdict`

## Kill Switch truth
No new safety engine.
The STOP delegates to the already-existing Auto A Paper STOP owner:
`strategyAAutoStop()`, with DOM STOP fallbacks if the function is not yet resident.

Existing STOP semantics:
- Auto A scheduler disabled;
- its timer cancelled;
- session manual-stop owner preserved;
- a possible open Paper position is **not closed**;
- reading / monitoring remain available;
- no real order / wallet action.

If the canonical STOP owner is not resident, dashboard shows **INDISPONIBLE** and does not fabricate success.

## Protected
No modification of:
- administrator/app.js
- Strategy A thresholds / G3 / G9
- Safety Governor
- Market Core 38.15.11
- Graph
- Storage (PARKED)
- Aether .322
- Oracle
- Lecture Technique

## Static gate
- dashboard module V8 parse: PASS
- one script injection in canonical index
- no recurring timer / MutationObserver / storage owner / network request

## Terrain
1. normal boot;
2. Math wing mirrors the real score;
3. KILL SWITCH visible right;
4. MINI keeps score + KILL SWITCH + STOP + OUVRIR;
5. STOP confirmation;
6. if Auto A is resident, STOP state must become OFF/manual-stop while graph/Oracle/Atlas remain readable;
7. MASQUER leaves a reopen tab.

Rollback on boot regression: **40.6.344**.
