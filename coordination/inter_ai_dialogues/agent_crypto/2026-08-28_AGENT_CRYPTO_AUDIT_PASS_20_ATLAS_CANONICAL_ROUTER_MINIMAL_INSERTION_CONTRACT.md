# Agent-Crypto @erith.IA — Audit Pass 20
## Atlas canonical router minimal-insertion contract

Date: 2026-08-28

## Authority boundary

Repository HEAD checked immediately before Pass 20 design publication: `6fc96ea057160b6edb579cf68bd09c84afd2e0a4`.

Non-live design package published first in this pass:

`coordination/inter_ai_dialogues/agent_crypto/2026-08-28_AGENT_CRYPTO_ATLAS_ROUTER_NON_LIVE_DESIGN_PASS20.md`

Design commit: `60dcfada6f4f647a226c919583d3e5933f5511f0`.

Runtime live remains separate and unchanged:
- Administrator `40.4.88`
- runtime authority `0b8672c4d2481bf21205e2cc74082ea591175d08`
- Market Core `38.15.11` PROTECTED

No runtime file modified. No Build. No `auto_update/request.json`. No runtime token/hash/version invented.

Candidate A remains isolated/non-deployed and still requires real Firefox/operator acceptance.

## Sources rechecked

- canonical AETHER auto-update protocol: automatic publication may not bypass Firefox/operator correctness/responsiveness validation and cannot invent a build;
- Pass 19 single-router proof;
- root `public/agent_crypto_erith_ia/administrator/app.js` current published main blob;
- `js/views/atlas-peripheral-lazy.js` 40.4.35;
- `views/atlas.html` canonical Atlas fragment.

## PROVEN — full canonical router semantic transaction

The existing `atlasV2OpenAdvancedForTarget(hash, options)` transaction is now mapped far enough to define a bounded insertion point without changing unrelated routing semantics.

The current function:

1. decodes the hash/id;
2. resolves `atlasV2ManifestEntry(id)`;
3. resolves `document.getElementById(id)`;
4. returns false immediately if the canonical node is absent;
5. checks current Atlas V2 mode;
6. rejects Intermediate-hidden entries;
7. for non-essential/adaptive targets reached from Essential, opens auth with pending hash when unauthorized, or applies existing Advanced mode when authorized;
8. resolves `atlasV2ManifestTarget(entry)` (or target itself) and restores hidden/aria-hidden presentation;
9. opens the owning `details.atlas-collapse`;
10. synchronizes `#atlasV2AdvancedModuleSelect` when the id is an option;
11. persists last module and Command Center cluster through existing owners;
12. pushes the encoded hash unless `options.updateHash === false`;
13. schedules double-rAF `scrollIntoView` unless `options.scroll === false`, with `options.instant` selecting auto vs smooth behavior;
14. returns boolean-style success.

Therefore the lazy-target fix must not fork or reproduce steps 5-14. It belongs only at the target-resolution boundary before the current fatal missing-node return.

## PROVEN — exact manifest entries

`ATLAS_V2_SECTION_MANIFEST` already contains:

- `auto-reader`: `level=advanced`, `target=closest-collapse`, `group=memory`
- `shared-memory`: `level=advanced`, `target=closest-collapse`, `group=memory`
- `github-memory`: `level=advanced`, `target=closest-collapse`, `group=memory`

The Intermediate hidden-id set contains only the five detailed Projects programme ids, so these three Atlas memory targets are not denied by that separate role rule.

## PROVEN — exact owner-shell/key mapping

`views/atlas.html` contains:

- `<details data-collapse-key="auto-reader">` containing canonical `<section id="auto-reader">`;
- `<details data-collapse-key="shared-memory">` containing canonical `<section id="shared-memory">`;
- `<details data-collapse-key="github-memory">` containing canonical `<section id="github-memory">`.

Thus for the three cold peripheral targets, `target id == lazy key == data-collapse-key`.

No invented mapping table or alternate owner id is necessary.

## PROVEN — existing lazy owner remains authoritative

`atlas-peripheral-lazy.js` 40.4.35:

- strips the three bodies from the initial Atlas source before insertion;
- retains their `<details>` shells;
- binds `toggle` on each shell;
- invokes private `hydrate(key)` only when opened;
- shares one source fetch promise;
- emits bubbling `erith:presentation-resident {family:"atlas", key, build:"40.4.35"}` after successful hydration/rebind;
- exposes diagnostics but no imperative hydrate API.

The router must therefore open the existing shell and wait for the existing event. It must not fetch `views/atlas.html`, expose private hydrate, or duplicate the lazy owner's DOM restoration.

## PROVEN — insertion point

The safe architectural insertion point is immediately around the current sequence:

`entry = atlasV2ManifestEntry(id)`
`target = document.getElementById(id)`
`if (!target) return false`

For non-lazy ids, preserve the old path unchanged.

For exactly the three known lazy ids when target is absent, perform a bounded owner-preserving resolution schedule, then re-enter/continue the existing canonical router only after the canonical node exists.

This is narrower than adding listeners to Command Center/module-picker/hashchange and preserves Pass 19 single-router ownership.

## Important compatibility constraint — do not make the whole router async

The existing function is used as a synchronous boolean-style API. Some callers branch on its immediate return.

Therefore a first router candidate should not globally convert `atlasV2OpenAdvancedForTarget()` into a Promise-returning async API.

A compatible design is:

- existing target present: historical synchronous route and return;
- known cold lazy target: schedule/join one owner hydration continuation, return an immediate accepted/scheduled boolean compatible with current callers;
- unknown missing target: historical false.

The precise operator-visible meaning of scheduled=true still requires Firefox validation; this pass does not claim runtime viability.

## Race contract carried forward

Pass 17 remains binding:

- owner fetch is globally deduplicated by `sourcePromise`;
- owner hydration is not per-key in-flight locked;
- same-key concurrent triggers can otherwise duplicate replace/rebind/event;
- close during load aborts owner completion without resident event;
- rejected sourcePromise stays rejected and router must not invent retry.

Router-side candidate must therefore keep one pending record per lazy key plus a navigation generation anti-stale token.

A superseded route must never scroll/focus an old target after a newer navigation intent.

## Non-live design package produced

The design package created in this pass defines:

- exact 3-id allowlist;
- id/key/details identity mapping;
- one-shot resident-event handoff;
- already-hydrated fast path;
- same-key pending deduplication;
- navigation generation anti-stale behavior;
- cleanup/error boundaries;
- read-only diagnostic snapshot;
- zero-new-owner runtime budget;
- Firefox acceptance matrix.

It is coordination documentation, not executable runtime payload.

## Runtime budget boundary

Future first Atlas router candidate must introduce no:

- business/network fetch owner;
- WebSocket;
- storage schema/write owner for router state;
- interval/poll loop;
- MutationObserver;
- IntersectionObserver;
- retry loop;
- duplicate hashchange listener;
- duplicate Command Center navigation listener;
- duplicate module-picker navigation listener.

Do not mix it with:
- Candidate A;
- Atlas generic residency retirement;
- Atlas `insertAdjacentHTML` refactor;
- no-local-producer/Ryzen correction;
- Learning recovery;
- Market Core/CURRENT/Oracle/Backend work.

`#atlas-local-ai-collapse` remains protected.

## Pass 20 verdict

### PROVEN / newly closed

- full relevant semantic contract of the canonical advanced router mapped;
- three lazy Atlas manifest entries mapped exactly;
- exact `target id == lazy key == data-collapse-key` owner mapping proven;
- minimal pre-resolution insertion point established;
- global async conversion identified as a compatibility risk and excluded from first candidate design;
- separate non-live router design package published.

### STILL OPEN

- Candidate A real Firefox/operator PASS;
- nine Projects/Operations baseline↔staging direct-hash observations;
- executable/staged Atlas router candidate and real Firefox proof — NOT a Build yet;
- Atlas generic residency retirement only after router proof;
- Atlas `insertAdjacentHTML` high-risk debt, separate;
- Learning post-parse recovery;
- no-local-producer/Ryzen OFFLINE/N-A correction;
- shared monolith;
- Backend/Source Intelligence watch.

No runtime deployment authorization is granted by Pass 20.

## Suggested Pass 21 if no Firefox evidence exists

Remain non-live. Materialize an isolated Atlas-router staging artifact under coordination only, based on the Pass20 design, and statically prove:

1. only root `app.js` would change functionally;
2. existing non-lazy route transaction remains unchanged;
3. no new recurring runtime budget owner;
4. exactly three cold lazy IDs enter the helper;
5. no second navigation listener/owner;
6. syntax PASS;
7. create a Firefox operator matrix for cold/auth/repeat/race/failure scenarios.

Still no Build until real Firefox/operator PASS.
