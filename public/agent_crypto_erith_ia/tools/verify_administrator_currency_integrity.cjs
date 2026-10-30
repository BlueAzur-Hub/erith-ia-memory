"use strict";
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../administrator/app.js'),'utf8');
const extract=name=>{
  const start=source.indexOf('function '+name+'(');
  assert.ok(start>=0,'missing '+name);
  const piece=source.slice(start).match(/^function [\s\S]*?\n}\n/);
  assert.ok(piece,'cannot isolate '+name);
  return piece[0];
};
const functions=[
  'atlasHistoricalDisplayQuote','atlasRequestedHistoricalCurrency',
  'atlasComparisonCertifiedCurrency','atlasComparisonSourceDescription',
  'atlasComparisonVisibleCurrency','atlasComparisonCurrencyTransition',
  'atlasNearestComparisonPoint','atlasComparisonTooltipRows',
  'atlasExternalChartTooltip'
];
let selected='EUR';
let node={innerHTML:'',dataset:{},hidden:true,setAttribute(){}};
const stub=`
  const globalThis={AgentCryptoQuoteCurrencyArchitecture:{snapshot:()=>({displayCurrency:selection.value})}};
  const atlasHistoryQuoteProvenance=result=>({
    quoteConflict:result.conflict===true,
    historySourceFamily:result.historySourceFamily||null,
    quoteCurrency:result.quoteCurrency||null
  });
  const atlasChartProviderLabel=()=>"Binance historique";
  const atlasChartTooltipNode=()=>presentation.node;
  const atlasMedianInterval=()=>1;
  const atlasHideChartTooltip=()=>{};
  const atlasCryptoPalette=()=>({primary:'#abcdef'});
  const atlasCryptoGradientCss=()=>"linear-gradient(#abc,#def)";
  const atlasChartTooltipCoinMarkup=coin=>'<span>'+coin.symbol+'</span>';
  const atlasChartTooltipChangeMarkup=value=>'<small>'+String(value)+'</small>';
  const atlasChartPeriodLabel=()=>"24h";
  const atlasChartPriceDatasets=chart=>chart?.data?.datasets||[];
  const atlasChartLivePresentation=()=>null;
  const atlasFormatNativeChartQuote=(amount,currency)=>String(amount)+(currency==='EUR'?' €':' $US');
  const escapeHtml=value=>String(value);
  const requestAnimationFrame=callback=>{};
  const atlasPositionChartTooltip=()=>{};
  const state={chartPeriodDays:1};
`;
const selection={value:selected};
const presentation={node};
const api=Function('selection','presentation',stub+functions.map(extract).join('\n')+
  ';return {requested:atlasRequestedHistoricalCurrency,certified:atlasComparisonCertifiedCurrency,source:atlasComparisonSourceDescription,visible:atlasComparisonVisibleCurrency,transition:atlasComparisonCurrencyTransition,tooltip:atlasExternalChartTooltip};')(selection,presentation);
const entry=(symbol,currency)=>({coin:{id:symbol.toLowerCase(),symbol},result:{quoteCurrency:currency,historySourceFamily:'binance',series:[[1,100],[2,101]]}});
const entries=['BTC','ETH','BNB','XRP','SOL'].map(symbol=>entry(symbol,'EUR'));
selection.value='';
assert.equal(api.requested(),'EUR','boot fallback must match existing quote owner');
selection.value='EUR';
assert.equal(api.requested(),'EUR');
assert.equal(api.certified(entries),'EUR');
assert.match(api.source(entries),/historiques EUR · Base 100/);
assert.equal(api.certified(entries.map(e=>({...e,result:{...e.result,quoteCurrency:'USD'}}))),'USD');
assert.equal(api.certified(entries.slice(0,4).concat(entry('SOL','USD'))),null);
assert.match(api.source(entries.slice(0,4).concat(entry('SOL','USD'))),/DEVISE NON QUALIFIÉE OU MIXTE/);
assert.equal(api.certified(entries.slice(0,4).concat(entry('SOL',null))),null);
const chartFor=currency=>({
  $atlasMode:'comparison', $atlasPeriod:1,
  data:{datasets:entries.map(entry=>({
    atlasCoin:entry.coin, atlasHistoricalQuote:{currency,source:'Binance'},
    atlasPrimaryColor:'#abcdef', data:[{x:1,y:100,rawPrice:123},{x:2,y:101,rawPrice:124}]
  }))}
});
const chartEur=chartFor('EUR'),chartUsd=chartFor('USD');
assert.equal(api.visible(chartEur),'EUR');
assert.equal(api.transition(chartEur),null);
selection.value='USD';
assert.deepEqual(api.transition(chartEur),{visible:'EUR',requested:'USD'});
const hover=chart=>({chart,tooltip:{opacity:1,dataPoints:[{parsed:{x:1},dataIndex:0,dataset:chart.data.datasets[0]}]}});
api.tooltip(hover(chartEur));
assert.match(node.innerHTML,/PRIX HISTORIQUES EUR/);
assert.match(node.innerHTML,/USD DEMANDÉ · HISTORIQUE EUR CONSERVÉ/);
assert.match(node.innerHTML,/123 €/);
assert.doesNotMatch(node.innerHTML,/123 \$US/);
assert.equal(node.dataset.displayCurrency,'EUR');
api.tooltip(hover(chartUsd));
assert.match(node.innerHTML,/PRIX HISTORIQUES USD/);
assert.doesNotMatch(node.innerHTML,/HISTORIQUE EUR CONSERVÉ/);
assert.match(node.innerHTML,/123 \$US/);
selection.value='EUR';
api.tooltip(hover(chartUsd));
assert.match(node.innerHTML,/EUR DEMANDÉ · HISTORIQUE USD CONSERVÉ/);
// An acquisition cannot silently validate a basket from the wrong native currency.
const comparison=extract('renderComparisonAnalystPanel');
assert.match(comparison,/requestedCurrency !== atlasRequestedHistoricalCurrency\(\)/);
assert.match(comparison,/atlasHistoricalDisplayQuote\(item\.result\)\.currency === requestedCurrency/);
assert.match(comparison,/atlasComparisonCertifiedCurrency\(normalizedEntries\) === requestedCurrency/);
assert.match(comparison,/wrongCurrency\.map\(item => item\.coin\.id\)/);
assert.match(comparison,/atlasComparisonCurrencyTransition\(state\.chartEngineV2\?\.realChart\)/);
assert.match(comparison,/indisponible · historique/);
const restoration=extract('atlasWorkspaceRestoreCachedGraph');
assert.match(restoration,/atlasHistoricalDisplayQuote\(result\)\.currency === requestedCurrency/);
assert.match(restoration,/atlasComparisonCertifiedCurrency\(aligned\) !== requestedCurrency/);
assert.ok(!source.includes('· historiques EUR · Base 100`'),'old hard-coded EUR source metadata survived');
assert.match(source,/Base 100 \$\{comparisonCurrencyLabel\}/);
console.log('PASS: native EUR/USD provenance, mixed quotes blocked, retained-canvas truth, switch in both directions, workspace guard');
