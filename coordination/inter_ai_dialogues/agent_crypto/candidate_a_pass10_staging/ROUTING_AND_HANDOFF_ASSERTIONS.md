# Agent-Crypto @erith.IA — Candidate A — Routing + Handoff Assertions

Status: NON-DEPLOYING TEST ORACLE
Baseline runtime: Administrator 40.4.88
Scope: Candidate A owner consolidation only

## 1. Purpose

This artifact adds objective console assertions for responsibilities that must remain outside the retired Projects/Operations generic residency wrappers.

It does not authorize a Build, does not create `auto_update/request.json`, and does not modify the live Administrator runtime.

## 2. Proven ownership separation

### Projects

Canonical parser-mounted true-lazy owner: `js/views/projects-presentation.js` 40.4.20.

Stable shells are identified by `data-project-lazy-shell-40420="true"`. Canonical anchors are mounted in each always-connected `<summary>`:
- `fonds-erith-ia`
- `association-erith-ia`
- `aerith-enfance`
- `aerith-animaux`
- `aerith-terre-vivante`

The owner itself handles hydration on disclosure toggle and on `erith:presentation-resident`, and exposes `ErithProjectsPresentation40420.snapshot()`.

### Operations

Canonical parser-mounted true-lazy owner: `js/views/operations-presentation.js` 40.4.21.

Stable shells are identified by `data-operations-lazy-shell-40421="true"`. Canonical anchors are mounted in the always-connected summaries:
- `situation`
- `questionnaire`
- `briefing`
- `planning`

The owner handles first-demand hydration and action rebinding and exposes `ErithOperationsPresentation40421.snapshot()`.

### Generic lifecycle non-responsibility for those summary anchors

`ErithPresentationLifecycle.restoreForHash()` can only locate an id through `cachedContainsId(record,id)`, which searches `record.nodes` while a record is detached. `record.nodes` are the non-summary child nodes of the `<details>`.

Therefore the canonical Projects/Operations anchors deliberately mounted in `<summary>` are not owned by generic `restoreForHash()`.

Removing the `projects` and `operations` generic registrations in Candidate A does not remove hash ownership for those summary anchors from the generic lifecycle because that lifecycle is not responsible for them in baseline 40.4.88.

This does NOT claim that every direct-hash route currently opens the corresponding disclosure. It only proves non-responsibility of the retired generic owner. Direct-hash opening behavior remains an operator baseline/non-regression observation.

## 3. Window Manager shell ownership

Shared `js/app.js` remains untouched by Candidate A.

Projects/Missions membership is resolved through `missionEntries40302()`, based on the parser-mounted Missions intro and Project detail shells.

Operations membership is resolved through `preparationEntries40308()`, and the `preparation-operations` Window Manager entry explicitly resolves through that function.

Candidate A removes no Project/Operations shell and changes no Window Manager code. Therefore the Window Manager membership path remains structurally present independently of the retired generic residency registrations.

## 4. Firefox mechanical assertions

Run before first disclosure:

```js
const candidateARoutingBaseline = {
  genericIds: (globalThis.ErithPresentationLifecycle?.residencySnapshot?.() || []).map(x => x.id),
  projects: globalThis.ErithProjectsPresentation40420?.snapshot?.(),
  operations: globalThis.ErithOperationsPresentation40421?.snapshot?.(),
  projectAnchors: ["fonds-erith-ia","association-erith-ia","aerith-enfance","aerith-animaux","aerith-terre-vivante"].map(id => ({id,connected:!!document.getElementById(id)?.isConnected,summary:document.getElementById(id)?.closest("summary") instanceof HTMLElement})),
  operationAnchors: ["situation","questionnaire","briefing","planning"].map(id => ({id,connected:!!document.getElementById(id)?.isConnected,summary:document.getElementById(id)?.closest("summary") instanceof HTMLElement}))
};
candidateARoutingBaseline;
```

Expected Candidate A:
- `genericIds` contains `system` and `atlas`;
- `genericIds` does not contain `projects` or `operations`;
- every Project/Operations canonical anchor is connected and inside a summary;
- Projects/Operations snapshots exist before first demand.

After opening one Project and one Operations disclosure, capture:

```js
({
  projects: globalThis.ErithProjectsPresentation40420?.snapshot?.(),
  operations: globalThis.ErithOperationsPresentation40421?.snapshot?.(),
  duplicates: [...document.querySelectorAll("[id]")].map(n=>n.id).filter((id,i,a)=>id && a.indexOf(id)!==i)
})
```

Expected:
- demanded rows become `ready`;
- `source_fetch_count` remains session-cached;
- no duplicate canonical anchor ids;
- no generic Projects/Operations registration appears after demand.

## 5. Backend post-hydration observable

System true-lazy owner emits:

`erith:system-hydrated` with detail `{ build: "40.4.24", key }`

after hydration reconciliation.

For Backend acceptance, install an operator-only temporary listener in Firefox before opening Backend:

```js
window.__candidateASystemHydratedEvents = [];
window.addEventListener("erith:system-hydrated", e => window.__candidateASystemHydratedEvents.push({key:e.detail?.key,build:e.detail?.build}), {passive:true});
```

After first Backend disclosure:

```js
({
  events: window.__candidateASystemHydratedEvents,
  system: globalThis.ErithSystemPresentation40424?.snapshot?.()
})
```

PASS requires at least one event with `key === "backend"` and the Backend row in `ready` state. Candidate A must not add a generic System record for Backend.

The listener is a manual Firefox test probe only. It is not candidate runtime code.

## 6. Blocking conditions

Build remains blocked if any of the following occurs:
- Project/Operations parser shells or canonical summary anchors are missing;
- Window Manager can no longer present Missions de vie or Préparation & opérations;
- first-demand hydration does not reach `ready`;
- source fetch repeats unexpectedly on reopen;
- duplicate canonical ids appear;
- Backend does not emit its hydration event or remains non-ready;
- a generic Projects/Operations registration reappears;
- System generic residency includes Backend or another true-lazy peripheral.

No Build is authorized by this artifact alone. Firefox/operator evidence remains mandatory.
