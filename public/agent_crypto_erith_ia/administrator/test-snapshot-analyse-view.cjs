'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {analyse}=require('../laboratoire/snapshot-analyse.js');
const NOW=Date.UTC(2026,9,16,21);

class El{
  constructor(tag='div'){
    this.tagName=tag.toUpperCase();this.children=[];this.parentElement=null;
    this.id='';this.className='';this.dataset={};this.textContent='';
    this.listeners={};this.open=false;this.attributes={};
    this.classList={contains:cls=>this.className.split(/\s+/).includes(cls)};
  }
  append(...children){for(const child of children)this.appendChild(child);}
  appendChild(el){el.parentElement=this;this.children.push(el);return el;}
  insertAdjacentElement(place,element){
    assert.equal(place,'beforebegin');
    const parent=this.parentElement;
    assert.ok(parent,"Cannot anchor outside the real panel");
    parent.children.splice(parent.children.indexOf(this),0,element);
    element.parentElement=parent;
  }
  setAttribute(k,v){this.attributes[k]=String(v);}
  addEventListener(name,cb){(this.listeners[name]??=[]).push(cb);}
  fire(name){for(const cb of this.listeners[name]||[])cb({target:this});}
  querySelectorAll(query){
    const tokens=query.split(/\s+/);
    function matches(el,token){
      if(token.startsWith('.'))return el.className.split(/\s+/).includes(token.slice(1));
      if(token.startsWith('[data-snapshot-metric="')){
        const key=token.slice('[data-snapshot-metric="'.length,-2);
        return el.dataset.snapshotMetric===key;
      }
      return el.tagName===token.toUpperCase();
    }
    const found=[];
    function walk(node,ancestors){
      for(const el of node.children){
        if(matches(el,tokens[tokens.length-1]) &&
          (tokens.length===1||ancestors.concat([node]).some(a=>matches(a,tokens[0]))))
          found.push(el);
        walk(el,ancestors.concat([node]));
      }
    }
    walk(this,[]);
    return found;
  }
  querySelector(query){return this.querySelectorAll(query)[0]||null;}
  closest(query){return query==='.chart-shell'?this._chartShell||null:null;}
}
function fixture(days=1,extra={}){
  const series=Array.from({length:days*24+1},(_,i)=>
    [NOW-days*86400000+i*3600000,100+.1*i]);
  return {assetId:'bitcoin',symbol:'BTC',provider:'coingecko',
    source:'Historique USD réel',origin:'market',currency:'USD',
    quoteCurrency:'USD',periodDays:days,published:true,integrityOk:true,
    selectionRevision:21,chartRevision:21,series,...extra};
}
function setup(){
  const panel=new El('article');panel.className='panel chart-panel';
  const shell=new El('div');shell.className='chart-shell';
  shell.dataset.chartState='valid';
  const chart=new El('canvas');chart.id='mainChart';chart._chartShell=shell;
  const legend=new El();legend.id='chartV2Legend';
  const refresh=new El();refresh.id='atlasChartRefresh';
  shell.append(chart,legend,refresh);panel.append(shell);
  const caption=new El();caption.id='chartCaption';panel.append(caption);
  const workspace=new El();workspace.id='market-zone';
  const roots=[panel,workspace];
  const find=id=>{
    let hit=null;
    const traverse=e=>{if(e.id===id)hit=e;e.children.forEach(traverse);};
    roots.forEach(traverse);return hit;
  };
  const listeners={},observers=[];
  class Observer{constructor(cb){this.cb=cb;observers.push(this);}
    observe(el,opts){this.el=el;this.opts=opts;}}
  let publication=null;
  class Clock extends Date{static now(){return NOW;}}
  const ctx={
    Date:Clock,Intl,MutationObserver:Observer,
    document:{readyState:'complete',getElementById:find,createElement:tag=>new El(tag)},
    window:{addEventListener:(name,cb)=>{(listeners[name]??=[]).push(cb);}}
  };
  ctx.globalThis=ctx;
  ctx.AgentCryptoPublishedSeries={read:()=>publication};
  ctx.AgentCryptoSnapshotAnalyse={analyse};
  const js=fs.readFileSync(path.join(__dirname,'js/snapshot-analyse-view.js'),'utf8');
  vm.runInNewContext(js,ctx,{timeout:1000});
  return {ctx,panel,shell,chart,caption,listeners,observers,
    section:()=>find('agentCryptoSnapshotAnalysis'),
    publish:row=>{publication=row;},
    emit:name=>(listeners[name]||[]).forEach(cb=>cb({}))};
}
const get=(el,key)=>el.querySelector('[data-snapshot-metric="'+key+'"] b').textContent;
test('one collapsed strip just ABOVE existing chart, not below it',()=>{
  const x=setup(),section=x.section();
  assert.ok(section);assert.equal(section.tagName,'DETAILS');
  assert.equal(section.open,false);
  assert.equal(section.parentElement,x.panel);
  assert.equal(x.panel.children[0],section);
  assert.equal(x.panel.children[1],x.shell);
  assert.equal(x.shell.children[0],x.chart);
  assert.equal(x.panel.children[2],x.caption);
  assert.equal(section.querySelectorAll('.atlas-snapshot-horizon').length,0);
  assert.equal(section.querySelectorAll('.atlas-snapshot-measure').length,3);
  x.ctx.AgentCryptoSharedSnapshotView.mount();
  assert.equal(x.panel.children.length,3,"no duplicate at second mount");
});
test('BTC 24h: single active horizon and only new metrics',()=>{
  const x=setup();
  x.publish(fixture());
  x.ctx.AgentCryptoSharedSnapshotView.render('test');
  const section=x.section();
  assert.equal(section.dataset.snapshotStatus,'ready');
  assert.match(section.querySelector('.atlas-snapshot-period').textContent,/BTC · 24h/);
  assert.equal(get(section,'drawdown'),'0 %');
  assert.equal(get(section,'coverage'),'100 %');
  assert.equal(get(section,'momentum'),'stable');
  assert.equal(section.querySelectorAll('.atlas-snapshot-measure').length,3);
  assert.doesNotMatch(section.querySelector('.atlas-snapshot-summary').textContent,
    /amplitude|évolution|prix USD/i,"already present in graph legend");
});
test('BTC 7j uses current period only; 30j has no separate card',()=>{
  const x=setup();x.publish(fixture(7));
  x.ctx.AgentCryptoSharedSnapshotView.render();
  assert.equal(x.section().dataset.snapshotStatus,'ready');
  assert.match(x.section().querySelector('.atlas-snapshot-period').textContent,/BTC · 7j/);
  assert.equal(x.section().querySelectorAll('.atlas-snapshot-measure').length,3);
  x.publish(fixture(30));
  x.ctx.AgentCryptoSharedSnapshotView.render();
  assert.match(x.section().querySelector('.atlas-snapshot-period').textContent,/BTC · 30j/);
});
test('unsupported 60j is not falsely analyzed as 24h',()=>{
  const x=setup();x.publish(fixture(60));
  x.ctx.AgentCryptoSharedSnapshotView.render();
  assert.equal(x.section().dataset.snapshotStatus,'not_available');
  assert.equal(get(x.section(),'coverage'),'—');
  assert.match(x.section().querySelector('.atlas-snapshot-explanation').textContent,
    /uniquement.*24 h, 7 j et 30 j/);
});
test('unverified CT/USDT into USD blocked with no stale BTC metrics',()=>{
  const x=setup();x.publish(fixture());x.ctx.AgentCryptoSharedSnapshotView.render();
  assert.equal(get(x.section(),'coverage'),'100 %');
  x.publish(fixture(1,{assetId:'concrete',symbol:'CT',instrument:'CT-USDT',
    provider:'okx',quoteCurrency:'USDT',conversion:{required:true,verified:false}}));
  x.ctx.AgentCryptoSharedSnapshotView.render();
  assert.equal(x.section().dataset.snapshotStatus,'blocked');
  assert.equal(get(x.section(),'coverage'),'—');
  assert.equal(get(x.section(),'drawdown'),'—');
  assert.match(x.section().querySelector('.atlas-snapshot-state').textContent,/Intégrité/);
});
test('missing graph after selection clears metrics immediately',()=>{
  const x=setup();x.publish(fixture());x.ctx.AgentCryptoSharedSnapshotView.render();
  x.publish(null);x.emit('agent-crypto:selected-market-changed');
  assert.equal(x.section().dataset.snapshotStatus,'waiting');
  assert.equal(get(x.section(),'coverage'),'—');
});
test('opening disclosure refreshes from only the canonical owner',()=>{
  const x=setup();x.publish(fixture());
  const section=x.section();
  section.open=true;section.fire('toggle');
  assert.equal(section.dataset.snapshotStatus,'ready');
  assert.match(section.querySelector('.atlas-snapshot-origin').textContent,/coingecko/);
  assert.match(section.querySelector('.atlas-snapshot-glossary').textContent,/Repli maximal/);
});
test('Interface/Trader shared loader only; no polling, storage, second plot or window',()=>{
  const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
  const mirror=fs.readFileSync(path.join(__dirname,'../trader/trader-runtime-mirror.js'),'utf8');
  const js=fs.readFileSync(path.join(__dirname,'js/snapshot-analyse-view.js'),'utf8');
  const css=fs.readFileSync(path.join(__dirname,'css/snapshot-analyse-view.css'),'utf8');
  assert.match(html,/\.\.\/laboratoire\/snapshot-analyse\.js\?feature=shared/);
  assert.match(html,/\.\/js\/snapshot-analyse-view\.js\?feature=shared/);
  assert.match(html,/\.\/css\/snapshot-analyse-view\.css\?feature=shared/);
  assert.doesNotMatch(mirror,/traderSnapshotAnalyseCalculator|snapshot-analyse-native/);
  assert.ok(js.includes('shell.insertAdjacentElement("beforebegin",el)'));
  assert.doesNotMatch(js,/fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|setInterval\s*\(|trade\/order|innerHTML\s*=/);
  assert.doesNotMatch(css,/position\s*:\s*(fixed|absolute)/);
  assert.doesNotMatch(js,/anchor\.insertAdjacentElement|chartCaption/);
});
