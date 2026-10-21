'use strict';
/* ERITH.IA Seven Spot Gate — public-only PRE-FLIGHT. NO order, account,
   trade permission, fill, or implied CoinGecko <-> OKX token identity. */
const fs=require('node:fs'),path=require('node:path');
const paper=require('../trader/trader-paper-decision-core.js');
const ROOT=path.resolve(__dirname,'..');
const INPUT=path.join(ROOT,'data/trader_flux/seven_capital_scout/status.json');
const OUTPUT=path.join(ROOT,'data/trader_flux/seven_capital_scout/spot_gate.json');
const BUDGET='10',RESERVE='0.94',QUOTE='USDC';
const UNIT=10n**18n;
const normalized=s=>typeof s==='string'&&/^[A-Z0-9]{2,15}$/.test(s)?s:null;
const fixed=s=>{
 if(typeof s!=='string'||!/^(?:0|[1-9]\d{0,23})(?:\.\d{1,18})?$/.test(s))
  throw Error('Décimale native Spot invalide');
 const [a,b='']=s.split('.');
 return BigInt(a)*UNIT+BigInt(b.padEnd(18,'0'));
};
const fmt=n=>{
 const a=n/UNIT,b=(n%UNIT).toString().padStart(18,'0').replace(/0+$/,'');
 return a.toString()+(b?'.'+b:'');
};
const ceil=(v,d)=>(v+d-1n)/d;
const nowIso=ms=>new Date(ms).toISOString();
function verifyInput(data){
 if(data?.schema!=='erith.seven.capital-scout.paper.v1'||
    data.mode!=='AUTOMATED_PROSPECTIVE_RESEARCH_ONLY'||
    data.orders_enabled!==false||data.real_orders_submitted!==0||
    data.paper_orders_submitted!==0||data.private_account_access!==false||
    data.simulation_budget_usdc!==10||data.reserved_cost_buffer_usdc!==0.94||
    !Array.isArray(data.observations)||typeof data.latest_archive_date_utc!=='string')
    throw Error('Rapport prospectif Seven non conforme');
 const latest=data.latest_archive_date_utc;
 const rows=data.observations.filter(x=>x.date_utc===latest);
 if(rows.length>3)throw Error('Trop de candidats dans la journée');
 const unique=new Set();
 for(const row of rows){
  if(!normalized(row.symbol)||typeof row.coin_id!=='string'||
     row.decision!=='NO_TRADE'||row.net_profit_usdc!==null||
     row.fill!==false||!row.source_at_utc?.endsWith('Z')||
     row.source_at_utc.slice(0,10)!==latest||
     unique.has(row.symbol))
    throw Error('Candidate non qualifiée / doublon symbole');
  unique.add(row.symbol);
 }
 return rows;
}
function unavailable(candidate,status,at){
 return {coin_id:candidate.coin_id,symbol:candidate.symbol,
  pair:candidate.symbol+'-USDC',signal_at_utc:candidate.source_at_utc,
  inspected_at_utc:nowIso(at),status,
  exchange:'OKX',instrument_type:'SPOT',quote:'USDC',
  native_pair_publicly_observed:false,book_publicly_verified:false,
  exact_contract_identity_proven:false,account_trading_permission_verified:false,
  fees_currency_verified:false,min_notional_rule_verified:false,
  return_after_fees_certified:false,can_trade_10_usdc:false,
  trade_approved:false,real_order_sent:false,
  spot_fills:0,actual_profit_usdc:null};
}
function assess(candidate,instruments,books,at=Date.now()){
 if(!normalized(candidate?.symbol)||!Number.isFinite(at))throw Error('Candidat ou horloge invalide');
 const pair=candidate.symbol+'-USDC';
 const base=unavailable(candidate,'SOURCE_UNAVAILABLE',at);
 if(instruments?.code!=='0'||!Array.isArray(instruments?.data))
  return base;
 const list=instruments.data.filter(x=>x?.instId===pair&&x?.instType==='SPOT');
 if(list.length===0)return {...base,status:'NO_PUBLIC_SPOT_USDC_PAIR_AT_CHECK'};
 if(list.length!==1)return {...base,status:'AMBIGUOUS_NATIVE_PAIR'};
 const evidence={observed_at_utc:nowIso(at),payload:instruments};
 const rules=paper.verifiedSpotRules(evidence,pair,at);
 if(!rules)return {...base,status:'NATIVE_RULES_UNVERIFIED'};
 const qualified={...base,native_pair_publicly_observed:true,
  minSz:rules.minSz,lotSz:rules.lotSz,tickSz:rules.tickSz};
 if(books?.code!=='0'||!Array.isArray(books?.data)||books.data.length!==1)
  return {...qualified,status:'ORDER_BOOK_UNAVAILABLE'};
 const row=books.data[0],t=Number(row.ts);
 if(!Number.isSafeInteger(t)||t<=0||t>at+2000||at-t>20000)
  return {...qualified,status:'ORDER_BOOK_STALE_OR_UNDATED'};
 const payload={status:'ok',provider:'okx',pair,quote:QUOTE,
   observed_at_utc:nowIso(t),bids:row.bids,asks:row.asks};
 const diag=paper.diagnoseSpotLiveBook(payload,pair,at);
 if(!diag.accepted)
  return {...qualified,status:'ORDER_BOOK_INVALID',source_code:diag.code};
 const publicOnly={...qualified,book_publicly_verified:true,
  public_book_timestamp_utc:nowIso(t)};
 try{
  const ask=fixed(row.asks[0][0]),bid=fixed(row.bids[0][0]);
  const askQty=fixed(row.asks[0][1]),bidQty=fixed(row.bids[0][1]);
  const lot=fixed(rules.lotSz),minimum=fixed(rules.minSz);
  const tick=fixed(rules.tickSz),budget=fixed(BUDGET);
  if(!(ask>bid&&bid>0n&&lot>0n&&minimum>0n&&tick>0n&&
       ask%tick===0n&&bid%tick===0n))
   return {...publicOnly,status:'PRICE_TICK_OR_RULES_INVALID'};
  const buyGross=(((budget*UNIT)/ask)/lot)*lot;
  if(buyGross===0n||buyGross<minimum)
   return {...publicOnly,status:'BUY_BELOW_NATIVE_MINIMUM'};
  if(askQty<buyGross)
   return {...publicOnly,status:'TOP_ASK_DEPTH_INSUFFICIENT'};
  // Hypothetical base-fee 0.10%. Real fees could be larger or charged in quote;
  // this is a stress check, not a fee verification.
  const assumedBaseFee=ceil(buyGross,1000n);
  const received=buyGross>assumedBaseFee?buyGross-assumedBaseFee:0n;
  const netSellable=(received/lot)*lot;
  if(netSellable<minimum)
   return {...publicOnly,status:'SELL_BELOW_NATIVE_MINIMUM_AFTER_ASSUMED_BASE_FEE',
     hypothetical_gross_base:fmt(buyGross),
     hypothetical_net_sellable_base:fmt(netSellable)};
  if(bidQty<netSellable)
   return {...publicOnly,status:'TOP_BID_DEPTH_INSUFFICIENT'};
  const hypotheticalSellGross=(netSellable*bid)/UNIT;
  const hypotheticalFeeQuote=ceil(hypotheticalSellGross,1000n);
  const hypotheticalNet=hypotheticalSellGross-hypotheticalFeeQuote;
  const hypotheticalSpent=(buyGross*ask)/UNIT;
  return {...publicOnly,status:'PUBLIC_BOOK_AND_SIZE_PAPER_SCREEN_PASSED',
    scenario_only:true,hypothetical_buy_fee_pct:0.1,
    hypothetical_sell_fee_pct:0.1,
    hypothetical_buy_qty_base:fmt(buyGross),
    hypothetical_net_sellable_base:fmt(netSellable),
    hypothetical_bid_usdc:fmt(bid),hypothetical_ask_usdc:fmt(ask),
    hypothetical_roundtrip_cost_usdc:fmt(hypotheticalSpent-hypotheticalNet),
    hypothetical_net_after_immediate_exit_usdc:fmt(hypotheticalNet),
    quote_conversion_performed:false,
    can_trade_10_usdc:false,trade_approved:false,
    unverified_required:['exact_base_contract_identity','account_permission',
      'account_fee_currency','market_min_notional','live_slippage_and_order_acceptance'],
    reason:'Pure public snapshot at time of check; no proof of tradability or future profits.'};
 }catch(error){return {...publicOnly,status:'DECIMAL_OR_MODEL_UNSUPPORTED'};}
}
const endpoint=(kind,pair)=>{
 const u=new URL('https://www.okx.com/api/v5/'+
   (kind==='rules'?'public/instruments':'market/books'));
 if(kind==='rules'){
  u.searchParams.set('instType','SPOT');u.searchParams.set('instId',pair);
 }else{u.searchParams.set('instId',pair);u.searchParams.set('sz','5');}
 return u.href;
};
async function publicRead(url){
 const allowed=/^https:\/\/www\.okx\.com\/api\/v5\/(?:public\/instruments|market\/books)\?/;
 if(!allowed.test(url))throw Error('Only public OKX read routes allowed');
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),5000);
 try{
  const res=await fetch(url,{method:'GET',credentials:'omit',redirect:'error',
    headers:{Accept:'application/json'},signal:controller.signal});
  if(!res.ok)throw Error('HTTP '+res.status);
  const data=await res.text();
  if(data.length>30000)throw Error('Oversized public payload');
  return JSON.parse(data);
 }finally{clearTimeout(timer);}
}
async function prepare(source,query=publicRead,at=Date.now()){
 const selected=verifyInput(source),candidates=[];
 for(const candidate of selected){
  const pair=candidate.symbol+'-USDC';
  let rules=null,book=null;
  try{
    rules=await query(endpoint('rules',pair));
    if(rules?.code==='0'&&Array.isArray(rules.data)&&
       rules.data.some(x=>x?.instId===pair&&x.instType==='SPOT'&&x.state==='live'))
      book=await query(endpoint('book',pair));
  }catch(_){ /* Failure closes the gate. */ }
  candidates.push(assess(candidate,rules,book,Date.now()));
 }
 return {schema:'erith.seven.public-usdc-spot-gate.v1',
   mode:'READ_ONLY_PUBLIC_MARKET_PRECHECK',
   input_last_archive_utc:source.latest_archive_date_utc,
   inspected_at_utc:selected.length?nowIso(at):null,budget_usdc:10,cost_buffer_usdc:0.94,
   exact_wallet_balance_verified:false,quote:'USDC',
   market_data_venue:'OKX',candidates,
   source_times_are_not_signal_entry_times:true,
   no_trade_without_additional_proofs:true,
   real_orders_enabled:false,real_orders_submitted:0,paper_fills:0,
   actual_profit_usdc:null,profit_certified:false,
   api_credentials_used:false,private_account_access:false,
   reserve_spent:false,market_fills_guaranteed:false,
   source_urls:['https://www.okx.com/api/v5/public/instruments',
     'https://www.okx.com/api/v5/market/books'],
   note:'Fail-closed. Even a passing size/book screen cannot establish exact token contract, account fee currency, min notional, fillability or a trade. Futures/SWAP are rejected.'};
}
async function main(){
 const source=JSON.parse(fs.readFileSync(INPUT,'utf8'));
 const result=await prepare(source),body=JSON.stringify(result,null,2)+'\n';
 fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
 if(!fs.existsSync(OUTPUT)||fs.readFileSync(OUTPUT,'utf8')!==body)
   fs.writeFileSync(OUTPUT,body);
 console.log('Seven public Spot gate: '+result.candidates.length+
   ' candidates; real orders=0; source '+result.input_last_archive_utc);
}
if(require.main===module)main().catch(e=>{console.error(String(e));process.exitCode=1;});
module.exports={verifyInput,assess,prepare,endpoint,publicRead,fixed,fmt};
