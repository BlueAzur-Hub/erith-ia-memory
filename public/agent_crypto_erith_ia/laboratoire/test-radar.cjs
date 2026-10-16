'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const reader=require('./radar.js');
const now=Date.UTC(2026,9,16,8,0,0);
const coins=Array.from({length:250},(_,i)=>({id:'asset-'+i,rank:i+1,
  name:i===0?'Bitcoin':'Asset '+i,symbol:i===0?'BTC':'X'+i,
  priceUsd:i+1,change24h:i/10-4,change7d:i/20,volume24hUsd:1000+i,
  lastUpdated:'2026-10-16T07:50:00Z'}));
const example={schema:'agent_crypto_public_market_snapshot_v1',source:{provider_id:'coingecko'},
  generated_at:'2026-10-16T07:51:00Z',coins};
const validated=reader.validMarket(example);
assert.equal(validated.rows.length,250);
for(const tier of reader.TIERS){
  const rows=reader.selectMarket(validated.rows,tier);
  assert.equal(rows.length,tier);
  assert.equal(rows.at(-1).rank,tier);
}
assert.equal(reader.selectMarket(validated.rows,20,'Bitcoin').length,1);
assert.equal(reader.selectMarket(validated.rows,10,'BTC')[0].rank,1);
assert.equal(reader.selectMarket(validated.rows,20,'','change24h')[0].rank,20);
assert.equal(reader.selectMarket(validated.rows,20,'','drop24h')[0].rank,1);
assert.throws(()=>reader.selectMarket(validated.rows,500),/invalide/i);
assert.throws(()=>reader.validMarket({...example,source:{provider_id:'unknown'}}),/canonique/i);
const clash=coins.map(v=>({...v}));clash[3].rank=1;
assert.throws(()=>reader.validMarket({...example,coins:clash}),/invalide/i);
const registries={schema:'agent_crypto_new_listings_identity_registry_v1',identities:{
 'magic-hash':{symbol:'MHA',displayName:'MAGNE.AI',coingeckoId:'magic-hash',verified:true},
 bogus:{symbol:'X',coingeckoId:'made-up',verified:false}
}};
const registry=reader.verifyRegistry(registries);
assert.equal(registry.size,1);
const launch=now-2*86400000;
const instruments={code:'00000',data:[
 {symbol:'MHAUSDT',baseCoin:'MHA',quoteCoin:'USDT',launchTime:launch,status:'online',symbolType:'crypto'},
 {symbol:'LITPERP',baseCoin:'LIT',quoteCoin:'USDT',launchTime:launch,status:'online',symbolType:'futures'},
 {symbol:'XYZUSDT',baseCoin:'XYZ',quoteCoin:'USDT',launchTime:now-4*86400000,status:'online',symbolType:'crypto'},
 {symbol:'OLDUSDT',baseCoin:'OLD',quoteCoin:'USDT',launchTime:now-35*86400000,status:'online',symbolType:'crypto'},
 {symbol:'RWAUSDT',baseCoin:'RWA',quoteCoin:'USDT',launchTime:launch,status:'online',symbolType:'crypto',isRwa:'YES'}
]};
const tickers={code:'00000',data:[
 {symbol:'MHAUSDT',lastPrice:'0.0037',turnover24h:'24000',price24hPcnt:'0.2'},
 {symbol:'LITPERP',lastPrice:'3.4',turnover24h:'200',price24hPcnt:'0.15'},
 {symbol:'XYZUSDT',lastPrice:'0.0041',turnover24h:'50',price24hPcnt:'-0.1'},
 {symbol:'OLDUSDT',lastPrice:'1',turnover24h:'100'},
 {symbol:'RWAUSDT',lastPrice:'2',turnover24h:'100'}
]};
const listings=reader.verifyBitget(instruments,tickers,registry,now);
assert.deepEqual(listings.map(x=>x.symbol).sort(),['MHA','XYZ']);
assert.equal(listings.find(x=>x.symbol==='MHA').identityProved,true);
assert.equal(listings.find(x=>x.symbol==='XYZ').identityProved,false);
assert.equal(listings.find(x=>x.symbol==='MHA').pair,'MHA/USDT');
assert.throws(()=>reader.verifyBitget({},tickers,registry,now),/invalides/i);
const paper=reader.verifyPaper({schema:'erith.btc-ct.hourly-paper.v1',
 simulation_only:true,orders_enabled:false,account_access:false,
 markets:{BTC:{decision:'WAIT',source_time:'2026-10-16T01:00:00Z',last_price_usdt:82000,closed:0},
 CT:{decision:'WAIT',source_time:'2026-10-16T01:00:00Z',last_price_usdt:.38,closed:0}}});
assert.equal(paper.CT.price,.38);
assert.equal(paper.BTC.quote,'USDT');
assert.throws(()=>reader.verifyPaper({orders_enabled:true}),/invalide/i);
const native=fs.readFileSync(path.resolve(__dirname,'../administrator/js/new-listings-native-category.js'),'utf8');
const html=fs.readFileSync(path.resolve(__dirname,'radar.html'),'utf8');
const js=fs.readFileSync(path.resolve(__dirname,'radar.js'),'utf8');
assert(native.includes('mountRadarLink()')&&native.includes('atlasPublicRadarLink'));
assert(native.includes('../laboratoire/radar.html'));
assert(html.includes('Top 10')&&html.includes('Top 20')&&html.includes('Top 50')&&html.includes('Top 250'));
assert(html.includes('new listings')||html.includes('nouveaux listings'));
assert(!js.includes('api/v5/trade/order'));
assert(!js.includes('secretKey'));
assert(!js.includes('api/v5/account/balance'));
assert(!js.includes('localStorage.'));
const tabStart=native.indexOf("function radarView(open)");
const tabEnd=native.indexOf("function mathSeriesSnapshot()",tabStart);
assert(tabStart>0&&tabEnd>tabStart);
const tab=native.slice(tabStart,tabEnd);
assert(tab.includes('marketSnapshotPanel'),"Radar is part of native Market");
assert(tab.includes('marketTools'),"Radar is inside the Market tools surface");
assert(tab.includes('atlasRadarMarketView'),"Radar has a named embedded panel");
assert(tab.includes('aria-pressed')&&tab.includes('aria-expanded'),"Radar tab has accessible state");
assert(tab.includes('frame.src=new URL("../laboratoire/radar.html?embed=1"'),"Radar reader is loaded lazily on open");
assert(tab.includes('view.hidden=!visible'),"Closing Radar restores canonical market table");
assert(tab.includes('if(state.radarOpen)radarView(false)'),"Market filter click returns to native table");
assert(tab.includes('if(state.enabled)'),"Returning to an active native New Listings does not toggle it off");
assert(tab.includes('Agrandir Radar ↗'),"Stand-alone large Radar remains available");
assert(!tab.includes('fetch(')&&!tab.includes('placeOrder')&&!tab.includes('localStorage.'),"No duplicated fetching, orders, or storage in embedded tab");
assert(html.includes('radar-embedded'),"Radar supports a compact presentation in Market");
assert(html.includes('location.search')&&html.includes('embed'),"Embed mode is opt-in");
assert(js.includes('registre inaccessible (chargement réseau ou publication)'),"Registry network errors are not incorrectly marked as invalid schema");
console.log('PASS Radar 10/20/50/250, real listing eligibility, PAPER, public-only integration');
