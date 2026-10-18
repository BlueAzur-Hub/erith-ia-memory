"use strict";
/* Original native Chart.js line remains the owner; genuine OHLC is a passive layer. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"../public/agent_crypto_erith_ia");
const code=fs.readFileSync(path.join(root,"administrator/js/graph-line-candle-overlay.js"),"utf8");
new vm.Script(code);
assert.match(code,/afterDatasetsDraw/);
assert.doesNotMatch(code,/beforeDatasetsDraw/,'Mini candles are on top of volume only in the bottom lane');
assert.match(code,/AMPLITUDE RELATIVE/);
assert.match(code,/mainChart/);
assert.match(code,/agent-crypto:market-candles-loaded/);
require(path.join(root,"administrator/js/graph-line-candle-overlay.js"));
const api=globalThis.AgentCryptoLineCandleOverlay;
assert.equal(api.read_only,true);assert.equal(api.real_order,false);assert.equal(api.market_core_changed,false);
const start=Date.now()-24*3600000;
const times=Array.from({length:25},(_,i)=>start+i*3600000);
const rows=times.map(t=>({t,o:99.8,h:100.8,l:99.1,c:100.1,v:100}));
const snapshot={mode:"hybrid",loading:false,rows,loadedInstrument:"BTC-USDC",source:"OKX public candles",loadedBar:"1h"};
const points=times.map((t,i)=>({x:60+i*30}));
const meta={type:"line",hidden:false,data:points,yScale:{getPixelForValue:v=>200+(100-v)*10}};
const canvasCalls=[];
const ctx={save(){},beginPath(){},rect(){},clip(){},stroke(){canvasCalls.push({kind:'stroke',color:this.strokeStyle});},fillRect(x,y,w,h){canvasCalls.push({kind:'fill',x,y,w,h,color:this.fillStyle});},fillText(text,x,y){canvasCalls.push({kind:'text',text,x,y});},restore(){},moveTo(){},lineTo(){}};
const chart={canvas:{id:"mainChart"},data:{labels:times.map(t=>new Date(t).toISOString()),datasets:[{atlasCoin:{id:"bitcoin",symbol:"BTC"},data:times.map(()=>100)}]},getDatasetMeta:()=>meta,chartArea:{left:50,right:850,top:40,bottom:300},ctx};
global.document={querySelector:()=>null};
global.getSelectedCoin=()=>({id:"bitcoin"});
global.AgentCryptoQuoteCurrencyArchitecture={snapshot:()=>({displayCurrency:"USD"})};
global.AgentCryptoMarketMicroscope={snapshot:()=>snapshot};
const matched=api.matching(chart,snapshot);
assert.equal(matched.ref.ds.atlasCoin.id,"bitcoin");
assert.equal(api.drawBars(chart,matched),25);
assert.equal(canvasCalls.filter(v=>v.kind==='fill'&&/rgba\(83,224,169/.test(v.color)).length,25);
const lane=api.miniLane(chart.chartArea),geometry=api.miniGeometry(chart.chartArea,rows);
assert.equal(api.strip_ratio,.24,"OHLC occupies the volume-bar summary zone (24%)");
assert.ok(lane.top>=chart.chartArea.top+(.73*(chart.chartArea.bottom-chart.chartArea.top)),"Summary stays in chart bottom quarter");
assert.ok(lane.height/(chart.chartArea.bottom-chart.chartArea.top)<=.27,"OHLC occupies no more than 27% of plotted height");
assert.equal(geometry.scale,"per-candle-amplitude","A common per-candle amplitude scale prevents tiny distant-price bodies");
assert.ok(geometry.y(rows[0],rows[0].h)<geometry.y(rows[0],rows[0].l));
const bodies=canvasCalls.filter(v=>v.kind==='fill'&&/rgba\(83,224,169/.test(v.color));
assert.ok(bodies.every(v=>v.y>=lane.bodyTop-.1&&v.y+v.h<=lane.bodyBottom+2.1),"All bodies stay inside the lower lane");
assert.ok(canvasCalls.some(v=>v.kind==='text'&&v.text.includes('AMPLITUDE RELATIVE')),"Local OHLC price scale must be visibly labeled");
assert.ok(canvasCalls.some(v=>v.kind==='fill'&&v.color==='rgba(3,12,24,.82)'),"Native volume is shaded, not deleted");

// Real 1h ranges of different magnitudes must differ like lower histogram bars,
// even if their absolute BTC prices differ. Both lows share the visual baseline.
const large={t:times[0],o:100,h:120,l:99,c:116};
const small={t:times[1],o:100,h:104,l:99,c:102};
const compare=api.miniGeometry({left:0,right:800,top:0,bottom:520},[large,small]);
assert.ok(compare.y(large,large.h)<compare.y(small,small.h),"Larger intrabar move has taller bar");
assert.equal(compare.y(large,large.l),compare.y(small,small.l),"All lows align at bottom, unlike previous price-level strip");
const red={t:times[2],o:109,h:111,l:96,c:99};
assert.ok(api.miniGeometry({left:0,right:800,top:0,bottom:520},[large,red]).y(red,red.o)<api.miniGeometry({left:0,right:800,top:0,bottom:520},[large,red]).y(red,red.c),"Red body points downward");

const beforeOther=canvasCalls.length;
const nativeScale=meta.yScale.getPixelForValue;
meta.yScale.getPixelForValue=()=>-1000000;
assert.equal(api.drawBars(chart,matched),25,"Mini OHLC is independent from Chart.js Y axis and unaffected by price zoom");
meta.yScale.getPixelForValue=nativeScale;
assert.equal(api.miniLane({left:0,right:500,top:0,bottom:100}),null,"Do not compress an unreadable tiny viewport");
assert.equal(api.barsFrom({...snapshot,rows:[{t:times[0],o:1,h:0,l:1,c:1}]}).length,0,"Bad OHLC rejected");
assert.equal(api.matching(chart,{...snapshot,loadedInstrument:"ETH-USDC"}).ref,undefined,"Other asset refused");
assert.equal(api.matching(chart,{...snapshot,loadedInstrument:"BTC-EUR"}).ref,undefined,"Other quote refused");
assert.equal(api.matching(chart,{...snapshot,rows:[]}).ref,undefined,"Empty candles refused");
chart.data.datasets[0].data=times.map(()=>120);
assert.equal(api.matching(chart,snapshot).ref,undefined,"3.5% quote divergence guard");
chart.data.datasets[0].data=times.map(()=>100);
chart.data.labels=times.map(t=>new Date(t).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}));
const labels=api.nativeTimeline(chart,0,times.at(-1));
assert.equal(labels.length,25,"Clock-only labels resolved from real OHLC timestamp");
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
 "BTC 288-point CoinGecko line accepts genuine 1h candles");
global.document.getElementById=id=>id==="atlasChartInsightOverlayTitle"?{textContent:"BTC · Bitcoin · 7j"}:
 id==="atlasChartInsightOverlaySummary"?{textContent:summary}:null;
assert.equal(api.matching(chart,snapshot).ref,undefined,
 "Never project a 24h candle axis onto a 7-day graph");
global.document.getElementById=id=>id==="atlasChartInsightOverlayTitle"?{textContent:"BTC · Bitcoin · 24h"}:
 id==="atlasChartInsightOverlaySummary"?{textContent:"288 points · série 01/01/2025 00:00:00 · CoinGecko"}:null;
assert.equal(api.matching(chart,snapshot).ref,undefined,"Distant source timestamp must fail closed");
console.log("PASS native line remains owner; visible bottom-histogram OHLC, date/asset guards, no synthetic data or orders");