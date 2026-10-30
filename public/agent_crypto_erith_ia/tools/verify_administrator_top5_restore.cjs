"use strict";
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'../administrator/app.js'),'utf8');
const get=(name)=>{
 const head='function '+name+'(';
 const start=src.indexOf(head); assert.ok(start>=0,'missing '+name);
 const match=src.slice(start).match(/^function [\s\S]*?\n}\n/);
 assert.ok(match,'function not extracted '+name); return match[0];
};
const top3=['bitcoin','ethereum','binancecoin'];
const top5=[...top3,'ripple','solana'];
const setup=`const ATLAS_COMPARISON_MAX_SERIES=5;
const ATLAS_CURATED_TOP3_IDS=${JSON.stringify(top3)};
const ATLAS_CURATED_TOP5_IDS=${JSON.stringify(top5)};
const ATLAS_WORKSPACE_PRESETS=['solo','rank-3','rank-5','gainers','losers','volume','manual','empty'];
const ATLAS_WORKSPACE_PERIODS=[1,7,30,60,90,365,36500];
const ATLAS_ADMIN_GRAPH_MODES=['normal'];
const ATLAS_SCANNER_PRESETS=new Set(['gainers','losers','volume']);
const ATLAS_RELEASE='Build 40.6.708';
const atlasGraphContextV7DetailWindowsNormalize=()=>({});
${get('atlasCuratedTopIds')}
${get('atlasCanonicalPresetSelection')}
${get('atlasOperatorGraphProfileNormalize')}
${get('atlasGraphContextV7NormalizeMarket')}
${get('atlasComparisonIds')}`;
const api=Function('state',setup+';return {canonical:atlasCanonicalPresetSelection,profile:atlasOperatorGraphProfileNormalize,v7:atlasGraphContextV7NormalizeMarket,ids:atlasComparisonIds};');
const market=top5.map(id=>({id})); market.push({id:'tether'});
const state={coins:market,graphSelectionCleared:false,selectedCoinId:'tether',dataBroker:{comparison:{preset:'rank-5',ids:[...top3.slice(0,2),'tether',...top3.slice(2),'ripple']}}};
const a=api(state);
assert.deepEqual(a.ids(),top5,'active legacy Top5 not repaired');
for(const ids of [[...top3.slice(0,2),'tether',...top3.slice(2),'ripple'],[],['tether']]){
 const payload={comparisonIds:ids,comparisonPreset:'rank-5',selectedCoinId:'tether',period:1};
 const profile=a.profile(payload); assert.deepEqual(profile.comparisonIds,top5);
 assert.equal(profile.selectedCoinId,'bitcoin'); assert.equal(profile.comparisonPreset,'rank-5');
 const v7=a.v7(payload); assert.deepEqual(v7.comparisonIds,top5);
 assert.equal(v7.selectedCoinId,'bitcoin'); assert.equal(v7.comparisonPreset,'rank-5');
}
const manual=a.profile({comparisonIds:['bitcoin','tether','solana'],selectedCoinId:'tether',comparisonPreset:'manual'});
assert.deepEqual(manual.comparisonIds,['bitcoin','tether','solana']);
assert.equal(manual.selectedCoinId,'tether');
assert.deepEqual(a.v7({comparisonPreset:'gainers',comparisonIds:['tether','ethereum'],selectedCoinId:'tether'}).comparisonIds,['tether','ethereum']);
assert.deepEqual(a.v7({comparisonPreset:'rank-3',comparisonIds:['bitcoin','tether','ethereum'],selectedCoinId:'tether'}).comparisonIds,top3);
state.coins=market.filter(c=>c.id!=='solana');
assert.deepEqual(a.ids(),top3.concat('ripple'),'missing SOL is never replaced by tether');
assert.match(src,/canonicalExpectedIds.*atlasCuratedTopIds\(5\)/s);
assert.match(src,/canonicalExactIds/);
assert.match(src,/if \(!strictAtomicComparison\) \{\s*setText\(els\.selectedAssetTitle/);
assert.match(src,/canonicalPreviousEntries/);
assert.match(src,/scannerMarked && !scannerNative/);
console.log('PASS: Top 5 legacy session, V7 IndexedDB, active state, manual/scanner isolation, missing SOL, chart-atomic guards');
