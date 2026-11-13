# SEVEN HEAVEN STRATEGY LAB — Master architecture, bot engines, USB storage and AI continuity

**Decision record · 2026-11-13 · User-approved name: Seven Heaven Strategy Lab**  
**Status: A/V1 and B/V2 delivered; subsequent stages are DESIGN, not completed software.**  
**Canonical location:** `coordination/inter_ai_dialogues/agent_crypto/`. Read this alongside the existing V2 delivery dossier and the application's `README_FR.md`. This is a **project specification**, not a trading recommendation.

**Current Notion master page:** https://app.notion.com/p/4177754fe08481b0ac48e2dc00eaed72  
**Machine-readable continuity registry:** `coordination/inter_ai_dialogues/agent_crypto/research/strategy_lab/SEVEN_HEAVEN_STRATEGY_LAB_VERSIONED_CONTINUITY_MANIFEST.json`  
**Notion hub:** https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099

## 0. The user's confirmed direction (not an inference)

- A **premium professional-grade local research and bot-building cockpit**, visually in the family of **ERITH.IA Administrator**: navy / gold / cyan, instrument display, responsive graph, configurable indicators and a beautiful accessible technical-reading workspace. User-supplied image of Aerith-5 is a **visual reference only**, not permission to copy protected personal image files into a public repo.
- Development by explicit milestones **A → B → C → D**, releases **V1 → V2 → V3 → V4 → V5 and beyond**; transparent feature completion, results and evidence per release. Continue across AI chat threads without recapping missing facts.
- Runs **locally on Windows using Python 3.13**, program and research data stored on an **8 GB removable USB drive** at `E:\seven_heaven_strategy_lab`. User also owns a **32 GB USB** and can migrate later.
- **Internet is ALLOWED** to obtain public crypto prices, candles, books, listings, exchange metadata, version manifests and research resources. The user did not request air-gapping or an offline-only application.
- **No real orders by default.** PAPER simulations and dry-run first; the project must be capable of **bot architecture** and future connected exchange compatibility. Do not misrepresent enabled Internet as consent to trade with actual funds or to store account credentials.
- **Leave several gigabytes free** for the user's **private Markdown files, Aerith personas and seven private GitHub archives**. These belong to the user, not to the public repository or automatic cloud sync. Do not collect, copy, upload or expose their private files.
- Independent laboratory **not** a rewrite of MASTER Administrator, Operator Yoann, Trader, Bridge R31 or Yoann's private TRADUS. Cross-project contracts only, no hidden coupling, no duplicate giant GitHub archives.

## 1. Current delivered truth — do not silently upgrade claims

### A / V1 local foundation — confirmed on owner's Windows/Firefox USB
- Python 3.13 already installed (`py -0p` showed 3.13 default, older 3.8 separately), launch with `START_SEVEN_HEAVEN_STRATEGY_LAB_PYTHON_WINDOWS.cmd`, not Docker.
- At `http://127.0.0.1:8777`, real owner's screenshots showed SHA-256 authenticated **44,640 Binance BTCUSDT 1-minute bars, January 2026**, EMA(10,30) PAPER, results stored in `workspace/`: 1,000 USDT → 77.96 USDT (−92.20%); 821 buys + 821 sells; simulated fees 614.20 USDT. No real order.
- V1 release: https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-strategy-lab-portable-paper-initial-2026-11-13

### B / V2 Aether Observatory — built, CI tested, owner installed/extracted but no screenshot of V2 session yet
- PR #756 merged, main `4fe8996b05814f590168bc90931bfb8fa1048bb0`, 26 deterministic tests pass, 30 real internal PAPER historical scenarios, Python/Windows launcher pass, Chromium interactive desktop/mobile comparison pass, Docker optional passed. Final verified run: https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43380143039
- V2 source: `seven_heaven_strategy_lab/`, version **2.0.0**; 5 OHLCV timeframes derived from same 1-minute dataset (1m/5m/15m/1h/4h); 6 research methods (EMA CROSS, Bollinger, DCA, Hold50, Hold100, Cash); cash/BTC inventory accounting and cost counterfactual; results/profile vault and comparisons persisted locally. No independent native Freqtrade/Hummingbot adapter in the V2 program.
- V2 release: https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-strategy-lab-v2-aether-observatory-2026-11-13
- ZIP: `SEVEN_HEAVEN_STRATEGY_LAB_V2_AETHER_OBSERVATORY_PREMIUM_PYTHON313_WINDOWS_PORTABLE_PAPER.zip` SHA256 **`39d9a7ef89c2f89ec519f11d1f206400e54f169b8a0799fa751ff00ee9240c13`**.
- User states that V2 ZIP was **extracted into the V1 directory**. This is correct **IF** its files replaced their peers **inside** `E:\seven_heaven_strategy_lab` and old `workspace/` was not deleted. Still **PENDING OWNER VERIFICATION**: server restarted, page actually shows **BUILD 2.0.0**, existing 44,640 bars, old profiles/reports and new comparison. Do not claim screenshots of the Administrator are screenshots of local V2.
- Before replacing code, save `workspace/` separately, stop the Python server, then unpack V2 over program files without deleting `workspace/`. Watch for accidental nested folder `seven_heaven_strategy_lab\seven_heaven_strategy_lab` and the browser caching old tabs.
- Official V2 delivery handoff: `coordination/inter_ai_dialogues/agent_crypto/SEVEN_HEAVEN_STRATEGY_LAB_V2_AETHER_OBSERVATORY_PREMIUM_PYTHON_WINDOWS_USB_RELEASE_AND_NEXT_PHASES_2026_11_13.md`.

## 2. Professional bot engine direction — complementary, not merged blindly

### Hummingbot: market-making / grid / exchange connectivity
- Official client/docs: https://hummingbot.org/docs/ and https://hummingbot.org/installation/hummingbot-client/
- Python framework with **CEX connectors**, scripts, controller/executor architecture, order management, market making, grids, and optional Gateway for **DEX** platforms. Native standalone Hummingbot is not included in the local V2.
- Current official quickstart documents Hummingbot client via **Docker/WSL2 on Windows**, and `hbot` CLI (introduced in 2.16.0). It includes `binance_paper_trade` in the beginner **simple_pmm script**: real public data, fictitious executions, no Binance keys. **Important:** the official docs caution that **V2 controllers currently do not support paper-trade connectors**; do not promise that every controller can run with paper_trade.
- The correct first bridge is to run an **isolated verified native Hummingbot PAPER reference** and normalize its data/results schema, starting with simple PMM and Spot Grid/Strike only after exchange size, tick, lot, wallet and inventory constraints. Label exact runtime digest, fees and fill model.

### Freqtrade: directional strategies, backtesting, dry-run, optimization, AI
- Official docs: https://docs.freqtrade.io/en/stable/installation/ ; https://docs.freqtrade.io/en/stable/utils/ ; https://docs.freqtrade.io/en/stable/freqai/
- Python strategy/bot ecosystem, historical backtesting, dry-run, hyperoptimization, FreqUI and optional FreqAI. The model/optimizer is not guaranteed to earn money. FreqAI needs **additional heavyweight dependencies**; never package them by default onto an 8 GB drive.
- Official Windows installation recommendation is **Docker or WSL2** for the Freqtrade engine. This does **not** make Docker mandatory to run our independent Strategy Lab Python 3.13 UI; engines are optional sidecars, with their own installation constraints.
- Freqtrade `webserver` / FreqUI for backtest management is marked **experimental** by its docs, not a substitute for our custom UI. Freqtrade has exchange-public metadata dependencies and may make network requests in backtesting. Previous isolated Freqtrade experiments on a research branch are **not certified native parity results**. No evidence of successful adapter/real Freqtrade backtesting in the released V2.
- Build a **separate native Freqtrade research adapter** with source bars hash, strategy logic/indicator warmup, fee assumptions, no leakage, exact engine version/digest, and documented model differences (stake, full fills, cache, exchange metadata and stoploss/ROI). Never attribute internal PAPER returns to Freqtrade.

### Agreed architecture contract
- **Seven Heaven UI** is permanent owner-facing home (Firefox, local Python, USB). Engine adapters are isolated **optional processes** (not Python imports that require installing all dependencies into host ComfyUI or Bridge).
- Adapters communicate by a versioned local **research-only contract**, not shared mutable exchange credentials:
  - `source_id`, `exchange`, `pair`, `market_type`, `timeframe`, UTC `first`/`last`, `sha256`, gaps and freshness.
  - `engine_name`, exact `version`, `image_digest` or git commit, `strategy_id`, config hash and seed if stochastic.
  - `capital`, fee fraction per side, slippage, maker/taker designation, size/tick/min order rules, execution model.
  - `equity`, cash, inventory, unrealized PnL, realized PnL, fees, turnover, drawdown, event log, rejected orders and error/status; all outputs clearly `PAPER`.
  - Difference statements: native Hummingbot/ Freqtrade portfolio accounting and fills may diverge from internal simulator.
- `adapter_status = NOT_INSTALLED | AVAILABLE | VALIDATED | FAILED | UNVERIFIED`; never label a simulated comparison `VERIFIED` without a native engine run on authenticated shared history.

## 3. USB architecture and space policy — plan, not a measured disk report

**Real free space and filesystem type are NOT known**; never claim that the current 8 GB USB has a specific free amount. On an 8 GB manufacturer-labeled drive, effective formatted capacity is typically below 8 GiB. The 32 GB drive is preferable when two engines, FreqAI and multiple months/assets are involved.

Recommended storage policy (planned; not implemented as an automatic quota in V2):

| Storage target | Reserve for owner's personal files | Strategy Lab storage policy | Decision |
|---|---:|---|---|
| Existing 8 GB USB | **at least 3 GB free** if available | Keep V2 Python program, a small number of SHA-checked historical months, saved profiles/reports. Reject or warn before a bulk import would cross reserve | Good for V1/V2; not promise room for native bot images / ML |
| 32 GB USB later | **at least 8 GB free** if possible | Keep research datasets, reports and more strategy code; store only curated engine packages; audit free space before every new large source download | Recommended for V3/V4; 32 GB is not a guarantee Docker images + AI models fit |
| Host PC `C:` / installed software | Separate from USB | Docker Desktop / WSL2 runtime, if eventually chosen, can use substantial **PC** storage. Mount the USB research workspace into containers only if explicitly configured, and avoid importing creator private files | Optional, never assumed installed |

**Volume estimates are planning envelopes, NOT measured program requirements:** V2 ZIP is 45,104 bytes (~44 KiB). The verified January 1m dataset and saved run JSONs are much larger; 1000s of fills across repeated experiments grow the journal. External Python wheels, FreqAI ML deps and Docker/WSL layers can consume several GB. Reserve and alert based on **actual free bytes** (proposed: `shutil.disk_usage(workspace)`); don't preallocate fixed capacity or download duplicate ZIPs into `workspace` and `src`.

### Proposed layout (do NOT auto-create private copy folders in GitHub)

```text
E:\seven_heaven_strategy_lab\
  START_SEVEN_HEAVEN_STRATEGY_LAB_PYTHON_WINDOWS.cmd
  README_FR.md
  src/                     # local Python PAPER engine; no exchange keys
  web/                     # ERITH-inspired cockpit; no CDN or account data
  tests/
  workspace/               # user data: BACK UP before upgrading
    datasets/              # public SHA-validated data
    results/               # immutable per-experiment reports
    comparisons/
    profiles/
    research_manifests/    # planned V3 provenance and quota registry
    strategy_library/      # planned V4 user-defined strategies
  optional_adapters/       # PLANNED; do not pretend included in V2
    hummingbot/
    freqtrade/
```

User's Aerith profiles and seven private archives should remain **in separate folders on their USB**, outside the public application, outside the web server's root, and outside any automatic data uploads. A portable USB copy is **not** a backup; keep another copy on another physical device.

**If a filesystem is FAT32**: individual files are capped at 4 GiB even if free space is larger; large model/archive planning should consider exFAT/NTFS subject to user's backup/format decision. **Never format a USB drive or change its partition without explicit owner instruction and verified backup.** No instruction to disable Windows security features.

## 4. Release train A → B → C → D (progress must be evidence-based)

### A / V1 — COMPLETE, owner's Windows/USB observed
- Single local Python launch, PAPER, immutable source, results/profiles, six basic strategies, no account or trade API.

### B / V2 — BUILT, CI VERIFIED, USB upgrade extracted, owner final UI check pending
- Premium cockpit, six-strategy comparison, five timeframes, cost counterfactual, V1 data compatibility and SVG equity chart.
- Final acceptance: confirm V2 badge, archive persistence and an on-device PAPER comparison; never require full re-download if already cached.

### C1 / V3 — CONNECTED DATA OBSERVATORY (NEXT BUILD, NOT YET DELIVERED)
- Select authenticated **exchange+pair+Spot market+month/date range+timeframe**.
- Providers: first public **OKX Spot** (prefer BTC-USDC/ETH-USDC for the owner's market), additional **Binance Spot** as independent source, then Bitget/Kraken only after contract tests. Restrict query sizes, source provider pagination, rate-limit, timeouts, retries, exact UTC and endpoint terms.
- Public-only connections: HTTP market metadata, historical candles, orderbook snapshots. Data provenance `requested_at`/`exchange_timestamp`/`closed_bar`/`hash`/`gap_count`/`market_type`. Visible `FRESH` / `DELAYED` / `STALE` classifications; never conflate historical OHLCV and a live L2 book.
- Local cache, resumable imports, dedupe, SHA-256 manifests, per-provider unit and end-to-end fixtures, free-disk/quota guard; no auto-poll unless user intentionally enables it. Include a `sources` dashboard with error messages that human users can act upon.
- V3 acceptance: public actual exchange API sample retrieved from GitHub Actions and Windows Firefox, multiple days with reproducible hash+coverage, invalid/gapped data rejected, no exposure of keys, no reimport loops, disk-reserve alert demonstrated.
- No future PnL claims merely from obtaining data.

### C2 / V4 — NATIVE BOT ENGINE BRIDGES (not V2)
- Add optional Freqtrade native backtest **first**, then Hummingbot PAPER / Spot Grid / PMM with native connectors. No mandatory all-in-one Python dependencies.
- Verify exact same historical period and pair, strategy rule parity, indicator warmup, fees, slippage, wallet, partial/unfilled rules, lookahead leakage and exchange instrument rules. Distinguish native results from local original model.
- Runtime selection and per-engine capability matrix: CEX/DEX support, dry-run support, paper connector support, backtesting, optimizer, API permissions and network needs. A connector being listed does not mean it is supported in the user's OKX EEA jurisdiction or specific account.
- User-selectable mode **historical backtest** or **public-data PAPER** only in these milestones. Separate future discussion/approval and robust controls before any real-money feature.
- No automatic Docker Desktop installation or Python environment mutation.

### D / V5 — BOT DESIGNER + AI EXPERIMENTS (not V2)
- User-designed rules (validated safe declarative JSON builder), strategy library with provenance, batch sensitivity, predefined parameter sets, optimizer with **walk-forward / untouched out-of-sample** checks.
- Portfolio inventory, max drawdown, total fees, minimum notional and spread stress, multi-regime comparisons, stress tests and experiment notebooks, exportable readable Markdown & machine JSON.
- Optional FreqAI experiments later with dependency and disk budget audit. Document limitations: model overfitting, survivorship bias, exchange shifts, latency, slippage and maker fill probabilities.
- Optional future connection to Operator Yoann/Trader through an explicitly versioned *read-only* comparison contract, only after Yoann authorizes any access to his private TRADUS.

### Later: V6+ — only after owner feedback
- Professional reports, multi-market paper portfolio, scenario replay and automated regression audit; optional local agent-assisted strategy review. Not a promise of guaranteed profitable bots or real execution.

## 5. Safety and professional acceptance gates for every future release

- **Research mode defaults:** `paper_only=true`, `live_orders=0`, no account keys, API endpoint `/api/trade` absent; no silent escalation from simulation into orders.
- **Economic truth:** source venue and instrument explicit (BTC-USDT Binance ≠ BTC-USDC OKX); user's Spot taker observed **0.10%**, maker **0.08%** as of shared screenshot, application per fill type; simulated slippage independent; never translate comma decimal `0,10` to internal fraction `0.10` instead of `0.001`.
- **Data truth:** UTC, provenance+SHA, market type, complete closed bars, no 1m/4h lookahead, gaps and vendor rate limiting. Current V2 only 44,640 Binance Jan 2026 1m bars, aggregated in memory.
- **Portfolio truth:** cash cannot go below zero, no negative Spot inventory, full unrealized BTC marked to close, sufficient quote balance, fees cumulative and funding rules documented.
- **Testing truth:** Python unit tests, HTTP real local probe, Windows `py -3.13` launcher, Chromium UI interactions, Firefox user acceptance, optional Docker adapter smoke, JSON export/replay and SHA. Document **tested versus pending**, keep V1/V2 ZIP releases and hashes; do not label a new release successful before CI/actual release asset verification.
- **Licenses:** Freqtrade GPL-3.0; Hummingbot Apache-2.0. Keep third-party adapters/source license-separated, avoid copying GPL source into the independent proprietary-looking UI without appropriate license compliance. Existing third-party source archives remain in GitHub Releases; do not duplicate big archives in git.
- **Security & private assets:** only public market APIs without credentials; localhost web server no external bind; preserve strict CSP, input validation, and no direct browser execution of arbitrary strategy Python. Private Aerith archives/docs on USB are not public app assets.
- **User control:** do not ask them again about Python 3.13, Docker installation, fee defaults, USB capacity or V1 screenshots; provide **one next action** when local acceptance is needed. Avoid complex jargon without a plain explanation.

## 6. Handoff for next sister IA — exact first actions

1. Read the current [V2 GitHub release](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-strategy-lab-v2-aether-observatory-2026-11-13), `seven_heaven_strategy_lab/README_FR.md`, V2 delivered report, and **this document**. Read linked Notion Strategy Lab master page if available; do not pretend previous source files were read if not fetched.
2. Confirm whether owner has actually **restarted** V2 on `E:\seven_heaven_strategy_lab` (ZIP extracted into V1, without deleting `workspace`), and shown **BUILD 2.0.0**. If unknown, state unknown, do not invent acceptance. The current user message shows Administrator screenshots, not V2 dashboard.
3. Next development work: implement **C1/V3 public OKX historical+live market data loader** as a separate source adapter with local cache, provenance, rate-limit, integrity checks and disk-reserve policy. Build unit tests and online smoke on actual public APIs, then publish a distinct release tag. Do not block on Docker.
4. Only later integrate actual **Freqtrade** native backtest and **Hummingbot** paper connectors. Previous Freqtrade branch experiments demonstrated exchange metadata/network pitfalls; they are NOT completed independent validation.
5. After each deliverable: GitHub PR or commit with evidence, shared inter-AI document, Notion page updated with real status and next blocker, versioned user ZIP, SHA256, README and explicit nonregression vs V1/V2.

**Outcome:** Architecture approved as a direction; exact disk targets and V3→V5 implementations are proposals, not deployed features. User wants a genuinely professional bot research laboratory capable of expanding to CEX/DEX strategies and eventually using real native bot engines, while preserving clarity, local portability, the USB reserve and complete release history.
