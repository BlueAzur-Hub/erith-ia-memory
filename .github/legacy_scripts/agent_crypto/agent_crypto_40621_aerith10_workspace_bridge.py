#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, re, zipfile

ROOT=Path('public/agent_crypto_erith_ia/administrator')
BUILD='40.6.21'; PARENT='40.6.20'; ENGINE='38.15.11'
RELEASE='AERITH-10 CRÉATRICE · WORKSPACE BRIDGE · ATLAS→CREATOR→FORGE'
STATUS='aerith10_workspace_bridge_atlas_creator_forge_406021'
TOKEN=f'market-core-v2.0-alpha-build-{BUILD}'
NOW=datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z')

def load(name):
    d=json.loads((ROOT/name).read_text(encoding='utf-8'))
    if not isinstance(d,dict): raise SystemExit(f'STOP {BUILD}: invalid {name}')
    return d

def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()

if str(load('version.json').get('build'))!=PARENT: raise SystemExit(f'STOP {BUILD}: expected parent {PARENT}')
if str(load('build.json').get('engine'))!=ENGINE: raise SystemExit(f'STOP {BUILD}: engine drift')

index_p=ROOT/'index.html'; atlas_p=ROOT/'views/atlas.html'; pres_p=ROOT/'js/views/atlas-presentation.js'
index=index_p.read_text(encoding='utf-8'); atlas=atlas_p.read_text(encoding='utf-8'); pres=pres_p.read_text(encoding='utf-8')

# Freeze existing Notion iframe and existing Forge block while adding bridge UI around it.
def iframe_tag(text):
    m=re.search(r'<iframe id="aerith10CreatorEmbedded"[\s\S]*?</iframe>',text)
    if not m: raise SystemExit(f'STOP {BUILD}: creator iframe missing')
    return m.group(0)
def forge_block(text):
    m=re.search(r'\n    <details class="atlas-collapse glass forge-aerith-collapse[\s\S]*?\n</details>',text)
    if not m: raise SystemExit(f'STOP {BUILD}: Forge block missing')
    return m.group(0)
iframe_atlas=iframe_tag(atlas); iframe_pres=iframe_tag(pres); forge_atlas=forge_block(atlas); forge_pres=forge_block(pres)

bridge='''
          <section class="aerith10-workspace-bridge" id="aerith10WorkspaceBridge" aria-labelledby="aerith10WorkspaceBridgeTitle">
            <div class="aerith10-workspace-bridge-head">
              <div><b id="aerith10WorkspaceBridgeTitle">Passage Atlas → Aerith-10 → Forge</b><span>Lecture locale du contexte déjà affiché · aucun envoi automatique vers Notion.</span></div>
              <span class="aerith10-workspace-state" id="aerith10WorkspaceState">PRÊT</span>
            </div>
            <textarea id="aerith10WorkspaceContext" readonly aria-label="Contexte Agent-Crypto prêt à copier vers Aerith-10"></textarea>
            <div class="aerith10-workspace-actions">
              <button type="button" class="btn small" id="btnAerith10ContextRefresh">Actualiser contexte</button>
              <button type="button" class="btn small primary" id="btnAerith10ContextCopy">Copier vers Aerith-10</button>
              <button type="button" class="btn small" id="btnAerith10OpenForge">Continuer vers la Forge ↓</button>
            </div>
            <small>Le presse-papiers est le pont volontaire : l’iframe Notion reste isolée par le navigateur et ne reçoit aucune donnée Agent-Crypto automatiquement.</small>
          </section>
'''

anchor='          <div class="aerith10-creator-stage" id="aerith10CreatorStage">'
for label,text in [('atlas',atlas),('presentation',pres)]:
    if text.count(anchor)!=1: raise SystemExit(f'STOP {BUILD}: creator stage anchor count {label}')
    text=text.replace(anchor,bridge+anchor,1)
    if label=='atlas': atlas=text
    else: pres=text
atlas_p.write_text(atlas,encoding='utf-8'); pres_p.write_text(pres,encoding='utf-8')

# Independent bridge runtime; no app.js / Window Manager modifications.
js_p=ROOT/'js/aerith10-workspace-bridge-406021.js'
js_p.write_text(r'''(() => {
  "use strict";
  const BUILD="40.6.21";
  const CREATOR_ID="aerith10-creator";
  function text(sel){const n=document.querySelector(sel);return String(n?.textContent||"").replace(/\s+/g," ").trim();}
  function currentContext(){
    const build=document.querySelector('meta[name="administrator-build"]')?.content||"—";
    const time=text('#sourceTimeCard')||text('#atlasCelestialClockHeader')||new Date().toLocaleString('fr-FR');
    const market=text('#atlasOracleV0 .atlas-oracle-title-line strong')||text('#atlasOracleV0 .atlas-oracle-title')||"Marché courant";
    const oracle=text('#atlasOracleV0 .atlas-oracle-hero-row')||text('#atlasOracleV0 .atlas-oracle-status')||"Oracle non affiché";
    const synthesis=text('#atlasSharedSynthesisContent');
    const lines=[
      `AGENT-CRYPTO · BUILD ${build}`,
      `HORODATAGE · ${time}`,
      `CONTEXTE MARCHÉ · ${market}`,
      `LECTURE ORACLE · ${oracle}`,
    ];
    if(synthesis && !/Aucune synthèse inscrite/i.test(synthesis)) lines.push(`SYNTHÈSE ATLAS/AERITH · ${synthesis.slice(0,1200)}`);
    lines.push('DESTINATION · Aerith-10 Créatrice · travailler à partir de ces faits sans les confondre avec une mémoire canonique.');
    return lines.join('\n');
  }
  function refresh(){const out=document.getElementById('aerith10WorkspaceContext');if(!out)return false;out.value=currentContext();const s=document.getElementById('aerith10WorkspaceState');if(s)s.textContent='CONTEXTE ACTUALISÉ';return true;}
  async function copy(){const out=document.getElementById('aerith10WorkspaceContext');if(!out)return;refresh();try{await navigator.clipboard.writeText(out.value);const s=document.getElementById('aerith10WorkspaceState');if(s)s.textContent='COPIÉ';}catch(_){out.focus();out.select();const s=document.getElementById('aerith10WorkspaceState');if(s)s.textContent='SÉLECTIONNÉ';}}
  function openCreator(event){if(event)event.preventDefault();const d=document.getElementById(CREATOR_ID);if(!d)return false;d.open=true;d.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(refresh,0);return true;}
  function openForge(){const d=document.getElementById('forge-aerith');if(!d)return false;d.open=true;d.scrollIntoView({behavior:'smooth',block:'start'});return true;}
  function bind(){
    document.querySelectorAll('a[href="#aerith10-creator"]').forEach(a=>{if(a.dataset.aerith10BridgeBound==='1')return;a.dataset.aerith10BridgeBound='1';a.addEventListener('click',openCreator);});
    document.getElementById('btnAerith10ContextRefresh')?.addEventListener('click',refresh);
    document.getElementById('btnAerith10ContextCopy')?.addEventListener('click',copy);
    document.getElementById('btnAerith10OpenForge')?.addEventListener('click',openForge);
    document.getElementById(CREATOR_ID)?.addEventListener('toggle',e=>{if(e.currentTarget.open)refresh();});
    refresh();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
  globalThis.ErithAerith10WorkspaceBridge406021=Object.freeze({build:BUILD,refresh,current_context:currentContext,open_creator:openCreator,open_forge:openForge,network:false,storage_write:false,financial_action:false,iframe_dom_access:false});
})();
''',encoding='utf-8')

css_p=ROOT/'aerith10-creator-406020.css'
css=css_p.read_text(encoding='utf-8')
if '40.6.21 — Workspace Bridge' in css: raise SystemExit(f'STOP {BUILD}: bridge CSS already present')
css += '''\n/* 40.6.21 — Workspace Bridge · local context only */\n.aerith10-workspace-bridge{display:grid;gap:8px;margin:0 0 9px;padding:9px;border:1px solid rgba(128,226,255,.16);border-radius:12px;background:linear-gradient(135deg,rgba(24,44,67,.42),rgba(40,24,62,.28))}\n.aerith10-workspace-bridge-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.aerith10-workspace-bridge-head>div{display:flex;flex-direction:column;gap:2px}.aerith10-workspace-bridge-head b{color:#eaf8ff;font-size:12px}.aerith10-workspace-bridge-head span{color:#9eb7c8;font-size:10px}.aerith10-workspace-state{padding:3px 7px;border:1px solid rgba(112,255,202,.25);border-radius:999px;color:#9fffd7!important;white-space:nowrap}\n#aerith10WorkspaceContext{box-sizing:border-box;width:100%;min-height:100px;max-height:180px;resize:vertical;border:1px solid rgba(140,206,255,.16);border-radius:10px;background:rgba(2,10,18,.72);color:#cfe8f4;padding:9px;font:500 10px/1.45 ui-monospace,SFMono-Regular,Consolas,monospace}\n.aerith10-workspace-actions{display:flex;gap:7px;flex-wrap:wrap}.aerith10-workspace-bridge>small{color:#8299aa;font-size:9px}\n'''
css_p.write_text(css,encoding='utf-8')

# Index navigation + module picker + script + build identity.
project_anchor='<a href="#forge-aerith" data-v2-level="project" class="atlas-quick-link atlas-forge-quick-link"><span class="atlas-quick-icon" aria-hidden="true">✦</span><span>Forge</span></a>'
creator_link='<a href="#aerith10-creator" data-v2-level="project" class="atlas-quick-link aerith10-creator-quick-link"><span class="atlas-quick-icon" aria-hidden="true">🌸</span><span>Créatrice</span></a>'
if project_anchor not in index: raise SystemExit(f'STOP {BUILD}: Forge quick link missing')
index=index.replace(project_anchor,creator_link+'\n                  '+project_anchor,1)
opt='<option value="forge-aerith">Forge d’Aerith Pro</option>'
if opt not in index: raise SystemExit(f'STOP {BUILD}: Forge option missing')
index=index.replace(opt,'<option value="aerith10-creator">Aerith-10 Créatrice · Full Matrix</option>\n                  '+opt,1)
script_anchor='<script defer src="./js/oracle-fx-406013.js?v=administrator-build-40.6.13"></script>'
if script_anchor not in index: raise SystemExit(f'STOP {BUILD}: Oracle frozen script anchor missing')
index=index.replace(script_anchor,script_anchor+'\n  <script defer src="./js/aerith10-workspace-bridge-406021.js?v=administrator-build-40.6.21"></script>',1)
# Build metas generic exact parent.
repls={
 f'<meta name="atlas-build" content="{PARENT}" />':f'<meta name="atlas-build" content="{BUILD}" />',
 f'<meta name="administrator-build" content="{PARENT}" />':f'<meta name="administrator-build" content="{BUILD}" />',
 '<meta name="administrator-release" content="AERITH-10 CRÉATRICE · NOTION IFRAME INSERTION · FAMILY 02 LOCK" />':f'<meta name="administrator-release" content="{RELEASE}" />',
 f'<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-{PARENT}" />':f'<meta name="atlas-asset-token" content="{TOKEN}" />',
 f'<title>Agent-Crypto @erith.IA — Build {PARENT} · Administrator</title>':f'<title>Agent-Crypto @erith.IA — Build {BUILD} · Administrator</title>',
}
for old,new in repls.items():
    if old not in index: raise SystemExit(f'STOP {BUILD}: missing identity token {old}')
    index=index.replace(old,new,1)
index,n1=re.subn(r'(id="atlasVersionTruthControl"[\s\S]{0,700}?aria-label="Version Agent-Crypto installée : Build )[^,\"]+(, mode Administrator\")',rf'\g<1>{BUILD}\g<2>',index,count=1)
index,n2=re.subn(r'(<span id="atlasVersionTruthText">Build )[^<]+(</span>)',rf'\g<1>{BUILD}\g<2>',index,count=1)
if n1!=1 or n2!=1: raise SystemExit(f'STOP {BUILD}: version first paint')
index_p.write_text(index,encoding='utf-8')

# Hard structural proof: iframes + Forge unchanged.
if iframe_tag(atlas_p.read_text(encoding='utf-8'))!=iframe_atlas or iframe_tag(pres_p.read_text(encoding='utf-8'))!=iframe_pres: raise SystemExit(f'STOP {BUILD}: Creator iframe changed')
if forge_block(atlas_p.read_text(encoding='utf-8'))!=forge_atlas or forge_block(pres_p.read_text(encoding='utf-8'))!=forge_pres: raise SystemExit(f'STOP {BUILD}: Forge changed')

release_p=ROOT/'RELEASE_40_6_21.md'
release_p.write_text(f'''# Agent-Crypto {BUILD} — {RELEASE}\n\n- Parent `{PARENT}`; Market Core `{ENGINE}` protected.\n- Adds a local, read-only context bridge around the existing Aerith-10 Notion iframe.\n- Current visible Agent-Crypto context can be refreshed and copied intentionally to the clipboard.\n- No cross-origin DOM access and no automatic data transmission into Notion.\n- Adds `Créatrice` quick navigation and a module-picker entry.\n- `Continuer vers la Forge` opens the already-existing Forge section; Forge iframe bytes remain unchanged.\n- No app.js, Window Manager, Oracle, Graphique, Lecture Technique, Chronos, Version Truth, Paper/Safety, Market Core or financial behavior changed.\n''',encoding='utf-8')

for name in ('build.json','administrator-version.json','version.json'):
    d=load(name); d['build']=BUILD; d['release']=RELEASE; d['status']=STATUS; d['parent_build']=PARENT; d['asset_token']=TOKEN
    if 'administrator_build' in d:d['administrator_build']=BUILD
    if 'build_label' in d:d['build_label']=f'Build {BUILD}'
    for k in ('timestamp','prepared_at','published_at'):
        if k in d:d[k]=NOW
    if isinstance(d.get('current_version_truth'),dict):d['current_version_truth']['loaded_build']=BUILD
    d['cascade_40_6_21']={'parent_build':PARENT,'scope':'aerith10_creator_workspace_bridge_only','creator_iframe_modified':False,'forge_iframe_modified':False,'clipboard_operator_triggered_only':True,'automatic_notion_transmission':False,'cross_origin_dom_access':False,'market_core_modified':False,'oracle_modified':False,'window_manager_modified':False,'paper_safety_modified':False,'network_added':False,'storage_write_added':False,'financial_action_added':False}
    (ROOT/name).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
version=load('version.json'); files=version.setdefault('files',{})
for rel in ('index.html','views/atlas.html','js/views/atlas-presentation.js','aerith10-creator-406020.css','js/aerith10-workspace-bridge-406021.js','build.json','administrator-version.json','RELEASE_40_6_21.md'):files[rel]=sha(ROOT/rel)
(ROOT/'version.json').write_text(json.dumps(version,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

outdir=Path('coordination/inter_ai_dialogues/agent_crypto');outdir.mkdir(parents=True,exist_ok=True)
out=outdir/'AGENT_CRYPTO_BUILD_40_6_21_AERITH10_WORKSPACE_BRIDGE_CLEAN_UPLOAD_9_FILES.zip'
rels=['index.html','views/atlas.html','js/views/atlas-presentation.js','aerith10-creator-406020.css','js/aerith10-workspace-bridge-406021.js','build.json','administrator-version.json','version.json','RELEASE_40_6_21.md']
with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for rel in rels:z.write(ROOT/rel,(ROOT/rel).as_posix())
digest=sha(out);Path(str(out)+'.sha256').write_text(f'{digest}  {out.name}\n',encoding='utf-8')
print(json.dumps({'ok':True,'build':BUILD,'zip':out.as_posix(),'sha256':digest},ensure_ascii=False))
