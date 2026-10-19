const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const {evaluate,evaluatePositions}=require("../public/agent_crypto_erith_ia/laboratoire/radar20-veille.js");
const digest="a".repeat(64);
function fake(){const p={schema:"erith.trader.radar20.forward-protocol.v1",symbols:["ETH","SOL","XRP","ADA","LINK","AVAX","SUI","NEAR","UNI","AAVE","LTC","BCH","DOT","HBAR","XLM","DOGE","PEPE","SHIB","APT","ARB"],test_days:90,holding_hours:48,ticket_usdt:100,trading_orders_enabled:false,simulation_only:true,strategy_certified:false};
const i={schema:"erith.radar20.forward.index.v1",config_sha256:digest,orders_enabled:false,days:[{day:"2026-10-14",file:"observations/2026-10-14.json",sha256:digest}],outputs:[{file:"summary.json",sha256:digest}]};
const s={schema:"erith.radar20.forward.summary.v1",protocol_sha256:digest,no_live_orders:true,strategy_certified:false,days_collected:1,hours_per_market:24,status:"RUNNING",variants:{}};
for(const m of ["A","B"])for(const c of [0.8,1.2,1.6])s.variants[m+"_"+c]={cost_pct:c,signals:0,open_positions:0,closed_trades:0,equity_usdt:400,realized_usdt:0,unrealized_usdt:0,worst_drawdown_usdt:0};return {p,i,s};}
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
