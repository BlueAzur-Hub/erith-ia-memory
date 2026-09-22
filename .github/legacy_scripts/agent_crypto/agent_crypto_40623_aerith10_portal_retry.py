#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, re, zipfile

ROOT=Path('public/agent_crypto_erith_ia/administrator')
BUILD='40.6.23'; PARENT='40.6.22'; ENGINE='38.15.11'
RELEASE='AERITH-10 CRÉATRICE · PORTAL FALLBACK · NOTION FRAME-BLOCK SAFE'
STATUS='aerith10_creator_portal_fallback_notion_frame_block_safe_406023'
TOKEN=f'market-core-v2.0-alpha-build-{BUILD}'
NOW=datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z')
NOTION='https://sustaining-boar-5c6.notion.site/erith-10-Cr-atrice-3977754fe0848036a47cfd55786b4b40'

def load(name):
    d=json.loads((ROOT/name).read_text(encoding='utf-8'))
    if not isinstance(d,dict): raise SystemExit(f'STOP {BUILD}: invalid {name}')
    return d

def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()

if str(load('build.json').get('build'))!=PARENT: raise SystemExit(f'STOP {BUILD}: expected parent {PARENT}')
if str(load('build.json').get('engine'))!=ENGINE: raise SystemExit(f'STOP {BUILD}: Market Core drift')

index_p=ROOT/'index.html'; atlas_p=ROOT/'views/atlas.html'; pres_p=ROOT/'js/views/atlas-presentation.js'
index=index_p.read_text(encoding='utf-8'); atlas=atlas_p.read_text(encoding='utf-8'); pres=pres_p.read_text(encoding='utf-8')

# Freeze validated owners.
protected=[
 'admin-chronos.css','js/version-truth.js','oracle-presentation-405010.css','oracle-fx-406013.css','js/oracle-fx-406013.js',
 'parallel-markets.css','market-reading-depth.css','js/core/admin-window-manager.js','js/strategy-a-paper-lifecycle-404295.js','js/app.js',
 'js/aerith10-workspace-bridge-406021.js','salon-partage-406022.css','js/salon-partage-406022.js'
]
protected_before={p:(ROOT/p).read_bytes() for p in protected}

def forge_block(text):
    m=re.search(r'\n    <details class="atlas-collapse glass forge-aerith-collapse[\s\S]*?\n</details>',text)
    if not m: raise SystemExit(f'STOP {BUILD}: Forge block missing')
    return m.group(0)

def iframe_tag(text):
    m=re.search(r'<iframe id="aerith10CreatorEmbedded"[\s\S]*?</iframe>',text)
    if not m: raise SystemExit(f'STOP {BUILD}: Aerith-10 iframe missing')
    return m.group(0)

forge_atlas=forge_block(atlas); forge_pres=forge_block(pres)
iframe_atlas=iframe_tag(atlas); iframe_pres=iframe_tag(pres)
if NOTION not in iframe_atlas or NOTION not in iframe_pres:
    raise SystemExit(f'STOP {BUILD}: expected Notion URL not owned by iframe')
for label,text in [('atlas',atlas),('presentation',pres)]:
    if text.count('id="aerith10WorkspaceBridge"')!=1: raise SystemExit(f'STOP {BUILD}: Workspace Bridge missing in {label}')
    if text.count('id="aerith10-creator"')!=1: raise SystemExit(f'STOP {BUILD}: Creator section count in {label}')

portal=f'''<div class="aerith10-portal-406023" data-aerith10-portal="40.6.23" role="region" aria-label="Portail Aerith-10 Créatrice Full Matrix">
              <div class="aerith10-portal-kicker">🌸 AERITH-10 CRÉATRICE · FULL MATRIX</div>
              <h3>De l’idée à l’œuvre, sans quitter le parcours Administrator</h3>
              <p class="aerith10-portal-copy">Notion refuse l’embarquement direct dans Firefox. La sous-section reste intégrée ici comme portail ; la page complète s’ouvre volontairement dans un nouvel onglet.</p>
              <div class="aerith10-portal-flow" aria-label="Sept étapes Aerith-10 Full Matrix">
                <span><b>1</b>Concevoir</span><span><b>2</b>Écrire</span><span><b>3</b>Storyboard</span><span><b>4</b>Image</span><span><b>5</b>Animer</span><span><b>6</b>Voix & son</span><span><b>7</b>Produire & livrer</span>
              </div>
              <div class="aerith10-portal-actions">
                <a class="btn secondary" href="{NOTION}" target="_blank" rel="noopener noreferrer">Ouvrir Aerith-10 complète ↗</a>
                <a class="btn secondary aerith10-portal-forge" href="#forge-aerith">Continuer vers la Forge ↓</a>
              </div>
              <div class="aerith10-portal-truth"><span>SOURCE</span> Notion externe · <span>PORTAIL</span> intégré · <span>IFRAME</span> retirée car refusée par le fournisseur</div>
            </div>'''

atlas=atlas.replace(iframe_atlas,portal,1)
pres=pres.replace(iframe_pres,portal,1)
atlas_p.write_text(atlas,encoding='utf-8'); pres_p.write_text(pres,encoding='utf-8')

# Dedicated override owner; original 40.6.20 CSS remains untouched.
css_p=ROOT/'aerith10-portal-406023.css'
css_p.write_text('''/* 40.6.23 — Aerith-10 Creator portal fallback · presentation only */
.aerith10-creator-stage{min-height:0!important;height:auto!important;background:linear-gradient(145deg,rgba(12,18,32,.96),rgba(18,15,31,.94))!important;border-color:rgba(223,166,255,.22)!important;padding:0!important}
.aerith10-creator-hint{display:none!important}
.aerith10-portal-406023{position:relative;display:grid;gap:15px;min-height:330px;padding:28px clamp(18px,4vw,54px);overflow:hidden;background:radial-gradient(circle at 82% 16%,rgba(233,135,255,.14),transparent 28%),radial-gradient(circle at 16% 84%,rgba(81,220,255,.10),transparent 30%),linear-gradient(135deg,rgba(20,27,49,.96),rgba(12,18,31,.98));color:#dcecf6}
.aerith10-portal-406023::before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px);background-size:42px 42px;mask-image:linear-gradient(to bottom,rgba(0,0,0,.65),transparent 82%)}
.aerith10-portal-kicker{position:relative;font-size:11px;font-weight:950;letter-spacing:.16em;color:#ffb8e9;text-transform:uppercase}
.aerith10-portal-406023 h3{position:relative;margin:0;color:#fff0cf;font-size:clamp(20px,2.1vw,30px);line-height:1.15;text-shadow:0 0 18px rgba(255,187,231,.12)}
.aerith10-portal-copy{position:relative;max-width:920px;margin:0;color:#b9c9da;font-size:12px;line-height:1.55}
.aerith10-portal-flow{position:relative;display:grid;grid-template-columns:repeat(7,minmax(88px,1fr));gap:7px}
.aerith10-portal-flow span{display:flex;align-items:center;gap:7px;min-height:44px;padding:8px 9px;border:1px solid rgba(221,168,255,.18);border-radius:11px;background:rgba(7,15,27,.58);color:#cbd8e7;font-size:10px;font-weight:800}
.aerith10-portal-flow b{display:grid;place-items:center;flex:0 0 24px;height:24px;border-radius:999px;border:1px solid rgba(255,187,231,.28);color:#ffd0ec;background:rgba(194,92,210,.12)}
.aerith10-portal-actions{position:relative;display:flex;gap:9px;flex-wrap:wrap}.aerith10-portal-actions .btn{display:inline-flex;align-items:center;justify-content:center;text-decoration:none}.aerith10-portal-forge{border-color:rgba(255,211,118,.24)!important;color:#ffe7a7!important}
.aerith10-portal-truth{position:relative;padding-top:10px;border-top:1px solid rgba(255,255,255,.07);color:#7f94a7;font-size:9px;letter-spacing:.05em}.aerith10-portal-truth span{color:#d7a6ff;font-weight:900}
@media(max-width:1100px){.aerith10-portal-flow{grid-template-columns:repeat(4,minmax(100px,1fr))}}
@media(max-width:700px){.aerith10-portal-406023{padding:20px 14px}.aerith10-portal-flow{grid-template-columns:repeat(2,minmax(110px,1fr))}.aerith10-portal-actions .btn{width:100%}}
''',encoding='utf-8')

# Index only gains stylesheet + build identity; no Creator DOM lives here.
style_anchor='<link rel="stylesheet" href="./aerith10-creator-406020.css?v=administrator-build-40.6.20" />'
if index.count(style_anchor)!=1: raise SystemExit(f'STOP {BUILD}: Creator CSS anchor count')
index=index.replace(style_anchor,style_anchor+'\n  <link rel="stylesheet" href="./aerith10-portal-406023.css?v=administrator-build-40.6.23" />',1)
repls={
 f'<meta name="atlas-build" content="{PARENT}" />':f'<meta name="atlas-build" content="{BUILD}" />',
 f'<meta name="administrator-build" content="{PARENT}" />':f'<meta name="administrator-build" content="{BUILD}" />',
 '<meta name="administrator-release" content="SALON DE PARTAGE · LOCAL FIRST · OPERATOR-ONLY MESSAGE SPACE" />':f'<meta name="administrator-release" content="{RELEASE}" />',
 f'<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-{PARENT}" />':f'<meta name="atlas-asset-token" content="{TOKEN}" />',
 f'<title>Agent-Crypto @erith.IA — Build {PARENT} · Administrator</title>':f'<title>Agent-Crypto @erith.IA — Build {BUILD} · Administrator</title>',
}
for old,new in repls.items():
    if old not in index: raise SystemExit(f'STOP {BUILD}: identity token missing {old}')
    index=index.replace(old,new,1)
index,n1=re.subn(r'(id="atlasVersionTruthControl"[\s\S]{0,700}?aria-label="Version Agent-Crypto installée : Build )[^,\"]+(, mode Administrator\")',rf'\g<1>{BUILD}\g<2>',index,count=1)
index,n2=re.subn(r'(<span id="atlasVersionTruthText">Build )[^<]+(</span>)',rf'\g<1>{BUILD}\g<2>',index,count=1)
if n1!=1 or n2!=1: raise SystemExit(f'STOP {BUILD}: first-paint version badge mismatch {n1}/{n2}')
index_p.write_text(index,encoding='utf-8')

release_p=ROOT/'RELEASE_40_6_23.md'
release_p.write_text(f'''# Agent-Crypto {BUILD} — {RELEASE}\n\n- Parent `{PARENT}`; Market Core `{ENGINE}` protected.\n- The Notion page remains the canonical external destination: `{NOTION}`.\n- Firefox/Notion frame refusal is handled by removing only the blocked iframe from both canonical Atlas presentation owners.\n- Aerith-10 section, Workspace Bridge 40.6.21, Creator toolbar and Forge remain in place.\n- Portal shows the seven Full Matrix stages and explicit buttons to open Notion and continue to Forge.\n- No hidden proxy, no cross-origin DOM access, no automatic Notion transmission.\n- Oracle 40.6.13 + FX, Chronos, Version Truth, Graphique, Lecture Technique, Paper/Safety, Salon, Window Manager and Market Core are frozen.\n''',encoding='utf-8')

for name in ('build.json','administrator-version.json','version.json'):
    d=load(name); d['build']=BUILD; d['release']=RELEASE; d['status']=STATUS; d['parent_build']=PARENT; d['asset_token']=TOKEN
    if 'administrator_build' in d:d['administrator_build']=BUILD
    if 'build_label' in d:d['build_label']=f'Build {BUILD}'
    for k in ('timestamp','prepared_at','published_at'):
        if k in d:d[k]=NOW
    if isinstance(d.get('current_version_truth'),dict): d['current_version_truth']['loaded_build']=BUILD
    d['cascade_40_6_23']={'parent_build':PARENT,'scope':'aerith10_creator_portal_fallback_only','canonical_owner':'views/atlas.html','fallback_owner':'js/views/atlas-presentation.js','notion_url':NOTION,'notion_iframe_removed':True,'creator_section_preserved':True,'workspace_bridge_406021_preserved':True,'salon_406022_preserved':True,'forge_block_preserved':True,'external_open_fallback':True,'market_core_modified':False,'oracle_modified':False,'chronos_modified':False,'version_truth_modified':False,'graph_modified':False,'technical_reading_modified':False,'paper_safety_modified':False,'window_manager_modified':False,'new_network_owner':False,'new_storage_owner':False,'new_timer':False,'new_observer':False,'financial_action_added':False}
    (ROOT/name).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
version=load('version.json'); files=version.setdefault('files',{})
for rel in ('index.html','views/atlas.html','js/views/atlas-presentation.js','aerith10-portal-406023.css','build.json','administrator-version.json','RELEASE_40_6_23.md'): files[rel]=sha(ROOT/rel)
(ROOT/'version.json').write_text(json.dumps(version,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

# Hard structural proofs.
fa=atlas_p.read_text(encoding='utf-8'); fp=pres_p.read_text(encoding='utf-8')
if forge_block(fa)!=forge_atlas or forge_block(fp)!=forge_pres: raise SystemExit(f'STOP {BUILD}: Forge block changed')
for label,text in [('atlas',fa),('presentation',fp)]:
    if 'id="aerith10CreatorEmbedded"' in text: raise SystemExit(f'STOP {BUILD}: blocked iframe remains in {label}')
    if text.count('data-aerith10-portal="40.6.23"')!=1: raise SystemExit(f'STOP {BUILD}: portal count in {label}')
    if text.count('id="aerith10WorkspaceBridge"')!=1: raise SystemExit(f'STOP {BUILD}: Workspace Bridge changed in {label}')
    if NOTION not in text: raise SystemExit(f'STOP {BUILD}: Notion fallback URL lost in {label}')
    if 'href="#forge-aerith"' not in text: raise SystemExit(f'STOP {BUILD}: Forge route missing in {label}')
for p,b in protected_before.items():
    if (ROOT/p).read_bytes()!=b: raise SystemExit(f'STOP {BUILD}: protected file changed {p}')
if str(load('build.json').get('engine'))!=ENGINE: raise SystemExit(f'STOP {BUILD}: engine drift after surgery')

outdir=Path('coordination/inter_ai_dialogues/agent_crypto');outdir.mkdir(parents=True,exist_ok=True)
out=outdir/'AGENT_CRYPTO_BUILD_40_6_23_AERITH10_PORTAL_FALLBACK_CLEAN_UPLOAD_8_FILES.zip'
rels=['index.html','views/atlas.html','js/views/atlas-presentation.js','aerith10-portal-406023.css','build.json','administrator-version.json','version.json','RELEASE_40_6_23.md']
with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for rel in rels:z.write(ROOT/rel,(ROOT/rel).as_posix())
digest=sha(out); Path(str(out)+'.sha256').write_text(f'{digest}  {out.name}\n',encoding='utf-8')
print(json.dumps({'ok':True,'build':BUILD,'parent':PARENT,'zip':out.as_posix(),'sha256':digest,'notion':NOTION},ensure_ascii=False))
