# RESTORE — Backend 1.4.6 R2 validated checkpoint

Date: 2026-10-07

## Operator baseline

Restore exactly:

- Trader / Administrator: **40.6.621**
- Private Backend: **1.4.6 · Market Instrument Resolver**
- Bridge: **1.9.13**
- Market Core: **38.15.11**

Canonical Backend package:

`coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_BACKEND_1_4_6_MARKET_RESOLVER_R2_SINGLE_CHAR.zip`

Package SHA-256:

`6473f8bc3af0c7571e84b36b14bb34c3fa572ad7bc6ddc96140d76e59d90d42a`

Validated `private_backend.py` SHA-256:

`990134125c77dd7ba774d0225a00edb89f1668ec200c416fb7b8d72960ed158f`

## Terrain evidence

Validated before Binance-book experiment:

- `M → Bitget → M-USDT` : candles + fresh book PASS.
- `XAUT → OKX → XAUT-USDT` : candles + fresh book PASS.
- `OKB → OKX → OKB-USDC` : candles + fresh book PASS.

## Quarantine

Backend **1.4.7** and **1.4.7 R2** are **NOT DEPLOYABLE** on the operator machine.

Terrain failure:

- self-test PASS;
- process exits with status 1;
- `/health` never becomes ready;
- repeated failure after Control Center relaunch.

Binance public orderbook work may continue only off-production until the candidate passes:
1. Windows startup;
2. `/health`;
3. immediate stop/restart;
4. M / Bitget regression;
5. XAUT / OKX regression;
6. Binance-resolved candles + book.

Do not modify Bridge 1.9.13 or Trader 40.6.621 for this restore.
