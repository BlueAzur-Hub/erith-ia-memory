# Agent-Crypto 40.4.273 — Atlas State Truth + Bridge Auth Recovery

- Parent: 40.4.272
- Market Core protected: 38.15.11
- Scope: Atlas/Bridge authentication boundary only.

## Operator regression reproduced

Firefox remained in Administrator role while the privileged Bridge session was no longer valid. `/health` could still prove loopback reachability, while `/summary` or `/chat` rejected privileged work. The old runtime then hid the real cause and could advance the visible task label while remaining at 0/4.

## 40.4.273 correction

- Distinguishes Bridge reachability from privileged Administrator authentication.
- Reads the existing session token expiry before protected model calls when parseable.
- Preserves HTTP 401/403 and classifies them as `auth`, not generic `bridge-error`.
- Reopens the existing Aether Trust gate when privileged auth is missing or expired.
- The Administration header button also reopens Trust when Firefox still has owner role but Bridge auth is stale.
- Atlas stops on the failing report; it never advances to the next report while the counter remains unchanged.
- Automatic retries are suspended while auth is blocked.
- The existing pending CURRENT key remains untouched and the existing post-auth 40.4.51 / 40.4.137 rearm owner resumes the same pending canonical transaction after successful Trust authentication.
- Auth failure does not consume an automatic model-attempt budget.
- Existing Atlas meta exposes a compact truth chain: SNAPSHOT / CURRENT / BRIDGE / AUTH / OLLAMA / ATLAS n/4.

## Protected surfaces

- Market Core 38.15.11: unchanged.
- Strategy A 40.4.272 logic: unchanged.
- Oracle: unchanged.
- NØX/Aerith business semantics: unchanged.
- Bridge protocol/backend: unchanged.
- No new recurring timer, observer, fetch owner or storage owner.

## Validation

- `node --check` root runtime: PASS.
- `node --check` Administrator runtime: PASS.
- Canonical version-truth guard: PASS.
- Static markers for auth classification, Trust re-entry, stop-sequence and retry suspension: PASS.

Firefox acceptance target: let a Bridge session become invalid while Firefox remains Administrator. A protected Atlas action must show `AUTH BRIDGE REQUISE`, open Aether Trust, remain on the same pending CURRENT, then resume once after successful authentication.
