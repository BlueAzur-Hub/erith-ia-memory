# HANDOFF 40.6.396 — REDIVIDER WHITE / RED HUD BLOOM

Parent: **40.6.395**
Source commit: **e720e556dbe3248924fd010b5ef001f2a894e58f**
Market Core: **38.15.11 — unchanged**

## Intent
Validated direction: **white luminous text core -> red halo -> deeper crimson bloom**, without rebuilding REDIVIDER.

## Clean-upload ZIP tree
```text
administrator/
├── build.json
├── index.html
├── index-40.6.396.html
├── redivider-visual.css
├── RELEASE_40_6_396.md
└── HANDOFF_40.6.396_REDIVIDER_WHITE_RED_HUD_BLOOM.md
```

This is a **clean overlay package** on top of 40.6.395. `app.js` is intentionally not duplicated because it is unchanged; the 40.6.395 Math Core boot/restore repair remains on main.

## Truth
PNG, DOM, STOP/RESUME, Paper logic, Math Core logic and Market Core 38.15.11 are unchanged.
Canonical CSS name remains `redivider-visual.css`; no version-numbered REDIVIDER CSS module was created.

Firefox terrain remains required. If bloom and protected surfaces are healthy: **STOP**.
