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
function fixture(period,days,count,segments,expectedLabel=period){
 title="BTC · Bitcoin · "+period+" · PRIX USD · NORMALE";
 const span=days*DAY;
 labels=Array.from({length:count},(_,i)=>new Date(END-span+span*i/(count-1)).toISOString());
 data=Array.from({length:count},(_,i)=>100+(i/count)*5+Math.sin(i/8)*1.7);
 points=data.map((_,i)=>({x:50+1000*i/(count-1)}));
 meta.data=points;chart.data.datasets[0].data=data;chart.data.labels=labels;
 const result=api.variationSummary(chart);
 assert.ok(result.bars,"Cannot build "+period+": "+result.reason);
 assert.equal(result.bars.length,segments,"Wrong bucket count for "+period);
 assert.equal(result.period.label,expectedLabel);
 assert.ok(result.bars.every(b=>b.samples>=2&&Number.isFinite(b.change)));
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
fixture("1 an",365,366,12,"1a");
assert.equal(api.periodConfig().bar,"1j","Visible 1 an title must map to daily cadence");
fixture("Max",1000,601,12);
// A 10% move exactly between adjacent buckets must never disappear.
fixture("24h",1,289,24);
chart.data.datasets[0].data=chart.data.datasets[0].data.map((_,i)=>i<12?100:110);
const crossed=api.variationSummary(chart);
assert.ok(crossed.bars,"Boundary jump must remain readable");
assert.ok(Math.abs(crossed.bars[1].change-10)<1e-9,
 "The 10% boundary move belongs to the following bar");
const product=crossed.bars.reduce((total,b)=>total*(1+b.change/100),1);
assert.ok(Math.abs(product-1.1)<1e-9,
 "Chaining bucket variations must reproduce overall price movement");
const fullSpan=chart.data.labels.slice();
chart.data.labels=fullSpan.map((s,i)=>new Date(Date.parse(s)+(i>=145?2*3600000:0)).toISOString());
assert.match(api.variationSummary(chart).reason,/lacunes temporelles/,
 "Large timestamp gaps must be rejected rather than silently combined");
chart.data.labels=fullSpan;
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
// Restore the original native price-history information table/tooltip.
// A supplemental summary must never hide it, move it or replace its DOM state.
assert.doesNotMatch(code,/atlasChartTooltip|nativeTooltipDisplay|syncNativeFloatboard|hideNativeFloatboard/,
  "Native historical chart tooltip is owned only by the original chart runtime");
assert.doesNotMatch(code,/\$atlasVolumeVisible\s*=|savedShadowVisibility/,
  "Never override native volume preference or shadow-volume pipeline");
assert.doesNotMatch(code,/function summaryHover\(|afterEvent\(chart,args\)/,
  "Reverted duplicate custom hover, preserving historic tooltip");
console.log("PASS restored native chart/history tooltip + simple variation bars 24h/7j/30j/60j/90j/1a/Max; no artificial OHLC");