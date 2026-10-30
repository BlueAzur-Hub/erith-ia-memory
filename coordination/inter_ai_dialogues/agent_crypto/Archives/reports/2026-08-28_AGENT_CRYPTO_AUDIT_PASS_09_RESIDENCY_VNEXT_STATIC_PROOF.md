# Agent-Crypto @erith.IA — Audit cumulatif Pass 09

Date: 2026-08-28
Scope: Candidate A non-deploying static proof
Runtime live authority: Administrator 40.4.88 / Market Core 38.15.11
Runtime commit authority: 0b8672c4d2481bf21205e2cc74082ea591175d08
Repository HEAD observed before this pass: 9c2fbc092be6f077f54cf3a0fb75f609981ab218

## Status

Candidate A remains NON-DEPLOYING. No Build, no auto_update/request.json, no write under public/agent_crypto_erith_ia/administrator/.

This pass closes the missing static proof for the protected System nodes and defines a complete Residency Audit VNext design that is independent from the retired Projects/Operations generic residency owners.

## New files re-read

- public/agent_crypto_erith_ia/administrator/views/system.html
- public/agent_crypto_erith_ia/administrator/js/views/system-presentation.js
- public/agent_crypto_erith_ia/administrator/js/views/system-demand-residency.js
- public/agent_crypto_erith_ia/administrator/js/views/residency-audit.js
- public/agent_crypto_erith_ia/administrator/js/views/projects-presentation.js
- public/agent_crypto_erith_ia/administrator/architecture/final-residency.json
- public/agent_crypto_erith_ia/administrator/architecture/administrator-ownership.json

## PROUVÉ — Protected System nodes

Canonical always-resident System nodes in the 40.4.88 baseline are:

- Storage Health: `#atlasStorageHealth40198`
- Grey Plate Forensic: `#atlasGreyPlateForensic40393`

They are parser-mounted as top-level `<section>` elements before the Simulation `<details>` and outside the true-lazy System peripheral shells. `system-presentation.js` explicitly documents that Storage Health, Grey Plate Forensic and Simulation remain parser-mounted while Commandes/Backend/Safety/Physical Security are hydrated on demand.

Therefore Candidate A must require both protected nodes to exist and remain connected, but must never register them as generic closed-body residency records.

## PROUVÉ — Historical architecture truth remains immutable

`architecture/final-residency.json` 40.4.48 records:

- Projects heavy bodies = TRUE_LAZY
- Operations heavy bodies = TRUE_LAZY
- System peripherals = TRUE_LAZY
- Storage Health / Grey Plate / Simulation runtime = RESIDENT_PROTECTED
- Atlas peripheral bodies = TRUE_LAZY_PARTIAL_FAMILY
- Oracle heavy presentation = TRUE_LAZY

Candidate A aligns CURRENT ownership with this established architecture. The historical file itself must not be rewritten.

## PROUVÉ — Current 40.4.88 generic System owner is over-broad

`system-demand-residency.js` currently registers five selectors:

- simulation
- commandes
- backend
- safety
- physical-security

Candidate A reduces this registration to Simulation only. Storage Health and Grey Plate remain resident and are not part of this registration.

Compatibility aliases retained in the first candidate:

- `ErithSystemDemandResidency40414`
- `ErithSystemDemandResidency40488`

Proposed additional stable alias:

- `ErithSystemDemandResidency`

This avoids forcing diagnostics to bind to a build-number alias.

## PROUVÉ — Residency Audit 40.4.41 is stale

Current audit expects generic registrations for Projects, Operations, System and Atlas, and true-lazy ownership only for Oracle. That expectation is incompatible with the already-canonical true-lazy Projects/Operations presentation owners and with Candidate A.

The VNext diagnostic must be owner-aware rather than legacy-script-aware.

## Residency Audit VNext — complete proposed code

The following design is intentionally read-only and demand-only. It does not hydrate, open, detach, clone, fetch, write storage, create timers/observers, or mutate engine state.

```js
/* Agent-Crypto @erith.IA — Residency Audit VNext design
   READ-ONLY / DEMAND-ONLY / OWNER-AWARE
   Candidate A design artifact only: do not deploy until Firefox/operator acceptance. */
(()=>{
  "use strict";

  const BUILD="CANDIDATE-A-DESIGN";
  const PROTECTED=Object.freeze([
    "#analyste",
    "#detailPanel",
    "#atlasStorageHealth40198",
    "#atlasGreyPlateForensic40393"
  ]);
  const EXPECTED_REGISTERED=Object.freeze(["system","atlas"]);
  const EXPECTED_TRUE_LAZY=Object.freeze(["projects","operations","system","oracle"]);
  const SYSTEM_GENERIC_KEYS=Object.freeze(["simulation"]);

  const now=()=>new Date().toISOString();
  const safeCount=node=>{try{return node?1+node.querySelectorAll("*").length:0;}catch{return node?1:0;}};

  function duplicateIds(){
    const seen=new Map(),dupes=[];
    document.querySelectorAll("[id]").forEach(node=>{
      const id=String(node.id||"");
      if(!id)return;
      const count=(seen.get(id)||0)+1;
      seen.set(id,count);
      if(count===2)dupes.push(id);
    });
    return dupes;
  }

  function protectedSnapshot(){
    return PROTECTED.map(selector=>{
      const node=document.querySelector(selector);
      return Object.freeze({
        selector,
        exists:!!node,
        connected:node?.isConnected===true,
        subtree_nodes:safeCount(node)
      });
    });
  }

  function familyRollup(registrations){
    return Object.freeze(registrations.map(reg=>{
      const records=Array.isArray(reg?.records)?reg.records:[];
      const detached=records.filter(record=>record?.detached===true);
      const trackedNodes=records.reduce((sum,record)=>sum+(Number(record?.cached_nodes)||0),0);
      const detachedNodes=detached.reduce((sum,record)=>sum+(Number(record?.cached_nodes)||0),0);
      return Object.freeze({
        id:String(reg?.id||""),
        details:Number(reg?.details||records.length||0),
        records:records.length,
        keys:Object.freeze(records.map(record=>String(record?.key||""))),
        detached_records:detached.length,
        resident_records:records.length-detached.length,
        tracked_subtree_nodes:trackedNodes,
        detached_subtree_nodes:detachedNodes
      });
    }));
  }

  function lazyTransports(){
    return Object.freeze({
      projects:globalThis.ErithProjectsPresentation40420?.snapshot?.()||null,
      operations:globalThis.ErithOperationsPresentation40421?.snapshot?.()||null,
      system:globalThis.ErithSystemPresentation40424?.snapshot?.()||null,
      oracle:globalThis.ErithOraclePresentation?.snapshot?.()||null
    });
  }

  function run(){
    const life=globalThis.ErithPresentationLifecycle;
    const lifecyclePresent=!!life;
    const registrations=lifecyclePresent&&typeof life.residencySnapshot==="function"
      ? life.residencySnapshot()
      : [];
    const measurements=lifecyclePresent&&typeof life.measurementSnapshot==="function"
      ? life.measurementSnapshot()
      : [];

    const protectedState=protectedSnapshot();
    const ids=duplicateIds();
    const transports=lazyTransports();
    const violations=[];

    if(!lifecyclePresent)violations.push("lifecycle-missing");

    protectedState.forEach(item=>{
      if(!item.exists)violations.push(`protected-missing:${item.selector}`);
      else if(!item.connected)violations.push(`protected-disconnected:${item.selector}`);
    });

    ids.forEach(id=>violations.push(`duplicate-id:${id}`));

    const registrationIds=registrations
      .map(reg=>String(reg?.id||""))
      .filter(Boolean);

    EXPECTED_REGISTERED.forEach(id=>{
      if(!registrationIds.includes(id))violations.push(`missing-registration:${id}`);
    });

    registrationIds.forEach(id=>{
      if(!EXPECTED_REGISTERED.includes(id))violations.push(`unexpected-registration:${id}`);
    });

    EXPECTED_TRUE_LAZY.forEach(id=>{
      if(!transports[id])violations.push(`missing-true-lazy-owner:${id}`);
    });

    registrations.forEach(reg=>{
      (reg.records||[]).forEach(record=>{
        if(record.open&&record.detached)violations.push(`open-detached:${reg.id}:${record.key}`);
        if(!record.connected)violations.push(`details-disconnected:${reg.id}:${record.key}`);
      });
    });

    const systemRegistration=registrations.find(reg=>String(reg?.id||"")==="system")||null;
    const systemKeys=(systemRegistration?.records||[]).map(record=>String(record?.key||""));

    SYSTEM_GENERIC_KEYS.forEach(key=>{
      if(!systemKeys.includes(key))violations.push(`system-generic-missing:${key}`);
    });

    systemKeys.forEach(key=>{
      if(!SYSTEM_GENERIC_KEYS.includes(key))violations.push(`system-generic-unexpected:${key}`);
    });

    const rollup=familyRollup(registrations);
    const totalRecords=rollup.reduce((n,item)=>n+item.records,0);
    const detachedRecords=rollup.reduce((n,item)=>n+item.detached_records,0);
    const trackedNodes=rollup.reduce((n,item)=>n+item.tracked_subtree_nodes,0);
    const detachedNodes=rollup.reduce((n,item)=>n+item.detached_subtree_nodes,0);

    return Object.freeze({
      build:BUILD,
      generated_at:now(),
      mode:"read-only-manual-owner-aware-audit",
      lifecycle_present:lifecyclePresent,
      lifecycle_build:String(life?.build||""),
      expected_registered_families:Object.freeze([...EXPECTED_REGISTERED]),
      expected_true_lazy_families:Object.freeze([...EXPECTED_TRUE_LAZY]),
      expected_system_generic_keys:Object.freeze([...SYSTEM_GENERIC_KEYS]),
      active_registrations:Number(life?.activeRegistrations?.()||0),
      registered_records:totalRecords,
      protected_nodes:Object.freeze(protectedState),
      duplicate_ids:Object.freeze(ids),
      detached_records:detachedRecords,
      resident_records:totalRecords-detachedRecords,
      tracked_subtree_nodes:trackedNodes,
      detached_subtree_nodes:detachedNodes,
      cached_subtree_nodes:detachedNodes,
      family_rollup:rollup,
      lazy_transports:transports,
      measurements,
      registrations,
      healthy:violations.length===0,
      violations:Object.freeze(violations),
      mutations_performed:false,
      timer_added:false,
      observer_added:false,
      fetch_added:false,
      websocket_added:false,
      storage_write_added:false,
      engine_state_changed:false
    });
  }

  const api=Object.freeze({
    build:BUILD,
    run,
    protected_selectors:PROTECTED,
    expected_registered_families:EXPECTED_REGISTERED,
    expected_true_lazy_families:EXPECTED_TRUE_LAZY,
    expected_system_generic_keys:SYSTEM_GENERIC_KEYS,
    read_only:true,
    automatic_run:false,
    timer_added:false,
    observer_added:false,
    fetch_added:false,
    websocket_added:false,
    storage_write_added:false,
    dom_mutation_added:false
  });

  globalThis.ErithResidencyAudit=api;
  globalThis.ErithResidencyAuditVNext=api;
})();
```

## PROUVÉ — VNext independence from removed generic Projects/Operations owners

The proposed diagnostic never reads:

- `ErithProjectsDemandResidency*`
- `ErithOperationsDemandResidency*`

It reads only their canonical true-lazy presentation APIs:

- `ErithProjectsPresentation40420`
- `ErithOperationsPresentation40421`

Therefore removing the two legacy parser scripts from `index.html` cannot by itself make VNext fail.

## Static diff review — six-file Candidate A boundary

### 1. index.html

Allowed delta only:

- remove parser load of `js/views/projects-demand-residency.js`
- remove parser load of `js/views/operations-demand-residency.js`

Forbidden in Candidate A:

- no reorder of presentation/lifecycle owners
- no Atlas script changes
- no Learning changes
- no Market Core/app.js changes
- no Oracle changes

Static budget effect: two parser scripts removed, no new parser script.

### 2. js/views/system-demand-residency.js

Allowed delta:

- selectors 5 → 1 (`simulation` only)
- retain storage/grey resident truth flags
- retain 40414 + 40488 compatibility aliases
- add stable current alias `ErithSystemDemandResidency`

No timer/observer/fetch/storage/clone/Window Manager/engine change.

### 3. js/views/residency-audit.js

Replace stale family expectations with VNext owner-aware model above.

No automatic run. No mutation. No network. No storage. No hydration trigger.

### 4. architecture/administrator-ownership.json

Correct CURRENT ownership only:

- Projects presentation owner = `js/views/projects-presentation.js + views/projects.html`
- Operations presentation owner = `js/views/operations-presentation.js + views/operations.html`
- System peripheral presentation remains `js/views/system-presentation.js + views/system.html`
- explicitly record Simulation generic closed-body residency as distinct from System true-lazy peripherals
- Storage Health / Grey Plate remain resident protected

Do not modify `architecture/final-residency.json`.

### 5. version.json

At real staging only:

- set actual candidate build/parent/token
- recompute SHA-256 for every changed tracked file
- add `js/views/residency-audit.js` to file hash map if absent
- no guessed hashes in design phase

### 6. administrator-version.json

At real staging only:

- update actual candidate build/parent/token
- record owner-consolidation scope accurately
- do not claim deletion of Projects/Operations legacy files

## Runtime budget proof

Candidate A static budget remains:

- parser scripts: -2
- generic residency registrations: -2
- System generic selectors: 5 → 1
- timers added: 0
- observers added: 0
- WebSockets added: 0
- storage writers added: 0
- business-data network owners added: 0
- app.js/js/app.js modifications: 0

## Debt state after Pass 09

### CLOSED AT STATIC-DESIGN LEVEL

- Projects generic residency retirement proof
- Operations generic residency retirement proof
- System generic residency reduction boundary
- Storage Health canonical protected selector proof
- Grey Plate canonical protected selector proof
- Residency VNext architecture and legacy-owner independence
- final-residency historical immutability requirement

### OPEN / PROTECTED

- Firefox/operator viability of Candidate A
- Atlas peripheral hash/router debt
- Atlas insertAdjacentHTML architectural debt
- Learning post-parse recovery
- no-local-producer / Ryzen OFFLINE-N/A truth
- shared monolith
- Backend/Source Intelligence watch

### CLOSED UNLESS NEW EVIDENCE

- Oracle owner consolidation

## Candidate decision

Candidate A is now STATICALLY SPECIFIED and suitable for a future isolated staging/package review.

It is NOT yet a viable runtime Build because Firefox/operator acceptance has not occurred. Therefore no Build is created in this pass.

## Next target — Pass 10

1. Prepare an isolated, non-live staging representation of the six Candidate A files under coordination only, or an exact patch artifact, without `auto_update/request.json`.
2. Compute real hashes only against that isolated staging.
3. Run syntax/static invariant checks over the staged JS/JSON/HTML.
4. Produce an operator Firefox acceptance matrix covering cold boot, first-click Administration, Projects, Operations, Simulation, Backend lazy handoff, Storage Health, Grey Plate, Window Manager, Atlas/Oracle smoke, duplicate IDs and diagnostic VNext.
5. Do not version a runtime Build until operator PASS is available.
