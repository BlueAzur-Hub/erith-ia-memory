/* Tests of the real scanner functions extracted from the current app.js;
 * no mocked second implementation of production guards. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('public/agent_crypto_erith_ia/administrator/app.js', 'utf8');

function extract(start, end) {
  const a = source.indexOf(start), b = source.indexOf(end, a + start.length);
  assert.ok(a >= 0 && b > a, 'source boundary missing: ' + start);
  return source.slice(a, b);
}
const freshnessSource = extract('function atlasScannerMarketFreshness(', 'function atlasScannerPool(');
const directionSource = extract('function atlasScannerDirectionConflicts(', 'function atlasScannerCommit(');
const commitSource = extract('function atlasScannerCommit(', '// Reuse the same exact-ID native USD history');

function context(overrides = {}) {
  const ctx = {
    ATLAS_PUBLIC_MARKET_ANALYSIS_MAX_AGE_MS: 45 * 60 * 1000,
    ATLAS_ANALYSIS_MAX_AGE_MS: 15 * 60 * 1000,
    ATLAS_SCANNER_TARGET: 5,
    fmtPct: n => n.toFixed(2) + '%',
    atlasComparisonCurveChange: entry => entry.data.at(-1).y - 100,
    atlasScannerAligned: entries => entries,
    atlasScannerCurrent: () => true,
    atlasScannerSetTransactionFlag: () => {},
    atlasScannerLabel: preset => preset,
    atlasScannerVisibleFailure: (preset, message, detail) => {
      ctx.lastFailure = { preset, message, detail };
      return false;
    },
    atlasScannerTransaction: { id: 1 },
    state: { dataBroker: { comparison: {}, chart: {} } },
    Date,
    ...overrides
  };
  vm.createContext(ctx);
  vm.runInContext(freshnessSource + '\n' + directionSource + '\n' + commitSource, ctx);
  return ctx;
}
function tx(frame, preset = 'gainers') {
  return {
    preset,
    period: 1,
    candidateIds: ['qnt','xrp','xmr','uni','hype'],
    marketFrameId: frame.id,
    marketFrameFingerprint: frame.fingerprint,
    windowEnd: Date.now()
  };
}
function entry(id, market, history) {
  return { coin: { id, symbol: id.toUpperCase() }, atlasMarketMetric: market,
    data: [{ y: 100 }, { y: 100 + history }], result: { series: [[1, 100],[2, 100 + history]] } };
}
test('fresh market accepted; hours-old and undated market rejected', () => {
  const ctx = context();
  const now = Date.now();
  const frame = age => ({status:'ready', mode:'github-public',timestamp:new Date(now - age).toISOString()});
  assert.equal(ctx.atlasScannerMarketFreshness(frame(20*60000), now).ok, true);
  assert.equal(ctx.atlasScannerMarketFreshness(frame(14*3600000), now).ok, false);
  assert.equal(ctx.atlasScannerMarketFreshness({status:'ready',mode:'direct'}, now).ok, false);
  assert.equal(ctx.atlasScannerMarketFreshness({status:'ready',mode:'direct',timestamp:new Date(now - 16*60000).toISOString()}, now).ok, false);
  assert.equal(ctx.atlasScannerMarketFreshness(frame(-4*60000), now).ok, false);
});
test('QNT positive Market versus falling EUR history blocks Hausses 5', () => {
  const ctx = context();
  const result = ctx.atlasScannerDirectionConflicts(tx({id:'frame'}), [
    entry('qnt',6.85,-3.53),entry('xrp',3.29,3.03),entry('xmr',3.01,0.48)
  ]);
  assert.equal(result.length, 1);
  assert.match(result[0], /QNT.*6.85%.*-3.53%/);
});
test('Baisses 5 opposite direction blocked; Volumes 5 is not direction ranked', () => {
  const ctx = context();
  assert.equal(ctx.atlasScannerDirectionConflicts(tx({id:'frame'},'losers'),[entry('xrp',-3,2)]).length,1);
  assert.equal(ctx.atlasScannerDirectionConflicts(tx({id:'frame'},'volume'),[entry('xrp',200,2)]).length,0);
});
test('real scanner commit fails closed before replacing previous chart on contradiction', () => {
  const frame={status:'ready',mode:'github-public',id:'frame',fingerprint:'freeze',
    timestamp:new Date(Date.now()-60000).toISOString()};
  const ctx=context({atlasCurrentMarketFrame:()=>frame});
  const oldChart={keep:'existing chart'};
  ctx.state.dataBroker.chart=oldChart;
  const rows=[entry('qnt',6.85,-3.53),entry('xrp',3.29,3.03)];
  assert.equal(ctx.atlasScannerCommit(tx(frame),rows,[]),false);
  assert.strictEqual(ctx.state.dataBroker.chart,oldChart);
  assert.match(ctx.lastFailure.detail,/QNT/);
});
test('market change during historical fetch blocks old IDs even if values agree', () => {
  const frame={status:'ready',mode:'github-public',id:'updated',fingerprint:'updated',
    timestamp:new Date(Date.now()-60000).toISOString()};
  const ctx=context({atlasCurrentMarketFrame:()=>frame});
  const oldChart={keep:'existing chart'};
  ctx.state.dataBroker.chart=oldChart;
  assert.equal(ctx.atlasScannerCommit(tx({id:'previous',fingerprint:'previous'}),[
    entry('xrp',3.29,3.03)],[]),false);
  assert.strictEqual(ctx.state.dataBroker.chart,oldChart);
  assert.match(ctx.lastFailure.detail,/Market actualisé/);
});
test('market metric frozen with the candidate IDs at selection', () => {
  assert.match(source,/candidateMetrics: Object\.fromEntries\(pool\.map/);
  assert.match(source,/atlasMarketMetric: tx\.candidateMetrics\?\.\[coin\.id\]/);
  assert.match(source,/const freshness = atlasScannerMarketFreshness\(marketFrame\)/);
});
