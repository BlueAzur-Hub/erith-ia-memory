# AGENT-CRYPTO — CURRENT HANDOFF (authoritative continuity record)

Updated: 2026-10-29 (Europe/Paris). Scope: public Administrator and Hausses 5 chart; not a claim of financial verification.

## Canonical resources
- Published/main repository: https://github.com/BlueAzur-Hub/erith-ia-memory/tree/main/public/agent_crypto_erith_ia/administrator
- Firefox/public Administrator: https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/administrator/
- Inter-AI shared folder: https://github.com/BlueAzur-Hub/erith-ia-memory/tree/main/coordination/inter_ai_dialogues/agent_crypto
- Notion bureau: https://app.notion.com/p/AETHER-AGENT-CRYPTO-INTERFACE-3e07754fe08481eb95c7cdc4fd8ff099
- Read current build.json on main every time; build *at writing*: 40.6.645, Market Core 38.15.11.
- Versioned ZIP and checksum in this shared directory: AGENT_CRYPTO_ADMINISTRATOR_40.6.645_MARKET_HISTORY_TRUTH_OHLC_6_FILES.zip (+ .sha256). The 40.6.645 code delivery commit was e20524d9915f95e7e97379e84ddb11b64678ae4d; later automated commits can advance main.

## User's Firefox evidence (NOT YET RESOLVED)
- The user selects EUR, 24h, Market Top 250, and Hausses 5. Sometimes the **first click displays 4/5 histories**, with one of the five Market-selected coins (previously STRCX) missing.
- After clicking Vider and/or Réinitialiser, then Hausses 5 again, **5/5 sometimes appears**. The number of series thus depends on interaction sequence/cache state. A 5/5 status on a repeat click is NOT an acceptance test for the first-click defect.
- The 40.6.645 update removed a redundant 23h30 *common* overlap gate among separately validated 24h histories. This is a technical change; it **has not proved the first-click workflow correct**.
- The user supplied Firefox Solo 24h EUR screenshots of APEPE, PEARL, PEPE, GOMINING, KNTQ. Visually large discontinuities/spikes appear in some series. Source samples and timestamps have not been independently compared point-by-point. NEVER claim that a spike is real or fabricated from screenshot alone.
- Market percent (MKT, ranking) and historical curve percent (HIST, computed on native EUR samples) can differ because of different clocks and currency context. They must be visibly distinct, timed, and sourced. They must not silently be made equal.
- The 40.6.644 screenshot showed genuine 4/5, originally misleadingly titled 4/4. 40.6.645 now uses target 5, but remains NOT user-validated.
- The graph background displays vertical marks/bars whose precise provenance must be checked: do NOT present inferred/synthetic bars as verified trading volume. Real OHLC candles require actual OHLC source data, never synthesized from line chart ticks.

## Operational acceptance definition
A. The SAME five active Market Top 250 EUR (24h gainers) IDs and ranking are frozen for a scanner transaction, with a documented Market snapshot timestamp.
B. On the first clean click, request each of the 5 by exact identity, use the correct EUR historical source, inspect cache/source freshness, cover the intended window, and plot each genuine timestamp without invented/interpolated points. A true missing history is reported as **4/5 and reason per asset**; the UI must not replace with another ranked coin or mask absence.
C. Compare raw histories to authoritative source responses; inspect precision/denomination and timestamp alignment. Investigate large jumps rather than smooth or hide them. Distinguish line histories from real native OHLCV.
D. Repeatable Firefox workflow on USER's Windows PC/Bridge: first click, subsequent click, Vider/Reset, EUR/USD separation, Solo/group transition. User is sole Firefox operational verifier. Do not declare full success from CI or a hosted preview.
E. Preserve current functioning version until a correction is demonstrably better; rollback with prior main code commit if needed.

## Mandatory delivery workflow
- Assistant handles inspection/development/test. Temporary branches and PRs are allowed but must be closed/cleaned when superseded; do not accumulate abandoned experiments.
- Assistant publishes revised app files to **main** itself (if GitHub write connector works), archives the appropriately named ZIP plus SHA-256 in this shared GitHub folder, and reports the English commit SHA, changed files, tests, target build and rollback.
- User **does not upload** files/choose branches; user alone validates in Firefox on their real PC and shares observations.
- Avoid long speculative reports, repeated questions answered in the record, promises of work later, empty progress, and unverified claims. One actionable step at a time.
- GitHub main is the production owner. Notion is project memory. This document is the compact new-chat handoff, not a substitute for reading actual current code.

## Immediate next technical work
Investigate and correct first-click 4/5 vs post-reset 5/5 in scanner transaction, stale caches, cancellation, network request budget, asynchronous selection, and chart state. Audit raw CoinGecko EUR sample timelines / extreme movements and chart bars before saying graphs are financially reliable. Do NOT patch per-symbol. Identify generic root and publish a regression covering first vs second attempt and cache invalidation. No extra Firefox test demanded until a concrete revised build has been delivered.

## Continuity instruction for the next AI
Read this file and current build.json/main code, review latest screenshot findings, and state what is verified vs hypothetical. Do not manufacture a version number or pretend a new version exists until published.
