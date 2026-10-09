import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {gzipSync} from "node:zlib";
import {createHash,webcrypto} from "node:crypto";

const script=fs.readFileSync("public/agent_crypto_erith_ia/trader/trader-historical-universe-reader.js","utf8");
const sha=raw=>createHash("sha256").update(raw).digest("hex");
function fixture({corrupt=false,unapproved=false,marketAlias=false,approvedAlias=false}={}){
 const end=1_800_000_000_000,step=300_000,count=288,start=end-count*step;
 const rows=Array.from({length:count},(_,i)=>[start+i*step,10,12,9,11,3,33,2]);
 const block={schema:"aerith.public.ohlcv.spot.universe.block.v1",source:"Binance Spot",
  asset_id:"dogecoin",symbol:"DOGE",pair:"DOGEUSDT",quote:"USDT",period:"24h",interval:"5m",
  first_ms:start,last_ms:end-step,rows};
 const compressed=gzipSync(JSON.stringify(block));
 const checksum=sha(compressed);
 const index={schema:"aerith.public.ohlcv.spot.universe.index.v1",
  source:"Binance Spot REST /api/v3/klines",quote:"USDT",
  publication:"MANUAL_BOUNDED_PILOT_NOT_LIVE",
  universe_size:marketAlias?2:1,verified_series:1,verified_candles:count,
  registry_sha256:"a".repeat(64),market:{sha256:"b".repeat(64)},
  snapshot_end_ms:end,assets:[{id:"dogecoin",symbol:"DOGE",rank:1,
    qualification:unapproved?"identity_review_required":"qualified_spot",
    candidate_pair:"DOGEUSDT"},...(marketAlias?[{id:"figure-heloc",symbol:"FIGR_HELOC",rank:2,
     qualification:approvedAlias?"qualified_spot":"identity_review_required",
     candidate_pair:approvedAlias?"FIGR_HELOCUSDT":null}]:[])],
  blocks:[{file:"blocks/dogecoin_24h_"+checksum.slice(0,16)+".json.gz",
    sha256:checksum,asset_id:"dogecoin",pair:"DOGEUSDT",period:"24h",
    interval:"5m",candles:count,first_ms:start,last_ms:end-step}]};
 const requests=[];
 const get=async url=>{
  requests.push(url);
  const buffer=url.endsWith("index.json")?Buffer.from(JSON.stringify(index)):
      corrupt?Buffer.concat([compressed,Buffer.from("corrupt")]):compressed;
  return{ok:true,status:200,arrayBuffer:async()=>Uint8Array.from(buffer).buffer};
 };
 const context={document:{currentScript:{src:"https://example.org/public/agent_crypto_erith_ia/trader/trader-historical-universe-reader.js"}},
  location:{origin:"https://example.org"},URL,fetch:get,
  Date,TextDecoder,TextEncoder,crypto:webcrypto,Blob,Response,DecompressionStream};
 vm.runInNewContext(script,vm.createContext(context),{timeout:3000});
 return{api:context.SevenHistoricalUniverseReader,requests};
}
test("Universe is lazy; catalog checks identity and lists one series",async()=>{
 const f=fixture();
 assert.equal(f.requests.length,0);
 const c=await f.api.listCoverage();
 assert.equal(f.requests.length,1);
 assert.equal(c.archiveFamily,"universe");
 assert.equal(c.coverage.length,1);
 assert.equal(c.coverage[0].pair,"DOGEUSDT");
 assert.equal(f.requests.length,1);
});
test("One selected gzip is verified and decoded without other downloads",async()=>{
 const f=fixture();
 const data=await f.api.readSeries({assetId:"dogecoin",period:"24h"});
 assert.equal(f.requests.length,2);
 assert.equal(data.metadata.quote,"USDT");
 assert.equal(data.metadata.archiveFamily,"universe");
 assert.equal(data.candles.length,288);
 assert.equal(data.candles[287][0],1_800_000_000_000-300000);
});
test("SHA alteration fails closed",async()=>{
 const f=fixture({corrupt:true});
 await assert.rejects(()=>f.api.readSeries({assetId:"dogecoin",period:"24h"}),/SHA-256/);
});
test("Non-approved coin never downloads a compressed block",async()=>{
 const f=fixture({unapproved:true});
 await assert.rejects(()=>f.api.listCoverage(),/non qualifiée/);
 assert.equal(f.requests.length,1);
});
test("Unknown selection never receives a substituted asset",async()=>{
 const f=fixture();
 await assert.rejects(()=>f.api.readSeries({assetId:"bitcoin",period:"24h"}),/absente/);
 assert.equal(f.requests.length,1);
});

test("Real Top 20 includes unapproved FIGR_HELOC; DOGE archive still verifies",async()=>{
 const f=fixture({marketAlias:true});
 const catalog=await f.api.listCoverage();
 assert.equal(catalog.coverage.length,1);
 const doge=await f.api.readSeries({assetId:"dogecoin",period:"24h"});
 assert.equal(doge.candles.length,288);
 assert.equal(f.requests.length,2);
});
test("Exchange approved instrument cannot use the non-Spot underscore ticker",async()=>{
 const f=fixture({marketAlias:true,approvedAlias:true});
 await assert.rejects(()=>f.api.listCoverage(),/Paire non qualifiée/);
 assert.equal(f.requests.length,1);
});
