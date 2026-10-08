import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const panel=fs.readFileSync("public/agent_crypto_erith_ia/trader/trader-historical-panel.js","utf8");
const mirror=fs.readFileSync("public/agent_crypto_erith_ia/trader/trader-runtime-mirror.js","utf8");
const r10=fs.readFileSync(".github/workflows/agent-crypto-historical-ohlcv-incremental-r4.yml","utf8");
const r11=fs.readFileSync(".github/workflows/agent-crypto-historical-partitions-r11.yml","utf8");
const flush=async()=>{for(let i=0;i<5;i++)await new Promise(ok=>setImmediate(ok));};
function data(id="bitcoin",period="24h"){
 return {metadata:{id,period,pair:id==="bitcoin"?"BTCUSDT":"ETHUSDT",
  source:"Binance Spot",quote:"USDT",status:"VALIDATED_SNAPSHOT",
  isLive:false,graphConnected:false,interval:"5m",
  firstOpenMs:1791430800000,lastOpenMs:1791431100000,
  sourceIndexUpdatedAt:"2026-10-08T04:51:17Z"},
  candles:[[1791430800000,1,2,0.5,1.5,3,5,5],[1791431100000,1.5,2,1,1.8,6,7,5]]};
}
function env({pending=false}={}){
 let selected={id:"bitcoin",symbol:"BTC"},pendingResolve;
 const listeners={},counts={reader:0,index:0,blocks:[]};
 function element(tag="div"){
  const events={};return {tag,children:[],id:"",value:"24h",open:false,textContent:"",
   appendChild(x){this.children.push(x);return x;},replaceChildren(){this.children=[];},
   setAttribute(){},remove(){},
   querySelector(q){return this.parts?.[q]||null;},
   addEventListener(k,fn){events[k]=fn;},fire(k){events[k]?.();}};
 }
 const head=element("head"),zone=element("section");
 let mounted=null;
 zone.appendChild=x=>{
  if(x.tag==="details"){
   mounted=x;
   const names=["status","detail","period","meta","rows","reload"];
   x.parts=Object.fromEntries(names.map(name=>["[data-history-"+name+"]",element(name)]));
   x.parts["[data-history-period]"].value="24h";
  }
  zone.children.push(x);return x;
 };
 const catalog={quote:"USDT",snapshot:true,coverage:[]};
 for(const id of ["bitcoin","ethereum","binancecoin","solana","ripple","tron","zcash"]){
  for(const period of ["24h","7d","30d"]){
   catalog.coverage.push({id,period,pair:id==="bitcoin"?"BTCUSDT":"ETHUSDT",candles:2});
  }
 }
 const reader={
  async refreshIndex(){counts.index++;return catalog;},
  readSeries(x){counts.blocks.push(x);return pending?new Promise(ok=>pendingResolve=ok):Promise.resolve(data(x.assetId,x.period));}
 };
 const document={readyState:"complete",
  baseURI:"https://blueazur-hub.github.io/erith-ia-memory/public/agent_crypto_erith_ia/administrator/index.html",
  head,createElement:element,getElementById(id){
   if(id==="market-zone")return zone;
   if(id==="traderVerifiedHistory")return mounted;
   return null;
  }};
 const context={Date,URL,document,getSelectedCoin:()=>selected,addEventListener(k,fn){listeners[k]=fn;}};
 head.appendChild=x=>{
  head.children.push(x);
  if(x.tag==="script"){counts.reader++;context.SevenCompactArchiveReader=reader;x.onload?.();}
  return x;
 };
 vm.runInNewContext(panel,vm.createContext(context),{timeout:3000});
 return {counts,p:()=>mounted,
  open(){mounted.open=true;mounted.fire("toggle");},
  close(){mounted.open=false;mounted.fire("toggle");},
  select(id,symbol){selected={id,symbol};listeners["agent-crypto:selected-market-changed"]?.();},
  period(value){mounted.parts["[data-history-period]"].value=value;mounted.parts["[data-history-period]"].fire("change");},
  resolve(v){pendingResolve(v);}
 };
}
test("Shared Administrator runtime is retained and no duplicate market owner is introduced",()=>{
 assert.match(mirror,/traderHistoricalPanelScript/);
 assert.match(panel,/SevenCompactArchiveReader/);
 assert.doesNotMatch(panel,/AgentCryptoMarketMicroscope\s*=|AgentCryptoMarketInstrumentResolver\s*=/);
});
test("Closed history viewer makes no archive requests; opening reads one series",async()=>{
 const f=env();assert.equal(f.counts.reader,0);assert.equal(f.counts.index,0);
 f.open();await flush();
 assert.equal(f.counts.reader,1);assert.equal(f.counts.index,1);
 assert.equal(f.counts.blocks.length,1);
 assert.equal(f.p().parts["[data-history-rows]"].children.length,2);
 assert.match(f.p().parts["[data-history-meta]"].textContent,/USDT.*SHA-256/);
});
test("OKB is explicitly unavailable, without Bitcoin fallback",async()=>{
 const f=env();f.select("okb","OKB");f.open();await flush();
 assert.equal(f.counts.blocks.length,0);
 assert.match(f.p().parts["[data-history-status]"].textContent,/archive non disponible/);
 assert.match(f.p().parts["[data-history-detail]"].textContent,/Jamais de substitution BTC/);
});
test("Period reload requests one new series, without new index; closed is inert",async()=>{
 const f=env();f.open();await flush();f.period("7d");await flush();
 assert.equal(f.counts.index,1);assert.equal(f.counts.blocks.length,2);
 assert.equal(f.counts.blocks[1].period,"7d");
 f.close();f.period("30d");await flush();assert.equal(f.counts.blocks.length,2);
});
test("A delayed BTC response is ignored after switching to OKB",async()=>{
 const f=env({pending:true});f.open();await flush();
 assert.equal(f.counts.blocks.length,1);
 f.select("okb","OKB");await flush();
 f.resolve(data());await flush();
 assert.equal(f.p().parts["[data-history-rows]"].children.length,0);
 assert.match(f.p().parts["[data-history-status]"].textContent,/archive non disponible/);
});
test("R10 fallback and R11 workflow_run chain exist, crons remain",()=>{
 assert.match(r10,/workflows: \["Atlas Public Crypto Market"\]/);
 assert.match(r10,/cron: '17 \* \* \* \*'/);
 assert.match(r10,/52\*60/);
 assert.match(r11,/workflows: \["Agent Crypto Historical OHLCV R10 Synchronized Hourly Pilot"\]/);
 assert.match(r11,/cron: '52 \* \* \* \*'/);
});
