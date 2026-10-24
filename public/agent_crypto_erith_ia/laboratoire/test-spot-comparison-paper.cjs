"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const {analyze}=require("./spot-comparison-paper-core.cjs");
const root=path.resolve(__dirname,"../data/crypto/okx-hourly");
const sources=[
 path.join(root,"spot-candles/kmno-usdc.json"),
 path.join(root,"spot-candles/kat-usdc.json"),
 path.join(root,"irys-spot-candles.json")
];
const originals=sources.map(s=>JSON.parse(fs.readFileSync(s,"utf8")));
function freshFixtures(){
 const start=Date.parse("2026-04-01T00:00:00Z"),hours=200;
 return ["KMNO-USDC","KAT-USDC","IRYS-USDC"].map(pair=>{
   const candles=Array.from({length:hours},(_,i)=>{
     const t=start+i*3600000,price=i<150?1:1.1;
     return [String(t),String(price),String(price),String(price),String(price),"2000","2000","2000"];
   });
   return {
     schema:"erith.okx-native-spot-candles.v1",venue:"OKX_EEA",
     instrument_type:"SPOT",pair,quote:"USDC",orders_enabled:false,
     account_access:false,generated_at_utc:"2026-04-15T00:00:00Z",
     bar_interval_ms:{"1H":3600000},candles:{"1H":candles}
   };
 });
}
test("all 3 public OHLC archives are validated as native pairs only",()=>{
 const report=analyze(originals);
 assert.equal(report.schema,"erith.seven.spot-model-price-only.v1");
 assert.equal(report.study_type,"EXPLORATORY_RETROSPECTIVE_NOT_PROSPECTIVE");
 assert.equal(report.real_orders,0);
 assert.equal(report.paper_fills,0);
 assert.equal(report.execution_certified,false);
 assert.deepEqual(report.instruments.map(i=>i.pair),["KMNO-USDC","KAT-USDC","IRYS-USDC"]);
 report.instruments.forEach(item=>{
   assert(item.hourly_bars>=299);
   assert(item.zero_quote_volume_bars>=0);
   assert(item.test_hours>0);
   assert(item.scenarios.every(s=>s.trades.every(t=>
      t.executed_order===false&&t.matched_book_depth===false)));
 });
});
test("frozen experimental result is an immutable dated, not executable report",()=>{
 const snapshot=JSON.parse(fs.readFileSync(path.join(__dirname,"spot-comparison-paper-snapshot.json"),"utf8"));
 assert.equal(snapshot.report_date_utc,"2026-10-24");
 assert.equal(snapshot.instruments.length,3);
 assert.equal(snapshot.rules.holding_hours,24);
 assert.deepEqual(snapshot.rules.capital_tickets_usdc,[100,400,1000]);
 assert.equal(snapshot.execution_certified,false);
 assert.equal(snapshot.real_orders,0);
 assert(snapshot.instruments.some(i=>i.scenarios.some(s=>s.entry_zero_volume>0)));
});
test("validation rejects wrong token identity, quote, synthetic gap, future candle and real order flag",()=>{
 for(const edit of [
  x=>x[1].quote="USDT",
  x=>x[1].pair="KMNO-USDC",
  x=>x[2].orders_enabled=true,
  x=>x[0].candles["1H"][100][0]=String(Number(x[0].candles["1H"][100][0])+3600000),
  x=>x[0].candles["1H"][130][3]="1000000",
  x=>x[0].generated_at_utc="2026-04-01T00:00:00Z"
 ]){
   const cases=freshFixtures();edit(cases);
   assert.throws(()=>analyze(cases));
 }
});
test("future volume is not used to select signal or exclude modeled price scenarios",()=>{
 const clean=freshFixtures();
 const r1=analyze(clean);
 const first=r1.instruments[0].scenarios.find(s=>s.strategy==="momentum");
 assert(first.modeled_trades>0);
 const zero=freshFixtures();
 zero[0].candles["1H"][151][5]="0";
 zero[0].candles["1H"][151][6]="0";
 zero[0].candles["1H"][151][7]="0";
 const second=analyze(zero).instruments[0].scenarios.find(s=>s.strategy==="momentum");
 assert.equal(second.modeled_trades,first.modeled_trades);
 assert.equal(second.trades[0].signal_utc,first.trades[0].signal_utc);
 assert.equal(second.trades[0].entry_bar_without_trades,true);
 assert.equal(first.trades[0].entry_bar_without_trades,false);
});
test("zero signals leave cash unchanged; costs never create a fake gain",()=>{
 const flat=freshFixtures();
 for(const x of flat)for(const bar of x.candles["1H"])
   bar[1]=bar[2]=bar[3]=bar[4]="1";
 const report=analyze(flat);
 for(const market of report.instruments){
   assert(market.scenarios.every(s=>s.modeled_trades===0));
   assert(market.scenarios.every(s=>s.cost_scenarios.every(z=>z.model_return_pct===0)));
   assert(market.benchmarks.buy_and_hold_cost_scenarios.every(x=>x.model_return_pct<0));
 }
});
test("the same historical signal is not traded repeatedly during a 24h holding period",()=>{
 const report=analyze(freshFixtures());
 const trades=report.instruments[0].scenarios[0].trades;
 for(let i=1;i<trades.length;i++)
   assert(Date.parse(trades[i].entry_hour_utc)>=Date.parse(trades[i-1].exit_hour_utc));
});
