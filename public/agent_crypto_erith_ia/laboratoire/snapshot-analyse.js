/* ERITH.IA — Snapshot Analyse: pure, deterministic, read-only graph-series analysis.
 * No DOM, network, storage, timer, order, or own chart/data source.
 * Call with AgentCryptoPublishedSeries.read() and an explicit {nowMs,timeframe,...}.
 */
(function (root, factory) {
  'use strict';
  const api = Object.freeze({ analyse: factory });
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AgentCryptoSnapshotAnalyse = api;
})(typeof globalThis === 'object' ? globalThis : this, function analyse(input, options) {
  'use strict';
  const o = options && typeof options === 'object' ? options : {};
  const horizons = {
    '24h': { days: 1, freshnessMs: 30 * 60000, neutral: 1.5, intensity: [2, 8] },
    '7j': { days: 7, freshnessMs: 8 * 3600000, neutral: 3, intensity: [5, 20] },
    '30j': { days: 30, freshnessMs: 48 * 3600000, neutral: 5, intensity: [10, 35] }
  };
  const timeframe = o.timeframe || ({1:'24h',7:'7j',30:'30j'})[input?.periodDays] || null;
  const cfg = horizons[timeframe];
  const safe = v => typeof v === 'string' ? v : null;
  const src = input && typeof input === 'object' ? input : {};
  const metricsEmpty = () => ({priceCurrent:null,changePeriodPct:null,low:null,high:null,amplitudePct:null,rangePositionPct:null,maxDrawdownPct:null});
  function result(status, warnings, extra = {}) {
    return {
      schema:'agent_crypto_snapshot_analyse',status,
      assetId:safe(src.assetId),symbol:safe(src.symbol),instrument:safe(src.instrument),
      provider:safe(src.provider),currency:safe(src.currency),timeframe,source:safe(src.source),
      firstPointAt:null,lastPointAt:null,points:0,coveragePct:0,observedHours:0,
      metrics:metricsEmpty(),trendLabel:'indetermine',rangeIntensityLabel:'indeterminee',
      volatilityLabel:'non mesuree statistiquement',momentumLabel:'indetermine',
      decisionLabel:status==='partial'?'Observation partielle':'Données insuffisantes',
      integrity:{identityVerified:false,sourceVerified:false,conversionVerified:false,
        coverageVerified:false,freshnessVerified:false,warnings:[...warnings]},
      selectionRevision:Number.isSafeInteger(src.selectionRevision)?src.selectionRevision:null,
      ...extra
    };
  }
  if (!cfg) return result('not_available',['horizon non pris en charge']);
  const warns = [];
  if (!src.assetId || !src.symbol || !src.provider || !src.source || !src.currency ||
      src.published !== true || src.integrityOk !== true ||
      !Number.isSafeInteger(src.selectionRevision) ||
      src.selectionRevision !== src.chartRevision ||
      (src.activeChartAssetId && src.activeChartAssetId !== src.assetId) ||
      (o.expectedAssetId && o.expectedAssetId !== src.assetId) ||
      (o.expectedRevision !== undefined && o.expectedRevision !== src.selectionRevision) ||
      (o.expectedTimeframe && o.expectedTimeframe !== timeframe)) {
    return result('blocked',['publication, identité ou révision non confirmée']);
  }
  const periodDays = Number(src.periodDays);
  if (!Number.isInteger(periodDays) || periodDays < 1) return result('blocked',['période publiée absente ou invalide']);
  if (periodDays < cfg.days) return result('not_available',['horizon non couvert par la période publiée']);
  const ccy = String(src.currency).toUpperCase();
  const quote = String(src.quoteCurrency || ccy).toUpperCase();
  const conversionRequired = (ccy !== quote) || src.conversion?.required === true;
  const conversionOK = !conversionRequired || (src.conversion?.verified === true &&
    !!src.conversion.source && Number.isFinite(Date.parse(src.conversion.observedAt)));
  if (!['USD','USDT','USDC','EUR'].includes(ccy) || !conversionOK)
    return result('blocked',['devise ou conversion non vérifiée']);
  // No implicit stablecoin parity, and never convert the quoted series here.
  if (!Number.isFinite(o.nowMs)) return result('blocked',['horloge explicite nowMs requise']);
  const nowMs = o.nowMs;
  if (!Array.isArray(src.series) || src.series.length < 21)
    return result('blocked',['moins de 21 points vérifiables']);
  let previous = -Infinity;
  for (const point of src.series) {
    if (!Array.isArray(point) || point.length !== 2 ||
        !Number.isSafeInteger(point[0]) || point[0] <= previous ||
        !Number.isFinite(point[1]) || point[1] <= 0) {
      return result('blocked',['points invalides, non ordonnés ou prix non positifs']);
    }
    previous = point[0];
  }
  const duration = cfg.days * 86400000;
  const lastRawTs = src.series[src.series.length-1][0];
  if (lastRawTs > nowMs || lastRawTs <= 0) return result('blocked',['horodatage futur ou invalide']);
  const windowStart = Math.max(lastRawTs - duration, nowMs - duration);
  // A 7j series may locally support 24h, but only actual samples are used.
  const points = src.series.filter(p => p[0] >= windowStart && p[0] <= nowMs);
  if (points.length < 21) return result('not_available',['horizon sans observations suffisantes']);
  const firstTs = points[0][0],lastTs = points[points.length-1][0];
  const elapsed = lastTs - firstTs;
  const coverage = Math.min(100,Math.max(0,100*elapsed/duration));
  let maxGap = 0;
  for (let i=1;i<points.length;i++) maxGap=Math.max(maxGap,points[i][0]-points[i-1][0]);
  const fresh = nowMs-lastTs <= cfg.freshnessMs;
  const complete = coverage >= 90 && maxGap <= 0.20*duration;
  if (!complete) warns.push('fenêtre partielle ou lacune > 20 %');
  if (!fresh) warns.push('dernière observation trop ancienne');
  const status=complete&&fresh?'ready':'partial';
  const prices=points.map(p=>p[1]);
  const p0=prices[0],pn=prices[prices.length-1];
  const low=Math.min(...prices),high=Math.max(...prices);
  const change=100*(pn/p0-1);
  const amplitude=100*(high-low)/low;
  let peak=-Infinity,drawdown=0;
  for (const p of prices){peak=Math.max(peak,p);drawdown=Math.max(drawdown,100*(1-p/peak));}
  const rangePosition=high>low?100*(pn-low)/(high-low):null;
  const trend=change>cfg.neutral?'hausse':change<-cfg.neutral?'baisse':'lateral';
  const rangeIntensity=amplitude<cfg.intensity[0]?'faible':amplitude<=cfg.intensity[1]?'moderee':'forte';
  const midTs=(firstTs+lastTs)/2;
  let midIndex=0;
  for(let i=1;i<points.length;i++)if(Math.abs(points[i][0]-midTs)<Math.abs(points[midIndex][0]-midTs))midIndex=i;
  let momentum='indetermine';
  if(Math.abs(points[midIndex][0]-midTs)<=duration*.10 && midIndex>0 && midIndex<points.length-1){
    const pMid=prices[midIndex],a=100*(pMid/p0-1),b=100*(pn/pMid-1);
    if(a<0&&b>0)momentum='rebond observe';
    else if(a>0&&b<0)momentum='repli observe';
    else if(a*b>0&&Math.abs(b)-Math.abs(a)>1)momentum='acceleration observee';
    else if(a*b>0&&Math.abs(a)-Math.abs(b)>1)momentum='ralentissement observe';
    else momentum='stable';
  }
  let decision='Observer';
  if(status==='partial')decision='Observation partielle';
  else if(rangeIntensity==='forte')decision='Mouvement etendu';
  else if(momentum==='rebond observe')decision='Rebond observe';
  else if(trend==='baisse')decision='Pression baissiere observee';
  return result(status,warns,{
    firstPointAt:new Date(firstTs).toISOString(),lastPointAt:new Date(lastTs).toISOString(),
    points:points.length,coveragePct:coverage,observedHours:elapsed/3600000,
    metrics:{priceCurrent:pn,changePeriodPct:change,low,high,amplitudePct:amplitude,
      rangePositionPct:rangePosition,maxDrawdownPct:drawdown},
    trendLabel:trend,rangeIntensityLabel:rangeIntensity,momentumLabel:momentum,decisionLabel:decision,
    integrity:{identityVerified:true,sourceVerified:true,conversionVerified:conversionOK,
      coverageVerified:complete,freshnessVerified:fresh,warnings:warns}
  });
});
