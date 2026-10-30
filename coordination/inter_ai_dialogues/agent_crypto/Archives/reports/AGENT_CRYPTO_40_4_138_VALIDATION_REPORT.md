# Agent-Crypto 40.4.138 — Validation Report

- Public parent: `40.4.136`
- Includes cumulative candidate logic: `40.4.137 Atlas AUTO resident wake recovery`
- Release: `ATLAS COLLAPSED UI · HOT CORE RESIDENCY · AUTO WAKE RECOVERY LOCK`
- Market Core: `38.15.11` protected
- Status: `candidate_atlas_collapsed_hot_core_auto_wake_operator_validation_required`
- ZIP SHA-256: `d96e53262d1d3b38908ed2450844ef77f4dda1977fe39372ba9d09bc7d89000e`

## P0

Atlas top-level UI is collapsed by default while the HOT cockpit/runtime DOM stays resident. Auto Reader, Shared Memory and GitHub Memory remain collapsed/demand-resident. The cumulative 40.4.137 pending-canonical owner preserves a genuinely new canonical through readiness misses and retries only from existing Market/Graph/Binance/Bridge/post-auth readiness owners.

## Gates

- public parent byte hashes: PASS
- JavaScript syntax: PASS
- JSON manifests + publication identity 40.4.138: PASS
- index IDs unique: PASS
- HOT Atlas root excluded from detach selectors: PASS
- peripheral Atlas disclosures remain demand-resident: PASS
- pending canonical survives readiness miss: PASS
- no new recurring polling/observer/WebSocket/network owner: PASS by bounded diff

## Firefox acceptance

Leave Atlas + Auto Reader + Shared Memory + GitHub Memory collapsed. A genuinely new canonical must produce exactly one `Atlas 0/4 → 4/4 → NØX → Aerith → CURRENT → REPOS` without opening a disclosure, F5, browser restart or Bridge restart. If a disclosure must be opened, FAIL.
