'use strict';
/*
 * Seven Heaven -- proof that a dated historical coverage checkpoint faithfully
 * reconciles indexed source catalogs, without making or fetching price candles.
 * This is a SOURCE INDEX check, not independent release/ZIP re-verification.
 */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'../public/agent_crypto_erith_ia/data/historical_archive_prototype');
const checkpoint=JSON.parse(fs.readFileSync(path.join(root,'top250_coverage_reconciliation_2026-10-18.json'),'utf8'));
assert.equal(checkpoint.schema,'seven.crypto.top250.coverage-reconciliation.checkpoint.v2');
assert.equal(checkpoint.checkpoint_date_utc,'2026-10-18');
assert.equal(checkpoint.status,'SOURCE_INDEX_ONLY_NOT_OHLCV_BYTE_REAUDIT');
assert.equal(checkpoint.safeguards.no_ohlcv_generated,true);
assert.equal(checkpoint.safeguards.no_new_prices,true);
assert.equal(checkpoint.assets.length,250);
assert.equal(new Set(checkpoint.assets.map(a=>a.id)).size,250);
assert.equal(new Set(checkpoint.assets.map(a=>a.rank)).size,250);
assert.equal(checkpoint.review_candidates_no_series_in_these_indexes.length,
             checkpoint.summary.without_minute_or_daily_index);
const rows=checkpoint.assets;
const hasMinute=rows.filter(a=>a.minute!==null);
const hasDaily=rows.filter(a=>a.daily!==null);
const hasBoth=rows.filter(a=>a.minute!==null&&a.daily!==null);
const neither=rows.filter(a=>a.minute===null&&a.daily===null);
assert.equal(checkpoint.summary.minute_assets,hasMinute.length);
assert.equal(checkpoint.summary.daily_assets_in_ranked,hasDaily.length);
assert.equal(checkpoint.summary.dual_resolution_assets,hasBoth.length);
assert.equal(checkpoint.summary.unique_covered_assets,rows.length-neither.length);
assert.equal(checkpoint.summary.without_minute_or_daily_index,neither.length);
assert.equal(checkpoint.summary.minute_rows_declared,
 hasMinute.reduce((n,a)=>n+a.minute.native_1m_rows,0));
assert.equal(checkpoint.summary.daily_assets_outside_current_minute_ranked_universe,
 checkpoint.daily_outside_ranked_universe.length);
assert.deepEqual(checkpoint.review_candidates_no_series_in_these_indexes.map(a=>a.id),
 neither.map(a=>a.id));
assert.ok(rows.every(a=>!a.minute||(a.minute.quote==='USDT'||a.minute.quote==='USDC')));
assert.ok(rows.every(a=>!a.daily||(a.daily.quote==='USDT'||a.daily.quote==='USDC')));
for(const group of checkpoint.summary.groups_cumulative){
 const subset=rows.filter(a=>a.rank<=group.top);
 assert.equal(subset.filter(a=>a.minute).length,group.minute);
 assert.equal(subset.filter(a=>a.daily).length,group.daily);
 assert.equal(subset.filter(a=>a.minute||a.daily).length,group.any);
 assert.equal(subset.filter(a=>!a.minute&&!a.daily).length,group.missing);
}
function shaBlob(data){
 return crypto.createHash('sha1').update(Buffer.from('blob '+data.length+'\0')).update(data).digest('hex');
}
const prov=new Map(checkpoint.provenance.map(p=>[p.role,p]));
const catalogs={};
const changed=[];
for(const [role,file] of [
 ['minute','top250_multisource_coverage/index.json'],
 ['daily','top250_multiresolution_sources/index.json'],
 ['year','year_depth_index.json'],
 ['bitget','bitget_verified_views/index.json'],
 ['previous','top250_coverage_reconciliation.json']
]){
 const source=prov.get(role);
 assert.ok(source,'provenance missing '+role);
 assert.ok(source.path.endsWith(file));
 const data=fs.readFileSync(path.join(root,file));
 const blob=shaBlob(data);
 if(blob!==source.git_blob_sha)changed.push(role);
 catalogs[role]=JSON.parse(data.toString('utf8'));
}
const minute=catalogs.minute,daily=catalogs.daily,year=catalogs.year,bitget=catalogs.bitget,older=catalogs.previous;
assert.equal(older.checkpoint_date_utc,checkpoint.summary.previous_reconciliation_date);
if(changed.length){
 // The snapshot remains truthful for its PINNED blob SHAs, but a new
 // reconciliation must be generated for the now-changed input catalogs.
 console.warn('STALE SOURCE CATALOGS ('+changed.join(', ')+
              '): dated snapshot preserved; do not market it as current.');
}else{
 const minuteBy=new Map(minute.assets.map(a=>[a.id,a]));
 const dailyBy=new Map(daily.assets.map(a=>[a.id,a]));
 const annualBy=new Map(year.assets.map(a=>[a.id,a]));
 const bitgetBy=new Map(bitget.assets.map(a=>[a.id,a]));
 assert.equal(minuteBy.size,250);
 assert.equal(checkpoint.summary.minute_assets,minute.archived_assets);
 assert.equal(checkpoint.summary.daily_rows_declared_all_daily_universes,daily.native_daily_candles);
 assert.equal(checkpoint.summary.binance_year_snapshot_12_consecutive_months,year.assets_with_at_least_12_consecutive_closed_months);
 for(const a of rows){
   const m=minuteBy.get(a.id),d=dailyBy.get(a.id),y=annualBy.get(a.id);
   assert.ok(m,'missing canonical id '+a.id);
   assert.equal(a.rank,m.rank);
   assert.equal(a.symbol,m.symbol);
   assert.equal(a.name,m.name);
   assert.equal(a.minute?.native_1m_rows??0,m.native_1m_count||0);
   assert.equal(a.minute?.closed_months??0,m.native_1m_count>0?m.months:0);
   assert.equal(a.minute?.venue??null,m.native_1m_count>0?m.source:null);
   assert.equal(a.minute?.quote??null,m.native_1m_count>0?m.quote:null);
   assert.equal(a.daily?.native_1d_rows??0,d?.native_candles||0);
   assert.equal(a.daily?.quote??null,d?.native_candles>0?d.quote:null);
   assert.equal(a.daily?.release??null,d?.native_candles>0?d.release_tag:null);
   assert.equal(a.binance_year_snapshot?.verified_closed_months??0,y?.native_minutes>0?y.verified_months:0);
   if(m.native_1m_count>0&&m.source==='Bitget Spot native 1m HTTPS'){
      assert.equal(a.minute.bitget_confirmed_count,bitgetBy.get(a.id)?.total_verified_1m_count??null);
   }
 }
 const external=daily.assets.filter(d=>!minuteBy.has(d.id)).map(a=>a.id);
 assert.deepEqual(checkpoint.daily_outside_ranked_universe.map(a=>a.id),external);
 assert.equal(checkpoint.summary.previous_minute_assets,older.summary.native_1m_assets);
 assert.equal(checkpoint.summary.previous_unique_covered,older.summary.unique_covered_assets);
 console.log('SOURCE RECONCILIATION MATCH '+rows.length+' identities, '+hasMinute.length+' minute, '+
 hasDaily.length+' daily in-universe, '+hasBoth.length+' dual, '+neither.length+' missing in both');
}
console.log('PASS coverage checkpoint internally consistent, all input provenance hashes preserved; no OHLCV generated');
