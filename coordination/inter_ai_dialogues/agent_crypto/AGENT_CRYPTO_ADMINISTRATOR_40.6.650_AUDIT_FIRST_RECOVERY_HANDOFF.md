# AGENT-CRYPTO ADMINISTRATOR 40.6.650 — AUDIT FIRST RECOVERY HANDOFF

Date: 2026-10-29. Scope: test branch only; main remains on 40.6.649.

## Canonical evidence
- Notion audit (published before implementation): https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099
- Branch: test/administrator-406650-regression-recovery-20261029
- Root-cause commit (27 October): https://github.com/BlueAzur-Hub/erith-ia-memory/commit/b4368d6068ba20894c2a44c64ae9ffc12f6ce05e
- Astra audit: first section in the same Notion Bureau.
- Protected: Market Core 38.15.11; Trader; Bridge; Radar; live orders.

## Changes in isolated recovery candidate
1. Restore historical static Top3 BTC ETH BNB and Top5 BTC ETH BNB XRP SOL; replace competing dynamic frame basket owners. Dynamic gainers/losers/volumes remain independent.
2. Keep the title TARGET TOP 5 LIVE and the five symbols visible even when Solo is selected; reveal active mode through existing title and ARIA text.
3. Pair USD price and variation from one dated observation; never borrow the EUR variation.
4. Remove incompatible USD-side override of atlasChartStorageKey; central key is currency-qualified.
5. Reject long discontinuities, invalid chronological records and unqualified >8x adjacent spikes without silently discarding their raw observations.
6. Downsample comparison data using min/max buckets, preserving true extrema.
7. Hovered Solo last historical point remains historical; live spot remains separate.
8. Limit Top3/Top5 fetching to 2 concurrent streams; keep scanners sequential, cancellation, exact basket and integrity gates. Pending label explicitly identifies an old chart while awaiting new five.
9. Preserve 40.6.649 Analyse display, 40.6.647 Base 100, EUR/USD source provenance and 38.15.11 Market Core.

## Qualification / limits
- Regression suite uses synthetic data, real source functions extracted from code, JS syntax checks; no vendor API call, no claim of five real charts or live Firefox validation.
- Missing-point preservation in source data and OHLC/volume truth require additional end-to-end evidence. Broader frontend and Trader regression suites must be reconciled before any production merge.
- This candidate is NOT the published Administrator and must not become main without explicit operator approval and Firefox tests.
- Test first EUR (Solo / Top3 / Top5 / gainers / losers / volume), then USD, empty/fresh/stale cache, rapid currency switches, slow provider, native OHLC, tooltip.
- A missing historical series must fail closed; no substitute asset or fabricated point.

## Required next evidence
Record targeted CI run, any failures, and a frozen preview link. Keep source SHA and ZIP SHA-256 if archive is generated, and record that zipped files were not browser-tested.
