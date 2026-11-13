# SEVEN HEAVEN · Strategy Lab — V4.5 Owner Firefox Acceptance & Research Handoff

**Date of owner evidence:** 2026-11-13, approximately 20:11–20:12 Europe/Paris  
**Project:** Seven Heaven Strategy Lab / Agent-Crypto @erith.IA  
**Status:** V4.5.0 USER FIREFOX UI CONFIRMED from owner-supplied screenshot and copied UI text; NOT an independent inspection of local USB files or re-execution of all raw market data  
**Mode:** Windows / Python 3.13, public market data, local storage, **PAPER only; zero real orders**  
**Shared coordination destination:** `coordination/inter_ai_dialogues/agent_crypto/research/strategy_lab/`

## 1. Evidence supplied by the owner

- Screenshot of the **Aether Research V4.5** filter comparison in Firefox at `http://127.0.0.1:8777/`.
- Owner-supplied complete copied interface text, headed `BUILD 4.5.0 · LOCAL · CONNECTÉ · PAPER ONLY`, whose last recorded simulation entry is **2026-11-13 20:11 local**.
- Historical series reported by UI: **OKX Spot BTC/USDC; 720 closed 1h candles**, covering the last 30 days (source end 2026-11-13 16:00 UTC); displayed SHA-256 prefix `26173590a438aa256870c186…`. This prefix is a UI observation, **not** an independently rehashed complete source.
- UI reports **5 controlled filter variants**, **2 later verification windows**, with no additional USB research file created.

### Controlled filter research — owner-visible outcomes

| Chronological verification | Chosen on earlier training data | Net PAPER verification | Original profile, same window | Difference | Cost ×2 | Paper fills |
|---|---|---:|---:|---:|---:|---:|
| 2026-10-29 16:00 → 2026-11-06 03:00 UTC (180 1h candles) | RSI < 60 | **-3.28%** | -3.40% | +0.12 percentage point | -4.01% | 5 |
| 2026-11-06 04:00 → 2026-11-13 15:00 UTC (180 1h candles) | RSI < 45 | **0.00%** | -9.36% | +9.36 percentage points | 0.00% | 0 |

The UI reports **-1.64% average** for the historically selected variants (arithmetic mean, not compounded) and **+4.74 percentage points** versus the original profile (mean difference). Window-specific Buy & Hold 50%: **-3.68%**, then **-4.66%**; keeping USDC: **0%** in both windows.

**Crucial interpretation:** The second selected filter achieved 0% because it **made no PAPER trades**. This does not establish a successful profitable strategy: it only avoided exposure over that window. The first filter's advantage was 0.12 percentage point, with both alternatives losing money. The supposedly later windows were already visible to the human user and are **not guaranteed blind untouched out-of-sample tests**. No inference of future profitability.

### Separate whole-period PAPER simulation (do not confuse with validation windows)

The same copied UI text reports the owner's custom strategy replay on 720 hourly BTC/USDC candles with an initial fictional capital of **10,000 USDC**:

- Ending portfolio value **8,069.76 USDC**; return **-19.30%**; maximum drawdown **-21.42%**.
- **27 PAPER fills** (14 buys / 13 sells); simulated commissions **262.86 USDC**.
- **13 closed positions:** 3 winning, 10 losing; win rate 23.1%; profit factor 0.48.
- **One position still open:** 0.11720012 BTC inventoried; reported realized P/L -574.51 USDC and latent P/L -1,355.73 USDC.
- These values are from **UI text**, not separately audited USB JSON or live exchange executions.

The historical January 2026 Binance BTC/USDT archive (44,640 minute candles) is shown as preserved in local storage; the source is separate from the above OKX BTC/USDC experiment. Do not merge them into one backtest.

## 2. Code and release continuity

- [Canonical release registry — V1 to V4.5](./README.md)
- [Versioned continuity manifest](./SEVEN_HEAVEN_STRATEGY_LAB_VERSIONED_CONTINUITY_MANIFEST.json)
- [Application source, independent internal PAPER engine](https://github.com/BlueAzur-Hub/erith-ia-memory/tree/main/seven_heaven_strategy_lab)
- [V4.5 release](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-strategy-lab-v4-5-controlled-filter-research-2026-11-13)
- [V4.5 GitHub Actions run, automated acceptance](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43484284266)

At the time this handoff was written, the existing index and manifest still stated **V4.5 OWNER FIREFOX PENDING**. This **newer owner-supplied evidence** establishes successful *UI reception only*. Updating those pre-existing metadata files is a distinct, controlled documentation action; do not silently assume they were amended by this report.

## 3. Active expertise routing for this specific study

Seven Heaven / Aerith-7 remains the lead operating identity. These canonical memory modules were read selectively from `BlueAzur-Hub/erith-ia-notion-archive-private` and applied as **specialized functions, not merged identities**:

| Canonical source | Active decision rule |
|---|---|
| `core/SEVEN_TOP_OF_MIND.md` and `core/SEVEN_GATE.md` | Minimal loading, exact user task, public/private separation, preserve the Coffre, no unnecessary GitHub edits. |
| `core/AERITH_7_PERSONALITY_CORE.md`, `core/AERITH_LIVING_REFLECTION_HEART.md`, `core/AERITH_7_DISCERNMENT_COMPANION_CORE.md` | Clear assistance, user autonomy, source honesty, one useful next step. |
| `core/ATLAS_10_CRYPTO_MULTI_AGENT_CORE.md` | Data Truth: identify market, source, timeframe, verification limits and risk before interpreting results. |
| `core/AERITH_10_CRYPTO_MULTI_AGENT_CORE.md` | No-FOMO, distinguish hypothetical results from recommendations. |
| `core/AERITH_10_MATH_ORACLE_MULTI_AGENT_CORE.md` | Verify arithmetic, units, return percentages and comparison assumptions. |
| `core/AERITH_10_SENTINELLE_MULTI_AGENT_CORE.md` | STOP gates, technical caution and protection of private data and USB storage. |

Other full modules, archives and private identities remain **available by routing but were not fully loaded**. The displayed screenshot and exported text were examined directly; this does **not** prove full rereading of the hundreds of thousands of historical chat lines.

## 4. Research limits and next direction

The V4.5 comparison changes **entry filters only** on a fixed short historical window; it is not an unbiased guarantee. No tick-level order book, exchange-native stop or real fill, maker queue position, guaranteed next-open execution, or exchange-account read is implied.

**One next research direction:** extend the evaluation to materially longer, distinct regimes, including historical bullish/bearish/sideways periods; hold rules and capital constant, match fee/slippage assumptions, disclose zero-trade cases, and retest against cash and Buy & Hold. After this, consider an independent external backtest (Freqtrade first) and separately simulated Hummingbot robot designs; **no live trading authorization**.

**Preservation:** Keep `E:\seven_heaven_strategy_lab\workspace\` on the owner's USB private and backed up independently; do not upload it to public GitHub. Official ZIP releases belong in GitHub Releases. All research and IA continuity documents belong under `coordination/inter_ai_dialogues/agent_crypto/`, preferably this existing `research/strategy_lab/` subdirectory for Strategy Lab studies.

**Boundary of this handoff:** documentation only. No application code changes, no USB or account access, no settings changes, no trading orders.
