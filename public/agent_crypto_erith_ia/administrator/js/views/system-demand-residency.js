/* Agent-Crypto @erith.IA — 40.4.85
   SYSTEM 04 TRUE-DEMAND RESIDENCY — DIAGNOSTICS COMPLETION
   Existing Simulation/Commandes/Backend/Safety/Physical Security closed-body residency is preserved.
   Storage Health + Grey Plate Forensic are now detached from the live document after canonical app.js
   listeners have bound, leaving compact operator placeholders. Their exact same DOM nodes are restored
   only on explicit click/hash demand. No clone, fetch, timer, observer, storage write or engine OFF. */
(()=>{
  "use strict";
  const BUILD="40.4.85";
  const life=globalThis.ErithPresentationLifecycle;
  if(!life)return;

  const selectors=Object.freeze([
    'details[data-collapse-key="simulation"]',
    'details[data-collapse-key="commandes"]',
    'details[data-collapse-key="backend"]',
    'details[data-collapse-key="safety"]',
    'details[data-collapse-key="physical-security"]'
  ]);
  const registration=life.registerClosedBodyFamily({id:"system",label:"04 · Expérimentation & système",selectors});

  const definitions=Object.freeze([
    Object.freeze({id:"atlasStorageHealth40198",key:"storage-health",title:"Stockage local · Observatoire",subtitle:"Quota · localStorage · IndexedDB",icon:"◇"}),
    Object.freeze({id:"atlasGreyPlateForensic40393",key:"grey-plate-forensic",title:"Firefox · Grey Plate Forensic",subtitle:"DOM / paint · sonde manuelle",icon:"▧"})
  ]);
  const records=new Map();

  function demandKey(value){
    const v=String(value||"").replace(/^#/,"").trim();
    if(["storage","storage-health","atlasStorageHealth40198"].includes(v))return "atlasStorageHealth40198";
    if(["grey","grey-plate","grey-plate-forensic","atlasGreyPlateForensic40393"].includes(v))return "atlasGreyPlateForensic40393";
    return "";
  }

  function detach(def){
    const panel=document.getElementById(def.id);
    if(!panel||records.has(def.id))return false;
    const placeholder=document.createElement("section");
    placeholder.className="panel glass atlas-family-member atlas-tone-system atlas-system-demand-placeholder-40485";
    placeholder.dataset.layoutFamily="system";
    placeholder.dataset.systemDiagnosticDemand40485=def.key;
    placeholder.setAttribute("aria-label",`${def.title} · charger à la demande`);
    const button=document.createElement("button");
    button.type="button";
    button.dataset.systemDiagnosticRestore40485=def.id;
    button.innerHTML=`<span aria-hidden="true">${def.icon}</span><b>${def.title}</b><small>${def.subtitle} · Ouvrir</small>`;
    placeholder.appendChild(button);
    panel.replaceWith(placeholder);
    panel.dataset.systemDemandResidency40485="detached";
    records.set(def.id,{def,panel,placeholder,restored:false,detached_at:new Date().toISOString(),restored_at:null});
    return true;
  }

  function restore(value,{scroll=true}={}){
    const id=demandKey(value)||String(value||"");
    const rec=records.get(id);
    if(!rec)return document.getElementById(id)||null;
    if(!rec.restored){
      rec.placeholder.replaceWith(rec.panel);
      rec.restored=true;
      rec.restored_at=new Date().toISOString();
      rec.panel.dataset.systemDemandResidency40485="resident";
      try{rec.panel.dispatchEvent(new CustomEvent("erith:system-diagnostic-resident",{bubbles:false,detail:{build:BUILD,key:rec.def.key}}));}catch(_){}
    }
    if(scroll)try{rec.panel.scrollIntoView({block:"start",behavior:"auto"});}catch(_){}
    return rec.panel;
  }

  function restoreForHash(hash=location.hash){
    const id=demandKey(hash);
    if(!id)return false;
    return !!restore(id,{scroll:false});
  }

  definitions.forEach(detach);

  document.addEventListener("click",event=>{
    const button=event.target?.closest?.("[data-system-diagnostic-restore-40485]");
    if(button){restore(button.dataset.systemDiagnosticRestore40485,{scroll:true});return;}
    const anchor=event.target?.closest?.('a[href^="#"]');
    const id=demandKey(anchor?.getAttribute?.("href")||"");
    if(id)restore(id,{scroll:false});
  },true);
  window.addEventListener("hashchange",()=>restoreForHash(location.hash));
  restoreForHash(location.hash);

  function snapshot(){
    const rows=definitions.map(def=>{
      const rec=records.get(def.id);
      return Object.freeze({id:def.id,key:def.key,detached:!!rec&&!rec.restored,resident:!!rec?.restored,detached_at:rec?.detached_at||null,restored_at:rec?.restored_at||null});
    });
    return Object.freeze({
      build:BUILD,
      strategy:"same-node-off-document-until-explicit-demand",
      closed_body_registration:!!registration,
      closed_body_selectors:selectors,
      diagnostics:Object.freeze(rows),
      storage_health_boot_resident:false,
      grey_plate_forensic_boot_resident:false,
      simulation_experiment_family_included:true,
      clone_used:false,
      fetch_added:false,
      timer_added:false,
      observer_added:false,
      storage_write_added:false,
      network_owner_added:false,
      engine_state_changed:false
    });
  }

  globalThis.ErithSystemDemandResidency40485=Object.freeze({build:BUILD,strategy:"same-node-off-document-until-explicit-demand",restore,restoreForHash,snapshot});
  globalThis.ErithSystemDemandResidency40414=globalThis.ErithSystemDemandResidency40485;
  globalThis.__AGENT_CRYPTO_SYSTEM_DEMAND_40485__=snapshot();
})();
