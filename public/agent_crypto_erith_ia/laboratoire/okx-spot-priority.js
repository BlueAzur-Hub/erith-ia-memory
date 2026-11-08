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
 listings:"../administrator/data/new-listings-public-feed.json",
 research:"../data/crypto/research/okx-spot-identity-research.json"
});
function invariant(ok,msg){if(!ok)throw Error("Source OKX invalide : "+msg);}
function safeText(v){return typeof v==="string"?v:"";}
function safeInstId(id){return /^[A-Z0-9]+-(USDC|USDT|USD|EUR)$/.test(id);}
function buildUniverse({screenshot,hourly,listings,research}){
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
 invariant(research?.schema==="erith.crypto.okx-spot-identity-research.v1"&&
  research.read_only===true&&research.orders_enabled===false&&
  research.no_account_access_verification===true&&research.no_quote_interchange===true&&
  Array.isArray(research.records),"registre des identités de recherche");
 const map=new Map();
 function ensure(id,type){
  invariant(safeInstId(id),"format instrument "+String(id));
  if(!map.has(id))map.set(id,{
    instId:id,base:id.split("-")[0],quote:id.split("-")[1],type:type,
    labels:[],hasScreenshot:false,hasBook:false,hasPublicListing:false,
    bookAt:null,bookSpreadBps:null,listingAt:null,listingState:null,
    hasOfficialAnnouncement:false,officialListingAt:null,canonicalResearchId:null,
    researchPage:null,identityWarning:null,spotPairConfirmed:false,
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
 const researched=new Set();
 for(const x of research.records){
  invariant(typeof x?.coin_id==="string"&&/^[a-z0-9-]+$/.test(x.coin_id)&&
    !researched.has(x.coin_id)&&Array.isArray(x.announced_spot_instruments)&&
    x.announced_spot_instruments.length>0&&x.account_spot_available_verified===false&&
    x.actual_fees_verified===false&&x.order_fill_proven===false&&
    x.paper_ready===false&&x.contract_matched_to_okx_announcement===false&&
    x.trade_quote_ccy_list_verified===false&&
    research.public_okx_migration?.announced_date==="2026-09-30"&&
    research.public_okx_migration.private_account_instruments_checked===false,
    "fiche identité / permission");
  researched.add(x.coin_id);
  invariant(typeof x.symbol==="string"&&/^[A-Z0-9]+$/.test(x.symbol)&&
    typeof x.research_page==="string"&&/^cas-ecole-[a-z0-9-]+\.html$/.test(x.research_page),
    "identité et destination de recherche");
  invariant(x.coin_id!==x.coin_id_collision_to_exclude &&
    typeof x.ambiguity_warning==="string"&&x.ambiguity_warning.length>0,
    "conflit de ticker");
  invariant(x.observed_provenance==="USER_SUPPLIED_TRADER_SCREENSHOT"&&
    x.observed_pair_official_announcement_confirmed===false&&
    screenshot.items.some(y=>y.instId===x.observed_instrument)&&
    x.observed_instrument.startsWith(x.symbol+"-"),
    "paire Trader non reconnue");
  const observed=ensure(x.observed_instrument,"crypto_spot_candidate");
  observed.canonicalResearchId=x.coin_id;observed.researchPage=x.research_page;
  observed.identityWarning=x.ambiguity_warning;
  observed.labels.push("Trader : paire affichée, non certifiée par les annonces officielles consultées");
  const announcements=new Set();
  for(const listed of x.announced_spot_instruments){
   invariant(safeInstId(listed.instId)&&listed.instId.startsWith(x.symbol+"-")&&
     !announcements.has(listed.instId)&&
     /^https:\/\/www\.okx\.com\//.test(listed.source_url)&&
     /^\d{4}-\d{2}-\d{2}T/.test(listed.open_at_utc),
     "annonce Spot primaire");
   announcements.add(listed.instId);
   invariant(listed.instId!==x.observed_instrument ||
     x.observed_pair_official_announcement_confirmed===true,
     "la paire de l'écran ne doit pas être présumée annoncée");
   const row=ensure(listed.instId,"crypto_spot_candidate");
   row.canonicalResearchId=x.coin_id;row.researchPage=x.research_page;
   row.identityWarning=x.ambiguity_warning;
   invariant(listed.current_state_verified===false&&listed.official_announcement_is_not_current_account_availability===true,
    "annonce historique ≠ accès courant");
   row.hasOfficialAnnouncement=true;row.officialListingAt=listed.open_at_utc;
   row.labels.push("Annonce officielle OKX Spot · "+listed.open_at_utc.slice(0,10));
  }
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
  officialAnnounced:data.filter(x=>x.hasOfficialAnnouncement).length,
  researchReviewed:researched.size,regionConfirmed:0,orderAuthorized:0
 };
 invariant(data.every(x=>x.verifiedForAccount===false&&x.orderAllowed===false),
 "toute décision d'accès authentifié doit rester inconnue");
 return {data,counts,metadata:{hourlyAt:hourly.as_of_utc,listingAt:listings.captured_at_utc,
  screenshotAt:screenshot.captured_at_local_date,identityReviewAt:research.reviewed_on_utc,
  accountInstrumentsChecked:false}};
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
   x.hasOfficialAnnouncement?x.officialListingAt.slice(0,16).replace("T"," ")+" UTC":
   "Capture "+(x.screenshotAt||"non datée"));
  append(tr,"td","À vérifier pour le compte (Europe)");
  const detail=append(tr,"td",x.type==="tokenized_stock_or_etf"?
   "Tenir distinct des cryptomonnaies":
   x.hasOfficialAnnouncement?"Annonce historique ; état courant et accès au compte non vérifiés":
   x.identityWarning?"Paire affichée, preuve instrument exact à obtenir":
   x.hasBook?"Actualiser le carnet, les règles et les frais":
   "Vérifier la paire, l'identité et les règles Spot");
  if(x.researchPage){
   const a=doc.createElement("a");a.href="./"+x.researchPage;a.textContent=" · Dossier "+x.canonicalResearchId+" ↗";
   detail.appendChild(a);
  }
  tbody.appendChild(tr);
 }
 if(!rows.length){
  const tr=doc.createElement("tr");const td=doc.createElement("td");td.colSpan=6;
  td.textContent="Aucun instrument pour ces filtres.";tr.appendChild(td);tbody.appendChild(tr);
 }
 doc.getElementById("okx-target-count").textContent=rows.length+" instrument(s) affiché(s)";
}
async function probeLocalMarket({asset="EDGE",fetcher=null}={}){
 const name=String(asset||"").trim().toUpperCase();
 invariant(/^[A-Z0-9]{2,16}$/.test(name),"nom d'actif local");
 const request=typeof fetcher==="function"?fetcher:
  (typeof fetch==="function"?fetch.bind(globalThis):null);
 invariant(!!request,"transport local indisponible");
 const url="http://127.0.0.1:8790/market-resolve?asset="+
  encodeURIComponent(name)+"&currency=USD";
 const response=await request(url,{
  method:"GET",cache:"no-store",credentials:"omit",mode:"cors",
  headers:{Accept:"application/json"}
 });
 invariant(response&&response.ok,"Bridge local hors ligne ou réponse non valide");
 const payload=await response.json();
 invariant(payload&&typeof payload==="object"&&
  String(payload.asset||"").toUpperCase()===name&&
  String(payload.display_currency||"").toUpperCase()==="USD", "Bridge hors contexte");
 const normalize=(item)=>{
  if(!item||typeof item!=="object"||item.provider!=="okx")return null;
  const instId=String(item.instrument||"").toUpperCase();
  if(!safeInstId(instId)||!instId.startsWith(name+"-"))return null;
  return {provider:"okx",instrument:instId,
   quote:instId.split("-")[1],capabilities:Array.isArray(item.capabilities)?
    item.capabilities.filter(z=>z==="book"||z==="candles"):[]};
 };
 const candles=normalize(payload.chosen?.candles),book=normalize(payload.chosen?.book);
 return Object.freeze({
  asset:name,source:"LOCAL_PUBLIC_MARKET_RESOLVER",readOnly:true,
  candles,book,accountAccessVerified:false,accountInstrumentsQueried:false,
  tradeQuoteCcyListVerified:false,orderAuthorized:false
 });
}
function mount(doc=document,fetcher=fetch){
 const bridgeBtn=doc.getElementById("okx-local-bridge-check");
 const bridgeOut=doc.getElementById("okx-local-bridge-status");
 if(bridgeBtn&&bridgeOut){
  bridgeBtn.addEventListener("click",async()=>{
   if(bridgeBtn.disabled)return;
   const asset=String(doc.getElementById("okx-local-asset")?.value||"EDGE")
    .trim().toUpperCase();
   bridgeBtn.disabled=true;bridgeOut.textContent="Recherche marché local en lecture seule…";
   try{
    const result=await probeLocalMarket({asset});
    bridgeOut.textContent=result.asset+" : "+
     (result.candles?"bougies "+result.candles.instrument:"pas de bougies OKX confirmées")+
     " · "+(result.book?"carnet "+result.book.instrument:"pas de carnet OKX confirmé")+
     ". Source marché uniquement : aucun instrument du compte ni devise de règlement authentifiés.";
   }catch(error){
    bridgeOut.textContent="Bridge local non confirmé : "+
      String(error?.message||"indisponible")+
      ". Aucun accès au compte démontré.";
   }finally{bridgeBtn.disabled=false;}
  });
 }
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
    " avec ancien carnet public · "+c.officialAnnounced+" paires à annonce officielle revue · "+
    c.catalogOKX+" cotations OKX dans le catalogue du "+
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
return Object.freeze({buildUniverse,mount,probeLocalMarket,PATHS});
});