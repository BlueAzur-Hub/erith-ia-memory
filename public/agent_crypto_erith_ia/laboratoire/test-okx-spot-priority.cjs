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
