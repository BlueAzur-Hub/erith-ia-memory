/* ERITH.IA · Read-only Radar → Spot → PAPER panel. No orders, storage or timers. */
(function(global){"use strict";
const FILE="../data/crypto/radar-opportunities/spot-paper-audit.json";
function valid(report){
 if(report?.schema!=="erith.radar.spot-paper-decision-audit.v1"||
   report.orders_enabled!==false||report.read_only!==true||
   report.trades_executed!==0||report.paper_trades_opened!==0||
   !Array.isArray(report.candidates)||report.candidates.length!==report.total_detected||
   report.blocked_paper_candidates!==report.total_detected||
   !report.candidates.every(x=>x.paper?.decision==="BLOCKED"&&
    x.paper?.executed_order===false&&x.paper?.trade_count===0&&
    x.paper?.net_profit_usdt===null&&x.paper?.entry_price_usdt===null))
  throw Error("Registre PAPER incomplet ou non conforme au mode lecture seule");
 return report;
}
function text(node,value){node.textContent=String(value)}
function paint(report,document){
 const p=valid(report);
 const status=document.getElementById("radar-spot-status");
 const body=document.getElementById("radar-spot-body");
 if(!status||!body)return;
 const fmt=new Intl.NumberFormat("fr-FR",{maximumFractionDigits:2});
 text(status,p.source_first_day_utc+" → "+p.source_last_day_utc+" UTC · "+
    p.total_detected+" candidats Radar · "+p.later_price_rises+" hausses constatées · "+
    p.public_spot_evidence_candidates+" dossiers avec preuve Spot tardive ou partielle · "+
    p.paper_trades_opened+" opérations PAPER autorisées. Aucun gain exécuté.");
 body.replaceChildren();
 for(const x of p.candidates){
   const tr=document.createElement("tr");
   const rise=Number.isFinite(x.aggregate_change_pct_observed)?x.aggregate_change_pct_observed:null;
   const price=rise===null?"Prix ultérieur absent":(rise>0?"+":"")+fmt.format(rise)+" %";
   const proof=x.spot?.early_public_spot_book||x.spot?.later_spot_qualification;
   const proofString=proof
      ?proof.venue+" "+proof.pair+" · "+proof.quote+" · contrat non certifié"
      :"Aucune paire Spot prouvée";
   const cells=[x.symbol+" · "+x.name,price,proofString,
      x.paper.reason==="CONTRACT_IDENTITY_UNVERIFIED"
      ?"Bloquée · identité du jeton"
      :"Bloquée · aucune preuve Spot exploitable"];
   cells.forEach((value,i)=>{
      const td=document.createElement("td");text(td,value);
      if(i===1&&rise!==null)td.className=rise>=0?"positive":"negative";
      tr.appendChild(td);
   });
   body.appendChild(tr);
 }
}
function validatedIdentity(data){
 if(data?.schema!=="erith.radar.spot-identity-prospective.v1"||
   data.orders_enabled!==false||data.real_orders!==0||data.paper_orders!==0||
   data.decisions_not_executions!==true||!Array.isArray(data.candidates)||
   data.candidates.length!==20||data.candidate_count!==20||
   data.identity_proven_count!==data.candidates.filter(x=>x.identity_proven===true).length||
   data.candidates.some(x=>x.paper_entry_price_usdt!==null||x.paper_pnl_usdt!==null))
   throw Error("preuve contractuelle non vérifiable");
 return data;
}
function okxSpotSummary(qualification){
 const missing="OKX Spot/USDT : inventaire des règles natives en attente de collecte.";
 if(qualification?.schema!=="erith.radar.spot-qualification.v1"||
    qualification.venues?.OKX?.available!==true||
    !Array.isArray(qualification.candidates)||
    qualification.candidates.length!==20||
    qualification.candidates.some(x=>!x||!x.okx_spot||
       x.okx_spot.venue!=="OKX"||x.okx_spot.quote!=="USDT"||
       x.okx_spot.contract_identity_proven!==false||
       x.okx_spot.real_orders_enabled!==false))return missing;
 const candidates=qualification.candidates.filter(x=>
   x.okx_spot.pair_observed===true&&
   x.okx_spot.pair===x.symbol+"-USDT");
 const rules=candidates.filter(x=>{
  const r=x.okx_spot.rules;
  return x.okx_spot.native_rules_verified===true&&
    r?.source==="OKX_PUBLIC_SPOT_INSTRUMENT"&&
    ["min_sz","lot_sz","tick_sz"].every(k=>
      typeof r[k]==="string"&&/^\d+(?:\.\d+)?$/.test(r[k])&&
      Number.isFinite(Number(r[k]))&&Number(r[k])>0);
 });
 const preview=global.AgentCryptoSpotPaperOrders?.previewOkxSpot;
 const measured=typeof preview==="function"?rules.map(row=>({
   symbol:row.symbol,study:preview(row)})).filter(row=>
     row.study.status==="HYPOTHETICAL_IMMEDIATE_ROUNDTRIP_ONLY"):[];
 const formatted=measured.slice(0,4).map(({symbol,study})=>
   symbol+" : "+study.hypotheticalImmediatePnlSign+
   Number(study.hypotheticalImmediatePnlUSDT).toFixed(2)+
   " USDT sur achat PAPER ~100 USDT ; seuil d'équilibre ≈+"+
   study.approximateBidRiseToBreakEvenPct.toFixed(2)+" %").join(" · ");
 return "OKX Spot/USDT : "+candidates.length+" paires candidates observées · "+
   rules.length+" règles publiques minSz/lotSz/tickSz vérifiées. "+
   "Identité CoinGecko, accès au compte, frais réels et ordre non certifiés.\n"+
   "Carnet OKX daté · "+measured.length+"/"+rules.length+
   " scénarios instantanés PAPER évaluables (frais hypothétiques 0,1 % achat BASE / 0,1 % vente USDT, glissement stress 0,2 % par côté)."+
   (formatted?"\n"+formatted:"\nAucun aller-retour évaluable : carnet absent, profondeur ou tailles insuffisantes.")+
   "\nCes valeurs sont des coûts à l'instant du relevé, pas des gains ou prévisions ; aucun ordre exécuté.";
}
function okxFollowupSummary(watch, qualification, vault, usdHistory){
 if(watch?.schema!=="erith.radar.okx.hurdle-followups.v1"||
    watch.orders_enabled!==false||watch.paper_fills!==0||watch.real_orders!==0||
    watch.backtest!==false||!Array.isArray(watch.studies)||!Array.isArray(watch.snapshots))
  return "Suivi OKX des seuils 24/48 h : première collecte ou archive conforme en attente.";
 const studies=watch.studies.filter(x=>
   x.status==="HYPOTHETICAL_COST_STUDY_NO_FILL"&&x.orders_enabled===false&&
   x.executed_order===false&&x.contract_identity_proven===false&&
   x.quote==="USDT"&&Array.isArray(x.followups));
 const checks=studies.flatMap(x=>x.followups.filter(f=>
   (f.window==="24h"||f.window==="48h")&&
   f.execution_proven===false&&f.orders_enabled===false&&f.real_orders===0));
 const good=checks.filter(f=>f.status==="QUOTE_ABOVE_HYPOTHETICAL_HURDLE").length;
 const not=checks.filter(f=>f.status==="QUOTE_BELOW_HYPOTHETICAL_HURDLE").length;
 const incomplete=checks.length-good-not;
 const selected=(qualification?.candidates||[]).filter(x=>
   x.okx_spot?.native_rules_verified===true).map(x=>x.id);
 const assets=new Set(selected);
 const native=Array.isArray(vault?.assets)&&
   vault?.schema==="aerith.public.ohlcv.okx.native-utc-daily-source-index.v1"?
   vault.assets.filter(x=>assets.has(x.id)&&x.quote==="USDT").length:null;
 const radarRows=usdHistory?.schema==="erith.radar.dynamic-forward-observations.v1"&&
   usdHistory.quote==="USD"&&Array.isArray(usdHistory.observations)?
   usdHistory.observations.filter(x=>assets.has(x.id)):[];
 const observed=radarRows.filter(x=>x.followup_1d?.status==="OBSERVED_DAILY_SNAPSHOT"&&
   typeof x.followup_1d.change_pct==="number").length;
 return "Suivi prospectif OKX/USDT : "+studies.length+
   " études de coût datées · "+checks.length+
   " observations de sortie à 24/48 h ("+good+
   " cotations au-dessus du seuil fictif · "+not+" sous le seuil · "+
   incomplete+" liquidité/autre preuve insuffisante). "+
   "Aucune cotation n'est un ordre rempli ni un bénéfice acquis."+
   "\nCoffre OKX natif 1Dutc : "+(native===null?"index indisponible":
      native+"/"+assets.size+" actifs concernés couverts")+
   " ; données journalières de contexte, non prix d'exécution."+
   "\nArchives Radar/CoinGecko USD : "+observed+"/"+radarRows.length+
   " suivis descriptifs à 1 jour observés ; USD et USDT ne sont pas assimilés, "+
   "aucune performance PAPER déduite de cette série.";
}
function signalEvidenceSummary(doc){
 const pending="Étude des signaux : journal vérifié en attente de publication.";
 if(doc?.schema!=="erith.radar.signal-evidence-audit.v1"||
    doc.kind!=="RESEARCH_AUDIT_NOT_STRATEGY_SELECTION"||
    doc.orders_enabled!==false||doc.strategy_certified!==false||
    doc.real_orders!==0||doc.paper_fills!==0||
    doc.top50_retro_7d?.true_unseen_holdout!==false||
    doc.top50_retro_7d?.source_quote!=="USD"||
    doc.radar_forward_j1?.quote!=="USD"||
    doc.okx_context?.quote!=="USDT"||
    doc.okx_context?.no_executable_returns_derived_from_usd!==true)
    return pending;
 const periods=doc.top50_retro_7d.periods;
 const before=periods?.selection_descriptive,after=periods?.later_descriptive_validation;
 function good(x){
   return x&&Number.isInteger(x.signals_total)&&
     Number.isInteger(x.followups_observed)&&Number.isInteger(x.followups_missing)&&
     x.followups_observed>=0&&x.followups_missing>=0&&
     x.signals_total===x.followups_observed+x.followups_missing;
 }
 const groups=doc.radar_forward_j1.buckets;
 if(!good(before)||!good(after)||
    !good(groups?.momentum_24h_7d)||!good(groups?.rebound_24h_only))return pending;
 const pct=n=>typeof n==="number"&&Number.isFinite(n)?
    (n>0?"+":"")+n.toLocaleString("fr-FR",{maximumFractionDigits:2})+" %":"non mesurable";
 const scenario=after.cost_sensitivity_descriptive_only?.["0.8"];
 const net=scenario?.mean_observed_gross_minus_assumed_friction_pct;
 const ratio=x=>x.followups_observed+"/"+x.signals_total+
    " prix suivis ("+x.followups_missing+" manquants)";
 return "Étude des signaux · Top50 historique 7 j : ancienne période "+
    ratio(before)+" · période temporelle ultérieure "+ratio(after)+
    " · variation brute moyenne observée "+pct(after.mean_observed_gross_change_pct)+
    " · moins 0,8 % de coûts supposés : "+pct(net)+
    " (diagnostic rétrospectif, PAS un vrai hors-échantillon ni un rendement OKX)."+
    "\nRadar prospectif CoinGecko J+1 : momentum "+
    ratio(groups.momentum_24h_7d)+" · rebond "+
    ratio(groups.rebound_24h_only)+
    ". Aucune conversion USD → USDT, ni simulation d'ordre déduite de ces cours."+
    "\nRéférence sans opération : 0 % nominal. Aucune stratégie certifiée.";
}
async function signalEvidenceStatus(){
 const target=document.getElementById("radar-signal-evidence-status");
 if(!target)return;
 try{
   const resp=await fetch("../data/crypto/radar-opportunities/signal-evidence.json",{cache:"no-store"});
   if(!resp.ok)throw Error("archive non publiée");
   text(target,signalEvidenceSummary(await resp.json()));
 }catch(_){text(target,"Étude des signaux : prochaine publication archivée attendue, aucun rendement nouveau affirmé.");}
}
async function shadowStatus(){
 const target=document.getElementById("radar-shadow-status");if(!target)return;
 try{
   const res=await fetch("../data/crypto/radar-opportunities/spot-paper-forward.json",{cache:"no-store"});
   if(!res.ok)throw Error("journal non encore publié");
   const data=await res.json();
   if(data?.schema!=="erith.radar.spot-paper-forward-shadow.v1"||
      data.orders_enabled!==false||data.real_orders!==0||data.paper_fills!==0||
      data.execution_proven!==false||!Array.isArray(data.positions)||
      !Array.isArray(data.closures)||data.positions.length>4||
      data.positions.some(x=>x.status!=="HYPOTHETICAL_NO_FILL"||x.executed_order!==false)||
      data.closures.some(x=>x.status!=="HYPOTHETICAL_CLOSED_NO_FILL"||
                           x.realized_profit_usdt!==null||x.executed_order!==false))
     throw Error("journal PAPER non conforme");
   let note=" · Revente nette : non certifiée (règles Spot en attente).";
   let okxInfo="OKX Spot/USDT : collecte indisponible.";
   let prospective="Suivi des seuils OKX : relevés prospectifs en attente.";
   try{
     const base="../data/crypto/radar-opportunities/";
     const [identityRes,qualificationRes]=await Promise.all([
       fetch(base+"spot-identity-latest.json",{cache:"no-store"}),
       fetch(base+"qualification-latest.json",{cache:"no-store"})]);
     if(!identityRes.ok||!qualificationRes.ok)throw Error("Sources de marché absentes");
     const [identity,qualification]=await Promise.all([identityRes.json(),qualificationRes.json()]);
     okxInfo=okxSpotSummary(qualification);
     try{
       const [witness,vault,usdHistory]=await Promise.all([
         fetch(base+"okx-hurdle-followups.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).catch(()=>null),
         fetch("../data/historical_archive_prototype/okx_verified_daily/index.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).catch(()=>null),
         fetch(base+"dynamic-followups.json",{cache:"no-store"}).then(r=>r.ok?r.json():null).catch(()=>null)]);
       prospective=okxFollowupSummary(witness,qualification,vault,usdHistory);
     }catch(_){prospective="Suivi des seuils OKX : preuve indisponible.";}

     const audit=global.AgentCryptoSpotPaperOrders?.auditRadarShadow?.(data,identity,qualification);
     if(audit?.status==="READ_ONLY_AUDIT"){
       const unavailable=audit.results.filter(x=>x.status!=="HYPOTHETICAL_SIZE_OK");
       const missing=unavailable.filter(x=>x.reason==="NATIVE_EXIT_FILTERS_MISSING");
       if(missing.length===audit.results.length&&missing.length){
         note=" · Revente nette non évaluable : "+missing.length+
           " études sans minimum de quantité Spot attesté. "+
           "Une cotation ultérieure ne certifie pas une entrée passée. Aucun ordre autorisé.";
       }else{
         note=" · Revente nette PAPER : "+audit.checked+
           " filtre(s) théorique(s) satisfaits · "+unavailable.length+
           " sans preuve complète. Ce contrôle n'atteste ni l'exécution ni un gain.";
       }
     }else{
       note=" · Filtre de revente indisponible : source non conforme.";
     }
   }catch(_){note=" · Filtre de revente indisponible : aucune taille certifiée.";}
   text(target,"PAPER prospectif (citations de carnet uniquement) : "+
     data.positions.length+" études théoriques ouvertes · "+
     data.closures.length+" sorties théoriques après ≥48 h. "+
     "Aucun ordre ni remplissage réel ou simulé. Frais et glissement supposés."+note+"\n"+okxInfo+"\n"+prospective);
 }catch(e){text(target,"PAPER prospectif : "+String(e.message||e)+
   " · aucune position ni aucun gain affirmé.");}
}
async function identityStatus(){
 const target=document.getElementById("radar-contract-status");
 if(!target)return;
 try{
   const response=await fetch("../data/crypto/radar-opportunities/spot-identity-latest.json",{cache:"no-store"});
   if(!response.ok)throw Error("pas encore publiée");
   const data=validatedIdentity(await response.json());
   const t=Date.parse(data.collected_at_utc);
   if(!Number.isFinite(t)||Date.now()-t>36*3600000||t>Date.now()+60000)
     throw Error("preuve datée périmée ou future");
   text(target,"Identités publiques Spot : "+data.identity_proven_count+"/"+data.candidate_count+
     " contrats rapprochés au "+new Date(t).toLocaleString("fr-FR")+
     " · aucune entrée PAPER exécutée. Contrôle de carnet et des coûts encore nécessaire.");
 }catch(e){
   text(target,"Contrats Spot : "+String(e.message||e)+
     " · aucune identité nouvelle certifiée, aucune entrée PAPER autorisée.");
 }
}
async function load(){
 const s=document.getElementById("radar-spot-status");
 if(!s)return;
 try{
   const response=await fetch(FILE,{cache:"no-store"});
   if(!response.ok)throw Error("Archive indisponible (HTTP "+response.status+")");
   paint(await response.json(),document);
   await identityStatus();
   await shadowStatus();
   await signalEvidenceStatus();
 }catch(e){text(s,"Rapprochement indisponible : "+String(e.message||e)+
   ". Aucun résultat PAPER n'est supposé.");await identityStatus();await shadowStatus();await signalEvidenceStatus();}
}
if(typeof module==="object"&&module.exports)module.exports={valid,paint,okxSpotSummary,okxFollowupSummary,signalEvidenceSummary};
if(typeof document!=="undefined"){
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",load,{once:true});
 else void load();
}
})(typeof globalThis!=="undefined"?globalThis:this);
