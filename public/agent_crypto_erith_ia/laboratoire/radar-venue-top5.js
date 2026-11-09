/* Seven Heaven · historical Top 5 cross-venue evidence viewer.
 * Pure classification and read-only DOM; never merges exchange candles or sends orders.
 * Binance USDT, Coinbase USD and Kraken USD are always separate sources. */
(function(root,factory) {
 "use strict";
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.SevenVenueTop5=api;
 if(root && root.document) {
   const start=()=>api.mount(root.document);
   if(root.document.readyState==="loading")root.document.addEventListener("DOMContentLoaded",start);
   else start();
 }
})(typeof globalThis!=="undefined"?globalThis:null,function() {
"use strict";
const BASE="https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/";
const MATRIX=BASE+"cross_venue_gap_matrix/index.json",INCIDENTS=BASE+"exchange_incident_register/index.json";
const ASSETS=["BTC","ETH","BNB","XRP","SOL"];
function integer(n) {return Number.isInteger(n)&&n>=0;}
function compile(matrix,incidents) {
 if(matrix?.schema!=="seven.crypto.cross-venue-historical-gap-matrix.v1"||
    matrix?.policy!=="native_venue_candles_utc_exact_non_fungible_quotes.v1"||
    !Array.isArray(matrix.rows)||matrix.rows.length<42||
    incidents?.schema!=="seven.crypto.exchange-incident-and-top5-coverage.v1"||
    !Array.isArray(incidents.btc?.windows))throw Error("Contrat du Coffre incompatible.");
 const registered=new Map(),seen=new Set(),entries=[];
 for(const notice of incidents.btc.windows) {
   const key=notice.start_utc+"|"+notice.end_exclusive_utc;
   if(registered.has(key))throw Error("Intervalles Binance doublés.");
   registered.set(key,notice);
 }
 for(const row of matrix.rows) {
   const {asset,window_start_utc:start,window_end_exclusive_utc:end,window_calendar_minutes:minutes}=row;
   if(!ASSETS.includes(asset)||!Number.isFinite(Date.parse(start))||
       !Number.isFinite(Date.parse(end))||!integer(minutes)||
       (Date.parse(end)-Date.parse(start))/60000!==minutes)throw Error("Fenêtre d'archive invalide.");
   const key=asset+"|"+start+"|"+end;
   if(seen.has(key))throw Error("Fenêtre répétée : "+key);
   seen.add(key);
   const notice=registered.get(start+"|"+end);
   if(!notice||!integer(notice.missing_native_1m_minutes)||
       notice.missing_native_1m_minutes!==minutes)throw Error("Incident BTC incompatible : "+key);
   const btcNative=notice.binance_trades;
   if(btcNative?.original_zip_checked!==true||btcNative?.zero_trades_in_window!==true||
      btcNative?.rows_in_gap!==0)throw Error("Absence Binance BTC non prouvée : "+key);
   const official=notice.official_binance;
   const officialVerified=official?.classification!=="cause_non_documentee"&&
       /^https:\/\/www\.binance\.com\//.test(official?.url||"");
   const alt=row.binance_alt;
   if(asset!=="BTC"&&
      (alt?.pair!==asset+"USDT"||alt.quote!=="USDT"||
       !integer(alt.candles_present)||!integer(alt.expected_minutes)||
       alt.expected_minutes!==minutes||
       alt.candles_present>minutes||alt.status!=="verified_api_response"))
      throw Error("Sondage Binance alternatif non qualifié : "+key);
   const cb=row.coinbase;
   if(cb?.pair!==asset+"-USD"||cb.quote!=="USD"||
      cb.status!=="verified_api_response"||
      !integer(cb.expected_minutes)||cb.expected_minutes!==minutes||
      !integer(cb.candles_present)||cb.candles_present>minutes||
      !integer(cb.positive_volume_minutes)||
      cb.positive_volume_minutes>cb.candles_present||
      cb.missing_minutes!==minutes-cb.candles_present)
      throw Error("Sondage Coinbase invalide : "+key);
   const k=row.kraken;
   if(k&&(k.quote!=="USD"||k.not_entire_interval_coverage!==true||
      !integer(k.sample_minutes_attempted)||
      !integer(k.exact_minute_positive_probes)||
      k.exact_minute_positive_probes>k.sample_minutes_attempted))
      throw Error("Sondage Kraken invalide : "+key);
   entries.push(Object.freeze({
     asset,start,end,minutes,date:start.slice(0,10),
     binancePair:asset+"USDT",binanceQuote:"USDT",
     binanceClass:officialVerified?"OFFICIAL_BTC_WINDOW":"CAUSE_UNKNOWN_BTC_WINDOW",
     binanceNative:asset==="BTC"?"ORIGINAL_BTC_ZIP_ZERO_TRADES":
       "ALT_API_"+alt.candles_present+"_OF_"+minutes,
     binanceCandles:asset==="BTC"?null:alt.candles_present,
     binanceNote:asset==="BTC"?"ZIP natif BTC : 0 transaction vérifiée":
       "API 1m "+alt.pair+" : "+alt.candles_present+"/"+minutes+
       " bougies ; ne prouve pas à elle seule l'absence de transactions",
     incidentCategory:official?.classification||"cause_non_documentee",
     incidentUrl:officialVerified?official.url:null,
     coinbasePair:cb.pair,coinbaseQuote:"USD",
     coinbaseCandles:cb.candles_present,coinbasePositive:cb.positive_volume_minutes,
     coinbaseCoverage:cb.candles_present===minutes?"COMPLETE":
       cb.candles_present>0?"PARTIAL":"NONE",
     coinbaseRequestUrls:(cb.requests||[]).map(x=>x.url).filter(x=>/^https:\/\//.test(x)),
     binanceRequestUrls:(alt?.requests||[]).map(x=>x.url).filter(x=>/^https:\/\//.test(x)),
     krakenPair:k?.pair||null,krakenQuote:k?.quote||null,
     krakenProbes:k?.sample_minutes_attempted??0,
     krakenPositive:k?.exact_minute_positive_probes??0,
     krakenRequestUrls:(k?.points||[]).map(x=>x.url).filter(x=>/^https:\/\//.test(x)),
     paperExecutionsProven:0,alternativeCandlesUsableAsBinance:false
   }));
 }
 const ordered=entries.sort((a,b)=>b.start.localeCompare(a.start)||ASSETS.indexOf(a.asset)-ASSETS.indexOf(b.asset));
 return Object.freeze({schema:"seven.venue.top5.readonly.v1",entries:Object.freeze(ordered),
   counts:Object.freeze(Object.fromEntries(ASSETS.map(a=>[a,entries.filter(x=>x.asset===a).length]))),
   ordersEnabled:false,paperExecutionsProven:0,quoteSubstitution:false,
   sourceAsOf:incidents.as_of_utc});
}
function selectRows(compiled,filters={}) {
 if(!compiled?.entries)return [];
 return compiled.entries.filter(x=>
   (!filters.asset||filters.asset==="all"||x.asset===filters.asset)&&
   (!filters.date||filters.date==="all"||x.date===filters.date)&&
   (!filters.venue||filters.venue==="all"||
      (filters.venue==="binance"&&x.binanceClass==="OFFICIAL_BTC_WINDOW")||
      (filters.venue==="coinbase"&&x.coinbasePositive>0)||
      (filters.venue==="kraken"&&x.krakenPositive>0))&&
   (!filters.proof||filters.proof==="all"||
      (filters.proof==="official"&&x.binanceClass==="OFFICIAL_BTC_WINDOW")||
      (filters.proof==="unknown"&&x.binanceClass==="CAUSE_UNKNOWN_BTC_WINDOW")||
      (filters.proof==="complete"&&x.coinbaseCoverage==="COMPLETE")||
      (filters.proof==="partial"&&x.coinbaseCoverage==="PARTIAL")||
      (filters.proof==="none"&&x.coinbaseCoverage==="NONE")));
}
function mount(doc,fetcher) {
 const tbody=doc.getElementById("top5-evidence-rows");
 const status=doc.getElementById("top5-evidence-status");
 const selectors=["asset","date","venue","proof"].map(x=>doc.getElementById("top5-"+x));
 const refresh=doc.getElementById("top5-evidence-reload");
 const summary=doc.getElementById("top5-evidence-summary");
 if(!tbody||!status||!refresh||!summary||selectors.some(x=>!x))return null;
 const fetchFn=fetcher||(typeof fetch==="function"?fetch.bind(globalThis):null);
 let current=null,loading=false;
 function txt(tag,value,parent) {
   const el=doc.createElement(tag);el.textContent=String(value);if(parent)parent.append(el);return el;
 }
 function proofLink(parent,url,label) {
   if(!/^https:\/\//.test(url||""))return;
   const a=doc.createElement("a");a.href=url;a.target="_blank";a.rel="noopener noreferrer";
   a.textContent=label;parent.append(a);
 }
 function render() {
   tbody.replaceChildren();
   if(!current)return;
   const filters=Object.fromEntries(["asset","date","venue","proof"].map((x,i)=>[x,selectors[i].value]));
   const rows=selectRows(current,filters);
   for(const r of rows) {
     const tr=doc.createElement("tr");
     txt("td",r.date+" · "+r.start.slice(11,16)+"–"+r.end.slice(11,16)+" UTC",tr);
     txt("td",r.asset,tr);
     const official=r.binanceClass==="OFFICIAL_BTC_WINDOW";
     txt("td",(official?"Incident officiel · ":"Cause non documentée · ")+r.binanceNote,tr);
     txt("td",r.coinbasePair+" · "+r.coinbasePositive+"/"+r.minutes+
       " min à volume positif · "+(r.coinbaseCoverage==="COMPLETE"?"couverture complète":
       r.coinbaseCoverage==="PARTIAL"?"couverture partielle":"activité non attestée"),tr);
     txt("td",r.krakenPair?
       r.krakenPair+" · "+r.krakenPositive+"/"+r.krakenProbes+
       " minutes sondées positives (non exhaustif)":"Aucun sondage documenté",tr);
     const proof=doc.createElement("td"),details=doc.createElement("details");
     txt("summary","Voir les sources",details);
     const block=doc.createElement("div");block.className="evidence-detail";
     txt("p","Qualification Binance issue du registre BTC ; pour "+r.asset+
       ", distinguer l'incident général et la vérification propre à "+r.binancePair+".",block);
     const links=[
       ["Annonce Binance",r.incidentUrl?[r.incidentUrl]:[]],
       ["API Binance "+r.binancePair,r.binanceRequestUrls],
       ["API Coinbase "+r.coinbasePair,r.coinbaseRequestUrls],
       ["Transactions Kraken "+(r.krakenPair||""),r.krakenRequestUrls]
     ];
     for(const [label,urls] of links) {
       if(!urls.length)continue;
       const p=doc.createElement("p");txt("strong",label+" : ",p);
       urls.forEach((url,i)=>{if(i)txt("span"," · ",p);proofLink(p,url,"preuve "+(i+1));});
       block.append(p);
     }
     if(!r.incidentUrl)txt("p","Cause officielle introuvable dans le registre : ne pas inférer une maintenance.",block);
     details.append(block);proof.append(details);tr.append(proof);tbody.append(tr);
   }
   const active=rows.filter(x=>x.coinbasePositive>0).length;
   const unknown=rows.filter(x=>x.binanceClass==="CAUSE_UNKNOWN_BTC_WINDOW").length;
   status.textContent=rows.length+" / "+current.entries.length+
     " fenêtres affichées · Coinbase activité positive : "+active+
     " · Cause Binance non documentée : "+unknown+
     " · données historiques uniquement.";
   summary.textContent=current.entries.length+" fenêtres actif/date documentées · "+
     ASSETS.map(a=>a+" "+current.counts[a]).join(" · ")+
     " · registre au "+current.sourceAsOf+".";
 }
 async function load() {
   if(loading)return;
   if(!fetchFn){status.textContent="Lecture des sources indisponible.";return;}
   loading=true;refresh.disabled=true;status.textContent="Vérification des registres du Coffre…";
   try {
     const [m,n]=await Promise.all([fetchFn(MATRIX,{cache:"no-store",credentials:"omit"}),
        fetchFn(INCIDENTS,{cache:"no-store",credentials:"omit"})]);
     if(!m.ok||!n.ok)throw Error("Échec HTTP des sources publiques");
     const [a,b]=await Promise.all([m.json(),n.json()]);
     current=compile(a,b);
     const dates=[...new Set(current.entries.map(x=>x.date))].sort().reverse();
     const selected=selectors[1].value;
     selectors[1].replaceChildren();
     const all=doc.createElement("option");all.value="all";all.textContent="Toutes les dates";selectors[1].append(all);
     dates.forEach(d=>{const option=doc.createElement("option");option.value=d;option.textContent=d;selectors[1].append(option)});
     selectors[1].value=dates.includes(selected)?selected:"all";
     render();
   }catch(e) {
     current=null;tbody.replaceChildren();summary.textContent="Aucune preuve acceptée.";
     status.textContent="Coffre non qualifié : "+String(e?.message||e)+". Aucun résultat inventé.";
   }finally{loading=false;refresh.disabled=false;}
 }
 selectors.forEach(x=>x.addEventListener("change",render));
 refresh.addEventListener("click",load);
 void load();
 return Object.freeze({load,render});
}
return Object.freeze({compile,selectRows,mount,sourceMatrix:MATRIX,sourceIncidents:INCIDENTS});
});
