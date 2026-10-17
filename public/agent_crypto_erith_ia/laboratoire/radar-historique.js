/* ERITH.IA · Historical Radar PAPER · public archives only; NO trading permissions. */
(function(root){
"use strict";
const DATA="https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/main/public/agent_crypto_erith_ia/data/trader_flux/";
const ARCHIVE=DATA+"radar20/";
const HOUR=3600000, SHA=/^[0-9a-f]{64}$/i;
const EXPECTED=["timestamp_ms","open_usdt","high_usdt","low_usdt","close_usdt","volume_usdt","taker_buy_usdt","taker_sell_usdt","taker_buy_pct","trades"];
const numeric=x=>typeof x==="number"&&Number.isFinite(x);
const validPrice=x=>numeric(x)&&x>0;
function validateIndex(manifest){
 if(manifest?.schema!=="erith.trader.radar20.flows.index.v1"||manifest.orders_enabled!==false||
    manifest.strategy_certified!==false||manifest.markets!==20||
    !Array.isArray(manifest.entries)||manifest.entries.length!==60||
    !Array.isArray(manifest.months)||manifest.months.join(",")!=="2026-07,2026-08,2026-09")
   throw Error("Le catalogue historique ne correspond pas au contrat Radar20.");
 const pairMonths=new Set(),pairSet=new Set();
 for(const e of manifest.entries){
  if(!/^[A-Z0-9]+USDT$/.test(e.pair)||!/^2026-0[789]$/.test(e.month)||
     e.path!==e.pair+"/"+e.month+".json"||!SHA.test(e.sha256||"")||
     !Number.isInteger(e.hours)||e.hours<672||e.hours>744||
     !Number.isInteger(e.bytes)||e.bytes<1000)throw Error("Entrée d'archive incorrecte.");
  const key=e.pair+":"+e.month;if(pairMonths.has(key))throw Error("Doublon paire/mois.");pairMonths.add(key);pairSet.add(e.pair);
 }
 if(pairSet.size!==20||[...pairSet].some(p=>manifest.months.some(m=>!pairMonths.has(p+":"+m))))
  throw Error("Couverture Radar20 non complète dans le catalogue.");
 return [...pairSet].sort();
}
function validateMonth(entry,document){
 if(document?.schema===undefined||document.pair!==entry.pair||document.month!==entry.month||
    document.quote!=="USDT"||document.venue!=="Binance Spot"||
    document.orders_enabled!==false||document.strategy_certified!==false||
    document.resolution!=="1h"||!Array.isArray(document.columns)||
    document.columns.join("|")!==EXPECTED.join("|")||
    !Array.isArray(document.rows)||document.rows.length!==entry.hours||
    document.row_count!==entry.hours||
    document.source?.sha256!==entry.source_zip_sha256||
    document.source?.native_minutes_verified!==entry.hours*60)throw Error("Structure historique ou propriétaire de données non conforme : "+entry.path);
 const start=Date.parse(entry.month+"-01T00:00:00Z");
 for(let i=0;i<document.rows.length;i++){
  const x=document.rows[i];
  if(!Array.isArray(x)||x.length!==EXPECTED.length||x[0]!==start+i*HOUR||
     !validPrice(x[1])||!validPrice(x[2])||!validPrice(x[3])||!validPrice(x[4])||
     x[2]<Math.max(x[1],x[4])||x[3]>Math.min(x[1],x[4])||
     !numeric(x[5])||x[5]<0)throw Error("Bougie incomplète, horodatage absent ou OHLC invalide : "+entry.path+" rang "+i);
 }
 return document.rows;
}
function slicePeriod(rows,days){
 if(!Number.isInteger(days)||![7,30,60,90].includes(days))throw Error("Durée non prise en charge.");
 const amount=days*24;
 if(rows.length<amount)throw Error("Historique insuffisant pour "+days+" jours.");
 const series=rows.slice(-amount);
 for(let i=1;i<series.length;i++)if(series[i][0]!==series[i-1][0]+HOUR)
   throw Error("Trou dans la fenêtre d'analyse : simulation interdite.");
 return series;
}
function estimateHold(rows,capital,costPct){
 if(!Array.isArray(rows)||rows.length<2||!numeric(capital)||capital<=0||
    !numeric(costPct)||costPct<0||costPct>=100)throw Error("Hypothèse de simulation invalide.");
 const first=rows[0],last=rows[rows.length-1];if(!validPrice(first[1])||!validPrice(last[4]))throw Error("Prix de simulation non disponible.");
 const grossPct=(last[4]/first[1]-1)*100;
 const final=capital*last[4]/first[1]*(1-costPct/100);
 let peak=0,maxDrawdown=0;
 for(const row of rows){
  if(!validPrice(row[4]))throw Error("Clôture non exploitable.");
  peak=Math.max(peak,row[4]);
  maxDrawdown=Math.max(maxDrawdown,(peak-row[4])/peak*100);
 }
 return {grossPct,final,net:final-capital,netPct:(final/capital-1)*100,
  maxDrawdownPct:maxDrawdown,volume:rows.reduce((n,row)=>n+row[5],0),
  firstTimestamp:first[0],lastTimestamp:last[0],firstPrice:first[1],lastPrice:last[4]};
}
function analyzeWindows(rows,capital,costPct){
 if(!Array.isArray(rows)||rows.length<48)throw Error("Moins de 48 bougies.");
 const returns=[];
 for(let i=0;i+48<=rows.length;i+=48){
  const slice=rows.slice(i,i+48);
  // An independent 48h sample, not a trading signal or compounded portfolio.
  returns.push(estimateHold(slice,capital,costPct).net);
 }
 const total=returns.reduce((x,y)=>x+y,0);
 return {count:returns.length,wins:returns.filter(x=>x>0).length,avg:total/returns.length,
   best:Math.max(...returns),worst:Math.min(...returns)};
}
if(typeof module!=="undefined"&&module.exports)module.exports=Object.freeze({validateIndex,validateMonth,slicePeriod,estimateHold,analyzeWindows});
if(typeof document==="undefined")return;
const $=id=>document.getElementById(id);
const fmt=(v,d=2)=>new Intl.NumberFormat("fr-FR",{maximumFractionDigits:d,minimumFractionDigits:d}).format(v);
const pct=v=>(v>0?"+":"")+fmt(v,2)+" %";
const cash=v=>fmt(v,2)+" USDT";
const date=ts=>new Date(ts).toLocaleString("fr-FR",{timeZone:"UTC",day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})+" UTC";
const state={index:null,cache:new Map(),busy:false,latestToken:0,comparison:null,comparisonToken:0};
function status(message,err=false){$("status").textContent=message;$("status").style.color=err?"#ffa1ac":"";}
async function source(url){
 const r=await fetch(url,{cache:"no-store",credentials:"omit",mode:"cors"});
 if(!r.ok)throw Error("Lecture publique impossible (HTTP "+r.status+") : "+url.split("/").at(-1));
 return await r.text();
}
async function verifiedFile(entry){
 if(state.cache.has(entry.path))return state.cache.get(entry.path);
 const raw=await source(ARCHIVE+entry.path);
 const bytes=new TextEncoder().encode(raw);
 if(bytes.length!==entry.bytes)throw Error("Taille de l'archive modifiée : "+entry.path);
 if(!globalThis.crypto?.subtle)throw Error("Vérification SHA-256 indisponible dans ce navigateur.");
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes)),x=>x.toString(16).padStart(2,"0")).join("");
 if(hash!==entry.sha256)throw Error("Empreinte SHA-256 différente : "+entry.path);
 const doc=JSON.parse(raw);
 const rows=validateMonth(entry,doc);
 state.cache.set(entry.path,rows);
 return rows;
}
function setNumber(id,content,score){
 const el=$(id);el.textContent=content;
 el.classList.toggle("positive",numeric(score)&&score>0);
 el.classList.toggle("negative",numeric(score)&&score<0);
}
function chart(rows,pair){
 const svg=$("history-chart"),NS="http://www.w3.org/2000/svg";
 svg.replaceChildren();
 const add=(tag,attrs={},txt)=>{
  const e=document.createElementNS(NS,tag);
  for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));
  if(txt!==undefined)e.textContent=txt;
  svg.append(e);return e;
 };
 const close=rows.map(r=>r[4]),min=Math.min(...close),max=Math.max(...close),pad=Math.max((max-min)*.12,max*.003),lo=Math.max(0,min-pad),hi=max+pad;
 const x=i=>62+i*(865/(rows.length-1));
 const y=v=>261-(v-lo)/(hi-lo)*214;
 for(let i=0;i<5;i++){
  const yy=261-i*53.5;
  add("line",{x1:62,x2:927,y1:yy,y2:yy,stroke:"#315269","stroke-width":.9});
  add("text",{x:8,y:yy+4,fill:"#b5cbd2","font-size":11},fmt(lo+(hi-lo)*i/4,max>=1?2:6));
 }
 const limit=320,step=Math.max(1,Math.ceil(rows.length/limit)),indices=[];
 for(let i=0;i<rows.length;i+=step)indices.push(i);
 if(indices.at(-1)!==rows.length-1)indices.push(rows.length-1);
 add("polyline",{points:indices.map(i=>x(i).toFixed(1)+","+y(close[i]).toFixed(1)).join(" "),
   stroke:"#85e5fb","stroke-width":2.1,fill:"none","stroke-linejoin":"round"});
 add("text",{x:64,y:290,fill:"#a7c0cd","font-size":12},new Date(rows[0][0]).toISOString().slice(0,10));
 add("text",{x:840,y:290,fill:"#a7c0cd","font-size":12},new Date(rows.at(-1)[0]).toISOString().slice(0,10));
 add("text",{x:65,y:23,fill:"#ffe0a1","font-size":13,"font-weight":700},pair+" · clôtures Binance Spot · USDT");
}
async function analyze(){
 if(state.busy||!state.index)return;
 const pair=$("pair").value,days=Number($("days").value),capital=Number($("capital").value),cost=Number($("cost").value);
 if(!numeric(capital)||capital<1||capital>100000||!numeric(cost)||cost<0||cost>=100){status("Hypothèses invalides : capital entre 1 et 100 000 USDT.",true);return;}
 const targets=state.index.entries.filter(e=>e.pair===pair).sort((a,b)=>a.month.localeCompare(b.month));
 if(targets.length!==3){status("Identité de paire ou trois mois manquants : aucun calcul.",true);return;}
 const token=++state.latestToken;state.busy=true;$("analyze").disabled=true;$("compare20").disabled=true;
 status("Chargement et vérification SHA-256 des 3 archives de "+pair+"…");
 try{
  const data=await Promise.all(targets.map(verifiedFile));
  if(token!==state.latestToken)return;
  const rows=data.flat(),period=slicePeriod(rows,days),results=estimateHold(period,capital,cost),windows=analyzeWindows(period,capital,cost);
  // Verify the joined month boundary before any simulation.
  for(let i=1;i<rows.length;i++)if(rows[i][0]!==rows[i-1][0]+HOUR)throw Error("Discontinuité entre les mois : résultats refusés.");
  setNumber("dates",new Date(results.firstTimestamp).toISOString().slice(0,10)+" → "+new Date(results.lastTimestamp).toISOString().slice(0,10));
  setNumber("bars",fmt(period.length,0)+" h");
  setNumber("gross",pct(results.grossPct),results.grossPct);
  setNumber("volume",fmt(results.volume/1e6,2)+" M USDT");
  setNumber("drawdown",fmt(results.maxDrawdownPct,2)+" %",-results.maxDrawdownPct);
  setNumber("hold-final",cash(results.final),results.net);
  setNumber("hold-net",(results.net>0?"+":"")+cash(results.net)+" ("+pct(results.netPct)+")",results.net);
  $("hold-info").textContent="Achat fictif au cours d'ouverture "+fmt(results.firstPrice,6)+" USDT le "+date(results.firstTimestamp)+" ; vente fictive à la clôture "+fmt(results.lastPrice,6)+" USDT le "+date(results.lastTimestamp)+".";
  setNumber("windows",fmt(windows.count,0));
  setNumber("winrate",fmt(100*windows.wins/windows.count,1)+" %");
  setNumber("average",(windows.avg>0?"+":"")+cash(windows.avg),windows.avg);
  $("window-info").textContent="Sur "+windows.count+" fenêtres indépendantes de 48 h, meilleure "+cash(windows.best)+", pire "+cash(windows.worst)+". Chaque essai repart de "+cash(capital)+".";
  chart(period,pair);
  $("source-proof").textContent=pair+" · "+targets.length+" mois · "+rows.length+" bougies horaires continues (juillet à septembre 2026) · tailles et empreintes SHA-256 des archives validées · fenêtres "+days+" jours · Binance Spot USDT. Dernière clôture : "+date(rows.at(-1)[0])+". Aucune donnée après cette date.";
  status("Archive validée et simulation PAPER calculée sur "+fmt(period.length,0)+" clôtures horaires. Résultat historique, pas une prévision.");
 }catch(e){
  for(const id of ["dates","bars","gross","volume","drawdown","hold-final","hold-net","windows","winrate","average"])setNumber(id,"—");
  $("source-proof").textContent="Vérification incomplète : aucun résultat historique certifié pour cette sélection.";
  $("history-chart").replaceChildren();
  status("Analyse non disponible : "+String(e.message||e),true);
 }finally{state.busy=false;$("analyze").disabled=false;$("compare20").disabled=!state.index;}
}
async function report(){
 try{
  const [pastText,recentText]=await Promise.all([
    source(DATA+"radar20_retro_stress/summary.json"),
    source(DATA+"radar20_portfolio/summary.json")
  ]);
  const past=JSON.parse(pastText),recent=JSON.parse(recentText);
  if(past.schema!=="erith.trader.radar20.retrospective-stress.v1"||
    recent.schema!=="erith.trader.radar20.shared-capital-paper.v1"||
    past.orders_enabled!==false||recent.orders_enabled!==false||
    past.strategy_certified!==false)throw Error("Schémas de simulations incompatibles.");
  const tbody=$("regimes");tbody.replaceChildren();
  for(const [label,obj,nature] of [["2026-04 → 2026-06",past,"Rétrospective, biais de sélection"],["2026-07 → 2026-09",recent,"Étude historique, non prospective"]]){
   const p=obj.primary;if(!p||!numeric(p.total_profit_net_usdt)||!numeric(p.drawdown_pct)||p.capital_usdt!==400||p.hold_hours!==48||p.assumed_roundtrip_fee_pct!==.8)throw Error("Paramètres principaux incompatibles.");
   const tr=document.createElement("tr");
   for(const v of [label,String(p.completed_trades),(p.total_profit_net_usdt>0?"+":"")+cash(p.total_profit_net_usdt),fmt(p.drawdown_pct,2)+" %",nature]){
    const td=document.createElement("td");td.textContent=v;tr.append(td);
   }
   tbody.append(tr);
  }
  $("regimes-info").textContent="Résultats de deux archives distinctes, non cumulés en une performance certifiée. Les prix et les ordres réels n'ont pas été rejoués dans ce tableau.";
 }catch(e){
  $("regimes").replaceChildren();
  const tr=document.createElement("tr"),td=document.createElement("td");td.colSpan=5;td.textContent="Rapports indisponibles ou incompatibles : "+String(e.message||e);tr.append(td);$("regimes").append(tr);
 }
}

/* Reuse the individual study's SHA-256 checks, validation and mathematics.
   The group ranks independent PAPER observations, never an executable portfolio. */
function comparisonStatus(message,err=false){
 const node=$("comparison-status");node.textContent=message;node.style.color=err?"#ffa1ac":"";
 // Also report progress beside the command; the user must not hunt for the table.
 status(message,err);
}
function clearComparison(){
 ++state.comparisonToken;state.comparison=null;
 $("comparison-rows").replaceChildren();
 const tr=document.createElement("tr"),td=document.createElement("td");
 td.colSpan=7;td.textContent="Paramètres modifiés : relancez la comparaison pour éviter les chiffres périmés.";
 tr.append(td);$("comparison-rows").append(tr);
 $("comparison-proof").textContent="Aucun résultat conservé après changement des hypothèses.";
 comparisonStatus("Comparaison à recalculer avec les nouveaux paramètres.");
}
function renderComparison(){
 if(!state.comparison)return;
 const {studies,days,capital,cost}=state.comparison;
 const valid=studies.filter(x=>!x.error),invalid=studies.filter(x=>x.error);
 const mode=$("comparison-sort").value;
 const sorting={
  net:(a,b)=>b.hold.net-a.hold.net,
  repli:(a,b)=>a.hold.maxDrawdownPct-b.hold.maxDrawdownPct,
  windows:(a,b)=>(b.windows.wins/b.windows.count)-(a.windows.wins/a.windows.count),
  volume:(a,b)=>b.hold.volume-a.hold.volume,
  pair:(a,b)=>a.pair.localeCompare(b.pair)
 };
 valid.sort((a,b)=>(sorting[mode]||sorting.net)(a,b)||a.pair.localeCompare(b.pair));
 const tbody=$("comparison-rows");tbody.replaceChildren();
 const appendCell=(tr,value,score)=>{
  const td=document.createElement("td");td.textContent=value;
  if(numeric(score))td.classList.add(score<0?"negative":"positive");
  tr.append(td);
 };
 for(const x of valid){
  const tr=document.createElement("tr");
  const v=x.hold,w=x.windows;
  appendCell(tr,x.pair.replace("USDT"," / USDT"));
  appendCell(tr,(v.net>0?"+":"")+cash(v.net),v.net);
  appendCell(tr,pct(v.netPct),v.netPct);
  appendCell(tr,fmt(v.maxDrawdownPct,2)+" %");
  appendCell(tr,w.wins+" / "+w.count+" ("+fmt(100*w.wins/w.count,1)+" %)");
  appendCell(tr,(w.avg>0?"+":"")+cash(w.avg),w.avg);
  appendCell(tr,fmt(v.volume/1e6,2));
  tbody.append(tr);
 }
 for(const x of invalid){
  const tr=document.createElement("tr"),td=document.createElement("td");
  td.colSpan=7;td.className="negative";
  td.textContent=x.pair+" · non classé : "+x.error;
  tr.append(td);tbody.append(tr);
 }
 const success=valid.length,failed=invalid.length,winCount=valid.reduce((n,x)=>n+x.windows.wins,0);
 const totalWindows=valid.reduce((n,x)=>n+x.windows.count,0);
 comparisonStatus(success+"/20 marchés vérifiés · "+failed+" archive(s) écartée(s) · "+winCount+"/"+totalWindows+" fenêtres de 48 h positives."+(failed?" Comparatif partiel : voir les refus en bas.":""));
 $("comparison-proof").textContent=days+" jours · "+cash(capital)+" indépendants par actif · coût aller-retour supposé "+fmt(cost,1)+" % · "+
  (success*3)+" archives mensuelles contrôlées en taille et SHA-256 · données Binance Spot USDT, juillet–septembre 2026. "+
  "Repli maximal sur clôtures horaires seulement. Fenêtres 48 h indépendantes, non composées. Aucun ordre ni rendement futur garanti.";
}
async function compareAll(){
 if(state.busy||!state.index)return;
 const days=Number($("days").value),capital=Number($("capital").value),cost=Number($("cost").value);
 if(!Number.isInteger(days)||![7,30,60,90].includes(days)||!numeric(capital)||capital<1||capital>100000||
    !numeric(cost)||cost<0||cost>=100){comparisonStatus("Hypothèses invalides : durée, capital ou frais.",true);return;}
 let pairs;
 try{pairs=validateIndex(state.index);}catch(e){comparisonStatus("Catalogue incompatible : "+e.message,true);return;}
 const token=++state.comparisonToken;
 state.comparison=null;state.busy=true;
 $("analyze").disabled=true;$("compare20").disabled=true;
 $("comparison-rows").replaceChildren();
 comparisonStatus("Comparaison en cours : 0/20 actifs étudiés…");
 let cursor=0,done=0;
 const studies=new Array(pairs.length);
 async function worker(){
  while(cursor<pairs.length){
   const at=cursor++,pair=pairs[at];
   const targets=state.index.entries.filter(e=>e.pair===pair).sort((a,b)=>a.month.localeCompare(b.month));
   try{
    if(targets.length!==3)throw Error("Trois archives mensuelles absentes.");
    const months=await Promise.all(targets.map(verifiedFile));
    const joined=months.flat();
    for(let i=1;i<joined.length;i++){
     if(joined[i][0]!==joined[i-1][0]+HOUR)throw Error("Discontinuité horaire entre archives.");
    }
    const period=slicePeriod(joined,days);
    studies[at]={pair,hold:estimateHold(period,capital,cost),windows:analyzeWindows(period,capital,cost)};
   }catch(e){
    studies[at]={pair,error:String(e.message||e)};
   }
   done++;
   if(token===state.comparisonToken)comparisonStatus("Comparaison en cours : "+done+"/20 actifs étudiés…");
  }
 }
 try{
  await Promise.all([worker(),worker(),worker()]);
  if(token!==state.comparisonToken)return;
  state.comparison={studies,days,capital,cost};
  renderComparison();
 }finally{
  state.busy=false;$("analyze").disabled=false;$("compare20").disabled=!state.index;
 }
}

async function init(){
 try{
  const text=await source(ARCHIVE+"index.json");
  const manifest=JSON.parse(text),pairs=validateIndex(manifest);
  state.index=manifest;
  $("pair").replaceChildren();
  for(const p of pairs){const o=document.createElement("option");o.value=p;o.textContent=p.replace("USDT"," / USDT");$("pair").append(o);}
  $("pair").value=pairs.includes("ETHUSDT")?"ETHUSDT":pairs[0];
  $("pair").disabled=false;$("analyze").disabled=false;$("compare20").disabled=false;
  status("20 marchés · 60 archives mensuelles · juillet–septembre 2026 · sélectionnez une durée puis étudiez.");
 }catch(e){status("Catalogue indisponible : "+String(e.message||e),true);}
}
function clearOutdatedResults(){
 for(const id of ["dates","bars","gross","volume","drawdown","hold-final","hold-net","windows","winrate","average"])setNumber(id,"—");
 $("history-chart").replaceChildren();
 $("hold-info").textContent="Hypothèses modifiées : aucun ancien résultat conservé.";
 $("window-info").textContent="Veuillez lancer une nouvelle simulation sur les archives.";
 $("source-proof").textContent="Sélection modifiée : l'ancienne preuve ne correspond plus aux hypothèses actuelles.";
 status("Sélection modifiée · étudiez l'historique pour obtenir de nouveaux calculs.");
}
$("analyze").addEventListener("click",analyze);
$("compare20").addEventListener("click",compareAll);
$("comparison-sort").addEventListener("change",renderComparison);
for(const control of ["days","cost","pair","capital"]){
 $(control).addEventListener("change",()=>{clearOutdatedResults();if(control!=="pair")clearComparison();});
}
init();report();
})(typeof window!=="undefined"?window:globalThis);
