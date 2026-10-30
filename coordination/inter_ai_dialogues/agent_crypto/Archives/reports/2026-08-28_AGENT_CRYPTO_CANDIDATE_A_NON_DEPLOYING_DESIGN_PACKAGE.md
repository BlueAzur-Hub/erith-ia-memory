# Agent-Crypto @erith.IA — Candidate A NON-DEPLOYING DESIGN PACKAGE

Date: 2026-08-28
Mode: COORDINATION ONLY / NO RUNTIME WRITE / NO BUILD ALLOCATION
Runtime authority: `public/agent_crypto_erith_ia/administrator/`
Runtime baseline: `40.4.88`
Runtime commit authority: `0b8672c4d2481bf21205e2cc74082ea591175d08`
Market Core: `38.15.11` — PROTECTED
Design authority: Audit Pass 07 `a044a403d19bd298fe1034b6e36ee92e15416133`

## 0. Status

`DESIGN PACKAGE READY FOR STATIC REVIEW — NOT DEPLOYABLE — NOT A BUILD`

This package deliberately does **not** contain:
- an `auto_update/request.json`;
- a build number;
- a runtime patch applied to `public/agent_crypto_erith_ia/administrator/`;
- generated SHA-256 values for hypothetical staged bytes;
- a claim of Firefox/operator acceptance.

A real version may only be allocated after the static design remains coherent and an operator test package is intentionally prepared.

---

## 1. Candidate A objective

Settle only the already-proven duplicate presentation residency debt:

1. stop parser-loading the legacy generic residency wrappers for Projects and Operations;
2. reduce System generic closed-body residency to Simulation only;
3. replace the stale residency diagnostic with an ownership-aware, demand-only, read-only diagnostic;
4. synchronize current ownership documentation and version manifests.

Candidate A must **not** touch Atlas routing, Atlas peripheral ownership, Learning, Bridge/Ollama/local producer truth, Market Core, Graph Context V7, Graphique, Top 5, CURRENT, Oracle, IndexedDB, Window Manager geometry, Source Intelligence business behavior or the shared monolith.

---

## 2. Six-file minimum payload

Functional/runtime-facing files:
1. `index.html`
2. `js/views/system-demand-residency.js`
3. `js/views/residency-audit.js`

Truth/publication files:
4. `architecture/administrator-ownership.json`
5. `version.json`
6. `administrator-version.json`

Legacy files remain physically present:
- `js/views/projects-demand-residency.js`
- `js/views/operations-demand-residency.js`

No delete is part of Candidate A.

---

## 3. Exact delta — `index.html`

Current load order around residency owners:

```html
<script src="./js/core/admin-window-manager.js?v=administrator-build-40.4.62"></script>
<script src="./js/views/presentation-boundaries.js?v=administrator-build-40.4.62"></script>
<script src="./js/views/view-lifecycle.js?v=administrator-build-40.4.62"></script>
<script src="./js/app.js?v=administrator-build-40.4.88"></script>
<script src="./js/views/projects-demand-residency.js?v=administrator-build-40.4.62"></script>
<script src="./js/views/operations-demand-residency.js?v=administrator-build-40.4.62"></script>
<script src="./js/views/system-demand-residency.js?v=administrator-build-40.4.88"></script>
<script src="./js/views/secondary-domain-demand-residency.js?v=administrator-build-40.4.86"></script>
<script src="./js/views/private-source-demand-loader.js?v=administrator-build-40.4.86"></script>
<script src="./js/views/atlas-family-demand-residency.js?v=administrator-build-40.4.62"></script>
```

Candidate A delta:

```diff
 <script src="./js/views/view-lifecycle.js?v=administrator-build-40.4.62"></script>
 <script src="./js/app.js?v=administrator-build-40.4.88"></script>
-<script src="./js/views/projects-demand-residency.js?v=administrator-build-40.4.62"></script>
-<script src="./js/views/operations-demand-residency.js?v=administrator-build-40.4.62"></script>
 <script src="./js/views/system-demand-residency.js?v=administrator-build-<NEXT_BUILD>"></script>
```

No other script order change is authorized by Candidate A.

Expected static effect:
- parser scripts: `-2`;
- generic lifecycle registrations: `-2`;
- no new timer;
- no new observer;
- no new WebSocket;
- no new storage owner;
- no new business fetch.

---

## 4. Exact delta — `js/views/system-demand-residency.js`

Current blob SHA: `6b1d2291ac7de0aaec5dca0a0c18f8d031d1cb89`.

Current selectors:
- Simulation
- Commandes
- Backend
- Safety
- Physical Security

Candidate A owner contract:

```js
/* Candidate A — version assigned only after operator package approval.
   SYSTEM 04 GENERIC CLOSED-BODY OWNER CONSOLIDATION
   Generic lifecycle remains only for Simulation.
   Commandes / Backend / Safety / Physical Security are owned by system-presentation true-lazy hydration.
   Storage Health + Grey Plate remain parser/resident protected.
   No fetch, timer, observer, storage write, engine mutation or Window Manager change. */
(()=>{
  "use strict";
  const BUILD="<NEXT_BUILD>";
  const life=globalThis.ErithPresentationLifecycle;
  if(!life)return;

  const selectors=Object.freeze([
    'details[data-collapse-key="simulation"]'
  ]);

  const registration=life.registerClosedBodyFamily({
    id:"system",
    label:"04 · Expérimentation & système · Simulation",
    selectors
  });

  const api=Object.freeze({
    build:BUILD,
    strategy:"closed-body-same-node-detach",
    selectors,
    registered:!!registration,
    storage_health_resident:true,
    grey_plate_forensic_resident:true,
    simulation_experiment_family_included:true,
    system_peripheral_true_lazy_owner:"js/views/system-presentation.js",
    commandes_generic_residency:false,
    backend_generic_residency:false,
    safety_generic_residency:false,
    physical_security_generic_residency:false,
    engine_state_changed:false,
    window_manager_changed:false,
    clone_used:false,
    fetch_added:false,
    timer_added:false,
    observer_added:false,
    storage_write_added:false,
    snapshot:()=>life.residencySnapshot()
  });

  globalThis.ErithSystemDemandResidencyCurrent=api;
  globalThis.ErithSystemDemandResidency40488=api;
  globalThis.ErithSystemDemandResidency40414=api;
})();
```

Compatibility policy:
- keep `ErithSystemDemandResidency40414` alias because historical diagnostics may query it;
- keep `ErithSystemDemandResidency40488` during the first consolidation candidate to avoid unnecessary compatibility surface removal;
- add a neutral `ErithSystemDemandResidencyCurrent` alias for VNext diagnostics;
- do not create Projects/Operations compatibility shims because the files are not deleted and their true-lazy presentation APIs already remain authoritative.

---

## 5. Exact design — `js/views/residency-audit.js` VNext

Current blob SHA: `110d0a6e3fe438242585133101d6ee4f0a288fb5`.

Current diagnostic is stale because it expects generic registrations `projects`, `operations`, `system`, `atlas`, while Projects/Operations are already true-lazy and System peripherals are true-lazy.

VNext requirements:

### Generic registrations expected
- `system`
- `atlas`

### Generic registration shape expected
- `system` records/selectors: Simulation only;
- `atlas`: retained until Atlas hash/router debt is closed and Firefox-proven.

### True-lazy transports expected
- `projects` via `ErithProjectsPresentation40420`;
- `operations` via `ErithOperationsPresentation40421`;
- `system` via `ErithSystemPresentation40424`;
- `oracle` via `ErithOraclePresentation`.

### Protected connected nodes
At minimum:
- `#analyste`
- `#detailPanel`
- Storage Health canonical node/shell
- Grey Plate Forensic canonical node/shell
- Atlas main cockpit `#atlas-local-ai-collapse`

The exact Storage/Grey selectors must be copied from current canonical DOM IDs during staging; no guessed ID is permitted.

### Read-only gates
VNext must report, never repair:
- lifecycle present;
- expected registrations present;
- unexpected generic registrations;
- true-lazy owners present;
- open+detached violations;
- disconnected detail shells;
- duplicate IDs;
- protected cockpit presence/connectivity;
- family rollups and detached node counts;
- `mutations_performed:false`;
- `automatic_run:false`;
- `timer_added:false`;
- `observer_added:false`;
- `fetch_added:false`;
- `storage_write_added:false`;
- `engine_state_changed:false`.

### Critical independence rule
The diagnostic must not require either:
- `ErithProjectsDemandResidency*`;
- `ErithOperationsDemandResidency*`.

A diagnostic that fails because those retired wrappers are absent is invalid.

---

## 6. Exact delta — `architecture/administrator-ownership.json`

Current document build: `40.4.85`.

Required owner truth changes only:

```diff
 {
   "component": "Projects presentation",
-  "owner": "js/views/projects-presentation.js + js/views/projects-demand-residency.js + views/projects.html",
+  "owner": "js/views/projects-presentation.js + views/projects.html",
   "state": "TRUE_LAZY_COMPLETE"
 }
```

```diff
 {
   "component": "Operations presentation",
-  "owner": "js/views/operations-presentation.js + js/views/operations-demand-residency.js + views/operations.html",
+  "owner": "js/views/operations-presentation.js + views/operations.html",
   "state": "TRUE_LAZY_COMPLETE"
 }
```

System owner truth remains `js/views/system-presentation.js + views/system.html` for peripherals, with Storage/Grey/Simulation protected. Candidate A should add an explicit note that Simulation alone retains generic closed-body residency through `js/views/system-demand-residency.js`.

Do not rewrite historical fields unrelated to Candidate A.

---

## 7. Exact manifest policy — `version.json`

Current build: `40.4.88`.

A future staged Candidate A must update:
- `release`;
- `build`;
- `asset_token` only according to the existing publication convention;
- `status` remains `candidate_requires_firefox_operator_validation` before operator PASS;
- `prepared_at`;
- `published_at:null` until publication gate;
- `parent_build:"40.4.88"` if and only if runtime HEAD is still 40.4.88 when staging begins;
- lineage: append only the actual allocated Candidate A build;
- `files` SHA-256 for every modified payload file.

Required hashed modified files:
- `index.html`;
- `js/views/system-demand-residency.js`;
- `js/views/residency-audit.js` — newly add to `files` map if absent;
- `architecture/administrator-ownership.json`;
- `administrator-version.json` if the canonical workflow hashes it in the primary manifest.

No hypothetical SHA-256 is written in this design package. Hashes must be computed from final staged bytes, not manually predicted.

Market Core must remain exactly `38.15.11` and protected.

---

## 8. Exact manifest policy — `administrator-version.json`

Current build: `40.4.88`.

Future Candidate A delta:
- update build/global version/release/prepared timestamp/parent relationship according to existing schema;
- preserve protected flags for Market Core, business runtime, Window Manager, memories, Graph/CURRENT;
- record owner consolidation explicitly;
- do **not** claim deletion of Projects/Operations legacy files;
- legacy filename inventory may retain them, exactly as Oracle tombstones remain inventoried while unloaded;
- record generic System residency = Simulation only;
- record Projects/Operations presentation owners = true-lazy presentation modules;
- record residency diagnostic = demand-only/read-only ownership-aware VNext.

---

## 9. Firefox/operator acceptance matrix for Candidate A

A Candidate A runtime build is forbidden until an intentional test package exists. Once staged, operator acceptance must cover at least:

### A. Cold boot
PASS if:
- no fatal console error;
- Administrator reaches usable first paint;
- no new recurring cadence appears;
- Market Core still reports 38.15.11;
- Graphique and Top 5 become responsive as in 40.4.88 baseline.

### B. First-click Administration
PASS if:
- early trusted click is not lost;
- canonical Administration gate consumes queued intent exactly once;
- no auth/session behavior changes.

### C. Projects true-lazy
PASS if:
- Projects shell exists at boot;
- first disclosure opens natively;
- heavy body hydrates on demand;
- subsequent close/open preserves expected behavior;
- Window Manager still recognizes the family.

### D. Operations true-lazy
PASS if:
- Operations shell exists;
- first disclosure hydrates;
- questionnaire/actions remain bound after hydration;
- no dependency on `operations-demand-residency.js` being parser-loaded.

### E. System Simulation
PASS if:
- Simulation remains shell-connected;
- closed Simulation body is generic demand-resident as intended;
- first opening restores the same-node body;
- Learning behavior is unchanged from 40.4.88.

### F. System peripherals
For Commandes / Backend / Safety / Physical Security:
PASS if:
- shells remain parser-mounted;
- body hydrates only on first demand;
- no generic residency record exists for those keys.

### G. Backend lazy handoff
PASS if:
- Backend hydration emits/permits the existing System hydration handoff;
- Source Intelligence UI remount/replay remains correct;
- no new polling or business fetch owner is introduced.

### H. Storage Health / Grey Plate
PASS if:
- both remain connected/resident;
- first click works;
- no placeholder replacement regression reappears.

### I. Window Manager
PASS if move/minimize/detach/maximize/hide-recall remain unchanged for affected families.

### J. Atlas/Oracle smoke
PASS if:
- Atlas main cockpit remains functional;
- Atlas peripheral behavior is unchanged from 40.4.88 (known routing debt remains, no regression);
- Oracle owner remains unique true-lazy and functional.

### K. Diagnostic VNext
PASS if:
- loading it on demand does not mutate the page;
- it reports Projects/Operations true-lazy owners as healthy without legacy wrappers;
- System generic record contains Simulation only;
- Atlas generic owner remains expected;
- duplicate IDs = 0;
- protected cockpit/Storage/Grey checks pass.

---

## 10. Static budget expectation

Candidate A design is performance-monotonic by construction:
- parser-loaded JS files: `-2`;
- generic lifecycle registrations: `-2`;
- System generic selectors: `5 → 1`;
- new timers: `0`;
- new observers: `0`;
- new WebSockets: `0`;
- new storage writes: `0`;
- new business network owners: `0`;
- Market Core changes: `0`;
- app.js/js/app.js changes: `0`;
- Window Manager changes: `0`.

This does not prove runtime viability by itself; Firefox acceptance remains final authority.

---

## 11. Explicitly deferred debts

Candidate A does not close:
- Atlas target/hash routing for Auto Reader / Shared Memory / GitHub Memory;
- Atlas `insertAdjacentHTML` interception architecture debt;
- Learning 40.4.47 post-parse recovery debt;
- no-local-producer / Ryzen OFFLINE-N/A truth;
- Bridge/Ollama local producer supervision debt;
- shared monolith extraction;
- stale historical `architecture-freeze.js` replacement beyond residency VNext scope.

---

## 12. Promotion gate

Candidate A may progress from design to a versioned staged candidate only when all are true:
1. runtime HEAD is rechecked immediately before staging;
2. current canonical Storage/Grey DOM selectors are verified, not guessed;
3. final six staged files are generated from the then-current runtime baseline;
4. exact SHA-256 values are computed from staged bytes;
5. static syntax/JSON/duplicate-owner checks pass;
6. no protected subsystem diff exists;
7. an explicit Firefox/operator test package is available.

Only after operator PASS may publication/update workflow be considered.
