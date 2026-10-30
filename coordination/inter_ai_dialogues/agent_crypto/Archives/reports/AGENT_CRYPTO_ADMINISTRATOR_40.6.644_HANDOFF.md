# Agent-Crypto Administrator 40.6.644 — Market vs historical truth

Main production owner. Parent: 40.6.643 at a81e780189ef15153b0782c13b6b2eaf9d086758. User Firefox is the only operational acceptance gate.

## Fixed
- Hausses 5 / Baisses 5: Market Snapshot ranks remain unchanged; chart explicitly shows frozen Market 24h metric **MKT** and actual historical EUR curve variation **HIST** for every active asset. Captured Market timestamp and oldest history timestamp are shown, with one compact mismatch count. They may legitimately differ: never rewrite the curve to match a quote.
- Market microscope: CoinGecko OHLC 24h has real 30m candles; control now highlights actual loaded **30m** instead of obsolete requested **1h**.
- CoinGecko browser OHLC is labeled as such; no false local-backend attribution.

## Unchanged
No Market Core, Bridge, orders, synthetic 5/5, or OHLC volumes. No historical prices invented. Existing Top 250 comparison and cache path retained.

## Test by owner
EUR > 24h > Market Top 250 > Hausses 5: 5 real series when available; read MKT/HIST separately. Select STRCX > Microscope > Bougies: when CoinGecko OHLC fallback is used, **30m** must be selected and provider display must be CoinGecko public. Other intervals on OKX remain independent. This is a Firefox test, not a claim of verified success.

Rollback exactly to a81e780189ef15153b0782c13b6b2eaf9d086758 if needed (by reverting delivery commits). ZIP and SHA-256 delivered under coordination/inter_ai_dialogues/agent_crypto/.
