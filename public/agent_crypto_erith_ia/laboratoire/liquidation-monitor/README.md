# Seven Heaven — BTC liquidation witness (public sources, forward collection)

**Status:** observational pilot; NOT a complete liquidation tape, not an account service, not a trading signal. No private data, orders, Bridge calls, browser, news UI or Trader modifications.

## Why this collector exists

The historical study of 5 and 8 November 2026 could only cross OKX spot candles against retrospective third-party liquidation reports. Source articles available to the Interface did not document the 8 November 21:00 UTC liquidation cascade directly. To let future Seven instances reproduce the analysis, this module records **timestamped public derivative liquidation observations from now on** and explicitly discloses holes in reception.

## Public sources and differences

- **Bybit** `allLiquidation.BTCUSDT` (linear BTCUSDT), reported as every liquidation by Bybit; `S=Buy` means liquidated **long**, `S=Sell` means liquidated **short**. `p` is **bankruptcy price**, not the matched Spot price. `v × p` is illustrative USDT notional at the reported bankruptcy price, NOT a certified execution total.
- **Binance** USD-M `btcusdt@forceOrder` (2026 `/market/ws/` route), exchange sends at most one liquidation snapshot **per symbol per second**. `S=SELL` closes a long. Only `FILLED` events with positive `z` and `ap` are recorded, to avoid valuing unfilled original order sizes. `z × ap` is indicative USDT executed notional on that **derivative**, not OKX Spot.
- **OKX** public WS `liquidation-orders`, `SWAP`, retain BTC-USDT-SWAP and BTC-USDC-SWAP. Feed is **incomplete and sometimes delayed**. `sz` is in **contracts**; no USDT notional is computed until a verified contract multiplier and settlement convention are supplied.

All observed events carry BOTH provider event time and local reception time (UTC). Individual records include venue, contract, liquidated side, price type and coverage caveat; deduplication uses a deterministic SHA-256 event fingerprint. No usernames, balances, wallet identifiers, account tokens or personal positions are retained.

## Running

Use Python 3.12 and `websockets==15.0.1`.

```bash
python -m pip install 'websockets==15.0.1'
python public/agent_crypto_erith_ia/laboratoire/liquidation-monitor/collect_btc_liquidation_witness.py --fixture --duration 2
python -m unittest discover -s public/agent_crypto_erith_ia/laboratoire/liquidation-monitor -p 'test_*.py' -v
python public/agent_crypto_erith_ia/laboratoire/liquidation-monitor/collect_btc_liquidation_witness.py --duration 360
```

GitHub Actions workflow: `.github/workflows/agent-crypto-seven-btc-public-liquidation-witness.yml`; scheduled at 17 and 47 UTC minutes of every hour, with an **up to 6 minute observation window** per run. This is nominally up to **20% coverage of wall-clock time**, *not continuous*. Scheduling delays, websocket failures and provider-side sampling lower that coverage. Do not infer market totals or zero liquidations from an empty run. Workflow manual trigger is also supported.

**Why not 24/7 in GitHub Actions?** Durable 24/7 WS capture needs a continuously running worker, restarts and latency metrics. GitHub scheduled jobs can be delayed or dropped. The present workflow is a measured pilot of the data contract and connector reliability, not a promise of full coverage. A verified always-on service is a separate deployment decision.

## Output

`observations/YYYY-MM-DD.jsonl`: public sanitized events only (when present), keyed by the provider's event UTC day. `observations/status.json`: last run's per-provider connected seconds, reconnects, source errors, sampled period and non-completeness metadata. `0 events` is not `0 liquidations`.

The data are for research. Cross them with independently verified OKX **Spot BTC-USDC** candles only after matching UTC windows, separate derivative venues and units, and never claim that these prints caused a Spot price move.

## Data quality gates

- Only BTCUSDT on Bybit/Binance and BTC-(USDT|USDC)-SWAP on OKX; no other asset contamination.
- Reject timestamp more than 90 seconds in future or over 12 hours old; preserve and compare event vs reception times.
- Reject invalid/zero/negative/non-finite quantities and prices.
- Ignore Binance unfilled snapshots and COIN-M records.
- Sanitize events, never archive raw WS messages or private fields; duplicate events removed.
- Failed connections always explicitly marked **NO_VERIFIED_COVERAGE**; no failure is a market zero.
- Store only this laboratory's `observations/` path; do not modify historical archives, Administrator, Trader or Bridge.

## Next increments (not yet done)

1. Run the GitHub pilot and verify actual Bybit/Binance/OKX accessibility from its runner.
2. Evaluate the proportion of downtime from the stored run health; quantify how many observations are missing because of scheduled gaps.
3. Add a dedicated French-language liquidation-news discovery lane in the existing Interface collector only with full regression tests and without changing the Trader.
4. For true continuity, deploy an always-on public stream worker with restart and archival, or choose a licensed historical aggregate; keep this pilot's source and coverage flags.
5. Incorporate quantitative feeds into the Seven analyst only after verifying exchange-specific contract units and causal inference policy.

**Official reference:** [Bybit All Liquidation](https://bybit-exchange.github.io/docs/v5/websocket/public/all-liquidation), [Binance Futures WS](https://developers.binance.com/docs/derivatives/usds-margined-futures/websocket-market-streams/All-Market-Liquidation-Order-Streams), [OKX public WS V5](https://www.okx.com/docs-v5/en/), [GitHub scheduled workflow limits](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax).
