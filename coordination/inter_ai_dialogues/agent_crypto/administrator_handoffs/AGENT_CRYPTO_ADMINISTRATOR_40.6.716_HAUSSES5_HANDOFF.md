# Administrator 40.6.716 — Hausses 5
Date: 2026-10-31
Source: main 40.6.715, verified original Git blob hashes.

## Actual changes
- Reuse common canonical USD history cache in the Hausses 5 scanner.
- On CoinGecko failure, native USD Coinbase Spot 5-minute candles for exact optimism/OP, stacks/STX, golem/GLM IDs, checking product currency/status, instrument identity and 24 h coverage.
- No asset substitution, no EUR/USDT/USDC relabeling and no interpolated history.
- Market Core 38.15.11, Bridge, historical vault and paper trading unchanged.

## Known limitations
Coinbase fallback is limited to three verified assets; Hausses 5 may still fail for a different set of gainers or if sources are unreachable. No guarantee of functional 5/5. Tests on the owner's Firefox are NOT done.

## Version gates
Source commit and one canonical incremental ZIP/checksum are in GitHub. GitHub Pages deploy is separate; Firefox load and Hausses 5 5/5 must be verified separately. Do not confuse candidate unit tests with functional acceptance.
