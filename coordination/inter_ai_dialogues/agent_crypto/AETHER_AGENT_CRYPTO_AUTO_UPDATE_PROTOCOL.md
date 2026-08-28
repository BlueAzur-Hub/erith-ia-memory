# AETHER · AGENT-CRYPTO AUTO-UPDATE PROTOCOL

Status: ACTIVE
Scope: public/agent_crypto_erith_ia/administrator/
Authority: published GitHub main state

## Purpose

Allow a prepared Agent-Crypto Administrator build to be installed automatically without requiring the human operator to click through file uploads for each version.

The bot installs a prepared build. It does not invent a build, change requirements, or bypass validation.

## Trigger

The workflow `.github/workflows/agent-crypto-auto-update.yml` watches only:

`coordination/inter_ai_dialogues/agent_crypto/auto_update/request.json`

Payload files must already exist under:

`coordination/inter_ai_dialogues/agent_crypto/auto_update/payload/`

The request is committed last so the workflow never starts on an incomplete payload.

## Required request contract

Schema: `agent_crypto_auto_update_request_v1`

Required fields:
- `build`
- `parent_build`
- `critical: false`
- `files`: exact Administrator-relative payload paths
- `delete`: empty

## Automatic gates

Before any publication the bot checks:

1. GitHub current build equals `parent_build`.
2. New build is strictly greater than parent.
3. `version.json` and `administrator-version.json` are both present and aligned.
4. Asset token equals the new build.
5. Market Core reference remains exactly `38.15.11`.
6. Publication mode remains `Administrator`.
7. No automatic deletion is requested.
8. No positive trading/write/canonical-price/financial-signal capability is enabled.
9. Main runtime budgets do not increase for:
   - `setInterval(`
   - `MutationObserver`
   - `IntersectionObserver`
   - `new WebSocket`
   - `localStorage.setItem`
10. `private-backend-sources.js` contains no permanent `setInterval(` polling.
11. Manifest SHA-256 hashes match the resulting files.
12. Every changed functional file is declared in `version.json`.
13. `index.html` has no duplicate IDs.
14. Main JavaScript files pass `node --check`.

Any failure is a **STOP CRITIQUE**. The production Administrator files are not committed.

## Successful publication

On PASS the bot:

1. commits the validated Administrator update to `main`;
2. writes a receipt in `coordination/inter_ai_dialogues/agent_crypto/auto_update_receipts/`;
3. removes the transient `auto_update/` staging payload;
4. triggers the canonical archive workflow through the changed `version.json`.

The archive workflow then creates automatically:

- `AGENT_CRYPTO_BUILD_<BUILD>_AUTO_CANONICAL.zip`
- `AGENT_CRYPTO_BUILD_<BUILD>_AUTO_CANONICAL.zip.sha256`

inside `coordination/inter_ai_dialogues/agent_crypto/`.

## Hard boundaries — human return required

The auto-update bot MUST STOP and wait for the human operator before any change involving:

- Market Core ownership or reference build;
- Atlas CURRENT cadence/fingerprint/finalization semantics;
- Oracle prediction/evidence ownership;
- IndexedDB schema or destructive storage migration;
- Bridge executable / port / authentication contract;
- Private Backend executable or local producer installation;
- API keys, secrets, wallet, withdrawals, signatures or private exchange access;
- trading/order execution or financial action;
- deletion/retirement of files where ownership is not proven;
- runtime budget increase;
- failed Firefox/operator validation that affects correctness or responsiveness.

## Local services

The GitHub bot updates only the public Administrator source tree.

It does NOT install or replace:

- Atlas/Ollama Bridge on `127.0.0.1:8787`;
- Private Backend on `127.0.0.1:8790`;
- any executable or local machine configuration.

Those remain explicit human checkpoints.

## Current handoff — 2026-08-28

Published runtime authority at the end of the long Crypto thread: `40.4.88`.

Runtime commit:

`0b8672c4d2481bf21205e2cc74082ea591175d08`

Canonical end-of-thread checkpoint:

`coordination/inter_ai_dialogues/agent_crypto/2026-08-28_AGENT_CRYPTO_END_OF_THREAD_40_4_88_DEBT_SETTLEMENT_CHECKPOINT.md`

Next-thread prompt:

`coordination/inter_ai_dialogues/agent_crypto/2026-08-28_AGENT_CRYPTO_REPRISE_PROMPT_NEXT_AETHER.md`

The next research boundary is **presentation-owner consolidation**, not another broad performance wave:

- prove and retire redundant generic residency for already true-lazy Projects/Operations bodies;
- reduce System generic residency to responsibilities that still have real resident bodies, with Simulation treated separately;
- reduce Atlas generic residency without delaying the critical Atlas cockpit;
- modernize stale residency/architecture diagnostics;
- then address the new `no local producer` truth so absent Ryzen/Bridge/Ollama state is `OFFLINE / N/A`, never fake `0 %` live telemetry.

No automatic runtime publication is authorized by this handoff alone. A candidate must first satisfy this protocol’s gates and real Firefox/operator non-regression validation.
