import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {webcrypto,createHash} from "node:crypto";
import {gzipSync} from "node:zlib";

const moduleJS=fs.readFileSync(
 "public/agent_crypto_erith_ia/administrator/js/verified-periods-reader.js","utf8");
const commonJS=fs.readFileSync(
 "public/agent_crypto_erith_ia/administrator/js/shared-historical-view.js","utf8");
const origin="https://blueazur-hub.github.io";
const prefix="/erith-ia-memory/public/agent_crypto_erith_ia/data/historical_archive_prototype/";
const end=Date.UTC(2026,9,1),day=86400000;
const hash=bytes=>createHash("sha256").update(bytes).digest("hex");
const pairs={bitcoin:"BTCUSDT",ethereum:"ETHUSDT",binancecoin:"BNBUSDT",
 ripple:"XRPUSDT",solana:"SOLUSDT"};
const periods={"24h":["1m",1440,60000],"7j":["5m",2016,300000],
 "30j":["1h",720,3600000],"60j":["1h",1440,3600000],
 "90j":["1h",2160,3600000],"1an":["1d",365,day],"Max":["1d",370,day]};
function fixture(){
 const blobs=new Map(),assets=[],before={},gaps=(rows,step)=>{
  const out=[];
  for(let i=1;i<rows.length;i++)if(rows[i][0]!==rows[i-1][0]+step)
   out.push({start_ms:rows[i-1][0]+step,end_exclusive_ms:rows[i][0],
             missing_bars:(rows[i][0]-rows[i-1][0])/step-1});
  return out;
 };
 for(const [id,pair] of Object.entries(pairs)){
  const metadata={id,pair,quote:"USDT",verified_closed_months:12,
   verified_native_minutes:525600,first_month:"2025-10",last_month:"2026-09",
   max_scope:"materialized_calendar_year_shards_not_all_time",periods:[]};
  for(const [period,[interval,count,step]] of Object.entries(periods)){
   const excluded=period==="Max"?new Set([end-100*day]):new Set();
   const rows=[];
   // 370 rows over 371 days for Max; one absent date must be declared.
   for(let i=period==="Max"?count:count;i>0;i--){
    const timestamp=end-i*step-(period==="Max"&&i>=100?day:0);
    if(excluded.has(timestamp))continue;
    rows.push([timestamp,100,104,99,101,2,200,3]);
   }
   if(period==="Max"){
    // Preserve one explicit discontinuity without changing end and count.
    rows.length=0;
    for(let i=370;i>=0;i--){if(i!==100)rows.push([end-(i+1)*day,100,104,99,101,2,200,3]);}
    // First and last times do not matter beyond their consistency with metadata.
   }
   const missing=gaps(rows,step),projections=period==="Max"?["a".repeat(64)]:
       ["b".repeat(64),"c".repeat(64)];
   const data={
    schema:"seven.crypto.verified-period-projection",asset_id:id,pair,
    quote:"USDT",is_live:false,period,resolution:interval,
    columns:["open_time_ms","open","high","low","close","base_volume","quote_volume","trade_count"],
    is_all_time:false,scope:period==="Max"?"materialized_verified_history":"last_verified_closed_archive_window",
    source:"Binance Spot original checked 1m monthly ZIP",
    last_source_month:"2026-09",native_source_months:Array.from({length:12},(_,i)=>({month:i<3?"2025-"+(10+i):"2026-"+String(i-2).padStart(2,"0")})),
    source_projection_sha256:projections,start_ms:rows[0][0],
    end_exclusive_ms:rows.at(-1)[0]+step,gaps:missing,rows
   };
   const filename=id+"-"+period+".json.gz";
   const compressed=gzipSync(Buffer.from(JSON.stringify(data)));
   blobs.set("verified_periods/"+filename,compressed);
   metadata.periods.push({period,resolution:interval,file:filename,
    sha256:hash(compressed),bytes:compressed.length,bars:rows.length,
    start_ms:data.start_ms,end_exclusive_ms:data.end_exclusive_ms,gaps:missing.length,
    source_projections:projections});
   before[id+"/"+period]=data;
  }
  assets.push(metadata);
 }
 const index={schema:"seven.crypto.verified-period-index",quote:"USDT",
  is_live:false,is_all_time:false,source:"Binance Spot native verified 1m ZIPs",
  scope:"12 verified closed months plus available annual shards",
  core_assets:5,periods_per_asset:7,assets};
 blobs.set("verified_periods/index.json",Buffer.from(JSON.stringify(index)));
 return {blobs,index,before};
}
function harness(modifier=null,withCommon=false){
 const fx=fixture(), requests=[],nodes=new Map(),window={},events={};
 const noop=()=>{};
 const ctx={fillRect:noop,beginPath:noop,moveTo:noop,lineTo:noop,stroke:noop,fillText:noop,clearRect:noop};
 function element(id){
  if(nodes.has(id))return nodes.get(id);
  const handlers={};
  const obj={id,value:id==="shared-asset"?"bitcoin":id==="shared-period"?"30j":"candles",
   width:1100,height:370,textContent:"",disabled:false,children:[],open:false,
   append(...x){this.children.push(...x)},
   replaceChildren(...x){this.children=[...x]},
   addEventListener(n,f){handlers[n]=f},dispatch(n,data){return handlers[n]?.(data)},
   getContext:()=>ctx,getBoundingClientRect:()=>({left:0,width:1100}),
   scrollIntoView:noop};
  nodes.set(id,obj);return obj;
 }
 const document={
  currentScript:{src:origin+prefix.replace("data/historical_archive_prototype/","administrator/js/")+"verified-periods-reader.js"},
  getElementById:element,
  createElement:tag=>element(tag+Math.random()),
  addEventListener(n,f){events[n]=f}
 };
 if(withCommon){
  const monthly={schema:"aerith.public.ohlcv.shared.monthly-index.v1",
    source:"Binance Spot official monthly 1m ZIPs",
    quote:"USDT",scope:"latest_verified_closed_month",is_live:false,max_is_all_time:false,
    archived_assets:5,assets:fx.index.assets.map((a,i)=>({
      id:a.id,rank:i+1,name:a.id,symbol:a.pair.slice(0,-4),pair:a.pair,
      month:"2026-09",file:a.id+".json.gz",release:"crypto-spot-bulk-2026-09-1m",
      source_zip_sha256:"a".repeat(64),sha256:"a".repeat(64),bytes:12000,
      native_1m_count:43200,series_counts:{"1m":1440,"5m":8640,"1h":720}
    }))};
  fx.blobs.set("shared_monthly_views/index.json",Buffer.from(JSON.stringify(monthly)));
 }
 async function fetchMock(u){
  const parsed=new URL(u),path=parsed.pathname;
  assert.equal(parsed.origin,origin);
  assert.ok(path.startsWith(prefix));
  const key=path.slice(prefix.length);
  requests.push(key);
  if(withCommon&&key==="bitget_verified_views/index.json")return new Response("",{status:404});
  let bytes=fx.blobs.get(key);
  assert.ok(bytes,"Unexpected remote fetch "+key);
  bytes=modifier?.(key,bytes,fx)??bytes;
  return new Response(bytes,{status:200});
 }
 const scope={window,document,fetch:fetchMock,location:{origin},crypto:webcrypto,
   URL,Response,Blob,TextDecoder,TextEncoder,DecompressionStream,Uint8Array,
   Intl,Date,Math,Number,Array,Object,Set,Map,console};
 vm.runInNewContext(moduleJS,scope,{timeout:5000});
 if(withCommon){
  document.currentScript.src=origin+"/erith-ia-memory/public/agent_crypto_erith_ia/administrator/js/shared-historical-view.js";
  vm.runInNewContext(commonJS,scope,{timeout:5000});
 }
 return {window,requests,fx,node:element,events};
}
test("seven windows across five original-source-qualified market identities",async()=>{
 const x=harness(),catalog=await x.window.SevenVerifiedPeriods.index();
 assert.equal(catalog.core_assets,5);
 assert.equal(catalog.assets.length,5);
 for(const id of Object.keys(pairs))for(const period of Object.keys(periods)){
  const result=await x.window.SevenVerifiedPeriods.load(id,period);
  assert.equal(result.rows.length,periods[period][1]);
  assert.equal(result.data.quote,"USDT");
  assert.equal(result.data.pair,pairs[id]);
  assert.equal(result.data.gaps.length,period==="Max"?1:0);
 }
 assert.equal(x.requests.length,36);
 await x.window.SevenVerifiedPeriods.load("solana","Max");
 assert.equal(x.requests.length,36,"Last period remains cached");
});
test("SHA-256 tampering refuses display even for plausible OHLCV",async()=>{
 const x=harness((filename,raw)=>{
  if(filename==="verified_periods/bitcoin-24h.json.gz"){
   const altered=Buffer.from(raw);altered[8]^=1;return altered;
  }
 });
 await assert.rejects(x.window.SevenVerifiedPeriods.load("bitcoin","24h"),/SHA-256/);
});
test("USDT source identity cannot become USD in an otherwise valid catalog",async()=>{
 const x=harness((filename,raw)=>{
  if(filename==="verified_periods/index.json"){
   const altered=JSON.parse(raw);altered.quote="USD";
   return Buffer.from(JSON.stringify(altered));
  }
 });
 await assert.rejects(x.window.SevenVerifiedPeriods.index(),/Catalogue Top 5/);
});
test("missing gap must be declared even with valid gzip checksum",async()=>{
 const x=harness((filename,raw,fx)=>{
  if(filename==="verified_periods/index.json"){
   const j=JSON.parse(raw);
   const a=j.assets.find(a=>a.id==="bitcoin").periods.find(p=>p.period==="Max");
   const mutated={...fx.before["bitcoin/Max"],gaps:[]};
   const zip=gzipSync(Buffer.from(JSON.stringify(mutated)));
   fx.blobs.set("verified_periods/bitcoin-Max.json.gz",zip);
   a.sha256=hash(zip);a.bytes=zip.length;
   return Buffer.from(JSON.stringify(j));
  }
 });
 await assert.rejects(x.window.SevenVerifiedPeriods.load("bitcoin","Max"),/Lacunes Max/);
});
test("single Coffre HTML mounts certified source ahead of legacy reader",()=>{
 const html=fs.readFileSync("public/agent_crypto_erith_ia/administrator/historical-vault.html","utf8");
 const verified=html.indexOf('src="./js/verified-periods-reader.js"');
 const legacy=html.indexOf('src="./js/shared-historical-view.js"');
 assert.ok(verified>0&&legacy>verified);
 assert.match(html,/id="shared-style"/);
 assert.match(html,/id="shared-hover"/);
 assert.match(html,/id="shared-curve"/);
 assert.doesNotMatch(html,/id="second-vault-reader"/);
});
test("UI changing pilot and period routes to verified archive and renders OHLCV table",async()=>{
 const x=harness(null,true);
 const select=x.node("shared-asset");
 // The legacy reader fills common select asynchronously; wait for init.
 for(let i=0;i<100&&select.children.length!==5;i++)
  await new Promise(resolve=>setImmediate(resolve));
 assert.equal(select.children.length,5);
 select.value="bitcoin";
 x.node("shared-period").value="1an";
 x.node("shared-read").dispatch("click");
 for(let i=0;i<200&&!x.node("shared-status").textContent.includes("SHA-256 vérifié");i++)
  await new Promise(resolve=>setImmediate(resolve));
 assert.match(x.node("shared-status").textContent,/SHA-256 vérifié/);
 assert.match(x.node("shared-status").textContent,/365 bougies 1d/);
 assert.match(x.node("shared-source").textContent,/Max = partitions historiques matérialisées/);
 assert.equal(x.node("shared-table").children.length,9);
 assert.ok(x.requests.includes("verified_periods/bitcoin-1an.json.gz"));
 x.node("shared-period").value="Max";
 x.node("shared-period").dispatch("change");
 for(let i=0;i<200&&!x.node("shared-status").textContent.includes("interruption(s)");i++)
  await new Promise(resolve=>setImmediate(resolve));
 assert.match(x.node("shared-status").textContent,/interruption/);
 assert.equal(x.node("shared-table").children.length,9);
});


test("Max explains the missing archive dates without making the user guess",async()=>{
 const x=harness(null,true);
 for(let i=0;i<100&&x.node("shared-asset").children.length!==5;i++)
  await new Promise(done=>setImmediate(done));
 x.node("shared-asset").value="bitcoin";
 x.node("shared-period").value="Max";
 x.node("shared-read").dispatch("click");
 for(let i=0;i<250&&!x.node("shared-status").textContent.includes("SHA-256 vérifié");i++)
  await new Promise(done=>setImmediate(done));
 assert.match(x.node("shared-explanation").textContent,/VOUS REGARDEZ : BTCUSDT/);
 assert.match(x.node("shared-explanation").textContent,/Max/);
 assert.match(x.node("shared-gaps").textContent,/ATTENTION — archive incomplète/);
 assert.match(x.node("shared-gaps").textContent,/sans données/);
 assert.match(x.node("shared-gaps").textContent,/Bande orange/);
 assert.match(x.node("shared-range").textContent,/370 bougies visibles/);
 assert.equal(x.node("shared-prev").disabled,true);
 assert.equal(x.node("shared-next").disabled,true);
 x.node("shared-zoom-in").dispatch("click");
 assert.match(x.node("shared-range").textContent,/185 bougies visibles/);
 assert.equal(x.node("shared-prev").disabled,false);
 x.node("shared-prev").dispatch("click");
 assert.equal(x.node("shared-next").disabled,false);
 x.node("shared-reset").dispatch("click");
 assert.match(x.node("shared-range").textContent,/370 bougies visibles/);
 assert.equal(x.node("shared-next").disabled,true);
 const n=x.requests.length;
 x.node("shared-style").value="line";
 x.node("shared-style").dispatch("change");
 assert.equal(x.requests.length,n,"Changing display style must not refetch history");
});
test("legacy assets keep their prior reader and navigation stays disabled",()=>{
 const js=fs.readFileSync("public/agent_crypto_erith_ia/administrator/js/shared-historical-view.js","utf8");
 const html=fs.readFileSync("public/agent_crypto_erith_ia/administrator/historical-vault.html","utf8");
 assert.match(js,/navigationIds\.forEach\(id=>byId\(id\)\.disabled=true\)/);
 assert.match(js,/maxVolume=Math\.max\(\.\.\.groups\.map\(g=>g\.base\/g\.n\)/);
 for(const id of ["shared-explanation","shared-legend","shared-gaps","shared-range",
                  "shared-prev","shared-zoom-in","shared-zoom-out","shared-next","shared-reset"]){
  assert.ok(html.includes('id="'+id+'"'),"Missing user-facing control "+id);
 }
});
