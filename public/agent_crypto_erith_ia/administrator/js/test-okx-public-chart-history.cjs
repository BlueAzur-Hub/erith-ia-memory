"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const api=require("./okx-public-chart-history.js");
const ROOT=path.resolve(__dirname,"../../data/crypto/okx-hourly");
const read=p=>JSON.parse(fs.readFileSync(path.join(ROOT,p),"utf8"));
const manifest=read("spot-candles/coverage.json");
const kat=read("spot-candles/kat-usdc.json");
const kmno=read("spot-candles/kmno-usdc.json");
const irys=read("irys-spot-candles.json");
function service(records){
 const requests=[];
 const fetchImpl=async (url,params)=>{
   requests.push({url,params});
   const body=Object.entries(records).find(([key])=>url.includes(key))?.[1];
   return {ok:!!body,status:body?200:404,json:async()=>JSON.parse(JSON.stringify(body))};
 };
 return {fetchImpl,requests};
}
test("a real Katana year request reads every eligible authentic daily candle, even as the archive grows",async()=>{
 const mock=service({"coverage.json":manifest,"kat-usdc.json":kat});
 const coin={id:"katana-network",symbol:"KAT",name:"Katana"};
 const result=await api.load(coin,365,{fetchImpl:mock.fetchImpl,peers:[coin]});
 assert.equal(result.currency,"USDC");
 assert.equal(result.nativeSpotVerified,true);
 assert.equal(result.integrity.ok,true);
 assert.equal(result.sourceFamily,"okx");
 const archived=kat.candles["1Dutc"];
 const end=Number(archived.at(-1)[0]),day=86400000;
 const expected=archived.filter(row=>Number(row[0])>=end-365*day);
 assert(expected.length>=2);
 assert.deepEqual(result.series,expected.map(row=>[Number(row[0]),Number(row[4])]));
 assert.equal(result.pointCount,expected.length);
 const coveredDays=(Number(expected.at(-1)[0])-Number(expected[0][0]))/day;
 const partial=coveredDays<365*.92;
 assert.equal(result.partialCoverage,partial);
 if(partial)assert(result.coverageNote.includes("partielle"));
 assert(mock.requests[1].url.endsWith("kat-usdc.json"));
 assert(mock.requests.every(x=>x.params.cache==="no-store"));
});
test("native 24h, 7d and 30d windows use actual candle resolution and never invented timestamps",()=>{
 for(const [doc,days,bar] of [[kat,1,"15m"],[kmno,7,"1H"],[kat,30,"1H"],[kat,36500,"1Dutc"]]){
  const normalized=api.normalize(api.validateArchive(doc,doc.pair),days);
  const rawTimes=new Set(doc.candles[bar].map(z=>Number(z[0])));
  assert(normalized.series.length>=2);
  assert(normalized.series.every(row=>rawTimes.has(row[0])));
  assert.equal(normalized.currency,"USDC");
 }
});
test("IRYS standalone native archive is still reachable without falsely placing it in the 51 covered pairs",async()=>{
 const mock=service({"coverage.json":manifest,"irys-spot-candles.json":irys});
 const response=await api.load({id:"irys",symbol:"IRYS"},1,{fetchImpl:mock.fetchImpl});
 assert(response.series.length>2);
 assert(response.source.includes("IRYS-USDC"));
 assert(mock.requests[1].url.endsWith("irys-spot-candles.json"));
});
test("unknown OKX asset does not fetch an invented pair",async()=>{
 const mock=service({"coverage.json":manifest});
 const x=await api.load({id:"brandnew",symbol:"QWERTY"},30,{fetchImpl:mock.fetchImpl});
 assert.equal(x,null);assert.equal(mock.requests.length,1);
});
test("ticker collisions, different quote, and inverted/invented candles are rejected",async()=>{
 assert.equal(api.eligible({id:"katana-network",symbol:"KAT"},{peers:[{id:"other",symbol:"KAT"}]}),false);
 for(const edit of [
  d=>d.quote="USDT",
  d=>d.pair="BTC-USDC",
  d=>d.candles["1Dutc"][0][4]="-4",
  d=>d.candles["1Dutc"][1][0]=d.candles["1Dutc"][0][0],
  d=>d.orders_enabled=true,
  d=>d.candles["1H"][2][2]="0",
  d=>d.no_quote_conversion=false
 ]){
   let copy=JSON.parse(JSON.stringify(kat));edit(copy);
   assert.throws(()=>api.validateArchive(copy,"KAT-USDC"));
 }
});
test("Administrator wiring reads the helper before app.js, does not contaminate CoinGecko cache, and labels USDC correctly",()=>{
 const dir=path.resolve(__dirname,".."),html=fs.readFileSync(path.join(dir,"index.html"),"utf8");
 const app=fs.readFileSync(path.join(dir,"app.js"),"utf8");
 assert(html.includes('./js/okx-public-chart-history.js?rev=okx-native-history'));
 assert(html.indexOf("./js/okx-public-chart-history.js")<html.indexOf("./app.js?v=40.6.640"));
 assert(app.includes("AtlasOkxPublicChartHistory.load(coin,normalized"));
 assert(app.includes("safe.nativeSpotVerified"));
 assert(app.includes('const visibleCurrency = result?.nativeSpotVerified ? "USDC"'));
 assert(app.includes('result?.nativeSpotVerified && result?.integrity?.ok === true ? 2'));
 assert(app.includes('const currency = currencyRaw === "USDC" ? "USDC"'));
});
