/* ERITH.IA Radar20 — preuve publique, lecture seule, sans compte/ordre. */
(() => {
"use strict";
const ROOT="https://raw.githubusercontent.com/BlueAzur-Hub/erith-ia-memory/main/public/agent_crypto_erith_ia/data/trader_flux/radar20_forward/";
const SHA=/^[0-9a-f]{64}$/i;
const VARIANTS=["A_0.8","A_1.2","A_1.6","B_0.8","B_1.2","B_1.6"];
function num(v,name){if(typeof v!=="number"||!Number.isFinite(v))throw Error("Valeur non contrôlée : "+name);return v;}
function evaluate(protocol,index,summary){
  if(protocol?.schema!=="erith.trader.radar20.forward-protocol.v1"||
    index?.schema!=="erith.radar20.forward.index.v1"||
    summary?.schema!=="erith.radar20.forward.summary.v1")throw Error("Schéma de source inattendu");
  if(protocol.simulation_only!==true||protocol.trading_orders_enabled!==false||
    index.orders_enabled!==false||summary.no_live_orders!==true||
    protocol.strategy_certified!==false||summary.strategy_certified!==false)
    throw Error("Contrat recherche seule non confirmé");
  if(!SHA.test(index.config_sha256||"")||summary.protocol_sha256!==index.config_sha256)
    throw Error("Contrat SHA-256 incohérent");
  if(!Array.isArray(protocol.symbols)||protocol.symbols.length!==20||
    new Set(protocol.symbols).size!==20||protocol.test_days!==90||
    protocol.holding_hours!==48)throw Error("Paramètres de recherche modifiés");
  if(!Array.isArray(index.days)||index.days.length>92||
    num(summary.days_collected,"days_collected")!==index.days.length||
    summary.hours_per_market!==index.days.length*24)throw Error("Compteurs de journées incohérents");
  if(index.days.some((d,i)=>!(/^\d{4}-\d{2}-\d{2}$/.test(d.day||""))||
    !SHA.test(d.sha256||"")||d.file!=="observations/"+d.day+".json"||
    (i>0&&d.day<=index.days[i-1].day)))throw Error("Index journées non conforme");
  const rows=VARIANTS.map(key=>{
    const v=summary.variants?.[key];
    if(!v||!Number.isInteger(v.signals)||v.signals<0||
      !Number.isInteger(v.closed_trades)||v.closed_trades<0||
      !Number.isInteger(v.open_positions)||v.open_positions<0)throw Error("Variante invalide : "+key);
    return {name:key.startsWith("A")?"A · modèle initial":"B · filtre tendance",
      cost:num(v.cost_pct,key+" cost"),signals:v.signals,open:v.open_positions,
      closed:v.closed_trades,equity:num(v.equity_usdt,key+" equity"),
      pnl:num(v.realized_usdt,key+" realized"),
      drawdown:num(v.worst_drawdown_usdt,key+" drawdown")};
  });
  return {days:index.days.length,signalsDays:Math.min(index.days.length,90),
    lastDay:index.days.at(-1)?.day||null,status:String(summary.status||"INCONNU"),
    rows,closed:rows.reduce((n,r)=>n+r.closed,0),
    protocolSha:index.config_sha256,
    summarySha:index.outputs?.find(v=>v.file==="summary.json")?.sha256||null};
}

function evaluatePositions(protocol,index,summary,details){
 if(details?.schema!=="erith.radar20.forward.positions.v1"||
    details.simulation_only!==true||details.orders_enabled!==false||
    details.protocol_sha256!==index.config_sha256||
    details.days_collected!==index.days.length)throw Error("Positions PAPER non concordantes");
 const last=index.days.length?Date.parse(index.days.at(-1).day+"T23:00:00Z"):null;
 if(details.last_archived_hour_ms!==last)throw Error("Heure d'archive des positions incohérente");
 const result={};
 for(const key of VARIANTS){
   const variant=summary.variants?.[key],row=details.variants?.[key];
   if(!variant||!row||row.cost_pct!==variant.cost_pct||
      !Array.isArray(row.open)||!Array.isArray(row.recent_closed)||
      row.open.length!==variant.open_positions||row.open.length>4||
      row.closed_count!==variant.closed_trades||row.recent_closed.length>12||
      row.recent_closed.length>row.closed_count)
      throw Error("Comptes de positions incompatibles : "+key);
   const seen=new Set();
   for(const p of row.open){
     const asset=protocol.symbols?.find(sym=>p.pair===sym+"USDT");
     if(!asset||seen.has(asset)||
       !Number.isInteger(p.entry_ms)||!Number.isInteger(p.planned_exit_ms)||
       p.entry_ms>last||p.planned_exit_ms!==p.entry_ms+protocol.holding_hours*3600000||
       ![p.entry_price_usdt,p.last_close_usdt,p.paper_ticket_usdt,p.paper_value_usdt,
         p.paper_unrealized_usdt,p.estimated_fee_impact_usdt].every(Number.isFinite)||
       p.entry_price_usdt<=0||p.last_close_usdt<=0||p.paper_ticket_usdt!==protocol.ticket_usdt||
       p.paper_value_usdt<0||p.estimated_fee_impact_usdt<0||
       Math.abs(p.paper_value_usdt-p.paper_ticket_usdt-p.paper_unrealized_usdt)>.00002)
       throw Error("Preuve de position invalide : "+key);
     seen.add(asset);
   }
   if(Math.abs(row.open.reduce((n,p)=>n+p.paper_unrealized_usdt,0)-variant.unrealized_usdt)>.005)
      throw Error("Résultats latents non rapprochés : "+key);
   for(const t of row.recent_closed){
     if(!protocol.symbols?.some(sym=>t.pair===sym+"USDT")||
        !Number.isInteger(t.entry_ms)||!Number.isInteger(t.exit_ms)||
        t.exit_ms!==t.entry_ms+protocol.holding_hours*3600000||
        t.exit_ms>last||!Number.isFinite(t.pnl_net_usdt))
       throw Error("Clôture fictive non concordante : "+key);
   }
   result[key]=row;
 }
 return result;
}


/* Evidence-oriented interpretation, not a strategy or order recommendation. */
function evaluateDecisionAnalysis(protocol,summary,key,ledger){
 if(protocol?.schema!=="erith.trader.radar20.forward-protocol.v1"||
    protocol.simulation_only!==true||protocol.trading_orders_enabled!==false||
    protocol.taker_buy_threshold_pct!==50||protocol.market_trend_threshold_pct!==3||
    protocol.trend_lookback_hours!==72||protocol.volume_median_lookback_hours!==24)
    throw Error("Critères scientifiques du protocole non confirmés");
 const v=summary?.variants?.[key];
 if(!VARIANTS.includes(key)||!v||!ledger||!Array.isArray(ledger.open)||
    !Array.isArray(ledger.recent_closed))throw Error("Variante d'analyse absente");
 const r=v.rejected;
 if(!r||!["filter","existing","capacity","cash"].every(k=>Number.isInteger(r[k])&&r[k]>=0)||
    !Number.isInteger(v.signals)||!Number.isInteger(v.open_positions)||
    !Number.isInteger(v.closed_trades))
    throw Error("Motifs de refus incomplets");
 const accepted=v.open_positions+v.closed_trades;
 if(accepted+Object.values(r).reduce((s,n)=>s+n,0)!==v.signals)
    throw Error("Signaux et motifs non rapprochés");
 const positions=[
   ...ledger.open.map(p=>({state:"Ouverte",item:p})),
   ...ledger.recent_closed.slice().reverse().map(p=>({state:"Clôturée",item:p}))
 ];
 const traces=positions.map(({state,item})=>{
   const vals=[item.buy_share_pct,item.volume_vs_median_24h,item.market_trend_72h_pct];
   const available=vals.every(x=>x!==undefined);
   if(available&&(!vals.every(Number.isFinite)||vals[0]<50||vals[0]>100||
      vals[1]<=1||vals[2]<-100))
      throw Error("Preuves d'entrée PAPER incohérentes");
   return {state,pair:item.pair,available,share:available?vals[0]:null,
     volumeRatio:available?vals[1]:null,trend:available?vals[2]:null,
     passesB:available?vals[2]>=3:null};
 });
 return {signals:v.signals,accepted,rejected:r,traces};
}


/* Comparative PAPER reporting; uses the already verified indexed summary and ledger. */
function evaluateComparison(protocol,index,summary,positions){
 const state=evaluate(protocol,index,summary);
 const ledger=evaluatePositions(protocol,index,summary,positions);
 const initial=num(protocol.capital_usdt,"capital initial");
 if(initial!==400||summary.fee_costs_hypothetical!==true||
    summary.okx_account_fee_not_available!==true)
    throw Error("Hypothèses du bilan PAPER non confirmées");
 const rows=VARIANTS.map(key=>{
   const v=summary.variants[key],proof=ledger[key],model=key[0];
   const assumed=Number(key.slice(2));
   if(v.model!==(model==="A"?"A_original":"B_trend_3pct")||
      v.cost_pct!==assumed||proof.closed_count!==v.closed_trades||
      !Number.isInteger(v.wins)||v.wins<0||v.wins>v.closed_trades||
      !Number.isInteger(v.closed_trades)||v.closed_trades<0||
      !Number.isInteger(v.open_positions)||v.open_positions<0||v.open_positions>4||
      ![v.realized_usdt,v.unrealized_usdt,v.equity_usdt,v.worst_drawdown_usdt].every(Number.isFinite)||
      v.worst_drawdown_usdt<0||
      Math.abs(v.equity_usdt-initial-v.realized_usdt-v.unrealized_usdt)>.01)
      throw Error("Bilan financier incohérent : "+key);
   // Complete trade history is in trades_A/B.json; last twelve only here.
   if(v.closed_trades<=12&&Math.abs(proof.recent_closed.reduce((s,t)=>s+t.pnl_net_usdt,0)-v.realized_usdt)>.005)
      throw Error("Clôtures PAPER non rapprochées : "+key);
   return {key,model,cost:v.cost_pct,closed:v.closed_trades,wins:v.wins,
     rate:v.closed_trades?100*v.wins/v.closed_trades:null,
     realized:v.realized_usdt,unrealized:v.unrealized_usdt,
     equity:v.equity_usdt,drawdown:v.worst_drawdown_usdt,
     rejected:v.rejected};
 });
 const a=rows.find(x=>x.key==="A_0.8"),b=rows.find(x=>x.key==="B_0.8");
 const aCostRange=a.equity-rows.find(x=>x.key==="A_1.6").equity;
 const bCostRange=b.equity-rows.find(x=>x.key==="B_1.6").equity;
 return {days:state.days,rows,allClosed:rows.reduce((s,r)=>s+r.closed,0),
   aClosed:a.closed,bClosed:b.closed,aCostRange,bCostRange};
}

if(typeof module!=="undefined"&&module.exports)module.exports=Object.freeze({evaluate,evaluatePositions,evaluateDecisionAnalysis,evaluateComparison});
if(typeof document==="undefined")return;
const id=x=>document.getElementById(x);
const show=(name,v)=>{id(name).textContent=v;};
const number=(v,d=2)=>new Intl.NumberFormat("fr-FR",{minimumFractionDigits:d,maximumFractionDigits:d}).format(v);
async function source(name){
  const r=await fetch(ROOT+name,{cache:"no-store",credentials:"omit",mode:"cors"});
  if(!r.ok)throw Error("Fichier indisponible : "+name+" (HTTP "+r.status+")");
  return r.text();
}
async function checksum(s){
  if(!globalThis.crypto?.subtle)throw Error("SHA-256 indisponible dans ce navigateur");
  const hash=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s));
  return Array.from(new Uint8Array(hash),v=>v.toString(16).padStart(2,"0")).join("");
}
function fillTable(rows){
  const tbody=id("variants");tbody.replaceChildren();
  for(const r of rows){
    const tr=document.createElement("tr");
    for(const [text,cls] of [[r.name,""],[number(r.cost,1)+" %",""],
       [String(r.signals),""],[String(r.open),""],[String(r.closed),""],
       [number(r.equity)+" USDT",""],[number(r.pnl)+" USDT",r.pnl>0?"pos":r.pnl<0?"neg":""],
       [number(r.drawdown)+" USDT",""]]){
      const td=document.createElement("td");td.textContent=text;
      if(cls)td.className=cls;tr.append(td);
    }
    tbody.append(tr);
  }
}

let verifiedPositions=null,verifiedProtocol=null,verifiedSummary=null,verifiedIndex=null,verifiedPositionDocument=null;
function dateUTC(ms){return new Intl.DateTimeFormat("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false,timeZone:"UTC"}).format(new Date(ms))+" UTC";}
function fillCells(tbody,rows){
 tbody.replaceChildren();
 for(const row of rows){
   const tr=document.createElement("tr");
   for(const [value,cls] of row){
     const td=document.createElement("td");td.textContent=value;
     if(cls)td.className=cls;tr.append(td);
   }
   tbody.append(tr);
 }
}
function renderPositions(){
 const key=id("position-variant").value;
 const row=verifiedPositions?.[key];
 if(!row)return;
 const open=row.open.map(p=>[
   [p.pair.replace(/USDT$/,""),""],[dateUTC(p.entry_ms),""],
   [dateUTC(p.planned_exit_ms),""],
   [number(p.entry_price_usdt,p.entry_price_usdt<.001?8:4)+" USDT",""],
   [number(p.last_close_usdt,p.last_close_usdt<.001?8:4)+" USDT",""],
   [number(p.paper_value_usdt)+" USDT",""],
   [number(p.estimated_fee_impact_usdt)+" USDT",""],
   [number(p.paper_unrealized_usdt)+" USDT",p.paper_unrealized_usdt<0?"neg":p.paper_unrealized_usdt>0?"pos":""]
 ]);
 fillCells(id("position-open"),open);
 const recent=row.recent_closed.slice().reverse().map(t=>[
   [t.pair.replace(/USDT$/,""),""],[dateUTC(t.entry_ms),""],
   [dateUTC(t.exit_ms),""],
   [number(t.pnl_net_usdt)+" USDT",t.pnl_net_usdt<0?"neg":t.pnl_net_usdt>0?"pos":""]
 ]);
 fillCells(id("position-closed"),recent);
 show("positions-status","Modèle "+key.replace("_"," · coûts A/R " ).replace(".",",")+" % · "+
   row.open.length+" position(s) ouverte(s), "+row.closed_count+" clôturée(s). "+
   "Valorisation à la dernière bougie archivée, non aux cours live.");
 show("open-note",open.length?"Positions encore ouvertes · sorties futures seulement théoriques.":"Aucune position ouverte pour cette variante.");
 show("closed-note",recent.length?"Dernières clôtures fictives, calculées sur bougies archivées.":"Aucune transaction fictive clôturée pour cette variante.");
 renderDecisionAnalysis();
}


function renderDecisionAnalysis(){
 const key=id("position-variant").value;
 const row=verifiedPositions?.[key];
 if(!row||!verifiedProtocol||!verifiedSummary){
   fillCells(id("analysis-entries"),[]);
   show("analysis-status","Analyse indisponible sans preuve PAPER validée.");
   show("analysis-note","—");
   return;
 }
 try{
   const a=evaluateDecisionAnalysis(verifiedProtocol,verifiedSummary,key,row);
   show("analysis-status",a.signals+" signaux candidats · "+a.accepted+
     " entrées PAPER · refus : "+a.rejected.filter+" tendance, "+
     a.rejected.existing+" position existante, "+
     a.rejected.capacity+" plafond de 4, "+a.rejected.cash+" trésorerie.");
   fillCells(id("analysis-entries"),a.traces.map(t=>[
     [t.pair.replace(/USDT$/,""),""],[t.state,""],
     [t.available?number(t.share,2)+" %":"Non archivé",""],
     [t.available?number(t.volumeRatio,2)+" ×":"Non archivé",""],
     [t.available?number(t.trend,2)+" %":"Non archivé",""],
     [t.available?(t.passesB?"Seuil B franchi*":"Refus du filtre B"):"Non vérifiable",""]
   ]));
   const missing=a.traces.filter(x=>!x.available).length;
   show("analysis-note",a.traces.length?
     (missing?"La trace détaillée de "+missing+" entrée(s) attend la prochaine collecte ; aucun motif individuel n'est inventé. ":
      "Les critères proviennent du moteur PAPER et de la bougie précédant chaque entrée. ")+
     "* Franchir le seuil B ne garantit pas qu'une place ou de la trésorerie soit disponible.":
     "Aucune entrée pour cette variante. Les motifs de refus agrégés restent vérifiables.");
 }catch(e){
   fillCells(id("analysis-entries"),[]);
   show("analysis-status","Analyse refusée : "+String(e?.message||e).slice(0,150));
   show("analysis-note","Aucun diagnostic sans compteurs cohérents.");
 }
}


function renderComparison(){
 if(!verifiedProtocol||!verifiedIndex||!verifiedSummary||!verifiedPositionDocument){
   fillCells(id("comparison-rows"),[]);
   show("comparison-status","En attente de positions PAPER cohérentes et contrôlées par SHA-256.");
   show("comparison-costs","—");show("comparison-refusals","—");
   return;
 }
 try{
   const result=evaluateComparison(verifiedProtocol,verifiedIndex,verifiedSummary,verifiedPositionDocument);
   fillCells(id("comparison-rows"),result.rows.map(r=>[
     [r.model==="A"?"A · initial":"B · filtre tendance",""],
     [number(r.cost,1)+" %",""],[String(r.closed),""],[r.closed?String(r.wins):"—",""],
     [r.rate===null?"—":number(r.rate,1)+" %",""],
     [number(r.realized)+" USDT",r.realized<0?"neg":r.realized>0?"pos":""],
     [number(r.unrealized)+" USDT",r.unrealized<0?"neg":r.unrealized>0?"pos":""],
     [number(r.equity)+" USDT",""],[number(r.drawdown)+" USDT",""]
   ]));
   const enough=result.allClosed>0&&result.aClosed>0&&result.bClosed>0;
   show("comparison-status",result.allClosed===0?
     result.days+" journée(s) archivée(s) · aucune transaction fictive clôturée : bilan en attente, aucun modèle gagnant.":
     result.days+" journée(s) archivée(s) · "+result.aClosed+
     " clôture(s) modèle A et "+result.bClosed+" modèle B (par scénario de frais). "+
     (enough?"Comparaison exploratoire, sans verdict de rentabilité.":"Comparaison des performances non concluante : les deux modèles n'ont pas encore de clôtures."));
   show("comparison-costs","Sensibilité des capitaux estimés aux scénarios de coûts A/R 0,8 % et 1,6 % : "+
     "A : "+number(result.aCostRange)+" USDT ; B : "+number(result.bCostRange)+
     " USDT. Ces écarts intègrent les effets possibles sur les trajectoires de portefeuille, pas uniquement les commissions.");
   const a=result.rows.find(r=>r.key==="A_0.8"),b=result.rows.find(r=>r.key==="B_0.8");
   const rej=r=>r.rejected||{};
   show("comparison-refusals","Motifs de refus (scénario 0,8 %, comptés par signal candidat) : "+
     "A · plafond "+(rej(a).capacity??"—")+", position existante "+(rej(a).existing??"—")+
     " ; B · filtre tendance "+(rej(b).filter??"—")+
     ". Ces refus ne sont ni des transactions perdues ni des occasions de gain prouvées.");
 }catch(e){
   fillCells(id("comparison-rows"),[]);
   show("comparison-status","Bilan refusé : "+String(e?.message||e).slice(0,160));
   show("comparison-costs","—");show("comparison-refusals","—");
 }
}

let loading=false;
async function refresh(){
 if(loading)return;loading=true;id("refresh").disabled=true;show("verification","Contrôle des sources et SHA-256…");
 try{
  const [p,i,s]=await Promise.all([source("experiment.json"),source("index.json"),source("summary.json")]);
  const protocol=JSON.parse(p),index=JSON.parse(i),summary=JSON.parse(s);
  const data=evaluate(protocol,index,summary);
  if(await checksum(p)!==data.protocolSha||!SHA.test(data.summarySha||"")||
     await checksum(s)!==data.summarySha)throw Error("Empreinte protocole / résumé différente : chiffres refusés");
  show("days",data.signalsDays+" / 90");show("archives",data.days+" / 92 max.");
  show("closed",String(data.closed));show("last-day",data.lastDay||"Aucune");
  show("state",data.status);fillTable(data.rows);
  verifiedPositions=null;verifiedProtocol=protocol;verifiedSummary=summary;verifiedIndex=index;verifiedPositionDocument=null;renderComparison();
  const detailMeta=index.outputs?.find(item=>item.file==="positions.json");
  if(!detailMeta){
    show("positions-status","Détails des décisions non publiés dans cette génération d'archives ; en attente de la prochaine collecte.");
    fillCells(id("position-open"),[]);fillCells(id("position-closed"),[]);
    show("open-note","—");show("closed-note","—");renderDecisionAnalysis();renderComparison();
  }else{
    try{
      const raw=await source("positions.json");
      if(!SHA.test(detailMeta.sha256||"")||await checksum(raw)!==detailMeta.sha256)
        throw Error("SHA-256 des positions différent de l'index");
      const positionDocument=JSON.parse(raw);
      verifiedPositions=evaluatePositions(protocol,index,summary,positionDocument);
      verifiedPositionDocument=positionDocument;
      renderPositions();renderComparison();
    }catch(err){
      show("positions-status","Détails PAPER non validés : "+String(err?.message||err).slice(0,160));
      fillCells(id("position-open"),[]);fillCells(id("position-closed"),[]);
      show("open-note","Aucune position affichée sans preuve validée.");show("closed-note","—");renderDecisionAnalysis();renderComparison();
    }
  }
  show("observation",data.closed===0?"Aucune transaction simulée clôturée : cela ne prouve ni gain ni perte.":"Transactions fictives seulement : frais estimés, aucune exécution OKX prouvée.");
  show("verification","Protocole et résumé contrôlés par SHA-256 · "+new Date().toLocaleString("fr-FR")+
    ". Les fichiers quotidiens ne sont pas retéléchargés ici ; leur intégrité relève du contrôle scientifique GitHub Actions.");
 }catch(e){
   ["days","archives","closed","last-day","state"].forEach(n=>show(n,"—"));
   id("variants").replaceChildren();verifiedPositions=null;verifiedProtocol=null;verifiedSummary=null;verifiedIndex=null;verifiedPositionDocument=null;fillCells(id("position-open"),[]);fillCells(id("position-closed"),[]);renderDecisionAnalysis();renderComparison();
   show("positions-status","Sources du Journal non validées.");show("open-note","—");show("closed-note","—");
   show("observation","Aucune conclusion sans preuve cohérente.");
   show("verification","Lecture non validée : "+String(e?.message||e).slice(0,190));
 }finally{loading=false;id("refresh").disabled=false;}
}
function boot(){id("refresh").addEventListener("click",refresh);id("position-variant").addEventListener("change",renderPositions);void refresh();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});
else boot();
})();