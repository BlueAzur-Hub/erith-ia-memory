from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import re
import subprocess
import zipfile

ROOT = Path('public/agent_crypto_erith_ia/administrator')
INDEX = ROOT / 'index.html'
BUILD = ROOT / 'build.json'
ADMIN_VERSION = ROOT / 'administrator-version.json'
VERSION = ROOT / 'version.json'
APP_JS = ROOT / 'js/app.js'
AETHER_JS = ROOT / 'js/aether.js'
WORKBENCH = ROOT / 'js/aether-workbench-406039.js'
CSS = ROOT / 'admin-ribbons.css'
ASSET = ROOT / 'assets/aether/aether-observatory-background-406032.webp'
RELEASE_MD = ROOT / 'RELEASE_40_6_42.md'
ZIP = Path('coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_BUILD_40_6_42_AETHER_COMPONENT_FOUNDATION_RESPONSIVE_INFORMATION_ARCHITECTURE_CLEAN_UPLOAD_7_FILES.zip')
SHA = Path(str(ZIP) + '.sha256')

PARENT = '40.6.41'
BUILD_NO = '40.6.42'
ENGINE = '38.15.11'
RELEASE = 'AETHER COMPONENT FOUNDATION · RESPONSIVE INFORMATION ARCHITECTURE'
STATUS = 'aether_component_foundation_responsive_information_architecture_406042'
APP_BLOB = '1cd18ff77a2e1ae42a8aac22ca029376e9d0d393'
AETHER_BLOB = 'cd627cbdf454be000a414d9ff185b55fb2fde5fe'
CSS_BLOB = '25052e8cd8383d3922c1a6e93e534aea2a0da0e4'
WORKBENCH_BLOB = '21145af3e8695dd4cb6366423d5d8c9f62ab9aa1'
ASSET_SHA = '5c4d61e9410d4a701372e2d30640d6523938dfe603f65902d493b354c5f2e7b2'
JS_MARKER = '/* 40.6.42 — AETHER COMPONENT FOUNDATION · RESPONSIVE INFORMATION ARCHITECTURE */'
CSS_MARKER = '/* 40.6.42 — AETHER COMPONENT FOUNDATION · RESPONSIVE INFORMATION ARCHITECTURE */'


def require(ok, message):
    if not ok:
        raise SystemExit(message)


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def git_blob(path: Path) -> str:
    return subprocess.check_output(['git', 'hash-object', str(path)], text=True).strip()


def replace_required(text: str, old: str, new: str, label: str) -> str:
    require(old in text, f'missing patch anchor: {label}')
    return text.replace(old, new, 1)


truth = json.loads(BUILD.read_text(encoding='utf-8'))
require(truth.get('build') == PARENT, f'parent build drift: {truth.get("build")}')
require(truth.get('engine') == ENGINE, 'Market Core drift')
require(git_blob(APP_JS) == APP_BLOB, f'app.js drift: {git_blob(APP_JS)}')
require(git_blob(AETHER_JS) == AETHER_BLOB, f'aether.js drift: {git_blob(AETHER_JS)}')
require(git_blob(CSS) == CSS_BLOB, f'admin-ribbons drift: {git_blob(CSS)}')
require(git_blob(WORKBENCH) == WORKBENCH_BLOB, f'workbench drift: {git_blob(WORKBENCH)}')
require(sha256(ASSET) == ASSET_SHA, 'exact Aether artwork drift')

# Preserve runtime-owner counts: 40.6.42 is information architecture, not a new engine.
aether_before = AETHER_JS.read_text(encoding='utf-8')
owner_counts_before = {
    'fetch': aether_before.count('fetch('),
    'websocket': aether_before.count('WebSocket('),
    'interval': aether_before.count('setInterval('),
    'storage_set': aether_before.count('localStorage.setItem(') + aether_before.count('sessionStorage.setItem('),
}
require(JS_MARKER not in aether_before, '40.6.42 JS already applied')

component_js = r'''
  /* 40.6.42 — AETHER COMPONENT FOUNDATION · RESPONSIVE INFORMATION ARCHITECTURE */
  /*
     Aether Watch becomes a data-first responsive UI. The historical 16:9 artwork is now
     only a low-contrast backplate; it no longer owns card geometry or window dimensions.
     This layer reads existing owners only: no fetch, timer, observer, storage or order path.
  */
  function aetherNumberFromText406042(value,pattern){
    const match=String(value||'').match(pattern);
    if(!match)return null;
    const n=Number(String(match[1]||'').replace('−','-').replace(',','.').replace(/\s+/g,''));
    return Number.isFinite(n)?n:null;
  }
  function aetherPctText406042(value){return value===null||value===undefined?'N/D':`${Math.round(value)} %`;}
  function aetherTone406042(value,{warn=80,danger=92,invert=false}={}){
    if(value===null||value===undefined)return 'muted';
    if(invert)return value>=danger?'danger':value>=warn?'warn':'good';
    return value>=danger?'danger':value>=warn?'warn':'good';
  }
  function aetherSet406042(stage,key,value,tone=null){
    const node=stage?.querySelector(`[data-aether42="${key}"]`);if(!node)return;
    const text=String(value??'—');if(node.textContent!==text)node.textContent=text;
    if(tone)node.dataset.tone=tone;else delete node.dataset.tone;
  }
  function aetherCardTone406042(stage,key,tone){const card=stage?.querySelector(`[data-aether-card-406042="${key}"]`);if(card)card.dataset.tone=tone||'neutral';}
  function aetherMarketModel406042(){
    try{
      const coins=(typeof state!=='undefined'&&Array.isArray(state?.coins))?state.coins:[];
      const rows=coins.map(row=>({symbol:String(row?.symbol||'').toUpperCase(),change:aetherSystemNumber4086(row?.change24h)})).filter(row=>row.change!==null);
      if(!rows.length)return {ready:false,up:null,down:null,flat:null,bias:'EN ATTENTE',top5:'N/D'};
      const up=rows.filter(row=>row.change>.05).length,down=rows.filter(row=>row.change<-.05).length,flat=rows.length-up-down;
      const bias=down>up*1.35?'NÉGATIVE':up>down*1.35?'POSITIVE':'MIXTE';
      const focus=new Set(['BTC','ETH','BNB','XRP','SOL']),top=rows.filter(row=>focus.has(row.symbol));
      const pos=top.filter(row=>row.change>0).length,neg=top.filter(row=>row.change<0).length,zero=top.length-pos-neg;
      return {ready:true,up,down,flat,bias,top5:top.length?`${pos}/${top.length} + · ${neg} −${zero?` · ${zero} =`:''}`:'N/D'};
    }catch(_){return {ready:false,up:null,down:null,flat:null,bias:'EN ATTENTE',top5:'N/D'};}
  }
  function aetherSystemModel406042(){
    const sys=aetherSystemState4086.system||{};
    const cpu=aetherSystemPercent4086(sys?.cpu?.usage_pct),cpuTemp=aetherSystemTemperature4086(sys?.cpu?.temperature_c);
    const gpuStatus=String(sys?.gpu?.status||'').trim().toLowerCase();
    const gpu=gpuStatus&&gpuStatus!=='ok'?null:aetherSystemPercent4086(sys?.gpu?.usage_pct),gpuTemp=gpuStatus&&gpuStatus!=='ok'?null:aetherSystemTemperature4086(sys?.gpu?.temperature_c);
    const ram=aetherSystemPercent4086(sys?.memory?.usage_pct);
    let status='STABLE',tone='good';
    if(cpu===null&&ram===null){status='INDISPONIBLE';tone='muted';}
    else if((cpu!==null&&cpu>=92)||(ram!==null&&ram>=96)||(cpuTemp!==null&&cpuTemp>=90)||(gpuTemp!==null&&gpuTemp>=84)){status='CRITIQUE';tone='danger';}
    else if((cpu!==null&&cpu>=80)||(ram!==null&&ram>=90)){status='SOUS CHARGE';tone='warn';}
    else if(gpu===null){status='PARTIEL';tone='neutral';}
    return {cpu,cpuTemp,gpu,gpuTemp,ram,status,tone};
  }
  function aetherSourcesModel406042(snapshot){
    let newsCount=0,newsLabel='VEILLE';
    try{const ns=aetherVeilleStatus4087();newsCount=Array.isArray(ns?.events)?ns.events.length:0;newsLabel=newsCount?'ACTIVES':String(ns?.label||'VEILLE').toUpperCase();}catch(_){}
    const ratio=(String(snapshot?.sources||'').match(/\b\d+\s*\/\s*\d+\b/)||[])[0]?.replace(/\s+/g,'')||'N/D';
    const book=String(snapshot?.book||'EN VEILLE').toUpperCase();
    const atlasData=String(snapshot?.currentStatus||'').toUpperCase()==='CURRENT'?'CURRENT':snapshot?.reports?'DISPONIBLE':'VEILLE';
    const sourceReady=!/N\/D|ATTENTE|REQUIS|INDISPONIBLE/.test(`${ratio} ${book}`);
    return {ratio,book,news:newsCount?`${newsCount} QUALIFIÉ${newsCount>1?'S':''}`:newsLabel,atlasData,status:sourceReady?'PRÊTES':'PARTIELLES',tone:sourceReady?'good':'warn'};
  }
  function aetherAtlasModel406042(snapshot){
    const raw=String(snapshot?.atlas||'').trim();
    const score=aetherNumberFromText406042(raw,/([+−-]?\s*\d+)\s*\/\s*100/);
    const parts=raw.split('·').map(v=>v.trim()).filter(Boolean);
    const status=String(snapshot?.currentStatus||parts[0]||'VEILLE').toUpperCase();
    const signal=parts.find(v=>!/CURRENT|IDLE|VEILLE|\d+\s*\/\s*100/i.test(v))||parts[1]||'Lecture en attente';
    const resident=aetherAtlasAuto40133();
    const reports=Number(snapshot?.reports)||0;
    const tone=/NON ARMÉ|indisponible/i.test(resident)?'danger':/CURRENT|ARMÉ|PARTAG|HAUSS|BAISS/i.test(`${status} ${resident} ${signal}`)?'good':'neutral';
    return {status,signal,score:score===null?'N/D':`${score>=0?'+':''}${score}/100`,reports:reports?`${reports}/4`:'N/D',resident,tone};
  }
  function aetherOracleModel406042(){
    const identity=aetherText4084('atlasOracleOperatorIdentity','')||aetherText4084('atlasOracleAsset','');
    const parts=String(identity||'').split('·').map(v=>v.trim()).filter(Boolean);
    const asset=parts[0]&&!/ATTENTE|LIVECHECK/i.test(parts[0])?parts[0]:'N/D';
    const scenario=parts[1]||'EN ATTENTE';
    const regime=(aetherText4084('atlasOracleOperatorBias','')||aetherText4084('atlasOracleBias','')).replace(/^BIAIS\s*|^Biais mesuré\s*:\s*/i,'').trim()||'N/D';
    const confidenceRaw=(aetherText4084('atlasOracleOperatorConfidence','')||aetherText4084('atlasOracleConfidence','')).replace(/^CONF\.\s*|^Confiance données\s*/i,'').trim();
    const confidence=aetherNumberFromText406042(confidenceRaw,/(\d+(?:[.,]\d+)?)/);
    const text=String(document.getElementById('atlasOracleV0')?.textContent||'').replace(/\s+/g,' ');
    const up=aetherNumberFromText406042(text,/HAUSSE\s*(\d+)\s*\/\s*100/i),down=aetherNumberFromText406042(text,/BAISSE\s*(\d+)\s*\/\s*100/i),coherence=aetherNumberFromText406042(text,/Cohérence\s*(\d+)\s*\/\s*100/i);
    let summary='Lecture en attente',tone='neutral';
    if(up!==null&&down!==null){const gap=up-down;summary=Math.abs(gap)<6?'Équilibre serré':gap>0?'Avantage haussier':'Avantage baissier';tone=Math.abs(gap)<6?'neutral':gap>0?'good':'warn';}
    return {asset,scenario,regime,confidence:confidence===null?'N/D':`${Math.round(confidence)}/100`,up:up===null?'N/D':`${Math.round(up)}/100`,down:down===null?'N/D':`${Math.round(down)}/100`,coherence:coherence===null?'N/D':`${Math.round(coherence)}/100`,summary,tone};
  }
  function aetherConvergenceModel406042(watch){
    const layers=[{name:'News',value:aetherNewsDirection406026()},{name:'Marché',value:aetherMarketDirection406026()},{name:'Atlas',value:aetherAtlasDirection406026()},{name:'Oracle',value:aetherOracleDirection406026()}];
    const known=layers.filter(row=>row.value!==null),positive=known.filter(row=>row.value===1),negative=known.filter(row=>row.value===-1),neutral=known.filter(row=>row.value===0);
    const dominant=positive.length>negative.length?1:negative.length>positive.length?-1:0;
    const aligned=dominant===0?neutral:known.filter(row=>row.value===dominant||row.value===0);
    const opposed=dominant===0?[]:known.filter(row=>row.value===-dominant);
    const pct=known.length?Math.round(aligned.length/known.length*100):0;
    return {ratio:known.length?`${aligned.length}/${known.length}`:'N/D',pct:known.length?`${pct}%`:'N/D',dominant:dominant>0?'HAUSSIÈRE':dominant<0?'BAISSIÈRE':'PARTAGÉE',confirm:aligned.length?aligned.map(row=>row.name).join(' · '):'Aucune',oppose:opposed.length?opposed.map(row=>row.name).join(' · '):'Aucune',tone:pct>=75&&known.length>=3?(dominant<0?'warn':'good'):'neutral',raw:String(watch?.convergence||'')};
  }
  function aetherDivergenceModel406042(watch,convergence){
    const raw=String(watch?.divergence||'Aucune divergence directionnelle forte détectée');
    let status='AUCUNE FORTE',tone='good';
    if(/contradiction|divergence active/i.test(raw)){status='ACTIVE';tone='warn';}
    else if(/restent neutres|neutre/i.test(raw)){status='NEUTRALITÉ';tone='neutral';}
    return {status,detail:raw,opposed:convergence?.oppose||'Aucune',tone};
  }
  function aetherWeatherModel406042(){
    const weather=aetherSystemState4086.weather||{},days=Array.isArray(weather?.daily)?weather.daily:[];
    const today=days[0]||{};const text=String(today?.text||'Prévision en attente');
    const tempPair=(text.match(/(-?\d+)\s*\/\s*(-?\d+)°/)||[]);const rain=(text.match(/pluie\s*(\d+)%/i)||[])[1];
    const level=String(weather?.risk_level||'').toLowerCase();const risk=level==='danger'?'ORAGE':level==='warn'?'ALERTE':level==='watch'?'SURVEILLER':'CALME';
    return {today:tempPair.length?`${tempPair[1]}° / ${tempPair[2]}°`:'N/D',rain:rain?`${rain}%`:'N/D',gust:weather?.max_gust_kmh===null||weather?.max_gust_kmh===undefined?'N/D':`${Math.round(weather.max_gust_kmh)} km/h`,risk,detail:aetherWeatherRisk40133(),tone:level==='danger'?'danger':level==='warn'?'warn':level==='watch'?'neutral':'good'};
  }
  function aetherComponentViewModel406042(snapshot,watch){
    const market=aetherMarketModel406042(),system=aetherSystemModel406042(),sources=aetherSourcesModel406042(snapshot),atlas=aetherAtlasModel406042(snapshot),oracle=aetherOracleModel406042(),convergence=aetherConvergenceModel406042(watch),divergence=aetherDivergenceModel406042(watch,convergence),weather=aetherWeatherModel406042();
    const level=String(watch?.level||'MODÉRÉ').split('·')[0].trim()||'MODÉRÉ';
    const coreTone=level==='CRITIQUE'?'danger':level==='ÉLEVÉ'?'warn':level==='FAIBLE'?'muted':'neutral';
    const why=aetherAttention40133().replace(/^Marché\s*·\s*/,'Marché · ').replace(/^Système\s*·\s*/,'Système · ');
    return {market,system,sources,atlas,oracle,convergence,divergence,weather,core:{level,tone:coreTone,why,watch:String(watch?.watch||'Surveillance en attente'),note:String(watch?.note||'Lecture en cours'),convergence:convergence.pct}};
  }
  function aetherComponentEventRow406042(entry){
    const row=document.createElement('div');row.className='aether42-event-row';
    const time=document.createElement('time');time.textContent=new Date(entry.at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
    const type=document.createElement('b');type.textContent=entry.type;
    const detail=document.createElement('span');detail.textContent=aetherTimelineClip406027(entry.detail,88);
    row.append(time,type,detail);return row;
  }
  function aetherComponentPaint406042(panel,snapshot=aetherSnapshot4084(),watch=aetherOperatorWatch406026()){
    const stage=panel?.querySelector('[data-aether-component-stage-406042]');if(!stage)return;
    const vm=aetherComponentViewModel406042(snapshot,watch);
    aetherSet406042(stage,'attention_level',vm.core.level,vm.core.tone);aetherSet406042(stage,'attention_why',vm.core.why);aetherSet406042(stage,'attention_watch',vm.core.watch);aetherSet406042(stage,'attention_note',vm.core.note);aetherSet406042(stage,'attention_convergence',vm.core.convergence);
    aetherCardTone406042(stage,'core',vm.core.tone);

    aetherSet406042(stage,'system_status',vm.system.status,vm.system.tone);aetherSet406042(stage,'system_cpu',aetherPctText406042(vm.system.cpu),aetherTone406042(vm.system.cpu));aetherSet406042(stage,'system_cpu_temp',vm.system.cpuTemp===null?'N/D':`${Math.round(vm.system.cpuTemp)}°C`);aetherSet406042(stage,'system_ram',aetherPctText406042(vm.system.ram),aetherTone406042(vm.system.ram,{warn:88,danger:95}));aetherSet406042(stage,'system_gpu',aetherPctText406042(vm.system.gpu),vm.system.gpu===null?'muted':'good');aetherSet406042(stage,'system_gpu_temp',vm.system.gpuTemp===null?'N/D':`${Math.round(vm.system.gpuTemp)}°C`);aetherCardTone406042(stage,'system',vm.system.tone);

    aetherSet406042(stage,'sources_status',vm.sources.status,vm.sources.tone);aetherSet406042(stage,'sources_binance',vm.sources.ratio);aetherSet406042(stage,'sources_book',vm.sources.book);aetherSet406042(stage,'sources_news',vm.sources.news);aetherSet406042(stage,'sources_atlas',vm.sources.atlasData);aetherCardTone406042(stage,'sources',vm.sources.tone);

    aetherSet406042(stage,'atlas_status',vm.atlas.status,vm.atlas.tone);aetherSet406042(stage,'atlas_signal',vm.atlas.signal);aetherSet406042(stage,'atlas_score',vm.atlas.score);aetherSet406042(stage,'atlas_reports',vm.atlas.reports);aetherSet406042(stage,'atlas_resident',vm.atlas.resident);aetherCardTone406042(stage,'atlas',vm.atlas.tone);

    aetherSet406042(stage,'oracle_status',vm.oracle.summary,vm.oracle.tone);aetherSet406042(stage,'oracle_asset',vm.oracle.asset);aetherSet406042(stage,'oracle_scenario',vm.oracle.scenario);aetherSet406042(stage,'oracle_regime',vm.oracle.regime);aetherSet406042(stage,'oracle_confidence',vm.oracle.confidence);aetherSet406042(stage,'oracle_up',vm.oracle.up,'good');aetherSet406042(stage,'oracle_down',vm.oracle.down,'warn');aetherSet406042(stage,'oracle_coherence',vm.oracle.coherence);aetherCardTone406042(stage,'oracle',vm.oracle.tone);

    aetherSet406042(stage,'market_status',vm.market.ready?`LARGEUR ${vm.market.bias}`:'EN ATTENTE',vm.market.bias==='POSITIVE'?'good':vm.market.bias==='NÉGATIVE'?'warn':'neutral');aetherSet406042(stage,'market_up',vm.market.up===null?'N/D':vm.market.up,'good');aetherSet406042(stage,'market_down',vm.market.down===null?'N/D':vm.market.down,'warn');aetherSet406042(stage,'market_flat',vm.market.flat===null?'N/D':vm.market.flat);aetherSet406042(stage,'market_top5',vm.market.top5);aetherCardTone406042(stage,'market',vm.market.bias==='POSITIVE'?'good':vm.market.bias==='NÉGATIVE'?'warn':'neutral');

    aetherSet406042(stage,'convergence_ratio',vm.convergence.ratio);aetherSet406042(stage,'convergence_pct',vm.convergence.pct,vm.convergence.tone);aetherSet406042(stage,'convergence_dominant',vm.convergence.dominant);aetherSet406042(stage,'convergence_confirm',vm.convergence.confirm);aetherSet406042(stage,'convergence_oppose',vm.convergence.oppose);aetherCardTone406042(stage,'convergence',vm.convergence.tone);

    aetherSet406042(stage,'divergence_status',vm.divergence.status,vm.divergence.tone);aetherSet406042(stage,'divergence_detail',vm.divergence.detail);aetherSet406042(stage,'divergence_oppose',vm.divergence.opposed);aetherCardTone406042(stage,'divergence',vm.divergence.tone);

    aetherSet406042(stage,'weather_status',vm.weather.risk,vm.weather.tone);aetherSet406042(stage,'weather_today',vm.weather.today);aetherSet406042(stage,'weather_rain',vm.weather.rain);aetherSet406042(stage,'weather_gust',vm.weather.gust);aetherSet406042(stage,'weather_detail',vm.weather.detail);aetherCardTone406042(stage,'weather',vm.weather.tone);

    const events=stage.querySelector('[data-aether42-events]');if(events){events.replaceChildren();const rows=aetherTimelineState406027.entries.slice(0,3);if(rows.length)rows.forEach(entry=>events.appendChild(aetherComponentEventRow406042(entry)));else{const empty=document.createElement('span');empty.className='aether42-empty';empty.textContent='Aucun changement significatif dans cette session.';events.appendChild(empty);}}
    aetherSet406042(stage,'events_count',`${aetherTimelineState406027.entries.length}/${aetherTimelineState406027.max}`);
    stage.dataset.attention=vm.core.tone;
  }
  function aetherComponentEnsure406042(panel){
    if(!panel)return null;
    const existing=panel.querySelector('[data-aether-component-stage-406042]');if(existing)return existing;
    panel.dataset.aetherComponentFoundation406042='1';
    const stage=document.createElement('div');stage.className='aether-component-stage-406042';stage.setAttribute('data-aether-component-stage-406042','1');
    stage.innerHTML=`
      <div class="aether42-backplate" aria-hidden="true"></div>
      <div class="aether42-surface">
        <header class="aether42-masthead">
          <div class="aether42-title"><span>AETHER WATCH</span><b>Markets Observatory</b><small>Lecture croisée · données existantes · aucune exécution automatique</small></div>
          <nav class="aether42-actions" aria-label="Lectures Aether"><button type="button" data-aether42-open="history">Historique <span data-aether42="events_count">0/8</span></button><button type="button" data-aether42-open="details">Détails</button></nav>
        </header>
        <main class="aether42-grid">
          <article class="aether42-card" data-aether-card-406042="system"><header><span>Système</span><b data-aether42="system_status">—</b></header><div class="aether42-metrics aether42-metrics-3"><div><small>CPU</small><strong data-aether42="system_cpu">—</strong><em data-aether42="system_cpu_temp">—</em></div><div><small>RAM</small><strong data-aether42="system_ram">—</strong><em>Mémoire</em></div><div><small>GPU</small><strong data-aether42="system_gpu">—</strong><em data-aether42="system_gpu_temp">—</em></div></div><footer>Backend local · lecture seule</footer></article>
          <article class="aether42-card" data-aether-card-406042="convergence"><header><span>Convergence</span><b data-aether42="convergence_pct">—</b></header><div class="aether42-primary"><strong data-aether42="convergence_ratio">—</strong><span>couches alignées</span></div><div class="aether42-kv"><span>Dominante</span><b data-aether42="convergence_dominant">—</b><span>Confirment</span><b data-aether42="convergence_confirm">—</b><span>Opposition</span><b data-aether42="convergence_oppose">—</b></div></article>
          <article class="aether42-card" data-aether-card-406042="divergence"><header><span>Divergence</span><b data-aether42="divergence_status">—</b></header><p class="aether42-summary" data-aether42="divergence_detail">—</p><div class="aether42-kv"><span>Contredit</span><b data-aether42="divergence_oppose">—</b></div></article>
          <article class="aether42-card" data-aether-card-406042="sources"><header><span>Sources</span><b data-aether42="sources_status">—</b></header><div class="aether42-metrics aether42-metrics-2"><div><small>Binance</small><strong data-aether42="sources_binance">—</strong></div><div><small>Book</small><strong data-aether42="sources_book">—</strong></div><div><small>News</small><strong data-aether42="sources_news">—</strong></div><div><small>Atlas Data</small><strong data-aether42="sources_atlas">—</strong></div></div></article>
          <article class="aether42-card aether42-core" data-aether-card-406042="core"><header><span>Niveau d’attention</span><b data-aether42="attention_level">—</b></header><div class="aether42-core-orbit"><small>Convergence</small><strong data-aether42="attention_convergence">—</strong></div><section><small>Pourquoi maintenant ?</small><p data-aether42="attention_why">—</p></section><section><small>À surveiller</small><p data-aether42="attention_watch">—</p></section><footer data-aether42="attention_note">—</footer></article>
          <article class="aether42-card" data-aether-card-406042="market"><header><span>Marché</span><b data-aether42="market_status">—</b></header><div class="aether42-metrics aether42-metrics-3"><div><small>Hausses</small><strong data-aether42="market_up">—</strong></div><div><small>Baisses</small><strong data-aether42="market_down">—</strong></div><div><small>Stables</small><strong data-aether42="market_flat">—</strong></div></div><footer>Top 5 · <b data-aether42="market_top5">—</b></footer></article>
          <article class="aether42-card" data-aether-card-406042="atlas"><header><span>Atlas</span><b data-aether42="atlas_status">—</b></header><div class="aether42-primary"><strong data-aether42="atlas_score">—</strong><span data-aether42="atlas_signal">—</span></div><div class="aether42-kv"><span>Rapports</span><b data-aether42="atlas_reports">—</b></div><footer data-aether42="atlas_resident">—</footer></article>
          <article class="aether42-card aether42-events" data-aether-card-406042="events" role="button" tabindex="0" aria-label="Ouvrir les événements récents"><header><span>Événements récents</span><b data-aether42="events_count">0/8</b></header><div data-aether42-events aria-live="polite"></div><footer>Cliquer pour ouvrir la lecture complète →</footer></article>
          <article class="aether42-card" data-aether-card-406042="oracle"><header><span>Oracle</span><b data-aether42="oracle_status">—</b></header><div class="aether42-metrics aether42-metrics-4"><div><small>Actif</small><strong data-aether42="oracle_asset">—</strong></div><div><small>Scénario</small><strong data-aether42="oracle_scenario">—</strong></div><div><small>Régime</small><strong data-aether42="oracle_regime">—</strong></div><div><small>Confiance</small><strong data-aether42="oracle_confidence">—</strong></div></div><div class="aether42-triad"><span>Hausse <b data-aether42="oracle_up">—</b></span><span>Baisse <b data-aether42="oracle_down">—</b></span><span>Cohérence <b data-aether42="oracle_coherence">—</b></span></div></article>
          <article class="aether42-card" data-aether-card-406042="weather"><header><span>Météo 5 j</span><b data-aether42="weather_status">—</b></header><div class="aether42-metrics aether42-metrics-3"><div><small>Aujourd’hui</small><strong data-aether42="weather_today">—</strong></div><div><small>Pluie</small><strong data-aether42="weather_rain">—</strong></div><div><small>Rafales max</small><strong data-aether42="weather_gust">—</strong></div></div><footer data-aether42="weather_detail">—</footer></article>
        </main>
      </div>`;
    panel.appendChild(stage);
    stage.querySelector('[data-aether42-open="history"]')?.addEventListener('click',()=>void aetherWorkbenchOpen406039('history',panel));
    stage.querySelector('[data-aether42-open="details"]')?.addEventListener('click',()=>void aetherWorkbenchOpen406039('details',panel));
    const events=stage.querySelector('[data-aether-card-406042="events"]');const openEvents=()=>void aetherWorkbenchOpen406039('events',panel);events?.addEventListener('click',openEvents);events?.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openEvents();}});
    return stage;
  }
'''

aether = aether_before
anchor = '  function aetherPanelEnsure4084(){\n'
require(anchor in aether, 'aether panel ensure anchor missing')
aether = aether.replace(anchor, component_js + '\n' + anchor, 1)
aether = replace_required(aether,
    '    let panel=document.getElementById("atlasAetherStatusPanel4084");if(panel)return panel;',
    '    let panel=document.getElementById("atlasAetherStatusPanel4084");if(panel){aetherComponentEnsure406042(panel);return panel;}',
    'existing panel component foundation')
aether = replace_required(aether,
    '    document.body.appendChild(panel);\n    panel.querySelector("[data-aether-close-4084]")',
    '    document.body.appendChild(panel);\n    aetherComponentEnsure406042(panel);\n    panel.querySelector("[data-aether-close-4084]")',
    'new panel component foundation')
aether = replace_required(aether,
    'if(panel.dataset.aetherFocus406030==="details")aetherDetailsRender406037(panel);}',
    'if(panel.dataset.aetherFocus406030==="details")aetherDetailsRender406037(panel);aetherComponentPaint406042(panel,s,watch406026);}',
    'component paint in renderAether')
# Expose the new architecture through the existing public diagnostic API without changing owners.
aether = replace_required(aether,
    '    aether_attention_final_wide_textless_background_pending:true,',
    '    aether_attention_component_foundation:true,\n    aether_attention_component_foundation_build:"40.6.42",\n    aether_attention_component_layout:"responsive-grid",\n    aether_attention_backplate_geometry_owner:false,\n    aether_attention_information_cards_structured:true,\n    aether_attention_final_wide_textless_background_pending:true,',
    'Aether API component flags')
AETHER_JS.write_text(aether, encoding='utf-8')

# Responsive component skin. The old artwork remains only as an atmospheric backplate.
css = CSS.read_text(encoding='utf-8')
require(CSS_MARKER not in css, '40.6.42 CSS already applied')
css += r'''

/* 40.6.42 — AETHER COMPONENT FOUNDATION · RESPONSIVE INFORMATION ARCHITECTURE */
#atlasAetherStatusPanel4084[data-aether-component-foundation-406042="1"] > .aether-first-glance-grid-406030{display:none!important}
#atlasAetherStatusPanel4084[data-aether-component-foundation-406042="1"]{background:#010711!important;container-type:size!important;container-name:aether-window-406042!important}
#atlasAetherStatusPanel4084[data-aether-component-foundation-406042="1"]>.atlas-aether-panel-head-4084{z-index:180!important;background:linear-gradient(180deg,rgba(1,8,17,.96),rgba(1,8,17,.72))!important;border-bottom:1px solid rgba(89,214,255,.14)!important;backdrop-filter:blur(12px)!important}
#atlasAetherStatusPanel4084[data-aether-component-foundation-406042="1"]>.atlas-aether-panel-head-4084>b{font-size:11px!important;letter-spacing:.18em!important;color:#9edfff!important}
.aether-component-stage-406042{position:absolute!important;inset:42px 7px 7px!important;z-index:20!important;overflow:auto!important;border-radius:15px!important;container-type:inline-size!important;container-name:aether-stage-406042!important;background:#020a13!important;color:#eefaff!important;isolation:isolate!important;scrollbar-width:thin;scrollbar-color:rgba(87,218,255,.32) transparent}
.aether42-backplate{position:fixed!important;inset:42px 7px 7px!important;z-index:-3!important;pointer-events:none!important;border-radius:15px!important;background:url('./assets/aether/aether-observatory-background-406032.webp') center/cover no-repeat!important;opacity:.19!important;filter:saturate(.85) contrast(.92)!important}
.aether-component-stage-406042::before{content:"";position:fixed;inset:42px 7px 7px;z-index:-2;pointer-events:none;border-radius:15px;background:radial-gradient(circle at 50% 45%,rgba(6,37,73,.18),rgba(1,7,16,.76) 62%,rgba(1,6,13,.91) 100%),linear-gradient(135deg,rgba(1,12,22,.55),rgba(2,9,18,.28));backdrop-filter:blur(1.2px)}
.aether42-surface{position:relative;z-index:2;min-height:100%;padding:16px;display:flex;flex-direction:column;gap:13px}
.aether42-masthead{display:flex;align-items:center;justify-content:space-between;gap:14px;min-height:62px;padding:10px 12px;border:1px solid rgba(85,220,255,.2);border-radius:14px;background:linear-gradient(135deg,rgba(3,17,31,.90),rgba(4,12,24,.72));box-shadow:inset 0 0 0 1px rgba(255,255,255,.018),0 12px 28px rgba(0,0,0,.20)}
.aether42-title{display:grid;grid-template-columns:auto 1fr;align-items:baseline;column-gap:10px;row-gap:2px;min-width:0}.aether42-title>span{font-size:11px;font-weight:950;letter-spacing:.18em;color:#62e8ff;text-transform:uppercase}.aether42-title>b{font-family:Georgia,'Times New Roman',serif;font-size:24px;letter-spacing:.035em;color:#fff0c8;text-shadow:0 0 18px rgba(255,206,88,.12)}.aether42-title>small{grid-column:1/-1;color:#86aabd;font-size:10px;letter-spacing:.05em}.aether42-actions{display:flex;gap:8px;flex:0 0 auto}.aether42-actions button{border:1px solid rgba(92,222,255,.28);border-radius:999px;background:rgba(6,25,40,.82);color:#dff9ff;padding:7px 10px;font:800 10px/1 system-ui;cursor:pointer}.aether42-actions button:hover,.aether42-actions button:focus-visible{border-color:#77f1ff;background:rgba(13,52,70,.92);outline:none;box-shadow:0 0 0 2px rgba(93,225,255,.10)}
.aether42-grid{display:grid;grid-template-columns:minmax(220px,.95fr) minmax(330px,1.25fr) minmax(220px,.95fr);grid-template-areas:'system convergence divergence' 'sources core market' 'atlas core events' 'oracle oracle weather';gap:12px;align-items:stretch;min-height:0;flex:1}
.aether42-card{min-width:0;position:relative;padding:13px 14px;border:1px solid rgba(75,203,240,.28);border-radius:16px;background:linear-gradient(145deg,rgba(3,20,34,.94),rgba(3,12,24,.86));box-shadow:inset 0 0 0 1px rgba(255,255,255,.018),0 12px 30px rgba(0,0,0,.24);overflow:hidden}.aether42-card::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 8% 0%,rgba(61,216,255,.07),transparent 36%);opacity:.8}.aether42-card[data-tone="good"]{border-color:rgba(77,236,202,.36)}.aether42-card[data-tone="warn"]{border-color:rgba(255,203,78,.48);box-shadow:inset 0 0 0 1px rgba(255,206,85,.025),0 12px 30px rgba(0,0,0,.24)}.aether42-card[data-tone="danger"]{border-color:rgba(255,105,132,.52)}.aether42-card[data-tone="muted"]{opacity:.86}
.aether42-card>header{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}.aether42-card>header>span,.aether42-card section>small{font-size:10px;line-height:1.15;font-weight:950;letter-spacing:.14em;text-transform:uppercase;color:#58e8ff}.aether42-card>header>b{max-width:58%;text-align:right;padding:4px 7px;border-radius:999px;background:rgba(0,11,20,.62);font-size:10px;line-height:1.15;color:#f5fbff;overflow-wrap:anywhere}.aether42-card>header>b[data-tone="good"],.aether42-card [data-tone="good"]{color:#6ff4c7}.aether42-card>header>b[data-tone="warn"],.aether42-card [data-tone="warn"]{color:#ffd565}.aether42-card>header>b[data-tone="danger"],.aether42-card [data-tone="danger"]{color:#ff8ca5}.aether42-card [data-tone="muted"]{color:#8298a7}
.aether42-metrics{position:relative;z-index:1;display:grid;gap:7px}.aether42-metrics-2{grid-template-columns:repeat(2,minmax(0,1fr))}.aether42-metrics-3{grid-template-columns:repeat(3,minmax(0,1fr))}.aether42-metrics-4{grid-template-columns:repeat(4,minmax(0,1fr))}.aether42-metrics>div{min-width:0;padding:8px 9px;border:1px solid rgba(90,198,226,.12);border-radius:11px;background:rgba(0,9,17,.38);display:flex;flex-direction:column;gap:2px}.aether42-metrics small,.aether42-kv>span,.aether42-primary>span,.aether42-core-orbit>small{font-size:9px;font-weight:850;letter-spacing:.08em;text-transform:uppercase;color:#7898aa}.aether42-metrics strong{font-size:17px;line-height:1.05;color:#f4fbff;overflow-wrap:anywhere}.aether42-metrics em{font-style:normal;font-size:9px;color:#7ea1b2}
.aether42-primary{position:relative;z-index:1;display:flex;align-items:baseline;gap:9px;padding:8px 0}.aether42-primary>strong{font-size:25px;line-height:1;color:#fff0c0}.aether42-primary>span{color:#b7d3df}.aether42-kv{position:relative;z-index:1;display:grid;grid-template-columns:auto minmax(0,1fr);gap:5px 10px;margin-top:7px;align-items:baseline}.aether42-kv>b{text-align:right;font-size:11px;color:#e6f8ff;overflow-wrap:anywhere}.aether42-summary{position:relative;z-index:1;margin:5px 0 10px;color:#e7f4fa;font-size:12px;line-height:1.42}.aether42-card>footer{position:relative;z-index:1;margin-top:9px;padding-top:7px;border-top:1px solid rgba(84,188,216,.10);font-size:9px;line-height:1.35;color:#7fa6b7;overflow-wrap:anywhere}
.aether42-core{grid-area:core;display:flex;flex-direction:column;justify-content:center;text-align:center;padding:20px;background:radial-gradient(circle at 50% 38%,rgba(40,120,187,.18),transparent 48%),linear-gradient(150deg,rgba(4,22,40,.96),rgba(2,10,22,.92));border-color:rgba(111,220,255,.42)}.aether42-core>header{flex-direction:column;justify-content:center;margin-bottom:4px}.aether42-core>header>span{font-size:10px}.aether42-core>header>b{max-width:none;font-family:Georgia,'Times New Roman',serif;font-size:30px;letter-spacing:.03em;padding:4px 12px;background:rgba(1,8,16,.48);color:#ffd76d}.aether42-core-orbit{margin:4px auto 10px;padding:6px 11px;border:1px solid rgba(255,209,89,.24);border-radius:999px;background:rgba(11,16,24,.54)}.aether42-core-orbit>strong{margin-left:6px;color:#ffd568;font-size:16px}.aether42-core section{position:relative;z-index:1;margin:6px 0;padding:9px 11px;border:1px solid rgba(88,207,239,.12);border-radius:12px;background:rgba(0,8,17,.34);text-align:left}.aether42-core section>p{margin:4px 0 0;font-size:12px;line-height:1.4;color:#f0f8fb}.aether42-core>footer{font-size:10px;color:#a6c4d0;line-height:1.45}
[data-aether-card-406042="system"]{grid-area:system}[data-aether-card-406042="convergence"]{grid-area:convergence}[data-aether-card-406042="divergence"]{grid-area:divergence}[data-aether-card-406042="sources"]{grid-area:sources}[data-aether-card-406042="market"]{grid-area:market}[data-aether-card-406042="atlas"]{grid-area:atlas}[data-aether-card-406042="events"]{grid-area:events}[data-aether-card-406042="oracle"]{grid-area:oracle}[data-aether-card-406042="weather"]{grid-area:weather}
.aether42-events{cursor:pointer}.aether42-events:hover{border-color:rgba(124,231,255,.52)}.aether42-event-row{position:relative;z-index:1;display:grid;grid-template-columns:43px 55px minmax(0,1fr);gap:6px;align-items:baseline;padding:5px 0;border-bottom:1px solid rgba(83,186,214,.09)}.aether42-event-row:last-child{border-bottom:0}.aether42-event-row time{font:850 9px/1 system-ui;color:#76dfff}.aether42-event-row b{font-size:9px;color:#b8d9e6}.aether42-event-row span{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:10px;color:#edf7fb}.aether42-empty{display:block;padding:12px 0;color:#829eac;font-size:10px}.aether42-triad{position:relative;z-index:1;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin-top:8px}.aether42-triad>span{padding:6px 7px;border:1px solid rgba(83,190,219,.10);border-radius:9px;background:rgba(0,8,16,.3);font-size:9px;color:#8aa9b8}.aether42-triad b{display:block;margin-top:2px;font-size:13px;color:#f2fbff}
@container aether-stage-406042 (max-width:1100px){.aether42-grid{grid-template-columns:repeat(2,minmax(0,1fr));grid-template-areas:'core core' 'system sources' 'atlas oracle' 'market divergence' 'convergence events' 'weather weather'}.aether42-core{min-height:260px}.aether42-metrics-4{grid-template-columns:repeat(2,minmax(0,1fr))}}
@container aether-stage-406042 (max-width:720px){.aether42-surface{padding:10px}.aether42-masthead{align-items:flex-start;flex-direction:column}.aether42-actions{width:100%}.aether42-actions button{flex:1}.aether42-title{grid-template-columns:1fr}.aether42-title>small{grid-column:auto}.aether42-grid{grid-template-columns:1fr;grid-template-areas:'core' 'system' 'sources' 'market' 'atlas' 'oracle' 'convergence' 'divergence' 'events' 'weather'}.aether42-core{min-height:unset}.aether42-metrics-3,.aether42-metrics-4{grid-template-columns:repeat(2,minmax(0,1fr))}}
@container aether-stage-406042 (max-width:480px){.aether42-metrics-2,.aether42-metrics-3,.aether42-metrics-4,.aether42-triad{grid-template-columns:1fr}.aether42-event-row{grid-template-columns:42px minmax(0,1fr)}.aether42-event-row span{grid-column:1/-1;white-space:normal}.aether42-title>b{font-size:20px}}
'''
CSS.write_text(css, encoding='utf-8')

# Version truth and cache busts.
index = INDEX.read_text(encoding='utf-8')
index = replace_required(index, 'content="40.6.41"', 'content="40.6.42"', 'atlas build meta')
index = replace_required(index, 'content="40.6.41"', 'content="40.6.42"', 'administrator build meta')
index = replace_required(index, 'AETHER FREE RESIZE · SHELL / 16:9 STAGE SEPARATION', RELEASE, 'release meta')
index = replace_required(index, 'market-core-v2.0-alpha-build-40.6.41', 'market-core-v2.0-alpha-build-40.6.42', 'asset token')
index = replace_required(index, 'Build 40.6.41 · Administrator', 'Build 40.6.42 · Administrator', 'title build label')
index = replace_required(index, 'admin-ribbons.css?v=administrator-build-40.6.41', 'admin-ribbons.css?v=administrator-build-40.6.42', 'CSS cache bust')
index = re.sub(r'(\./js/aether\.js\?v=administrator-build-)[^"\']+', r'\g<1>40.6.42', index)
INDEX.write_text(index, encoding='utf-8')

now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z')
for path in (BUILD, ADMIN_VERSION, VERSION):
    data = json.loads(path.read_text(encoding='utf-8'))
    require(data.get('build') == PARENT, f'{path.name}: parent build drift')
    data['build'] = BUILD_NO
    data['release'] = RELEASE
    data['status'] = STATUS
    data['parent_build'] = PARENT
    if 'asset_token' in data:data['asset_token'] = 'market-core-v2.0-alpha-build-40.6.42'
    if 'administrator_build' in data:data['administrator_build'] = BUILD_NO
    if 'build_label' in data:data['build_label'] = 'Build 40.6.42'
    if 'release_status' in data:data['release_status'] = RELEASE
    for key in ('timestamp','prepared_at','published_at'):
        if key in data:data[key] = now
    if isinstance(data.get('current_version_truth'), dict):data['current_version_truth']['loaded_build'] = BUILD_NO
    data['cascade_40_6_42'] = {
        'parent_build': PARENT,
        'release': RELEASE,
        'status': STATUS,
        'scope': 'Aether presentation + information architecture only',
        'responsive_component_grid': True,
        'structured_information_cards': ['system','sources','atlas','oracle','market','convergence','divergence','events','weather','core'],
        'backplate_geometry_owner': False,
        'old_artwork_used_as_decorative_backplate_only': True,
        'old_artwork_modified': False,
        'native_window_manager_preserved': True,
        'free_resize_406041_preserved': True,
        'graph_first_lazy_406037_preserved': True,
        'workbench_406039_preserved': True,
        'new_network_owner': False,
        'new_recurring_timer': False,
        'new_observer': False,
        'new_storage_owner': False,
        'market_core_modified': False,
        'graph_runtime_modified': False,
        'oracle_engine_modified': False,
        'technical_reading_modified': False,
        'chronos_modified': False,
        'window_manager_core_modified': False,
        'final_wide_textless_background_pending': True,
        'automatic_order': False,
        'real_order': False
    }
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

RELEASE_MD.write_text(f'''# Agent-Crypto {BUILD_NO} — {RELEASE}

Parent: {PARENT}  
Engine: Market Core {ENGINE}

## Purpose

40.6.42 is the structural reset of Aether Watch presentation. It keeps the existing data owners and replaces the image-driven overlay as the primary UI with a responsive component grid.

### New component contract

- System: status + CPU / RAM / GPU values and temperatures when available.
- Sources: Binance coverage, Book readiness, News state, Atlas Data state.
- Atlas: CURRENT/status, directional score, signal, report coverage, resident wake state.
- Oracle: asset, scenario, regime, confidence, hausse/baisse force and coherence when exposed by the existing Oracle DOM.
- Market: rises, falls, stable assets, breadth state and Top 5 balance.
- Convergence: aligned ratio, percentage, dominant direction, confirming/opposing layers.
- Divergence: explicit status and conflict text.
- Events: 3-entry live preview; click opens the existing lazy Workbench.
- Weather: today, rain, max gust and risk status.
- Aether Core: attention level, why-now, watch conditions and readable note.

## Architecture

The legacy `aether-observatory-background-406032.webp` is still present, but only at low opacity as a decorative `cover` backplate. It no longer determines card coordinates, aspect ratio or window dimensions. CSS Grid and container queries own presentation.

## Preserved

- Market Core 38.15.11.
- Graph-first lazy scheduling from 40.6.37.
- 40.6.39 Workbench and its interaction-on-demand load.
- 40.6.40 native Administrator Window Manager integration.
- 40.6.41 free-resize shell.
- Graphique, Oracle engine/FX, Lecture Technique, Chronos, Version Truth and Window Manager core.
- exact current artwork bytes.
- no new fetch/WebSocket/recurring timer/observer/storage owner.
- no automatic or real order.

The final wider textless Aether background remains deliberately deferred until the responsive layout is validated in Firefox and F11.
''', encoding='utf-8')

# Static gates.
subprocess.run(['node', '--check', str(APP_JS)], check=True)
subprocess.run(['node', '--check', str(AETHER_JS)], check=True)
subprocess.run(['node', '--check', str(WORKBENCH)], check=True)
require(git_blob(APP_JS) == APP_BLOB, 'app.js changed unexpectedly')
require(git_blob(WORKBENCH) == WORKBENCH_BLOB, 'Workbench changed unexpectedly')
require(sha256(ASSET) == ASSET_SHA, 'artwork changed unexpectedly')
new_aether = AETHER_JS.read_text(encoding='utf-8')
owner_counts_after = {
    'fetch': new_aether.count('fetch('),
    'websocket': new_aether.count('WebSocket('),
    'interval': new_aether.count('setInterval('),
    'storage_set': new_aether.count('localStorage.setItem(') + new_aether.count('sessionStorage.setItem('),
}
require(owner_counts_after == owner_counts_before, f'owner count drift: {owner_counts_before} -> {owner_counts_after}')
require(JS_MARKER in new_aether, 'component JS marker missing')
require('aetherComponentViewModel406042' in new_aether, 'view model missing')
require('aetherComponentPaint406042' in new_aether, 'component painter missing')
require('aether_attention_backplate_geometry_owner:false' in new_aether, 'backplate ownership truth missing')
require(CSS_MARKER in CSS.read_text(encoding='utf-8'), 'component CSS marker missing')
require('grid-template-areas' in CSS.read_text(encoding='utf-8'), 'responsive grid missing')
require('container-name:aether-stage-406042' in CSS.read_text(encoding='utf-8'), 'stage container missing')
require('"engine": "38.15.11"' in BUILD.read_text(encoding='utf-8'), 'engine truth changed')

files = [INDEX, BUILD, ADMIN_VERSION, VERSION, CSS, AETHER_JS, RELEASE_MD]
ZIP.parent.mkdir(parents=True, exist_ok=True)
with zipfile.ZipFile(ZIP, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for src in files:z.write(src, Path('administrator') / src.relative_to(ROOT))
with zipfile.ZipFile(ZIP) as z:
    names=[n for n in z.namelist() if not n.endswith('/')]
    require(len(names)==7, f'ZIP file count drift: {len(names)} {names}')
    require(z.testzip() is None, 'ZIP integrity failed')
    require('administrator/js/aether.js' in names, 'Aether runtime absent from ZIP')
    require('administrator/admin-ribbons.css' in names, 'component CSS absent from ZIP')

zip_sha=sha256(ZIP)
SHA.write_text(f'{zip_sha}  {ZIP.name}\n', encoding='utf-8')
print(json.dumps({'build':BUILD_NO,'zip_sha256':zip_sha,'files':7,'owner_counts':owner_counts_after}, ensure_ascii=False))
