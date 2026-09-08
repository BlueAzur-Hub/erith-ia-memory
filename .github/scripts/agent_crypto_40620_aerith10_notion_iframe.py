#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, re, zipfile

ROOT = Path('public/agent_crypto_erith_ia/administrator')
BUILD='40.6.20'
PARENT='40.6.19'
ENGINE='38.15.11'
RELEASE='AERITH-10 CRÉATRICE · NOTION IFRAME INSERTION · FAMILY 02 LOCK'
STATUS='aerith10_creatrice_notion_iframe_family02_lock_406020'
TOKEN=f'market-core-v2.0-alpha-build-{BUILD}'
NOW=datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z')
NOTION='https://sustaining-boar-5c6.notion.site/erith-10-Cr-atrice-3977754fe0848036a47cfd55786b4b40'


def load(name):
    data=json.loads((ROOT/name).read_text(encoding='utf-8'))
    if not isinstance(data,dict): raise SystemExit(f'STOP {BUILD}: invalid {name}')
    return data

def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()

# truth gate
if str(load('version.json').get('build')) != PARENT: raise SystemExit(f'STOP {BUILD}: expected parent {PARENT}')
if str(load('build.json').get('engine')) != ENGINE: raise SystemExit(f'STOP {BUILD}: Market Core drift')

index_p=ROOT/'index.html'
atlas_p=ROOT/'views/atlas.html'
pres_p=ROOT/'js/views/atlas-presentation.js'
index=index_p.read_text(encoding='utf-8')
atlas=atlas_p.read_text(encoding='utf-8')
pres=pres_p.read_text(encoding='utf-8')

# Freeze the existing Forge block byte-for-byte in both canonical and fallback presentations.
def forge_block(text):
    m=re.search(r'\n    <details class="atlas-collapse glass forge-aerith-collapse[\s\S]*?\n</details>',text)
    if not m: raise SystemExit(f'STOP {BUILD}: Forge block not found')
    return m.group(0)
forge_atlas_before=forge_block(atlas)
forge_pres_before=forge_block(pres)

if 'id="aerith10-creator"' in atlas or 'id="aerith10-creator"' in pres:
    raise SystemExit(f'STOP {BUILD}: Aerith-10 Creator already present')

block=f'''

    <details class="atlas-collapse glass aerith10-creator-collapse atlas-family-member atlas-tone-creation" data-collapse-key="aerith10-creator" id="aerith10-creator" data-layout-family="creation">
      <summary class="atlas-collapse-summary">
        <span class="atlas-collapse-icon" aria-hidden="true">▶</span>
        <span class="atlas-collapse-title">🌸 Aerith-10 Créatrice · Full Matrix</span>
        <span class="atlas-collapse-subtitle">Notion · conception · écriture · storyboard · image · animation · voix · livraison</span>
      </summary>
      <div class="atlas-collapse-body">
        <section class="panel glass aerith10-creator-panel" aria-labelledby="aerith10-creator-title">
          <div class="aerith10-creator-toolbar">
            <div class="aerith10-creator-identity">
              <strong id="aerith10-creator-title">Aerith-10 Créatrice · Full Matrix</strong>
              <span>De l’idée à l’œuvre · espace Notion intégré au parcours Administrator</span>
            </div>
            <a class="btn secondary aerith10-creator-open" href="{NOTION}" target="_blank" rel="noopener noreferrer">Ouvrir Aerith-10 complète ↗</a>
          </div>
          <div class="aerith10-creator-stage" id="aerith10CreatorStage">
            <div class="aerith10-creator-hint">Page Notion publique intégrée · si le fournisseur refuse l’embarquement, utilise « Ouvrir Aerith-10 complète ↗ ».</div>
            <iframe id="aerith10CreatorEmbedded" class="aerith10-creator-embedded" src="{NOTION}" title="Aerith-10 Créatrice — Full Matrix" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>
          </div>
        </section>
      </div>
    </details>
'''

# Exact insertion: immediately before the already-validated Forge block.
for label,text in [('atlas',atlas),('presentation',pres)]:
    fb=forge_block(text)
    if text.count(fb) != 1: raise SystemExit(f'STOP {BUILD}: non-unique Forge block in {label}')
    text=text.replace(fb,block+fb,1)
    if label=='atlas': atlas=text
    else: pres=text

# Forge contents must be byte-for-byte unchanged after insertion.
if forge_block(atlas) != forge_atlas_before: raise SystemExit(f'STOP {BUILD}: Forge canonical block changed')
if forge_block(pres) != forge_pres_before: raise SystemExit(f'STOP {BUILD}: Forge fallback block changed')

atlas_p.write_text(atlas,encoding='utf-8')
pres_p.write_text(pres,encoding='utf-8')

css_p=ROOT/'aerith10-creator-406020.css'
css_p.write_text('''/* 40.6.20 — Aerith-10 Créatrice Notion iframe · Family 02 presentation only */
.aerith10-creator-collapse{border-color:rgba(224,151,255,.22)!important}
.aerith10-creator-collapse>.atlas-collapse-summary{background:linear-gradient(90deg,rgba(120,76,180,.12),rgba(12,25,42,.18))!important}
.aerith10-creator-collapse .atlas-collapse-title{color:#fff0c8!important;text-shadow:0 0 10px rgba(225,159,255,.18)}
.aerith10-creator-panel{padding:10px!important;background:linear-gradient(145deg,rgba(14,20,37,.92),rgba(11,18,31,.78))!important;border-color:rgba(213,157,255,.20)!important}
.aerith10-creator-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 10px;margin-bottom:8px;border:1px solid rgba(222,173,255,.16);border-radius:12px;background:rgba(8,15,27,.72)}
.aerith10-creator-identity{display:flex;flex-direction:column;gap:3px;min-width:0}.aerith10-creator-identity strong{color:#fff0c8;font-size:14px}.aerith10-creator-identity span{color:#c6b6db;font-size:11px}
.aerith10-creator-open{white-space:nowrap}
.aerith10-creator-stage{position:relative;overflow:hidden;min-height:680px;height:min(78vh,980px);border:1px solid rgba(210,166,255,.20);border-radius:14px;background:#fff;box-shadow:inset 0 0 0 1px rgba(255,255,255,.035),0 14px 34px rgba(0,0,0,.26)}
.aerith10-creator-hint{position:absolute;z-index:2;left:10px;right:10px;bottom:9px;padding:6px 9px;border-radius:9px;background:rgba(5,10,18,.82);color:#b9c8d7;font-size:10px;pointer-events:none;opacity:.72}
.aerith10-creator-embedded{display:block;width:100%;height:100%;min-height:680px;border:0;background:#fff}
@media(max-width:900px){.aerith10-creator-toolbar{align-items:flex-start;flex-direction:column}.aerith10-creator-stage,.aerith10-creator-embedded{min-height:620px;height:72vh}.aerith10-creator-open{width:100%;text-align:center}}
''',encoding='utf-8')

# Index: identity + one stylesheet only. No runtime owner is changed.
repls={
 '<meta name="atlas-build" content="40.6.19" />':f'<meta name="atlas-build" content="{BUILD}" />',
 '<meta name="administrator-build" content="40.6.19" />':f'<meta name="administrator-build" content="{BUILD}" />',
 '<meta name="administrator-release" content="EVIDENCE READINESS TRUTH · STRICT DATASET COMPLETENESS" />':f'<meta name="administrator-release" content="{RELEASE}" />',
 '<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.6.19" />':f'<meta name="atlas-asset-token" content="{TOKEN}" />',
 '<title>Agent-Crypto @erith.IA — Build 40.6.19 · Administrator</title>':f'<title>Agent-Crypto @erith.IA — Build {BUILD} · Administrator</title>',
 '<link rel="stylesheet" href="./oracle-fx-406013.css?v=administrator-build-40.6.13" />':'<link rel="stylesheet" href="./oracle-fx-406013.css?v=administrator-build-40.6.13" />\n  <link rel="stylesheet" href="./aerith10-creator-406020.css?v=administrator-build-40.6.20" />',
}
for old,new in repls.items():
    if old not in index: raise SystemExit(f'STOP {BUILD}: missing index token {old}')
    index=index.replace(old,new,1)
index,n1=re.subn(r'(id="atlasVersionTruthControl"[\s\S]{0,700}?aria-label="Version Agent-Crypto installée : Build )[^,\"]+(, mode Administrator\")',rf'\g<1>{BUILD}\g<2>',index,count=1)
index,n2=re.subn(r'(<span id="atlasVersionTruthText">Build )[^<]+(</span>)',rf'\g<1>{BUILD}\g<2>',index,count=1)
if n1!=1 or n2!=1: raise SystemExit(f'STOP {BUILD}: first-paint version badge mismatch {n1}/{n2}')
index_p.write_text(index,encoding='utf-8')

release_p=ROOT/'RELEASE_40_6_20.md'
release_p.write_text(f'''# Agent-Crypto {BUILD} — {RELEASE}\n\n- Parent: `{PARENT}`\n- Market Core `{ENGINE}` protected / unchanged.\n- Canonical family 02 owner: `views/atlas.html`.\n- Boot-parity fallback kept aligned: `js/views/atlas-presentation.js`.\n- New subsection inserted immediately after Atlas and immediately before the existing Forge.\n- Embedded target: `{NOTION}`.\n- External fallback link remains always visible.\n- Existing Forge iframe block preserved byte-for-byte.\n- No Atlas runtime, Oracle, Graphique, Lecture Technique, Chronos, Version Truth, Paper/Safety, Window Manager, Market Core, timer, observer, storage or network owner changed.\n- The iframe itself may perform the public Notion page requests only when the operator opens/loads the embedded page.\n''',encoding='utf-8')

# manifests
for name in ('build.json','administrator-version.json','version.json'):
    data=load(name)
    data['build']=BUILD; data['release']=RELEASE; data['status']=STATUS; data['parent_build']=PARENT; data['asset_token']=TOKEN
    if 'administrator_build' in data: data['administrator_build']=BUILD
    if 'build_label' in data: data['build_label']=f'Build {BUILD}'
    for k in ('timestamp','prepared_at','published_at'):
        if k in data: data[k]=NOW
    truth=data.get('current_version_truth')
    if isinstance(truth,dict): truth['loaded_build']=BUILD
    data['cascade_40_6_20']={
      'parent_build':PARENT,'scope':'family_02_aerith10_notion_iframe_only','canonical_owner':'views/atlas.html','fallback_owner':'js/views/atlas-presentation.js','notion_url':NOTION,'forge_block_preserved':True,'market_core_modified':False,'oracle_modified':False,'graph_modified':False,'technical_reading_modified':False,'chronos_modified':False,'version_truth_modified':False,'paper_safety_modified':False,'window_manager_modified':False,'new_runtime_timer':False,'new_runtime_observer':False,'new_storage_owner':False,'new_financial_action':False
    }
    (ROOT/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

version=load('version.json')
files=version.setdefault('files',{})
for rel in ('index.html','views/atlas.html','js/views/atlas-presentation.js','aerith10-creator-406020.css','build.json','administrator-version.json','RELEASE_40_6_20.md'):
    files[rel]=sha(ROOT/rel)
(ROOT/'version.json').write_text(json.dumps(version,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

# hard proofs
if forge_block(atlas_p.read_text(encoding='utf-8')) != forge_atlas_before: raise SystemExit(f'STOP {BUILD}: Forge canonical proof failed')
if forge_block(pres_p.read_text(encoding='utf-8')) != forge_pres_before: raise SystemExit(f'STOP {BUILD}: Forge fallback proof failed')
if atlas_p.read_text(encoding='utf-8').count('id="aerith10-creator"')!=1: raise SystemExit(f'STOP {BUILD}: canonical creator count')
if pres_p.read_text(encoding='utf-8').count('id="aerith10-creator"')!=1: raise SystemExit(f'STOP {BUILD}: fallback creator count')
if NOTION not in atlas_p.read_text(encoding='utf-8') or NOTION not in pres_p.read_text(encoding='utf-8'): raise SystemExit(f'STOP {BUILD}: Notion URL missing')
if str(load('build.json').get('engine'))!=ENGINE: raise SystemExit(f'STOP {BUILD}: Market Core drift after surgery')

outdir=Path('coordination/inter_ai_dialogues/agent_crypto'); outdir.mkdir(parents=True,exist_ok=True)
out=outdir/'AGENT_CRYPTO_BUILD_40_6_20_AERITH10_CREATRICE_NOTION_IFRAME_CLEAN_UPLOAD_8_FILES.zip'
rels=['index.html','views/atlas.html','js/views/atlas-presentation.js','aerith10-creator-406020.css','build.json','administrator-version.json','version.json','RELEASE_40_6_20.md']
with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for rel in rels: z.write(ROOT/rel,(ROOT/rel).as_posix())
digest=sha(out)
Path(str(out)+'.sha256').write_text(f'{digest}  {out.name}\n',encoding='utf-8')
print(json.dumps({'ok':True,'build':BUILD,'parent':PARENT,'zip':out.as_posix(),'sha256':digest,'notion':NOTION},ensure_ascii=False))
