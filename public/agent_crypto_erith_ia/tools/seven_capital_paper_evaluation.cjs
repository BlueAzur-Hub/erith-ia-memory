'use strict';
/* Seven Capital · derived, deterministic PAPER what-if from SHA-verified public books.
 * NO fills, positions, real trading, private data or invented future quotation.
 * A quote at the latest timestamp is NOT evidence of an executable sale. */
const fs=require('node:fs');
const path=require('node:path');
const journal=require('./seven_capital_spot_journal.cjs');
const gate=require('./seven_spot_gate.cjs');
const ROOT=path.resolve(__dirname,'../data/trader_flux/seven_capital_spot');
const OUT=path.join(ROOT,'paper_evaluation.json');
const SCHEMA='erith.seven.capital.spot-paper-quote-evaluation.v1';
const UNIT=10n**18n, BUDGET=10n*UNIT;
const milli=1000n; // 0.1% hypothetical fee on each side; NOT account fees
const positive=s=>typeof s==='string'&&gate.fixed(s)>0n;
const ceil=(a,d)=>(a+d-1n)/d;
const floorLot=(v,lot)=>(v/lot)*lot;
const money=n=>n<0n?'-'+gate.fmt(-n):gate.fmt(n);
const stamp=s=>{const x=Date.parse(s||'');return Number.isFinite(x)&&s?.endsWith('Z')?x:NaN};
const same=(a,b)=>a.coin_id===b.coin_id&&a.symbol===b.symbol&&a.pair===b.pair&&
 a.quote===b.quote&&a.quote==='USDC';
const none=(asset,status,why,extra={})=>({
 coin_id:asset.coin_id,symbol:asset.symbol,pair:asset.symbol+'-USDC',
 status,reason:why,quote:'USDC',hypothetical_pnl_usdc:null,
 hypothetical_final_budget_usdc:null,real_profit_usdc:null,
 orders_enabled:false,real_orders:0,paper_fills:0,
 position_opened:false,position_closed:false,...extra});
const goodDecimal=s=>{try{return positive(s)}catch(_){return false}};
function assess(asset,first,firstRef,later,laterRef){
 const a=first?.markets?.filter(m=>m.coin_id===asset.coin_id&&m.symbol===asset.symbol);
 if(!Array.isArray(a)||a.length!==1||a[0].pair!==asset.symbol+'-USDC'||
    a[0].quote!=='USDC')
  return none(asset,'ENTRY_INVALID','Identité native Spot USDC non unique dans le premier relevé');
 const entry=a[0];
 const entryAt=stamp(entry.public_book_at_utc);
 const base={entry_ref:firstRef,entry_book_at_utc:Number.isFinite(entryAt)?entry.public_book_at_utc:null,
  fee_model:'BUY_BASE_0.1_PERCENT_CEIL;SELL_QUOTE_0.1_PERCENT_CEIL',
  cost_reserve_separate_usdc:'0.94',
  real_fees_verified:false,contract_identity_verified:false,
  execution_certified:false};
 if(entry.status!=='PUBLIC_BOOK_AND_SIZE_PAPER_SCREEN_PASSED')
  return none(asset,'ENTRY_REJECTED','Contrôle initial refusé : '+String(entry.status),base);
 try{
  if(!Number.isFinite(entryAt)||!goodDecimal(entry.ask_usdc)||!goodDecimal(entry.bid_usdc)||
     !goodDecimal(entry.ask_qty_base)||!goodDecimal(entry.bid_qty_base)||
     !goodDecimal(entry.min_size)||!goodDecimal(entry.lot_step)||
     !goodDecimal(entry.tick_step)||!goodDecimal(entry.hypothetical_buy_qty_base)||
     !goodDecimal(entry.hypothetical_sellable_base)||
     entry.assumed_buy_fee_pct!==0.1||entry.assumed_sell_fee_pct!==0.1||
     entry.exact_contract_identity_proven!==false||
     entry.account_fee_currency_verified!==false||
     entry.market_fill_proven!==false)
   throw Error('Règles, carnet ou hypothèses absents');
  const ask=gate.fixed(entry.ask_usdc),bid=gate.fixed(entry.bid_usdc);
  const lot=gate.fixed(entry.lot_step),minimum=gate.fixed(entry.min_size);
  const tick=gate.fixed(entry.tick_step);
  const askQty=gate.fixed(entry.ask_qty_base),bidQty=gate.fixed(entry.bid_qty_base);
  if(bid>=ask||ask%tick!==0n||bid%tick!==0n)throw Error('Prix initiaux hors tick');
  const gross=floorLot((BUDGET*UNIT)/ask,lot);
  const baseFee=ceil(gross,milli),net=floorLot(gross-baseFee,lot);
  if(gross<minimum||net<minimum||gross>askQty||net>bidQty||
     gross!==gate.fixed(entry.hypothetical_buy_qty_base)||
     net!==gate.fixed(entry.hypothetical_sellable_base))
   throw Error('Quantité initiale non réconciliable avec le Spot Gate');
  const spent=gross*ask/UNIT,unspent=BUDGET-spent;
  if(spent<=0n||spent>BUDGET)throw Error('Budget non respecté');
  const initial={...base,entry_ask_usdc:gate.fmt(ask),
   entry_gross_qty_base:gate.fmt(gross),
   entry_fee_base_hypothetical:gate.fmt(baseFee),
   entry_net_sellable_base:gate.fmt(net),
   entry_spent_usdc:gate.fmt(spent),
   unspent_budget_usdc:gate.fmt(unspent)};
  if(!later)
   return none(asset,'AWAITING_FUTURE_BOOK','Aucun carnet postérieur enregistré',initial);
  const future=later?.markets?.filter(m=>m.coin_id===asset.coin_id&&m.symbol===asset.symbol);
  if(!Array.isArray(future)||future.length!==1||!same(entry,future[0]))
   return none(asset,'EXIT_NOT_EVALUABLE','Identité ou paire Spot USDC différente',initial);
  const exit=future[0],exitAt=stamp(exit.public_book_at_utc);
  const period={...initial,latest_ref:laterRef,latest_status:exit.status,
   latest_book_at_utc:Number.isFinite(exitAt)?exit.public_book_at_utc:null};
  if(!Number.isFinite(exitAt)||exitAt<=entryAt||
     !goodDecimal(exit.bid_usdc)||!goodDecimal(exit.ask_usdc)||
     !goodDecimal(exit.bid_qty_base)||!goodDecimal(exit.ask_qty_base)||
     !goodDecimal(exit.min_size)||!goodDecimal(exit.lot_step)||
     !goodDecimal(exit.tick_step)||exit.market_fill_proven!==false||
     exit.exact_contract_identity_proven!==false)
   return none(asset,'EXIT_NOT_EVALUABLE','Bid public postérieur ou règles non vérifiables',period);
  if(exit.min_size!==entry.min_size||exit.lot_step!==entry.lot_step||
     exit.tick_step!==entry.tick_step)
   return none(asset,'EXIT_NOT_EVALUABLE','Règles Spot natives modifiées depuis l’entrée',period);
  const sellBid=gate.fixed(exit.bid_usdc),sellAsk=gate.fixed(exit.ask_usdc);
  const level=gate.fixed(exit.bid_qty_base);
  if(sellBid>=sellAsk||sellBid%tick!==0n||level<net)
   return none(asset,'EXIT_NOT_EVALUABLE','Meilleur bid croisé, hors tick ou profondeur insuffisante',period);
  const grossQuote=(net*sellBid)/UNIT,quoteFee=ceil(grossQuote,milli);
  const netQuote=grossQuote-quoteFee,final=unspent+netQuote;
  return none(asset,'LATEST_BID_EVALUABLE','Calcul de sortie à la dernière cotation enregistrée ; aucune transaction exécutée',{
   ...period,latest_bid_usdc:gate.fmt(sellBid),
   latest_bid_available_qty_base:gate.fmt(level),
   hypothetical_exit_gross_usdc:gate.fmt(grossQuote),
   hypothetical_exit_fee_usdc:gate.fmt(quoteFee),
   hypothetical_exit_net_usdc:gate.fmt(netQuote),
   hypothetical_final_budget_usdc:gate.fmt(final),
   hypothetical_pnl_usdc:money(final-BUDGET),
   no_trade_fill_claim:true});
 }catch(error){return none(asset,'ENTRY_INVALID','Reconstitution de l’entrée invalide : '+error.message,base)}
}

// Frozen research horizons: first archived snapshot after the target.
// Grace=4h accommodates the existing ~4h collection rhythm.
// Missing or rejected quotes remain non-evaluable; NO retroactive best-price pick.
const HORIZON_HOURS=Object.freeze([4,24,48]);
const HORIZON_GRACE_HOURS=4;
function fixedHorizons(cohort,records,read){
 const firstRecord=records[0],first=read(firstRecord);
 const anchor=stamp(first.recorded_at_utc);
 if(!Number.isFinite(anchor))throw Error('Horodatage initial invalide');
 return HORIZON_HOURS.map(hours=>{
  const target=anchor+hours*3600000,windowEnd=target+HORIZON_GRACE_HOURS*3600000;
  // Strict chronological index was SHA-verified by journal.readIndex.
  const next=records.slice(1).find(r=>stamp(r.recorded_at_utc)>=target);
  const within=next&&stamp(next.recorded_at_utc)<=windowEnd;
  const doc=within?read(next):null;
  const candidates=cohort.selected.map(asset=>{
   if(!within){
    const status=next?'HORIZON_MISSED_WINDOW':'AWAITING_HORIZON';
    return none(asset,status,next?'Aucun relevé dans la fenêtre fixée':'Aucun relevé postérieur à l’horizon',
     {horizon_hours:hours,horizon_target_at_utc:new Date(target).toISOString(),
      grace_hours:HORIZON_GRACE_HOURS});
   }
   const outcome=assess(asset,first,firstRecord.sha256,doc,next.sha256);
   return {...outcome,horizon_hours:hours,
     horizon_target_at_utc:new Date(target).toISOString(),
     observation_delay_minutes:Math.round((stamp(next.recorded_at_utc)-target)/60000),
     observed_at_utc:next.recorded_at_utc};
  });
  return {hours,target_at_utc:new Date(target).toISOString(),
   grace_hours:HORIZON_GRACE_HOURS,recorded_at_utc:within?next.recorded_at_utc:null,
   selection:'FIRST_ARCHIVED_RECORD_AT_OR_AFTER_TARGET',
   no_hindsight_selection:true,candidates};
 });
}

function evaluate(root=ROOT){
 const index=journal.readIndex(root); // SHA-256 validation of every source file
 const cohorts=[];
 const read=r=>JSON.parse(fs.readFileSync(path.join(root,r.file),'utf8'));
 for(const c of index.cohorts){
  const records=index.records.filter(x=>x.cohort_id===c.id);
  if(!records.length)throw Error('Cohorte sans première archive');
  if(records[0].kind!=='FIRST_PUBLIC_SCREEN'||records.slice(1).some(x=>x.kind!=='LATER_PUBLIC_BID'))
   throw Error('Chronologie des types de relevé invalide');
  const first=read(records[0]),last=records.length>1?read(records.at(-1)):null;
  const entries=c.selected.map(asset=>assess(asset,first,records[0].sha256,
     last,last?records.at(-1).sha256:null));
  cohorts.push({cohort_id:c.id,first_record_at_utc:records[0].recorded_at_utc,
   last_record_at_utc:records.at(-1).recorded_at_utc,
   observations:records.length,
   independent_alternative_scenarios:true,
   not_a_combined_30_usdc_portfolio:true,
   candidates:entries,horizons:fixedHorizons(c,records,read)});
 }
 const counts={awaiting:0,entry_rejected:0,exit_evaluable:0,insufficient:0};
 for(const c of cohorts)for(const x of c.candidates){
  if(x.status==='AWAITING_FUTURE_BOOK')counts.awaiting++;
  else if(x.status==='ENTRY_REJECTED')counts.entry_rejected++;
  else if(x.status==='LATEST_BID_EVALUABLE')counts.exit_evaluable++;
  else counts.insufficient++;
 }
 return {schema:SCHEMA,mode:'PROSPECTIVE_PUBLIC_QUOTE_ONLY',
  source_index_schema:journal.SCHEMA,quote:'USDC',
  budget_per_alternative_usdc:10,reserve_separate_usdc:0.94,
  entry_fee_assumption_pct:0.1,exit_fee_assumption_pct:0.1,
  no_market_execution_proof:true,account_fees_verified:false,
  orders_enabled:false,real_orders:0,paper_fills:0,
  positions_opened:0,positions_closed:0,real_profit_usdc:null,
  paper_realized_profit_usdc:null,
  last_source_recorded_at_utc:index.records.at(-1)?.recorded_at_utc||null,
  counts,horizon_hours:HORIZON_HOURS,horizon_grace_hours:HORIZON_GRACE_HOURS,
  cohorts,note:'One 10 USDC alternative per asset. Latest observed bid only, no favorable hindsight selection. Quotes and fees are hypothetical. NO position, fill or certified P&L.'};
}
function run(root=ROOT){
 const r=evaluate(root),file=path.join(root,'paper_evaluation.json');
 const body=JSON.stringify(r,null,2)+'\n';
 if(!fs.existsSync(file)||fs.readFileSync(file,'utf8')!==body){
  fs.writeFileSync(file,body);
  console.log('SEVEN PAPER QUOTE EVALUATION UPDATED',JSON.stringify(r.counts));
 }else console.log('SEVEN PAPER QUOTE EVALUATION UNCHANGED');
 return r;
}
if(require.main===module)try{run()}catch(e){console.error('SEVEN PAPER EVALUATION STOP:',e.message);process.exitCode=1}
module.exports={SCHEMA,assess,fixedHorizons,evaluate,run};
