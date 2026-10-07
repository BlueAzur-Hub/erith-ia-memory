# Aether Control 2.3.2R21 — Clean Recovery

Baseline:
- Trader / Administrator 40.6.621
- Bridge 1.9.13
- Private Backend 1.4.6 Market Instrument Resolver R2
- Market Core 38.15.11

R20 correctly embedded Backend 1.4.6, but terrain exposed an older Backend 1.4.7 still listening on 127.0.0.1:8790. R20 refused to retire it and also displayed it as active/ready even though it was incompatible.

R21 fixes only that ownership/recovery boundary.

Rules:
1. If 8790 already serves compatible Backend 1.4.6, adopt it.
2. If 8790 serves Backend 1.4.7 AND the owning command line is one of our AtlasCryptoBridge/private_backend.py processes, retire that quarantined process and start bundled Backend 1.4.6 R2.
3. Any unknown listener is never killed automatically.
4. Any wrong Backend version is displayed INCOMPATIBLE, never active/ready.
5. Bridge 1.9.13 protocol remains unchanged.
6. Trader remains 40.6.621.
7. No order / wallet / write capability added.

Validation:
- Windows amd64 GUI compile: PASS.
- Embedded Backend VERSION=1.4.6.
- Backend 1.4.6 --self-test: PASS.
- Embedded Bridge 1.9.13 markers: PASS.
- ZIP SHA-256: f18292040c40a0cce75bdf33318682461f9d8146b8e02818ffd349c93beed932

Terrain Windows: PENDING Christophe.
