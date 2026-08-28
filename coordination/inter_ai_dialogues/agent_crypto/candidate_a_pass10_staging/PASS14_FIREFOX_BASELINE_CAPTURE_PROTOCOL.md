# Agent-Crypto @erith.IA — Candidate A — Pass 14 Firefox baseline/staging capture protocol

Date: 2026-08-28
Status: TEST ORACLE / NON-DEPLOYING / READ-ONLY CAPTURE

This file is a manual/operator acceptance protocol only. It does not belong to the runtime and must not be copied into `public/agent_crypto_erith_ia/administrator/`.

## 1. Authority

Baseline runtime authority:
- Administrator `40.4.88`
- runtime commit `0b8672c4d2481bf21205e2cc74082ea591175d08`
- Market Core `38.15.11` PROTECTED

Candidate A remains staged only under coordination.

## 2. Exact canonical direct-hash matrix

The following nine hashes are the complete canonical summary-anchor set exposed by the two true-lazy presentation owners.

### Projects — ErithProjectsPresentation40420

| key | canonical hash | shell selector |
| --- | --- | --- |
| fonds-erith | `#fonds-erith-ia` | `details[data-project-lazy-shell-40420="true"][data-collapse-key="fonds-erith"]` |
| association-erith | `#association-erith-ia` | `details[data-project-lazy-shell-40420="true"][data-collapse-key="association-erith"]` |
| aerith-enfance | `#aerith-enfance` | `details[data-project-lazy-shell-40420="true"][data-collapse-key="aerith-enfance"]` |
| aerith-animaux | `#aerith-animaux` | `details[data-project-lazy-shell-40420="true"][data-collapse-key="aerith-animaux"]` |
| aerith-terre-vivante | `#aerith-terre-vivante` | `details[data-project-lazy-shell-40420="true"][data-collapse-key="aerith-terre-vivante"]` |

### Operations — ErithOperationsPresentation40421

| key | canonical hash | shell selector |
| --- | --- | --- |
| situation | `#situation` | `details[data-operations-lazy-shell-40421="true"][data-collapse-key="situation"]` |
| questionnaire | `#questionnaire` | `details[data-operations-lazy-shell-40421="true"][data-collapse-key="questionnaire"]` |
| briefing | `#briefing` | `details[data-operations-lazy-shell-40421="true"][data-collapse-key="briefing"]` |
| planning | `#planning` | `details[data-operations-lazy-shell-40421="true"][data-collapse-key="planning"]` |

## 3. Required two-run method

For each of the nine hashes, perform the same sequence twice:

1. baseline 40.4.88 in Firefox;
2. isolated Candidate A staging in Firefox.

Do not infer the expected direct-hash behavior from comments. Record the observed behavior first.

For each URL/hash record:

- `anchor_present`: `document.getElementById(id) !== null`
- `anchor_connected`: `document.getElementById(id)?.isConnected === true`
- `shell_present`
- `shell_open`
- body hydration state from the relevant `data-project-hydration-40420` or `data-operations-hydration-40421`
- owner snapshot row for the key
- source fetch count
- hydration count
- duplicate-id count
- console errors attributable to the route/hydration
- visible scroll/focus destination as operator observation

### Acceptance rule

Candidate A PASS does **not** require a preconceived shell-opening behavior.

It requires:

- anchor presence/connectivity equal to baseline;
- shell-open behavior equal to baseline for each hash;
- hydration state equal or better, with no duplicate hydration/refetch regression;
- no new console error;
- duplicate ids remain zero;
- no loss of Window Manager structural membership.

If baseline itself fails to open a disclosure for a hash, Candidate A is not allowed to silently repair that behavior. Record it as baseline behavior and keep routing debt separate.

## 4. Projects mechanical capture

At each Project hash, capture:

```js
({
  href: location.href,
  hash: location.hash,
  anchor: document.getElementById(decodeURIComponent(location.hash.slice(1)))?.isConnected === true,
  owner: globalThis.ErithProjectsPresentation40420?.snapshot?.() || null,
  duplicate_ids: [...document.querySelectorAll('[id]')].map(n=>n.id).filter((id,i,a)=>id && a.indexOf(id)!==i)
})
```

The owner snapshot must remain build `40.4.20` and expose the five canonical rows.

## 5. Operations mechanical capture

At each Operations hash, capture:

```js
({
  href: location.href,
  hash: location.hash,
  anchor: document.getElementById(decodeURIComponent(location.hash.slice(1)))?.isConnected === true,
  owner: globalThis.ErithOperationsPresentation40421?.snapshot?.() || null,
  duplicate_ids: [...document.querySelectorAll('[id]')].map(n=>n.id).filter((id,i,a)=>id && a.indexOf(id)!==i)
})
```

The owner snapshot must remain build `40.4.21` and expose the four canonical rows.

## 6. Window Manager structural oracle

Static authority in unchanged `js/app.js`:

- `missionEntries40302()` owns the Missions/Projects family membership;
- canonical Project keys are exactly `fonds-erith`, `association-erith`, `aerith-enfance`, `aerith-animaux`, `aerith-terre-vivante`;
- `preparationEntries40308()` owns the Preparation/Operations family;
- `js/app.js` is outside Candidate A and must remain byte-identical in a future real candidate.

Because no stable global manager-instance snapshot getter is proven, do not invent one.

Operator capture must compare baseline vs staging at three moments:

1. cold boot before any Project/Operations demand;
2. after first Project demand + first Operations demand;
3. after close/reopen of the same disclosures.

Record visible Window Manager totals/status, missing-shell errors, minimized state and geometry behavior. The structural entry shells must remain present at all three moments.

## 7. Candidate A machine assertions

Alongside every staging run execute the existing coordination-only `PASS13_MACHINE_ASSERTIONS.js`.

Required final invariants:

- `healthy === true`;
- generic registration families exactly `atlas`, `system`;
- generic System record keys exactly `simulation`;
- duplicate ids empty;
- `#analyste`, `#detailPanel`, `#atlasStorageHealth40198`, `#atlasGreyPlateForensic40393` connected;
- all nine Project/Operations summary anchors connected;
- true-lazy Project/Operations snapshots present.

For Backend, retain the Pass 12 event oracle: a successful first demand must emit `erith:system-hydrated` with `detail.key === "backend"`, while Backend remains absent from generic System records.

## 8. Protected non-regression smoke

The same Firefox session must confirm no Candidate A regression to:

- Market Core `38.15.11`;
- Graph Context V7;
- Graphique;
- Top 5;
- CURRENT critical state/history;
- Storage Health;
- Grey Plate;
- Atlas main cockpit;
- Oracle smoke;
- Window Manager geometry;
- IndexedDB/business state.

## 9. Decision gate

Only a real operator comparison with all required fields recorded can change Candidate A from `FIREFOX PASS REQUIRED` to runtime-candidate viable.

No Build, runtime token, publication SHA map or `auto_update/request.json` may be created from this protocol alone.
