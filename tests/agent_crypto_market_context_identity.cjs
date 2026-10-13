"use strict";
/* Market/CT identity and currency truth: real code execution, no network or orders. */
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const assert=require("node:assert/strict");
const root=path.resolve(__dirname,"../public/agent_crypto_erith_ia/administrator/js");
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
const candles=read("market-microscope-candles.js");
assert.match(candles,/requireCandleContext\(ext,pack\)/,"External fetch must verify returned pair");
assert.match(candles,/requireCandleContext\(resolution,pack\)/,"Resolver fetch must verify returned pair");
assert.match(candles,/sameExternalContext\(ext,externalContext\(\)\)/,"Late response must not replace current external selection");
assert.match(candles,/MARKET_CANDLES_CONTEXT_CHANGED/,"Cross-context failure must be explicit");

require(path.join(root,"okx-market-pair-resolver.js"));
require(path.join(root,"quote-currency-architecture-406497.js"));
require(path.join(root,"market-instrument-resolver.js"));
require(path.join(root,"market-microscope-candles.js"));
const candTest=globalThis.AgentCryptoMarketMicroscope.self_test();
assert.equal(candTest.pass,true,JSON.stringify(candTest.checks));
assert.equal(candTest.checks.candle_context_guard,true,"Wrong BTC, quote or venue must fail closed");
assert.equal(globalThis.AgentCryptoQuoteCurrencyArchitecture.self_test().checks.external_market_context_separate,true);

const elements=new Map();
const listeners=new Map();
const host={appendChild(node){elements.set(node.id,node);}};
let external={active:false};
const document={
  readyState:"loading",
  head:{appendChild(node){elements.set(node.id,node);}},
  querySelector(selector){return selector.includes("#analyste")?host:null;},
  getElementById(id){return elements.get(id)||null;},
  createElement(){return {id:"",style:{},dataset:{},innerHTML:"",title:"",
    setAttribute(){},querySelectorAll(){return []}};},
  addEventListener(name,fn){listeners.set("document:"+name,fn);}
};
const window={addEventListener(name,fn){listeners.set(name,fn);},dispatchEvent(){}};
const sandbox={document,window,console,CustomEvent:class CustomEvent{}};
sandbox.globalThis=sandbox;
sandbox.AgentCryptoNewListingLiveAsset={snapshot:()=>external};
vm.runInNewContext(read("quote-currency-architecture-406497.js"),sandbox);
const quote=sandbox.AgentCryptoQuoteCurrencyArchitecture;
quote.setDisplayCurrency("USD");
quote.setExecutionTruth({available:true,instrument:"BTC-USDC",settlementAsset:"USDC",provider:"okx"},{emit:false});
const badge=elements.get("atlasQuoteCurrencyArchitecture");
assert.ok(badge,"Currency display must render");
assert.match(badge.innerHTML,/SOURCE MARCHÉ BTC-USDC/);
assert.equal(badge.dataset.contextOwner,"market");
external={active:true,id:"concrete",provider:"okx",instrument:"CT-USDT",quote:"USDT"};
listeners.get("agent-crypto:external-asset-changed")();
assert.match(badge.innerHTML,/AFFICHAGE USD/);
assert.match(badge.innerHTML,/PAIRE EXTERNE CT-USDT/);
assert.match(badge.innerHTML,/COTATION USDT/);
assert.doesNotMatch(badge.innerHTML,/BTC-USDC|EXEC BTC/);
assert.equal(badge.dataset.contextOwner,"external");
assert.equal(badge.dataset.visibleInstrument,"CT-USDT");
assert.equal(badge.dataset.visibleQuote,"USDT");
assert.equal(quote.snapshot().executionInstrument,"BTC-USDC","Hidden Market state must remain untouched");
external={active:true,id:"concrete",provider:"okx",instrument:"CT-USDC",quote:"USDT"};
listeners.get("agent-crypto:external-asset-changed")();
assert.match(badge.innerHTML,/PAIRE EXTERNE NON VALIDÉE/,"Malformed external pair must fail closed");
assert.doesNotMatch(badge.innerHTML,/BTC-USDC/);
external={active:false};
listeners.get("agent-crypto:external-asset-changed")();
assert.match(badge.innerHTML,/SOURCE MARCHÉ BTC-USDC/,"Explicit return to Market restores context");
console.log("PASS CT/BTC candle provider-quote guard, external change race, USD != USDT, market return");
