# Agent-Crypto 40.6.354 — CENTERLINE RESTORE

Date: 2026-09-22
Parent: **40.6.353**
Scope: **presentation only**

## Root cause
40.6.353 gave Math and Kill the same outer 104×104 box, but their inner structures were not equivalent:
- Math circle sat directly in the outer box;
- Kill circle stayed inside a wrapper with a 5px inset.

So equal CSS numbers produced unequal visual centers. The current operator module also still carries several historical override layers, so later geometry rules can mask earlier intended choreography.

## 40.6.354
- one MINI centerline authority block added at the end;
- Math and Kill outer MINI boxes stay 104×104, bottom -10, symmetric left/right -10;
- both MINI faces now occupy the same 104×104 centering grid;
- Math inner circle = 94×94 centered;
- Kill inner circle = 94×94 centered via its 5px inset wrapper;
- mirrored hover reveal restored: Math +4/-4, Kill -4/-4;
- canonical dynamic Math ring from 40.6.353 preserved;
- full Kill ring and x1.10 click grow preserved.

## Protected
No change to:
- administrator/app.js;
- Atlas Math computation;
- canonical #scoreRing implementation;
- Market Core 38.15.11;
- Graph / Storage / Aether / Oracle / Lecture Technique;
- Strategy thresholds / Gates;
- order / wallet logic.

Kill owner remains existing Auto A Paper.

## Static acceptance
- V8 parse: **PASS**
- visual centerline authority: **PASS**
- same MINI outer geometry: **PASS**
- same inner visual center: **PASS**
- proportional Math ring preserved: **PASS**
- full Kill ring preserved: **PASS**
- click grow preserved: **PASS**
- Firefox terrain: **PENDING**
