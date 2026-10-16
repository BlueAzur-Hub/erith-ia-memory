/* ERITH · Radar — native Market presentation; delegates validation to radar.js.
 * No iframe, no shadow DOM, no private API, no new Market/graph owner.
 * Style comes from the parent Administrator/Trader stylesheet.
 */
(function(global){
"use strict";
const existing=global.AgentCryptoRadarNative;
if(existing)return;
const DAY=86400000;
const fmt=new Intl.NumberFormat("fr-FR",{maximumFractionDigits:2});
const number=(v,d=2)=>typeof v==="number"&&Number.isFinite(v)?
  new Intl.NumberFormat("fr-FR",{maximumFractionDigits:d}).format(v):"—";
const displayPrice=v=>typeof v!=="number"||!Number.isFinite(v)||v<=0?"—":number(v,v>=100?2:v>=1?4:v>=.01?6:10);
const pct=v=>typeof v!=="number"||!Number.isFinite(v)?"—":(v>0?"+":"")+v.toFixed(2)+" %";
const safeDate=v=>{if(!v)return"—";const d=new Date(v);return Number.isNaN(d.getTime())?"—":d.toLocaleString("fr-FR");};
const compactMoney=v=>typeof v==="number"&&Number.isFinite(v)&&v>=0?
  new Intl.NumberFormat("fr-FR",{style:"currency",currency:"USD",notation:"compact",maximumFractionDigits:2}).format(v):"—";
const lookup=(root,id)=>root.querySelector('[data-radar-native="'+id+'"]');
const node=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;};
function cell(row,txt,cls){const td=node("td",cls||"",txt);row.appendChild(td);return td;}
async function get(url){
 const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),11000);
 try{const r=await fetch(new URL(url,document.baseURI),{credentials:"omit",cache:"no-store",signal:ctrl.signal});
  if(!r.ok)throw Error("HTTP "+r.status);return await r.json();
 }finally{clearTimeout(timer);}
}
// Selection is delegated to the existing owners. A click NEVER clears an
// existing chart pre-emptively; a supported destination is checked first.
async function selectGraph(root,model,identity){
 if(!identity?.id||!identity?.symbol)return false;
 const revision=++model.selectionRevision;
 const status=lookup(root,"status");
 const setStatus=msg=>{if(revision===model.selectionRevision&&status)status.textContent=msg;};
 setStatus("Graphique · "+identity.symbol+" · vérification de la source…");
 try{
  if(identity.kind==="market"){
   const commands=global.AgentCryptoCommands;
   if(typeof commands?.asset!=="function"||typeof commands?.chart!=="function")
     throw Error("contrôleur graphique Market indisponible");
   const found=commands.asset(identity.id);
   if(found?.ok!==true||found?.payload?.id!==identity.id)
     throw Error("actif absent du Market Core chargé ; graphique inchangé");
   if(revision!==model.selectionRevision)return false;
   // External CT intent must be released BEFORE the canonical chart renders;
   // otherwise the V7 recovery guard can replace BTC with a waiting CT label.
   global.atlasTraderExternalSelectionClear?.();
   global.AgentCryptoNewListingsNativeCategory?.deactivate?.({clearChart:false});
   const result=commands.chart(identity.id,"24h");
   if(result?.ok!==true||result?.payload?.selected_asset?.id!==identity.id)
     throw Error("affichage Solo refusé par le contrôleur Market");
  }else if(identity.kind==="listing"){
   const category=global.AgentCryptoNewListingsNativeCategory;
   if(typeof category?.selectById!=="function")throw Error("contrôleur des nouveaux listings absent");
   let ok=await category.selectById(identity.id);
   if(!ok&&identity.symbol!=="CT"&&typeof category.discover==="function"){
     await category.discover();
     if(revision!==model.selectionRevision)return false;
     ok=await category.selectById(identity.id);
   }
   if(revision!==model.selectionRevision)return false;
   if(!ok)throw Error("bougies de la paire non validées ; graphique précédent conservé");
   if(identity.symbol==="CT"){
     global.atlasTraderExternalSelectionCommit?.({
       id:"concrete",provider:"okx",providerSymbol:"CT-USDT",presentation:"line"
     });
   }else{
     global.atlasTraderExternalSelectionClear?.();
   }
  }else throw Error("source non reconnue : graphique inchangé");
  if(revision!==model.selectionRevision)return false;
  setStatus(identity.symbol+" · sélection transmise au graphique Solo existant · aucun ordre");
  return true;
 }catch(error){
  setStatus(identity.symbol+" · "+String(error?.message||error));
  return false;
 }
}
function clickable(row,identity,root,model){
 row.classList.add("radar-native-selectable");
 row.tabIndex=0;row.setAttribute("role","button");
 row.setAttribute("aria-label","Afficher le graphique Solo de "+identity.symbol);
 row.title="Afficher "+identity.symbol+" dans le Graphique (sans vider la mémoire)";
 const activate=event=>{
   if(event.type==="keydown"&&!["Enter"," "].includes(event.key))return;
   if(event.type==="keydown")event.preventDefault();
   void selectGraph(root,model,identity);
 };
 row.addEventListener("click",activate);
 row.addEventListener("keydown",activate);
}
function build(root){
 root.replaceChildren();
 root.classList.add("radar-native");
 const header=node("div","radar-native-head");
 const intro=node("div","");
 intro.append(node("p","eyebrow","RADAR · SURVEILLANCE PUBLIQUE"),node("h3","","Marchés et opportunités PAPER"));
 const commands=node("div","radar-native-actions");
 const refresh=node("button","btn small","Actualiser");
 refresh.type="button";refresh.dataset.radarNative="refresh";
 const large=node("a","","Agrandir ↗");
 large.href=new URL("../laboratoire/radar.html",document.baseURI).href;
 large.target="_blank";large.rel="noopener noreferrer";
 commands.append(refresh,large);header.append(intro,commands);root.append(header);
 const status=node("p","table-note","Radar non encore chargé");status.dataset.radarNative="status";status.setAttribute("role","status");root.append(status);
 const dock=node("div","radar-native-dock");
 dock.setAttribute("aria-label","Périmètre Radar par capitalisation");
 const group=node("div","market-universe-mode","");
 for(const tier of [10,20,50,250]){
  const b=node("button","","Top "+tier);b.type="button";b.dataset.tier=String(tier);b.setAttribute("aria-pressed",String(tier===10));b.classList.toggle("is-active",tier===10);group.append(b);
 }
 const filter=node("input","","");filter.type="search";filter.placeholder="Chercher une crypto";filter.dataset.radarNative="filter";filter.setAttribute("aria-label","Filtrer les cryptomonnaies du Radar");
 const sort=node("select","","");sort.dataset.radarNative="sort";sort.setAttribute("aria-label","Trier le Radar");
 for(const [value,label] of [["rank","Rang"],["change24h","Hausses 24h"],["drop24h","Baisses 24h"],["volume24hUsd","Volume 24h"]]){
  const option=node("option","",label);option.value=value;sort.append(option);
 }
 dock.append(group,filter,sort);root.append(dock);
 const subtitle=node("p","table-note","Top 10 · CoinGecko · pas de recommandation d'achat");subtitle.dataset.radarNative="marketNote";root.append(subtitle);
 const wrap=node("div","table-wrap radar-native-table");const table=node("table");
 const thead=node("thead"),tr=node("tr");
 for(const t of ["Rang","Crypto","Prix USD","24h","7j","Volume 24h"]){tr.append(node("th","",t));}
 thead.append(tr);table.append(thead);
 const tbody=node("tbody");tbody.dataset.radarNative="rows";table.append(tbody);wrap.append(table);root.append(wrap);
 const bottom=node("div","radar-native-bottom");
 const listings=node("section","radar-native-block");
 listings.append(node("h3","","Nouveaux listings · Spot"));
 const proof=node("p","table-note","En attente des sources Bitget");proof.dataset.radarNative="listingProof";listings.append(proof);
 const ltableWrap=node("div","table-wrap");const ltable=node("table");const lhead=node("thead"),ltr=node("tr");
 for(const t of ["Actif","Paire","Âge","Cours coté","24h","Identité"]){ltr.append(node("th","",t));}
 lhead.append(ltr);ltable.append(lhead);
 const lb=node("tbody");lb.dataset.radarNative="listings";ltable.append(lb);ltableWrap.append(ltable);listings.append(ltableWrap);
 const watching=node("section","radar-native-block");watching.append(node("h3","","Veille PAPER · BTC / CT / MHA"));
 const cards=node("div","radar-native-cards");cards.dataset.radarNative="watch";watching.append(cards);
 const journal=node("p","table-note","Observateur GitHub indépendant · données non encore chargées");journal.dataset.radarNative="journal";watching.append(journal);
 bottom.append(listings,watching);root.append(bottom);
 const foot=node("p","table-note","Lecture seule · aucun ordre OKX · USDT n'est pas automatiquement USDC · Radar20 de recherche inchangé");
 root.append(foot);
 return {filter,sort,tbody,lb,refresh,group};
}
function printMarket(root,model){
 const api=global.AgentCryptoRadarReader;
 const body=lookup(root,"rows");body.replaceChildren();
 if(!model.market){const r=node("tr");cell(r,"Top 250 indisponible · aucune cotation inventée");body.append(r);return;}
 const rows=api.selectMarket(model.market.rows,model.tier,lookup(root,"filter").value,lookup(root,"sort").value);
 for(const asset of rows){
  const r=node("tr","asset-row");
  cell(r,String(asset.rank));cell(r,asset.name+" · "+asset.symbol);
  cell(r,displayPrice(asset.priceUsd)+" $US");
  const a=cell(r,pct(asset.change24h));a.className=asset.change24h>0?"pos":asset.change24h<0?"neg":"";
  const b=cell(r,pct(asset.change7d));b.className=asset.change7d>0?"pos":asset.change7d<0?"neg":"";
  cell(r,compactMoney(asset.volume24hUsd));clickable(r,{kind:"market",id:asset.id,symbol:asset.symbol},root,model);body.append(r);
 }
 if(!rows.length){const r=node("tr");cell(r,"Aucun résultat pour ce filtre");body.append(r);}
 lookup(root,"marketNote").textContent=rows.length+" actifs · Top "+model.tier+" par capitalisation · CoinGecko "+safeDate(model.market.at)+" · lecture seule";
 for(const b of model.group.querySelectorAll("[data-tier]")){const active=Number(b.dataset.tier)===model.tier;b.classList.toggle("is-active",active);b.setAttribute("aria-pressed",String(active));}
}
function printListings(root,model){
 const body=lookup(root,"listings");body.replaceChildren();
 const candidates=model.listings.filter(x=>x.symbol!=="CT");
 const listedCt=model.listings.find(x=>x.symbol==="CT");
 if(model.paper?.CT?.price)candidates.unshift({name:"Concrete",symbol:"CT",pair:"CT/USDT",venue:"OKX Spot",
  ageDays:listedCt?.ageDays??null,price:model.paper.CT.price,quote:"USDT",change24h:listedCt?.change24h??null,status:listedCt?"OKX PAPER + Bitget Spot · date Bitget":"OKX PAPER · date non prouvée"});
 else if(listedCt)candidates.unshift(listedCt);
 if(!candidates.length){const r=node("tr");cell(r,model.listingError||"Aucun listing public vérifié");body.append(r);}
 for(const item of candidates){
  const r=node("tr","asset-row");cell(r,item.name+" · "+item.symbol);
  cell(r,item.pair+" · "+item.venue);cell(r,item.ageDays===null?"—":number(item.ageDays,1)+" j");
  cell(r,displayPrice(item.price)+" "+item.quote);
  const move=cell(r,pct(item.change24h));move.className=item.change24h>0?"pos":item.change24h<0?"neg":"";
  cell(r,item.status);clickable(r,{kind:"listing",id:item.symbol==="CT"?"concrete":item.symbol,symbol:item.symbol},root,model);body.append(r);
 }
 lookup(root,"listingProof").textContent=model.listingError||model.listings.length+
  " paires Spot Bitget récentes · "+model.listings.filter(v=>v.identityProved).length+" identités prouvées · CT via journal OKX";
}
function printWatch(root,model){
 const dest=lookup(root,"watch");dest.replaceChildren();
 const paper=model.paper,mha=model.listings.find(x=>x.symbol==="MHA");
 for(const v of [
  {name:"BTC · Bitcoin",market:"Binance Spot",data:paper?.BTC,quote:"USDT"},
  {name:"CT · Concrete",market:"OKX Spot",data:paper?.CT,quote:"USDT"},
  {name:"MHA · MAGNE.AI",market:"Bitget Spot",data:{price:mha?.price,decision:mha?"OBSERVATION":"SOURCE ABSENTE"},quote:mha?.quote||"USDT"}
 ]){
  const card=node("div","radar-native-card");
  card.append(node("small","",v.name),node("strong","",displayPrice(v.data?.price)+" "+v.quote),
    node("span","",v.market+" · "+(v.data?.decision||"INDISPONIBLE")));
  clickable(card,{kind:v.name.startsWith("BTC")?"market":"listing",id:v.name.startsWith("BTC")?"bitcoin":v.name.startsWith("CT")?"concrete":"MHA",symbol:v.name.split(" · ")[0]},root,model);
  dest.append(card);
 }
 lookup(root,"journal").textContent=paper?
   "PAPER · BTC : "+paper.BTC.decision+" · CT : "+paper.CT.decision+
    · "+(paper.BTC.closed+paper.CT.closed)+" positions PAPER terminées · source BTC "+safeDate(paper.BTC.sourceTime)+" / CT "+safeDate(paper.CT.sourceTime):
   "Journal PAPER inaccessible · aucun signal supposé";
}
async function identityRegistry(){
 const local="./data/new-listings-identities.json";
 try{return await get(local);}
 catch(_){
  // Data folder may be excluded from the lightweight Pages artifact. The
  // canonical PUBLIC file is GitHub RAW; no identity is inferred on failure.
  return get("https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/main/public/agent_crypto_erith_ia/administrator/data/new-listings-identities.json");
 }
}
async function refresh(root,model){
 if(model.loading)return;
 model.loading=true;
 lookup(root,"refresh").disabled=true;
 lookup(root,"status").textContent="Radar · lecture du classement et du journal…";
 const api=global.AgentCryptoRadarReader;
 // Start Bitget early, but never make the Top 250 wait for its two endpoints.
 const marketPromise=get("../data/crypto/latest.json");
 const paperPromise=get("../data/trader_flux/btc_ct_auto_paper/state.json");
 const registryPromise=identityRegistry();
 const instrumentsPromise=get("https://api.bitget.com/api/v3/market/instruments?category=SPOT");
 const tickersPromise=get("https://api.bitget.com/api/v3/market/tickers?category=SPOT");
 const issues=[];
 try{
  const first=await Promise.allSettled([marketPromise,paperPromise,registryPromise]);
  try{
   if(first[0].status!=="fulfilled")throw Error("archive indisponible");
   model.market=api.validMarket(first[0].value);
  }catch(e){model.market=null;issues.push("Top 250 : "+e.message);}
  try{
   if(first[1].status!=="fulfilled")throw Error("journal indisponible");
   model.paper=api.verifyPaper(first[1].value);
  }catch(e){model.paper=null;issues.push("PAPER : "+e.message);}
  let registry=new Map();
  try{
   if(first[2].status!=="fulfilled")throw Error("publication locale et GitHub RAW indisponibles");
   registry=api.verifyRegistry(first[2].value);
  }catch(e){issues.push("Registre identités : "+e.message);}
  model.listings=[];model.listingError="";
  printMarket(root,model);
  printWatch(root,model);
  printListings(root,model);
  lookup(root,"status").textContent="Radar · classement et PAPER chargés · découverte Spot Bitget en cours…"+
   (issues.length?" · "+issues.join(" · "):"");
  const live=await Promise.allSettled([instrumentsPromise,tickersPromise]);
  try{
   if(live[0].status!=="fulfilled"||live[1].status!=="fulfilled")
     throw Error("API Spot Bitget indisponible");
   model.listings=api.verifyBitget(live[0].value,live[1].value,registry,Date.now());
  }catch(e){model.listingError="Nouveaux listings : "+e.message;issues.push(model.listingError);}
  printListings(root,model);
  printWatch(root,model);
  lookup(root,"status").textContent=issues.length?"Radar partiel · "+issues.join(" · "):
   "Radar · Top 250 / nouveaux listings Spot / PAPER BTC et CT · sélection Solo disponible";
 }catch(e){
  lookup(root,"status").textContent="Radar indisponible : "+String(e?.message||e);
 }finally{
  model.loading=false;
  lookup(root,"refresh").disabled=false;
 }
}
function mount(root){
 if(!root)return false;
 if(root.dataset.radarNativeMounted==="1"){return true;}
 if(!global.AgentCryptoRadarReader)throw Error("Le lecteur public Radar est indisponible");
 root.dataset.radarNativeMounted="1";
 const controls=build(root);
 const model={tier:10,market:null,paper:null,listings:[],listingError:null,group:controls.group,loading:false,selectionRevision:0};
 controls.group.addEventListener("click",e=>{
  const b=e.target.closest("[data-tier]");if(!b)return;
  model.tier=Number(b.dataset.tier);printMarket(root,model);
 });
 controls.filter.addEventListener("input",()=>printMarket(root,model));
 controls.sort.addEventListener("change",()=>printMarket(root,model));
 controls.refresh.addEventListener("click",()=>void refresh(root,model));
 void refresh(root,model);
 return true;
}
global.AgentCryptoRadarNative=Object.freeze({mount});
})(typeof globalThis!=="undefined"?globalThis:this);
