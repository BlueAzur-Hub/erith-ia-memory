# Agent-Crypto 40.6.350 — MINI DEFAULT · LIVE MATH · IMPERIAL GLASS

Date: 2026-09-22
Parent: **40.6.349**
Scope: **operator-dashboard only + runtime identity**

## Terrain request
Christophe asked to develop the operator-cockpit idea:
- both widgets reduced by default at startup;
- open panels slightly smaller;
- Math much brighter, closer to Atlas Math Core V3;
- Kill Switch text/status more strongly colorized;
- blue and red magnified, with discreet gold accents;
- fix Math remaining on “Données insuffisantes” until manual interaction.

## 40.6.350
- default state = **Math MINI + Kill MINI**;
- open Math/Kill wings slightly smaller;
- Math uses brighter electric cyan / blue glow;
- Kill uses stronger ruby / crimson glow and color hierarchy;
- gold is accent-only, never the dominant surface;
- Math view sync adds a **bounded boot hydration probe**:
  - reads only existing canonical Math DOM;
  - chained setTimeout, 30 max attempts, 500 ms cadence;
  - stops immediately once canonical Math is ready;
  - no setInterval;
  - no MutationObserver;
  - no second Math computation engine;
  - no storage/network owner.
- existing source events continue to trigger view refreshes;
- KILL SWITCH delegates to the same Auto A Paper owner as before.

## Protected
No change to:
- administrator/app.js;
- Math computation;
- Market Core 38.15.11;
- Graph / Storage / Aether / Oracle / Lecture Technique;
- Strategy thresholds / Gates;
- order / wallet logic.

## Static acceptance
- V8 parse: **PASS**
- MINI + MINI boot contract: **PASS**
- bounded Math hydration present: **PASS**
- no persistent interval / observer: **PASS**
- runtime/index/build identity: **PASS**
- protected scope: **PASS**
- Firefox terrain: **PENDING**

## Firefox acceptance
1. fresh Ctrl+F5: both wings are MINI immediately;
2. without clicking Math, the mini score resolves once canonical Math is ready;
3. opening Math shows the live score/label, not stale “Données insuffisantes” when canonical Math is available;
4. Math cyan appears significantly brighter / Atlas-like;
5. Kill title/state/button appear richer ruby-red;
6. gold remains a discreet accent, not a new dominant color;
7. open panels occupy less space than .349;
8. MINI, HIDDEN and recall choreography still work;
9. KILL SWITCH action is behaviorally unchanged.
