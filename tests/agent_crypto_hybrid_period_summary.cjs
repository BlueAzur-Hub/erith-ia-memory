"use strict";
const assert=require("node:assert/strict"),path=require("node:path"),fs=require("node:fs"),vm=require("node:vm");
const root=path.resolve(__dirname,"../public/agent_crypto_erith_ia");
const code=fs.readFileSync(path.join(root,"administrator/js/graph-line-candle-overlay.js"),"utf8");
const microscope=fs.readFileSync(path.join(root,"administrator/js/market-microscope-candles.js"),"utf8");
new vm.Script(code);
assert.match(microscope,/if\(state\.mode==="candles"\)void load\(\)/,"Hybrid does not request OHLC");
assert.doesNotMatch(microscope,/if\(state\.mode==="hybrid"\).*void load\(/,"Hybrid never asks for market candle feeds");
require(path.join(root,"administrator/js/graph-line-candle-overlay.js"));
const api=globalThis.AgentCryptoLineCandleOverlay;
assert.equal(api.read_only,true);
assert.equal(api.real_order,false);
const DAY=86400000,END=Date.now()-3*3600000;
global.AgentCryptoMarketMicroscope={snapshot:()=>({mode:"hybrid",rows:[],loading:false})};
global.getSelectedCoin=()=>({id:"bitcoin",symbol:"BTC"});
global.AgentCryptoNewListingLiveAsset={snapshot:()=>({active:false})};
let title="BTC · Bitcoin · 24h · PRIX USD · NORMALE";
global.document={
 querySelector:()=>null,
 getElementById:id=>id==="atlasChartInsightOverlayTitle"?{textContent:title}:null
};
const ops=[];
const ctx={save(){},beginPath(){},rect(){},clip(){},restore(){},
 fillRect(x,y,w,h){ops.push({x,y,w,h,color:this.fillStyle});}};
let data=[],labels=[],points=[];
const meta={type:"line",hidden:false,yScale:{getPixelForValue:x=>x},data:[]};
const volumeMeta={type:"bar",hidden:false};
const chart={canvas:{id:"mainChart"},ctx,chartArea:{left:50,right:1050,top:30,bottom:530},
 data:{datasets:[{atlasCoin:{id:"bitcoin",symbol:"BTC"},data:[]},{label:"Volume",data:[1,2,3],type:"bar"}],labels:[]},
 getDatasetMeta:i=>i===0?meta:volumeMeta};
function fixture(period,days,count,segments){
 title="BTC · Bitcoin · "+period+" · PRIX USD · NORMALE";
 const span=days*DAY;
 labels=Array.from({length:count},(_,i)=>new Date(END-span+span*i/(count-1)).toISOString());
 data=Array.from({length:count},(_,i)=>100+(i/count)*5+Math.sin(i/8)*1.7);
 points=data.map((_,i)=>({x:50+1000*i/(count-1)}));
 meta.data=points;chart.data.datasets[0].data=data;chart.data.labels=labels;
 const result=api.variationSummary(chart);
 assert.ok(result.bars,"Cannot build "+period+": "+result.reason);
 assert.equal(result.bars.length,segments,"Wrong bucket count for "+period);
 assert.equal(result.period.label,period);
 assert.ok(result.bars.every(b=>b.samples>=1&&Number.isFinite(b.change)&&(!b.referenceFromPrevious||b.partial)),"Partial calendar bucket uses a genuine preceding sample");
 ops.length=0;
 assert.equal(api.drawVariationSummary(chart,result),segments);
 assert.equal(ops.length,segments,"Only simple variation bars should be painted");
 assert.ok(ops.every(x=>x.y>=chart.chartArea.bottom-170&&x.y+x.h<=chart.chartArea.bottom),
   "Bars anchored to chart bottom");
 assert.ok(ops.every(x=>x.w>1&&x.w<=60));
 assert.ok(ops.every(x=>x.color.includes("rgba(")));
}
fixture("24h",1,289,24);
fixture("7j",7,169,7);
fixture("30j",30,721,30);
fixture("60j",60,361,60);
fixture("90j",90,361,13);
fixture("1a",365,366,12);
fixture("Max",1000,601,12);
assert.equal(api.plugin.beforeDatasetDraw(chart,{index:1}),false,"Volume histogram skipped in Hybrid");
assert.equal(api.plugin.beforeDatasetDraw(chart,{index:0}),undefined,"Primary line kept");
assert.equal(api.variationSummary(chart).bars.length,12,
 "No exchange OHLC required, even with empty microscope state");
const originalSelected=global.getSelectedCoin;
global.getSelectedCoin=()=>({id:"ethereum",symbol:"ETH"});
assert.equal(api.variationSummary(chart).bars,undefined,"Never overlay wrong Market asset");
global.getSelectedCoin=originalSelected;
const originalExternal=global.AgentCryptoNewListingLiveAsset;
global.AgentCryptoNewListingLiveAsset={snapshot:()=>({active:true,id:"external-dna",base:"DNA"})};
global.AtlasExternalChart={state:()=>({active:true,coin_id:"external-dna"})};
global.AgentCryptoNewListingsNativeCategory={snapshot:()=>({selectedId:"external-dna"})};
assert.equal(api.variationSummary(chart).bars,undefined,"Old BTC chart cannot receive DNA summary");
chart.data.datasets[0].atlasCoin={id:"external-dna",symbol:"DNA"};
title="DNA · NeoSoul · 24h · PRIX USD · NORMALE";
assert.equal(api.variationSummary(chart).bars,undefined,"Wrong timespan rejected across market switch");
fixture("24h",1,289,24);
global.AgentCryptoNewListingLiveAsset={snapshot:()=>({active:true,id:"external-dna",base:"DNA"})};
assert.equal(api.variationSummary(chart).coinId,"external-dna","DNA chart uses its own price series");
global.AgentCryptoNewListingLiveAsset=originalExternal;
title="BTC · Bitcoin · 30j · PRIX USD · NORMALE";
assert.equal(api.variationSummary(chart).bars,undefined,"24h series cannot masquerade as 30j");

// Native calendar boundaries: 7 days start at midnight; 90 days at Monday;
// 1 year on the first of each month. No rolling equal-length fake "months".
global.getSelectedCoin=()=>({id:"bitcoin",symbol:"BTC"});
chart.data.datasets[0].atlasCoin={id:"bitcoin",symbol:"BTC"};
fixture("7j",7,169,7);
const seven=api.variationSummary(chart),bounds7=api.summaryBoundaries(seven.period,seven.first,seven.last);
assert.equal(new Date(bounds7[0]).getHours(),0,"7j uses calendar midnight");
assert.equal(new Date(bounds7[0]).getMinutes(),0,"7j bins start on calendar days");
fixture("90j",90,361,13);
const ninety=api.variationSummary(chart),bounds90=api.summaryBoundaries(ninety.period,ninety.first,ninety.last);
assert.equal(new Date(bounds90[0]).getDay(),1,"Weekly groups start Monday");
fixture("1a",365,366,12);
const annual=api.variationSummary(chart),boundsYear=api.summaryBoundaries(annual.period,annual.first,annual.last);
assert.equal(new Date(boundsYear[0]).getDate(),1,"Annual history uses real calendar months");

// Verified exchange base volumes: optional, read only from already loaded data.
// CoinGecko rolling 'total_volumes' must never be summed as if traded buckets.
fixture("24h",1,289,24);
const current=api.variationSummary(chart);
const realOHLC=current.bars.map((b,i)=>({t:b.start,o:100,h:101,l:99,c:100.5,v:100+i*45}));
const snap={loadedInstrument:"BTC-USDC",loadedBar:"1h",source:"OKX candles",rows:realOHLC,loading:false};
const verified=api.observedVolumes(current,snap);
assert.equal(verified.length,24);
assert.equal(verified.filter(x=>x!==null).length,24,"Complete 24h exchange series is eligible");
assert.ok(verified[23]>verified[0],"Distinct real volumes contribute to relative width");
const geometry=api.summaryGeometry(chart,current,verified);
assert.ok(geometry.rects[23].w>geometry.rects[0].w,"Volume widens the observed heavy-trading bar");
assert.ok(geometry.rects.every(x=>x.w>0&&x.w<=60),"Volume cannot cause bar collisions");
const hover=api.summaryHover(current,verified,23);
assert.match(hover.short,/volume exchange/);
assert.match(hover.detail,/Prix début/);
assert.match(hover.detail,/Prix fin/);
assert.match(hover.detail,/Variation/);
assert.match(hover.detail,/Volume observé/);
const unknown=api.observedVolumes(current,{...snap,loadedInstrument:"ETH-USDC"});
assert.ok(unknown.every(x=>x===null),"Cross-asset volume blocked");
assert.equal(api.summaryGeometry(chart,current,unknown).rects[0].w,
  api.summaryGeometry(chart,current,unknown).rects[23].w,"Unknown volume preserves original equal widths");
assert.match(api.summaryHover(current,unknown,0).detail,/volume non vérifié/,"Missing volume is explicitly disclosed");
assert.ok(api.observedVolumes(current,{...snap,loading:true}).every(x=>x===null),"Loading candles ignored");
assert.ok(api.observedVolumes(current,{...snap,loadedBar:"bogus"}).every(x=>x===null),"Cadence unknown is not guessed");
assert.ok(api.observedVolumes(current,{...snap,rows:realOHLC.map(r=>({...r,v:null}))}).every(x=>x===null),
  "Missing volume cannot be interpreted as zero");
assert.ok(api.observedVolumes(current,{...snap,rows:realOHLC.slice(0,3)}).every(x=>x===null),
  "Sparse volume cannot imply comparable market activity");
const savedRef=global.AgentCryptoMarketMicroscope;
global.AgentCryptoMarketMicroscope={snapshot:()=>({mode:"hybrid",...snap})};
const output=api.plugin.beforeDatasetDraw(chart,{index:1});
assert.equal(output,false,"Native volume visually hidden only while summary is valid");
api.plugin.afterDatasetsDraw(chart);
const statusEvent={event:{type:"mousemove",x:geometry.rects[23].x,y:geometry.lane.bodyBottom-3}};
api.plugin.afterEvent(chart,statusEvent); // Tooltip via existing chart status, never a new canvas/panel
api.plugin.afterEvent(chart,{event:{type:"mouseout"}});
global.AgentCryptoMarketMicroscope=savedRef;
// No coin-specific BTC/DNA/CT special case: a different canonical coin renders
// the same price/variation engine and rejects old BTC exchange volume.
for(const [id,symbol] of [["ethereum","ETH"],["cardano","ADA"],["solana","SOL"]]){
 chart.data.datasets[0].atlasCoin={id,symbol};
 global.getSelectedCoin=()=>({id,symbol});
 fixture("24h",1,289,24);
 assert.equal(api.variationSummary(chart).symbol,symbol,"Generic Market asset "+symbol);
 assert.ok(api.observedVolumes(api.variationSummary(chart),snap).every(x=>x===null),
   "Never display BTC volume under "+symbol);
}
global.getSelectedCoin=()=>({id:"bitcoin",symbol:"BTC"});
chart.data.datasets[0].atlasCoin={id:"bitcoin",symbol:"BTC"};

// Firefox screenshot regression: hybrid must not show the native historical
// floatboard over the bar hover, and it must not leave orange "shadow bars"
// bleeding through the simple green/pink baseline summary.
fixture("24h",1,289,24);
const cssProps=new Map();
const suppressedFloatboard={
  hidden:false,ariaHidden:null,
  setAttribute(k,v){if(k==='aria-hidden')this.ariaHidden=v;},
  style:{
    setProperty(k,v,priority=''){cssProps.set(k,{v,priority});},
    getPropertyValue:k=>cssProps.get(k)?.v||'',
    getPropertyPriority:k=>cssProps.get(k)?.priority||'',
    removeProperty:k=>{cssProps.delete(k);}
  }
};
const getNode=global.document.getElementById;
global.document.getElementById=id=>id==='atlasChartTooltip'?suppressedFloatboard:getNode(id);
chart.$atlasVolumeVisible=true;
api.plugin.beforeDraw(chart);
assert.equal(cssProps.get('display')?.v,'none',"Hybrid suppresses asynchronous native tooltip with CSS");
assert.equal(cssProps.get('display')?.priority,'important',"Native tooltip cannot override suppression with hidden=false");
suppressedFloatboard.hidden=false; // Emulate later Chart.js atlasExternalChartTooltip callback.
assert.equal(cssProps.get('display')?.v,'none',"Late historical popup still has display:none");
assert.equal(chart.$atlasVolumeVisible,false,"Hybrid hides the separate curve-following volume shadow");
api.plugin.afterDraw(chart);
assert.equal(chart.$atlasVolumeVisible,true,"Original volume choice is immediately restored after draw");
api.plugin.afterDatasetsDraw(chart);
const g=api.summaryGeometry(chart,api.variationSummary(chart));
const hoveredBar=g.rects[10];
suppressedFloatboard.hidden=false;
api.plugin.afterEvent(chart,{event:{type:"mousemove",x:hoveredBar.x,y:g.lane.bodyBottom-2}});
assert.equal(suppressedFloatboard.hidden,true,"Native historical popup must not cover hovered hybrid bar");
assert.equal(suppressedFloatboard.ariaHidden,"true");
api.plugin.afterEvent(chart,{event:{type:"mouseout"}});
global.AgentCryptoMarketMicroscope={snapshot:()=>({mode:"candles"})};
api.plugin.beforeDraw(chart);
assert.equal(cssProps.has('display'),false,"Changing to Bougies restores native historical tooltip");
assert.equal(chart.$atlasVolumeVisible,true,"Microscope candle view keeps ordinary volume visibility");
api.plugin.afterDraw(chart);
global.AgentCryptoMarketMicroscope=savedRef;
global.document.getElementById=getNode;

console.log("PASS generic all-asset Hybrid: calendar boundaries, hover, genuine optional volume and safe fallback");
console.log("PASS simple native variation bars 24h/7j/30j/60j/90j/1a/Max; no OHLC, no panel, skip volume, asset and period guards");