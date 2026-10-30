# Agent-Crypto 40.6.347 — Operator dashboard docked three-quarter wings

Date: 2026-09-22
Parent: **40.6.346**
Scope: **presentation only**

## Terrain request
Christophe asked for:
- truly round, aligned header controls;
- Math Core bottom-left and Kill Switch bottom-right;
- mini/hidden controls partly tucked into side + bottom edges;
- roughly three quarters of the mini circle visible;
- permanent recall after hiding;
- visible action label **KILL SWITCH**, not STOP.

## 40.6.347
- both header control pairs are fixed 36×36 true circles in a common grid;
- Math MINI docks at left/bottom, partly off-screen;
- Kill MINI docks at right/bottom, partly off-screen;
- hidden state leaves a permanent circular recall peeking from the same edge;
- hover brings the peeking recall inward; click restores the wing;
- the red action surface displays **KILL SWITCH** only;
- action still delegates to the existing Auto A Paper stop owner.

## Protected
No change to app.js, Math computation, Market Core 38.15.11, Graph, Storage, Aether, Oracle, Lecture Technique, Strategy thresholds, Gates, order or wallet logic.

## Static gate
V8 parse: PASS.
No visible >STOP< dashboard markup remains.

## Firefox acceptance
1. boot normally;
2. verify round controls aligned;
3. MINI Math and Kill sit partly outside lower side edges;
4. hidden state never loses recall;
5. click recall restores corresponding wing;
6. red action says KILL SWITCH only.
