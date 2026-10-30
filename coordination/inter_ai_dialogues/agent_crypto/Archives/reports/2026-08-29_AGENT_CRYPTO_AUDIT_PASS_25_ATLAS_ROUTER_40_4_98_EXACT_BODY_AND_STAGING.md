# Agent-Crypto @erith.IA — AUDIT PASS 25

Date: 2026-08-29
Nature: CUMULATIVE AUDIT / COORDINATION ONLY / NO RUNTIME BUILD

## Authorities verified before conclusion

Repository HEAD observed before Pass25 writes:
- `99ec0740690f399c7cd024799393ee00762d2212`
- commit: `agent-crypto: build 38.15.14 scaffold Classic modular presentation boundaries`
- scope: `public/agent_crypto_erith_ia/web/` Web Classique, NOT Administrator runtime authority.

Administrator runtime authority remains separately:
- build: `40.4.98`
- commit: `d2cb4bb778df51a5a03fcdcce01027a7cd6530b6`
- release: `FINAL ADMINISTRATOR RUNTIME MIGRATION SEAL · FIREFOX OPERATOR EVIDENCE LOCK`
- Market Core: `38.15.11` PROTECTED.

Do not confuse repository HEAD with Administrator live runtime authority.

## PASS25 exact Atlas router result

Classification: **OPEN**.

The exact sealed 40.4.98 root `public/agent_crypto_erith_ia/administrator/app.js` still contains the canonical failure boundary inside `atlasV2OpenAdvancedForTarget(hash, options)`:

```js
const id = decodeURIComponent(String(hash || "").replace(/^#/, ""));
if (!id) return false;
const entry = atlasV2ManifestEntry(id);
const target = document.getElementById(id);
if (!target) return false;
```

There is no pre-resolution lazy handoff for the three Pass20 targets at this boundary.

Therefore the 40.4.98 Firefox migration seal did NOT implicitly close the Atlas cold-router debt.

Affected ids remain exactly:
- `auto-reader`
- `shared-memory`
- `github-memory`

Pass20 remains the correct ownership contract: all existing Command Center/module picker/advanced-anchor/hashchange paths converge on this one canonical router and no second router owner may be introduced.

## Existing lazy owner revalidated

`js/views/atlas-peripheral-lazy.js` remains build `40.4.35` and owns:
- stripping the three peripheral bodies before insertion;
- keeping the owning `details[data-collapse-key]` shells connected;
- source fetch through shared `sourcePromise`;
- private `hydrate(key)`;
- hydration on disclosure `toggle`;
- successful `erith:presentation-resident` with `{family:"atlas", key, build:"40.4.35"}`;
- public read-only diagnostics through `AgentCryptoAtlasPeripheralLazy`.

The router must not fetch `views/atlas.html` and must not call or expose `hydrate(key)`.

### New Pass25 failure-boundary proof

On hydration failure the owner does NOT emit a failure event. It sets:

`details.dataset.atlasHydration40425 = "error"`

and renders its existing error message, then returns `false`.

Consequently a router using only a one-shot successful `erith:presentation-resident` listener has no terminal failure notification and can retain stale pending state.

A first staging prototype therefore uses a bounded one-shot cleanup timeout only. This timeout:
- is not polling;
- does not retry;
- does not fetch;
- does not hydrate;
- exists solely to retire pending/listener state if the owner never emits success.

Its exact duration is NOT a runtime truth and requires Firefox validation; it is a staging parameter only.

## Isolated non-live staging created

Directory:

`coordination/inter_ai_dialogues/agent_crypto/candidate_atlas_router_pass25_40_4_98_staging/`

Files:
- `README.md`
- `ATLAS_ROUTER_PATCH_PROPOSAL.js`
- `STATIC_ASSERTIONS.md`
- `FIREFOX_OPERATOR_MATRIX.md`

The proposal is deliberately NOT referenced by runtime `index.html`, manifests, or load graph.

Staging intent:
- recognize exactly three lazy ids;
- preserve historical synchronous path for existing targets;
- assign route generation for anti-stale continuation;
- deduplicate pending same-key intent;
- install bounded success/close/cleanup listeners before opening owner details;
- set only `details.open=true` to trigger the real owner;
- on matching resident event, re-resolve canonical target and re-enter the existing router;
- unknown missing target remains `false`;
- no retry policy.

## Budget lock

No candidate permission is granted to add:
- business fetch;
- WebSocket;
- storage schema/writer;
- recurring interval/polling;
- MutationObserver/IntersectionObserver;
- second hashchange owner;
- second Command Center/picker handler;
- source parser;
- direct hydration API.

The bounded one-shot cleanup timeout is the only newly proposed timing primitive and must be justified/rejected by Firefox evidence before any Build.

## Explicit exclusions preserved

Do not mix this Atlas candidate with:
- Atlas generic residency retirement;
- Atlas `insertAdjacentHTML` refactor;
- `#atlas-local-ai-collapse`;
- no-local-producer/Ryzen;
- Learning autonomous boundary;
- shared monolith;
- Market Core / CURRENT;
- Oracle;
- Backend/Source Intelligence.

## Firefox gate

Required matrix is published in staging. Critical rows include:
- cold direct hash for all 3 targets;
- Command Center and picker routes;
- already hydrated repeat;
- same-key concurrent intent;
- lazy A → lazy B supersession;
- lazy A → normal target supersession;
- close during load;
- owner failure with no router retry;
- Essential auth/pending-hash behavior;
- Intermediate behavior;
- updateHash/scroll/instant options;
- unknown missing target false;
- duplicates/console/responsiveness/protected HOT smoke.

No Build until real Firefox/operator evidence passes this matrix.

## Other debt status

- G-01 runtime stacking governance: CLOSED by 40.4.98 seal.
- V-01 version truth: CLOSED by 40.4.98.
- Candidate A: ABSORBED / HISTORICAL ORACLE only.
- Learning runtime migration: SEALED; autonomous source boundary optional/high-risk.
- Atlas cold router: OPEN / STAGING ONLY.
- Atlas generic residency retirement: BLOCKED behind router proof.
- Atlas insertAdjacentHTML: OPEN separate high-risk debt.
- no-local-producer/Ryzen OFFLINE/N-A: OPEN separate.
- shared monolith: OPEN separate high-risk.
- Backend/Source Intelligence: WATCH.
- Oracle: CLOSED absent new proof.
- Web Classic 38.15.14 work: separate branch of work; do not use its repository HEAD as Administrator runtime identity.

## PASS25 status

`ATLAS COLD ROUTER OPEN / EXACT 40.4.98 HARD-FAIL PROVEN / ISOLATED NON-LIVE STAGING CREATED / FIREFOX OPERATOR GATE REQUIRED / NO BUILD`
