/* ERITH.IA Trader · Pure PAPER decision reading, no I/O and no trading. */
(function(root,factory){"use strict";const api=factory();
 if(typeof module==="object"&&module.exports)module.exports=api;
 if(root)root.AgentCryptoTraderPaperDecision=api;
})(typeof globalThis!=="undefined"?globalThis:null,()=>{
"use strict";
const SCHEMA="erith.trader.paper-decision-reading.v1";
const insufficient=reason=>Object.freeze({schema:SCHEMA,decision:"PREUVES_INSUFFISANTES",
 reason,executable:false,orders_enabled:false,strategy_certified:false});
const rejected=(reason,info)=>Object.freeze({schema:SCHEMA,decision:"REJETER",reason,...info,
 executable:false,orders_enabled:false,strategy_certified:false});
const review=(reason,info)=>Object.freeze({schema:SCHEMA,decision:"A_ETUDIER",reason,...info,
 executable:false,orders_enabled:false,strategy_certified:false});
const stamp=value=>{
 if(typeof value!=="string"||!value.endsWith("Z"))return NaN;
 const time=Date.parse(value);return Number.isFinite(time)?time:NaN;
};
function validSignal(doc){
 return doc?.schema==="erith.radar.signal-evidence-audit.v1"&&
  doc.kind==="RESEARCH_AUDIT_NOT_STRATEGY_SELECTION"&&
  doc.orders_enabled===false&&doc.strategy_certified===false&&
  doc.real_orders===0&&doc.paper_fills===0&&
  doc.top50_retro_7d?.true_unseen_holdout===false&&
  doc.top50_retro_7d?.source_quote==="USD"&&
  doc.radar_forward_j1?.quote==="USD"&&
  doc.okx_context?.quote==="USDT"&&
  doc.okx_context?.no_executable_returns_derived_from_usd===true;
}
function cohortContext(doc){
 if(!validSignal(doc))return "Études Radar historiques non validées.";
 const v=doc.top50_retro_7d?.periods?.later_descriptive_validation;
 const count=v?.signals_total,seen=v?.followups_observed,missing=v?.followups_missing;
 if(!Number.isInteger(count)||!Number.isInteger(seen)||!Number.isInteger(missing)||
    count<=0||count!==seen+missing)return "Études Radar: statistiques de période manquantes.";
 const change=v.mean_observed_gross_change_pct;
 return "Contexte global Top50 à 7 jours (USD, pas cette paire) : "+
   seen+"/"+count+" suivis ; "+missing+" manquants ; "+
   (typeof change==="number"&&Number.isFinite(change)?
    "variation brute moyenne "+change.toFixed(2)+" %.":"variation non mesurable.")+
   " Audit rétrospectif non validant, ni preuve d'exécution OKX.";
}
function assess({selected,qualification,signal,engine,now=Date.now()}={}){
 if(!Number.isFinite(now))return insufficient("Horloge non vérifiable.");
 if(!selected?.ok||selected.currency!=="USD"||
    typeof selected.asset!=="string"||!/^[A-Z0-9]{1,20}$/.test(selected.asset)||
    !/^[a-z0-9][a-z0-9-]{1,99}$/.test(String(selected.coinId||""))||
    selected.provider!=="coingecko"||
    selected.sourceIdentity!=="coingecko|"+selected.asset+"-USD|USD|"+selected.coinId||
    !Number.isFinite(selected.ageMs)||selected.ageMs<0||selected.ageMs>15*60000)
  return insufficient("Actif ou graphique Solo 24 h USD non qualifié ; aucune substitution de paire. CT et les listings externes demandent une identité spécifique.");
 if(!validSignal(signal))return insufficient("Rapport des signaux absent ou non conforme ; aucune conclusion de stratégie.");
 if(qualification?.schema!=="erith.radar.spot-qualification.v1"||
    qualification.real_orders_enabled!==false||
    qualification.coin_id_matches_exchange_symbol_verified!==false||
    qualification.actual_execution_permissions!==false||
    qualification.quote!=="USDT"||!Array.isArray(qualification.candidates)||
    qualification.candidates.length!==20)
  return insufficient("Qualification Radar Spot incompatible ou absente.");
 const matches=qualification.candidates.filter(c=>
   c?.id===selected.coinId||c?.symbol===selected.asset);
 if(matches.length!==1||matches[0].id!==selected.coinId||
    matches[0].symbol!==selected.asset)
  return insufficient("Aucune identité unique CoinGecko ↔ candidat Radar du jour ; une correspondance de symbole ne suffit pas.");
 const c=matches[0],spot=c.okx_spot;
 if(spot?.venue!=="OKX"||spot.quote!=="USDT"||
    spot.pair!==selected.asset+"-USDT"||
    spot.pair_observed!==true||spot.native_rules_verified!==true||
    spot.contract_identity_proven!==false||spot.account_access_proven!==false||
    spot.real_fees_proven!==false||spot.real_orders_enabled!==false||
    spot.rules?.source!=="OKX_PUBLIC_SPOT_INSTRUMENT")
  return insufficient("Instrument Spot OKX/USDT et ses règles non prouvés pour cet actif.");
 const book=spot.best_book;
 const sourceTime=stamp(book?.exchange_time_utc),collected=stamp(book?.collected_at_utc);
 if(book?.schema!=="erith.radar.okx.spot-best-book.v1"||
    book.source!=="OKX_PUBLIC_SPOT_BOOK"||book.pair!==spot.pair||
    book.quote!=="USDT"||book.market_execution_proven!==false||
    book.fees_verified!==false||book.orders_enabled!==false||
    !Number.isFinite(sourceTime)||!Number.isFinite(collected)||
    sourceTime>collected+5000||collected-sourceTime>120000)
  return insufficient("Carnet OKX absent, non daté ou incohérent.");
 const historical=cohortContext(signal);
 if(sourceTime>now+30000||now-sourceTime>5*60000)
  return insufficient("Dernier carnet OKX daté du "+new Date(sourceTime).toISOString()+
    " : trop ancien pour une décision actuelle. "+historical);
 if(typeof engine?.previewOkxSpot!=="function")
  return insufficient("Moteur Spot PAPER non chargé ; aucun calcul de revente certifié.");
 const p=engine.previewOkxSpot(c);
 const info={asset:selected.asset,coin_id:selected.coinId,pair:spot.pair,
  book_at_utc:book.exchange_time_utc,quote:"USDT",context:historical,
  assumptions:"Billet fictif 100 USDT ; frais hypothétiques achat BASE 0,1 %, vente USDT 0,1 %, glissement 0,2 % par côté.",
  contract_identity_proven:false,account_access_verified:false,
  actual_fees_verified:false,source_book_only:true,
  executable:false,orders_enabled:false,strategy_certified:false};
 if(p.status==="HYPOTHETICAL_IMMEDIATE_ROUNDTRIP_ONLY"){
  const threshold=p.approximateBidRiseToBreakEvenPct;
  if(!Number.isFinite(threshold)||threshold<0)return insufficient("Seuil de coût PAPER invalide.");
  return review("Coût de l'aller-retour immédiat évaluable sur un carnet public daté. "+
    "Ce n'est ni un signal d'achat, ni une rentabilité prédite.",{
    ...info,break_even_bid_rise_pct:threshold,
    immediate_paper_loss_pct:p.hypotheticalImmediatePnlPct,
    sellable_quantity:p.netSellableQuantity});
 }
 if(p.status==="NOT_EVALUABLE"&&[
   "NET_QUANTITY_BELOW_OKX_EXIT_MINIMUM","GROSS_QUANTITY_BELOW_OKX_MINIMUM",
   "ASK_BEST_LEVEL_DEPTH_INSUFFICIENT","BID_BEST_LEVEL_DEPTH_INSUFFICIENT",
   "PAPER_BUDGET_EXCEEDED"].includes(p.reason))
  return rejected("Billet PAPER de 100 USDT non négociable au meilleur niveau observé : "+p.reason+".",info);
 return insufficient("Carnet, quantité ou règles incompatibles : "+String(p.reason||"preuve absente")+
   ". Aucun ordre ni profit retenu.");
}
/* Reuse the existing PAPER laboratory study: it is descriptive, immediate,
   overlapping, in notional USD, and never exchange-executable. */
function summarizeHistorical(study,selected){
 if(!selected?.ok)return Object.freeze({status:"NOT_AVAILABLE",
   reason:"Graphique non qualifié. Le diagnostic n'attribue jamais une série à un autre actif.",
   orders_enabled:false,strategy_certified:false});
 if(study?.ok!==true||study.asset!==selected.asset||
    study.sourceIdentity!==selected.sourceIdentity||
    study.overlapping!==true||study.retrospective!==true||
    study.predictive!==false||study.realOrders!==false||
    study.feesProven!==false||!Number.isInteger(study.windows)||
    study.windows<10||!Number.isFinite(study.profitablePct)||
    study.profitablePct<0||study.profitablePct>100||
    !Number.isFinite(study.medianProfit)||!Number.isFinite(study.bestProfit)||
    !Number.isFinite(study.worstProfit)||
    !Number.isFinite(study.capital)||study.capital<=0)
   return Object.freeze({status:"NOT_AVAILABLE",
     reason:"Étude historique indisponible ou incohérente. Aucune rentabilité conclue.",
     orders_enabled:false,strategy_certified:false});
 return Object.freeze({status:"HISTORICAL_ONLY",asset:study.asset,
   windows:study.windows,positive_windows_pct:study.profitablePct,
   median_profit_notional_usd:study.medianProfit,
   best_profit_notional_usd:study.bestProfit,
   worst_profit_notional_usd:study.worstProfit,
   capital_notional_usd:study.capital,
   source_from_utc:study.firstAt,source_to_utc:study.lastAt,
   overlapping:true,independent_portfolio_trials:false,
   okx_costs_verified:false,actual_executions:0,
   reason:"Observation historique immédiate : fenêtres de 60 minutes chevauchantes, "+
   "frais supposés. Aucun signal d'achat ni gain de portefeuille démontré.",
   orders_enabled:false,strategy_certified:false});
}
return Object.freeze({SCHEMA,assess,cohortContext,validSignal,summarizeHistorical,realOrders:false,network:false,storage:false});
});