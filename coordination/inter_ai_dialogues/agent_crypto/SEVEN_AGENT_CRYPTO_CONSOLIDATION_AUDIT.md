# Seven Agent-Crypto Consolidation Audit

Status: WORKING BRANCH ONLY
Branch: `seven/agent-crypto-consolidation`
Public runtime remains untouched on `main`.

## Objective

Stop the patch cascade and rebuild a single explicit ownership chain:

`SOURCE -> SNAPSHOT -> CURRENT/PENDING -> READINESS -> BRIDGE/AUTH -> ATLAS 1/4..4/4 -> NOX -> AERITH -> CURRENT CLOSED`

No new feature is allowed during this consolidation.

Protected during the audit:
- Market Core 38.15.11
- Oracle
- Strategy A
- Lecture Technique
- Learning
- Simulation
- market logic

## First cleanup already executed on this branch

The obsolete build-specific workflow `.github/workflows/agent-crypto-404257.yml` was removed.

Reason:
- it is tied to a historical 40.4.257 release;
- it triggers only on its own workflow path;
- it contains the malformed heredoc/indentation path that produced immediate GitHub Actions failures with zero useful runtime work;
- it has no legitimate ownership role in current 40.4.275 runtime.

The matching one-shot script `.github/scripts/agent_crypto_404257_release.py` was also removed from this branch.

No application/runtime file was changed by these removals.

## Workflow inventory rule

Permanent workflows must have stable functional names.

Examples of permanent-name candidates already present:
- `agent-crypto-auto-update.yml`
- `agent-crypto-canonical-archive.yml`
- `agent-crypto-version-truth-guard.yml`
- `atlas-public-crypto-market.yml`
- `atlas-public-crypto-market-clock.yml`
- `atlas_market_collector.yml`
- `atlas_news_collector.yml`
- archive/depth workflows with stable domain names

Build-numbered workflows are not allowed as permanent infrastructure.

Current quarantine candidates include historical files such as:
- `aether-emergency-release-40-4-151.yml`
- `agent-crypto-40-4-107-patch.yml`
- `agent-crypto-40-4-131-patch.yml`
- `agent-crypto-40-4-222-223-truth-cascade.yml`
- `agent-crypto-404239.yml`
- `agent-crypto-404239-r1.yml`
- `agent-crypto-404240.yml`
- `agent-crypto-404241.yml`
- `agent-crypto-404242.yml`
- `agent-crypto-404243.yml`

These are NOT deleted blindly. Each must be classified as active dependency / historical evidence / disposable one-shot before removal.

## Consolidation doctrine

1. One state -> one owner.
2. One event -> one wake path.
3. Opening a UI disclosure must never be required to wake Atlas.
4. Opening a UI disclosure must never create a duplicate wake.
5. A new canonical stays pending until consumed or explicitly refused.
6. Same snapshot already closed -> no new CURRENT.
7. Same snapshot failed and stop budget exhausted -> remains stopped unless explicit operator rearm.
8. New snapshot -> eligible for a new bounded cycle.
9. First report failure stops the report sequence and preserves the real cause.
10. Release gates must test behavior, not only presence of strings/files.

## Historical anchors retained

- 40.4.67: DOM/runtime boundary regression family.
- 40.4.79: HOT Atlas restoration attempt.
- 40.4.90: lost-wakeup regression family.
- 40.4.137: canonical pending owner retained until readiness, then one AUTO wake.
- 40.4.138/139: collapsed UI with HOT Atlas core boundary.
- 40.4.256: old wrapper cleanup around the 40.4.137 owner.
- 40.4.273: Bridge/Auth truth recovery.
- 40.4.274: source-state / document-visibility decoupling.
- 40.4.275: decision truth / failure stickiness / retry-budget hardening.

The latest Firefox observation still suggests that opening Atlas may have triggered the cycle. Therefore the P0 is not closed by 40.4.275.

## Required deliverables before any merge

- `AGENT_CRYPTO_RUNTIME_OWNER_MAP.md`
- `AGENT_CRYPTO_BEHAVIORAL_REGRESSION_CONTRACT.md`
- workflow classification permanent / historical / disposable
- exact list of overlapping wake/lifecycle owners
- exact removal plan
- behavioral gate proving Atlas can start with all disclosures collapsed

## Stop point

No merge to `main` and no 40.4.276 product release until the owner map and regression contract are explicit and the branch diff contains no speculative runtime patch.
