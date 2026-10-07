# 40.6.621 — Canonical Asset Identity

Terrain 40.6.620 exposed three simultaneous identities for one selected asset: Ligne = M, Bougies = BTC-USDC, Profondeur = MEMECORE/USDC.

Root cause: after 40.6.620 repaired the shared pair owner and Backend 1.4.6, Candles, Depth and Market Instrument Resolver still kept private 2–16 character asset validators.

40.6.621 routes all three through `okx-market-pair-resolver.js::normalizeAsset()`.

Invariant: selected Market coin → canonical symbol → Ligne = Bougies = Profondeur = Market Resolver.

For MemeCore: `M → M-USDC / M-USDT`, never BTC and never MEMECORE-*.

No new local installation. Keep Aether Control 2.3.2R19, Bridge 1.9.13, and the already patched Private Backend 1.4.6 from 40.6.620.

Market Core 38.15.11, candle mathematics, Depth rendering/freshness, Lecture Technique, Oracle, Math Core and Strategy are unchanged.

Terrain Firefox: PENDING Christophe.
