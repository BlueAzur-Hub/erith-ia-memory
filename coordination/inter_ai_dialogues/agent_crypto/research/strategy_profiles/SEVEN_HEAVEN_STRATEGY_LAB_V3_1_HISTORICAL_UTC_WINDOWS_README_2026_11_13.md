# Seven Heaven Strategy Lab — V3.1 Historical UTC Windows (candidate patch)

**Status:** local V3.1 candidate patch prepared 2026-11-13. Not yet an official GitHub Release or owner Firefox validation. No native Freqtrade/Hummingbot engine and no live trading.

## Objective

Collect on demand, without an account, one historical period of 240 closed hourly Spot candles (10 UTC days) ending at a chosen UTC date while retaining the V3 default recent-10-day collection.

A field named **Fin de période historique — UTC (optionnel)** is added to the connected Observatory. Empty = original V3 recent period. Date YYYY-MM-DD = the previous 10 full UTC days ending at 00:00 UTC on that date. Example end 2026-11-03 means 2026-10-24 00:00 UTC through 2026-11-02 23:00 UTC, subject to public OKX availability.

The same OKX Spot history-candles endpoint is queried using a historic after cursor, bounded to six pages of at most 100 rows. Missing, incomplete or invalid candles mean **REFUSE**, never fabricate or interpolate. Four V3 Spot pairs, CSV source SHA-256, 2.5 GB free-space reserve, six PAPER strategies and no real order remain unchanged.

Each window gets a distinct V3-compatible source ID (OKX_BTC_USDC_1H_<end_timestamp>) and independent SHA-256 manifest. The patch does not read, write or migrate workspace/; existing archives, profiles, and journals remain.

## Candidate ZIP

[SEVEN_HEAVEN_STRATEGY_LAB_V3_1_HISTORICAL_UTC_WINDOW_COLLECTOR_SAFE_WINDOWS_PATCH_2026_11_13.zip](./SEVEN_HEAVEN_STRATEGY_LAB_V3_1_HISTORICAL_UTC_WINDOW_COLLECTOR_SAFE_WINDOWS_PATCH_2026_11_13.zip)

ZIP bytes: 7,145. SHA-256: 2d30dde00c5c7c56d59d8cd3ba5b9c6fd0fd41ba9308b868b4f0475b399b6930.

Contents:
- UPGRADE_SEVEN_HEAVEN_STRATEGY_LAB_V3_TO_V3_1.py
- INSTALL_SEVEN_HEAVEN_STRATEGY_LAB_V3_1_WINDOWS.cmd
- README_SEVEN_HEAVEN_STRATEGY_LAB_V3_1_HISTORICAL_UTC_WINDOWS.md (full original French instructions)

## Installation candidate — owner's Windows USB, NOT yet tested

1. Stop Python server V3 with Ctrl+C. Back up E:/seven_heaven_strategy_lab/workspace/ onto a separate device.
2. Unzip the three files directly into E:/seven_heaven_strategy_lab/, alongside src, web, workspace. Do not unpack into workspace.
3. Run INSTALL_SEVEN_HEAVEN_STRATEGY_LAB_V3_1_WINDOWS.cmd. If REFUS SANS MODIFICATION appears, stop. The program strictly compares four source Git blob fingerprints and refuses changes if mismatched.
4. On success, a backup_seven_heaven_strategy_lab_before_v3_1/ directory preserves original V3 files. Restart normal Python launcher, inspect BUILD 3.1.0, and test recent OKX mode with date empty.
5. Choose a historical UTC date, collect a source if available, compare six PAPER strategies at 1h with consistent capital, fees and slippage.

The patch refuses to apply while localhost:8777 is accepting connections. It checks source hashes and textual anchors before writing, performs atomic writes, and restores files after a write failure when possible. This is a candidate, not proof of live compatibility.

## Tests and limitations

Six local targeted Python unittest cases passed: success and workspace preservation, mismatched source refusal, missing anchor refusal, UTC date/cursor logic, future/invalid date rejection, repeated-backup refusal. Tests operate on **synthetic isolated V3-like files**, not on the owner's exact installed binary.

NOT tested: the owner's V3 actual files / V3.1 integration / real historical OKX API responses / Firefox 3.1 / Windows GitHub CI. Do not present V3 CI success as V3.1 CI evidence.

Current OKX tick/lot/min size metadata does not prove retrospective execution; fills remain hypothetical next-bar-open PAPER estimates with fixed fee/slippage. This patch supports multiple chosen 10-day windows, **not** a continuous six-month archive.

**Modified application paths on successful installation:** src/okx_public.py, src/server.py, web/app.js, web/index.html. **Protected:** workspace/, Administrator, Operator, Trader, TRADUS and Bridge.
