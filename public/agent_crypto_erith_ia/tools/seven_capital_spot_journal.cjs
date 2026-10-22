'use strict';
/* Seven Capital · immutable public OKX/USDC evidence, no orders or simulated fills.
 * Reuses the existing four-hour priority Spot workflow; no scheduler of its own.
 * NEVER treats a future best bid as proof of an executed sale. */
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const radar=require('../laboratoire/radar.js');
const immediate=require('./seven_capital_now.cjs');
const gate=require('./seven_spot_gate.cjs');
const OUTPUT=path.resolve(__dirname,'../data/trader_flux/seven_capital_spot');
const MARKET=path.resolve(__dirname,'../data/crypto');
const SCHEMA='erith.seven.capital.spot-public-journal.v1';
const ENTRY='erith.seven.capital.spot-public-observation.v1';
const SHA=/^[0-9a-f]{64}$/;
const FILE=/^observations\/20\d\d-\d\d-\d\dT\d{6}\d{3}Z--20\d\d-\d\d-\d\d\.json$/;
const MS_HOUR=3600000;
function hash(raw){return crypto.createHash('sha256').update(raw).digest('hex')}
function textFile(file){return fs.readFileSync(file,'utf8')}
function empty(){return {schema:SCHEMA,mode:'PUBLIC_SPOT_RESEARCH_ONLY',
  quote:'USDC',budget_usdc:10,reserve_usdc:0.94,
  orders_enabled:false,real_orders:0,paper_fills:0,
  profit_real_usdc:null,profit_paper_usdc:null,
  cohorts:[],records:[]}}
function verify(index,root=OUTPUT){
 if(index?.schema!==SCHEMA||index.orders_enabled!==false||
    index.real_orders!==0||index.paper_fills!==0||
    index.profit_real_usdc!==null||index.profit_paper_usdc!==null||
    index.quote!=='USDC'||index.budget_usdc!==10||
    index.reserve_usdc!==0.94||
    !Array.isArray(index.cohorts)||!Array.isArray(index.records))
   throw Error('Contrat du journal Spot non conforme');
 const ids=new Set(),names=new Set(),chronology=new Map();
 for(const c of index.cohorts){
  if(!/^20\d\d-\d\d-\d\d$/.test(c.date_utc||'')||
     c.id!==c.date_utc||ids.has(c.id)||
     !Array.isArray(c.selected)||c.selected.length<1||c.selected.length>3||
     !Number.isFinite(Date.parse(c.first_seen_at_utc))||
     !Array.isArray(c.source_times_utc)||c.source_times_utc.length!==2)
    throw Error('Cohorte Spot incohérente');
  const symbols=new Set(),coins=new Set();
  for(const x of c.selected){
   if(typeof x.coin_id!=='string'||!x.coin_id||
      typeof x.symbol!=='string'||!/^[A-Z0-9]{2,15}$/.test(x.symbol)||
      symbols.has(x.symbol)||coins.has(x.coin_id)||
      !/^20\d\d-\d\d-\d\dT/.test(x.source_at_utc||'')||
      x.source_at_utc.slice(0,10)!==c.date_utc)
    throw Error('Identité de cohorte en conflit');
   symbols.add(x.symbol);coins.add(x.coin_id);
  }
  ids.add(c.id);
 }
 for(const r of index.records){
  if(!ids.has(r.cohort_id)||!FILE.test(r.file||'')||
     !SHA.test(r.sha256||'')||names.has(r.file)||
     !Number.isFinite(Date.parse(r.recorded_at_utc))||
     !['FIRST_PUBLIC_SCREEN','LATER_PUBLIC_BID'].includes(r.kind))
    throw Error('Index observation invalide');
  names.add(r.file);
  const actual=textFile(path.join(root,r.file));
  if(hash(actual)!==r.sha256)throw Error('Archive modifiée : '+r.file);
  const data=JSON.parse(actual);
  if(data?.schema!==ENTRY||data.cohort_id!==r.cohort_id||
     data.recorded_at_utc!==r.recorded_at_utc||
     data.kind!==r.kind||data.orders_enabled!==false||
     data.paper_fills!==0||data.net_profit_usdc!==null||
     !Array.isArray(data.markets))
    throw Error('Document archivé non conforme');
  const prev=chronology.get(r.cohort_id);
  if(prev && Date.parse(r.recorded_at_utc)<=Date.parse(prev))
    throw Error('Chronologie journal non croissante');
  chronology.set(r.cohort_id,r.recorded_at_utc);
 }
 return index;
}
function readIndex(root=OUTPUT){
 const p=path.join(root,'index.json');
 return verify(fs.existsSync(p)?JSON.parse(textFile(p)):empty(),root);
}
function candidate(x){return {coin_id:x.id,symbol:x.symbol,
 source_at_utc:x.sourceSnapshot,rank:x.rank,price_usd:x.priceUsd}}
function cohortFrom(scan,at,existing){
 const s=immediate.shortlist(scan,at);
 if(s.status!=='RESEARCH_CANDIDATES_ONLY'||!s.selected.length||
    existing.cohorts.some(c=>c.id===s.date))return null;
 const xs=s.selected.map(candidate);
 if(new Set(xs.map(x=>x.symbol)).size!==xs.length)
  throw Error('Symboles Spot ambigus; cohorte refusée');
 return {id:s.date,date_utc:s.date,first_seen_at_utc:new Date(at).toISOString(),
  source_times_utc:[s.source_at_utc.core,s.source_at_utc.extended],
  universe_eligible:s.eligible,policy_matches:s.policy_matches,
  selected:xs,selection_frozen:true};
}
function sourceFor(c){
 return {schema:'erith.seven.capital-scout.paper.v1',
  mode:'AUTOMATED_PROSPECTIVE_RESEARCH_ONLY',
  latest_archive_date_utc:c.date_utc,simulation_budget_usdc:10,
  reserved_cost_buffer_usdc:0.94,orders_enabled:false,
  real_orders_submitted:0,paper_orders_submitted:0,
  private_account_access:false,
  observations:c.selected.map(x=>({coin_id:x.coin_id,symbol:x.symbol,
   source_at_utc:x.source_at_utc,date_utc:c.date_utc,
   decision:'NO_TRADE',fill:false,net_profit_usdc:null}))};
}
function evidence(c,r){
 if(!c||r.coin_id!==c.coin_id||r.symbol!==c.symbol||r.pair!==c.symbol+'-USDC')
  throw Error('Réponse Spot incohérente avec la cohorte');
 return {coin_id:c.coin_id,symbol:c.symbol,pair:r.pair,quote:'USDC',
  selected_at_utc:c.source_at_utc,selected_price_aggregate_usd:c.price_usd,
  status:r.status,public_book_at_utc:r.public_book_timestamp_utc||null,
  bid_usdc:r.public_bid_usdc??null,ask_usdc:r.public_ask_usdc??null,
  bid_qty_base:r.public_bid_qty_base??null,ask_qty_base:r.public_ask_qty_base??null,
  min_size:r.minSz??null,lot_step:r.lotSz??null,tick_step:r.tickSz??null,
  hypothetical_buy_qty_base:r.hypothetical_buy_qty_base??null,
  hypothetical_sellable_base:r.hypothetical_net_sellable_base??null,
  assumed_buy_fee_pct:r.hypothetical_buy_fee_pct??null,
  assumed_sell_fee_pct:r.hypothetical_sell_fee_pct??null,
  same_book_immediate_exit_usdc:r.hypothetical_net_after_immediate_exit_usdc??null,
  exact_contract_identity_proven:false,account_fee_currency_verified:false,
  market_fill_proven:false,real_order_sent:false};
}
function makeDocument(c,report,at,first,entryBookTimes){
 if(report?.schema!=='erith.seven.public-usdc-spot-gate.v1'||
    report.real_orders_submitted!==0||report.paper_fills!==0||
    report.real_orders_enabled!==false||
    !Array.isArray(report.candidates)||report.candidates.length!==c.selected.length)
  throw Error('Spot Gate non conforme');
 const markets=report.candidates.map((row,i)=>evidence(c.selected[i],row));
 for(const m of markets){
  if(m.public_book_at_utc){
   const book=Date.parse(m.public_book_at_utc);
   if(!Number.isFinite(book)||book>Date.now()+120000)
    throw Error('Horodatage carnet invalide');
  }
  m.future_bid_observed=first?false:!!(m.public_book_at_utc&&m.bid_usdc&&
    entryBookTimes[m.coin_id]&&
    Date.parse(m.public_book_at_utc)>Date.parse(entryBookTimes[m.coin_id]));
 }
 return {schema:ENTRY,cohort_id:c.id,recorded_at_utc:new Date(at).toISOString(),
  kind:first?'FIRST_PUBLIC_SCREEN':'LATER_PUBLIC_BID',venue:'OKX',
  instrument_type:'SPOT',quote:'USDC',budget_usdc:10,
  public_source:['OKX public instruments','OKX market books'],
  markets,orders_enabled:false,real_orders:0,paper_fills:0,
  net_profit_usdc:null,position_opened:false,position_closed:false,
  note:'Immutable public quote observation. No order or paper fill. Future bid is not proof of a sale.'};
}
function firstBookTimes(index,root,cohortId){
 const ref=index.records.find(r=>r.cohort_id===cohortId&&r.kind==='FIRST_PUBLIC_SCREEN');
 if(!ref)return {};
 const d=JSON.parse(textFile(path.join(root,ref.file)));
 return Object.fromEntries(d.markets.filter(m=>m.public_book_at_utc)
  .map(m=>[m.coin_id,m.public_book_at_utc]));
}
function saveObservation(index,root,c,doc,at){
 if(index.records.some(x=>x.cohort_id===c.id&&
    Date.parse(doc.recorded_at_utc)-Date.parse(x.recorded_at_utc)<30*60000))
  return false; // a retry never creates a fake second market observation
 const when=new Date(at).toISOString().replace(/[-:.]/g,'').replace('T','T');
 const file='observations/'+when+'--'+c.id+'.json';
 if(!FILE.test(file)||fs.existsSync(path.join(root,file)))throw Error('Archive existante ou nom invalide');
 const body=JSON.stringify(doc,null,2)+'\n';
 fs.mkdirSync(path.join(root,'observations'),{recursive:true});
 fs.writeFileSync(path.join(root,file),body,{flag:'wx'});
 index.records.push({cohort_id:c.id,file,sha256:hash(body),
  recorded_at_utc:doc.recorded_at_utc,kind:doc.kind});
 return true;
}
async function run({root=OUTPUT,market=MARKET,at=Date.now(),
 query=gate.publicRead,prepare=gate.prepare,scan=null}={}){
 if(!Number.isFinite(at))throw Error('Horloge non valide');
 const index=readIndex(root);
 let selection=scan;
 if(!selection){
  try{const [a,b]=immediate.loadRepositorySnapshots(market);
   selection=radar.selectOpportunities(a,b);
  }catch(error){throw Error('Snapshot public non exploitable : '+error.message)}
 }
 const created=cohortFrom(selection,at,index);
 if(created)index.cohorts.push(created);
 let archived=0,marketCount=0;
 for(const c of index.cohorts){
  const age=at-Date.parse(c.first_seen_at_utc);
  if(age<0||age>56*MS_HOUR)continue; // >48h follow-up can tolerate scheduler drift
  if(index.records.some(r=>r.cohort_id===c.id&&
    at-Date.parse(r.recorded_at_utc)<30*60000))continue;
  const first=!index.records.some(r=>r.cohort_id===c.id);
  const report=await prepare(sourceFor(c),query,at);
  const doc=makeDocument(c,report,at,first,firstBookTimes(index,root,c.id));
  if(saveObservation(index,root,c,doc,at)){
   archived++;marketCount+=doc.markets.length;
  }
 }
 if(archived){
  const file=path.join(root,'index.json');
  const tmp=file+'.tmp';
  fs.writeFileSync(tmp,JSON.stringify(index,null,2)+'\n');
  fs.renameSync(tmp,file);
  verify(index,root);
 }
 return {created_cohort:created?.id??null,archived,markets:marketCount,
  cohorts:index.cohorts.length,total_observations:index.records.length,
  orders:0,paper_fills:0,net_profit_usdc:null};
}
if(require.main===module)
 run().then(s=>console.log('SEVEN CAPITAL DATED PUBLIC JOURNAL',JSON.stringify(s)))
 .catch(e=>{console.error('SEVEN SPOT ARCHIVE STOP:',e.message);process.exitCode=1});
module.exports={SCHEMA,ENTRY,empty,verify,readIndex,cohortFrom,sourceFor,
 evidence,makeDocument,firstBookTimes,run};
