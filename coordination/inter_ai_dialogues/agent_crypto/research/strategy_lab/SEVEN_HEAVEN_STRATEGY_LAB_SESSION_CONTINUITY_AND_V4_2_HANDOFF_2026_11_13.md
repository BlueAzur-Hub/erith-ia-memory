# Seven Heaven Strategy Lab — Session continuity and V4.2 handoff
**Date:** 2026-11-13 (France)  
**Scope:** Seven Heaven Strategy Lab, local Windows/Python 3.13, `E:\seven_heaven_strategy_lab`, Firefox `http://127.0.0.1:8777`  
**Record type:** Faithful operational *summary* of the current conversation and user-supplied screenshots. **NOT a verbatim transcript or backup of every chat message.** For a literal full-thread export the user's local Sonde Markdown exporter is required; do not claim this file contains every turn.

## Canonical references
- [Canonical source](https://github.com/BlueAzur-Hub/erith-ia-memory/tree/main/seven_heaven_strategy_lab)
- [Canonical status and research manifest](./SEVEN_HEAVEN_STRATEGY_LAB_VERSIONED_CONTINUITY_MANIFEST.json)
- [Main Notion strategy plan](https://app.notion.com/p/4177754fe08481b0ac48e2dc00eaed72)
- [V4.1 official release](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-strategy-lab-v4-1-professional-risk-desk-2026-11-13)
- [V4.1 final GitHub CI](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43406412922)
- [V4.1 PR #762](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/762)

## What is already built and validated
1. **V1 / V2:** Independent, no-account, long-only, strictly PAPER strategy laboratory. Verified Binance Spot BTC/USDT January 2026 archive with 44,640 one-minute candles; local profile and experiment vault; six baseline methods.
2. **V3.0:** Public OKX Spot BTC/ETH vs USDC/USDT connector, 240 closed hourly candles, immutable SHA-256 manifests, reproducible PAPER, passed owner Firefox acceptance.
3. **V3.1:** Select 10/30/60/90 days and optional end date UTC, preserving V3 source identifiers and local workspace. Owner confirmed **90 days / 2,160 hourly BTC/USDC candles** in Firefox, compared six methods. Do not ask again to retest.
4. **V4.0:** **Native, independent visual strategy creator** for Yoann and Christophe: EMA-based entry and exit, optional RSI/volume filter, hypothetical next-open stop/target rules, profiles, seven-way comparison against six unchanged baselines. No mandatory Freqtrade/Hummingbot runtime. Owner confirmed Firefox, 720 OKX 1H BTC/USDC candles and a saved custom EMA12/32 profile. Owner's 10,000-USDC test showed -16.36%, 22 hypothetical fills, 202.06 USDC commissions; custom unfiltered EMA agreed with built-in EMA. These are experimental outcomes, not future forecasts.
5. **V4.1:** **Aether Quant** risk panel adds round-trip closed-position count, closed-trade win rate, profit factor, realized/unrealized PnL, percentage of time in position, and drawdown history. Same strategies, same underlying hypothetical fills, no new dependency or migration. Official full Windows ZIP published and GitHub CI passed. **Owner Firefox confirmed 2026-11-13:** locally running BUILD 4.1.0; 1,440 OKX BTC/USDC hourly candles (60 days) and 360 x 4H replay bars, with EMA12/32. Simulated initial 10,000 USDC -> 8,708.21 USDC (-12.92%), drawdown -14.68%, fees 94.80 USDC; 5 BUY + 5 SELL; 5 completed round trips, zero winners, profit factor 0, exposure 15.6%, realized PnL -1,291.79 USDC, latent PnL 0. Confirmed from screenshots and pasted UI, **not** independently from the owner's local raw CSV or full SHA.

## Resolved UI confusion; do not label it a V4.1 regression
- Owner initially saw only EMA settings and feared the personal strategy editor had disappeared. The **Famille de stratégie** dropdown was set to **Croisement de moyennes EMA**, so personal-rule fields were intentionally hidden.
- Owner selected **★ Ma stratégie personnalisée · Créateur V4**. Screenshot subsequently shows the rule editor present and its entry/filter options.
- **Important UX detail:** the selected configuration and the displayed latest historical simulation are independent until **Lancer la simulation PAPER** is clicked. The analysis card may still show the previous EMA 4H result when the dropdown has just changed to the personal editor. V4.2 should make the selected configuration vs last-run report explicit, without automatically running a trade or simulation.
- This confusion is now resolved. **Do not request more testing today.**

## Architecture and owner instructions
- Seven Heaven's original Python strategy core and saved experiments must remain independent of Freqtrade and Hummingbot. Both source archives are separately preserved for OPTIONAL scientific comparison; do not duplicate or vendor entire trees to the user's USB.
- The owner's Administrator and Trader interfaces are premium design references, especially candle graphics and indicators. They are **separate projects**: never change or couple their production interfaces, Trader, Operator, TRADUS or Bridge during Strategy Lab work.
- User expects elegant professional dark/navy/teal/gold design, substantive increments V4.2/V4.3/V4.4/V5, not micro-patch scripts. Do not pile up README / CMD / Python installers in `E:\seven_heaven_strategy_lab`.
- Use GitHub history and the existing Notion plan as canonical continuity. A single clean tested application ZIP per actual release; private `workspace/` remains on USB and must never be overwritten or uploaded to public GitHub.
- No real trading: no OKX order submission, no account key requirement, no live execution implied by historical next-open fills. Flat fee/slippage estimates are not proof of actual fills. User wants future personal strategies for Yoann; automated OKX bots are long-term and require a separate explicit permission/risk program.
- Fact vs hypothesis vs untested status must remain explicit. User prefers one well-described next action, not repeated manipulations or questions already answered.

## One sensible next direction when the owner returns
**V4.2 — Professional market microscope within the existing Strategy Lab**:
- Native interactive historical candlestick chart sourced from **the same SHA-verified dataset and exact timeframe** as the selected PAPER simulation, not Administrator live candles or current orderbook.
- Toggleable EMA/SMA, Bollinger, VWAP/RSI where appropriate; strategy BUY/SELL markers with exact UTC/candle mapping, quantity, notional, costs and side.
- Use the Administrator visual language while maintaining independent code and strict data provenance.
- Clearly separate **draft/config selected** from **last simulation result** to prevent the V4.1 perceived regression.
- Add time-window selection / zoom and a clear legibility test at 80% Firefox zoom and on mobile-width browser.
- Scope first implementation as a versioned V4.2 feature, with deterministic data/indicator tests, no lookahead, baseline non-regression, Python 3.13/Chromium checks, single full ZIP, and optional owner Firefox acceptance when ready.
- V4.3: out-of-sample/walk-forward and regime robustness with transaction-cost sensitivity, prevent optimization/selection bias. V4.4: risk controls and more expressive user rule studio. V5: autonomous PAPER robot only, no real orders without a separate explicit decision.
- **No work in background between turns.** Owner has said they are going to sleep. Leave the accepted V4.1 unchanged and resume only on the next request.

## Record boundaries
This is a **public-project technical handoff**, not a verbatim export. It does not publish chat-private statements, raw screenshots, private Aerith memory modules, personal identifiers, API credentials or USB workspace. The user may separately export the verbatim thread as Markdown with their Sonde tool, keeping sensitive content in the appropriate private destination.
