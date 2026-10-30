# Agent-Crypto · Révision Trader R9-2 (runtime 40.6.624)
Date: 2026-10-08
Commit parent: 1931526ebf5eee2e86eeb4c098f7d87bf58c77fd

Strict Trader/Administrator single-runtime build contract preserved at 40.6.624. New release is a narrowly scoped R9 context patch, not a forged global build version.

- Verified Binance Spot R9 USDT OHLCV unchanged, SHA-256 and selection guards preserved.
- OKB has no Binance archive. Separate CoinGecko USD table mirrors up to 12 points already in the active native chart broker. It is labelled HORS R9, non-live, with its own native chart timeframe and dates, and never creates a second chart or fetch.
- Native mirror accepts only matching asset, ready broker, explicitly USD series and CoinGecko provenance; otherwise reports absence. Stale chart owners are rejected.
- Updated OKB case-study diagnosis to Firefox BTC/OKB validation from 08 October 2026. Administrator business runtime otherwise unchanged.
- No new API request, network owner, backend, bridge modification, recurring timer, orders or trading.
- GitHub CI contract retained: original literal 'Jamais de substitution BTC' is preserved. Original stable mirror script path and BUILD 40.6.624 retained.
- Firefox operator acceptance of new context section and BTC R9 still pending; distinguish CI pass from terrain.
