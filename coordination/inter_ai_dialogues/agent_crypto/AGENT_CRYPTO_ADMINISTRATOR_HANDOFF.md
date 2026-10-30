# Administrator — annual USD Top 5 recovery

**Candidate build:** 40.6.709 (not published; not Firefox-validated)
**Parent:** public `main`, Administrator 40.6.708, Git commit `bdace49faa156cf3f50008dfef785edecf8c6d7d`.
**Market Core:** 38.15.11 — unchanged.

## Observed incident

The annual Top 5 BTC / ETH / BNB / XRP / SOL can display five verified native EUR histories with approximately 740 points per series, but the transition to annual USD can fail and correctly retain the previous EUR graph rather than relabeling EUR values. Browser screenshots do not disclose whether each CoinGecko USD request failed due to HTTP status, network timeout, currency validation, or series alignment. The candidate therefore does **not** claim to have proved the production root cause.

## Scoped change

The existing `renderComparisonAnalystPanel()` now invokes `atlasFetchCanonicalAnnualUsdHistory()` **only** for `rank-5`, `365` days and native `USD` selection.

1. Read the existing, independently verified `CoinGecko` USD history cache first, keyed by exact coin, 365-day window, provider, and native quote. A fresh verified result needs no new request.
2. For a missing or outdated USD series, call the existing `AgentCryptoGraphNativeUsd406520.fetchCoinGeckoUsd()` acquisition owner — actual `vs_currency=usd` CoinGecko API, never a converted EUR or USDT value. Requests are serialized, individually spaced and aborted on context switch.
3. Retry one time *only* on retryable network/rate conditions such as HTTP 429, 5xx and timeouts; no blind retry of client/API permission failures.
4. If network still fails, permit only a verified same-coin USD 365-day cache whose true last sample is no more than 24 hours old and whose native series covers the required annual horizon; explicitly mark it `browser-cache` and explain the delay. Anything missing, ambiguous or old stays blocked.
5. Maintain atomic five-of-five display with existing `atlasComparisonCertifiedCurrency()` and aligned time window checks. When blocked, keep the prior EUR graph and add concise **per-asset** failure/coverage causes in the existing caption; no new panel.
6. Other periods, all EUR acquisitions, scanner baskets, Trader/Operator, Math Core, Market Core, visuals and graph overlays are not changed.

## Proof locally obtained

- Source `app.js` from .708 matches Git blob `8999ad2b7c9dde20d8be801659085e3cc0d6527e`.
- `node --check` passes on revised `app.js`.
- Six verification scripts pass, including a VM executing actual annual USD functions with mocks for fresh USD cache, wrongly tagged EUR/USDT cache, HTTP 429 then success, delayed valid USD cache, expired cache, nonretryable HTTP 401 and full canonical basket invariants.
- ZIP integrity and content manifest checked; SHA-256 supplied separately at delivery.

**Not established:** five successful live CoinGecko annual responses under the user's browser, real provider rate-limit response, real measured duration, or Firefox end-to-end. They require user terrain verification after deployment. Do not mark production PASS based on mocked providers.

## Deployment and stop condition

Upload ZIP inner paths without renaming; commit suggestion: `fix administrator annual top five native usd acquisition and diagnostics`. Prefer an isolated branch/preview; do not mutate Market Core or deploy a different source graph. In Firefox, select Top 5 annual EUR, click USD once, and observe either five *native USD* series with proven origins, or the unchanged EUR graph with exact asset-level reason. If no USD series load, capture the concise reason for the next provider-specific fix. Also check 24h Top 5 and Solo 1 year in both currencies, including EUR return, to avoid regressions.

Do not remove the previous archived handoffs: history remains authoritative.
