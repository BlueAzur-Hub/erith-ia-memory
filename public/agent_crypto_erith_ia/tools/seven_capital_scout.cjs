'use strict';
/* ERITH.IA Seven — prospective public scout; never places orders. */
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const input=path.join(root,'data/crypto/radar-opportunities');
const output=path.join(root,'data/trader_flux/seven_capital_scout/status.json');
const activation='2026-10-21',firstDay='2026-10-22';
const positive=v=>typeof v==='number'&&Number.isFinite(v)&&v>0;
function checkDay(x){
 if(x?.schema!=='erith.radar.opportunity-observation.v1'||x.orders_enabled!==false||
 x.account_access!==false||x.simulation_only!==true||x.spread_validated!==false||
 x.orderbook_validated!==false||!Array.isArray(x.tracked_candidates)||
 !Array.isArray(x.groups?.momentum_24h_7d)||
 !/^\d{4}-\d{2}-\d{2}$/.test(x.observed_date_utc)||
 new Date(x.observed_date_utc+'T00:00:00Z').toISOString().slice(0,10)!==x.observed_date_utc)
 throw Error('Contrat du journal Radar invalide');
 return x;
}
function dateOf(when){if(typeof when!=='string'||!when.endsWith('Z')||!Number.isFinite(Date.parse(when)))throw Error('Date source invalide');return when.slice(0,10);}
function select(x){
 checkDay(x);const seen=new Set(),out=[];
 for(const r of x.groups.momentum_24h_7d){
  if(!r||typeof r.id!=='string'||!r.id||seen.has(r.id)||
   !positive(r.priceUsd)||dateOf(r.sourceSnapshot)!==x.observed_date_utc)
   throw Error('Identité ou prix Radar non datés');
  seen.add(r.id);
  // Preregistered conservative research filter; no hindsight-based fill.
  if(!Number.isInteger(r.rank)||r.rank>500||r.rank<1||
    !positive(r.volume24hUsd)||r.volume24hUsd<5000000||
    !positive(r.marketCapUsd)||r.marketCapUsd<50000000||
    !positive(r.change24h)||r.change24h<2||r.change24h>12||
    !positive(r.change7d)||r.change7d>40)continue;
  out.push({coin_id:r.id,symbol:r.symbol,rank:r.rank,
    source_at_utc:r.sourceSnapshot,price_usd:r.priceUsd});
 }
 return out.slice(0,3);
}
function nextDay(date){return new Date(Date.parse(date+'T00:00:00Z')+86400000).toISOString().slice(0,10);}
function evaluate(dates){
 const ordered=dates.map(checkDay).sort((a,b)=>a.observed_date_utc.localeCompare(b.observed_date_utc));
 const map=new Map(ordered.map(x=>[x.observed_date_utc,x]));
 if(map.size!==ordered.length)throw Error('Doublon quotidien');
 const observations=[];
 for(const day of ordered){
  if(day.observed_date_utc<firstDay)continue;
  for(const s of select(day)){
   const target=nextDay(day.observed_date_utc),future=map.get(target);
   let status=future?'NEXT_DAY_PRICE_MISSING':'WAIT_NEXT_DAY';let percent=null,elapsed=null;
   if(future){
    const rows=future.tracked_candidates.filter(x=>x.id===s.coin_id);
    if(rows.length>1)throw Error('Doublon de suivi identitaire');
    const r=rows[0];
    if(r?.status==='OBSERVED_TOP1000'&&positive(r.price_usd)&&
       dateOf(r.observed_at_utc)===target){
      const delta=Date.parse(r.observed_at_utc)-Date.parse(s.source_at_utc);
      if(delta<=0)throw Error('Chronologie prospective impossible');
      percent=Number(((r.price_usd/s.price_usd-1)*100).toFixed(5));
      elapsed=Number((delta/3600000).toFixed(2));status='AGGREGATE_CHANGE_OBSERVED';
    }
   }
   observations.push({...s,date_utc:day.observed_date_utc,followup_day_utc:target,
     observed_change_pct:percent,elapsed_hours:elapsed,followup_status:status,
     decision:'NO_TRADE',reason:'USDC_SPOT_BOOK_AND_EXIT_RULES_UNVERIFIED',
     fill:false,net_profit_usdc:null});
  }
 }
 return {schema:'erith.seven.capital-scout.paper.v1',
   mode:'AUTOMATED_PROSPECTIVE_RESEARCH_ONLY',activation_date_utc:activation,
   first_valid_candidate_day_utc:firstDay,
   latest_archive_date_utc:ordered.at(-1)?.observed_date_utc||null,
   immutable_source_dates_utc:ordered.map(x=>x.observed_date_utc),
   sources:'CoinGecko Top1000 public Radar snapshots',quote:'USD',
   simulation_budget_usdc:10,reserved_cost_buffer_usdc:0.94,
   cost_buffer_guarantees_fees:false,last_user_reported_balance_usdc:10.94,
   live_balance_verified:false,profit_real_usdc:null,profit_paper_usdc:null,
   milestones_usdc:[12,15,17],milestones_reached:[],
   orders_enabled:false,private_account_access:false,real_orders_submitted:0,
   paper_orders_submitted:0,contract_identity_proven:false,
   usdc_spot_orderbook_verified:false,fee_currency_verified:false,
   sellable_after_base_fee_verified:false,live_trading_authorized:false,
   strategy_certified:false,
   filters:{rank_max:500,volume24h_usd_min:5000000,cap_usd_min:50000000,
    change24h_pct_min:2,change24h_pct_max:12,
    change7d_pct_gt:0,change7d_pct_max:40,limit_per_day:3},
   observations,note:'No automatic trades. USD price variation is NOT USDC P&L. Do not spend the reserve; fees charged in base may reduce sellable size. No claim of executable OKX Spot orders.'};
}
function load(folder=input){
 const names=fs.readdirSync(folder).filter(s=>/^20\d\d-\d\d-\d\d\.json$/.test(s)).sort().slice(-95);
 return names.map(name=>{
  const doc=JSON.parse(fs.readFileSync(path.join(folder,name),'utf8'));
  if(doc.observed_date_utc!==name.slice(0,10))throw Error('Nom de date non concordant');
  return doc;
 });
}
function main(){
 const report=evaluate(load()),json=JSON.stringify(report,null,2)+'\n';
 fs.mkdirSync(path.dirname(output),{recursive:true});
 if(!fs.existsSync(output)||fs.readFileSync(output,'utf8')!==json)
  fs.writeFileSync(output,json);
 console.log('Seven Capital 10 USDC: '+report.observations.length+' études; ORDRES=0');
}
if(require.main===module)main();
module.exports={checkDay,select,evaluate,load};
