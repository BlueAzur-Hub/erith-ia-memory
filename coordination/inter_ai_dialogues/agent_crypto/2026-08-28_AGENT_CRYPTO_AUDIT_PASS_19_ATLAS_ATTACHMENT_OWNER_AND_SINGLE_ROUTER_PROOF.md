# Agent-Crypto @erith.IA — Audit Pass 19
## Atlas attachment owner and single-router proof

Date: 2026-08-28

## Authority boundary

Repository HEAD checked before this pass: `4f3ae7ef0549dd11409650f340240f8150c355a8` (Pass 18).

Runtime live remains unchanged and separate from repository HEAD:
- Administrator: `40.4.88`
- runtime commit authority: `0b8672c4d2481bf21205e2cc74082ea591175d08`
- Market Core: `38.15.11` protected

No runtime file is modified by this pass. No Build is created. No `auto_update/request.json` is created. No runtime hash/token/version is invented.

Candidate A remains isolated/non-deployed and still requires a real Firefox/operator PASS.

## New proof 1 — effective load graph owner

The live Administrator `index.html` loads the large root `./app.js?v=market-core-v2.0-alpha-build-40.4.88` before the later Administrator modules, including `./js/app.js?v=administrator-build-40.4.88` and the demand-residency files.

The root `app.js` is therefore part of the effective 40.4.88 runtime load graph and must be inspected for Command Center/module-picker ownership; searching only `js/app.js` was insufficient.

## New proof 2 — Command Center owner is root app.js

Root `app.js` defines `atlasAdminCenterElements()` and resolves:
- `#atlasAdminCenterDrawer`
- `#atlasAdminCenterToggle`
- `#atlasAdminCenterToggleState`
- `#atlasAdminCenterClose`

It binds the visible Command Center toggle/close controls and cluster buttons to `atlasAdminCenterSet(...)`.

Therefore Command Center interaction ownership is no longer unresolved: the parser-owned shell lives in `index.html`, while root `app.js` owns drawer interaction/state.

## New proof 3 — module picker owner is root app.js

Root `app.js` defines:

`atlasV2OpenSelectedModule()`

which reads `#atlasV2AdvancedModuleSelect` and forwards the selected ID to:

`atlasV2OpenAdvancedForTarget('#' + id)`.

`#btnOpenAdvancedModule` is explicitly bound to `atlasV2OpenSelectedModule`.

The select's `change` listeners only persist/update selection/workspace state; the actual navigation action occurs through the Open button and `atlasV2OpenSelectedModule()`.

Therefore the exact owner is proven. There is no need to infer a missing handler from repository-wide code search.

## New proof 4 — one canonical advanced-target router already exists

Root `app.js` also delegates advanced `a[href^="#"]` navigation:
- resolve manifest entry;
- prevent default for advanced targets;
- call `atlasV2OpenAdvancedForTarget(hash)`.

It binds `window.hashchange` to `atlasV2HandleHashTarget({scroll:false})`.

`atlasV2HandleHashTarget()` resolves the manifest entry and then calls the same `atlasV2OpenAdvancedForTarget(location.hash, {updateHash:false,...})`.

Therefore these surfaces converge on one canonical router owner:
- Command Center advanced anchor navigation;
- module picker Open action;
- direct hash / hashchange advanced navigation.

A future Atlas lazy-target fix must extend/reuse this routing boundary or interpose immediately before it. It must not create a second independent routing system.

## New proof 5 — exact failure boundary for lazy Atlas targets

`atlasV2OpenAdvancedForTarget(hash, options)` performs:

1. normalize/decode target id;
2. resolve manifest entry;
3. `const target = document.getElementById(id)`;
4. `if (!target) return false`.

Pass 15 already proved that `#auto-reader`, `#shared-memory`, and `#github-memory` are absent from the DOM at boot because `atlas-peripheral-lazy.js` strips their canonical bodies until first disclosure hydration.

Therefore the current canonical router necessarily exits before opening/hydrating those lazy Atlas targets when invoked while their canonical ID is absent.

This closes the structural chain:

`navigation surface -> existing canonical root-app router -> getElementById(lazy target) -> target absent -> false -> lazy shell not opened by router`.

The routing gap is therefore not caused by missing attachment ownership. It is caused by the canonical router requiring the target node to exist before it can reach the owner disclosure.

## Double-routing conclusion

Because Command Center anchors, module picker Open and hashchange already converge on `atlasV2OpenAdvancedForTarget()`, the future owner-preserving solution should not add parallel click/hash routing.

Preferred architectural boundary for a future separate Atlas candidate:

`atlasV2OpenAdvancedForTarget()` (or a single helper immediately before its `getElementById` hard-fail)

For the three lazy Atlas IDs only:
- normalize target -> lazy key;
- if already hydrated, continue existing route;
- otherwise resolve owner `<details>` shell;
- join/deduplicate pending key/generation;
- attach one-shot `erith:presentation-resident` listener before opening;
- set `details.open = true` and let existing `atlas-peripheral-lazy.js` hydrate;
- after matching `{family:'atlas', key}` event, re-resolve canonical target;
- continue the pre-existing scroll/focus/hash behavior;
- cancel stale generation and clean listener on supersession/error/close.

Do not:
- fetch `views/atlas.html` in the router;
- expose or duplicate private `hydrate(key)`;
- create another hashchange owner;
- create another Command Center click owner;
- create another module-picker navigation owner;
- change Atlas generic residency in the same candidate;
- refactor `insertAdjacentHTML` in the same candidate;
- touch `#atlas-local-ai-collapse`;
- invent retry policy for a rejected owner `sourcePromise`.

## Diagnostic contract for future Atlas router

Read-only snapshot only:
- `generation`
- `pending_keys`
- `last_target`
- `last_key`
- `last_result`
- `last_error`
- `last_event_key`
- `current_hash`

No business fetch owner, WebSocket, storage write, MutationObserver, IntersectionObserver or polling loop.

## Candidate A status

Unchanged:

`ISOLATED PATCH STAGING READY / STATIC CHECKS PASS / FIREFOX OPERATOR PASS REQUIRED`

Candidate A remains independent from Atlas router work.

## Pass 19 verdict

PROVEN:
- effective root `app.js` is the Command Center/module-picker/direct-hash navigation owner;
- module picker has an exact existing owner;
- advanced anchors and hashchange converge on the same canonical router;
- lazy Atlas routing failure is the existing router's pre-hydration `getElementById` hard-fail, not missing attachment ownership;
- future Atlas routing must be a single-owner extension, not parallel routing.

STILL OPEN:
- real Firefox/operator viability Candidate A;
- baseline <-> staging 9-hash Projects/Operations operator evidence;
- future separate Atlas router candidate design/test, no Build yet;
- Atlas `insertAdjacentHTML` debt separately;
- Learning post-parse recovery;
- no-local-producer/Ryzen OFFLINE-N/A;
- shared monolith;
- Backend/Source Intelligence watch.

No runtime deployment authorization is granted by this pass.
