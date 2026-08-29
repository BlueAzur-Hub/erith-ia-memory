# Agent-Crypto @erith.IA — Candidate Atlas Router · Pass 25 · 40.4.98

Nature: COORDINATION ONLY / NON-LIVE STAGING / NO BUILD / NOT DEPLOYABLE YET

Runtime authority used for this staging:
- Administrator: `40.4.98`
- runtime commit: `d2cb4bb778df51a5a03fcdcce01027a7cd6530b6`
- Market Core: `38.15.11` PROTECTED

## Exact classification

`atlasV2OpenAdvancedForTarget()` in the sealed 40.4.98 `administrator/app.js` still executes:

```js
const entry = atlasV2ManifestEntry(id);
const target = document.getElementById(id);
if (!target) return false;
```

Therefore the Pass20 Atlas cold-router debt is **OPEN**, not PARTIAL and not CLOSED.

The three affected canonical ids remain exactly:
- `auto-reader`
- `shared-memory`
- `github-memory`

Their bodies are removed at boot by the existing `atlas-peripheral-lazy.js` owner and their connected `<details data-collapse-key>` shells remain the hydration trigger.

## Ownership lock

This staging MUST preserve:
- root `administrator/app.js` as the single Command Center / module picker / advanced anchor / hashchange routing owner;
- `atlas-peripheral-lazy.js` 40.4.35 as the single source fetch + body hydration owner;
- the existing synchronous boolean path for every target already present;
- existing auth/mode/manifest/details/persistence/hash/scroll semantics after target materialization.

It MUST NOT:
- fetch `views/atlas.html`;
- expose or duplicate private `hydrate(key)`;
- add a second click/hashchange/picker router;
- retire Atlas generic residency in this candidate;
- touch `Element.prototype.insertAdjacentHTML` interception;
- touch `#atlas-local-ai-collapse`;
- touch no-local-producer/Ryzen, Learning, Market Core, CURRENT, Oracle, Backend, or shared-monolith work.

## New Pass25 constraint: terminal owner failure

The owner emits `erith:presentation-resident` only on successful hydration. On source/body failure it sets `details.dataset.atlasHydration40425 = "error"` and returns `false`, with no failure event.

A router that listens only for `erith:presentation-resident` can therefore leak a pending route after terminal failure.

The prototype contract consequently allows a **bounded one-shot cleanup timeout only**. This is not a polling interval and must never retry/fetch/hydrate. Its sole job is to remove the listener/pending record and leave the existing owner error state authoritative. Firefox must validate timeout/success races before any Build.

## Staging files

- `ATLAS_ROUTER_PATCH_PROPOSAL.js` — isolated helper/patch logic, not wired into runtime.
- `STATIC_ASSERTIONS.md` — proof obligations.
- `FIREFOX_OPERATOR_MATRIX.md` — required behavioral gate.

## Status

`OPEN / ISOLATED PROTOTYPE READY FOR STATIC REVIEW / FIREFOX PASS REQUIRED / NO BUILD AUTHORIZATION`
