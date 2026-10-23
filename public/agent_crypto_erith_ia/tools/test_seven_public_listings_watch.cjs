'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {SCHEMA,parseOKX,parseBitget,parseOKXTickers,identity,makeReport}=require('./seven_public_listings_watch.cjs');
const root=path.resolve(__dirname,'..'),registry=JSON.parse(fs.readFileSync(path.join(root,'administrator/data/new-listings-identities.json'),'utf8'));
const t=Date.parse('2026-10-21T21:00:00Z'),listing=Date.parse('2026-10-21T13:00:00Z');
const okx={code:'0',data:[
 {instType:'SPOT',instId:'AXIS-USDC',baseCcy:'AXIS',quoteCcy:'USDC',listTime:String(listing),state:'live'},
 {instType:'SWAP',instId:'AXIS-USDT-SWAP',baseCcy:'AXIS',quoteCcy:'USDT',listTime:String(listing),state:'live'},
 {instType:'SPOT',instId:'BTC-USDT',baseCcy:'BTC',quoteCcy:'USDT',listTime:String(Date.parse('2020-01-01')),state:'live'},
 {instType:'SPOT',instId:'WAIT-USDC',baseCcy:'WAIT',quoteCcy:'USDC',listTime:String(t+DAY()),state:'preopen'}
]};
function DAY(){return 86400000}
const bitget={code:'00000',data:[
 {symbol:'AXISUSDT',baseCoin:'AXIS',quoteCoin:'USDT',launchTime:String(listing),status:'online',symbolType:'crypto',isRwa:'NO'},
 {symbol:'AXISUSDT',baseCoin:'AXIS',quoteCoin:'USDT',launchTime:String(listing),status:'online'},
 {symbol:'SWAPUSDT',baseCoin:'SWAP',quoteCoin:'USDT',launchTime:String(listing),status:'offline'},
 {symbol:'OTHERUSDT',baseCoin:'OTHER',quoteCoin:'USDT',launchTime:String(listing),status:'online',isRwa:'YES'}
]};
const a=parseOKX(okx,t),b=parseBitget(bitget,t);
assert.deepEqual(a.map(x=>x.providerSymbol),['AXIS-USDC']);
assert.deepEqual(b.map(x=>x.providerSymbol),['AXISUSDT']);
assert.equal(a[0].instrument_type,'SPOT');
assert.equal(b[0].listedAt,'2026-10-21T13:00:00.000Z');
assert.equal(identity(a[0],registry).canonicalId,null,'ticker-only OKX must not inherit Bitget AXIS token identity');
const canonical=identity(b[0],registry);
assert.equal(canonical.canonicalId,'axis-robotics');
assert.equal(canonical.image,'./assets/crypto/new-listings/axis-robotics.svg');
assert.equal(canonical.identity_status,'EXACT_CONTRACT_AND_VENUE_REGISTRY');
assert.equal(identity({...b[0],launchTime:listing-2*DAY()},registry).canonicalId,null);

const pricedOKX={code:'0',data:[
 {instType:'SPOT',instId:'AXIS-USDC',last:'0.45',open24h:'0.40',
  volCcy24h:'12000',bidPx:'0.44',askPx:'0.46',ts:String(t-60*1000)},
 {instType:'SWAP',instId:'AXIS-USDT-SWAP',last:'100',open24h:'90',
  volCcy24h:'100000',ts:String(t-60*1000)},
 {instType:'SPOT',instId:'OTHER-USDC',last:'0.2',open24h:'0.1',
  volCcy24h:'100',ts:String(t-30*60*1000)},
 {instType:'SPOT',instId:'BAD-USDC',last:'0',open24h:'0.1',
  volCcy24h:'100',ts:String(t-60*1000)}
]};
const accepted=parseOKXTickers(pricedOKX,t);
assert.deepEqual([...accepted.keys()],['AXIS-USDC']);
assert.equal(accepted.get('AXIS-USDC').quote,'USDC');
assert.equal(accepted.get('AXIS-USDC').last,'0.45');
assert.equal(accepted.get('AXIS-USDC').executable_price_verified,false);
assert.equal(accepted.get('AXIS-USDC').account_spot_access_verified,false);
const priced=makeReport({okx,bitget,okxTickers:pricedOKX,registry,now:t});
assert.equal(priced.watch_sources.okx_prices.status,'OK');
assert.equal(priced.watch_sources.okx_prices.count,1);
assert.equal(priced.entries.find(x=>x.provider==='okx')?.quote_snapshot?.instId,'AXIS-USDC');
assert.equal(priced.entries.find(x=>x.provider==='bitget')?.quote_snapshot,null);
assert.equal(priced.real_orders,0);
assert.equal(priced.quote_snapshot_is_non_executable_historic_observation,true);
const mismatched=makeReport({okx,bitget,okxTickers:{code:'0',data:[
 {instType:'SPOT',instId:'OTHER-USDC',last:'1',open24h:'1',volCcy24h:'1',ts:String(t)}
]},registry,now:t});
assert.equal(mismatched.entries.find(x=>x.provider==='okx')?.quote_snapshot,null);
const withoutQuotes=makeReport({okx,bitget,okxTickers:null,registry,now:t});
assert.equal(withoutQuotes.watch_sources.okx.status,'OK');
assert.equal(withoutQuotes.watch_sources.okx_prices.status,'UNAVAILABLE');
assert.equal(withoutQuotes.entries.find(x=>x.provider==='okx')?.quote_snapshot,null);

const initial=makeReport({okx,bitget,registry,now:t});
assert.equal(initial.schema,SCHEMA);
assert.equal(initial.entries.length,2);
assert.equal(initial.watch_sources.okx.status,'OK');
assert.equal(initial.watch_sources.bitget.status,'OK');
assert.equal(initial.spot_usdc_access_for_user_verified,false);
assert.equal(initial.trade_permission,false);
assert.equal(initial.real_orders,0);
assert.equal(initial.no_ticker_to_contract_identity_inference,true);
const partial=makeReport({okx:null,bitget,registry,previous:initial,now:t+DAY()});
assert.equal(partial.watch_sources.okx.status,'UNAVAILABLE');
assert.equal(partial.entries.find(x=>x.provider==='okx')?.stale,true);
assert.equal(partial.entries.find(x=>x.provider==='okx')?.state,'LAST_KNOWN_NOT_VERIFIED');
const gone=makeReport({okx:null,bitget,registry,previous:initial,now:t+3*DAY()});
assert(!gone.entries.some(x=>x.provider==='okx'),'stale venue cannot persist indefinitely');
assert.throws(()=>parseOKX({code:'1',data:[]},t));
assert.throws(()=>parseBitget({code:'1',data:[]},t));
const published=JSON.parse(fs.readFileSync(path.join(root,'administrator/data/new-listings-public-feed.json'),'utf8'));
assert.equal(published.schema,SCHEMA);
assert.equal(published.trade_permission,false);
assert.equal(published.real_orders,0);
console.log('Seven listing feed: exact Spot contracts, no SWAP, unique Bitget identity, stale venues marked, no orders PASS');
