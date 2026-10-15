'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {btcPositionReport}=require('./trader-okx-account.js');
const now=Date.UTC(2026,9,15,8,30,0);
const account={ok:true,read_only:true,fetched_at:new Date(now-18000).toISOString()};
const holding=0.0001280278957421;
const matched={btc:holding,eur:10,timestamp:Date.UTC(2026,9,5,6,40,1)};
const quote={price:80000,source:'Binance Spot BTC/EUR',receivedAt:now-1000};
const ok={account,quantity:holding,ledger:{recordsCount:6,matched},ledgerCheckedAt:now-30000,quote,
  entryQuote:{timestamp:matched.timestamp,close:78107.98},executions:1};
test('BTC held and 10 EUR matched: classify only indicative difference, never certified profit',()=>{
 const v=btcPositionReport(ok,now),all=v.lines.join(' ');
 assert.equal(v.status,'estimated');assert.ok(v.indicative_delta_eur>0);
 assert.match(all,/Différence INDICATIVE/);assert.match(all,/ni un P&L net certifié/);
 assert.match(all,/PayPal/);assert.match(all,/BTC\/USDC/);
});
test('mismatched holding never claims total position profit',()=>{
 const v=btcPositionReport({...ok,quantity:holding/2},now);
 assert.equal(v.indicative_delta_eur,null);
 assert.match(v.lines.join(' '),/diffère du mouvement/);
});
test('ledger unavailable means acquisition unproven but public valuation remains qualified',()=>{
 const v=btcPositionReport({...ok,ledger:null},now),t=v.lines.join(' ');
 assert.equal(v.status,'partial');assert.equal(v.indicative_delta_eur,null);
 assert.match(t,/NON PROUVÉS/);assert.match(t,/Valeur indicatrice/);
});
test('stale quote not used in euro value or difference',()=>{
 const v=btcPositionReport({...ok,quote:{...quote,receivedAt:now-180000}},now);
 assert.equal(v.indicative_delta_eur,null);
 assert.match(v.lines.join(' '),/Valorisation BTC\/EUR indisponible/);
});
test('stale account must not display old private BTC figure',()=>{
 const v=btcPositionReport({...ok,account:{...account,fetched_at:new Date(now-180000).toISOString()}},now);
 assert.equal(v.status,'unavailable');assert.equal(v.indicative_delta_eur,null);
 assert.doesNotMatch(v.lines.join(' '),/0,000128/);
});
test('faked account rejects private balance',()=>{
 const v=btcPositionReport({...ok,account:{...account,read_only:false}},now);
 assert.equal(v.status,'unavailable');
});
test('ledger age disqualifies matched acquisition while leaving balance visible',()=>{
 const v=btcPositionReport({...ok,ledgerCheckedAt:now-3600000},now);
 assert.equal(v.indicative_delta_eur,null);
 assert.match(v.lines.join(' '),/NON PROUVÉS/);
});
test('no BTC position never invents performance',()=>{
 const v=btcPositionReport({...ok,quantity:0},now);
 assert.equal(v.status,'empty');assert.equal(v.indicative_delta_eur,null);
});
test('missing BTC cannot be turned into zero',()=>{
 const v=btcPositionReport({...ok,quantity:null},now);
 assert.equal(v.status,'unavailable');
});
