# Agent-Crypto 40.6.348 — Operator Dashboard Glass Compact

Date: 2026-09-22
Parent: **40.6.347**
Scope: **presentation only**

## Terrain request
Christophe asked for:
- slightly smaller Math Core and Kill Switch controls;
- more transparent / lighter dashboard backgrounds;
- Math Core result text colorized;
- preserve the existing MINI / HIDDEN edge behavior.

## 40.6.348
- open Math and Kill wings reduced roughly 10–15%;
- header minimize/hide controls fixed 30×30 true circles;
- translucent glass surfaces with 12px blur;
- Math score/result and label highlighted cyan with restrained glow;
- normal Kill button remains red and visually dominant;
- MINI circles reduced while retaining lower-edge three-quarter docking;
- HIDDEN recalls remain permanent, round, compact and partially off-screen;
- no action-owner or business-logic change.

## Protected
No change to app.js, Math computation, Market Core 38.15.11, Graph, Storage, Aether, Oracle, Lecture Technique, Strategy thresholds, Gates, order or wallet logic.

Kill Switch still delegates only to the existing Auto A Paper stop owner.

## Static gates
- V8 parse: **PASS**
- runtime/index/build identity: **PASS**
- protected scope: **PASS**
- visible dashboard action label remains **KILL SWITCH**
- Firefox terrain: **PENDING**

## Firefox acceptance
1. normal boot;
2. open Math and Kill wings look lighter and more transparent;
3. controls are smaller but remain easy to click;
4. Math result is visibly cyan/colorized;
5. MINI remains partly tucked into lower side edges;
6. HIDE always leaves a callable round recall;
7. KILL SWITCH action behaves exactly as before.
