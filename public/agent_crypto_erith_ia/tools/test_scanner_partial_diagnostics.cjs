'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.resolve(__dirname,'../administrator/app.js'),'utf8');
const start = source.indexOf('function atlasScannerExplainMissing(');
const end = source.indexOf('function atlasScannerCommit(',start);
assert.ok(start >= 0 && end > start,'scanner diagnostics owner missing');
const helper = source.slice(start,end);
const tx = (currency='EUR',period=1) => ({
 candidateIds:['a','b','c','d','e'], candidateCoins:['a','b','c','d','e'].map(id=>({id,symbol:id.toUpperCase()})),
 period, currency, windowEnd:Date.now()
});
function context(coverage=()=>({ok:true}),align=entries=>entries) {
 const c={Set,Array,String,atlasScannerSeriesCoversWindow:coverage,atlasScannerAligned:align};
 vm.createContext(c);
 vm.runInContext(helper+'\nthis.explain=atlasScannerExplainMissing;',c);
 return c;
}
const firstFour=['a','b','c','d'];
test('5/5: no missing explanation or changed selection',()=>{
 const t=tx(), c=context(), before=t.candidateIds.join(',');
 assert.equal(c.explain(t,t.candidateIds,[],[]).length,0);
 assert.equal(t.candidateIds.join(','),before);
});
test('4/5: per-asset acquisition failure is retained',()=>{
 const rows=context().explain(tx(),firstFour,[{id:'e',reason:'HTTP 429'}],[]);
 assert.equal(rows.length,1); assert.equal(rows[0].id,'e');
 assert.equal(rows[0].kind,'fetch-or-validation'); assert.equal(rows[0].reason,'HTTP 429');
});
test('4/5: insufficient source coverage is classified',()=>{
 const rows=context(()=>({ok:false,reason:'24 h non couvertes'})).explain(
  tx(),firstFour,[],[{coin:{id:'e'},result:{series:[]}}]);
 assert.equal(rows[0].kind,'coverage');
});
test('4/5: valid individual series can fail joint alignment',()=>{
 const rows=context().explain(tx(),firstFour,[],[{coin:{id:'e'},result:{series:[]}}]);
 assert.equal(rows[0].kind,'joint-alignment');
});
test('4/5: insufficient individual aligned rows are distinguished',()=>{
 const rows=context(()=>({ok:true}),()=>[]).explain(
  tx(),firstFour,[],[{coin:{id:'e'},result:{series:[]}}]);
 assert.equal(rows[0].kind,'individual-alignment');
});
test('EUR/USD and seven horizons keep same diagnostic classification',()=>{
 for (const currency of ['EUR','USD']) for (const period of [1,7,30,60,90,365,36500]) {
  const rows=context().explain(tx(currency,period),firstFour,[{id:'e',reason:'unavailable'}],[]);
  assert.equal(rows[0].kind,'fetch-or-validation',currency+':'+period);
 }
});
test('diagnostic stays on committed results and visible caption',()=>{
 assert.match(source,/missingReasons,\s*previousPartial:/);
 assert.match(source,/Précédent scan incomplet/);
 assert.match(source,/atlasScannerCommit\(tx, finalEntries, rejected, accepted\)/);
 assert.match(source,/if \(!atlasScannerCurrent\(tx\)\) return false/);
});
test('canonical owner of scanner alignment is unchanged',()=>{
 assert.match(source,/function atlasScannerAligned\(/);
 assert.match(source,/const unavailableIds = tx\.candidateIds\.filter\(id => !ids\.includes\(id\)\)/);
});
