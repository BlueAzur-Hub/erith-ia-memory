/* ERITH.IA Trader · Automatic read-only study INSIDE the existing PAPER laboratory.
   No timer, private account read, trading endpoint or independent market owner. */
(()=>{
"use strict";
const core=globalThis.AgentCryptoTraderPaperDecision;
const paper=globalThis.AgentCryptoPaperLabCore;
if(!core||!paper||typeof document==="undefined")return;
const ID="traderPaperDecision",BASE="../data/crypto/radar-opportunities/";
const safe=fn=>{try{return fn()}catch(_){return null}};
const fmt=(value,digits=3)=>Number.isFinite(value)?
 Number(value).toLocaleString("fr-FR",{maximumFractionDigits:digits}):"indisponible";
let requestId=0,lastStudyKey="",reportCache=null,reportAt=0,reportInFlight=null;
function selection(){
 const from=safe(()=>globalThis.AgentCryptoTraderPaperLab?.source?.());
 if(!from?.input)return{reason:from?.reason||
   "Graphique Solo 24 h non prêt : aucune série attribuée artificiellement."};
 const qualified=safe(()=>paper.qualify(from.input));
 if(!qualified?.ok)return{reason:qualified?.reason||
   "Données de prix ou identité non qualifiées."};
 return{input:from.input,qualified};
}
function panel(){return document.getElementById(ID)}
function result(){return panel()?.querySelector("[data-decision-result]")}
function historyTarget(){return panel()?.querySelector("[data-decision-history]")}
function collectorTarget(){return panel()?.querySelector("[data-decision-collector]")}
function renderSpot(out){
 const element=result();if(!element)return;
 const label={PREUVES_INSUFFISANTES:"PREUVES INSUFFISANTES · marché OKX",
  REJETER:"REJETER · seulement le billet PAPER 100 USDT",
  A_ETUDIER:"À ÉTUDIER · coûts de sortie PAPER seulement"}[out?.decision]||
  "PREUVES INSUFFISANTES";
 const lines=[label,out?.reason||"Dossier public indisponible."];
 if(out?.pair)lines.push("Paire : "+out.pair+" · carnet : "+out.book_at_utc);
 if(Number.isFinite(out?.break_even_bid_rise_pct)){
   lines.push("Hausse du bid estimée pour couvrir les coûts : ≈+"+
     fmt(out.break_even_bid_rise_pct)+" % (hypothèses, sans prévision).");
   lines.push("Sortie immédiate fictive : "+fmt(out.immediate_paper_loss_pct)+
     " % · ordre non exécuté.");
 }
 if(out?.assumptions)lines.push(out.assumptions);
 if(out?.context)lines.push(out.context);
 lines.push("Aucun ordre · aucun fill · aucune suggestion d'achat · aucune donnée privée.");
 element.textContent=lines.join("\n");
 element.dataset.decision=out?.decision||"PREUVES_INSUFFISANTES";
}
function assumptions(){
 const lab=document.getElementById("traderPaperLab");
 const keys=["capital","entryFeePct","exitFeePct","spreadPct","slippagePct"];
 const obj={};
 for(const k of keys){
   const raw=lab?.querySelector("[data-lab-"+k+"]")?.value;
   const val=Number(String(raw??"").replace(",","."));
   if(!Number.isFinite(val)||String(raw??"").trim()==="")
     return null;
   obj[k]=val;
 }
 return obj;
}
function renderHistory(s){
 const element=historyTarget();if(!element)return;
 if(!s.input||!s.qualified){
   element.textContent="ÉTUDE HISTORIQUE NON DISPONIBLE\n"+
     (s.reason||"Graphique ou actif non qualifié.")+
     "\nLe marché public reste consultable, sans ordre.";
   element.dataset.study="NOT_AVAILABLE";return;
 }
 const cfg=assumptions();
 if(!cfg){element.textContent="Étude historique : paramètres PAPER absents ou invalides.";
   element.dataset.study="NOT_AVAILABLE";return;}
 const key=s.qualified.sourceIdentity+"|"+s.qualified.lastAt+"|"+JSON.stringify(cfg);
 if(key===lastStudyKey)return;
 lastStudyKey=key;
 const study=safe(()=>paper.historicalStudy(s.input,cfg));
 const info=core.summarizeHistorical(study,s.qualified);
 if(info.status!=="HISTORICAL_ONLY"){
   element.textContent="ÉTUDE HISTORIQUE NON DISPONIBLE · "+
     (study?.reason||info.reason)+"\nAucune transaction ni performance inventée.";
   element.dataset.study="NOT_AVAILABLE";return;
 }
 element.textContent=[
   "ÉTUDE IMMÉDIATE · "+info.asset+" · 24 heures de cours USD",
   info.windows+" fenêtres de 60 min chevauchantes · "+
     fmt(info.positive_windows_pct,1)+" % positives après frais fictifs.",
   "Médiane : "+fmt(info.median_profit_notional_usd,5)+
     " USD notionnels par fenêtre pour "+fmt(info.capital_notional_usd,2)+" USD fictifs.",
   "Meilleure : "+fmt(info.best_profit_notional_usd,5)+
     " USD · pire : "+fmt(info.worst_profit_notional_usd,5)+" USD.",
   "Du "+info.source_from_utc+" au "+info.source_to_utc+".",
   info.reason,
   "Ce calcul lit le graphique actuel, pas un carnet OKX. Il ne suppose aucun gain réel."
 ].join("\n");
 element.dataset.study="HISTORICAL_ONLY";
}
async function reports(){
 if(reportCache&&Date.now()-reportAt<5*60000)return reportCache;
 if(reportInFlight)return reportInFlight;
 reportInFlight=(async()=>{
   const [qResp,sResp]=await Promise.all([
     fetch(BASE+"qualification-latest.json",{cache:"no-store"}),
     fetch(BASE+"signal-evidence.json",{cache:"no-store"})
   ]);
   if(!qResp.ok||!sResp.ok)throw Error("Rapports publics non disponibles");
   const [qualification,signal]=await Promise.all([qResp.json(),sResp.json()]);
   // A missing new prospective journal is NOT zero studies or an outage of history.
   const journal=await fetch(BASE+"okx-hurdle-followups.json",{cache:"no-store"})
     .then(r=>r.ok?r.json():null).catch(()=>null);
   return{qualification,signal,journal};
 })();
 try{
   const x=await reportInFlight;
   reportCache=x;reportAt=Date.now();return x;
 }finally{reportInFlight=null;}
}
async function evaluate(force=false){
 const container=panel();
 if(!container?.open||!document.getElementById("traderPaperLab")?.open)return;
 const s=selection();
 const key=s.qualified?s.qualified.sourceIdentity+"|"+s.qualified.lastAt:
   "unavailable|"+s.reason;
 if(!force&&key===container.dataset.lastSelection)return;
 container.dataset.lastSelection=key;
 const currentId=++requestId;
 renderHistory(s);
 if(!s.qualified){
   renderSpot({decision:"PREUVES_INSUFFISANTES",
     reason:s.reason||"Aucune sélection qualifiée."});
   return;
 }
 const target=result();if(target)target.textContent=
   "Diagnostic OKX : vérification du dernier rapport public…";
 try{
   const {qualification,signal,journal}=await reports();
   const collector=collectorTarget();
   if(collector){
     const valid=journal?.schema==="erith.radar.okx.hurdle-followups.v1"&&
       journal.orders_enabled===false&&journal.real_orders===0&&
       Array.isArray(journal.studies)&&Array.isArray(journal.snapshots);
     const count=valid?journal.studies.length:0;
     const follow=valid?journal.studies.reduce((n,s)=>n+(
       Array.isArray(s.followups)?s.followups.length:0),0):0;
     collector.textContent="Radar GitHub · dernière qualification : "+
       (qualification?.qualified_at_utc||"inconnue")+"\n"+
       (valid?("Journal OKX publié : "+count+" études PAPER datées · "+follow+
         " observations futures. Aucun fill certifié."):
         "Journal OKX encore absent : la publication automatique de sa première collecte reste à confirmer.")+
       "\nLes programmes GitHub sont planifiés ; leur présence ne prouve pas une collecte réussie.";
   }
   if(currentId!==requestId||!container.open)return;
   const latest=selection();
   if(!latest.qualified||latest.qualified.sourceIdentity!==s.qualified.sourceIdentity||
      latest.qualified.lastAt!==s.qualified.lastAt)return;
   renderSpot(core.assess({selected:latest.qualified,qualification,signal,
     engine:globalThis.AgentCryptoSpotPaperOrders,now:Date.now()}));
 }catch(_){
   if(currentId===requestId){const collector=collectorTarget();
     if(collector)collector.textContent="État du Radar : sources publiques momentanément inaccessibles.";
     renderSpot({decision:"PREUVES_INSUFFISANTES",
     reason:"Rapports publics Radar momentanément inaccessibles ; "+
      "l'étude historique ci-dessus reste disponible."});}
 }
}
function invalidate(){
 const box=panel();if(!box?.open)return;
 // A graph event is not proof of a changed coin. Compare the real source key
 // before invalidating: this prevents the spurious "Sélection modifiée" state.
 const s=selection();
 const next=s.qualified?s.qualified.sourceIdentity+"|"+s.qualified.lastAt:
   "unavailable|"+s.reason;
 if(next===box.dataset.lastSelection)return;
 requestId++;
 lastStudyKey="";
 void evaluate(false);
}
function mount(){
 const lab=document.getElementById("traderPaperLab");
 if(!lab||panel())return Boolean(lab);
 const parent=lab.querySelector(".pl-body");if(!parent)return false;
 const section=document.createElement("details");
 section.id=ID;section.className="pl-more";
 const summary=document.createElement("summary");
 summary.textContent="Diagnostic automatique · historique et Spot OKX · lecture seule";
 const content=document.createElement("div");
 const explanation=document.createElement("p");
 explanation.textContent="À l'ouverture, étudie automatiquement la crypto Solo 24 h "+
  "déjà qualifiée. L'historique utilise les prix USD du graphique et des frais "+
  "hypothétiques ; la possibilité de vendre sur OKX demande des preuves distinctes.";
 const history=document.createElement("pre");
 history.setAttribute("data-decision-history","");
 history.setAttribute("role","status");
 history.textContent="Étude du graphique en attente d'ouverture.";
 const label=document.createElement("p");
 label.textContent="Faisabilité du carnet OKX/USDT (lecture des derniers rapports publics) :";
 const button=document.createElement("button");
 button.type="button";button.textContent="Actualiser l'analyse";
 button.setAttribute("data-decision-evaluate","");
 const collector=document.createElement("pre");
 collector.setAttribute("data-decision-collector","");
 collector.textContent="Collectes GitHub : état en attente de vérification publique.";
 const evidence=document.createElement("pre");
 evidence.setAttribute("data-decision-result","");
 evidence.setAttribute("role","status");evidence.setAttribute("aria-live","polite");
 evidence.textContent="Preuves Spot OKX en attente. Aucun ordre.";
 content.append(explanation,history,label,button,collector,evidence);
 section.append(summary,content);
 const other=parent.querySelector(".pl-more");
 if(other)parent.insertBefore(section,other);else parent.appendChild(section);
 button.addEventListener("click",()=>{lastStudyKey="";void evaluate(true);});
 section.addEventListener("toggle",()=>{if(section.open){lastStudyKey="";
   void evaluate(true);}else requestId++;});
 for(const event of ["agent-crypto:selected-market-changed",
   "agent-crypto:new-listing-line-ready","agent-crypto:workspace-restored",
   "agent-crypto:graph-context-ready"])
   globalThis.addEventListener(event,invalidate,{passive:true});
 const controls=lab.querySelector(".pl-fields");
 controls?.addEventListener("change",()=>{lastStudyKey="";
   if(section.open)void evaluate(true);});
 return true;
}
globalThis.AgentCryptoTraderPaperDecisionView=Object.freeze({
 mount,evaluate,realOrders:false,accountAccess:false,readOnly:true,
 snapshot:()=>({mounted:!!panel(),active:!!panel()?.open,
   historical:historyTarget()?.dataset.study||null,
   result:result()?.dataset.decision||null})
});
if(document.readyState==="loading")
 document.addEventListener("DOMContentLoaded",mount,{once:true});
else mount();
})();