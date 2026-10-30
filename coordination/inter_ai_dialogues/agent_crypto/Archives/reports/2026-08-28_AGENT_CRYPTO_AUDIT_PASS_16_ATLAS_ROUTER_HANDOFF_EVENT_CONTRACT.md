# Agent-Crypto @erith.IA — Audit cumulatif Pass 16

Date : 2026-08-28
Scope : Atlas peripheral lazy routing debt only. Candidate A remains untouched and non-deploying.

## HEAD / runtime separation

Repository HEAD immediately before this pass write: `bd70834aa35b96f800808e1a10e3fe350cb9dc2a` (Pass 15 report).

Runtime live remains separately authoritative as:
- Administrator `40.4.88`
- runtime authority commit `0b8672c4d2481bf21205e2cc74082ea591175d08`
- Market Core `38.15.11` — protected

No live runtime file was modified in this pass.

## New proof closed in Pass 16

Pass 15 proved the structural Atlas routing gap: the canonical peripheral target IDs are absent at boot and become available only after true-lazy hydration. Pass 16 closes the exact handoff boundary a future router must use.

### 1. The existing Atlas lazy owner does NOT expose `hydrate()` as public API

`js/views/atlas-peripheral-lazy.js` 40.4.35 keeps `hydrate(key)` closure-private.

The published globals `AgentCryptoAtlasPeripheralLazy`, `__AGENT_CRYPTO_ATLAS_PERIPHERAL_LAZY_40425__`, and `__AGENT_CRYPTO_ATLAS_CURRENT_AUDIT_LAZY_40431__` expose only diagnostic/state functions and metadata such as:
- `targets`
- `fetch_count()`
- `hydrated()`
- current-audit/book-knowledge state
- ownership/budget flags

They do not expose `hydrate`, `open`, `route`, or any equivalent imperative hydration method.

Therefore a separate router must not invent a second source fetcher and cannot legitimately call the lazy owner's private `hydrate()` directly.

### 2. Opening the owning disclosure is already the canonical hydration trigger

`attachPeripheral()` installs one `toggle` listener on every target details shell:

`details.addEventListener("toggle",()=>{if(details.open)hydrate(key);});`

It also hydrates immediately if a target disclosure is already open when attached.

Thus the correct ownership-preserving trigger for a router is simply:

`details.open = true`

The existing lazy owner then performs its own one-source fetch / sourcePromise / body restoration.

### 3. Hydration success already emits an awaitable completion event

After successful peripheral hydration, the lazy owner dispatches:

`erith:presentation-resident`

on the owning details node, bubbling, with detail:

`{ family:"atlas", key, build:"40.4.35" }`

The event is emitted only after:
- source fetch/parse succeeds;
- the disclosure is still open;
- canonical body markup has been restored;
- the hydrated set has recorded the key;
- peripheral rebind has been attempted.

This is therefore the existing completion handoff a future router can await without duplicating ownership.

### 4. Already-hydrated route must not wait for a second event

`hydrate(key)` returns immediately when `hydrated.has(key)` is true and does not emit a fresh completion event in that early-return path.

A future router must therefore branch:
1. inspect `AgentCryptoAtlasPeripheralLazy?.hydrated?.()`;
2. if key is already hydrated, resolve the canonical target immediately;
3. otherwise register a temporary one-shot listener for `erith:presentation-resident` before opening the shell;
4. set `details.open = true`;
5. accept only an event with `detail.family === "atlas" && detail.key === key`;
6. after completion, resolve the canonical ID and scroll/focus;
7. remove the temporary listener on success/failure/timeout owned by the navigation action only.

No recurring runtime listener is required for the per-navigation await itself.

### 5. Exact future routing ownership contract

The narrow owner-preserving sequence is now proven as:

`requested target`
→ normalize `auto-reader | shared-memory | github-memory`
→ target→key map
→ locate `details[data-collapse-key=key]`
→ if already hydrated: resolve target
→ else attach temporary completion listener
→ `details.open = true`
→ existing lazy owner toggle handler calls private `hydrate(key)`
→ existing sourcePromise performs at most the existing source fetch ownership
→ lazy owner restores body + emits `erith:presentation-resident`
→ router resolves canonical target
→ scroll/focus.

The router must not:
- fetch `views/atlas.html` itself;
- call or duplicate private `hydrate()` logic;
- replace the existing lazy owner;
- retire Atlas generic residency in the same step;
- refactor the `insertAdjacentHTML` interception in the same candidate;
- touch protected `#atlas-local-ai-collapse` ownership.

## Budget consequence

A correct future router can be implemented with:
- zero new business fetch owner;
- zero new WebSocket;
- zero storage ownership;
- zero observer;
- no persistent polling;
- no change to `sourcePromise` / one-fetch semantics.

Initial direct-hash and subsequent `hashchange` handling may require navigation listeners, but these belong to the future separate Atlas routing candidate and require explicit Firefox/operator budget proof before implementation/publication.

## Candidate A impact

None.

Candidate A remains:
- six-file isolated non-live staging;
- static checks PASS;
- baseline/staging Firefox acceptance protocol ready;
- no runtime Build;
- no `auto_update/request.json`;
- Firefox/operator PASS required before any versioned runtime package.

Atlas generic selectors remain untouched by Candidate A.

## State after Pass 16

Candidate A:
`STATIC/STAGING COMPLETE / FIREFOX OPERATOR PASS STILL REQUIRED`

Atlas peripheral routing:
`STRUCTURAL GAP PROVEN / PRIVATE HYDRATE BOUNDARY PROVEN / EXISTING EVENT HANDOFF PROVEN / OWNER-PRESERVING ROUTER CONTRACT CLOSED / FUTURE SEPARATE CANDIDATE REQUIRED`

No Build authorized.
