# Agent-Crypto historical workflows

CI FIREBREAK — 2026-10-05.

These workflows were moved out of `.github/workflows/` because historical version validators were all waking up on each new Administrator push.

The move preserves their source in Git while preventing GitHub Actions from auto-registering or auto-running them.

Active Agent-Crypto workflows intentionally left in `.github/workflows/`:
- `agent-crypto-candles-indicator-truth-406562.yml` — current build 40.6.562 validation/package
- `agent-crypto-version-truth-guard.yml` — cross-version truth guard
- `agent-crypto-version-delivery-guard.yml` — cross-version delivery guard

Historical workflows must not be restored to `.github/workflows/` as a batch. If one is needed for forensic/manual use, inspect it first and prefer a single current workflow owner.
