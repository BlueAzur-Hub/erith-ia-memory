/* Seven Radar — lecture d'archives publiques réelles ZEC et AXIS.
   Pas d'API échange depuis Firefox, aucun compte, ordre ou estimation live. */
(function(root,factory){
"use strict";
const api=factory();
if(typeof module==="object"&&module.exports)module.exports=api;
if(root&&root.document)api.mount(root.document);
})(typeof window==="undefined"?null:window,()=>{
"use strict";
const SCHEMA="erith.case-market-public-hourly.v1";
const EXPECTED=[["ZEC","OKX_EEA","ZEC-USDC","USDC"],["AXIS","BITGET","AXISUSDT","USDT"]];
const decimal=s=>typeof s==="string"&&/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(s)&&
 Number.isFinite(Number(s))?Number(s):null;
function dt(s){return typeof s==="string"&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(s)
 ?Date.parse(s):NaN;}
function verify(latest,day,now=Date.now()){
 if(latest?.schema!=="erith.case-market-hourly-status.v1"||
    latest.orders_enabled!==false||latest.real_orders!==0||
    !/^\d{4}-\d\d-\d\dT\d\dZ$/.test(latest.last_hour_utc||""))
   throw Error("Index des observations invalidé");
 const hour=latest.last_hour_utc;
 if(latest.source_day!==hour.slice(0,10)||day?.schema!==SCHEMA||
    day.date_utc!==latest.source_day||!Array.isArray(day.hours)||
    day.hours.length<1||day.hours.length>24||day.orders_enabled!==false||
    day.real_orders!==0)
   throw Error("Archives datées manquantes ou incompatibles");
 const observation=day.hours.find(x=>x.hour_utc===hour);
 if(!observation||day.hours.filter(x=>x.hour_utc===hour).length!==1||
    observation.schema!==SCHEMA||observation.spot_only!==true||
    observation.separate_native_quotes!==true||observation.orders_enabled!==false||
    observation.real_orders!==0||observation.paper_fills!==0||
    observation.trade_signal!==false||observation.markets?.length!==2)
   throw Error("Observation Spot ou heure incohérentes");
 const observedAt=dt(observation.at_utc);
 if(!Number.isFinite(observedAt)||observedAt>now+30000||
    new Date(observedAt).toISOString().slice(0,13)!==hour.slice(0,13))
   throw Error("Horodatage absent ou futur");
 const markets=observation.markets.map((item,i)=>{
  const [symbol,venue,pair,quote]=EXPECTED[i];
  if(!item||item.symbol!==symbol||item.venue!==venue||item.pair!==pair||
     item.quote!==quote||item.type!=="SPOT"||
     !["OBSERVED","UNAVAILABLE"].includes(item.status))
    throw Error("Identité Spot/quote discordante");
  if(item.status==="UNAVAILABLE"){
   if(item.proof!==null)throw Error("Prix inférés pour source absente");
   return {symbol,venue,pair,quote,status:"UNAVAILABLE"};
  }
  const proof=item.proof,b=proof?.book,t=proof?.ticker,bars=proof?.closed_15m;
  if(!b||!t||!Array.isArray(bars)||!bars.length||bars.length>4||
      b.fill_proven!==false||decimal(b.best_bid)===null||decimal(b.best_ask)===null||
      decimal(b.best_bid)>=decimal(b.best_ask)||
      decimal(b.spread_bps)===null||decimal(t.last)===null||
      decimal(b.top5_bid_quote_depth)===null||decimal(b.top5_ask_quote_depth)===null||
      !Array.isArray(b.bid5)||!Array.isArray(b.ask5)||
      b.bid5.length>5||b.ask5.length>5||!b.bid5.length||!b.ask5.length)
   throw Error("Carnet ou ticker absent/invalide");
  for(const time of [b.source_at_utc,t.source_at_utc]){
   const observed=dt(time);
   if(!Number.isFinite(observed)||Math.abs(observed-observedAt)>300000)
    throw Error("Événements de marché non contemporains");
  }
  let previous=-Infinity;
  for(const bar of bars){
   const n=dt(bar.open_at_utc),o=decimal(bar.open),hi=decimal(bar.high),
    lo=decimal(bar.low),cl=decimal(bar.close);
   if(!Number.isFinite(n)||n<=previous||n%900000!==0||n+900000>observedAt-15000||
      o===null||hi===null||lo===null||cl===null||lo>Math.min(o,cl)||
      hi<Math.max(o,cl)||decimal(bar.volume_base)===null||
      decimal(bar.volume_quote)===null)
    throw Error("Bougie 15 minutes non close ou invalide");
   previous=n;
  }
  return {symbol,venue,pair,quote,status:"OBSERVED",
   last:decimal(t.last),bid:decimal(b.best_bid),ask:decimal(b.best_ask),
   spread:decimal(b.spread_bps),bidDepth:decimal(b.top5_bid_quote_depth),
   askDepth:decimal(b.top5_ask_quote_depth),
   candle:bars[bars.length-1],bookAt:b.source_at_utc};
 });
 if(observation.observed_markets!==markets.filter(x=>x.status==="OBSERVED").length||
    latest.markets_observed!==observation.observed_markets)
  throw Error("Décompte des marchés réel incohérent");
 return {observedAt:observation.at_utc,hour,ageMinutes:Math.max(0,Math.floor((now-observedAt)/60000)),
   markets,ordersEnabled:false,realOrders:0};
}

/* Archives de 0–48 h : comparaison descriptive, sans interpolation et sans
 * imputer un prix aux heures absentes. Valide chaque relevé avec verify(). */
function analyze(latest,current,previous=null,now=Date.now()){
 const newest=verify(latest,current,now),date=latest.source_day;
 const utcMidnight=Date.parse(date+"T00:00:00Z");
 if(!Number.isFinite(utcMidnight))throw Error("Date UTC non valide");
 const priorDate=new Date(utcMidnight-86400000).toISOString().slice(0,10);
 const sources=[];
 if(previous!==null){
  if(previous?.date_utc!==priorDate)throw Error("Jour antérieur non adjacent");
  sources.push(previous);
 }
 sources.push(current);
 const entries=[],known=new Set(),lastHourMs=Date.parse(date+"T"+latest.last_hour_utc.slice(11,13)+":00:00Z");
 for(const archive of sources){
  if(archive.schema!==SCHEMA||archive.orders_enabled!==false||
     archive.real_orders!==0||!Array.isArray(archive.hours)||
     archive.hours.length<1||archive.hours.length>24)
   throw Error("Archive horaire incohérente");
  const day=archive.date_utc;
  for(const record of archive.hours){
   if(record?.hour_utc?.slice(0,10)!==day||known.has(record.hour_utc))
    throw Error("Heure UTC répétée ou mauvais jour");
   const hour=record.hour_utc;
   if(typeof hour!=="string"||!/^\d{4}-\d\d-\d\dT\d\dZ$/.test(hour))
    throw Error("Heure UTC invalide");
   const when=Date.parse(hour.slice(0,10)+"T"+hour.slice(11,13)+":00:00Z");
   if(!Number.isFinite(when)||when>lastHourMs||when<lastHourMs-47*3600000)
    throw Error("Heure hors fenêtre observée");
   const pseudoHeader={schema:"erith.case-market-hourly-status.v1",last_hour_utc:hour,
    source_day:day,orders_enabled:false,real_orders:0,markets_observed:record.observed_markets};
   const verified=verify(pseudoHeader,archive,now);
   known.add(hour);
   entries.push({hour,when,verified});
  }
 }
 entries.sort((a,b)=>a.when-b.when);
 if(entries.at(-1)?.hour!==latest.last_hour_utc||
    entries.at(-1).verified.observedAt!==newest.observedAt)
  throw Error("La dernière observation diffère de l'index");
 const earliest=entries[0].when;
 const expectedHours=(lastHourMs-earliest)/3600000+1;
 if(!Number.isInteger(expectedHours)||expectedHours<1||expectedHours>48)
  throw Error("Durée de suivi incohérente");
 const rows=EXPECTED.map(([symbol,venue,pair,quote],index)=>{
  const observed=entries.map(e=>({
   ...e,market:e.verified.markets[index]
  })).filter(e=>e.market.status==="OBSERVED");
  const last=observed.at(-1);
  const first=observed[0];
  const immediatelyPrevious=observed.length>=2?observed.at(-2):null;
  const consecutive=!!immediatelyPrevious&&last.when-immediatelyPrevious.when===3600000;
  const firstToLastPct=observed.length>=2?
   (last.market.last/first.market.last-1)*100:null;
  const lastOneHourPct=consecutive?
   (last.market.last/immediatelyPrevious.market.last-1)*100:null;
  const spreads=observed.map(o=>o.market.spread).sort((a,b)=>a-b);
  const medianSpread=spreads.length?
   (spreads[Math.floor((spreads.length-1)/2)]+spreads[Math.floor(spreads.length/2)])/2:null;
  const lastHourOfMarket=last?.hour??null;
  const hoursUnavailable=entries.length-observed.length;
  const gapBeforeLast=last&&last.hour!==newest.hour;
  return {symbol,venue,pair,quote,observations:observed.length,
   hoursUnavailable,firstAt:first?.hour??null,lastAt:lastHourOfMarket,
   firstToLastPct,lastOneHourPct,consecutive,medianSpreadBps:medianSpread,
   lastSpreadBps:last?.market.spread??null,
   lastBidDepth:last?.market.bidDepth??null,lastAskDepth:last?.market.askDepth??null,
   lastPrice:last?.market.last??null,notCurrentWithLatestArchive:!!gapBeforeLast,
   decision:"DESCRIPTIVE_ONLY",reversalCertified:false,ordersEnabled:false};
 });
 return {latestAt:newest.observedAt,archiveHours:entries.length,
  expectedHours,hoursWithoutArchive:expectedHours-entries.length,
  priorDayAvailable:previous!==null,earliestHour:entries[0].hour,
  latestHour:newest.hour,rows,realOrders:0,noInterpolation:true,
  reversalCertified:false};
}
function renderEvolution(doc,evolution){
 const target=doc.querySelector("[data-case-market-evolution]");
 const table=doc.querySelector("[data-case-market-evolution-rows]");
 if(!target||!table)return;
 table.replaceChildren();
 for(const row of evolution.rows){
  const tr=doc.createElement("tr");
  const status=row.observations<2?"Une seule mesure ou aucune : tendance inconnue":
   row.lastOneHourPct===null?"Dernière variation horaire non mesurée (trou ou donnée absente)":
   "Variation entre deux relevés horaires consécutifs, pas un retournement certifié";
  const values=[row.pair,row.observations+"/"+evolution.archiveHours,
   row.hoursUnavailable.toString(),
   row.firstToLastPct===null?"Insuffisant":(row.firstToLastPct>0?"+":"")+num(row.firstToLastPct,3)+" %",
   row.lastOneHourPct===null?"Non mesuré":(row.lastOneHourPct>0?"+":"")+num(row.lastOneHourPct,3)+" %",
   row.medianSpreadBps===null?"Non mesuré":num(row.medianSpreadBps,2)+" pb",
   row.lastSpreadBps===null?"Non mesuré":num(row.lastSpreadBps,2)+" pb",
   status];
  for(const value of values){const td=doc.createElement("td");td.textContent=value;tr.appendChild(td);}
  table.appendChild(tr);
 }
 target.textContent="Archives réelles : "+evolution.archiveHours+" heure(s) sur une fenêtre de "+
  evolution.expectedHours+" heure(s) depuis "+evolution.earliestHour+
  " · "+evolution.hoursWithoutArchive+" heure(s) sans archive. "+
  (evolution.priorDayAvailable?"Jour précédent vérifié.":"Jour précédent non publié.")+
  " Évolution descriptive uniquement ; aucun retournement ni profit certifié.";
}

function num(v,n=4){return v===null?"—":new Intl.NumberFormat("fr-FR",{maximumFractionDigits:n}).format(v);}
function render(doc,res){
 const status=doc.querySelector("[data-case-market-status]");
 const tbody=doc.querySelector("[data-case-market-rows]");
 if(!status||!tbody)return;
 tbody.replaceChildren();
 for(const m of res.markets){
  const tr=doc.createElement("tr");
  const columns=m.status==="OBSERVED"?
   [m.pair+" · "+m.venue,"Relevé",num(m.last,8)+" "+m.quote,
    num(m.bid,8)+" / "+num(m.ask,8),num(m.spread,2)+" pb",
    num(m.bidDepth,2)+" / "+num(m.askDepth,2)+" "+m.quote,
    num(Number(m.candle.close),8)+" "+m.quote,m.candle.open_at_utc.replace("T"," ").slice(0,16)]:
   [m.pair+" · "+m.venue,"Indisponible","—","—","—","—","—","—"];
  for(const text of columns){const td=doc.createElement("td");td.textContent=text;tr.appendChild(td);}
  tbody.appendChild(tr);
 }
 status.textContent=res.hour+" · "+res.markets.filter(x=>x.status==="OBSERVED").length+
  "/2 marchés Spot observés · archivage "+res.observedAt+
  " · "+res.ageMinutes+" minutes depuis la capture. "+
  (res.ageMinutes>120?"Archives anciennes, pas un prix actuel.":"Photographie horaire, pas un prix live.")+
  " Aucun ordre, aucun remplissage prouvé.";
}
function mount(doc){
 const parent=doc.getElementById("case-market-history");
 if(!parent)return;
 const status=doc.querySelector("[data-case-market-status]");
 const tbody=doc.querySelector("[data-case-market-rows]");
 const button=doc.querySelector("[data-case-market-refresh]");
 let loading=false;
 const load=async()=>{
  if(loading||!parent.open)return;
  loading=true;button.disabled=true;status.textContent="Lecture des deux marchés Spot publics archivés…";
  const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),12000);
  const read=async (path,optional=false)=>{
   const url=new URL(path,doc.baseURI);
   const response=await fetch(url.href,{credentials:"omit",cache:"no-store",signal:abort.signal});
   if(!response.ok){
    if(optional&&response.status===404)return null;
    throw Error("Archive HTTP "+response.status);
   }
   const text=await response.text();if(text.length>190000)throw Error("Archive trop volumineuse");
   return JSON.parse(text);
  };
  try{
   const head=await read("../data/crypto/case-market-hourly/latest.json");
   if(!/^\d{4}-\d\d-\d\d$/.test(head.source_day||""))throw Error("Date d'index non valide");
   const day=await read("../data/crypto/case-market-hourly/"+head.source_day+".json");
   render(doc,verify(head,day));
   const dateMs=Date.parse(head.source_day+"T00:00:00Z");
   if(!Number.isFinite(dateMs))throw Error("Date UTC index invalide");
   const yesterday=new Date(dateMs-86400000).toISOString().slice(0,10);
   const previous=await read("../data/crypto/case-market-hourly/"+yesterday+".json",true);
   renderEvolution(doc,analyze(head,day,previous));
  }catch(error){status.textContent="Aucune lecture de marché affichée : "+String(error.message||error)+
   ". Le prix n'est jamais reconstruit.";tbody.replaceChildren();
   const evolution=doc.querySelector("[data-case-market-evolution]");
   const evolutionRows=doc.querySelector("[data-case-market-evolution-rows]");
   if(evolution)evolution.textContent="Bilan indisponible : sources insuffisantes ou incohérentes.";
   if(evolutionRows)evolutionRows.replaceChildren();
  }finally{clearTimeout(timer);loading=false;button.disabled=false;}
 };
 parent.addEventListener("toggle",()=>{if(parent.open)void load();});
 button.addEventListener("click",()=>{void load();});
}
return Object.freeze({SCHEMA,verify,analyze,render,renderEvolution,mount,readOnly:true,realOrders:false});
});
