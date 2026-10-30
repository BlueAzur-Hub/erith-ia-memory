# Agent-Crypto @erith.IA — Atlas router non-live design · Pass 20

Date: 2026-08-28
Nature: COORDINATION ONLY / DESIGN CONTRACT / NO RUNTIME WRITE / NO BUILD

Runtime authority remains unchanged:
- Administrator `40.4.88`
- runtime commit `0b8672c4d2481bf21205e2cc74082ea591175d08`
- Market Core `38.15.11` PROTECTED

This file is not a deployable patch and grants no publication authorization.

## Proven canonical routing owner

Root `public/agent_crypto_erith_ia/administrator/app.js` owns advanced navigation through `atlasV2OpenAdvancedForTarget(hash, options)`.

Command Center advanced anchors, module-picker Open and direct hash/hashchange converge on this single function. No second routing owner must be added.

## Proven lazy manifest entries

The existing `ATLAS_V2_SECTION_MANIFEST` contains exactly these three peripheral targets:

- `{ id: "auto-reader", level: "advanced", target: "closest-collapse", group: "memory" }`
- `{ id: "shared-memory", level: "advanced", target: "closest-collapse", group: "memory" }`
- `{ id: "github-memory", level: "advanced", target: "closest-collapse", group: "memory" }`

They are not in `ATLAS_V2_INTERMEDIATE_HIDDEN_IDS`; that set only contains the five detailed Projects programme ids. Existing mode/auth semantics therefore must remain authoritative.

## Proven owner-shell mapping

`views/atlas.html` maps each canonical target id to a parser-visible `<details>` shell with the same collapse key:

| canonical target | lazy key / data-collapse-key | canonical node created inside body |
|---|---|---|
| `auto-reader` | `auto-reader` | `<section id="auto-reader">` |
| `shared-memory` | `shared-memory` | `<section id="shared-memory">` |
| `github-memory` | `github-memory` | `<section id="github-memory">` |

`atlas-peripheral-lazy.js` 40.4.35 strips only each body before initial Atlas insertion, keeps the `<details>` shell connected, attaches `toggle`, and invokes its private `hydrate(key)` when that disclosure opens.

Successful hydration emits bubbling `erith:presentation-resident` with `{family:"atlas", key, build:"40.4.35"}`.

## Existing router semantics that must survive unchanged

After a target exists, `atlasV2OpenAdvancedForTarget()` currently owns the following transaction:

1. normalize/decode id;
2. resolve manifest entry;
3. resolve target node;
4. enforce Intermediate visibility rules;
5. for non-essential/adaptive targets reached from Essential, require local authorization or open the access gate with the pending hash;
6. after authorized transition, apply Advanced mode through the existing mode owner;
7. resolve the manifest-managed target and clear hidden/aria-hidden;
8. find/open the owning `details.atlas-collapse`;
9. synchronize `#atlasV2AdvancedModuleSelect` if it contains the id;
10. persist last module and Command Center cluster through the existing owners;
11. update the URL hash unless `options.updateHash === false`;
12. double-rAF scroll the canonical target unless `options.scroll === false`, respecting `options.instant`.

The Atlas lazy correction must not duplicate or reorder those existing semantics after target materialization.

## Exact insertion boundary

Current hard failure is before all mode/auth/open/persistence/hash/scroll behavior:

`entry = atlasV2ManifestEntry(id)`
`target = document.getElementById(id)`
`if (!target) return false`

For the three known lazy ids only, the router needs a bounded pre-resolution path immediately before this fatal return.

All non-lazy ids must execute the historical synchronous path byte-for-byte/functionally unchanged.

## Proposed non-live helper contract

Conceptual helper only:

`atlasV2ResolveLazyPeripheralTarget(id, routeOptions)`

Input accepted only when id is one of:
- `auto-reader`
- `shared-memory`
- `github-memory`

Responsibilities:

1. Map `id -> key` (identity mapping for these three).
2. Read `globalThis.AgentCryptoAtlasPeripheralLazy?.hydrated?.()`.
3. If key already hydrated, immediately re-resolve `document.getElementById(id)` and hand control back to the existing canonical route transaction.
4. Otherwise resolve `details[data-collapse-key="<key>"]`; if absent, fail diagnostically without inventing fallback DOM.
5. Join/deduplicate an existing pending operation for the same key.
6. Allocate/record current route generation.
7. Attach a one-shot bubbling `erith:presentation-resident` listener BEFORE opening.
8. Set the existing owner disclosure `details.open = true`; do not call/fetch/hydrate directly.
9. Accept only matching event `detail.family === "atlas" && detail.key === key`.
10. Re-resolve `document.getElementById(id)` after the event.
11. Continue the EXISTING `atlasV2OpenAdvancedForTarget` transaction exactly once using the original options, guarded against a stale generation.
12. Cleanup listener/pending state on success, supersession, close-during-load, owner error state or invalid target.

## Return-type constraint

The historical router is used as a boolean-style synchronous API in existing code. A first Atlas router candidate SHOULD NOT globally convert `atlasV2OpenAdvancedForTarget()` to an async Promise-returning function.

Preferred compatibility shape:
- existing target present -> historical synchronous boolean result;
- known cold lazy target -> schedule owner-preserving continuation and return a synchronous accepted/scheduled boolean compatible with callers;
- unknown missing target -> historical `false`.

Exact accepted/scheduled return semantics require Firefox operator validation, especially for callers that may branch on immediate success. Do not silently redefine existing non-lazy callers.

## Race contract

From Pass 17 owner proof:
- one `sourcePromise` deduplicates source fetch globally;
- `hydrate(key)` has no per-key in-flight lock;
- repeated same-key calls can otherwise duplicate body replacement/rebind/event;
- close during source await returns false and emits no resident event;
- rejected `sourcePromise` remains rejected; router must not invent retry policy.

Router-side rules:
- one pending route per key;
- repeated same-key intent joins or supersedes within that pending record, not a second disclosure/hydrate trigger;
- each navigation intent has a monotonically increasing generation;
- a later different target/hash invalidates stale focus/scroll continuation;
- a resident event only completes the currently valid generation;
- listener cleanup is mandatory.

## Read-only diagnostic snapshot

A future staging candidate may expose a frozen read-only diagnostic object only:

- `generation`
- `pending_keys`
- `last_target`
- `last_key`
- `last_result`
- `last_error`
- `last_event_key`
- `current_hash`

No mutation API. No public hydrate API.

## Budget / ownership lock

The first Atlas router candidate must add:
- zero business/network fetch owner;
- zero WebSocket;
- zero storage schema owner;
- zero polling interval;
- zero MutationObserver;
- zero IntersectionObserver;
- zero retry loop;
- zero second `hashchange` owner;
- zero second Command Center anchor owner;
- zero second module-picker navigation owner.

Allowed bounded mechanisms: existing route calls, a one-shot resident-event listener, existing `<details>.open`, in-memory pending/generation diagnostics.

## Explicit exclusions

Do NOT combine with:
- Candidate A;
- Atlas generic residency removal;
- `Element.prototype.insertAdjacentHTML` refactor;
- no-local-producer/Ryzen semantics;
- Learning recovery;
- Market Core;
- CURRENT cadence/fingerprint/finalization;
- Oracle;
- Backend/Source Intelligence.

Do not touch `#atlas-local-ai-collapse`.

## Required staging tests before any Build

Static:
- root app.js syntax PASS;
- no new interval/observer/WebSocket/business fetch/storage write;
- no extra navigation listeners;
- exactly three lazy ids recognized;
- all existing manifest entries unchanged;
- unknown missing id remains false;
- main Atlas cockpit untouched.

Firefox/operator:
- cold direct `#auto-reader`, `#shared-memory`, `#github-memory`;
- Command Center to each cold target;
- module picker Open to each cold target;
- already-hydrated repeat navigation;
- repeated same-key click during load;
- different lazy target during load;
- close disclosure during load then reopen;
- source failure behavior without router retry;
- Essential unauthorized pending-hash/auth return;
- Intermediate behavior preserved;
- `updateHash:false`, `scroll:false`, `instant:true` preserved;
- no stale focus after supersession;
- no duplicate ids;
- console/reference errors zero;
- Graphique/Top5/CURRENT/Oracle/Window Manager smoke unchanged;
- Firefox responsiveness hover/click/scroll acceptable.

No Build and no `auto_update/request.json` until these gates receive real operator evidence.
