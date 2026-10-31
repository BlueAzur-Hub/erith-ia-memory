# Chart architecture — repair audit and handoff

## Purpose
Preserve the currently deployed Administrator 40.6.719 while repairing a verified source-code ownership problem. Do not claim general correctness from one successful Hausses 5 run. No build promotion or browser deployment from this branch.

## Grounded Firefox observations
- One 40.6.719 session displayed Hausses 5 5/5 USD/24h, 5 direct histories, after refresh.
- A later 40.6.719 intermediate-view click Top 5 displayed a retained BTC Solo chart and `Target Top 5 · BTC · ETH · BNB · XRP · SOL · comparaison normalisée en préparation`.
- Local storage cleanup on 40.6.718 had already reduced localStorage from 5.01 MiB to 2.08 MiB; IndexedDB PRIMARY remained stable.
- Those screenshots do not prove a unique runtime branch for the Top 5 failure.

## Confirmed source-level defects at base
- `renderComparisonAnalystPanel()` recorded `chartEngineV2.loading=true` and `activeRequestKey` before async work, but only its normal exit cleared them; aborted, superseded or thrown paths could leave an apparent active transaction.
- `renderAnalystPanel()` silently returned when a Scanner transaction/queued request was active; direct Top selection required explicit ownership handoff.
- `graph-native-usd.js` dynamically replaced `atlasFetchComparisonSeriesResilient()` with `cmp()` for USD, so the core controller's declared path and the runtime function differed. The branch moves the USD decision into the canonical controller while retaining native USD histories.
- 40.6.719 acquired a chart or Market network semaphore before waiting in a CoinGecko provider rate-limit queue, which could hold a scarce semaphore during idle waiting.
- Context V7 and requested broker state do not necessarily represent the displayed chart while a comparison is pending or blocked. Their synchronization and terminal message wording remain an outstanding cross-view concern.

## Changes isolated to the work branch
1. `renderComparisonAnalystPanel` uses `try/catch/finally`. Only the currently owning controller cleans its state, clears the key, or writes failure text; an obsolete controller cannot erase its successor.
2. `atlasSelectTopComparison` cancels an active or queued Scanner **after checking the exact basket identities**. It does not cancel Scanner on an invalid Top selection.
3. `atlasFetchComparisonSeriesResilient` explicitly delegates USD acquisition to the USD module's exported `compareUsd`. The module no longer wraps this function globally. EUR retains its existing native-source route and is not converted from USD.
4. `fetchWithTimeout` and `atlasFetchJson` reserve provider capacity before acquiring chart/Market concurrency tokens.
5. Renamed the touched transaction-local variables to stable names without numeric build suffixes.

## Constraints preserved
- Top 5 is exactly BTC/ETH/BNB/XRP/SOL, no stablecoins.
- Hausses 5, Baisses 5, Volumes 5 retain the exact ranked Market basket, no substitution.
- Exactly five real compatible 24-hour histories required before a five-series display; no interpolation.
- Historical currency provenance remains EUR/USD native, not confused with USDT/USDC.
- Market Core 38.15.11, IndexedDB PRIMARY, archived history, Bridge and real-order capabilities are not modified.
- No unnecessary mass rename of historical files.

## Evidence
- [Original deployed Administrator source](https://github.com/BlueAzur-Hub/erith-ia-memory/commit/401fd08d92270fac4b7de6da2b456b8350f4eb82)
- [Feature branch](https://github.com/BlueAzur-Hub/erith-ia-memory/tree/work/chart-architecture-repair)
- [First branch validation suite](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/41196986409)

## Before any next version
- Repeat branch validation after the latest code change.
- Review the actual commits and no-op/abort/timeout cases; check selected vs rendered mode.
- Extend regression tests for native USD vs EUR dispatch and the four five-series selectors.
- Verify the branch does not interact with chart storage or mutate archives.
- Do not claim Firefox acceptance. Only the operator can validate the final deployed version on Windows Firefox.
