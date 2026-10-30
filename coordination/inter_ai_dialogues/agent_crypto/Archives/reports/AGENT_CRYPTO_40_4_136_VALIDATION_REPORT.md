# Agent-Crypto 40.4.136 — Validation Report

- Parent: `40.4.135`
- Market Core: `38.15.11` protected
- Expected local stack: `Aether Control V2.3.2R13 / Bridge V1.9.11`
- Deterministic Top 5 guard: active
- ZIP SHA-256: `c88cfb20a92ff79df8c3cf7f4e6f181553ed880ec9baa8e2841ad9678bcb995f`

## Scope

Only local-stack version truth + deterministic Top 5 model-comment guard. No Bridge/Control Center binary, Graph, Oracle, CURRENT, News, Aether ribbon, Chronos, Window Manager or Market Core business-logic change.

## Pre-JS gates

- parent bytes: PASS
- manifest hashes: PASS
- HTML IDs unique: PASS
- runtime budget: unchanged
- protected files: byte-identical
- stale expected V1.9.5/R5: removed
- deterministic Top 5 guard marker: present

## JS gate

PASS — all Administrator JavaScript files passed `node --check`.
