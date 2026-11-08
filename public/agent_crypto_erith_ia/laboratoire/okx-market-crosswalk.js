/* Seven Heaven · OKX vs Market: read-only documentary identity crosswalk.
   Ranking and ticker similarity NEVER certify account access or contracts. */
((root,factory)=>{
 const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.SevenOkxMarketCrosswalk=api;
})(typeof globalThis!=="undefined"?globalThis:null,()=>{
"use strict";
const SOURCES=Object.freeze({top:"../data/crypto/latest.json",extended:"../data/crypto/extended.json"});
// Exact CoinGecko CDN domain; no ticker-based image lookup or invented image URLs.
function trustedImage(value){
 const url=String(value||"");
 return /^https:\/\/coin-images\.coingecko\.com\/coins\/images\/[^?#\s]+(?:\?[^#\s]+)?$/.test(url)?url:null;
}
function build(universe,top,extended){
 if(!Array.isArray(universe?.data))throw Error("Univers OKX absent");
 if(top?.schema!=="agent_crypto_public_market_snapshot_v1"||
  top.assets_count!==250||top.coins?.length!==250)throw Error("Top 250 invalide");
 if(extended?.schema!=="agent_crypto_public_extended_market_snapshot_v1"||
  extended.assets_count!==750||extended.coins?.length!==750)throw Error("Top 251–1000 invalide");
 const byId=new Map(),bySymbol=new Map(),overlapIds=new Set();
 const all=[...top.coins.map(c=>({coin:c,snapshot:top.generated_at})),
  ...extended.coins.map(c=>({coin:c,snapshot:extended.generated_at}))];
 for(const entry of all){
  const coin=entry.coin;
  if(!coin?.id||typeof coin.symbol!=="string")throw Error("ID Market absent");
  const before=byId.get(coin.id);
  if(before){
   if(before.coin.symbol.toUpperCase()!==coin.symbol.toUpperCase())throw Error("Conflit ID Market");
   overlapIds.add(coin.id);
  }
  if(!before||entry.snapshot>before.snapshot)byId.set(coin.id,entry);
 }
 for(const {coin} of byId.values()){
  const s=coin.symbol.toUpperCase();
  if(!bySymbol.has(s))bySymbol.set(s,[]);
  bySymbol.get(s).push(coin);
 }
 const groups=new Map();
 for(const pair of universe.data.filter(p=>p.type==="crypto_spot_candidate")){
  if(!groups.has(pair.base))groups.set(pair.base,[]);
  groups.get(pair.base).push(pair);
 }
 const assets=[...groups.entries()].map(([symbol,pairs])=>{
  const candidates=bySymbol.get(symbol)||[];
  const explicitIDs=[...new Set(pairs.map(p=>p.canonicalResearchId).filter(Boolean))];
  const explicit=explicitIDs.length===1&&byId.get(explicitIDs[0])?.coin?.symbol.toUpperCase()===symbol?
   byId.get(explicitIDs[0]).coin:null;
  const symbolCandidate=candidates.length===1?candidates[0]:null;
  const match=explicit||symbolCandidate;
  const evidence=explicit?"EXPLICIT_RESEARCH_ID":symbolCandidate?"TICKER_ONLY":
   candidates.length>1?"AMBIGUOUS_TICKER":"NOT_IN_MARKET_1000";
  const rank=Number.isInteger(match?.rank)?match.rank:null;
  return Object.freeze({
   symbol,pairs:pairs.map(p=>p.instId).sort(),
   marketId:match?.id||null,name:match?.name||null,rank,
   image:match?trustedImage(match.image):null,
   evidence,marketCandidates:candidates.map(c=>c.id),
   bookCount:pairs.filter(p=>p.hasBook).length,
   seenScreenshot:pairs.some(p=>p.hasScreenshot),
   announcedCount:pairs.filter(p=>p.hasOfficialAnnouncement).length,
   accountAccessVerified:false,contractVerified:false,orderAllowed:false
  });
 }).sort((a,b)=>(a.rank??99999)-(b.rank??99999)||a.symbol.localeCompare(b.symbol));
 if(assets.some(x=>x.accountAccessVerified||x.contractVerified||x.orderAllowed))
  throw Error("Sécurité du registre");
 const counts=Object.freeze({
  pairs:universe.data.filter(p=>p.type==="crypto_spot_candidate").length,
  assets:assets.length,
  linked:assets.filter(x=>x.marketId).length,
  explicit:assets.filter(x=>x.evidence==="EXPLICIT_RESEARCH_ID").length,
  tickerOnly:assets.filter(x=>x.evidence==="TICKER_ONLY").length,
  ambiguous:assets.filter(x=>x.evidence==="AMBIGUOUS_TICKER").length,
  unmatched:assets.filter(x=>x.evidence==="NOT_IN_MARKET_1000").length,
  top10:assets.filter(x=>x.rank!==null&&x.rank<=10).length,
  top50:assets.filter(x=>x.rank!==null&&x.rank<=50).length,
  top250:assets.filter(x=>x.rank!==null&&x.rank<=250).length,
  overlapIds:overlapIds.size,uniqueMarketIds:byId.size,authorized:0
 });
 return Object.freeze({assets,counts,
  timestamps:{top:top.generated_at,extended:extended.generated_at},
  accountInstrumentsChecked:false,noQuoteConversion:true});
}
function mount(doc=document,fetcher=fetch){
 const rows=doc.getElementById("okx-crosswalk-rows"),status=doc.getElementById("okx-crosswalk-status");
 const select=doc.getElementById("okx-crosswalk-range"),count=doc.getElementById("okx-crosswalk-count");
 if(!rows||!status||!select||!count)return null;
 let result=null;
 const cell=(tag,value)=>{const node=doc.createElement(tag);node.textContent=String(value);return node;};
 function render(){
  rows.replaceChildren();
  if(!result){count.textContent="Rapprochement indisponible.";return;}
  const range=select.value;
  const list=result.assets.filter(x=>range==="all"||
   (range==="unmatched"&&x.rank===null)||
   (x.rank!==null&&x.rank<=Number(range)));
  const wording={
   EXPLICIT_RESEARCH_ID:"ID de recherche documenté ; contrat OKX non validé",
   TICKER_ONLY:"Rapprochement candidat : ticker seul",
   AMBIGUOUS_TICKER:"Ticker ambigu, identité non tranchée",
   NOT_IN_MARKET_1000:"Absent des snapshots Top 1 000"
  };
  for(const item of list){
   const tr=doc.createElement("tr"),name=doc.createElement("th");
   name.scope="row";
   const identity=doc.createElement("div");identity.className="okx-cx-identity";
   const logo=doc.createElement("span");logo.className="okx-cx-logo";
   logo.setAttribute("aria-hidden","true");
   logo.title=item.image?"Logo illustratif CoinGecko · "+item.symbol:
    "Logo non présent dans le Market : "+item.symbol;
   function initials(){
    logo.classList.add("okx-cx-logo--fallback");
    logo.replaceChildren(doc.createTextNode(item.symbol.slice(0,2)));
   }
   if(item.image){
    const image=doc.createElement("img");
    image.alt="";image.loading="lazy";image.decoding="async";
    image.width=42;image.height=42;
    image.addEventListener("error",initials,{once:true});
    logo.appendChild(image);
    image.src=item.image;
   }else initials();
   const labels=doc.createElement("span");labels.className="okx-cx-labels";
   labels.append(cell("strong",item.symbol),cell("small",item.name||"Hors catalogue Market"));
   identity.append(logo,labels);name.append(identity);tr.append(name);
   const rank=doc.createElement("td"),rankBadge=cell("span",
    item.rank===null?"Hors Top 1000":
    "#"+item.rank+" · Top "+(item.rank<=10?"10":item.rank<=50?"50":item.rank<=250?"250":"1000"));
   rankBadge.className="okx-cx-rank"+(item.rank!==null&&item.rank<=50?" okx-cx-rank--top":"");
   rank.append(rankBadge);tr.append(rank);
   const pairs=doc.createElement("td"),tags=doc.createElement("div");
   tags.className="okx-cx-pairs";
   for(const pair of item.pairs){
    const chip=cell("span",pair);chip.className="okx-cx-pair";
    tags.append(chip);
   }
   pairs.append(tags);tr.append(pairs);
   tr.append(cell("td",wording[item.evidence]));
   tr.append(cell("td",(item.seenScreenshot?"Capture OKX · ":"")+
    item.bookCount+" carnet(s) archivé(s)"+
    (item.announcedCount?" · annonce(s) historiques":"")));
   tr.append(cell("td","Non authentifié pour le compte européen"));
   rows.append(tr);
  }
  if(!list.length){const tr=doc.createElement("tr"),td=cell("td","Aucun actif dans cette catégorie.");
   td.colSpan=6;tr.append(td);rows.append(tr);}
  count.textContent=list.length+" actifs distincts · "+result.counts.pairs+" paires OKX sources.";
 }
 select.addEventListener("change",render);
 doc.addEventListener("seven:okx-universe-loaded",async e=>{
  try{
   status.textContent="Lecture des rangs Market et contrôle des identifiants…";
   const fetched=await Promise.all(Object.entries(SOURCES).map(async([key,path])=>{
    const resp=await fetcher(path,{cache:"no-store",credentials:"omit"});
    if(!resp.ok)throw Error(key+" HTTP "+resp.status);
    return [key,await resp.json()];
   }));
   const d=Object.fromEntries(fetched);
   result=build(e.detail,d.top,d.extended);
   const c=result.counts;
   status.textContent=c.assets+" cryptos distinctes · "+c.linked+
    " rapprochements Market ("+c.explicit+" ID explicite, "+c.tickerOnly+
    " candidats par ticker) · "+c.unmatched+" absents du Top 1 000 · "+
    c.top50+" dans le Top 50 · "+c.overlapIds+
    " chevauchement(s) de snapshots Market dédoublonnés · 0 accès compte certifié. "+
    "Sources "+result.timestamps.top+" / "+result.timestamps.extended+".";
   render();
  }catch(err){
   result=null;render();
   status.textContent="Source Market partielle : "+String(err?.message||"non disponible")+
    ". Le Radar de cotations reste disponible et aucun actif n'est certifié.";
  }
 });
 return {render};
}
if(typeof document!=="undefined"){
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>mount());
 else mount();
}
return Object.freeze({build,mount,SOURCES});
});