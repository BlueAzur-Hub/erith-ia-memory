# Agent-Crypto @erith.IA — Candidate A — Lifecycle Expected Snapshots

Status: NON-DEPLOYING TEST ORACLE
Baseline runtime: Administrator 40.4.88
Candidate: A — owner consolidation + diagnostic truth only

This matrix is an objective Firefox/operator comparison oracle. It does not authorize a Build and does not mutate the live runtime.

## 1. Canonical APIs

### Generic lifecycle
Owner: `js/views/view-lifecycle.js`
Global API: `globalThis.ErithPresentationLifecycle`
Compatibility alias: `globalThis.ErithPresentationLifecycle40411`

Relevant methods:
- `measurementSnapshot()`
- `residencySnapshot()`
- `registerClosedBodyFamily(config)`
- `restoreForHash(hash)`
- `activeRegistrations()`

`residencySnapshot()` shape per registration:
- `id`
- `label`
- `selectors`
- `details`
- `records[]`

Each generic record exposes:
- `key`
- `open`
- `connected`
- `detached`
- `cached_nodes`
- `detach_count`
- `restore_count`
- `last_detached_at`
- `last_restored_at`

Candidate A invariant: generic families must be exactly `system` + `atlas`. Projects and Operations must no longer depend on a generic residency registration.

## 2. Projects true-lazy owner

Owner: `js/views/projects-presentation.js`
API: `globalThis.ErithProjectsPresentation40420`
Strategy: parser shell + on-demand body hydration.

Keys:
- `fonds-erith`
- `association-erith`
- `aerith-enfance`
- `aerith-animaux`
- `aerith-terre-vivante`

Snapshot row shape:
- `key`
- `open`
- `body_state`
- `anchor_present`

Expected cold boot before any Project disclosure:
- all five stable shells connected;
- all five canonical summary anchors present;
- every row `open === false` unless restored by persisted UI state/router;
- every untouched body state = `placeholder`;
- `source_fetch_count === 0`;
- `hydration_count === 0`.

Expected first demand for key K:
- shell K opens;
- `ensureBody(K)` or toggle-driven hydration runs;
- first source access increments `source_fetch_count` to 1;
- K `body_state` transitions `placeholder -> loading -> ready`;
- `hydration_count` increments by 1;
- K canonical anchor remains present in the always-connected summary shell;
- hydrated source duplicate anchor id is removed;
- other untouched keys remain `placeholder`;
- event `erith:projects-hydrated` is emitted after successful hydration.

Expected close/reopen after successful hydration:
- K remains `ready`;
- no second source fetch;
- no second hydration clone for the already-ready body;
- no generic residency detach/restore record for family `projects` exists in `ErithPresentationLifecycle.residencySnapshot()`.

## 3. Operations true-lazy owner

Owner: `js/views/operations-presentation.js`
API: `globalThis.ErithOperationsPresentation40421`
Strategy: parser shell + on-demand operations body hydration.

Keys:
- `situation`
- `questionnaire`
- `briefing`
- `planning`

Expected cold boot:
- four shells connected;
- four canonical anchors connected;
- untouched body states = `placeholder`;
- `source_fetch_count === 0`;
- `hydration_count === 0`.

Expected first demand K:
- first source access sets session source fetch count to 1;
- K transitions `placeholder -> loading -> ready`;
- `hydration_count` increments once;
- actions inside K are rebound only after hydration;
- `erith:operations-hydrated` emitted after successful hydration;
- no duplicate canonical anchor id appears.

Expected close/reopen:
- body remains `ready`;
- no refetch;
- action bindings remain once-only via dataset guards;
- no generic family `operations` record exists in lifecycle residency snapshot.

## 4. System generic owner — Simulation only

Owner: staged Candidate A replacement of `js/views/system-demand-residency.js`.
Generic registration id: `system`.
Expected selectors after Candidate A: exactly `[data-collapse-key="simulation"]`.

Protected resident System nodes that must never become generic closed-body records:
- `#atlasStorageHealth40198`
- `#atlasGreyPlateForensic40393`

Expected cold boot after lifecycle initial sweep:
- generic `system` registration exists;
- registration selectors contain Simulation only;
- registration has one Simulation detail record if the canonical shell exists;
- if Simulation is initially closed, `detached === true`, `detach_count >= 1`, `restore_count === 0` before any router restoration;
- Storage Health and Grey Plate stay connected and do not appear as records in generic `system`.

Expected first Simulation demand:
- the existing body fragment is restored on the same nodes;
- `open === true`;
- `detached === false`;
- `restore_count` increments;
- `cached_nodes` returns to 0 while resident;
- no true-lazy System peripheral fetch is required merely to restore Simulation.

Expected close after demand:
- Simulation becomes detached again;
- `detach_count` increments;
- same-node lifecycle remains authoritative; no clone and no new fetch.

## 5. System true-lazy peripherals

Owner: `js/views/system-presentation.js`
API: `globalThis.ErithSystemPresentation40424`
Strategy: resident System core + on-demand peripheral body hydration.

True-lazy keys:
- `commandes`
- `backend`
- `safety`
- `physical-security`

Expected cold boot:
- stable shells/anchors for the four keys are present;
- untouched body states = `placeholder`;
- `source_fetch_count === 0` before any peripheral disclosure;
- Storage Health resident = true;
- Grey Plate resident = true;
- Simulation remains parser-mounted and is handled separately by generic lifecycle Candidate A.

Expected first true-lazy peripheral demand K:
- K transitions `placeholder -> loading -> ready`;
- first source access increments shared `source_fetch_count` once;
- `hydration_count` increments once;
- later peripheral demands reuse the cached source;
- Backend hydration must still execute the existing post-hydration handoff/event path; Candidate A does not alter Backend business ownership.

Critical anti-regression:
- no generic System record is created for `commandes`, `backend`, `safety` or `physical-security` under Candidate A.

## 6. Atlas current mixed state — unchanged by Candidate A

Generic owner remains loaded: `js/views/atlas-family-demand-residency.js`.
True-lazy peripheral owner remains loaded: `js/views/atlas-peripheral-lazy.js`.
Main cockpit `#atlas-local-ai-collapse` remains protected/current behavior unchanged.

Candidate A acceptance rule:
- Atlas generic registration still exists exactly as baseline Candidate A expects;
- no Atlas selector is removed in Candidate A;
- no Atlas hash/router debt is claimed closed;
- no `insertAdjacentHTML` hook change occurs.

Atlas smoke is therefore a non-regression check only, not a debt closure.

## 7. Mechanical console capture for Firefox/operator run

Capture before any disclosure interaction:

```js
({
  lifecycle: globalThis.ErithPresentationLifecycle?.residencySnapshot?.(),
  projects: globalThis.ErithProjectsPresentation40420?.snapshot?.(),
  operations: globalThis.ErithOperationsPresentation40421?.snapshot?.(),
  systemPresentation: globalThis.ErithSystemPresentation40424?.snapshot?.(),
  storageConnected: !!document.querySelector('#atlasStorageHealth40198')?.isConnected,
  greyConnected: !!document.querySelector('#atlasGreyPlateForensic40393')?.isConnected
})
```

Repeat the same capture after:
1. one Project first demand;
2. close/reopen same Project;
3. one Operations first demand;
4. close/reopen same Operations section;
5. Simulation first demand, then close;
6. each System true-lazy peripheral once;
7. Atlas smoke navigation.

## 8. Candidate A PASS conditions

PASS requires all of the following:
- lifecycle generic family ids exactly include `system` and `atlas`, with no `projects` or `operations` generic registration;
- System generic selectors/records cover Simulation only;
- Projects true-lazy owner hydrates first demand and does not refetch on reopen;
- Operations true-lazy owner hydrates first demand and does not refetch on reopen;
- System peripheral owner hydrates Commandes/Backend/Safety/Physical Security independently of generic System residency;
- Storage Health and Grey Plate remain connected throughout;
- no duplicate IDs after hydration;
- Atlas behavior unchanged relative to 40.4.88 smoke baseline;
- Oracle behavior unchanged;
- Graphique, Top 5, Market Core 38.15.11 and CURRENT protected paths unchanged;
- no console error attributable to Candidate A;
- Residency Audit VNext reports healthy only when these ownership conditions are actually true.

## 9. Failure conditions

Any of the following blocks Build authorization:
- Projects/Operations disappear, fail first-demand hydration, refetch repeatedly, or lose canonical anchors;
- `projects` or `operations` remains a generic lifecycle registration after Candidate A;
- System generic registration contains any peripheral key other than Simulation;
- Storage Health or Grey Plate becomes detached/missing;
- Backend handoff fails after hydration;
- duplicate IDs appear;
- Atlas/Oracle/Graph/Top5/CURRENT regress;
- VNext diagnostic mutates runtime state or reports healthy despite ownership mismatch.

No Build is authorized by this document alone. A real Firefox/operator run remains final authority.
