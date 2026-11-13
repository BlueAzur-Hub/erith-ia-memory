# Seven Heaven Strategy Lab — Windows Python 3.13 double-click launcher delivery

**Date:** 2026-11-13. **Owner:** Christophe. **Location:** shared `coordination/inter_ai_dialogues/agent_crypto/` documentation; source in `seven_heaven_strategy_lab/`.  

## User machine evidence

The user submitted a screenshot of Windows PowerShell output for `py -0p` showing:
- Python **3.13** installed, marked as default, under the user's normal Windows Python programs folder.
- Python **3.8** also installed as a separate older interpreter.

**Consequence:** do NOT ask this user again whether Python is installed; do NOT require Docker Desktop to try the current standalone lab. Explicitly select `py -3.13` so the old Bridge Python and separately embedded ComfyUI Python are untouched. The image demonstrates the environment, not that the new ZIP has already run on the user's actual PC.

## Implemented, tested, merged, released

- [PR #755](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/755) merged on main at commit `3a7fd91b08e528061c06b18ab6e2b77f720e5de3`.
- New exact launcher: `seven_heaven_strategy_lab/START_SEVEN_HEAVEN_STRATEGY_LAB_PYTHON_WINDOWS.cmd`.
- It changes to its own extracted folder, ensures `py -3.13` is present, creates a persistent local `workspace/`, forces `127.0.0.1:8777`, launches `py -3.13 -m src.server`, and keeps a command window open to control the server. No `pip install`, Docker, external bot or account credentials required.
- `src/server.py` opens the user's **default browser only after binding the loopback server** when the launcher explicitly sets `SEVEN_LAB_OPEN_BROWSER=1`. If the default browser is not Firefox, paste `http://127.0.0.1:8777` into Firefox. For Windows CI `SEVEN_LAB_OPEN_BROWSER=0` suppresses GUI opening.
- `README_FR.md` now prioritizes the actual Windows Python 3.13 route and leaves Docker as a clearly optional alternative.
- The GitHub Actions workflow adds a **real windows-latest Python 3.13 job**, executing the **actual CMD launcher**, HTTP `/api/health`, the local French homepage, dataset API and all PAPER unit tests.
- **All tests PASS:** https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43374109870 . The Linux/Python PAPER history tests, Docker alternative tests and the actual refreshed ZIP release step also PASS. No claim of an on-device Windows Firefox visual acceptance yet.

## Final refreshed standalone ZIP

Shared GitHub Release (source-controlled application, not embedded in MASTER/Operator):
https://github.com/BlueAzur-Hub/erith-ia-memory/releases/tag/seven-heaven-strategy-lab-portable-paper-initial-2026-11-13

Direct ZIP:
https://github.com/BlueAzur-Hub/erith-ia-memory/releases/download/seven-heaven-strategy-lab-portable-paper-initial-2026-11-13/SEVEN_HEAVEN_STRATEGY_LAB_PORTABLE_PAPER_RESEARCH_FOR_CHRISTOPHE.zip

- ZIP size: **29,072 bytes**.
- ZIP SHA-256: `66deb6ecd6c5156d6335c782e5ac6d7c1c5334ebb725befe7ec7f78a35a019aa` (GitHub Release asset metadata verified after publication).
- Independent checksum file and actual six-strategy PAPER evidence JSON uploaded to the same Release.
- The prior ZIP was superseded; its former SHA is no longer current. Always use this refreshed asset's digest.

## The one action for user

1. Download and extract the new ZIP into a folder (PC or SSD); do not execute inside the compressed ZIP.
2. Open `seven_heaven_strategy_lab`.
3. **Double-click `START_SEVEN_HEAVEN_STRATEGY_LAB_PYTHON_WINDOWS.cmd`**, not `START_SEVEN_HEAVEN_STRATEGY_LAB_WINDOWS.cmd` (that older launcher is Docker-specific).
4. It opens a browser at `http://127.0.0.1:8777`. The laboratory needs Internet only if the user **clicks** to fetch the historical immutable public Binance archive. No OKX/Bridge credentials or real trading.
5. Close the Python command window to stop the server. Saved profiles/reports are in the extracted folder's `workspace/`.

## Evidence boundaries

- **Windows CI validation PASS** on a GitHub-hosted Windows runner, **not** yet observed on the user's ASUS Windows/Firefox installation.
- **No actual Freqtrade/Hummingbot adapter in v0.1**; uses the independent source-labelled PAPER model, immutable historical data and explicit hypothetical assumptions.
- No change to `public/agent_crypto_erith_ia/administrator`, `agent-crypto-operator`, private TRADUS or Bridge, no orders, and no new external software installation required for the user's first test.

**Instruction to successor agents:** the next request is to help the user take **one practical step at a time** with the new Python double-click launcher, not ask for already verified Python versions or insist on installing Docker.
