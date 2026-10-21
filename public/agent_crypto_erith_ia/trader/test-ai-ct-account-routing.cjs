'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const nodePath=require('node:path');
const root=__dirname;
const account=fs.readFileSync(nodePath.join(root,'trader-okx-account.js'),'utf8');
const ai=fs.readFileSync(nodePath.join(root,'ai-ct-panel.js'),'utf8');
const route=account.split('p.querySelector("[data-okx-analyze-ct]")?.addEventListener("click",async()=>{')[1]
  ?.split('p.querySelector("[data-okx-auth]")?.addEventListener')[0]||'';
const inline=ai.split('async function readForAccount(target){')[1]
  ?.split('const lesson=panel.querySelector')[0]||'';
test('analyze CT from OKX account stays locally without graph scroll or state switch',()=>{
 assert.ok(route.length>100,'CTA account route exists');
 assert.match(route,/target.hidden=false/);
 assert.match(route,/await ai.readForAccount\(target\)/);
 assert.doesNotMatch(route,/scrollIntoView|scrollTo|detailPanelToggle|ai\.open|window\.location|atlasSelectMarketCoin|aiCtRead.*click\(/);
});
test('existing CT gateway is called once for inline account brief, no technical panel repaint',()=>{
 assert.ok(inline.length>100);
 assert.match(inline,/const doc=await loadCtEvidence\(\)/);
 assert.match(inline,/model\.explain\(doc,chart\)/);
 assert.match(inline,/showEvidence\(target,doc\)/);
 assert.match(inline,/showFullReport\(target,report\)/);
 assert.doesNotMatch(inline,/paint\(doc\)|scrollIntoView|detailPanelToggle|\.open\s*=\s*true/);
 assert.equal((ai.match(/BACKEND\+'\/market-book\?provider=okx&instrument=CT-USDC&limit=100'/g)||[]).length,1);
});
test('inline private CT text is hidden on owner logout and denied on lost session',()=>{
 assert.match(account,/function logoutBridge\(\)\{[\s\S]*?inline\.hidden=true;inline\.replaceChildren\(\)/);
 assert.match(account,/error\?\.status===401[\s\S]*?inline\.hidden=true;inline\.replaceChildren\(\)/);
 assert.match(ai,/sessionStorage\.getItem\(TOKEN_KEY\)!==session/);
 assert.match(ai,/!target\.isConnected\|\|target\.hidden/);
});
test('CT inline view exists in the current OKX panel, before position table',()=>{
 assert.match(account,/data-okx-ctreading hidden role="status" aria-live="polite"/);
 assert.match(account,/#traderOkxAccountPanel \.okx-ct-reading\[hidden\]\{display:none!important\}/);
});

test('under-minimum CT may open official OKX Convert manually without sending any order',()=>{
 const links=account.match(/<a class="okx-convert-link"[^>]+>Convertir mes CT sur OKX ↗<\/a>/g)||[];
 assert.equal(links.length,1);
 const link=links[0];
 assert.match(link,/href="https:\/\/www\.okx\.com\/fr-fr\/trade-convert"/);
 assert.match(link,/target="_blank"/);
 assert.match(link,/rel="noopener noreferrer"/);
 assert.doesNotMatch(link,/\b(onclick|authorization|token|amount|sz|qty|instId)=/i);
});
test('Convert warns about manual confirmation and potential spread, not zero guaranteed costs',()=>{
 assert.match(account,/À sélectionner manuellement sur OKX \(CT → USDC\)/);
 assert.match(account,/Vérifie le devis, son délai et le spread possible/);
 assert.doesNotMatch(account,/function\s+convertCtOrder\s*\(/);
});


/* Execute the PURE public-study owner in isolation, without browser, Bridge or
 * account credentials. Guards on source identity must survive asset switches. */
const modelStart=ai.indexOf('function preparePublicReading(');
const modelEnd=ai.indexOf('\nfunction activeMarketCoin()',modelStart);
const publicStudy=new Function('periods','fmt','INDICATORS',
  ai.slice(modelStart,modelEnd)+'\nreturn preparePublicReading;')(
  Object.freeze({'1m':60000,'5m':300000,'15m':900000,'1h':3600000,'4h':14400000,'1d':86400000}),
  (v,d=6)=>Number(v).toLocaleString('fr-FR',{maximumFractionDigits:d}),
  Object.freeze({ma:'MA moyenne',ema:'EMA recent'}));
const market=(symbol,name,now)=>({
  id:symbol.toLowerCase(),symbol,name,priceUsd:82000.125,
  change24h:1.2,usdSource:'CoinGecko USD',
  usdUpdatedAt:new Date(now-20000).toISOString(),
  marketCapUsd:1000000000,volume24hUsd:20000000
});
const candles=(symbol,now)=>({
  mode:'candles',loadedInstrument:symbol+'-USDC',loadedBar:'5m',
  rows:[{t:now-20000,o:82000,h:83000,l:81500,c:82500,v:50}]
});
test('IA Technical Reading follows BTC, ETH and SOL candles with the same public renderer',()=>{
 const now=Date.parse('2026-10-21T05:00:00Z');
 for(const symbol of ['BTC','ETH','SOL']){
  const lines=publicStudy({coin:market(symbol,'Actif '+symbol,now),
    info:candles(symbol,now),mode:'learn',now});
  assert.match(lines.join('\n'),new RegExp(symbol+'-USDC'));
  assert.match(lines.join('\n'),/Dernière bougie/);
  assert.match(lines.join('\n'),/Volume de la dernière bougie/);
  assert.match(lines.join('\n'),/Aucune position privée/);
  assert.doesNotMatch(lines.join('\n'),/position privée CT\/USDC/);
 }
});
test('mismatched candles cannot be analyzed as the active cryptocurrency',()=>{
 const now=Date.parse('2026-10-21T05:00:00Z');
 const lines=publicStudy({coin:market('BTC','Bitcoin',now),
   info:candles('CT',now),levels:{instrument:'CT-USDC',bar:'5m',
    support:{price:0.1},resistance:{price:0.3}},mode:'analyze',now});
 assert.match(lines.join('\n'),/Bougies NON concordantes avec BTC/);
 assert.match(lines.join('\n'),/CT-USDC/);
 assert.doesNotMatch(lines.join('\n'),/Dernière bougie|Zones passées|support 0,1/);
});
test('technical levels require matching instrument and interval; old candles flagged',()=>{
 const now=Date.parse('2026-10-21T05:00:00Z');
 const c=market('BTC','Bitcoin',now),info=candles('BTC',now);
 let report=publicStudy({coin:c,info,levels:{instrument:'CT-USDC',bar:'5m',
   support:{price:500},resistance:{price:900}},mode:'analyze',now}).join('\n');
 assert.match(report,/Support\/résistance exacts non qualifiés/);
 assert.doesNotMatch(report,/Zones passées/);
 report=publicStudy({coin:c,info,levels:{instrument:'BTC-USDC',bar:'5m',
   support:{price:81700},resistance:{price:82900}},mode:'analyze',now}).join('\n');
 assert.match(report,/support 81/);
 assert.match(report,/BTC-USDC/);
 const old=candles('BTC',now);old.rows[0].t=now-3600000;
 report=publicStudy({coin:c,info:old,mode:'learn',now}).join('\n');
 assert.match(report,/DONNÉES ANCIENNES/);
 assert.match(report,/aucun signal de marché actuel/);
});
test('Market data remain separate from missing candles and unknown timestamps',()=>{
 const now=Date.parse('2026-10-21T05:00:00Z');
 const c=market('OKB','OKB',now);c.usdUpdatedAt=null;
 const lines=publicStudy({coin:c,info:{mode:'line',rows:[]},
   lineContext:{asset_id:c.id,snapshot:{points:220,period_label:'24h',truth:'cache'}},
   mode:'analyze',now}).join('\n');
 assert.match(lines,/source CoinGecko USD/);
 assert.match(lines,/fraîcheur NON CERTIFIÉE/);
 assert.match(lines,/Courbe historique de OKB : 220 points/);
 assert.doesNotMatch(lines,/Dernière bougie|Zone passée/);
 assert.match(lines,/Analyse limitée au Market/);
});
test('CT-specific private account actions are hidden for other assets and never loaded automatically',()=>{
 assert.match(ai,/privateActions\.hidden=!isCt/);
 assert.match(ai,/caseStudy\.hidden=!isCt/);
 assert.match(ai,/latest=null;copy\.disabled=true;body\.replaceChildren\(\)/);
 assert.match(ai,/String\(startCoin\?\.symbol\|\|""\)\.toUpperCase\(\)!=="CT"/);
 assert.match(ai,/sessionStorage\.getItem\(TOKEN_KEY\)!==sessionAtStart/);
 assert.match(ai,/agent-crypto:trader-selection-changed/);
 assert.match(ai,/agent-crypto:trader-line-loaded/);
 assert.match(ai,/agent-crypto:external-asset-changed/);
 assert.doesNotMatch(ai.slice(ai.indexOf('function preparePublicReading('),ai.indexOf('function setHelpMode(mode)')),/fetch\(|bridge\(|Authorization|sessionStorage/);
});
