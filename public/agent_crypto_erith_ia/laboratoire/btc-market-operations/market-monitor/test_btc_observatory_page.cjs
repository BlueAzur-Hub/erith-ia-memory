'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const htmlPath=path.resolve(__dirname,'..','dashboard.html');
const script=fs.readFileSync(htmlPath,'utf8').match(/<script>\s*([\s\S]*?)\s*<\/script>/)?.[1];
assert(script&&script.includes('coverage-explanation'),'Script must be present');
class Element{
 constructor(tag='div'){this.tagName=tag;this.children=[];this.textContent='';this.attributes={};this.className='';this.disabled=false;this.handlers={};}
 append(...parts){this.children.push(...parts)}appendChild(part){this.children.push(part);return part}
 replaceChildren(...parts){this.children=parts;this.textContent=''}
 removeChild(p){this.children.splice(this.children.indexOf(p),1);return p}
 get firstChild(){return this.children[0]||null}
 setAttribute(k,v){this.attributes[k]=v}
 addEventListener(k,f){this.handlers[k]=f}
 get innerText(){return this.textContent+this.children.map(x=>x.innerText||'').join(' ')}
}
function makeDoc(){const map={};return{map,doc:{getElementById(k){return map[k]||(map[k]=new Element())},createElement(tag){return new Element(tag)},createElementNS(ns,tag){return new Element(tag)},hidden:false}}}
function report(stamp){let t=Date.now();const h=Math.floor(t/3600000)*3600000;const iso=x=>new Date(x).toISOString();return{schema:'seven.crypto.btc-evidence-monitor.v1',orders_enabled:false,spot:{instrument:'BTC-USDC',closed_hours_in_window:2},derivatives:{claim_24_7:false,claim_market_total:false,events_observed_in_24h:5,connection_windows_in_24h:3,providers:{bybit:{recorded_events:5,observed_windows:1,last_event_utc:iso(h-1800000)}}},news:{events_relevant_to_btc_24h:2,source_generated_at:iso(t)},status:'OPERATIONAL_PARTIAL_COVERAGE',generated_at_utc:iso(stamp),hourly:[{hour_utc:iso(h-7200000),open_usdc:'75000',close_usdc:'74200',spot_volume_btc:'10',providers_with_any_connection_in_hour:[],coverage_status:'NO_DOCUMENTED_OBSERVATION'},{hour_utc:iso(h-3600000),open_usdc:'74200',close_usdc:'74100',spot_volume_btc:'18',providers_with_any_connection_in_hour:['bybit'],observed_derivative_liquidation_messages_by_provider:{bybit:0},coverage_status:'SAMPLED_WITH_GAPS'}]}}
async function run(r){const {map,doc}=makeDoc();let value=r;let fn;const context={document:doc,fetch:async()=>{if(value instanceof Error)throw value;return{ok:true,json:async()=>value}},setInterval(){},Intl,Date,Number,Object,Math,Error,Promise};vm.runInNewContext(script,context,{timeout:2000});await new Promise(done=>setTimeout(done,25));return{map,get(k){return map[k]?.innerText||''},set(next){value=next},async refresh(){map.refresh.handlers.click();await new Promise(done=>setTimeout(done,25))}}}

test('report shows coverage gaps as unknown, not zero',async()=>{const ui=await run(report(Date.now()));assert.match(ui.get('system-state'),/Données récentes/);assert.match(ui.get('last-price-time'),/pas un prix en direct/);assert.match(ui.get('summary-scope'),/Paris/);assert.match(ui.get('reading-points'),/Prix Spot OKX/);assert.match(ui.get('coverage-explanation'),/ne signifie pas/);assert.match(ui.get('hourly'),/Non observé/);assert.match(ui.get('hourly'),/0 observé \(partiel\)/)});
test('stale reports are marked stale even if backend status is green',async()=>{const ui=await run(report(Date.now()-4*3600000));assert.match(ui.get('system-state'),/Relevé ancien/);assert.match(ui.get('load-error'),/relevé est ancien/)});
test('a reload clears stale status when newer data arrive',async()=>{const ui=await run(report(Date.now()-4*3600000));ui.set(report(Date.now()));await ui.refresh();assert.match(ui.get('system-state'),/Données récentes/);assert.doesNotMatch(ui.get('load-error'),/ancien/)});
test('invalid or unreachable data never become green',async()=>{const ui=await run(new Error('offline'));assert.match(ui.get('system-state'),/Rapport indisponible/);assert.match(ui.get('load-error'),/offline/)});
test('contract rejects any 24/7 false assertion',async()=>{const d=report(Date.now());d.derivatives.claim_24_7=true;const ui=await run(d);assert.match(ui.get('system-state'),/Rapport indisponible/)});
