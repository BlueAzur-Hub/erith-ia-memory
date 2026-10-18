"use strict";
/* Original native Chart.js line remains the owner; genuine OHLC is a passive layer. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../public/agent_crypto_erith_ia");
const code=fs.readFileSync(path.join(root,"administrator/js/graph-line-candle-overlay.js"),"utf8");
new vm.Script(code);
assert.match(code,/afterDatasetsDraw/);
assert.doesNotMatch(code,/beforeDatasetsDraw/,'Mini candles are on top of volume only in the bottom lane');
assert.doesNotMatch(code,/fillText\(/,'No painted title inside the plot');
assert.doesNotMatch(code,/ctx\.fillRect\(lane\.left,lane\.top/,'No shaded background panel');
assert.match(code,/mainChart/);
assert.match(code,/agent-crypto:market-candles-loaded/);
require(path.join(root,"administrator/js/graph-line-candle-overlay.js"));
const api=globalThis.AgentCryptoLineCandleOverlay;
assert.equal(api.read_only,true);assert.equal(api.real_order,false);assert.equal(api.market_core_changed,false);
const start=Date.now()-24*3600000;
const times=Array.from({length:289},(_,i)=>start+i*300000);
const rows=times.map(t=>({t,o:99.8,h:100.8,l:99.1,c:100.1,v:100}));
const snapshot={mode:"hybrid",loading:false,rows,loadedInstrument:"BTC-USDC",source:"OKX public candles",loadedBar:"5m"};
const points=times.map((t,i)=>({x:60+i*2.6}));
const meta={type:"line",hidden:false,data:points,yScale:{getPixelForValue:v=>200+(100-v)*10}};
const canvasCalls=[];
const ctx={save(){},beginPath(){},rect(){},clip(){},stroke(){canvasCalls.push({kind:'stroke',color:this.strokeStyle});},fillRect(x,y,w,h){canvasCalls.push({kind:'fill',x,y,w,h,color:this.fillStyle});},fillText(text,x,y){canvasCalls.push({kind:'text',text,x,y});},restore(){},moveTo(){},lineTo(){}};
const chart={canvas:{id:"mainChart"},data:{labels:times.map(t=>new Date(t).toISOString()),datasets:[{atlasCoin:{id:"bitcoin",symbol:"BTC"},data:times.map(()=>100)}]},getDatasetMeta:()=>meta,chartArea:{left:50,right:850,top:40,bottom:300},ctx};
global.document={querySelector:()=>null,getElementById:id=>id==='atlasChartInsightOverlayTitle'?{textContent:'BTC · Bitcoin · 24h · PRIX USD'}:null};
global.getSelectedCoin=()=>({id:"bitcoin"});
global.AgentCryptoQuoteCurrencyArchitecture={snapshot:()=>({displayCurrency:"USD"})};
global.AgentCryptoMarketMicroscope={snapshot:()=>snapshot};
const matched=api.matching(chart,snapshot);
assert.equal(matched.ref.ds.atlasCoin.id,"bitcoin");
assert.equal(api.drawBars(chart,matched),289);
assert.equal(canvasCalls.filter(v=>v.kind==='fill'&&/rgba\(83,224,169/.test(v.color)).length,289);
const lane=api.miniLane(chart.chartArea),geometry=api.miniGeometry(chart.chartArea,rows);
assert.equal(api.strip_ratio,.24,"OHLC occupies the volume-bar summary zone (24%)");
assert.ok(lane.top>=chart.chartArea.top+(.73*(chart.chartArea.bottom-chart.chartArea.top)),"Summary stays in chart bottom quarter");
assert.ok(lane.height/(chart.chartArea.bottom-chart.chartArea.top)<=.27,"OHLC occupies no more than 27% of plotted height");
assert.equal(geometry.scale,"sqrt-amplitude-display","Display-only transformation compresses extreme 5-minute range");
assert.ok(geometry.y(rows[0],rows[0].h)<geometry.y(rows[0],rows[0].l));
const bodies=canvasCalls.filter(v=>v.kind==='fill'&&/rgba\(83,224,169/.test(v.color));
assert.ok(bodies.every(v=>v.y>=lane.bodyTop-.1&&v.y+v.h<=lane.bodyBottom+2.1),"All bodies stay inside the lower lane");
assert.ok(!canvasCalls.some(v=>v.kind==='text'),"No title or mini-panel label in the chart");
assert.equal(canvasCalls.filter(v=>v.kind==='fill').length,289,"Only candle bodies paint rectangles: no band, no filled panel, no volume shade");

// Real 1h ranges of different magnitudes must differ like lower histogram bars,
// even if their absolute BTC prices differ. Both lows share the visual baseline.
const large={t:times[0],o:100,h:120,l:99,c:116};
const small={t:times[1],o:100,h:104,l:99,c:102};
const compare=api.miniGeometry({left:0,right:800,top:0,bottom:520},[large,small]);
assert.ok(compare.y(large,large.h)<compare.y(small,small.h),"Larger intrabar move has taller bar");
assert.equal(compare.y(large,large.l),compare.y(small,small.l),"All lows align at bottom, unlike previous price-level strip");
const red={t:times[2],o:109,h:111,l:96,c:99};
assert.ok(api.miniGeometry({left:0,right:800,top:0,bottom:520},[large,red]).y(red,red.o)<api.miniGeometry({left:0,right:800,top:0,bottom:520},[large,red]).y(red,red.c),"Red body points downward");

assert.equal(canvasCalls.filter(v=>v.kind==='stroke').length,289,"Only candle wicks paint strokes: no horizontal divider");
const beforeOther=canvasCalls.length;
const nativeScale=meta.yScale.getPixelForValue;
meta.yScale.getPixelForValue=()=>-1000000;
assert.equal(api.drawBars(chart,matched),289,"OHLC 5m is independent from Chart.js Y axis and unaffected by price zoom");
meta.yScale.getPixelForValue=nativeScale;
assert.equal(api.miniLane({left:0,right:500,top:0,bottom:100}),null,"Do not compress an unreadable tiny viewport");
assert.equal(api.barsFrom({...snapshot,rows:[{t:times[0],o:1,h:0,l:1,c:1}]}).length,0,"Bad OHLC rejected");
assert.equal(api.matching(chart,{...snapshot,loadedInstrument:"ETH-USDC"}).ref,undefined,"Other asset refused");
assert.equal(api.matching(chart,{...snapshot,loadedInstrument:"BTC-EUR"}).ref,undefined,"Other quote refused");
assert.equal(api.matching(chart,{...snapshot,rows:[]}).ref,undefined,"Empty candles refused");
assert.equal(api.matching(chart,{...snapshot,loadedBar:"1h"}).ref,undefined,"Hour candles cannot pretend to be dense 5m OHLC");
assert.equal(api.matching(chart,{...snapshot,rows:rows.filter((_,i)=>i%12===0)}).ref,undefined,"24 sparse hourly bodies explicitly refused");
chart.data.datasets[0].data=times.map(()=>120);
assert.equal(api.matching(chart,snapshot).ref,undefined,"3.5% quote divergence guard");
chart.data.datasets[0].data=times.map(()=>100);
chart.data.labels=times.map(t=>new Date(t).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}));
const labels=api.nativeTimeline(chart,0,times.at(-1));
assert.equal(labels.length,289,"Clock-only labels resolved from real OHLC timestamp");
assert.ok(Math.abs(labels.at(-1)-labels[0]-24*3600000)<3600000,"Midnight preserved");
// Actual native 24h mode: 288 sampled prices, axis may expose only a few tick labels.
// The native overlay's caption provides the genuine last CoinGecko timestamp.
chart.data.datasets[0].data=Array.from({length:288},()=>100);
chart.data.labels=["axis tick 1","axis tick 2"];
meta.data=Array.from({length:288},(_,i)=>({x:60+i*2.4}));
const stamp=times.at(-1),d=new Date(stamp),two=v=>String(v).padStart(2,"0");
const summary="BTC · départ 99 · dernière 100 · 288 points · série "+
  two(d.getDate())+"/"+two(d.getMonth()+1)+"/"+d.getFullYear()+" "+
  two(d.getHours())+":"+two(d.getMinutes())+":"+two(d.getSeconds())+" · CoinGecko";
global.document={
 querySelector:()=>null,
 getElementById:id=>id==="atlasChartInsightOverlayTitle"?{textContent:"BTC · Bitcoin · 24h · PRIX USD"}:
 id==="atlasChartInsightOverlaySummary"?{textContent:summary}:null
};
const approximate=api.nativeTimeline(chart,0,stamp);
assert.equal(approximate.length,288,"Dense line's timestamps are projected from its real last sample");
assert.equal(approximate.approximate,true,"Approximation must be identified visibly");
assert.ok(Math.abs(approximate.at(-1)-stamp)<1000,"Use real on-screen CoinGecko timestamp");
assert.equal(api.matching(chart,snapshot).ref?.ds?.atlasCoin?.id,"bitcoin",
 "BTC 288-point CoinGecko line accepts genuine 5m candles");
global.document.getElementById=id=>id==="atlasChartInsightOverlayTitle"?{textContent:"BTC · Bitcoin · 7j"}:
 id==="atlasChartInsightOverlaySummary"?{textContent:summary}:null;
assert.equal(api.matching(chart,snapshot).ref,undefined,
 "Never project a 24h candle axis onto a 7-day graph");
global.document.getElementById=id=>id==="atlasChartInsightOverlayTitle"?{textContent:"BTC · Bitcoin · 24h"}:
 id==="atlasChartInsightOverlaySummary"?{textContent:"288 points · série 01/01/2025 00:00:00 · CoinGecko"}:null;
assert.equal(api.matching(chart,snapshot).ref,undefined,"Distant source timestamp must fail closed");
// Exact external owner: the Market may STILL be on BTC while DNA is active.
const extId="bitget:dnausdt", extSymbol="DNA",extPair="DNA/USDT";
const base=Date.now()-26*3600000,step=5*60000;
const extTimes=Array.from({length:320},(_,i)=>base+i*step);
const extPrices=extTimes.map((t,i)=>[t,.288453]);
const extHistory={instrument:extPair,provider:"bitget",currency:"USD",periodDays:1,
 source:"Bitget DNA/USDT candles · USDT/USD CoinGecko",series:extPrices};
const ext={active:true,id:extId,base:extSymbol,instrument:"DNA-USDT",provider:"bitget"};
let native={selectedId:extId,selectedSymbol:extSymbol,selectedProvider:"bitget",selectedPair:extPair};
let extOwner={active:true,coin_id:extId};
global.AgentCryptoNewListingLiveAsset={snapshot:()=>ext};
global.AgentCryptoNewListingsNativeCategory={snapshot:()=>native,mathSeriesSnapshot:()=>extHistory};
global.AtlasExternalChart={state:()=>extOwner};
global.getSelectedCoin=()=>({id:"bitcoin",symbol:"BTC"}); // Hidden regular Market profile.
const externalMeta={type:"line",hidden:false,data:extTimes.map((t,i)=>({x:52+2.4*i})),yScale:meta.yScale};
const externalChart={canvas:{id:"mainChart"},ctx,chartArea:{left:50,right:850,top:40,bottom:300},
 data:{labels:extTimes.map(t=>new Date(t).toISOString()),datasets:[{atlasCoin:{id:extId,symbol:"DNA"},data:extPrices.map(x=>x[1])}]},
 getDatasetMeta:()=>externalMeta};
const extRows=Array.from({length:300},(_,i)=>({t:base+(i+20)*300000,o:.2884,h:.291,l:.286,c:.288453}));
const extSnap={...snapshot,rows:extRows,loadedInstrument:"DNA-USDT",loadedBar:"5m",source:"Bitget public candles"};
let truth=api.externalLineTruth({ds:externalChart.data.datasets[0],meta:externalMeta},extSnap.loadedInstrument);
assert.equal(truth.symbol,"DNA","External chart ID and selected symbol verified");
let hybrid=api.matching(externalChart,extSnap);
assert.equal(hybrid.ref.ds.atlasCoin.symbol,"DNA","DNA 24h accepted despite hidden BTC Market selection");
assert.equal(hybrid.times.length,320,"External 320 points use exact timestamps, never CoinGecko 288 interpolation");
const dnaCount=api.drawBars(externalChart,hybrid);
assert.ok(dnaCount>=275,"DNA draws dense 5-minute candles with exchange OHLC");
native={...native,selectedId:"another-asset"};
assert.equal(api.matching(externalChart,extSnap).ref,undefined,"Mismatch selection rejected");
native={...native,selectedId:extId};
extOwner={active:true,coin_id:"bitcoin"};
assert.equal(api.matching(externalChart,extSnap).ref,undefined,"Old BTC external chart cannot inherit DNA labels");
extOwner={active:true,coin_id:extId};
assert.equal(api.matching(externalChart,{...extSnap,loadedInstrument:"BTC-USDC"}).ref,undefined,"Late BTC candle response refused");
extHistory.periodDays=7;
assert.equal(api.matching(externalChart,extSnap).ref,undefined,"Wrong external period refused");
extHistory.periodDays=1;
extHistory.source="No verified pair";
assert.equal(api.matching(externalChart,extSnap).ref,undefined,"Wrong provenance refused");
const microscope=fs.readFileSync(path.join(root,"administrator/js/market-microscope-candles.js"),"utf8");
assert.match(microscope,/if\(ext.active\)return external/, "Active DNA/CT must be chosen before the hidden pair resolver");
// Regression: previously hardcoded 24h/5m blocked the actual 7j and 30j charts.
const HOUR=3600000,DAY=24*HOUR;
const mkExchange=(end,barMs,length,price)=>Array.from({length},(_,i)=>({
 t:end-(length-1-i)*barMs,o:price*.9998,h:price*1.003,l:price*.997,c:price
}));
const setPeriodTitle=(period,summary)=>{
 global.document={querySelector:()=>null,getElementById:id=>
  id==='atlasChartInsightOverlayTitle'?{textContent:'BTC · Bitcoin · '+period+' · PRIX USD · NORMALE'}:
  id==='atlasChartInsightOverlaySummary'?{textContent:summary}:null};
};
const activeEnd=Date.now(),mkClock=t=>{
 const d=new Date(t),pad=v=>String(v).padStart(2,'0');
 return pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear()+' '+pad(d.getHours())+':'+pad(d.getMinutes())+':'+pad(d.getSeconds());
};
const makeExternal=(days,interval)=>{
 const sampleCount=Math.round(days*DAY/interval)+1;
 const histTimes=Array.from({length:sampleCount},(_,i)=>activeEnd-(sampleCount-1-i)*interval);
 extHistory.source="Bitget DNA/USDT candles · USDT/USD CoinGecko";
 extHistory.periodDays=days;
 extHistory.series=histTimes.map(t=>[t,.288453]);
 externalChart.data.datasets[0].data=histTimes.map(()=>.288453);
 externalChart.data.labels=histTimes.map(t=>new Date(t).toISOString());
 externalMeta.data=histTimes.map((_,i)=>({x:52+760*i/(histTimes.length-1)}));
 return mkExchange(activeEnd,interval,300,.288453);
};
setPeriodTitle('7j','DNA · série '+mkClock(activeEnd)+' · CoinGecko');
assert.equal(api.periodConfig().bar,'1h','7-day chart needs hourly OHLC');
const rows7=makeExternal(7,HOUR),seven={...extSnap,loadedBar:'1h',rows:rows7};
assert.equal(api.matching(externalChart,seven).period.days,7,"7-day DNA chart accepts verified 1h candles");
assert.ok(api.drawBars(externalChart,api.matching(externalChart,seven))>=150,"7-day OHLC bar density");
assert.equal(api.matching(externalChart,{...seven,loadedBar:'5m'}).ref,undefined,"7-day chart rejects 24h candle cadence");
setPeriodTitle('30j','DNA · série '+mkClock(activeEnd)+' · CoinGecko');
assert.equal(api.periodConfig().bar,'4h','30-day chart needs 4-hour OHLC');
const rows30=makeExternal(30,4*HOUR),thirty={...extSnap,loadedBar:'4h',rows:rows30};
assert.equal(api.matching(externalChart,thirty).period.days,30,"30-day DNA chart accepts verified 4h candles");
assert.ok(api.drawBars(externalChart,api.matching(externalChart,thirty))>=170,"30-day OHLC bar density");
assert.equal(api.matching(externalChart,{...thirty,loadedBar:'1h'}).ref,undefined,"30-day cannot borrow 7-day candles");
// Native CoinGecko 7j cached 14 hours behind live exchange: align to its real last date.
global.AgentCryptoNewListingLiveAsset={snapshot:()=>({active:false})};
global.getSelectedCoin=()=>({id:'bitcoin',symbol:'BTC'});
const makeNativeCached=(days,samples,lag,interval)=>{
 const last=activeEnd-lag;
 chart.data.datasets[0].data=Array(samples).fill(100);
 chart.data.labels=['axis ticks only'];
 meta.data=Array.from({length:samples},(_,i)=>({x:60+740*i/(samples-1)}));
 setPeriodTitle(days===7?'7j':'30j',
  'BTC · 168 points · série '+mkClock(last)+' · CoinGecko');
 const exchange=mkExchange(activeEnd,interval,300,100);
 return {last,snap:{...snapshot,rows:exchange,loadedBar:interval===HOUR?'1h':'4h',loadedInstrument:'BTC-USDC',source:'OKX public candles'}};
};
const cachedSeven=makeNativeCached(7,168,14*HOUR,HOUR);
const cachedSevenMatch=api.matching(chart,cachedSeven.snap);
assert.equal(cachedSevenMatch.period?.days,7,"Cached 7j series ending yesterday must use the actual cache timestamp");
assert.ok(cachedSevenMatch.approximate,"Timestamp projection is clearly labelled approximate");
assert.ok(api.drawBars(chart,cachedSevenMatch)>=130,"Cached 7d displays only historical-overlapping candles");
const cachedThirty=makeNativeCached(30,180,3*DAY,4*HOUR);
const cachedThirtyMatch=api.matching(chart,cachedThirty.snap);
assert.equal(cachedThirtyMatch.period?.days,30,"30j cached CoinGecko chart accepts 4h actual OHLC");
assert.ok(api.drawBars(chart,cachedThirtyMatch)>=130,"30d chart covers real cached OHLC portion");
setPeriodTitle('1a','BTC · 365 points · série '+mkClock(activeEnd)+' · CoinGecko');
assert.equal(api.periodConfig().bar,'1j',"Year uses daily candles");
assert.equal(api.matching(chart,{...snapshot,rows:mkExchange(activeEnd,DAY,300,100),loadedBar:'1j'}).ref,undefined,
 "A 300-day daily candle limit MUST NOT be mislabelled as a full year");
setPeriodTitle('Max','BTC · série '+mkClock(activeEnd)+' · CoinGecko');
assert.equal(api.periodConfig(),null,"Max has no proven finite coverage; don't invent OHLC");

console.log("PASS BTC/DNA: 24h=5m, 7j=1h, 30j=4h, cache end-date, refuse fake year/Max");