# Agent-Crypto @erith.IA — Atlas owner terminal event contract · Pass 28

Date: 2026-08-29
Nature: COORDINATION ONLY / OWNER CONTRACT DESIGN / NO RUNTIME WRITE / NO BUILD

## Exact owner evidence

`public/agent_crypto_erith_ia/administrator/js/views/atlas-peripheral-lazy.js` 40.4.99 is the authoritative cold-body hydration owner.

For `auto-reader`, `shared-memory`, `github-memory` it:
- keeps a shared `sourcePromise`;
- owns private `hydrate(key)`;
- opens hydration from the existing disclosure `toggle`;
- on success sets `ready`, records `hydrated`, rebinds and emits bubbling `erith:presentation-resident {family:"atlas",key,build:"40.4.99"}`;
- on failure sets `data-atlas-hydration40425="error"`, renders an error message and returns `false`.

The exact owner inspected exposes no terminal failure event/public hydration Promise. Repository-wide code searches for generic presentation/hydration errors remain incomplete, so Pass28 does not claim a global absence proof.

## Why a terminal owner signal is required

Under the locked successor budget:
- no polling;
- no MutationObserver;
- no arbitrary timeout as correctness boundary;
- no retry policy;
- no direct/private hydrate call;
- no duplicate fetch owner;

a router cannot distinguish `hydration still legitimately pending` from `owner hydration definitively failed` using the current public contract.

A fixed timeout would reintroduce the Pass26 ambiguity. Therefore the preferred technical path is a separately-approved minimal extension of the same hydration owner.

## Proposed minimal contract

On terminal failure of `hydrate(key)`, after the owner has set its existing error dataset/UI state, emit one bubbling event from the owning `<details>`:

`erith:presentation-residency-error`

Minimal detail payload:

```text
{
  family: "atlas",
  key: <lazy key>,
  build: <owner build>,
  phase: "hydrate"
}
```

Do not expose raw exception text as cross-module contract. Existing owner UI may continue to display its current local error message.

## Success/failure symmetry

Success remains the existing:

`erith:presentation-resident {family:"atlas",key,build}`

Failure becomes:

`erith:presentation-residency-error {family:"atlas",key,build,phase:"hydrate"}`

The canonical route continuation installs both one-shot listeners before `details.open=true`, accepts only matching `family/key`, and performs exactly one terminal cleanup.

- success -> re-resolve canonical target, generation/hash guard, continue canonical commit;
- failure -> cleanup pending route, record bounded diagnostic result, do not retry, do not alter hash/focus as if navigation succeeded.

## Budget proof

This owner-contract extension requires:
- zero new fetch;
- zero WebSocket;
- zero timer/interval;
- zero observer;
- zero storage owner/schema;
- zero scheduler;
- zero retry;
- zero public hydrate API;
- zero second routing owner.

It adds one terminal dispatch at the owner location that already knows the real Promise result.

## Sticky failure semantics

The current shared `sourcePromise` is not reset on rejection. The router must not invent retry/network policy. A terminal failure event reports the owner's actual result only.

## Scope gate

This is a proposed owner-contract extension, not authorization to edit `atlas-peripheral-lazy.js` live. It must be accepted as a separate minimal scope before executable staging is created.

If owner modification remains forbidden, the successor cold-navigation router stays statically blocked under the present no-polling/no-timeout budget.
