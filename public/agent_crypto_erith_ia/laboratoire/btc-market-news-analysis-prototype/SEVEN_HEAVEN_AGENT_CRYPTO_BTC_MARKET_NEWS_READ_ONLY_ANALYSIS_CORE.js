/* ERITH.IA / Seven Heaven — BTC market/news read-only proof of concept.
 * No DOM, no network, no accounts, no execution, no storage, no scheduler.
 * Call analyze({market, news, asOfUtc}); caller supplies trusted, public data.
 * Copyright (c) BlueAzur-Hub project contributors. Prototype, non-production.
 */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SevenBtcMarketNewsAnalysisCore = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const VERSION = '2026-11-10-proof-of-concept';
  const NEWS_SCHEMA = 'atlas_news_sentinel_world_to_market_v1';
  const BARS = Object.freeze({ '1m': 60000, '5m': 300000, '15m': 900000,
    '30m': 1800000, '1h': 3600000, '4h': 14400000, '1j': 86400000 });
  const MAX_NEWS = 500, MAX_ROWS = 2000;
  const bool = x => x === true;
  const validTime = x => typeof x === 'string' && Number.isFinite(Date.parse(x)) &&
    /(?:Z|[+-]\d\d:\d\d)$/i.test(x);
  const iso = ms => new Date(ms).toISOString();
  const pct = (a,b) => a > 0 ? Number(((b/a-1)*100).toFixed(5)) : null;
  const round = n => Number(Number(n).toFixed(8));
  const fail = (code, why) => Object.freeze({
    schema: 'seven.btc.market.news.analysis.proof.v1', version: VERSION,
    status: 'BLOCKED', reason_code: code, reason: why,
    orders_enabled: false, advice: false, causal_claim: false,
    matches: [], unmatched: []
  });
  function validateMarket(s, now) {
    if (!s || typeof s !== 'object') return {error:'MARKET_MISSING'};
    if (s.loading === true || s.error) return {error:'MARKET_NOT_READY'};
    if (String(s.loadedInstrument||'').toUpperCase() !== 'BTC-USDC')
      return {error:'INSTRUMENT_MISMATCH'};
    if (!BARS[s.loadedBar]) return {error:'BAR_UNSUPPORTED'};
    // No silent fallback to EUR/USDT, Binance or CoinGecko.
    if (!/\bOKX\b/i.test(String(s.source||''))) return {error:'OKX_SOURCE_NOT_PROVEN'};
    if (!Array.isArray(s.rows) || s.rows.length < 5 || s.rows.length > MAX_ROWS)
      return {error:'CANDLES_UNUSABLE'};
    const duration = BARS[s.loadedBar];
    let lastT = -Infinity;
    const rows = [];
    for (const x of s.rows) {
      const t=Number(x?.t),o=Number(x?.o),h=Number(x?.h),
        l=Number(x?.l),c=Number(x?.c),v=Number(x?.v);
      if (![t,o,h,l,c,v].every(Number.isFinite) || !Number.isInteger(t) ||
          t <= lastT || t <= 0 || o<=0 || h<=0 || l<=0 || c<=0 || v<0 ||
          h < Math.max(o,c,l) || l > Math.min(o,c,h))
        return {error:'CANDLES_INVALID_OR_UNORDERED'};
      lastT=t;
      const confirmed = t + duration <= now && String(x.confirm??'') !== '0' &&
        String(x.confirm??'') !== 'false';
      rows.push({t,o,h,l,c,v,confirmed});
    }
    if (rows.filter(r=>r.confirmed).length < 4) return {error:'CLOSED_CANDLES_INSUFFICIENT'};
    return {duration,rows,bar:s.loadedBar,source:String(s.source),lastLoadedAt:s.lastLoadedAt||null,
      configuredEma:Array.isArray(s.emaPeriods)?s.emaPeriods.slice(0,3):null};
  }
  function ema(values, period) {
    if (!Number.isInteger(period) || period < 2 || period > 200) return [];
    const alpha=2/(period+1);
    let current=null;
    return values.map((v,i)=>{
      if (i < period-1) return null;
      if (current === null) {
        current=values.slice(i+1-period,i+1).reduce((a,b)=>a+b,0)/period;
      } else current=v*alpha+current*(1-alpha);
      return round(current);
    });
  }
  function technical(rows, configuredEma) {
    const periods=Array.isArray(configuredEma)&&configuredEma.length===3&&
       configuredEma.every(n=>Number.isInteger(n)&&n>=2&&n<=200)&&
       configuredEma[0]<configuredEma[1]&&configuredEma[1]<configuredEma[2]
       ?configuredEma:[5,13,34];
    const closed=rows.filter(r=>r.confirmed);
    const close=closed.map(r=>r.c);
    const e=periods.map(p=>ema(close,p));
    const i=close.length-1;
    const fast=e[0][i],slow=e[1][i],long=e[2][i];
    let crossover='INSUFFICIENT';
    if (i>=1 && [e[0][i-1],e[1][i-1],fast,slow].every(Number.isFinite)) {
      const prior=e[0][i-1]-e[1][i-1],current=fast-slow;
      crossover=prior<=0&&current>0?'UP':prior>=0&&current<0?'DOWN':'NONE';
    }
    return {
      ema_periods:periods, ema_latest: [fast??null,slow??null,long??null],
      ema_fast_relative_to_slow: Number.isFinite(fast)&&Number.isFinite(slow) ?
        (fast>slow?'ABOVE':fast<slow?'BELOW':'EQUAL') : 'UNKNOWN',
      last_closed_candle_utc:iso(closed.at(-1).t),
      last_closed_price:closed.at(-1).c,
      crossover_last_two_closed_candles:crossover,
      note:'EMA = descriptive trend indicator, not a forecast or trading order.'
    };
  }
  function readNews(n, asOf) {
    if (!n || typeof n!=='object' || n.schema!==NEWS_SCHEMA ||
        !Array.isArray(n.events) || n.events.length>MAX_NEWS)
      return {error:'NEWS_SCHEMA_INVALID'};
    if (n.causal_claim===true) return {error:'UNSAFE_CAUSAL_CLAIM'};
    const generated=validTime(n.generated_at)?Date.parse(n.generated_at):null;
    if (generated===null || generated>asOf) return {error:'NEWS_TIMESTAMP_INVALID'};
    const seen=new Set(),events=[];let skipped=0;
    for (const x of n.events) {
      const id=String(x?.event_id||x?.id||'').slice(0,100);
      const time=x?.event_time;
      const sourceUrl=String(x?.source_url||'');
      if (!id || seen.has(id) || !Array.isArray(x?.assets) || !x.assets.includes('BTC') ||
          !validTime(time) || !/^https:\/\/[^\s]+$/i.test(sourceUrl) ||
          !String(x?.headline||'').trim() || x?.causal_claim===true) {skipped++;continue;}
      seen.add(id);
      const timeMs=Date.parse(time);
      if (timeMs>asOf || timeMs>generated) {skipped++;continue;}
      events.push({id, eventAt:timeMs, title:String(x.headline).slice(0,300),
        sourceName:String(x.source_name||'Unknown').slice(0,120),
        sourceUrl, driverDomains:Array.isArray(x.driver_domains)?
          x.driver_domains.filter(v=>typeof v==='string').slice(0,10):[],
        sourceCount:Number.isInteger(x.source_count)?x.source_count:null});
    }
    return {events,generated,skipped,status:String(n.status||'UNKNOWN'),
      coverage:n.summary?.driver_coverage||null,
      sourcesOk:n.summary?.sources_ok??null,sourcesTotal:n.summary?.sources_total??null};
  }
  function correlate(rows,duration,event) {
    const t=event.eventAt;
    // Price before publication: last candle FULLY CLOSED by event time.
    let before=-1,first=-1;
    for (let i=0;i<rows.length;i++) {
      if (rows[i].confirmed && rows[i].t+duration<=t) before=i;
      if (first<0 && rows[i].confirmed && rows[i].t>=t) first=i;
    }
    if (before<0) return {reason:'NO_PRE_EVENT_CLOSED_CANDLE'};
    if (first<0) return {reason:'NO_POST_EVENT_CLOSED_CANDLE'};
    // Explicitly avoid judging the unfinished event candle.
    for (let j=before+1;j<=first;j++)
      if (rows[j].t - rows[j-1].t !== duration) return {reason:'CANDLE_GAP'};
    if (rows[first].t-t>duration) return {reason:'POST_EVENT_CANDLE_TOO_FAR'};
    const base=rows[before];
    const future=[];
    for(let j=first;j<Math.min(rows.length,first+3);j++) {
      if (!rows[j].confirmed || (j>first && rows[j].t-rows[j-1].t!==duration)) break;
      future.push(rows[j]);
    }
    if (!future.length) return {reason:'NO_CONFIRMED_POST_EVENT_WINDOW'};
    const earlier=rows.slice(Math.max(0,before-2),before+1);
    const refVol=earlier.length===3 && earlier.every(r=>r.confirmed) &&
      earlier.every((r,i)=>i===0||r.t-earlier[i-1].t===duration) ?
      earlier.reduce((s,r)=>s+r.v,0)/3 : null;
    const q=future[0];
    return {evidence:{pre_event_candle_utc:iso(base.t),pre_event_close_usdc:base.c,
      first_post_event_candle_utc:iso(q.t),post_event_close_usdc:q.c,
      change_pct_one_closed_bar:pct(base.c,q.c),
      volume_btc_first_post_event_bar:q.v,
      volume_ratio_to_previous_three_closed_bars:refVol>0?round(q.v/refVol):null,
      change_pct_three_closed_bars:future.length===3?pct(base.c,future[2].c):null,
      post_event_closed_bars:future.length,
      partial_event_bar_excluded:true,
      interpretation:'Temporal association only; no proof of cause or buyer/seller dominance.'}};
  }
  function analyze({market,news,asOfUtc}={}) {
    if(!validTime(asOfUtc))return fail('AS_OF_REQUIRED','Supply an explicit UTC observation timestamp.');
    const asOf=Date.parse(asOfUtc),m=validateMarket(market,asOf);
    if(m.error)return fail(m.error,'Spot OKX BTC-USDC candles cannot be verified.');
    const n=readNews(news,asOf);
    if(n.error)return fail(n.error,'News archive cannot be verified.');
    const matches=[],unmatched=[];
    for (const e of n.events) {
      const result=correlate(m.rows,m.duration,e);
      const meta={event_id:e.id,event_at_utc:iso(e.eventAt),headline:e.title,
        source_name:e.sourceName,source_url:e.sourceUrl,driver_domains:e.driverDomains,
        source_count:e.sourceCount};
      if (result.evidence) matches.push({...meta,...result});
      else unmatched.push({...meta,reason_code:result.reason});
    }
    const warnings=[
      'CORRELATION_IS_NOT_CAUSATION',
      'ETF_FLOWS_NOT_QUANTIFIED_FROM_NEWS_HEADLINES',
      'DERIVATIVES_LIQUIDATIONS_NOT_QUANTIFIED_FROM_SPOT_VOLUME',
      'NO_TRADER_ORDER_OR_PERSONAL_ACCOUNT_ACCESS'
    ];
    if(asOf-n.generated>24*3600000)warnings.push('NEWS_ARCHIVE_STALE_OVER_24_HOURS');
    if(n.status!=='ok')warnings.push('NEWS_COLLECTOR_NOT_OK');
    if(n.coverage?.leverage?.events_72h===0)
      warnings.push('LEVERAGE_NEWS_COVERAGE_GAP');
    if(n.skipped>0)warnings.push('INVALID_NON_BTC_OR_DUPLICATE_NEWS_SKIPPED');
    return Object.freeze({
      schema:'seven.btc.market.news.analysis.proof.v1',version:VERSION,
      status:matches.length?'MATCHED':'NO_TEMPORAL_MATCH',
      kind:'READ_ONLY_HISTORICAL_OBSERVATION',
      orders_enabled:false,real_orders:false,paper_only:true,
      advice:false,causal_claim:false,
      provenance:{instrument:'BTC-USDC',venue:'OKX',market_type:'SPOT',
        candle_source:m.source,candle_bar:m.bar,market_last_loaded_at:m.lastLoadedAt,
        news_schema:NEWS_SCHEMA,news_generated_at_utc:iso(n.generated),
        observed_at_utc:iso(asOf)},
      technical:technical(m.rows,m.configuredEma),
      counts:{market_candles:m.rows.length,news_events_total:news.events.length,
        btc_events_qualified:n.events.length,matched:matches.length,
        unmatched:unmatched.length,news_events_skipped:n.skipped},
      coverage:{institutional_flows:n.coverage?.institutional_flows||null,
        leverage:n.coverage?.leverage||null,
        sources_ok:n.sourcesOk,sources_total:n.sourcesTotal,
        quantitative_etf_flows_verified:false,
        quantitative_derivatives_liquidations_verified:false},
      warnings, matches, unmatched,
      conclusion:'This prototype only aligns published BTC news with completed OKX Spot candles. It cannot identify the cause of a candle, the executed ETF trades, or futures liquidations. No orders.'
    });
  }
  return Object.freeze({analyze,validateMarket,version:VERSION,read_only:true,
    orders_enabled:false,real_orders:false,side_effects:false});
});