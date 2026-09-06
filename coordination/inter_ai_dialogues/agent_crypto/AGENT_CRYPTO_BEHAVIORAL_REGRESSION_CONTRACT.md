# Agent-Crypto Behavioral Regression Contract

Status: CONSOLIDATION WORKING DOCUMENT
Branch: `seven/agent-crypto-consolidation`

A release is refused if any critical behavioral contract below fails.

## A. CURRENT wake contract

### A1 — collapsed Atlas, fresh canonical
Given:
- Atlas collapsed;
- Auto Reader collapsed;
- Shared Memory collapsed;
- GitHub Memory collapsed;
- valid Bridge/Auth;
- valid market/graph/Binance readiness;
- new canonical snapshot N+1.

Expected:
- N+1 becomes pending;
- exactly one automatic Atlas cycle starts;
- no disclosure must be opened;
- no F5/browser restart/Bridge restart;
- `0/4 -> 1/4 -> 2/4 -> 3/4 -> 4/4 -> NØX -> Aerith -> CURRENT CLOSED -> REPOS`.

### A2 — graph late
New canonical arrives while graph readiness is false.

Expected:
- pending remains;
- no duplicate cycle;
- graph-ready event re-evaluates same pending;
- exactly one cycle starts when all prerequisites are ready.

### A3 — Bridge late
New canonical arrives while Bridge is unavailable.

Expected:
- pending remains;
- Bridge recovery re-evaluates same pending;
- exactly one cycle after readiness.

### A4 — auth expired
Bridge reachable, privileged auth invalid.

Expected:
- no fake `wake scheduled` message;
- pending remains;
- auth failure does not consume model budget;
- post-auth recovery resumes same pending;
- exactly one cycle.

### A5 — document hidden
New canonical arrives while Firefox document is hidden.

Expected:
- source-state ingestion still commits the canonical;
- presentation work may sleep;
- pending is not lost;
- return to visible does not duplicate the cycle.

### A6 — same snapshot repeated
Snapshot N already closed successfully.

Expected:
- zero new CURRENT;
- zero report generation;
- zero duplicate Aerith conclusion.

### A7 — opening Atlas is not a wake dependency
With N+1 already pending and all readiness true, keep Atlas collapsed.

Expected:
- automatic cycle starts without opening Atlas.

Then open Atlas during or after the cycle.

Expected:
- opening only renders/materializes state;
- no second schedule;
- no retry-budget reset;
- no duplicate CURRENT.

## B. Report failure contract

### B1 — report 01 fails
Simulate/report a genuine first-report failure.

Expected:
- report 02 is not started;
- completed remains 0/4;
- original failure detail remains inspectable;
- bounded retry policy applies;
- terminal stop retains both stop reason and causal failure detail.

### B2 — same-snapshot terminal stop
After automatic retry budget is exhausted for N.

Expected:
- N remains stopped;
- incidental Binance/Graph/visibility/disclosure events do not reopen N;
- attempts are not reset.

### B3 — new snapshot after stop
After N stopped, canonical N+1 arrives.

Expected:
- N+1 may open a fresh bounded cycle;
- previous stop does not poison the new snapshot.

### B4 — explicit operator rearm
After N stopped, operator explicitly requests a rearm.

Expected:
- one new bounded cycle may open;
- reason is recorded as explicit operator action;
- no hidden automatic reset is used.

## C. Message truth contract

The UI must never announce:
- `démarrage autorisé` while a prerequisite is false;
- `réveil résident` unless a timer/cycle was actually armed;
- progress to report N+1 while report N failed;
- `REPOS` as a substitute for an unresolved terminal failure.

## D. Residency contract

Atlas HOT core:
- visually collapsed is allowed;
- runtime DOM/state owner remains resident;
- HOT root is not detached by closed-body demand residency.

Peripheral sections:
- Auto Reader / Shared Memory / GitHub Memory may be demand-resident;
- their hydration may not own or be required for CURRENT wake.

## E. Cross-feature anti-regression smoke gate

Before a future Agent-Crypto release, at minimum verify:

Graph:
- Top 5 available at boot;
- five series render;
- historical data present.

Lecture Technique:
- panel opens;
- RND works;
- validated framing/asset behavior remains intact.

Learning:
- Module 03 school example action works behaviorally, not merely by DOM presence.

Simulation:
- paper buy/sell path still computes costs and scenarios.

Atlas:
- A1 through A7 pass.

Oracle:
- panel and engine remain accessible;
- no reconstruction/change unless explicitly in release scope.

If any protected behavior fails:

**BUILD REFUSED. NO RELEASE COMMIT.**

## F. Infrastructure release contract

Permanent infrastructure uses stable file names.

Forbidden for new work:
- build-numbered permanent workflow files;
- emergency one-shot workflow left on `main` after delivery;
- release-specific script left on `main` when a generic owner exists.

Generic permanent owners should absorb reusable release behavior.

## G. Acceptance proof

A future Atlas repair is not closed by static strings alone.

Required final proof:

1. static/fixture behavior gates pass;
2. GitHub release workflow succeeds;
3. Firefox receives a genuinely new canonical while Atlas remains collapsed;
4. exactly one automatic CURRENT completes without opening Atlas;
5. opening Atlas afterwards only displays the already-running/already-completed state.
