/* Agent-Crypto reusable Main regression: truthful scanner & CoinGecko OHLC presentation. */
const fs=require("node:fs"),assert=require("node:assert/strict"),vm=require("node:vm");
const base="public/agent_crypto_erith_ia/administrator/";
const app=fs.readFileSync(base+"app.js","utf8"),ohlc=fs.readFileSync(base+"js/market-microscope-candles.js","utf8");
const build=JSON.parse(fs.readFileSync(base+"build.json","utf8"));
const index=fs.readFileSync(base+"index.html","utf8");let passed=0;
function ok(x,label){assert.ok(x,label);passed++;}
ok(build.build==="40.6.644"&&build.parent_build==="40.6.643","explicit upgrade");
ok(build.market_core_modified===false,"Market Core unchanged");
ok(build.terrain_verified===false,"Firefox remains user-owned");
ok(index.includes('id="atlasVersionTruthText">Build 40.6.644'),"visible badge");
ok(index.includes('./app.js?v=40.6.644'),"cache-bust app");
ok(index.includes('market-microscope-candles.js?v=40.6.644'),"cache-bust candle module");
ok(app.includes("function atlasScannerPool("),"Market owns ranking");
ok(app.includes("marketChange: typeof entry?.atlasMarketMetric"),"Market metric frozen for graph");
ok(app.includes("MKT = variation du classement Market"),"time base explained");
ok(app.includes("MKT ${Number.isFinite(row.marketChange)"),"both metrics displayed");
ok(app.includes("HIST ${Number.isFinite(row.change)"),"historical change separately displayed");
ok(app.includes("function atlasScannerQualifyNativeEurTwoDay"),"genuine EUR hourly fallback kept");
ok(ohlc.includes('bar:"30m"'),"OHLC native 30m");
ok(ohlc.includes('state.bar=requestedBar;syncControls();'),"actual candle interval selected");
ok(ohlc.includes('COINGECKO PUBLIC · NAVIGATEUR'),"browser provenance");
ok(ohlc.includes('v:null'),"no invented OHLC volume");
ok(ohlc.includes('CG_OHLC_CONTEXT_CHANGED'),"asset identity gate retained");
new vm.Script(app,{filename:"app.js"});new vm.Script(ohlc,{filename:"market-microscope-candles.js"});passed+=2;
console.log(passed+"/"+passed+" structural and syntax invariants passed");
