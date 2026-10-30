# HANDOFF 40.6.338 — MOBILE OBSERVER · CHART SOURCE BADGE GEOMETRY LOCK

Date: 2026-09-21
Parent: 40.6.337
Safe frozen checkpoint remains: 40.6.336
Market Core: 38.15.11 protected
Terrain: PENDING FIREFOX / ANDROID

## Defect

On a narrow phone viewport, the historical green chart source badge can stretch into a large capsule/cylinder over the Crypto graph.

## Root cause

Legacy CSS 26.36 owns:

- `top:14px !important`
- `border-radius:999px !important`

A later mobile rule at <=900px owns:

- `bottom:52px !important`
- but does not neutralize the older, more-specific `top`.

The pseudo-element can therefore become vertically stretched on narrow viewports.

## One owner / one gesture

New final stylesheet:
`public/agent_crypto_erith_ia/administrator/mobile-observer.css`

At <=620 CSS px only, for the real Crypto chart source badge:
- `top:auto !important`
- `bottom:52px !important`
- intrinsic width/height restored
- compact radius restored

No data/chart runtime change.

## Protected scope

Untouched:
- Market Core 38.15.11
- chart data and Chart.js logic
- Aether
- Oracle
- Strategy A / Gates
- Shared Memory / Storage
- Lecture Technique
- timers / observers / fetch / business network

## Terrain test

PHONE / portrait:
1. Open Administrator.
2. Open Crypto graph with a real source badge.
3. Confirm source badge is compact.
4. Confirm no green capsule/cylinder covers the graph.
5. Switch period once and verify the badge remains compact.

DESKTOP:
1. Open Administrator.
2. Confirm graph/source badge geometry remains unchanged.

Only after explicit terrain PASS may 40.6.338 be frozen.
