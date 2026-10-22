/* Seven Heaven — attribution descriptive des choix PAPER sur les 7 premiers jours.
 * Lecture de sources Binance horaires archivées, aucune collecte, aucun ordre.
 * Le protocole A/B reste la propriété de trader_radar20_forward.py.
 */
(function(root){
"use strict";
const SYMBOLS=["ETH","SOL","XRP","ADA","LINK","AVAX","SUI","NEAR","UNI","AAVE","LTC","BCH","DOT","HBAR","XLM","DOGE","PEPE","SHIB","APT","ARB"];
const START="2026-10-14", DAY=86400000, HOUR=3600000, CAPITAL=400, TICKET=100;
const COLS=["timestamp_ms","open_usdt","high_usdt","low_usdt","close_usdt","volume_usdt","taker_buy_usdt","buy_pct","trades"];
const CONTRACT="212833da065e71420bc01dc77fb296749b993ee0f6d7856cc5e2b0b560d833d6";
function check(test,message){if(!test)throw Error(message);}
function median(values){const a=[...values].sort((x,y)=>x-y),h=a.length/2;return (a[h-1]+a[h])/2;}
function iso(ms){return new Date(ms).toISOString().replace(".000Z","Z");}
function audit(docs){
 check(Array.isArray(docs)&&docs.length===7,"Sept journées immuables nécessaires");
 const series=Object.fromEntries(SYMBOLS.map(s=>[s,[]]));
 for(let i=0;i<docs.length;i++){
  const d=docs[i],day=new Date(Date.parse(START+"T00:00:00Z")+i*DAY).toISOString().slice(0,10);
  check(d?.schema==="erith.radar20.forward.source.v1"&&d.day===day&&d.complete===true&&
   Array.isArray(d.markets)&&d.markets.length===20,"Journal quotidien incomplet ou désordonné");
  const seen=new Set();
  for(const market of d.markets){
   const sym=market?.pair?.replace(/USDT$/,"");
   check(SYMBOLS.includes(sym)&&market.pair===sym+"USDT"&&!seen.has(sym)&&
    JSON.stringify(market.columns)===JSON.stringify(COLS)&&market.rows?.length===24,
    "Identité Binance Spot USDT / colonnes invalides");
   seen.add(sym);
   market.rows.forEach((row,k)=>{
    const timestamp=Date.parse(day+"T00:00:00Z")+k*HOUR;
    check(Array.isArray(row)&&row.length===9&&row[0]===timestamp&&
     [1,2,3,4,5,6,8].every(z=>Number.isFinite(row[z]))&&
     row[1]>0&&row[3]>0&&row[1]>=row[3]&&row[4]>=row[3]&&
     row[1]<=row[2]&&row[4]<=row[2]&&row[5]>=0&&
     (row[7]===null||(Number.isFinite(row[7])&&row[7]>=0&&row[7]<=100))&&
     Number.isInteger(row[8])&&row[8]>=0,"Bougie horaire invalide / absente");
    series[sym].push(row);
   });
  }
 }
 const models={A:{cash:CAPITAL,open:new Map()},B:{cash:CAPITAL,open:new Map()}};
 const totals={A:{accepted:0,filter:0,existing:0,capacity:0,cash:0},B:{accepted:0,filter:0,existing:0,capacity:0,cash:0}};
 const events=[],windows=Array.from({length:6},(_,i)=>({from:i*4,to:i*4+4,eligible:0,A:0,B:0}));
 for(let h=0;h<7*24;h++){
  for(const state of Object.values(models)){
   for(const [sym,pos] of [...state.open]){
    if(pos.exit!==h)continue;
    state.cash+=pos.units*series[sym][h][1]*(1-.004);
    state.open.delete(sym);
   }
  }
  if(h<73)continue;
  const trend=median(SYMBOLS.map(s=>100*(series[s][h-1][4]/series[s][h-73][4]-1)));
  const choices=[];
  for(const sym of SYMBOLS){
   const prev=series[sym][h-1],history=series[sym].slice(h-25,h-1);
   const base=median(history.map(r=>r[5]));
   if(prev[7]!==null&&prev[7]>=50&&prev[5]>base&&prev[5]>0)
    choices.push({sym,share:prev[7],volumeRatio:prev[5]/Math.max(base,1e-9)});
  }
  choices.sort((a,b)=>b.share-a.share||b.volumeRatio-a.volumeRatio||
   (a.sym<b.sym?-1:a.sym>b.sym?1:0));
  for(const candidate of choices){
   const {sym,share,volumeRatio}=candidate,price=series[sym][h][1],
    ms=series[sym][h][0],hour=new Date(ms).getUTCHours(),group=windows[Math.floor(hour/4)];
   const e={id:sym+"-"+ms,pair:sym+"USDT",at_utc:iso(ms),hour_utc:hour,
    price_usdt:price,taker_buy_pct:share,volume_ratio:volumeRatio,trend_72h_pct:trend,
    A:null,B:null,after_4h_pct:null,after_24h_pct:null,after_48h_pct:null};
   for(const window of [4,24,48]){
    if(h+window<7*24){
     const v=(series[sym][h+window][1]/price*(1-.004)**2-1)*100;
     e["after_"+window+"h_pct"]=Number(v.toFixed(4));
    }
   }
   group.eligible++;
   for(const model of ["A","B"]){
    const state=models[model];
    let reason="accepted";
    if(model==="B"&&trend<3)reason="filter";
    else if(state.open.has(sym))reason="existing";
    else if(state.open.size>=4)reason="capacity";
    else if(state.cash+1e-9<TICKET)reason="cash";
    if(reason==="accepted"){
     state.cash-=TICKET;
     state.open.set(sym,{exit:h+48,units:TICKET/(1+.004)/price});
     group[model]++;
    }
    totals[model][reason]++;
    e[model]=reason;
   }
   events.push(e);
  }
 }
 const sum=o=>Object.values(o).reduce((a,b)=>a+b,0);
 check(events.length===sum(totals.A)&&events.length===sum(totals.B),"Totaux des motifs discordants");
 return {schema:"erith.radar20.forward.attribution.research.v1",sample_start_utc:START+"T00:00:00Z",
   sample_end_exclusive_utc:"2026-10-21T00:00:00Z",source_days:7,assets:20,
   eligible:events.length,totals,windows,events,orders_enabled:false,real_orders:0,
   model_parameters_unchanged:true,not_live:true,not_a_signal:true,
   what_if_only:true,not_filled:true};
}
if(typeof module==="object"&&module.exports)module.exports={audit,START,CONTRACT};
if(!root||typeof document==="undefined")return;
const target=document.getElementById("radar-forward-attribution");if(!target)return;
const status=target.querySelector("[data-attribution-status]");
const summary=target.querySelector("[data-attribution-summary]");
const tbody=target.querySelector("[data-attribution-rows]");
const modelSelect=target.querySelector("[data-attribution-model]");
const reasonSelect=target.querySelector("[data-attribution-reason]");
const hourSelect=target.querySelector("[data-attribution-hours]");
const refresh=target.querySelector("[data-attribution-refresh]");
const reasonText={accepted:"Accepté PAPER",filter:"Filtre régime",existing:"Position déjà ouverte",
 capacity:"4 places occupées",cash:"Capital insuffisant"};
let snapshot=null,busy=false;
function number(value,d=2){return Number(value).toLocaleString("fr-FR",{maximumFractionDigits:d,minimumFractionDigits:d});}
function addCell(tr,value){const td=document.createElement("td");td.textContent=value;tr.appendChild(td);}
function draw(){
 if(!snapshot)return;
 const model=modelSelect.value,reason=reasonSelect.value,after16=hourSelect.value==="after16";
 const shown=snapshot.events.filter(e=>(reason==="all"||e[model]===reason)&&(!after16||e.hour_utc>=16)).reverse();
 tbody.replaceChildren();
 for(const e of shown.slice(0,80)){
  const tr=document.createElement("tr");
  addCell(tr,e.at_utc.replace("T"," ").slice(0,16));addCell(tr,e.pair);
  addCell(tr,model==="A"?"A":"B");
  addCell(tr,reasonText[e[model]]||"Inconnu");
  addCell(tr,number(e.taker_buy_pct,1)+" %");
  addCell(tr,"×"+number(e.volume_ratio,2));
  addCell(tr,e.after_4h_pct===null?"Non mesuré":number(e.after_4h_pct)+" %");
  addCell(tr,e.after_24h_pct===null?"Non mesuré":number(e.after_24h_pct)+" %");
  addCell(tr,e.after_48h_pct===null?"Non mesuré":number(e.after_48h_pct)+" %");
  tbody.appendChild(tr);
 }
 if(!shown.length){const tr=document.createElement("tr");const td=document.createElement("td");
  td.colSpan=9;td.textContent="Aucun événement pour ce filtre.";tr.appendChild(td);tbody.appendChild(tr);}
 const t=snapshot.totals[model];
 summary.textContent="7 jours vérifiés · "+snapshot.eligible+" candidats · "+model+
  " : "+t.accepted+" acceptés ; "+t.filter+" filtre régime ; "+t.existing+
  " positions existantes ; "+t.capacity+" limite 4 places ; "+t.cash+
  " capital · "+Math.min(80,shown.length)+"/"+shown.length+" événements affichés (plus récents d’abord).";
}
async function sha256(bytes){
 check(root.crypto?.subtle,"Vérification SHA-256 indisponible : refus d’affichage");
 const digest=await root.crypto.subtle.digest("SHA-256",bytes);
 return [...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,"0")).join("");
}
async function reload(){
 if(busy||!target.open)return;
 busy=true;refresh.disabled=true;snapshot=null;tbody.replaceChildren();summary.textContent="";
 status.textContent="Vérification des sept archives Binance et de leurs empreintes…";
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);
 try{
  const base="../data/trader_flux/radar20_forward/";
  const load=async path=>{
   const response=await fetch(new URL(base+path,document.baseURI),{credentials:"omit",cache:"no-store",signal:controller.signal});
   check(response.ok&&Number(response.headers.get("content-length")||0)<250000,"Archive absente ou trop volumineuse");
   const bytes=await response.arrayBuffer();check(bytes.byteLength>0&&bytes.byteLength<250000,"Archive hors limites");
   return bytes;
  };
  const idx=JSON.parse(new TextDecoder().decode(await load("index.json")));
  check(idx.schema==="erith.radar20.forward.index.v1"&&idx.orders_enabled===false&&
   idx.config_sha256===CONTRACT&&Array.isArray(idx.days)&&idx.days.length>=7,
   "Index PAPER ou protocole incompatible");
  const days=idx.days.slice(0,7);
  const docs=[];
  for(let i=0;i<days.length;i++){
   const name=new Date(Date.parse(START+"T00:00:00Z")+i*DAY).toISOString().slice(0,10);
   check(days[i].day===name&&days[i].file==="observations/"+name+".json"&&
    /^[a-f0-9]{64}$/.test(days[i].sha256),"Chaîne UTC ou chemin archive invalide");
   const bytes=await load(days[i].file);
   check(await sha256(bytes)===days[i].sha256,"Empreinte source SHA-256 discordante");
   docs.push(JSON.parse(new TextDecoder().decode(bytes)));
  }
  const result=audit(docs);
  // Le premier lot reste inchangé même lorsque le journal prospectif continue.
  snapshot=result;draw();
  status.textContent="Archives du 14 au 20 octobre 2026 vérifiées · 20 marchés Spot USDT · aucun ordre · résultats descriptifs.";
 }catch(err){
  snapshot=null;tbody.replaceChildren();summary.textContent="";
  status.textContent="STOP · Journal non affiché : "+String(err.message||"preuves absentes")+
   ". Aucun résultat reconstitué sans source vérifiée.";
 }finally{clearTimeout(timeout);busy=false;refresh.disabled=false;}
}
target.addEventListener("toggle",()=>{if(target.open&&!snapshot)void reload();});
refresh.addEventListener("click",()=>{void reload();});
for(const el of [modelSelect,reasonSelect,hourSelect])el.addEventListener("change",draw);
})(typeof window==="undefined"?null:window);
