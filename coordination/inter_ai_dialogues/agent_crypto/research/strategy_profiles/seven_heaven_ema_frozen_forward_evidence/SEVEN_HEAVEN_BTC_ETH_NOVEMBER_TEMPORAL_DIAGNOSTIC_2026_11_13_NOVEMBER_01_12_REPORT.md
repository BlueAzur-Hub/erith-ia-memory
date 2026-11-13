# Seven Heaven — BTC / ETH, November 1–12, 2026 retrospective diagnostic

**Status:** RETROSPECTIVE_LATER_DATE_DIAGNOSTIC_NOT_PROSPECTIVE. **No real orders.**

**UTC evaluation:** 2026-11-01 through 2026-11-12; 12 complete daily candles. USD, Bitstamp Spot only.

| Instrument / portfolio | HOLD % | FAST EMA5/13 % | SLOW EMA10/30 % |
|---|---:|---:|---:|
| BTC/USD | -8.091 | +0.000 | +0.000 |
| ETH/USD | -10.679 | +0.000 | +0.000 |
| 50/50 (two independent equal sleeves) | -9.385 | +0.000 | +0.000 |

All returns are **net of assumed fee 0.10% + slippage 0.05% per side**, not executed returns.

| Asset/portfolio and method | Max DD % | Orders | Cost ×2 return % |
|---|---:|---:|---:|
| BTC HOLD | -11.264 | 1 | -8.367 |
| BTC FAST | 0.000 | 0 | +0.000 |
| BTC SLOW | 0.000 | 0 | +0.000 |
| ETH HOLD | -16.725 | 1 | -10.947 |
| ETH FAST | 0.000 | 0 | +0.000 |
| ETH SLOW | 0.000 | 0 | +0.000 |
| 50/50 HOLD | -14.042 | 2 | -9.657 |
| 50/50 FAST | 0.000 | 0 | +0.000 |
| 50/50 SLOW | 0.000 | 0 | +0.000 |

## Evidence and validity
- Frozen protocol predates the retrieval performed by this workflow. For 1–12 Nov, price days still **predate protocol**: this is a **later-period retrospective diagnostic**, not a prospective trial.
- Forward cohort uses only **fully closed** UTC days on or after 2026-11-13, with EMA warmed from original historical sources, and no configuration changes.
- Frozen historical SHA256 and full 2024–October 2026 reference replay verified independently for BTC and ETH.
- Official Bitstamp public OHLC API responses, timestamps, source-body hashes, selected daily prices, strategy actions, liquidation valuations and stress tests are in the adjacent JSON.
- Unknown market impact, spread, connectivity, trade latency, minima and taxes prohibit any claim of actual execution.
- No intervention in Administrator, Operator, Trader, Bridge, or private accounts.

**Decision:** No method should be selected or promoted from fewer than 90 prospective complete daily candles. Even 90 observations would remain preliminary.
