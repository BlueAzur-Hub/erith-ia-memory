'use strict';
const assert=require('node:assert/strict');
const gate=require('./seven_spot_gate.cjs');
const NOW=Date.now(),STAMP=new Date(NOW-1000).toISOString(),DAY=STAMP.slice(0,10);
const candidate={coin_id:'bitcoin',symbol:'BTC',
 source_at_utc:DAY+'T00:00:00.000Z',date_utc:DAY,decision:'NO_TRADE',
 fill:false,net_profit_usdc:null};
const source={schema:'erith.seven.capital-scout.paper.v1',
 mode:'AUTOMATED_PROSPECTIVE_RESEARCH_ONLY',orders_enabled:false,
 private_account_access:false,real_orders_submitted:0,paper_orders_submitted:0,
 simulation_budget_usdc:10,reserved_cost_buffer_usdc:0.94,
 latest_archive_date_utc:DAY,observations:[candidate]};
const instruments={code:'0',data:[{instType:'SPOT',instId:'BTC-USDC',state:'live',
 baseCcy:'BTC',quoteCcy:'USDC',minSz:'0.00001',lotSz:'0.00000001',tickSz:'0.01'}]};
const books={code:'0',data:[{ts:String(NOW-1000),
 bids:[['79900','2','0','1']],asks:[['80000','2','0','1']]}]};
assert.equal(gate.verifyInput(source).length,1);
assert.equal(gate.fixed('0.00000001'),10000000000n);
assert.equal(gate.fmt(gate.fixed('0.00000001')),'0.00000001');
let q=gate.assess(candidate,instruments,books,NOW);
assert.equal(q.status,'PUBLIC_BOOK_AND_SIZE_PAPER_SCREEN_PASSED',JSON.stringify(q));
assert.equal(q.book_publicly_verified,true);
assert.equal(q.native_pair_publicly_observed,true);
assert.equal(q.quote,'USDC');
assert.equal(q.hypothetical_buy_qty_base,'0.000125');
assert.equal(q.can_trade_10_usdc,false);
assert.equal(q.exact_contract_identity_proven,false);
assert.equal(q.trade_approved,false);
assert.equal(q.fees_currency_verified,false);
assert.equal(q.min_notional_rule_verified,false);
assert.equal(q.actual_profit_usdc,null);
assert.equal(q.real_order_sent,false);
assert(q.unverified_required.includes('exact_base_contract_identity'));
assert.equal(gate.assess(candidate,{...instruments,data:[{...instruments.data[0],instType:'SWAP'}]},books,NOW).status,'NO_PUBLIC_SPOT_USDC_PAIR_AT_CHECK');
assert.equal(gate.assess(candidate,{...instruments,data:[{...instruments.data[0],state:'preopen'}]},books,NOW).status,'NATIVE_RULES_UNVERIFIED');
assert.equal(gate.assess(candidate,instruments,{...books,data:[{...books.data[0],ts:String(NOW-50000)}]},NOW).status,'ORDER_BOOK_STALE_OR_UNDATED');
assert.equal(gate.assess(candidate,instruments,{...books,data:[{...books.data[0],bids:[['81000','1']]}]},NOW).status,'ORDER_BOOK_INVALID');
assert.equal(gate.assess(candidate,{code:'1',data:[]},books,NOW).status,'SOURCE_UNAVAILABLE');
assert.equal(gate.assess(candidate,instruments,{...books,data:[{...books.data[0],asks:[['80000','0.00001']]}]},NOW).status,'TOP_ASK_DEPTH_INSUFFICIENT');
const dust={...candidate,coin_id:'sample-token',symbol:'SAMP'};
const native={code:'0',data:[{instType:'SPOT',instId:'SAMP-USDC',state:'live',
 baseCcy:'SAMP',quoteCcy:'USDC',minSz:'10',lotSz:'0.01',tickSz:'0.0001'}]};
const dustBook={code:'0',data:[{ts:String(NOW-1000),
 bids:[['0.9980','300']],asks:[['0.9990','300']]}]};
assert.equal(gate.assess(dust,native,dustBook,NOW).status,'SELL_BELOW_NATIVE_MINIMUM_AFTER_ASSUMED_BASE_FEE');
assert.throws(()=>gate.verifyInput({...source,orders_enabled:true}));
assert.throws(()=>gate.verifyInput({...source,observations:[candidate,candidate]}));
assert.throws(()=>gate.verifyInput({...source,simulation_budget_usdc:50}));
assert.throws(()=>gate.fixed('1e-3'));
assert.throws(()=>gate.fixed('0.0000000000000000001'));
assert.equal(gate.endpoint('rules','BTC-USDC').includes('public/instruments?instType=SPOT'),true);
assert.equal(gate.endpoint('book','BTC-USDC').includes('market/books?instId=BTC-USDC'),true);
(async()=>{
 let calls=[];
 let snap=await gate.prepare(source,async url=>{
  calls.push(url);
  return url.includes('public/instruments')?instruments:books;
 },NOW);
 assert.equal(calls.length,2);
 assert.equal(snap.candidates.length,1);
 assert.equal(snap.real_orders_enabled,false);
 assert.equal(snap.real_orders_submitted,0);
 assert.equal(snap.paper_fills,0);
 assert.equal(snap.api_credentials_used,false);
 assert.equal(snap.profit_certified,false);
 assert.equal(snap.candidates[0].trade_approved,false);
 calls=[];
 const notSpot=await gate.prepare(source,async url=>{
  calls.push(url);return {code:'0',data:[]};
 },NOW);
 assert.equal(calls.length,1,'a missing SPOT pair must not request a book');
 assert.equal(notSpot.candidates[0].status,'NO_PUBLIC_SPOT_USDC_PAIR_AT_CHECK');
 console.log('Seven Spot Gate · public-only native USDC, minimum resale, futures exclusion, no account or orders PASS');
})().catch(e=>{console.error(e);process.exitCode=1});
