/* ERITH.IA · Seven Heaven — immutable OKX 1H evidence -> public news analyzer.
 * Offline batch reader. No network, browser, account, trading or orders.
 * The public OKX capture is NOT exchange-signed. SHA-256 proves repository
 * artifact identity, not exchange authorship or the origin of trades.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const core = require('../SEVEN_HEAVEN_AGENT_CRYPTO_BTC_MARKET_NEWS_READ_ONLY_ANALYSIS_CORE.js');

const RECIPE = 'seven.btc.okx.news.verified-hourly-recipe.v1';
const DATES = Object.freeze(['2026-11-05', '2026-11-08']);
const HOUR = 3600000;
const DEFAULT_AS_OF = '2026-11-10T15:00:00Z';
const DRIVER_SET = new Set(['institutional_flows', 'macro_liquidity', 'regulation', 'leverage']);
const BASE = path.resolve(__dirname, '..', '..', 'okx-hourly-collector', 'evidence');
const FROZEN_NEWS = path.join(__dirname, 'SEVEN_HEAVEN_BTC_OKX_NEWS_FROZEN_2026_11_05_08.json');
const OUTPUT_DIR = path.join(__dirname, 'output');
const REPORT_NAME = 'SEVEN_HEAVEN_BTC_OKX_NEWS_VERIFIED_HOURLY_ANALYSIS_2026_11_10.json';
const DOCUMENT_NAME = 'SEVEN_HEAVEN_BTC_OKX_NEWS_VERIFIED_HOURLY_ANALYSIS_2026_11_10.md';

function assert(ok, message) { if (!ok) throw new Error(message); }
function sha256(bytes) { return crypto.createHash('sha256').update(bytes).digest('hex'); }
function fileDigestJSON(file) {
  const bytes = fs.readFileSync(file);
  return {value:JSON.parse(bytes.toString('utf8')),sha256:sha256(bytes)};
}
function numeric(v,label) {
  assert(typeof v==='string' || typeof v==='number',`BAD_NUMBER_TYPE: ${label}`);
  const n=Number(v);assert(Number.isFinite(n),`BAD_NUMBER: ${label}`);return n;
}
function readEvidence(base=BASE) {
  const root=path.resolve(base);
  const manifest=fileDigestJSON(path.join(root,'index.json'));
  const m=manifest.value;
  assert(m.schema==='seven.crypto.okx-btc-hourly-manifest.v1','MANIFEST_SCHEMA');
  assert(m.instrument==='BTC-USDC' && m.bar==='1H' && m.orders_enabled===false,'MANIFEST_MARKET_OR_ORDER');
  assert(m.total_candles===48 && m.complete_days===2 && Array.isArray(m.files) && m.files.length===2,'MANIFEST_COUNTS');
  assert(JSON.stringify(m.dates_utc)===JSON.stringify(DATES),'MANIFEST_DATES');
  const days=[];
  for(let i=0;i<2;i++){
    const date=DATES[i],meta=m.files[i],expectedName=`btc-usdc-okx-1h-${date}.json`;
    assert(meta?.date_utc===date && meta.file===expectedName && meta.hour_count===24,'MANIFEST_FILE_IDENTITY');
    assert(/^[a-f0-9]{64}$/.test(meta.sha256),'MANIFEST_SHA_INVALID');
    const doc=fileDigestJSON(path.join(root,expectedName));
    assert(doc.sha256===meta.sha256,'EVIDENCE_SHA_MISMATCH');
    const obj=doc.value;
    assert(obj.schema==='seven.crypto.okx-btc-hourly-event-study.v1','EVIDENCE_SCHEMA');
    assert(obj.date_utc===date && obj.venue==='OKX' && obj.instrument==='BTC-USDC' && obj.base==='BTC' && obj.quote==='USDC' && obj.bar==='1H' && obj.interval_minutes===60 && obj.market_type==='SPOT','EVIDENCE_PAIR_OR_VENUE');
    assert(obj.hour_count===24 && Array.isArray(obj.rows) && obj.rows.length===24 && obj.all_candles_closed===true && obj.timestamps_utc_contiguous===true,'EVIDENCE_NOT_COMPLETE');
    assert(obj.no_orders===true && obj.private_account_access===false && obj.causal_claim===false,'EVIDENCE_UNSAFE');
    assert(obj.status==='CAPTURED_FROM_PUBLIC_OKX_API_NOT_EXCHANGE_SIGNED','EVIDENCE_STATUS_INVALID');
    assert(obj.source?.host==='https://eea.okx.com' && /^https:\/\/eea\.okx\.com\/api\/v5\/market\/history-candles\?/.test(obj.source?.request_url||'') && /^[a-f0-9]{64}$/.test(obj.source?.response_sha256||''),'EVIDENCE_SOURCE_UNVERIFIED');
    const start=Date.parse(`${date}T00:00:00Z`),end=start+24*HOUR;
    const rows=obj.rows.map((r,j)=>{
      const t=Number(r?.t),o=numeric(r?.o,`o${j}`),h=numeric(r?.h,`h${j}`),l=numeric(r?.l,`l${j}`),c=numeric(r?.c,`c${j}`),v=numeric(r?.v_btc,`v_btc${j}`),vquote=numeric(r?.v_usdc_quote,`v_usdc${j}`);
      assert(t===start+j*HOUR && t+HOUR<=end && typeof r.utc==='string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(r.utc) && Date.parse(r.utc)===t,'CANDLE_TIME_GAP');
      assert(r.confirm==='1' && o>0 && h>=Math.max(o,c,l) && l<=Math.min(o,c,h) && l>0 && c>0 && v>=0 && vquote>=0,'CANDLE_INVALID');
      return {t,o,h,l,c,v,vquote,confirm:'1'};
    });
    const total=rows.reduce((s,r)=>s+r.v,0);
    const peak=rows.reduce((p,r)=>r.v>p.v?r:p);
    assert(Math.abs(total-numeric(obj.summary.total_volume_btc,'summary total'))<1e-7,'DAILY_VOLUME_SUM_MISMATCH');
    assert(peak.t===Date.parse(obj.summary.peak_base_volume_hour_utc),'PEAK_HOUR_MISMATCH');
    assert(Math.abs(peak.v-numeric(obj.summary.peak_base_volume_btc,'summary peak'))<1e-8,'PEAK_VOLUME_MISMATCH');
    assert(Math.abs(rows[0].o-numeric(obj.summary.open_usdc_per_btc,'summary open'))<1e-7,'DAY_OPEN_MISMATCH');
    assert(Math.abs(rows.at(-1).c-numeric(obj.summary.close_usdc_per_btc,'summary close'))<1e-7,'DAY_CLOSE_MISMATCH');
    days.push({date,sha256:doc.sha256,capture_at:obj.collected_at_utc,source_response_sha256:obj.source.response_sha256,
      rows,summary:{open_usdc:rows[0].o,close_usdc:rows.at(-1).c,
        day_change_pct:Number(((rows.at(-1).c/rows[0].o-1)*100).toFixed(5)),
        volume_btc:total,peak_hour_utc:new Date(peak.t).toISOString(),peak_open_usdc:peak.o,
        peak_close_usdc:peak.c,peak_low_usdc:peak.l,peak_volume_btc:peak.v,
        peak_quote_volume_usdc:peak.vquote,
        peak_change_pct:Number(((peak.c/peak.o-1)*100).toFixed(5)),
        peak_share_of_day_pct:Number((peak.v/total*100).toFixed(5))}});
  }
  return {manifest_sha256:manifest.sha256,days};
}
function qualifyNews(n){
  assert(n && n.schema==='atlas_news_sentinel_world_to_market_v1' && n.causal_claim===false && n.status==='ok','FROZEN_NEWS_SCHEMA');
  assert(Number.isFinite(Date.parse(n.generated_at)) && Array.isArray(n.events),'FROZEN_NEWS_TIMESTAMP');
  assert(n.freeze?.source_blob_sha && /^[a-f0-9]{40}$/.test(n.freeze.source_blob_sha),'FROZEN_NEWS_PROVENANCE');
  assert(n.freeze?.target_dates?.join(',')===DATES.join(','),'FROZEN_NEWS_DATES');
  const ids=new Set();
  for(const e of n.events){
    assert(e && e.assets?.includes('BTC') && DATES.some(d=>e.event_time?.startsWith(d)),'FROZEN_NEWS_OFF_TARGET');
    assert(e.causal_claim===false && e.event_id && !ids.has(e.event_id),'FROZEN_NEWS_DUPLICATE_OR_CAUSAL');
    assert((e.driver_domains||[]).some(d=>DRIVER_SET.has(d)),'FROZEN_NEWS_IRRELEVANT');
    assert(/^https:\/\//.test(e.source_url||'') && Number.isFinite(Date.parse(e.event_time)),'FROZEN_NEWS_SOURCE');
    ids.add(e.event_id);
  }
  return n;
}
function normalizeNews(n,date){return {
  schema:n.schema,generated_at:n.generated_at,status:n.status,causal_claim:false,
  summary:n.summary,events:n.events.filter(x=>x.event_time.startsWith(date))
};}
function eventRelation(eventTime,peakStart){
  const t=Date.parse(eventTime);
  if(t<peakStart-HOUR*2||t>=peakStart+HOUR*3)return 'OUTSIDE_TWO_HOUR_CONTEXT';
  if(t<peakStart)return 'BEFORE_PEAK_HOUR';
  if(t<peakStart+HOUR)return 'DURING_PEAK_HOUR';
  return 'AFTER_PEAK_HOUR';
}
function analyzeVerified({base=BASE,newsFile=FROZEN_NEWS,asOfUtc=DEFAULT_AS_OF}={}){
  assert(asOfUtc===DEFAULT_AS_OF,'AS_OF_MUST_BE_FROZEN_FOR_REPRODUCIBILITY');
  const evidence=readEvidence(base),nSource=fileDigestJSON(newsFile);
  const frozen=qualifyNews(nSource.value);
  assert(Date.parse(frozen.generated_at)<Date.parse(asOfUtc),'NEWS_FROM_FUTURE');
  const result=evidence.days.map(d=>{
    const dayNews=normalizeNews(frozen,d.date);
    const market={loadedInstrument:'BTC-USDC',loadedBar:'1h',source:'OKX PUBLIC API ARCHIVE (SHA256 verified, not exchange-signed)',
      lastLoadedAt:d.capture_at,emaPeriods:[5,13,34],loading:false,error:null,
      rows:d.rows.map(r=>({t:r.t,o:r.o,h:r.h,l:r.l,c:r.c,v:r.v,confirm:r.confirm}))};
    const assessment=core.analyze({market,news:dayNews,asOfUtc});
    assert(assessment.status!=='BLOCKED','CORE_BLOCKED_'+assessment.reason_code);
    assert(assessment.causal_claim===false && assessment.orders_enabled===false,'CORE_SECURITY');
    const peakT=Date.parse(d.summary.peak_hour_utc);
    const near=dayNews.events.map(e=>({event_id:e.event_id,event_at_utc:new Date(Date.parse(e.event_time)).toISOString(),
      headline:e.headline,source_url:e.source_url,driver_domains:e.driver_domains,
      relation_to_peak_hour:eventRelation(e.event_time,peakT)}));
    const possibleBeforePeak=near.filter(e=>e.relation_to_peak_hour==='BEFORE_PEAK_HOUR'||e.relation_to_peak_hour==='DURING_PEAK_HOUR');
    // Even a contemporaneous headline does not establish the cause of a trade.
    return {date_utc:d.date,evidence_file_sha256:d.sha256,api_response_sha256:d.source_response_sha256,
      candle_count:d.rows.length,summary:d.summary,news_events_selected:dayNews.events.length,
      news_publications_relative_to_peak:near,
      news_publications_before_or_during_peak_nearby:possibleBeforePeak.length,
      temporal_core:assessment,
      warning:'A headline publication timestamp is not the occurrence time of its underlying market event.'};
  });
  return {schema:RECIPE,generated_from_frozen_inputs_at_utc:DEFAULT_AS_OF,
    source:'GitHub public immutable captures and selected source news, not private Trader runtime',
    status:'HISTORICAL_READ_ONLY',instrument:'BTC-USDC',venue:'OKX',bar:'1H',days:result.length,
    candles:result.reduce((s,d)=>s+d.candle_count,0),
    source_files:{manifest_sha256:evidence.manifest_sha256,news_snapshot_sha256:nSource.sha256,
      news_original_blob_sha:frozen.freeze.source_blob_sha,news_generated_at:frozen.generated_at},
    orders_enabled:false,real_orders:0,private_account_access:false,causal_claim:false,
    quantitative_etf_flows_from_candles:false,quantitative_liquidations_from_candles:false,
    exchange_signed:false,findings:result,
    limitations:['Spot OHLCV cannot disclose the direction of individual trade initiators or liquidations.',
      'News publication times do not identify what triggered earlier price movements.',
      'No native one-minute bars or derivative liquidation records are included.',
      'The 24-hour daily fragments do not support a continuous 34-hour EMA; EMA34 will be unavailable.',
      'Captured OKX public responses are not cryptographically exchange-signed.']};
}
function fmt(n,d=2){return Number(n).toLocaleString('fr-FR',{minimumFractionDigits:0,maximumFractionDigits:d});}
function asMarkdown(report){
  const lines=[
    '# Seven Heaven — Raccordement automatique des preuves horaires OKX et des actualités',
    '',
    '**Période** : 5 et 8 novembre 2026, heures UTC · **Instrument** : `BTC-USDC`, OKX Spot, `1H`.',
    '**Statut** : recette historique reproductible, source publique figée, lecture seule ; ni explication causale certifiée ni conseil financier.',
    '',
    '| Donnée | 5 novembre | 8 novembre |', '|---|---:|---:|'
  ];
  const [a,b]=report.findings;
  const fields=[
    ['Bougies clôturées',x=>String(x.candle_count)],
    ['Clôture du jour (USDC/BTC)',x=>fmt(x.summary.close_usdc)],
    ['Variation jour (ouverture → clôture)',x=>fmt(x.summary.day_change_pct,3)+' %'],
    ['Pic de volume (UTC)',x=>x.summary.peak_hour_utc.slice(11,16)],
    ['Volume du pic (BTC)',x=>fmt(x.summary.peak_volume_btc,3)],
    ['Variation du pic',x=>fmt(x.summary.peak_change_pct,3)+' %'],
    ['Part du volume journalier',x=>fmt(x.summary.peak_share_of_day_pct,2)+' %'],
    ['Articles datés retenus',x=>String(x.news_events_selected)],
    ['Rapprochements calculés après publication',x=>String(x.temporal_core.counts.matched)],
  ];
  for(const [name,get] of fields)lines.push(`| ${name} | ${get(a)} | ${get(b)} |`);
  lines.push('', '## Chronologie et prudence de l\'analyseur', '');
  for(const d of report.findings){
    lines.push(`### ${d.date_utc} — pic ${d.summary.peak_hour_utc.slice(11,16)} UTC`,
      `- Volume du pic : **${fmt(d.summary.peak_volume_btc,3)} BTC** ; baisse horaire ouverture→clôture **${fmt(d.summary.peak_change_pct,3)} %**.`,
      `- Source brute : \`okx-hourly-collector/evidence/btc-usdc-okx-1h-${d.date_utc}.json\` ; empreinte SHA-256 \`${d.evidence_file_sha256}\`.`,
      `- ${d.temporal_core.counts.matched} événement(s) appariés avec des bougies clôturées après publication ; ${d.temporal_core.counts.unmatched} non appariés. Cela n'établit aucun lien causal.`,
      '- Articles et heure de publication (ce n\'est pas l\'heure certaine de l\'événement évoqué) :');
    for(const e of d.news_publications_relative_to_peak){
      const tag={BEFORE_PEAK_HOUR:'dans les deux heures avant le pic',DURING_PEAK_HOUR:'publié pendant l\'heure du pic',AFTER_PEAK_HOUR:'publié après l\'heure du pic',OUTSIDE_TWO_HOUR_CONTEXT:'hors fenêtre du pic'}[e.relation_to_peak_hour];
      lines.push(`  - ${e.event_at_utc.slice(11,16)} UTC — ${e.headline.replace(/[\[\]|]/g,'')} (${tag}) ; [source](${e.source_url}).`);
    }
    if(!d.news_publications_before_or_during_peak_nearby)
      lines.push('  - **Aucun article qualifié du flux figé n’est publié à proximité immédiate avant ou pendant l’heure du pic.** Ne pas inventer de déclencheur.');
    const te=d.temporal_core.technical;
    lines.push(`- EMA 5/13/34 de cette seule série de 24 heures : ${te.ema_latest.map(v=>v===null?'indisponible':fmt(v,2)).join(' / ')} USDC ; les EMA ne constituent pas une prédiction.`, '');
  }
  lines.push('## Limites des preuves', '',
    '- **Données Spot OKX** : les bougies et leurs volumes BTC ne permettent pas de mesurer les liquidations de positions dérivées ; l’hypothèse de ventes forcées nécessite une source séparée.',
    '- **ETF** : les flux journaliers ne sont ni fournis ni recalculés par ce programme ; un titre d’article ne devient jamais un montant vérifié.',
    '- **Horaires** : le rapprochement est fait sur les publications d’articles ; un article écrit après le pic ne peut pas prouver un déclenchement avant sa publication.',
    '- **Indicateurs** : l’EMA 34 sur une seule journée de 24 bougies reste indisponible ; ne pas présenter cette lecture comme un historique continu.',
    '- **Provenance** : les SHA-256 vérifient l’identité des fichiers GitHub, pas une signature des réponses par OKX.',
    '- **Sécurité** : aucun compte, aucune clé, aucune transaction ni modification de l’Interface, du Trader ou du Bridge.', '',
    '## Reproduction', '',
    `- Lire \`okx-hourly-collector/evidence/index.json\` et vérifier les deux SHA-256 publiés.`,
    `- Lire le lot de nouvelles figé \`verified_hourly_recipe/SEVEN_HEAVEN_BTC_OKX_NEWS_FROZEN_2026_11_05_08.json\`, extrait de \`data/news/latest.json\` dont le Git blob est \`${report.source_files.news_original_blob_sha}\`.`,
    '- Exécuter le programme en Node.js sans accès réseau. Il refuse toute divergence d’instrument, d’heure, de clôture et d’empreinte.',
    '- Les résultats sont descriptifs et rétrospectifs. Ne pas les transformer en signaux de trading.', '',
    '*Seven Heaven — séparation stricte fait, hypothèse, inconnu. Aucun ordre réel.*','');
  return lines.join('\n');
}
function runCLI(argv=process.argv.slice(2)){
  assert(argv.length===1 && (argv[0]==='--check'||argv[0]==='--write'),'USAGE: node ... --check|--write');
  const report=analyzeVerified();
  assert(report.candles===48 && report.days===2 && !report.causal_claim,'RECIPE_ASSERTION');
  if(argv[0]==='--write'){
    fs.mkdirSync(OUTPUT_DIR,{recursive:true});
    fs.writeFileSync(path.join(OUTPUT_DIR,REPORT_NAME),JSON.stringify(report,null,2)+'\n');
    fs.writeFileSync(path.join(OUTPUT_DIR,DOCUMENT_NAME),asMarkdown(report));
  }
  process.stdout.write(JSON.stringify({status:report.status,days:report.days,candles:report.candles,
    matched:report.findings.map(d=>({day:d.date_utc,articles:d.news_events_selected,matched:d.temporal_core.counts.matched,peak:d.summary.peak_hour_utc,volume_btc:d.summary.peak_volume_btc})),
    write:argv[0]==='--write'})+'\n');
  return report;
}
if(require.main===module){try{runCLI();}catch(e){console.error('SEVEN_BTC_RECIPE_BLOCKED:',e.message);process.exitCode=1;}}
module.exports=Object.freeze({readEvidence,qualifyNews,normalizeNews,eventRelation,analyzeVerified,asMarkdown,runCLI,RECIPE,DEFAULT_AS_OF});
