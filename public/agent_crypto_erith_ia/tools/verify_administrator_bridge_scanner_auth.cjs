"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const app = fs.readFileSync(path.join(__dirname,"../administrator/app.js"),"utf8");
const from=app.indexOf("function atlasScannerCollectorLatest() {");
const to=app.indexOf('\nfunction atlasScannerCollectorCapture(',from);
assert(from>0 && to>from,"Scanner owner not found");
const excerpt=app.slice(from,to);
const now=Date.now();
const snap=(id,age=0,currency="EUR")=>({
  schema:"atlas_scanner_live_snapshot_v1",snapshot_id:id,
  collected_at:new Date(now-age).toISOString(),
  market:{quote_currency:currency},
  baskets:{top5:{assets:[{coin_id:"bitcoin",symbol:"BTC",
    observed_price_eur:66000,observed_at:new Date(now-age).toISOString()}]}}
});
function setup({token="",owner=true,caps=["scanner.read","scanner.write"],response=null}={}) {
  let authToken=token;const calls=[],pending=[snap("pending")];
  const runtime={latestBusy:false,busy:false,bridgeAuthRejected:false,bridgeBackoffUntil:0,bridgeFailures:0};
  const store={pending,archive:[snap("local",30000)]};
  const c={Date,Number,Math,String,Array,Set,Error,JSON,AbortController,
    ATLAS_SCANNER_COLLECTOR_SCHEMA:"atlas_scanner_live_snapshot_v1",
    ATLAS_SCANNER_COLLECTOR_ARCHIVE_KEY:"archive",ATLAS_SCANNER_COLLECTOR_PENDING_KEY:"pending",
    ATLAS_SCANNER_COLLECTOR_PENDING_LIMIT:60,
    ATLAS_SCANNER_COLLECTOR_LATEST_URL:"http://127.0.0.1:8787/scanner-latest",
    ATLAS_SCANNER_COLLECTOR_BRIDGE_URL:"http://127.0.0.1:8787/scanner-snapshot",
    atlasScannerCollectorRuntime:runtime,
    atlasDeviceComputeAllowed:()=>true,atlasAccessIsAuthorized:()=>owner,
    atlasBridgeAuthLocalState:()=>({valid:!!authToken}),
    atlasBridgeAuthToken:()=>authToken,
    atlasBridgeAuthCapabilities:()=>caps,
    atlasBridgeAuthClear:()=>{authToken="";},
    atlasScannerOperatorPriorityActive:()=>false,
    atlasScannerCollectorRead:key=>[...(store[key]||[])],
    atlasScannerCollectorWrite:(key,items)=>{store[key]=[...items];},
    window:{setTimeout:()=>1,clearTimeout:()=>{}},
    console:{debug(){}},
    fetch:async (url,opts)=>{calls.push({url,opts});return response?response(url,opts):
      {ok:true,status:200,json:async()=>({ok:true,snapshot:snap("bridge",1000)})};}
  };c.globalThis=c;vm.createContext(c);vm.runInContext(excerpt,c);
  return {c,calls,store,runtime};
}
test("Bridge scanner is optional for public and signed-out owners",async()=>{
  for(const config of [{},{token:"owner",owner:false}]) {
    const x=setup(config);
    assert.equal(await x.c.atlasScannerCollectorFetchLatest(),false);
    assert.equal(await x.c.atlasScannerCollectorFlush(),false);
    assert.equal(x.calls.length,0);
    assert.equal(x.store.pending.length,1);
  }
});
test("Authenticated scanner read and write send bearer identity",async()=>{
  const x=setup({token:"owner-token"});
  assert.equal(await x.c.atlasScannerCollectorFetchLatest(),true);
  assert.equal(await x.c.atlasScannerCollectorFlush(),true);
  assert.deepEqual(x.calls.map(row=>row.opts.method),["GET","POST"]);
  assert(x.calls.every(row=>row.opts.headers.Authorization==="Bearer owner-token"));
  assert.equal(x.store.pending.length,0);
});
test("401 invalidates Bridge session without erasing pending records",async()=>{
  const x=setup({token:"bad",response:async()=>({ok:false,status:401})});
  assert.equal(await x.c.atlasScannerCollectorFetchLatest(),false);
  assert.equal(await x.c.atlasScannerCollectorFlush(),false);
  assert.equal(x.calls.length,1);
  assert.equal(x.store.pending.length,1);
});
test("403 pauses collector and preserves observations",async()=>{
  const x=setup({token:"denied",response:async()=>({ok:false,status:403})});
  assert.equal(await x.c.atlasScannerCollectorFlush(),false);
  assert.equal(x.runtime.bridgeAuthRejected,true);
  assert.equal(await x.c.atlasScannerCollectorFetchLatest(),false);
  assert.equal(x.calls.length,1);
  assert.equal(x.store.pending.length,1);
});
test("Snapshots use newest dated EUR identity, reject symbol aliases",()=>{
  const x=setup();x.runtime.latestBridgeSnapshot=snap("bridge-old",60000);
  assert.equal(x.c.atlasScannerCollectorEffectiveLatest().snapshot_id,"local");
  x.runtime.latestBridgeSnapshot=snap("bridge-new",1000);
  assert.equal(x.c.atlasScannerCollectorEffectiveLatest().snapshot_id,"bridge-new");
  assert.equal(x.c.atlasScannerCollectorFindAsset({id:"different",symbol:"BTC"}),null);
  x.runtime.latestBridgeSnapshot=snap("wrong-currency",1000,"USD");
  assert.equal(x.c.atlasScannerCollectorEffectiveLatest().snapshot_id,"local");
});
test("Regression invariants: canonical top five and atomic scanner unchanged",()=>{
  assert.match(app,/finalEntries.length !== ATLAS_SCANNER_TARGET/);
  assert.match(app,/activeRequestKey === atlasComparisonRequestKey712/);
  assert.match(app,/\["BTC", "ETH", "BNB", "XRP", "SOL"\]/);
});