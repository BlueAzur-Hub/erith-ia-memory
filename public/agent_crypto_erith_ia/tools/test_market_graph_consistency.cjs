/* Agent-Crypto reusable Main regression: truthful scanner & CoinGecko OHLC presentation. */
const fs=require("node:fs"),assert=require("node:assert/strict"),vm=require("node:vm");
const base="public/agent_crypto_erith_ia/administrator/";
const app=fs.readFileSync(base+"app.js","utf8"),ohlc=fs.readFileSync(base+"js/market-microscope-candles.js","utf8");
const build=JSON.parse(fs.readFileSync(base+"build.json","utf8"));
const index=fs.readFileSync(base+"index.html","utf8");let passed=0;
function ok(x,label){assert.ok(x,label);passed++;}
ok(build.build==="40.6.645"&&build.parent_build==="40.6.644","explicit upgrade");
ok(build.market_core_modified===false,"Market Core unchanged");
ok(build.terrain_verified===false,"Firefox remains user-owned");
ok(index.includes('id="atlasVersionTruthText">Build 40.6.645'),"visible badge");
ok(index.includes('./app.js?v=40.6.645'),"cache-bust app");
ok(index.includes('market-microscope-candles.js?v=40.6.645'),"cache-bust candle module");
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
// Regression: five valid hourly histories whose genuine overlap is less than 23h30.
function fn(name){const i=app.indexOf("function "+name+"("),j=app.indexOf("\nfunction ",i+10);assert.ok(i>=0&&j>i);return app.slice(i,j);}
const ctx={Number,Math,Array,Map,Set,Date,ATLAS_SCANNER_TARGET:5,
 atlasChartRules:()=>({minPoints:20}),atlasComparisonMaximumPoints:()=>420,
 atlasComparisonRows:e=>e.result.series.map(([t,price])=>({t,price})),
 atlasDownsampleNativeComparisonRows:rows=>rows,
 atlasBuildNativeComparisonTimeline:es=>[...new Set(es.flatMap(e=>e.rows.map(r=>r.t)))].sort((a,b)=>a-b),
 atlasScannerSubsetIsCompatible:()=>true};
vm.createContext(ctx);vm.runInContext(fn("atlasBuildAlignedComparisonEntries")+"\n"+fn("atlasScannerAligned"),ctx);
const now=Date.now(),start=now-86400000;
const entries=[5,15,25,35,65].map((m,i)=>({
 coin:{id:"coin"+i,symbol:"C"+i},atlasScannerVerified24h:true,atlasScannerWindowEnd:now,
 result:{series:Array.from({length:25},(_,k)=>[start-m*60000+k*3600000,100+i*10+k])}
}));
const five=ctx.atlasScannerAligned(entries,1,entries.map(e=>e.coin.id),now);
ok(five.length===5,"five genuine individually qualified histories retained");
ok(five.every((e,i)=>e.coin.id===entries[i].coin.id),"Market ranking unchanged");
ok(five.every(e=>e.data.length===25),"no fabricated or interpolated samples");
ok(five.every(e=>e.data[0].y===100),"each genuine series independently base 100");
ok(app.includes("result?.scanner?.targetCount || options.selectedCount"),"4/5 remains 4/5");
console.log(passed+"/"+passed+" structural, syntax and real-timestamp regression gates passed");