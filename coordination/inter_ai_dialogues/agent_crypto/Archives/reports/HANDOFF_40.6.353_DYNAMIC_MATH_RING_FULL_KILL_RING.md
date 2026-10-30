# Agent-Crypto 40.6.353 — DYNAMIC MATH RING · FULL KILL RING

Date: 2026-09-22
Parent: **40.6.352**
Scope: **operator dashboard presentation + canonical score-ring mirroring**

## Terrain request
Christophe clarified the intended behavior:
- Math ring must grow proportionally with the actual Math Core score, exactly like Atlas Math Core;
- at >50, the cyan ring must fill >50% of the circumference;
- Kill Switch must be surrounded completely;
- Kill must visually grow on click;
- both MINI circles must be aligned again.

## Canonical reference read
Atlas Math Core uses:
- canonical element `#scoreRing`;
- CSS variable `--score`;
- `conic-gradient(var(--cyan) calc(var(--score)*1%), ...)`.

40.6.353 mirrors that contract:
- reads `#scoreRing.style --score` first;
- falls back to the canonical numeric Math score if needed;
- writes only a presentation variable `--operator-math-score`;
- cyan ring fill = score percentage.

## 40.6.353
- Math MINI + Kill MINI use the same outer geometry: 104×104;
- both share the same bottom offset: -10px;
- Math left offset = -10px, Kill right offset = -10px;
- both inner circles = 94×94;
- Math cyan ring is proportional to canonical Math score;
- open Math score orb uses the same proportional contract;
- Kill MINI and open Kill button receive a full 360° ruby ring with a small gold accent;
- Kill has tactile `:active` grow to 1.10 scale;
- Kill action owner is unchanged.

## Protected
No change to:
- administrator/app.js;
- canonical Atlas Math computation;
- canonical Atlas score-ring implementation;
- Market Core 38.15.11;
- Graph / Storage / Aether / Oracle / Lecture Technique;
- Strategy thresholds / Gates;
- order / wallet logic.

KILL SWITCH still delegates only to existing Auto A Paper.

## Static acceptance
- V8 parse: **PASS**
- canonical `--score` read: **PASS**
- proportional Math conic fill: **PASS**
- full Kill ring: **PASS**
- click grow feedback: **PASS**
- strict MINI alignment: **PASS**
- Firefox terrain: **PENDING**
