#!/usr/bin/env python3
"""One-shot, anchor-checked, fail-closed patch to Administrator 40.6.713.

Only adds 24h history/spot comparability evidence; no new fetch, timer,
trading action, pricing conversion, caching, selection or chart rendering.
Run on a committed Administrator 40.6.713 checkout, never an older build.
"""
from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parent
ADMIN = ROOT / "administrator"
APP = ADMIN / "app.js"
INDEX = ADMIN / "index.html"
BUILD = ADMIN / "build.json"


def replace_once(text, old, new, context):
    occurrences=text.count(old)
    if occurrences!=1:
        raise ValueError(f"{context}: expected exactly one anchor, got {occurrences}")
    return text.replace(old,new,1)


FUNCTION = r'''// 40.6.714 — An archived 24h price and a Market spot are comparable only
// when coin identity, quoted currency, provider and observation clocks agree.
// A percentage change from a Base 100 curve is NEVER the Market change24h.
// All outcomes are evidence statuses, not permission to fabricate or trade.
function atlasGraphSpotComparisonTruth({ c, quoteCurrency, historySourceFamily,
  lastTimestamp, lastPrice, now = Date.now() }) {
  const quote = String(quoteCurrency || "").toUpperCase();
  const provider = String(historySourceFamily || "").toLowerCase();
  const source = String(c?.source || "").toLowerCase();
  const chartTime = Number(lastTimestamp);
  const spotValue = quote === "EUR" ? c?.priceEur : quote === "USD" ? c?.priceUsd : null;
  const spot = spotValue == null || spotValue === "" ? NaN : Number(spotValue);
  const rawTime = c?.spotUpdatedAt || c?.timestamp || c?.lastUpdated;
  const spotTime = typeof rawTime === "number" ? rawTime : Date.parse(String(rawTime || ""));
  const common = {
    chartQuoteCurrency: ["EUR", "USD"].includes(quote) ? quote : null,
    chartSourceFamily: provider || null,
    marketChangeCurrency: ["EUR", "USD", "USDT", "USDC"].includes(String(c?.changeQuoteCurrency || "").toUpperCase())
      ? String(c.changeQuoteCurrency).toUpperCase() : null,
    chartLastTimestamp: Number.isFinite(chartTime) ? chartTime : null,
    spotTimestamp: Number.isFinite(spotTime) ? spotTime : null,
    spotSource: String(c?.source || "") || null,
    priceGapPct: null,
    comparable: false,
    status: "NON_COMPARABLE"
  };
  const unavailable = reason => ({ ...common, reason });
  if (!c?.id) return unavailable("identité d’actif absente");
  if (!["EUR", "USD"].includes(quote)) return unavailable("devise historique non qualifiée");
  if (provider !== "coingecko" || !source.includes("coingecko"))
    return unavailable("fournisseurs différents ou non prouvés");
  if (!(Number.isFinite(spot) && spot > 0 && Number.isFinite(Number(lastPrice)) && Number(lastPrice) > 0))
    return unavailable("référence spot comparable absente");
  if (!(Number.isFinite(spotTime) && Number.isFinite(chartTime)
    && spotTime <= now + ATLAS_CHART_MAX_FUTURE_MS && chartTime <= now + ATLAS_CHART_MAX_FUTURE_MS
    && Math.abs(spotTime - chartTime) <= 20 * 60000))
    return unavailable("horodatages décalés : comparaison interdite");
  const priceGapPct = Math.abs(Number(lastPrice) - spot) / spot * 100;
  const discrepancy = priceGapPct > ATLAS_CHART_PRICE_GAP_WARN_PCT;
  return {
    ...common, priceGapPct, comparable: true,
    status: discrepancy ? "ECART_A_VERIFIER" : "PRIX_PROCHES",
    reason: discrepancy ? "écart spot/historique signalé, série conservée" : "prix comparés sur source, devise et temps compatibles"
  };
}

function atlasGraphProvenanceMarketCurrency(coin) {
  const quote = String(coin?.changeQuoteCurrency || "").toUpperCase();
  return ["EUR", "USD", "USDT", "USDC"].includes(quote) ? quote : "NON QUALIFIÉE";
}

function atlasGraphProvenanceComparisonRows(entries) {
  return (Array.isArray(entries) ? entries : []).map(entry => {
    const coin = entry?.coin || {};
    const result = entry?.result || {};
    const metrics = result?.integrity?.metrics || {};
    const basis = atlasHistoricalDisplayQuote(result);
    const observedCoin = state.coins?.find(item => item.id === coin.id) || coin;
    const market = atlasMarketSnapshotSurface(observedCoin);
    return {
      coinId: String(coin.id || ""), symbol: String(coin.symbol || ""),
      historyCurrency: basis.currency || null,
      historySource: basis.source || null,
      historyFirstTimestamp: Number.isFinite(Number(metrics.firstTimestamp)) ? Number(metrics.firstTimestamp) : null,
      historyLastTimestamp: Number.isFinite(Number(metrics.lastTimestamp)) ? Number(metrics.lastTimestamp) : null,
      historyChangePct: atlasComparisonCurveChange(entry),
      marketChange24hPct: market.change24h != null && Number.isFinite(Number(market.change24h)) ? Number(market.change24h) : null,
      marketChangeCurrency: atlasGraphProvenanceMarketCurrency(observedCoin),
      marketChangeBasis: String(market.observedBasis || "unknown"),
      spotComparison: metrics.spotComparison || { status: "NON_DOCUMENTE", comparable: false }
    };
  });
}

function atlasGraphProvenanceReadOnlySnapshot() {
  const current = state.dataBroker?.chart?.result;
  const entries = Array.isArray(current?.entries) ? current.entries : [];
  return {
    schema: "atlas_24h_market_history_provenance_406714_v1",
    build: "40.6.714",
    periodDays: Number(state.chartPeriodDays || 1),
    requestedCurrency: atlasRequestedHistoricalCurrency(),
    comparisonEntries: atlasGraphProvenanceComparisonRows(entries),
    source: "local-current-runtime-only",
    financialSignal: false, automaticOrder: false, readOnly: true
  };
}

'''


def main():
    raw=APP.read_text(encoding='utf-8')
    html=INDEX.read_text(encoding='utf-8')
    build=json.loads(BUILD.read_text(encoding='utf-8'))
    if build.get('build')!='40.6.713':
        raise ValueError('The input must be deployed Administrator 40.6.713')
    if html.count('40.6.713')<2:
        raise ValueError('Unexpected 40.6.713 HTML version anchors')
    if 'atlasGraphSpotComparisonTruth' in raw:
        raise ValueError('Graph provenance already patched')
    validate='function atlasValidateChartSeries({ c, days, prices, payload = null, sourceMode = "coingecko-direct", quoteCurrency = null, historySourceFamily = null, historyInstrument = null }) {'
    raw=replace_once(raw,validate,FUNCTION+validate,'append provenance helpers')
    old='''  // Compare a historical sample only to a same-currency, same-provider,
  // near-contemporaneous spot. EUR and USD are never interchangeable.
  let priceGapPct = null;
  const chartQuote = String(quoteCurrency || "").toUpperCase();
  const chartProvider = String(historySourceFamily || "").toLowerCase();
  const spotValue = chartQuote === "EUR" ? c?.priceEur : chartQuote === "USD" ? c?.priceUsd : null;
  const spotPrice = spotValue == null || spotValue === "" ? NaN : Number(spotValue);
  const spotTimeValue = c?.spotUpdatedAt || c?.timestamp || c?.lastUpdated;
  const spotTimestamp = typeof spotTimeValue === "number" ? spotTimeValue : Date.parse(String(spotTimeValue || ""));
  const canCompare = chartProvider === "coingecko"
    && String(c?.source || "").toLowerCase().includes("coingecko")
    && Number.isFinite(spotTimestamp) && spotTimestamp <= Date.now() + ATLAS_CHART_MAX_FUTURE_MS
    && Math.abs(spotTimestamp - lastTimestamp) <= 20 * 60 * 1000;
  if (canCompare && Number.isFinite(spotPrice) && spotPrice > 0) {
    priceGapPct = Math.abs(lastPrice - spotPrice) / spotPrice * 100;
    if (priceGapPct > ATLAS_CHART_PRICE_GAP_WARN_PCT) warnings.push(`écart prix/courbe : ${priceGapPct.toFixed(2)} %`);
  }
'''
    new='''  // Auditable price-to-spot check: same source, quote and 20-minute clock.
  // Divergence is a visible WARNING, never a manufactured correction to OHLCV.
  const spotComparison = atlasGraphSpotComparisonTruth({ c, quoteCurrency,
    historySourceFamily, lastTimestamp, lastPrice });
  const priceGapPct = spotComparison.priceGapPct;
  if (spotComparison.status === "ECART_A_VERIFIER")
    warnings.push(`écart prix/courbe : ${priceGapPct.toFixed(2)} % · vérification requise`);
'''
    raw=replace_once(raw,old,new,'spot provenance in validator')
    raw=replace_once(raw,'      priceGapPct,\n      freshness\n','      priceGapPct,\n      spotComparison,\n      freshness\n','metric provenance field')
    # Not an overlay: provenance is available in the existing collapsed side detail.
    old2='''      <div><b>Variation marché 24 h</b><span>${Number.isFinite(Number(c?.change24h)) ? fmtPct(Number(c.change24h)) : "—"}</span></div>'''
    new2='''      <div><b>Variation Market 24 h · ${escapeHtml(atlasGraphProvenanceMarketCurrency(c))}</b><span>${Number.isFinite(Number(c?.change24h)) ? fmtPct(Number(c.change24h)) : "—"}</span></div>'''
    raw=replace_once(raw,old2,new2,'market variation label')
    old3='''      <div><b>Écart référence ${escapeHtml(chartCurrency || "?")}/courbe</b><span>${gap}</span></div>'''
    new3='''      <div><b>Écart référence ${escapeHtml(chartCurrency || "?")}/courbe</b><span>${gap}</span></div>
      <div><b>Preuve spot/historique</b><span>${escapeHtml(String(metrics?.spotComparison?.status || "NON DOCUMENTÉ"))} · ${escapeHtml(String(metrics?.spotComparison?.reason || "source/horloge à qualifier"))}</span></div>'''
    raw=replace_once(raw,old3,new3,'solo asset detail evidence')
    # Existing detail, not an overlay (avoid hiding charts).
    old4='''      <div><b>Échelle</b><span>Chaque actif commence à 100</span></div>'''
    new4='''      <div><b>Échelle</b><span>Chaque actif commence à 100</span></div>
      <div><b>Variations · référentiels</b><span>Courbe = retour historique Base 100 · sélection Hausses/Baisses = Market ; pas nécessairement même devise ni même heure</span></div>
      <div><b>Provenance 5 séries</b><span>${escapeHtml(atlasGraphProvenanceComparisonRows(entries).map(row =>
        `${row.symbol}: ${row.historyCurrency || "?"} hist / ${row.marketChangeCurrency} Market · ${row.spotComparison?.status || "NON DOCUMENTÉ"}`
      ).join(" ; "))}</span></div>'''
    raw=replace_once(raw,old4,new4,'comparison detail evidence')
    anchor='function atlasChartTooltipChangeMarkup(baseValue) {'
    # API available without timer or storage; a single read returns only live current chart context.
    api='''// Diagnostic read-only for Firefox operator, never a second data owner.
globalThis.AgentCryptoGraphProvenance406714 = Object.freeze({
  snapshot: atlasGraphProvenanceReadOnlySnapshot,
  compareSpot: atlasGraphSpotComparisonTruth,
  readOnly: true, newFetch: false, newTimer: false, newStorage: false,
  financialSignal: false, automaticOrder: false
});

'''
    raw=replace_once(raw,anchor,api+anchor,'read-only runtime diagnostics')
    assert raw.count('atlasGraphSpotComparisonTruth') >= 3
    assert len(raw)>3_000_000
    # A candidate is not production until tests and a separate main publication.
    html=html.replace('40.6.713','40.6.714')
    build.update({
      'build':'40.6.714','administrator_build':'40.6.714',
      'build_label':'Build 40.6.714 · Administrator',
      'release':'GRAPH 24H EUR/USD SPOT/HISTORY PROVENANCE — CANDIDATE',
      'status':'CANDIDATE_UNVERIFIED','published':False,
      'parent_build':'40.6.713',
      'terrain_verified':False,'terrain_pending':True,
      'terrain_proof':'FIREFOX_24H_EUR_USD_PROVENANCE_RECIPE_PENDING',
      'graph_provenance_406714':{
        'scope':'no new charts/requests; audit statuses and existing side details only',
        'market_change_currency':'declared or NON QUALIFIÉE',
        'spot_price_comparability':'same Coingecko provider, EUR/USD quote and <=20m timestamp',
        'no_synthetic_ohlcv':True,'auto_orders':False
      }
    })
    for path,contents in [(APP,raw),(INDEX,html),(BUILD,json.dumps(build,ensure_ascii=False,indent=2)+'\n')]:
        path.write_text(contents,encoding='utf-8')
    print('PATCH 40.6.714 applied',len(raw),'app chars; 0 new fetch, 0 new timers')


if __name__=='__main__':main()
