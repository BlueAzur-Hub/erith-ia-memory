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
console.log(pass+"/"+pass+" source-integrity gates passed");
