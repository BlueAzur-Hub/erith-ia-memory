# Agent-Crypto Administrator — Technical handoff

Build under review: **40.6.707** (30 October 2026). Parent: isolated **40.6.706** candidate.

## Immutable functional contract

- Top 5: **BTC / ETH / BNB / XRP / SOL** in this exact order; zero stablecoins.
- Top 3: **BTC / ETH / BNB**. Gainers / losers / volume scanners and manual selections remain independent.
- Real, full-window 24h histories with native currency provenance. No fabricated series, no mixed EUR / USD and no silently substituted asset.
- Preserve last committed coherent comparison during refresh; one chart transaction only when all five series qualify.
- Do not modify Market Core 38.15.11, Trader, Bridge, live orders or production automatically.

## Audited problems in parent

1. New functions and regression tests carried redundant version numbers in identifiers / filenames: stable code names and stable verification filenames now replace those introduced in 40.6.705/706. Git history carries the actual version.
2. The Top 5 EUR 24h acquisition always started direct Binance network requests before examining recent verified local EUR history. Five assets plus fallback timeouts compounded needless waiting.
3. The 706 bundle tests referred to an existing legacy USD module not included in the patch. Tests now run standalone and optionally verify that existing asset when checked out inside the full repository.

## Candidate changes

- `app.js`: stable `atlasCanonicalPresetSelection` (no suffix), normalized local identifiers of the previous repair; `runSchoolPractice` preserves the existing interactive learning exercise. No unrelated historical runtime identifiers renamed: doing so without full dependency audit risks breaking scripts.
- `app.js`: `atlasVerifiedReferenceHistoryCache` prefers only locally stored, integrity-qualified EUR 24h market histories with a genuine native EUR label and current full-day first/last timestamps. This is **not** a synthetic price shortcut. A cache with insufficient full-day coverage is rejected even when stale fallback is considered. A stale cache can only be exposed in the already existing explicit preserved-fallback state.
- `app.js`: total Binance mirror budget bounded to 12 seconds (not 12 seconds per host), and CoinGecko timeout bounded to 14 seconds for this specific Top 5 EUR 24h fetch, with the original per-provider spacing and 3-worker concurrency unchanged. Failure remains explicit and prevents an incomplete atomic basket.
- `index.html` / `build.json`: consistent 40.6.707 preview build metadata, **not** a published build claim.
- `tools/`: 4 verification scripts with stable, versionless filenames and no "test" in their names. No verification scripts or handoff files added under the Administrator runtime folder.

## Execution and evidence

Node syntax and four focused checks can be executed with `node --check public/agent_crypto_erith_ia/administrator/app.js` and each stable file under `public/agent_crypto_erith_ia/tools/`.
These checks are **local logic / code verifications**. They do not prove live network speed, 5/5 exchange availability, visual stability on Firefox, cross-currency historical synchronization, or live trading behavior. Initial load may remain slower when no current verified history exists or providers time out.

## Upload policy / cleanup

This ZIP is an incremental upload to the existing repository **root**, preserving paths. It is **not** a standalone web app. It contains eight files (runtime 3, tests 4, handoff 1) and NO newly created version-numbered source filename. The ZIP itself may carry a version because it is an offline delivery artifact; the stable handoff inside GitHub does not.

GitHub browser upload does **not** delete obsolete files. If older versioned verification files have already been committed on the chosen target branch, remove them with a separate GitHub deletion or git rm when the stable replacement is validated; do not leave permanent duplicates. Do not delete historical artifacts from the shared coordination archive without checking dependencies; only stop introducing new versioned source filenames.

## Firefox acceptance

After isolated upload: 1) Top 5 24h EUR, then USD; 2) prior V7 session intact; 3) five correct names and five histories (or explicitly missing), no USDT/USDC; 4) cycle, card clicks, Analyse / Math, cartouche; 5) first-load and cache timings; 6) watch whether curves change behind the user's back. No merge/promotion before user approval.

## Naming discipline and legacy dependency boundary

- **Repository source filenames included in this patch have no build numbers and no `test` prefix.** The only numbered filename is the offline distribution ZIP (not uploaded as a repository source file).
- Four verification programs live at `tools/verify_administrator_*.cjs`; all added application functions have stable, descriptive names. `runSchoolTest` and the transient local variable with a build suffix were renamed without altering their behaviour.
- Earlier legacy code still contains historic version-bearing function identifiers and the previously deployed `js/graph-native-usd-406520.js` asset. These are not newly introduced. Their removal needs a separate full-dependency rename-and-delete commit (especially because GitHub browser upload **never deletes existing files**). Deleting them while uploading this incremental patch risks breaking historical runtime bindings.
- Avoid putting the ZIP itself into the GitHub source tree: extract it locally and upload only its inner paths. Commit message: `fix administrator top five history cache and use stable verification names`.
