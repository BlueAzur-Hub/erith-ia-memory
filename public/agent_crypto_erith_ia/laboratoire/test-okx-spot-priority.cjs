"use strict";
/* No auth, no orders, no performance claims: qualification of public OKX evidence only. */
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const api=require("./okx-spot-priority.js");
const root=path.resolve(__dirname);
const json=rel=>JSON.parse(fs.readFileSync(path.resolve(root,rel),"utf8"));
const fixtures=()=>({
 screenshot:json("../data/crypto/research/okx-spot-screen-candidates.json"),
 hourly:json("../data/crypto/okx-hourly/research-latest.json"),
 listings:json("../administrator/data/new-listings-public-feed.json"),
 research:json("../data/crypto/research/okx-spot-identity-research.json")
});
test("OKX catalog page busts the stale script cache and exposes a visual render check",()=>{
 const html=fs.readFileSync(path.resolve(root,"okx-spot-priority.html"),"utf8");
 assert.match(html,/okx-spot-priority\.js\?v=20261108-logos-b/);
 assert.match(html,/id="okx-logo-render-status"/);
 assert.match(fs.readFileSync(path.resolve(root,"okx-spot-priority.js"),"utf8"),/Logos actifs/);
});
test("crypto logos are exact local assets and ambiguous token tickers remain monograms",()=>{
 const model=api.buildUniverse(fixtures());
 for(const base of ["BTC","ETH","SOL","XRP","BCH","DOGE","CT"]){
  const row=model.data.find(x=>x.base===base&&x.type==="crypto_spot_candidate");
  assert.ok(row,base+" has a documented Spot candidate");
  const logo=api.logoForRow(row);
  assert.ok(logo&&typeof logo.src==="string");
  assert.ok(!logo.src.startsWith("http"),"no external logo fetch");
  assert.ok(fs.existsSync(path.resolve(root,logo.src)),base+" local logo exists");
 }
 const edge=model.data.find(x=>x.instId==="EDGE-USDC");
 assert.equal(api.logoForRow(edge),null,"EDGE must never pick a logo by ambiguous ticker");
 assert.equal(api.symbolMonogram(edge),"ED");
 const product=model.data.find(x=>x.instId==="XASML-USDC");
 assert.equal(api.logoForRow(product),null,"tokenized product never borrows a crypto logo");
 assert.equal(api.symbolMonogram(product),"X");
 assert.equal(api.logoForRow({instId:"EDGE-USDC",base:"BTC",type:"crypto_spot_candidate"}),null,
  "inconsistent instrument cannot borrow BTC logo");
 assert.equal(api.CRYPTO_LOGOS.EDGE,undefined);
});
test("OKX public books, native pairs and screenshot observations remain distinct",()=>{
 const input=fixtures(),{data,counts}=api.buildUniverse(input);
 assert.equal(counts.haveBook,input.hourly.pairs.length);
 assert.equal(counts.seenScreenshot,input.screenshot.items.length);
 assert.equal(counts.catalogOKX,input.listings.entries.filter(x=>x.provider==="okx").length);
 assert.equal(counts.regionConfirmed,0);
 assert.equal(counts.orderAuthorized,0);
 assert.equal(counts.officialAnnounced,3);
 assert.equal(counts.researchReviewed,1);
 assert.equal(counts.total,data.length);
 assert.equal(counts.crypto+counts.tokenized,counts.total);
 assert.ok(data.every(x=>x.orderAllowed===false&&x.verifiedForAccount===false));
 assert.equal(new Set(data.map(x=>x.instId)).size,data.length);
 assert.equal(data.find(x=>x.instId==="XRP-USDC").type,"crypto_spot_candidate");
 for(const id of ["XASML-USDC","XIREN-USDC","XWDC-USDC","XNFLX-USDC"]){
  const x=data.find(x=>x.instId===id);
  assert.ok(x&&x.type==="tokenized_stock_or_etf");
 }
 for(const id of ["BTC-USDC","ETH-USDC","OKB-USDC","SOL-USDC","XRP-USDC","CT-USDC"]){
  const x=data.find(x=>x.instId===id);
  assert.ok(x&&x.hasScreenshot&&x.hasBook);
 }
 for(const id of ["RSR-USDC","LIT-USDC","EDGE-USDC"]){
  const x=data.find(x=>x.instId===id);
  assert.ok(x&&x.hasScreenshot&&x.type==="crypto_spot_candidate");
 }
});
test("untrusted screenshot cannot upgrade eligibility or impersonate a native crypto",()=>{
 const src=fixtures();src.screenshot.items[0].account_order_permission_verified=true;
 assert.throws(()=>api.buildUniverse(src),/Source OKX invalide/);
 const s2=fixtures();s2.screenshot.items.find(x=>x.instId==="XRP-USDC").asset_type="tokenized_stock_or_etf";
 assert.throws(()=>api.buildUniverse(s2),/crypto\/action amalgamées/);
 const s3=fixtures();s3.hourly.paper_fills=1;
 assert.throws(()=>api.buildUniverse(s3),/Source OKX invalide/);
});
test("public new listings do not become account-authorized instruments",()=>{
 const src=fixtures(),out=api.buildUniverse(src);
 assert.equal(out.counts.regionConfirmed,0);
 assert.equal(out.counts.orderAuthorized,0);
 const x=out.data.find(x=>x.instId==="XASML-USDC");
 assert.ok(x.hasPublicListing&&x.hasScreenshot&&x.verifiedForAccount===false);
});

test("2026-09-30 USD migration keeps historic announcements unverified",()=>{
 const input=fixtures(),out=api.buildUniverse(input);
 assert.equal(input.research.public_okx_migration.announced_date,"2026-09-30");
 assert.equal(input.research.records[0].trade_quote_ccy_list_verified,false);
 for(const a of input.research.records[0].announced_spot_instruments)
   assert.equal(a.current_state_verified,false);
 for(const id of ["EDGE-USDT","EDGE-USD","EDGE-EUR"]){
   const item=out.data.find(x=>x.instId===id);
   assert.ok(item.hasOfficialAnnouncement);
   assert.equal(item.verifiedForAccount,false);
   assert.equal(item.orderAllowed,false);
 }
 assert.equal(out.data.find(x=>x.instId==="EDGE-USDC").hasOfficialAnnouncement,false);
});
test("local Bridge probe is GET-only, private-credential-free and is not account proof",async()=>{
 let calls=0;
 const mock=async(url,opts)=>{
   calls++;
   assert.equal(url,"http://127.0.0.1:8790/market-resolve?asset=EDGE&currency=USD");
   assert.equal(opts.method,"GET");
   assert.equal(opts.credentials,"omit");
   return {ok:true,json:async()=>({
     asset:"EDGE",display_currency:"USD",
     chosen:{
       candles:{provider:"bitget",instrument:"EDGE-USDT",quote:"USDT"},
       book:{provider:"okx",instrument:"EDGE-USDC",quote:"USDC",capabilities:["book"]}
     }
   })};
 };
 const data=await api.probeLocalMarket({asset:"EDGE",fetcher:mock});
 assert.equal(calls,1);
 assert.equal(data.book.instrument,"EDGE-USDC");
 assert.equal(data.candles,null);
 assert.equal(data.accountAccessVerified,false);
 assert.equal(data.accountInstrumentsQueried,false);
 assert.equal(data.tradeQuoteCcyListVerified,false);
 assert.equal(data.orderAuthorized,false);
 await assert.rejects(()=>api.probeLocalMarket({asset:"../secret",fetcher:mock}),/Source OKX invalide/);
 assert.equal(calls,1);
});
test("EDGE/USDC does not inherit EDGE/USDT official proof; CoinGecko ticker collision is explicit",()=>{
 const r=api.buildUniverse(fixtures()),edgeUSDC=r.data.find(x=>x.instId==="EDGE-USDC");
 assert.ok(edgeUSDC&&edgeUSDC.hasScreenshot&&edgeUSDC.hasOfficialAnnouncement===false);
 assert.equal(edgeUSDC.canonicalResearchId,"edgex");
 assert.equal(edgeUSDC.spotPairConfirmed,false);
 assert.ok(edgeUSDC.identityWarning.includes("edge"));
 for(const id of ["EDGE-USDT","EDGE-USD","EDGE-EUR"]){
  const row=r.data.find(x=>x.instId===id);
  assert.ok(row&&row.hasOfficialAnnouncement&&row.canonicalResearchId==="edgex");
  assert.equal(row.verifiedForAccount,false);
  assert.equal(row.orderAllowed,false);
 }
 assert.equal(r.counts.officialAnnounced,3);
});
test("research cannot forge account eligibility, declared official pairs, or CoinGecko identity",()=>{
 const x=fixtures();x.research.records[0].account_spot_available_verified=true;
 assert.throws(()=>api.buildUniverse(x),/Source OKX invalide/);
 const y=fixtures();y.research.records[0].announced_spot_instruments[0].instId="EDGE-USDC";
 assert.throws(()=>api.buildUniverse(y),/Source OKX invalide/);
 const z=fixtures();z.research.records[0].coin_id_collision_to_exclude="edgex";
 assert.throws(()=>api.buildUniverse(z),/Source OKX invalide/);
 const u=fixtures();u.research.records[0].research_page="../sensitive.html";
 assert.throws(()=>api.buildUniverse(u),/Source OKX invalide/);
});
