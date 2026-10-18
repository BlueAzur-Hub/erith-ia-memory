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
   if(!clock.length||!clock.every(Boolean))return historical24hTimeline(chart,i,anchor);
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
 // The native 24h CoinGecko line may contain plain price values without
 // per-point timestamp labels. Its original on-screen summary supplies the
 // real last sample time; interpolate PIXEL POSITIONS only. Never derive OHLC.
 function historical24hTimeline(chart,i,anchor){
   if(typeof document==='undefined'||typeof document.getElementById!=='function')return null;
   const price=chart?.data?.datasets?.[i]?.data||[];
   if(price.length<240||price.length>400)return null;
   const title=String(document.getElementById('atlasChartInsightOverlayTitle')?.textContent||'');
   const summary=String(document.getElementById('atlasChartInsightOverlaySummary')?.textContent||'');
   if(!/24h/i.test(title)||!/CoinGecko/i.test(summary))return null;
   const stamp=summary.match(/série\s+(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(?::(\d{2}))?/i);
   if(!stamp)return null;
   const [_,dd,mm,yyyy,hh,mi,ss]=stamp;
   const last=new Date(Number(yyyy),Number(mm)-1,Number(dd),Number(hh),Number(mi),Number(ss||0)).getTime();
   if(!Number.isFinite(last)||new Date(last).getDate()!==Number(dd)||Math.abs(last-anchor)>4*3600000)return null;
   const duration=24*3600000;
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
 function externalLineTruth(ref,loadedInstrument){
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
     Number(h.periodDays)!==1||h.currency!=='USD'||!String(h.source||'').includes(n.selectedPair))
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
   const ref=owner(chart),rows=barsFrom(s);
   if(!ref)return {reason:'Hybride : disponible en Solo · prix normal'};
   if(typeof document==='undefined'||document.querySelector('[data-chart-view="base100"].is-active')||document.querySelector('[data-chart-scale="logarithmic"].is-active'))
     return {reason:'Hybride : sélectionner Prix · Normale'};
   if(s?.loading)return {reason:'Chargement des bougies OHLC 1h…'};
   if(!rows.length)return {reason:s?.errorCode?'OHLC indisponibles · '+String(s.errorCode).slice(0,45):'Bougies OHLC 1h non chargées'};
   if(s?.loadedBar!=='1h')return {reason:'Bougies 1h attendues · série '+String(s?.loadedBar||'absente')};
   const symbol=String(ref.ds.atlasCoin.symbol||'').toUpperCase(),instrument=String(s.loadedInstrument||'').toUpperCase();
   const external=globalThis.AgentCryptoNewListingLiveAsset?.snapshot?.();
   const extTruth=external?.active?externalLineTruth(ref,instrument):null;
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
   const first=times[0],last=times.at(-1),duration=last-first;
   if(!(duration>=16*3600000&&duration<=36*3600000)||Math.abs(last-rows.at(-1).t)>4*3600000)
     return {reason:'Ligne conservée · historique décalé'};
   const tail=ref.ds.data.at(-1),endLine=N(Array.isArray(tail)?tail[1]:tail&&typeof tail==='object'?(tail.y??tail.price??tail.value):tail);
   // USDC/USDT remains a distinct quote. Never relabel it USD or make FX;
   // only permit a visually close overlay with explicit provenance.
   if(!(endLine>0)||Math.abs(rows.at(-1).c/endLine-1)>.035)
     return {reason:'Ligne conservée · prix/quote divergents'};
   return {ref,rows,times,first,last,quote,currency,instrument,source:s.source,approximate:!!times.approximate,warning:s.errorCode||null};
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
   // Mimic the native lower histogram's visual width: readable 1h bodies,
   // clamped to avoid collisions if the available chart becomes narrower.
   const spacing=(lane.right-lane.left)/Math.max(inside.length,1);
   const width=Math.max(3,Math.min(22,spacing*.60));
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
     ctx.lineWidth=1.35;ctx.beginPath();ctx.moveTo(x,Math.min(yh,lane.bodyBottom-22));ctx.lineTo(x,yl);ctx.stroke();
     // Visual minimums: 14px bodies, 22px wicks. No additional panel.
     const actual=Math.abs(yc-yo);
     const bodyHeight=Math.max(14,actual);
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
 const plugin={id:'agentCryptoNativeLineCandles',afterDatasetsDraw(chart){
   if(chart?.canvas?.id!=='mainChart'||!mode())return;
   const result=matching(chart,globalThis.AgentCryptoMarketMicroscope?.snapshot?.());
   if(!result.ref){hint(result.reason);return;}
   const count=drawBars(chart,result);
   hint(count?'Ligne + bougies basses · '+count+' × 1h · '+result.instrument+(result.approximate?' · position estimée':'')+(result.warning?' · OHLC conservées':''):'Ligne conservée · bougies hors période',
     'Courbe '+result.currency+' ; OHLC '+result.quote+' distincte et non convertie. Bande basse = amplitude de chaque bougie translatée au même pied ; n’est pas une échelle du prix USD. Amplitudes visuelles racine carrée, corps min 14px, mèches min 22px ; pas un axe de prix. '+result.source+(result.approximate?' · Alignement horizontal estimé depuis le dernier horodatage CoinGecko vérifié.':'') );
 }};
 function refresh(){
   if(typeof document==='undefined')return;
   const chart=globalThis.Chart?.getChart?.(document.getElementById('mainChart'));
   if(chart?.draw)try{chart.draw();}catch(_){}
   if(!mode())hint('');
 }
 if(globalThis.Chart?.register)globalThis.Chart.register(plugin);
 if(typeof window!=='undefined')for(const event of ['agent-crypto:market-candles-loaded','agent-crypto:quote-architecture-changed','agent-crypto:selected-market-changed','agent-crypto:external-asset-changed'])
   window.addEventListener(event,refresh,{passive:true});
 globalThis.AgentCryptoLineCandleOverlay=Object.freeze({refresh,barsFrom,nativeTimeline,externalLineTruth,matching,miniLane,miniGeometry,drawBars,plugin,strip_ratio:.24,read_only:true,real_order:false,market_core_changed:false});
})();