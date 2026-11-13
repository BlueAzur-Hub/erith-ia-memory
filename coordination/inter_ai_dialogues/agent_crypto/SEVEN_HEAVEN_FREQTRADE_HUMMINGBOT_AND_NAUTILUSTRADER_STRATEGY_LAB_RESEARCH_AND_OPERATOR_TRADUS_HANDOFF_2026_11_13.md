# Seven Heaven — External bot framework research and ERITH.IA strategy laboratory handoff

**Date:** 13 November 2026  
**Destinations:** shared inter-AI coordination (this directory), Administrator MASTER, inherited Trader MASTER, Operator Yoann, TRADUS (future compatible extensions)  
**Status:** sourced technical research + reproducible audit of **existing** historical PAPER results. NOT an execution of Freqtrade, Hummingbot or NautilusTrader. No new market trades, no credentials, no application modification.

## 1. Executive decision

**Use Freqtrade as an independent strategy validation/research engine; use Hummingbot Strategy V2 to study controllers, market making, grid execution and inventory. Keep our ERITH.IA Market Core and V5/V6 models untouched.**

The main development gap is **execution realism and reproducible comparability**, not a shortage of indicators or new buttons. Select models on evidence across market regimes and independent periods, NOT on highest nominal backtest return. A bot can close profitable cycles and still lose money on its unsold inventory.

Keep the existing architectural contract:
- MASTER Administrator 40.6.719 is the reference; Trader MASTER inherits its runtime through same-origin iframe.
- Operator Yoann has a matching 40.6.719 public runtime and its own distinct permissions; Operator Trader inherits its own Interface.
- Market Core 38.15.11 remains protected. Bridge, TRADUS private, order endpoints and credentials are outside this research.
- V5 historical EMA simulation, V6 instant OKX book estimate and public Spot lot/quantity comparison are read-only; their files were matched by Git blob SHA across Administrator/Operator in the preceding audit.
- The 2026-11-13 Firefox captures show the comparison loaded. V5 succeeds; V6 sometimes rejects an out-of-context or stale book as designed. This is a **human interaction workflow gap**, not evidence that the user clicked too slowly.

## 2. Previously available Spot Grid evidence — do NOT run it again as a new discovery

These are retrospective PAPER estimates, **Binance Spot BTCUSDT 1-minute** archives from the existing Coffre, **not OKX BTCUSDC fills**. All comparisons preserve each report's historical period and assumptions.

### Independently audited published metrics

| Window / model | Grid net return | HOLD 50% BTC net return | Grid minus HOLD 50, percentage points | Grid daily max DD | HOLD 50 daily max DD |
|---|---:|---:|---:|---:|---:|
| 2024 Jan–Mar · fixed TOUCH ±20%, 10 intervals | +9.3505% | +34.0355% | **−24.6850** | −6.7158% | −9.6421% |
| 2025 Jan–Mar · fixed TOUCH ±20%, 10 intervals | +1.2091% | −6.0236% | **+7.2327** | −10.1973% | −13.7739% |
| 2026 Jan–Oct · fixed TOUCH ±10%, 10 intervals | −3.6467% | −5.8750% | **+2.2283** | −31.6038% | −20.7326% |

**2026 cost/inventory sensitivity** on the existing 2026 study:
- 2026 fixed grid TOUCH: ending capital **963.533304 USDT**, total net **−36.466696 USDT** on 1,000.
- Hypothetical *closed cycles* show **+77.085195 USDT**; the total portfolio is still negative with **0.012438195 BTC** held and **0 USDT** remaining in cash. Do NOT equate closed-cycle profit with portfolio profit. The archived closed-cycle PnL and net return use different accounting views.
- 2026 monthly grid re-centering vs fixed grid, same TOUCH assumptions: **−14.6945 percentage points** of additional loss (−18.3412% vs −3.6467%). Reset/liquidation expenses and inventory evolution matter.
- 2026 double fees/slippage stress vs baseline fixed TOUCH: **−1.2092 percentage points** return impact (−4.8559% vs −3.6467%).
- 2026 TOUCH vs CLOSE fixed: **+0.1386 pp** difference. Both are *hypothetical fill models*, **neither is a reliable upper/lower bound**.
- 2025 Q1 grid closed-cycle PnL: **+117.672533 USDT**, but open-inventory PnL **−105.58195 USDT**. This is the same closed-profit illusion on a different window.

These source windows are not identical; do not pool or annualize them to rank a “winner”. The baseline widths ±20% in 2024/2025 Q1 and ±10% in 2026 are **not** a common optimization cohort. No independent blind out-of-sample result is claimed.

### Frozen source files and verification

Relative to `research/strategy_profiles/`:
- `SEVEN_HEAVEN_SPOT_GRID_BTC_2024_2025_Q1_CONTINUOUS_REPLAY_2026_11_11_PROOFS.json` — Git blob `da0145e0d99546326b720d15a07e160dc0c05ca6`, **260,640 1-minute bars**.
- `SEVEN_HEAVEN_SPOT_GRID_CONTINUOUS_BTC_2026_JAN_OCT_PROOFS.json` — Git blob `3044008b4347771dccb064a24957f8459b821249`, **437,760 1-minute bars**.
- `SEVEN_HEAVEN_EXTERNAL_BOT_SPOT_GRID_CROSS_COHORT_AUDIT.cjs` — **new** offline audit program; fails closed if either input Git blob changes, checks coverage/metrics and prints cross-cohort JSON.
- `SEVEN_HEAVEN_EXTERNAL_BOT_SPOT_GRID_CROSS_COHORT_AUDIT_SNAPSHOT.json` — **new** machine-readable audited findings, including source Git blob SHAs.

Run on a normal clone with Node.js:
```bash
node coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_EXTERNAL_BOT_SPOT_GRID_CROSS_COHORT_AUDIT.cjs
```
No package installation, network access or API token is required for the audit. The script audits archived proofs; it does **not** rerun the minute-candle backtester or external bot engines. The current session independently checked JSON schemas, minute counts, source references, scenario selection and arithmetic; an end-to-end Node execution on a checked-out repository remains to be performed.

## 3. What the real external programs contribute

### Freqtrade — recommended first external validation engine

Verified official upstream:
- https://github.com/freqtrade/freqtrade
- https://www.freqtrade.io/en/stable/backtesting/
- https://www.freqtrade.io/en/latest/lookahead-analysis/
- https://www.freqtrade.io/en/stable/recursive-analysis/
- https://www.freqtrade.io/en/stable/exchanges/

Available research functions: Python strategy classes (entry/exit/indicator rules), Dry-run, backtesting and `--timeframe-detail` to reduce intra-bar assumptions, parameter evaluation through Hyperopt, lookahead and recursive checks, FreqAI only *after* simpler controls succeed. Freqtrade documents **MyOKX (OKX EEA)** as a supported Spot market alongside OKX; that is not proof of a specific user's account permissions, API readiness or per-pair availability.

**Limitation:** Freqtrade's default directional strategy backtest is not a drop-in clone of OKX Spot Grid with multiple resting bid/ask orders, separate lots and moving inventory. A grid comparison requires explicit adaptation and matching assumptions, otherwise label the result **non-equivalent**. GPL-3.0 means do not copy source into ERITH.IA without license review; start with process isolation and an import/export contract.

### Hummingbot — controller and simulated execution laboratory

Verified official upstream:
- https://github.com/hummingbot/hummingbot
- https://hummingbot.org/strategies/v2-strategies/controllers/
- https://hummingbot.org/blog/strategy-guide-grid-strike/
- https://hummingbot.org/exchanges/okx/
- https://hummingbot.org/client/global-configs/paper-trade/

**Concrete inspected files:** `scripts/backtest_grid_strike.py`, `controllers/generic/grid_strike.py` (documented by upstream), `controllers/directional_trading/bollingrid.py`, `controllers/market_making/pmm_simple.py` and `scripts/simple_pmm.py`. Strategy V2 separates **controller → executor → configured market-data provider**; this is a useful pattern for TRADUS without copying Hummingbot's runtime.

Hummingbot's OKX page identifies a Spot connector and an `okx_paper_trade` mode, but marks the native **OKX Spot candle feed as “Not built”**; do not claim that an OKX Spot candle strategy will work end-to-end without validating the data path. A Grid Strike controller with position executors, stop or profit rules is **not** necessarily identical to OKX EEA Spot Grid. A paper exchange simulates fills; it does not certify order-queue position or historical liquidity. Hummingbot is Apache-2.0; evaluate each copied component's exact license and dependencies.

### Additional candidate: NautilusTrader (investigate after the first two)

- https://nautilustrader.io/docs/latest/concepts/backtesting/data-and-venues/
- https://nautilustrader.io/docs/latest/concepts/backtesting/fill-prices-and-matching/

NautilusTrader explicitly distinguishes L1 quotes, L2 price-depth, L3 per-order records, trades and OHLC bars. Its matching models can account for available depth and liquidity consumption; this is interesting for our already archived OKX L2 research. **Do not infer historical L3 queue position from L2** or claim that this tool has been installed/tested. Hold as a later execution-realism candidate rather than an immediate third installation.

### OKX Europe product scope, fee assumptions and human safety

Official EEA pages identify **Spot Grid** and **Spot DCA (Martingale)**:
- https://www.okx.com/fr-fr/help/what-are-okx-eeas-crypto-trading-bots-and-how-do-i-utilize-them
- https://www.okx.com/fr-fr/help/whats-the-spot-grid-bot-and-how-do-i-use-it

Canonical already-observed personal Spot rates (see `SEVEN_HEAVEN_OKX_OBSERVED_SPOT_FEE_REFERENCE_2026_11_12.md`, linked to Notion OKX MEMORY CORE): **maker 0.0800% / taker 0.1000%**, observations 6, 9, 12 Nov 2026. Do **not** ask for the same screenshots again. Do not apply these rates retroactively as guaranteed trade costs in Binance historical Grid studies. Check pair-specific terms before eventual deployment. Separate spread/market impact from fees without counting spread twice.

## 4. Concrete ERITH.IA ↔ external engine contract (proposal, not implemented)

```text
Public OHLCV / historical book evidence (immutable reference + SHA)
   → validated local research dataset (exchange, pair, quote, timestamps, closed bars)
   → isolated Python engine: Freqtrade OR Hummingbot (no account keys, no real orders)
   → typed results JSON (parameter hash, input hash, model id, assumptions)
   → check against baseline, cost stress, inventory and drawdown
   → public research dossier / proof JSON
   → shared MASTER Interface / inherited Trader
   → Operator Yoann / TRADUS PAPER reads same public dossier without copying engine
```

Minimum proposed result fields:
```json
{
  "schema": "erith.strategy_experiment.v1",
  "strategy_id": "SPOT_GRID_FIXED",
  "engine": "reference_paper | freqtrade | hummingbot",
  "engine_version_or_commit": "required",
  "data": {"exchange": "required", "pair": "required", "timeframe": "required",
    "start_utc": "required", "end_utc": "required", "source_sha256": "required"},
  "params": {"hash": "required", "capital_quote": 1000, "fee_maker": 0.0008,
    "fee_taker": 0.001, "slippage_assumption": "required"},
  "model": {"fill_mode": "required", "latency": "required", "partial_fills": "required",
    "queue_assumption": "required", "instrument_rules_timestamp": "required"},
  "results": {"equity_final_quote": null, "max_daily_drawdown_pct": null,
    "closed_cycles_pnl_quote": null, "open_inventory_marked_pnl_quote": null,
    "cash_final_quote": null, "base_inventory_final": null,
    "rejected_orders": null, "maker_fills": null, "taker_fills": null},
  "evidence": {"raw_logs": "required", "run_status": "unexecuted"},
  "safety": {"paper_only": true, "order_endpoints_used": false}
}
```
The above is a **schema proposal, not a live result**. Do not fill absent fields with zeros; use `null` and explain why. Never call a Python engine just by opening an HTML page. The immutable input and report join by hashes, not an unsigned text claim.

## 5. Next real experiment: cross-engine validation, NOT another 2026 optimization

Pre-register one small and fully specified study:
1. **Selection:** BTC/USDT Binance historical one-minute source for which prior SHA-verified grids exist; independent 2024 Q1 and 2025 Q1 windows, same 1,000 USDT capital and same grid boundaries and 10 intervals **for each comparison**. This is a *technical parity* exercise, not a blind discovery.
2. **Reference:** replay the already audited standalone Spot Grid source without rewriting it. Record per-lot inventory, hypothetical fills and cash.
3. **Hummingbot:** test a configured Spot-compatible controller in PAPER with equivalent fee, balance, order schedule, fill semantics and data source; if Grid Strike cannot match the model, explicitly report model mismatch rather than manipulating metrics to agree.
4. **Freqtrade:** use for separate directional EMA/Bollinger/etc. controls on the *same dated source*, including lookahead/recursive verification. Do not call a directional engine a direct independent grid validation without a custom equivalence layer.
5. **Stress:** double costs without retuning; compare HOLD 50%, HOLD 100%, cash, rejected orders and drawdown, and retain open positions. Publish negative results too.
6. **Promotion:** only after a new run logs the exact engine commit/version, input hashes and checks; then offer JSON in MASTER and Operator / TRADUS read-only. No user keys in public GitHub.

**Strict distinction:** a reference replay, an engine-side backtest, and a live/paper order simulation have different fill models. Their price path, signals, orders and accounting must be reconciled before metrics are compared. A backtest result without exact fill semantics is not equivalent evidence.

## 6. Firefox FRESH issue — identified root cause and safe fix contract

The complaint is valid. Users do not need to click within a 15-second validity window.

Code inspected in MASTER:
- `public/agent_crypto_erith_ia/administrator/js/market-microscope-paper-spot-realism-comparison.js`: comparison button handler currently reads `AgentCryptoOkxMicrostructure.snapshot()` synchronously at click time and calls `compareV6`. When the book has gone stale or source changed, `BOOK_CONTEXT` is returned.
- `.../market-microscope-orderbook-paper-v6.js`: **already has** `openDepthAndEstimate()`, which opens the reading and depth panels, optionally refreshes the public OKX book and waits for completion before evaluating freshness. No change to V6's 15,000 ms safety gate is needed.

Safe next incremental patch (**not applied in this report**): on the single **“Comparer V5 + carnet V6 (PAPER)”** click, keep the V5 result; request or reuse `openDepthAndEstimate` when the source book is stale/context-mismatched; after it completes, immediately re-read and compare **the same OKX pair**, with busy/timeout feedback and a disabled duplicate-click state. No background refresh loop, silent retry, fresh-time inflation, account API, orders or Bridge mutation. If the fetch fails, keep the honest `BOOK_CONTEXT` or related failure. Add an offline test simulating a stale book that refreshes and a stale book that must fail closed. Mirror the *same validated source change* to Operator; Trader pages inherit their respective Interface.

**Acceptance:** one deliberate user click, no racing seconds, no false “FRESH”, proof of matching pair/source timestamp, no change in V5/V6 numerical engines. Review with Firefox on Windows before marking UI accepted.

## 7. Scope, status and handoff

**Completed in this session:** checked upstream documentation and actual source files; verified local shared-folder historical proofs and arithmetic; published a pinned-source offline proof-audit program and machine-readable snapshot; documented the integration plan and UX defect. **Not done:** install/execute external engines; new end-to-end Hummingbot/Freqtrade performance claims; Firefox acceptance; mutate MASTER/Operator/TRADUS/Bridge; real orders.

**Next single action for a future AI:** build a separate local, no-credential Hummingbot/Python proof-of-concept with one canonical historical dataset and compare exact fill semantics to the already published reference. Preserve every failed or non-comparable result; do not replace the historical report.

References: all URLs and artifact paths in this note are primary sources or precise existing repository paths. No invented profits, live data or exchange eligibility.
