# AGENT-CRYPTO — Administrator 40.6.713 candidate

**Scope:** scanner snapshot readback and upload via authenticated optional Bridge. No bridge or backend binaries changed.

## Changes
- Bearer token required for /scanner-latest and /scanner-snapshot using the existing Aether Trust session. No new secrets, automatic login, or polling timers.
- When no valid authenticated local owner session exists, requests are not sent; local snapshots remain queued.
- HTTP 401 invalidates the attempted session; HTTP 403 suspends the collector until reauthentication. The Bridge security policy is unchanged.
- Correct snapshot selection prefers newest dated EUR observation, refuses mismatched coin IDs and rejects stale spot observations (>15 minutes).
- Canonical Top 5 BTC/ETH/BNB/XRP/SOL, 5/5 atomic scanner and EUR/USD isolation preserved.

## Verified locally
- Node.js --check app.js: passed.
- Nine targeted mocked transport/identity tests: 9/9 passed.
- Administrator 40.6.712 atomic/dedup and canonical Top 5 regression checks (updated metadata expectations): passed.
- SHA hashes verified for changed source files.

## Open
- Browser field verification with R25 Bridge: not run from this environment.
- GitHub Actions may contain separate legacy failures; do not treat targeted tests as full end-to-end validation.

**Release gate:** candidate branch only, do not merge before Firefox/Windows validation.