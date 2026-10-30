# HANDOFF — 40.6.276 HUMAN BOOT REPORT

## Current release
**40.6.276**

Parent diagnostic build: **40.6.275**  
Protected engine: **Market Core 38.15.11**

## Why
40.6.275 exposed useful boot measurements only through `AgentCryptoBootProbe.snapshot()`, which required an undocumented Firefox Console workflow. That is not an acceptable operator contract.

40.6.276 keeps the measurements and translates them inside the product.

## Human path
Open:

**Command Center → Système → Boot report**

Then:
- read the report;
- click **Actualiser** if the interface has just finished loading;
- click **Copier** if a text copy is useful.

No Console or developer command is required.

## Scope
Presentation/translation only. No optimization is stacked into this release.

## Next gate
Use the readable report on Ryzen first. If stable, use the same surface on Transformer Book. Choose one dominant boot owner only after comparing real timings.

## Hard locks
Do not modify Market Core, Oracle business logic, Math Core, CURRENT rules, Lecture Technique, Strategy A, Aether or Web Classic as part of this diagnostic gate.
