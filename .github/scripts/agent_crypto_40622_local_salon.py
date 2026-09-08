#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, re, zipfile

ROOT=Path('public/agent_crypto_erith_ia/administrator')
BUILD='40.6.22';PARENT='40.6.21';ENGINE='38.15.11'
RELEASE='SALON DE PARTAGE · LOCAL FIRST · OPERATOR-ONLY MESSAGE SPACE'
STATUS='salon_partage_local_first_operator_only_406022'
TOKEN=f'market-core-v2.0-alpha-build-{BUILD}'
NOW=datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z')

def load(n):
    d=json.loads((ROOT/n).read_text(encoding='utf-8'))
    if not isinstance(d,dict):raise SystemExit(f'STOP {BUILD}: invalid {n}')
    return d

def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
if str(load('version.json').get('build'))!=PARENT:raise SystemExit(f'STOP {BUILD}: expected {PARENT}')
if str(load('build.json').get('engine'))!=ENGINE:raise SystemExit(f'STOP {BUILD}: engine drift')

index_p=ROOT/'index.html';atlas_p=ROOT/'views/atlas.html';pres_p=ROOT/'js/views/atlas-presentation.js'
index=index_p.read_text(encoding='utf-8');atlas=atlas_p.read_text(encoding='utf-8');pres=pres_p.read_text(encoding='utf-8')

def creator_block(t):
    m=re.search(r'\n    <details class="atlas-collapse glass aerith10-creator-collapse[\s\S]*?\n    </details>',t)
    if not m:raise SystemExit(f'STOP {BUILD}: creator block missing')
    return m.group(0)
def forge_block(t):
    m=re.search(r'\n    <details class="atlas-collapse glass forge-aerith-collapse[\s\S]*?\n</details>',t)
    if not m:raise SystemExit(f'STOP {BUILD}: forge block missing')
    return m.group(0)
creator_a=creator_block(atlas);creator_p=creator_block(pres);forge_a=forge_block(atlas);forge_p=forge_block(pres)
if 'id="salon-partage"' in atlas or 'id="salon-partage"' in pres:raise SystemExit(f'STOP {BUILD}: salon already present')

salon='''

    <details class="atlas-collapse glass salon-partage-collapse atlas-family-member atlas-tone-creation" data-collapse-key="salon-partage" id="salon-partage" data-layout-family="creation">
      <summary class="atlas-collapse-summary">
        <span class="atlas-collapse-icon" aria-hidden="true">▶</span>
        <span class="atlas-collapse-title">✉ Salon de partage</span>
        <span class="atlas-collapse-subtitle">Local First · messages de ce Firefox · backend partagé non connecté</span>
      </summary>
      <div class="atlas-collapse-body">
        <section class="panel glass salon-partage-panel" aria-labelledby="salonPartageTitle">
          <div class="salon-partage-head">
            <div><strong id="salonPartageTitle">Salon ERITH · Local First</strong><span>Laisser des messages et repères localement avant le futur raccord multi-utilisateur.</span></div>
            <span class="salon-partage-truth">LOCAL · CE FIREFOX</span>
          </div>
          <div class="salon-partage-compose">
            <label><span>Pseudo</span><input id="salonPartageAuthor" type="text" maxlength="48" value="Opérateur" autocomplete="off" /></label>
            <label class="salon-partage-message-field"><span>Message</span><textarea id="salonPartageMessage" maxlength="1000" placeholder="Écrire un message, une note ou un repère…"></textarea></label>
            <button type="button" class="btn primary" id="btnSalonPartageSend">Envoyer localement</button>
          </div>
          <div class="salon-partage-toolbar">
            <span id="salonPartageCount">0 message</span>
            <div><button type="button" class="btn small" id="btnSalonPartageExport">Exporter JSON</button><button type="button" class="btn small danger" id="btnSalonPartageClear">Effacer le salon local</button></div>
          </div>
          <ol class="salon-partage-list" id="salonPartageList" aria-live="polite"></ol>
          <p class="salon-partage-note">Vérité de portée : cette version ne partage encore rien avec les autres utilisateurs. Aucun serveur, compte, API ou réseau n’est utilisé par le Salon.</p>
        </section>
      </div>
    </details>
'''
for label,text in [('atlas',atlas),('presentation',pres)]:
    fb=forge_block(text)
    if text.count(fb)!=1:raise SystemExit(f'STOP {BUILD}: forge nonunique {label}')
    text=text.replace(fb,salon+fb,1)
    if label=='atlas':atlas=text
    else:pres=text
atlas_p.write_text(atlas,encoding='utf-8');pres_p.write_text(pres,encoding='utf-8')
# Creator and Forge must remain exact.
if creator_block(atlas_p.read_text(encoding='utf-8'))!=creator_a or creator_block(pres_p.read_text(encoding='utf-8'))!=creator_p:raise SystemExit(f'STOP {BUILD}: creator changed')
if forge_block(atlas_p.read_text(encoding='utf-8'))!=forge_a or forge_block(pres_p.read_text(encoding='utf-8'))!=forge_p:raise SystemExit(f'STOP {BUILD}: forge changed')

css_p=ROOT/'salon-partage-406022.css'
css_p.write_text('''/* 40.6.22 — Salon de partage · Local First */
.salon-partage-collapse{border-color:rgba(90,224,208,.20)!important}.salon-partage-collapse>.atlas-collapse-summary{background:linear-gradient(90deg,rgba(24,111,112,.12),rgba(19,27,46,.16))!important}.salon-partage-collapse .atlas-collapse-title{color:#dffcf3!important}
.salon-partage-panel{padding:11px!important;border-color:rgba(94,222,206,.18)!important;background:linear-gradient(145deg,rgba(8,22,31,.92),rgba(11,20,34,.82))!important}.salon-partage-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:10px}.salon-partage-head>div{display:flex;flex-direction:column;gap:3px}.salon-partage-head strong{color:#e9fff8;font-size:14px}.salon-partage-head>div span{color:#94afba;font-size:10px}.salon-partage-truth{padding:4px 8px;border:1px solid rgba(95,255,212,.25);border-radius:999px;color:#91f4d8!important;font-size:9px;font-weight:900;white-space:nowrap}
.salon-partage-compose{display:grid;grid-template-columns:minmax(130px,.32fr) minmax(280px,1.5fr) auto;gap:8px;align-items:end}.salon-partage-compose label{display:grid;gap:4px}.salon-partage-compose label>span{font-size:9px;letter-spacing:.10em;color:#8da6b4;font-weight:800;text-transform:uppercase}.salon-partage-compose input,.salon-partage-compose textarea{box-sizing:border-box;width:100%;border:1px solid rgba(112,202,214,.18);border-radius:9px;background:rgba(1,10,18,.74);color:#e3f3f5;padding:8px}.salon-partage-compose textarea{min-height:70px;max-height:150px;resize:vertical}
.salon-partage-toolbar{display:flex;justify-content:space-between;gap:10px;align-items:center;margin:9px 0}.salon-partage-toolbar>span{color:#82d9c6;font-size:10px;font-weight:800}.salon-partage-toolbar>div{display:flex;gap:6px;flex-wrap:wrap}.salon-partage-list{display:grid;gap:7px;list-style:none;margin:0;padding:0;max-height:360px;overflow:auto}.salon-partage-item{padding:8px 9px;border:1px solid rgba(124,196,210,.12);border-radius:10px;background:rgba(4,14,23,.58)}.salon-partage-item-head{display:flex;justify-content:space-between;gap:8px;margin-bottom:4px}.salon-partage-item-head b{color:#dff8f2;font-size:10px}.salon-partage-item-head time{color:#708b98;font-size:9px}.salon-partage-item p{margin:0;color:#bfd0d6;font-size:11px;line-height:1.42;white-space:pre-wrap;overflow-wrap:anywhere}.salon-partage-note{margin:9px 0 0;color:#718a96;font-size:9px}
@media(max-width:900px){.salon-partage-compose{grid-template-columns:1fr}.salon-partage-head,.salon-partage-toolbar{align-items:flex-start;flex-direction:column}}
''',encoding='utf-8')

js_p=ROOT/'js/salon-partage-406022.js'
js_p.write_text(r'''(() => {
  "use strict";
  const BUILD="40.6.22", KEY="agent_crypto_erith_ia_salon_local_v1", MAX=80;
  function safeParse(){try{const v=JSON.parse(localStorage.getItem(KEY)||"[]");return Array.isArray(v)?v.filter(x=>x&&typeof x==='object').slice(-MAX):[];}catch(_){return[];}}
  function save(rows){try{localStorage.setItem(KEY,JSON.stringify(rows.slice(-MAX)));return true;}catch(_){return false;}}
  function render(){const list=document.getElementById('salonPartageList'),count=document.getElementById('salonPartageCount');if(!list)return;const rows=safeParse();list.replaceChildren();for(const row of [...rows].reverse()){const li=document.createElement('li');li.className='salon-partage-item';const head=document.createElement('div');head.className='salon-partage-item-head';const b=document.createElement('b');b.textContent=String(row.author||'Opérateur');const t=document.createElement('time');const d=new Date(row.at||Date.now());t.dateTime=d.toISOString();t.textContent=d.toLocaleString('fr-FR');head.append(b,t);const p=document.createElement('p');p.textContent=String(row.message||'');li.append(head,p);list.append(li);}if(count)count.textContent=`${rows.length} message${rows.length>1?'s':''}`;}
  function send(){const a=document.getElementById('salonPartageAuthor'),m=document.getElementById('salonPartageMessage');const author=String(a?.value||'Opérateur').trim().slice(0,48)||'Opérateur';const message=String(m?.value||'').trim().slice(0,1000);if(!message){m?.focus();return;}const rows=safeParse();rows.push({id:`LOCAL-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,author,message,at:new Date().toISOString(),scope:'THIS_FIREFOX_ONLY'});if(save(rows)){if(m)m.value='';render();}}
  function clearAll(){if(!confirm('Effacer uniquement les messages locaux de ce Salon sur ce Firefox ?'))return;try{localStorage.removeItem(KEY);}catch(_){}render();}
  function exportRows(){const rows=safeParse(),blob=new Blob([JSON.stringify({schema:'erith_local_salon_v1',build:BUILD,scope:'THIS_FIREFOX_ONLY',exported_at:new Date().toISOString(),messages:rows},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`erith-salon-local-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
  function openSalon(e){if(e)e.preventDefault();const d=document.getElementById('salon-partage');if(!d)return false;d.open=true;d.scrollIntoView({behavior:'smooth',block:'start'});return true;}
  function bind(){document.getElementById('btnSalonPartageSend')?.addEventListener('click',send);document.getElementById('btnSalonPartageClear')?.addEventListener('click',clearAll);document.getElementById('btnSalonPartageExport')?.addEventListener('click',exportRows);document.getElementById('salonPartageMessage')?.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();send();}});document.querySelectorAll('a[href="#salon-partage"]').forEach(a=>a.addEventListener('click',openSalon));if(location.hash==='#salon-partage')setTimeout(()=>openSalon(),0);render();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
  globalThis.ErithLocalSalon406022=Object.freeze({build:BUILD,scope:'THIS_FIREFOX_ONLY',multi_user:false,backend:false,network:false,storage:'localStorage',render});
})();
''',encoding='utf-8')

# Index nav + assets + identity. No module picker to avoid claiming canonical app routing.
creator_link='<a href="#aerith10-creator" data-v2-level="project" class="atlas-quick-link aerith10-creator-quick-link"><span class="atlas-quick-icon" aria-hidden="true">🌸</span><span>Créatrice</span></a>'
if creator_link not in index:raise SystemExit(f'STOP {BUILD}: creator quick link missing')
salon_link='<a href="#salon-partage" data-v2-level="project" class="atlas-quick-link salon-partage-quick-link"><span class="atlas-quick-icon" aria-hidden="true">✉</span><span>Salon</span></a>'
index=index.replace(creator_link,creator_link+'\n                  '+salon_link,1)
css_anchor='<link rel="stylesheet" href="./aerith10-creator-406020.css?v=administrator-build-40.6.20" />'
if css_anchor not in index:raise SystemExit(f'STOP {BUILD}: creator CSS anchor missing')
index=index.replace(css_anchor,css_anchor+'\n  <link rel="stylesheet" href="./salon-partage-406022.css?v=administrator-build-40.6.22" />',1)
js_anchor='<script defer src="./js/aerith10-workspace-bridge-406021.js?v=administrator-build-40.6.21"></script>'
if js_anchor not in index:raise SystemExit(f'STOP {BUILD}: bridge JS anchor missing')
index=index.replace(js_anchor,js_anchor+'\n  <script defer src="./js/salon-partage-406022.js?v=administrator-build-40.6.22"></script>',1)
repls={f'<meta name="atlas-build" content="{PARENT}" />':f'<meta name="atlas-build" content="{BUILD}" />',f'<meta name="administrator-build" content="{PARENT}" />':f'<meta name="administrator-build" content="{BUILD}" />','<meta name="administrator-release" content="AERITH-10 CRÉATRICE · WORKSPACE BRIDGE · ATLAS→CREATOR→FORGE" />':f'<meta name="administrator-release" content="{RELEASE}" />',f'<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-{PARENT}" />':f'<meta name="atlas-asset-token" content="{TOKEN}" />',f'<title>Agent-Crypto @erith.IA — Build {PARENT} · Administrator</title>':f'<title>Agent-Crypto @erith.IA — Build {BUILD} · Administrator</title>'}
for old,new in repls.items():
    if old not in index:raise SystemExit(f'STOP {BUILD}: missing identity {old}')
    index=index.replace(old,new,1)
index,n1=re.subn(r'(id="atlasVersionTruthControl"[\s\S]{0,700}?aria-label="Version Agent-Crypto installée : Build )[^,\"]+(, mode Administrator\")',rf'\g<1>{BUILD}\g<2>',index,count=1);index,n2=re.subn(r'(<span id="atlasVersionTruthText">Build )[^<]+(</span>)',rf'\g<1>{BUILD}\g<2>',index,count=1)
if n1!=1 or n2!=1:raise SystemExit(f'STOP {BUILD}: version badge')
index_p.write_text(index,encoding='utf-8')

release_p=ROOT/'RELEASE_40_6_22.md';release_p.write_text(f'''# Agent-Crypto {BUILD} — {RELEASE}\n\n- Parent `{PARENT}`; Market Core `{ENGINE}` protected.\n- New Salon is explicitly local to this Firefox: no backend, no account, no shared network state.\n- Messages are plain text, rendered with `textContent`, capped at 80 local rows and 1000 characters/message.\n- Operator-triggered export JSON and explicit local clear only.\n- Aerith-10 Creator block and Forge block preserved byte-for-byte.\n- No app.js, Oracle, Graphique, Lecture Technique, Chronos, Version Truth, Paper/Safety, Window Manager or financial behavior modified.\n''',encoding='utf-8')

for n in ('build.json','administrator-version.json','version.json'):
    d=load(n);d['build']=BUILD;d['release']=RELEASE;d['status']=STATUS;d['parent_build']=PARENT;d['asset_token']=TOKEN
    if 'administrator_build' in d:d['administrator_build']=BUILD
    if 'build_label' in d:d['build_label']=f'Build {BUILD}'
    for k in ('timestamp','prepared_at','published_at'):
        if k in d:d[k]=NOW
    if isinstance(d.get('current_version_truth'),dict):d['current_version_truth']['loaded_build']=BUILD
    d['cascade_40_6_22']={'parent_build':PARENT,'scope':'local_first_salon_only','multi_user':False,'backend_connected':False,'network_added':False,'storage_owner':'localStorage dedicated key','message_rendering':'textContent only','max_messages':80,'creator_block_modified':False,'forge_block_modified':False,'market_core_modified':False,'oracle_modified':False,'window_manager_modified':False,'paper_safety_modified':False,'financial_action_added':False}
    (ROOT/n).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
version=load('version.json');files=version.setdefault('files',{})
for rel in ('index.html','views/atlas.html','js/views/atlas-presentation.js','salon-partage-406022.css','js/salon-partage-406022.js','build.json','administrator-version.json','RELEASE_40_6_22.md'):files[rel]=sha(ROOT/rel)
(ROOT/'version.json').write_text(json.dumps(version,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
# final proof preserved blocks
if creator_block(atlas_p.read_text(encoding='utf-8'))!=creator_a or creator_block(pres_p.read_text(encoding='utf-8'))!=creator_p:raise SystemExit(f'STOP {BUILD}: creator final drift')
if forge_block(atlas_p.read_text(encoding='utf-8'))!=forge_a or forge_block(pres_p.read_text(encoding='utf-8'))!=forge_p:raise SystemExit(f'STOP {BUILD}: forge final drift')

outdir=Path('coordination/inter_ai_dialogues/agent_crypto');outdir.mkdir(parents=True,exist_ok=True);out=outdir/'AGENT_CRYPTO_BUILD_40_6_22_LOCAL_FIRST_SALON_CLEAN_UPLOAD_9_FILES.zip'
rels=['index.html','views/atlas.html','js/views/atlas-presentation.js','salon-partage-406022.css','js/salon-partage-406022.js','build.json','administrator-version.json','version.json','RELEASE_40_6_22.md']
with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for rel in rels:z.write(ROOT/rel,(ROOT/rel).as_posix())
d=sha(out);Path(str(out)+'.sha256').write_text(f'{d}  {out.name}\n',encoding='utf-8');print(json.dumps({'ok':True,'build':BUILD,'zip':str(out),'sha256':d},ensure_ascii=False))
