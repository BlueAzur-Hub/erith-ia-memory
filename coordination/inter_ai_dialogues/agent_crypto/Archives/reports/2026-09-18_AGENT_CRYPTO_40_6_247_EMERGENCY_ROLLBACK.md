# AGENT-CRYPTO 40.6.247 — EMERGENCY ROLLBACK TO 40.6.243 RUNTIME BASELINE

Date: 2026-09-18
Release: **40.6.247**
Parent: **40.6.246**
Market Core: **38.15.11**
Mode: **PAPER ONLY**
G3: **PENDING**
G9: **LOCKED**

## Terrain rejection

Firefox rejected the 40.6.244 → 40.6.246 recovery cascade:
- severe visual/runtime regression;
- Firefox page-slowdown warning;
- mixed release identity between the 40.6.246 publication shell and 40.6.243 runtime surfaces.

## Rollback

40.6.247 restores the last pre-cascade runtime baseline from:
`d1a2422abe3fe6f8a7b95300d5e17271b055b5ed`

Restored byte-for-byte:
- `administrator/index.html`
- `administrator/js/version-truth.js`
- `administrator/js/views/atlas-peripheral-lazy.js`

The 40.6.244 / 40.6.245 / 40.6.246 recovery modules remain historical files only and are no longer loaded by the canonical entry.

## Commits

- index rollback: `00e2ecd65fce644226f6d285bc4ac9bb238d616b`
- version-truth rollback: `a33432a498a9ebf9082db71a8e0edf5823a009b4`
- Atlas lazy owner rollback: `fc915c91df73caa1546a58fc913fa28eaafcd835`
- release 40.6.247: `cbd58df68a6224fc9a3f798cf3c1a2c1cbf32621`

No Market Core, Strategy A, Atlas CURRENT, Oracle, Lecture Technique, Aether or Web Classique change.

## Firefox proof

Use the normal Administrator URL.
Hard reload.
Expected visible build: **40.6.247 · Administrator**.

First goal is stability only. Do not reopen the rejected recovery cascade.
