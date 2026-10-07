# Backend 1.4.7 R2 — Binance Book + Windows restart hardening

Terrain failure of the first 1.4.7 package:
- self-test PASS;
- server process exited before /health became ready on Windows / Aether Control;
- repeated start attempts failed.

R2 keeps the Binance public orderbook extension and hardens only server startup:
- ReusableThreadingHTTPServer.allow_reuse_address = True;
- daemon_threads = True;
- explicit BACKEND BIND FAILED log on bind error;
- Binance self-test corrected: book capability is required.

No Trader/Administrator code change.
Trader / Administrator remains 40.6.621.
Bridge remains 1.9.13.
Market Core remains 38.15.11.

Local tests:
- SELF-TEST PASS.
- rapid start -> /health PASS.
- immediate stop/restart -> /health PASS.

Backend SHA-256:
ecfdb12c9ea332b92120526d996476b57e429d4725ad03a04547ac7a01a9bf93

ZIP SHA-256:
3ce45aa9e8ca496bd814767e599251fa617905f627d31c439da4de7e080f0ba1

Terrain Firefox / Windows: PENDING Christophe.
