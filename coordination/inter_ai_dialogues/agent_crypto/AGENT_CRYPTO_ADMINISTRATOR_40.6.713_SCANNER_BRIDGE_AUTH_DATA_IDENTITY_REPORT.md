# Agent-Crypto Administrator 40.6.713 — production delivery

Date: 2026-10-30
Delivery rule: tested source on main, ZIP and SHA256 in coordination/inter_ai_dialogues/agent_crypto, user validates Firefox afterward.

Source: candidate/administrator-40.6.713, preserving subsequent main historical DOGE archive commit.
Release: scanner Bridge authentication + strict snapshot identity and freshness.
GET /scanner-latest requires scanner.read Bearer token; POST /scanner-snapshot requires scanner.write Bearer token.
No scanner network operation without local owner session. Local pending snapshots preserved on 401/403.
Reject wrong coin_id/currency, reject stale spot observation, prefer newer observation.
Do not alter Market Core 38.15.11, public 5/5 charts, EUR/USD separation, Backend 8790 or OKX order permissions.

Tests prior to release: node --check app.js; 10/10 targeted scanner transport tests; existing 40.6.712 atomic/dedup, Top 5 integrity and 40.6.711 network regression checks. GitHub Actions release packaging repeats these.
Not certified: real Firefox/Windows R25 test, real HTTP 401 recurrence or 5-series load timing; Windows 10053 backend disconnection remains separate.
