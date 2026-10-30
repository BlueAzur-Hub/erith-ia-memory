# Administrator 40.6.711 — bounded network and verified USD cache-first

Parent: 40.6.710. Engine Market Core: 38.15.11 unchanged.
Changes: 2 concurrent chart permits plus 1 reserved non-chart permit in the existing network governor; queued HTTP timeout starts after obtaining permit; abort removal maintained. Native USD comparison cache consulted first only when the stored series passes the existing native USD integrity and freshness gates. HTTP still used for expired, absent, or wrong-currency data.
Protected: canonical Top 5 BTC/ETH/BNB/XRP/SOL, full five-series atomic rendering, EUR acquisition, live market sources, Trader, Operator, real trading safety. No fabricated or relabeled EUR/USDT/USDC series.
Verified: node --check and six existing tests plus the new network/cache regression test on the complete GitHub repository before code commit. Browser performance and Top5 EUR/USD are NOT Firefox-verified at commit time.
Deferred UI requirement: AGENT_CRYPTO_UI_ALIGNMENT_REQUIREMENT.md (Math Core lower-left, Redivider lower-right with common baseline; no UI change in this release).
Release path: one code commit, ZIP + SHA-256 in shared folder, explicit GitHub Pages workflow_dispatch publish=true, then independently verify Pages status. Firefox loaded-build and functional verification are separate.
