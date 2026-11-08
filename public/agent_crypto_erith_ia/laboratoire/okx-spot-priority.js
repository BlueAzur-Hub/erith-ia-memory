/* ERITH.IA · OKX Spot evidence router · public archive + user-supplied OKX screen inventory.
   No authenticated API, live trading, synthetic fill, account access or quote conversion. */
((root, factory) => {
  const api=factory();
  if(typeof module==="object" && module.exports)module.exports=api;
  if(root)root.SevenOkxSpotPriority=api;
})(typeof globalThis!=="undefined"?globalThis:null,()=>{
"use strict";
const PATHS=Object.freeze({
 screenshot:"../data/crypto/research/okx-spot-screen-candidates.json",
 hourly:"../data/crypto/okx-hourly/research-latest.json",
 listings:"../administrator/data/new-listings-public-feed.json"
});
function invariant(ok,msg){if(!ok)throw Error("Source OKX invalide : "+msg);}
function safeText(v){return typeof v==="string"?v:"";}
function safeInstId(id){return /^[A-Z0-9]+-(USDC|USDT|EUR)$/.test(id);}
function buildUniverse({screenshot,hourly,listings}){
 invariant(screenshot?.schema==="erith.crypto.okx-spot-user-screen-candidates.v1"&&
  screenshot.public_only===true&&screenshot.orders_enabled===false&&
  screenshot.account_instruments_verified===false&&Array.isArray(screenshot.items),
  "captures OKX");
 invariant(hourly?.schema==="erith.radar.okx-hourly-evidence.v1" &&
  hourly.orders_enabled===false&&hourly.real_orders===0&&hourly.paper_fills===0&&Array.isArray(hourly.pairs),
  "carnets horaires");
 invariant(listings?.schema==="erith.seven.public-spot-listings-feed.v1"&&
  listings.trade_permission===false&&listings.real_orders===0&&
  listings.spot_usdc_access_for_user_verified===false&&Array.isArray(listings.entries),
  "nouveaux instruments Spot");
 const map=new Map();
 function ensure(id,type){
  invariant(safeInstId(id),"format instrument "+String(id));
  if(!map.has(id))map.set(id,{
    instId:id,base:id.split("-")[0],quote:id.split("-")[1],type:type,
    labels:[],hasScreenshot:false,hasBook:false,hasPublicListing:false,
    bookAt:null,bookSpreadBps:null,listingAt:null,listingState:null,
    verifiedForAccount:false,eligibilityVerified:false,orderAllowed:false
  });
  const row=map.get(id);
  if(type==="tokenized_stock_or_etf")invariant(row.type===type,"identité produit "+id);
  else invariant(row.type!=="tokenized_stock_or_etf","crypto/action amalgamées "+id);
  return row;
 }
 const ids=new Set();
 for(const x of screenshot.items){
  invariant(x?.evidence==="USER_SUPPLIED_OKX_INTERFACE_SCREENSHOT" &&
   x.country_eligibility_verified===false&&x.account_order_permission_verified===false,
   "preuve de capture");
  invariant(!ids.has(x.instId),"capture dupliquée");
  ids.add(x.instId);
  invariant(["crypto_spot_candidate","tokenized_stock_or_etf"].includes(x.asset_type),
   "classe de capture");
  const row=ensure(x.instId,x.asset_type);
  row.hasScreenshot=true;row.screenshotAt=screenshot.captured_at_local_date;
  row.labels.push("Interface OKX · capture "+screenshot.captured_at_local_date);
  row.screenshotGroup=x.group;
 }
 for(const x of hourly.pairs){
  const row=ensure(x.pair,"crypto_spot_candidate");
  invariant(safeText(x.quote)===row.quote&&x.market_fill_proven===false &&
   x.trading_signal===false,"carnet Spot non exécutable");
  row.hasBook=true;row.bookAt=x.last_source_utc||hourly.as_of_utc;
  row.bookSpreadBps=x.latest_spread_bps;
  row.labels.push("Carnet OKX public archivé · "+row.bookAt.slice(0,10));
 }
 const listingIds=new Set();
 for(const x of listings.entries){
  if(x.provider!=="okx")continue;
  invariant(x.instrument_type==="SPOT"&&x.country_eligibility_verified===false&&
   x.account_spot_access_verified===false,"listing public non autorisé");
  const id=x.base+"-"+x.quote;
  invariant(!listingIds.has(id),"listing dupliqué "+id);
  listingIds.add(id);
  const type=/^X[A-Z0-9]+$/.test(x.base)?"tokenized_stock_or_etf":"crypto_spot_candidate";
  const row=ensure(id,type);
  row.hasPublicListing=true;row.listingAt=safeText(x.listedAt);
  row.listingState=safeText(x.state);
  row.labels.push("Catalogue Spot OKX · relevé "+listings.captured_at_utc.slice(0,10));
 }
 const data=[...map.values()].sort((a,b)=>
  Number(b.hasScreenshot)-Number(a.hasScreenshot)||
  Number(b.hasBook)-Number(a.hasBook)||
  a.instId.localeCompare(b.instId));
 const counts={
  total:data.length,crypto:data.filter(x=>x.type==="crypto_spot_candidate").length,
  tokenized:data.filter(x=>x.type==="tokenized_stock_or_etf").length,
  seenScreenshot:data.filter(x=>x.hasScreenshot).length,
  haveBook:data.filter(x=>x.hasBook).length,
  catalogOKX:data.filter(x=>x.hasPublicListing).length,
  regionConfirmed:0,orderAuthorized:0
 };
 invariant(data.every(x=>x.verifiedForAccount===false&&x.orderAllowed===false),
 "toute décision d'accès authentifié doit rester inconnue");
 return {data,counts,metadata:{hourlyAt:hourly.as_of_utc,listingAt:listings.captured_at_utc,
  screenshotAt:screenshot.captured_at_local_date,accountInstrumentsChecked:false}};
}
function render(doc,model){
 const tbody=doc.getElementById("okx-target-rows");
 const type=doc.getElementById("okx-target-type").value;
 const evidence=doc.getElementById("okx-target-evidence").value;
 const search=doc.getElementById("okx-target-search").value.trim().toUpperCase();
 const rows=model.data.filter(x=>(type==="all"||x.type===type)&&
   (evidence==="all"||(evidence==="screenshot"&&x.hasScreenshot)||
    (evidence==="book"&&x.hasBook)||(evidence==="new"&&x.hasPublicListing))&&
   (!search||x.instId.includes(search)));
 tbody.replaceChildren();
 const append=(tr,tag,text)=>{
  const x=doc.createElement(tag);x.textContent=text;tr.appendChild(x);return x;
 };
 for(const x of rows){
  const tr=doc.createElement("tr");
  append(tr,"th",x.instId);
  append(tr,"td",x.type==="tokenized_stock_or_etf"?"Action / ETF tokenisé":"Crypto · catégorie à confirmer");
  append(tr,"td",x.labels.join(" · "));
  append(tr,"td",x.hasBook?x.bookAt.slice(0,16).replace("T"," ")+" UTC":
   x.hasPublicListing?x.listingAt.slice(0,16).replace("T"," ")+" UTC":
   "Capture "+x.screenshotAt);
  append(tr,"td","À vérifier pour le compte (Europe)");
  append(tr,"td",x.type==="tokenized_stock_or_etf"?
   "Tenir distinct des cryptomonnaies":
   x.hasBook?"Actualiser le carnet, les règles et les frais":
   "Vérifier la paire, l'identité et les règles Spot");
  tbody.appendChild(tr);
 }
 if(!rows.length){
  const tr=doc.createElement("tr");const td=doc.createElement("td");td.colSpan=6;
  td.textContent="Aucun instrument pour ces filtres.";tr.appendChild(td);tbody.appendChild(tr);
 }
 doc.getElementById("okx-target-count").textContent=rows.length+" instrument(s) affiché(s)";
}
function mount(doc=document,fetcher=fetch){
 const status=doc.getElementById("okx-target-status");
 if(!status)return null;
 let active=null;
 const button=doc.getElementById("okx-target-reload");
 const inputs=["okx-target-type","okx-target-evidence","okx-target-search"];
 inputs.forEach(id=>doc.getElementById(id).addEventListener(id.endsWith("search")?"input":"change",
  ()=>{if(active)render(doc,active)}));
 let pending=false;
 async function load(){
  if(pending)return;pending=true;button.disabled=true;
  status.textContent="Réconciliation des archives OKX et des captures…";
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),18000);
  try{
   const datasets=await Promise.all(Object.entries(PATHS).map(async([key,path])=>{
    const r=await fetcher(path,{cache:"no-store",credentials:"omit",signal:controller.signal});
    if(!r.ok)throw Error(key+" HTTP "+r.status);
    return [key,await r.json()];
   }));
   const model=buildUniverse(Object.fromEntries(datasets));
   active=model;
   const c=model.counts,m=model.metadata;
   status.textContent=c.crypto+" paires crypto · "+c.tokenized+" produits X tokenisés séparés · "+
    c.seenScreenshot+" sur captures OKX du "+m.screenshotAt+" · "+c.haveBook+
    " avec ancien carnet public · "+c.catalogOKX+" cotations OKX dans le catalogue du "+
    m.listingAt.slice(0,10)+" · 0 instrument authentifié pour le compte. Aucun ordre.";
   render(doc,model);
  }catch(e){
   active=null;doc.getElementById("okx-target-rows").replaceChildren();
   status.textContent="Catalogue partiel / inaccessible : "+e.message+
     ". Aucune disponibilité de trading n'est affirmée.";
  }finally{clearTimeout(timeout);pending=false;button.disabled=false;}
 }
 button.addEventListener("click",load);void load();
 return {load};
}
if(typeof document!=="undefined"){
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>mount());
 else mount();
}
return Object.freeze({buildUniverse,mount,PATHS});
});