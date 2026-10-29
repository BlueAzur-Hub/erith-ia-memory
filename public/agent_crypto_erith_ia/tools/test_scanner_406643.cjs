/* 40.6.643 isolated static regression gate: source-owner integrity, no synth points. */
const fs=require("node:fs"),assert=require("node:assert/strict");
const base="public/agent_crypto_erith_ia/administrator/";
const app=fs.readFileSync(base+"app.js","utf8");
const candles=fs.readFileSync(base+"js/market-microscope-candles.js","utf8");
const build=JSON.parse(fs.readFileSync(base+"build.json","utf8"));
let pass=0;function ok(t,msg){assert.ok(t,msg);pass++;}
ok(build.build==="40.6.643","build 643");
ok(build.parent_build==="40.6.640","parent 640");
ok(build.terrain_verified===false,"firefox not certified");
ok(app.includes("function atlasScannerQualifyNativeEurTwoDay"),"generic hourly qualifier");
ok(app.includes("const maxGap = 90 * 60000"),"hourly max gap");
ok(app.includes('sourceId:coin.id'),"exact requested ID");
ok(app.includes("market_chart?vs_currency=eur&days=2"),"native EUR days2");
ok(app.includes('result?.atlasNativeEurTwoDay?.cadence === "hourly-native"'),"hourly-specific tolerance");
ok(app.includes('result?.currency === "EUR"'),"EUR origin gate");
ok(app.includes("const boundaryAllowance"),"preserve real previous anchor");
ok(app.includes("function atlasScannerPool("),"Market selection retained");
ok(!app.includes("synthetic 24h point inserted"),"no synthetic marker");
ok(candles.includes("fetchCoinGeckoMarketEurOhlc"),"OHLC fallback");
ok(candles.includes("ohlc?vs_currency=eur&days=1"),"native EUR OHLC");
ok(candles.includes('v:null'),"no invented volume");
ok(candles.includes('if(!resolution?.available)'),"exchange first");
ok(candles.includes("CG_OHLC_CONTEXT_CHANGED"),"OHLC identity gate");
ok(candles.includes('bar:"30m"'),"true OHLC time cadence label");

const vm=require("node:vm");
const index=fs.readFileSync(base+"index.html","utf8");
ok(index.includes('id="atlasVersionTruthText">Build 40.6.643'),"version badge matches build");
function extract(name){
 const at=app.indexOf("function "+name+"(");
 assert.ok(at>=0,name+" exists");
 const end=app.indexOf("\nfunction ",at+10);
 assert.ok(end>at,name+" isolated");
 return app.slice(at,end);
}
const ctx={Date,Number,Array,Math,console,atlasChartRules:()=>({minPoints:20}),
 atlasSanitizeChartRows:rows=>Array.isArray(rows)?
 rows.filter(p=>Array.isArray(p)&&Number.isFinite(p[0])&&p[1]>0).sort((a,b)=>a[0]-b[0]):[]};
vm.createContext(ctx);
vm.runInContext(extract("atlasScannerSeriesCoversWindow")+"\n"+
 extract("atlasScannerQualifyNativeEurTwoDay"),ctx);
const end=Date.now(),start=end-24*3600000,minute=60000;
const hourly=Array.from({length:25},(_,i)=>[start-25*minute+i*60*minute,100+i]);
const tx={period:1,windowEnd:end};
const q=ctx.atlasScannerQualifyNativeEurTwoDay(hourly,tx);
ok(q.ok,"authentic hourly coverage accepted");
const result={series:q.series,currency:"EUR",sourceFamily:"coingecko",
 atlasNativeEurTwoDay:{nativeCurrency:"EUR",cadence:"hourly-native",sourceId:"coin-a"}};
ok(ctx.atlasScannerSeriesCoversWindow(result,tx).ok,"hourly tick -25min accepted");
ok(!ctx.atlasScannerSeriesCoversWindow({...result,atlasNativeEurTwoDay:null},tx).ok,"5min cannot borrow hourly tolerance");
ok(!ctx.atlasScannerSeriesCoversWindow({...result,currency:"USD"},tx).ok,"USD cannot borrow hourly EUR tolerance");
ok(!ctx.atlasScannerQualifyNativeEurTwoDay(hourly.slice(0,-2),tx).ok,"stale hourly rejected");
ok(!ctx.atlasScannerQualifyNativeEurTwoDay(hourly.filter((_,i)=>i!==10&&i!==11),tx).ok,"hourly hole rejected");
ok(!ctx.atlasScannerQualifyNativeEurTwoDay(hourly.slice(1),tx).ok,"missing preceding anchor rejected");
ok(!ctx.atlasScannerSeriesCoversWindow({...result,sourceFamily:"binance"},tx).ok,"wrong provider rejected");

console.log(pass+"/"+pass+" source-integrity and executed hourly gates passed");
