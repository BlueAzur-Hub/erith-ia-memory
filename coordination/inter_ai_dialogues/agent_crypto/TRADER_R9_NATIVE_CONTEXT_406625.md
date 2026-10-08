# Agent-Crypto · Trader 40.6.625 — R9 / native chart context
Date: 2026-10-08
Base: Trader 40.6.624 / Administrator 40.6.624 / Market Core 38.15.11

Deploy these three Trader files under public/agent_crypto_erith_ia/trader/.
Administrator index.html on GitHub main also received a strictly targeted editorial update in OKB case-study section 6; it is deliberately not duplicated in this compact package.

- Binance R9 verified OHLCV remains unchanged and distinct from live OKX.
- If selected asset is not archived (for example OKB), a separate read-only table reflects up to 12 existing CoinGecko USD chart points from the native runtime, explicitly marked NON LIVE / NON R9. The chart's period and timestamp are shown independently of R9 period.
- No extra HTTP call, cache, storage, API key, bridge, backend, order or additional chart engine.
- R9 errors now retain an explicit reason and can show the already-existing native chart evidence when qualified.
- Legacy OKB case-study diagnostic was replaced with the validated 08/10/2026 Firefox finding.
Tests: simulated R9 absence + native USD data, stale asset exclusion, mismatched archive rejection; JS syntax.
Firefox operator acceptance still required for BTC R9 and OKB native display.
