# Administrator 40.6.706 — Canonical Top 5 restoration

Status: isolated candidate, no deployment and no merge into `main`. Firefox validation pending.

## Operator requirement
Top 5 = BTC / ETH / BNB / XRP / SOL, in that order. Stablecoins (USDT/USDC/DAI) are forbidden in this preset. Top 3 = BTC / ETH / BNB. Manual selections and gainers/losers/volume scanners remain separate.

## Verified code changes
- The canonical Top 5 is now enforced in the comparison getter and setter, preventing saved USDT or selectedCoinId from displacing SOL.
- Workspace-memory restoration explicitly replaces stale historical Top 5 profiles with the canonical basket, rather than repeating them after a browser reload.
- Top 5 order is protected even if the saved primary selection was USDT.
- The `TARGET TOP 5 LIVE` cycle retains the last displayed preset while a new chart is still loading. Existing cycle and individual-coin interactions are preserved.
- Contradictory market-cap ranking comment removed; unchanged gainers/losers/volume logic.
- UI identity updated to 40.6.706, with 40.6.705 as the parent, no production flag.

## Local checks
- `node --check administrator/app.js`.
- `node tools/test_administrator_top5_restore_406706.cjs` — mocked state executes the actual selection functions and checks the restored basket, old USDT memory, manual/scanner behavior, and stable labels.
- `node tools/test_administrator_canonical_top5_integrity_406650.cjs` — existing regression tests revalidated for build 40.6.706.
- `node tools/test_administrator_scanner_window_integrity_406705.cjs` — run against the current scanner-test file from the prior 40.6.705 patch.

## Required Firefox validation
EUR first, then USD: fresh Top 5 click; reload an older saved profile containing USDT; compare all five curves and legends; click each coin to remove/add lines; exercise Target Top 5 Live cycle; verify Hausses/Baisses/Volumes remain dynamic; check source timestamps, actual 24h windows, browser loading duration and no false 5/5. Test saved workspace A/B/C separately. None of these browser behaviors are certified by Node tests.

## Delivery and rollback
This ZIP is an incremental 6-file patch intended for the existing complete Administrator deployment; it is not a standalone application. Copy prior files to a backup before replacing. The prior `.705` app, index and build can be restored without touching `main`. Do not merge the branch until Firefox acceptance.
