'use strict';
// Seven Capital: immediate public preflight, manual and read-only.
// No account, no order endpoint, no disk writes and no paper fill claims.
const fs=require('node:fs');
const path=require('node:path');
const radar=require('../laboratoire/radar.js');
const scout=require('./seven_capital_scout.cjs');
const gate=require('./seven_spot_gate.cjs');
const root=path.resolve(__dirname,'../data/crypto');
const MS_HOUR=3600000;
function stamp(value){
 if(typeof value!=='string'||!value.endsWith('Z'))throw Error('Timestamp UTC absent');
 const n=Date.parse(value);if(!Number.isFinite(n))throw Error('Timestamp invalide');return n;
}
function shortlist(scan,now=Date.now()){
 if(!Number.isFinite(now)||scan?.scoutUniverse===undefined||
   !Array.isArray(scan?.scoutUniverse))throw Error('Snapshot Radar incomplet');
 const core=stamp(scan.sourceTimes?.core),extended=stamp(scan.sourceTimes?.extended);
 if(Math.abs(core-extended)>6*MS_HOUR||core>now+120000||extended>now+120000)
  throw Error('Sources incohérentes ou futures');
 const date=new Date(Math.max(core,extended)).toISOString().slice(0,10);
 if(new Date(Math.min(core,extended)).toISOString().slice(0,10)!==date||
    new Date(now).toISOString().slice(0,10)!==date||
    now-Math.min(core,extended)>8*MS_HOUR)
  return {status:'STALE_OR_DIFFERENT_UTC_DAY',date,eligible:scan.scoutUniverse.length,
    policy_matches:null,selected:[],source_at_utc:scan.sourceTimes};
 const candidates=scout.preselect(scan.scoutUniverse,date);
 return {status:'RESEARCH_CANDIDATES_ONLY',date,eligible:scan.scoutUniverse.length,
  policy_matches:candidates.length,selected:candidates.slice(0,3),
  source_at_utc:scan.sourceTimes};
}
async function study(scan,query=gate.publicRead,now=Date.now()){
 const sample=shortlist(scan,now);
 if(sample.status!=='RESEARCH_CANDIDATES_ONLY')
  return {...sample,market_results:[],real_orders:0,paper_fills:0,
    net_profit_usdc:null,operations_authorized:false};
 const obs=sample.selected.map(c=>({
  coin_id:c.id,symbol:c.symbol,source_at_utc:c.sourceSnapshot,
  date_utc:sample.date,decision:'NO_TRADE',fill:false,net_profit_usdc:null
 }));
 const status={schema:'erith.seven.capital-scout.paper.v1',
  mode:'AUTOMATED_PROSPECTIVE_RESEARCH_ONLY',
  latest_archive_date_utc:sample.date,simulation_budget_usdc:10,
  reserved_cost_buffer_usdc:0.94,orders_enabled:false,real_orders_submitted:0,
  paper_orders_submitted:0,private_account_access:false,observations:obs};
 const gateReport=await gate.prepare(status,query,now);
 const market_results=gateReport.candidates.map(c=>({
  coin_id:c.coin_id,symbol:c.symbol,pair:c.pair,
  status:c.status,book_at_utc:c.public_book_timestamp_utc||null,
  immediate_exit_usdc:c.hypothetical_net_after_immediate_exit_usdc??null,
  roundtrip_cost_usdc:c.hypothetical_roundtrip_cost_usdc??null,
  can_trade_10_usdc:false,real_order_sent:false,
  profits_realized:null
 }));
 return {...sample,selected:sample.selected.map(c=>({id:c.id,symbol:c.symbol,
   rank:c.rank,source_at_utc:c.sourceSnapshot,price_usd:c.priceUsd,
   change24h:c.change24h,change7d:c.change7d})),
  market_results,real_orders:0,paper_fills:0,net_profit_usdc:null,
  operations_authorized:false,market_data_as_of_check_only:true,
  note:'Current public USDC Spot precheck. No contract equivalence proof, authenticated fees, market fill or future bid. An immediate-exit quote is NOT a closed PAPER trade.'};
}
function markdown(result){
 const lines=['### Seven Capital · immédiat, lecture seule',
  '',`- Observation UTC : ${result.date}`,
  `- Univers qualifié Radar : ${result.eligible===null?'non évaluable':result.eligible}`,
  `- Candidats passant les seuils Seven : ${result.policy_matches===null?'non évaluable':result.policy_matches}`,
  `- Présélections : ${result.selected.length} · ordres 0 · fills 0 · résultat net NON ÉTABLI`,
  `- Statut : ${result.status}`,''];
 if(result.market_results.length){
  lines.push('| Actif | Paire vérifiée | Résultat public | Sortie instantanée hypothétique |',
   '|---|---|---|---|');
  for(const r of result.market_results)
   lines.push(`| ${r.symbol} | ${r.pair} | ${r.status} | ${r.immediate_exit_usdc===null?'non évaluable':r.immediate_exit_usdc+' USDC'} |`);
 }
 lines.push('', 'Aucun trade réel ou PAPER exécuté, aucune clôture ou performance prospective revendiquée.');
 return lines.join('\n');
}
function loadRepositorySnapshots(dir=root){
 return ['latest.json','extended.json'].map(n=>JSON.parse(fs.readFileSync(path.join(dir,n),'utf8')));
}
// An invalid public market snapshot is a documented BLOCK, not a code-crash,
// approved candidate or a reason to reuse an earlier price as today's quote.
const knownMarketIntegrityFailures=new Set([
 'Univers public Top 1000 incomplet, veille suspendue',
 'Snapshots Top 250 et Extended non contemporains, veille suspendue',
 'Identités de rang Top 1000 incohérentes',
 'Rangs Top 1000 discontinus'
]);
async function studySourceSnapshots(core,extended,query=gate.publicRead,now=Date.now()){
 let scan;
 try{scan=radar.selectOpportunities(core,extended);}
 catch(err){
  if(!knownMarketIntegrityFailures.has(err?.message))throw err;
  return {status:'BLOCKED_INVALID_PUBLIC_UNIVERSE',reason:err.message,
   date:'non vérifiée',eligible:null,policy_matches:null,selected:[],
   source_at_utc:{core:core?.generated_at||null,extended:extended?.generated_at||null},
   market_results:[],real_orders:0,paper_fills:0,net_profit_usdc:null,
   operations_authorized:false,market_data_as_of_check_only:false};
 }
 return study(scan,query,now);
}
async function main(){
 const [core,extended]=loadRepositorySnapshots();
 const report=await studySourceSnapshots(core,extended);
 const out=markdown(report);
 process.stdout.write(out+'\n');
 if(process.env.GITHUB_STEP_SUMMARY)
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,out+'\n');
}
if(require.main===module)main().catch(err=>{console.error('PUBLIC_PREFLIGHT_FAILED:',err.message);process.exitCode=1});
module.exports={shortlist,study,studySourceSnapshots,markdown,loadRepositorySnapshots};
