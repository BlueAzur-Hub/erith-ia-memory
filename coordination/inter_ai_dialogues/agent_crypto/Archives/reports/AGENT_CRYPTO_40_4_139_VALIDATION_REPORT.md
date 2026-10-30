# Agent-Crypto 40.4.139 — Validation Report

- Parent: `40.4.138`
- Market Core: `38.15.11` protected
- Release: `ATLAS FAMILY DEFAULT COLLAPSE · HOT CORE PRESERVED · CANONICAL PRODUCER REARM`
- Published candidate prepared: `2026-08-31T21:24:39Z`
- ZIP SHA-256: `07192c2363369847dce96acc78feec3b4aaccafb7216365916928c8ec9479fc4`

## Reproduced failures

1. Family `02 · Intelligence, mémoire & création` was forced expanded in Administrator by `ensureAdministratorAtlasVisible()` and `atlasPrimaryAtAdminBoot`.
2. Canonical `data/crypto/latest.json` remained at 31/08/2026 21:38:06 Europe/Paris while direct Graph/Scanner data continued to advance.

## Surgery

- Family 02 starts docked compact/minimized unless an explicit hash targets it.
- Administrator visibility recovery no longer expands family 02.
- Inner Atlas HOT core remains resident while presentation is collapsed.
- 40.4.137 pending-canonical wake is preserved.
- Existing canonical market clock rearmed at bootstrap revision 2; no new scheduler or collector.

## Gates

- JS syntax gate: executed by workflow after this script.
- HTML IDs unique: PASS.
- Forced family-02 expansion removed: PASS.
- Atlas HOT root non-detachable: PASS.
- Pending wake preserved: PASS.
- Runtime recurring-owner budget: unchanged.
- Market Core 38.15.11: protected.

## Firefox gate

PASS requires a new canonical `data/crypto/latest.json` followed, in already-open Firefox with family 02 compact, by exactly one `Atlas 0/4 → 4/4 → NØX → Aerith → CURRENT → REPOS` cycle without F5 or opening Atlas.
