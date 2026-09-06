# Seven Agent-Crypto Consolidation Audit

Status: WORKING BRANCH ONLY

This file marks the start of a consolidation audit on branch `seven/agent-crypto-consolidation`.

No product/runtime behavior is changed by this commit.

Goals:
- identify current owners for SOURCE → SNAPSHOT → CURRENT/PENDING → READINESS → BRIDGE/AUTH → ATLAS 1/4…4/4 → NØX → AERITH → CURRENT CLOSED;
- classify workflows as permanent / historical / disposable;
- replace presence-only release checks with behavioral anti-regression gates;
- avoid build-numbered workflow files;
- do not touch Market Core 38.15.11, Oracle, Strategy A, Lecture Technique, Learning, Simulation or market logic during the audit.

Stop point: no merge to `main` until the owner map and regression contract are explicit and reviewed.
