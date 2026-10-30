#!/usr/bin/env python3
"""One-shot, SHA-guarded patch from released 40.6.709 to tested 40.6.710."""
from pathlib import Path
import hashlib
A=Path("public/agent_crypto_erith_ia/administrator/app.js")
B=Path("public/agent_crypto_erith_ia/administrator/build.json")
I=Path("public/agent_crypto_erith_ia/administrator/index.html")
V=Path("public/agent_crypto_erith_ia/tools")
def sha(p):
    b=p.read_bytes()
    return hashlib.sha1(f"blob {len(b)}\0".encode()+b).hexdigest()
def one(p,old,new):
    t=p.read_text(encoding="utf8")
    if t.count(old)!=1:
        raise RuntimeError(f"unexpected occurrence count for {p}: {t.count(old)}")
    p.write_text(t.replace(old,new,1),encoding="utf8")
def all_replacements(p,old,new,count):
    t=p.read_text(encoding="utf8")
    if t.count(old)!=count:raise RuntimeError(f"unexpected version count for {p}: {t.count(old)}")
    p.write_text(t.replace(old,new),encoding="utf8")
prior={
 A:"4c69c3b2d2da16e1c94c6a69807543c4e79b621a",
 B:"bfdb97736bed04f1d015e7b9954187414c244c3d",
 I:"ea881d2811232650a1cbf87a1bf269144fea8951",
 V/"verify_administrator_annual_usd_integrity.cjs":"bfd57d6a45bd6c2f15e46a997dc98eb36812087d",
 V/"verify_administrator_canonical_top5_integrity.cjs":"d9becaf4ef80788f4cd3baa8ec027dab68901b63",
 V/"verify_administrator_top5_restore.cjs":"9b28e82dc441c717bb7b86ed060193706e28ef54"}
for p,h in prior.items():
    if sha(p)!=h:raise RuntimeError(f"ABORT: {p} diverged from verified 40.6.709; no overwrites")
helper=r'''// Annual native USD requests only: retry known transient failures, never an
// integrity rejection or an unclassified HTTP 4xx. The shared comparison
// retry policy is intentionally untouched for the other chart modes.
function atlasAnnualUsdRetryableError(error) {
  if (!error || atlasComparisonAbortError(error)) return false;
  const reason = String(error.message || error || "");
  const stated = Number(error.status || 0);
  const parsed = reason.match(/\bHTTP\s*(\d{3})\b/i);
  const status = stated || (parsed ? Number(parsed[1]) : 0);
  if (status) return [408, 425, 429].includes(status) || status >= 500;
  return error.name === "TimeoutError"
    || /timeout|timed out|d[eé]lai|network|failed to fetch|load failed|ECONNRESET|ETIMEDOUT/i.test(reason);
}

'''
one(A,"function atlasAnnualUsdFailureLabel(result) {",helper+"function atlasAnnualUsdFailureLabel(result) {")
one(A,'''      failureLabel = atlasAnnualUsdFailureLabel({technicalReason: String(error?.message || error)});
      if (!atlasComparisonRetryableError(error)) break;''','''      failureLabel = atlasAnnualUsdFailureLabel({technicalReason:
        error?.status ? __BT__HTTP __DOL__{error.status} · __DOL__{String(error?.message || error)}__BT__ : String(error?.message || error)});
      if (!atlasAnnualUsdRetryableError(error)) break;'''.replace("__BT__",chr(96)).replace("__DOL__",chr(36)))
one(A,'''    viewLabel: comparison || atlasChartV2EffectiveView() === "base100" ? "BASE 100" : "PRIX EUR",''','''    // Preserve the currency actually displayed, not the newly requested one.
    viewLabel: comparison || atlasChartV2EffectiveView() === "base100" ? "BASE 100"
      : (atlasHistoricalDisplayQuote(chart.result).currency
          ? __BT__PRIX __DOL__{atlasHistoricalDisplayQuote(chart.result).currency}__BT__
          : "PRIX · DEVISE NON CERTIFIÉE"),'''.replace("__BT__",chr(96)).replace("__DOL__",chr(36)))
all_replacements(I,"40.6.709","40.6.710",14)
all_replacements(B,"40.6.709","40.6.710",3)
one(B,"ANNUAL TOP FIVE USD: NATIVE COINGECKO CACHE FIRST, SERIAL FETCH, BOUNDED RETRY, EXPLICIT SOURCE FAILURE — CANDIDATE","ANNUAL USD RETRY CORRECTNESS AND RETAINED HISTORICAL CURRENCY LABEL — CANDIDATE")
one(B,'"parent_build": "40.6.708"','"parent_build": "40.6.709"')
T=V/"verify_administrator_annual_usd_integrity.cjs"
one(T,'const nativeFunctions=["atlasAnnualUsdHistoryCandidate","atlasAnnualUsdFailureLabel","atlasFetchCanonicalAnnualUsdHistory"];','const nativeFunctions=["atlasAnnualUsdHistoryCandidate","atlasAnnualUsdRetryableError","atlasAnnualUsdFailureLabel","atlasFetchCanonicalAnnualUsdHistory"];')
addon='''  // A bare HTTP 403 embedded in a provider message is NOT transient.
  {
    const x=context({network:[new Error("HTTP 403 Forbidden"), history("USD",0.1)]});
    const r=await x.ctx.atlasFetchCanonicalAnnualUsdHistory(coin,365);
    assert.equal(r.result.blocked,true);assert.equal(x.traces.network,1);
    assert.equal(r.result.technicalReason,"HTTP 403");
  }
  // Integrity failures must never trigger another provider request.
  {
    const x=context({network:[history("EUR",0.1),history("USD",0.1)]});
    const r=await x.ctx.atlasFetchCanonicalAnnualUsdHistory(coin,365);
    assert.equal(r.result.blocked,true);assert.equal(x.traces.network,1);
    assert.match(r.result.technicalReason,/intégrité historique/);
  }
  // Test the REAL overlay capture function, including preserved USD/EUR.
  {
    const overlay=take("atlasChartOverlayCaptureReady");
    for (const quote of ["USD","EUR",null]) {
      const sandbox={state:{dataBroker:{comparison:{preset:"solo"}},chartPeriodDays:1},
        atlasChartOverlayLastReady:null,
        atlasChartV2EffectiveView:()=>"price",atlasChartV2EffectiveScale:()=>"linear",
        atlasHistoricalDisplayQuote:()=>({currency:quote}),
        atlasChartOverlayModeLabelFor:()=>"SOLO"};
      vm.createContext(sandbox);vm.runInContext(overlay,sandbox);
      const r=sandbox.atlasChartOverlayCaptureReady({status:"ready",coinId:"bitcoin",period:1,result:{currency:quote}});
      assert.equal(r.viewLabel,quote?__BT__PRIX __DOL__{quote}__BT__:"PRIX · DEVISE NON CERTIFIÉE");
    }
  }
'''.replace("__BT__",chr(96)).replace("__DOL__",chr(36))
one(T,'  assert.match(app,/canonicalPresetRequest === "rank-5" && requestedCurrency === "USD" && period === 365/);',addon+'  assert.match(app,/canonicalPresetRequest === "rank-5" && requestedCurrency === "USD" && period === 365/);')
one(T,'assert.equal(metadata.build,"40.6.709")','assert.equal(metadata.build,"40.6.710")')
one(T,'PASS: annual USD Top5 cache-first, native-only, 429 bounded retry, delayed USD fallback, forbidden EUR/USDT, abort guards, unchanged atomic criteria','PASS: annual USD Top5 cache-first, native-only, bounded retries, 403/integrity no retry, preserved USD/EUR labels, delayed cache and atomic guards')
one(V/"verify_administrator_canonical_top5_integrity.cjs",'assert.equal(build.build,"40.6.709")','assert.equal(build.build,"40.6.710")')
# The existing native USD module contains a storage-key wrapper protected by a
# Top5 canonical-history guard. Verify the guard instead of banning all wrappers.
one(V/"verify_administrator_canonical_top5_integrity.cjs",r'if (usd !== null) assert.doesNotMatch(usd,/wrap\("atlasChartStorageKey"/);',r'if (usd !== null) assert.match(usd,/wrap\("atlasChartStorageKey",o=>function\(c,d,f\)\{return usd\(\)&&!canonicalTop5History\(d\)/);')
one(V/"verify_administrator_top5_restore.cjs","const ATLAS_RELEASE='Build 40.6.709'","const ATLAS_RELEASE='Build 40.6.710'")
expected={
 A:"13744cd712fc2787335169449a06946e87a80318",
 B:"06c1afa27a7f111d94c3ccfd15d6a53b6dcf901c",
 I:"c42c9c1c9c339896baa845df628c0c1679ee2750",
 T:"c9091f3823131d7cd12ab6b75fe731b8e233a9dc",
 V/"verify_administrator_canonical_top5_integrity.cjs":"f6c70da1f55931615a530a483e57fa17068120fb",
 V/"verify_administrator_top5_restore.cjs":"f6e89c37848898d36e180c8736bdf3e1f5b0247a"}
for p,h in expected.items():
    if sha(p)!=h:raise RuntimeError(f"FAILED EXACT OUTPUT: {p} got {sha(p)} expected {h}")
print("EXACT PASS: six files byte-identical to tested 40.6.710.")
