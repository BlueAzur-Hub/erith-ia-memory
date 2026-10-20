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
 node=el("section","erith-order-desk");node.id=ID;node.dataset.ready="false";
 node.setAttribute("aria-label","Ordre Spot CT/USDC · aperçu et contrôles");
 const head=el("header","erith-od-head");
 const identity=el("div","");
 identity.append(el("span","erith-od-eyebrow","ERITH.IA · POSTE D'ORDRE SPOT"),
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
 buy.append(quoteLabel,budgetLabel,buyValues);
 compute.classList.add("erith-od-cta");
 compute.textContent="Vérifier et préparer le ticket · aucun ordre";
 buy.append(compute,el("p","erith-od-note","Le contrôle ne transmet aucun achat à OKX."));
 sell.append(exitLabel,sellValues,
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
  ["feeMode","Devise des frais d'achat"],["checktime","Instant du contrôle"],
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
 node.append(head,sides,band,ev,chron,disclaimer);
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
 set("checktime",checkedAt?new Date(checkedAt).toISOString():"Non disponible","odProof");
 set("funds",account?
   (review.funds_cover_public_scenario?"Couverture du coût PAPER uniquement":"Couverture PAPER non démontrée"):
   "Compte non confirmé","odProof");
 set("orders","Aucun ordre possible · Trade désactivé","odProof");
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
