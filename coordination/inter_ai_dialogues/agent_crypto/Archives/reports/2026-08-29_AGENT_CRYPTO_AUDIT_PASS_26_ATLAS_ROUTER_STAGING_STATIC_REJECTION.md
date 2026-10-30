# Agent-Crypto @erith.IA — Audit Pass 26
## Atlas router staging static rejection · auth ordering + terminal handoff

Date: 2026-08-29

## Authority boundary

Repository HEAD observed before Pass26 staging writes: `1ad83adca4cb16bf84b8ac769c4814e885d11ac9`.

That HEAD is a Web Classic commit (`agent-crypto: seal Web Classic 38.15.16 modular presentation migration`), not Administrator runtime authority.

Administrator runtime authority rechecked independently:
- build: `40.4.98`
- release: `FINAL ADMINISTRATOR RUNTIME MIGRATION SEAL · FIREFOX OPERATOR EVIDENCE LOCK`
- status: `final_migration_sealed_from_firefox_operator_evidence`
- runtime commit: `d2cb4bb778df51a5a03fcdcce01027a7cd6530b6`
- Market Core: `38.15.11` PROTECTED

No Administrator runtime/load-graph/manifest file is modified in this pass. No Build. No `auto_update/request.json`. No runtime version/token/hash invented.

## Inputs rechecked

- Pass20 canonical router semantic ordering;
- exact Pass25 staging proposal;
- exact 40.4.98/40.4.35 Atlas lazy-owner contract;
- Pass25 static assertions and Firefox matrix;
- current Administrator manifest;
- current repository HEAD.

## PROVEN — Pass25 staging is not a viable Firefox candidate

The Pass25 proposal handled a missing known lazy target at the existing hard-fail boundary by calling its scheduler and ultimately setting the owning `<details>` open.

Pass20 proved the sealed canonical function order is:

1. decode id;
2. resolve manifest entry;
3. resolve `document.getElementById(id)`;
4. missing node => `false`;
5. only then current mode / Intermediate rule;
6. only then Essential authorization / pending-hash / Advanced-mode transition;
7. visibility / details / picker / persistence / hash / scroll.

Therefore, for a cold target whose body is absent, the Pass25 scheduler runs before steps 5-6 and opens the lazy owner before the canonical auth/mode transaction can execute.

That is not merely a Firefox uncertainty. It is a static semantic-order violation.

### Consequence

A cold advanced Atlas memory target can begin existing-owner hydration before the canonical route has performed the authorization/mode gate that applies once a target is present.

The exact affected allowlist remains only:
- `auto-reader`
- `shared-memory`
- `github-memory`

No claim is made that this creates a security vulnerability beyond the application contract. The proven point is narrower: the proposal does not preserve the established route authorization/mode ordering and therefore fails its own compatibility invariant.

Verdict: `PASS25 PROPOSAL STATICALLY REJECTED / FROZEN BEFORE FIREFOX`.

## PROVEN — no existing terminal owner signal replaces the timeout under current budget

`atlas-peripheral-lazy.js` 40.4.35 exposes:
- connected details shell;
- toggle-driven private `hydrate(key)`;
- shared sourcePromise;
- diagnostics `hydrated()`;
- success `erith:presentation-resident {family:"atlas", key, build:"40.4.35"}`.

On terminal hydration/source/body failure it:
- sets `details.dataset.atlasHydration40425 = "error"`;
- renders owner error UI;
- returns false internally;
- emits no failure CustomEvent;
- exposes no public hydration Promise or imperative hydrate/open/route API.

Existing push signals therefore cover success and close, not terminal failure while the disclosure remains open.

### Timeout analysis

The Pass25 one-shot 15 s timeout is bounded and introduces no polling/retry/network owner, but it is not owner truth.

- Remove timeout: a failed hydration can leave a pending listener/map record indefinitely.
- Keep fixed timeout: a legitimate slow hydration that succeeds after the cutoff can hydrate the owner but lose the router continuation.
- Poll dataset: prohibited by zero-polling budget.
- MutationObserver on the dataset: prohibited by zero-observer budget for first candidate.
- Retry/fetch/direct hydrate: prohibited and would duplicate/invent ownership.

Thus there is no exact existing signal that can replace the timeout without changing the candidate scope or owner contract.

The timeout cannot be promoted as a correctness boundary merely because it is bounded.

## Race/supersession review

The Pass25 proposal's per-key pending Map and generation token remain directionally sound:
- repeated same-key intents join one pending record;
- resident events are keyed;
- a later canonical advanced-route generation can invalidate stale continuation;
- close-during-load has explicit listener cleanup.

These useful properties do not cure the two blockers above.

The canonical router must also remain a synchronous boolean-style API for already-present targets; global async conversion remains excluded.

## Staging disposition

The staging folder remains coordination-only:

`coordination/inter_ai_dialogues/agent_crypto/candidate_atlas_router_pass25_40_4_98_staging/`

Pass26 updated only coordination artifacts:
- `ATLAS_ROUTER_PATCH_PROPOSAL.js` marked STATICALLY REJECTED / DO NOT INTEGRATE;
- `README.md` frozen with the two blocking proofs;
- `STATIC_ASSERTIONS.md` changed from design-pass language to STATIC FAIL;
- `FIREFOX_OPERATOR_MATRIX.md` suspended for this exact proposal and retained as a future-successor matrix.

No live Administrator file was touched.

## Required successor design properties

Before creating another Atlas-router staging proposal, prove both of these statically:

### A. Authorization-preserving cold resolution

Any cold-target resolution must preserve canonical mode/auth semantics before advanced body hydration starts. Do not duplicate speculative auth logic in a second owner. The exact 40.4.98 function must be refactored or bounded in a way that keeps one canonical authorization transaction and one canonical router.

### B. Terminal handoff

Pending route completion/cancellation needs an owner-grounded terminal semantic signal. Under the current zero-observer/zero-polling/no-owner-change scope, the existing owner does not provide one. If a future design changes that scope, the change must be isolated and justified rather than hidden inside a router patch.

## Protected boundaries retained

Do not mix successor router work with:
- Atlas generic residency retirement;
- Atlas `insertAdjacentHTML` interception;
- `#atlas-local-ai-collapse`;
- no-local-producer / Ryzen OFFLINE-N/A;
- Learning autonomous boundary/source;
- shared monolith;
- Market Core / CURRENT;
- Oracle;
- Backend/Source Intelligence.

Oracle remains CLOSED unless new evidence appears.

## Pass26 verdict

### Newly proven

- Pass25 executable-shape proposal violates canonical auth/mode ordering for cold advanced targets.
- The proposal is STATICALLY REJECTED before Firefox and must not become a Build.
- The 15 s bounded timeout is not an owner-derived semantic terminal condition.
- No existing owner push signal covers terminal failure under the current first-candidate budget.
- Staging is explicitly frozen and Firefox acceptance is suspended for this exact code shape.

### Still open

- successor Atlas cold-router design preserving auth/mode ordering;
- explicit terminal handoff design or separately approved owner-contract scope change;
- Firefox/operator viability only after a successor passes static gates;
- Atlas generic residency retirement after router proof;
- Atlas `insertAdjacentHTML` debt;
- no-local-producer/Ryzen OFFLINE-N/A;
- shared monolith;
- Learning autonomous boundary/source optional high-risk work;
- Backend/Source Intelligence watch;
- Web Classic continues separately from Administrator.

No Build authorization is granted by Pass26.
