"use strict";
/* External chart is authoritative for visible Technical Reading and Source Dock.
   Node-only: no storage, network, runtime navigation, transactions or UI owners. */
const fs=require("node:fs");
const path=require("node:path");
const assert=require("node:assert/strict");
const vm=require("node:vm");
const root=path.resolve(__dirname,"../public/agent_crypto_erith_ia/administrator");
const app=fs.readFileSync(path.join(root,"app.js"),"utf8");
const facade=fs.readFileSync(path.join(root,"js/market-fiche-display-406518.js"),"utf8");

const from=app.indexOf("function atlasExternalChartActive(){");
const until=app.indexOf("function atlasExternalPresentation(){",from);
assert.ok(from>=0&&until>from,"Canonical external chart identity functions exist");
const ctx={active:true,coin:{id:"concrete"}};
const canon={atlasExternalChartContext:ctx};
vm.runInNewContext(app.slice(from,until)+
  "\nthis.wrong=atlasExternalChartDetailMismatch;this.active=atlasExternalChartActive;",canon);
assert.equal(canon.active(),true);
assert.equal(canon.wrong({id:"bitcoin"}),true,"BTC callback blocked under CT graph");
assert.equal(canon.wrong(null),true,"Empty market callback blocked under CT graph");
assert.equal(canon.wrong({id:"concrete"}),false,"Matching CT detail allowed");
ctx.active=false;
assert.equal(canon.wrong({id:"bitcoin"}),false,"BTC available after explicit exit");
ctx.active=true;ctx.coin.id="another-external";
assert.equal(canon.wrong({id:"bitcoin"}),true);
assert.equal(canon.wrong({id:"another-external"}),false,"Generalizes beyond CT");

for(const [owner,pattern] of [
  ["detail card",/function atlasRenderAssetDetail\([^]*?if \(atlasExternalChartDetailMismatch\(c\)\) return;/],
  ["compact strip",/function atlasRenderCompactDetailSummary\([^]*?if \(atlasExternalChartDetailMismatch\(coin\)\) return;/],
  ["chart result",/function atlasRenderChartResult\([^]*?if \(atlasExternalChartDetailMismatch\(c\)\) return;/],
  ["chart series",/function drawLineChart\([^]*?if \(atlasExternalChartDetailMismatch\(result\?\.coin\)\) return;/],
  ["Source Dock",/function atlasEnsureSourceDock\([^]*?if \(atlasExternalChartDetailMismatch\(coin\)\) return;/]
])assert.match(app,pattern,owner+" cannot accept a mismatched Market update");
assert.match(app,/function atlasExternalChartDetail\([^]*?atlasEnsureSourceDock\(coin\);/);
assert.match(app,/Prix snapshot \$\{currency\}/,"External price currency must be sourced");
assert.match(app,/Dernier point \(\$\{currency\}\)/,"External last point must carry series currency");
assert.match(app,/function drawComparisonChart\([^]*?atlasExternalChartActive\(\)\) return \[\];/);
assert.match(app,/function atlasRenderComparisonDetail\([^]*?if \(atlasExternalChartActive\(\)\) return;/);
assert.match(app,/function atlasRenderComparisonCaption\([^]*?if \(atlasExternalChartActive\(\)\) return;/);

// The Extended market row and its click handler must use the same attribute.
// Otherwise out-of-Top250 assets (such as IRYS) cannot open their existing chart.
assert.match(app,/data-market-extended-toggle403116="\$\{escapeHtml\(c\.id\)\}"/);
const delegation=app.slice(app.indexOf("function atlasMarketExtendedEnsureDelegation(){"),
  app.indexOf("function atlasMarketExtendedUniverseRowMarkup(",app.indexOf("function atlasMarketExtendedEnsureDelegation(){")));
assert.match(delegation,/row\.getAttribute\("data-market-extended-toggle403116"\)/);
assert.doesNotMatch(delegation,/row\.dataset\.marketExtendedToggle\b/);
const start=facade.indexOf("  function activeExternalId(){");
const finish=facade.indexOf("  function selectedCoin(){",start);
assert.ok(start>=0&&finish>start,"USD facade external selection helper exists");
const visible={active:true,coin_id:"concrete"};
const sandbox={globalThis:{AtlasExternalChart:{state:()=>visible}}};
vm.runInNewContext(facade.slice(start,finish)+"\nthis.allowed=ficheCoinAllowed;this.id=activeExternalId;",sandbox);
assert.equal(sandbox.id(),"concrete");
assert.equal(sandbox.allowed({id:"bitcoin"}),false,"USD facade cannot project BTC onto CT");
assert.equal(sandbox.allowed({id:"concrete"}),true,"USD facade accepts CT");
visible.active=false;
assert.equal(sandbox.allowed({id:"bitcoin"}),true,"USD facade restores normal market");
assert.match(facade,/function selectedCoin\(\)\{\s*const ext=activeExternalId\(\);\s*if\(ext\)return coinForId\(ext\);/);
assert.match(facade,/function applyCompactFiche\([^]*?if\(!ficheCoinAllowed\(resolved\)\)return false;/);
assert.match(facade,/function applyGridFiche\([^]*?if\(!ficheCoinAllowed\(resolved\)\)return false;/);
console.log("PASS external CT owns graph, Technical Reading, USD fiche, Source Dock; BTC returns after exit.");
