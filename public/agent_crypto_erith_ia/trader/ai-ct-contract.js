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
  function compose({account,fills,fees,book},now=Date.now()) {
    const held=position(account);
    const accountAt=Date.parse(account.fetched_at||'');
    if(!Number.isFinite(accountAt)|| now-accountAt<0 || now-accountAt>120000)fail('Solde OKX trop ancien');
    const bought=acquisition(fills,held.qty_ct);
    const rate=takerRate(fees);
    const sale=sellEstimate(book,held.qty_ct,rate,now);
    const pnl=bought.status==='reconciled_fills_only' && sale.status==='indicative'
      ? sale.net_usdc-bought.spent_usdc:null;
    return Object.freeze({schema:SCHEMA,market:PAIR,venue:'OKX Europe',quote:'USDC',
      read_only:true,orders_enabled:false,private_data:true,export_to_public_github:false,
      observed_at:new Date(now).toISOString(),portfolio:portfolio(account),position:held,acquisition:bought,
      fee_taker_fraction:rate,liquidation_illustrative:sale,
      pnl_illustrative_usdc:pnl,profit_proven:false,
      notes:['Les valeurs sont privées et restent localement dans le navigateur.',
        'USDC, USDT et USD ne sont pas interchangeables sans conversion vérifiée.',
        'Le prix futur de revente et le bénéfice réalisé ne sont pas connus.']});
  }
  return Object.freeze({SCHEMA,PAIR,MAX_BOOK_AGE_MS,balanceFor,portfolio,position,acquisition,takerRate,sellEstimate,compose});
});
