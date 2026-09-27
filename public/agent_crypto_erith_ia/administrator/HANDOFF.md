# Handoff Seven — 40.6.435 · OKX Backend Route Truth

Build 40.6.435. Parent 40.6.434. Market Core 38.15.11.

Terrain .434 : montage PASS, lisibilité PASS, Kraken PASS, OKX direct navigateur FAIL par deux timeouts.
Le dump courant prouve séparément Source Truth CEX : OKX 5/5 via le backend local 127.0.0.1:8790.

.435 utilise donc le propriétaire existant /quotes?assets=BTC pour OKX.
Mesuré : bid, ask, spread.
Non revendiqué : profondeur multi-niveaux et slippage 10/25/50/100 EUR.

Geste opérateur : Ctrl+F5 > 40.6.435 > Simulation / Strategy A > Execution Cost Truth > MESURER KRAKEN + OKX > EXPORTER.

Si .435 PASS, extension Backend V1.4.3 orderbook read-only à traiter séparément pour profondeur + slippage réels.
