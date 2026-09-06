# Agent-Crypto 40.4.275 — Atlas Decision Truth · Failure Stickiness · Retry Budget Lock

- Parent: 40.4.274
- Protected Market Core: 38.15.11
- Release: ATLAS DECISION TRUTH · FAILURE STICKINESS · RETRY BUDGET LOCK
- Scope: Atlas decision/error ownership only

## Evidence reproduced on 40.4.274
Four contradictions were reproduced with the sister probe before surgery:

1. Binance 5/5 can be stale while the operator label still says Atlas start is authorized.
2. Bridge authentication can block scheduling while the UI still announces a resident wake.
3. A failure on report 01 can still allow report 02/03/04 requests to continue while completed remains 0/4.
4. The automatic attempt limit can close a cycle, then the existing resident pending path can reopen the same snapshot and reset the budget.

The HTTP 500 case is a deterministic test scenario, not a claim about Christophe's local Bridge.

## Surgery
- Extend readiness truth with Binance freshness/feed-state details while preserving the existing freshness threshold.
- Render the actually blocking readiness prerequisite; no false “démarrage autorisé”.
- Publish a resident wake message only when the existing timer is really armed.
- Stop report sequencing on the first non-auth Bridge/report failure and preserve HTTP status when available.
- Bind automatic failure stop to the current snapshot identity in the existing Atlas state object.
- Keep a stopped snapshot stopped across repeated resident/Binance events.
- Allow a new snapshot or an explicit operator/manual rearm to open a new cycle.
- Preserve the existing canonical CURRENT owner `atlasCurrentPendingMarket137`.

## Validation
- JavaScript syntax: PASS.
- Sister probe before patch: four contradictions reproduced.
- Sister probe after patch: 15 targeted scenarios PASS.
- Probe rerun after release identity write: PASS.
- Canonical Version Truth guard: PASS.
- Valid 4/4 report path and conclusion call remain available in the deterministic probe.
- MANUEL, expired auth, missing graph, missing prices, fallback prices and Bridge offline remain blocking.
- Five repeat events on a stopped snapshot create no extra attempt; N+2 arms one wake.

## Protected invariants
- Market Core remains 38.15.11.
- 40.4.273 Bridge/Aether Trust recovery remains intact.
- 40.4.274 resident hidden-document market ingestion remains intact.
- No new timer, observer, fetch owner, WebSocket, storage owner, scheduler or pending CURRENT owner.
- Lecture Technique, Oracle, Strategy A, graph engines and real-order surfaces are untouched.
- No real Kraken order.

## Firefox acceptance target
On the production Ryzen/Firefox path, a genuinely new snapshot must either complete CURRENT through 1/4→4/4→NØX→Aerith or remain stopped on a precise blocking/error state. A failed snapshot must not advance to later reports or silently reset its attempt budget; a newer snapshot or explicit operator rearm may start a fresh cycle.
