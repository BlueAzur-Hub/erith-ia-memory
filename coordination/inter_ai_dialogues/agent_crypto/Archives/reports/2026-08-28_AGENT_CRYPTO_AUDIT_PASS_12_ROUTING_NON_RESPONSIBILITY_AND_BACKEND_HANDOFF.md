# Agent-Crypto @erith.IA — Audit cumulatif Pass 12 — Routing non-responsibility + Backend handoff

Date: 2026-08-28
Status: AUDIT / NON-DEPLOYING

## 0. HEAD and runtime authority

Repository HEAD observed at the beginning of Pass 12: `bcfc1d6885921ff3e37e562fcbdfa0744f7f5df6`.

The commits after Pass 11 were automatic public crypto snapshot archives. No Administrator runtime publication was observed.

Runtime authority remains separately:
- Administrator: 40.4.88
- runtime commit authority: `0b8672c4d2481bf21205e2cc74082ea591175d08`
- Market Core: 38.15.11 PROTECTED

No file under `public/agent_crypto_erith_ia/administrator/` is modified by Pass 12.

## 1. New proof — generic hash bridge is not owner of true-lazy summary anchors

PROUVÉ from `js/views/view-lifecycle.js` 40.4.11/40.4.21 runtime file:

- generic closed-body residency records only non-summary child nodes as `record.nodes`;
- `restoreForHash(hash)` searches only detached `record.nodes` via `cachedContainsId(record,id)`;
- a hash is restorable by the generic lifecycle only when the requested id is contained in a detached body fragment.

PROUVÉ from Projects 40.4.20 and Operations 40.4.21 true-lazy owners:

- their canonical route anchors are intentionally mounted in always-connected `<summary>` shells;
- Projects anchors: `fonds-erith-ia`, `association-erith-ia`, `aerith-enfance`, `aerith-animaux`, `aerith-terre-vivante`;
- Operations anchors: `situation`, `questionnaire`, `briefing`, `planning`;
- matching source-body ids are removed from the hydrated clone to prevent duplicate ids.

Conclusion:

The generic lifecycle cannot be the responsible hash owner for these canonical summary anchors because they are outside the detached body nodes it searches.

Therefore Candidate A removing the `projects` and `operations` generic registrations does not retire a hash responsibility that those registrations actually owned.

Important limit: this does NOT prove that every direct hash currently opens the corresponding Project/Operations disclosure. It proves only generic-owner non-responsibility. Direct-hash opening remains a Firefox baseline/non-regression observable.

## 2. Window Manager membership remains independent

PROUVÉ from shared `js/app.js`, unchanged by Candidate A:

- Projects/Missions Window Manager membership is resolved by `missionEntries40302()` using the parser-mounted Missions intro and Project detail shells;
- the `missions-de-vie` Window Manager entry resolves through `missionEntries40302()`;
- Operations membership is resolved by `preparationEntries40308()`;
- the `preparation-operations` Window Manager entry explicitly resolves through `preparationEntries40308()`.

Candidate A removes neither Projects/Operations shells nor `js/app.js`.

Conclusion: the structural Window Manager membership path survives retirement of the two generic residency wrappers.

This closes another hidden-compatibility concern at static ownership level. Runtime geometry/presentation remains Firefox acceptance territory.

## 3. Projects/Operations true-lazy hydration remains self-owned

PROUVÉ:

Projects 40.4.20:
- disclosure `toggle` on open triggers `hydrate(key)`;
- `erith:presentation-resident` is only a parity bridge, not the sole hydration trigger;
- hash listener calls hydration only when the corresponding detail is already open;
- snapshot remains available through `ErithProjectsPresentation40420`.

Operations 40.4.21:
- same disclosure-first hydration ownership;
- action rebinding is internal to the true-lazy owner through `bindRuntimeActions()`;
- questionnaire/command bridges use existing globals rather than adding a new engine owner;
- hash listener likewise hydrates only when the shell is already open.

Candidate A therefore does not need the legacy generic wrappers to hydrate a normal operator disclosure.

## 4. Backend handoff observable tightened

PROUVÉ from `system-presentation.js` 40.4.24:

After successful true-lazy hydration/reconciliation, System dispatches:

`erith:system-hydrated`

with detail:
- `build: "40.4.24"`
- `key`

Backend can therefore be acceptance-tested without changing Backend or Source Intelligence.

Pass 12 adds an operator-only Firefox assertion:
1. install a temporary listener before opening Backend;
2. open Backend once;
3. require an event with `key === "backend"`;
4. require System presentation snapshot Backend row to be `ready`;
5. require generic System residency to contain Simulation only.

No runtime listener is added by Candidate A. This is test instrumentation only.

## 5. New coordination oracle

Published:

`coordination/inter_ai_dialogues/agent_crypto/candidate_a_pass10_staging/ROUTING_AND_HANDOFF_ASSERTIONS.md`

It adds:
- canonical anchor connectivity assertions;
- explicit proof boundary for generic hash non-responsibility;
- Window Manager structural ownership assertions;
- Project/Operations first-demand and duplicate-id capture;
- Backend `erith:system-hydrated` event capture;
- blocking conditions.

## 6. Candidate A status

Previous:
`STAGING NO-DRIFT PROVEN / LIFECYCLE SNAPSHOT ORACLE READY / FIREFOX OPERATOR PASS STILL REQUIRED`

Pass 12:
`HIDDEN COMPATIBILITY BOUNDARY TIGHTENED / ROUTING GENERIC NON-RESPONSIBILITY PROVEN / BACKEND HANDOFF ORACLE READY / FIREFOX PASS STILL REQUIRED`

No Build is created.
No runtime version/token is selected.
No runtime publication hashes are created.
No `auto_update/request.json` is created.
No live Administrator file is modified.

## 7. Debt ledger

CLOSED / PROVEN FOR CANDIDATE A STATIC DESIGN:
- Projects generic residency removable from load graph;
- Operations generic residency removable from load graph;
- retired generic wrappers are not hash owners for canonical true-lazy summary anchors;
- Window Manager membership for Projects/Operations remains structurally independent;
- normal first-demand true-lazy hydration is self-owned by presentation owners;
- System generic residency reducible to Simulation only;
- Storage Health/Grey Plate resident boundary;
- diagnostic VNext static contract;
- six-file Candidate A boundary;
- static budget non-increase;
- Pass10 staging no-drift;
- lifecycle snapshot oracle;
- Backend post-hydration event observable.

OPEN:
- real Firefox/operator viability proof for Candidate A;
- exact observed direct-hash behavior for Projects/Operations baseline vs Candidate A;
- runtime manifests/hashes only after real staging is authorized;
- Atlas peripheral hash/router;
- Atlas `insertAdjacentHTML` interception debt;
- Learning post-parse recovery;
- no-local-producer / Ryzen OFFLINE/N/A truth;
- shared monolith/non-regression debt;
- Backend/Source Intelligence WATCH without surgery.

CLOSED unless new evidence:
- Oracle owner consolidation.

PROTECTED:
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

## 8. Next target

If no real Firefox evidence appears, Pass 13 should not create a Build.

Useful next audit work:
1. map direct-hash behavior for Projects/Operations as a baseline truth separate from Candidate A, without fixing it inside Candidate A;
2. verify exact Window Manager object/snapshot API that can prove Missions/Operations membership before and after first demand;
3. add machine-readable assertions for duplicate IDs and System generic key exactness to the Firefox matrix;
4. keep Atlas, Learning and no-local-producer in separate future candidates.

No Build just to advance a number.
