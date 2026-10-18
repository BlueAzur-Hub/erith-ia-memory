/* ERITH.IA — OHLC on the original Chart.js LINE chart. Source remains the
 * existing Market Microscope snapshot. No new trading or synthetic candles. */
(()=>{'use strict';
 const N=v=>v===null||v===undefined||v===''?null:(Number.isFinite(Number(v))?Number(v):null);
 const T=v=>{const n=N(v);if(n!==null)return n>1e12?n:n>1e9?n*1000:null;const d=typeof v==='string'?Date.parse(v):NaN;return Number.isFinite(d)?d:null;};
 function barsFrom(s){
   if(!Array.isArray(s?.rows)||s.rows.length<2||s.loading||!s.loadedInstrument||!s.loadedBar)return [];
   const rows=s.rows.map(r=>{const t=T(r?.t),o=N(r?.o),h=N(r?.h),l=N(r?.l),c=N(r?.c);
     return t!==null&&o>0&&c>0&&l>0&&h>=Math.max(o,c,l)&&l<=Math.min(o,c,h)?{t,o,h,l,c}:null;
   }).filter(Boolean).sort((a,b)=>a.t-b.t);
   return rows.length>1?rows:[];
 }
 const mode=()=>globalThis.AgentCryptoMarketMicroscope?.snapshot?.()?.mode==='hybrid';
 // The chart period owns candle cadence. This is a read-only, bounded mapping.
 const PERIODS=Object.freeze({
  '24h':Object.freeze({label:'24h',days:1,bar:'5m',step:300000}),
  '7j':Object.freeze({label:'7j',days:7,bar:'1h',step:3600000}),
  '30j':Object.freeze({label:'30j',days:30,bar:'4h',step:14400000}),
  '60j':Object.freeze({label:'60j',days:60,bar:'1j',step:86400000}),
  '90j':Object.freeze({label:'90j',days:90,bar:'1j',step:86400000}),
  '1a':Object.freeze({label:'1a',days:365,bar:'1j',step:86400000})
 });
 function periodConfig(){
   if(typeof document==='undefined'||typeof document.getElementById!=='function')return null;
   const title=String(document.getElementById('atlasChartInsightOverlayTitle')?.textContent||'');
   const m=title.match(/(?:^|[\s·])(24h|7j|30j|60j|90j|1a|max)(?=[\s·]|$)/i);
   return m?(PERIODS[m[1].toLowerCase()]||null):null;
 }
 function nativeDate(v,base){
   const t=T(v);if(t!==null)return t;
   if(typeof v!=='string')return null;
   const m=v.trim().match(/^(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{4}))?(?:[,\s]+(\d{1,2}):(\d{2}))?$/);
   if(!m)return null;
   const b=new Date(base),d=Number(m[1]),mo=Number(m[2])-1,y=m[3]?Number(m[3]):b.getFullYear();
   const t2=new Date(y,mo,d,Number(m[4]||0),Number(m[5]||0)).getTime();
   return new Date(t2).getDate()===d?t2:null;
 }
 function nativeTimeline(chart,i,anchor){
   const values=chart?.data?.datasets?.[i]?.data||[],labels=chart?.data?.labels||[];
   if(values.length<12)return null;
   const times=values.map((p,j)=>p&&typeof p==='object'?(nativeDate(p.t??p.timestamp??p.time??p.x,anchor)??nativeDate(labels[j],anchor)):nativeDate(labels[j],anchor));
   if(times.every(Number.isFinite)&&times.every((t,j)=>!j||t>times[j-1]))return times;
   // Only for the real French 24h time axis; resolve midnight BACKWARDS.
   const clock=labels.length===values.length?labels.map(v=>typeof v==='string'?v.trim().match(/^(\d{1,2}):(\d{2})$/):null):[];
   if(!clock.length||!clock.every(Boolean))return historicalPeriodTimeline(chart,i,anchor);
   const b=new Date(anchor),result=new Array(clock.length);
   let day=new Date(b.getFullYear(),b.getMonth(),b.getDate()).getTime();
   for(let j=clock.length-1;j>=0;j--){
     const hh=Number(clock[j][1]),mm=Number(clock[j][2]);if(hh>23||mm>59)return null;
     let t=day+hh*3600000+mm*60000;
     if(j<clock.length-1&&t>=result[j+1]){
       const d=new Date(day);
       day=new Date(d.getFullYear(),d.getMonth(),d.getDate()-1).getTime();
       t=day+hh*3600000+mm*60000;
     }
     result[j]=t;
   }
   return result;
 }
 // CoinGecko can omit per-point labels on any historical period.
 // Only X positions are estimated from its verified last sample timestamp.
 // Prices and OHLC are never reconstructed.
 function historicalPeriodTimeline(chart,i,anchor){
   if(typeof document==='undefined'||typeof document.getElementById!=='function')return null;
   const price=chart?.data?.datasets?.[i]?.data||[];
   const period=periodConfig();
   if(price.length<12||!period)return null;
   const summary=String(document.getElementById('atlasChartInsightOverlaySummary')?.textContent||'');
   if(!/CoinGecko/i.test(summary))return null;
   const stamp=summary.match(/série\s+(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/i);
   if(!stamp)return null;
   const [_,dd,mm,yyyy,hh,mi,ss]=stamp;
   const last=new Date(Number(yyyy),Number(mm)-1,Number(dd),Number(hh),Number(mi),Number(ss||0)).getTime();
   if(!Number.isFinite(last)||new Date(last).getDate()!==Number(dd))return null;
   const duration=period.days*86400000;
   // Cached 7j/30j end points need not be live, but must still overlap the
   // real exchange series (enforced independently by matching).
   if(last>anchor+period.step*2||anchor-last>duration)return null;
   const result=price.map((v,j)=>last-duration+duration*j/(price.length-1));
   result.approximate=true; // Source sample time exact; intermediate native cadence estimated.
   return result;
 }
 function owner(chart){
   if(!chart?.data?.datasets||!chart.getDatasetMeta)return null;
   const a=[];chart.data.datasets.forEach((ds,i)=>{const meta=chart.getDatasetMeta(i);
     if(meta?.type==='line'&&!meta.hidden&&ds?.atlasCoin?.symbol&&meta.data?.length>=12&&meta.yScale?.getPixelForValue)a.push({ds,meta,i});
   });
   return a.length===1?a[0]:null;
 }

 // Unlike Market Solo, public New Listing DNA/CT can keep a hidden BTC
 // getSelectedCoin(). Verify the exact EXTERNAL chart + historic series owner.
 function externalLineTruth(ref,loadedInstrument,period=periodConfig()){
   if(!period)return {reason:'Ligne conservée · période externe sans OHLC vérifiées'};
   const ext=globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.();
   if(!ext?.active)return null;
   const n=globalThis.AgentCryptoNewListingsNativeCategory?.snapshot?.();
   const h=globalThis.AgentCryptoNewListingsNativeCategory?.mathSeriesSnapshot?.();
   const chart=globalThis.AtlasExternalChart?.state?.();
   const id=String(n?.selectedId||''),sym=String(n?.selectedSymbol||'').toUpperCase();
   const requested=String(loadedInstrument||'').toUpperCase();
   const selectedPair=String(n?.selectedPair||'').toUpperCase().replace(/\//g,'-');
   const chartId=String(ref?.ds?.atlasCoin?.id||'');
   if(!id||!sym||!n?.selectedProvider||!selectedPair||
     id!==String(ext.id||'')||String(ext.base||'').toUpperCase()!==sym||
     selectedPair!==String(ext.instrument||'').toUpperCase()||
     requested!==selectedPair||!chart?.active||String(chart.coin_id||'')!==id||
     chartId!==id||String(ref?.ds?.atlasCoin?.symbol||'').toUpperCase()!==sym||
     !h||h.instrument!==n.selectedPair||h.provider!==n.selectedProvider||
     Number(h.periodDays)!==period.days||h.currency!=='USD'||!String(h.source||'').includes(n.selectedPair))
     return {reason:'Ligne conservée · contexte externe non confirmé'};
   if(!Array.isArray(h.series)||h.series.length!==ref.ds.data.length||
      h.series.length!==ref.meta.data.length||h.series.length<21)
     return {reason:'Ligne conservée · historique externe non aligné'};
   const times=h.series.map(pair=>Array.isArray(pair)?T(pair[0]):null);
   if(!times.every(Number.isFinite)||times.some((t,i)=>i>0&&t<=times[i-1]))
     return {reason:'Ligne conservée · heures externes invalides'};
   const price=v=>N(Array.isArray(v)?v[1]:v&&typeof v==='object'?(v.y??v.price??v.value):v);
   for(const i of [...new Set([0,Math.floor(times.length/2),times.length-1])]){
     const chartP=price(ref.ds.data[i]),historyP=N(h.series[i]?.[1]);
     if(!(chartP>0&&historyP>0)||Math.abs(chartP/historyP-1)>0.001)
       return {reason:'Ligne conservée · série externe incohérente'};
   }
   return {times,coinId:id,symbol:sym,source:h.source};
 }
 function matching(chart,s){
   const ref=owner(chart),period=periodConfig(),rows=barsFrom(s);
   if(!ref)return {reason:'Hybride : disponible en Solo · prix normal'};
   if(!period)return {reason:'Ligne conservée · période sans couverture OHLC confirmée'};
   if(typeof document==='undefined'||document.querySelector('[data-chart-view="base100"].is-active')||document.querySelector('[data-chart-scale="logarithmic"].is-active'))
     return {reason:'Hybride : sélectionner Prix · Normale'};
   if(s?.loading)return {reason:'Chargement des bougies '+period.bar+'…'};
   if(!rows.length)return {reason:s?.errorCode?'OHLC indisponibles · '+String(s.errorCode).slice(0,45):'Bougies '+period.bar+' non chargées'};
   if(s.loadedBar!==period.bar)return {reason:'Bougies '+period.bar+' attendues · série '+String(s.loadedBar||'absente')};
   const gaps=rows.slice(1).map((row,i)=>row.t-rows[i].t);
   const validGaps=gaps.filter(ms=>ms>=period.step*.8&&ms<=period.step*1.2).length;
   const expected=Math.ceil(period.days*86400000/period.step);
   if(rows.length<Math.ceil(expected*(period.days>=365?.95:.8))||!gaps.length||validGaps<gaps.length*.83)
     return {reason:'Ligne conservée · couverture OHLC '+period.label+' insuffisante'};
   const symbol=String(ref.ds.atlasCoin.symbol||'').toUpperCase(),instrument=String(s.loadedInstrument||'').toUpperCase();
   const external=globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.();
   const extTruth=external?.active?externalLineTruth(ref,instrument,period):null;
   if(extTruth?.reason)return extTruth;
   if(!symbol||!instrument.startsWith(symbol+'-'))
     return {reason:'Ligne conservée · actifs différents'};
   if(!external?.active){
     const selected=globalThis.getSelectedCoin?.();
     if(selected?.id&&selected.id!==ref.ds.atlasCoin.id)
       return {reason:'Ligne conservée · actifs différents'};
   }
   const quote=instrument.slice(symbol.length+1),currency=String(globalThis.AgentCryptoQuoteCurrencyArchitecture?.snapshot?.()?.displayCurrency||'USD').toUpperCase();
   if(!(quote===currency||(currency==='USD'&&(quote==='USDC'||quote==='USDT'))))
     return {reason:'Ligne conservée · cotation incompatible'};
   const times=extTruth?.times||nativeTimeline(chart,ref.i,rows.at(-1).t),points=ref.meta.data;
   if(!times||times.length!==points.length)return {reason:'Ligne conservée · dates non vérifiables'};
   const first=times[0],last=times.at(-1),duration=last-first,target=period.days*86400000;
   if(!(duration>=target*.78&&duration<=target*1.16))
     return {reason:'Ligne conservée · période historique différente'};
   const overlapStart=Math.max(first,rows[0].t),overlapEnd=Math.min(last,rows.at(-1).t);
   if(Math.max(0,overlapEnd-overlapStart)<target*(period.days>=365?.95:.78))
     return {reason:'Ligne conservée · OHLC historiques insuffisants pour '+period.label};
   // Compare price with the candle at the HISTORICAL graph end, never today's
   // last candle when displaying a cached 7j or 30j chart.
   const atEnd=rows.reduce((closest,row)=>Math.abs(row.t-last)<Math.abs(closest.t-last)?row:closest,rows[0]);
   if(Math.abs(atEnd.t-last)>period.step*2)
     return {reason:'Ligne conservée · fin des bougies non alignée'};
   const tail=ref.ds.data.at(-1),endLine=N(Array.isArray(tail)?tail[1]:tail&&typeof tail==='object'?(tail.y??tail.price??tail.value):tail);
   if(!(endLine>0)||Math.abs(atEnd.c/endLine-1)>.035)
     return {reason:'Ligne conservée · prix/quote divergents'};
   return {ref,rows,times,first,last,quote,currency,instrument,source:s.source,period,approximate:!!times.approximate,warning:s.errorCode||null};
 }
 function px(t,ref,times){
   if(t<times[0]||t>times.at(-1))return null;
   let a=0,b=times.length-1;
   while(a+1<b){const m=(a+b)>>1;if(times[m]<=t)a=m;else b=m;}
   const x=ref.meta.data[a]?.x,y=ref.meta.data[b]?.x;
   return Number.isFinite(x)&&Number.isFinite(y)&&times[b]>times[a]?x+(y-x)*(t-times[a])/(times[b]-times[a]):null;
 }
 // Hybrid draws only individual colored candle shapes in the native bottom area,
 // never a shaded band, frame, extra panel or secondary price plot. True exchange OHLC values remain untouched.
 // All lows are placed on one visual baseline (like the native volume bars);
 // height compares each candle's intrabar high-low amplitude, NOT absolute price.
 function miniLane(area){
   if(!area||![area.left,area.right,area.top,area.bottom].every(Number.isFinite))return null;
   const plotH=area.bottom-area.top,plotW=area.right-area.left;
   if(plotH<230||plotW<220)return null;
   const height=Math.max(60,Math.min(170,plotH*.24));
   const bottom=area.bottom-5,top=bottom-height;
   return {left:area.left+1,right:area.right-1,top,bottom,height,
     bodyTop:top+19,bodyBottom:bottom-7};
 }
 function miniGeometry(area,ohlcRows){
   const lane=miniLane(area);
   if(!lane||!Array.isArray(ohlcRows)||ohlcRows.length<2)return null;
   if(!ohlcRows.every(r=>Number.isFinite(r.h)&&Number.isFinite(r.l)&&r.h>=r.l&&r.l>0))return null;
   const maxRange=Math.max(...ohlcRows.map(r=>r.h-r.l));
   if(!(Number.isFinite(maxRange)&&maxRange>0))return null;
   // Each candle gets the same pixels per unit of intrabar range. This
   // preserves relative magnitudes while translating lows to the shared bottom.
   const height=(lane.bodyBottom-lane.bodyTop)*.92;
   // Display-only square-root boost keeps smaller bars visible despite
   // a single large wick; original OHLC prices and candle direction remain exact.
   const y=(row,value)=>lane.bodyBottom-Math.sqrt(Math.max(0,Math.min(1,(value-row.l)/maxRange)))*height;
   return {...lane,maxRange,scale:'sqrt-amplitude-display',y};
 }
 function drawBars(chart,g){
   const {ref,rows,times,first,last}=g,ctx=chart.ctx,area=chart.chartArea;
   if(!ctx||!area||typeof ctx.save!=='function')return 0;
   const inside=rows.filter(r=>r.t>=first&&r.t<=last),lane=miniGeometry(area,inside);
   if(!lane)return 0;
   // The cadence follows the real chart period (5m, 1h, 4h or 1j).
   // No synthetic candles or forced 24h display in a 7j/30j chart.
   const spacing=(lane.right-lane.left)/Math.max(inside.length,1);
   const width=Math.max(1,Math.min(5,spacing*.78));
   let count=0;
   // No panel, no background, no header and no separator: transparent OHLC
   // candles share the native plot and align their lows to its bottom baseline.
   // Chart.js clips the candle paint to the existing chart area; the original
   // artwork, line data, controls and volume dataset are never modified.
   ctx.save();ctx.beginPath();ctx.rect(lane.left,lane.top,lane.right-lane.left,lane.height);ctx.clip();
   inside.forEach(r=>{
     const x=px(r.t,ref,times);if(x===null||x<lane.left||x>lane.right)return;
     const yh=lane.y(r,r.h),yl=lane.y(r,r.l),yo=lane.y(r,r.o),yc=lane.y(r,r.c);
     if(![yh,yl,yo,yc].every(Number.isFinite))return;
     const up=r.c>=r.o;
     ctx.strokeStyle=up?'rgba(97,235,184,.97)':'rgba(255,119,152,.97)';
     ctx.fillStyle=up?'rgba(83,224,169,.96)':'rgba(250,101,142,.96)';
     ctx.lineWidth=Math.min(1.2,Math.max(.65,width*.30));ctx.beginPath();ctx.moveTo(x,yh);ctx.lineTo(x,yl);ctx.stroke();
     // 5m bodies are deliberately narrow: no inflated 1h blocks.
     // Direction comes exclusively from exchange O/C, not CoinGecko samples.
     const actual=Math.abs(yc-yo);
     const bodyHeight=Math.max(1.5,actual);
     const center=(yo+yc)/2;
     const bodyTop=Math.max(lane.bodyTop,Math.min(lane.bodyBottom-bodyHeight,center-bodyHeight/2));
     ctx.fillRect(x-width/2,bodyTop,width,Math.min(bodyHeight,lane.bodyBottom-bodyTop));
     count++;
   });
   ctx.restore();return count;
 }
 function hint(message,title=''){
   if(typeof document==='undefined')return;
   let el=document.getElementById('atlasNativeLineCandleStatus');
   if(!mode()){if(el)el.hidden=true;return;}
   if(!el){const shell=document.querySelector('#analyste .chart-shell');if(!shell)return;
     el=document.createElement('small');el.id='atlasNativeLineCandleStatus';
     Object.assign(el.style,{position:'absolute',right:'12px',top:'48px',zIndex:'8',font:'750 9px system-ui,sans-serif',padding:'3px 6px',background:'rgba(2,12,20,.72)',color:'#afd5e0',borderRadius:'5px',pointerEvents:'none',maxWidth:'55%',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'});
     el.setAttribute('aria-live','polite');shell.appendChild(el);
   }
   el.hidden=false;el.textContent=message;el.title=title;
 }

 // The requested hybrid is a SIMPLE PERIOD SUMMARY, not a candlestick panel.
 // Each vertical bar represents the price movement over a larger time bucket.
 // Derived from the ALREADY plotted native price series: no OHLC invented,
 // no exchange fetch, no second chart and no duplicate market selection.
 const SUMMARY_RULES=Object.freeze({
  '24h':Object.freeze({label:'24h',segments:24,unit:'heure',days:1}),
  '7j':Object.freeze({label:'7j',segments:7,unit:'jour',days:7}),
  '30j':Object.freeze({label:'30j',segments:30,unit:'jour',days:30}),
  '60j':Object.freeze({label:'60j',segments:60,unit:'jour',days:60}),
  '90j':Object.freeze({label:'90j',segments:13,unit:'semaine environ',days:90}),
  '1a':Object.freeze({label:'1a',segments:12,unit:'mois environ',days:365}),
  'max':Object.freeze({label:'Max',segments:12,unit:'segment historique',days:null})
 });
 function summaryPeriodConfig(){
   if(typeof document==='undefined'||typeof document.getElementById!=='function')return null;
   const title=String(document.getElementById('atlasChartInsightOverlayTitle')?.textContent||'');
   const m=title.match(/(?:^|[\s·])(24h|7j|30j|60j|90j|1a|max)(?=[\s·]|$)/i);
   return m?SUMMARY_RULES[m[1].toLowerCase()]||null:null;
 }
 const priceValue=v=>N(Array.isArray(v)?v[1]:v&&typeof v==='object'?(v.y??v.price??v.value):v);
 function summaryOwnership(ref){
   if(!ref?.ds?.atlasCoin?.id||!ref?.ds?.atlasCoin?.symbol)return false;
   const external=globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.();
   if(external?.active){
     const owner=globalThis.AtlasExternalChart?.state?.();
     const n=globalThis.AgentCryptoNewListingsNativeCategory?.snapshot?.();
     return String(external.id||'')===String(ref.ds.atlasCoin.id)&&
       String(external.base||'').toUpperCase()===String(ref.ds.atlasCoin.symbol).toUpperCase()&&
       String(owner?.coin_id||'')===String(external.id)&&owner?.active===true&&
       String(n?.selectedId||'')===String(external.id);
   }
   const selected=globalThis.getSelectedCoin?.();
   return !selected?.id||String(selected.id)===String(ref.ds.atlasCoin.id);
 }
 // Use actual local-hour/day/week/month boundaries, not arbitrary equal chunks.
 // Rolling Max intentionally uses measured equal spans (there is no known calendar window).
 function summaryBoundaries(period,first,last){
   if(!(Number.isFinite(first)&&Number.isFinite(last)&&first<last))return null;
   const n=period?.segments;if(!(n>0))return null;
   if(period.label==='Max')
     return Array.from({length:n+1},(_,i)=>first+(last-first)*i/n);
   const anchor=new Date(last),start=new Date(anchor);
   if(period.label==='24h'){start.setMinutes(0,0,0);start.setHours(start.getHours()+1-n);}
   else if(['7j','30j','60j'].includes(period.label)){
     start.setHours(0,0,0);start.setDate(start.getDate()+1-n);
   }else if(period.label==='90j'){
     start.setHours(0,0,0);start.setDate(start.getDate()-((start.getDay()+6)%7)-7*(n-1));
   }else if(period.label==='1a'){
     start.setDate(1);start.setHours(0,0,0);start.setMonth(start.getMonth()+1-n);
   }else return null;
   const boundaries=[start.getTime()];
   for(let i=1;i<=n;i++){
     const d=new Date(start);
     if(period.label==='24h')d.setHours(d.getHours()+i);
     else if(['7j','30j','60j'].includes(period.label))d.setDate(d.getDate()+i);
     else if(period.label==='90j')d.setDate(d.getDate()+7*i);
     else d.setMonth(d.getMonth()+i);
     boundaries.push(d.getTime());
   }
   return boundaries.every((t,i)=>Number.isFinite(t)&&(!i||t>boundaries[i-1]))?boundaries:null;
 }
 function variationSummary(chart){
   const ref=owner(chart),period=summaryPeriodConfig();
   if(!period)return {reason:'Période de synthèse non reconnue'};
   if(!ref||!summaryOwnership(ref))return {reason:'Synthèse indisponible · actif non confirmé'};
   if(typeof document==='undefined'||document.querySelector('[data-chart-view="base100"].is-active')||
     document.querySelector('[data-chart-scale="logarithmic"].is-active'))
     return {reason:'Synthèse disponible en Solo · Prix · Normale'};
   const values=ref.ds.data,points=ref.meta.data;
   if(!Array.isArray(values)||values.length<period.segments*2||points?.length!==values.length)
     return {reason:'Synthèse indisponible · échantillons insuffisants'};
   const times=nativeTimeline(chart,ref.i,Date.now());
   if(!times||times.length!==values.length||times.some((t,i)=>!Number.isFinite(t)||(i>0&&t<=times[i-1])))
     return {reason:'Synthèse indisponible · dates non vérifiables'};
   const first=times[0],last=times.at(-1),span=last-first;
   if(!(span>0))return {reason:'Synthèse indisponible · durée inconnue'};
   if(period.days){
     const expected=period.days*86400000;
     if(span<expected*.73||span>expected*1.18)
       return {reason:'Synthèse indisponible · couverture '+period.label+' incohérente'};
   }else if(span<7*86400000)return {reason:'Synthèse Max · durée réelle trop courte'};
   const bounds=summaryBoundaries(period,first,last);
   if(!bounds)return {reason:'Synthèse indisponible · limites calendaires inconnues'};
   const buckets=Array.from({length:period.segments},()=>[]);
   // Calendar-aligned bins intentionally exclude data older than the first
   // displayed segment (rolling 7d can straddle eight calendar dates).
   let bin=0;
   for(let i=0;i<values.length;i++){
     const t=times[i],price=priceValue(values[i]);if(!(price>0)||t<bounds[0])continue;
     while(bin<period.segments-1&&t>=bounds[bin+1])bin++;
     if(t>=bounds[bin+1]&&bin===period.segments-1)continue;
     buckets[bin].push({price,t});
   }
   const bars=buckets.map((bucket,i)=>{
     if(bucket.length<2)return null;
     const p0=bucket[0].price,p1=bucket.at(-1).price,change=(p1/p0-1)*100;
     if(!Number.isFinite(change))return null;
     return {index:i,t:bucket[0].t,end:bucket.at(-1).t,
       start:bounds[i],stop:bounds[i+1],partial:bucket[0].t>bounds[i]+3600000||bucket.at(-1).t<bounds[i+1]-3600000,
       open:p0,close:p1,change,delta:p1-p0,
       direction:change>0?'up':change<0?'down':'flat',samples:bucket.length};
   });
   if(bars.some(x=>!x))return {reason:'Synthèse indisponible · intervalles historiques incomplets'};
   return {period,ref,times,first,last,bars,approximate:!!times.approximate,
     coinId:String(ref.ds.atlasCoin.id),symbol:String(ref.ds.atlasCoin.symbol),bounds};
 }
 const VOLUME_STEP=Object.freeze({'1m':60000,'5m':300000,'15m':900000,'30m':1800000,
   '1h':3600000,'4h':14400000,'1j':86400000,'1d':86400000});
 function observedVolumes(summary,snapshot=globalThis.AgentCryptoMarketMicroscope?.snapshot?.()){
   const bars=summary?.bars,sym=String(summary?.symbol||'').toUpperCase();
   // The standard CoinGecko total_volumes series is a ROLLING 24-hour value,
   // not per-candle trades. NEVER sum it and label it traded interval volume.
   // Only real exchange candle base-asset volume is supported in this opt-in
   // read of an ALREADY LOADED microscope snapshot. No fetch triggered.
   const inst=String(snapshot?.loadedInstrument||'').toUpperCase();
   const step=VOLUME_STEP[String(snapshot?.loadedBar||'').toLowerCase()];
   const rows=snapshot?.rows;
   if(!bars?.length||!sym||!inst.startsWith(sym+'-')||!step||
      snapshot?.loading||!Array.isArray(rows)||rows.length<2)
     return bars?.map(()=>null)||[];
   if(globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.()?.active){
     const ex=globalThis.AgentCryptoNewListingLiveAsset.snapshot();
     if(inst!==String(ex.instrument||'').toUpperCase())return bars.map(()=>null);
   }
   const candles=rows.map(r=>({t:T(r?.t),v:N(r?.v)}))
     .filter(r=>r.t!==null&&r.v!==null&&r.v>=0)
     .sort((a,b)=>a.t-b.t);
   if(candles.length<2)return bars.map(()=>null);
   const out=bars.map(b=>{
     const group=candles.filter(c=>c.t>=b.start&&c.t<b.stop),duration=b.stop-b.start;
     if(!group.length||!(duration>0))return null;
     const first=group[0].t,last=group.at(-1).t;
     const missingStart=Math.max(0,first-b.start),missingEnd=Math.max(0,b.stop-(last+step));
     const coverage=1-(missingStart+missingEnd)/duration;
     const gaps=group.slice(1).map((r,i)=>r.t-group[i].t);
     if(coverage<.78||gaps.some(g=>g>step*2.1)||group.every(x=>x.v===0))return null;
     return group.reduce((sum,x)=>sum+x.v,0);
   });
   // Avoid a misleading volume scale assembled from sparse fragments.
   if(out.filter(v=>v!==null).length<Math.max(3,Math.ceil(bars.length*.7)))
     return bars.map(()=>null);
   return out;
 }
 function summaryGeometry(chart,summary,volumes=[]){
   const lane=miniLane(chart?.chartArea),bars=summary?.bars;
   if(!lane||!Array.isArray(bars)||bars.length<2)return null;
   const abs=bars.map(b=>Math.abs(b.change)).filter(v=>v>0).sort((a,b)=>a-b);
   const p90=abs.length?abs[Math.min(abs.length-1,Math.floor(abs.length*.9))]:0;
   const usable=lane.bodyBottom-lane.bodyTop;
   const step=(lane.right-lane.left)/bars.length;
   const baseWidth=Math.max(1.5,Math.min(60,step*.51)); // 18% thinner than checkpoint #486
   const present=volumes.filter(v=>Number.isFinite(v)&&v>=0).sort((a,b)=>a-b);
   const volumeP90=present.length>=3?present[Math.min(present.length-1,Math.floor(present.length*.9))]:null;
   const toHeight=pct=>{
     if(pct===0)return 2;
     const ratio=Math.min(1.5,Math.abs(pct)/Math.max(p90,1e-10));
     return Math.min(usable,Math.max(5,usable*(.48*Math.sqrt(ratio)+.52*ratio)*.87));
   };
   const rects=bars.map((b,i)=>{
     const v=volumes[i];
     const widthFactor=volumeP90>0&&Number.isFinite(v)&&v>=0?
       .76+.42*Math.sqrt(Math.min(1.25,v/volumeP90)):1;
     const w=Math.min(step*.74,baseWidth*widthFactor);
     const h=toHeight(b.change);
     return {x:lane.left+step*(i+.5),y:lane.bodyBottom-h,w,h,
       color:b.direction==='up'?'rgba(76,224,170,.90)':
         b.direction==='down'?'rgba(250,105,143,.90)':'rgba(170,185,195,.75)',
       volume:Number.isFinite(v)&&v>=0?v:null};
   });
   return {lane,rects};
 }
 function drawVariationSummary(chart,summary,volumes=[]){
   const geometry=summaryGeometry(chart,summary,volumes),ctx=chart?.ctx;
   if(!geometry||!ctx)return 0;
   const {lane,rects}=geometry;
   ctx.save();ctx.beginPath();ctx.rect(lane.left,lane.top,lane.right-lane.left,lane.height);ctx.clip();
   rects.forEach(r=>{ctx.fillStyle=r.color;ctx.fillRect(r.x-r.w/2,r.y,r.w,r.h);});
   ctx.restore();return rects.length;
 }
 const frNumber=(value,digits=2)=>Number(value).toLocaleString('fr-FR',{maximumFractionDigits:digits});
 const fmtPrice=(value,currency)=>currency==='USD'?
   new Intl.NumberFormat('fr-FR',{style:'currency',currency:'USD',maximumFractionDigits:Math.abs(value)<.01?8:Math.abs(value)<1?6:2}).format(value):
   new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:Math.abs(value)<.01?8:Math.abs(value)<1?6:2}).format(value);
 const fmtTime=t=>new Date(t).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
 function summaryHover(summary,volumes,index){
   const bar=summary?.bars?.[index];if(!bar)return null;
   const currency=String(document?.getElementById?.('atlasChartInsightOverlayTitle')?.textContent||'').includes('EUR')?'EUR':'USD';
   const vol=volumes?.[index];
   const volText=Number.isFinite(vol)&&vol>=0?
     frNumber(vol,5)+' '+summary.symbol+' (volume exchange)':'volume non vérifié';
   return {
     short:fmtTime(bar.start)+' → '+fmtTime(bar.stop)+' · '+(bar.change>=0?'+':'')+frNumber(bar.change,2)+' % · '+volText,
     detail:summary.symbol+' · '+fmtTime(bar.start)+' → '+fmtTime(bar.stop)+'\n'+
       'Prix début : '+fmtPrice(bar.open,currency)+' · Prix fin : '+fmtPrice(bar.close,currency)+'\n'+
       'Variation : '+(bar.delta>=0?'+':'')+fmtPrice(bar.delta,currency)+' / '+
          (bar.change>=0?'+':'')+frNumber(bar.change,3)+' %\n'+
       'Volume observé : '+volText+(bar.partial?'\nIntervalle partiel':'')+
       (summary.approximate?'\nTemps estimé depuis la série native':'')
   };
 }
 const plugin={id:'agentCryptoNativeLineCandles',
   // Suppress the native lower-volume BAR dataset only in Hybrid. Preserve its
   // data, tooltip source and the user's Volume toggle for the other modes.
   beforeDatasetDraw(chart,args){
     if(chart?.canvas?.id!=='mainChart'||!mode())return;
     if(chart.getDatasetMeta?.(args.index)?.type==='bar')return false;
   },
   afterDatasetsDraw(chart){
     if(chart?.canvas?.id!=='mainChart'||!mode())return;
     const summary=variationSummary(chart);
     if(!summary.bars){hint(summary.reason);return;}
     const count=drawVariationSummary(chart,summary);
     hint(count?'Ligne + '+count+' barres · '+summary.period.label+' · '+summary.period.unit+
       (summary.approximate?' · temps estimé':''):'Ligne conservée · barres indisponibles',
       'Variations en pourcentage du prix historique affiché. Vert : hausse ; rouge : baisse. '+
       'Hauteur visuelle compressée pour rester lisible ; aucune bougie OHLC reconstituée.');
   }
 };
 function refresh(){
   if(typeof document==='undefined')return;
   const chart=globalThis.Chart?.getChart?.(document.getElementById('mainChart'));
   if(chart?.draw)try{chart.draw();}catch(_){}
   if(!mode())hint('');
 }
 if(globalThis.Chart?.register)globalThis.Chart.register(plugin);
 if(typeof window!=='undefined')for(const event of ['agent-crypto:market-candles-loaded','agent-crypto:quote-architecture-changed','agent-crypto:selected-market-changed','agent-crypto:external-asset-changed'])
   window.addEventListener(event,refresh,{passive:true});
 globalThis.AgentCryptoLineCandleOverlay=Object.freeze({refresh,barsFrom,periodConfig,summaryPeriodConfig,summaryOwnership,variationSummary,drawVariationSummary,nativeTimeline,externalLineTruth,matching,miniLane,miniGeometry,drawBars,plugin,strip_ratio:.24,read_only:true,real_order:false,market_core_changed:false});
})();