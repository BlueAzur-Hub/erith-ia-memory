# HANDOFF — 40.6.274 BOOT QUIETNESS / TRUE DEMAND RESIDENCY

## Starting point
Current release: **40.6.274**  
Parent / rollback: **40.6.273**  
Engine: **Market Core 38.15.11**

## Why
40.6.273 removed the largest Strategy A parser-time evidence wall and restored cross-release cache reuse. Audit then showed remaining post-paint/background work: Strategy A evidence still auto-started in browser idle and Strategy A ↔ TRADUS comparative/outcome owners woke repeatedly on parser/microtask/load/pageshow despite being demand-oriented.

## 40.6.274 changes
1. **Strategy A evidence = true demand residency**
   - no automatic after-first-paint load;
   - explicit Strategy A click/hash only;
   - same ordered module pack;
   - paced by browser idle slices after explicit demand.

2. **Strategy A ↔ TRADUS readers = demand only**
   - parser eager wake removed;
   - microtask eager wake removed;
   - window-load eager wake removed;
   - pageshow eager wake removed;
   - explicit Strategy A intent preserved;
   - explicit Source Truth demand still calls the downstream readers in source order.

3. **Canonical entry cleanup**
   - dead evidence/panel constant tables removed from `index.html`;
   - empty historical `./app.js` parser transport removed;
   - canonical `./js/app.js` untouched.

4. **Cache discipline**
   - no return to global `?release=<build>` stamping;
   - targeted `?v=40.6.274` only for the two changed demand loaders.

## Static proof
PASS: changed JavaScript parses, canonical entry inline script parses, build JSON parses, demand-only markers present, eager wake markers absent, canonical app/runtime preserved.

## DO NOT TOUCH
- Market Core 38.15.11
- Oracle / Math Core
- Shared Memory schemas/data
- Atlas CURRENT
- Lecture Technique
- Strategy A business thresholds/gates/order policy
- IndexedDB schemas
- Web Classic contract
- real-order locks

## Terrain gate
Ryzen first, then Transformer Book. Book may be slower than Ryzen but must not freeze or raise sustained Firefox slow-page warnings.

## If 40.6.274 passes
Next bounded debt is **role-aware residency**: Classic should not construct Administrator-only presentation owners at boot. Do not combine that surgery with CSS cleanup.

## If 40.6.274 fails
Rollback to **40.6.273**, capture the failing stage, then profile remaining resident shell/app owners. No blind 40.6.275 cascade.
