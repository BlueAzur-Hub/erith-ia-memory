const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const filename = process.argv[2] || __dirname + '/public/agent_crypto_erith_ia/administrator/app.js';
const source = fs.readFileSync(filename, 'utf8');
const fixed = process.argv.includes('--assert-fixed');
function extract(name) {
  const re = new RegExp('^(?:async )?function ' + name + '\\(', 'm');
  const m = re.exec(source);
  assert(m, 'function missing: ' + name);
  const end = source.indexOf('\n}', m.index);
  assert(end > m.index);
  return source.slice(m.index, end + 2);
}
function make() {
  const calls = [], statuses = [], timers = new Map(), local = new Map();
  let seq = 0;
  const now = Date.now();
  const snapshot = {strict_contract: {
    market: {snapshot_id:'N+1', assets_loaded:249, timestamp:new Date(now).toISOString()},
    sources:{binance:{direct_pairs:5, derived_pairs:0, feed_status:'ready',
      last_message_at:new Date(now).toISOString(),stable_5_5_ready:true,
      stable_5_5_since:new Date(now-60000).toISOString()}},
    graph:{status:'ready',series:[{symbol:'BTC'}]}
  }};
  const c = {
    Date, Math, Number, String, Boolean, Set, Object, Error, Promise,
    state:{liveOk:true, sourceLock:{snapshotId:'N+1'}},
    document:{visibilityState:'visible',hidden:false,documentElement:{dataset:{}},getElementById:()=>null,querySelector:()=>null},
    localStorage:{getItem:k=>local.get(k)||null,setItem:(k,v)=>local.set(k,String(v)),removeItem:k=>local.delete(k)},
    atlasLocalDialogueState:{connected:true,busy:false,model:'fixture',conclusionResponse:null},
    atlasLocalConclusionState:{running:false},
    atlasLocalReportsState:{reports:{},running:false,autoTimer:0,runToken:0,
      automaticCycleClosed:false,automaticModelRunAttempts:0,automaticModelRunMax:2},
    ATLAS_LOCAL_REPORT_MODES:['market','top5','math','contradictions'],
    ATLAS_LOCAL_REPORT_LABELS:{market:'Marché',top5:'Top 5',math:'Math',contradictions:'Contradictions'},
    ATLAS_LOCAL_REPORT_IDS:Object.fromEntries(['market','top5','math','contradictions'].map(m=>[m,{meta:m,state:m}])),
    ATLAS_DIRECT_5_5_STABLE_MS:30000,
    ATLAS_LOCAL_REPORT_LABELS:{market:'Marché',top5:'Top 5',math:'Math',contradictions:'Contradictions'},
    ATLAS_LOCAL_REPORT_IDS:Object.fromEntries(['market','top5','math','contradictions'].map(m=>[m,{meta:m,state:m}])),
    ATLAS_DIRECT_5_5_STABLE_MS:30000,
    ATLAS_AUTOMATION_341_LAST_CURRENT_MARKET_KEY:'done',ATLAS_AUTOMATION_341_PENDING_MARKET_KEY:'pending',
    atlasDeviceComputeAllowed:()=>true,atlasAccessIsAuthorized:()=>true,
    atlasClassicAnalysisIsAuto38155:()=>true,
    atlasBridgeAuthLocalState404273:()=>({valid:true}),
    atlasBuildCryptoPageSnapshot:()=>snapshot,
    atlasCanonicalCurrentProof389:()=>null,
    atlasLocalReportSnapshotFingerprint:()=> 'fingerprint-N+1',
    atlasLocalReportSnapshotLabel:()=> 'N+1',
    atlasLocalReportsSetSuiteStatus:(message,tone)=>statuses.push({message,tone}),
    atlasLocalReportsProgressLabel:(n,total)=>`${n}/${total}`,
    atlasLocalReportsProgressPercent:(n,total)=>100*n/total,
    atlasLocalReportsSetBusy:b=>{c.atlasLocalReportsState.running=b;},
    atlasLocalReportRequestReliable:async(mode)=>{calls.push(mode);const e=new Error('Bridge HTTP 500');e.status=500;throw e;},
    atlasLocalReportsReadyForFingerprint:()=>false,
    atlasLocalReportsWait:async()=>{},
    atlasLocalReportsQueueDeferredRetry:()=>false,
    atlasLocalReportsFlushDeferredRetry:()=>false,
    atlasLocalReportsAutoRetry:()=>false,
    atlasLocalReportSetCardState:()=>{},atlasLocalReportSetLoading:()=>{},
    atlasLocalReportRenderOnDemand40351:()=>{},atlasCurrentStage:()=>{},
    atlasAnalysisProgressRender:()=>{},atlasLocalResponseSelectView:()=>{},
    atlasAtlasStateTruth404273:()=>{},setText:()=>{},
    atlasAccessOpen:()=>{},atlasDeviceComputeApply:()=>{},
    atlasLocalReportsScheduleAutomatic:(reason,options)=>{
      calls.push('scheduled');c.atlasLocalReportsState.autoTimer=++seq;return true;
    },
    setTimeout:(fn,ms)=>{const id=++seq;timers.set(id,{fn,ms});return id;},
    clearTimeout:id=>timers.delete(id)
  };
  c.window=c;
  vm.createContext(c);
  const names=['atlasLocalReportsReadiness','atlasLocalReportsReadinessLabel',
    'atlasCurrentPendingMarket137','atlasLocalReportsOpenAutomaticCycle',
    'atlasLocalReportsCloseAutomaticCycle','atlasLocalReportsClearAutoTimer','atlasLocalReportsManualCycleReason',
    'atlasAutomation341CleanId','atlasAutomation341SnapshotId',
    'atlasAutomation341ReadLastCurrentMarketId','atlasAutomation341RememberPendingMarket',
    'atlasAutomation341ReadPendingMarket','atlasAutomation341IsBusy',
    'atlasLocalBridgeRequestFailureKind','atlasLocalReportResult','atlasLocalReportsRunAll'];
  if (source.includes('function atlasLocalReportsAutomaticStop(')) names.push('atlasLocalReportsAutomaticStop');
  vm.runInContext(names.map(extract).join('\n'),c);
  return {c,snapshot,calls,statuses,timers,local};
}
(async()=>{
  const results=[];
  {
    const p=make();p.snapshot.strict_contract.sources.binance.last_message_at=new Date(Date.now()-180000).toISOString();
    const r=p.c.atlasLocalReportsReadiness(p.snapshot);
    assert.equal(r.ready,false);
    if (fixed) assert.match(p.c.atlasLocalReportsReadinessLabel(r),/périmé/);
    results.push({case:'Binance 5/5 stables mais dernier prix vieux de 180 secondes',ready:r.ready,label:p.c.atlasLocalReportsReadinessLabel(r)});
  }
  {
    const p=make();p.c.atlasLocalReportsState.automaticModelRunAttempts=2;
    p.c.atlasLocalReportsState.automaticCycleMarketId='N+1';
    await p.c.atlasLocalReportsRunAll({automatic:true,snapshot:p.snapshot});
    assert.equal(p.c.atlasLocalReportsState.automaticCycleClosed,true);
    assert.equal(p.c.atlasLocalReportsState.automaticCycleCloseReason,'atlas-run-attempt-limit');
    const before={closed:true,attempts:p.c.atlasLocalReportsState.automaticModelRunAttempts};
    const resumed=p.c.atlasCurrentPendingMarket137('binance-stable');
    if (fixed) {
      assert.equal(resumed,false);
      assert.equal(p.c.atlasLocalReportsState.automaticCycleClosed,true);
      assert.equal(p.c.atlasLocalReportsState.automaticModelRunAttempts,3);
      assert.deepEqual(p.calls,[]);
    }
    results.push({case:'Même N+1 après arrêt à la limite des tentatives',before,resumed,
      after:{closed:p.c.atlasLocalReportsState.automaticCycleClosed,attempts:p.c.atlasLocalReportsState.automaticModelRunAttempts},calls:p.calls});
  }
  {
    const p=make();await p.c.atlasLocalReportsRunAll({automatic:false,snapshot:p.snapshot});
    if (fixed) {assert.deepEqual(p.calls,['market']);assert.match(p.statuses.at(-1).message,/HTTP 500/);}
    results.push({case:'HTTP 500 au rapport Marché',requested_reports:p.calls,final_status:p.statuses.at(-1)});
  }
  {
    const p=make();p.c.atlasLocalReportsState.authBlocked404273=true;
    // Existing scheduler's first guard returns false when authentication is blocked.
    p.c.atlasLocalReportsScheduleAutomatic=()=>false;
    const scheduled=p.c.atlasCurrentPendingMarket137('binance-stable');
    if (fixed) {assert.equal(scheduled,false);assert.match(p.statuses.at(-1).message,/AUTH BRIDGE REQUISE/);assert.equal(p.local.get('pending'),'N+1');}
    results.push({case:'Authentification bloquée, données prêtes',scheduled,final_status:p.statuses.at(-1)});
  }
  {
    const p=make();p.local.set('done','N+1');
    assert.equal(p.c.atlasCurrentPendingMarket137('binance-stable'),false);
    assert.deepEqual(p.calls,[]);
    results.push({case:'Snapshot déjà terminé',result:'NO-OP conservé'});
  }
  if (fixed) {
    const installScheduler=p=>vm.runInContext(['atlasLocalReportsScheduleAutomatic','atlasLocalReportsAutoReasonAllowed'].map(extract).join('\n'),p.c);
    for (const [caseName, mutate] of [
      ['manuel',p=>p.c.atlasClassicAnalysisIsAuto38155=()=>false],
      ['jeton expiré',p=>p.c.atlasBridgeAuthLocalState404273=()=>({valid:false})],
      ['graphique absent',p=>p.snapshot.strict_contract.graph.status='loading'],
      ['prix absent',p=>p.snapshot.strict_contract.sources.binance.last_message_at=''],
      ['prix de secours',p=>p.snapshot.strict_contract.sources.binance.derived_pairs=1],
      ['Bridge hors ligne',p=>p.c.atlasLocalDialogueState.connected=false]
    ]) {
      const p=make();mutate(p);
      assert.equal(p.c.atlasCurrentPendingMarket137('binance-stable'),false);
      assert.deepEqual(p.calls,[]);assert.equal(p.local.get('pending'),'N+1');
      assert.doesNotMatch(p.statuses.at(-1).message,/réveil résident|démarrage Atlas autorisé/);
      results.push({case:caseName,result:'blocage explicite, pending conservé'});
    }
    {
      const p=make();installScheduler(p);
      p.c.atlasLocalReportsState.automaticCycleMarketId='N+1';
      p.c.atlasLocalReportsState.automaticModelRunAttempts=2;
      p.c.atlasLocalReportsCloseAutomaticCycle('fingerprint-N+1','atlas-run-attempt-limit');
      for (let n=0;n<5;n++) {
        assert.equal(p.c.atlasLocalReportsOpenAutomaticCycle('new-canonical-snapshot'),false);
        assert.equal(p.c.atlasLocalReportsScheduleAutomatic('snapshot'),false);
        assert.equal(p.c.atlasCurrentPendingMarket137('binance-stable'),false);
      }
      assert.equal(p.timers.size,0);
      assert.equal(p.c.atlasLocalReportsState.automaticModelRunAttempts,2);
      p.c.state.sourceLock.snapshotId='N+2';p.snapshot.strict_contract.market.snapshot_id='N+2';
      assert.equal(p.c.atlasCurrentPendingMarket137('market-livecheck'),true);
      assert.equal(p.timers.size,1);
      assert.equal(p.c.atlasLocalReportsState.automaticModelRunAttempts,0);
      assert.equal(p.local.get('pending'),'N+2');
      p.c.atlasCurrentPendingMarket137('binance-stable');assert.equal(p.timers.size,1);
      results.push({case:'5 événements sur snapshot arrêté, puis N+2',result:'0 tentative supplémentaire sur N+1 ; un seul réveil sur N+2'});
    }
    {
      const p=make();installScheduler(p);
      p.c.atlasLocalReportsState.automaticCycleMarketId='N+1';
      p.c.atlasLocalReportsState.automaticModelRunAttempts=2;
      p.c.atlasLocalReportsCloseAutomaticCycle('fingerprint-N+1','atlas-run-attempt-limit');
      assert.equal(p.c.atlasLocalReportsScheduleAutomatic('manual-livecheck'),true);
      assert.equal(p.c.atlasLocalReportsState.automaticModelRunAttempts,0);
      assert.equal(p.c.atlasLocalReportsAutomaticStop(),'');
      assert.equal(p.timers.size,1);
      results.push({case:'Relance volontaire après arrêt',result:'autorisée'});
    }
    {
      const p=make();
      p.c.atlasLocalReportsState.automaticCycleMarketId='N+1';
      p.c.atlasLocalReportsState.automaticModelRunAttempts=1;
      p.c.atlasLocalReportsOpenAutomaticCycle('new-canonical-snapshot');
      assert.equal(p.c.atlasLocalReportsState.automaticModelRunAttempts,1);
      p.c.atlasLocalReportsCloseAutomaticCycle('fingerprint-N+1','aerith-validation-stop');
      assert.equal(p.c.atlasCurrentPendingMarket137('binance-stable'),false);
      await p.c.atlasLocalReportsRunAll({automatic:false,snapshot:p.snapshot});
      assert.deepEqual(p.calls,['market']);assert.equal(p.c.atlasLocalReportsAutomaticStop(),'');
      results.push({case:'Budget conservé, arrêt Aerith respecté, analyse manuelle possible',result:'PASS'});
    }
    {
      const p=make();installScheduler(p);
      p.c.atlasLocalReportRequestReliable=async mode=>{p.calls.push(mode);return {answer:'fixture valid report'}};
      p.c.atlasLocalReportStore=(mode,r)=>p.c.atlasLocalReportsState.reports[mode]={...r,fingerprint:'fingerprint-N+1'};
      p.c.atlasLocalReportsNoxReview=()=>{};
      p.c.atlasLocalDialogueSetConnection=()=>{};
      p.c.atlasLocalConclusionRun=async()=>{p.calls.push('aerith');return true;};
      assert.equal(await p.c.atlasLocalReportsRunAll({automatic:true,snapshot:p.snapshot}),true);
      assert.deepEqual(p.calls,['market','top5','math','contradictions','aerith']);
      results.push({case:'Rapports valides',result:'4/4 puis appel de conclusion conservés ; modèle simulé'});
    }
  }
  console.log(JSON.stringify(results,null,2));
})().catch(e=>{console.error(e);process.exitCode=1});
