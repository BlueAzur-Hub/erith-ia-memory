/* Seven Heaven · T0 data-quality observation; does not certify G1 or trade. */
(()=>{"use strict";
const api=globalThis;
let evidence=null;
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
  facts:Object.freeze(facts),flags:Object.freeze(flags),gatePromoted:false,paperAuthorized:false,orderPlaced:false,persisted:false});
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
  "\n\nSOURCES ET PREUVES\n"+v.facts.join("\n")+
  "\n\nLIMITES\n"+v.flags.join("\n");
}
function paint(){
 const output=document.getElementById("traderPaperT0")?.querySelector("[data-t0-report]");
 if(output)output.textContent=report(evidence);
}
function capture(){evidence=analyze();paint();return evidence}
function reset(){evidence=null;paint()}
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
api.AgentCryptoTraderT0=Object.freeze({analyze,capture,mount,reset,report,snapshot:()=>evidence,read_only:true,gate_write:false,real_order:false,storage_write:false});
})();