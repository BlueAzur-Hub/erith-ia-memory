#!/usr/bin/env python3
"""Protect the historical quote at the Top 3 EUR acquisition boundary only."""
from pathlib import Path
import subprocess
file=Path("public/agent_crypto_erith_ia/administrator/app.js")
blob=subprocess.check_output(["git","hash-object",str(file)],text=True).strip()
assert blob=="88118759a8ce7eff1bae4944edd9973681e16444",f"Unexpected source app.js: {blob}"
s=file.read_text(encoding="utf-8")
patches=[
(
'  const preset = String(state.dataBroker?.comparison?.preset || "");\n  if (Number(period || 1) === 1 && preset === "rank-5") {',
'''  const preset = String(state.dataBroker?.comparison?.preset || "");
  // Top 3 EUR: the history must be EUR at source, independently of UI labels.
  // Reject USD/USDT caches or transport responses rather than treating them as euros.
  // Other modes retain their existing acquisition routes unchanged.
  const top3Eur = preset === "rank-3"
    && String(globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()?.displayCurrency || "EUR").toUpperCase() === "EUR";
  const quoteMatchesTop3 = result => !top3Eur || atlasHistoricalDisplayQuote(result)?.currency === "EUR";
  if (Number(period || 1) === 1 && preset === "rank-5") {'''
),
(
'  const freshStored = storedCandidates.find(result => !atlasChartNeedsRefresh(result, period));',
'  const freshStored = storedCandidates.find(result => quoteMatchesTop3(result) && !atlasChartNeedsRefresh(result, period));'
),
(
'      const result = await atlasFetchBridgeHistory(coin, period, {\n        signal,\n        timeoutMs: 7_000\n      });\n      const family = String(result?.bridgeHistory?.provider || "").toLowerCase() === "binance"',
'      const result = await atlasFetchBridgeHistory(coin, period, {\n        signal,\n        timeoutMs: 7_000\n      });\n      if (!quoteMatchesTop3(result)) throw new Error("Top 3 EUR : devise historique Bridge non certifiée EUR");\n      const family = String(result?.bridgeHistory?.provider || "").toLowerCase() === "binance"'
),
(
'    const result = await fetchBinanceChartDirectDynamic(coin, period, {\n      signal,\n      timeoutMs: ATLAS_COMPARISON_DIRECT_TIMEOUT_MS\n    });\n    atlasStoreChartResult(coin, period, result, "binance");',
'    const result = await fetchBinanceChartDirectDynamic(coin, period, {\n      signal,\n      timeoutMs: ATLAS_COMPARISON_DIRECT_TIMEOUT_MS\n    });\n    if (!quoteMatchesTop3(result)) throw new Error("Top 3 EUR : devise historique Binance non certifiée EUR");\n    atlasStoreChartResult(coin, period, result, "binance");'
),
(
'      const result = await fetchCoinGeckoChartDirect(coin, period, {\n        signal,\n        timeoutMs: ATLAS_COMPARISON_DIRECT_TIMEOUT_MS\n      });\n      atlasStoreChartResult(coin, period, result, "coingecko");',
'      const result = await fetchCoinGeckoChartDirect(coin, period, {\n        signal,\n        timeoutMs: ATLAS_COMPARISON_DIRECT_TIMEOUT_MS\n      });\n      if (!quoteMatchesTop3(result)) throw new Error("Top 3 EUR : devise historique CoinGecko non certifiée EUR");\n      atlasStoreChartResult(coin, period, result, "coingecko");'
),
(
'  const stored = storedCandidates[0] || null;\n  if (stored) {\n    const family = atlasChartResultSourceFamily(stored);',
'  const stored = storedCandidates.find(quoteMatchesTop3) || null;\n  if (stored) {\n    const family = atlasChartResultSourceFamily(stored);'
)
]
for a,b in patches:
    occur=s.count(a)
    assert occur==1,(a[:90],occur)
    s=s.replace(a,b,1)
file.write_text(s,encoding="utf-8",newline="\n")
print("Top3-EUR patch changed only:",file)
print("git blob:",subprocess.check_output(["git","hash-object",str(file)],text=True).strip())
