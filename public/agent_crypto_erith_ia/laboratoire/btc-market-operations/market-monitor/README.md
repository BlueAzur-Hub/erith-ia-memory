# Seven Heaven — BTC market operations (public evidence, read-only)

**Purpose:** operational and reproducible BTC market observation, not a trading bot. This is the production archival **pipeline** for the public prototype; it does not imply continuous exchange-feed coverage. Administrator retains news. Trader retains candles and PAPER. This pipeline makes no changes to either interface or to R31/OKX private credentials.

## What automatically runs

Workflow: `.github/workflows/agent-crypto-seven-btc-market-operations.yml` (UTC hourly, minute 23, and manual dispatch). It does the following atomically after validation:

1. Validates 20 offline safety/regression tests and Python syntax.
2. Queries **public OKX Spot `BTC-USDC` `1H`** historical candles; archives up to the last 72 *closed* UTC hours (strict instrument, OHLC, UTC alignment, no duplicates/gaps inside the fetched interval). All responses are official public endpoints, but not exchange-signed transaction receipts.
3. Preserves each UTC hour as an **immutable public observation** in `spot-hourly/YYYY-MM-DD.jsonl` and writes `spot-hourly/status.json` with source SHA-256 and freshness. An exchange revision of an archived hour fails closed, requiring review rather than rewriting silent history.
4. Reads the **existing** liquidation witness `../liquidation-monitor/observations/YYYY-MM-DD.jsonl` and `run-ledger/YYYY-MM-DD.jsonl` and **existing** Administrator news owner `../../data/news/latest.json`; it does not start a second liquidation websocket or duplicate the news collector.
5. Builds `reports/latest.json`, `reports/latest.md`, and one UTC-hour historical snapshot under `reports/history/`. A report clearly states whether current Spot and connection evidence are fresh.
6. Publishes only the isolated `btc-market-operations/` subtree to public GitHub. All fields are public and contain **no account, API key, Bridge access, wallet, order, portfolio or private positions**.

## Status contract

`OPERATIONAL_PARTIAL_COVERAGE` means the latest completed Spot hour is fresh **and** the run ledger provides recent connectivity evidence. It never means 24/7 derivatives coverage. Otherwise status is `DEGRADED_OR_UNVERIFIED`.

Liquidation messages are reported **by venue**, never as a global total. Zero messages means only zero *observed*, not zero liquidations. OKX derivatives sizes remain in **contracts** when no independently verified multiplier is present. Binance may sample the force-order stream and OKX publishes partial data. Bybit describes a broad instrument stream but outages/restarts/sampling of this collector still create gaps.

Spot BTC-USDC is quoted **USDC**, while derivatives observations can carry USDT (not Spot) or contract size units. There is **no implicit unit conversion** and **no attribution of individual candles to news**.

The report only aligns **UTC event timestamps** when within a closed Spot hour. It does not prove temporal causation and it does not equate article publication time with an event's actual start.

### Availability and gaps

- The websocket witness currently runs about **six minutes twice per hour**. The rest of the clock time is unobserved. `run-ledger` records these observations and outages. GitHub Actions schedules are not guaranteed: jobs can be delayed or dropped.
- The hourly Spot collector can recover recent closed hours from the public OKX API even after missed scheduled runs; it **does not** imply unlimited historical exchange backfill.
- A truly **continuous (24/7)** liquidation recorder requires an always-on runtime (e.g. an approved self-hosted machine or a hosted service with persistent storage, restart/watchdog, retention, and permissions). Until such a service is deployed and verified, never label derivatives data continuous.
- The existing static 5/8 November evidence and the current news system remain the historical proof. The new monitor is for rolling observations starting upon deployment.

## Reproduce locally (without exposing private data)

```bash
python -m unittest discover -s public/agent_crypto_erith_ia/laboratoire/btc-market-operations/market-monitor -p 'test_*.py' -v
python public/agent_crypto_erith_ia/laboratoire/btc-market-operations/market-monitor/collect_btc_spot_hourly.py --fixture
# The following commands require public network and repository data:
python public/agent_crypto_erith_ia/laboratoire/btc-market-operations/market-monitor/collect_btc_spot_hourly.py
python public/agent_crypto_erith_ia/laboratoire/btc-market-operations/market-monitor/build_btc_public_observation_report.py
```

No user action or new credentials are required for the GitHub-hosted scheduled **sampled** pipeline. Full 24/7 feed collection remains a separate infrastructure decision, not a missing menu in the Trader.

## Acceptance criteria and limits

- All tests green and workflow green after publication.
- Spot source `OKX SPOT BTC-USDC 1H`, no fallback other venue/quote.
- Archive immutable with no open candle, no fabricated missing hours, no silent revisions.
- Observations preserve source timestamps, coverage windows and explicit blind spots.
- Reports preserve unverified/insufficient statuses and never infer financial advice.
- News remains in Administrator, graphs remain in Trader, Bridge is untouched.
