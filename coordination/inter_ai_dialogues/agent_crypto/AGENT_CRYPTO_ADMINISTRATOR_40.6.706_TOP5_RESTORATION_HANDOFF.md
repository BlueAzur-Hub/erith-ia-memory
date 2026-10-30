# Agent-Crypto Administrator 40.6.706 — Top 5 Recovery Handoff

Date: 2026-10-30. Branch: `test/administrator-40.6.706-top5-restoration`. Parent: `test/administrator-40.6.705-recovery` with scanner hotfix, app.js blob `1d8cb41b1128f3463523c003429fe3862c7d3fa1`.

## Fixed contract
Top 5 / Target Top 5 = **BTC ETH BNB XRP SOL**, exactly, no stablecoins. Top 3 = BTC ETH BNB. Manual selections and dynamic gainers/losers/volume retain their own identities.

## Changes
The `atlasCanonicalPresetSelection406706` helper locks named preset identities. It is used by operator profile normalization, V7 IndexedDB context restore, active comparison IDs and preset selection. Missing SOL remains missing; it never becomes USDT. The renderer rejects an incomplete canonical basket or incorrectly ordered series. It defers the atomic-basket title until commit and attempts to restore the prior chart broker result on failure.

Inherited 40.6.705 scanner 24-hour proof guard is retained. No changes to Market Core, Trader, Bridge, orders or production main.

## Evidence and limitations
Local Node checks: syntax PASS, canonical Top 3/Top 5 regression PASS, scanner clock test PASS, profile/V7/active-selection/isolated scanner test PASS. These are static and semantic checks using actual extracted functions; NOT Firefox live certification. Browser, EUR/USD, five historical source integrity, latency and interactions must still be inspected by the operator.

Archive delivered in session: `AGENT_CRYPTO_ADMINISTRATOR_40.6.706_TOP5_CANONICAL_RESTORATION_7_FILES.zip` (incremental). SHA-256 `4e10111f4c03adf99a72ab89b0f77b9cb7fb7f35ce0e151420eaf9b129c661a0`. Archive not yet published to GitHub. Main remains unchanged.

## Acceptance
Firefox with previous IndexedDB state retained: verify exact five identities in graph, legend, price cards, ribbon and detail; 24h EUR then USD; Solo > Top5 > Gainers > Losers > Volume > Top3 > Top5; manual interactions and Target cycle; absence must be explicit, no fake 5/5. Measure first fetch versus cache reuse. Visual regression check Analyse/Math Core/OHLC. Do not merge before manual validation.

## Rollback
Revert this isolated branch to the 40.6.705 parent. Do not delete local user storage.
