# Agent-Crypto @erith.IA — Audit cumulatif Pass 11 — Lifecycle Snapshot Oracle

Date: 2026-08-28
Status: AUDIT / NON-DEPLOYING

## 0. HEAD verification

HEAD repository observed at the beginning of Pass 11: `80c91fcb6f27bd335d5661f73193808cafdd5b26`.

That HEAD is newer than Pass 10 because two automation commits followed the Pass 10 report:
- `43480d4f274534280f3e0ec9fc2991b4e2b90377` — public metals market snapshot archive;
- `80c91fcb6f27bd335d5661f73193808cafdd5b26` — Seven Heaven dual YouTube data update.

Neither commit is an Administrator runtime publication. Runtime authority therefore remains separately:
- Administrator: 40.4.88
- runtime commit authority: `0b8672c4d2481bf21205e2cc74082ea591175d08`
- Market Core: 38.15.11 PROTECTED

Pass 11 adds only coordination evidence. No live Administrator file is modified.

## 1. Staging drift check

PROUVÉ: no post-Pass10 drift was found in `coordination/inter_ai_dialogues/agent_crypto/candidate_a_pass10_staging/`.

Repository path history shows the latest commits touching that staging are its own Pass10 materialization commits, ending with the Firefox matrix commit `5b867a85540cbfd4d98e87d1bb11cc85eb8d8246`. Later repository HEAD commits do not touch the staging path.

`candidate_a_pass10_staging/SHA256SUMS.txt` still carries the same six patch-artifact hashes and explicitly states that they are staging hashes only, not runtime publication hashes.

Conclusion: Candidate A staging is unchanged at Pass 11.

## 2. Exact generic lifecycle API shape

PROUVÉ from `public/agent_crypto_erith_ia/administrator/js/views/view-lifecycle.js`:

Global API:
- `ErithPresentationLifecycle`
- compatibility alias `ErithPresentationLifecycle40411`

Relevant read/registration API:
- `measurementSnapshot()`
- `residencySnapshot()`
- `registerClosedBodyFamily(config)`
- `restoreForHash(hash)`
- `activeRegistrations()`

`residencySnapshot()` returns registrations containing:
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
- `last_detached_at`
- `last_restored_at`

The generic lifecycle performs same-node detach/restore through a DocumentFragment. It does not clone the closed body. It emits `erith:presentation-resident` after restore. Its hash bridge restores a detached record containing the requested id, then opens the detail.

This exact shape is sufficient to create an objective before/after Firefox oracle for Candidate A.

## 3. Projects true-lazy snapshot contract

PROUVÉ from `projects-presentation.js` 40.4.20:
- API: `ErithProjectsPresentation40420`;
- five stable parser-mounted shells;
- one shared same-origin source fetch cached for the session;
- row snapshot fields: `key`, `open`, `body_state`, `anchor_present`;
- top snapshot includes `source_fetch_count`, `hydration_count`, `last_error` and rows;
- hydration states are observable as placeholder/loading/ready/error;
- canonical routing anchor stays in the always-connected summary shell;
- matching source-body duplicate id is removed during hydration;
- event `erith:projects-hydrated` follows successful hydration.

Candidate A expected lifecycle:
- cold boot: source_fetch_count 0, hydration_count 0, untouched rows placeholder;
- first demand K: K becomes ready, source fetch becomes 1, hydration count increments;
- reopen K: K remains ready and no second fetch/hydration is required;
- generic lifecycle snapshot must contain no `projects` registration after Candidate A.

This proves the correct operator observable independently of the legacy Projects demand-residency wrapper.

## 4. Operations true-lazy snapshot contract

PROUVÉ from `operations-presentation.js` 40.4.21:
- API: `ErithOperationsPresentation40421`;
- four parser-mounted stable shells/anchors;
- shared/cached same-origin source fetch;
- row snapshot fields: `key`, `open`, `body_state`, `anchor_present`;
- top snapshot includes `source_fetch_count`, `hydration_count`, `action_bind_count`, `last_error`;
- actions are rebound after hydration with dataset once-only guards;
- event `erith:operations-hydrated` follows successful hydration;
- canonical duplicate anchor id is removed from the hydrated source clone.

Candidate A expected lifecycle:
- cold boot: source_fetch_count 0, hydration_count 0, untouched rows placeholder;
- first demand K: K becomes ready and source fetch becomes 1;
- reopen K: no repeated source fetch and no duplicate action binding;
- generic lifecycle snapshot must contain no `operations` registration after Candidate A.

## 5. System split — exact observable boundary

PROUVÉ from `system-presentation.js` 40.4.24:
- Storage Health, Grey Plate Forensic, Simulation and Learning remain parser-mounted;
- Commandes, Backend, Safety and Physical Security are the true-lazy peripheral bodies;
- API: `ErithSystemPresentation40424`;
- snapshot rows expose `key`, `open`, `body_state`, `anchor_present`;
- top snapshot exposes shared source fetch/hydration/action-bind counters;
- `storage_health_resident:true` and `grey_plate_forensic_resident:true` are explicit API/snapshot invariants.

Candidate A generic `system` must therefore own Simulation only. Its expected generic lifecycle transition is mechanical:
- initial closed sweep: Simulation record detached with detach_count incremented;
- first Simulation demand: same body nodes restored, detached false, restore_count incremented;
- close again: same nodes detached and detach_count increments again.

The four true-lazy System peripherals must never appear as generic System records under Candidate A.

Storage Health `#atlasStorageHealth40198` and Grey Plate `#atlasGreyPlateForensic40393` must remain connected and outside generic closed-body records for the entire operator run.

## 6. Atlas

No debt is closed here.

Candidate A leaves Atlas generic residency and Atlas peripheral true-lazy logic unchanged. The Atlas main cockpit remains protected. Atlas in Pass 11 is a smoke/non-regression target only.

The known Atlas peripheral direct-hash/router debt and the bounded `insertAdjacentHTML` interception debt remain OPEN and outside Candidate A.

## 7. New operator oracle published

New coordination artifact:

`coordination/inter_ai_dialogues/agent_crypto/candidate_a_pass10_staging/LIFECYCLE_EXPECTED_SNAPSHOTS.md`

It defines:
- exact APIs to capture;
- cold-boot expectations;
- first-demand transitions;
- close/reopen expectations;
- expected separation generic-vs-true-lazy;
- a mechanical Firefox console capture object;
- PASS/FAIL conditions that block Build authorization on mismatch.

This is not a Build and is not runtime code.

## 8. Candidate A status

Previous:
`ISOLATED PATCH STAGING READY / STATIC CHECKS PASS / FIREFOX OPERATOR PASS REQUIRED`

Pass 11:
`STAGING NO-DRIFT PROVEN / LIFECYCLE SNAPSHOT ORACLE READY / FIREFOX OPERATOR PASS STILL REQUIRED`

No real Firefox/operator evidence exists in this audit context. Therefore:
- no PASS is fabricated;
- no Build is created;
- no runtime version/token is selected;
- no runtime publication hashes are created;
- no `auto_update/request.json` is created;
- no file under `public/agent_crypto_erith_ia/administrator/` is modified.

## 9. Debt ledger after Pass 11

CLOSED / PROVEN FOR CANDIDATE A DESIGN:
- Projects generic residency removable from load graph;
- Operations generic residency removable from load graph;
- System generic residency reducible to Simulation only;
- Storage Health/Grey Plate protected resident boundary;
- diagnostic VNext static contract;
- Candidate A six-file boundary;
- static budget non-increase;
- Pass10 staging no-drift;
- lifecycle snapshot shapes and expected first-demand transitions.

OPEN:
- real Firefox/operator viability proof for Candidate A;
- runtime manifest hashes only after real staging is authorized;
- Atlas peripheral hash/router;
- Atlas insertAdjacentHTML interception debt;
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

## 10. Next target

Pass 12 should not create a Build without actual Firefox/operator evidence.

Useful next audit work if no operator evidence appears:
1. map the exact Window Manager/hash route path that causes Project/Operations shell opening, to ensure the expected true-lazy hydration event order is objective;
2. establish Backend `erith:system-hydrated` post-hydration handoff observables without changing Backend;
3. enrich the acceptance matrix with exact before/after console assertions rather than subjective visual checks;
4. keep Atlas/Learning/no-local-producer entirely separate from Candidate A.

No Build just to advance a number.
