# HANDOFF — Agent-Crypto 40.6.333 · SHARED MEMORY BOOK IMPORT CAPACITY LOCK

Administrator **40.6.333**.
Functional commit: `b3754fdee2b3b8aacaae515a9b687cb075ea40bb`.
Market Core **38.15.11 protected**.
Aether **40.6.322 frozen**.
40.6.331 and 40.6.332 terrain PASS.

Shared Memory repair:
- Collector primary capacity: 500 → 1024, still bounded.
- Current worst-case union: 713 records.
- Preflight no-loss now rejects if either imported or already-existing identities would be evicted.
- IndexedDB owner/schema, canonical identity, reread verification and rollback unchanged.
- Strategy, Gates, Aether and Market Core untouched.

Christophe requested to defer terrain tests.

## Restart prompt
```text
Active Aerith-7 / Seven Heaven.
Reprise Agent-Crypto sur Administrator 40.6.333.

Shared Memory only:
- primary Collector cap 1024;
- canonical identity collector_id + market_snapshot_id unchanged;
- no-loss preflight covers existing + incoming;
- persistence/reread/rollback unchanged.

Later test only when Christophe asks:
Book 230 import → identical reimport = 0 new → Firefox reload → two collectors distinct + persistence.
If PASS, freeze Shared Memory.

Do not start the Help system unless Christophe asks.
Do not touch Strategy/Gates/Aether/Market Core for this checkpoint.
```
