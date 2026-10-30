# Agent-Crypto — Administrator delivery handoff

**Candidate:** Administrator 40.6.708 (30 October 2026).  **Parent:** 40.6.707, published by the operator at `902daaa02393e56575769e17aac324f95047f32a` on `main`.

**Status:** Local deliverable. JavaScript syntax and Node verification passed. No Firefox, network provider, EUR/USD rendering or new deployment confirmation. No GitHub mutation by this delivery.

## Evidence and cause

- Firefox screenshots of 40.6.707: five correct Top 5 assets BTC / ETH / BNB / XRP / SOL, no stablecoin. On switch to USD, the operator button changes immediately while the chart displays retained historical EUR prices and labels; the banner says `HISTORIQUE CONSERVÉ` / `mise à jour 24h en cours`. This is **not evidence** that the EUR values were actually converted into USD; it proves incomplete disclosure of the pending transition.
- In `administrator/js/quote-currency-architecture-406497.js`, the display selection updates immediately. `administrator/js/graph-native-usd-406520.js` starts a separate USD historical fetch. `administrator/app.js` deliberately retains the previous chart until it can replace the full basket. The selection and rendered history therefore can temporarily differ.
- `app.js` also hardcoded the source phrase `historiques EUR · Base 100` in both comparison commit and workspace restore. This remained incorrect for native USD series. The EUR label in the actual tooltip was correctly reflecting the EUR source, rather than proving that the USD network acquisition succeeded.
- The earlier 40.6.707 change targeted EUR history acquisition/cache; it did not modify the USD module. A claim that it introduced the entire USD defect is not established.

## Exact changes (no new overlay module)

- `administrator/app.js`: source metadata now derives currency from **all native historical series**; unknown or mixed source is disclosed, never silently asserted as EUR.
- The operator's requested EUR/USD is captured for each comparison request, separately from the quote that owns the already-rendered canvas. Async results for an old currency cannot commit after a switch.
- All new comparison results must carry independently verified native currency matching the requested currency, before any canonical 5/5 atomic draw; incompatible or unknown native quotes are refused. Mixed/unknown quotes cannot satisfy the full-basket commitment.
- When native EUR remains visible after an USD click (or vice versa), the existing refresh banner explicitly says the historic **old currency remains on screen while requested currency loads**. On failure the old chart is not relabelled or fabricated; the failure and retained source are shown. Tooltip title also labels the mismatch explicitly; each numeric historical price retains its actual native currency.
- V7/workspace cached comparison restore rejects source series whose native quote disagrees with the requested display currency, preventing cross-currency restoration. Scanner and manual selection identity rules unchanged.
- The scanner's Base 100 explanatory phrase derives its currency from the verified plotted sources rather than assuming EUR.
- No change in `graph-native-usd-406520.js`, quote architecture module, Market Core 38.15.11, Trader, Bridge, wallet/order controls, asset identity or cache acquisition timeouts.

## Verification

Run from repository root after upload:

```sh
node --check public/agent_crypto_erith_ia/administrator/app.js
node public/agent_crypto_erith_ia/tools/verify_administrator_currency_integrity.cjs
node public/agent_crypto_erith_ia/tools/verify_administrator_canonical_top5_integrity.cjs
node public/agent_crypto_erith_ia/tools/verify_administrator_history_cache.cjs
node public/agent_crypto_erith_ia/tools/verify_administrator_scanner_window_integrity.cjs
node public/agent_crypto_erith_ia/tools/verify_administrator_top5_restore.cjs
```

The new currency verifier executes the actual tooltip and provenance helpers with isolated native EUR/USD fixtures, including USD requested while EUR stays on canvas and the reverse, and checks the strict source and cache gates. These are synthetic verification cases; real network timing cannot be certified from them.

## Field acceptance (not yet completed)

1. In Firefox, select Top 5 on 24 h, then EUR. Confirm canonical five historical EUR series, matching title, tooltips, cache/native sources and coherent timestamps.
2. Select USD. If EUR canvas remains during acquisition, confirm explicit `USD demandé · historique EUR conservé`. After completion, confirm 5/5 USD quotes, native USD historical prices, title and samples; never the old euro figures with dollar symbols.
3. Select EUR again and verify the reverse disclosure, cached restore and no mixed snapshots. Simulate unavailable USD if practical: previous EUR remains honest, USD marked unavailable.
4. Confirm Target Top 5 live, cards add/remove, Top 3, Hausses/Baisses/Volumes 5, Analyse, Bougies, Lecture Technique and source/candle provenance. Measure first-load/cache timing without erasing the existing V7 profile.

**Commit suggestion:** `fix administrator historical currency transitions and provenance`

**Stable internal paths:** No new version numbers or `test` tokens in added filenames or function names. The ZIP container alone has a delivery build number. Legacy versioned owner filenames remain untouched; renaming them without following all dependent references would introduce an unrelated regression. Old source files are not deleted by an upload; cleanup requires a separate proven action.

**Safety:** Upload only the listed internal paths after extraction. No archive binary in the active source directory. Revert by restoring `app.js`, `index.html`, and `build.json` from commit `902daaa` if field verification fails.
