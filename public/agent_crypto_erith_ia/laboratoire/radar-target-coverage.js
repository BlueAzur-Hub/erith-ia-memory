/* Radar targeted: explain coverage and blocked priorities from audited PUBLIC archives.
   No exchange API, no wallet, no signal, no price interpolation.
*/
(function(root,factory){"use strict";const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;if(root?.document)api.mount(root.document);})(typeof window==="undefined"?null:window,()=>{
"use strict";
const EXPECTED=["BR","JCT","BEAM"];
function verify(report,head){
 if(report?.schema!=="erith.radar.target-coverage-and-queue.v1"||
    report.orders_enabled!==false||report.real_orders!==0||
    report.no_inferred_prices!==true||report.observation_only!==true||
    report.no_backfill!==true||report.candidate_count!==20||
    report.priority_count!==10||!Array.isArray(report.priority_queue)||
    report.priority_queue.length!==10||!Array.isArray(report.assets)||
    report.assets.length!==3||report.coverage?.target_count!==3)
  throw Error("Rapport d'audit non conforme");
 if(head?.schema!=="erith.radar.verified-target-hourly.latest.v1"||
    head.orders_enabled!==false||head.real_orders!==0||
    head.hour_utc!==report.latest_hour_utc||
    head.observed_at_utc!==report.as_of_observed_at_utc||
    head.markets_observed!==report.coverage.markets_observed_latest)
  throw Error("Rapport de couverture périmé par rapport au dernier relevé");
 const coverage=report.coverage;
 if(!Number.isInteger(coverage.hours_archived)||coverage.hours_archived<1||
    !Number.isInteger(coverage.expected_hours_since_first)||
    coverage.expected_hours_since_first<coverage.hours_archived||
    coverage.expected_hours_since_first>48||
    coverage.hours_without_archive!==coverage.expected_hours_since_first-coverage.hours_archived)
  throw Error("Couverture temporelle incohérente");
 if(!/^\d{4}-\d\d-\d\dT\d\dZ$/.test(report.latest_hour_utc)||
    typeof report.queue_source_qualified_at_utc!=="string"||
    typeof report.identity_catalogue_collected_at_utc!=="string")
  throw Error("Datation de la sélection manquante");
 const assets=report.assets.map((x,i)=>{
  if(x.symbol!==EXPECTED[i]||x.venue!=="Bitget"||x.quote!=="USDT"||
     x.reversal_certified!==false||x.fill_certified!==false||
     typeof x.hours_observed!=="number"||x.hours_observed<0||
     x.hours_observed>coverage.hours_archived||
     x.hours_unavailable!==coverage.hours_archived-x.hours_observed||
     x.hours_unarchived!==coverage.hours_without_archive||
     typeof x.latest_hour_observed!=="boolean")
   throw Error("Cible ou compteur invalide");
  if(!x.latest_hour_observed &&
     (x.latest_real_price_usdt!==null||x.latest_spread_bps!==null||
      x.change_last_consecutive_hour_pct!==null))
   throw Error("Prix recyclé alors que dernière heure indisponible");
  if(x.hours_observed<2&&x.change_last_consecutive_hour_pct!==null)
   throw Error("Variation sans deux prix");
  return x;
 });
 const ranks=new Set();
 const queue=report.priority_queue.map((x,i)=>{
  if(x.priority_rank!==i+1||ranks.has(x.coin_id)||
     typeof x.symbol!=="string"||!x.symbol||
     !["CONTINUE_VERIFIED_SPOT_OBSERVATION",
        "VERIFY_IDENTITY_BEFORE_ANY_HOURLY_PROMOTION"].includes(x.next_action)||
     x.real_orders!==0)
   throw Error("File de recherche non conforme");
  ranks.add(x.coin_id);
  if(x.hourly_target_enabled && (!x.identity_verified_at_catalogue ||
      x.next_action!=="CONTINUE_VERIFIED_SPOT_OBSERVATION"))
   throw Error("Promotion interdite d'une identité non vérifiée");
  if(!x.hourly_target_enabled &&
      x.next_action!=="VERIFY_IDENTITY_BEFORE_ANY_HOURLY_PROMOTION")
   throw Error("Qualification non prouvée");
  return x;
 });
 return {coverage,assets,queue,hour:report.latest_hour_utc,
  qualifiedAt:report.queue_source_qualified_at_utc,
  identityAt:report.identity_catalogue_collected_at_utc};
}
function render(doc,data){
 const status=doc.querySelector("[data-target-coverage-status]");
 const assets=doc.querySelector("[data-target-coverage-rows]");
 const priorities=doc.querySelector("[data-target-priority-rows]");
 if(!status||!assets||!priorities)return;
 const make=(parent,values)=>{
  const tr=doc.createElement("tr");
  for(const v of values){const td=doc.createElement("td");td.textContent=String(v);tr.appendChild(td);}
  parent.appendChild(tr);
 };
 assets.replaceChildren();priorities.replaceChildren();
 for(const a of data.assets){
  make(assets,[a.pair,a.hours_observed+"/"+data.coverage.hours_archived,
   a.hours_unavailable,a.hours_unarchived,
   a.latest_hour_observed?"Observé":"Dernière heure indisponible",
   a.change_last_consecutive_hour_pct===null?"Non mesuré":
     new Intl.NumberFormat("fr-FR",{maximumFractionDigits:3}).format(Number(a.change_last_consecutive_hour_pct))+" %",
   a.latest_spread_bps===null?"Non mesuré":
     new Intl.NumberFormat("fr-FR",{maximumFractionDigits:2}).format(Number(a.latest_spread_bps))+" pb"]);
 }
 for(const x of data.queue){
  make(priorities,[x.priority_rank,x.symbol,x.venue_from_qualification??"Non connu",
   x.spot_pair_from_qualification??"Paire absente",
   x.identity_verified_at_catalogue?"Contrat concordant dans le catalogue daté":"Identité non prouvée",
   x.hourly_target_enabled?"Suivi BR déjà activé":"Attendre vérification d'identité"]);
 }
 status.textContent=data.hour+": "+data.coverage.hours_archived+" heure(s) réellement archivées sur "+
   data.coverage.expected_hours_since_first+" heure(s) écoulées depuis la première observation "+
   "(maximum 48 h), "+data.coverage.hours_without_archive+" heure(s) sans archive. "+
   "File de 10 priorités issue de la sélection du "+data.qualifiedAt+
   " ; c'est un classement de recherche daté, pas une liste d'ordres.";
}
function mount(doc){
 const container=doc.getElementById("radar-verified-targets");if(!container)return;
 const trigger=doc.querySelector("[data-target-coverage-refresh]");
 const status=doc.querySelector("[data-target-coverage-status]");
 const a=doc.querySelector("[data-target-coverage-rows]");
 const q=doc.querySelector("[data-target-priority-rows]");
 let busy=false;
 const load=async()=>{
  if(busy||!container.open)return;
  busy=true;trigger.disabled=true;status.textContent="Vérification du rapport de couverture…";
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),12000);
  try{
   const read=async path=>{
    const url=new URL(path,doc.baseURI);
    const res=await fetch(url.href,{credentials:"omit",cache:"no-store",signal:controller.signal});
    if(!res.ok)throw Error("Archive non publiée (HTTP "+res.status+")");
    const txt=await res.text();if(txt.length>100000)throw Error("Dossier trop volumineux");
    return JSON.parse(txt);
   };
   const base="../data/crypto/radar-verified-target-hourly/";
   const [report,head]=await Promise.all([read(base+"coverage-latest.json"),read(base+"latest.json")]);
   render(doc,verify(report,head));
  }catch(err){
   a.replaceChildren();q.replaceChildren();
   status.textContent="Preuves insuffisantes ou rapport non publié : "+
     String(err.message||err)+". Aucun prix ni signal reconstitué.";
  }finally{clearTimeout(timeout);busy=false;trigger.disabled=false;}
 };
 container.addEventListener("toggle",()=>{if(container.open)void load();});
 trigger.addEventListener("click",()=>{void load();});
}
return Object.freeze({verify,render,mount,readOnly:true,ordersEnabled:false});
});
