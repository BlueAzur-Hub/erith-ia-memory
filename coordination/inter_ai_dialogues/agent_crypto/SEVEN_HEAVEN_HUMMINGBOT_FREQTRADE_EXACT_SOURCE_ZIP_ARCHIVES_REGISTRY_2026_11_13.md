# Seven Heaven — Exact Hummingbot and Freqtrade ZIP source archives

**Date:** 2026-11-13 UTC  
**Purpose:** Shared, durable software source inventory for Aerith-7/Aerith-8/Aerith-9 and other agent-crypto research collaborators; future Operator Yoann / Trader / TRADUS analysis.

## 1. Storage and provenance

The user uploaded two source ZIPs in the conversation. Their byte lengths and SHA-256 digests were independently calculated from the actual attachments, then **the identical binaries** were downloaded from the official upstream GitHub branch archives and validated by GitHub Actions, **before** publishing to the ERITH.IA repository's GitHub Releases.

**Our immutable shared release:**
https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-external-bot-source-archives-2026-11-13

| Artifact | Bytes | SHA-256 calculated from user-supplied upload | Upstream repo/branch | License |
|---|---:|---|---|---|
| `hummingbot-master.zip` | 3,990,773 | `6ceef7884b54ac7b3e2f156411249f58f78a079e2f9b6b6717aabc81f4ea6cfd` | `hummingbot/hummingbot` / `master` | Apache-2.0 |
| `freqtrade-develop.zip` | 20,667,167 | `6143b75fa418362c5de00388faaaff008900a2f778e77a73b31361423e25a453` | `freqtrade/freqtrade` / `develop` | GPL-3.0 |

**Direct, source-identical shared binary links:**
- [Hummingbot source ZIP](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-external-bot-source-archives-2026-11-13/hummingbot-master.zip)
- [Freqtrade source ZIP](https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-external-bot-source-archives-2026-11-13/freqtrade-develop.zip)

**Actual GitHub Actions evidence:** [run 43368429425](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43368429425), with download, exact expected byte-count and SHA-256 checks, valid ZIP structure, path-safety checks and full Apache/GPL license texts. All checks passed and **both release assets were uploaded successfully**. The published GitHub release API reports the same asset size and digest for each archive.

At research time, the official branch HEADs observed through the GitHub API were `hummingbot/hummingbot@9af100d6822da7d2d0291a906c730ef172284ee2` (`master`) and `freqtrade/freqtrade@5197bedab82559fac6be6c1539c64b94368fb91c` (`develop`). These are **observed branch pointers** and are not a replacement for the canonical actual ZIP digest. For reproducibility, verify the ZIP SHA256.

The source ZIPs are placed in **GitHub Releases**, not committed as 24.7 MB of duplicated third-party source in our application history. This registry is the durable navigation entry under the exact shared coordination directory requested by the user. The publication workflow is at `.github/workflows/seven-heaven-preserve-upstream-bot-source-zips.yml`.

## 2. File inspection performed on the uploaded originals

- `hummingbot-master.zip` contains **2,199 entries**, about **17,350,204 bytes uncompressed**.
- `freqtrade-develop.zip` contains **880 entries**, about **36,378,100 bytes uncompressed**.
- No absolute / parent traversal member paths; no encrypted entries. These checks are **not a malware certification**. Do not automatically execute untrusted archived code on a user's computer.
- Both ZIPs contain their complete root `LICENSE`, and the published archives are byte-identical.
- The Freqtrade upload identifies `__version__ = "2026.11-dev"` in `freqtrade/__init__.py`, i.e. a **development branch snapshot**, not a release certificate.

## 3. Code locations to study (source inspection; NOT performance findings)

**Hummingbot:**
- `controllers/generic/grid_strike.py`; `multi_grid_strike.py`
- `controllers/market_making/pmm_simple.py`; `pmm_dynamic.py`
- `controllers/generic/stat_arb.py`; `hedge_asset.py`; `xemm_multiple_levels.py`
- `hummingbot/strategy_v2/backtesting/backtesting_data_provider.py`
- `hummingbot/strategy_v2/backtesting/executors_simulator/grid_executor_simulator.py`

**Freqtrade:**
- `freqtrade/optimize/backtesting.py`
- `freqtrade/optimize/hyperopt/hyperopt.py`
- `tests/optimize/test_lookahead_analysis.py`
- `tests/optimize/test_recursive_analysis.py`
- `freqtrade/strategy/strategy_helper.py`

## 4. Legal / security / deployment boundaries

- Preserve original attribution, notices and licenses. Freqtrade GPL-3.0 has source-distribution/derivative obligations if integrated into distributed software; Apache-2.0 has notice/license conditions. Do **not** paste source blindly into the MASTER/Operator implementation.
- Source ZIP **is not a runnable binary**, nor an installed bot, nor proof that any proposed strategy is profitable.
- Our prior true Hummingbot execution used a separately pinned official container digest, with frozen historical candles and Docker network disabled. The user's source archives are to be preserved and studied, not silently substituted for that runtime.
- No OKX keys, API tokens, account profiles, user's personal/private memory, live orders or private TRADUS files are included.
- Two repositories remain distinct application runtimes: MASTER Administrator/Trader and Operator Yoann/Trader. The research ZIPs are shared evidence, **not** a new deployed application build.

## 5. Next scientific work

1. Keep existing audited Hummingbot January 2026 true engine import and hypothetical GridExecutor evidence as baseline; do not claim portfolio-equivalent profits.
2. Validate Spot inventory, lot/minimum order rules, cash budgeting and actual maker/taker fee treatment before external-engine parity.
3. Evaluate Freqtrade EMA/Bollinger, trend, mean-reversion and risk controls on common frozen windows, with lookahead and recursive diagnostics and independent untouched tests.
4. Store any future **new** research code and report JSON under `coordination/inter_ai_dialogues/agent_crypto/research/external_bots/`, not the 24.7MB upstream archives.
5. Expose validated reports to Interface/Trader/Operator/TRADUS as read-only research assets; no auto-trading deployment by default.

**User preference confirmed by this workflow:** no repeatedly requesting screenshots or fee inputs already canonized; clearly separate real execution evidence from interpretation.
