"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const source=fs.readFileSync(path.join(root,"public/agent_crypto_erith_ia/trader/math-core-external-guard.js"),"utf8");
const category=fs.readFileSync(path.join(root,"public/agent_crypto_erith_ia/administrator/js/new-listings-native-category.js"),"utf8");
const candleSource=fs.readFileSync(path.join(root,"public/agent_crypto_erith_ia/administrator/js/market-microscope-candles.js"),"utf8");
const html=fs.readFileSync(path.join(root,"public/agent_crypto_erith_ia/administrator/index.html"),"utf8");
new vm.Script(source);
assert(html.includes('src="../trader/math-core-external-guard.js"'));
assert(category.includes("mathSeriesSnapshot,self_test:selfTest"));
assert(category.includes("state.lastPublishedSpecKey=[spec.id,spec.pair,spec.provider].join('|')"));
assert(candleSource.includes('"agent-crypto:market-candles-loaded"'));
function elem(id){
 const classes=new Set();
 return {id,hidden:false,dataset:{},textContent:"",children:[],
 classList:{add:v=>classes.add(v),remove:v=>classes.delete(v),contains:v=>classes.has(v)},
 appendChild(child){this.children.push(child)},replaceChildren(...children){this.children=children},
 setAttribute(){}};
}
const math=elem("math"),nodes={math};
const doc={readyState:"complete",documentElement:{dataset:{agentCryptoSurface:"trader"}},
 head:elem("head"),createElement:()=>elem("new"),getElementById:id=>nodes[id]||null};
doc.head.appendChild=function(node){nodes[node.id]=node;this.children.push(node)};
math.appendChild=function(node){nodes[node.id]=node;this.children.push(node)};
let selected={active:false};
let candles={external:false,rows:[]};
let line=null;
const listeners={};
const context={document:doc,window:{addEventListener:(event,callback)=>{listeners[event]=callback}},
 queueMicrotask:fn=>fn(),requestAnimationFrame:fn=>fn(),console,
 AgentCryptoNewListingLiveAsset:{snapshot:()=>selected},
 AgentCryptoNewListingsNativeCategory:{mathSeriesSnapshot:()=>line},
 AgentCryptoMarketMicroscope:{snapshot:()=>candles}};
context.globalThis=context;
vm.runInNewContext(source,context,{filename:"math-core-external-guard.js"});
const api=context.AgentCryptoTraderExternalMathGuard;
assert.equal(api.snapshot().active,false);
selected={active:true,base:"CT",quote:"USDT",instrument:"CT-USDT",provider:"okx",providerLabel:"OKX"};
candles={external:true,mode:"candles",loadedInstrument:"BTC-USDT",loadedBar:"5m",
 loading:false,rows:Array.from({length:35},(_,i)=>({t:Date.now()-35*300000+i*300000,c:80000+i*10})),source:"BTC"};
listeners["agent-crypto:external-asset-changed"]();
assert.equal(api.snapshot().active,true);
assert.equal(api.snapshot().instrument,"CT-USDT");
const notice=()=>nodes.traderMathExternalGuard.children[1].textContent;
assert.match(notice(),/aucune série complète/);
assert.doesNotMatch(notice(),/80000/);
const mkLine=(pair="CT-USDT",provider="okx",age=60000)=>({
 instrument:pair,provider,source:"OKX CT-USDT candles",periodDays:1,
 series:Array.from({length:70},(_,i)=>[Date.now()-age-(69-i)*300000,0.35+i*.0004])});
line=mkLine();
listeners["agent-crypto:new-listing-line-ready"]();
assert.match(notice(),/70 points de la ligne/);
assert.match(notice(),/OKX CT-USDT/);
assert.match(notice(),/volatilité de fenêtre/);
assert.match(notice(),/drawdown historique/);
assert.doesNotMatch(notice(),/BTC/);
assert.equal(api.snapshot().active,true);
assert(nodes.traderMathExternalStyle.textContent.includes("#atlasMathContextLine{display:none!important}"));
line=mkLine("CT-USDC");
listeners["agent-crypto:new-listing-line-ready"]();
assert.match(notice(),/aucune série complète/);
line=mkLine("CT-USDT","bitget");
listeners["agent-crypto:new-listing-line-ready"]();
assert.match(notice(),/aucune série complète/);
line=mkLine("CT-USDT","okx",2*86400000);
listeners["agent-crypto:new-listing-line-ready"]();
assert.match(notice(),/aucune série complète/);
line=mkLine();
line.series[20][0]=line.series[19][0];
listeners["agent-crypto:new-listing-line-ready"]();
assert.match(notice(),/aucune série complète/);
line=mkLine();
candles={external:true,mode:"candles",loadedInstrument:"CT-USDT",loadedBar:"5m",
 loading:false,error:null,rows:Array.from({length:50},(_,i)=>({
 t:Date.now()-60000-(49-i)*300000,c:0.35+i*.0004})),source:"OKX public candles"};
listeners["agent-crypto:market-candles-loaded"]();
assert.match(notice(),/50 points de bougies/);
assert.match(notice(),/OKX public candles/);
candles={...candles,loadedInstrument:"BTC-USDT"};
listeners["agent-crypto:market-candles-loaded"]();
assert.match(notice(),/70 points de la ligne/);
selected={active:false};
listeners["agent-crypto:external-asset-changed"]();
assert.equal(api.snapshot().active,false);
assert.equal(nodes.traderMathExternalGuard.hidden,true);
assert.equal(api.snapshot().instrument,null);
assert(!source.includes("setInterval("));
assert(!source.includes("fetch("));
console.log("Trader Math CT: line, candles, freshness, identity, no BTC mixing, no timer, return to BTC PASS");
