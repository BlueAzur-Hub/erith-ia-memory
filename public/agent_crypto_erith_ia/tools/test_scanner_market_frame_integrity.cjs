'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.resolve(__dirname, '../administrator/app.js'), 'utf8');
function segment(begin, end) {
  const a = source.indexOf(begin), b = source.indexOf(end, a + begin.length);
  assert.ok(a !== -1 && b > a, `missing scanner owner: ${begin}`);
  return source.slice(a, b);
}
function setup() {
  const ctx = {
    Date, Number, Math, Map,
    ATLAS_PUBLIC_MARKET_ANALYSIS_MAX_AGE_MS: 45 * 60 * 1000,
    ATLAS_ANALYSIS_MAX_AGE_MS: 15 * 60 * 1000,
    ATLAS_SCANNER_TARGET: 5,
    atlasScannerTransaction: {id: 7},
    atlasScannerCurrent: () => true,
    atlasScannerAligned: rows => rows,
    atlasScannerSetTransactionFlag: () => {},
    atlasScannerLabel: p => p,
    atlasScannerVisibleFailure: (p, msg, details) => {ctx.lastFailure = {p, msg, details}; return false},
    atlasCurrentMarketFrame: () => ctx.frame,
    atlasScannerHistoryKind: () => 'cache',
    atlasScannerMarketMetricLabel: () => 'Market 24h',
    atlasScannerSeriesCoversWindow: () => ({ok:false}),
  };
  vm.createContext(ctx);
  const fresh = segment('function atlasScannerMarketFreshness(', 'function atlasScannerPool(');
  const decorate = segment('function atlasScannerDecorateEntry(', 'function atlasScannerRowsWindowCount(');
  const commitHead = segment('function atlasScannerCommit(', '  const ids = prevalidated.map(entry => entry.coin.id);');
  vm.runInContext(fresh + '\n' + decorate + '\n' + commitHead + '\nreturn true;\n}\n', ctx);
  return ctx;
}
const frame = (age, mode='direct', id='f1') => ({id,fingerprint:id,status:'ready',mode,
  timestamp:new Date(Date.now()-age).toISOString()});
const tx = () => ({preset:'gainers', period:1,candidateIds:['btw'],
  marketFrameId:'f1',marketFrameFingerprint:'f1',candidateMetrics:{btw:44.75},
  controller:{signal:{aborted:false}}});
const entry = () => ({coin:{id:'btw',symbol:'BTW'},result:{series:[[1,1],[2,2]]},data:[{y:100},{y:110}]});

test('market date: direct 15 min and public 45 min, no undated/future frame', () => {
  const c=setup(), f=c.atlasScannerMarketFreshness;
  assert.equal(f(frame(60_000)).ok,true);
  assert.equal(f(frame(16*60_000)).ok,false);
  assert.equal(f(frame(30*60_000,'github-public')).ok,true);
  assert.equal(f(frame(46*60_000,'github-public')).ok,false);
  assert.equal(f({status:'ready',mode:'direct'}).ok,false);
  assert.equal(f(frame(-10*60_000)).ok,false);
});
test('Market changed during acquisition: commit refused before chart mutation', () => {
  const c=setup(); c.frame=frame(60_000,'direct','f2');
  assert.equal(c.atlasScannerCommit(tx(),[entry()],[]),false);
  assert.match(c.lastFailure.details,/actualisé/);
});
test('Market expired during acquisition: commit refused before chart mutation', () => {
  const c=setup(); c.frame=frame(16*60_000);
  assert.equal(c.atlasScannerCommit(tx(),[entry()],[]),false);
  assert.match(c.lastFailure.msg,/périmé/);
});
test('Market unchanged: commit may continue to chart owner', () => {
  const c=setup(); c.frame=frame(60_000);
  assert.equal(c.atlasScannerCommit(tx(),[entry()],[]),true);
});
test('frozen metric follows selected BTW even if coin snapshot later changes', () => {
  const c=setup(); const e=c.atlasScannerDecorateEntry(tx(),{id:'btw',change24h:99},entry().result,'cache');
  assert.equal(e.atlasMarketMetric,44.75);
  assert.match(source,/candidateMetrics: Object\.fromEntries\(pool\.map/);
});
test('freshness is checked before ranking and without overwriting the main historical quote', () => {
  const i=source.indexOf('function atlasScannerStart(');
  const p=source.slice(i,source.indexOf('function atlasHandleGainersClick',i));
  assert.ok(p.indexOf('const freshness = atlasScannerMarketFreshness(marketFrame);') < p.indexOf('const pool = atlasScannerPool('));
  assert.match(source,/rawPrice: row\.price/);
  assert.match(source,/chartQuote === "EUR" \? c\?\.priceEur : chartQuote === "USD" \? c\?\.priceUsd/);
});
