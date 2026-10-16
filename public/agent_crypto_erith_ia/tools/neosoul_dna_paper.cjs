#!/usr/bin/env node
"use strict";
/* DNA / NeoSoul PAPER, public Bitget SPOT only. No API keys or trading requests.
 * First verified books lock all entries; no hindsight/retries at better prices.
 * 10/25/100 USDC are three INDEPENDENT scenarios, not 135 USDC invested.
 */
const fs=require("node:fs");
const path=require("node:path");
const HERE=path.resolve(__dirname,"..");
const STORE=path.join(HERE,"data/trader_flux/dna_paper/state.json");
const HOURS=48, HORIZON=HOURS*3600000, MAX_BOOK_AGE=120000;
const BUDGETS=Object.freeze([10,25,100]);
const FEES=Object.freeze({usdc_to_usdt:0.001,dna_buy:0.001,dna_sell:0.001,usdt_to_usdc:0.001});
const SOURCE="https://api.bitget.com";
const isNum=v=>typeof v==="number"&&Number.isFinite(v)&&v>=0;
function invalid(message){throw new Error("DNA PAPER STOP: "+message);}
function list(raw,side){
 if(!Array.isArray(raw)||!raw.length)return invalid(side+" orderbook missing");
 const items=raw.slice(0,100).map(x=>({price:Number(x[0]),quantity:Number(x[1])}));
 if(items.some(x=>!isNum(x.price)||x.price<=0||!isNum(x.quantity)||x.quantity<=0))
  invalid(side+" book invalid");
 for(let i=1;i<items.length;i++){
  if(side==="bids"&&items[i].price>items[i-1].price)invalid("bid order");
  if(side==="asks"&&items[i].price<items[i-1].price)invalid("ask order");
 }
 return items;
}
function checkedPayload(raw,what){
 if(raw?.code!=="00000"||!raw.data)invalid(what+" unavailable");
 return raw.data;
}
function instrument(raw,symbol,now){
 const rows=checkedPayload(raw,"instruments");
 const v=Array.isArray(rows)?rows.find(x=>x.symbol===symbol&&x.category==="SPOT"):null;
 if(!v||String(v.status).toLowerCase()!=="online"||v.baseCoin!==symbol.slice(0,-4)||v.quoteCoin!=="USDT")
  invalid(symbol+" Spot instrument unavailable");
 const launched=Number(v.launchTime||0);
 if(launched>now||(!Number.isFinite(launched)))invalid("instrument launch time invalid");
 const minimum=Number(v.minOrderAmount);
 const precision=Number(v.quantityPrecision);
 if(!isNum(minimum)||minimum<=0||!Number.isInteger(precision)||precision<0||precision>12)
  invalid(symbol+" trading rules unavailable");
 return {symbol,minimum,precision,status:"online"};
}
function book(raw,what,now){
 const v=checkedPayload(raw,what);
 const ts=Number(v.ts);
 if(!Number.isFinite(ts)||now-ts>MAX_BOOK_AGE||now-ts< -30000)
  invalid(what+" stale or future book");
 const bids=list(v.b,"bids"),asks=list(v.a,"asks");
 if(bids[0].price>=asks[0].price)invalid(what+" crossed book");
 return {ts,bids,asks,bid:bids[0].price,ask:asks[0].price,
  spread_pct:100*(asks[0].price-bids[0].price)/((asks[0].price+bids[0].price)/2)};
}
/* Buy quoted base, consuming asks with quote currency to spend. */
function buyWithQuote(asks,quoteAmount){
 if(!isNum(quoteAmount)||quoteAmount<=0)return null;
 let remaining=quoteAmount,received=0,weighted=0;
 for(const level of asks){
  const spent=Math.min(remaining,level.price*level.quantity);
  const units=spent/level.price;
  received+=units;weighted+=spent;remaining-=spent;
  if(remaining<1e-8)break;
 }
 if(remaining>1e-6||received<=0)return null;
 return {base:received,quote:weighted,avg:weighted/received};
}
/* Sell base against bids. */
function sellBase(bids,amount){
 if(!isNum(amount)||amount<=0)return null;
 let remaining=amount,proceeds=0,filled=0;
 for(const level of bids){
  const units=Math.min(remaining,level.quantity);
  proceeds+=units*level.price;filled+=units;remaining-=units;
  if(remaining<1e-10)break;
 }
 if(remaining>1e-8||filled<=0)return null;
 return {base:filled,quote:proceeds,avg:proceeds/filled};
}
function roundDown(n,precision){
 const scale=10**precision;
 return Math.floor(n*scale+1e-9)/scale;
}
function validate(raw,now){
 const dnaRules=instrument(raw.dnaInstrument,"DNAUSDT",now);
 const fxRules=instrument(raw.fxInstrument,"USDCUSDT",now);
 const dna=book(raw.dnaBook,"DNAUSDT",now),fx=book(raw.fxBook,"USDCUSDT",now);
 const delta=Math.abs(dna.ts-fx.ts);
 if(delta>120000)invalid("DNA and FX timestamps inconsistent");
 return {dnaRules,fxRules,dna,fx,observed_at:new Date(now).toISOString(),venue:"Bitget",category:"SPOT",market:"DNAUSDT",fx_market:"USDCUSDT",
  token_contract:"0xA991F61940095AEA0724ef54077223B048c5CF7b"};
}
function entry(s,capital){
 const usdt=sellBase(s.fx.bids,capital);
 if(!usdt||usdt.quote<s.fxRules.minimum)return {capital_usdc:capital,status:"blocked",reason:"USDC/USDT sell book insufficient / min order"};
 const usable=usdt.quote*(1-FEES.usdc_to_usdt);
 if(usable<s.dnaRules.minimum)return {capital_usdc:capital,status:"blocked",reason:"DNAUSDT minOrderAmount not reached"};
 const dna=buyWithQuote(s.dna.asks,usable);
 if(!dna)return {capital_usdc:capital,status:"blocked",reason:"DNA asks insufficient for this size"};
 const qty=roundDown(dna.base*(1-FEES.dna_buy),s.dnaRules.precision);
 if(qty<=0)return {capital_usdc:capital,status:"blocked",reason:"DNA quantityPrecision rounds to zero"};
 return {capital_usdc:capital,status:"open",dna_quantity:qty,
  input_usdt:usdt.quote,entry_avg_usdt:dna.avg,
  entry_fx_usdt_per_usdc:usdt.avg,fees_assumed:FEES};
}
function evaluate(s,scenario){
 if(scenario.status!=="open")return {status:scenario.status,reason:scenario.reason};
 const sold=sellBase(s.dna.bids,scenario.dna_quantity);
 if(!sold||sold.quote<s.dnaRules.minimum)return {status:"unpriced",reason:"DNA bids insufficient / minOrderAmount"};
 const quoteNet=sold.quote*(1-FEES.dna_sell);
 if(quoteNet<s.fxRules.minimum)return {status:"unpriced",reason:"USDC/USDT reverse conversion below minimum"};
 const recovered=buyWithQuote(s.fx.asks,quoteNet);
 if(!recovered)return {status:"unpriced",reason:"USDC/USDT asks insufficient for reverse conversion"};
 const usdcNet=recovered.base*(1-FEES.usdt_to_usdc);
 const pnl=usdcNet-scenario.capital_usdc;
 return {status:"valued",exit_usdc:usdcNet,pnl_usdc:pnl,pnl_pct:pnl/scenario.capital_usdc*100,
  dna_exit_avg_usdt:sold.avg,reverse_fx_usdt_per_usdc:recovered.avg};
}
function evolve(old,s,now){
 const state=structuredClone(old);
 if(state.schema!=="erith.dna.paper.48h.v1"||state.executed_order!==false)
  invalid("state schema / order policy mismatch");
 if(state.status==="complete")return state;
 if(state.status==="waiting_source"){
  state.started_at=new Date(now).toISOString();
  state.ends_not_before=new Date(now+HORIZON).toISOString();
  state.status="open";
  state.scenarios=BUDGETS.map(c=>entry(s,c));
  state.fee_hypotheses=FEES;
  state.entry_books={dna_ts:new Date(s.dna.ts).toISOString(),fx_ts:new Date(s.fx.ts).toISOString(),
   dna_best_bid:s.dna.bid,dna_best_ask:s.dna.ask,dna_spread_pct:s.dna.spread_pct,
   fx_best_bid:s.fx.bid,fx_best_ask:s.fx.ask,fx_spread_pct:s.fx.spread_pct};
 }
 if(now<Date.parse(state.started_at))invalid("observation earlier than entry");
 if(!Array.isArray(state.observations))state.observations=[];
 const at=new Date(now).toISOString();
 if(state.observations.some(x=>x.observed_at===at))return state;
 const point={observed_at:at,dna_book_at:new Date(s.dna.ts).toISOString(),fx_book_at:new Date(s.fx.ts).toISOString(),
  dna_bid:s.dna.bid,dna_ask:s.dna.ask,dna_spread_pct:s.dna.spread_pct,
  fx_bid:s.fx.bid,fx_ask:s.fx.ask,
  scenarios:state.scenarios.map(v=>({capital_usdc:v.capital_usdc,...evaluate(s,v)}))};
 state.observations.push(point);
 // No past data reconstruction and no crossing from another token.
 if(now>=Date.parse(state.ends_not_before)){
  state.status=point.scenarios.some(x=>x.status==="unpriced")?"close_pending":"complete";
  if(state.status==="complete"){state.completed_at=at;state.final=point.scenarios;}
 }else state.status="open";
 state.last_observed_at=at;
 return state;
}
async function fetchJson(uri){
 const u=new URL(uri,SOURCE);
 if(u.protocol!=="https:"||u.host!=="api.bitget.com"||!u.pathname.startsWith("/api/v3/market/"))
  invalid("unsafe market source");
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),12500);
 try{
  const response=await fetch(u,{headers:{Accept:"application/json"},signal:controller.signal});
  if(!response.ok)invalid("HTTP "+response.status+" "+u.pathname);
  return await response.json();
 }finally{clearTimeout(timeout);}
}
async function snapshot(now){
 const sources=[
  "/api/v3/market/instruments?category=SPOT&symbol=DNAUSDT",
  "/api/v3/market/instruments?category=SPOT&symbol=USDCUSDT",
  "/api/v3/market/orderbook?category=SPOT&symbol=DNAUSDT&limit=100",
  "/api/v3/market/orderbook?category=SPOT&symbol=USDCUSDT&limit=100"
 ];
 const [dnaInstrument,fxInstrument,dnaBook,fxBook]=await Promise.all(sources.map(fetchJson));
 return validate({dnaInstrument,fxInstrument,dnaBook,fxBook},now);
}
async function main(){
 if(process.argv.includes("--self-test"))return;
 if(!process.argv.includes("--observe"))invalid("Use --observe or --self-test");
 const old=JSON.parse(fs.readFileSync(STORE,"utf8"));
 if(old.status==="complete"){console.log("DNA PAPER COMPLETE — no further requests");return;}
 const now=Date.now();
 const s=await snapshot(now);
 const next=evolve(old,s,now);
 if(JSON.stringify(next)===JSON.stringify(old))return;
 fs.writeFileSync(STORE,JSON.stringify(next,null,2)+"\n");
 console.log("DNA PAPER",next.status,"entry",next.started_at,"samples",next.observations.length);
}
if(require.main===module)main().catch(e=>{console.error(String(e.message||e));process.exitCode=1});
module.exports=Object.freeze({validate,evolve,entry,evaluate,buyWithQuote,sellBase,book,instrument,FEES,BUDGETS,HORIZON});
