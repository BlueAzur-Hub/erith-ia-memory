# Administrator 40.6.711 — bounded network and verified USD cache-first

Parent: 40.6.710. Engine Market Core: 38.15.11 unchanged.
Changes: 2 concurrent chart permits plus 1 reserved non-chart permit in the existing network governor; queued HTTP timeout starts after obtaining permit; abort removal maintained. Native USD comparison cache consulted first only when the stored series passes the existing native USD integrity and freshness gates. HTTP still used for expired, absent, or wrong-currency data.
Protected: canonical Top 5 BTC/ETH/BNB/XRP/SOL, full five-series atomic rendering, EUR acquisition, live market sources, Trader, Operator, real trading safety. No fabricated or relabeled EUR/USDT/USDC series.
Verified: node --check and six existing tests plus the new network/cache regression test on the complete GitHub repository before code commit. Browser performance and Top5 EUR/USD are NOT Firefox-verified at commit time.
Deferred UI requirement: AGENT_CRYPTO_UI_ALIGNMENT_REQUIREMENT.md (Math Core lower-left, Redivider lower-right with common baseline; no UI change in this release).
Release path: one code commit, ZIP + SHA-256 in shared folder, explicit GitHub Pages workflow_dispatch publish=true, then independently verify Pages status. Firefox loaded-build and functional verification are separate.

## Firefox evidence after the 40.6.711 release — 2026-10-30

- Firefox now executed build 40.6.711; however Top 5 USD 24h still showed BTC-only retained chart at 09:38 and only later reached 5/5 at 09:42. The interval is ~4 min between observations, not an exact transaction stopwatch. Final 5/5: two direct histories, three fresh caches, 289 points each.
- **Performance goal NOT met.** The new USD cache-first applies to 24h and all nonannual periods, not only 60d; 3 cache hits confirm that the issue is deeper than missing cache-first.
- app.js `renderComparisonAnalystPanel` awaits all workers and emits `latencyMs:null`; no per-coin timings for queue / HTTP / cache / abort / duplicate transactions. Do not claim the delay is fully diagnosed based on network timeout constants alone.
- Next performance work: instrument end-to-end transaction and per-coin queueMs/fetchMs/provenance/retries/abort, test 24h/7d/30d/60d/90d/365d in EUR and USD, then correct the **shared** bottleneck; keep canonical 5/5 and provider-currency integrity. No speculative build 40.6.712.
- Alignment diagnosis: active `administrator/js/operator-dashboard.js` defines both bottom wings at 18px but Math stage/ring are 132/94px vs REDIVIDER 148/108px. Common outer bottom does not align the actual rings. See `AGENT_CRYPTO_UI_ALIGNMENT_REQUIREMENT.md`, updated with source CSS and screenshot acceptance criteria. Not fixed in 40.6.711.
- Evidence and decisions: 30/10 Notion AETHER Agent-Crypto interface topmost toggle « RETOUR TERRAIN 40.6.711 ».
