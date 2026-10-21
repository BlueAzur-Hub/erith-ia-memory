'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const api=require('./ai-ct-contract.js');
const now=Date.UTC(2026,9,13,5,0,0);
const acct={ok:true,read_only:true,fetched_at:new Date(now).toISOString(),trading:[{details:[{ccy:'CT',cashBal:'9.99'}]}],funding:[]};
const fills={ok:true,read_only:true,fills_3m:[{instId:'CT-USDC',side:'buy',tradeId:'123',fillPx:'0.3522',fillSz:'10',fee:'-0.01',feeCcy:'CT'}]};
const fees={ok:true,read_only:true,instId:'CT-USDC',fees:[{taker:'-0.002'}]};
const book={status:'ok',provider:'okx',pair:'CT-USDC',quote:'USDC',observed_at_utc:new Date(now-1500).toISOString(),bids:[['0.355','100']]};
test('solde OKX CT et coût acquisition net reconcilié',()=>{
 const r=api.compose({account:acct,fills,fees,book},now);
 assert.equal(r.position.qty_ct,9.99);assert.equal(r.acquisition.status,'reconciled_fills_only');
 assert.ok(Math.abs(r.acquisition.spent_usdc-3.522)<1e-9);assert.equal(r.fee_taker_fraction,.002);
 assert.ok(r.pnl_illustrative_usdc!==null); assert.equal(r.orders_enabled,false);
});
test('sans solde vérifié, refus',()=>assert.throws(()=>api.compose({account:{},fills,fees,book},now)));
test('ne jamais confondre CT-USDT et CT-USDC',()=>{
 const r=api.compose({account:acct,fills,fees,book:{...book,pair:'CT-USDT'}},now);
 assert.equal(r.liquidation_illustrative.status,'unknown');assert.equal(r.pnl_illustrative_usdc,null);
});
test('carnet périmé et profondeur insuffisante refusés',()=>{
 const stale=api.compose({account:acct,fills,fees,book:{...book,observed_at_utc:new Date(now-23000).toISOString()}},now);
 assert.equal(stale.pnl_illustrative_usdc,null);
 const shallow=api.compose({account:acct,fills,fees,book:{...book,bids:[['0.355','4']] }},now);
 assert.equal(shallow.pnl_illustrative_usdc,null);
});
test('frais non prouvés, pas de gain chiffré',()=>{
 const r=api.compose({account:acct,fills,fees:null,book},now);
 assert.equal(r.fee_taker_fraction,null);assert.equal(r.pnl_illustrative_usdc,null);
});
test('solde et transactions discordants, pas de coût annoncé',()=>{
 const r=api.compose({account:{...acct,trading:[{details:[{ccy:'CT',cashBal:'8'}]}]},fills,fees,book},now);
 assert.equal(r.acquisition.status,'unknown');assert.equal(r.pnl_illustrative_usdc,null);
});
test('vendre sur prix acheteur, consommation de plusieurs niveaux',()=>{
 const r=api.compose({account:acct,fills,fees,book:{...book,bids:[['0.355','4'],['0.354','9']] }},now);
 assert.equal(r.liquidation_illustrative.status,'indicative');
 assert.ok(r.liquidation_illustrative.net_usdc>0);
});
test('pas de solde zéro imaginaire lorsque CT absent',()=>{
 const r=api.compose({account:{...acct,trading:[]},fills,fees,book},now);
 assert.equal(r.position.qty_ct,null);assert.equal(r.pnl_illustrative_usdc,null);
});
test('fills partiellement disponibles => coûts non prouvés',()=>{
 const r=api.compose({account:acct,fills:{...fills,fills_3m:[]},fees,book},now);
 assert.equal(r.acquisition.status,'unknown');assert.equal(r.pnl_illustrative_usdc,null);
});
test('en cas de vente partielle, calcul d’acquisition refuse',()=>{
 const r=api.compose({account:acct,fills:{...fills,fills_3m:[...fills.fills_3m,{...fills.fills_3m[0],side:'sell',tradeId:'125'}]},fees,book},now);
 assert.equal(r.acquisition.status,'unknown');
});
test('solde périmé refusé',()=>{
 const old={...acct,fetched_at:new Date(now-180000).toISOString()};
 assert.throws(()=>api.compose({account:old,fills,fees,book},now),/ancien/);
});
test('frais manquants sur execution refusés',()=>{
 const missing={...fills,fills_3m:[{...fills.fills_3m[0],fee:undefined}]};
 const r=api.compose({account:acct,fills:missing,fees,book},now);
 assert.equal(r.acquisition.status,'unknown');
});

test('un relevé privé commun expose BTC, CT, USDC, EUR sans conversion',()=>{
 const mixed={...acct,trading:[{details:[{ccy:'CT',cashBal:'9.99'},{ccy:'BTC',cashBal:'0.0001'},{ccy:'USDC',cashBal:'0.6'}]}],funding:[{ccy:'EUR',bal:'10'},{ccy:'BTC',bal:'0.00002'}]};
 const r=api.compose({account:mixed,fills,fees,book},now);
 assert.equal(r.portfolio.assets.CT.qty,9.99);
 assert.ok(Math.abs(r.portfolio.assets.BTC.qty-0.00012)<1e-12);
 assert.equal(r.portfolio.assets.USDC.qty,.6);
 assert.equal(r.portfolio.assets.EUR.qty,10);
 assert.equal(r.portfolio.read_only,true);assert.equal(r.orders_enabled,false);
});
test('devise absente non convertie en solde fictif zéro',()=>{
 const r=api.compose({account:acct,fills,fees,book},now);
 assert.equal(r.portfolio.assets.BTC.qty,null);
 assert.equal(r.portfolio.assets.BTC.verified,false);
});
test('BTC non valide reste inconnu, CT vérifié reste exploitable',()=>{
 const invalid={...acct,trading:[{details:[{ccy:'CT',cashBal:'9.99'},{ccy:'BTC',cashBal:'unknown'}]}]};
 const r=api.compose({account:invalid,fills,fees,book},now);
 assert.equal(r.portfolio.assets.CT.qty,9.99);
 assert.equal(r.portfolio.assets.BTC.qty,null);
});
test('un faux relevé privé est refusé',()=>assert.throws(()=>api.portfolio({ok:true,read_only:false}),/non vérifié/));

test('Seven relie solde CT, frais, revente et fenêtre publique sans ordre',()=>{
 const doc=api.compose({account:acct,fills,fees,book},now);
 assert.equal(doc.exit_metrics.best_bid_usdc_ct,.355);
 assert.ok(Math.abs(doc.exit_metrics.weighted_exit_usdc_ct-.355)<1e-10);
 assert.equal(doc.exit_metrics.book_impact_pct,0);
 const candles=api.publicCandles({mode:'candles',loadedInstrument:'CT-USDT',loadedBar:'5m',rows:[
   {t:now-300000,c:.32,v:10},{t:now-60000,c:.34,v:20}],source:'OKX CT-USDT'},now);
 assert.equal(candles.status,'observed');
 const report=api.explain(doc,candles);
 assert.equal(report.read_only,true);
 assert.match(report.lines.join(' '),/Revente FICTIVE/);
 assert.match(report.lines.join(' '),/Contexte marché public/);
 assert.match(report.lines.join(' '),/aucune exécution garantie/i);
});
test('deux niveaux du carnet impliquent un impact et un spread mesurés',()=>{
 const b={...book,bids:[['0.355','4'],['0.350','12']],asks:[['0.360','20']]};
 const doc=api.compose({account:acct,fills,fees,book:b},now);
 assert.ok(doc.exit_metrics.book_impact_pct>0);
 assert.ok(doc.exit_metrics.spread_pct>0);
 assert.ok(doc.exit_metrics.weighted_exit_usdc_ct<doc.exit_metrics.best_bid_usdc_ct);
});
test('carnet expiré ou acquisition non prouvée : refus de faux gains',()=>{
 const stale=api.compose({account:acct,fills,fees,book:{...book,observed_at_utc:new Date(now-45000).toISOString()}},now);
 assert.equal(stale.exit_metrics,null);
 assert.match(api.explain(stale).lines.join(' '),/Revente fictive NON CALCULABLE/);
 const missing=api.compose({account:acct,fills:null,fees,book},now);
 assert.match(api.explain(missing).lines.join(' '),/Coût d’acquisition NON PROUVÉ/);
 assert.match(api.explain(missing).lines.join(' '),/Gain \/ perte NON CALCULABLE/);
});
test('aucune bougie BTC ou en mode Ligne sous le titre CT/USDT',()=>{
 const snap={mode:'candles',loadedInstrument:'BTC-USDT',loadedBar:'5m',rows:[
   {t:now-100000,c:100,v:12},{t:now-1000,c:101,v:5}]};
 assert.equal(api.publicCandles(snap,now).status,'unavailable');
 assert.equal(api.publicCandles({...snap,loadedInstrument:'CT-USDT',mode:'native'},now).status,'unavailable');
});
test('courbe publique ancienne ou horodatage incohérent non validés',()=>{
 const old={mode:'candles',loadedInstrument:'CT-USDT',loadedBar:'5m',rows:[
   {t:now-3600000,c:.31,v:10},{t:now-3300000,c:.32,v:15}]};
 assert.equal(api.publicCandles(old,now).status,'stale');
 assert.equal(api.publicCandles({...old,rows:[old.rows[1],old.rows[0]]},now).status,'unavailable');
 const doc=api.compose({account:acct,fills,fees,book},now);
 assert.match(api.explain(doc,api.publicCandles(old,now)).lines.join(' '),/trop ancien/);
});
test('un faux contrat privé ne produit pas de rapport Seven',()=>{
 assert.throws(()=>api.explain({schema:'public',read_only:false}),/non validé/);
});


test('generic Spot rules are byte-for-byte compatible with existing CT/USDC',()=>{
 const row={instId:'CT-USDC',instType:'SPOT',state:'live',
  baseCcy:'CT',quoteCcy:'USDC',minSz:'10',lotSz:'0.01',tickSz:'0.0001'};
 const src={observed_at_utc:new Date(now-1000).toISOString(),
  payload:{code:'0',data:[row]}};
 const legacy=api.spotTradingRules(src,now);
 const generic=api.spotTradingRulesFor({base:'CT',quote:'USDC',venue:'okx'},src,now);
 assert.deepEqual(generic,legacy);
 assert.deepEqual(api.assessSpotQuantityFor(9.99,generic),api.assessSpotQuantity(9.99,legacy));
 assert.equal(api.assessSpotQuantityFor(9.99,generic).status,'below_minimum');
 assert.equal(api.assessSpotQuantityFor(10.01,generic).status,'size_matches');
 assert.equal(api.assessSpotQuantityFor(10.005,generic).status,'invalid_step');
 assert.equal(api.assessSpotQuantityFor(10.01,generic).message,
  'Quantité conforme aux filtres vérifiés ; exécution NON garantie');
});
test('same CT validator handles BTC and ETH without modifying their decimals',()=>{
 for(const [base,quote,minSz,lotSz,tickSz,qty] of [
  ['BTC','USDC','0.0001','0.00000001','0.1',0.00012],
  ['ETH','USDC','0.001','0.000001','0.01',0.002],
  ['SOL','USDT','0.01','0.001','0.0001',1.111]
 ]){
  const market=base+'-'+quote;
  const row={instId:market,instType:'SPOT',state:'live',
   baseCcy:base,quoteCcy:quote,minSz,lotSz,tickSz,
   observed_at_utc:new Date(now-1000).toISOString()};
  const rules=api.spotTradingRulesFor({base,quote,venue:'okx'},row,now);
  assert.equal(rules.status,'verified',market);
  assert.equal(rules.market,market);
  assert.equal(rules.min_sz,minSz);
  assert.equal(rules.lot_sz,lotSz);
  assert.equal(rules.tick_sz,tickSz);
  assert.equal(api.assessSpotQuantityFor(qty,rules).status,'size_matches');
  assert.equal('orders_enabled' in rules,false);
 }
});
test('source provider and pair identities must match; Bitget gets no invented OKX rules',()=>{
 const row={instId:'ETH-USDC',instType:'SPOT',state:'live',
  baseCcy:'ETH',quoteCcy:'USDC',minSz:'0.001',lotSz:'0.0001',tickSz:'0.01',
  observed_at_utc:new Date(now-1000).toISOString()};
 for(const context of [
  {base:'DNA',quote:'USDT',venue:'bitget'},
  {base:'ETH',quote:'USDC',venue:'bitget'},
  {base:'BTC',quote:'USDC',venue:'okx'},
  {base:'ETH',quote:'USDT',venue:'okx'}
 ]){
  assert.equal(api.spotTradingRulesFor(context,row,now).status,'unverified');
 }
 for(const invalid of [
  {...row,baseCcy:'BTC'},
  {...row,quoteCcy:'USDT'},
  {...row,observed_at_utc:new Date(now-300000).toISOString()},
  {...row,state:'not_a_real_state'}
 ]){
  assert.equal(api.spotTradingRulesFor({base:'ETH',quote:'USDC',venue:'okx'},invalid,now).status,'unverified');
 }
 const paused={...row,state:'suspend'};
 const rules=api.spotTradingRulesFor({base:'ETH',quote:'USDC',venue:'okx'},paused,now);
 assert.equal(rules.status,'verified');
 assert.equal(api.assessSpotQuantityFor(1,rules).status,'not_live');
});
test('same rules API preserves high precision but never guesses a tradable quantity',()=>{
 const pair='BTC-USDC';
 const row={instId:pair,instType:'SPOT',state:'live',
  baseCcy:'BTC',quoteCcy:'USDC',minSz:'0.000000000000000001',
  lotSz:'0.000000000000000001',tickSz:'0.000000000000000001',
  observed_at_utc:new Date(now-1000).toISOString()};
 const rules=api.spotTradingRulesFor({base:'BTC',quote:'USDC',venue:'okx'},row,now);
 assert.equal(rules.status,'verified');
 assert.equal(api.assessSpotQuantityFor(0.00001,rules).status,'unverified',
  'legacy 12-decimal quantity checker must not pretend to validate a finer lot');
});


test('CT acquisition output is identical through the generalized source-of-truth',()=>{
 const legacy=api.acquisition(fills,9.99);
 const shared=api.acquisitionFor({base:'CT',quote:'USDC',venue:'okx'},fills,9.99);
 assert.equal(shared.status,legacy.status);
 assert.equal(shared.net_acquired_base,legacy.net_acquired_ct);
 assert.equal(shared.spent_quote,legacy.spent_usdc);
 assert.equal(shared.cost_per_base_quote,legacy.cost_per_ct_usdc);
 assert.equal(shared.observed_buy_base_fee_pct,legacy.observed_buy_ct_fee_pct);
 assert.equal(shared.observed_buy_base_fee_qty,legacy.observed_buy_ct_fee_qty);
 assert.equal(shared.historical_gross_base,legacy.historical_gross_ct);
 assert.equal(shared.fill_count,legacy.fill_count);
 assert.equal(shared.caveat,legacy.caveat);
 assert.equal(shared.profit_proven,false);
});
test('the exact CT acquisition algorithm is available to BTC ETH and SOL',()=>{
 for(const [base,quote,size,price,fee,held] of [
  ['BTC','USDC','0.002','82700','-0.000002',0.001998],
  ['ETH','USDC','2','2400','-0.002',1.998],
  ['SOL','USDT','10','150','-0.01',9.99]
 ]){
  const pair=base+'-'+quote;
  const source={ok:true,read_only:true,fills_3m:[
   {instId:pair,side:'buy',tradeId:'receipt-1',
    fillPx:price,fillSz:size,fee,feeCcy:base}]};
  const result=api.acquisitionFor({base,quote,venue:'okx'},source,held);
  assert.equal(result.status,'reconciled_fills_only',pair);
  assert.equal(result.market,pair);
  assert.ok(result.spent_quote>0);
  assert.equal(result.net_acquired_base,held);
  assert.equal(result.orders_enabled,false);
  assert.equal(result.profit_proven,false);
 }
});
test('cross-market, Bitget without OKX proof, mixed fills and missing position refuse acquisition',()=>{
 const source={ok:true,read_only:true,fills_3m:[
  {instId:'ETH-USDC',side:'buy',tradeId:'a',fillPx:'2440',
   fillSz:'1',fee:'0',feeCcy:'ETH'}]};
 const context={base:'ETH',quote:'USDC',venue:'okx'};
 for(const bad of [
  [context,source,null],
  [{...context,quote:'USDT'},source,1],
  [{...context,venue:'bitget'},source,1],
  [context,{...source,read_only:false},1],
  [context,{...source,fills_3m:[...source.fills_3m,
    {...source.fills_3m[0],side:'sell',tradeId:'b'}]},1],
  [context,{...source,fills_3m:[...source.fills_3m,
    {...source.fills_3m[0]}]},2],
  [context,{...source,fills_3m:[{...source.fills_3m[0],
    feeCcy:'USDT',fee:'-0.1'}]},1],
  [context,source,0]
 ]){
  const result=api.acquisitionFor(...bad);
  assert.equal(result.status,'unknown');
  assert.ok(!Object.hasOwn(result,'spent_quote'));
 }
});
