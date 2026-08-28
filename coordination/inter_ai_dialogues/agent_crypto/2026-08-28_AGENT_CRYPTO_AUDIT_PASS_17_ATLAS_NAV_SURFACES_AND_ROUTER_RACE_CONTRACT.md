# Agent-Crypto @erith.IA — Audit cumulatif Pass 17

Date: 2026-08-28
Scope: Administrator Atlas routing audit only. No runtime deployment.

## Authority checkpoint

Repository HEAD before this report: `71b4bf4c1e93dc652093c4e8002c437243b97183` (Pass 16).

Runtime live remains a separate authority:
- Administrator: `40.4.88`
- runtime commit authority: `0b8672c4d2481bf21205e2cc74082ea591175d08`
- Market Core: `38.15.11` — protected

Candidate A remains untouched and non-deployed. No Build, no `auto_update/request.json`, no runtime token/hash/version invented.

## 1. Atlas navigation surfaces confirmed

### Command Center
`index.html` exposes native hash anchors:
- `href="#auto-reader"`
- `href="#shared-memory"`

Those are ordinary anchors in the Administrator Command Center. The canonical target ids are absent at boot because `atlas-peripheral-lazy.js` strips the true-lazy bodies before insertion.

Therefore the browser can update the URL hash before the canonical target node exists. Native fragment navigation alone cannot force the owning `<details>` open or await hydration.

### Advanced module picker
`index.html` exposes `#atlasV2AdvancedModuleSelect` with values:
- `auto-reader`
- `shared-memory`
- `github-memory`

The select itself has no inline `onchange` owner. In the inspected canonical `js/app.js` 40.4.88 there is no exact reference to `atlasV2AdvancedModuleSelect` / `AdvancedModuleSelect` / `moduleSelect`.

This is strong evidence that a future router must explicitly cover the picker surface, but global exact-code search remains historically incomplete in this repository. Do not upgrade this point to repository-wide proof until Firefox/operator observation or complete search closes it.

### Existing app.js hash logic
`js/app.js` contains `administratorHashFamily40361()`. It decodes `location.hash`, then immediately resolves the target with `byId(decoded)`; if no HTMLElement exists, it returns an empty family.

This logic can classify only targets already present in the DOM. It therefore cannot by itself route `#auto-reader`, `#shared-memory`, or `#github-memory` at cold boot, because their canonical nodes are intentionally absent until lazy hydration.

No `hashchange` handler was found in the inspected canonical `js/app.js`, and no `location.hash = ...` writer was found there. This is file-level proof only.

## 2. Lazy-owner race behavior — newly proven

Canonical owner: `js/views/atlas-peripheral-lazy.js` 40.4.35.

### Shared fetch, not shared per-key hydration
The owner uses one closure-global:
- `sourcePromise`
- `fetchCount`

`sourceText()` starts only one fetch of `./views/atlas.html`, so repeated requests share the same source promise and do not add a second network fetch.

However `hydrate(key)` has no per-key in-flight promise or `loadingKeys` guard. Until `hydrated.add(key)` occurs, multiple calls for the same key can all pass the initial `hydrated.has(key)` check, await the same `sourcePromise`, then each continue through body replacement, rebind, and `erith:presentation-resident` dispatch.

Classification:
- duplicate business fetch risk: **NO**
- duplicate same-key hydration/event risk under concurrent demand: **YES, statically possible**
- runtime frequency/severity: **Firefox proof required**

A future router must therefore deduplicate its own route requests per target/key and must not assume that the lazy owner supplies a per-key in-flight lock.

## 3. Close-during-load behavior

`hydrate(key)` sets:
`details.dataset.atlasHydration40425 = "loading"`

After awaiting the source, it checks `if(!details.open) return false;`.

If the disclosure is closed while the fetch is pending:
- no canonical body is installed;
- no resident event is emitted;
- the dataset can remain `loading` until another demand re-enters `hydrate(key)`;
- reopening triggers the existing `toggle` owner and can complete from the already-resolved `sourcePromise`.

This is not a reason to alter the owner inside the first router candidate. The router must treat close/cancel as a cancelled route, not as successful residency.

## 4. Failed source behavior

`sourcePromise` is assigned once and is not reset in the catch path.

If the source fetch rejects or returns non-OK:
- `hydrate(key)` marks the details `error` and returns false;
- the rejected `sourcePromise` remains cached;
- a subsequent hydration attempt reuses the rejected promise and fails again without a new fetch.

This is current owner semantics. A routing candidate must not silently add retry/network policy. Failure should surface as a routing failure and remain an independent future decision if retry behavior is ever desired.

## 5. Required race contract for a future Atlas router

The future owner-preserving router should use a small route-generation / pending-key layer outside the lazy owner:

1. normalize requested target to lazy key;
2. assign/advance a route generation token;
3. if target is already present and `AgentCryptoAtlasPeripheralLazy.hydrated()` contains the key, resolve immediately;
4. otherwise register the one-shot `erith:presentation-resident` listener **before** opening;
5. open owning details only if needed;
6. await only the matching `{family:"atlas", key}` event;
7. before scroll/focus, verify the route generation is still current and the requested hash/target has not been superseded;
8. resolve the canonical node, then scroll/focus;
9. cleanup listener/timeout/pending-key state on success, cancellation, close, hash supersession, or owner error.

Repeated click while a route is already pending for the same key should join/reuse the router-level pending operation, not create another waiter that can independently scroll/focus later.

If the hash changes to another target while hydration is in flight, the old generation must become stale and must not steal focus when its delayed resident event arrives.

## 6. Explicit non-goals

Do not, in the first Atlas router candidate:
- fetch `views/atlas.html` directly;
- expose or duplicate closure-private `hydrate(key)`;
- add retry policy for rejected `sourcePromise`;
- refactor the `insertAdjacentHTML` interception;
- retire Atlas generic residency selectors;
- touch `#atlas-local-ai-collapse`;
- touch Candidate A;
- touch Learning;
- touch no-local-producer / Bridge / Ollama;
- touch Market Core, Graph Context, CURRENT, Oracle, IndexedDB or Window Manager geometry.

## 7. Budget implication

A router that follows this contract can remain:
- zero new business fetch owner;
- zero WebSocket;
- zero storage owner;
- zero MutationObserver / IntersectionObserver;
- zero polling;
- bounded event listeners only (`initial direct-hash`, `hashchange`, picker/change and/or delegated navigation surface as proven necessary).

Listener count and exact attachment points must be fixed before any candidate is materialized, then Firefox/operator tested for repeated-click and hash-supersession cases.

## 8. Status

### Proven
- Command Center directly targets lazy canonical ids.
- Module picker enumerates all three lazy canonical ids.
- `administratorHashFamily40361()` cannot classify a cold target that does not yet exist.
- lazy owner has a single shared source fetch promise.
- lazy owner has no same-key in-flight hydration lock.
- concurrent same-key calls can theoretically duplicate body replacement/event while still keeping one network fetch.
- close-during-load returns false before hydration/event.
- rejected `sourcePromise` is retained; owner has no retry semantics.

### Not proven / Firefox required
- exact browser-visible behavior of each Command Center click at baseline;
- exact current module-picker behavior;
- whether concurrent owner calls occur in ordinary operator usage today;
- direct-hash focus/scroll behavior after future router staging;
- repeated-click and mid-load hash supersession behavior.

## 9. Candidate A status

Unchanged:
`ISOLATED PATCH STAGING READY / STATIC CHECKS PASS / FIREFOX OPERATOR PASS REQUIRED`

No Build authorized.

## 10. Next useful pass

If no Firefox evidence exists, the next static pass should stay on Atlas and only close router attachment ownership:
- identify the canonical Command Center drawer open/close owner and whether delegated anchor interception already exists elsewhere;
- identify the exact module-picker change owner or formally classify it as no-handler after complete evidence;
- define a minimal router diagnostics snapshot (`pending`, `generation`, `last_target`, `last_result`) that is read-only and operator-testable;
- prepare no runtime package until those attachment points are closed.
