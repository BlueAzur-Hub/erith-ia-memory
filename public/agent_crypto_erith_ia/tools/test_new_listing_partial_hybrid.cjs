'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const ROOT=path.resolve(__dirname,'..');
const content=fs.readFileSync(path.join(ROOT,'administrator/js/graph-line-candle-overlay.js'),'utf8');
const id='new-listing:bitget:axisusdt',now=Date.now();
const start=now-8*3600000,series=Array.from({length:97},(_,i)=>[
 start+i*300000,0.255+(i%9)*.0003
]);
const data=series.map(x=>x[1]),pixels=data.map((_,i)=>({x:i*9,y:100}));
const dataset={atlasCoin:{id,symbol:'AXIS'},data};
const meta={type:'line',hidden:false,data:pixels,
 yScale:{getPixelForValue:v=>v},xScale:{}};
const chart={canvas:{id:'mainChart'},data:{datasets:[dataset],labels:[]},getDatasetMeta:()=>meta,
 chartArea:{left:0,right:920,top:0,bottom:450},ctx:{save(){},restore(){},
 beginPath(){},rect(){},clip(){},fillRect(){}}};
const selection={selectedId:id,selectedSymbol:'AXIS',selectedProvider:'bitget',
 selectedPair:'AXIS/USDT'};
const ext={active:true,id,base:'AXIS',provider:'bitget',pair:'AXIS/USDT',
 instrument:'AXIS-USDT'};
const globals={
 AgentCryptoMarketMicroscope:{snapshot:()=>({mode:'hybrid'})},
 AgentCryptoNewListingLiveAsset:{snapshot:()=>ext},
 AgentCryptoNewListingsNativeCategory:{
  snapshot:()=>selection,
  mathSeriesSnapshot:()=>({instrument:'AXIS/USDT',provider:'bitget',
   periodDays:1,currency:'USD',series,source:'Bitget AXIS/USDT'})
 },
 AtlasExternalChart:{state:()=>({active:true,coin_id:id})},
 Chart:{register(plugin){this.plugin=plugin}}
};
const document={getElementById:target=>target==='atlasChartInsightOverlayTitle'?
 {textContent:'AXIS · 24h · Prix USD'}:null,querySelector:()=>null};
const ctx={globalThis:globals,document,Date,Math,Number,Object,Array,Set,RegExp,console};
vm.runInNewContext(content,ctx);
const api=globals.AgentCryptoLineCandleOverlay;
assert(api,'Overlay published');
let result=api.variationSummary(chart);
assert.equal(result.partial,true,'real first-day listing gets a partial badge');
assert.equal(result.sourceExact,true);
assert(result.coverageHours>=7&&result.coverageHours<=9);
assert(result.bars.length>=7&&result.bars.length<=9);
assert(result.bars.every(b=>b.samples>=2));
assert.equal(result.symbol,'AXIS');
assert(!result.bars.some(b=>Object.hasOwn(b,'high')||Object.hasOwn(b,'low')),'no OHLC invented');
const exact=globals.AgentCryptoNewListingsNativeCategory.mathSeriesSnapshot;
globals.AgentCryptoNewListingsNativeCategory.mathSeriesSnapshot=()=>null;
result=api.variationSummary(chart);
assert(!result.bars,'no fallback to falsely stretched 24h without proof');
globals.AgentCryptoNewListingsNativeCategory.mathSeriesSnapshot=exact;
const old=selection.selectedId;
selection.selectedId='new-listing:bitget:otherusdt';
result=api.variationSummary(chart);
assert(!result.bars,'selected asset mismatch must block hybrid');
selection.selectedId=old;
const bad=series[48][1];
series[48][1]=9;
result=api.variationSummary(chart);
assert(!result.bars,'divergent chart line blocked');
series[48][1]=bad;
assert(!content.includes('setInterval('),'no extra chart polling');
console.log('Verified short-listing Hybrid: partial hours, exact source, owner mismatch rejection PASS');
