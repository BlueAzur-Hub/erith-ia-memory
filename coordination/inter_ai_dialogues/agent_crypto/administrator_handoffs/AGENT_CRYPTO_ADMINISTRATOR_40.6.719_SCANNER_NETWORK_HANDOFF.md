# Administrator 40.6.719 — Hausses 5 network and caches

## Starting point and browser evidence
40.6.718: validated recovery of 2.93 MiB localStorage, IndexedDB PRIMARY stable.
Top 5 BTC/ETH/BNB/XRP/SOL 5/5. Hausses 5 BEAM/B/CAP/OP/GLM 1/5 after four CoinGecko NetworkErrors, Coinbase GLM-USD rejected for a real 24h gap.
Previously cached five histories are not always still fresh for the frozen comparison clock.

## Small and bounded correction
- One provider-level request spacing inside app.js for CoinGecko public API. All calls through existing chart and public Market transport share the gate (not external, unknown code paths).
- 429 response cools this provider for 45s, 5xx 15s, opaque network failure 12s. No hidden retry loop added.
- Scanner no longer requeues accepted and aligned cached histories simply because another asset is missing. Refresh only missing or genuinely misaligned IDs, never substitute lower-ranked coins.
- Show Market snapshot age if over 30 minutes in the failure details.
- Keep native USD-only identity, real historical candles, exact five Market IDs, 24h window/cadence and 5/5 commit rule.

## Validation
Git blob source locks, git apply check, JavaScript syntax and isolated gate/cooldown checks pass.
This prevents duplicate requests and reduces CoinGecko request bursts. It does not establish that CoinGecko public endpoints will answer in the operator's Firefox or guarantee 5/5 after provider refusal. The official public rate can vary and Coinbase may have genuine missing candles.
No Bridge, Market Core, storage-maintenance logic, IndexedDB, vault, or trade operation changed.
FIRST-CLICK FIREFOX ACCEPTANCE: pending operator.
