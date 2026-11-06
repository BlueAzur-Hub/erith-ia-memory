/* ERITH.IA · Market Microscope Strategy Options · first safe increment.
   Shared by Administrator and Trader's mirrored Administrator runtime.
   Controls ONLY existing indicator toggles. Saved profiles are local display
   preferences, NOT algorithmic strategies or PAPER execution. */
(()=>{"use strict";
  if(typeof document==="undefined"||globalThis.ErithMarketStrategyOptions)return;
  const ROOT="atlasMarketMicroscope",PANEL="erithStrategyOptionsPanel",BUTTON="erithStrategyOptionsButton";
  const KEY="agentCrypto.marketMicroscope.paperIndicatorProfiles.v1";
  const CODES=Object.freeze(["ma","ema","sr","supertrend","boll","sar","vwap","vp"]);
  const LABEL=Object.freeze({ma:"MA · 5 / 10 / 20",ema:"EMA · 5 / 10 / 20",sr:"Supports / résistances",supertrend:"SuperTrend · 10 × 3",boll:"Bollinger · 20 × 2",sar:"Parabolic SAR · 0,02 / 0,20",vwap:"VWAP fenêtre",vp:"Volume Profile · 24 zones"});
  const PRESETS=Object.freeze({
    tendance:["ma","ema","sr","supertrend"],
    volatilite:["ema","boll","sar"],
    niveaux:["ma","sr","vwap","vp"],
    complets:CODES.slice(),
    aucun:[]
  });
  const $=id=>document.getElementById(id);
  const root=() =>$(ROOT);
  const api=()=>globalThis.AgentCryptoMarketMicroscope;
  const safeName=name=>String(name||"").trim().replace(/[<>\\/"'\x00-\x1f]/g,"").slice(0,48);
  const normalize=value=>{
    const x=value&&typeof value==="object"?value:{};
    return Object.fromEntries(CODES.map(k=>[k,x[k]===true]));
  };
  const readProfiles=()=>{
    try{
      const v=JSON.parse(localStorage.getItem(KEY)||"{}");
      if(!v||typeof v!=="object"||Array.isArray(v))return {};
      const out={};
      Object.keys(v).slice(0,20).forEach(n=>{const k=safeName(n);if(k&&k!=="__proto__")out[k]=normalize(v[n]);});
      return out;
    }catch(_){return {};}
  };
  const writeProfiles=profiles=>{
    try{localStorage.setItem(KEY,JSON.stringify(profiles));return true;}catch(_){return false;}
  };
  const current=()=>normalize(api()?.indicatorState?.());
  const buttonFor=k=>root()?.querySelector('.amm-indicators [data-amm-indicator="'+k+'"]');
  function apply(state){
    const desired=normalize(state),old=current();
    const absent=[];
    CODES.forEach(k=>{
      if(old[k]!==desired[k]){
        const b=buttonFor(k);
        if(!b){absent.push(k);return;}
        b.click(); // official Market Microscope toggle: persists, redraws, clears stale S/R.
      }
    });
    sync();
    return absent.length===0;
  }
  function status(message,warning=false){
    const el=$("erithStrategyStatus");
    if(el){el.textContent=message;el.dataset.warning=String(warning);}
  }
  function sync(){
    const panel=$(PANEL);
    if(!panel)return false;
    const enabled=current();
    panel.querySelectorAll("[data-erith-indicator]").forEach(c=>{c.checked=!!enabled[c.dataset.erithIndicator];});
    const selected=CODES.filter(k=>enabled[k]);
    const meta=$("erithStrategySummary");
    if(meta)meta.textContent=selected.length+" / "+CODES.length+" indicateurs actifs · "+(api()?.snapshot?.()?.loadedBar||"historique en attente");
    const names=readProfiles(),picker=$("erithStrategyProfiles"),old=picker?.value;
    if(picker){
      picker.replaceChildren();
      const empty=document.createElement("option");empty.value="";empty.textContent="— Choisir un profil enregistré —";picker.appendChild(empty);
      Object.keys(names).sort((a,b)=>a.localeCompare(b,"fr")).forEach(name=>{
        const o=document.createElement("option");o.value=name;o.textContent=name;picker.appendChild(o);
      });
      if(old&&Object.hasOwn(names,old))picker.value=old;
    }
    return true;
  }
  function createStyle(){
    if($("erithStrategyOptionsStyle"))return;
    const style=document.createElement("style");style.id="erithStrategyOptionsStyle";
    style.textContent=
      "#"+ROOT+" #"+BUTTON+"{min-height:25px;padding:5px 9px;border:1px solid #5a9eaf;border-radius:999px;background:#0b3041;color:#c8f5ff;font:900 9px/1 system-ui;cursor:pointer;white-space:nowrap}"+
      "#"+ROOT+" #"+BUTTON+"[aria-expanded=true]{background:#8fefff;color:#091923}"+
      "#"+ROOT+" #"+PANEL+"{position:absolute;z-index:60;top:37px;right:12px;width:min(375px,calc(100% - 24px));max-height:min(65vh,600px);overflow:auto;padding:13px;border:1px solid #65c8d5;border-radius:11px;background:#031722;color:#dff6fa;box-shadow:0 18px 48px #000a;font:12px/1.35 system-ui,sans-serif;box-sizing:border-box}"+
      "#"+ROOT+" #"+PANEL+"[hidden]{display:none!important}"+
      "#"+ROOT+" #"+PANEL+" h3{font:900 15px/1.3 system-ui;color:#ffdfa0;margin:0}"+
      "#"+ROOT+" #"+PANEL+" p{font:11px/1.4 system-ui;color:#a4becb;margin:7px 0}"+
      "#"+ROOT+" #"+PANEL+" .erith-row{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin:8px 0}"+
      "#"+ROOT+" #"+PANEL+" button{border:1px solid #49697c;border-radius:7px;background:#092a3a;color:#e1f8fa;padding:7px 9px;cursor:pointer;font:800 11px system-ui}"+
      "#"+ROOT+" #"+PANEL+" button:hover{border-color:#7ce0e9}"+
      "#"+ROOT+" #"+PANEL+" button:focus-visible,#"+ROOT+" #"+PANEL+" input:focus-visible,#"+ROOT+" #"+PANEL+" select:focus-visible{outline:2px solid #8fefff;outline-offset:2px}"+
      "#"+ROOT+" #"+PANEL+" .erith-indicators{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px;margin:10px 0}"+
      "#"+ROOT+" #"+PANEL+" .erith-indicators label{display:flex;align-items:center;gap:6px;border:1px solid #264353;border-radius:7px;padding:6px;min-height:30px;font:11px/1.2 system-ui;color:#d3e9ed;cursor:pointer}"+
      "#"+ROOT+" #"+PANEL+" .erith-indicators input{accent-color:#64d9e5}"+
      "#"+ROOT+" #"+PANEL+" input[type=text],#"+ROOT+" #"+PANEL+" select{box-sizing:border-box;min-width:0;flex:1 1 145px;padding:8px;background:#061e2d;border:1px solid #476879;border-radius:6px;color:#fff;font:11px system-ui}"+
      "#"+ROOT+" #"+PANEL+" .erith-warning{border-top:1px solid #365463;padding-top:8px;color:#e7be73}"+
      "#"+ROOT+" #erithStrategyStatus{color:#9fe8c7}"+
      "#"+ROOT+" #erithStrategyStatus[data-warning=true]{color:#ffd08b}"+
      "@media(max-width:760px){#"+ROOT+" #"+PANEL+"{top:75px;max-height:60vh}#"+ROOT+" #"+PANEL+" .erith-indicators{grid-template-columns:1fr}}";
    document.head.appendChild(style);
  }
  function makePanel(){
    const panel=document.createElement("section");panel.id=PANEL;panel.hidden=true;
    panel.setAttribute("aria-label","Options et profils d'indicateurs PAPER");
    panel.innerHTML='<div class="erith-row" style="justify-content:space-between;margin-top:0"><h3>Options / Stratégies</h3><button type="button" data-erith-close aria-label="Fermer les options">Fermer ×</button></div>'+
      '<p>Préparer le graphique pour étudier une stratégie sur des bougies réelles. Aucun ordre, aucune simulation automatique à ce stade.</p>'+
      '<strong>Profils de lecture</strong>'+
      '<div class="erith-row" data-erith-presets><button data-erith-preset="tendance">Tendance</button><button data-erith-preset="volatilite">Volatilité</button><button data-erith-preset="niveaux">Niveaux</button><button data-erith-preset="complets">Tous</button><button data-erith-preset="aucun">Aucun</button></div>'+
      '<strong>Indicateurs disponibles</strong><div class="erith-indicators" data-erith-fields></div>'+
      '<p id="erithStrategySummary" aria-live="polite"></p>'+
      '<strong>Mes profils personnalisés</strong>'+
      '<div class="erith-row"><input id="erithStrategyName" type="text" maxlength="48" placeholder="Nom (ex. EMA de Yoann)" aria-label="Nom du profil"><button type="button" data-erith-save>Enregistrer</button></div>'+
      '<div class="erith-row"><select id="erithStrategyProfiles" aria-label="Profils enregistrés"></select><button type="button" data-erith-load>Charger</button><button type="button" data-erith-delete>Supprimer</button></div>'+
      '<div class="erith-row"><button type="button" data-erith-export>Exporter les profils JSON</button></div>'+
      '<p class="erith-warning">Lecture seule · les paramètres mathématiques (EMA 5/10/20, BOLL 20×2, etc.) restent ceux du moteur actuel. Un profil sauvegarde seulement les indicateurs activés, pas une stratégie de trading exécutable. Les données personnelles et clés OKX ne sont pas exportées.</p>'+
      '<p id="erithStrategyStatus" role="status" aria-live="polite">Aucune transaction.</p>';
    const fields=panel.querySelector("[data-erith-fields]");
    CODES.forEach(k=>{
      const label=document.createElement("label"),checkbox=document.createElement("input"),text=document.createElement("span");
      checkbox.type="checkbox";checkbox.dataset.erithIndicator=k;text.textContent=LABEL[k];
      label.append(checkbox,text);fields.appendChild(label);
    });
    return panel;
  }
  function close(){
    const p=$(PANEL),b=$(BUTTON);if(!p||!b)return;
    p.hidden=true;b.setAttribute("aria-expanded","false");
  }
  function toggle(){
    const p=$(PANEL),b=$(BUTTON);if(!p||!b)return;
    p.hidden=!p.hidden;b.setAttribute("aria-expanded",String(!p.hidden));
    if(!p.hidden)sync();
  }
  function exportProfiles(){
    const profiles=readProfiles();
    const content=JSON.stringify({schema:"erith.market-microscope.indicator-profiles.v1",source:"local browser presentation",contains_trading_orders:false,indicator_profiles:profiles},null,2);
    const blob=new Blob([content],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
    a.href=url;a.download="ERITH_IA_MARKET_MICROSCOPE_INDICATOR_PROFILES.json";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    status("Profils exportés (indicateurs uniquement, sans clé API).");
  }
  function handle(event){
    const t=event.target;
    if(t.matches?.("[data-erith-indicator]")){
      const key=t.dataset.erithIndicator,b=buttonFor(key),active=!!current()[key];
      if(b&&active!==t.checked){b.click();sync();}
      return;
    }
    const b=t.closest?.("button");
    if(!b)return;
    if(b.matches("[data-erith-close]")){close();$(BUTTON)?.focus();return;}
    if(b.matches("[data-erith-preset]")){
      const codes=PRESETS[b.dataset.erithPreset];if(!codes)return;
      status(apply(Object.fromEntries(CODES.map(k=>[k,codes.includes(k)])))?"Profil appliqué au graphique.":"Un indicateur n'est pas disponible.",false);return;
    }
    if(b.matches("[data-erith-save]")){
      const name=safeName($("erithStrategyName")?.value);
      if(!name){status("Indique un nom de profil.",true);return;}
      const profiles=readProfiles();
      if(!Object.hasOwn(profiles,name)&&Object.keys(profiles).length>=20){status("Limite de 20 profils atteinte.",true);return;}
      profiles[name]=current();
      if(!writeProfiles(profiles)){status("Enregistrement local indisponible.",true);return;}
      sync();$("erithStrategyProfiles").value=name;status("Profil « "+name+" » enregistré dans ce navigateur.");return;
    }
    if(b.matches("[data-erith-load]")){
      const name=$("erithStrategyProfiles")?.value,profile=readProfiles()[name];
      if(!name||!profile){status("Sélectionne un profil enregistré.",true);return;}
      status(apply(profile)?"Profil « "+name+" » appliqué.":"Indicateur indisponible.",false);return;
    }
    if(b.matches("[data-erith-delete]")){
      const name=$("erithStrategyProfiles")?.value,profiles=readProfiles();
      if(!name||!Object.hasOwn(profiles,name)){status("Sélectionne un profil.",true);return;}
      delete profiles[name];if(!writeProfiles(profiles)){status("Stockage indisponible.",true);return;}
      sync();status("Profil supprimé localement.");return;
    }
    if(b.matches("[data-erith-export]"))exportProfiles();
  }
  function mount(){
    const r=root(),host=r?.querySelector(".amm-indicators");
    if(!r||!host||!api()?.indicatorState)return false;
    createStyle();
    if(!$(BUTTON)){
      const b=document.createElement("button");b.id=BUTTON;b.type="button";b.textContent="⚙ Options";b.setAttribute("aria-controls",PANEL);b.setAttribute("aria-expanded","false");b.title="Options et profils d'indicateurs (PAPER, lecture seule)";
      b.addEventListener("click",e=>{e.stopPropagation();toggle();});host.appendChild(b);
    }
    if(!$(PANEL)){
      const panel=makePanel();r.appendChild(panel);panel.addEventListener("click",handle);panel.addEventListener("change",handle);
    }
    sync();
    return true;
  }
  const boot=()=>mount();
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
  window.addEventListener("pageshow",boot,{passive:true});
  window.addEventListener("atlas:v2mode",()=>queueMicrotask(boot),{passive:true});
  document.addEventListener("click",e=>{
    if(e.target?.closest?.("#"+ROOT+"Controls [data-amm-mode]"))queueMicrotask(boot);
    else if(e.target?.closest?.("#"+ROOT+" [data-amm-indicator]"))queueMicrotask(sync);
  },{passive:true});
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$(PANEL)?.hidden)close();});
  globalThis.ErithMarketStrategyOptions=Object.freeze({
    version:"2026-11-06-paper-indicator-profiles-v1",mount,apply,current,readProfiles,close,
    read_only:true,real_order:false,paper_execution:false,api_credentials:false
  });
})();