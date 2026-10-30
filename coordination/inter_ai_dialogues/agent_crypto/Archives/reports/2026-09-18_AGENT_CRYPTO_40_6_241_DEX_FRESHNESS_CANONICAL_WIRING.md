# AGENT-CRYPTO 40.6.241 — DEX FRESHNESS CANONICAL WIRING

Date: 2026-09-18
Repository: `BlueAzur-Hub/erith-ia-memory`
Administrator: `public/agent_crypto_erith_ia/administrator/`
Release: **40.6.241**
Parent: **40.6.240**
Market Core: **38.15.11**
Mode: **PAPER ONLY**
Gate 3: **PENDING**
Gate 9: **LOCKED**

## 1. Terrain closure inherited from 40.6.240

The supplied Firefox proof confirms the existing Command Center routing works on Build 40.6.240.

40.6.240 is therefore closed.

## 2. Audit finding

The active Source Truth architecture is:

- Binance direct EUR WebSocket = canonical primary
- Kraken / Coinbase / OKX = CEX controls
- DEX Screener / GeckoTerminal = DEX context only
- DefiLlama = DeFi context only
- private backend = loopback read-only source owner
- Atlas = downstream read-only consumer

The canonical DEX freshness guard exists:

`js/dex-freshness-guard.js`

It fail-closes Atlas eligibility for:

- stale DEX observations
- unknown DEX freshness
- future timestamps outside tolerance

But the stable Source Truth loader did not explicitly load that canonical guard before downstream source readers.

## 3. Repair

Modified file:

`js/views/private-source-demand-loader.js`

Added:

`ensureDexFreshnessGuard()`

The loader now waits for the canonical DEX freshness guard after the Source Truth API exists.

Only after that guard has loaded does the source owner emit:

`erith:private-source-runtime-loaded`

This establishes the bounded startup relation:

`Source Truth -> DEX freshness guard -> source-runtime-loaded -> downstream diagnostics/readers`

Existing CEX freshness and divergence layers remain unchanged.

## 4. Downstream owners unchanged

No code change in:

- `js/views/private-backend-sources.js`
- `js/dex-freshness-guard.js`
- `js/dex-exclusion-diagnostics.js`
- `js/cex-divergence-guard-406101.js`
- `js/atlas-decision-context.js`

DEX diagnostics remain read-only.

Atlas remains a read-only consumer.

## 5. Data semantics unchanged

Unchanged:

- Binance remains canonical primary.
- No DEX price is promoted.
- No synthetic canonical price is created.
- DEX identity/address rules are unchanged.
- Freshness thresholds are unchanged.
- CEX spread thresholds are unchanged.
- Missing data remains missing.
- No financial signal is added.

## 6. Protected systems

Unchanged:

- Market Core 38.15.11
- Web Classique
- Aether
- Atlas CURRENT algorithm
- Oracle
- Lecture Technique
- Strategy A business logic
- Gate state
- private backend code
- real-order behavior

No timer.
No MutationObserver.
No storage write.
No new network owner.
No wallet.
No trading endpoint.

## 7. Commits

Canonical DEX freshness wiring:

`dd7eb7ceb82729a8adf0c8912b88be86f9f850ea`

Release manifest:

`3813437317e8947251715941c39e5babee45ba67`

## 8. Firefox proof required

Reload until:

`Build 40.6.241 · Administrator`

Then:

1. open Sources / Backend once;
2. allow Source Intelligence to hydrate;
3. verify no duplicate Source Truth surface appears;
4. verify DEX remains context/read-only and Binance remains primary;
5. verify Atlas / Oracle / Lecture Technique remain intact;
6. if DEX diagnostics are visible, confirm stale/unknown freshness remains exclusionary rather than silently eligible;
7. export one Firefox markdown proof.

Stop after proof.
