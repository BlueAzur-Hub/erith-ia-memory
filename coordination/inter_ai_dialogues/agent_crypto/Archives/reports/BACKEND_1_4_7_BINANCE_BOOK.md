# Backend 1.4.7 — Binance public orderbook

Baseline: Private Backend 1.4.6 R2 + Trader/Administrator 40.6.621.

Changes:
- VERSION 1.4.6 -> 1.4.7.
- Binance source role: candles + orderbook discovery.
- Binance resolver capability: candles, book, ticker.
- New read-only fetcher: GET https://api.binance.com/api/v3/depth?symbol=<PAIR>&limit=<N>.
- /market-book accepts provider=binance.
- Binance REST depth response is normalized to agent_crypto_market_book_v1.
- lastUpdateId is preserved.
- Because Binance REST depth has no exchange event timestamp in this payload, observed_at_utc is the Backend observation time and source_timestamp_mode=backend_observed_at.
- One-character ticker support from 1.4.6 R2 is retained.
- Bridge 1.9.13 unchanged.
- No API key, wallet, order, withdrawal or private exchange endpoint.

Tests:
- python private_backend.py --self-test -> PASS.
- mocked Binance depth fixture -> BINANCE_BOOK_FIXTURE_PASS.
- backend SHA-256: c54d6039d78d3dea5e76be307cdb96fe1ba3fb7d28bf00fbed75580ad0f79cff
- ZIP SHA-256: 63faab7b1bd3d9464c86c9b5b7cd3bdee9e168329983ed935560e6a2a5a533ed

Terrain:
- M / Bitget regression pending.
- XAUT / OKX regression pending.
- Binance-only resolver case pending.

# Install — Private Backend 1.4.7

Do not change Trader/Administrator 40.6.621.
Do not change Bridge 1.9.13.

1. Aether Control -> Arrêter Backend.
2. Close Aether Control.
3. Open %LOCALAPPDATA%\ERITH.IA\AtlasCryptoBridge\2.3.2R19\backend\
4. Back up private_backend.py.
5. Replace only private_backend.py with the file from AGENT_CRYPTO_BACKEND_1_4_7_BINANCE_BOOK.zip.
6. Relaunch Aether Control.
7. Verify Private Backend V1.4.7 and Bridge V1.9.13.
8. Firefox Ctrl+F5.
9. Test M/Bitget, XAUT/OKX, then one Binance-resolved asset.

No UI build change is required.
