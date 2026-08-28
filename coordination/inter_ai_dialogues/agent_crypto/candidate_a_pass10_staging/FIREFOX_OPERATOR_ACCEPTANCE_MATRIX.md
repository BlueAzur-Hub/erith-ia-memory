# Agent-Crypto @erith.IA — Candidate A Firefox/operator acceptance matrix

Status: REQUIRED BEFORE ANY RUNTIME BUILD
Baseline: Administrator 40.4.88 / Market Core 38.15.11
Candidate scope: owner consolidation + Residency Audit VNext only

## Global preconditions

- Use Firefox on the canonical Administrator URL.
- Start from an unchanged 40.4.88 baseline, then apply Candidate A only in an isolated test copy.
- Do not modify app.js, js/app.js, Market Core, Graph Context V7, Atlas CURRENT, Oracle engine, IndexedDB schemas, Window Manager geometry or Bridge/Backend.
- Preserve legacy Projects/Operations residency files physically; they must merely be absent from the parser load graph.
- Record console errors/warnings and the output of `ErithResidencyAudit.run()` after each relevant phase.

## Acceptance matrix

| Gate | Operator path | PASS condition | FAIL / stop condition |
|---|---|---|---|
| 1 Cold boot | Hard reload Administrator | Header and common workspace paint; no fatal JS error; Market Core remains 38.15.11 | blank/frozen shell, fatal parser error, Market Core identity drift |
| 2 First-click Administration | Click Administration immediately during early paint | Existing first-click intent gate still consumes/opens correctly | click lost, repeated activation, auth/session regression |
| 3 Projects first demand | Open Projects then each heavy project disclosure | true-lazy body hydrates on first demand; canonical content/actions present | empty body, duplicate body, stale generic owner required |
| 4 Projects reopen | close/reopen hydrated Project disclosure | stable content, no duplicate IDs, no second owner | duplicated DOM, action loss, geometry corruption |
| 5 Operations first demand | Open Operations then questionnaire/briefing/planning disclosures | true-lazy hydration + controls/actions parity | missing actions/state or dependence on legacy generic owner |
| 6 Operations reopen | close/reopen | stable state and no duplicate IDs | duplication/state loss |
| 7 System Simulation | Open System → Simulation | Simulation generic record opens/attaches correctly; Learning remains functional under protected contract | simulation missing, open-detached violation, Learning regression |
| 8 System true-lazy peripherals | Open Commandes, Backend, Safety, Physical Security one by one | each hydrates through System presentation owner; no generic System record for these keys | missing hydration, duplicate owner, unexpected generic key |
| 9 Backend handoff | Open Backend and trigger only existing read-only UI path | existing `erith:system-hydrated`/backend behavior remains intact; no new poller | Source Intelligence/Backend regression attributable to Candidate A |
| 10 Storage Health | Inspect `#atlasStorageHealth40198` before/after System interactions | node exists + `isConnected===true` throughout | missing/disconnected/demand-detached |
| 11 Grey Plate | Inspect `#atlasGreyPlateForensic40393` | node exists + connected throughout | missing/disconnected/demand-detached |
| 12 Window Manager | detach/move/minimize/restore/dock Projects, Operations, System families | geometry and restore behavior unchanged | lost placeholder, wrong parent, size/drag regression |
| 13 Atlas smoke | open main Atlas cockpit + one already-supported peripheral path | main cockpit unchanged; no Candidate A-induced Atlas regression | Atlas main cockpit disappears or routing worsens |
| 14 Oracle smoke | open Oracle and heavy presentation | canonical true-lazy Oracle remains sole owner; no legacy requirement | duplicate Oracle owner or hydration failure |
| 15 Graph / Top 5 | use Graphique controls, Top 5, comparison | no behavioral/performance regression | chart/top5/current regression |
| 16 CURRENT protected | inspect historical CURRENT/memory only; do not force new compute | existing CURRENT remains readable and unchanged | fingerprint/cadence/storage mutation |
| 17 Residency Audit VNext | demand-load diagnostic, run `ErithResidencyAudit.run()` | `healthy===true`; registered families exactly System+Atlas; System generic keys exactly `[simulation]`; true-lazy Projects/Operations/System/Oracle present; protected nodes connected; duplicate_ids empty | any violation not explained by a pre-existing baseline defect |
| 18 Console | inspect entire run | no new Candidate A errors; no calls to removed globals | ReferenceError to Projects/Operations legacy residency APIs |
| 19 Performance smoke | mouse hover/click/scroll common workspace and System/Projects/Operations | no renewed severe hover/mouse freeze; responsiveness at least baseline-class | reproducible new freeze/contention |
| 20 Reload persistence | reload after normal interactions | no persisted-state corruption; families recover normally | stale detached state or invisible family after reload |

## Required evidence bundle

- Firefox version + OS.
- Candidate staging identifier / exact SHA-256 publication payload when eventually versioned.
- console capture for cold boot and final state.
- `ErithResidencyAudit.run()` JSON result.
- screenshots: Administrator common workspace, Projects hydrated, Operations hydrated, System Simulation + Storage/Grey visible, Atlas smoke, Oracle smoke.
- explicit operator verdict: PASS or FAIL for each gate 1–20.

## Publication rule

No runtime Build and no `auto_update/request.json` until all Candidate-A-relevant gates PASS. A failure reopens the specific ownership hypothesis; do not broaden surgery to Atlas, Learning, Bridge/no-local-producer, Backend/Source Intelligence or the shared monolith in the same candidate.
