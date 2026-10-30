# Administrator 40.6.710 — verified code deployment, Firefox validation pending

Parent: 40.6.709. Engine: Market Core 38.15.11, unchanged.
Scope: correct the saved Solo label using certified native EUR/USD currency; retry annual USD CoinGecko on transient failures only, not HTTP 403 or integrity rejection; require an explicit USD change24hUsd for native USD snapshot. EUR acquisition and other comparison modes unchanged.
Tests: node --check plus six verification scripts, all PASS on the exact code before publication. Git SHA guards compare all six modified source files with the archived and tested 40.6.710 candidate. No fabricated market data.
Browser status: Top5 USD annual 365d not certified in Firefox; actual five native USD series must still be checked by the user. 24h EUR/USD 5/5 is observed in supplied screenshots. Compact BTC display vs spot discrepancy remains open and intentionally unchanged.
Release method: commit main after verifiers; ZIP with ten files and companion SHA-256 created in this shared directory. The archive does not install on a local Windows machine. Final Firefox validation belongs to the user.
