"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
class Element{
 constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};
  this.className="";this.textContent="";this.attributes={};this.events={};
  this.classList={add:(name)=>{this.className+=" "+name;}};}
 append(...nodes){this.children.push(...nodes);}
 appendChild(node){this.children.push(node);return node;}
 replaceChildren(...nodes){this.children=[...nodes];}
 setAttribute(name,value){this.attributes[name]=value;}
 addEventListener(name,fn){(this.events[name]??=[]).push(fn);}
}
test("Radar uses 7 native Market columns with verified identity, USD source, cap and existing fiche",()=>{
 const oldDoc=globalThis.document,oldReader=globalThis.AgentCryptoRadarReader,oldFiche=globalThis.AgentCryptoTraderNativeFiche,oldNative=globalThis.AgentCryptoRadarNative;
 try{
  globalThis.document={createElement:tag=>new Element(tag)};
  delete globalThis.AgentCryptoRadarNative;
  const filename=path.join(__dirname,"market-radar-native.js");
  delete require.cache[require.resolve(filename)];
  const {printMarket}=require(filename);
  const asset={id:"bitcoin",name:"Bitcoin",symbol:"BTC",rank:1,
   image:"https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
   priceUsd:81000.75,change24h:2.5,change7d:-1.25,
   marketCapUsd:1600000000000,volume24hUsd:12000000000};
  globalThis.AgentCryptoRadarReader={
   selectMarket:(rows,tier)=>{assert.equal(tier,10);return rows;},
   observeMarket:()=>({label:"Hausse 24 h",tone:"up",detail:"Variation constatée ; aucun ordre"})
  };
  let legacyFicheCalls=0;
  globalThis.AgentCryptoTraderNativeFiche={showAsset:()=>{legacyFicheCalls++;return true;},hide:()=>{}};
  const body=new Element("tbody"),note=new Element("p");
  const root={querySelector:selector=>{
    if(selector==='[data-radar-native="rows"]')return body;
    if(selector==='[data-radar-native="filter"]')return {value:""};
    if(selector==='[data-radar-native="sort"]')return {value:"rank"};
    if(selector==='[data-radar-native="marketNote"]')return note;
    throw new Error("Unexpected selector: "+selector);
  }};
  const group={querySelectorAll:()=>[]};
  printMarket(root,{market:{rows:[asset],at:"2026-10-16T14:30:00Z"},group,tier:10});
  assert.equal(body.children.length,1);
  const row=body.children[0];
  assert.equal(row.children.length,7);
  assert.equal(row.dataset.radarSymbol,"BTC");
  assert.equal(row.dataset.radarKind,"market");
  const identity=row.children[1].children[0];
  assert.equal(identity.className,"coin-cell radar-native-identity");
  assert.equal(identity.children[1].src,asset.image);
  const nameSymbolCategory=identity.children[2];
  assert.equal(nameSymbolCategory.children[0].textContent,"Bitcoin");
  assert.equal(nameSymbolCategory.children[1].textContent,"BTC");
  assert.equal(nameSymbolCategory.children[2].textContent,"Repère marché");
  const price=row.children[2].children;
  assert.match(price[0].textContent,/81.?000,75/);
  assert.match(price[1].textContent,/USD · CoinGecko/);
  assert.match(price[1].textContent,/16\/10\/2026/);
  const volume=row.children[5].children;
  assert.match(volume[0].textContent,/Md/);
  assert.match(volume[1].textContent,/Cap\. /);
  const reading=row.children[6].children;
  assert.equal(reading[0].textContent,"Hausse 24 h");
  assert.match(reading[1].textContent,/Fiche au survol · Solo au clic/);
  assert.equal(note.textContent.includes("CoinGecko"),true);
  assert.equal(row.attributes.role,"button");
  assert.equal(row.dataset.marketHelpId,"bitcoin");
  assert.equal(row.events.pointerenter,undefined);
  assert.equal(row.events.focus,undefined);
  assert.equal(legacyFicheCalls,0);
 }finally{
  globalThis.document=oldDoc;globalThis.AgentCryptoRadarReader=oldReader;
  globalThis.AgentCryptoTraderNativeFiche=oldFiche;
  globalThis.AgentCryptoRadarNative=oldNative;
 }
});
test("Radar Market fidelity does not introduce a second graph, iframe, OKX or trading route",()=>{
 const js=fs.readFileSync(path.join(__dirname,"market-radar-native.js"),"utf8");
 const css=fs.readFileSync(path.join(__dirname,"../market-radar-native.css"),"utf8");
 assert.match(js,/AgentCryptoTraderNativeFiche\?\.showAsset/);
 assert.match(js,/row\.dataset\.marketHelpId=identity\.id/);
 assert.match(js,/marketFiche=identity\.kind==="market"/);
 const marketCore=fs.readFileSync(path.join(__dirname,"../app.js"),"utf8");
 assert.match(marketCore,/function atlasHelpTargetFromNode/);
 assert.match(marketCore,/function atlasMarketHelpDefinition/);
 assert.match(marketCore,/function atlasShowHelpLayer/);
 assert.match(marketCore,/function scoreCoin\(/);
 assert.match(js,/AgentCryptoCommands/);
 assert.match(js,/new URL\("..\/laboratoire\/radar.html"/);
 for(const forbidden of ["createElement(\"iframe\")","api/v5/trade/order","localStorage.setItem","submitOrder(","withdrawal"])
  assert.equal(js.includes(forbidden),false,forbidden);
 assert.match(css,/:is\(#marketSnapshotPanel, #atlasRadarBelowMarket\) \.radar-native-market-row/);
 assert.equal(css.includes("#marketRows tr"),false);
});

test("Radar preserves the exact Bitget instrument for DNA Spot",()=>{
 const {verifyBitget}=require("../../laboratoire/radar.js");
 const now=Date.parse("2026-10-16T18:00:00Z");
 const instruments={code:"00000",data:[{symbol:"DNAUSDT",baseCoin:"DNA",quoteCoin:"USDT",
   launchTime:String(now-3600000),status:"online",symbolType:"crypto",isRwa:"NO"}]};
 const tickers={code:"00000",data:[{symbol:"DNAUSDT",lastPrice:"0.2879",turnover24h:"150000",price24hPcnt:"0.03"}]};
 const [dna]=verifyBitget(instruments,tickers,new Map(),now);
 assert.equal(dna.symbol,"DNA");
 assert.equal(dna.providerSymbol,"DNAUSDT");
 assert.equal(dna.pair,"DNA/USDT");
 assert.equal(dna.provider,"bitget");
});
test("Radar requires the matching canonical chart before announcing Solo success",async()=>{
 const native=require("./market-radar-native.js");
 const previous={
  category:globalThis.AgentCryptoNewListingsNativeCategory,
  chart:globalThis.AtlasExternalChart,
  clear:globalThis.atlasTraderExternalSelectionClear
 };
 try{
  let selectedInput=null,graphId="bitcoin";
  globalThis.AgentCryptoNewListingsNativeCategory={
   selectById:async id=>{selectedInput=id;return true;},
   snapshot:()=>({selectedId:"neosoul"})
  };
  globalThis.AtlasExternalChart={state:()=>({coin_id:graphId})};
  globalThis.atlasTraderExternalSelectionClear=()=>false;
  const status={textContent:""},root={querySelector:()=>status,querySelectorAll:()=>[]};
  const model={selectionRevision:0,activeIdentity:{kind:"market",id:"bitcoin"}};
  assert.equal(await native.selectGraph(root,model,{kind:"listing",id:"DNAUSDT",symbol:"DNA"}),false);
  assert.equal(selectedInput,"DNAUSDT");
  assert.match(status.textContent,/non confirmé/);
  assert.deepEqual(model.activeIdentity,{kind:"market",id:"bitcoin"});
  graphId="neosoul";
  assert.equal(await native.selectGraph(root,model,{kind:"listing",id:"DNAUSDT",symbol:"DNA"}),true);
  assert.deepEqual(model.activeIdentity,{kind:"listing",id:"DNAUSDT"});
 }finally{
  globalThis.AgentCryptoNewListingsNativeCategory=previous.category;
  globalThis.AtlasExternalChart=previous.chart;
  globalThis.atlasTraderExternalSelectionClear=previous.clear;
 }
});

test("Radar studies follow Market/Math grid; the original native Market stays in place",()=>{
 const native=fs.readFileSync(path.join(__dirname,"market-radar-native.js"),"utf8");
 const category=fs.readFileSync(path.join(__dirname,"new-listings-native-category.js"),"utf8");
 const stylesheet=fs.readFileSync(path.join(__dirname,"../market-radar-native.css"),"utf8");
 const html=fs.readFileSync(path.join(__dirname,"../index.html"),"utf8");
 assert.match(html,/id="marketWorkspaceGrid"/);
 assert.match(html,/id="math"/);
 assert.match(native,/workspace\.insertAdjacentElement\("afterend",shelf\)/);
 for(const element of ["bottom","opportunities","foot"])
  assert.ok(native.includes("supplementary.append("+element+")"));
 assert.match(native,/root\.radarBelowMarket\?\.querySelector/);
 assert.match(category,/supplementary\.hidden=!visible/);
 assert.match(stylesheet,/#atlasRadarBelowMarket\[hidden\]\{display:none!important\}/);
 assert.match(stylesheet,/#atlasRadarBelowMarket \.radar-native-bottom/);
});
