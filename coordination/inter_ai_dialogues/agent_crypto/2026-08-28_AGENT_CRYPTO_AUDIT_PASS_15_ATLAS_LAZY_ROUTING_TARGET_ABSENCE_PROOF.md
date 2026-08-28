# Agent-Crypto @erith.IA — Audit cumulatif Pass 15

Date : 2026-08-28
Scope : Atlas peripheral lazy routing debt only. Candidate A remains untouched and non-deploying.

## HEAD / runtime separation

Repository HEAD immediately before this pass write: `0c933218e7d6600a7e42e11db98aa03051afb8bc` (Pass 14 report).

Runtime live remains separately authoritative as:
- Administrator `40.4.88`
- runtime authority commit `0b8672c4d2481bf21205e2cc74082ea591175d08`
- Market Core `38.15.11` — protected

No live runtime file was modified in this pass.

## New proof closed in Pass 15

The previously identified Atlas routing deficit is now tightened from "no hash handler observed" to a structural target-absence proof.

### 1. The canonical Atlas peripheral IDs live inside lazy bodies

`views/atlas.html` defines:
- details `data-collapse-key="auto-reader"` containing canonical section `id="auto-reader"`;
- details `data-collapse-key="shared-memory"` containing canonical section `id="shared-memory"`;
- details `data-collapse-key="github-memory"` containing canonical section `id="github-memory"`.

These three canonical IDs are therefore descendants of the three lazy presentation bodies.

### 2. `atlas-peripheral-lazy.js` deliberately strips those bodies before parser insertion

`atlas-peripheral-lazy.js` 40.4.35 defines `TARGETS = {auto-reader, shared-memory, github-memory}`.

Its `preprocess(source)` calls `stripBody()` for every target. `stripBody()` replaces the source body between `</summary>` and `</details>` with `shellBody(key)`. That shell contains only a generic `.atlas-collapse-body` placeholder with `data-atlas-peripheral-lazy`, not the original canonical section ID.

Therefore at initial parser-mounted Atlas presentation, the canonical nodes `#auto-reader`, `#shared-memory` and `#github-memory` are absent from the live DOM until their respective body is hydrated.

### 3. Navigation surfaces address those absent canonical IDs directly

Administrator `index.html` exposes at least two navigation surfaces that address these target names:
- Command Center quick links use `href="#auto-reader"` and `href="#shared-memory"`;
- module picker options include values `auto-reader`, `shared-memory`, and `github-memory`.

Thus the public navigation contract names the same canonical targets that true-lazy preprocessing removes from the boot DOM.

### 4. Current lazy owner has no route-to-hydration bridge

`atlas-peripheral-lazy.js` hydrates these targets only through `attachPeripheral()`:
- attach a `toggle` listener on the matching `<details>`;
- call `hydrate(key)` only when the disclosure is open;
- optionally hydrate immediately if that disclosure is already open at attach time.

The file contains no `hashchange` handler, no direct-hash target mapper, and no navigation callback that translates a requested canonical target into its owning lazy key.

`hydrate(key)` itself also requires the disclosure to be open after fetching source (`if(!details.open)return false`).

## Classification

Atlas peripheral routing debt is now:

**PROVEN STRUCTURAL ROUTING GAP**

Exact failure boundary:

`navigation target (#auto-reader/#shared-memory/#github-memory)`
→ canonical node absent at boot by design
→ no target→lazy-key router in current lazy owner
→ hydration only occurs after disclosure toggle/open
→ canonical target becomes resolvable only after successful hydration.

This is stronger than inferring a problem only from missing `hashchange`; it proves the navigation target itself does not exist before lazy hydration.

## Required future target-map contract

A future Atlas routing candidate must remain separate from Candidate A and implement, at minimum:

1. normalize requested target (`auto-reader`, `shared-memory`, `github-memory`);
2. map target → lazy key;
3. find the owning `details[data-collapse-key=key]` shell;
4. open that disclosure without replacing the protected main cockpit `#atlas-local-ai-collapse`;
5. await the existing lazy owner hydration for that key (reuse owner; do not duplicate source ownership);
6. resolve the canonical ID only after hydration;
7. scroll/focus using the canonical node;
8. support initial direct hash and subsequent `hashchange`/Command Center/module-picker navigation;
9. preserve one-fetch/sourcePromise behavior and existing runtime owners;
10. Firefox/operator proof mandatory before retiring any Atlas generic residency selector.

The router must not be mixed with the `insertAdjacentHTML` interception refactor. The interception remains a separate HIGH-RISK architectural debt.

## Candidate A impact

None.

Candidate A remains:
- six-file non-live staging boundary;
- static checks PASS;
- no runtime Build;
- no `auto_update/request.json`;
- Firefox/operator PASS still required before any versioned runtime package.

Atlas selectors must remain untouched by Candidate A.

## Budget / protection

No budget change in this pass. No runtime code changed. No timer, observer, fetch, WebSocket, storage owner, Market Core, Graph Context, CURRENT, Oracle, Learning, Backend, Window Manager or monolith surgery added.

## State after Pass 15

Candidate A:
`BASELINE/STAGING FIREFOX ACCEPTANCE PROTOCOL READY / FIREFOX PASS STILL REQUIRED`

Atlas peripheral routing:
`CANONICAL TARGET ABSENCE AT BOOT PROVEN / ROUTING GAP STRUCTURALLY PROVEN / FUTURE SEPARATE CANDIDATE REQUIRED`

No Build authorized.
