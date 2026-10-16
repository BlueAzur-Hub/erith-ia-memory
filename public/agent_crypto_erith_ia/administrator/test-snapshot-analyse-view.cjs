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
    this.className='';this.id='';this.textContent='';this.dataset={};
    this.listeners={};this.hidden=false;
    this.classList={contains:c=>this.className.split(/\s+/).includes(c)};
  }
  append(...elements){elements.forEach(x=>this.appendChild(x));}
  appendChild(el){el.parentElement=this;this.children.push(el);return el;}
  insertAdjacentElement(where,el){
    assert.equal(where,'afterend');
    if(!this.parentElement)throw Error('detached anchor');
    const parent=this.parentElement;
    parent.children.splice(parent.children.indexOf(this)+1,0,el);el.parentElement=parent;
  }
  setAttribute(name,value){this[name]=value;}
  addEventListener(name,fn){(this.listeners[name]??=[]).push(fn);}
  querySelectorAll(query){
    const items=[];
    const walk=(el,ancestors)=>{
      for(const c of el.children){
        const parentClasses=ancestors.concat([el.className]);
        const parts=query.trim().split(/\s+/);
        const direct=parts[parts.length-1];
        const matches=direct.startsWith('.')?c.className.split(/\s+/).includes(direct.slice(1)):
          direct.toUpperCase()===c.tagName;
        const ancestor=parts.length===1||parentClasses.some(x=>x.split(/\s+/).includes(parts[0].slice(1)));
        if(matches&&ancestor)items.push(c);
        walk(c,parentClasses);
      }
    };
    walk(this,[]);return items;
  }
  querySelector(q){return this.querySelectorAll(q)[0]||null;}
  closest(selector){if(selector==='.chart-shell')return this._chartShell||null;return null;}
}
function fixture(days=1,extra={}){
  const series=Array.from({length:days*24+1},(_,i)=>[NOW-days*86400000+i*3600000,100+.1*i]);
  return {assetId:'bitcoin',symbol:'BTC',instrument:null,provider:'coingecko',source:'Historique vérifié',
    origin:'market',currency:'USD',quoteCurrency:'USD',periodDays:days,
    published:true,integrityOk:true,selectionRevision:21,chartRevision:21,series,...extra};
}
function setup(){
  const chartPanel=new El('article');chartPanel.className='panel chart-panel';
  const caption=new El('div');caption.id='chartCaption';chartPanel.append(caption);
  const chart=new El('canvas');chart.id='mainChart';
  const chartShell=new El('div');chartShell.className='chart-shell';chart._chartShell=chartShell;
  const legend=new El();legend.id='chartV2Legend';
  const refresh=new El();refresh.id='atlasChartRefresh';
  const market=new El();market.id='market-zone';
  const roots=[chartPanel,chart,chartShell,legend,refresh,market];
  function find(id){
    let hit=null;
    const walk=e=>{if(e.id===id)hit=e;e.children.forEach(walk);};
    roots.forEach(walk);return hit;
  }
  const listeners={},observers=[];
  class Observer{constructor(fn){this.fn=fn;observers.push(this);}observe(el,opts){this.element=el;this.opts=opts;}}
  let published=null;
  class Clock extends Date{static now(){return NOW;}}
  const env={
    Date:Clock,Intl,console,
    MutationObserver:Observer,
    document:{readyState:'complete',createElement:tag=>new El(tag),getElementById:find},
    window:{addEventListener:(name,fn)=>{(listeners[name]??=[]).push(fn);}}
  };
  env.globalThis=env;
  env.AgentCryptoPublishedSeries={read:()=>published};
  env.AgentCryptoSnapshotAnalyse={analyse};
  const script=fs.readFileSync(path.join(__dirname,'js/snapshot-analyse-view.js'),'utf8');
  vm.runInNewContext(script,env,{timeout:2000});
  return {env,chartPanel,caption,observers,listeners,
    section:()=>find('agentCryptoSnapshotAnalysis'),
    publish:value=>{published=value;},
    emit:name=>(listeners[name]||[]).forEach(fn=>fn({}))};
}
test('shared view mounts once under chart, wide, not in Technical Reading',()=>{
  const x=setup(),section=x.section();
  assert.ok(section);assert.equal(section.parentElement,x.chartPanel);
  assert.equal(x.chartPanel.children.indexOf(section),1);
  assert.equal(section.querySelectorAll('.atlas-snapshot-horizon').length,3);
  x.env.AgentCryptoSharedSnapshotView.mount();
  assert.equal(x.chartPanel.children.length,2);
  assert.equal(section.querySelector('.atlas-snapshot-update').tagName,'BUTTON');
});
test('24h verified with useful explanation, 7j and 30j unavailable',()=>{
  const x=setup();x.publish(fixture());
  x.env.AgentCryptoSharedSnapshotView.render('test');
  const section=x.section(),cards=section.querySelectorAll('.atlas-snapshot-horizon');
  assert.equal(cards[0].dataset.snapshotStatus,'ready');
  assert.equal(cards[1].dataset.snapshotStatus,'not_available');
  assert.equal(cards[2].dataset.snapshotStatus,'not_available');
  assert.match(cards[0].querySelector('.atlas-snapshot-meaning').textContent,/prix final/i);
  assert.match(cards[0].querySelector('.atlas-snapshot-number strong').textContent,/2,4/);
  assert.match(cards[1].querySelector('.atlas-snapshot-meaning').textContent,/pas assez d’historique/i);
});
test('supports 7j and 30j only when drawn archive covers real period',()=>{
  const x=setup();x.publish(fixture(30));
  x.env.AgentCryptoSharedSnapshotView.render('30 days');
  const cards=x.section().querySelectorAll('.atlas-snapshot-horizon');
  assert.equal(cards[2].dataset.snapshotStatus,'ready');
  assert.equal(cards[1].dataset.snapshotStatus,'ready');
});
test('switch to pending publication immediately clears BTC values',()=>{
  const x=setup();x.publish(fixture());x.env.AgentCryptoSharedSnapshotView.render();
  x.publish(null);x.emit('agent-crypto:selected-market-changed');
  assert.equal(x.section().dataset.snapshotStatus,'waiting');
  assert.equal(x.section().querySelector('.atlas-snapshot-number strong').textContent,'—');
});
test('CT quote USD/USDT unproven is blocked without amounts',()=>{
  const x=setup();x.publish(fixture(1,{assetId:'concrete',symbol:'CT',instrument:'CT-USDT',
    provider:'okx',quoteCurrency:'USDT',conversion:{required:true,verified:false}}));
  x.env.AgentCryptoSharedSnapshotView.render();
  const a=x.section().querySelectorAll('.atlas-snapshot-horizon')[0];
  assert.equal(a.dataset.snapshotStatus,'blocked');
  assert.equal(a.querySelector('.atlas-snapshot-number strong').textContent,'—');
});
test('Interface and Trader inherit one shared loader and no obsolete side pane',()=>{
  const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
  const mirror=fs.readFileSync(path.join(__dirname,'../trader/trader-runtime-mirror.js'),'utf8');
  const js=fs.readFileSync(path.join(__dirname,'js/snapshot-analyse-view.js'),'utf8');
  const css=fs.readFileSync(path.join(__dirname,'css/snapshot-analyse-view.css'),'utf8');
  assert.match(html,/\.\.\/laboratoire\/snapshot-analyse\.js\?feature=shared/);
  assert.match(html,/\.\/js\/snapshot-analyse-view\.js\?feature=shared/);
  assert.match(html,/\.\/css\/snapshot-analyse-view\.css\?feature=shared/);
  assert.doesNotMatch(mirror,/traderSnapshotAnalyseCalculator|snapshot-analyse-native/);
  assert.ok(js.includes('anchor.insertAdjacentElement("afterend",section)'));
  assert.doesNotMatch(js,/fetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|setInterval\s*\(|trade\/order|innerHTML\s*=/);
  assert.doesNotMatch(css,/position\s*:\s*fixed|position\s*:\s*absolute/);
});
