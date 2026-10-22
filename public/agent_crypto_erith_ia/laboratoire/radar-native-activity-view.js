/* ERITH.IA · Descriptive history, not trading. Native executed TRADE counts are
 * available only by HOUR in the existing verified Binance derived archives.
 * No 1m/5m frequencies or unique participant identities are inferred. */
(function(){
"use strict";
const URL="../data/trader_flux/radar20_regimes/native_activity.json";
const SCHEMA="erith.radar20.native-hourly-trades-activity.v1";
const start=()=>{const el=document.getElementById("radar-native-activity");
 if(!el)return;
 const status=el.querySelector("[data-native-status]");
 const rows=el.querySelector("[data-native-rows]");
 const summary=el.querySelector("[data-native-summary]");
 const refresh=el.querySelector("[data-native-refresh]");
 let loading=false;
 const fmt=(n,precision=2)=>Number(n).toLocaleString("fr-FR",{maximumFractionDigits:precision});
 function reset(){rows.replaceChildren();summary.textContent="";}
 function validate(d){
  if(d?.schema!==SCHEMA||d.mode!=="EX_POST_HOURLY_OBSERVATION_NOT_SIGNALS"||
    d.orders_enabled!==false||d.real_orders!==0||d.paper_fills!==0||
    d.no_portfolio!==true||d.prediction!==false||
    d.not_out_of_sample!==true||!Array.isArray(d.periods)||d.periods.length!==2||
    !Number.isInteger(d.market_hours)||d.market_hours<=0 ||
    !d.granularity_limit?.includes("Hourly")||
    !d.definition||d.definition.hours_baseline_prior!==24||
    d.definition.native_trade_count?.includes("1m")||
    d.definition.execution_proven!==false)
   throw Error("Invalid native-hourly summary");
  if(d.periods.some(p=>p.assets!==20||
     !Array.isArray(p.time_windows_4h_utc)||
     p.time_windows_4h_utc.length!==6||
     !p.types?.buyer||!p.types?.seller||
     p.native_resolution!=="1h"))
   throw Error("Incomplete native market proof");
 }
 function draw(d){
  validate(d);reset();
  const labels={"2026-04..2026-06":"Avril–juin 2026",
    "2026-07..2026-09":"Juillet–septembre 2026"};
  let buy=0,sell=0,total=0;
  for(const p of d.periods){
    if(!Object.hasOwn(labels,p.period))throw Error("Archive quarter mismatch");
    const windows=p.time_windows_4h_utc;
    if(windows.reduce((n,w)=>n+w.market_hours,0)!==p.market_hours_evaluated)
      throw Error("Incomplete observed hours");
    buy+=p.types.buyer.sequences;sell+=p.types.seller.sequences;
    total+=p.market_hours_evaluated;
    for(const w of windows){
      if(!Number.isInteger(w.start_utc)||w.end_utc!==w.start_utc+4||
        !Number.isInteger(w.market_hours)||!Number.isInteger(w.native_trades)||
        !Number.isInteger(w.buyer_sequences)||!Number.isInteger(w.seller_sequences))
         throw Error("Malformed native hour bucket");
      const tr=document.createElement("tr");
      const cols=[labels[p.period],
       String(w.start_utc).padStart(2,"0")+"–"+String(w.end_utc).padStart(2,"0")+" UTC",
       fmt(w.market_hours,0),
       fmt(w.native_trades,0),
       w.mean_native_trade_usdt===null?"—":fmt(w.mean_native_trade_usdt)+" USDT",
       fmt(w.high_activity_hours,0),fmt(w.buyer_sequences,0),
       fmt(w.seller_sequences,0)];
      for(const value of cols){
        const td=document.createElement("td");td.textContent=value;tr.appendChild(td);
      }
      rows.appendChild(tr);
    }
  }
  if(total!==d.market_hours)throw Error("Source count mismatch");
  const detail=(p,side,h)=>{
    const x=p.types[side].forward_long_only[String(h)];
    return x?.measured?
      fmt(x.positive_rate_pct,1)+" % de fenêtres positives / "+
        fmt(x.measured,0)+" évaluables":
        "aucune fenêtre évaluable";
  };
  summary.textContent=fmt(total,0)+" observations actif-heure · "+
    fmt(buy,0)+" séquences acheteuses et "+fmt(sell,0)+" vendeuses "+
    "(3 heures consécutives ; les mêmes actifs peuvent revenir plusieurs fois). "+
    "Exemple 48 h après séquence acheteuse : avril–juin "+
    detail(d.periods[0],"buyer",48)+" ; juillet–septembre "+
    detail(d.periods[1],"buyer",48)+
    ". Ces tests de prix rétrospectifs ne tiennent pas compte des minima Spot, "+
    "du slippage ni de l'exécution.";
  status.textContent="Archives horaires Binance Spot/USDT, 120 fichiers vérifiés SHA-256 · "+
    "avril–septembre 2026 · données rétrospectives · aucun signal live.";
 }
 async function load(){
  if(loading)return;loading=true;if(refresh)refresh.disabled=true;
  const ctrl=new AbortController(),stop=setTimeout(()=>ctrl.abort(),12000);
  try{
    status.textContent="Lecture des preuves agrégées horaires…";
    const res=await fetch(new URL(URL,document.baseURI),{
      cache:"no-store",credentials:"omit",redirect:"error",signal:ctrl.signal});
    if(!res.ok)throw Error("Report missing");
    const content=await res.text();
    if(content.length>250000)throw Error("Report oversized");
    draw(JSON.parse(content));
  }catch(_){
    reset();
    status.textContent="Analyse native horaire indisponible ou incomplète. "+
      "Ne pas interpréter cette absence comme zéro transaction.";
  }finally{clearTimeout(stop);loading=false;if(refresh)refresh.disabled=false;}
 }
 if(refresh)refresh.addEventListener("click",()=>void load());
 const observer=()=>{if(el.open)void load()};
 el.addEventListener("toggle",observer);
 if(el.open)void load();
};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});
else start();
})();
