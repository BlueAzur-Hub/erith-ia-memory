# Administrator 40.6.717 — Scanner ownership and stable naming

Source: main 40.6.716; all four base Git blobs verified before changing anything.

## Root cause
graph-native-usd-406520.js installed a global wrapper of atlasScannerFetchDirect. For USD, canonicalTop5History returned false, so the wrapper called a duplicate CoinGecko-only scan(), bypassing the Coinbase native USD fallback in app.js.

## Code correction
- The stable module is now js/graph-native-usd.js, with stable runtime API AgentCryptoGraphNativeUsd and Symbol.for agentCrypto.graphNativeUsd.
- Remove duplicate scan() and the global override of atlasScannerFetchDirect. Keep other USD presentation and quote-identity protections unchanged.
- Update exactly three app.js references plus the HTML entry, build metadata and original module filename.
- No Market Core, EUR history, Bridge, Vault, risk rules or real order changes.
- The original versioned module path is removed from the source tree; historical commits retain rollback.

## Evidence and limitation
The isolated runtime check confirms that installing the USD module never replaces the canonical scanner function in app.js. Node syntax and source SHA gates also pass.
This fixes an actual ownership conflict but is NOT a claim that CAP/OP/GLM or any future five market gainers have 24h genuine coverage.
Firefox first-click Hausses 5 5/5 remains PENDING the operator's test. No fabricated data, no substitutions, no automatic reset.

The ZIP is incremental: app.js, index.html, build.json and the stable graph-native-usd.js; this handoff and SHA-256 are archived next to it in coordination.
