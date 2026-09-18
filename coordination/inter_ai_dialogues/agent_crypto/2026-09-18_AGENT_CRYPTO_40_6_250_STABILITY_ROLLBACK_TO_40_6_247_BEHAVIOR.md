# AGENT-CRYPTO 40.6.250 — STABILITY ROLLBACK TO 40.6.247 BEHAVIOR

Date: 2026-09-18
Release: **40.6.250**
Parent: **40.6.249**
Known terrain baseline: **40.6.247**
Market Core: **38.15.11**
Mode: **PAPER ONLY**
G3: **PENDING**
G9: **LOCKED**

## Trigger

Firefox terrain still showed:
- “Cette page ralentit Firefox”;
- incomplete / blank rendering inside the Administrator page;
- 40.6.248 and 40.6.249 therefore rejected on terrain.

## Audit result

Repository compare from the 40.6.247 receipt to 40.6.249 shows only three Administrator runtime files changed:

1. `public/agent_crypto_erith_ia/administrator/build.json`
2. `public/agent_crypto_erith_ia/administrator/js/decision-intelligence-acceptance.js`
3. `public/agent_crypto_erith_ia/administrator/js/decision-intelligence-current-truth-406243.js`

Current `index.html`, `js/version-truth.js` and `js/views/atlas-peripheral-lazy.js` are byte-identical to the 40.6.247 baseline.

## Delivery-chain finding

Several historical ZIPs supplied as “versions” are explicitly PATCH / receipt archives rather than standalone Administrator builds.

The previously supplied 40.6.249 ZIP is also not a canonical repository snapshot:
its bundled `build.json` is reduced and omits canonical sections that remain present in GitHub, including the Strategy A canonical evidence wiring.

It must not be used to replace the repository wholesale.

## 40.6.250 repair

40.6.250 restores the **behavior** of the two Decision Intelligence JavaScript owners from the known-good 40.6.247 terrain baseline.

Restored behavior:
- no Decision Intelligence self-`toggle` refresh;
- no explicit-open refresh;
- no presentation-resident refresh;
- no new timer;
- no new observer;
- no new fetch;
- no new storage owner.

The canonical 40.6.250 `build.json` is based on the full current GitHub manifest, not the reduced ZIP copy.

## Commits

- Runtime rollback: `4fef4b1cb49582df05b4f11227d55aba7f1a5bc8`
- Acceptance rollback: `9f3e2a919bfd3c582c1a610039e8dda36e55b97d`
- Release manifest: `5026f97fe1353dc53dea7bc64b35eba30ccdccce`

## Protected

Unchanged:
- Market Core 38.15.11
- Web Classique
- Strategy A business logic
- News owner
- Atlas CURRENT
- Oracle
- Lecture Technique
- Aether
- Window Manager
- current market data archives

## Static proof

- Decision Intelligence current-truth JavaScript syntax: PASS
- Decision Intelligence acceptance JavaScript syntax: PASS
- build.json parse: PASS
- canonical Strategy A evidence wiring remains enabled
- current index.html SHA equals 40.6.247 baseline
- current version-truth.js SHA equals 40.6.247 baseline
- current atlas-peripheral-lazy.js SHA equals 40.6.247 baseline

## Firefox proof

Wait for **Build 40.6.250 · Administrator**.

Then:
1. hard reload once;
2. scroll normally;
3. open News Sentinel;
4. confirm no Firefox slowdown banner and no giant blank stalled paint region;
5. keep Decision Intelligence closed for this first stability proof.

If that passes, 40.6.250 becomes the new stability base.
