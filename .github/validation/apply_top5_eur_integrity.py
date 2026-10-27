#!/usr/bin/env python3
"""Top 5 EUR - preserve EUR source truth, allow a verified EUR backup if Binance fails."""
from pathlib import Path
import subprocess
file=Path("public/agent_crypto_erith_ia/administrator/app.js")
actual=subprocess.check_output(["git","hash-object",str(file)],text=True).strip()
assert actual=="1fb5ebfb21bbffa93bff1e64c78d90043d612035",actual
s=file.read_text(encoding="utf-8")
start=s.index('  if (Number(period || 1) === 1 && preset === "rank-5") {')
end=s.index('\n  const storedBinance =',start)
old=s[start:end]
assert old.count('      if (storedTruth?.series?.length) {')==1
block=old.replace('  if (Number(period || 1) === 1 && preset === "rank-5") {',
'''  if (Number(period || 1) === 1 && preset === "rank-5"
      && String(globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()?.displayCurrency || "EUR").toUpperCase() === "EUR") {''')
block=block.replace('      if (storedTruth?.series?.length) {',
'      if (storedTruth?.series?.length && atlasHistoricalDisplayQuote(storedTruth)?.currency === "EUR") {')
last=block.index('      return {\n        coin,\n        result: {\n          series: [],')
assert block[last:].count('source: "binance-eur-direct-24h-truth-failed"')==1
finish=block.index('\n    }\n  }',last)
replacement='''      // Preserve the five selected assets. Switch providers only, never currencies.
      let backupFailure = "";
      try {
        await atlasRespectComparisonRequestSpacing(signal, period);
        const backup = await fetchCoinGeckoChartDirect(coin, period, {
          signal, timeoutMs: ATLAS_COMPARISON_DIRECT_TIMEOUT_MS
        });
        if (atlasHistoricalDisplayQuote(backup)?.currency !== "EUR")
          throw new Error("CoinGecko historique non certifie EUR");
        atlasStoreChartResult(coin, period, backup, "coingecko");
        return { coin, result: backup, attempts: 2, source: "coingecko-eur-direct-after-binance" };
      } catch (fallbackError) {
        if (atlasComparisonAbortError(fallbackError)) throw fallbackError;
        backupFailure = String(fallbackError?.message || fallbackError || "indisponible");
      }
      const preservedEur = atlasGetStoredChartResult(coin, period, "coingecko");
      if (preservedEur?.series?.length && atlasHistoricalDisplayQuote(preservedEur)?.currency === "EUR") {
        return {
          coin, result: {
            ...preservedEur,
            sourceMode: "browser-cache",
            refreshWarning: "Binance et CoinGecko directs indisponibles - historique EUR conserve",
            technicalReason: backupFailure
          },
          attempts: 2, source: "coingecko-eur-verified-cache"
        };
      }
      return {
        coin,
        result: {
          series: [], blocked: true,
          sourceFamily: "binance",
          sourceMode: "binance-direct-klines",
          reason: "Top 5 EUR 24h : aucune serie EUR certifiee disponible",
          technicalReason: "Binance : " + String(error?.message || error || "inconnue")
            + " / CoinGecko : " + backupFailure
        },
        attempts: 2, source: "eur-source-unavailable"
      };'''
block=block[:last]+replacement+block[finish:]
s=s[:start]+block+s[end:]
file.write_text(s,encoding="utf-8",newline="\n")
print("app.js Top5 EUR staged; source blob="+subprocess.check_output(["git","hash-object",str(file)],text=True).strip())
