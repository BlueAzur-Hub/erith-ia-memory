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
 if(selected?.ok&&selected.asset==="BTC"&&selected.provider==="coingecko"&&
    selected.instrument==="BTC-USD")
   return insufficient("BTC : l'étude historique du graphique est disponible ci-dessus. "+
     "La qualification Radar Spot des 20 candidats ne certifie pas ici de carnet BTC OKX "+
     "récent ni de revente pour ce compte ; ne pas confondre USD et USDT.");
 if(selected?.ok&&selected.asset==="CT"&&selected.provider==="okx")
   return insufficient("CT : étude historique possible si la source externe est qualifiée ; "+
     "le diagnostic des candidats Radar ne fournit pas de preuve de lot et carnet CT/USDC "+
     "pour un ordre. Aucun ordre OKX n'est déclenché.");
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
/* Qualification du graphique différé : contrôle strict du contenu avec l'horloge
   DU DERNIER POINT, pas avec l'horloge actuelle. Réservé à la rétrospective ;
   la qualification Spot/live garde sa limite existante de 15 minutes. */
function qualifyHistoricalAsOf(input,lab,now=Date.now()){
 const series=input?.series,last=Array.isArray(series)?series[series.length-1]:null;
 const at=Array.isArray(last)?last[0]:NaN;
 if(!Number.isFinite(now)||!Number.isFinite(at)||at>now||
    now-at>48*60*60*1000)return Object.freeze({ok:false,
   reason:"Historique absent, futur ou âgé de plus de 48 h ; collecte graphique à actualiser."});
 if(typeof lab?.qualify!=="function"||typeof lab?.historicalStudy!=="function")
   return Object.freeze({ok:false,reason:"Laboratoire historique indisponible."});
 // This is an observation-time validation, NOT a live current-time quote.
 const q=lab.qualify(input,at);
 if(!q?.ok)return Object.freeze({ok:false,reason:q?.reason||"Série historique invalide."});
 return Object.freeze({ok:true,qualified:q,asOf:at,ageMinutes:(now-at)/60000,
  historicalOnly:true,realOrders:false,spotExecutionPermitted:false});
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

/* Read-only OKX LIMIT ticket preflight from an exact PUBLIC Spot hourly snapshot.
   Funds are hypothetical; actual Trading balance/fees/order permissions are
   NEVER inferred from a screenshot, WebSocket, market maker quote or Funding. */
const TICKET="erith.trader.okx-spot-limit-preflight.v1",UNIT=10n**18n;
const CANONICAL_COINS=Object.freeze({BTC:"bitcoin",ETH:"ethereum",SOL:"solana",
 XRP:"ripple",OKB:"okb"});
function exact(raw){
 if(typeof raw!=="string"||!/^\d{1,14}(?:\.\d{1,18})?$/.test(raw))
   throw Error("Décimal natif non vérifié");
 const [whole,frac=""]=raw.split(".");
 return BigInt(whole)*UNIT+BigInt(frac.padEnd(18,"0"));
}
function exactFmt(n){
 if(n<0n)throw Error("Montant négatif");
 return String(n/UNIT)+"."+String(n%UNIT).padStart(18,"0").replace(/0+$/,"").padEnd(1,"0");
}
function ceiling(n,step){return (n+step-1n)/step*step}
function ticketBlocked(reason,extras={}){
 return Object.freeze({schema:TICKET,status:"BLOQUE",reason,
  ...extras,account_verified:false,fees_verified:false,
  trading_balance_verified:false,market_execution_proven:false,
  orders_enabled:false,real_orders:0,trade_endpoint:null,
  executable:false,has_submit_action:false});
}
/* Public local Backend CT/USDC book; independent of the CT/USDT graphic.
   The dated archive remains the sole source of Spot size/tick rules. */
function verifiedCtLiveBook(payload,pair,now){
 if(pair!=="CT-USDC"||payload?.status!=="ok"||
    payload?.provider!=="okx"||payload?.pair!==pair||
    payload?.quote!=="USDC"||!Number.isFinite(now))return null;
 const when=Date.parse(payload.observed_at_utc);
 if(!Number.isFinite(when)||when>now||now-when>20000)return null;
 const bids=payload.bids,asks=payload.asks;
 if(!Array.isArray(bids)||!Array.isArray(asks)||
    !bids.length||!asks.length)return null;
 try{
  for(const [side,descending] of [[bids,true],[asks,false]]){
   let previous=null;
   for(const row of side.slice(0,5)){
    if(!Array.isArray(row)||row.length<2)return null;
    const price=exact(row[0]),qty=exact(row[1]);
    if(price<=0n||qty<=0n)return null;
    if(previous!==null&&(descending?price>previous:price<previous))return null;
    previous=price;
   }
  }
  if(exact(bids[0][0])>=exact(asks[0][0]))return null;
  return Object.freeze({source_at_utc:payload.observed_at_utc,
    market_fill_proven:false,bids,asks});
 }catch(_){return null;}
}
/* Live public CT/USDC instrument metadata. This validates quantity and price
   increments only; it cannot certify account-specific or notional limits. */
function verifiedCtSpotRules(source,pair,now){
 if(pair!=="CT-USDC"||!Number.isFinite(now))return null;
 const at=Date.parse(source?.observed_at_utc||"");
 if(!Number.isFinite(at)||at>now||now-at>120000||
    source?.payload?.code!=="0"||!Array.isArray(source.payload.data))return null;
 const hits=source.payload.data.filter(r=>r?.instId===pair&&r?.instType==="SPOT");
 if(hits.length!==1)return null;
 const r=hits[0];
 if(r.state!=="live"||r.baseCcy!=="CT"||r.quoteCcy!=="USDC")return null;
 try{
  const min=exact(r.minSz),lot=exact(r.lotSz),tick=exact(r.tickSz);
  if(!min||!lot||!tick)return null;
  return Object.freeze({minSz:r.minSz,lotSz:r.lotSz,
    tickSz:r.tickSz,at:source.observed_at_utc});
 }catch(_){return null;}
}
function prepareSpotTicket({selected,archive,pair,budgetQuote="10",now=Date.now(),liveBook=null,instrumentEvidence=null}={}){
 try{
  if(!Number.isFinite(now))return ticketBlocked("Horloge non vérifiable.");
  const asset=String(selected?.asset||"");
  // CT is an OKX external chart (CT-USDT), not a CoinGecko CT-USD
  // instrument. Never use its converted chart price for a native USDC ticket.
  const canonical=CANONICAL_COINS[asset]&&
    selected?.coinId===CANONICAL_COINS[asset]&&
    selected?.currency==="USD"&&selected?.provider==="coingecko"&&
    selected?.instrument===asset+"-USD";
  // The canonical CT owner publishes CT/USDT with a slash; the PAPER
  // laboratory already normalizes that notation to CT-USDT. Apply the
  // identical normalization here, without interpreting CT/USDT chart quotes
  // as a CT/USDC order price. The price and lot come ONLY from the exact
  // dated CT-USDC public exchange instrument below.
  const ctChartInstrument=String(selected?.instrument||"").toUpperCase().replace("/","-");
  const verifiedCt=asset==="CT"&&selected?.provider==="okx"&&
    ctChartInstrument==="CT-USDT"&&selected?.currency==="USD"&&
    /OKX.*CT[/-]USDT/i.test(String(selected?.source||""))&&
    /USDT[/-]USD.*CoinGecko/i.test(String(selected?.source||""));
  if(!canonical&&!verifiedCt)
    return ticketBlocked("Le graphique n'établit pas l'identité de cet actif. "+
     "CT exige un graphique OKX CT-USDT explicite et son propre carnet CT-USDC. "+
     "Aucun cours converti n'est utilisé pour un ordre.");
  if(typeof pair!=="string"||!["USDC","USDT","EUR"].some(q=>pair===asset+"-"+q))
    return ticketBlocked("Paire Spot incohérente avec l'actif sélectionné.");
  if(archive?.schema!=="erith.radar.okx-hourly-spot.v1"||
     archive?.orders_enabled!==false||archive?.real_orders!==0||
     archive?.paper_fills!==0||!Array.isArray(archive.hours)||
     archive.hours.length===0||archive.hours.length>24)
    return ticketBlocked("Archives OKX publiques absentes ou incompatibles.");
  const sorted=[...archive.hours].sort((a,b)=>
    String(a?.hour_utc).localeCompare(String(b?.hour_utc)));
  const last=sorted.at(-1);
  if(last?.schema!==archive.schema||last?.orders_enabled!==false||
     last?.real_orders!==0||last?.paper_fills!==0||
     last?.instrument_type!=="SPOT"||last?.no_quote_conversion!==true||
     !Array.isArray(last.markets)||last.hour_utc.slice(0,10)!==archive.date_utc)
    return ticketBlocked("Dernier relevé Spot non qualifié.");
  const matches=last.markets.filter(m=>m?.pair===pair);
  if(matches.length!==1||matches[0].base!==asset||
     !["USDC","USDT","EUR"].includes(matches[0].quote)||
     matches[0].pair!==asset+"-"+matches[0].quote)
    return ticketBlocked("Paire absente ou identité du carnet ambiguë.");
  const m=matches[0],archivedBook=m.book5;
  const localBook=verifiedCtLiveBook(liveBook,pair,now);
  const book=localBook||archivedBook;
  if(m.status!=="VERIFIED_PUBLIC_BOOK"||!archivedBook||
     book.market_fill_proven!==false||!Array.isArray(book.bids)||
     !Array.isArray(book.asks)||!Array.isArray(book.bids[0])||
     !Array.isArray(book.asks[0]))
    return ticketBlocked("Carnet public absent ou non qualifié.");
  const quote=m.quote,ts=Date.parse(book.source_at_utc),
        observed=Date.parse(last.observed_at_utc);
  if(!Number.isFinite(ts)||!Number.isFinite(observed)||
     ts>now+30000||
     (!localBook&&Math.abs(ts-observed)>180000)||
     observed>now+30000)
    return ticketBlocked("Heure du carnet ou observation incohérente.");
  const age=Math.max(0,Math.round((now-ts)/60000));
  const freshRules=verifiedCtSpotRules(instrumentEvidence,pair,now);
  const rules=freshRules||m.rules;
  const tick=exact(rules?.tickSz),lot=exact(rules?.lotSz),
        minimum=exact(rules?.minSz);
  const ask=exact(book.asks[0][0]),bid=exact(book.bids[0][0]),
        askQty=exact(book.asks[0][1]),bidQty=exact(book.bids[0][1]),
        budget=exact(budgetQuote);
  if(!tick||!lot||!minimum||!ask||!bid||bid>=ask||
     ask%tick||bid%tick||!askQty||!bidQty||!budget||
     budget>10000n*UNIT)
    return ticketBlocked("Prix, lot, frais ou budget d'étude invalides.");
  // QUOTE used for cost; 0.1% BASE buy fee is a conservative HYPOTHESIS.
  const gross=((budget*UNIT)/ask)/lot*lot;
  const feeBase=(gross*10n+9999n)/10000n;
  const net=gross>feeBase?gross-feeBase:0n;
  const sellable=net/lot*lot;
  const notional=gross*ask/UNIT;
  const minBuyQuote=minimum*ask/UNIT;
  const exitQuote=sellable*bid/UNIT;
  const saleFee=(exitQuote*10n+9999n)/10000n;
  const proceeds=exitQuote>saleFee?exitQuote-saleFee:0n;
  const possibleAtBook=proceeds>=notional?"0":exactFmt(notional-proceeds);
  const budgetCoversMinimum=gross>=minimum;
  const canResellAtSize=sellable>=minimum;
  // Base-fee conservative illustration: sufficient whole lots to leave
  // minSz sellable if fees happen to be debited in CT at a 0.10% rate.
  const minSellable=ceiling(minimum,lot);
  let minimumGrossWithBaseFee=ceiling(
    ceiling(minSellable*10000n,9990n),lot);
  while(minimumGrossWithBaseFee-
      ceiling(minimumGrossWithBaseFee*10n,10000n)<minSellable)
    minimumGrossWithBaseFee+=lot;
  const minimumGrossCost=minimumGrossWithBaseFee*ask/UNIT;
  // Price to cover exact hypothetically BASE buy fee + QUOTE sell fee.
  const theoreticalBreakEven=sellable>0n?
    ceiling(((notional*10000n*UNIT)/(sellable*9990n)),tick):null;
  const limits=[
    ...(budgetCoversMinimum?[]:["Budget d'étude sous le minimum natif de quantité : "+
      exactFmt(minimum)+" "+asset+" (environ "+exactFmt(minBuyQuote)+" "+quote+
      " au carnet "+(localBook?"local récent":"archivé")+")."]),
    ...(canResellAtSize?[]:["Quantité nette après frais BASE et arrondi au lot "+
      "insuffisante pour une revente au minimum natif."]),
    ...(gross<=askQty&&sellable<=bidQty?[]:["Profondeur au meilleur niveau insuffisante "+
      "pour le scénario complet (aucune exécution présumée)."]),
    "Solde du compte Trading et devise réellement disponibles non vérifiés.",
    "Frais réels de ce compte et de cette paire non vérifiés.",
    "Minimum de valeur/notionnel et autres filtres d'ordre à confirmer par OKX.",
    ...(age>2?["Carnet public différé de "+age+" min : aucun prix actuel certifié."]:
       ["Même récent, un carnet public n'est pas une garantie d'exécution."])
  ];
  return ticketBlocked("PRÉPARATION UNIQUEMENT · validation nécessaire avant tout ordre.",{
   status:"PREPARATION_NON_EXECUTABLE",pair,quote,base:asset,
   source_book_at_utc:book.source_at_utc,book_age_minutes:age,
   source_book_kind:localBook?"LOCAL_BACKEND_OKX_CT_USDC":"DATED_PUBLIC_HOURLY_ARCHIVE",
   native_rules_observed_at_utc:freshRules?freshRules.at:last.observed_at_utc,
   native_rules_kind:freshRules?"OKX_PUBLIC_INSTRUMENTS_CT_USDC":"DATED_PUBLIC_HOURLY_ARCHIVE",
   native_rules_verified:!!freshRules,
   fee_debit_currency_verified:false,
   minimum_gross_buy_to_resell_with_assumed_base_fee:exactFmt(minimumGrossWithBaseFee),
   minimum_gross_buy_cost_at_ask_with_assumed_base_fee:exactFmt(minimumGrossCost),
   study_budget_quote:exactFmt(budget),best_ask_quote:exactFmt(ask),
   best_bid_quote:exactFmt(bid),native_min_quantity:exactFmt(minimum),
   native_lot:exactFmt(lot),native_tick:exactFmt(tick),
   minimum_buy_at_recorded_ask_quote:exactFmt(minBuyQuote),
   gross_buy_quantity:exactFmt(gross),estimated_base_fee:exactFmt(feeBase),
   net_base_quantity:exactFmt(net),sellable_lot_quantity:exactFmt(sellable),
   unsellable_dust:exactFmt(net-sellable),
   hypothetical_buy_cost_quote:exactFmt(notional),
   hypothetical_immediate_exit_quote:exactFmt(proceeds),
   hypothetical_immediate_loss_quote:possibleAtBook,
   hypothetical_break_even_bid_quote:theoreticalBreakEven===null?null:exactFmt(theoreticalBreakEven),
   buy_quantity_minimum_met:budgetCoversMinimum,
   net_exit_quantity_minimum_met:canResellAtSize,
   assumptions:"Frais achat BASE 0,1 % ; frais vente QUOTE 0,1 % · hypothétiques.",
   blockers:limits,notional_filter_verified:false,
   can_place_limit_order:false,can_sell_net_quantity_certified:false
  });
 }catch(_){
  return ticketBlocked("Précision de l'instrument, horodatage ou montant non exploitable.");
 }
}

/* Combine an already-blocked PUBLIC ticket with a tiny private READ-ONLY
   snapshot from the existing OKX account owner. Even a verified balance never
   authorizes a trade, converts Funding to Trading or asserts maker execution. */
function reviewSpotTicketAccount(ticket,context,now=Date.now()){
 const blocked=(reason,extra={})=>Object.freeze({status:"COMPTE_NON_VERIFIE",
   reason,account_at_utc:null,account_quote:null,available_trading_quote:null,
   available_funding_quote:null,fee_maker_pct:null,fee_taker_pct:null,
   funds_cover_public_scenario:false,account_verified:false,fees_verified:false,
   orders_enabled:false,real_orders:0,can_place_limit_order:false,...extra});
 if(ticket?.schema!==TICKET||ticket.orders_enabled!==false||
    ticket.real_orders!==0||ticket.executable!==false||
    !Number.isFinite(now)||typeof ticket.pair!=="string")
   return blocked("Ticket public invalide.");
 if(context?.read_only!==true||context.orders_enabled!==false||
    context.real_orders!==0||context.instId!==ticket.pair)
   return blocked("Compte privé absent ou autre paire : aucune donnée empruntée.");
 const at=Date.parse(context.account_at_utc);
 if(!context.account_fresh||!Number.isFinite(at)||at>now+30000||
    now-at>120000)
   return blocked("Lecture OKX du compte Trading trop ancienne.");
 const quote=ticket.quote;
 if(ticket.pair!==ticket.base+"-"+quote||!["USDC","USDT","EUR"].includes(quote))
   return blocked("Devise ou paire incohérente.");
 const raw=context.trading_available_quote;
 let available=null,funding=null;
 try{if(raw!==null&&raw!==undefined)available=exact(raw);
     if(context.funding_available_quote!==null&&context.funding_available_quote!==undefined)
       funding=exact(context.funding_available_quote);}
 catch(_){return blocked("Solde privé numérique invalide.");}
 const feeGood=context.fee_pair_verified===true&&
   context.fee_maker_rate!==null&&context.fee_taker_rate!==null;
 let maker=null,taker=null;
 try{
   if(feeGood){maker=exact(context.fee_maker_rate);
     taker=exact(context.fee_taker_rate);
     if(maker>2n*UNIT/100n||taker>2n*UNIT/100n)throw Error("Fee invalid");}
 }catch(_){return blocked("Frais OKX de cette paire non vérifiables.");}
 const accountVerified=context.verified===true&&available!==null;
 const hypotCost=ticket.hypothetical_buy_cost_quote?
   exact(ticket.hypothetical_buy_cost_quote):null;
 const enough=accountVerified&&hypotCost!==null&&available>=hypotCost;
 const reasons=[
  ...(!accountVerified?["Solde disponible dans Trading non prouvé."]:[]),
  ...(accountVerified&&!enough?["Solde Trading insuffisant pour le scénario public."]:[]),
  ...(!feeGood?["Frais maker/taker propres à la paire non certifiés."]:[]),
  "Les frais réels de l'actif de débit et les frais nets de revente restent à appliquer.",
  ticket.source_book_kind==="LOCAL_BACKEND_OKX_CT_USDC"?
   "Carnet public local récent : aucune garantie de prix ni d'exécution.":
   "Prix du carnet archivé : aucune cotation négociable actuelle garantie.",
  "Minimum notionnel OKX, solde après réservations et confirmation humaine restent à vérifier.",
 ];
 return Object.freeze({status:!accountVerified?"COMPTE_NON_VERIFIE":
      !enough?"TRADING_INSUFFISANT":"SOLDE_SUFFISANT_POUR_ETUDE",
   reason:reasons.join(" "),
   account_at_utc:context.account_at_utc,account_quote:quote,
   available_trading_quote:available===null?null:exactFmt(available),
   available_funding_quote:funding===null?null:exactFmt(funding),
   fee_maker_pct:feeGood?exactFmt(maker*100n):null,
   fee_taker_pct:feeGood?exactFmt(taker*100n):null,
   funds_cover_public_scenario:Boolean(enough),
   account_verified:accountVerified,fees_verified:Boolean(feeGood),
   orders_enabled:false,real_orders:0,can_place_limit_order:false,
   has_submit_action:false});
}


/* Pure, non-executable whole-position exit PREVIEW. The largest sellable
   quantity is determined by native lot AFTER a BASE-side buy fee.
   The residue is reported openly: a 100% slider is NOT zero dust.
   maker or taker is not guaranteed by a LIMIT order, so use the higher
   of both verified rates for a conservative preview only. */
function previewSpotExit({ticket,context,targetPriceQuote,now=Date.now()}={}){
 const no=reason=>Object.freeze({status:"SORTIE_NON_EVALUABLE",reason,
   orders_enabled:false,real_orders:0,can_place_limit_order:false});
 if(ticket?.schema!==TICKET||ticket.status!=="PREPARATION_NON_EXECUTABLE"||
    ticket.orders_enabled!==false||ticket.real_orders!==0||ticket.executable!==false)
   return no("Carnet et règles exacts de la paire non vérifiés.");
 try{
  const target=exact(targetPriceQuote),tick=exact(ticket.native_tick),
        lot=exact(ticket.native_lot),minimum=exact(ticket.native_min_quantity),
        gross=exact(ticket.gross_buy_quantity),
        cost=exact(ticket.hypothetical_buy_cost_quote);
  if(!target||!tick||target%tick||!lot||!minimum||!gross||!cost)
    return no("Prix de revente incompatible avec le pas autorisé par OKX.");
  const account=reviewSpotTicketAccount(ticket,context,now);
  const feesVerified=account.fees_verified===true&&account.account_verified===true;
  const maker=feesVerified?exact(context.fee_maker_rate):exact("0.001");
  const taker=feesVerified?exact(context.fee_taker_rate):exact("0.001");
  const feeRate=maker>taker?maker:taker; // worst of the two, maker is not certain
  const feeBase=(gross*feeRate+UNIT-1n)/UNIT;
  if(feeBase>=gross)return no("Frais supérieurs à la quantité achetée.");
  const net=gross-feeBase,sellable=net/lot*lot,dust=net-sellable;
  const saleGross=sellable*target/UNIT;
  const saleFee=(saleGross*feeRate+UNIT-1n)/UNIT;
  const proceeds=saleGross>saleFee?saleGross-saleFee:0n;
  const profit=proceeds-cost;
  return Object.freeze({status:sellable>=minimum?"ETUDE_SORTIE":"REVENTE_MINIMUM_IMPOSSIBLE",
   pair:ticket.pair,quote:ticket.quote,base:ticket.base,
   target_sell_price_quote:exactFmt(target),
   buy_quantity:exactFmt(gross),estimated_buy_fee_base:exactFmt(feeBase),
   estimated_net_base:exactFmt(net),
   maximum_sellable_base:exactFmt(sellable),residual_dust_base:exactFmt(dust),
   full_exit_without_dust:dust===0n,
   meets_native_exit_minimum:sellable>=minimum,
   hypothetical_sale_gross_quote:exactFmt(saleGross),
   hypothetical_sale_fee_quote:exactFmt(saleFee),
   hypothetical_sale_net_quote:exactFmt(proceeds),
   hypothetical_profit_quote:profit<0n?"-"+exactFmt(-profit):exactFmt(profit),
   assumed_fee_pct:exactFmt(feeRate*100n),fees_verified:feesVerified,
   fee_status:feesVerified?"MAKER_TAKER_EXACT_PAIR_READ_ONLY":"HYPOTHESE_0_10_PCT",
   trading_balance_verified:account.account_verified,
   funds_cover_public_scenario:account.funds_cover_public_scenario,
   book_age_minutes:ticket.book_age_minutes,
   no_guaranteed_fill:true,lot_rounding_may_differ:true,
   other_order_filters_unverified:true,
   orders_enabled:false,real_orders:0,can_place_limit_order:false});
 }catch(_){return no("Quantité, prix, frais ou règle Spot non exploitable.");}
}
return Object.freeze({SCHEMA,assess,cohortContext,validSignal,summarizeHistorical,qualifyHistoricalAsOf,prepareSpotTicket,verifiedCtLiveBook,verifiedCtSpotRules,reviewSpotTicketAccount,previewSpotExit,realOrders:false,network:false,storage:false});
});