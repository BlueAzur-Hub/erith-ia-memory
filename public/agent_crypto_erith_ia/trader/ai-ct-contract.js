/* ERITH.IA · contrat commun de lecture CT · sans transport ni écriture. */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.AgentCryptoAiCtContract = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const PAIR = 'CT-USDC';
  const SCHEMA = 'erith.ai.gateway.ct.readonly.v1';
  const MAX_BOOK_AGE_MS = 20000;
  const numeric = value => {
    if (value === '' || value === null || value === undefined) return null;
    const n = Number(value); return Number.isFinite(n) ? n : null;
  };
  function fail(message) { throw new Error(message); }
  function validSource(v) { return Boolean(v && v.ok === true && v.read_only === true); }
  function balanceFor(account,code) {
    if(!validSource(account)) fail('Compte OKX non vérifié');
    let total=0,present=false;
    for(const trade of Array.isArray(account.trading)?account.trading:[]){
      for(const item of Array.isArray(trade?.details)?trade.details:[]){
        if(item.ccy!==code)continue;
        const value=numeric(item.cashBal ?? item.eq);
        if(value===null||value<0)fail('Solde '+code+' incohérent');
        total+=value;present=true;
      }
    }
    for(const item of Array.isArray(account.funding)?account.funding:[]){
      if(item.ccy!==code)continue;
      const value=numeric(item.bal);
      if(value===null||value<0)fail('Solde '+code+' incohérent');
      total+=value;present=true;
    }
    return {qty:present?total:null,verified:present};
  }
  // Le même /okx/account privé nourrit le Trader et son panneau IA.
  // BTC/CT/USDC/EUR restent des devises séparées, sans taux inventé.
  function portfolio(account){
    if(!validSource(account))fail('Compte OKX non vérifié');
    const assets={};
    for(const code of ['BTC','CT','USDC','EUR']){
      try{assets[code]=Object.freeze(balanceFor(account,code));}
      catch(_){assets[code]=Object.freeze({qty:null,verified:false});}
    }
    return Object.freeze({read_only:true,observed_at:account.fetched_at??null,assets:Object.freeze(assets)});
  }
  function position(account) {
    const ct=balanceFor(account,'CT');
    return {qty_ct:ct.qty,observed_at:account.fetched_at??null,verified:ct.verified};
  }
  function acquisition(fills,qty) {
    if (!validSource(fills) || !Array.isArray(fills.fills_3m) || qty === null) return {status:'unknown',reason:'Transactions OKX incomplètes'};
    const pairFills=fills.fills_3m.filter(f=>f.instId===PAIR);
    if (!pairFills.length) return {status:'unknown',reason:'Aucune transaction CT/USDC retrouvée'};
    let acquired=0,spent=0,number=0;
    const seen=new Set();
    for (const f of pairFills) {
      // Do not infer the cost of holdings after a transfer, a sell or a non-CT fee.
      if (f.side !== 'buy') return {status:'unknown',reason:'Achats et ventes mélangés : coût d’acquisition non établi'};
      const id=String(f.tradeId??'').trim();
      if (!id || seen.has(id)) return {status:'unknown',reason:'Identifiants de transaction absents ou répétés'};
      seen.add(id);
      const size=numeric(f.fillSz), price=numeric(f.fillPx),fee=numeric(f.fee);
      if (size===null || size<=0 || price===null || price<=0 || fee===null)
        return {status:'unknown',reason:'Prix, quantité ou frais non prouvés'};
      const feeCcy=String(f.feeCcy??'');
      if (fee!==0 && !['CT','USDC'].includes(feeCcy))return {status:'unknown',reason:'Frais prélevés dans une autre devise'};
      acquired+=size+(feeCcy==='CT'?fee:0);
      spent+=size*price-(feeCcy==='USDC'?fee:0);
      number++;
    }
    if (acquired<=0 || spent<=0 || Math.abs(acquired-qty)>Math.max(.000001,qty*.0001))
      return {status:'unknown',reason:'Le solde et les achats retrouvés ne concordent pas'};
    return {status:'reconciled_fills_only',net_acquired_ct:acquired,spent_usdc:spent,
      cost_per_ct_usdc:spent/acquired,fill_count:number,
      caveat:'Transactions retrouvées et solde concordants ; historique externe/transferts non certifiés'};
  }
  function takerRate(fees) {
    if (!validSource(fees) || fees.instId !== PAIR || !Array.isArray(fees.fees)||!fees.fees.length)return null;
    const rate=numeric(fees.fees[0].taker??fees.fees[0].takerU??fees.fees[0].takerUSDC);
    // OKX fees: negative = paid, positive = rebate; no assumption on rebates.
    return rate!==null && rate<=0 && rate>=-.05 ? -rate : null;
  }
  function sellEstimate(book,qty,rate,now) {
    if (qty===null || qty<=0 || rate===null) return {status:'unknown',reason:'Solde ou frais de vente non vérifiés'};
    if (book?.status!=='ok' || book?.provider!=='okx' || book?.pair!==PAIR || book?.quote!=='USDC')
      return {status:'unknown',reason:'Carnet CT/USDC indisponible'};
    const observed=Date.parse(book.observed_at_utc||'');
    if (!Number.isFinite(observed)|| now-observed<0 || now-observed>MAX_BOOK_AGE_MS)
      return {status:'unknown',reason:'Carnet trop ancien pour une estimation'};
    let remaining=qty, gross=0,previous=Infinity;
    const bids=book.bids;
    if(!Array.isArray(bids)||!bids.length)return {status:'unknown',reason:'Aucune offre acheteuse'};
    for(const level of bids){
      if(!Array.isArray(level))return {status:'unknown',reason:'Format carnet invalide'};
      const price=numeric(level[0]),size=numeric(level[1]);
      if(price===null||price<=0||size===null||size<0||price>previous)return {status:'unknown',reason:'Carnet incohérent'};
      previous=price;
      const used=Math.min(remaining,size);
      remaining-=used;gross+=used*price;
      if(remaining<=1e-9)break;
    }
    if(remaining>1e-9)return {status:'unknown',reason:'Profondeur insuffisante pour revendre le solde'};
    return {status:'indicative',gross_usdc:gross,net_usdc:gross*(1-rate),taker_fee_fraction:rate,
      observed_at:book.observed_at_utc,age_ms:now-observed,
      caveat:'Simulation de revente immédiate sur carnet observé : aucune exécution garantie'};
  }

  // Lecture de la liquidité pour une revente fictive CT/USDC, jamais un ordre.
  function exitMetrics(sale,book,qty){
    if(sale?.status!=='indicative'||!Number.isFinite(qty)||qty<=0)return null;
    const bid=numeric(book?.bids?.[0]?.[0]);
    if(bid===null||bid<=0)return null;
    const average=sale.gross_usdc/qty;
    if(!Number.isFinite(average)||average<=0||average>bid+1e-9)return null;
    const ask=numeric(book?.asks?.[0]?.[0]);
    const spread=ask!==null&&ask>=bid&&ask>0?(ask-bid)/ask*100:null;
    return Object.freeze({
      best_bid_usdc_ct:bid,best_ask_usdc_ct:spread===null?null:ask,spread_pct:spread,
      weighted_exit_usdc_ct:average,book_impact_pct:Math.max(0,(bid-average)/bid*100),
      estimated_exit_fee_usdc:sale.gross_usdc-sale.net_usdc,observed_at:sale.observed_at
    });
  }

  // Contrefactuel ±5 % sur tous les bid CT/USDC, mêmes quantités fictives :
  // frais de vente OKX observés, ni prévision ni possibilité d'ordre.
  function ctScenarioGrid(book,qty,rate,bought=null,now=Date.now()){
    const unavailable=reason=>Object.freeze({status:'unavailable',read_only:true,market:PAIR,
      quote:'USDC',reason,rows:Object.freeze([])});
    const origin=sellEstimate(book,qty,rate,now);
    if(origin.status!=='indicative')return unavailable(origin.reason||'Carnet CT/USDC indisponible');
    if(!Array.isArray(book?.bids))return unavailable('Niveaux acheteurs absents');
    const cost=bought?.status==='reconciled_fills_only'&&
      Number.isFinite(bought.spent_usdc)&&bought.spent_usdc>0?bought.spent_usdc:null;
    const rows=[];
    for(const shock of [-5,0,5]){
      const factor=1+shock/100;
      const shifted={...book,bids:book.bids.map(level=>
        Array.isArray(level)?[Number(level[0])*factor,level[1]]:level)};
      const estimate=sellEstimate(shifted,qty,rate,now);
      if(estimate.status!=='indicative')return unavailable('Profondeur insuffisante en scénario');
      rows.push(Object.freeze({
        shock_pct:shock,net_exit_usdc:estimate.net_usdc,
        gross_exit_usdc:estimate.gross_usdc,
        estimated_sell_fee_usdc:estimate.gross_usdc-estimate.net_usdc,
        indicative_difference_usdc:cost===null?null:estimate.net_usdc-cost
      }));
    }
    return Object.freeze({status:'hypothetical',read_only:true,market:PAIR,
      quote:'USDC',position_ct:qty,observed_at:origin.observed_at,
      fee_rate_fraction:rate,fixed_depth_assumption:true,
      cost_basis_proven:false,rows:Object.freeze(rows),
      caveat:'Prix acheteurs fictivement décalés ±5 %, quantités inchangées ; carnet futur, frais et exécution non garantis.'});
  }
  // Contexte public : seules les bougies CT/USDT réellement chargées sont recevables.
  function publicCandles(chart,now=Date.now()){
    const empty=reason=>Object.freeze({status:'unavailable',reason});
    const instrument=String(chart?.loadedInstrument||'').toUpperCase();
    const bar=String(chart?.loadedBar||'');
    const intervals={'1m':60000,'5m':300000,'15m':900000,'1h':3600000,'4h':14400000,'1d':86400000,'1j':86400000};
    if(chart?.mode!=='candles'||chart?.loading||chart?.error||instrument!=='CT-USDT'||!intervals[bar])
      return empty('Bougies CT/USDT non chargées ou autre actif sélectionné');
    const rows=chart.rows;
    if(!Array.isArray(rows)||rows.length<2)return empty('Série CT/USDT insuffisante');
    let first=null,last=null,previous=0,volume=0;
    for(const row of rows){
      const t=numeric(row?.t),close=numeric(row?.c),v=numeric(row?.v);
      if(t===null||t<=previous||t<=0||close===null||close<=0||v===null||v<0)
        return empty('Bougies CT/USDT non vérifiables');
      if(!first)first={t,close};
      last={t,close};previous=t;volume+=v;
    }
    const age=now-last.t;
    if(!Number.isFinite(age)||age<0)return empty('Horodatage des bougies non vérifiable');
    return Object.freeze({
      status:age>intervals[bar]*2?'stale':'observed',instrument,bar,points:rows.length,
      change_pct:(last.close/first.close-1)*100,volume_ct:volume,
      first_at:new Date(first.t).toISOString(),last_at:new Date(last.t).toISOString(),
      source:String(chart.source||'Bougies CT/USDT'),age_ms:age
    });
  }
  function explain(doc,chart=null){
    if(doc?.schema!==SCHEMA||doc.read_only!==true||doc.orders_enabled!==false)
      fail('Compte rendu privé non validé');
    const lines=[],qty=doc.position?.qty_ct;
    if(doc.position?.verified===true&&Number.isFinite(qty))
      lines.push('Position OKX : '+qty.toLocaleString('fr-FR',{maximumFractionDigits:12})+' CT détenus, relevé du '+String(doc.position.observed_at||'date inconnue')+'.');
    else lines.push('Position CT non confirmée : aucune valorisation calculée.');
    if(doc.acquisition?.status==='reconciled_fills_only')
      lines.push('Acquisition rapprochée : '+doc.acquisition.spent_usdc.toFixed(6)+' USDC sur les transactions CT/USDC retrouvées ; paiements externes et transferts non certifiés.');
    else lines.push('Coût d’acquisition NON PROUVÉ : '+String(doc.acquisition?.reason||'historique incomplet')+'.');
    if(doc.liquidation_illustrative?.status==='indicative'){
      const sale=doc.liquidation_illustrative;
      lines.push('Revente FICTIVE : '+sale.net_usdc.toFixed(6)+' USDC nets estimés sur les offres acheteuses du carnet OKX CT/USDC du '+sale.observed_at+' ; frais estimés inclus, aucune exécution garantie.');
      if(doc.exit_metrics){
        const m=doc.exit_metrics;
        lines.push('Liquidité : meilleure offre acheteuse '+m.best_bid_usdc_ct.toFixed(8)+' USDC/CT, prix de revente moyen pondéré fictif '+m.weighted_exit_usdc_ct.toFixed(8)+' USDC/CT ; impact du parcours du carnet '+m.book_impact_pct.toFixed(3)+' %.');
        if(m.spread_pct!==null)lines.push('Écart acheteur/vendeur : '+m.spread_pct.toFixed(3)+' % sur le carnet observé ; indicatif uniquement.');
      }
    }else lines.push('Revente fictive NON CALCULABLE : '+String(doc.liquidation_illustrative?.reason||'données absentes')+'.');
    if(Number.isFinite(doc.pnl_illustrative_usdc))
      lines.push('Différence indicative : '+doc.pnl_illustrative_usdc.toFixed(6)+' USDC après les frais de revente estimés ; ni gain réalisé ni rentabilité certifiée.');
    else lines.push('Gain / perte NON CALCULABLE avec les seules preuves disponibles.');
    const scenarios=doc.scenario_grid;
    if(scenarios?.status==='hypothetical'&&scenarios.rows?.length===3){
      lines.push('Scénarios CT/USDC : déplacement fictif des prix acheteurs de −5 %, 0 %, +5 % avec mêmes quantités et frais de vente estimés.');
      for(const row of scenarios.rows){
        const sign=row.shock_pct>0?'+':'';
        const cost=row.indicative_difference_usdc===null
          ?'coût d’acquisition non rapproché'
          :'écart hypothétique aux achats retrouvés '+row.indicative_difference_usdc.toFixed(6)+' USDC';
        lines.push(sign+row.shock_pct+' % → revente nette fictive '+row.net_exit_usdc.toFixed(6)+' USDC ; '+cost+'.');
      }
      lines.push('Ces niveaux futurs et les volumes ne sont pas garantis : ce tableau n’est pas une prévision ni un ordre.');
    }else lines.push('Scénarios CT indisponibles : '+String(scenarios?.reason||'liquidité ou frais absents')+'.');
    if(chart?.status==='observed')
      lines.push('Contexte marché public : '+chart.instrument+' '+chart.bar+', '+chart.points+' bougies ; variation '+chart.change_pct.toFixed(2)+' % sur la fenêtre '+chart.first_at+' → '+chart.last_at+'. Cette variation en USDT ne valorise pas la position CT/USDC.');
    else if(chart?.status==='stale')lines.push('Contexte public CT/USDT trop ancien : ne pas présenter cette courbe comme un signal actuel.');
    else lines.push('Contexte public CT/USDT indisponible pour cette lecture ; aucune substitution de cours.');
    lines.push('Aucune recommandation d’achat ou de vente ; la décision et toute opération restent humaines.');
    return Object.freeze({read_only:true,market:PAIR,lines:Object.freeze(lines)});
  }
  function compose({account,fills,fees,book},now=Date.now()) {
    const held=position(account);
    const accountAt=Date.parse(account.fetched_at||'');
    if(!Number.isFinite(accountAt)|| now-accountAt<0 || now-accountAt>120000)fail('Solde OKX trop ancien');
    const bought=acquisition(fills,held.qty_ct);
    const rate=takerRate(fees);
    const sale=sellEstimate(book,held.qty_ct,rate,now);
    const pnl=bought.status==='reconciled_fills_only' && sale.status==='indicative'
      ? sale.net_usdc-bought.spent_usdc:null;
    const metrics=exitMetrics(sale,book,held.qty_ct);
    const scenario=ctScenarioGrid(book,held.qty_ct,rate,bought,now);
    return Object.freeze({schema:SCHEMA,market:PAIR,venue:'OKX Europe',quote:'USDC',
      read_only:true,orders_enabled:false,private_data:true,export_to_public_github:false,
      observed_at:new Date(now).toISOString(),portfolio:portfolio(account),position:held,acquisition:bought,
      fee_taker_fraction:rate,liquidation_illustrative:sale,exit_metrics:metrics,
      scenario_grid:scenario,pnl_illustrative_usdc:pnl,profit_proven:false,
      notes:['Les valeurs sont privées et restent localement dans le navigateur.',
        'USDC, USDT et USD ne sont pas interchangeables sans conversion vérifiée.',
        'Le prix futur de revente et le bénéfice réalisé ne sont pas connus.']});
  }
  return Object.freeze({SCHEMA,PAIR,MAX_BOOK_AGE_MS,balanceFor,portfolio,position,acquisition,takerRate,sellEstimate,exitMetrics,ctScenarioGrid,publicCandles,explain,compose});
});
