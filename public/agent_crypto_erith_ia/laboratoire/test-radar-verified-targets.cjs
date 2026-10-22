"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs");
const path=require("node:path"),{verify}=require("./radar-verified-targets.js");
const targets=[
 ["bedrock-token","BR","BRUSDT","binance-smart-chain","0xff7d6a96ae471bbcd7713af9cb1feeb16cf56b41"],
 ["janction","JCT","JCTUSDT","binance-smart-chain","0xea37a8de1de2d9d10772eeb569e28bfa5cb17707"],
 ["beam-2","BEAM","BEAMUSDT","ethereum","0x62d0a8458ed7719fdaf978fe5929c6d342b0bfce"]];
const at="2026-10-22T09:40:00Z",hour="2026-10-22T09Z";
const head={schema:"erith.radar.verified-target-hourly.latest.v1",
 hour_utc:hour,observed_at_utc:at,source_date_utc:"2026-10-22",
 target_count:3,markets_observed:3,orders_enabled:false,real_orders:0};
const markets=targets.map(([id,sym,pair,network,contract])=>({
 coin_id:id,symbol:sym,pair,venue:"Bitget",quote:"USDT",type:"SPOT",
 platform:network,contract_address:contract,status:"OBSERVED",
 proof:{identity:{coin_id:id,platform:network,contract_address:contract,
       native_checked_at_utc:at,same_chain_and_address:true},
       ticker:{last:".3",source_at_utc:at},
       book:{best_bid:".299",best_ask:".301",spread_bps:"66.67",
        top5_bid_quote_depth:"200",top5_ask_quote_depth:"150",
        source_at_utc:at,fill_proven:false},
       closed_15m:[{open_at_utc:"2026-10-22T09:15:00Z"}],
       execution_proven:false,account_rules_verified:false}
}));
const record={schema:"erith.radar.verified-target-hourly.v1",
 hour_utc:hour,observed_at_utc:at,total_targets:3,markets_observed:3,
 orders_enabled:false,real_orders:0,paper_fills:0,markets};
const day={schema:record.schema,date_utc:"2026-10-22",hours:[record],
 orders_enabled:false,real_orders:0};
const clone=x=>structuredClone(x),now=Date.parse("2026-10-22T09:45:00Z");
test("three authentic contract identities are needed for price display",()=>{
 const x=verify(head,day,now);assert.equal(x.rows.length,3);
 assert.deepEqual(x.rows.map(r=>r.pair),["BRUSDT","JCTUSDT","BEAMUSDT"]);
 assert.ok(x.rows.every(r=>r.status==="OBSERVED"&&r.last===0.3&&r.quote==="USDT"));
 assert.equal(x.ordersEnabled,false);
});
test("an unavailable target cannot carry a substituted quote",()=>{
 const x=clone(day),h=clone(head);
 x.hours[0].markets[1].status="UNAVAILABLE";
 x.hours[0].markets[1].proof=null;
 x.hours[0].markets_observed=2;h.markets_observed=2;
 assert.equal(verify(h,x,now).rows[1].last,undefined);
 x.hours[0].markets[1].proof={ticker:{last:"10"}};
 assert.throws(()=>verify(h,x,now),/Source absente/);
});
test("changed contract, wrong Futures quote, stale book, and bad price all fail",()=>{
 for(const mutation of [
  x=>x.markets[0].contract_address="0x"+"1".repeat(40),
  x=>x.markets[1].quote="USDC",
  x=>x.markets[2].type="FUTURES",
  x=>x.markets[1].proof.book.source_at_utc="2026-10-22T07:00:00Z",
  x=>x.markets[0].proof.ticker.last="NaN",
  x=>x.markets[0].proof.identity.same_chain_and_address=false
 ]){
  const archive=clone(day);mutation(archive.hours[0]);
  assert.throws(()=>verify(head,archive,now));
 }
});
test("no fake timestamp, duplicate hour or private network accesses",()=>{
 let x=clone(day);x.hours.push(clone(record));
 assert.throws(()=>verify(head,x,now),/Heure unique/);
 x=clone(day);x.hours[0].observed_at_utc="2026-10-23T09:40:00Z";
 assert.throws(()=>verify(head,x,now),/Capture publique/);
 const html=fs.readFileSync(path.join(__dirname,"radar-historique.html"),"utf8");
 const js=fs.readFileSync(path.join(__dirname,"radar-verified-targets.js"),"utf8");
 assert.match(html,/id="radar-verified-targets"/);
 assert.match(html,/src="radar-verified-targets\.js"/);
 assert.match(js,/radar-verified-target-hourly\/latest\.json/);
 assert.doesNotMatch(js,/api\/v5\/trade|placeOrder|Authorization|Bearer |localStorage|indexedDB|setInterval\(/);
});
