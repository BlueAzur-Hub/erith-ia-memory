# Seven Heaven — OKX Spot PAPER fees and one-click FRESH comparison
**Shared inter-AI handoff · 13 November 2026 · Published application hotfix**

## Exact objective and observed fees

The user repeatedly requested that PAPER defaults match the personal OKX Spot fees already verified and stored in the canonical Notion **OKX MEMORY CORE → 01 · Trading Fees**. Do **not** ask the user for these screenshots again.

- **Spot maker:** **0.0800 %** = **0.08 %** = numeric `0.08`.
- **Spot taker:** **0.1000 %** = **0.10 %** = numeric `0.1`.
- `0.1` and `0.10` have the **same numerical value**. The user wants a stable **French display `0,10`**, not a higher trading commission.
- These observations are dated 6, 9 and 12 November 2026. Special pair fees, future tiers and actual historical execution are NOT certified.
- Canonical reference (already published; do NOT create another copy of the fee record): [OKX Spot fee memory](./SEVEN_HEAVEN_OKX_OBSERVED_SPOT_FEE_REFERENCE_2026_11_12.md).

## Current runtime architecture

The two public repositories each have their **own** Administrator 40.6.719 application and Trader iframe, with Market Core 38.15.11. The Trader in each repository inherits its **same-origin** Administrator runtime. Thus a patch to the corresponding Administrator JS reaches **four UI surfaces in source**, without copying engines into Trader.

- MASTER: `BlueAzur-Hub/erith-ia-memory`, Administrator + MASTER Trader.
- Operator: `BlueAzur-Hub/agent-crypto-operator`, Yoann profile + Operator Trader.
- **Neither private Bridge, OKX credential, TRADUS private application, market engine nor any order endpoint was altered.**

## Actual merged application patches — verified

### MASTER
- PR [#750](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/750), merge commit **`1cadae05b8087b0c624ec4b3f2ceaead68f7cc5e`** on `main`.

### Operator
- PR [#38](https://github.com/BlueAzur-Hub/agent-crypto-operator/pull/38), merge commit **`353d1c0462283c615122bb8e8121e070af11b999`** on `main`.

The three `administrator/js/` source files have **identical Git blob fingerprints in both repositories**:
- `market-microscope-paper-backtest-v5.js`: `428003b37578b9b516a3f3e97696ee7c0a81836d`.
- `market-microscope-orderbook-paper-v6.js`: `ed7994ab8c9b8024afb49d0be11bfbc8056228bf`.
- `market-microscope-paper-spot-realism-comparison.js`: `866288383970b461a7da14b14182f59f24ce0535`.

Each `administrator/index.html` now references the same modules using refreshed cache query values. Numerical simulation `feePercent=0.1` is **unchanged**, as are V5/V6 pricing methods and the **15-second FRESH age gate**. Inputs now render `0,10` and accept both `0,10` and `0.10` as **0.1 percent**, not 10 percent or 0.8 percent.

### One-click comparison

Before patch: V5/V6 comparator read `AgentCryptoOkxMicrostructure.snapshot()` synchronously and could refuse `BOOK_CONTEXT`/stale after a human navigated to its button.

After patch: if context is stale or absent, it calls the **existing** read-only `ErithMarketBookPaperV6.openDepthAndEstimate`, which opens Technical Reading and Depth, refreshes the public order book and waits for a same-pair snapshot; the comparator then re-reads and evaluates the book immediately. Duplicate click is blocked; pair changes during the awaited refresh are refused; timeouts remain explicit. **No fake FRESH, no extra order or account API and no widening of the freshness window.**

## Verified tests, deployment and remaining gates

- **SOURCE_COMMITTED — PASS:** both merge commits and Git blob parity confirmed on main.
- **SCOPED STATIC/INTERACTIVE TESTS — PASS:** 0,10 defaults, comma parsing, one-click stale→refresh, timeout response, pair change rejection, duplicate-click guard. Interactive DOM test was executed as a simulated browser model, NOT Windows Firefox.
- **MASTER PAPER CI — PASS:** V5, V6 and shared Spot Lot integration workflows on the candidate branch; Version Truth and Version Delivery guards also passed.
- **OPERATOR CI — PASS:** scoped PAPER Spot Lot Mirror, microscope V4/V5/V6, role/delta, Phase C Firefox CI and Yohan Operator checks after candidate patch fixes.
- **MASTER PAGES_DEPLOYED — PASS:** [GitHub Pages run #43364115311](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43364115311), both `build-runtime` and `deploy-runtime` succeeded at the merged MASTER revision.
- **OPERATOR PAGES_DEPLOYED — PASS:** [GitHub Pages run #43364131314](https://github.com/BlueAzur-Hub/agent-crypto-operator/actions/runs/43364131314), `build` and `deploy` succeeded at the merged Operator revision.
- **FIREFOX_LOADED (Windows user PC) — PENDING:** not witnessed in the user’s browser. The current build badge still displays 40.6.719; this was a narrowly scoped hotfix **without** a full version-bump cycle.
- **FUNCTIONALLY_VALIDATED on Windows user PC — PENDING:** server deployment and CI do NOT prove visual/client acceptance.
- **ARCHIVE_READY with canonical numbered ZIP — NOT COMPLETED** for this hotfix. The legacy MASTER `Package Administrator current release` workflow at [run #43364115243](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43364115243) failed because `verify_administrator_graph_provenance_714.cjs` expects build **40.6.714** while current application is **40.6.719**. Do not misrepresent this as an error in the new PAPER modules or declare a ZIP published.
- Other broad MASTER workflows reported failures outside changed files (e.g. missing historical `graph-native-usd-406520.js`, older market microscope / Depth guards); keep them separately visible. Do not silently “fix” unrelated modules or claim all checks green.

## User verification (single action)

Open the MASTER Administrator Interface after deploying; confirm that **V5 fee reads `0,10` and V6 Taker fee reads `0,10` without typing**, and that one click on `Comparer V5 + carnet V6 (PAPER)` automatically refreshes and computes or explicitly refuses unavailable OKX data. Repeat at Operator only when available. No cache storage deletion required; use standard page refresh if it is already open.

## Next research step: external bots

Continue the previously published [Freqtrade / Hummingbot strategy lab plan](./SEVEN_HEAVEN_FREQTRADE_HUMMINGBOT_AND_NAUTILUSTRADER_STRATEGY_LAB_RESEARCH_AND_OPERATOR_TRADUS_HANDOFF_2026_11_13.md): isolated GitHub Actions/Python validation of **44,640 frozen January 2026 Binance BTCUSDT 1m candles**, exact archive hash, no account keys. Only after dataset coverage and external controller fill semantics are proven, compare the model to our existing Grid PAPER. No Hummingbot or Freqtrade engine was installed/executed as part of this UI hotfix.

**Important:** source-merged, CI-scoped-pass and Pages-deployed are proven. Firefox Windows acceptance, canonical ZIP and full MASTER regression certification remain **explicitly unproven**. Never turn these into PASS without actual evidence.
