'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const core=require('./SEVEN_HEAVEN_AGENT_CRYPTO_BTC_MARKET_NEWS_READ_ONLY_ANALYSIS_CORE.js');
const START=Date.parse('2026-11-05T00:00:00.000Z');
const BAR=3600000;
const at=n=>new Date(START+n*BAR).toISOString();
const AS_OF=at(48);
function candles(){return Array.from({length:48},(_,i)=>({
  t:START+i*BAR,o:74000+i*10,h:74020+i*10,l:73980+i*10,
  c:74010+i*10,v:10+(i%3)*2,confirm:'1'
}));}
function market(){return {loadedInstrument:'BTC-USDC',loadedBar:'1h',
  mode:'candles',source:'OKX public candles',lastLoadedAt:AS_OF,
  emaPeriods:[5,13,34],rows:candles(),loading:false,error:null};}
function event(time=at(20.5),id='first') {
  return {id,event_id:id,headline:'Educational fixture: ETF headline, not verified causal event',
    source_name:'Example News',source_url:'https://example.org/fixture',
    event_time:time,assets:['BTC'],driver_domains:['institutional_flows'],
    source_count:1,causal_claim:false};
}
function news(events=[event()]){return {schema:'atlas_news_sentinel_world_to_market_v1',
  generated_at:at(42),status:'ok',causal_claim:false,events,
  summary:{sources_ok:14,sources_total:15,driver_coverage:{
    institutional_flows:{events_72h:5,distinct_sources:3},
    leverage:{events_72h:0,distinct_sources:0}}}};}
function run(m=market(),n=news(),t=AS_OF){return core.analyze({market:m,news:n,asOfUtc:t});}
test('read-only prototype has no order capability',()=>{
 assert.equal(core.read_only,true);assert.equal(core.orders_enabled,false);
 assert.equal(core.side_effects,false);
});
test('matches a BTC article to UTC 1h closed candles and exposes evidence',()=>{
 const r=run();assert.equal(r.status,'MATCHED');assert.equal(r.counts.matched,1);
 assert.equal(r.matches[0].evidence.pre_event_candle_utc,at(19));
 assert.equal(r.matches[0].evidence.first_post_event_candle_utc,at(21));
 assert.equal(r.matches[0].evidence.partial_event_bar_excluded,true);
 assert.ok(r.matches[0].evidence.change_pct_one_closed_bar>0);
 assert.equal(r.matches[0].evidence.post_event_closed_bars,3);
 assert.equal(r.provenance.instrument,'BTC-USDC');assert.equal(r.causal_claim,false);
});
test('computes EMA 5/13/34 only from completed candles',()=>{
 const r=run();assert.deepEqual(r.technical.ema_periods,[5,13,34]);
 assert.ok(r.technical.ema_latest.every(Number.isFinite));
 assert.equal(r.technical.crossover_last_two_closed_candles,'NONE');
 assert.equal(r.technical.ema_fast_relative_to_slow,'ABOVE');
});
test('no future news is allowed to change the interpretation',()=>{
 const r=run(market(),news([event(at(55))]));
 assert.equal(r.status,'NO_TEMPORAL_MATCH');assert.equal(r.counts.news_events_skipped,1);
});
test('refuses non-BTC assets even when headline mentions Bitcoin',()=>{
 const e=event();e.assets=['ETH'];
 const r=run(market(),news([e]));assert.equal(r.status,'NO_TEMPORAL_MATCH');
 assert.equal(r.counts.btc_events_qualified,0);
});
test('no valid pre-event candle is explicitly unmatched',()=>{
 const r=run(market(),news([event(at(0.25))]));
 assert.equal(r.status,'NO_TEMPORAL_MATCH');
 assert.equal(r.unmatched[0].reason_code,'NO_PRE_EVENT_CLOSED_CANDLE');
});
test('no valid post-event candle is explicitly unmatched',()=>{
 const n=news([event(at(47.1))]);n.generated_at=AS_OF;
 const r=run(market(),n);
 assert.equal(r.status,'NO_TEMPORAL_MATCH');
 assert.equal(r.unmatched[0].reason_code,'NO_POST_EVENT_CLOSED_CANDLE');
});
test('a missing timestamp interval is not silently interpolated',()=>{
 const m=market();m.rows.splice(20,1);
 const r=run(m,news([event(at(20.5))]));
 assert.equal(r.unmatched[0].reason_code,'CANDLE_GAP');
});
test('open candle is never used as post-event close',()=>{
 const m=market();m.rows[47].confirm='0';
 const n=news([event(at(46.2))]);n.generated_at=AS_OF;
 const r=run(m,n);
 assert.equal(r.unmatched[0].reason_code,'NO_POST_EVENT_CLOSED_CANDLE');
});
test('rejects mixed BTC-EUR, BTC-USDT and fake sources',()=>{
 for(const instr of ['BTC-EUR','BTC-USDT','ETH-USDC']){
  const m=market();m.loadedInstrument=instr;
  assert.equal(run(m).reason_code,'INSTRUMENT_MISMATCH');
 }
 const m=market();m.source='Binance public candles';
 assert.equal(run(m).reason_code,'OKX_SOURCE_NOT_PROVEN');
});
test('rejects invalid, unsorted and duplicate OHLCV data',()=>{
 const m=market();m.rows[3].h=1;
 assert.equal(run(m).reason_code,'CANDLES_INVALID_OR_UNORDERED');
 const m2=market();m2.rows[3].t=m2.rows[2].t;
 assert.equal(run(m2).reason_code,'CANDLES_INVALID_OR_UNORDERED');
});
test('rejects unsafe news schema and causal assertions',()=>{
 const n=news();n.schema='unknown';assert.equal(run(market(),n).reason_code,'NEWS_SCHEMA_INVALID');
 const n2=news();n2.causal_claim=true;
 assert.equal(run(market(),n2).reason_code,'UNSAFE_CAUSAL_CLAIM');
});
test('does not infer quantitative ETF flows or leveraged liquidations from headlines',()=>{
 const r=run();assert.equal(r.coverage.quantitative_etf_flows_verified,false);
 assert.equal(r.coverage.quantitative_derivatives_liquidations_verified,false);
 assert.ok(r.warnings.includes('ETF_FLOWS_NOT_QUANTIFIED_FROM_NEWS_HEADLINES'));
 assert.ok(r.warnings.includes('LEVERAGE_NEWS_COVERAGE_GAP'));
});
test('does not return any private account data even if snapshot includes them',()=>{
 const m=market();m.account={privateKey:'DO_NOT_EXPOSE',balance:999};
 const r=run(m);
 assert.ok(!JSON.stringify(r).includes('DO_NOT_EXPOSE'));
 assert.equal(r.real_orders,false);assert.equal(r.advice,false);
});
test('deduplicates same canonical event id',()=>{
 const r=run(market(),news([event(at(20.5),'a'),event(at(20.5),'a')]));
 assert.equal(r.counts.btc_events_qualified,1);
 assert.equal(r.counts.news_events_skipped,1);
});
test('stale publication is clearly marked',()=>{
 const n=news();n.generated_at=at(0);
 const r=run(market(),n);
 assert.ok(r.warnings.includes('NEWS_ARCHIVE_STALE_OVER_24_HOURS'));
});
test('requires explicit as-of timestamp for reproducibility',()=>{
 const r=core.analyze({market:market(),news:news()});
 assert.equal(r.reason_code,'AS_OF_REQUIRED');
});
test('all external evidence is marked as temporal association, never causal attribution',()=>{
 const r=run();assert.ok(r.matches[0].evidence.interpretation.includes('no proof of cause'));
 assert.equal(r.causal_claim,false);
});
test('prototype output is consistent with checked-in deterministic example',()=>{
 const source=JSON.parse(fs.readFileSync(path.join(__dirname,'SEVEN_HEAVEN_AGENT_CRYPTO_BTC_MARKET_NEWS_SYNTHETIC_EXAMPLE_INPUT.json'),'utf8'));
 const actual=core.analyze(source);
 const expected=JSON.parse(fs.readFileSync(path.join(__dirname,'SEVEN_HEAVEN_AGENT_CRYPTO_BTC_MARKET_NEWS_SYNTHETIC_EXAMPLE_RESULT.json'),'utf8'));
 assert.deepEqual(actual,expected);
 assert.equal(actual.status,'MATCHED');
});
module.exports={market,news,event,run,AS_OF};