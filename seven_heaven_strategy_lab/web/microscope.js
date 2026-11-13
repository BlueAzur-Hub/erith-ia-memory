"use strict";
/* Seven Heaven V4.2 — fully local historical OHLCV/PAPER marker viewer.
 * No CDN, no external bot library, no account secrets, no exchange order APIs.
 * Display is tied to a saved run ID: never mix current UI draft with old fills.
 */
(() => {
  const $ = id => document.getElementById(id);
  const ns="http://www.w3.org/2000/svg";
  const fmt=(v,d=2)=>Number(v).toLocaleString("fr-FR",{maximumFractionDigits:d});
  const utc=t=>new Date(t*1000).toISOString().slice(0,16).replace("T"," ")+" UTC";
  let recordId=null, snapshot=null, serial=0, pending=false;
  const integer=v=>Number.isInteger(v)&&Number.isFinite(v);
  function svg(tag,attrs={},value){
    const element=document.createElementNS(ns,tag);
    for(const [name,data] of Object.entries(attrs))element.setAttribute(name,String(data));
    if(value!==undefined)element.textContent=String(value);
    $("market-candle-chart").append(element);
    return element;
  }
  function linePath(candles,key,scaleX,scaleY){
    let path="",started=false;
    candles.forEach((c,i)=>{
      const val=c[key];
      if(val===null||!Number.isFinite(val)){started=false;return;}
      path+=(started?" L":" M")+scaleX(i).toFixed(2)+" "+scaleY(val).toFixed(2);
      started=true;
    });
    return path;
  }
  function draw(){
    const root=$("market-candle-chart");
    root.replaceChildren();
    if(!snapshot||!snapshot.candles?.length)return;
    const rows=snapshot.candles,flags={
      ema:$("micro-ema").checked,sma:$("micro-sma").checked,
      bb:$("micro-bb").checked,vwap:$("micro-vwap").checked,
      trades:$("micro-trades").checked
    };
    const X0=32,X1=864,Y0=36,Y1=306,V0=336,V1=415;
    const spacing=(X1-X0)/rows.length;
    const px=i=>X0+(i+.5)*spacing;
    const plotValues=rows.flatMap(c=>[c.l,c.h]);
    for(const c of rows){
      if(flags.ema)plotValues.push(c.ema_fast,c.ema_slow);
      if(flags.sma)plotValues.push(c.sma20);
      if(flags.bb)plotValues.push(c.bb_upper,c.bb_lower);
      if(flags.vwap)plotValues.push(c.vwap_daily);
    }
    if(flags.trades)for(const m of snapshot.markers)plotValues.push(m.price);
    const valid=plotValues.filter(x=>x!==null&&Number.isFinite(x));
    if(valid.length===0)return;
    let min=Math.min(...valid),max=Math.max(...valid);
    const pad=Math.max((max-min)*.085,Math.abs(max)*.0005,1e-8);
    min-=pad;max+=pad;
    const py=v=>Y0+(max-v)/(max-min)*(Y1-Y0);
    const maxVol=Math.max(1e-12,...rows.map(c=>c.v));
    svg("rect",{x:0,y:0,width:960,height:460,fill:"#071c2a"});
    for(let j=0;j<=5;j++){
      const y=Y0+(Y1-Y0)*j/5;
      svg("line",{x1:X0,y1:y,x2:X1,y2:y,stroke:"#284857","stroke-width":1});
      svg("text",{x:872,y:y+3,fill:"#8eb4c3","font-size":12},fmt(max-j*(max-min)/5,2));
    }
    for(let j=0;j<=5;j++){
      const i=Math.round((rows.length-1)*j/5),x=px(i);
      svg("line",{x1:x,y1:Y0,x2:x,y2:V1,stroke:"#264257",
                  "stroke-opacity":.5,"stroke-width":1});
      svg("text",{x,y:449,fill:"#a9c7d2","font-size":11,
                  "text-anchor":j===0?"start":j===5?"end":"middle"},utc(rows[i].t).slice(0,16));
    }
    svg("rect",{x:X0,y:V0,width:X1-X0,height:V1-V0,fill:"#0b2634",
                stroke:"#284759","stroke-width":1});
    svg("text",{x:X0+4,y:V0+13,fill:"#9bb6c3","font-size":10}, "VOLUME · "+snapshot.base);
    svg("text",{x:X0+4,y:Y0-14,fill:"#e5d3a4","font-size":11},
        "PRIX HISTORIQUE · "+snapshot.quote);
    const bodyWidth=Math.max(2,Math.min(12,spacing*.7));
    const markers=new Map();
    for(const m of snapshot.markers){
      if(!markers.has(m.t))markers.set(m.t,[]);
      markers.get(m.t).push(m);
    }
    rows.forEach((c,i)=>{
      const x=px(i),up=c.c>=c.o,col=up?"#72e4ce":"#ff95aa";
      svg("line",{x1:x,y1:py(c.h),x2:x,y2:py(c.l),stroke:col,"stroke-width":1.6});
      const y1=py(Math.max(c.o,c.c)),y2=py(Math.min(c.o,c.c));
      svg("rect",{x:x-bodyWidth/2,y:y1,width:bodyWidth,height:Math.max(1.5,y2-y1),
                  fill:col,"fill-opacity":up?.83:.92});
      const volHeight=(V1-V0-16)*c.v/maxVol;
      svg("rect",{x:x-bodyWidth/2,y:V1-volHeight,width:bodyWidth,
                 height:Math.max(.5,volHeight),fill:col,"fill-opacity":.48});
    });
    function overlay(key,color,width=2,dash=""){
      const d=linePath(rows,key,px,py);
      if(d.trim())svg("path",{d,fill:"none",stroke:color,
                            "stroke-width":width,"stroke-dasharray":dash,
                            "stroke-linejoin":"round","stroke-linecap":"round"});
    }
    if(flags.bb){overlay("bb_upper","#709bc2",1.2,"4 4");overlay("bb_lower","#709bc2",1.2,"4 4");}
    if(flags.sma)overlay("sma20","#e5d08d",2.1);
    if(flags.vwap)overlay("vwap_daily","#db93e9",2);
    if(flags.ema){overlay("ema_fast","#7debef",2.2);overlay("ema_slow","#eca76c",2.1);}
    if(flags.trades){
      const byTs=new Map(rows.map((c,i)=>[c.t,i]));
      for(const m of snapshot.markers){
        const idx=byTs.get(m.t);
        if(idx===undefined)continue;
        const x=px(idx),up=m.side==="BUY",y=py(m.price);
        const color=up?"#9effcf":"#ffb8bd";
        const pts=up
          ? x+","+(y+5)+" "+(x-7)+","+(y+19)+" "+(x+7)+","+(y+19)
          : x+","+(y-5)+" "+(x-7)+","+(y-19)+" "+(x+7)+","+(y-19);
        const shape=svg("polygon",{points:pts,fill:color,
          stroke:"#071b29","stroke-width":2,"class":"micro-fill-marker"});
        const tip=document.createElementNS(ns,"title");
        tip.textContent=(up?"ACHAT":"VENTE")+" PAPER · "+utc(m.t)+
          " · "+fmt(m.qty,8)+" "+snapshot.base+
          " à "+fmt(m.price,3)+" "+snapshot.quote+" · frais "+fmt(m.fee,4);
        shape.append(tip);
      }
    }
    // Hit areas are transparent and above visual elements; hover does not
    // mutate the simulation or issue another request.
    rows.forEach((c,i)=>{
      const target=svg("rect",{x:X0+i*spacing,y:Y0,width:spacing,
        height:V1-Y0,fill:"transparent",class:"micro-hover-target"});
      const title=document.createElementNS(ns,"title");
      title.textContent=utc(c.t)+" | O "+fmt(c.o,2)+" · H "+fmt(c.h,2)+
        " · L "+fmt(c.l,2)+" · C "+fmt(c.c,2)+" · Vol "+fmt(c.v,4);
      target.append(title);
      target.addEventListener("pointerenter",()=>{
        const executions=markers.get(c.t)||[];
        $("micro-candle-readout").textContent=utc(c.t)+
          "  ·  O "+fmt(c.o,2)+"  H "+fmt(c.h,2)+"  L "+fmt(c.l,2)+
          "  C "+fmt(c.c,2)+" "+snapshot.quote+
          "  ·  VOL "+fmt(c.v,4)+" "+snapshot.base+
          (executions.length?"  ·  "+executions.map(m=>m.side+" PAPER "+fmt(m.price,2)).join(" / "):"");
      });
    });
  }
  function updateNavigation(){
    if(!snapshot)return;
    const limit=Number($("micro-limit").value);
    const maxStart=Math.max(0,snapshot.total_bars-limit);
    $("micro-prev").disabled=pending||snapshot.start_index<=0;
    $("micro-next").disabled=pending||snapshot.end_index_exclusive>=snapshot.total_bars;
    const slider=$("micro-range");
    slider.max=String(maxStart);
    slider.value=String(snapshot.start_index);
    slider.disabled=pending||maxStart===0;
    $("micro-range-label").textContent=(snapshot.start_index+1)+"–"+
      snapshot.end_index_exclusive+" / "+snapshot.total_bars;
  }
  async function load(startIndex=null){
    if(!recordId)return;
    const requestedId=recordId;
    const token=++serial;
    pending=true;
    $("market-microscope").hidden=false;
    $("micro-context").textContent="Vérification du rapport et des bougies historiques…";
    updateNavigation();
    try{
      const query=new URLSearchParams({
        run_id:requestedId,limit:$("micro-limit").value
      });
      if(startIndex!==null)query.set("start_index",String(startIndex));
      const response=await fetch("/api/microscope?"+query.toString(),{cache:"no-store"});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"Source du microscope non disponible");
      if(token!==serial||recordId!==requestedId)return;
      snapshot=data.microscope;
      $("micro-context").textContent=snapshot.exchange+" · "+snapshot.pair+
        " · "+snapshot.timeframe+" · "+snapshot.visible_bars+" bougies historiques";
      $("micro-sha").textContent="SOURCE SHA-256 "+snapshot.source_sha256.slice(0,24)+"…"+
        " · Fills fictifs à l'ouverture suivante";
      draw();
    }catch(e){
      if(token!==serial)return;
      snapshot=null;
      $("market-candle-chart").replaceChildren();
      $("micro-context").textContent="Microscope indisponible : "+e.message;
      $("micro-sha").textContent="La simulation historique reste intacte.";
    }finally{
      if(token===serial){pending=false;updateNavigation();}
    }
  }
  function displayRun(record){
    if(!record?.id)return;
    recordId=record.id;
    snapshot=null;
    $("micro-limit").value="120";
    load();
  }
  function clear(){
    serial+=1;
    recordId=null;
    snapshot=null;
    pending=false;
    $("market-candle-chart").replaceChildren();
    $("market-microscope").hidden=true;
  }
  $("micro-prev").addEventListener("click",()=>{
    if(snapshot&&!pending)
      load(Math.max(0,snapshot.start_index-Number($("micro-limit").value)));
  });
  $("micro-next").addEventListener("click",()=>{
    if(snapshot&&!pending)
      load(Math.min(snapshot.total_bars-Number($("micro-limit").value),
                    snapshot.start_index+Number($("micro-limit").value)));
  });
  $("micro-limit").addEventListener("change",()=>{if(recordId&&!pending)load();});
  $("micro-range").addEventListener("change",event=>{
    if(recordId&&!pending)load(Number(event.target.value));
  });
  for(const id of ["micro-ema","micro-sma","micro-bb","micro-vwap","micro-trades"])
    $(id).addEventListener("change",draw);
  window.AetherMicroscope={displayRun,clear};
})();
