"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const root=path.resolve(__dirname,"..");
const load=file=>fs.readFileSync(path.join(root,file),"utf8");
const html=load("public/agent_crypto_erith_ia/administrator/index.html");
const guard=load("public/agent_crypto_erith_ia/trader/clear-external-selection-guard.js");
new vm.Script(guard);
assert(html.includes('src="../trader/clear-external-selection-guard.js"'));
assert(html.includes('src="../trader/math-core-external-guard.js"'));
assert(html.includes('BASE="../../../assets/images/technical-reading/"'));
assert(html.includes('const RANDOM_BASE="../../../assets/images/technical-reading/"'));
const start=html.indexOf('<script id="atlasTechnicalStaticThemeController">');
const end=html.indexOf("</script>",start);
assert(start>=0 && end>start);
const active=html.slice(start,end);
new vm.Script(active.substring(active.indexOf(">")+1));
const hits=[...active.matchAll(/file:"technical-random-(\d\d)\.png",label:/g)].map(x=>Number(x[1]));
assert.deepEqual(hits,Array.from({length:22},(_,i)=>i+1));
assert(active.includes('file:"technical-random-22.png",label:"Vers la Cité d’Émeraude"'));
// The same administrator/index.html is the host for the public Interface and
// the Trader frame. The new picture is not registered in a separate gallery.
const trading=load("public/agent_crypto_erith_ia/trader/trading-desk.html");
assert(trading.includes('../administrator/index.html'));
function run(surface) {
  const listeners={};let calls=0,clearChart=null;
  const state={selectedId:"concrete",pendingId:null};
  const context={
    document:{readyState:"complete",documentElement:{dataset:{agentCryptoSurface:surface}},
      addEventListener:(type,fn,capture)=>{listeners[type]={fn,capture}}},
    AgentCryptoNewListingsNativeCategory:{snapshot:()=>({...state}),deactivate:opts=>{calls++;clearChart=opts.clearChart;state.selectedId=null}},
    AgentCryptoNewListingLiveAsset:{snapshot:()=>({active:!!state.selectedId})}
  };
  context.globalThis=context;
  vm.runInNewContext(guard,context);
  return {listeners,state,click:(trusted,id)=>{listeners.click?.fn({isTrusted:trusted,target:{closest:()=>({id})}});return calls},
    chartCleared:()=>clearChart};
}
const trader=run("trader");
assert.equal(trader.click(false,"btnChartClear"),0);
assert.equal(trader.click(true,"btnChartClear"),1);
assert.equal(trader.chartCleared(),false);
assert.equal(trader.state.selectedId,null);
assert.equal(trader.click(true,"btnChartClear"),1);
const iface=run("administrator");
assert.equal(iface.click(true,"btnChartClear"),0);
console.log("Trader Vider/Reset: CT request cancelled before canonical V7 clear PASS");
console.log("Interface and Trader: same active RND collection with 22 originals PASS");
