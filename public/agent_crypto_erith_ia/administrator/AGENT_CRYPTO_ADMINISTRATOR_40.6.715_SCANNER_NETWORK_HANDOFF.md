# Administrator 40.6.715 — Scanner CoinGecko network ownership

## Status
Candidate branch only. Firefox Ryzen verification pending. Do not publish or merge until the operator validates the 5-of-5 histories.

## Scope and parent
- Parent: Administrator 40.6.714; Market Core 38.15.11.
- Bridge R27 / V1.9.21, Backend V1.4.6 and Ollama are untouched.
- Changes in `app.js` apply to the common five-asset scanner used by Hausses 5, Baisses 5 and Volumes 5.
- The native USD CoinGecko path now attempts a single HTTP request per transaction attempt. The outer transaction owns the optional retry budget (five selected assets plus up to two transient second chances).
- Scanner concurrency is one at a time for CoinGecko public history, regardless of USD/EUR. It preserves existing request spacing.
- No substitution, interpolation, fabricated history, silent 2/5 commit or change to the EUR acquisition algorithm.
- The previous graph remains visible if exactly five validated series cannot be obtained.

## Why
Administrator 40.6.714 allowed up to seven transaction attempts while the USD helper separately retried every request twice. Thus the visible 7/7 count did not describe actual CoinGecko HTTP attempts. This candidate removes stacked retries for native USD and prevents simultaneous scanner requests competing against the same public rate budget.

## Known limitations
- A missing, rate-limited, inaccessible or short-coverage CoinGecko series can still cause an explicit 4/5 or 2/5 failure. No public market source can guarantee success.
- Market ranking snapshot time and historical comparison window time remain different and must be read separately.
- Other background refresh owners and storage saturation require separate profiling before further changes.
- This candidate is NOT a repair for the Bridge's `/summary` or `/conclusion` endpoints.

## Validation sequence on Firefox / Ryzen
1. Preserve the original 40.6.714 and the existing local history. Do not clear localStorage or IndexedDB.
2. Use the published branch candidate or deploy in a controlled preview. Confirm the displayed build reads 40.6.715.
3. Top 5 USD 24h: exactly BTC, ETH, BNB, XRP, SOL; 5 valid series, no stablecoins, provenance and timestamps visible.
4. Hausses 5 USD 24h: exact five ranked coins; first click cold and warm; no more than one active CoinGecko scanner request; clear 5/5 or clear failure without replacing coins.
5. Repeat for Baisses 5 and Volumes 5, then EUR and back to USD.
6. Test missing history, timeout and HTTP 429, ensuring the previous graph is preserved and the error states the missing symbols.
7. Keep the Bridge R27 unchanged and check that the renderer stays responsive while the network work is pending.
8. Mark as verified only after the operator's Firefox observations are attached.

## Safety and delivery
This branch is not the live GitHub Pages deployment. A commit is not proof of successful operation on Windows. No order permissions, paper trading state or strategy code changed.
