/* Seven Heaven · T0 data-quality observation; does not certify G1 or trade. */
(()=>{"use strict";
const api=globalThis;
let evidence=null, captureBusy=false, captureSeq=0;
const safe=(fn)=>{try{return typeof fn==="function"?fn():null}catch(_){return null}};
const stamp=v=>{const n=typeof v==="number"?v:Date.parse(String(v||""));return Number.isFinite(n)&&n>0?n:null};
const pair=v=>{const m=String(v||"").toUpperCase().match(/^([A-Z0-9]+)[/-]([A-Z0-9]+)$/);return m?{base:m[1],quote:m[2]}:null};
const BAR=Object.freeze({"1m":60000,"5m":300000,"15m":900000,"1h":3600000,"4h":14400000,"1j":86400000});
function analyze(now=Date.now(),d=api){
 const p=safe(d.AgentCryptoTraderPaperPreparation?.snapshot)||{};
 const candle=safe(d.AgentCryptoMarketMicroscope?.snapshot)||{};
 const book=safe(d.AgentCryptoOkxMicrostructure?.snapshot)||{};
 const gate=safe(d.AgentCryptoStrategyAGateCanonicalTruth?.snapshot);
 const dossier=safe(d.AgentCryptoStrategyAEvidenceDossier?.snapshot);
 const asset=p.asset||null,flags=[],facts=[],rows=Array.isArray(candle.rows)?candle.rows:[];
 if(!asset)flags.push("Actif absent");
 if(!d.AgentCryptoMarketMicroscope?.snapshot)flags.push("Moteur Bougies absent de cette vue");
 if(!d.AgentCryptoOkxMicrostructure?.snapshot)flags.push("Moteur Carnet absent de cette vue");
 if(!candle.loadedInstrument&&!(Array.isArray(candle.rows)&&candle.rows.length))flags.push("Bougies non chargees : mode "+(candle.mode||"inconnu")+" · erreur "+(candle.errorCode||candle.error||"aucune"));
 if(!book.loadedAsset&&(!book.bids?.length||!book.asks?.length))flags.push("Carnet non charge : fenetre "+(book.open?"ouverte":"fermee")+" · etat "+(book.freshness||"inconnu")+" · erreur "+(book.errorCode||book.error||"aucune"));
 if(!p.chart?.qualified)flags.push("Graphique de cet actif non qualifie");
 else facts.push("Graphique: "+p.chart.points+" points, "+p.displayCurrency+", "+p.chart.source+" (non LIVE)");
 const cp=pair(candle.loadedInstrument),bp=pair(book.pair),barMs=BAR[String(candle.loadedBar||"").toLowerCase()]||null;
 let invalid=0,ordering=0,gaps=0,unconfirmed=0;
 rows.forEach((r,i)=>{
  const x=[r?.t,r?.o,r?.h,r?.l,r?.c].map(Number);
  if(x.some(v=>!Number.isFinite(v))||x[0]<=0||x[1]<=0||x[4]<=0||x[2]<Math.max(x[1],x[3],x[4])||x[3]>Math.min(x[1],x[2],x[4])||r?.v!=null&&(!Number.isFinite(Number(r.v))||Number(r.v)<0))invalid++;
  if(i){const dt=Number(r?.t)-Number(rows[i-1]?.t);if(dt<=0)ordering++;else if(barMs&&dt>barMs*1.5)gaps++}
  if(String(r?.confirm)==="0")unconfirmed++;
 });
 const last=rows.length?stamp(rows[rows.length-1]?.t):null;
 const candleAge=last===null?null:now-last;
 const candleLimit=barMs===null?null:barMs*2.2;
 const fresh=!!(barMs&&last&&candleAge>=-2000&&candleAge<=candleLimit);
 const assetMatches=!!(asset&&cp?.base===asset.symbol);
 const candleOk=!!(assetMatches&&rows.length>=2&&!candle.loading&&invalid===0&&ordering===0&&gaps===0&&fresh);
 if(candleOk)facts.push("Bougies "+candle.loadedInstrument+": "+rows.length+" · source "+new Date(last).toISOString());
 if(!assetMatches)flags.push("Bougies: actif "+(asset?.symbol||"?")+" != paire "+(candle.loadedInstrument||"absente"));
 if(rows.length<2)flags.push("Bougies: serie insuffisante ("+rows.length+" points)");
 if(candle.loading)flags.push("Bougies: chargement en cours");
 if(!barMs)flags.push("Bougies: intervalle inconnu ("+(candle.loadedBar||"absent")+")");
 if(invalid)flags.push("Bougies: OHLCV invalides = "+invalid);
 if(ordering)flags.push("Bougies: horodatages non croissants = "+ordering);
 if(gaps)flags.push("Bougies: ruptures temporelles = "+gaps);
 if(last===null)flags.push("Bougies: date de derniere ouverture absente");
 else if(!fresh)flags.push("Bougies: ouverture "+(candleAge<0?"future":"perimee")+" · age "+Math.round(candleAge/1000)+" s · limite "+(candleLimit===null?"inconnue":Math.round(candleLimit/1000)+" s"));
 const seen=stamp(book.sourceObservedAt||book.capturedAt),age=seen===null?null:now-seen;
 const max=Number(d.AgentCryptoOkxMicrostructure?.validation_contract?.fresh_max_age_ms);
 const bookOk=!!(asset&&bp?.base===asset.symbol&&book.loadedAsset===asset.symbol&&bp?.quote===String(book.loadedQuote||"").toUpperCase()&&book.bids?.length&&book.asks?.length&&book.freshness==="FRESH"&&seen!==null&&Number.isFinite(max)&&max>0&&age>=-2000&&age<=max);
 if(bookOk)facts.push("Carnet "+book.pair+" · source "+new Date(seen).toISOString()+" · age "+age+"ms");
 else flags.push("Carnet: paire, source ou fraicheur insuffisante");
 if(cp&&bp&&cp.quote!==bp.quote)flags.push("Devises de cotation differentes: "+cp.quote+" / "+bp.quote);
 if(cp&&cp.quote!==p.displayCurrency)facts.push("Affichage "+p.displayCurrency+" distinct de "+cp.quote+"; aucune conversion");
 const g1=gate?.available===true?gate.rows?.find(x=>Number(x.gate)===1):null;
 if(!g1)flags.push("G1 canonique non disponible");
 const datasets=dossier?.dataset||{};
 const integrity={};
 for(const key of ["experiment","after_cost"]){
  const r=datasets[key];integrity[key]=r?.data_integrity_ready===true;
  if(r)facts.push("Integrite "+key+": "+(integrity[key]?"OK":"NON DEMONTREE")+" ("+r.rows+" lignes)");
  if(!integrity[key])flags.push("Preuve G1, dataset "+key+": absente ou incomplete");
 }
 flags.push("Capture d'observation seulement: ne certifie ni G1 ni Strategy A");
 return Object.freeze({schema:"trader_t0_data_quality_r3",capturedAt:new Date(now).toISOString(),
  asset:asset?Object.freeze({...asset}):null,currency:p.displayCurrency||null,
  market:Object.freeze({candlePair:candle.loadedInstrument||null,bookPair:book.pair||null,
   candleCount:rows.length,invalid,ordering,gaps,unconfirmed,lastCandle:last,
   candleAgeMs:candleAge,candleLimitMs:candleLimit,loadedBar:candle.loadedBar||null,
   loadedInstrument:candle.loadedInstrument||null,selectedAsset:asset?.symbol||null,
   receivedAt:candle.lastLoadedAt||null,assetMatches,loading:!!candle.loading,
   candleAccepted:candleOk,bookTime:seen,candleFresh:fresh,bookFresh:bookOk}),
  g1:Object.freeze({state:g1?.state||"UNKNOWN",owner:g1?.owner||null}),
  datasetIntegrity:Object.freeze(integrity),complete:candleOk&&bookOk&&!!p.chart?.qualified&&cp?.quote===bp?.quote,
  facts:Object.freeze(facts),flags:Object.freeze(flags),
  marketBrief:marketBrief(asset,candle,book,candleOk,bookOk,p.displayCurrency,d.AgentCryptoMarketMicroscope),
  gatePromoted:false,paperAuthorized:false,orderPlaced:false,persisted:false});
}

/* Market reading from already selected canonical snapshots; no new market owner. */
function marketBrief(asset,candle,book,candleOk,bookOk,currency,owner=api.AgentCryptoMarketMicroscope){
 const label="Observation uniquement. Ni strategie certifiee ni ordre.";
 const cp=pair(candle?.loadedInstrument),bp=pair(book?.pair);
 const rows=Array.isArray(candle?.rows)?candle.rows:[];
 if(!asset||!candleOk||rows.length<10)return Object.freeze({available:false,reason:"Bougies valides/fraiches insuffisantes (minimum 10)",label});
 const win=rows.slice(-20);
 const first=Number(win[0]?.c),last=Number(win.at(-1)?.c);
 const hi=win.map(x=>Number(x.h)),lo=win.map(x=>Number(x.l));
 if(![first,last,...hi,...lo].every(v=>Number.isFinite(v)&&v>0)||first<=0)
  return Object.freeze({available:false,reason:"OHLCV insuffisant pour la fenetre de lecture",label});
 const high=Math.max(...hi),low=Math.min(...lo),change=(last/first-1)*100;
 const v=win.slice(-10).map(r=>Number(r.v));
 const volumeReady=v.length===10&&v.every(x=>Number.isFinite(x)&&x>=0);
 const sum=a=>a.reduce((x,y)=>x+y,0);
 const prior=volumeReady?sum(v.slice(0,5)):null,recent=volumeReady?sum(v.slice(5)):null;
 const volumeRatio=prior>0?recent/prior:null;
 let bid=null,ask=null,spreadBp=null,depthRatio=null;
 if(bookOk&&cp&&bp&&cp.base===bp.base&&cp.quote===bp.quote&&book.bids?.length&&book.asks?.length){
  const b=Number(book.bids[0]?.[0]),a=Number(book.asks[0]?.[0]);
  if(Number.isFinite(b)&&Number.isFinite(a)&&a>=b&&b>0){
   bid=b;ask=a;spreadBp=(a-b)/((a+b)/2)*10000;
   const notional=side=>side.slice(0,20).reduce((acc,r)=>{
    const p=Number(r?.[0]),q=Number(r?.[1]);
    return acc+(Number.isFinite(p)&&p>0&&Number.isFinite(q)&&q>=0?p*q:0);
   },0);
   const askN=notional(book.asks);
   depthRatio=askN>0?notional(book.bids)/askN:null;
  }
 }
 const levels=safe(owner?.technicalLevels);
 const levelsMatch=levels?.instrument===candle.loadedInstrument&&levels?.bar===candle.loadedBar&&
   Number.isFinite(Number(levels.current))&&Math.abs(Number(levels.current)-last)<=Math.max(1e-8,last*1e-8);
 const sl=levelsMatch&&Number.isFinite(levels.support?.price)?levels.support:null;
 const rl=levelsMatch&&Number.isFinite(levels.resistance?.price)?levels.resistance:null;
 return Object.freeze({available:true,asset:asset.symbol,pair:candle.loadedInstrument,quote:cp.quote,bar:candle.loadedBar,
  candles:win.length,lastClose:last,changePct:change,low,high,volumeRatio,
  bestBid:bid,bestAsk:ask,spreadBp,depthRatio,bookComparable:bid!==null&&ask!==null,
  support:sl?Object.freeze({price:sl.price,touches:sl.touches}):null,
  resistance:rl?Object.freeze({price:rl.price,touches:rl.touches}):null,
  sourceLevels:!!(sl||rl),currency,label});
}
const marketFmt=n=>Number.isFinite(n)?Number(n).toLocaleString("fr-FR",{maximumFractionDigits:4}):"indisponible";
function marketReport(m){
 if(!m?.available)return"LECTURE DE MARCHE · non disponible : "+(m?.reason||"source absente");
 const q=m.quote,sign=m.changePct>=0?"+":"";
 return [
  "LECTURE DE MARCHE · "+m.asset+" / "+q+" · "+m.bar+" · "+m.candles+" bougies",
  "Derniere cloture : "+marketFmt(m.lastClose)+" "+q+" · variation sur fenetre : "+sign+marketFmt(m.changePct)+" %",
  "Extremes observes : bas "+marketFmt(m.low)+" / haut "+marketFmt(m.high)+" "+q+" (ne constituent pas des supports certifies)",
  "Volume cinq dernieres / cinq precedentes : "+(m.volumeRatio===null?"non exploitable":marketFmt(m.volumeRatio)+" x")+" (descriptif)",
  m.bookComparable?"Carnet meme paire : BID "+marketFmt(m.bestBid)+" / ASK "+marketFmt(m.bestAsk)+" "+q+" · spread "+marketFmt(m.spreadBp)+" bp":
                    "Carnet : prix non comparables ou source non fraiche",
  "Profondeur BID/ASK (20 niveaux notionnels) : "+(m.depthRatio===null?"indisponible":marketFmt(m.depthRatio)+" x")+" (instantane, non predictif)",
  m.sourceLevels?"Niveaux du moteur Bougies : S "+(m.support?marketFmt(m.support.price):"indisponible")+" / R "+(m.resistance?marketFmt(m.resistance.price):"indisponible")+" "+q:
                  "Supports/resistances canoniques non disponibles ; les extremes ci-dessus sont uniquement descriptifs",
  "Scenarios conditionnels : franchissement du haut observe = extension a surveiller ; rupture du bas = faiblesse a surveiller. Aucun signal.",
  "Graphique "+m.currency+" / Bougies "+q+" : cotations distinctes, aucune conversion.",
  m.label
 ].join("\n");
}

const asUtc=v=>Number.isFinite(v)&&v>0?new Date(v).toISOString():"inconnue";
const seconds=v=>Number.isFinite(v)?(v/1000).toFixed(1)+" s":"inconnu";
function report(v){
 if(!v)return"Pas de capture T0. Aucun stockage.";
 const k=v.market;
 return v.capturedAt+" · "+(v.complete?"OBSERVATIONS CONCORDANTES":"DONNEES INCOMPLETES")+
  "\nG1 CANONIQUE: "+v.g1.state+" (inchangé)"+
  "\n\nDIAGNOSTIC BOUGIES"+
  "\nPaire: "+(k.loadedInstrument||"absente")+" · actif attendu: "+(k.selectedAsset||"?")+" · accord: "+(k.assetMatches?"OUI":"NON")+
  "\nIntervalle: "+(k.loadedBar||"?")+" · nombre de bougies: "+k.candleCount+" · chargement: "+(k.loading?"OUI":"NON")+
  "\nOHLCV invalides: "+k.invalid+" · horodatages non croissants: "+k.ordering+" · ruptures temporelles: "+k.gaps+
  "\nBougies non confirmees: "+k.unconfirmed+" (information, pas un blocage)"+
  "\nDerniere ouverture: "+asUtc(k.lastCandle)+" · reception: "+(k.receivedAt||"inconnue")+
  "\nAge a T0: "+seconds(k.candleAgeMs)+" · seuil: "+seconds(k.candleLimitMs)+" · fraicheur: "+(k.candleFresh?"OUI":"NON")+
  "\nControle Bougies: "+(k.candleAccepted?"CONCORDANT":"NON CONFORME")+
  "\n\n"+marketReport(v.marketBrief)+
  "\n\nSOURCES ET PREUVES\n"+v.facts.join("\n")+
  "\n\nLIMITES\n"+v.flags.join("\n");
}
function paint(){
 const output=document.getElementById("traderPaperT0")?.querySelector("[data-t0-report]");
 if(output)output.textContent=report(evidence);
}
const identity=()=>{const p=safe(api.AgentCryptoTraderPaperPreparation?.snapshot);return String(p?.asset?.id||"")+"|"+String(p?.asset?.symbol||"")+"|"+String(p?.displayCurrency||"");};
function requireCandles(s,market,now){
 const asset=s?.asset;
 const instrument=pair(market?.loadedInstrument),rows=market?.rows;
 const interval=BAR[String(market?.loadedBar||"").toLowerCase()];
 const last=Array.isArray(rows)&&rows.length?stamp(rows[rows.length-1]?.t):null;
 return !(asset&&instrument?.base===asset.symbol&&Array.isArray(rows)&&rows.length>=2&&!market.loading&&interval&&last&&now-last>=-2000&&now-last<=interval*2.2);
}
function requireBook(s,market,owner,now){
 const asset=s?.asset,loaded=pair(market?.pair),source=stamp(market?.sourceObservedAt||market?.capturedAt);
 const max=Number(owner?.validation_contract?.fresh_max_age_ms);
 return !(asset&&loaded?.base===asset.symbol&&market?.loadedAsset===asset.symbol&&loaded.quote===String(market?.loadedQuote||"").toUpperCase()&&
  market?.bids?.length&&market?.asks?.length&&market?.freshness==="FRESH"&&source&&Number.isFinite(max)&&max>0&&now-source>=-2000&&now-source<=max);
}
async function capture(){
 if(captureBusy)return null;
 const token=++captureSeq,start=identity(),button=document.querySelector("#traderPaperT0 [data-t0-capture]");
 captureBusy=true;
 if(button){button.disabled=true;button.textContent="Lecture ponctuelle des sources…";}
 try{
  const asset=safe(api.AgentCryptoTraderPaperPreparation?.snapshot);
  const candles=api.AgentCryptoMarketMicroscope,book=api.AgentCryptoOkxMicrostructure;
  const current=Date.now();
  if(asset?.asset&&candles&&requireCandles(asset,safe(candles.snapshot),current)&&typeof candles.load==="function"){
   try{await candles.load({reason:"trader-t0-explicit-capture"});}catch(_){}
  }
  if(token!==captureSeq||identity()!==start)return null;
  if(asset?.asset&&book&&requireBook(asset,safe(book.snapshot),book,Date.now())&&typeof book.refresh==="function"){
   try{await book.refresh({asset:asset.asset.symbol,automatic:false});}catch(_){}
  }
  if(token!==captureSeq||identity()!==start)return null;
  evidence=analyze();paint();return evidence;
 }finally{
  captureBusy=false;
  if(button){button.disabled=false;button.textContent="Capturer T0 (sans stockage)";}
 }
}
function reset(){++captureSeq;evidence=null;paint()}
function mount(){
 if(document.getElementById("traderPaperT0"))return true;
 const parent=document.getElementById("traderPaperPreparation")?.querySelector(".paper-inner");
 if(!parent)return false;
 const el=document.createElement("section");el.id="traderPaperT0";
 el.style.cssText="margin-top:14px;border-top:1px solid #375760;padding-top:12px";
 el.innerHTML='<h4>PREUVE T0 · G1 QUALITE DES DONNEES</h4>'+
  '<p class="paper-note">Capture volontaire en lecture seule. Aucune promotion de gate.</p>'+
  '<button type="button" data-t0-capture>Capturer T0 (sans stockage)</button>'+
  '<pre data-t0-report style="white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.55 system-ui,sans-serif"></pre>';
 parent.appendChild(el);
 el.querySelector("[data-t0-capture]").addEventListener("click",capture);paint();return true;
}
if(!mount()){const onClick=()=>{if(mount())document.removeEventListener("click",onClick,true)};
 document.addEventListener("click",onClick,true);}
for(const e of ["agent-crypto:selected-market-changed","agent-crypto:quote-architecture-changed"])api.addEventListener(e,reset,{passive:true});
api.AgentCryptoTraderT0=Object.freeze({analyze,capture,mount,reset,report,marketReport,marketBrief,snapshot:()=>evidence,read_only:true,gate_write:false,real_order:false,storage_write:false});
})();