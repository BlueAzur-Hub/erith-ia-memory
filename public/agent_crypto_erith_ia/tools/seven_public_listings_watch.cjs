'use strict';
/* ERITH.IA Seven · public Spot listings catalogue.
   Runs in GitHub Actions, NOT in a Firefox timer. Read-only sources, exact
   instrument identity only; never equate exchange tickers to token contracts. */
const fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const REGISTRY=path.join(ROOT,'administrator/data/new-listings-identities.json');
const FILE=path.join(ROOT,'administrator/data/new-listings-public-feed.json');
const SCHEMA='erith.seven.public-spot-listings-feed.v1';
const DAY=86400000,HORIZON=30*DAY;
const allowedQuote=new Set(['USDC','USDT','USD']);
const upper=x=>String(x??'').trim().toUpperCase();
const nameSafe=s=>/^[A-Z0-9]{2,15}$/.test(s);
const ms=s=>{const v=Number(s);return Number.isSafeInteger(v)&&v>0?v:null;};
const iso=t=>new Date(t).toISOString();
function parseOKX(doc,now=Date.now()){
 if(doc?.code!=='0'||!Array.isArray(doc.data))throw Error('OKX public instruments unavailable');
 const out=[],seen=new Set();
 for(const r of doc.data){
  const base=upper(r.baseCcy),quote=upper(r.quoteCcy),
   sym=upper(r.instId),time=ms(r.listTime),continuous=ms(r.contTdSwTime);
  if(r.instType!=='SPOT'||r.state!=='live'||!nameSafe(base)||
      !allowedQuote.has(quote)||sym!==base+'-'+quote||
      !time||time>now||now-time>HORIZON||
      (continuous&&continuous>now)||seen.has(sym))continue;
  seen.add(sym);
  out.push({provider:'okx',instrument_type:'SPOT',base,quote,
   providerSymbol:sym,pair:base+'/'+quote,listedAt:iso(continuous||time),
   launchTime:continuous||time,state:'live',
   country_eligibility_verified:false,account_spot_access_verified:false,
   market_rules_verified_for_user:false});
 }
 return out.sort((a,b)=>b.launchTime-a.launchTime).slice(0,200);
}
function parseBitget(doc,now=Date.now()){
 if(String(doc?.code)!=='00000'||!Array.isArray(doc.data))
  throw Error('Bitget public Spot instruments unavailable');
 const out=[],seen=new Set();
 for(const r of doc.data){
  const base=upper(r.baseCoin),quote=upper(r.quoteCoin),symbol=upper(r.symbol),time=ms(r.launchTime);
  if(!nameSafe(base)||!allowedQuote.has(quote)||symbol!==base+quote||
      !time||time>now||now-time>HORIZON||
      String(r.status||'').toLowerCase()!=='online'||
      String(r.symbolType||'crypto').toLowerCase()!=='crypto'||
      upper(r.isRwa||'NO')==='YES'||seen.has(symbol))continue;
  seen.add(symbol);
  out.push({provider:'bitget',instrument_type:'SPOT',base,quote,
   providerSymbol:symbol,pair:base+'/'+quote,listedAt:iso(time),
   launchTime:time,state:'live',
   country_eligibility_verified:false,account_spot_access_verified:false,
   market_rules_verified_for_user:false});
 }
 return out.sort((a,b)=>b.launchTime-a.launchTime).slice(0,200);
}
function identity(entry,registry){
  // A ticker alone is NOT an identity. Manual registry must explicitly prove
  // venue, instrument, launch date, and token contract for an exact match.
  const pairs=Object.entries(registry?.identities||{}).filter(([id,r])=>
    r?.verified===true&&r?.venue?.toLowerCase()===entry.provider&&
    r?.spotPair===entry.pair&&upper(r?.symbol)===entry.base&&
    typeof r?.contract==='string'&&r.contract.length>20&&
    Number.isFinite(Date.parse(r?.listingUtc))&&
    Math.abs(Date.parse(r.listingUtc)-entry.launchTime)<=DAY);
  if(pairs.length!==1)return {canonicalId:null,identity_status:'VENUE_SYMBOL_ONLY',
    image:null,logo_status:'UNVERIFIED_SYMBOL_FALLBACK'};
  const [canonicalId,row]=pairs[0];
  return {canonicalId,identity_status:'EXACT_CONTRACT_AND_VENUE_REGISTRY',
    image:typeof row.image==='string'&&
      /^\.\/assets\/crypto\/new-listings\/[a-z0-9._-]+\.(?:png|svg)$/.test(row.image)?
      row.image:null,logo_status:'VERIFIED_GITHUB_ASSET'};
}
function makeReport({okx,bitget,registry={},previous=null,now=Date.now()}){
 const scans={};const all=[];
 for(const [name,input] of Object.entries({okx,bitget})){
  try{
   const entries=name==='okx'?parseOKX(input,now):parseBitget(input,now);
   scans[name]={status:'OK',at_utc:iso(now),count:entries.length,
     evidence:name==='okx'?'OKX public instruments instType=SPOT':
       'Bitget public market/instruments category=SPOT'};
   all.push(...entries);
  }catch(_){
   scans[name]={status:'UNAVAILABLE',at_utc:iso(now),count:0,
     evidence:'Public exchange source missing or rejected; no availability claims'};
  }
 }
 const unique=new Map();
 for(const row of all){
  const key=row.provider+':'+row.providerSymbol;
  unique.set(key,{...row,...identity(row,registry),
    scanned_at_utc:iso(now),stale:false});
 }
 // Keep a short previously verified public record when an exchange is down,
 // but explicitly mark it stale and NEVER imply live tradability.
 if(previous?.schema===SCHEMA&&Array.isArray(previous.entries)){
  for(const row of previous.entries){
   if(scans[row?.provider]?.status!=='UNAVAILABLE')continue;
   const t=Date.parse(row?.scanned_at_utc||'');
   if(!Number.isFinite(t)||now-t>DAY*2||now-t<0||
      row.instrument_type!=='SPOT'||!nameSafe(row.base)||
      !allowedQuote.has(row.quote)||
      !['okx','bitget'].includes(row.provider))continue;
   const key=row.provider+':'+row.providerSymbol;
   if(!unique.has(key))unique.set(key,{...row,stale:true,state:'LAST_KNOWN_NOT_VERIFIED'});
  }
 }
 return {schema:SCHEMA,captured_at_utc:iso(now),
   coverage_days:30,read_only:true,trade_permission:false,real_orders:0,
   watch_sources:scans,
   feed_status:Object.values(scans).every(x=>x.status==='OK')?'OK':'PARTIAL_OR_UNAVAILABLE',
   entries:[...unique.values()].sort((a,b)=>b.launchTime-a.launchTime).slice(0,250),
   quote_values_are_native_not_usd_converted:true,
   no_ticker_to_contract_identity_inference:true,
   spot_usdc_access_for_user_verified:false,
   image_policy:'Only exact venue+contract+launch registry entries have a local logo; otherwise visible ticker fallback',
   announcement_sources:{
     okx:'https://www.okx.com/en-eu/help/section/announcements-new-listings',
     bitget:'https://www.bitget.com/support/sections/12560603738154'},
   note:'Public exchange instrument catalogue. A pair listing is not a verified wallet access, regional eligibility, fee or executable trade. Futures, swaps and X-Perps excluded.'};
}
async function download(url){
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),12000);
 try{
  const parsed=new URL(url);
  if(parsed.protocol!=='https:'||!['www.okx.com','api.bitget.com'].includes(parsed.hostname))
    throw Error('Unexpected host');
  const res=await fetch(url,{signal:ctrl.signal,method:'GET',redirect:'error',
   credentials:'omit',headers:{Accept:'application/json'}});
  if(!res.ok)throw Error('HTTP '+res.status);
  const raw=await res.text();
  if(raw.length>2500000)throw Error('Oversized source');
  return JSON.parse(raw);
 }finally{clearTimeout(timer);}
}
async function main(){
 const read=async url=>{try{return await download(url)}catch(_){return null}};
 const [okx,bitget]=await Promise.all([
  read('https://www.okx.com/api/v5/public/instruments?instType=SPOT'),
  read('https://api.bitget.com/api/v3/market/instruments?category=SPOT')
 ]);
 const registry=JSON.parse(fs.readFileSync(REGISTRY,'utf8'));
 const prior=fs.existsSync(FILE)?JSON.parse(fs.readFileSync(FILE,'utf8')):null;
 const result=makeReport({okx,bitget,registry,previous:prior});
 const body=JSON.stringify(result,null,2)+'\n';
 fs.writeFileSync(FILE,body);
 console.log('Seven public listings: '+result.entries.length+' instruments; '+result.feed_status+
  '; OKX='+result.watch_sources.okx.status+' Bitget='+result.watch_sources.bitget.status+
  '; orders=0.');
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1});
module.exports={SCHEMA,parseOKX,parseBitget,identity,makeReport};
