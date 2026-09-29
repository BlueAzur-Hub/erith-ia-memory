// Isolated Firefox regression tests. All quotes/network are synthetic; no user state or orders.
const fs=require('fs'), path=require('path'), assert=require('node:assert/strict');
const {firefox}=require(process.env.AGENT_CRYPTO_PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(process.argv[2]||'public/agent_crypto_erith_ia/administrator');
const legacy=process.argv.includes('--expect-legacy');
const read=name=>fs.readFileSync(path.join(root,'js',name),'utf8');
(async()=>{
 const browser=await firefox.launch({headless:true,env:{...process.env,MOZ_DISABLE_CONTENT_SANDBOX:'1'},firefoxUserPrefs:{'security.sandbox.content.level':0}});
 try{
 const context=await browser.newContext();await context.route('**/*',r=>r.abort());
 const results={mode:legacy?'baseline-defects-reproduced':'candidate-regression-tests',scope:'Isolated Firefox, synthetic quotes and PAPER fixtures. No operator database, no external request, no real order.'};
 async function costPage(){
  const p=await context.newPage();await p.setContent('<section id="strategyAOracleCostCalibrationAudit"></section>');
  await p.evaluate(()=>{
   window.calls=0;window.hold=false;window.releases=[];window.failQuotes=false;window.active=0;window.maxActive=0;
   window.ErithPrivateBackendSources={refresh:async()=>{calls++;active++;maxActive=Math.max(maxActive,active);try{
    if(hold)await new Promise(r=>releases.push(r));if(failQuotes)throw new Error('fixture-unavailable');
    return {assets:[{asset:'BTC',quotes:[{provider:'okx',status:'ok',pair:'BTC/EUR',bid_eur:99990,ask_eur:100010,observed_at_utc:new Date().toISOString()}]}]};
   }finally{active--;}}};
   window.fetch=async()=>{if(hold)await new Promise(r=>releases.push(r));if(failQuotes)throw new Error('fixture-unavailable');return {ok:true,json:async()=>({error:[],result:{XXBTZEUR:{bids:[[99990,1]],asks:[[100010,1]]}}})};};
  });
  await p.addScriptTag({content:read('strategy-a-execution-cost-truth.js')});
  await p.waitForFunction(()=>AgentCryptoStrategyAExecutionCostTruth.snapshot()?.measurement_trigger==='auto:mount');return p;
 }
 for(const how of ['button','public-api','public-api-failure']){
  const p=await costPage();await p.evaluate(h=>{
   hold=true;failQuotes=h.endsWith('failure');
   if(h==='button')document.getElementById('strategyAExecutionCostTruthMeasure').click();
   else void AgentCryptoStrategyAExecutionCostTruth.measure('paper-evidence-open:fixture');
   for(let i=0;i<5;i++)document.dispatchEvent(new CustomEvent('agent-crypto:strategy-a-experiment-cycle'));
  },how);
  await p.waitForFunction(()=>releases.length===2);await p.evaluate(()=>{hold=false;releases.splice(0).forEach(r=>r());});
  await p.waitForFunction(()=>AgentCryptoStrategyAExecutionCostTruth.snapshot().measurement_trigger!=='auto:mount');
  // Permit the bounded completion microtask and prove it does not become a polling loop.
  await p.waitForTimeout(120);
  results[how]=await p.evaluate(()=>({measurements:calls,trigger:AgentCryptoStrategyAExecutionCostTruth.snapshot().measurement_trigger,maxActive,selfTest:AgentCryptoStrategyAExecutionCostTruth.self_test().pass}));
  assert.equal(results[how].measurements,legacy&&how!=='button'?2:3);
  assert.equal(results[how].maxActive,1);assert.equal(results[how].selfTest,true);
 }
 async function capturePage(){
  const p=await context.newPage();await p.setContent('<section id="simulation"><section id="strategyADurableEvidence"></section></section>');
  await p.evaluate(()=>{
   window.AgentCryptoStrategyASafetyCertification={snapshot:()=>({level:'NORMAL',new_trades_allowed:true})};
   window.evidenceCalls=0;window.bid=99;window.holdCapture=false;window.captureReleases=[];window.badTrigger=false;window.failCapture=false;
   window.AgentCryptoStrategyAExecutionCostTruth={measure:async trigger=>{
    evidenceCalls++;const capturedBid=bid;if(holdCapture)await new Promise(r=>captureReleases.push(r));
    if(failCapture)throw new Error('fixture-failure');
    return {generated_at:new Date().toISOString(),measurement_trigger:badTrigger?'auto:previous':trigger,venues:{kraken:{ok:true,venue:'Kraken Pro',pair:'BTC/EUR',best_bid:capturedBid,best_ask:101,mid:100,spread_pct:2,spread_bp:200,simulations:[{amount_eur:50,buy_filled:true,sell_filled:true,buy_avg_price:101,sell_avg_price:99,buy_slippage_pct:0,sell_slippage_pct:0}]}}};
   }};
  });
  for(const f of ['strategy-a-paper-lifecycle.js','strategy-a-auto-lifecycle-bridge.js','strategy-a-execution-cost-evidence-capture.js'])await p.addScriptTag({content:read(f)});
  return p;
 }
 const p=await capturePage();
 results.duplicateOpen=await p.evaluate(async()=>{
  const bridge=AgentCryptoStrategyAAutoLifecycleBridge,args={proposal:{proposal_id:'P'},risk:{risk_id:'R',decision:'ACCEPT'},fill:{execution_id:'E',fill_price_eur:100,quantity_btc:.499,authorized_notional_eur:50,entry_fee_eur:.1}};
  const opened=bridge.on_open(args);await Promise.resolve();await Promise.resolve();const first=bridge.read()[0].execution_cost_evidence;
  bid=95;const duplicate=bridge.on_open(args);await Promise.resolve();await Promise.resolve();const second=bridge.read()[0].execution_cost_evidence;
  return {openOk:opened.ok,duplicate:duplicate.duplicate,calls:evidenceCalls,unchanged:JSON.stringify(first)===JSON.stringify(second),firstBid:first.opened_capture.best_bid_eur,secondBid:second.opened_capture.best_bid_eur,offSizeUnknown:first.opened_capture.buy_slippage_pct===null,firstState:first.opened_capture.state};
 });
 assert.equal(results.duplicateOpen.openOk,true);assert.equal(results.duplicateOpen.duplicate,true);
 assert.equal(results.duplicateOpen.calls,legacy?2:1);assert.equal(results.duplicateOpen.unchanged,!legacy);
 assert.equal(results.duplicateOpen.offSizeUnknown,true);
 results.render=await p.evaluate(()=>({render:AgentCryptoStrategyAExecutionCostEvidenceCapture.render(),panels:document.querySelectorAll('#strategyAExecutionCostEvidenceCapture').length,armed:document.getElementById('strategyAExecutionCostEvidenceCapture').textContent.includes('ARMED'),selfTest:AgentCryptoStrategyAExecutionCostEvidenceCapture.self_test().pass}));
 assert.deepEqual(results.render,{render:true,panels:1,armed:true,selfTest:true});
 if(!legacy){
  const c=await capturePage();
  results.pendingDuplicate=await c.evaluate(async()=>{
   const api=AgentCryptoStrategyAExecutionCostEvidenceCapture;holdCapture=true;
   const first=api.capture_open('pending',50);const duplicate=await api.capture_open('pending',50);
   holdCapture=false;captureReleases.splice(0).forEach(r=>r());await first;
   const before=api.decorate_rows([{execution_id:'pending'}])[0].execution_cost_evidence;
   bid=90;await api.capture_open('pending',50);
   const after=api.decorate_rows([{execution_id:'pending'}])[0].execution_cost_evidence;
   return {calls:evidenceCalls,duplicate:duplicate.duplicate,pendingState:duplicate.evidence.state,unchanged:JSON.stringify(before)===JSON.stringify(after)};
  });
  assert.deepEqual(results.pendingDuplicate,{calls:1,duplicate:true,pendingState:'PENDING',unchanged:true});
  results.closeAndFailures=await c.evaluate(async()=>{
   const api=AgentCryptoStrategyAExecutionCostEvidenceCapture;
   await api.capture_close('pending',50);const closed=api.decorate_rows([{execution_id:'pending'}])[0].execution_cost_evidence;
   await api.capture_close('pending',50);const closedAgain=api.decorate_rows([{execution_id:'pending'}])[0].execution_cost_evidence;
   badTrigger=true;await api.capture_open('busy',50);badTrigger=false;await api.capture_open('busy',50);
   failCapture=true;await api.capture_open('failed',50);failCapture=false;await api.capture_open('failed',50);
   const rows=api.decorate_rows([{execution_id:'busy'},{execution_id:'failed'}]);
   return {calls:evidenceCalls,closedUnchanged:JSON.stringify(closed)===JSON.stringify(closedAgain),complete:closed.state,busy:rows[0].execution_cost_evidence.opened_capture.state,failed:rows[1].execution_cost_evidence.opened_capture.state,injection:api.snapshot().after_cost_injection};
  });
  assert.deepEqual(results.closeAndFailures,{calls:4,closedUnchanged:true,complete:'ENTRY_CLOSE_CAPTURED',busy:'BUSY_OR_STALE_MEASUREMENT',failed:'MEASUREMENT_FAILED',injection:false});
 }
 results.pass=true;console.log(JSON.stringify(results,null,2));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
