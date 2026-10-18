/* Regression: certified BTC 1-year candles in the ORIGINAL Hybrid chart.
   No browser/network/OKX credentials or live orders are used. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const source=fs.readFileSync(path.join(__dirname,'../public/agent_crypto_erith_ia/administrator/js/graph-line-candle-overlay.js'),'utf8');
new vm.Script(source);
assert.match(source,/1\\s\+an/);
assert.match(source,/SevenVerifiedPeriods\.load\('bitcoin','1an'\)/);
assert.match(source,/verifiedYearHybrid\(chart\)/);
assert.doesNotMatch(source,/#atlasChartTooltip|afterEvent\s*\(/);
const DAY=86400000;
const annualRows=Array.from({length:365},(_,i)=>{
 const t=Date.UTC(2025,9,1)+i*DAY,p=80000+i;
 return [t,p,p+200,p-200,p+60,1200,100,8];
});
async function scenario({period='1 an',bars=annualRows}={}){
 let plugin=null,notice=null,reads=0,draws=0,rectangles=0;
 const n=period==='1 an'?366:289,step=period==='1 an'?DAY:300000;
 const t0=period==='1 an'?Date.UTC(2025,9,19):Date.UTC(2026,9,18);
 const prices=Array.from({length:n},(_,i)=>({t:t0+i*step,y:80500+i}));
 const ctx={save(){},restore(){},beginPath(){},rect(){},clip(){},
   moveTo(){},lineTo(){},stroke(){},fillRect(){rectangles++}};
 const chart={canvas:{id:'mainChart'},ctx,
   chartArea:{left:40,right:1000,top:20,bottom:650},
   data:{labels:[],datasets:[{atlasCoin:{id:'bitcoin',symbol:'BTC'},data:prices}]},
   getDatasetMeta(){return{type:'line',hidden:false,
     data:prices.map((_,i)=>({x:40+i*960/(n-1)})),
     yScale:{getPixelForValue(){return 20}}}},
   draw(){draws++;plugin.afterDatasetsDraw(chart)}
 };
 const sandbox={
   URL,Date,location:{href:'https://example.org/administrator/'},
   Chart:{register(x){plugin=x},getChart(){return chart}},
   AgentCryptoMarketMicroscope:{snapshot(){return {mode:'hybrid'}}},
   getSelectedCoin(){return {id:'bitcoin'}},
   window:{addEventListener(){}}
 };
 sandbox.document={
   currentScript:{src:'https://example.org/administrator/js/graph-line-candle-overlay.js'},
   getElementById(id){
     if(id==='atlasChartInsightOverlayTitle')return{textContent:'BTC · Bitcoin · '+period+' · PRIX USD'};
     if(id==='atlasChartInsightOverlaySummary')return{textContent:'CoinGecko USD'};
     if(id==='atlasNativeLineCandleStatus')return notice;
     if(id==='mainChart')return chart.canvas;
     return null;
   },
   querySelector(sel){return sel==='#analyste .chart-shell'?{appendChild(el){notice=el}}:null},
   createElement(){return{style:{},setAttribute(){},addEventListener(event,callback){
     this._events??={};this._events[event]=callback;
   }}},
   head:{appendChild(script){
     sandbox.SevenVerifiedPeriods={load:async(asset,periodRequested)=>{
       reads++;assert.equal(asset,'bitcoin');assert.equal(periodRequested,'1an');
       return {data:{asset_id:'bitcoin',pair:'BTCUSDT',quote:'USDT',
         period:'1an',resolution:'1d'},rows:bars};
     }};
     script._events.load();
   }}
 };
 vm.runInNewContext(source,sandbox,{timeout:1500});
 chart.draw();
 await new Promise(resolve=>setImmediate(resolve));
 await new Promise(resolve=>setImmediate(resolve));
 return {text:notice?.textContent||'',title:notice?.title||'',reads,draws,rectangles};
}
(async()=>{
 const year=await scenario();
 assert.equal(year.reads,1);
 assert.match(year.text,/BTC 1 an .*bougies 1j.*Binance BTC\/USDT/);
 assert.match(year.title,/Ligne USD et bougies USDT de sources distinctes/);
 assert.ok(year.rectangles>250,'Real annual candles must be drawn');
 const invalid=await scenario({bars:annualRows.slice(1)});
 assert.equal(invalid.reads,1);
 assert.doesNotMatch(invalid.text,/bougies 1j/);
 assert.match(invalid.text,/synthèse de prix, OHLCV :/);
 const short=await scenario({period:'24h'});
 assert.equal(short.reads,0,'24h must never load annual archives');
 assert.match(short.text,/Ligne \+ 24 barres/);
 console.log('PASS BTC annual Hybrid: certified archive only, no fake candles, native 24h retained');
})().catch(error=>{console.error(error);process.exitCode=1;});
