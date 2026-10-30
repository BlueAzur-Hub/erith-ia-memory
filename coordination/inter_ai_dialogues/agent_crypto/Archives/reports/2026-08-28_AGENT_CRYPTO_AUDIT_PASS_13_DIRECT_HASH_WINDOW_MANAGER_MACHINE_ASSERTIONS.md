# Agent-Crypto @erith.IA — Audit cumulatif Pass 13 — Direct-hash baseline + Window Manager oracle + machine assertions

Date: 2026-08-28
Status: AUDIT / NON-DEPLOYING

## 0. HEAD and runtime authority

Repository HEAD observed immediately before Pass 13 coordination writes: `4a8408d0f7f662c3beca3aafc6d7b94289964728` (Pass 12 report).

Runtime authority remains separately and unchanged:
- Administrator: `40.4.88`
- runtime commit authority: `0b8672c4d2481bf21205e2cc74082ea591175d08`
- Market Core: `38.15.11` PROTECTED

The runtime authority commit is still the verified commit titled `agent-crypto: 40.4.88 recover System 04 interaction and restore version truth`.

No file under `public/agent_crypto_erith_ia/administrator/` is modified by Pass 13.
No Build is created.
No `auto_update/request.json` is created.

## 1. New files/source reread in Pass 13

Runtime authority `0b8672...`:
- `js/views/view-lifecycle.js`
- `js/views/projects-presentation.js`
- `js/views/operations-presentation.js`
- `js/app.js` routing / Window Manager sections as previously indexed

Coordination baseline:
- Pass 12 cumulative report
- Candidate A staging remains the only candidate material; no live application.

## 2. PROUVÉ — exact direct-hash responsibility boundary for Projects

`projects-presentation.js` 40.4.20 states and implements all of the following:

- the five Project shells are parser-mounted;
- the canonical anchor ids live in always-connected `<summary>` nodes;
- the heavy body is fetched only on disclosure demand;
- the hydrated clone has the matching source anchor id removed to avoid duplicate ids;
- the true-lazy owner binds disclosure `toggle` and hydrates when `detail.open` becomes true;
- it also binds `hashchange`, but `hydrateHashIfOpen()` hydrates only when the corresponding Project shell is **already open**;
- the source comment explicitly assigns shell opening to the canonical app router.

Therefore:

**PROUVÉ:** `ErithProjectsPresentation40420` is the body-hydration owner, not the disclosure-opening route owner.

**PROUVÉ:** removing the legacy Projects generic residency wrapper does not remove the Project true-lazy body hydration owner.

**NOT PROUVÉ:** that the baseline canonical app router successfully opens every Project shell for every direct hash in Firefox. That remains an operator-observed baseline/non-regression gate.

## 3. PROUVÉ — exact direct-hash responsibility boundary for Operations

`operations-presentation.js` 40.4.21 has the same ownership split:

- four parser-mounted Operations shells;
- canonical anchors permanently connected in the summaries;
- true-lazy body hydration on shell open;
- source matching anchor id removed from hydrated clones;
- `hashchange` observes only the already-open shell and calls hydration;
- runtime action rebinding remains internal to the Operations presentation owner after hydration.

Therefore:

**PROUVÉ:** `ErithOperationsPresentation40421` owns body hydration/action parity after demand, not canonical shell opening.

**NOT PROUVÉ:** every direct-hash opening behavior in real Firefox baseline. Do not repair or alter this route behavior inside Candidate A without observed regression evidence.

## 4. PROUVÉ — generic lifecycle cannot substitute for summary-anchor route opening

`ErithPresentationLifecycle.restoreForHash()`:

- decodes the requested id;
- searches only `record.nodes` through `cachedContainsId()`;
- `record.nodes` are the non-summary children detached from a registered `<details>`;
- when found, it restores the body and sets `record.detail.open=true`.

The Project and Operations canonical summary anchors are not in those detached body nodes.

This reconfirms Pass 12:

- generic Projects/Operations registrations were not the owner of the canonical summary-anchor route;
- Candidate A retirement of those registrations does not retire that route responsibility.

## 5. Window Manager exact API boundary

The shared `js/app.js` consumer path remains outside Candidate A and unchanged.

The exact construction pattern observed is:

- `const factory = window.ErithAdminWindowManager`;
- `factory.create({...})` returns a manager instance;
- `manager.populate(missionEntries40302())` provides Missions/Projects membership;
- `manager.populate(preparationEntries40308())` provides Operations membership;
- `onChange(state)` receives manager state including visible/total/minimized values for status rendering.

Static membership lists remain:

Projects/Missions side:
- `#missions`
- `#aether-projects-container`
- `#fonds-erith-ia`

Operations side:
- `#atlasOperationsControl40308`
- `#operations-positions`
- `#atlas-weekly-checklist`
- `#atlas-operations-centre`

### Important API limit

No stable globally exported **manager-instance snapshot getter** has been proven from the current shared `app.js` consumer path. The manager variables are closure-local in the mounting functions.

Therefore the Firefox acceptance oracle must not invent a `window.*.snapshot()` API.

For Candidate A, Window Manager acceptance remains observable through:

1. the unchanged structural entry selectors;
2. the existing Window Manager UI/status after mount;
3. detach/open/reopen geometry/operator behavior;
4. absence of missing-shell errors;
5. unchanged `js/app.js` hash/integrity in the future real staging.

This is a **PROUVÉ LIMIT**, not a missing owner.

## 6. New machine-readable Firefox oracle

Published under staging coordination only:

`candidate_a_pass10_staging/PASS13_MACHINE_ASSERTIONS.js`

It is a read-only console/test oracle. It does not mutate or hydrate anything and adds no runtime listener, timer, observer, fetch, WebSocket or storage write.

It mechanically checks:

- `ErithPresentationLifecycle.residencySnapshot()` is present;
- generic registration families are exactly `[atlas, system]`;
- generic System record keys are exactly `[simulation]`;
- duplicate ids are exactly zero;
- protected nodes are present and connected:
  - `#analyste`
  - `#detailPanel`
  - `#atlasStorageHealth40198`
  - `#atlasGreyPlateForensic40393`
- all parser-mounted Project summary anchors remain connected;
- all parser-mounted Operations summary anchors remain connected;
- true-lazy Projects/Operations snapshots exist.

The oracle emits one frozen result object with `healthy`, individual assertions and raw observed values. It is designed for comparison of baseline/staged Firefox runs, not for runtime installation.

## 7. Exact lifecycle snapshot shape reconfirmed

`ErithPresentationLifecycle.residencySnapshot()` returns an array of registrations with:

- `id`
- `label`
- `selectors`
- `details`
- `records[]`

Each record exposes:

- `key`
- `open`
- `connected`
- `detached`
- `cached_nodes`
- `detach_count`
- `restore_count`
- timestamps

This makes the Pass 13 assertions `generic families exactly system+atlas` and `System generic keys exactly simulation` mechanically valid without relying on stale build-number diagnostics.

## 8. Candidate A status

Previous:
`HIDDEN COMPATIBILITY BOUNDARY TIGHTENED / ROUTING GENERIC NON-RESPONSIBILITY PROVEN / BACKEND HANDOFF ORACLE READY / FIREFOX PASS STILL REQUIRED`

Pass 13:
`DIRECT-HASH OWNERSHIP SPLIT PROVEN / WINDOW-MANAGER SNAPSHOT LIMIT PROVEN / MACHINE ASSERTIONS READY / FIREFOX PASS STILL REQUIRED`

This is still **not runtime viability proof**.

No Build.
No runtime token/version.
No runtime publication hashes.
No live write.

## 9. Debt ledger

### CLOSED / PROVEN for Candidate A static design

- Projects generic residency removable from parser load graph;
- Operations generic residency removable from parser load graph;
- Project body hydration owner remains `ErithProjectsPresentation40420`;
- Operations body hydration owner remains `ErithOperationsPresentation40421`;
- canonical summary route opening is not owned by the retired generic wrappers;
- generic lifecycle restore-for-hash searches detached body nodes only;
- Window Manager membership construction remains in unchanged shared runtime;
- no public manager-instance snapshot should be assumed;
- System generic residency reducible to Simulation only;
- Storage Health + Grey Plate resident boundary;
- owner-aware diagnostic VNext contract;
- six-file Candidate A static boundary;
- static budget non-increase;
- staging no-drift through Pass 12;
- read-only machine assertions for duplicate ids and exact System generic keys.

### OPEN

- real Firefox/operator PASS for Candidate A;
- exact observed direct-hash baseline for Projects/Operations and staged equality;
- Window Manager real geometry/membership behavior in Firefox before/after first demand;
- real runtime manifests/hashes only after operator PASS;
- Atlas peripheral hash/router;
- Atlas `insertAdjacentHTML` interception debt;
- Learning post-parse recovery;
- no-local-producer / Ryzen OFFLINE-N/A truth;
- shared monolith/non-regression;
- Backend/Source Intelligence WATCH without surgery.

### CLOSED unless new evidence

- Oracle owner consolidation.

### PROTECTED

- Market Core 38.15.11;
- Graph Context V7;
- Graphique;
- Top 5;
- CURRENT critical history/state;
- Storage Health;
- Grey Plate;
- Atlas main cockpit;
- Window Manager geometry;
- IndexedDB schemas/business state.

## 10. Next target

If no real Firefox/operator evidence exists, no Build is authorized.

Pass 14 should remain audit/test-oracle work only:

1. turn the direct-hash requirement into an explicit baseline-vs-staging Firefox capture table for all nine Project/Operations canonical hashes;
2. capture Window Manager visible/total/minimized UI state before demand, after first demand and after reopen without assuming a nonexistent public snapshot API;
3. include Pass13 machine assertion output beside the existing Backend handoff oracle;
4. only if all Firefox gates pass may the six staging files be materialized as an actual versioned candidate and receive real final-file hashes.

Atlas, Learning and no-local-producer remain separate future candidate boundaries.

No Build just to advance a number.
