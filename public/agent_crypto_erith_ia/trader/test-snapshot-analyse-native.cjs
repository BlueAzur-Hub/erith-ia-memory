'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const {analyse}=require('../laboratoire/snapshot-analyse.js');

const NOW=Date.UTC(2026,9,16,21);
function fixture(extra={}){
  const series=Array.from({length:25},(_,i)=>[NOW-86400000+i*3600000,100+i*.1]);
  return {assetId:'bitcoin',symbol:'BTC',instrument:null,provider:'coingecko',
    source:'Historique direct',currency:'USD',quoteCurrency:'USD',periodDays:1,
    published:true,integrityOk:true,selectionRevision:9,chartRevision:9,
    series,...extra};
}
function setup(){
  class El{
    constructor(tag='div'){this.tagName=tag;this.children=[];this.parentElement=null;
      this.dataset={};this.textContent='';this.className='';this.id='';this.listeners={};}
    append(...els){els.forEach(el=>this.appendChild(el));}
    appendChild(el){this.children.push(el);el.parentElement=this;return el;}
    insertBefore(el,ref){const index=this.children.indexOf(ref);if(index<0)throw Error('missing reference');this.children.splice(index,0,el);el.parentElement=this;}
    addEventListener(name,cb){(this.listeners[name]??=[]).push(cb);}
    querySelectorAll(selector){
      const cls=selector.startsWith('.')?selector.slice(1):null;
      const matches=[];
      const walk=el=>{for(const c of el.children){if(cls&&c.className.split(/\s+/).includes(cls))matches.push(c);walk(c);}};
      walk(this);return matches;
    }
    querySelector(selector){return this.querySelectorAll(selector)[0]||null;}
    closest(selector){return selector==='.chart-shell'?this._chartShell||null:null;}
  }
  const body=new El('div');body.id='detailPanelBody';
  const near=new El('details');near.id='detailSourcesWindow';body.append(near);
  const chart=new El('canvas');chart.id='mainChart';
  const shell=new El('div');shell.className='chart-shell';chart._chartShell=shell;
  const legend=new El('div');legend.id='chartV2Legend';
  const refresh=new El('div');refresh.id='atlasChartRefresh';
  const market=new El('div');market.id='market-zone';
  const roots=[body,chart,shell,legend,refresh,market];
  const find=id=>{let result=null;const walk=el=>{if(el.id===id)result=el;el.children.forEach(walk);};roots.forEach(walk);return result;};
  const listeners={};const observers=[];
  class FakeObserver{constructor(cb){this.cb=cb;observers.push(this);}observe(node,options){this.node=node;this.options=options;}}
  let published=null;
  class Clock extends Date{static now(){return NOW;}}
  const ctx={document:{readyState:'complete',createElement:tag=>new El(tag),getElementById:find},
    window:{addEventListener:(name,cb)=>{(listeners[name]??=[]).push(cb);}},
    MutationObserver:FakeObserver,Date:Clock,Intl,Number,Object,Array,Math,Set};
  ctx.globalThis=ctx;
  ctx.AgentCryptoPublishedSeries={read:()=>published};
  ctx.AgentCryptoSnapshotAnalyse={analyse};
  const script=fs.readFileSync(path.join(__dirname,'snapshot-analyse-native.js'),'utf8');
  vm.runInNewContext(script,ctx,{timeout:1200});
  return {ctx,body,observers,listeners,publish:x=>{published=x;},
    emit:name=>(listeners[name]||[]).forEach(cb=>cb({}))};
}
test('native Snapshot is one disclosure in the existing Technical Reading',()=>{
  const s=setup();
  const section=s.ctx.document.getElementById('agentCryptoSnapshotAnalysis');
  assert.ok(section);
  assert.equal(section.parentElement,s.body);
  assert.equal(s.body.children.indexOf(section),0,'before Sources, no new detached pane');
  assert.equal(section.tagName,'details');
  assert.equal(section.querySelectorAll('.agent-snapshot-card').length,3);
});
test('no synthetic graph; publisher event populates 24h and rejects absent horizons',()=>{
  const s=setup(),section=s.ctx.document.getElementById('agentCryptoSnapshotAnalysis');
  assert.equal(section.dataset.snapshotStatus,'waiting');
  s.publish(fixture());
  const observer=s.observers.find(o=>o.node?.className==='chart-shell');
  assert.ok(observer,'observes canonical chart state without polling');
  observer.cb([]);
  assert.equal(section.dataset.snapshotStatus,'ready');
  const rows=section.querySelectorAll('.agent-snapshot-card');
  assert.equal(rows[0].dataset.snapshotStatus,'ready');
  assert.equal(rows[1].dataset.snapshotStatus,'not_available');
  assert.equal(rows[2].dataset.snapshotStatus,'not_available');
  assert.match(rows[0].querySelector('.agent-snapshot-card-metrics').textContent,/2,4/);
});
test('selection with pending graph clears old metrics and cannot substitute BTC',()=>{
  const s=setup(),section=s.ctx.document.getElementById('agentCryptoSnapshotAnalysis');
  s.publish(fixture());s.emit('agent-crypto:trader-line-loaded');
  assert.equal(section.dataset.snapshotStatus,'ready');
  s.publish(null);s.emit('agent-crypto:trader-selection-changed');
  assert.equal(section.dataset.snapshotStatus,'waiting');
  assert.match(section.querySelector('.agent-snapshot-source').textContent,/Aucune série/);
  assert.equal(section.querySelectorAll('.agent-snapshot-card')[0].querySelector('.agent-snapshot-card-metrics').textContent,'—');
});
test('conversion CT/USDT not verified is blocked with no apparent USD metric',()=>{
  const s=setup(),section=s.ctx.document.getElementById('agentCryptoSnapshotAnalysis');
  s.publish(fixture({assetId:'concrete',symbol:'CT',instrument:'CT-USDT',provider:'okx',
    quoteCurrency:'USDT',conversion:{required:true,verified:false}}));
  s.emit('agent-crypto:external-asset-changed');
  assert.equal(section.dataset.snapshotStatus,'blocked');
  const card=section.querySelectorAll('.agent-snapshot-card')[0];
  assert.equal(card.dataset.snapshotStatus,'blocked');
  assert.match(card.querySelector('.agent-snapshot-card-metrics').textContent,/Aucune métrique/);
});
test('runtime loads pure calculator before the view without modifying graph owners',()=>{
  const loader=fs.readFileSync(path.join(__dirname,'trader-runtime-mirror.js'),'utf8');
  const view=fs.readFileSync(path.join(__dirname,'snapshot-analyse-native.js'),'utf8');
  assert.ok(loader.includes('../laboratoire/snapshot-analyse.js'));
  assert.ok(loader.includes('calc.onload=()=>'));
  assert.ok(loader.includes('../trader/snapshot-analyse-native.js'));
  assert.doesNotMatch(view,/\bfetch\s*\(|\blocalStorage\b|\bsessionStorage\b|setInterval\s*\(|\bXMLHttpRequest\b|trade\/order|innerHTML\s*=/);
  assert.ok(view.includes('AgentCryptoPublishedSeries'));
  assert.ok(view.includes('agentCryptoSnapshotAnalysis'));
});
