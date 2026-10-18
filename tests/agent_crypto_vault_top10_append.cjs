'use strict';
/* Seven Heaven: read-only, offline, byte-exact provenance verification for
 * supplementary CoinGecko MARKET observations. This is NEVER an OHLCV feed. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../public/agent_crypto_erith_ia');
const cohort=JSON.parse(fs.readFileSync(path.join(root,'data/historical_archive_prototype/top10/2026-10-01_2026-10-07/observations.json'),'utf8'));
const folder=path.join(root,'data/historical_archive_prototype/top10/2026-10-08_2026-10-18');
const archive=JSON.parse(fs.readFileSync(path.join(folder,'observations.json'),'utf8'));
const manifest=JSON.parse(fs.readFileSync(path.join(folder,'manifest.json'),'utf8'));
assert.equal(archive.kind,'irregular_snapshot_observations_not_OHLCV');
assert.equal(archive.reference,cohort.reference);
assert.deepEqual(archive.assets,cohort.assets,'Fixed dated identity; no symbol/rank substitutions');
assert.equal(archive.observations.length,manifest.observation_count);
assert.equal(manifest.price_records,archive.observations.length*10);
assert.equal(manifest.provenance.length,11);
const originals=[],idSet=new Set(),missingPct={count:0};
for(const entry of manifest.provenance){
 const abs=path.join(root,entry.path),raw=fs.readFileSync(abs);
 const gitBlob=crypto.createHash('sha1').update(Buffer.from('blob '+raw.length+'\0')).update(raw).digest('hex');
 const sourceCanGrow=entry.path.endsWith('/2026-10-18.jsonl');
 if(!sourceCanGrow)assert.equal(gitBlob,entry.git_blob_sha,entry.path+' closed-day source bytes changed');
 const allSnaps=raw.toString('utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse);
 // The open UTC day may receive LATER snapshots. Freeze exactly its first
 // source rows, and prove each value against the current append-only source.
 assert.ok(allSnaps.length>=entry.records,entry.path+' source row deletion');
 if(!sourceCanGrow)assert.equal(allSnaps.length,entry.records,entry.path+' closed-day source record count');
 const snaps=allSnaps.slice(0,entry.records);
 for(const snap of snaps){
   assert.equal(snap.schema,'atlas_market_snapshot_top50_v1');
   assert.equal(snap.live_ok,true);
   assert.ok(!idSet.has(snap.snapshot_id),'duplicate source snapshot');
   idSet.add(snap.snapshot_id);
   const byId=new Map(snap.assets.map(a=>[a.id,a]));
   const prices=cohort.assets.map(({id})=>{
     const x=byId.get(id);assert.ok(x,'missing id '+id);
     assert.ok(x.price_eur>0&&x.price_usd>0&&x.volume_24h_eur>=0);
     return [x.price_eur,x.price_usd,Number.isFinite(x.change_24h_pct)?x.change_24h_pct:null,x.volume_24h_eur,x.rank];
   });
   originals.push({t:snap.saved_at,snapshot_id:snap.snapshot_id,
      source_file:path.basename(entry.path),prices});
 }
}
originals.sort((a,b)=>a.t.localeCompare(b.t));
assert.deepEqual(archive.observations,originals,'Every archived figure must equal its cited CoinGecko source');
assert.equal(archive.window.first,originals[0].t);
assert.equal(archive.window.last,originals.at(-1).t);
assert.equal(manifest.snapshot_window.first,originals[0].t);
assert.equal(manifest.snapshot_window.last,originals.at(-1).t);
assert.ok(new Date(cohort.window.last)<new Date(archive.window.first),'No overlap with first tranche');
const missing=originals.flatMap(s=>s.prices).filter(p=>p[2]===null).length;
assert.equal(manifest.missing_24h_change_records,missing);
assert.equal(manifest.missing_price_records,0);
assert.ok(missing>0,'Missing changes must stay null, not fabricated');
assert.ok(archive.observations.every(o=>o.prices.length===10));
console.log('PASS 48 original Top10 observation snapshots, 480 price pairs, 11 Git blob provenance, '+missing+' missing 24h changes kept null; no OHLCV generated');
