# Agent-Crypto Administrator 40.6.714 — EUR/USD 24h chart provenance

31 October 2026 — Source review and candidate delivery. Base: deployed Administrator 40.6.713 (app.js Git blob e948a206a96c8f8b7b8d2ea45f2f2ebd798dd69f); Market Core 38.15.11 unchanged.

## Observed evidence
Firefox captures show Top 5 BTC/ETH/BNB/XRP/SOL, 5/5 history sets for gainers BEAM/OP/HASH/ZRO/ONDO, losers AKE/BTW/Q/TRX/M and volumes BTC/XAUT/USDT/ETH/USDC. 5/5 direct or fresh describes **acquisition**, not independently proved market-price accuracy. A "3/5 compatible" transient state retains a prior 5/5 chart while waiting for an atomic commit. Market 24h prices and changes come from the public CoinGecko snapshot, with explicit changeQuoteCurrency=USD; EUR chart points are independently acquired historical values and use their own timestamps.

## 40.6.714 source delta
- Keep existing 5-series atomic scanner, history fetch, price normalization and all cached OHLCV unchanged.
- Add atlasGraphSpotComparisonTruth: compare chart to spot only for exact coin ID, CoinGecko provider, explicitly EUR or USD quote and timestamps within 20 minutes. Return PRIX_PROCHES / ECART_A_VERIFIER / NON_COMPARABLE with a reason. Never convert USDT to USD or silently present unavailable pairs as comparable.
- Preserve the existing 2.5% historical/spot gap warning threshold. A >2.5% gap remains a warning and does not delete a valid 24h series.
- Expose chart-source, quote, clock and comparison status in existing technical/detail rows, **not** a new overlay obstructing graphs.
- Local read-only API: AgentCryptoGraphProvenance406714.snapshot() (no market request or data owner; data from current runtime only).
- Existing Market change24h quote is displayed as declared or NON QUALIFIÉE, clearly distinct from normalized historical Base100 change.

## Verification
- GitHub candidate patch action #41156657412 SUCCESS; syntax check, 6 scanner authentication/atomic checks, 16+ financial-source/provenance assertions, future/missing timestamp and 24h gaps.
- GitHub dedicated CI: verify_administrator_graph_provenance_714.cjs and existing Bridge/scanner/network regression checks. The 40.6.713 original source was hash-checked before patching.
- Preserve inherited build flags: the old build had new_storage_owner=true. This is historical metadata, not evidence that the 40.6.714 delta added a storage owner; the new patch-specific fields explicitly report false.
- No WinError 10053 claim or Windows Bridge edit; no OKX order authorization.

## Remaining acceptance
After main delivery and GitHub Pages success, validate in **real Firefox**: Top5 24h USD then EUR; Hausses5, Baisses5, Volumes5; inspect technical details for five original symbols, declared quote and audit statuses. Verify latency and no unintended reload on cached charts. Distinguish mouse-hover historical price from latest Market spot. Do not call the graphs independently market-certified until individual source/price/time evidence passes.

Archive is produced by the updated Administrator packaging workflow, with SHA-256 for every member and the ZIP itself. The historical 40.6.713 archive remains untouched.

Project Notion: https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099
