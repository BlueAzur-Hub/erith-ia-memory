/* ERITH.IA Seven Heaven · read-only Radar 20 time-of-day audit.
 * All groups are based on ACCEPTED historical portfolio trades, not all
 * detected signals or native exchange trade executions. No signal generation.
 */
(function(root){
"use strict";
const SCHEMA="erith.trader.radar20.regime-diagnostic.v1.trades";
const PERIODS=["2026-04..2026-06","2026-07..2026-09"];
const STARTS=[0,4,8,12,16,20];
function number(v){return typeof v==="number"&&Number.isFinite(v);}
function safeRow(r){
 if(!r||!PERIODS.includes(r.quarter)||typeof r.entry_utc!=="string"||
   !/^2026-(?:0[4-9])-\d{2}T(?:[01]\d|2[0-3]):00:00Z$/.test(r.entry_utc)||
   !Number.isFinite(Date.parse(r.entry_utc))||
   !number(r.pnl_usdt)||!number(r.volume_multiplier)||r.volume_multiplier<=0||
   !number(r.taker_buy_pct)||r.taker_buy_pct<0||r.taker_buy_pct>100||
   typeof r.pair!=="string"||!/^[A-Z0-9]{2,40}USDT$/.test(r.pair))
   throw Error("Transaction historique non conforme");
 return {hour:Number(r.entry_utc.slice(11,13)),quarter:r.quarter,
   pnl:r.pnl_usdt,volume:r.volume_multiplier,buy:r.taker_buy_pct,pair:r.pair};
}
function aggregate(rows){
 const trades=rows.length,win=rows.filter(x=>x.pnl>0).length,
  pnl=rows.reduce((v,x)=>v+x.pnl,0);
 return {trades,winners:win,win_rate_pct:trades?100*win/trades:null,
  pnl_net_usdt:trades?pnl:null,
  volume_multiplier_mean:trades?rows.reduce((v,x)=>v+x.volume,0)/trades:null,
  taker_buy_share_mean_pct:trades?rows.reduce((v,x)=>v+x.buy,0)/trades:null,
  months_observed:[...new Set(rows.map(x=>x.quarter))]};
}
function audit(payload){
 if(payload?.schema!==SCHEMA||payload.orders_enabled!==false||
   !Array.isArray(payload.trades)||payload.trades.length!==258)
  throw Error("Contrat Radar20 historique non conforme");
 const rows=payload.trades.map(safeRow);
 const groups=STARTS.map(start=>{
   const window=rows.filter(x=>x.hour>=start&&x.hour<start+4);
   const byPeriod=PERIODS.map(p=>aggregate(window.filter(x=>x.quarter===p)));
   return {start_utc:start,end_utc:start+4,overall:aggregate(window),
    quarters:byPeriod};
 });
 if(groups.reduce((n,g)=>n+g.overall.trades,0)!==rows.length)
   throw Error("Périodes UTC incomplètes");
 return {schema:"erith.radar20.activity-time-diagnostic.v1",
  source_schema:SCHEMA,mode:"EXPLORATORY_ACCEPTED_PAPER_TRADES_ONLY",
  no_execution:true,not_all_signals:true,not_native_exchange_trade_count:true,
  cannot_rank_profitable_hours:true,total:aggregate(rows),groups,
  quarter_names:PERIODS};
}
function draw(result,table,summary){
 const fmt=(v,d=2)=>v===null?"non mesuré":v.toLocaleString("fr-FR",{
   maximumFractionDigits:d,minimumFractionDigits:d});
 const signed=v=>v===null?"—":(v>=0?"+":"")+fmt(v)+" USDT";
 table.replaceChildren();
 for(const g of result.groups){
  const tr=document.createElement("tr");
  const cells=[
   String(g.start_utc).padStart(2,"0")+"–"+String(g.end_utc).padStart(2,"0")+" UTC",
   String(g.overall.trades),
   g.overall.win_rate_pct===null?"—":fmt(g.overall.win_rate_pct,1)+" %",
   signed(g.overall.pnl_net_usdt),
   g.overall.volume_multiplier_mean===null?"—":fmt(g.overall.volume_multiplier_mean)+"×",
   g.overall.taker_buy_share_mean_pct===null?"—":fmt(g.overall.taker_buy_share_mean_pct,1)+" %",
   g.quarters.map((a,i)=>i===0?"Avr–juin : "+a.trades+" / "+signed(a.pnl_net_usdt):
     "Juil–sept : "+a.trades+" / "+signed(a.pnl_net_usdt)).join(" · ")
  ];
  for(const value of cells){
   const td=document.createElement("td");td.textContent=value;tr.appendChild(td);
  }
  table.appendChild(tr);
 }
 summary.textContent=result.total.trades+" opérations PAPER retenues sur six mois ; "+
   result.total.winners+" gagnantes · "+
   "aucune exécution réelle. Zéro entrée d'une plage = aucune transaction ACCEPTÉE, "+
   "pas absence de volume, de signal ou d'opportunité sur le marché.";
}
async function mount(){
 const table=document.getElementById("radar-activity-hourly-rows"),
  summary=document.getElementById("radar-activity-summary");
 if(!table||!summary)return;
 try{
  const url=new URL("../data/trader_flux/radar20_regimes/annotated_trades.json",document.baseURI);
  const response=await fetch(url,{cache:"no-store",credentials:"omit"});
  if(!response.ok)throw Error("archive non publiée");
  const raw=await response.text();
  if(raw.length>260000)throw Error("archive trop volumineuse");
  const r=audit(JSON.parse(raw));
  draw(r,table,summary);
 }catch(_){
  summary.textContent="Analyse horaire indisponible : archive absente ou non conforme. Aucun résultat inventé.";
 }
}
if(typeof module==="object"&&module.exports)module.exports={safeRow,aggregate,audit};
if(typeof document!=="undefined"){
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
 else void mount();
}
})(typeof globalThis!=="undefined"?globalThis:this);
