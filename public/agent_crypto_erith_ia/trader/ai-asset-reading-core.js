/* ERITH.IA · Seven · contrat de dossier multi-actifs PAPER.
 * Pur, sans transport, mutation ni accès au compte. Le panneau CT existant
 * reste propriétaire exclusif de Concrete, de son historique et de ses calculs.
 * Aucun statut ici ne permet d'envoyer un ordre.
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.AgentCryptoAiAssetReading=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const UNIT=10n**18n,MAX_AGE=120000,BOOK_AGE=20000;
 const pattern=/^(?:0|[1-9]\d{0,18})(?:\.\d{1,18})?$/;
 const raw=v=>typeof v==='string'?v:typeof v==='number'&&Number.isFinite(v)?String(v):null;
 function scaled(value){
  const s=raw(value);
  if(!s||!pattern.test(s))return null;
  const [a,b='']=s.split('.');
  return BigInt(a)*UNIT+BigInt(b.padEnd(18,'0'));
 }
 function print(v){
  if(typeof v!=='bigint')return null;
  const sign=v<0n?'-':'',n=v<0n?-v:v;
  return sign+String(n/UNIT)+(n%UNIT===0n?'':'.'+String(n%UNIT).padStart(18,'0').replace(/0+$/,''));
 }
 function time(value,now,age=MAX_AGE){
  const t=Date.parse(typeof value==='string'?value:'');
  return Number.isFinite(now)&&Number.isFinite(t)&&t<=now+30000&&now-t<=age;
 }
 const frozen=(o)=>Object.freeze(o);
 function blocked(reason,code='INCOMPLETE'){
  return frozen({schema:'erith.seven.asset-reading.v1',status:code,
    reason,read_only:true,orders_enabled:false,executable:false,
    sections:frozen([]),simulations:frozen([])});
 }
 function entry(label,status,details){
  return frozen({label,status,details:String(details||'')});
 }
 function validateBook(book,pair,quote,now){
  if(book?.status!=='ok'||book?.provider!=='okx'||book.pair!==pair||
     book.quote!==quote||!time(book.observed_at_utc,now,BOOK_AGE))return null;
  if(!Array.isArray(book.bids)||!book.bids.length||
     !Array.isArray(book.asks)||!book.asks.length)return null;
  const parseSide=(rows,descending)=>{
   let prev=null;
   const out=[];
   for(const row of rows.slice(0,100)){
    if(!Array.isArray(row)||row.length<2)return null;
    const price=scaled(row[0]),quantity=scaled(row[1]);
    if(price===null||quantity===null||price<=0n||quantity<=0n)return null;
    if(prev!==null&&(descending?price>prev:price<prev))return null;
    out.push(frozen({price,quantity}));prev=price;
   }
   return out;
  };
  const bids=parseSide(book.bids,true),asks=parseSide(book.asks,false);
  if(!bids||!asks||bids[0].price>=asks[0].price)return null;
  return frozen({bids:frozen(bids),asks:frozen(asks),
    observed_at_utc:book.observed_at_utc,provider:'OKX public'});
 }
 function validateRules(rules,pair,base,quote,now){
  if(!rules||rules.instId!==pair||rules.instType!=='SPOT'||rules.state!=='live'||
    rules.baseCcy!==base||rules.quoteCcy!==quote||
    !time(rules.observed_at_utc,now))return null;
  const min=scaled(rules.minSz),lot=scaled(rules.lotSz),tick=scaled(rules.tickSz);
  if(min===null||lot===null||tick===null||min<=0n||lot<=0n||tick<=0n)return null;
  return frozen({minimum:min,lot,tick,observed_at_utc:rules.observed_at_utc});
 }
 function quoteAccount(data,pair,now){
  const quote=pair.split('-')[1];
  if(data?.instId!==pair||data?.read_only!==true||
     data?.orders_enabled!==false||data?.real_orders!==0||
     data?.verified!==true||!time(data.account_at_utc,now))return null;
  const trading=scaled(data.trading_available_quote);
  if(trading===null)return null;
  const funding=scaled(data.funding_available_quote);
  const pairFees=data.fee_pair_verified===true;
  const maker=pairFees?scaled(data.fee_maker_rate):null;
  const taker=pairFees?scaled(data.fee_taker_rate):null;
  return frozen({quote,trading:print(trading),funding:print(funding),
    maker_rate:maker===null?null:print(maker),
    taker_rate:taker===null?null:print(taker),
    fee_currency_verified:false,max_buy_verified:false,
    observed_at_utc:data.account_at_utc});
 }
 function basePosition(position,pair,now){
  if(position?.pair!==pair||position?.read_only!==true||position?.verified!==true||
    !time(position.observed_at_utc,now))return null;
  const trading=scaled(position.trading_base),funding=scaled(position.funding_base);
  // Both subaccounts are required: missing does not imply zero.
  if(trading===null||funding===null)return null;
  return frozen({trading, funding,total:trading+funding,
    observed_at_utc:position.observed_at_utc});
 }
 function fractions({base,quote,position,book,rules}){
  const fractions=[25,50,100],rows=[];
  for(const percent of fractions){
   const unavailable=(status,detail)=>frozen({percent,status,detail,
     quantity_base:null,gross_quote:null,net_quote:null,orders_enabled:false});
   if(!position){rows.push(unavailable('POSITION_UNVERIFIED','Solde '+base+' non prouvé.'));continue;}
   if(position.trading===0n){
    rows.push(unavailable(position.funding>0n?'FUNDING_ONLY':'NO_TRADING_POSITION',
      position.funding>0n?'Fonds '+base+' uniquement en Funding ; aucun transfert automatique.':
      'Aucun '+base+' disponible en Trading.'));continue;
   }
   if(!rules||!book){
    rows.push(unavailable('PUBLIC_EVIDENCE_MISSING','Carnet récent et règles Spot exactes nécessaires.'));continue;
   }
   const proposed=position.trading*BigInt(percent)/100n;
   const qty=proposed/rules.lot*rules.lot;
   if(qty<rules.minimum){
    rows.push(frozen({percent,status:'BELOW_MINIMUM',detail:'Sous minSz ; aucune vente admissible.',
     quantity_base:print(qty),gross_quote:null,net_quote:null,orders_enabled:false}));continue;
   }
   let rest=qty,gross=0n;
   for(const row of book.bids){
    const matched=rest<row.quantity?rest:row.quantity;
    gross+=matched*row.price/UNIT;rest-=matched;
    if(rest===0n)break;
   }
   rows.push(frozen({percent,status:rest===0n?'GROSS_ONLY':'BOOK_DEPTH_INSUFFICIENT',
     detail:rest===0n?'Produit brut fictif basé sur un carnet daté ; frais, net et exécution non certifiés.':
      'Profondeur disponible insuffisante ; vente non simulable.',
     quantity_base:print(qty),gross_quote:rest===0n?print(gross):null,
     net_quote:null,orders_enabled:false}));
  }
  return frozen(rows);
 }
 function createReading({selection,market,chart,book,rules,account,position,now=Date.now()}={}){
  const base=String(selection?.symbol||'').toUpperCase(),
    coinId=String(selection?.id||''),quote=String(selection?.quote||'USDC').toUpperCase();
  if(!/^[A-Z][A-Z0-9]{0,19}$/.test(base)||!coinId||!['USDC','USDT','EUR'].includes(quote))
    return blocked('Identité de la cryptomonnaie ou devise de cotation non qualifiée.','IDENTITY_UNVERIFIED');
  if(base==='CT')return blocked('Concrete (CT) reste géré exclusivement par sa Lecture Technique restaurée.','CT_PROTECTED');
  const pair=base+'-'+quote;
  if(market&&((market.id&&market.id!==coinId)||
    (market.symbol&&String(market.symbol).toUpperCase()!==base)))
    return blocked('Fiche Market appartenant à une autre cryptomonnaie.','MARKET_MISMATCH');
  const chartPair=String(chart?.loadedInstrument||'').toUpperCase().replace('/','-');
  const chartParts=chartPair.match(/^([A-Z0-9]{1,20})-([A-Z0-9]{2,12})$/);
  const chartValid=chartParts&&chartParts[1]===base&&chart?.mode==='candles'&&
    Array.isArray(chart.rows)&&chart.rows.length>0;
  const chartProvenance=Boolean(chartValid&&chart?.source_verified===true&&
    ['okx','binance','bitget','coingecko'].includes(String(chart?.provider||'').toLowerCase())&&
    time(chart?.observed_at_utc,now));
  const mPrice=scaled(market?.priceUsd);
  const marketFresh=time(market?.usdUpdatedAt||market?.lastUpdated,now);
  const validBook=validateBook(book,pair,quote,now),
    validRules=validateRules(rules,pair,base,quote,now),
    validAccount=quoteAccount(account,pair,now),
    validPosition=basePosition(position,pair,now);
  const publicData=frozen({market_price_usd:print(mPrice),
    market_timestamp_verified:marketFresh,
    market_source:market?.usdSource||'non certifiée',
    change_24h:typeof market?.change24h==='number'&&Number.isFinite(market.change24h)?
      market.change24h:null,
    chart_instrument:chartValid?chartPair:null,
    chart_interval:chartValid?String(chart.loadedBar||''):null,
    chart_identity_matched:Boolean(chartValid),
    chart_source_verified:chartProvenance,
    chart_warning:chartPair&&!chartValid?
      'Bougies '+chartPair+' différentes de '+base+' : refus de substitution.':null,
    native_pair:pair,book_verified:Boolean(validBook),rules_verified:Boolean(validRules),
    best_bid_quote:validBook?print(validBook.bids[0].price):null,
    best_ask_quote:validBook?print(validBook.asks[0].price):null,
    min_size_base:validRules?print(validRules.minimum):null,
    lot_size_base:validRules?print(validRules.lot):null,
    tick_size_quote:validRules?print(validRules.tick):null});
  const privateData=frozen({quote_account_verified:Boolean(validAccount),
    base_position_verified:Boolean(validPosition),
    trading_quote:validAccount?.trading||null,
    funding_quote:validAccount?.funding??null,
    trading_base:validPosition?print(validPosition.trading):null,
    funding_base:validPosition?print(validPosition.funding):null,
    total_base:validPosition?print(validPosition.total):null,
    maker_rate:validAccount?.maker_rate??null,
    taker_rate:validAccount?.taker_rate??null,
    fee_currency_verified:false,max_buy_verified:false,
    acquisition_cost_proven:false,pnl_proven:false,
    acquisition_cost:null,pnl:null});
  const sections=frozen([
    entry('Lecture Technique',chartValid?'DATA':'WAITING',
      chartValid?'Bougies '+chartPair+' ; source '+(chartProvenance?'datée et attestée':'NON CERTIFIÉE')+
       ', devise du graphique distincte du Spot '+pair+'.':
        'Bougies exactes '+base+' non chargées.'),
    entry('Fiche publique',mPrice===null?'WAITING':'DATA',
      'Market USD indépendant du carnet natif '+pair+'.'),
    entry('Position personnelle',validPosition?'VERIFIED':'UNKNOWN',
      validPosition?'Trading et Funding '+base+' datés séparément.':
        'Aucune position '+base+' prouvée ; absence ne signifie pas zéro.'),
    entry('Règles OKX',validRules?'VERIFIED':'UNKNOWN',
      validRules?'minSz, lotSz et tickSz de '+pair+' uniquement.':
        'Règles publiques natives manquantes, aucune substitution.'),
    entry('Simulations de revente',validBook&&validRules&&validPosition?'GROSS_ONLY':'BLOCKED',
      '25/50/100 % sur Trading uniquement ; produit brut sans frais nets certifiés.'),
    entry('Analyse Seven','INSUFFICIENT_EVIDENCE',
      'Coût d acquisition et P&L non prouvés sans rapprochement complet des transactions.'),
    entry('Cas d école','EDUCATIONAL',
      'Sources, risques, liquidité et limites propres à '+pair+' ; aucune transaction.')
  ]);
  return frozen({schema:'erith.seven.asset-reading.v1',status:'PAPER_READ_ONLY',
    asset:frozen({base,quote,coin_id:coinId,pair}),
    public:publicData,private:privateData,sections,
    simulations:fractions({base,quote,position:validPosition,book:validBook,rules:validRules}),
    read_only:true,orders_enabled:false,executable:false,transfer_enabled:false,
    caveat:'Étude de marché et compte en lecture seule. Aucun ordre ou gain garanti.'});
 }
 return frozen({createReading});
});
