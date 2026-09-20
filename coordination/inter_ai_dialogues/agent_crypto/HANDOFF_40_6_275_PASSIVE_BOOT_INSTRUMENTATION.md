# HANDOFF — 40.6.275 PASSIVE BOOT INSTRUMENTATION

## Base
- Parent product build: **40.6.273**
- Protected engine: **38.15.11**
- Purpose: measure before optimizing.

## Read first
Do not create additional diagnostic pages in Notion. The runtime proof belongs in the browser snapshot and GitHub release history.

## Probe
In Firefox DevTools Console after boot:

```js
AgentCryptoBootProbe.snapshot()
```

Important marks:
`shell-ready` → `chartjs-ready` → `core-evaluated` → `coldboot-start` → `coldboot-owner:...` → `auto-reader-start` → `livecheck-start` → `market-ready` → `graph-ready` / `detail-ready` → `oracle-ready`.

CURRENT semantics:
- `current-pending`: a canonical CURRENT is waiting/eligible.
- `current-closed`: a new CURRENT finished this document lifetime.
- `current-restored`: a previously closed CURRENT was restored; do not count it as fresh computation.

## Terrain order
1. Ryzen — first load after release.
2. Ryzen — normal warm-cache reload.
3. Transformer Book — one normal load, no reload loop.
4. Compare milestone deltas.
5. Only then choose one bottleneck owner for the next surgery.

## Hard locks
No feature removal. No Notion write. No Market Core change. No Oracle/Math business change. No CURRENT rule change. No new timer/observer/storage/network owner. No optimization stacked onto 40.6.275.
