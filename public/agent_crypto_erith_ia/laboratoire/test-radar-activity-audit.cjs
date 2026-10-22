'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const audit=require('./radar-activity-audit.js');
const source=path.resolve(__dirname,'../data/trader_flux/radar20_regimes/annotated_trades.json');
test('published 258 historical accepted PAPER trades partition exactly by UTC hour',()=>{
 const x=audit.audit(JSON.parse(fs.readFileSync(source,'utf8')));
 assert.equal(x.no_execution,true);
 assert.equal(x.not_all_signals,true);
 assert.equal(x.not_native_exchange_trade_count,true);
 assert.equal(x.total.trades,258);
 assert.equal(x.total.winners,94);
 assert.equal(x.groups.length,6);
 assert.deepEqual(x.groups.map(g=>g.overall.trades),[126,92,24,16,0,0]);
 assert(x.groups.slice(4).every(g=>g.overall.pnl_net_usdt===null));
 assert.equal(x.groups.reduce((n,g)=>n+g.quarters.reduce((v,p)=>v+p.trades,0),0),258);
 assert(x.groups.some(g=>g.quarters[0].trades>0&&g.quarters[1].trades>0));
});
test('descriptive hourly buckets never masquerade as native transaction counts',()=>{
 const raw=JSON.parse(fs.readFileSync(source,'utf8'));
 const first=raw.trades[0],bad={...raw,trades:[{...first,entry_utc:'2026-04-02T30:00:00Z'},...raw.trades.slice(1)]};
 assert.throws(()=>audit.audit(bad),/non conforme/);
 assert.throws(()=>audit.audit({...raw,orders_enabled:true}),/non conforme/);
 assert.equal(audit.aggregate([]).win_rate_pct,null);
 assert.equal(audit.aggregate([]).pnl_net_usdt,null);
});
