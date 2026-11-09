"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const {reconcileBtcRecentLots,btcPositionReport}=require("./trader-okx-account.js");
const t1=Date.UTC(2026,9,30,9,0,0),t2=Date.UTC(2026,10,6,9,0,0);
const now=Date.UTC(2026,10,9,18,0,0);
const row=(currency,change,timestamp,type,subType,source="Compte de trading")=>({
 currency,balanceChange:change,timestamp,type,subType,source
});
const movement=[
  row("BTC",-0.004,t1-8*86400000,"28","237"), // an older unrelated sale
  row("BTC",0.003,t1,"2","1"),
  row("USDC",-110,t1,"2","2"),
  row("BTC",0.002,t2,"30","320"),
  row("EUR",-80,t2,"30","321")
];
const run=(movements=movement,held=0.005,complete=true)=>
 reconcileBtcRecentLots({movements,held,complete});

test("reconciles two native OKX lots in different quotes without FX invention",()=>{
 const x=run();
 assert.equal(x.status,"reconciled_recent_lots");
 assert.equal(x.read_only,true);
 assert.equal(x.total_btc,0.005);
 assert.deepEqual(x.paid,{EUR:80,USDC:110});
 assert.deepEqual(x.lots.map(x=>x.quote),["USDC","EUR"]);
 assert.deepEqual(x.lots.map(x=>x.implied_quote_per_btc),[110/0.003,40000]);
 assert.equal(x.historical_eur_usdc_conversion_verified,false);
 assert.equal(x.fees_complete,false);
 assert.equal(x.net_pnl_verified,false);
 assert.equal(x.real_orders_enabled,false);
});
test("reports both lots and explicitly refuses combined P&L",()=>{
 const lots=run();
 const quote={price:56000,source:"Binance Spot BTC/EUR",receivedAt:now-1000};
 const account={ok:true,read_only:true,fetched_at:new Date(now-500).toISOString()};
 const report=btcPositionReport({account,quantity:0.005,quote,
  ledger:{recentLots:lots},ledgerCheckedAt:now-1000},now);
 const msg=report.lines.join(" ");
 assert.match(msg,/Deux acquisitions BTC rapprochées/);
 assert.match(msg,/USDC/);
 assert.match(msg,/pas un prix moyen unique/i);
 assert.match(msg,/Le gain\/perte net global n'est pas calculé/i);
 assert.equal(report.indicative_delta_eur,null);
});
test("rejects incomplete stream, quote mismatch and unexplained balance",()=>{
 assert.equal(run(movement,0.005,false).status,"unknown");
 assert.equal(run(movement,0.006,true).status,"unknown");
 assert.equal(run(movement.filter(x=>x.currency!=="USDC"),0.005,true).status,"unknown");
 assert.equal(run([...movement,row("BTC",-0.001,t2+120000,"28","237")],0.005,true).status,"unknown");
});
test("rejects non unique counterpart and unrelated BTC after first lot",()=>{
 assert.equal(run([...movement,row("EUR",-80,t2+1000,"30","321")]).status,"unknown");
 assert.equal(run([...movement,row("BTC",0.001,t2+1000,"9","9")]).status,"unknown");
});
test("leaves legacy one-buy paths separate",()=>{
 const x=run([row("BTC",0.005,t2,"30","320"),row("EUR",-80,t2,"30","321")]);
 assert.equal(x.status,"unknown");
});
