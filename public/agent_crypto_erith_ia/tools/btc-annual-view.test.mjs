import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {gzipSync} from "node:zlib";
import {webcrypto,createHash} from "node:crypto";

const script=fs.readFileSync("public/agent_crypto_erith_ia/administrator/js/btc-annual-view.js","utf8");
const origin="https://blueazur-hub.github.io";
const dir="/erith-ia-memory/public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_annual_view/";
const END=Date.UTC(2026,9,1),ONE=60000;
function make(){
  function rows(interval,count){
    const step={ "1m":ONE,"5m":ONE*5,"1h":ONE*60 }[interval];
    const result=[];
    for(let i=count;i>0;i--){
      const t=END-i*step;
      result.push([t,100,102,99,101,1,100,1]);
    }
    return result;
  }
  const months=["2025-10","2025-11","2025-12",
    ...Array.from({length:9},(_,i)=>"2026-"+String(i+1).padStart(2,"0"))];
  const data={
    schema:"aerith.public.ohlcv.btc.verified-monthly-view.v1",
    asset_id:"bitcoin",pair:"BTCUSDT",quote:"USDT",
    is_live:false,max_is_all_time:false,
    columns:["open_time_ms","open","high","low","close","base_volume","quote_volume","trade_count"],
    first_open_ms:END-365*86400000,last_open_ms:END-ONE,native_1m_count:525600,
    sources:months.map(m=>({month:m,tag:"crypto-spot-bulk-"+m+"-1m",sha256:"a".repeat(64),candles:43200})),
    series:{"1m":rows("1m",1440),"5m":rows("5m",8640),"1h":rows("1h",8760)}
  };
  const zipped=gzipSync(Buffer.from(JSON.stringify(data)));
  const index={
    schema:"aerith.public.ohlcv.btc.verified-monthly-index.v1",
    file:"btc-history-year.json.gz",bytes:zipped.length,
    sha256:createHash("sha256").update(zipped).digest("hex"),
    source_months:months,quote:"USDT",pair:"BTCUSDT",max_is_all_time:false,
    first_open_ms:data.first_open_ms,last_open_ms:data.last_open_ms,
    native_1m_count:data.native_1m_count,
    series_counts:Object.fromEntries(Object.entries(data.series).map(([k,v])=>[k,v.length]))
  };
  return {index,zipped};
}
function harness(change=()=>{}){
  const fixture=make();let reads=0;const window={};
  const request=async href=>{
    const u=new URL(href);reads++;
    assert.equal(u.origin,origin);assert.ok(u.pathname.startsWith(dir));
    const filename=u.pathname.slice(dir.length);
    let payload=filename==="index.json"?Buffer.from(JSON.stringify(fixture.index)):
                 filename==="btc-history-year.json.gz"?fixture.zipped:undefined;
    assert.ok(payload);
    payload=change(filename,payload)??payload;
    return new Response(payload,{status:200});
  };
  vm.runInNewContext(script,{
    window,document:{currentScript:{src:origin+"/erith-ia-memory/public/agent_crypto_erith_ia/administrator/js/btc-annual-view.js"},getElementById:()=>null},
    location:{origin},URL,fetch:request,crypto:webcrypto,Blob,Response,
    DecompressionStream,TextDecoder,TextEncoder,Uint8Array
  },{timeout:5000});
  return {window,reads:()=>reads};
}
test("no automatic network reads or writes",()=>{
 const h=harness();assert.equal(h.reads(),0);
 assert.equal(typeof h.window.SevenBTCAnnualView.readPeriod,"function");
});
test("one validated annual source, all buttons reuse it without refetch",async()=>{
 const h=harness();
 const asset=await h.window.SevenBTCAnnualView.load();
 const sizes={"24h":1440,"7j":2016,"30j":8640,"60j":1440,
              "90j":2160,"1an":8760,"Max":8760};
 for(const [p,n] of Object.entries(sizes)){
   const slice=h.window.SevenBTCAnnualView.readPeriod(asset,p);
   assert.equal(slice.rows.length,n,p);
   assert.equal(slice.quote,"USDT");
   assert.equal(slice.isLive,false);
 }
 assert.equal(h.reads(),2);
});
test("changed compressed bytes fail SHA-256 before decoding",async()=>{
 const h=harness((name,raw)=>{
   if(name.endsWith(".gz")){const corrupted=Buffer.from(raw);corrupted[6]^=1;return corrupted;}
 });
 await assert.rejects(h.window.SevenBTCAnnualView.load(),/SHA-256/);
});
test("wrong source/quote or missing candle is refused",async()=>{
 const h=harness((name,raw)=>{
   if(name==="index.json"){const v=JSON.parse(raw);v.quote="USD";return Buffer.from(JSON.stringify(v));}
 });
 await assert.rejects(h.window.SevenBTCAnnualView.load(),/Source ou devise/);
});
