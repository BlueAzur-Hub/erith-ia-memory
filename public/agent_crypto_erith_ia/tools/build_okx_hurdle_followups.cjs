"use strict";
/* ERITH.IA · Persistent prospective OKX PAPER hurdle witness.
   Uses existing Spot PAPER preview. Never creates a fill, order or strategy.
   A future dated OKX bid (not USD history) may be compared to a past hurdle. */
const fs=require("node:fs"),path=require("node:path");
const engine=require("../trader/spot-paper-order-engine.js");
const ROOT=path.resolve(__dirname,"../data/crypto/radar-opportunities");
const SOURCE=path.join(ROOT,"qualification-latest.json");
const OUTPUT=path.join(ROOT,"okx-hurdle-followups.json");
const SCHEMA="erith.radar.okx.hurdle-followups.v1",U=1000000000000000000n;
function requireProof(ok,message){if(!ok)throw Error(message)}
function stamp(s){requireProof(typeof s==="string"&&s.endsWith("Z")&&Number.isFinite(Date.parse(s)), "UTC absent");return Date.parse(s)}
function decimal(v){
 const s=String(v??"");requireProof(/^\d{1,20}(?:\.\d{1,18})?$/.test(s),"Montant décimal non prouvé");
 const [a,b=""]=s.split(".");return BigInt(a)*U+BigInt(b.padEnd(18,"0"));
}
function fixed(n){requireProof(n>=0n,"Montant négatif");return String(n/U)+"."+String(n%U).padStart(18,"0").replace(/0+$/,"").padEnd(1,"0")}
function empty(){return{schema:SCHEMA,quote:"USDT",orders_enabled:false,paper_fills:0,
 real_orders:0,backtest:false,simulated_orders:0,
 policy:"OBSERVED_BID_ONLY_NO_EXECUTION_NO_RETROACTIVE_SELECTION",
 snapshots:[],studies:[]}}
function validated(state){
 requireProof(state?.schema===SCHEMA&&state.quote==="USDT"&&
   state.orders_enabled===false&&state.paper_fills===0&&state.real_orders===0&&
   state.backtest===false&&state.simulated_orders===0&&
   Array.isArray(state.snapshots)&&Array.isArray(state.studies)&&
   state.snapshots.length<=3650&&state.studies.length<=73000,
   "Journal prospectif incompatible");
 const keys=new Set();
 for(const x of state.studies){
  requireProof(typeof x?.id==="string"&&!keys.has(x.id)&&
   x.status==="HYPOTHETICAL_COST_STUDY_NO_FILL"&&
   x.pair===x.symbol+"-USDT"&&x.quote==="USDT"&&
   x.executed_order===false&&x.orders_enabled===false&&
   x.contract_identity_proven===false&&
   Array.isArray(x.followups)&&x.followups.length<=2,"Étude PAPER incohérente");
  stamp(x.entry_book_at_utc);keys.add(x.id);
 }
 return state;
}
function qualifiedSource(q){
 requireProof(q?.schema==="erith.radar.spot-qualification.v1"&&
  q.real_orders_enabled===false&&q.actual_execution_permissions===false&&
  q.coin_id_matches_exchange_symbol_verified===false&&
  q.quote==="USDT"&&Array.isArray(q.candidates)&&q.candidates.length===20&&
  q.candidates.every(c=>c&&typeof c.id==="string"&&c.okx_spot&&
   c.okx_spot.contract_identity_proven===false&&
   c.okx_spot.real_orders_enabled===false),
  "Qualification Radar publique insuffisante");
 stamp(q.qualified_at_utc);
 return q;
}
function checkedFuture(study,row){
 const spot=row?.okx_spot,book=spot?.best_book,r=spot?.rules;
 if(row.id!==study.coin_id||row.symbol!==study.symbol||
    spot?.pair!==study.pair||spot.quote!=="USDT"||
    spot.pair_observed!==true||spot.native_rules_verified!==true||
    spot.contract_identity_proven!==false||spot.real_orders_enabled!==false||
    r?.source!=="OKX_PUBLIC_SPOT_INSTRUMENT"||
    book?.schema!=="erith.radar.okx.spot-best-book.v1"||
    book.source!=="OKX_PUBLIC_SPOT_BOOK"||book.pair!==study.pair||
    book.quote!=="USDT"||book.market_execution_proven!==false||
    book.fees_verified!==false||book.orders_enabled!==false)return null;
 const observed=stamp(book.exchange_time_utc),collected=stamp(book.collected_at_utc);
 if(observed<=stamp(study.entry_book_at_utc)||observed>collected+5000||
    collected-observed>120000)return null;
 const price=decimal(book.best_bid_usdt),depth=decimal(book.best_bid_qty),
   ask=decimal(book.best_ask_usdt),askDepth=decimal(book.best_ask_qty),
   qty=decimal(study.net_sellable_qty),lot=decimal(r.lot_sz),min=decimal(r.min_sz),
   tick=decimal(r.tick_sz);
 if(!price||!ask||price>=ask||!depth||!askDepth||!qty||!lot||!min||!tick||
    price%tick||ask%tick||qty%lot||qty<min)return null;
 const baseline=decimal(study.entry_bid_usdt);
 const changePct=Number((price-baseline)*1000000n/baseline)/10000;
 const result={observed_at_utc:book.exchange_time_utc,
   observed_bid_usdt:book.best_bid_usdt,observed_bid_change_pct:changePct,
   status:"QUOTE_ONLY_NO_FILL",real_orders:0,orders_enabled:false,
   execution_proven:false,liquidity_at_other_levels_unknown:true,
   hypothetical_pnl_usdt:null};
 if(depth<qty)return{...result,status:"INSUFFICIENT_BEST_BID_DEPTH"};
 const entryInvestment=decimal(study.entry_investment_usdt);
 const gross=qty*price/U;
 const saleFee=(gross*10n+9999n)/10000n,
       slippage=(gross*20n+9999n)/10000n;
 if(gross<=saleFee+slippage)return{...result,status:"COSTS_EXCEED_QUOTED_EXIT"};
 const exitNet=gross-saleFee-slippage;
 const pnl=exitNet-entryInvestment;
 return{...result,
    status:pnl>=0n?"QUOTE_ABOVE_HYPOTHETICAL_HURDLE":"QUOTE_BELOW_HYPOTHETICAL_HURDLE",
    hypothetical_pnl_usdt:(pnl<0n?"-":"")+fixed(pnl<0n?-pnl:pnl),
    hypothetical_pnl_pct:Number((Number(pnl)*100/Number(entryInvestment)).toFixed(4)),
    bid_depth_proven_for_hypothetical_size:true};
}
/* Independent 24h/48h quote observer: keep all previously opened studies,
   including assets no longer selected among the 20 daily Radar candidates. */
function advanceFutureOnly(previous, observation){
 const state=validated(previous);
 requireProof(observation?.schema==="erith.radar.okx.public-followup-observation.v1"&&
   observation.orders_enabled===false&&observation.real_orders===0&&
   Array.isArray(observation.candidates)&&observation.candidates.length<=100,
   "Public followup observation invalid");
 const rows=new Map();
 for(const r of observation.candidates){
   requireProof(r&&typeof r.id==="string"&&!rows.has(r.id)&&
      typeof r.symbol==="string"&&r.okx_spot?.venue==="OKX"&&
      r.okx_spot.quote==="USDT"&&r.okx_spot.contract_identity_proven===false&&
      r.okx_spot.real_orders_enabled===false,
      "Duplicate/invalid independent OKX pair evidence");
   rows.set(r.id,r);
 }
 const studies=state.studies.map(s=>{
   const updated={...s,followups:[...s.followups]};
   if(updated.followups.length>=2)return updated;
   const r=rows.get(s.coin_id);
   if(!r)return updated;
   let evidence=null;
   try{evidence=checkedFuture(s,r)}catch(_){return updated}
   if(!evidence)return updated;
   const delta=(stamp(evidence.observed_at_utc)-stamp(s.entry_book_at_utc))/3600000;
   const window=delta>=23&&delta<=36?"24h":delta>=47&&delta<=60?"48h":null;
   if(window&&!updated.followups.some(f=>f.window===window))
     updated.followups.push({...evidence,window,elapsed_hours:Number(delta.toFixed(2))});
   return updated;
 });
 return validated({...state,studies});
}
function advance(previous,qualification){
 const prior=validated(previous||empty()),q=qualifiedSource(qualification);
 const studies=prior.studies.map(x=>({...x,followups:[...x.followups]}));
 const snapshots=[...prior.snapshots];
 const newest=new Map(q.candidates.map(x=>[x.id,x]));
 // Strictly future observations: a current book can never score itself.
 for(const s of studies){
  if(s.followups.length===2)continue;
  const row=newest.get(s.coin_id);if(!row)continue;
  let evidence=null;
  try{evidence=checkedFuture(s,row)}catch(_){continue}
  if(!evidence)continue;
  const elapsed=(stamp(evidence.observed_at_utc)-stamp(s.entry_book_at_utc))/3600000;
  const window=elapsed>=23&&elapsed<=36?"24h":elapsed>=47&&elapsed<=60?"48h":null;
  if(window&&!s.followups.some(f=>f.window===window)){
    s.followups.push({...evidence,window,elapsed_hours:Number(elapsed.toFixed(2))});
  }
 }
 const observed=q.candidates.filter(x=>x.okx_spot.pair_observed).length;
 const assessed=q.candidates.map(x=>({row:x,preview:engine.previewOkxSpot(x)}));
 const evaluable=assessed.filter(x=>x.preview.status==="HYPOTHETICAL_IMMEDIATE_ROUNDTRIP_ONLY");
 const qualifiedTime=stamp(q.qualified_at_utc);
 // A qualification can take some seconds while public books are fetched.
 const batchId=q.source_observation_date_utc+"|"+q.qualified_at_utc;
 if(!snapshots.some(x=>x.id===batchId)){
  requireProof(!snapshots.length||
     qualifiedTime>stamp(snapshots[snapshots.length-1].qualified_at_utc),
     "Qualification rejouée dans le désordre");
  snapshots.push({id:batchId,qualified_at_utc:q.qualified_at_utc,
    candidates:20,okx_pairs:observed,cost_evaluable:evaluable.length,
    orders_enabled:false,selection:"ALL_20_RADAR_CANDIDATES_NO_BACKFILL"});
 }
 for(const {row,preview} of evaluable){
  const at=row.okx_spot.best_book.exchange_time_utc;
  const key=row.id+"|"+at.slice(0,10);
  if(studies.some(s=>s.id===key))continue; // never reset the first daily basis
  const buy=decimal(preview.buyCostUSDT);
  const reserve=(buy*20n+9999n)/10000n;
  const investment=buy+reserve;
  if(investment>100n*U)continue;
  studies.push({id:key,coin_id:row.id,symbol:row.symbol,pair:row.okx_spot.pair,
   quote:"USDT",entry_book_at_utc:at,entry_bid_usdt:row.okx_spot.best_book.best_bid_usdt,
   entry_ask_usdt:row.okx_spot.best_book.best_ask_usdt,
   entry_investment_usdt:fixed(investment),
   net_sellable_qty:preview.netSellableQuantity,
   break_even_bid_rise_pct:preview.approximateBidRiseToBreakEvenPct,
   fee_assumption:"BASE buy 10 bps; USDT sell 10 bps; stress 20 bps each side",
   status:"HYPOTHETICAL_COST_STUDY_NO_FILL",contract_identity_proven:false,
   orders_enabled:false,executed_order:false,followups:[]});
 }
 return validated({...prior,snapshots,studies});
}
function main(){
 // Existing daily selection starts new prospective studies; separate public
 // followups never open a new position, even if a market jumps.
 if(process.argv[2]==="--future-only"){
   const input=process.argv[3];
   requireProof(typeof input==="string"&&input.startsWith("/")&&process.argv.length===4,
      "Expected one absolute evidence path");
   if(!fs.existsSync(OUTPUT)){
     process.stdout.write(JSON.stringify({status:"NO_PROSPECTIVE_JOURNAL",changed:false})+"\n");
     return;
   }
   const evidence=JSON.parse(fs.readFileSync(input,"utf8"));
   const previous=JSON.parse(fs.readFileSync(OUTPUT,"utf8"));
   const next=advanceFutureOnly(previous,evidence);
   const raw=JSON.stringify(next,null,2)+"\n";
   const current=fs.readFileSync(OUTPUT,"utf8");
   if(raw!==current){
     const temp=OUTPUT+".write-"+process.pid;
     fs.writeFileSync(temp,raw,"utf8");
     fs.renameSync(temp,OUTPUT);
   }
   process.stdout.write(JSON.stringify({status:"READ_ONLY_QUOTES",changed:raw!==current,
     studies:next.studies.length,followups:next.studies.reduce((n,s)=>n+s.followups.length,0)})+"\n");
   return;
 }
 requireProof(process.argv.length===2,"Unknown argument");
 const source=JSON.parse(fs.readFileSync(SOURCE,"utf8"));
 const previous=fs.existsSync(OUTPUT)?JSON.parse(fs.readFileSync(OUTPUT,"utf8")):null;
 const next=advance(previous,source),out=JSON.stringify(next,null,2)+"\n";
 const old=fs.existsSync(OUTPUT)?fs.readFileSync(OUTPUT,"utf8"):null;
 if(out!==old)fs.writeFileSync(OUTPUT,out,"utf8");
 process.stdout.write(JSON.stringify({snapshots:next.snapshots.length,studies:next.studies.length,
   followups:next.studies.reduce((n,s)=>n+s.followups.length,0),changed:out!==old})+"\n");
}
if(require.main===module)main();
module.exports=Object.freeze({SCHEMA,empty,advance,advanceFutureOnly,checkedFuture});
