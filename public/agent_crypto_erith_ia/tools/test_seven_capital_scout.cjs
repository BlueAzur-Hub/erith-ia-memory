'use strict';
const assert=require('node:assert/strict');
const {checkDay,preselect,select,evaluate}=require('./seven_capital_scout.cjs');
function archive(day,price=2){
 const at=day+'T10:00:00.000Z';
 const one={id:'verified-id',name:'Synthetic Asset',symbol:'SYN',rank:120,
  priceUsd:price,sourceSnapshot:at,change24h:5,change7d:10,
  volume24hUsd:8000000,marketCapUsd:80000000};
 return {schema:'erith.radar.opportunity-observation.v1',orders_enabled:false,
  account_access:false,simulation_only:true,spread_validated:false,orderbook_validated:false,
  observed_date_utc:day,groups:{momentum_24h_7d:[one],rebound_24h_only:[]},
  scout_candidates:[one],
  tracked_candidates:[{id:'verified-id',status:'OBSERVED_TOP1000',price_usd:price,observed_at_utc:at}]};
}
let first=archive('2026-10-21'),next=archive('2026-10-22'),later=archive('2026-10-23',2.04);
const legacy=archive('2026-10-16');delete legacy.tracked_candidates;
assert.equal(evaluate([legacy]).observations.length,0);
const forbidden=archive('2026-10-22');delete forbidden.tracked_candidates;
assert.throws(()=>evaluate([forbidden]),/Contrat/);
const noScout=archive('2026-10-22');delete noScout.scout_candidates;
assert.throws(()=>evaluate([noScout]),/Contrat/);
const initial=evaluate([first]);
assert.equal(initial.observations.length,0);
assert.equal(initial.simulation_budget_usdc,10);
assert.equal(initial.reserved_cost_buffer_usdc,0.94);
assert.deepEqual(initial.milestones_usdc,[12,15,17]);
assert.equal(initial.profit_paper_usdc,null);
assert.equal(initial.real_orders_submitted,0);
const report=evaluate([first,next,later]);
assert.equal(report.observations.length,2);
assert.equal(report.observations[0].followup_status,'AGGREGATE_CHANGE_OBSERVED');
assert.equal(report.observations[0].observed_change_pct,2);
assert.equal(report.observations[0].elapsed_hours,24);
assert.equal(report.observations[0].net_profit_usdc,null);
assert.equal(report.observations[0].decision,'NO_TRADE');
assert.equal(report.observations[1].followup_status,'WAIT_NEXT_DAY');
assert.equal(report.orders_enabled,false);
assert.equal(report.contract_identity_proven,false);
assert.equal(report.usdc_spot_orderbook_verified,false);
assert.equal(report.live_trading_authorized,false);
assert.deepEqual(report.milestones_reached,[]);
assert.throws(()=>select({...next,scout_candidates:[{...next.scout_candidates[0],change24h:105}]}),/hors politique/);
assert.throws(()=>evaluate([next,next]),/Doublon/);
assert.throws(()=>checkDay({...next,orders_enabled:true}));
assert.throws(()=>select({...next,scout_candidates:[next.scout_candidates[0],next.scout_candidates[0]]}),/invalides/);
assert.throws(()=>evaluate([next,{...later,tracked_candidates:[later.tracked_candidates[0],later.tracked_candidates[0]]}]),/Doublon/);

const at='2026-10-22T10:00:00.000Z';
const hot=Array.from({length:12},(_,i)=>({id:'hot-'+i,symbol:'HOT'+i,rank:100+i,
 priceUsd:1,sourceSnapshot:at,change24h:18+i,change7d:10,
 volume24hUsd:8000000,marketCapUsd:80000000}));
const moderate={id:'moderate',symbol:'MOD',rank:200,priceUsd:2,
 sourceSnapshot:at,change24h:7,change7d:10,
 volume24hUsd:8000000,marketCapUsd:80000000};
assert.equal(preselect(hot,'2026-10-22').length,0);
assert.deepEqual(preselect([...hot,moderate],'2026-10-22').map(x=>x.id),['moderate']);
const outside=archive('2026-10-22');
outside.groups.momentum_24h_7d=hot;
outside.scout_candidates=preselect([...hot,moderate],'2026-10-22').slice(0,3);
assert.equal(select(outside)[0].coin_id,'moderate');
assert.equal(evaluate([outside]).observations[0].net_profit_usdc,null);
assert.throws(()=>preselect([{...moderate,sourceSnapshot:'2026-10-23T10:00:00Z'}],'2026-10-22'),/invalides/);
assert.throws(()=>preselect([moderate,moderate],'2026-10-22'),/invalides/);
console.log('Seven capital 10 USDC: full-universe selection, dates, zero orders PASS');