# Seven Heaven — OKX BTC/USDC hourly event-study collector

**Scope:** two UTC trading days, 2026-11-05 and 2026-11-08. **State:** code and offline tests. A successful GitHub Actions run and the existence of `evidence/index.json` are required before claiming real OKX data were captured.

## Purpose

Complement the existing [Bitcoin, ETF and liquidation research report](../SEVEN_HEAVEN_AGENT_CRYPTO_BTC_ETF_LIQUIDATIONS_EMA_VOLUME_EVIDENCE_DOSSIER_2026_11_10.md) and [read-only prototype](../btc-market-news-analysis-prototype/). The actual source is public OKX Spot (`BTC-USDC`), not the user's private account or the Trader chart state. Nothing is added to the Trader or to the Interface's news UI. No authenticated API routes or trading orders exist in this collector.

## API and retrieval rules

- API: `GET /api/v5/market/history-candles`, tried against `https://eea.okx.com` then `https://www.okx.com` if the first source fails validation.
- Parameters: `instId=BTC-USDC`, `bar=1H`, `after=<next UTC midnight in milliseconds>`, `limit=100`. **OKX's `after` means older than the supplied time**; the returned order is descending. No data from another venue or quote are substituted.
- Only 24 fully closed hours (`confirm=1`) are accepted per day, from `00:00:00Z` to `23:00:00Z`; 48 in total. Reject missing hours, duplicated timestamps, inconsistent OHLC, invalid volume and API errors. The validator does not interpolate or manufacture candles.
- Preserve prices and volumes as original decimal strings: `vol` in base BTC, `volCcyQuote` in quote USDC, and original `volCcy` separately. Do not confuse a red Spot candle with derivatives liquidations or net selling.
- Preserve HTTP response SHA-256, exact request URL, retrieval time, source host, normalized rows and JSON-file SHA-256 in `evidence/index.json`. The API response is **not exchange-signed** and the result is not a trade-by-trade or ETF causal audit.

## Run and tests

```bash
python -m unittest discover -s public/agent_crypto_erith_ia/laboratoire/okx-hourly-collector -p 'test_*.py' -v
python public/agent_crypto_erith_ia/laboratoire/okx-hourly-collector/collect_okx_btc_hourly.py \
  --output public/agent_crypto_erith_ia/laboratoire/okx-hourly-collector/evidence
```

The integration runs as the independent GitHub Actions workflow `.github/workflows/agent-crypto-seven-btc-okx-hourly-evidence.yml`, on the initial collector/workflow commit or on manual dispatch. It runs deterministic tests **before** touching public sources. If data validation fails, the job fails and **no day is published**. On success it uploads a workflow artifact and commits only the `evidence/` directory to `main`. The workflow is **not scheduled** because this two-day historical study is fixed. It never writes outside its dedicated evidence directory.

### Publication status and proof

- Offline tests: 14 regression tests, including a simulated successful 48-hour dataset. These fixtures are **synthetic and NEVER published as market data**.
- API access from the local execution environment used to build this collector: **unavailable** (DNS); GitHub Actions will be the actual source-access attempt.
- A workflow definition is **not** proof of a successful run; inspect `Actions → Seven Heaven BTC OKX Hourly Evidence`, its conclusion and the committed `evidence/index.json` before declaring capture complete.
- The two-day capture cannot independently verify individual forced derivative liquidations or the magnitude of ETF flows. It provides Spot OHLCV to compare against independently sourced event timestamps.

## No orders and no private information

`orders_enabled=false`, no API keys, no Bridge requests, no wallet/account exports, no synthetic market values in the published `evidence/` directory.

## Next analytical step after actual 48-hour capture

Use the existing [seven-btc-news analysis prototype](../btc-market-news-analysis-prototype/) as an offline reader, harmonize event timestamps to UTC and compare the 5 and 8 November cases. Mark unsupported causes, out-of-period articles and any missing liquidation coverage as **not demonstrated**.
