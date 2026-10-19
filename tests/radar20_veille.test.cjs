const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const {evaluate,evaluatePositions,evaluateDecisionAnalysis,evaluateComparison}=require("../public/agent_crypto_erith_ia/laboratoire/radar20-veille.js");
const digest="a".repeat(64);
function fake(){const p={schema:"erith.trader.radar20.forward-protocol.v1",symbols:["ETH","SOL","XRP","ADA","LINK","AVAX","SUI","NEAR","UNI","AAVE","LTC","BCH","DOT","HBAR","XLM","DOGE","PEPE","SHIB","APT","ARB"],test_days:90,holding_hours:48,capital_usdt:400,ticket_usdt:100,taker_buy_threshold_pct:50,market_trend_threshold_pct:3,trend_lookback_hours:72,volume_median_lookback_hours:24,trading_orders_enabled:false,simulation_only:true,strategy_certified:false};
const i={schema:"erith.radar20.forward.index.v1",config_sha256:digest,orders_enabled:false,days:[{day:"2026-10-14",file:"observations/2026-10-14.json",sha256:digest}],outputs:[{file:"summary.json",sha256:digest}]};
const s={schema:"erith.radar20.forward.summary.v1",protocol_sha256:digest,no_live_orders:true,strategy_certified:false,fee_costs_hypothetical:true,okx_account_fee_not_available:true,days_collected:1,hours_per_market:24,status:"RUNNING",variants:{}};
for(const m of ["A","B"])for(const c of [0.8,1.2,1.6])s.variants[m+"_"+c]={model:m==="A"?"A_original":"B_trend_3pct",cost_pct:c,signals:0,open_positions:0,closed_trades:0,wins:0,equity_usdt:400,realized_usdt:0,unrealized_usdt:0,worst_drawdown_usdt:0};return {p,i,s};}
test("one day, six independent simulations, no profit claim",()=>{const {p,i,s}=fake(),r=evaluate(p,i,s);assert.equal(r.days,1);assert.equal(r.closed,0);assert.equal(r.rows.length,6);});
test("no real orders",()=>{const {p,i,s}=fake();p.trading_orders_enabled=true;assert.throws(()=>evaluate(p,i,s),/recherche seule/);});
test("no false certification",()=>{const {p,i,s}=fake();s.strategy_certified=true;assert.throws(()=>evaluate(p,i,s),/recherche seule/);});
test("reject missing day or manipulated counts",()=>{const {p,i,s}=fake();s.days_collected=2;assert.throws(()=>evaluate(p,i,s),/Compteurs/);});
test("reject altered SHA protocol",()=>{const {p,i,s}=fake();i.config_sha256="b".repeat(64);assert.throws(()=>evaluate(p,i,s),/SHA-256/);});
test("reject missing variant",()=>{const {p,i,s}=fake();delete s.variants["B_1.6"];assert.throws(()=>evaluate(p,i,s),/Variante/);});
test("90 signal days plus two settlement days",()=>{const {p,i,s}=fake();i.days=[];for(let j=0;j<92;j++){const day=new Date(Date.UTC(2026,9,14+j)).toISOString().slice(0,10);i.days.push({day,file:"observations/"+day+".json",sha256:digest});}s.days_collected=92;s.hours_per_market=92*24;const r=evaluate(p,i,s);assert.equal(r.days,92);assert.equal(r.signalsDays,90);});
test("published Radar20 multi-day archives match the actual hourly coverage",()=>{
  const dir=path.join(__dirname,"../public/agent_crypto_erith_ia/data/trader_flux/radar20_forward");
  const read=name=>JSON.parse(fs.readFileSync(path.join(dir,name),"utf8"));
  const p=read("experiment.json"),i=read("index.json"),s=read("summary.json");
  assert.equal(s.hours_per_market,i.days.length*24);
  const result=evaluate(p,i,s);
  assert.equal(result.days,i.days.length);
  assert.equal(result.rows.length,6);
});
test("reject inconsistent hourly coverage even when day count matches",()=>{
  const {p,i,s}=fake();
  i.days.push({day:"2026-10-15",file:"observations/2026-10-15.json",sha256:digest});
  s.days_collected=2;s.hours_per_market=24;
  assert.throws(()=>evaluate(p,i,s),/Compteurs/);
});

function fakePositions(){
 const {p,i,s}=fake();
 const variants={};
 for(const model of ["A","B"])for(const cost of [0.8,1.2,1.6]){
   const key=model+"_"+cost;
   variants[key]={cost_pct:cost,open:[],recent_closed:[],closed_count:0};
 }
 return {p,i,s,d:{schema:"erith.radar20.forward.positions.v1",simulation_only:true,
   orders_enabled:false,protocol_sha256:digest,days_collected:1,
   last_archived_hour_ms:Date.parse("2026-10-14T23:00:00Z"),variants}};
}
test("detail ledger renders a real PAPER position with verified UTC exit and costs",()=>{
 const {p,i,s,d}=fakePositions(),ms=Date.parse("2026-10-14T05:00:00Z");
 d.variants["A_0.8"].open.push({pair:"ETHUSDT",entry_ms:ms,
   planned_exit_ms:ms+48*3600000,entry_price_usdt:100,
   last_close_usdt:99,paper_ticket_usdt:100,paper_value_usdt:98.2,
   paper_unrealized_usdt:-1.8,estimated_fee_impact_usdt:.8});
 s.variants["A_0.8"].open_positions=1;s.variants["A_0.8"].unrealized_usdt=-1.8;
 const parsed=evaluatePositions(p,i,s,d);
 assert.equal(parsed["A_0.8"].open.length,1);
 assert.equal(parsed["B_0.8"].open.length,0);
});
test("detail ledger refuses missing source, tampered values, wrong exit and private order claim",()=>{
 for(const corruption of [
   x=>{x.d.orders_enabled=true;},
   x=>{x.d.variants["A_0.8"].open.push({pair:"FAKEUSDT"});},
   x=>{x.d.days_collected=0;},
   x=>{x.d.last_archived_hour_ms=0;},
   x=>{x.d.variants["B_0.8"].closed_count=1;},
 ]){
   const value=fakePositions();corruption(value);
   assert.throws(()=>evaluatePositions(value.p,value.i,value.s,value.d));
 }
 const valid=fakePositions(),ms=Date.parse("2026-10-14T05:00:00Z");
 valid.d.variants["A_0.8"].open=[{pair:"ETHUSDT",entry_ms:ms,planned_exit_ms:ms+47*3600000,
   entry_price_usdt:100,last_close_usdt:99,paper_ticket_usdt:100,
   paper_value_usdt:98.2,paper_unrealized_usdt:-1.8,estimated_fee_impact_usdt:.8}];
 valid.s.variants["A_0.8"].open_positions=1;valid.s.variants["A_0.8"].unrealized_usdt=-1.8;
 assert.throws(()=>evaluatePositions(valid.p,valid.i,valid.s,valid.d),/position invalide/i);
});
test("if published, all six detail variants reconcile to the indexed source and summary",()=>{
 const dir=path.join(__dirname,"../public/agent_crypto_erith_ia/data/trader_flux/radar20_forward");
 const posFile=path.join(dir,"positions.json");
 if(!fs.existsSync(posFile))return; // Derived by the scheduled forward job after merge.
 const read=name=>JSON.parse(fs.readFileSync(path.join(dir,name),"utf8"));
 const p=read("experiment.json"),i=read("index.json"),s=read("summary.json"),d=read("positions.json");
 const indexed=i.outputs.find(x=>x.file==="positions.json");
 assert(indexed,"new positions artifact must be SHA indexed");
 assert.equal(crypto.createHash("sha256").update(fs.readFileSync(posFile)).digest("hex"),indexed.sha256);
 const detail=evaluatePositions(p,i,s,d);
 assert.equal(Object.keys(detail).length,6);
 for(const key of Object.keys(detail))assert.equal(detail[key].open.length,s.variants[key].open_positions);
});

test("decision analysis reconciles evidence and refuses invented trade reasons",()=>{
 const {p,i,s,d}=fakePositions(),key="A_0.8",v=s.variants[key];
 v.signals=2;v.open_positions=1;v.closed_trades=0;v.rejected={filter:0,existing:0,capacity:1,cash:0};
 d.variants[key].open.push({pair:"ETHUSDT",buy_share_pct:57,
   volume_vs_median_24h:1.7,market_trend_72h_pct:1.2});
 const a=evaluateDecisionAnalysis(p,s,key,d.variants[key]);
 assert.equal(a.accepted,1);assert.equal(a.rejected.capacity,1);
 assert.equal(a.traces[0].passesB,false);
 assert.equal(a.traces[0].volumeRatio,1.7);
 v.rejected.capacity=0;
 assert.throws(()=>evaluateDecisionAnalysis(p,s,key,d.variants[key]),/rapprochés/);
 v.rejected.capacity=1;
 d.variants[key].open[0].buy_share_pct=20;
 assert.throws(()=>evaluateDecisionAnalysis(p,s,key,d.variants[key]),/incohérentes/);
});
test("historical PAPER details remain readable while richer trace awaits collection",()=>{
 const {p,s,d}=fakePositions(),key="B_0.8",v=s.variants[key];
 v.signals=3;v.rejected={filter:3,existing:0,capacity:0,cash:0};
 const a=evaluateDecisionAnalysis(p,s,key,d.variants[key]);
 assert.equal(a.traces.length,0);assert.equal(a.rejected.filter,3);
});

test("collapsible comparative section exists in the original Journal only",()=>{
 const html=fs.readFileSync(path.join(__dirname,"../public/agent_crypto_erith_ia/laboratoire/radar20-veille.html"),"utf8");
 assert.match(html,/<details class="comparison"/);
 assert.match(html,/id="comparison-rows"/);
 assert.match(html,/id="comparison-status"/);
 assert.doesNotMatch(html,/<details class="comparison"[^>]*open(?:\s|>)/);
});
test("A/B comparison with zero closed trades never invents a win rate",()=>{
 const {p,i,s,d}=fakePositions(),r=evaluateComparison(p,i,s,d);
 assert.equal(r.allClosed,0);
 assert.equal(r.rows.length,6);
 assert.equal(r.rows[0].rate,null);
 assert.equal(r.rows[0].equity,400);
 assert.equal(r.aCostRange,0);
});
test("A/B comparison reconciles one actual simulated close across three days",()=>{
 const {p,i,s,d}=fakePositions();
 for(const day of ["2026-10-15","2026-10-16"])i.days.push({day,file:"observations/"+day+".json",sha256:digest});
 s.days_collected=3;s.hours_per_market=72;d.days_collected=3;
 d.last_archived_hour_ms=Date.parse("2026-10-16T23:00:00Z");
 const v=s.variants["A_0.8"],row=d.variants["A_0.8"];
 v.closed_trades=1;v.wins=1;v.realized_usdt=2.5;v.equity_usdt=402.5;
 row.closed_count=1;
 const entry=Date.parse("2026-10-14T05:00:00Z");
 row.recent_closed=[{pair:"ETHUSDT",entry_ms:entry,exit_ms:entry+48*3600000,pnl_net_usdt:2.5}];
 const r=evaluateComparison(p,i,s,d);
 assert.equal(r.rows[0].closed,1);assert.equal(r.rows[0].rate,100);
 assert.equal(r.aClosed,1);assert.equal(r.bClosed,0);
 v.realized_usdt=3.5;
 assert.throws(()=>evaluateComparison(p,i,s,d),/incohérent|rapprochées/);
});
test("A/B comparison rejects fabricated winners and impossible accounting",()=>{
 const {p,i,s,d}=fakePositions();
 s.variants["B_0.8"].wins=1;
 assert.throws(()=>evaluateComparison(p,i,s,d),/incohérent/);
 s.variants["B_0.8"].wins=0;
 s.variants["A_0.8"].equity_usdt=500;
 assert.throws(()=>evaluateComparison(p,i,s,d),/incohérent/);
});
test("A/B comparison cross-checks the complete current published PAPER evidence",()=>{
 const root=path.join(__dirname,"../public/agent_crypto_erith_ia/data/trader_flux/radar20_forward");
 const read=x=>JSON.parse(fs.readFileSync(path.join(root,x),"utf8"));
 const p=read("experiment.json"),i=read("index.json"),s=read("summary.json"),d=read("positions.json");
 const comparison=evaluateComparison(p,i,s,d);
 assert.equal(comparison.rows.length,6);
 assert.equal(comparison.days,i.days.length);
});
