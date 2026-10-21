'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {qualifyReport,compare}=require('./strategy-comparator.js');
const ROOT=path.join(__dirname,'../data/trader_flux');
const studyRaw=JSON.parse(fs.readFileSync(path.join(ROOT,'radar20_portfolio/summary.json'),'utf8'));
const stressRaw=JSON.parse(fs.readFileSync(path.join(ROOT,'radar20_retro_stress/summary.json'),'utf8'));
const reports={
  study:qualifyReport(studyRaw,'study'),
  stress:qualifyReport(stressRaw,'stress')
};
assert.equal(reports.study.capital,400);
assert.equal(reports.stress.quote,'USDT');
assert.equal(reports.study.trades,149);
assert.equal(reports.stress.trades,109);
assert.equal(reports.study.wins+reports.study.losses,149);
assert(Math.abs(reports.study.net-97.74946)<1e-6);
assert(Math.abs(reports.stress.net-(-222.358853))<1e-6);
const base=compare(reports,400,0.8);
assert.equal(base.capitalComparable,true);
assert.equal(base.reserve.amount,400);
assert.equal(base.reserve.quote,'USDC');
assert.equal(base.protocolQuote,'USDT');
assert.equal(base.conversionCertified,false);
assert.equal(base.spotExecutable,false);
assert.equal(base.realOrders,false);
assert(Math.abs(base.study.net-97.74946)<1e-6);
assert(Math.abs(base.stress.net-(-222.358853))<1e-6);
assert.equal(base.study.drawdown,reports.study.drawdown);
assert.equal(base.stress.drawdown,reports.stress.drawdown);
for(const amount of [10,50,100]){
  const result=compare(reports,amount,1.2);
  assert.equal(result.capitalComparable,false,'NO scaled real portfolio at '+amount);
  assert.equal(result.reserve.amount,amount);
  assert.equal(result.stress.net,null,'unverified retro costs must not be shown');
  assert.equal(result.study.drawdown,null,'sensitivity has no recalculated drawdown');
  assert.equal(result.study.sameTradesSensitivity,true);
}
assert(Math.abs(compare(reports,400,1.2).study.net-37.87677)<1e-6);
assert(Math.abs(compare(reports,400,1.6).study.net-(-21.758329))<1e-6);
for(const bad of [
  {...studyRaw,orders_enabled:true},
  {...studyRaw,strategy_certified:true},
  {...studyRaw,period_utc:['2026-07-01','2026-10-01']},
  {...studyRaw,primary:{...studyRaw.primary,final_cash_usdt:999}},
  {...studyRaw,primary:{...studyRaw.primary,winners:200}},
  {...studyRaw,primary_fixed_trade_cost_sensitivity_usdt:undefined}
])assert.throws(()=>qualifyReport(bad,'study'));
for(const bad of [
  {...stressRaw,orders_enabled:true},
  {...stressRaw,frozen_parameters:{...stressRaw.frozen_parameters,roundtrip_cost_pct:0}},
  {...stressRaw,period:['2026-04-01','2026-09-30']}
])assert.throws(()=>qualifyReport(bad,'stress'));
assert.throws(()=>compare(reports,1,0.8));
assert.throws(()=>compare(reports,400,0.3));
assert.throws(()=>compare({study:reports.stress,stress:reports.study},400,0.8));
const view=fs.readFileSync(path.join(__dirname,'strategy-comparator.js'),'utf8');
const mirror=fs.readFileSync(path.join(__dirname,'trader-runtime-mirror.js'),'utf8');
assert(mirror.includes('add("traderStrategyComparatorScript","strategy-comparator.js")'));
assert(view.includes('host.insertAdjacentElement("afterend",node)'));
assert(view.includes('if(!node?.open||active)return'));
assert(view.includes('credentials:"omit"'));
assert(view.includes('new AbortController()'));
assert(view.includes('controller.abort()'));
assert(view.includes('data-strategy-capital-note'));
for(const forbidden of ['localStorage','sessionStorage','indexedDB','/okx/order','/trade/order',
  'wallet.transfer','privateBridge','setInterval(','location.reload('])
  assert(!view.includes(forbidden),'Forbidden privileged/persistent behavior: '+forbidden);
assert.equal(require('./strategy-comparator.js').realOrders,false);
assert.equal(require('./strategy-comparator.js').storage,false);
assert.equal(require('./strategy-comparator.js').privateAccount,false);
console.log('Trader strategy comparator · real reports, safety, cash-only benchmark, cost sensitivities PASS');
