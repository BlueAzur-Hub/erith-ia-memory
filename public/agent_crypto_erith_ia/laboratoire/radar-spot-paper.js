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
async function load(){
 const s=document.getElementById("radar-spot-status");
 if(!s)return;
 try{
   const response=await fetch(FILE,{cache:"no-store"});
   if(!response.ok)throw Error("Archive indisponible (HTTP "+response.status+")");
   paint(await response.json(),document);
 }catch(e){text(s,"Rapprochement indisponible : "+String(e.message||e)+
   ". Aucun résultat PAPER n'est supposé.");}
}
if(typeof module==="object"&&module.exports)module.exports={valid,paint};
if(typeof document!=="undefined"){
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",load,{once:true});
 else void load();
}
})(typeof globalThis!=="undefined"?globalThis:this);
