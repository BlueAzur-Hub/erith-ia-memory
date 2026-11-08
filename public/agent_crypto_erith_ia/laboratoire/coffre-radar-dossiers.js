/* Seven Heaven · Current Radar research dossiers → historical Coffre.
   Canonical IDs only. No trading API, execution, synthetic values or archive duplication. */
((root,factory)=>{
  const api=factory();
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(root)root.SevenRadarCoffreDossiers=api;
})(typeof globalThis!=="undefined"?globalThis:null,()=>{
"use strict";
const ROOT="https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/main/public/agent_crypto_erith_ia/";
const SOURCES=Object.freeze({
 cohort:"data/crypto/radar-opportunities/research-cohort.json",
 identity:"data/crypto/radar-opportunities/spot-identity-latest.json",
 qualification:"data/crypto/radar-opportunities/qualification-latest.json",
 daily:"data/historical_archive_prototype/top250_multiresolution_sources/index.json",
 minute:"data/historical_archive_prototype/top250_multisource_coverage/index.json",
 knowledge:"data/crypto/research/asset-knowledge.json",
 curated:"data/crypto/research/radar-curated-dossiers.json"
});
const OPTIONAL=Object.freeze({
  marketTop:"data/crypto/latest.json",
  marketExtended:"data/crypto/extended.json",
  okxScreens:"data/crypto/research/okx-spot-screen-candidates.json"
});
const truth=x=>x===true;
const n=x=>Number.isInteger(x)&&x>=0?x:0;
function assert(v,m){if(!v)throw Error("Provenance invalide : "+m);}
function reconcile(inputs){
 const {cohort,identity,qualification,daily,minute,knowledge,curated}=inputs||{};
 assert(cohort?.schema==="erith.radar.research-cohort.v1"&&
   cohort.orders_enabled===false&&cohort.strategy_certified===false&&
   Array.isArray(cohort.candidates)&&cohort.count===cohort.candidates.length&&cohort.count>0&&cohort.count<=100,
   "cohorte Radar");
 assert(identity?.schema==="erith.radar.spot-identity-prospective.v1"&&
   identity.orders_enabled===false&&identity.paper_orders===0&&identity.real_orders===0&&
   Array.isArray(identity.candidates),"preuves Spot");
 assert(qualification?.schema==="erith.radar.spot-qualification.v1"&&
   qualification.real_orders_enabled===false&&qualification.actual_execution_permissions===false&&
   Array.isArray(qualification.candidates),"qualification Spot");
 assert(daily?.schema==="aerith.public.crypto.multiresolution-sources.v1"&&Array.isArray(daily.assets),
   "archives journalières");
 assert(minute?.schema==="aerith.public.ohlcv.top250.federated-native-archives.v1"&&Array.isArray(minute.assets),
   "archives minute");
 assert(knowledge?.schema==="erith.crypto.asset-research-knowledge.v1"&&Array.isArray(knowledge.candidates),
   "dossiers documentaires");
 assert(curated?.schema==="erith.crypto.radar-curated-dossiers.v1" &&
   curated.no_order_execution===true && curated.no_performance_claim===true &&
   Array.isArray(curated.records),"registre des études primaires");
 const unique=(items,key,label)=>{
   const map=new Map();
   for(const x of items){
     const id=x?.[key];
     assert(typeof id==="string"&&id.length>0&&!map.has(id),label+" identifiant dupliqué ou absent");
     map.set(id,x);
   }
   return map;
 };
 const evidences=unique(identity.candidates,"coin_id","Spot");
 const quals=unique(qualification.candidates,"id","qualification");
 const dailyBy=unique(daily.assets,"id","quotidien");
 const minuteBy=unique(minute.assets,"id","minute");
 const knowledgeBy=unique(knowledge.candidates,"coin_id","connaissances");
 const curatedBy=unique(curated.records,"coin_id","étude dédiée");
 const ids=new Set();
 const dossiers=cohort.candidates.map(c=>{
   const id=c?.coin_id;
   assert(typeof id==="string"&&id.length>0&&!ids.has(id)&&c.trade_authorized===false,
     "id Radar ou droits d'exécution");
   ids.add(id);
   const proof=evidences.get(id),qual=quals.get(id);
   const day=dailyBy.get(id),min=minuteBy.get(id),known=knowledgeBy.get(id),study=curatedBy.get(id);
   if(study)assert(study.paper_ready===false&&study.adoption_proven===false&&
    typeof study.page==="string"&&/^cas-ecole-[a-z0-9-]+\.(html|md)$/.test(study.page)&&
    (study.render==="site"||study.render==="github"),"chemin ou statut d'étude");
   const dailyCandles=n(day?.native_candles),minuteCandles=n(min?.native_1m_count);
   const spot=c.spot&&typeof c.spot.pair==="string"?c.spot:null;
   const matched=truth(proof?.identity_proven) && !!spot &&
     proof.coin_id===id && proof.pair===spot.pair &&
     proof.venue===spot.venue && proof.quote===spot.quote &&
     typeof proof.contract_address==="string"&&proof.contract_address.length>5;
   const blockers=[];
   if(!known&&!study)blockers.push("Dossier de connaissance à constituer : projet, usage réel et source primaire");
   if(study)blockers.push("Adoption et usage réel indépendants non certifiés par cette étude");
   if(!spot)blockers.push("Aucune paire Spot documentée dans la cohorte");
   if(!matched)blockers.push("Identité contrat + place non rapprochée sur cette observation");
   if(!dailyCandles&&!minuteCandles)blockers.push("Aucune série native dans les deux catalogues contrôlés");
   if(spot)blockers.push("Horodatage du carnet, profondeur, frais et accès au compte à confirmer");
   blockers.push("Compatibilité devise, période, source et moteur PAPER non démontrée");
   return Object.freeze({
     id,name:String(c.name||c.symbol||id),symbol:String(c.symbol||id),
     category:/tokenized|bstocks|xstocks|etf/i.test(c.name||"")
      ?"Produit tokenisé (selon intitulé Radar)"
      :known?.category_research||study?.category||"Fiche de marché · étude fondamentale à compléter",
     projectRole:typeof known?.claimed_function==="string"?known.claimed_function:null,
     projectSource:typeof known?.primary_project_source==="string"&&
      /^https:\/\//.test(known.primary_project_source)?known.primary_project_source:null,
     detections:n(c.detections_archived),j1:n(c.j1_observed),j7:n(c.j7_observed),
     hasKnowledge:!!known||!!study,
     studyUrl:study?(study.render==="site"?"./"+study.page:
      "https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/"+study.page):null,
     spot:spot?{venue:spot.venue,pair:spot.pair,quote:spot.quote}:null,
     contractMatched:matched,
     identityStatus:matched?"Contrat / paire rapprochés à la collecte":"Identité complète non établie",
     chain:matched?proof.platform:null,
     contract:matched?proof.contract_address:null,
     dailyCandles,minuteCandles,
     dailyMarket:dailyCandles?day.market:null,
     dailyQuote:dailyCandles?day.quote:null,
     dailySource:dailyCandles?day.venue:null,
     dailyRelease:dailyCandles&&/^https:\/\/github\.com\/BlueAzur-Hub\/erith-ia-memory\/releases\//.test(day.release_url||"")?day.release_url:null,
     minuteQuote:minuteCandles?min.quote:null,
     minuteSource:minuteCandles?min.source:null,
     blockers,
     paperAllowed:false,
     // Historical series != time-consistent, costed OHLCV input to V5 or native OKX L2 for V6.
     paperReason:"Recherche uniquement ; conditions d'entrée et de simulation V5/V6 non prouvées",
     qualifiedAt:qual?.status||"Qualification non relevée"
   });
 });
 const counts=Object.freeze({
   total:dossiers.length,
   documented:dossiers.filter(x=>x.hasKnowledge).length,
   needsKnowledge:dossiers.filter(x=>!x.hasKnowledge).length,
   spot:dossiers.filter(x=>!!x.spot).length,
   matched:dossiers.filter(x=>x.contractMatched).length,
   daily:dossiers.filter(x=>x.dailyCandles>0).length,
   minute:dossiers.filter(x=>x.minuteCandles>0).length,
   paperReady:0
 });
 return Object.freeze({dossiers:Object.freeze(dossiers),counts,sourceDate:cohort.source_observation_date_utc,
   sourceQualification:cohort.source_qualification_at_utc});
}

/* All Market joins use the exact CoinGecko ID, never a rank or ticker alone.
   These sources are optional; missing snapshots must not erase the Radar dossiers. */
function enrichSources(base,{qualification,marketTop=null,marketExtended=null,okxScreens=null}={}){
 const index=(records,key,label)=>{
  const found=new Map();
  for(const record of records){
   const id=record?.[key];assert(typeof id==="string"&&id&&!found.has(id),
     label+" : identifiant absent/dupliqué");
   found.set(id,record);
  }
  return found;
 };
 if(marketTop!==null)assert(marketTop?.schema==="agent_crypto_public_market_snapshot_v1"&&
    marketTop.assets_count===250&&marketTop.coins?.length===250,"Market Top 250");
 if(marketExtended!==null)assert(marketExtended?.schema==="agent_crypto_public_extended_market_snapshot_v1"&&
    marketExtended.assets_count===750&&marketExtended.coins?.length===750,"Market étendu");
 if(okxScreens!==null)assert(okxScreens?.schema==="erith.crypto.okx-spot-user-screen-candidates.v1"&&
    okxScreens.account_instruments_verified===false&&Array.isArray(okxScreens.items),"Captures OKX");
 const top=index(marketTop?.coins||[],"id","Top 250");
 const ext=index(marketExtended?.coins||[],"id","251–1000");
 const qual=index(qualification?.candidates||[],"id","qualification Spot");
 for(const id of top.keys())assert(!ext.has(id),"ID Market dupliqué");
 const dossiers=base.dossiers.map(d=>{
  const coin=top.get(d.id)||ext.get(d.id)||null;
  const conflict=!!coin&&String(coin.symbol).toUpperCase()!==d.symbol.toUpperCase();
  const market=coin&&!conflict?Object.freeze({
    rank:coin.rank,tier:top.has(d.id)?"Top 250":"251–1 000",
    priceUsd:Number.isFinite(coin.priceUsd)&&coin.priceUsd>0?coin.priceUsd:null,
    observedAt:coin.lastUpdated||null,
    catalogAt:(top.has(d.id)?marketTop:marketExtended)?.generated_at||null,
    source:top.has(d.id)?OPTIONAL.marketTop:OPTIONAL.marketExtended,
    // Visual image from the same exact-ID Market row; not evidence of trading rights.
    image:(()=>{try{
      const u=new URL(String(coin.image||""));
      return u.protocol==="https:"&&u.hostname==="coin-images.coingecko.com"&&
        u.pathname.startsWith("/coins/images/")?u.href:null;
    }catch(_){return null;}})()
  }):null;
  const ox=qual.get(d.id)?.okx_spot;
  const okxPair=ox?.pair_observed===true&&ox.venue==="OKX"&&typeof ox.pair==="string"?ox.pair:null;
  if(okxPair)assert(ox.account_access_proven===false&&ox.contract_identity_proven===false&&
    ox.real_orders_enabled===false,"OKX non autorisé");
  const screenshotTickers=okxScreens===null?null:
    okxScreens.items.filter(x=>String(x.instId).split("-")[0]===d.symbol).map(x=>x.instId);
  return Object.freeze({...d,market,marketConflict:conflict,okxPair,screenshotTickers,
    blockers:Object.freeze([...d.blockers,...(conflict?["Conflit ticker Market / ID Radar"]:[]),
      okxPair?"OKX : droit de négocier non prouvé":"OKX : aucune paire qualifiée pour cet ID"])});
 });
 const counts=Object.freeze({...base.counts,
  market:dossiers.filter(x=>x.market).length,
  top:dossiers.filter(x=>x.market?.tier==="Top 250").length,
  extended:dossiers.filter(x=>x.market?.tier==="251–1 000").length,
  okx:dossiers.filter(x=>x.okxPair).length,
  screenMatches:okxScreens===null?null:dossiers.filter(x=>x.screenshotTickers.length).length,
  screens:okxScreens?.items.length??null
 });
 return Object.freeze({...base,dossiers:Object.freeze(dossiers),counts,
  marketComplete:marketTop!==null&&marketExtended!==null});
}
const make=(tag,cls,text)=>{
 const e=document.createElement(tag);
 if(cls)e.className=cls;
 if(text!==undefined)e.textContent=String(text);
 return e;
};
function line(parent,label,value){
 const p=make("p");p.append(make("strong","",label+" : "),make("span","",value));parent.append(p);
}
function link(parent,path,label){
 const a=make("a","",label);a.href=path;a.target="_blank";a.rel="noopener noreferrer";parent.append(a);
}
function mount(doc=document,fetcher=fetch){
 const details=doc.getElementById("coffre-radar-details");
 if(!details)return null;
 const status=doc.getElementById("coffre-radar-status");
 const box=doc.getElementById("coffre-radar-items");
 const filter=doc.getElementById("coffre-radar-filter");
 const search=doc.getElementById("coffre-radar-search");
 const reload=doc.getElementById("coffre-radar-reload");
 let current=null,pending=false;
 function render(){
   if(!current)return;
   const term=search.value.trim().toLocaleLowerCase("fr"),mode=filter.value;
   const list=current.dossiers.filter(x=>
     (!term||[x.name,x.symbol,x.id,x.spot?.pair].join(" ").toLocaleLowerCase("fr").includes(term))&&
     (mode==="all"||
      (mode==="missing"&&!x.hasKnowledge)||
      (mode==="identity"&&x.contractMatched)||
      (mode==="spot"&&!!x.spot)||
      (mode==="history"&&(x.dailyCandles>0||x.minuteCandles>0))||
      (mode==="market"&&!!x.market)||
      (mode==="okx"&&!!x.okxPair)));
   box.replaceChildren();
   if(!list.length){box.append(make("p","muted","Aucun dossier avec ces filtres."));return;}
   for(const d of list){
     const card=make("details","item collapsible"),head=make("summary","head");
     const identity=make("strong","",d.symbol+" · "+d.name);
     identity.dataset.coinId=d.id;identity.dataset.coinSymbol=d.symbol;identity.dataset.coinName=d.name;
     identity.dataset.coinImage=d.market?.image||"";
     head.append(identity,
       make("small","pill",d.hasKnowledge?"Dossier connu":"Dossier Radar à enrichir"));
     card.append(head);
     const id=make("p","muted","ID CoinGecko : "+d.id+" · "+d.category);
     card.append(id);
     if(d.projectRole)line(card,"Projet · utilité déclarée",d.projectRole);
     if(d.projectSource){
      const source=make("p");link(source,d.projectSource,"Documentation du projet ↗");
      card.append(source);
     }
     if(d.studyUrl){const p=make("p");link(p,d.studyUrl,"Lire l’étude documentaire et ses sources ↗");card.append(p);}
     line(card,"Observations","Détections "+d.detections+" · J+1 "+d.j1+" · J+7 "+d.j7);
     line(card,"Market CoinGecko (USD daté)",d.market?
       d.market.tier+" · rang "+d.market.rank+" · "+
       (d.market.priceUsd===null?"prix non observé":
        new Intl.NumberFormat("fr-FR",{maximumSignificantDigits:8}).format(d.market.priceUsd)+" USD")+
       " · relevé "+(d.market.observedAt||"inconnu")+
       " · publication "+(d.market.catalogAt||"inconnue"):
       d.marketConflict?"Conflit d'identité entre ID et ticker":
       "Aucune correspondance dans les catalogues Market chargés");
     if(d.market){const p=make("p");link(p,
       "https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/"+d.market.source,
       "Source Market versionnée ↗");card.append(p);}
     line(card,"OKX Spot · qualification publique",d.okxPair?
       d.okxPair+" · observation historique, aucun droit de négocier prouvé":
       "Aucune paire rapprochée dans la qualification");
     line(card,"Captures OKX du 8 novembre",d.screenshotTickers===null?
       "Inventaire non chargé":d.screenshotTickers.length?
       "Ticker observé "+d.screenshotTickers.join(", ")+" ; identité non prouvée":
       "Aucune correspondance de ticker dans ces captures");
     line(card,"Spot historique",d.spot?d.spot.venue+" · "+d.spot.pair+" ("+d.spot.quote+")":"Paire non documentée");
     line(card,"Identité",d.identityStatus+(d.contract?" · "+d.chain+" · "+d.contract:""));
     line(card,"Coffre 1 jour",d.dailyCandles?d.dailyCandles+" bougies natives · "+d.dailySource+" · "+d.dailyMarket+" ("+d.dailyQuote+")":"Non présent dans le catalogue 1j consulté");
     line(card,"Coffre 1 minute",d.minuteCandles?d.minuteCandles+" bougies natives · "+d.minuteSource+" ("+d.minuteQuote+")":"Non présent dans le catalogue 1m consulté");
     if(d.dailyRelease)link(card,d.dailyRelease,"Archive source 1j ↗");
     const info=make("p","muted");
     link(info,"https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/"+SOURCES.identity,"Contrats et décisions Spot ↗");
     info.append(make("span",""," · "));
     link(info,"https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/"+SOURCES.qualification,"Qualification marché ↗");
     card.append(info);
     const ul=make("ul");
     for(const b of d.blockers){const li=make("li","",b);ul.append(li);}
     const further=make("details",""), summary=make("summary","","Preuves à approfondir ("+d.blockers.length+")");
     further.append(summary,ul);card.append(further);
     line(card,"V5 / V6",d.paperReason);

     box.append(card);
   }
 }
 async function load(){
   if(pending)return;
   pending=true;reload.disabled=true;status.textContent="Lecture des catalogues Radar, Market et des captures OKX…";
   const ctl=new AbortController(),timeout=setTimeout(()=>ctl.abort(),18000);
   try{
     const entries=await Promise.all(Object.entries(SOURCES).map(async ([key,path])=>{
       const r=await fetcher(ROOT+path,{cache:"no-store",credentials:"omit",signal:ctl.signal});
       if(!r.ok)throw Error(key+" HTTP "+r.status);
       return [key,await r.json()];
     }));
     const extras=await Promise.all(Object.entries(OPTIONAL).map(async([key,path])=>{
       try{const r=await fetcher(ROOT+path,{cache:"no-store",credentials:"omit",signal:ctl.signal});
        if(!r.ok)throw Error("HTTP "+r.status);return [key,await r.json()];}
       catch(_){return [key,null];}
     }));
     const canonical=Object.fromEntries(entries);
     current=enrichSources(reconcile(canonical),{...canonical,...Object.fromEntries(extras)});
     const c=current.counts;
     status.textContent="Cohorte "+current.sourceDate+" UTC · "+c.total+" dossiers · "+
       c.market+"/"+c.total+" identifiants Market ("+c.top+" Top 250, "+c.extended+" Top 251–1 000) · "+
       c.okx+" observations OKX publiques (droits par paire non interrogés depuis cette page) · "+
       (c.screenMatches===null?"captures OKX non chargées":
        c.screenMatches+" ticker(s) commun(s) aux "+c.screens+" paires relevées sur les captures OKX, identité à confirmer")+
       " · "+c.documented+" dossiers connus · "+c.needsKnowledge+" à enrichir · "+
       c.matched+" contrats rapprochés · "+c.spot+" Spot historiques · "+
       c.daily+" archives 1j · "+c.minute+" archives 1m · "+
       "0 PAPER V5/V6 autorisé. "+
       (!current.marketComplete?"Market partiel ou inaccessible : absences non concluantes.":"");
     render();
   }catch(e){
     current=null;box.replaceChildren();
     box.append(make("p","error","Aucun dossier reconstruit : "+e.message));
     status.textContent="Impossible de réconcilier les catalogues : "+e.message+
       ". Les anciennes preuves ne sont pas présentées comme actuelles.";
   }finally{
     clearTimeout(timeout);reload.disabled=false;pending=false;
   }
 }
 details.addEventListener("toggle",()=>{if(details.open&&!current)load();});
 filter.addEventListener("change",render);
 search.addEventListener("input",render);
 reload.addEventListener("click",load);
 if(details.open)void load();
 return {load,render};
}
if(typeof document!=="undefined"){
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>mount());
 else mount();
}
return Object.freeze({reconcile,enrichSources,mount,SOURCES,OPTIONAL});
});