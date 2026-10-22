'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const ledger=require('./seven_capital_spot_journal.cjs');
const at='2026-10-22T05:00:00.000Z';
const source='2026-10-22T04:55:00.000Z';
const base=Date.parse(at);
const selected=Array.from({length:3},(_,i)=>({
 id:'coin-'+i,symbol:'TK'+i,rank:120+i,
 priceUsd:1+i,sourceSnapshot:source,
 change24h:10-i,change7d:8,volume24hUsd:10000000,
 marketCapUsd:90000000}));
const hot=Array.from({length:12},(_,i)=>({
 ...selected[0],id:'hot-'+i,symbol:'HOT'+i,rank:220+i,change24h:20+i}));
const scan={scoutUniverse:[...hot,...selected],
 sourceTimes:{core:source,extended:source}};
function mock(sourceDoc,_,stamp){
 return {schema:'erith.seven.public-usdc-spot-gate.v1',
  real_orders_submitted:0,paper_fills:0,real_orders_enabled:false,
  candidates:sourceDoc.observations.map(x=>({
   coin_id:x.coin_id,symbol:x.symbol,pair:x.symbol+'-USDC',
   status:'PUBLIC_BOOK_AND_SIZE_PAPER_SCREEN_PASSED',
   public_book_timestamp_utc:new Date(stamp-1000).toISOString(),
   public_bid_usdc:stamp===base?'0.99':'1.01',
   public_ask_usdc:'1.02',public_bid_qty_base:'500',
   public_ask_qty_base:'500',minSz:'1',lotSz:'0.01',tickSz:'0.01',
   hypothetical_buy_qty_base:'9.8',hypothetical_net_sellable_base:'9.79',
   hypothetical_buy_fee_pct:0.1,hypothetical_sell_fee_pct:0.1,
   hypothetical_net_after_immediate_exit_usdc:'9.6'
  }))};
}
test('archives first Spot/USDC screen and independent future bid; no fill or profit',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'seven-public-journal-'));
 try{
  const initial=await ledger.run({root:dir,scan,at:base,prepare:mock});
  assert.equal(initial.created_cohort,'2026-10-22');
  assert.equal(initial.archived,1);assert.equal(initial.markets,3);
  let idx=ledger.readIndex(dir);
  assert.equal(idx.records.length,1);
  assert.equal(idx.cohorts[0].policy_matches,3);
  let p=path.join(dir,idx.records[0].file);
  let first=JSON.parse(fs.readFileSync(p));
  assert.equal(first.kind,'FIRST_PUBLIC_SCREEN');
  assert.equal(first.paper_fills,0);
  assert.equal(first.net_profit_usdc,null);
  assert.equal(first.markets[0].future_bid_observed,false);
  assert.equal(first.markets[0].bid_qty_base,'500');
  assert.equal(first.markets[0].ask_qty_base,'500');
  const retry=await ledger.run({root:dir,scan,at:base+10*60000,prepare:mock});
  assert.equal(retry.archived,0);
  const future=await ledger.run({root:dir,scan,at:base+4*3600000,prepare:mock});
  assert.equal(future.archived,1);
  assert.equal(future.created_cohort,null);
  idx=ledger.readIndex(dir);
  assert.equal(idx.records.length,2);
  const second=JSON.parse(fs.readFileSync(path.join(dir,idx.records[1].file)));
  assert.equal(second.kind,'LATER_PUBLIC_BID');
  assert.equal(second.markets[0].future_bid_observed,true);
  assert.equal(second.markets[0].bid_usdc,'1.01');
  assert.equal(second.position_closed,false);
  assert.equal(second.net_profit_usdc,null);
  assert.equal(second.markets[0].account_fee_currency_verified,false);
  // An old observation cannot be changed silently: hash is a protection.
  fs.appendFileSync(p,'\n');
  assert.throws(()=>ledger.readIndex(dir),/modifiée/);
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
test('a stale market snapshot cannot create an invented entry cohort',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'seven-public-stale-'));
 try{
  const res=await ledger.run({root:dir,scan,at:base+9*3600000,
   prepare:()=>{throw Error('A stale source must not hit OKX')}});
  assert.equal(res.archived,0);
  assert.equal(res.cohorts,0);
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
test('blocked public markets are recorded without fabricated bids',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'seven-public-blocked-'));
 try{
  const blocked=(src)=>({schema:'erith.seven.public-usdc-spot-gate.v1',
   real_orders_submitted:0,paper_fills:0,real_orders_enabled:false,
   candidates:src.observations.map(x=>({coin_id:x.coin_id,symbol:x.symbol,
    pair:x.symbol+'-USDC',status:'NO_PUBLIC_SPOT_USDC_PAIR_AT_CHECK'}))});
  const r=await ledger.run({root:dir,scan,at:base,prepare:blocked});
  assert.equal(r.archived,1);
  const idx=ledger.readIndex(dir);
  const d=JSON.parse(fs.readFileSync(path.join(dir,idx.records[0].file)));
  assert.equal(d.markets[0].bid_usdc,null);
  assert.equal(d.markets[0].future_bid_observed,false);
  assert.equal(d.orders_enabled,false);
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
