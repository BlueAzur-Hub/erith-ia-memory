# Agent-Crypto Runtime Owner Map

Status: CONSOLIDATION WORKING DOCUMENT
Branch: `seven/agent-crypto-consolidation`

Purpose: make ownership explicit before any new runtime patch.

## 1. Canonical market source

### Producer side
Permanent infrastructure candidates:
- `.github/workflows/atlas-public-crypto-market.yml`
- `.github/workflows/atlas-public-crypto-market-clock.yml`
- `.github/workflows/atlas_market_collector.yml`

Required truth:
- one canonical `data/crypto/latest.json` identity;
- publication must advance independently of Atlas UI;
- producer failure must not be hidden by browser runtime state.

### Browser ingestion side
Known current chain from the 40.4.274 audit:

`runLivecheck()` -> `SourceAdapter.publicCryptoMarket()` -> canonical resident state

Rule:
- document visibility may alter presentation work;
- document visibility must not prevent canonical source-state commit.

## 2. CURRENT / pending identity

Canonical pending owner retained from 40.4.137:

`atlasCurrentPendingMarket137`

Associated historical mechanism:
- remember genuinely new canonical;
- pending survives readiness miss;
- readiness owners re-evaluate the same pending;
- one and only one automatic cycle is scheduled;
- pending is cleared only by the canonical close/consume path.

Forbidden:
- second pending owner;
- UI disclosure state as pending owner;
- clearing pending on a temporary readiness miss.

## 3. Readiness

Readiness must represent facts only:
- Bridge reachable;
- Bridge auth valid;
- market snapshot exploitable;
- Binance 5/5 direct and fresh when required;
- graph/source prerequisites ready.

40.4.275 hardened message truth, but message truth is not ownership truth.

Rule:
- each prerequisite may emit a readiness-change event;
- no prerequisite creates a second scheduler;
- all readiness events converge on the same pending-CURRENT evaluator.

## 4. Bridge / authentication

Known current auth-state family from 40.4.273:
- `atlasBridgeAuthLocalState404273()`
- `atlasLocalReportsState.authBlocked404273`

Contract:
- reachability != privileged authentication;
- 401/403 remain auth failures;
- auth failure must not consume model-attempt budget;
- pending CURRENT remains retained across reauthentication;
- successful post-auth rearm resumes the same pending transaction.

## 5. Automatic wake / cycle opening

Known current functions from 40.4.275 patch history:
- `atlasLocalReportsScheduleAutomatic(...)`
- `atlasLocalReportsOpenAutomaticCycle(...)`
- `atlasLocalReportsAutomaticStop(...)`

Contract:
- new pending + readiness true -> exactly one schedule;
- same pending while timer/running -> no duplicate;
- same snapshot after terminal automatic stop -> no implicit reopen;
- explicit operator rearm may reopen;
- new snapshot may open a fresh bounded cycle.

Critical open question:
- which lifecycle/hydration/visibility event still causes a successful re-evaluation only when Atlas is opened?

This is the current P0 investigation target.

## 6. Report pipeline

Known current report owner:

`atlasLocalReportsRunAll(...)`

Nominal order:
1. Market
2. Top 5
3. Math Core
4. Contradictions
5. NØX
6. Aerith

40.4.275 contract:
- first report failure stops the sequence;
- HTTP status is preserved when available;
- no move to report 02 while report 01 remains failed;
- failure reason must remain inspectable after bounded retries stop.

Open debt:
- terminal stop currently may preserve the stop reason but lose the original first-failure detail. This is a diagnostic debt, not permission to add retry loops.

## 7. UI residency / lifecycle

Current file:

`public/agent_crypto_erith_ia/administrator/js/views/atlas-family-demand-residency.js`

Historical contract from 40.4.138/139:
- HOT root: `#atlas-local-ai-collapse`
- HOT root must NOT be registered for detach;
- Atlas can be visually closed while runtime stays resident;
- Auto Reader / Shared Memory / GitHub Memory may remain demand-resident;
- no recurring timer/observer/fetch/storage owner added by residency layer.

Current source still carries historical 40.4.139 ownership markers. That is a consolidation debt to audit, not automatically a bug.

Critical invariant:

**Atlas collapsed = UI closed, runtime still resident.**

Opening Atlas may render state. It must not be required to create state.

## 8. NØX / Aerith / CURRENT close

Downstream contract:

`Atlas 4/4 -> NØX -> Aerith -> CURRENT CLOSED -> REPOS`

Rules:
- NØX and Aerith consume the same fingerprint CURRENT;
- opening details only reads/materializes stored state;
- reading a conclusion does not start a new CURRENT;
- CURRENT close records the consumed fingerprint;
- repeated same snapshot becomes NO-OP.

Exact final close function(s) still need to be mapped before runtime surgery.

## 9. Infrastructure ownership

Permanent functional names are preferred.

Known permanent candidates:
- `agent-crypto-auto-update.yml`
- `agent-crypto-canonical-archive.yml`
- `agent-crypto-version-truth-guard.yml`
- `atlas-public-crypto-market.yml`
- `atlas-public-crypto-market-clock.yml`
- `atlas_market_collector.yml`
- `atlas_news_collector.yml`

Historical build-numbered workflow files are quarantine candidates, not permanent owners.

The obsolete `.github/workflows/agent-crypto-404257.yml` and matching `.github/scripts/agent_crypto_404257_release.py` have already been removed on the consolidation branch.

## 10. P0 to solve before any release

Observed Firefox symptom:
- page loaded;
- Atlas/Auto Reader initially inactive;
- opening Atlas was followed by a successful `Atlas -> 4/4 -> NØX -> Aerith` cycle.

Therefore the active investigation is:

**find the event path produced by opening Atlas and prove whether it is still an accidental wake owner.**

Compare current 40.4.275 against the 40.4.137/138 contract around:
- disclosure toggle;
- hydration;
- lifecycle registration;
- readiness re-evaluation;
- pending re-evaluation;
- automatic scheduling.

No new scheduler is permitted.
