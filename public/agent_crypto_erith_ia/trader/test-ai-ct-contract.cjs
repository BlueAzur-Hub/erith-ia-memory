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
