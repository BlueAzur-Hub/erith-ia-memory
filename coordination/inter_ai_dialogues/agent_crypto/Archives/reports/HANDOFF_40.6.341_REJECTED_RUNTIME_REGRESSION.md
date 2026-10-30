# Agent-Crypto 40.6.341 — REJECTED / TERRAIN FAIL

Date: 2026-09-22
Operator: Christophe
Observed in: Firefox Ryzen
Status: **REJECTED — runtime regression**
Rollback target: **40.6.340**
Safe pre-341 commit: `3103f47f95594ee95f1f508f19870c4249fe4551`

## Terrain evidence

Immediately after 40.6.341 was published, the Administrator interface no longer reached its normal consultation state:
- Livecheck remained required / waiting;
- Veille remained waiting;
- Crypto chart reported historical data waiting / unavailable;
- the normal market/chart consultation surface was not restored.

This is a direct functional regression. Per project discipline, the Storage surgery stops here.

## Decision

Restore the exact 40.6.340 runtime files modified by 40.6.341:
- `administrator/app.js`
- `administrator/build.json`
- `administrator/index.html`

Do **not** create 40.6.342 for this rollback.
The 40.6.341 commit and ZIP remain only as rejected historical evidence.

## Protected state

- Market Core 38.15.11 unchanged.
- Aether 40.6.322 frozen.
- Strategy A / Gates unchanged.
- Oracle unchanged.
- Lecture Technique unchanged.
- No Storage retirement was operator-validated.
- No manual localStorage or IndexedDB deletion is authorized.

## Next

Storage PRIMARY returns to **STOP / audit only** until a safer repair is designed from the restored 40.6.340 runtime.
