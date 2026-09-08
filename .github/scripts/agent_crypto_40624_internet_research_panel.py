#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, re, zipfile

ROOT=Path('public/agent_crypto_erith_ia/administrator')
BUILD='40.6.24';PARENT='40.6.23';ENGINE='38.15.11'
RELEASE='INTERNET RESEARCH PANEL · EXTERNAL SEARCH · SOURCE BOUNDARY LOCK'
STATUS='internet_research_external_search_source_boundary_lock_406024'
TOKEN=f'market-core-v2.0-alpha-build-{BUILD}'
NOW=datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z')

def load(n):
    d=json.loads((ROOT/n).read_text(encoding='utf-8'))
    if not isinstance(d,dict):raise SystemExit(f'STOP {BUILD}: invalid {n}')
    return d

def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()

if str(load('build.json').get('build'))!=PARENT:raise SystemExit(f'STOP {BUILD}: expected parent {PARENT}')
if str(load('build.json').get('engine'))!=ENGINE:raise SystemExit(f'STOP {BUILD}: engine drift')

index_p=ROOT/'index.html';atlas_p=ROOT/'views/atlas.html';pres_p=ROOT/'js/views/atlas-presentation.js'
index=index_p.read_text(encoding='utf-8');atlas=atlas_p.read_text(encoding='utf-8');pres=pres_p.read_text(encoding='utf-8')

protected=[
 'admin-chronos.css','js/version-truth.js','oracle-presentation-405010.css','oracle-fx-406013.css','js/oracle-fx-406013.js',
 'parallel-markets.css','market-reading-depth.css','js/core/admin-window-manager.js','js/strategy-a-paper-lifecycle-404295.js','js/app.js',
 'js/aerith10-workspace-bridge-406021.js','salon-partage-406022.css','js/salon-partage-406022.js','aerith10-portal-406023.css'
]
protected_before={p:(ROOT/p).read_bytes() for p in protected}

def block(text, cls, name):
    m=re.search(rf'\n    <details class="atlas-collapse glass {re.escape(cls)}[\s\S]*?\n    </details>',text)
    if not m:raise SystemExit(f'STOP {BUILD}: {name} block missing')
    return m.group(0)

def forge_block(text):
    m=re.search(r'\n    <details class="atlas-collapse glass forge-aerith-collapse[\s\S]*?\n</details>',text)
    if not m:raise SystemExit(f'STOP {BUILD}: Forge block missing')
    return m.group(0)

creator_a=block(atlas,'aerith10-creator-collapse','Creator');creator_p=block(pres,'aerith10-creator-collapse','Creator')
salon_a=block(atlas,'salon-partage-collapse','Salon');salon_p=block(pres,'salon-partage-collapse','Salon')
forge_a=forge_block(atlas);forge_p=forge_block(pres)
if 'id="internet-research"' in atlas or 'id="internet-research"' in pres:raise SystemExit(f'STOP {BUILD}: research panel already present')

panel='''

    <details class="atlas-collapse glass internet-research-collapse atlas-family-member atlas-tone-intelligence" data-collapse-key="internet-research" id="internet-research" data-layout-family="intelligence">
      <summary class="atlas-collapse-summary">
        <span class="atlas-collapse-icon" aria-hidden="true">▶</span>
        <span class="atlas-collapse-title">🌐 Recherche Internet</span>
        <span class="atlas-collapse-subtitle">Web externe · Google · Bing · DuckDuckGo · aucune ingestion automatique</span>
      </summary>
      <div class="atlas-collapse-body">
        <section class="panel glass internet-research-panel" aria-labelledby="internetResearchTitle">
          <div class="internet-research-head">
            <div><strong id="internetResearchTitle">Internet Research · source externe</strong><span>Préparer une requête puis ouvrir volontairement le moteur choisi dans un nouvel onglet.</span></div>
            <span class="internet-research-truth">WEB EXTERNE · OPÉRATEUR</span>
          </div>
          <form class="internet-research-form" id="internetResearchForm">
            <label for="internetResearchQuery">Recherche</label>
            <div class="internet-research-query-row"><input id="internetResearchQuery" type="search" maxlength="300" autocomplete="off" placeholder="Ex. Bitcoin ETF flux institutionnels aujourd’hui…" /><button type="submit" class="btn primary">Google ↗</button></div>
          </form>
          <div class="internet-research-engines" role="group" aria-label="Choisir un moteur de recherche">
            <button type="button" class="btn small" data-internet-engine="google">Google ↗</button>
            <button type="button" class="btn small" data-internet-engine="bing">Bing ↗</button>
            <button type="button" class="btn small" data-internet-engine="duckduckgo">DuckDuckGo ↗</button>
          </div>
          <div class="internet-research-boundary">
            <b>Frontière de vérité</b>
            <span>Une recherche Web n’est ni une mémoire Atlas, ni une source canonique, ni une conclusion Aerith-10. Aucun résultat n’entre dans Agent-Crypto sans action explicite de l’opérateur.</span>
          </div>
          <p class="internet-research-status" id="internetResearchStatus">PRÊT · aucune requête envoyée par cette page.</p>
        </section>
      </div>
    </details>
'''

# Insert immediately before Forge, therefore after existing Salon.
for label,text in [('atlas',atlas),('presentation',pres)]:
    fb=forge_block(text)
    if text.count(fb)!=1:raise SystemExit(f'STOP {BUILD}: Forge nonunique in {label}')
    text=text.replace(fb,panel+fb,1)
    if label=='atlas':atlas=text
    else:pres=text
atlas_p.write_text(atlas,encoding='utf-8');pres_p.write_text(pres,encoding='utf-8')

# Existing Creator, Salon and Forge blocks remain exact.
fa=atlas_p.read_text(encoding='utf-8');fp=pres_p.read_text(encoding='utf-8')
if block(fa,'aerith10-creator-collapse','Creator')!=creator_a or block(fp,'aerith10-creator-collapse','Creator')!=creator_p:raise SystemExit(f'STOP {BUILD}: Creator changed')
if block(fa,'salon-partage-collapse','Salon')!=salon_a or block(fp,'salon-partage-collapse','Salon')!=salon_p:raise SystemExit(f'STOP {BUILD}: Salon changed')
if forge_block(fa)!=forge_a or forge_block(fp)!=forge_p:raise SystemExit(f'STOP {BUILD}: Forge changed')

css_p=ROOT/'internet-research-406024.css'
css_p.write_text('''/* 40.6.24 — Internet Research Panel · external navigation only */
.internet-research-collapse{border-color:rgba(105,202,255,.20)!important}.internet-research-collapse>.atlas-collapse-summary{background:linear-gradient(90deg,rgba(42,112,164,.13),rgba(19,26,45,.16))!important}.internet-research-collapse .atlas-collapse-title{color:#ddf5ff!important}
.internet-research-panel{padding:11px!important;border-color:rgba(105,202,255,.18)!important;background:linear-gradient(145deg,rgba(8,20,32,.93),rgba(10,17,31,.84))!important}.internet-research-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:11px}.internet-research-head>div{display:flex;flex-direction:column;gap:3px}.internet-research-head strong{color:#eaf9ff;font-size:14px}.internet-research-head>div span{color:#91aabb;font-size:10px}.internet-research-truth{padding:4px 8px;border:1px solid rgba(110,211,255,.25);border-radius:999px;color:#9fe8ff!important;font-size:9px;font-weight:900;white-space:nowrap}
.internet-research-form{display:grid;gap:5px}.internet-research-form>label{font-size:9px;font-weight:900;letter-spacing:.12em;text-transform:uppercase;color:#87a9ba}.internet-research-query-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px}.internet-research-query-row input{box-sizing:border-box;width:100%;min-height:38px;border:1px solid rgba(115,202,232,.20);border-radius:10px;background:rgba(1,9,17,.76);color:#e1f5fb;padding:8px 10px}.internet-research-query-row input:focus{outline:none;border-color:rgba(108,223,255,.46);box-shadow:0 0 0 2px rgba(75,192,230,.08)}
.internet-research-engines{display:flex;gap:7px;flex-wrap:wrap;margin:9px 0}.internet-research-boundary{display:grid;gap:4px;padding:9px 10px;border:1px solid rgba(255,210,112,.13);border-radius:10px;background:rgba(35,27,12,.18)}.internet-research-boundary b{color:#ffe3a1;font-size:10px}.internet-research-boundary span{color:#a7b5bf;font-size:10px;line-height:1.45}.internet-research-status{margin:8px 0 0;color:#7893a2;font-size:9px}
@media(max-width:780px){.internet-research-head{flex-direction:column}.internet-research-query-row{grid-template-columns:1fr}.internet-research-query-row .btn{width:100%}}
''',encoding='utf-8')

js_p=ROOT/'js/internet-research-406024.js'
js_p.write_text(r'''(() => {
  "use strict";
  const BUILD="40.6.24";
  const engines=Object.freeze({
    google:q=>`https://www.google.com/search?q=${encodeURIComponent(q)}`,
    bing:q=>`https://www.bing.com/search?q=${encodeURIComponent(q)}`,
    duckduckgo:q=>`https://duckduckgo.com/?q=${encodeURIComponent(q)}`
  });
  function query(){return String(document.getElementById('internetResearchQuery')?.value||'').trim().slice(0,300);}
  function status(text){const n=document.getElementById('internetResearchStatus');if(n)n.textContent=text;}
  function openExternal(engine){const q=query();if(!q){status('REQUÊTE VIDE · rien n’a été ouvert.');document.getElementById('internetResearchQuery')?.focus();return false;}const make=engines[engine]||engines.google;const a=document.createElement('a');a.href=make(q);a.target='_blank';a.rel='noopener noreferrer';a.style.display='none';document.body.append(a);a.click();a.remove();status(`${String(engine||'google').toUpperCase()} · ouverture externe demandée · aucune ingestion automatique.`);return true;}
  function openPanel(e){if(e)e.preventDefault();const d=document.getElementById('internet-research');if(!d)return false;d.open=true;d.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(()=>document.getElementById('internetResearchQuery')?.focus(),250);return true;}
  function bind(){document.getElementById('internetResearchForm')?.addEventListener('submit',e=>{e.preventDefault();openExternal('google');});document.querySelectorAll('[data-internet-engine]').forEach(b=>b.addEventListener('click',()=>openExternal(b.dataset.internetEngine)));document.querySelectorAll('a[href="#internet-research"]').forEach(a=>a.addEventListener('click',openPanel));if(location.hash==='#internet-research')setTimeout(()=>openPanel(),0);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
  globalThis.ErithInternetResearch406024=Object.freeze({build:BUILD,open:openExternal,engines:Object.keys(engines),page_fetch:false,result_ingestion:false,storage_write:false,timer:false,observer:false,financial_action:false});
})();
''',encoding='utf-8')

# Index: quick navigation + assets + build identity.
salon_link='<a href="#salon-partage" data-v2-level="project" class="atlas-quick-link salon-partage-quick-link"><span class="atlas-quick-icon" aria-hidden="true">✉</span><span>Salon</span></a>'
if index.count(salon_link)!=1:raise SystemExit(f'STOP {BUILD}: Salon quick link anchor count')
web_link='<a href="#internet-research" data-v2-level="project" class="atlas-quick-link internet-research-quick-link"><span class="atlas-quick-icon" aria-hidden="true">🌐</span><span>Web</span></a>'
index=index.replace(salon_link,salon_link+'\n                  '+web_link,1)
css_anchor='<link rel="stylesheet" href="./salon-partage-406022.css?v=administrator-build-40.6.22" />'
if index.count(css_anchor)!=1:raise SystemExit(f'STOP {BUILD}: Salon CSS anchor count')
index=index.replace(css_anchor,css_anchor+'\n  <link rel="stylesheet" href="./internet-research-406024.css?v=administrator-build-40.6.24" />',1)
js_anchor='<script defer src="./js/salon-partage-406022.js?v=administrator-build-40.6.22"></script>'
if index.count(js_anchor)!=1:raise SystemExit(f'STOP {BUILD}: Salon JS anchor count')
index=index.replace(js_anchor,js_anchor+'\n  <script defer src="./js/internet-research-406024.js?v=administrator-build-40.6.24"></script>',1)
repls={f'<meta name="atlas-build" content="{PARENT}" />':f'<meta name="atlas-build" content="{BUILD}" />',f'<meta name="administrator-build" content="{PARENT}" />':f'<meta name="administrator-build" content="{BUILD}" />','<meta name="administrator-release" content="AERITH-10 CRÉATRICE · PORTAL FALLBACK · NOTION FRAME-BLOCK SAFE" />':f'<meta name="administrator-release" content="{RELEASE}" />',f'<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-{PARENT}" />':f'<meta name="atlas-asset-token" content="{TOKEN}" />',f'<title>Agent-Crypto @erith.IA — Build {PARENT} · Administrator</title>':f'<title>Agent-Crypto @erith.IA — Build {BUILD} · Administrator</title>'}
for old,new in repls.items():
    if old not in index:raise SystemExit(f'STOP {BUILD}: missing identity {old}')
    index=index.replace(old,new,1)
index,n1=re.subn(r'(id="atlasVersionTruthControl"[\s\S]{0,700}?aria-label="Version Agent-Crypto installée : Build )[^,\"]+(, mode Administrator\")',rf'\g<1>{BUILD}\g<2>',index,count=1);index,n2=re.subn(r'(<span id="atlasVersionTruthText">Build )[^<]+(</span>)',rf'\g<1>{BUILD}\g<2>',index,count=1)
if n1!=1 or n2!=1:raise SystemExit(f'STOP {BUILD}: version first-paint mismatch')
index_p.write_text(index,encoding='utf-8')

release_p=ROOT/'RELEASE_40_6_24.md'
release_p.write_text(f'''# Agent-Crypto {BUILD} — {RELEASE}\n\n- Parent `{PARENT}`; Market Core `{ENGINE}` protected.\n- Adds one small Internet Research subsection after the Local Salon and before Forge.\n- Google, Bing and DuckDuckGo are opened only after an explicit operator action.\n- No search result is fetched, parsed, embedded or ingested by Agent-Crypto.\n- No API key, proxy, credential, timer, observer or storage owner is added.\n- External Web is explicitly distinguished from Atlas memory, canonical sources and Aerith-10 interpretation.\n- Creator portal 40.6.23, Workspace Bridge 40.6.21, Salon 40.6.22 and Forge remain unchanged.\n- Oracle 40.6.13 + FX, Chronos, Version Truth, Graphique, Lecture Technique, Paper/Safety, Window Manager and Market Core remain frozen.\n''',encoding='utf-8')

for name in ('build.json','administrator-version.json','version.json'):
    d=load(name);d['build']=BUILD;d['release']=RELEASE;d['status']=STATUS;d['parent_build']=PARENT;d['asset_token']=TOKEN
    if 'administrator_build' in d:d['administrator_build']=BUILD
    if 'build_label' in d:d['build_label']=f'Build {BUILD}'
    for k in ('timestamp','prepared_at','published_at'):
        if k in d:d[k]=NOW
    if isinstance(d.get('current_version_truth'),dict):d['current_version_truth']['loaded_build']=BUILD
    d['cascade_40_6_24']={'parent_build':PARENT,'scope':'internet_research_external_navigation_only','engines':['google','bing','duckduckgo'],'page_fetch_added':False,'result_ingestion_added':False,'api_key_added':False,'proxy_added':False,'storage_owner_added':False,'creator_portal_modified':False,'salon_modified':False,'forge_modified':False,'market_core_modified':False,'oracle_modified':False,'chronos_modified':False,'version_truth_modified':False,'graph_modified':False,'technical_reading_modified':False,'paper_safety_modified':False,'window_manager_modified':False,'new_timer':False,'new_observer':False,'financial_action_added':False}
    (ROOT/name).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
version=load('version.json');files=version.setdefault('files',{})
for rel in ('index.html','views/atlas.html','js/views/atlas-presentation.js','internet-research-406024.css','js/internet-research-406024.js','build.json','administrator-version.json','RELEASE_40_6_24.md'):files[rel]=sha(ROOT/rel)
(ROOT/'version.json').write_text(json.dumps(version,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

# Final freeze proofs.
fa=atlas_p.read_text(encoding='utf-8');fp=pres_p.read_text(encoding='utf-8')
if block(fa,'aerith10-creator-collapse','Creator')!=creator_a or block(fp,'aerith10-creator-collapse','Creator')!=creator_p:raise SystemExit(f'STOP {BUILD}: Creator changed')
if block(fa,'salon-partage-collapse','Salon')!=salon_a or block(fp,'salon-partage-collapse','Salon')!=salon_p:raise SystemExit(f'STOP {BUILD}: Salon changed')
if forge_block(fa)!=forge_a or forge_block(fp)!=forge_p:raise SystemExit(f'STOP {BUILD}: Forge changed')
for label,text in [('atlas',fa),('presentation',fp)]:
    if text.count('id="internet-research"')!=1:raise SystemExit(f'STOP {BUILD}: research panel count in {label}')
    if text.find('id="salon-partage"')>text.find('id="internet-research"') or text.find('id="internet-research"')>text.find('id="forge-aerith"'):raise SystemExit(f'STOP {BUILD}: research placement wrong in {label}')
for p,b in protected_before.items():
    if (ROOT/p).read_bytes()!=b:raise SystemExit(f'STOP {BUILD}: protected file changed {p}')
if str(load('build.json').get('engine'))!=ENGINE:raise SystemExit(f'STOP {BUILD}: engine drift after surgery')

outdir=Path('coordination/inter_ai_dialogues/agent_crypto');outdir.mkdir(parents=True,exist_ok=True)
out=outdir/'AGENT_CRYPTO_BUILD_40_6_24_INTERNET_RESEARCH_PANEL_CLEAN_UPLOAD_9_FILES.zip'
rels=['index.html','views/atlas.html','js/views/atlas-presentation.js','internet-research-406024.css','js/internet-research-406024.js','build.json','administrator-version.json','version.json','RELEASE_40_6_24.md']
with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for rel in rels:z.write(ROOT/rel,(ROOT/rel).as_posix())
digest=sha(out);Path(str(out)+'.sha256').write_text(f'{digest}  {out.name}\n',encoding='utf-8')
print(json.dumps({'ok':True,'build':BUILD,'parent':PARENT,'zip':out.as_posix(),'sha256':digest},ensure_ascii=False))
