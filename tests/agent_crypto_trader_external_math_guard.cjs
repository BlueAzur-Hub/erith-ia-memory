"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const filename=path.join(root,"public/agent_crypto_erith_ia/trader/math-core-external-guard.js");
const src=fs.readFileSync(filename,"utf8");
new vm.Script(src);
const html=fs.readFileSync(path.join(root,"public/agent_crypto_erith_ia/administrator/index.html"),"utf8");
assert(html.includes('src="../trader/math-core-external-guard.js"'));
function elem(id){
 const s=new Set();
 return {id,hidden:false,dataset:{},textContent:"",children:[],
 classList:{add:v=>s.add(v),remove:v=>s.delete(v),contains:v=>s.has(v)},
 appendChild(child){this.children.push(child)},replaceChildren(...children){this.children=children},
 setAttribute(){},};
}
const math=elem("math"),nodes={math};
const doc={
 readyState:"complete",documentElement:{dataset:{agentCryptoSurface:"trader"}},
 head:elem("head"),createElement:()=>elem("new"),
 getElementById:id=>nodes[id]||null
};
doc.head.appendChild=function(child){nodes[child.id]=child;this.children.push(child)};
math.appendChild=function(child){nodes[child.id]=child;this.children.push(child)};
let selected={active:false};
let candles={external:false,rows:[]};
const listeners={};
const context={document:doc,window:{addEventListener:(event,callback)=>{listeners[event]=callback}},
 queueMicrotask:fn=>fn(),requestAnimationFrame:fn=>fn(),console,
 AgentCryptoNewListingLiveAsset:{snapshot:()=>selected},
 AgentCryptoMarketMicroscope:{snapshot:()=>candles}};
context.globalThis=context;
vm.runInNewContext(src,context,{filename});
const api=context.AgentCryptoTraderExternalMathGuard;
assert.equal(api.snapshot().active,false);
selected={active:true,base:"CT",quote:"USDT",instrument:"CT-USDT",provider:"okx",providerLabel:"OKX"};
candles={external:true,loadedInstrument:"BTC-USDT",rows:Array.from({length:35},(_,i)=>({t:1000+i*300000,c:80000+i*10})),source:"BTC"};
listeners["agent-crypto:external-asset-changed"]();
assert.equal(api.snapshot().active,true);
assert.equal(api.snapshot().instrument,"CT-USDT");
let notice=nodes.traderMathExternalGuard.children[1].textContent;
assert.match(notice,/aucune statistique BTC substituée/);
assert.doesNotMatch(notice,/80000/);
candles={external:true,loadedInstrument:"CT-USDT",loading:false,rows:Array.from({length:50},(_,i)=>({t:1000+i*300000,c:0.35+i*0.0004})),source:"OKX public candles"};
listeners["agent-crypto:candles-technical-levels"]();
notice=nodes.traderMathExternalGuard.children[1].textContent;
assert.match(notice,/50 bougies OKX/);
assert.match(notice,/volatilité de la fenêtre/);
selected={active:false};
listeners["agent-crypto:external-asset-changed"]();
assert.equal(api.snapshot().active,false);
assert.equal(nodes.traderMathExternalGuard.hidden,true);
assert.equal(api.snapshot().instrument,null);
console.log("Trader Math external ownership: CT/BTC mismatch blocked, CT series validated, return to BTC restored PASS");
