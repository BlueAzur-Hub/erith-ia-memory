# Agent-Crypto — Seven EUR rotating archive and Firefox preview handoff

Date: 2026-10-29 (Europe/Paris)  
Scope: isolated draft PR #703 / Administrator 40.6.640 / Market Core 38.15.11  
Owner: Seven Heaven session (assistant), user visual acceptance pending

## Ground truth from operator screenshots (2026-10-29, 01:50–01:53 local)

- Administrator public, Market Top 100, 24h EUR, Hausses 5: **5/5 native direct histories**; PEPE / PEARL / KAS / LEO / PUMP.
- Administrator public, Market Top 100, 24h EUR, Baisses 5: **5/5 native direct histories**; VVV / RAIN / LIT / M / XDC.
- Market price cards show observed CoinGecko snapshots approximately **51–52 minutes old**; do not claim these are live prices.
- Market 24h changes and computed historical 24h changes may differ because their observation windows differ.
- These screenshots concern public `main`, not an acceptance test of this PR's new archive integration.

## Delivered on isolated PR #703 (no merge)

Branch: `test/seven-scanner-server-browser-20261028`  
Preview code commit: `af24af9f907c399953336f0ce517619b9687c2cd`  
Preview: https://raw.githack.com/BlueAzur-Hub/erith-ia-memory/af24af9f907c399953336f0ce517619b9687c2cd/public/agent_crypto_erith_ia/administrator/index.html?view=intermediate  
Pull request: https://github.com/BlueAzur-Hub/erith-ia-memory/pull/703

### Actual code changes

- Browser archive consumer now accepts an archive originally collected under a different Market Frame **only when exact requested IDs, native EUR, signed SHA-256 manifest/records and current full 24-hour coverage are all verified**. The active frame is returned separately from archive provenance.
- Server acquisition manifest preserves cryptographically verified older asset entries when a subsequent Market selection rotates to new coins. Previously collected assets are not automatically promoted to fresh.
- Tests cover cross-frame reuse, missing source provenance, previous cohort retention, and tampered/mismatched retained archives.
- Isolated Firefox preview loads the read-only archive reader via `index.html`; it does **not yet override comparison charts**.

### CI evidence for preview commit

- Seven scanner rolling EUR evidence contract: **53 tests passed, 0 failed**.
  https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/40797850473
- Seven scanner Firefox combined preview: **39 passed, 0 failed**.
  https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/40797850604
- Other repository workflows on the same PR are not all green; notably Top5 USD and Trader checks failed. No claim of global CI acceptance, no production merge.
- No interactive Firefox session was executed by the assistant. Browser availability of raw.githack was not independently confirmed.

## Remaining integration gate

1. Create a durable automatically refreshed, quota-bounded publisher for the native EUR archive (no fabricated prices).
2. Attach the verified reader to the browser comparison pipeline behind a disabled-by-default opt-in, with fallback to currently working direct histories.
3. Verify **EUR Hausses 5 → EUR Baisses 5 → USD** on a fresh browser snapshot; only then consider production rollout.

## Safety and rollback

- Production `main` unmodified, Trader/Bridge/real orders untouched.
- Public 40.6.640 remains the known available baseline.
- Do not hardcode tokens, force 5/5 for incomplete source data, or merge draft PR automatically.
- Delivery is a real, testable branch and pinned browser preview; **not** a full production fix.
