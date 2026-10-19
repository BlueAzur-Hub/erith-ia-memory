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

test("Top1000 fiche uses existing Administrator native Market after exact identity warmup",async()=>{
 const native=require("./market-radar-native.js");
 const old={universe:globalThis.AtlasMarketUniverse1000,fiche:globalThis.AtlasExtendedNativeFiche,document:globalThis.document};
 try{
  let warmed=false,loads=0,events=0;
  const item={id:"siren",name:"Siren",symbol:"SIREN",rank:619};
  const universe={ensure:async limit=>{assert.equal(limit,1000);loads++;warmed=true;},
   find:id=>warmed&&id===item.id?item:null};
  globalThis.AtlasMarketUniverse1000=universe;
  globalThis.AtlasExtendedNativeFiche={resolver:id=>universe.find(id)};
  const layer={dataset:{},hidden:false};
  globalThis.document={getElementById:id=>id==="atlasHelpLayer"?layer:null};
  const button={dataset:{},disabled:false,setAttribute:()=>{},
   dispatchEvent:event=>{assert.equal(event.type,"focusin");events++;
    layer.dataset.marketHelpCoinId=button.dataset.marketHelpId;return true;}};
  const status={textContent:""},root={querySelector:()=>status};
  assert.equal(await native.openOpportunityFiche(root,button,item),true);
  assert.equal(loads,1);assert.equal(events,1);assert.equal(button.dataset.marketHelpId,item.id);
  assert.match(status.textContent,/fiche Market native ouverte/);
  assert.equal(await native.openOpportunityFiche(root,button,item),true);
  assert.equal(loads,1);
 }finally{
  globalThis.AtlasMarketUniverse1000=old.universe;
  globalThis.AtlasExtendedNativeFiche=old.fiche;
  globalThis.document=old.document;
 }
});
test("Top1000 Fiche accepts a changed rank when ID and symbol match",async()=>{
 const native=require("./market-radar-native.js");
 const old={universe:globalThis.AtlasMarketUniverse1000,
  fiche:globalThis.AtlasExtendedNativeFiche,document:globalThis.document};
 try{
  const item={id:"siren",name:"Siren",symbol:"SIREN",rank:619};
  const latest={...item,rank:624};
  globalThis.AtlasMarketUniverse1000={find:()=>latest};
  globalThis.AtlasExtendedNativeFiche={resolver:()=>latest};
  const layer={dataset:{},hidden:false},status={textContent:""};
  globalThis.document={getElementById:id=>id==="atlasHelpLayer"?layer:null};
  let focuses=0,manualEvents=0;
  const button={dataset:{},disabled:false,textContent:"Fiche",
   setAttribute:()=>{},removeAttribute:()=>{},
   focus(options){focuses++;assert.equal(options.preventScroll,true);
    assert.equal(button.disabled,false);
    assert.equal(button.dataset.marketHelpId,item.id);
    layer.dataset.marketHelpCoinId=item.id;},
   dispatchEvent(){manualEvents++;return true;}};
  assert.equal(await native.openOpportunityFiche({querySelector:()=>status},button,item),true);
  assert.equal(focuses,1);
  assert.equal(manualEvents,0,"native focusin works without duplicate synthetic event");
  assert.match(status.textContent,/rang actualisé 624/);
  assert.equal(button.textContent,"Fiche ✓");
  assert.equal(button.dataset.radarFicheBusy,undefined);
 }finally{
  globalThis.AtlasMarketUniverse1000=old.universe;
  globalThis.AtlasExtendedNativeFiche=old.fiche;
  globalThis.document=old.document;
 }
});
test("Top1000 Fiche remains focusable during async loading and ignores double clicks",async()=>{
 const native=require("./market-radar-native.js");
 const old={universe:globalThis.AtlasMarketUniverse1000,
  fiche:globalThis.AtlasExtendedNativeFiche,document:globalThis.document};
 try{
  const item={id:"siren",name:"Siren",symbol:"SIREN",rank:619};
  let finish,loads=0;
  const pending=new Promise(resolve=>finish=resolve);
  let ready=false;
  globalThis.AtlasMarketUniverse1000={
   ensure:async()=>{loads++;await pending;ready=true;},
   find:()=>ready?item:null};
  globalThis.AtlasExtendedNativeFiche={resolver:id=>ready&&id===item.id?item:null};
  const layer={dataset:{},hidden:false};
  globalThis.document={getElementById:id=>id==="atlasHelpLayer"?layer:null};
  let events=0;
  const button={dataset:{},disabled:false,attributes:{},
   setAttribute(k,v){this.attributes[k]=v;},
   removeAttribute(k){delete this.attributes[k];},
   dispatchEvent(event){
    assert.equal(event.type,"focusin");
    assert.equal(button.disabled,false);
    layer.dataset.marketHelpCoinId=button.dataset.marketHelpId;
    events++;return true;
   }};
  const root={querySelector:()=>({textContent:""})};
  const first=native.openOpportunityFiche(root,button,item);
  assert.equal(button.disabled,false,"focus must be possible even while loading");
  assert.equal(button.attributes["aria-busy"],"true");
  assert.equal(await native.openOpportunityFiche(root,button,item),false);
  assert.equal(loads,1);
  finish();
  assert.equal(await first,true);
  assert.equal(events,1);
  assert.equal(button.attributes["aria-busy"],undefined);
  assert.equal(button.dataset.radarFicheBusy,undefined);
 }finally{
  globalThis.AtlasMarketUniverse1000=old.universe;
  globalThis.AtlasExtendedNativeFiche=old.fiche;
  globalThis.document=old.document;
 }
});
test("Top1000 Fiche dock gives a visible button-location hint without scrolling",async()=>{
 const native=require("./market-radar-native.js");
 const old={universe:globalThis.AtlasMarketUniverse1000,
  fiche:globalThis.AtlasExtendedNativeFiche,document:globalThis.document};
 try{
  const item={id:"siren",name:"Siren",symbol:"SIREN",rank:619};
  globalThis.AtlasMarketUniverse1000={find:()=>item};
  globalThis.AtlasExtendedNativeFiche={resolver:()=>item};
  const layer={dataset:{},hidden:true};
  const dock={dataset:{},hidden:false};
  globalThis.document={getElementById:id=>id==="atlasHelpLayer"?layer:
   id==="atlasMarketCardDockHost"?dock:null};
  let clickFocus=0;
  const button={dataset:{},disabled:false,
   setAttribute:()=>{},removeAttribute:()=>{},
   dispatchEvent(){clickFocus++;dock.dataset.marketHelpCoinId=item.id;return true;}};
  const status={textContent:""};
  const result=await native.openOpportunityFiche({querySelector:()=>status},button,item);
  assert.equal(result,true);
  assert.equal(clickFocus,1);
  assert.equal(button.textContent,"Market ↑");
  assert.match(button.title,/plus haut sur la page/);
  assert.match(status.textContent,/fiche latérale dans Market/);
 }finally{
  globalThis.AtlasMarketUniverse1000=old.universe;
  globalThis.AtlasExtendedNativeFiche=old.fiche;
  globalThis.document=old.document;
 }
});
test("Top1000 Fiche refuses a stale item after Radar re-render while loading",async()=>{
 const native=require("./market-radar-native.js");
 const old={universe:globalThis.AtlasMarketUniverse1000,
  fiche:globalThis.AtlasExtendedNativeFiche,document:globalThis.document};
 try{
  const item={id:"siren",symbol:"SIREN",rank:619};
  let finish;
  const pending=new Promise(resolve=>finish=resolve);
  globalThis.AtlasMarketUniverse1000={ensure:async()=>pending,find:()=>null};
  globalThis.AtlasExtendedNativeFiche={resolver:()=>null};
  globalThis.document={getElementById:()=>null};
  const button={dataset:{},isConnected:true,disabled:false,
   setAttribute:()=>{},removeAttribute:()=>{},dispatchEvent:()=>{throw Error("Must not open");}};
  const status={textContent:""};
  const promise=native.openOpportunityFiche({querySelector:()=>status},button,item);
  button.isConnected=false;
  finish();
  assert.equal(await promise,false);
  assert.match(status.textContent,/liste actualisée/);
 }finally{
  globalThis.AtlasMarketUniverse1000=old.universe;
  globalThis.AtlasExtendedNativeFiche=old.fiche;
  globalThis.document=old.document;
 }
});
test("Top1000 Fiche refuses an inaccurate or missing identity",async()=>{
 const native=require("./market-radar-native.js");
 const old={universe:globalThis.AtlasMarketUniverse1000,fiche:globalThis.AtlasExtendedNativeFiche,document:globalThis.document};
 try{
  globalThis.AtlasMarketUniverse1000={ensure:async()=>{},find:()=>({id:"bitcoin",name:"Bitcoin",symbol:"BTC",rank:1})};
  globalThis.AtlasExtendedNativeFiche={resolver:id=>globalThis.AtlasMarketUniverse1000.find(id)};
  let opened=0;
  const button={dataset:{},disabled:false,setAttribute:()=>{},dispatchEvent:()=>{opened++;}};
  const status={textContent:""},root={querySelector:()=>status};
  assert.equal(await native.openOpportunityFiche(root,button,{id:"siren",symbol:"SIREN",rank:619}),false);
  assert.equal(opened,0);assert.equal(button.disabled,false);
  assert.equal(button.dataset.marketHelpId,undefined);
  assert.match(status.textContent,/identité non confirmée/);
 }finally{
  globalThis.AtlasMarketUniverse1000=old.universe;
  globalThis.AtlasExtendedNativeFiche=old.fiche;
  globalThis.document=old.document;
 }
});


test("Radar Trader integrates the real immutable dynamic journal by exact CoinGecko ID",()=>{
 const native=require("./market-radar-native.js");
 const report=JSON.parse(fs.readFileSync(path.resolve(__dirname,"../../data/crypto/radar-opportunities/dynamic-followups.json"),"utf8"));
 const h=native.verifiedDynamicFollowups(report);
 assert.equal(h.count,report.observations.length);
 assert.equal(h.measured_1d,report.observations.filter(x=>x.followup_1d.status==="OBSERVED_DAILY_SNAPSHOT").length);
 assert.equal(h.measured_7d,report.observations.filter(x=>x.followup_7d.status==="OBSERVED_DAILY_SNAPSHOT").length);
 const icnt=native.dynamicCandidateHistory(h,"impossible-cloud-network-token");
 assert.equal(icnt.length,report.observations.filter(x=>x.id==="impossible-cloud-network-token").length);
 const oldest=icnt.at(-1);
 assert(oldest.followup_1d.status==="OBSERVED_DAILY_SNAPSHOT");
 assert(native.describeDynamicPoint(oldest.followup_1d).includes(String(oldest.followup_1d.change_pct)));
 const q=native.dynamicCandidateHistory(h,"quack-ai");
 assert.equal(q[0].followup_1d.status,report.observations.find(x=>
   x.id==="quack-ai"&&x.first_seen_date_utc===q[0].first_seen_date_utc).followup_1d.status);
 assert.deepEqual(native.dynamicCandidateHistory(h,"other-quack-ai"),[]);
});
test("Trader refuses fake outcomes and malformed future dates without corrupting Radar",()=>{
 const native=require("./market-radar-native.js");
 const archive=JSON.parse(fs.readFileSync(path.resolve(__dirname,"../../data/crypto/radar-opportunities/dynamic-followups.json"),"utf8"));
 const bogus=structuredClone(archive);
 bogus.observations[0].followup_7d.change_pct=400;
 assert.throws(()=>native.verifiedDynamicFollowups(bogus),/fictive/);
 const wrong=structuredClone(archive);
 wrong.observations[0].followup_1d.target_date_utc="2020-01-01";
 assert.throws(()=>native.verifiedDynamicFollowups(wrong),/incohérent/);
 const collision=structuredClone(archive);
 collision.observations.push(collision.observations[0]);
 assert.throws(()=>native.verifiedDynamicFollowups(collision),/dupliquée/);
});

test("Trader Q / ICNT / FLUID trajectory synthesis does not invent PAPER eligibility",()=>{
 const native=require("./market-radar-native.js"),archive=JSON.parse(fs.readFileSync(path.resolve(__dirname,"../../data/crypto/radar-opportunities/dynamic-followups.json"),"utf8"));
 const history=native.verifiedDynamicFollowups(archive);
 const q=native.trajectoryEvidence(history,"quack-ai");
 const icnt=native.trajectoryEvidence(history,"impossible-cloud-network-token");
 const fluid=native.trajectoryEvidence(history,"instadapp");
 for(const [id,item] of [["quack-ai",q],["impossible-cloud-network-token",icnt],["instadapp",fluid]]){
   const source=native.dynamicCandidateHistory(history,id);
   const measured1=source.filter(x=>x.followup_1d.status==="OBSERVED_DAILY_SNAPSHOT");
   const measured7=source.filter(x=>x.followup_7d.status==="OBSERVED_DAILY_SNAPSHOT");
   assert.equal(item.selectionCount,source.length);
   assert.equal(item.count1,measured1.length);assert.equal(item.count7,measured7.length);
   assert.equal(item.status,measured7.length?"SUIVI J+7 MESURÉ":measured1.length?"J+1 MESURÉ":"SUIVI EN ATTENTE");
   if(item.lastMeasured){
     assert(item.lastMeasured.point.at_utc);
     assert.match(native.trajectoryVolumeReadout(item.lastMeasured.initial,item.lastMeasured.point),/rang|non comparable/);
   }
 }
 for(const item of [q,icnt,fluid])assert.equal(item.paperCertified,false);
});
test("Trader trajectory rendering stays in the existing Radar with exactly three read-only rows",()=>{
 const native=require("./market-radar-native.js"),data=JSON.parse(fs.readFileSync(path.resolve(__dirname,"../../data/crypto/radar-opportunities/dynamic-followups.json"),"utf8"));
 const oldDoc=globalThis.document;globalThis.document={createElement:tag=>new Element(tag)};
 try{
  const rows=new Element("div"),note=new Element("p");
  const root={querySelector(sel){if(sel==='[data-radar-native="trajectoryRows"]')return rows;
    if(sel==='[data-radar-native="trajectoryNote"]')return note;return null;}};
  native.printTrajectories(root,{dynamicFollowups:native.verifiedDynamicFollowups(data)});
  assert.equal(rows.children.length,3);
  assert.equal(rows.children[0].dataset.radarTrajectoryId,"quack-ai");
  const history=native.verifiedDynamicFollowups(data);
 for(const [i,id] of ["quack-ai","impossible-cloud-network-token","instadapp"].entries()){
   const evidence=native.trajectoryEvidence(history,id);
   const measure=rows.children[i].children[1].textContent;
   if(evidence.lastMeasured){
     assert(measure.replace(",",".").includes(String(evidence.lastMeasured.point.change_pct)));
     assert(rows.children[i].children[2].textContent.includes(
       "Détection "+evidence.lastMeasured.initial.first_seen_date_utc));
   }else assert.match(measure,/Pas de J/);
 }
 assert(note.textContent.includes(data.source_archive_dates.at(-1)));
  assert.equal(rows.children.every(r=>r.children.every(c=>c.tagName!=="BUTTON")),true);
 }finally{globalThis.document=oldDoc;}
});

test("Trader native Radar validates the public Spot USDT report without inventing a gain",()=>{
 const native=require("./market-radar-native.js");
 const mk=(id,pair,n)=>({
   coin_id:id,pair,quote:"USDT",venue:"Bitget",orders_enabled:false,
   paper_strategy_validated:false,identity_market_pair_certified:false,
   status:n?"OBSERVATIONS_INSUFFICIENT":"NO_PROSPECTIVE_OBSERVATIONS",
   observation_count:n,market_price_usdt:n?0.17:null,
   last_20h_closed_candle_change_pct:n?-17.05882:null,
   last_spread_bps:n?5.89:null,
   last_observed_at_utc:n?"2026-10-17T23:53:55Z":null,
   source_sha256:n?"a".repeat(64):null,
   distinct_closed_hours:n?1:0,
   span_between_closed_hours:n?0:null,
   change_between_observed_closes_pct:null,
   ready_for_window_research:false
 });
 const template={schema:"erith.radar.priority-spot-comparison.v1",quote:"USDT",
  orders_enabled:false,paper_trades_executed:false,strategy_validated:false,
  identity_market_pair_certified:false,source_as_of_utc:"2026-10-17T23:53:55Z",
  markets:[mk("quack-ai","QUSDT",1),mk("impossible-cloud-network-token","ICNTUSDT",1),mk("instadapp","FLUID-USDT",0)]};
 const result=native.verifyProspectiveSpotComparison(template);
 assert.equal(result.byId.size,3);
 const icnt=native.spotComparisonLine(result.byId.get("impossible-cloud-network-token"));
 assert.match(icnt,/USDT/);
 assert.match(icnt,/20 bougies horaires/);
 assert.match(icnt,/variation entre relevés encore inconnue/);
 assert.match(native.spotComparisonLine(result.byId.get("instadapp")),/collecte future en attente/);
 const bad=JSON.parse(JSON.stringify(template));bad.markets[0].quote="USD";
 assert.throws(()=>native.verifyProspectiveSpotComparison(bad),/marché/);
 const fake=JSON.parse(JSON.stringify(template));fake.markets[1].change_between_observed_closes_pct=125;
 assert.throws(()=>native.verifyProspectiveSpotComparison(fake),/rendement inventé/);
 const duplicate=JSON.parse(JSON.stringify(template));duplicate.markets[2].coin_id="quack-ai";
 assert.throws(()=>native.verifyProspectiveSpotComparison(duplicate),/marché/);
});
