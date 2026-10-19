"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const {valid,paint}=require("../laboratoire/radar-spot-paper.js");
const ROOT=path.join(__dirname,"../data/crypto/radar-opportunities");
const report=JSON.parse(fs.readFileSync(path.join(ROOT,"spot-paper-audit.json"),"utf8"));
test("every entry-day Radar candidate is preserved with explicit no-PAPER outcome",()=>{
 const source=JSON.parse(fs.readFileSync(path.join(ROOT,"2026-10-17.json"),"utf8"));
 const items=[...source.groups.momentum_24h_7d,...source.groups.rebound_24h_only];
 assert.equal(valid(report),report);
 assert.equal(report.candidates.length,items.length);
 assert.deepEqual(report.candidates.map(x=>x.coin_id),items.map(x=>x.id));
 assert.equal(report.trades_executed,0);
 assert(report.candidates.every(x=>x.paper.net_profit_usdt===null));
 assert.equal(report.later_price_rises,3);
 assert.equal(report.public_spot_evidence_candidates,4);
});
test("Q and BR are not retroactively made executable because they rose",()=>{
 for(const id of ["quack-ai","bedrock-token"]){
  const x=report.candidates.find(y=>y.coin_id===id);
  assert(x.aggregate_change_pct_observed>0);
  assert.equal(x.paper.decision,"BLOCKED");
  assert.equal(x.paper.reason,"CONTRACT_IDENTITY_UNVERIFIED");
  assert.equal(x.spot.contract_identity_proven,false);
  assert.equal(x.spot.quote_conversion_usd_to_usdt_proven,false);
 }
 const folk=report.candidates.find(y=>y.coin_id==="folks");
 assert.equal(folk.paper.reason,"NO_PUBLIC_SPOT_BOOK_OR_PAIR_FOR_CANDIDATE");
});
test("client refuses fabricated profit and tampered trade count",()=>{
 assert.throws(()=>valid({...report,trades_executed:1}),/non conforme/);
 assert.throws(()=>valid({...report,total_detected:1000}),/non conforme/);
 const copied=structuredClone(report);
 copied.candidates[0].paper.net_profit_usdt=5;
 assert.throws(()=>valid(copied),/non conforme/);
});
test("browser table only renders local text, keeps losing assets and no trade buttons",()=>{
 const nodes={};
 class FakeNode{
  constructor(){this.textContent="";this.children=[];this.className="";}
  replaceChildren(){this.children=[];}
  appendChild(x){this.children.push(x);}
 }
 const doc={
  getElementById:id=>nodes[id]??(nodes[id]=new FakeNode()),
  createElement:()=>new FakeNode()
 };
 paint(report,doc);
 assert.equal(nodes["radar-spot-body"].children.length,22);
 const rows=nodes["radar-spot-body"].children;
 assert.equal(rows[0].children.length,4);
 assert(rows.some(x=>x.children[1].className==="negative"));
 assert.match(nodes["radar-spot-status"].textContent,/0 opérations PAPER/);
 const script=fs.readFileSync(path.join(__dirname,"../laboratoire/radar-spot-paper.js"),"utf8");
 assert(!/\b(setInterval|setTimeout|localStorage|sendOrder|executeOrder)\s*\(/.test(script));
});
