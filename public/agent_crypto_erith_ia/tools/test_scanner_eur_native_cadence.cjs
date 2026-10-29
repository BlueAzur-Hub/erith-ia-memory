'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('public/agent_crypto_erith_ia/administrator/app.js','utf8');
const start = source.indexOf('function atlasScannerEur24hSamplingProof406642(');
const end = source.indexOf('async function atlasScannerFetchDirect(', start);
assert.ok(start > 0 && end > start, 'missing native EUR recovery');
const context = {
  atlasNormalizeChartPayload: payload => payload.prices
    .filter(p => Number.isFinite(p[0]) && Number.isFinite(p[1]) && p[1] > 0)
    .slice().sort((a,b)=>a[0]-b[0]),
  atlasChartRules: () => ({minPoints: 20}),
};
vm.createContext(context);
vm.runInContext(source.slice(start,end),context);
const check = context.atlasScannerEur24hSamplingProof406642;
const endMs=Date.now()-240000;
const tx={windowEnd:endMs,period:1};
const series=(hours,minutes=60)=>Array.from({length:Math.floor(hours*60/minutes)+1},(_,i)=>[endMs-hours*3600000+i*minutes*60000,10+i/1000]);
const hourly=series(48);
const fiveMinutes=series(24,5);
let count=0;
const test=(condition,description)=>{assert.ok(condition,description);count++;};
test(check(hourly,tx).ok,'hourly 48h source must provide 24h evidence');
test(check(hourly,tx).cadenceMinutes===60,'hourly cadence must be labeled');
test(check(fiveMinutes,tx).ok,'native 5m 24h valid');
test(check(fiveMinutes,tx).cadenceMinutes===5,'five-minute cadence must be labeled');
test(!check(series(17,5),tx).ok,'17-hour source must fail');
test(!check(hourly.filter((_,i)=>i<30||i>34),tx).ok,'three-hour gap must fail');
test(!check(hourly.filter(p=>p[0] < endMs-3*3600000),tx).ok,'stale last sample must fail');
test(!check(series(48,120),tx).ok,'two-hour resolution too sparse');
test(!check(hourly,{}).ok,'missing window must fail');
test(!check([],tx).ok,'empty series must fail');
const shifted=hourly.map(p=>[p[0]+30*3600000,p[1]]);
test(!check(shifted,tx).ok,'source without beginning anchor must fail');
console.log(count+'/'+count+' cadence-aware EUR 24h tests PASS');
