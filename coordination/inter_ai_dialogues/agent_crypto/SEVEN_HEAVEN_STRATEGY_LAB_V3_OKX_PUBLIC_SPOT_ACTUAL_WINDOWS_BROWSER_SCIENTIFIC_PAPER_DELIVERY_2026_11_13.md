# SEVEN HEAVEN STRATEGY LAB — V3 Connected OKX Spot actual delivery and independent research handoff

**Date:** 2026-11-13. **Status:** FINAL V3 RELEASE VERIFIED; owner Windows/Firefox V3 USB acceptance still pending.  
**Canonical location:** `coordination/inter_ai_dialogues/agent_crypto/`.  
**Master architecture:** `SEVEN_HEAVEN_STRATEGY_LAB_MASTER_ARCHITECTURE_PROFESSIONAL_BOTS_USB_STORAGE_VERSIONED_ROADMAP_2026_11_13.md`.  
**Notion coordination page:** https://app.notion.com/p/4177754fe08481b0ac48e2dc00eaed72

## 1. Verified owner validation of V2 — now CLOSED, do not ask again

The user supplied screenshots and pasted the actual local program run from `http://127.0.0.1:8777/` and `E:\seven_heaven_strategy_lab` (8 GB USB) showing:
- **BUILD 2.0.0**, local connected, PAPER only, exact premium navy/gold/cyan cockpit.
- Previous 44,640 verified Binance BTC/USDT January 2026 1m bars persisted, results and saved journal carried forward from V1.
- Actual six-model V2 comparison executed in Firefox with visible original EMA cost counterfactual and local history.
- Existing user archive/profile saved on `workspace/` retained. User reported V2 ZIP extracted *into* the V1 directory successfully, not a nested launch failure.
**Hence A/V1 and B/V2 USB acceptance validated**, not merely CI.

## 2. V3 release contents and verified exact source files

- Development **PR #757** https://github.com/BlueAzur-Hub/erith-ia-memory/pull/757 merged at commit `4b9e82c084cac515e829641aedf47c464dd44f81`.
- Strict JSON proof correction **PR #758** https://github.com/BlueAzur-Hub/erith-ia-memory/pull/758 merged at commit `c996f0737ada5cae9efddda2475216182ff07451`.
- **FINAL PUBLIC RELEASE** https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-strategy-lab-v3-public-okx-spot-research-2026-11-13
- Final complete Windows USB ZIP: `SEVEN_HEAVEN_STRATEGY_LAB_V3_OKX_SPOT_CONNECTED_OBSERVATORY_PYTHON313_WINDOWS_PAPER.zip`.
- Size **55,987 bytes**; final SHA256 **`6c7560ff22e3e9db27d2cb15f6c360173b68e81efd0155f41a2dea1ac9993fdb`**. Verified GitHub Release digest and exact ZIP contents against checksum.
- Final end-to-end GitHub Action **https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43386693211**: all jobs PASS: **37 tests Python**, actual public OKX API fetch, Python 3.13 on real Windows runner using actual .cmd launcher, HTTP local source API, genuine Chromium browser click-to-fetch and six-way PAPER replay, mobile/desktop screenshots, Docker smoke and all strict-parse JSON proof validations.
- Final standalone JSON actual OKX source and six-case proof:
  https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-v3-public-okx-spot-research-2026-11-13/SEVEN_HEAVEN_STRATEGY_LAB_V3_OKX_BTCUSDC_240_HOURLY_6_PAPER_CASES.json
- FINAL proof JSON SHA256 **`6282b73d651ac9c639619662b6f8352196f9f9d3ec3f810cfd917a14bb016129`** and final PNG screenshots in same release. The final ZIP's proof artifacts were downloaded and independently parsed/verified with Python in the conversation container. **All 3 JSON evidence files are now STRICT JSON valid with a real final newline.**
- The initial publication of two evidence JSONs inadvertently ended with literal `\\n` characters. **Do not use the original first-uploaded V3 asset copies**; PR #758 and final merged-main Actions 43386693211 corrected both writers and validated JSON syntax before the refreshed assets were published. App source code and actual PAPER simulation accounting were not faulty.

## 3. V3 feature contract — implemented, NOT merely planned

- Local Windows/Python 3.13 UI stays at `http://127.0.0.1:8777` and stores data under the USB folder `workspace/`.
- Premium cockpit now has **Observatoire connecté OKX Spot** with supported public instruments **BTC-USDC, ETH-USDC, BTC-USDT, ETH-USDT** in the **allowlist**. The native public API online smoke *actually tested BTC-USDC*; the other three are configured and mocked in tests, not independently proven by a real online response.
- Public endpoints only: `GET /api/v5/public/instruments` for current instrument metadata, and `GET /api/v5/market/history-candles` for completed public 1H candles. No account API, credentials, login or order endpoints.
- **240 consecutive confirmed 1H candles** (10 x 24 hours) ending at the last completed 4H UTC boundary. All `confirm=0` or incomplete/gapped/non-finite OHLCV data is **REFUSED**, not interpolated. Bounded pagination 6 requests maximum, 100 per page, timeout and payload caps.
- Immutable local `workspace/okx_sources/<id>.csv` and corresponding `<id>.json` manifest with source SHA-256, pair, UTC range, collection timestamp, base/quote, current `tickSz`/`lotSz`/`minSz`. Those instrument rules are **observational**, **not enforced by internal hypothetical fills**.
- Newly downloaded public market data is forbidden if **less than 2.5 GB free** on the USB. Previously cached verified datasets remain readable under this limit. No actual free bytes on the owner's USB were supplied, so free-space compliance on his E: drive must be checked by the app itself. His available 32 GB USB is a future option; no forced migration, formatting or private archives copied.
- Source selector preserves the frozen Binance V1/V2 dataset, profiles, comparisons and journal; new OKX datasets allow 1H directly and 4H aggregated from 1H (60 confirmed 4H bars). No false 1m interpolation. Selecting a different market clears old displayed results, avoiding stale attribution.
- Correct symbol/quote units in V3 UI and new JSON aliases: **BTC/ETH**, **USDC/USDT**. Legacy result key names remain for V1/V2 file schema compatibility.
- Six strategies in original internal Python PAPER engine: EMA, Bollinger, DCA, Hold50, Hold100, Cash; fair same-source/timeframe/capital/cost matching. No native Freqtrade/Hummingbot engine in V3.
- No private account, no order router, no leverage, localhost-only request Origin/Host validation and strict CSP.

## 4. ACTUAL OKX BTC/USDC 10-day scientific PAPER comparison — recorded proof

**Market:** public OKX Spot BTC/USDC. **Window:** 2026-11-03 04:00 UTC through 2026-11-13 04:00 UTC (last complete 4H boundary, 240 x 1H bars).  
**Source normalized CSV SHA256:** `d52d0dd251bf102e18c917d87f0ad5aacc7b04df378420a8824e5cc29c9f13d9`.  
**Capital:** 1,000 fictitious USDC; observed user OKX taker **0.10%** each side, assumed slippage **0.05%** each side. PAPER engine internal fills assumed fully executed next-candle open. No L2 historical book/partial-fill model. Current instrument rules are not retrospective historical proof.

| Internal strategy | Return | Final marked capital (USDC) | Hypothetical fills |
|---|---:|---:|---:|
| EMA crossover 10/30 (1H) | −2.50681% | 974.931917 | 6 |
| Bollinger (1H) | −6.61613% | 933.838747 | 7 |
| DCA scheduled (1H) | −4.58076% | 954.192351 | 10 |
| Buy & Hold 50% BTC | −5.21931% | 947.806866 | 1 |
| Buy & Hold 100% BTC | −10.43863% | 895.613651 | 1 |
| Keep cash USDC | 0% | 1000.000000 | 0 |

These are historical modeled results over **one selected ten-day window**, not a strategy optimization, not profitable trading advice, not actual OKX transactions, not Freqtrade/Hummingbot native execution, and do not imply forward returns. The 4H source replay capability was tested; the above six metrics specifically refer to **1H**.

## 5. Existing user installation — protect the USB data

User has already validated **V2** on the 8 GB USB. To install **V3** when they choose:
1. Stop the Python server (Ctrl+C) **before replacing any program files**.
2. **Back up `E:\seven_heaven_strategy_lab\workspace\` separately** first (previous profiles/datasets/results); don't remove or overwrite this private data folder.
3. Extract full V3 ZIP and copy **its inner `seven_heaven_strategy_lab` contents** over the old application files in **the same directory**. Avoid nesting duplicate folders.
4. Launch `START_SEVEN_HEAVEN_STRATEGY_LAB_PYTHON_WINDOWS.cmd` (Python 3.13; no Docker required) and confirm **BUILD 3.0.0**, old Binance archive verified, local result journal persists.
5. Select **BTC/USDC** in V3 OKX source panel and click **Collecter 240 bougies 1h OKX**, wait for validated source, then select **1h**, press **Comparer les 6 méthodes**. If USB reserve/network/gaps prevent import, retain V2 data and report the actual error; no improvisation.
6. User's **Firefox V3 acceptance remains pending** until a screenshot of BUILD 3.0.0 and native OKX import or comparison is supplied.

## 6. Roadmap continuation for the next sister IA, with no repetitive questioning

- Read this file, V3 `README_FR.md`, the canonical master document and new Notion current status. Do not ask again about Python 3.13, USB 8/32 GB, OS, fee decimal comma, previous V2 run, or naming.
- **V3.1**: multiple historical OKX dates, periods, provider pagination/data license verification, possibly more timeframe choices; keep SHA provenance, time alignment and reserves. Any live current book needs separate `FRESH` snapshot rules; never imply an L2 snapshot applies retrospectively.
- **V4**: actual native Freqtrade backtesting adapter with identical source, period, strategy, warmup and commission assumptions; then Hummingbot Grid/PMM under tested Spot wallet/inventory, independent external environment and source-labeled normalized JSON contracts. Distinguish native external algorithm PnL from internal PAPER.
- **V5**: user-defined strategies with safe declarative rule builder, optimization/walk-forward and AI research capabilities, provenance/versioned notebooks, no guaranteed profits.
- Provide a separate versioned release, hash, ZIP, readme, evidence CI/Windows/browser per milestone; update Notion AND this shared directory.
- Private Yoann TRADUS not available in this local repo; Administrator and Operator UI untouched. Private Creator Memory/Aerith profiles and seven private GitHub archives are explicitly reserved for the user's USB, never copied to public GitHub.
