"use strict";
/* Small read-only regression: a manual BTC/Q history must never borrow CT
   from a resident external chart. Native USDT must not be presented as EUR. */
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"../public/agent_crypto_erith_ia/trader/trader-historical-panel.js"),"utf8");

const el=()=>({textContent:"",hidden:false,replaceChildren(){this.children=[];},
  append(...parts){this.children??=[];this.children.push(...parts);},
  appendChild(part){this.children??=[];this.children.push(part);}});
const status=el(),detail=el(),meta=el(),priceHeading=el(),title=el(),nativeStatus=el(),body=el(),rows=el();
const native=el();
const innerNative={"[data-native-status]":nativeStatus,"[data-native-title]":title,
  "[data-native-price-heading]":priceHeading,"[data-native-rows]":body};
native.querySelector=selector=>innerNative[selector]||null;
const asset=el();asset.value="bitcoin";
const period=el();period.value="24h";
const r9=el(),controls=el(),scroll=el();
const panel=el();panel.open=true;
const nodes={"[data-history-asset]":asset,"[data-history-period]":period,
  "[data-history-r9]":r9,"[data-history-controls]":controls,
  "[data-history-r9] .history-scroll":scroll,"[data-history-native]":native,
  "[data-history-rows]":rows,"[data-history-meta]":meta,
  "[data-native-price-heading]":priceHeading,
  "[data-history-status]":status,"[data-history-detail]":detail};
panel.querySelector=selector=>nodes[selector]||null;
const document={readyState:"loading",addEventListener(){},
  getElementById:id=>id==="traderVerifiedHistory"?panel:null,
  createElement:()=>el()};
const ext={active:true,id:"concrete",symbol:"CT",base:"CT",quote:"USDT",
  instrument:"CT-USDT",provider:"OKX"};
const micro={external:true,loading:false,loadedInstrument:"CT-USDT",
  source:"OKX CT-USDT public candles",loadedBar:"5m",lastLoadedAt:1792015200000,
  rows:[
    {t:1792014900000,o:0.38,h:0.40,l:0.37,c:0.39,v:120},
    {t:1792015200000,o:0.39,h:0.41,l:0.38,c:0.40,v:180}
  ]};
let market={id:"bitcoin",symbol:"BTC"};
const context={document,Date,console,
  AgentCryptoQuoteCurrencyArchitecture:{snapshot:()=>({displayCurrency:"EUR"})},
  AgentCryptoNewListingLiveAsset:{snapshot:()=>ext},
  AgentCryptoMarketMicroscope:{snapshot:()=>micro},
  getSelectedCoin:()=>market,
  addEventListener(){}};context.globalThis=context;
vm.runInNewContext(source,context,{filename:"trader-historical-panel.js"});
const api=context.AgentCryptoTraderHistoricalPanel;
assert.equal(api.read_only,true);
(async()=>{
  // The old bug rendered the CT graph under a manually selected BTC.
  await api.refresh();
  assert.equal(native.hidden,true,"BTC cannot borrow a CT/USDT external graph");
  assert.equal(body.children.length,0);
  assert.match(status.textContent,/^BTC · EUR · EN ATTENTE/);
  asset.value="quack-ai";
  await api.refresh();
  assert.equal(native.hidden,true,"Q cannot borrow a CT/USDT graph");
  // When CT is explicitly chosen, its *native* quote must be disclosed.
  asset.value="concrete";
  await api.refresh();
  assert.equal(native.hidden,false,"manual CT may inspect the live CT chart as an external observation");
  assert.equal(body.children.length,2);
  assert.equal(priceHeading.textContent,"Prix USDT");
  assert.match(status.textContent,/^CT · USDT · HISTORIQUE NATIF$/);
  assert.match(detail.textContent,/EUR demandé/);
  assert.match(detail.textContent,/sans conversion/);
  // Automatic history follows the visible CT/USDT identity even when the
  // canonical Market keeps BTC as its return subprofile. Manual BTC/Q above
  // still cannot borrow CT's prices.
  asset.value="auto";
  await api.refresh();
  assert.equal(native.hidden,false,"auto history must follow visible external CT");
  assert.match(status.textContent,/^CT · graphique externe consulté · POINTS DISPONIBLES$/);
  assert.equal(body.children.length,2);
  market=null;
  await api.refresh();
  assert.equal(native.hidden,false);
  assert.match(status.textContent,/^CT · graphique externe consulté · POINTS DISPONIBLES$/);
  assert.match(detail.textContent,/choix d'archive « 5 min » ne découpe pas les bougies externes/);
  assert.match(nativeStatus.textContent,/clôtures natives 5m/);
  // The R9 selector can request another period without silently resampling CT.
  period.value="7d";
  await api.refresh();
  assert.match(detail.textContent,/choix d'archive « 1 h » ne découpe pas les bougies externes/);
  assert.equal(body.children.length,2);
  // A later loading request for a different instrument must invalidate the CT view.
  micro.loadedInstrument="BTC-USDT";
  await api.refresh();
  assert.equal(native.hidden,true,"stale instrument cannot leak into historical panel");
  console.log("Trader historical identity and native quote: 6/6 PASS");
})().catch(err=>{console.error(err);process.exitCode=1;});
