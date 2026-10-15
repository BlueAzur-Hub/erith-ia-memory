import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const root="public/agent_crypto_erith_ia/";
const code=fs.readFileSync(root+"trader/ai-bitget-daily-validator.js","utf8");
const context=vm.createContext({});
vm.runInContext(code,context);
const validate=context.AgentCryptoBitgetDailyValidator.validate;
const index=JSON.parse(fs.readFileSync(root+"data/historical_archive_prototype/top250_multiresolution_sources/index.json","utf8"));
const entry=index.assets.find(x=>x.id==="quack-ai");
const DAY=86400000;
function fixture(){
 const start=entry.earliest_source_ms;
 const data=[start,start+DAY,start+3*DAY].map((stamp,i)=>
  [String(stamp),"2","3","1",String(2.2+i/10),"4","8"]);
 const meta={...entry,earliest_source_ms:start,latest_source_ms:start+3*DAY,
  native_candles:3,gaps_within_observed_span:1};
 const payload={schema:"aerith.bitget.native-exchange-daily-history.verified-response.v1",
  exchange:"Bitget Spot",market:"QUSDT",quote:"USDT",native_interval:"1D",
  owner:{id:"quack-ai",symbol:"Q",rank:meta.rank},native_candles:3,
  filled_by_our_collector:false,canonical_1m_federation_modified:false,
  native_daily_timezone_not_normalized:true,historical_source_exhaustion_proven:false,
  native_session_start_modulo_utc_day_ms:meta.native_session_start_modulo_utc_day_ms,
  calendar_days_without_native_bars:1,native_daily_rows:data,
  native_source_response_sha256:["a".repeat(64)],
  source_response_digests_are_exchange_signed:false};
 return {meta,payload};
}
test("canonical Q identifies 390 Bitget 1D and four original gaps",()=>{
 assert.equal(entry.native_candles,390);assert.equal(entry.gaps_within_observed_span,4);
 assert.equal(entry.quote,"USDT");assert.equal(entry.native_session_start_modulo_utc_day_ms,57600000);
 assert.match(entry.sha256,/^[a-f0-9]{64}$/);
});
test("accept unchanged native Q daily session and declared missing day",()=>{
 const {meta,payload}=fixture();
 const x=validate(payload,meta);
 assert.equal(x.points,3);assert.equal(x.gaps,1);assert.equal(x.quote,"USDT");
 assert.equal(x.sessionsUtcModuloMs,57600000);assert.equal(x.live,false);
});
test("reject hidden gap, wrong pair, normalized UTC, forged OHLC and duplicate",()=>{
 const f=fixture();f.payload.calendar_days_without_native_bars=0;
 assert.throws(()=>validate(f.payload,f.meta),/lacunes/);
 const wrong=fixture();wrong.payload.market="BTCUSDT";
 assert.throws(()=>validate(wrong.payload,wrong.meta),/source native/);
 const time=fixture();time.payload.native_daily_rows[0][0]=String(Number(time.payload.native_daily_rows[0][0])+8*3600000);
 assert.throws(()=>validate(time.payload,time.meta),/date native/);
 const price=fixture();price.payload.native_daily_rows[0][2]="1";
 assert.throws(()=>validate(price.payload,price.meta),/prix/);
 const dupe=fixture();dupe.payload.native_daily_rows[1][0]=dupe.payload.native_daily_rows[0][0];
 assert.throws(()=>validate(dupe.payload,dupe.meta),/chronologie/);
});
test("no network, account, DOM or order activity is in validator",()=>{
 assert.doesNotMatch(code,/(fetch\s*\(|XMLHttpRequest|indexedDB|localStorage|createOrder|placeOrder)/i);
});
