# Agent-Crypto 40.6.235 — G3 Evidence Era Map Explicit Mount Repair

Date: 2026-09-17

## Scope

Bounded presentation/lifecycle repair. No Strategy A business rule, Market Core, Gate state, order path, network business request or storage owner is changed.

## Terrain diagnosis

The full Firefox markdown export from Build 40.6.232 contains the current strict Strategy A truth from 40.6.228 and 40.6.229, but the expected evidence-era map is not surfaced.

Static owner inspection shows a narrow lifecycle gap:

- `strategy-a-evidence-dossier.js` can lazily create/recreate `#strategyADossier`;
- the 40.6.232 map scheduler can run before that anchor exists;
- no explicit event previously announced completion of the real dossier render.

## Repair

### Evidence Dossier owner

`public/agent_crypto_erith_ia/administrator/js/strategy-a-evidence-dossier.js`

After a successful real render, it now dispatches:

`agent-crypto:strategy-a-evidence-dossier-mounted`

This is a presentation lifecycle notification only. It does not mutate evidence or Gate state.

### Era-map consumer

`public/agent_crypto_erith_ia/administrator/js/administrator-operator-focus-406216.js`

The existing single G3 evidence-era map now listens to the explicit dossier-mounted event and schedules its existing bounded refresh.

The existing map id `strategyAG3EvidenceEraMap406232` is intentionally preserved to avoid duplicate surfaces.

## Static verification

Both modified JavaScript files parse successfully after the repair.

## Protected truth

- Market Core: 38.15.11
- Current strict outcome authority: 40.6.228
- Current execution-realism authority: 40.6.229
- Joined decisions: 3
- Strict horizons: 9/9
- Actual after-cost terrain trades: 0
- Partial-fill terrain: NOT PROVEN
- Execution latency: NOT PROVEN
- Execution liquidity: NOT PROVEN
- G3: PENDING
- G9: LOCKED
- PAPER ONLY

## Firefox proof still required

Reload Build 40.6.235, open Strategy A / Evidence normally and verify exactly one:

`STRATEGY A · CARTE DES PREUVES G3 · 40.6.235`

It must identify 40.6.228 + 40.6.229 as current authority and must not promote Gate 3.

After that proof, stop touching the historical evidence chain. The next real blocker is natural Strategy A PAPER after-cost execution evidence; never force a trade to manufacture sample count.
