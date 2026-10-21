/* ERITH.IA Trader · presentation only.
   Dedicated visual entrance + evidence ticket using the existing PAPER owner.
   Never reads secrets, requests OKX, creates orders or stores account data. */
(function(root){
"use strict";
const ID="erithTraderOrderEntry";
const EMPTY="—";
let node=null;
const str=value=>value===null||value===undefined||value===""?EMPTY:String(value);
function el(tag,className,text){
 const n=document.createElement(tag);
 if(className)n.className=className;
 if(text!==undefined)n.textContent=text;
 return n;
}
function field(name,caption){
 const n=el("div","erith-od-stat");
 n.append(el("span","",caption));
 const val=el("strong","",EMPTY);val.dataset.odField=name;n.append(val);
 return n;
}
function proof(name,caption){
 const n=el("div","");
 n.append(el("small","",caption));
 const val=el("strong","",EMPTY);val.dataset.odProof=name;n.append(val);
 return n;
}
function guard(kind){
 const n=el("section","erith-od-guard");n.dataset.odGuard=kind;
 n.dataset.level="pending";
 n.setAttribute("role","status");
 n.setAttribute("aria-live","polite");
 const title=el("strong","","Contrôle de quantité en attente");
 title.dataset.odGuardTitle=kind;
 const detail=el("p","","Relancer la vérification du ticket PAPER ; aucun ordre.");
 detail.dataset.odGuardDetail=kind;
 n.append(title,detail);return n;
}
// Reading-only decimal comparison: do not round or change the PAPER engine.
const SCALE=10n**12n;
function scaled(v){
 const s=String(v??"").trim().replace(",",".");
 if(!/^\d+(?:\.\d{1,12})?$/.test(s))return null;
 const [whole,frac=""]=s.split(".");
 return BigInt(whole)*SCALE+BigInt(frac.padEnd(12,"0"));
}
function shortfall(required,available){
 const a=scaled(required),b=scaled(available);
 if(a===null||b===null||a<=b)return null;
 const step=10n**6n; // display rounded UP to six USDC decimals
 const n=(a-b+step-1n)/step;
 const major=n/1000000n,minor=String(n%1000000n).padStart(6,"0").replace(/0+$/,"");
 return major+(minor?","+minor:"");
}
function setGuard(kind,title,detail,level){
 if(!node)return;
 const target=node.querySelector('[data-od-guard="'+kind+'"]');
 if(!target)return;
 target.dataset.level=level;
 const h=target.querySelector('[data-od-guard-title="'+kind+'"]');
 const p=target.querySelector('[data-od-guard-detail="'+kind+'"]');
 if(h)h.textContent=title;
 if(p)p.textContent=detail;
}
function updateGuards(ticket,review,preview,context){
 const min=scaled(ticket?.native_min_quantity);
 const gross=scaled(preview?.buy_quantity??ticket?.gross_buy_quantity);
 const netSell=scaled(preview?.maximum_sellable_base);
 if(min===null||min<=0n||gross===null){
  setGuard("buy","Règles de quantité à confirmer",
    "Aucune conclusion possible : paire CT/USDC, minSz ou quantité indisponible. Aucun ordre.","pending");
  setGuard("sell","Revente non évaluée",
    "Attendre des règles et une projection PAPER valides.","pending");
  return;
 }
 const minLabel=str(ticket.native_min_quantity);
 const note=ticket.native_rules_verified===true?
   "Règles publiques lues ; autres restrictions OKX non certifiées.":
   "Règles d'archive datée : actualisation OKX nécessaire.";
 const account=review?.account_verified===true&&review.available_trading_quote!==null;
 const accountGap=account?shortfall(ticket.minimum_buy_at_recorded_ask_quote,review.available_trading_quote):null;
 const budgetGap=shortfall(ticket.minimum_buy_at_recorded_ask_quote,ticket.study_budget_quote);
 const gates=context?.order_gates;
 const cap= context?.order_gates_verified===true&&gates?.account_max_verified===true?
   scaled(gates.maxBuy):null;
 if(gross<min){
  const reasons=[
   str(preview?.buy_quantity??ticket.gross_buy_quantity)+" CT projetés, alors que minSz = "+minLabel+" CT.",
   ticket.minimum_buy_at_recorded_ask_quote?
    "Coût brut indicatif pour "+minLabel+" CT au ask daté : "+ticket.minimum_buy_at_recorded_ask_quote+" USDC (hors frais en USDC).":null,
   budgetGap?"Écart avec le budget fictif : au moins "+budgetGap+" USDC.":null,
   accountGap?"Écart avec le solde Trading vérifié : au moins "+accountGap+" USDC.":null,
   cap!==null&&cap<min?"Plafond d'achat du compte inférieur à minSz au relevé daté.":null,
   note,"Aucun achat possible depuis ce ticket."
  ];
  setGuard("buy","Minimum d'achat non atteint",reasons.filter(Boolean).join(" "),"warning");
 }else{
  setGuard("buy","Minimum de quantité franchi en simulation",
   "Achat brut "+str(preview?.buy_quantity??ticket.gross_buy_quantity)+
   " CT ≥ minSz "+minLabel+" CT. "+note+
   " Cela ne certifie ni le notionnel, ni le solde, ni l'acceptation d'un ordre.","neutral");
 }
 if(netSell===null){
  setGuard("sell","Revente non évaluée",
   "Aucune projection nette exploitable : renseigner un prix de vente compatible puis vérifier. Aucun ordre.","pending");
 }else if(netSell<min||preview?.meets_native_exit_minimum===false){
  const estimate= ticket.minimum_gross_buy_to_resell_with_assumed_base_fee;
  const feeMode=review?.fee_mode_verified===true?review.fee_buy_currency:null;
  const illustrative=feeMode!=="USDC"&&estimate?
   "Sous l'hypothèse de 0,10 % de frais prélevés en CT, il faudrait environ "+
   estimate+" CT bruts (coût indicatif "+str(ticket.minimum_gross_buy_cost_at_ask_with_assumed_base_fee)+
   " USDC au ask daté), sans garantie des frais ou arrondis réels.":"";
  setGuard("sell","Revente en quantité minimale impossible",
   str(preview.maximum_sellable_base)+" CT revendables en simulation, sous minSz "+
   minLabel+" CT après frais et arrondi au lot. "+illustrative+
   " Le solde réellement détenu n'augmente pas : aucun achat ni vente réalisé.","warning");
 }else{
  const dust=preview?.residual_dust_base;
  setGuard("sell","Seuil de revente atteint en simulation",
   str(preview.maximum_sellable_base)+" CT ≥ "+minLabel+
   " CT ; résidu estimé : "+str(dust)+" CT. Prix de sortie, frais, notionnel et exécution non garantis.","neutral");
 }
}
function strip(name,caption){
 const n=el("div","");
 n.append(el("small","",caption));
 const val=el("strong","",EMPTY);val.dataset.odField=name;n.append(val);
 return n;
}
function side(heading,sideName,sub){
 const n=el("section","erith-od-side");n.dataset.side=sideName;
 const head=el("div","erith-od-sidehead");
 head.append(el("strong","",heading),el("span","",sub));
 n.append(head);
 return n;
}
function mount({quoteLabel,budgetLabel,exitLabel,compute}={}){
 if(node?.isConnected)return node;
 if(!quoteLabel||!budgetLabel||!exitLabel||!compute)return null;
 node=el("section","erith-order-desk erith-golden-ticket");node.id=ID;node.dataset.ready="false";
 node.setAttribute("aria-label","Ordre Spot CT/USDC · aperçu et contrôles");
 const head=el("header","erith-od-head");
 const identity=el("div","");
 identity.append(el("span","erith-gt-side-label","RECTO · FACE DE L'OPÉRATION"),
   el("span","erith-od-eyebrow","ERITH.IA · POSTE D'ORDRE SPOT"),
   el("strong","erith-gt-title","TICKET D'OR · CRYPTO"),
   el("strong","erith-od-pair","CT/USDC · LIMIT"));
 const modes=el("div","erith-od-modes");
 modes.append(el("span","erith-od-tag","PAPER · lecture seule"),
   el("span","erith-od-tag erith-od-lock","TRADE VERROUILLÉ"));
 head.append(identity,modes);
 const sides=el("div","erith-od-grid");
 const buy=side("ACHAT · CT","buy","COURS LIMIT · PROJECTION");
 const sell=side("VENTE · CT","sell","OBJECTIF HYPOTHÉTIQUE");
 const buyValues=el("div","erith-od-values");
 buyValues.append(field("buyPrice","Prix ask CT/USDC"),field("buyQty","Quantité projetée CT"),
   field("buyCost","Coût estimé USDC"),field("buyFee","Frais d'achat estimés"));
 const sellValues=el("div","erith-od-values");
 sellValues.append(field("sellQty","CT revendables estimés"),field("sellNet","Produit net hypothétique"),
   field("sellFee","Frais de vente estimés"),field("sellDust","Résidu CT"));
 buy.append(quoteLabel,budgetLabel,buyValues,guard("buy"));
 compute.classList.add("erith-od-cta");
 compute.textContent="Vérifier et préparer le ticket · aucun ordre";
 buy.append(compute,el("p","erith-od-note","Le contrôle ne transmet aucun achat à OKX."));
 sell.append(exitLabel,sellValues,guard("sell"),
   el("div","erith-od-inactive","Envoi d'ordre désactivé · autorisation Trade absente"),
   el("p","erith-od-note","Le prix de vente est une cible saisie, pas un prix garanti ni une instruction d'ordre."));
 sides.append(buy,sell);
 const band=el("div","erith-od-strip");
 band.append(strip("bid","Meilleur bid CT/USDC"),strip("ask","Meilleur ask CT/USDC"),
   strip("buyAvailable","USDC disponible Trading"),strip("sellAvailable","CT disponible à la vente"));
 const ev=el("details","erith-od-detail");ev.dataset.odEvidence="";
 ev.append(el("summary","","Ticket visuel · preuves et limites OKX"));
 const proofGrid=el("div","erith-od-proof");
 for(const [k,label] of [
  ["pair","Instrument & règlement"],["fresh","Origine du carnet"],
  ["rules","Règles de quantité/prix"],["maxbuy","Plafond achat (CT)"],
  ["feeMode","Devise des frais d'achat"],["checktime","Heure des limites du compte OKX"],
  ["funds","Solde Trading et budget"],["orders","Capacité de trading"]
 ])proofGrid.append(proof(k,label));
 ev.append(proofGrid);
 const chron=el("details","erith-od-detail");chron.dataset.odTimeline="";
 chron.append(el("summary","","Journal / chronologie du scénario PAPER"));
 const events=el("ol","erith-od-timeline");events.dataset.odEvents="";
 chron.append(events);
 const disclaimer=el("p","erith-od-disclaimer",
   "L'interface reprend les repères d'OKX sans reproduire ses autorisations. "+
   "Les projections viennent du ticket CT/USDC daté ; le graphique CT/USDT reste une source distincte. "+
   "Aucun ordre réel n'est envoyé par cette version.");
 // Two faces of one PAPER instrument: all existing live fields and controls
 // are MOVED, not cloned. This is strictly a presentation change.
 function face(which,label){
  const shell=el("article","erith-gt-face erith-gt-"+which);
  shell.setAttribute("aria-label",label);
  for(const corner of ["tl","tr","bl","br"]){
   const flourish=el("span","erith-gt-flourish erith-gt-"+corner,"❦");
   flourish.setAttribute("aria-hidden","true");shell.append(flourish);
  }
  const inner=el("div","erith-gt-inner");shell.append(inner);
  return {shell,inner};
 }
 const recto=face("recto","Recto du Ticket d'Or : achat, vente et cotations");
 const verso=face("verso","Verso du Ticket d'Or : preuves OKX et journal PAPER");
 recto.inner.append(head,sides,band);
 const hinge=el("div","erith-gt-hinge","✦");
 hinge.setAttribute("aria-hidden","true");
 const backTitle=el("header","erith-gt-back-title");
 backTitle.append(el("span","erith-gt-back-label","VERSO · CERTIFICAT PAPER"),
   el("strong","","PREUVES, LIMITES ET CHRONOLOGIE"),
   el("small","","La face justificative du même ticket"));
 const backGrid=el("div","erith-gt-back-grid");
 // Details stay collapsible; initial opening makes both halves of the
 // physical ticket readable on first visit.
 ev.open=true;chron.open=true;
 backGrid.append(ev,chron);
 const reports=el("div","erith-golden-back-reports");
 verso.inner.append(backTitle,backGrid,reports,disclaimer);
 node.append(recto.shell,hinge,verso.shell);
 reset();
 return node;
}
function set(key,value,group="odField"){
 if(!node)return;
 const item=node.querySelector('[data-'+(group==="odField"?"od-field":"od-proof")+'="'+key+'"]');
 if(item)item.textContent=str(value);
}
function reset(){
 if(!node)return;
 node.dataset.ready="false";
 const label=node.querySelector(".erith-od-pair");
 if(label)label.textContent="CT/USDC · LIMIT · à vérifier";
 for(const entry of node.querySelectorAll("[data-od-field],[data-od-proof]"))entry.textContent=EMPTY;
 set("orders","Non activée","odProof");
 set("pair","CT/USDC · LIMIT","odProof");
 set("fresh","Vérification nécessaire","odProof");
 set("checktime","En attente","odProof");
 setGuard("buy","Contrôle de quantité en attente",
   "Vérifier de nouveau : les anciennes projections ne sont plus valides.","pending");
 setGuard("sell","Contrôle de revente en attente",
   "Aucun chiffre précédent ne vaut confirmation pour cet actif.","pending");
 const events=node.querySelector("[data-od-events]");
 if(events)events.replaceChildren(el("li","","Aucun état PAPER pour ce ticket."));
}
function update({ticket,context,review,preview,bookDiagnostic,checkedAt}={}){
 if(!node)return;
 if(ticket?.pair!=="CT-USDC"||ticket?.orders_enabled!==false){
  reset();return;
 }
 const validBook=ticket.source_book_kind==="LOCAL_BACKEND_OKX_CT_USDC"&&bookDiagnostic?.accepted===true;
 node.dataset.ready=String(validBook);
 const header=node.querySelector(".erith-od-pair");
 if(header)header.textContent="CT/USDC · LIMIT";
 const hasPreview=preview?.maximum_sellable_base!==undefined&&preview?.orders_enabled===false;
 set("buyPrice",str(ticket.best_ask_quote)+" USDC");
 set("buyQty",hasPreview?str(preview.buy_quantity)+" CT":str(ticket.gross_buy_quantity)+" CT · provisoire");
 set("buyCost",hasPreview?str(preview.total_buy_cost_quote)+" USDC":str(ticket.hypothetical_buy_cost_quote)+" USDC · provisoire");
 const feeCurrency=review?.fee_mode_verified?review.fee_buy_currency:null;
 set("buyFee",hasPreview?
   (feeCurrency==="USDC"?str(preview.estimated_buy_fee_quote)+" USDC":
     feeCurrency==="CT"?str(preview.estimated_buy_fee_base)+" CT":
     "Hypothèse · devise inconnue"):"Non évalués");
 set("sellQty",hasPreview?str(preview.maximum_sellable_base)+" CT":"Non évalué");
 set("sellNet",hasPreview?str(preview.hypothetical_sale_net_quote)+" USDC":"Non évalué");
 set("sellFee",hasPreview?str(preview.hypothetical_sale_fee_quote)+" USDC":"Non évalués");
 set("sellDust",hasPreview?str(preview.residual_dust_base)+" CT":"Non évalué");
 set("bid",str(ticket.best_bid_quote)+" USDC");
 set("ask",str(ticket.best_ask_quote)+" USDC");
 const gates=context?.order_gates,account=review?.account_verified===true;
 set("buyAvailable",account&&review.available_trading_quote!==null?
   str(review.available_trading_quote)+" USDC":"Non confirmé");
 set("sellAvailable",gates?.available_verified?str(gates.availSell)+" CT":"Non confirmé");
 set("pair",gates?.account_eligible?"CT/USDC · règlement USDC reconnu":"CT/USDC · éligibilité à confirmer","odProof");
 set("fresh",validBook?"OKX local · récent (non garanti)":"Archive / carnet non qualifié","odProof");
 set("rules",ticket.native_rules_verified?
   "min "+str(ticket.native_min_quantity)+" CT · lot "+str(ticket.native_lot)+
   " CT · tick "+str(ticket.native_tick)+" USDC":"Règles natives non certifiées","odProof");
 set("maxbuy",context?.order_gates_verified&&gates?.maxBuy?
   str(gates.maxBuy)+" CT · relevé daté":"Non confirmé","odProof");
 set("feeMode",review?.fee_mode_verified?
   str(review.fee_buy_currency)+" · feeType "+str(review.fee_type):"Non confirmé","odProof");
 const evidenceTime=Date.parse(checkedAt||"");
 set("checktime",Number.isFinite(evidenceTime)?
   new Date(evidenceTime).toISOString():"Non confirmé","odProof");
 set("funds",account?
   (review.funds_cover_public_scenario?"Couverture du coût PAPER uniquement":"Couverture PAPER non démontrée"):
   "Compte non confirmé","odProof");
 set("orders","Aucun ordre possible · Trade désactivé","odProof");
 updateGuards(ticket,review,hasPreview?preview:null,context);
}
const descriptions={
 PAPER_PREPARE:"Préparation PAPER",PAPER_CONFIRM:"Soumission simulée",
 PAPER_ACCEPT:"Acceptation simulée",PAPER_REJECT:"Refus simulé",
 PAPER_FILL_PART:"Exécution partielle simulée",PAPER_FILL_REST:"Exécution complète simulée",
 PAPER_CANCEL:"Annulation simulée",PAPER_UNKNOWN:"Statut inconnu simulé",
 PAPER_RECONCILE_OPEN:"Rapprochement : ordre ouvert fictif",
 PAPER_RECONCILE_REJECT:"Rapprochement : rejet simulé",
 PAPER_RECONCILE_CANCEL:"Rapprochement : annulation simulée"
};
function updateCycle(state){
 if(!node)return;
 const target=node.querySelector("[data-od-events]");
 if(!target)return;
 target.replaceChildren();
 if(!state?.paper){target.append(el("li","","Aucun cycle PAPER engagé pour ce ticket."));return;}
 for(const evt of state.events||[]){
  const li=el("li","");
  li.append(el("strong","",descriptions[evt.type]||"Étape PAPER"),
    el("small","",str(evt.at)+" · aucun ordre OKX"));
  target.append(li);
 }
}
root.AgentCryptoTraderOrderEntryView=Object.freeze({mount,reset,update,updateCycle,realOrders:false,readOnly:true});
})(typeof globalThis!=="undefined"?globalThis:{});
