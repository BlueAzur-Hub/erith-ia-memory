/* Agent-Crypto @erith.IA — 40.4.25
   ATLAS PERIPHERAL TRUE LAZY HYDRATION
   Shared Memory + GitHub Memory presentation bodies only.
   Atlas truth/state/memory engines stay in app.js; GitHub auto-load still runs at boot.
   This parser-time preprocessor strips only the two known presentation bodies before
   atlas-presentation.js inserts the family, then hydrates the requested body from
   views/atlas.html on first disclosure. No timer, observer or storage owner added. */
(()=>{
  "use strict";
  const BUILD="40.4.25";
  const SOURCE="./views/atlas.html";
  const TARGETS=Object.freeze({
    "shared-memory":Object.freeze({label:"Shared Memory"}),
    "github-memory":Object.freeze({label:"GitHub Memory"})
  });
  const nativeInsert=Element.prototype.insertAdjacentHTML;
  let armed=true;
  let sourcePromise=null;
  let fetchCount=0;
  const hydrated=new Set();

  function escRe(value){return String(value).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");}
  function bounds(source,key){
    const re=new RegExp(`<details\\b[^>]*data-collapse-key=["']${escRe(key)}["'][^>]*>`,"i");
    const hit=re.exec(source);
    if(!hit)return null;
    const start=hit.index;
    const summaryClose=source.indexOf("</summary>",start);
    if(summaryClose<0)return null;
    const bodyStart=summaryClose+"</summary>".length;
    const close=source.indexOf("</details>",bodyStart);
    if(close<0)return null;
    return {start,bodyStart,close};
  }
  function shellBody(key){
    const label=TARGETS[key]?.label||key;
    return `\n      <div class="atlas-collapse-body atlas-peripheral-lazy-body-40425" data-atlas-peripheral-lazy="${key}" data-atlas-hydrated-40425="0"><p class="atlas-local-response-empty">${label} · contenu chargé uniquement à l’ouverture.</p></div>\n    `;
  }
  function stripBody(source,key){
    const b=bounds(source,key);
    if(!b)return source;
    return source.slice(0,b.bodyStart)+shellBody(key)+source.slice(b.close);
  }
  function preprocess(source){
    let next=String(source||"");
    for(const key of Object.keys(TARGETS))next=stripBody(next,key);
    return next;
  }
  function targetDetails(key){return document.querySelector(`details[data-collapse-key="${key}"]`);}
  function sourceText(){
    if(!sourcePromise){
      fetchCount+=1;
      sourcePromise=fetch(SOURCE,{cache:"force-cache",credentials:"same-origin"}).then(response=>{
        if(!response.ok)throw new Error(`Atlas source HTTP ${response.status}`);
        return response.text();
      });
    }
    return sourcePromise;
  }
  function bodyHtml(source,key){
    const b=bounds(source,key);
    if(!b)throw new Error(`Atlas lazy source missing: ${key}`);
    const fragment=source.slice(b.bodyStart,b.close);
    const template=document.createElement("template");
    template.innerHTML=fragment;
    const body=template.content.querySelector(":scope > .atlas-collapse-body")||template.content.querySelector(".atlas-collapse-body");
    if(!body)throw new Error(`Atlas lazy body missing: ${key}`);
    return body.innerHTML;
  }
  async function hydrate(key){
    if(hydrated.has(key))return true;
    const details=targetDetails(key);
    if(!details)return false;
    details.dataset.atlasHydration40425="loading";
    try{
      const source=await sourceText();
      if(!details.open)return false;
      const body=details.querySelector(":scope > .atlas-collapse-body");
      if(!body)return false;
      const template=document.createElement("template");
      template.innerHTML=bodyHtml(source,key);
      body.replaceChildren(template.content.cloneNode(true));
      body.dataset.atlasHydrated40425="1";
      details.dataset.atlasHydration40425="ready";
      hydrated.add(key);
      try{globalThis.AgentCryptoAtlasPeripheralRebind40425?.rebind?.(key);}catch(error){console.warn("[40.4.25] Atlas rebind",error);}
      try{details.dispatchEvent(new CustomEvent("erith:presentation-resident",{bubbles:true,detail:{family:"atlas",key,build:BUILD}}));}catch(_){}
      return true;
    }catch(error){
      details.dataset.atlasHydration40425="error";
      const body=details.querySelector(":scope > .atlas-collapse-body");
      if(body)body.innerHTML=`<p class="atlas-local-response-empty">Chargement différé indisponible · ${String(error?.message||error)}</p>`;
      return false;
    }
  }
  function attach(){
    for(const key of Object.keys(TARGETS)){
      const details=targetDetails(key);
      if(!details||details.dataset.atlasPeripheralLazyReady40425==="1")continue;
      details.dataset.atlasPeripheralLazyReady40425="1";
      details.addEventListener("toggle",()=>{if(details.open)hydrate(key);});
      if(details.open)hydrate(key);
    }
  }
  Element.prototype.insertAdjacentHTML=function(position,html){
    if(armed&&this?.id==="atlas-view-host"&&String(position).toLowerCase()==="beforebegin"&&typeof html==="string"){
      const result=nativeInsert.call(this,position,preprocess(html));
      armed=false;
      Element.prototype.insertAdjacentHTML=nativeInsert;
      attach();
      try{globalThis.__AGENT_CRYPTO_ATLAS_PERIPHERAL_LAZY_40425__=Object.freeze({build:BUILD,source:SOURCE,targets:Object.keys(TARGETS),boot_bodies_absent:true,fetch_count:()=>fetchCount,hydrated:()=>[...hydrated],runtime_owner:"app.js",github_auto_load_preserved:true,new_timer:false,new_observer:false,storage_owner_added:false});}catch(_){}
      return result;
    }
    return nativeInsert.call(this,position,html);
  };
})();
