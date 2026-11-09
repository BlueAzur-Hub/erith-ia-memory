/* Seven Heaven · Radar: use existing cross-venue audit to classify historical exchange halts.
 * Read-only, SOURCE PROVENANCE ALWAYS PRESERVED, no simulator or live exchange mutation. */
(function(root,factory){
 "use strict";
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.SevenRadarVenueContinuity=api;
 if(root?.document){
   if(root.document.readyState==="loading")root.document.addEventListener("DOMContentLoaded",()=>api.mount(root.document));
   else api.mount(root.document);
 }
})(typeof globalThis!=="undefined"?globalThis:null,()=>{
"use strict";
const URL_MATRIX="https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/cross_venue_gap_matrix/index.json";
const URL_INCIDENTS="https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/exchange_incident_register/index.json";
function compileEvidence(matrix,registry){
  if(matrix?.schema!=="seven.crypto.cross-venue-historical-gap-matrix.v1"||
    matrix.policy!=="native_venue_candles_utc_exact_non_fungible_quotes.v1"||
    !Array.isArray(matrix.rows)||registry?.schema!=="seven.crypto.exchange-incident-and-top5-coverage.v1"||
    !Array.isArray(registry.btc?.windows))throw Error("Les preuves croisées ne correspondent pas aux sources canoniques.");
  const windows=[
    {date:"2021-08-13",start:"2021-08-13T02:00:00Z",end:"2021-08-13T06:30:00Z",minutes:270},
    {date:"2021-09-29",start:"2021-09-29T07:00:00Z",end:"2021-09-29T09:00:00Z",minutes:120},
    {date:"2023-03-24",start:"2023-03-24T12:40:00Z",end:"2023-03-24T14:00:00Z",minutes:80}
  ];
  const entries=[];
  for(const window of windows){
    const notice=registry.btc.windows.filter(x=>x.start_utc===window.start&&x.end_exclusive_utc===window.end);
    if(notice.length!==1||notice[0].missing_native_1m_minutes!==window.minutes||
      notice[0].binance_trades?.original_zip_checked!==true||
      notice[0].binance_trades?.zero_trades_in_window!==true||
      notice[0].binance_trades?.rows_in_gap!==0||
      !/^https:\/\/www\.binance\.com\//.test(notice[0].official_binance?.url||"")||
      notice[0].official_binance?.classification==="cause_non_documentee")
      throw Error("La preuve Binance officielle est absente ou incompatible : "+window.date);
    for(const asset of ["BTC","ETH"]){
      const rows=matrix.rows.filter(x=>x.asset===asset&&x.window_start_utc===window.start&&x.window_end_exclusive_utc===window.end);
      if(rows.length!==1)throw Error("Preuve de fenêtre introuvable : "+asset+" "+window.date);
      const row=rows[0], cb=row.coinbase;
      if(row.window_calendar_minutes!==window.minutes||cb?.status!=="verified_api_response"||
        cb.pair!==asset+"-USD"||cb.quote!=="USD"||
        cb.expected_minutes!==window.minutes||cb.candles_present!==window.minutes||
        cb.positive_volume_minutes!==window.minutes||cb.missing_minutes!==0)
        throw Error("Couverture Coinbase non prouvée : "+asset+" "+window.date);
      if(asset==="ETH"&&(row.binance_alt?.pair!=="ETHUSDT"||
        row.binance_alt?.candles_present!==0||row.binance_alt?.expected_minutes!==window.minutes))
        throw Error("Observation ETH/Binance incompatible : "+window.date);
      const k=row.kraken;
      if(k&&(k.not_entire_interval_coverage!==true||
        !Number.isInteger(k.sample_minutes_attempted)||
        !Number.isInteger(k.exact_minute_positive_probes)||
        k.exact_minute_positive_probes>k.sample_minutes_attempted))
        throw Error("Sondage Kraken non conforme : "+asset+" "+window.date);
      entries.push({
        date:window.date,asset,start:window.start,end:window.end,minutes:window.minutes,
        binance_status:"MARKET_HALTED_OFFICIAL",
        binance_pair:asset+"USDT",binance_quote:"USDT",
        coinbase_pair:cb.pair,coinbase_quote:"USD",
        coinbase_positive_minutes:cb.positive_volume_minutes,
        coinbase_verified_minutes:cb.candles_present,
        coinbase_source_status:cb.status,
        kraken_pair:k?.pair||null,
        kraken_probes:k?.sample_minutes_attempted??null,
        kraken_positive_probes:k?.exact_minute_positive_probes??null,
        binance_official_notice_url:notice[0].official_binance.url,
        documented_binance_trades_zero_for_btc:true,
        no_cross_venue_relabel:true,no_paper_fill_proven:true
      });
    }
  }
  return {schema:"seven.radar.venue-continuity-view.v1",source_matrix_schema:matrix.schema,
    source_incident_schema:registry.schema,mode:"READ_ONLY_HISTORICAL_CROSS_VENUE_EVIDENCE",
    orders_enabled:false,paper_fills:0,
    entries,coinbase_total_verified_minutes:entries.reduce((s,x)=>s+x.coinbase_verified_minutes,0),
    policy:"NO_CROSS_EXCHANGE_OHLCV_SUBSTITUTION"};
}
function classifyHistoricalMinute(utc,asset,evidence){
  if(!["BTC","ETH"].includes(asset))return {status:"UNSUPPORTED_ASSET",binance_paper_allowed:null};
  const ts=Date.parse(utc);
  if(!Number.isFinite(ts))return {status:"INVALID_UTC",binance_paper_allowed:null};
  const w=evidence?.entries?.find(x=>x.asset===asset&&ts>=Date.parse(x.start)&&ts<Date.parse(x.end));
  if(!w)return {status:"NOT_A_CLASSIFIED_WINDOW",binance_paper_allowed:null};
  return {status:"MARKET_HALTED_OFFICIAL",binance_paper_allowed:false,asset,binance_pair:w.binance_pair,
    alternative:{venue:"Coinbase Exchange",pair:w.coinbase_pair,quote:"USD",verified_minutes:w.coinbase_verified_minutes,source_status:w.coinbase_source_status},
    allowed_to_replace_binance_usdt_candles:false,allowed_to_infer_paper_fills:false};
}
function mount(doc,fetcher){
 const body=doc.getElementById("venue-continuity-rows");
 const status=doc.getElementById("venue-continuity-status");
 const selector=doc.getElementById("venue-continuity-date");
 const reload=doc.getElementById("venue-continuity-reload");
 if(!body||!status||!selector||!reload)return null;
 const getter=fetcher||(typeof fetch==="function"?fetch.bind(globalThis):null);
 if(!getter){status.textContent="Lecture réseau indisponible.";return null;}
 let current=null,loading=false;
 function cell(row,value){
  const td=doc.createElement("td");td.textContent=String(value);row.append(td);return td;
 }
 function draw(){
  body.replaceChildren();
  if(!current)return;
  const dates=selector.value;
  const chosen=current.entries.filter(x=>dates==="all"||x.date===dates);
  for(const x of chosen){
   const tr=doc.createElement("tr");
   cell(tr,x.date+" · "+x.start.slice(11,16)+"–"+x.end.slice(11,16)+" UTC");
   cell(tr,x.asset);
   cell(tr,"Arrêt Spot · "+x.minutes+" min · "+x.binance_pair);
   cell(tr,x.coinbase_verified_minutes+"/"+x.minutes+" bougies "+x.coinbase_pair+" (USD)");
   cell(tr,x.kraken_probes===null?"Non sondé":x.kraken_positive_probes+"/"+x.kraken_probes+" sondes "+x.kraken_pair);
   const td=doc.createElement("td"),a=doc.createElement("a");
   a.href=x.binance_official_notice_url;a.rel="noopener noreferrer";a.target="_blank";a.textContent="Annonce Binance";
   td.append(a);tr.append(td);body.append(tr);
  }
  status.textContent=chosen.length+" lignes de preuve croisées · Coinbase "+
   chosen.reduce((a,x)=>a+x.coinbase_verified_minutes,0)+"/"+
   chosen.reduce((a,x)=>a+x.minutes,0)+" minutes cotées en USD · Ordres Binance interdits dans ces fenêtres. Lecture documentaire.";
 }
 async function load(){
  if(loading)return;
  loading=true;reload.disabled=true;status.textContent="Lecture des deux registres publics existants…";
  try{
   const [a,b]=await Promise.all([getter(URL_MATRIX,{cache:"no-store",credentials:"omit"}),
     getter(URL_INCIDENTS,{cache:"no-store",credentials:"omit"})]);
   if(!a.ok||!b.ok)throw Error("Erreur HTTP des registres d'archives.");
   const [matrix,incidents]=await Promise.all([a.json(),b.json()]);
   current=compileEvidence(matrix,incidents);
   draw();
  }catch(e){
   current=null;body.replaceChildren();status.textContent="Preuves indisponibles : "+String(e?.message||e)+
     ". Aucune donnée ou disponibilité d'échange déduite.";
  }finally{loading=false;reload.disabled=false;}
 }
 selector.addEventListener("change",draw);
 reload.addEventListener("click",load);
 load();
 return {load,draw};
}
return {compileEvidence,classifyHistoricalMinute,mount};
});
