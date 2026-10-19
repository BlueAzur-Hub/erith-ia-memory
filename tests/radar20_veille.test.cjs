const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const {evaluate}=require("../public/agent_crypto_erith_ia/laboratoire/radar20-veille.js");
const digest="a".repeat(64);
function fake(){const p={schema:"erith.trader.radar20.forward-protocol.v1",symbols:["ETH","SOL","XRP","ADA","LINK","AVAX","SUI","NEAR","UNI","AAVE","LTC","BCH","DOT","HBAR","XLM","DOGE","PEPE","SHIB","APT","ARB"],test_days:90,holding_hours:48,trading_orders_enabled:false,simulation_only:true,strategy_certified:false};
const i={schema:"erith.radar20.forward.index.v1",config_sha256:digest,orders_enabled:false,days:[{day:"2026-10-14",file:"observations/2026-10-14.json",sha256:digest}],outputs:[{file:"summary.json",sha256:digest}]};
const s={schema:"erith.radar20.forward.summary.v1",protocol_sha256:digest,no_live_orders:true,strategy_certified:false,days_collected:1,hours_per_market:24,status:"RUNNING",variants:{}};
for(const m of ["A","B"])for(const c of [0.8,1.2,1.6])s.variants[m+"_"+c]={cost_pct:c,signals:0,open_positions:0,closed_trades:0,equity_usdt:400,realized_usdt:0,worst_drawdown_usdt:0};return {p,i,s};}
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
