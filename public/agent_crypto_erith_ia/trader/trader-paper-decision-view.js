/* ERITH.IA Trader · Read-only diagnostic INSIDE the existing PAPER laboratory. */
(()=>{
"use strict";
const core=globalThis.AgentCryptoTraderPaperDecision;
const paper=globalThis.AgentCryptoPaperLabCore;
if(!core||!paper||typeof document==="undefined")return;
const ID="traderPaperDecision";
const BASE="../data/crypto/radar-opportunities/";
const safe=fn=>{try{return fn()}catch(_){return null}};
function selected(){
 const source=safe(()=>globalThis.AgentCryptoTraderPaperLab?.source?.());
 if(!source?.input)return null;
 const qualified=safe(()=>paper.qualify(source.input));
 return qualified?.ok?qualified:null;
}
function render(out){
 const element=document.getElementById(ID)?.querySelector("[data-decision-result]");
 if(!element)return;
 const label={PREUVES_INSUFFISANTES:"PREUVES INSUFFISANTES",
 REJETER:"REJETER · uniquement le scénario fictif de 100 USDT",
 A_ETUDIER:"À ÉTUDIER · scénario de coût uniquement"}[out?.decision]||
 "PREUVES INSUFFISANTES";
 const lines=[label,out?.reason||"Diagnostic indisponible."];
 if(out?.pair)lines.push("Paire : "+out.pair+" · carnet "+out.book_at_utc);
 if(Number.isFinite(out?.break_even_bid_rise_pct)){
   lines.push("Hausse du bid nécessaire à l'équilibre : ≈ +"+
      out.break_even_bid_rise_pct.toFixed(3)+" % selon les hypothèses.");
   lines.push("Aller-retour immédiat PAPER : "+
      Number(out.immediate_paper_loss_pct).toFixed(3)+" % sur le billet fictif.");
 }
 if(out?.assumptions)lines.push(out.assumptions);
 if(out?.context)lines.push(out.context);
 lines.push("Aucun achat conseillé · aucun ordre · aucun fill · aucune donnée privée.");
 element.textContent=lines.join("\n");
 element.dataset.decision=out?.decision||"PREUVES_INSUFFISANTES";
}
let requestId=0;
async function evaluate(){
 const key=++requestId,entry=selected();
 if(!entry){
   render(core.assess({selected:null}));
   return;
 }
 const element=document.getElementById(ID)?.querySelector("[data-decision-result]");
 if(element)element.textContent="Lecture des rapports publics datés…";
 try{
   const [qResp,sResp]=await Promise.all([
     fetch(BASE+"qualification-latest.json",{cache:"no-store"}),
     fetch(BASE+"signal-evidence.json",{cache:"no-store"})
   ]);
   if(!qResp.ok||!sResp.ok)throw Error("Rapports publics non disponibles");
   const [qualification,signal]=await Promise.all([qResp.json(),sResp.json()]);
   // Latest selection wins: a prior network response must not replace a new asset.
   const current=selected();
   if(key!==requestId||!current||current.sourceIdentity!==entry.sourceIdentity)return;
   render(core.assess({selected:current,qualification,signal,
     engine:globalThis.AgentCryptoSpotPaperOrders,now:Date.now()}));
 }catch(_){
   if(key===requestId)render(core.assess({selected:entry}));
 }
}
function invalidate(){
 requestId++;
 const container=document.getElementById(ID);
 if(container?.open){
   const e=container.querySelector("[data-decision-result]");
   if(e)e.textContent="Sélection modifiée : relancer l'analyse pour obtenir des preuves correspondant au graphique.";
 }
}
function mount(){
 const lab=document.getElementById("traderPaperLab");
 if(!lab||document.getElementById(ID))return Boolean(lab);
 const parent=lab.querySelector(".pl-body");
 if(!parent)return false;
 const section=document.createElement("details");
 section.id=ID;section.className="pl-more";
 const summary=document.createElement("summary");
 summary.textContent="Diagnostic Spot OKX · actif du graphique · lecture seule";
 const content=document.createElement("div");
 const explanation=document.createElement("p");
 explanation.textContent="Utilise seulement le graphique Solo 24 h USD qualifié et les preuves publiques Radar/OKX. Un carnet archivé n'est pas un prix actuel ; aucune recommandation d'achat.";
 const button=document.createElement("button");
 button.type="button";button.textContent="Évaluer l'actif sélectionné";
 button.setAttribute("data-decision-evaluate","");
 const result=document.createElement("pre");
 result.setAttribute("data-decision-result","");
 result.setAttribute("role","status");
 result.setAttribute("aria-live","polite");
 result.textContent="Ouvrir le diagnostic puis évaluer la sélection. Aucune requête tant que ce panneau est fermé.";
 content.append(explanation,button,result);
 section.append(summary,content);
 const more=parent.querySelector(".pl-more");
 if(more)parent.insertBefore(section,more);
 else parent.appendChild(section);
 button.addEventListener("click",evaluate);
 section.addEventListener("toggle",()=>{if(section.open)evaluate();else requestId++;});
 for(const event of ["agent-crypto:selected-market-changed",
   "agent-crypto:new-listing-line-ready","agent-crypto:workspace-restored"])
   globalThis.addEventListener(event,invalidate,{passive:true});
 return true;
}
globalThis.AgentCryptoTraderPaperDecisionView=Object.freeze({
 mount,evaluate,realOrders:false,accountAccess:false,readOnly:true,
 snapshot:()=>({mounted:!!document.getElementById(ID),
   result:document.getElementById(ID)?.querySelector("[data-decision-result]")?.dataset.decision||null})
});
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",mount,{once:true});
else mount();
})();