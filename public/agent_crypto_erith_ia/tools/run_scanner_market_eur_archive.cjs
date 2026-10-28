'use strict';
/*
 * Read-only source acquisition and verified public EUR historical archive.
 * Default is OFFLINE PLAN (zero upstream requests and zero file writes).
 * The network mode requires two explicit opt-ins, uses one published snapshot,
 * twenty requests max, no orders, no implicit Git commits, no auto scheduling.
 */
const fs=require('node:fs');
const path=require('node:path');
const {planMarket,appendEvidence,exactSHA}=require('./scanner_market_eur_archive.cjs');
const {collect}=require('./scanner_verified_history.cjs');
const DATA_REL='public/agent_crypto_erith_ia/data/crypto';
const ARCHIVE_REL=DATA_REL+'/scanner_eur_archives';
function readJson(file,maxBytes=8_000_000){
 const p=path.resolve(file);const stat=fs.statSync(p);
 if(!stat.isFile()||stat.size>maxBytes)throw Error('Missing or oversized input: '+path.basename(p));
 return JSON.parse(fs.readFileSync(p,'utf8'));
}
function atomicJson(file,value){
 const dir=path.dirname(file);fs.mkdirSync(dir,{recursive:true});
 const tmp=file+'.tmp-'+process.pid;
 try{
   fs.writeFileSync(tmp,JSON.stringify(value,null,2)+'\n',{encoding:'utf8',mode:0o600});
   fs.renameSync(tmp,file);
 }catch(error){try{fs.unlinkSync(tmp)}catch{}throw error}
}
function parseArgs(argv){
 const args=Object.create(null);
 for(const s of argv){
   if(!s.startsWith('--')||!s.includes('='))throw Error('Expected --field=value');
   const pos=s.indexOf('='),key=s.slice(2,pos);
   if(!(new Set(['mode','snapshot','universe','budget','offset','network','root'])).has(key)
     ||Object.hasOwn(args,key))throw Error('Unknown/duplicate argument: '+key);
   args[key]=s.slice(pos+1);
 }
 const n=(key,fallback)=>args[key]===undefined?fallback:Number(args[key]);
 const mode=args.mode||'plan';
 if(!['plan','collect'].includes(mode))throw Error('Only plan/collect allowed');
 const universe=n('universe',100),budget=n('budget',20),offset=n('offset',0);
 if(!Number.isInteger(universe)||!Number.isInteger(budget)||!Number.isInteger(offset))
   throw Error('Nonintegral quota');
 return {mode,universe,budget,offset,snapshot:args.snapshot||DATA_REL+'/latest.json',
   network:args.network||'off',root:args.root||ARCHIVE_REL};
}
async function run(config,opts={}){
 const snapshot=readJson(config.snapshot,8_000_000);
 const actualNow=Number.isSafeInteger(opts.nowMs)?opts.nowMs:Date.now();
 const clock=config.mode==='plan'?Date.parse(snapshot.generated_at)+1000:actualNow;
 const plan=planMarket(snapshot,{universe:config.universe,budget:config.budget,
   offset:config.offset,nowMs:clock});
 const summary={mode:config.mode,network:false,snapshotId:plan.snapshotId,
   snapshotAt:plan.snapshotAt,rankingQuote:'USD',historyQuote:'EUR',
   selected:plan.ids,groups:plan.batches.map(b=>({frameId:b.frameId,ids:b.ids})),
   claim:'Snapshot-derived diagnostic cohorts, not the live browser Market Frame'};
 if(config.mode==='plan')return summary;
 if(config.network!=='yes' ||process.env.ERITH_EUR_ARCHIVE_NETWORK!=='1')
   throw Error('No network: explicit --network=yes and ERITH_EUR_ARCHIVE_NETWORK=1 required');
 if(!Number.isSafeInteger(actualNow)||Math.abs(actualNow-Date.now())>120000)
   throw Error('Network mode requires current acquisition clock');
 // Writes are constrained to the one dedicated archive, never to Administrator.
 const target=path.resolve(config.root),allowed=path.resolve(ARCHIVE_REL);
 if(target!==allowed)throw Error('Only the dedicated native EUR archive root is writable');
 const collectFn=opts.collectFn||collect;
 const perId={},groups=[],start=Date.now();
 for(const batch of plan.batches){
   const envelope=await collectFn({ids:batch.ids,frameId:batch.frameId,
     timeoutMs:25000,spacingMs:12000,demoKey:process.env.COINGECKO_DEMO_API_KEY||undefined});
   // Require identical source envelope and SHA before any persistence.
   const existing={};
   for(const id of batch.ids) {
     const file=path.join(target,'assets',id+'.json');
     if(fs.existsSync(file)){
       existing[id]=readJson(file,5_000_000);
       if(!exactSHA(existing[id]))throw Error('Persisted archive tampered: '+id);
     }
   }
   const accepted=appendEvidence({plan,batchIndex:batch.index,envelope,
     previous:existing,asOfMs:Date.now()});
   for(const [id,record] of Object.entries(accepted))perId[id]=record;
   groups.push({frameId:batch.frameId,ids:batch.ids,status:envelope.status,
     readyCount:envelope.readyCount,sha256:envelope.sha256});
 }
 // No sources are overwritten unless every batch's integrity gate succeeded.
 for(const [id,record] of Object.entries(perId)){
   atomicJson(path.join(target,'assets',id+'.json'),record);
 }
 const manifest={schema:'agent_crypto_scanner_native_eur_archive_manifest_v1',
   generatedAt:new Date().toISOString(),sourceSnapshot:plan.snapshotId,
   quote:'EUR',source:'CoinGecko',rankingQuote:'USD',groups,
   entries:Object.fromEntries(Object.entries(perId).map(([id,record])=>[id,{
     sha256:record.sha256,status:record.rolling.status,
     pointCount:record.rolling.pointCount,
     sourceCount:record.entries.length
   }])),durationMs:Date.now()-start};
 // Historical manifest is evidence; it never asserts an active Firefox frame.
 atomicJson(path.join(target,'last-run.json'),manifest);
 return {...summary,network:true,manifest};
}
if(require.main===module){
 run(parseArgs(process.argv.slice(2))).then(x=>process.stdout.write(JSON.stringify(x)+'\n'))
 .catch(e=>{process.stderr.write(String(e?.message||e)+'\n');process.exitCode=1});
}
module.exports={run,parseArgs,readJson,atomicJson,ARCHIVE_REL};
