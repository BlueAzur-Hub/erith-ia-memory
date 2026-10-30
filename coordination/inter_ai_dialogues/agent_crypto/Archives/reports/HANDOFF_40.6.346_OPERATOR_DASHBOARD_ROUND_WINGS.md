# Agent-Crypto 40.6.346 — Operator Dashboard · Round Independent Wings

Date: 2026-09-22
Parent runtime: **40.6.345**
Market Core: **38.15.11 unchanged**
Aether: **40.6.322 frozen / unchanged**
Storage: **PARKED / unchanged**
Terrain: **PENDING Firefox Ryzen**

## Operator feedback
- controls must be genuinely round;
- Math and Kill must not disappear together;
- hiding a wing must leave an obvious recall;
- the generic `TABLEAU DE BORD · OUVRIR` strip is rejected.

## 40.6.346
### Math left
- NORMAL: round score orb + canonical label/context/verdict;
- round `−` = MINI; round `×` = HIDE;
- MINI: round MATH CORE score control, click to reopen;
- HIDDEN: permanent round `MATH CORE` recall on left.

### Kill right
- NORMAL: explicit KILL SWITCH + state/PAPER ONLY + large round STOP;
- round `−` = MINI; round `×` = HIDE;
- MINI: large round KILL SWITCH / STOP + small round reopen arrow;
- HIDDEN: permanent round `KILL SWITCH` recall on right.

## Invariants
- Math computes nothing new;
- STOP delegates only to existing Auto A Paper stop owner;
- no app.js / Market Core / Graph / Storage / Aether / Oracle / Lecture Technique / thresholds / Gates change;
- no recurring timer / MutationObserver / new storage / real order / wallet.

## Static gate
`operator-dashboard-406346.js` V8 parse: **PASS**.

## Firefox terrain
1. normal boot 40.6.346;
2. round controls visible;
3. Math mini round score → reopen;
4. Kill mini round KILL SWITCH / STOP → arrow reopens;
5. hide Math → round MATH CORE recall remains;
6. hide Kill → round KILL SWITCH recall remains;
7. old global TABLEAU DE BORD OUVRIR strip absent;
8. STOP behavior need not be triggered for presentation validation.

If a hide action leaves no recall: **FAIL / STOP**.