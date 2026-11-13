# Seven Heaven Strategy Lab — Aether Observatory V2 delivered

**Date:** 13 November 2026 · **Identity approved by owner:** Seven Heaven Strategy Lab  
**Authoritative shared location:** `coordination/inter_ai_dialogues/agent_crypto/`  
**Application location:** `seven_heaven_strategy_lab/`  
**State:** Source merged, real Linux + Windows + browser checks PASS, V2 ZIP and screenshots PUBLISHED, owner USB Firefox V2 acceptance NOT YET OBSERVED.

## 1. Why V2 exists

The owner tested V1 **on an 8 GB USB flash drive at `E:\seven_heaven_strategy_lab`**, under **Python 3.13**, with the local Firefox address `http://127.0.0.1:8777`. Real screenshots showed:
- local server operational, 44,640 Binance Spot BTCUSDT 1-minute candles SHA-256 authenticated;
- historical EMA 10/30 PAPER simulation with 1,000 USDT, 1,642 fills, 614.20 USDT simulated fees, 77.96 USDT final marked capital, −92.20% return;
- archive and result journal saved in `workspace/`.

User requested a **substantial, premium class ERITH.IA-style interface**, built in successive versions and following a clearly traceable project development path, not merely a small calculator. They explicitly allow outgoing Internet access for public data. Do not impose an offline-only product restriction; preserve **no private account keys or real orders** separately.

## 2. Source publication and final checked binaries

- PR **[#756](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/756)** merged on `main`; merge commit **`4fe8996b05814f590168bc90931bfb8fa1048bb0`**.
- **Final V2 Release:** https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-strategy-lab-v2-aether-observatory-2026-11-13
- **Direct full ZIP:**
  https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v2-aether-observatory-2026-11-13/SEVEN_HEAVEN_STRATEGY_LAB_V2_AETHER_OBSERVATORY_PREMIUM_PYTHON313_WINDOWS_PORTABLE_PAPER.zip
- Published ZIP size: **45,104 bytes**.
- Published ZIP SHA-256: **`39d9a7ef89c2f89ec519f11d1f206400e54f169b8a0799fa751ff00ee9240c13`**.
- Release also contains checksum TXT, original six-method results JSON, **30 V2-case historical result JSON** (`SEVEN_HEAVEN_STRATEGY_LAB_V2_AETHER_OBSERVATORY_30_CASES_VERIFIED.json`, 18,406 bytes), and two genuine browser screenshots:
  - [Desktop cockpit PNG](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v2-aether-observatory-2026-11-13/SEVEN_HEAVEN_STRATEGY_LAB_V2_PREMIUM_DESKTOP_COCKPIT.png)
  - [Mobile cockpit PNG](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v2-aether-observatory-2026-11-13/SEVEN_HEAVEN_STRATEGY_LAB_V2_PREMIUM_MOBILE_COCKPIT.png)
- The **V1 Release remains untouched** at `seven-heaven-strategy-lab-portable-paper-initial-2026-11-13`. Version history is GitHub / separate Release; no private workspace is committed.

## 3. Feature scope — actual coded and tested

### Premium visual language
- Bespoke original Aether Observatory theme: midnight navy with gold title typography, teal/cyan highlights, instrument-like topbar and navigation, radial market imagery built from CSS (offline, no third-party graphic/CDN dependency).
- Strategic readout, source provenance panel, controls, equity chart, six-row comparison and local experiment vault.
- Responsive layouts checked on a desktop (1536px) and mobile viewport (390px); no horizontal body overflow.
- Visual inspiration is the user's Agent-Crypto @erith.IA Administrator 40.6.719. **No modification to that app's code or protected Persona assets.**

### Scientific calculations (original internal PAPER engine only)
- Five deterministic completed-candle timeframes: **1m (44,640 rows), 5m (8,928), 15m (2,976), 1h (744), 4h (186)**. All OHLCV is *aggregated from the same immutable January 2026 Binance Spot BTCUSDT 1m archive*, preserving the source hash.
- Six methods on a common capital/fee/slippage/month: EMA_CROSS, BOLLINGER, DCA, HOLD_50, HOLD_100, CASH. Returns, drawdown, final cash/BTC inventory, fees, fills and rejected hypothetical orders.
- Separate **ideal zero-cost counterfactual** (fee=0, slippage=0) for each individual run; its reported performance must **not** be treated as achievable or as an additive decomposition of real costs.
- Correct DCA timeframe semantics: user enters **minutes**, which are rounded up to complete aggregated bars. A daily 1,440-minute DCA becomes 24 x 1h or 6 x 4h, never 1,440 x 1h/4h.
- Technical model: prior closed candle used for signals; hypothetical full execution at next candle open. This is **not** a verified orderbook fill, queue position, latency model or historical Binance/OKX actual fees.
- Preserved: fraction **0.001 = 0,10% Taker** default as observed user OKX Spot fee assumption; **0.08% Maker** informative only, not applied to all fills; independent slippage **0.0005 = 0,05%**.
- `workspace/results/` preserves previous V1 result schema with a 1m fallback; `workspace/profiles/` preserves V1 parameters, `workspace/comparisons/` stores new V2 comparisons; `workspace/datasets/` retains the already downloaded authenticated CSV.
- New local API `/api/compare`, `/api/comparisons`, `/api/comparisons/{id}` supports read-only local research. **No trading API**.

### Files
- `src/observatory.py` — strict OHLCV aggregation, research comparison, cost diagnostics.
- `src/server.py` — updated API, local result/profiles persistence and schema backward compatibility.
- `web/index.html`, `web/styles.css`, `web/app.js` — full premium V2 UI.
- `tests/test_observatory.py` — 12 new logic tests.
- `tests/browser_acceptance_v2.py` — genuine headless Chromium UI interaction and screenshot acceptance.
- `.github/workflows/seven-heaven-strategy-lab-portable-paper-validation.yml` — Python/Linux, Windows/CMD, Docker, browser, full source and release packaging.
- `README_FR.md` — user-specific USB preserving upgrade instructions.

## 4. Verified execution proof — successful after fixing test-only issues

**Final merged-main CI:** https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43380143039

- **26 Python unit tests** all PASS (14 V1 + 12 V2).
- Original historical source hash verified, **44,640 genuine minute candles**, six V1 baseline PAPER runs PASS.
- **30 real V2 PAPER research runs:** 5 completed timeframes × 6 strategies, same reference month and assumption stack, PASS.
- Full local Python HTTP API run/compare, saved profiles and comparisons, old history and absent `/api/trade`, PASS.
- GitHub Windows runner Python **3.13** launched the actual CMD launcher and served the V2 French HTML, PASS.
- Real Chromium browser clicked six-way compare, opened strategy, saved profile, checked desktop/mobile responsive layout and no JavaScript page exceptions, PASS.
- Optional Docker local HTTP run PASS.
- V2 ZIP, hash TXT, model proof and two screenshots uploaded to a **separate V2 Release**, PASS.

An initial **browser-test script** failed because it incorrectly awaited the CSS “visible” state of an HTML `<option>` (which is attached but hidden by design). Another attempt failed because Playwright's string-eval condition violated our strict `Content-Security-Policy: script-src 'self'`. Both problems were corrected **in the test, not by weakening the app CSP**. Last checks all PASS. Do not confuse red intermediate experimental runs with application failures.

### Current validation boundary
- Actual *owner's* Windows **Firefox V2 UI** visual acceptance is still pending. Linux Chromium/Windows Python CI cannot certify the owner's individual browser look, USB drive permissions or run stability.
- App currently has Internet access for an **explicit manual click** to the fixed public historical GitHub Release asset. It does **not yet** fetch live OKX or new user-selected asset/date ranges.
- No imported Freqtrade or Hummingbot execution inside this local V2. External engines have separate prior research proofs, with a documented difference in model fill/accounting.
- No claim of profitable algorithm or reduction of trading risk from UI beauty.

## 5. Exact user upgrade — preserve the USB 8 GB workspace

**First and only initial action:** close the existing Strategy Lab Python CMD window, so port 8777 is free. Do **not** disconnect the drive while Python serves it.

Then, before copying:
1. Copy `E:\seven_heaven_strategy_lab\workspace\` as a backup to another disk.
2. Download/extract the new V2 ZIP. Copy **the contents of `seven_heaven_strategy_lab\`** over the existing `E:\seven_heaven_strategy_lab\` program files, **without deleting the `workspace\` directory**.
3. Double-click the unchanged file `START_SEVEN_HEAVEN_STRATEGY_LAB_PYTHON_WINDOWS.cmd`. The server still uses Python 3.13, `127.0.0.1:8777` and the existing profile/result/data folders; no Docker Desktop required.
4. Verify the V2 **BUILD 2.0.0** badge, historical source still authenticated, profile history still present, and a six-method comparison on 1h or 15m.

A fresh separate V2 directory is also acceptable, but then **copy the V1 `workspace\` to the new folder**. Do not mix in the private Bridge/ComfyUI Python environment. If anything breaks, V1 release remains available as a separate download.

## 6. Development roadmap — A → B → C → D, numbered releases

| Stage | Target | State |
|---|---|---|
| **A / V1 — trustworthy local foundation** | Python Windows launcher, fixed public historical dataset, simple PAPER engine, local JSON saves | **Validated on owner's 8 GB USB** |
| **B / V2 — premium scientific cockpit** | ERITH-inspired original visual, five timeframes, six-way model comparator, zero-cost benchmark, backward-compatible local vault | **Merged, tested, released; owner acceptance pending** |
| **C / V3 — connected data observatory** | Public OKX/Binance data connectors with instrument/date/timeframe selection, provenance and freshness, caching, downloadable new periods, partial/gap handling, strict separation of live quotes and historical simulations | **Future work, not implemented** |
| **C+ / V4 — independent engine verification** | Real Freqtrade offline/public market-metadata backtesting with labelled model differences; Hummingbot Spot-only grid model with real instrument constraints, wallet budget and inventory ledger, compare on truly common windows | **Future integration; some isolated earlier Hummingbot research done** |
| **D / V5 — configurable research console** | Owner-created strategy rules safely validated, parameter sweeps, regime/risk comparisons, walk-forward untouched tests, run provenance and audit vault, optional read-only TRADUS/Operator interoperability | **Future work, not implemented** |

**Guiding rules:** USD / USDT as displayed reference according to market, no stablecoin Top-5 changes here, no assumed access to Yoann's TRADUS, no duplicate large third-party ZIP copies. Keep third-party source archives in existing GitHub Releases. Never silently enable live orders or copy protected private Creator Memory into this public repository.

**Single-next-action user guidance:** User should stop the old Python server first, then upgrade while preserving `workspace`. Do not ask about Python version, Docker or previously verified account fee defaults again.
