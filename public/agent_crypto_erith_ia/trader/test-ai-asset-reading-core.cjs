'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {createReading}=require('./ai-asset-reading-core.js');
const NOW=Date.parse('2026-10-21T06:30:00Z'),ISO=new Date(NOW-1000).toISOString();
function fixture(base='BTC',id='bitcoin',quote='USDC'){
 const pair=base+'-'+quote;
 return {
  selection:{symbol:base,id,quote},
  market:{id,symbol:base,priceUsd:base==='BTC'?82700:2443.1,
   change24h:1.5,usdSource:'CoinGecko USD',usdUpdatedAt:ISO},
  chart:{loadedInstrument:base+'-'+quote,mode:'candles',loadedBar:'5m',
   rows:[{o:80000,h:81000,l:79000,c:80500,v:10,t:NOW-30000}]},
  rules:{instId:pair,instType:'SPOT',state:'live',baseCcy:base,
   quoteCcy:quote,minSz:base==='BTC'?'0.0001':'0.001',
   lotSz:base==='BTC'?'0.00000001':'0.000001',tickSz:'0.1',
   observed_at_utc:ISO},
  book:{status:'ok',provider:'okx',pair,quote,
   observed_at_utc:ISO,bids:[['80000','0.01'],['79900','1']],
   asks:[['80010','0.02'],['80020','1']]},
  account:{instId:pair,read_only:true,orders_enabled:false,real_orders:0,
   verified:true,account_at_utc:ISO,
   trading_available_quote:'3.2',funding_available_quote:'1.18668749',
   fee_pair_verified:true,fee_maker_rate:'0.0008',fee_taker_rate:'0.001'},
  position:{pair,read_only:true,verified:true,observed_at_utc:ISO,
   trading_base:base==='BTC'?'0.002':'0.4',funding_base:'0.001'},
  now:NOW
 };
}
test('BTC dossier has complete CT-equivalent sections without touching CT',()=>{
 const doc=createReading(fixture());
 assert.equal(doc.status,'PAPER_READ_ONLY');
 assert.deepEqual(doc.sections.map(s=>s.label),[
  'Lecture Technique','Fiche publique','Position personnelle','Règles OKX',
  'Simulations de revente','Analyse Seven','Cas d école']);
 assert.equal(doc.asset.pair,'BTC-USDC');
 assert.equal(doc.public.best_bid_quote,'80000');
 assert.equal(doc.public.min_size_base,'0.0001');
 assert.equal(doc.private.trading_quote,'3.2');
 assert.equal(doc.private.funding_quote,'1.18668749');
 assert.equal(doc.private.trading_base,'0.002');
 assert.equal(doc.private.funding_base,'0.001');
 assert.equal(doc.private.fee_currency_verified,false);
 assert.equal(doc.private.max_buy_verified,false);
 assert.equal(doc.private.pnl_proven,false);
 assert.equal(doc.private.pnl,null);
 assert.equal(doc.orders_enabled,false);
 assert.equal(doc.transfer_enabled,false);
 assert.equal(doc.executable,false);
});
test('PAPER sale fractions use only Trading BTC, exact bid depth and preserve decimals',()=>{
 const doc=createReading(fixture());
 assert.deepEqual(doc.simulations.map(s=>s.percent),[25,50,100]);
 assert.deepEqual(doc.simulations.map(s=>s.quantity_base),['0.0005','0.001','0.002']);
 assert.deepEqual(doc.simulations.map(s=>s.gross_quote),['40','80','160']);
 for(const s of doc.simulations){
  assert.equal(s.status,'GROSS_ONLY');
  assert.equal(s.net_quote,null);
  assert.equal(s.orders_enabled,false);
 }
});
test('same engine works for ETH without treating it as CT or BTC',()=>{
 const f=fixture('ETH','ethereum');
 f.book.bids=[['2440','0.2'],['2439','1']];
 f.book.asks=[['2441','1']];
 const d=createReading(f);
 assert.equal(d.asset.base,'ETH');
 assert.equal(d.asset.pair,'ETH-USDC');
 assert.equal(d.private.trading_base,'0.4');
 assert.equal(d.simulations[0].quantity_base,'0.1');
 assert.equal(d.simulations[0].gross_quote,'244');
 assert.equal(d.orders_enabled,false);
});
test('Concrete legacy is protected, not overwritten by the generic reader',()=>{
 const d=createReading(fixture('CT','concrete'));
 assert.equal(d.status,'CT_PROTECTED');
 assert.equal(d.orders_enabled,false);
 assert.equal(d.sections.length,0);
 const legacy=fs.readFileSync(path.join(__dirname,'ai-ct-panel.js'),'utf8');
 assert.match(legacy,/Lire ma position CT\/USDC/);
 assert.match(legacy,/async function loadCtEvidence\(\)/);
 assert.doesNotMatch(legacy,/AgentCryptoAiAssetReading/);
});
test('wrong Market id is blocked; wrong chart never borrows OHLC',()=>{
 const f=fixture();f.market.id='ethereum';
 assert.equal(createReading(f).status,'MARKET_MISMATCH');
 const g=fixture();g.chart.loadedInstrument='CT-USDT';
 const d=createReading(g);
 assert.equal(d.public.chart_source_verified,false);
 assert.match(d.public.chart_warning,/différentes de BTC/);
 assert.equal(d.public.book_verified,true);
});
test('chart pairing alone is not a verified data source or timestamp',()=>{
 const f=fixture();
 const guess=createReading(f);
 assert.equal(guess.public.chart_identity_matched,true);
 assert.equal(guess.public.chart_source_verified,false);
 f.chart.source_verified=true;
 f.chart.provider='okx';
 f.chart.observed_at_utc=ISO;
 assert.equal(createReading(f).public.chart_source_verified,true);
 f.chart.observed_at_utc=new Date(NOW-3600000).toISOString();
 assert.equal(createReading(f).public.chart_source_verified,false);
});
test('account and base holding proofs must match the same exact Spot pair',()=>{
 const f=fixture();f.account.instId='CT-USDC';f.position.pair='CT-USDC';
 const d=createReading(f);
 assert.equal(d.private.quote_account_verified,false);
 assert.equal(d.private.base_position_verified,false);
 assert.equal(d.private.trading_base,null);
 assert.equal(d.private.trading_quote,null);
 assert.deepEqual(d.simulations.map(s=>s.status),Array(3).fill('POSITION_UNVERIFIED'));
});
test('Funding is separated and never sells or transfers automatically',()=>{
 const f=fixture();f.position.trading_base='0';f.position.funding_base='0.01';
 const d=createReading(f);
 assert.equal(d.private.total_base,'0.01');
 assert.equal(d.private.trading_base,'0');
 assert.deepEqual(d.simulations.map(s=>s.status),Array(3).fill('FUNDING_ONLY'));
});
test('verified zero remains zero while an absent balance stays unknown',()=>{
 const f=fixture();f.position.trading_base='0';f.position.funding_base='0';
 const d=createReading(f);
 assert.equal(d.private.base_position_verified,true);
 assert.equal(d.private.total_base,'0');
 assert.equal(d.simulations[0].status,'NO_TRADING_POSITION');
 f.position.trading_base=null;
 const u=createReading(f);
 assert.equal(u.private.base_position_verified,false);
 assert.equal(u.private.total_base,null);
});
test('minimum lot filter applies separately to fractional sales',()=>{
 const f=fixture();f.position.trading_base='0.0002';f.position.funding_base='0';
 const d=createReading(f);
 assert.equal(d.simulations[0].status,'BELOW_MINIMUM');
 assert.equal(d.simulations[0].quantity_base,'0.00005');
 assert.equal(d.simulations[1].status,'GROSS_ONLY');
});
test('public book wrong pair, quote, crossed, stale or thin refuses gross valuation',()=>{
 for(const mutate of [
  f=>{f.book.pair='CT-USDC';},
  f=>{f.book.quote='USDT';},
  f=>{f.book.bids=[['90000','1']];},
  f=>{f.book.observed_at_utc=new Date(NOW-60000).toISOString();},
  f=>{f.book.bids=[['80000','0.00001']];}
 ]){
  const f=fixture();mutate(f);const d=createReading(f);
  if(d.public.book_verified===false)
   assert.deepEqual(d.simulations.map(s=>s.status),Array(3).fill('PUBLIC_EVIDENCE_MISSING'));
  else assert.equal(d.simulations[2].status,'BOOK_DEPTH_INSUFFICIENT');
  assert.equal(d.simulations[2].net_quote,null);
 }
});
test('fee rate alone cannot certify fee currency or realized net',()=>{
 const f=fixture();f.account.fee_pair_verified=true;
 const d=createReading(f);
 assert.equal(d.private.maker_rate,'0.0008');
 assert.equal(d.private.taker_rate,'0.001');
 assert.equal(d.private.fee_currency_verified,false);
 assert.equal(d.simulations[2].net_quote,null);
});
test('stale account/rules and invalid numeric values fail closed',()=>{
 const f=fixture();f.account.account_at_utc=new Date(NOW-180000).toISOString();
 f.rules.observed_at_utc=new Date(NOW-180000).toISOString();
 f.position.trading_base='1.2e-3';
 const d=createReading(f);
 assert.equal(d.private.quote_account_verified,false);
 assert.equal(d.public.rules_verified,false);
 assert.equal(d.private.base_position_verified,false);
 assert.equal(d.simulations[0].status,'POSITION_UNVERIFIED');
});


test('Seven BTC and ETH use CT-origin shared Spot filter values, not a second rules algorithm',()=>{
 const contract=require('./ai-ct-contract.js');
 for(const [base,id] of [['BTC','bitcoin'],['ETH','ethereum']]){
  const f=fixture(base,id);
  const validated=contract.spotTradingRulesFor({base,quote:'USDC',venue:'okx'},f.rules,f.now);
  const study=createReading(f);
  assert.equal(validated.status,'verified');
  assert.equal(study.public.rules_verified,true);
  assert.equal(study.public.min_size_base,validated.min_sz);
  assert.equal(study.public.lot_size_base,validated.lot_sz);
  assert.equal(study.public.tick_size_quote,validated.tick_sz);
  assert.equal(study.asset.pair,validated.market);
 }
});
test('Seven cannot use a different quote, paused venue or missing base/quote evidence',()=>{
 const f=fixture('ETH','ethereum');
 for(const altered of [
  {...f.rules,baseCcy:'BTC'},
  {...f.rules,quoteCcy:'USDT'},
  {...f.rules,state:'suspend'},
  {...f.rules,baseCcy:undefined},
  {...f.rules,lotSz:'0.0000000000000000001'}
 ]){
  const d=createReading({...f,rules:altered});
  assert.equal(d.public.rules_verified,false);
  assert.deepEqual(d.simulations.map(x=>x.status),Array(3).fill('PUBLIC_EVIDENCE_MISSING'));
  assert.equal(d.orders_enabled,false);
 }
});
