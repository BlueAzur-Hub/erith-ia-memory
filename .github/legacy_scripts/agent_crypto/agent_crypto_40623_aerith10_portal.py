#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, re, zipfile

ROOT = Path('public/agent_crypto_erith_ia/administrator')
BUILD = '40.6.23'
PARENT = '40.6.22'
ENGINE = '38.15.11'
RELEASE = 'AERITH-10 CRÉATRICE · PORTAL FALLBACK · NOTION FRAME-BLOCK SAFE'
STATUS = 'aerith10_creator_portal_fallback_notion_frame_block_safe_406023'
TOKEN = f'market-core-v2.0-alpha-build-{BUILD}'
NOTION_URL = 'https://sustaining-boar-5c6.notion.site/erith-10-Cr-atrice-3977754fe0848036a47cfd55786b4b40'
NOW = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z')


def load(name):
    return json.loads((ROOT/name).read_text(encoding='utf-8'))

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

# --- Canonical parent truth -------------------------------------------------
cur = load('build.json')
if str(cur.get('build')) != PARENT:
    raise SystemExit(f'STOP 40.6.23: expected parent {PARENT}, found {cur.get("build")}')
if str(cur.get('engine')) != ENGINE:
    raise SystemExit('STOP 40.6.23: Market Core drift before surgery')

protected = [
    'admin-chronos.css',
    'js/version-truth.js',
    'oracle-presentation-405010.css',
    'oracle-fx-406013.css',
    'js/oracle-fx-406013.js',
    'parallel-markets.css',
    'market-reading-depth.css',
    'js/core/admin-window-manager.js',
    'js/strategy-a-paper-lifecycle-404295.js',
    'js/app.js',
]
protected_before = {p: (ROOT/p).read_bytes() for p in protected}

index_path = ROOT/'index.html'
index = index_path.read_text(encoding='utf-8')
if NOTION_URL not in index:
    raise SystemExit('STOP 40.6.23: canonical Aerith-10 Notion URL missing')
if 'class="aerith10-creator-embedded"' not in index:
    raise SystemExit('STOP 40.6.23: expected Notion iframe owner missing')
if 'id="forge-aerith"' not in index:
    raise SystemExit('STOP 40.6.23: Forge anchor missing')

# --- Replace only the blocked iframe, not the Creator/Forge structure -------
portal = f'''<div class="aerith10-portal-406023" data-aerith10-portal="40.6.23" role="region" aria-label="Portail Aerith-10 Créatrice Full Matrix">
                  <div class="aerith10-portal-kicker">🌸 AERITH-10 CRÉATRICE · FULL MATRIX</div>
                  <h3>De l’idée à l’œuvre, sans quitter le parcours Administrator</h3>
                  <p class="aerith10-portal-copy">Notion bloque l’affichage direct dans une iframe Firefox. Le portail reste intégré ici ; la page complète s’ouvre dans un onglet séparé, puis le parcours revient naturellement vers la Forge.</p>
                  <div class="aerith10-portal-flow" aria-label="Les sept étapes de la Full Matrix">
                    <span><b>1</b> Concevoir</span><span><b>2</b> Écrire</span><span><b>3</b> Storyboard</span><span><b>4</b> Image</span><span><b>5</b> Animer</span><span><b>6</b> Voix & son</span><span><b>7</b> Produire & livrer</span>
                  </div>
                  <div class="aerith10-portal-actions">
                    <a class="btn secondary" href="{NOTION_URL}" target="_blank" rel="noopener noreferrer">Ouvrir Aerith-10 complète ↗</a>
                    <a class="btn secondary aerith10-portal-forge" href="#forge-aerith">Continuer vers la Forge ↓</a>
                  </div>
                  <div class="aerith10-portal-truth"><span>SOURCE</span> Notion externe · <span>INTÉGRATION</span> portail sûr · <span>IFRAME</span> volontairement retirée</div>
                </div>'''

iframe_re = re.compile(r'<iframe\b[^>]*class="aerith10-creator-embedded"[^>]*>\s*</iframe>', re.I|re.S)
index, n = iframe_re.subn(portal, index, count=1)
if n != 1:
    raise SystemExit(f'STOP 40.6.23: iframe replacement count={n}')

# Add a dedicated presentation owner after the original Creator CSS.
old_link = '<link rel="stylesheet" href="./aerith10-creator-406020.css?v=administrator-build-40.6.20" />'
new_link = old_link + '\n  <link rel="stylesheet" href="./aerith10-portal-406023.css?v=administrator-build-40.6.23" />'
if old_link not in index:
    raise SystemExit('STOP 40.6.23: Creator stylesheet anchor missing')
index = index.replace(old_link, new_link, 1)

# Build identity: only canonical first-paint truth.
repls = {
    '<meta name="atlas-build" content="40.6.22" />': '<meta name="atlas-build" content="40.6.23" />',
    '<meta name="administrator-build" content="40.6.22" />': '<meta name="administrator-build" content="40.6.23" />',
    '<meta name="administrator-release" content="SALON DE PARTAGE · LOCAL FIRST · OPERATOR-ONLY MESSAGE SPACE" />': f'<meta name="administrator-release" content="{RELEASE}" />',
    '<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.6.22" />': f'<meta name="atlas-asset-token" content="{TOKEN}" />',
    '<title>Agent-Crypto @erith.IA — Build 40.6.22 · Administrator</title>': '<title>Agent-Crypto @erith.IA — Build 40.6.23 · Administrator</title>',
}
for a,b in repls.items():
    if a not in index:
        raise SystemExit(f'STOP 40.6.23: missing identity token {a}')
    index = index.replace(a,b,1)

index, n1 = re.subn(r'(id="atlasVersionTruthControl"[\s\S]{0,700}?Version Agent-Crypto installée : Build )[^,\"]+', r'\g<1>40.6.23', index, count=1)
index, n2 = re.subn(r'(<span id="atlasVersionTruthText">Build )[^<]+', r'\g<1>40.6.23', index, count=1)
if n1 != 1 or n2 != 1:
    raise SystemExit(f'STOP 40.6.23: version first-paint badge mismatch {n1}/{n2}')
index_path.write_text(index, encoding='utf-8')

# --- Portal presentation ----------------------------------------------------
css = '''/* 40.6.23 — Aerith-10 Portal Fallback · presentation only */
.aerith10-creator-stage{min-height:0!important;height:auto!important;background:linear-gradient(145deg,rgba(12,18,32,.96),rgba(18,15,31,.94))!important;border-color:rgba(223,166,255,.22)!important;padding:0!important}
.aerith10-creator-hint{display:none!important}
.aerith10-portal-406023{position:relative;display:grid;gap:15px;min-height:330px;padding:28px clamp(18px,4vw,54px);overflow:hidden;background:radial-gradient(circle at 82% 16%,rgba(233,135,255,.14),transparent 28%),radial-gradient(circle at 16% 84%,rgba(81,220,255,.10),transparent 30%),linear-gradient(135deg,rgba(20,27,49,.96),rgba(12,18,31,.98));color:#dcecf6}
.aerith10-portal-406023::before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px);background-size:42px 42px;mask-image:linear-gradient(to bottom,rgba(0,0,0,.65),transparent 82%)}
.aerith10-portal-kicker{position:relative;font-size:11px;font-weight:950;letter-spacing:.16em;color:#ffb8e9;text-transform:uppercase}
.aerith10-portal-406023 h3{position:relative;margin:0;color:#fff0cf;font-size:clamp(20px,2.1vw,30px);line-height:1.15;text-shadow:0 0 18px rgba(255,187,231,.12)}
.aerith10-portal-copy{position:relative;max-width:900px;margin:0;color:#b9c9da;font-size:12px;line-height:1.55}
.aerith10-portal-flow{position:relative;display:grid;grid-template-columns:repeat(7,minmax(88px,1fr));gap:7px}
.aerith10-portal-flow span{display:flex;align-items:center;gap:7px;min-height:44px;padding:8px 9px;border:1px solid rgba(221,168,255,.18);border-radius:11px;background:rgba(7,15,27,.58);color:#cbd8e7;font-size:10px;font-weight:800}
.aerith10-portal-flow b{display:grid;place-items:center;flex:0 0 24px;height:24px;border-radius:999px;border:1px solid rgba(255,187,231,.28);color:#ffd0ec;background:rgba(194,92,210,.12)}
.aerith10-portal-actions{position:relative;display:flex;gap:9px;flex-wrap:wrap}.aerith10-portal-actions .btn{display:inline-flex;align-items:center;justify-content:center;text-decoration:none}.aerith10-portal-forge{border-color:rgba(255,211,118,.24)!important;color:#ffe7a7!important}
.aerith10-portal-truth{position:relative;padding-top:10px;border-top:1px solid rgba(255,255,255,.07);color:#7f94a7;font-size:9px;letter-spacing:.05em}.aerith10-portal-truth span{color:#d7a6ff;font-weight:900}
@media(max-width:1100px){.aerith10-portal-flow{grid-template-columns:repeat(4,minmax(100px,1fr))}}
@media(max-width:700px){.aerith10-portal-406023{padding:20px 14px}.aerith10-portal-flow{grid-template-columns:repeat(2,minmax(110px,1fr))}.aerith10-portal-actions .btn{width:100%}}
'''
(ROOT/'aerith10-portal-406023.css').write_text(css, encoding='utf-8')

# --- Release note -----------------------------------------------------------
(ROOT/'RELEASE_40_6_23.md').write_text(f'''# Agent-Crypto @erith.IA — Build {BUILD}\n\n## {RELEASE}\n\nParent: **{PARENT}**  \nMarket Core: **{ENGINE} protected**\n\n### Cause\nFirefox affiche correctement le refus d’intégration imposé par Notion dans l’iframe. La page existe ; c’est l’embarquement cross-site qui est refusé.\n\n### Correction\n- retrait de l’iframe Notion bloquée ;\n- conservation de la sous-section Aerith-10 au même emplacement ;\n- portail intégré sombre et compact ;\n- accès explicite à la page Notion complète dans un nouvel onglet ;\n- rappel des 7 étapes Full Matrix ;\n- passage direct vers la Forge ;\n- Workspace Bridge 40.6.21 conservé ;\n- Salon 40.6.22 conservé.\n\n### Gel anti-destruction\nOracle 40.6.13 + FX, Chronos, Version Truth, Graphique, Lecture Technique, Paper/Safety, Window Manager et Market Core 38.15.11 ne sont pas modifiés.\n''', encoding='utf-8')

# --- Manifests --------------------------------------------------------------
for name in ('build.json','administrator-version.json','version.json'):
    data = load(name)
    data['build'] = BUILD
    if 'administrator_build' in data: data['administrator_build'] = BUILD
    if 'build_label' in data: data['build_label'] = f'Build {BUILD}'
    data['release'] = RELEASE
    data['status'] = STATUS
    data['parent_build'] = PARENT
    data['asset_token'] = TOKEN
    for key in ('timestamp','prepared_at','published_at'):
        if key in data: data[key] = NOW
    truth = data.get('current_version_truth')
    if isinstance(truth,dict): truth['loaded_build'] = BUILD
    data['cascade_40_6_23'] = {
        'parent_build': PARENT,
        'release': RELEASE,
        'scope': 'aerith10_creator_portal_only',
        'notion_url_preserved': True,
        'notion_iframe_removed': True,
        'external_open_fallback': True,
        'forge_path_preserved': True,
        'workspace_bridge_406021_preserved': True,
        'salon_406022_preserved': True,
        'market_core_modified': False,
        'oracle_modified': False,
        'chronos_modified': False,
        'version_truth_modified': False,
        'graph_modified': False,
        'technical_reading_modified': False,
        'paper_safety_modified': False,
        'window_manager_modified': False,
        'new_network_owner': False,
        'new_storage_owner': False,
        'new_recurring_timer': False,
        'new_observer': False,
        'automatic_order': False,
        'real_order': False,
    }
    if name != 'version.json':
        (ROOT/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    else:
        files = data.get('files')
        if not isinstance(files,dict): files={}; data['files']=files
        # write once so hashes can be calculated for other changed files
        (ROOT/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        for rel in ('index.html','aerith10-portal-406023.css','build.json','administrator-version.json','RELEASE_40_6_23.md'):
            files[rel] = sha(ROOT/rel)
        (ROOT/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

# --- Hard proofs ------------------------------------------------------------
final_index = index_path.read_text(encoding='utf-8')
if 'class="aerith10-creator-embedded"' in final_index:
    raise SystemExit('STOP 40.6.23: blocked iframe still present')
if final_index.count('data-aerith10-portal="40.6.23"') != 1:
    raise SystemExit('STOP 40.6.23: portal multiplicity failure')
if final_index.count(NOTION_URL) < 1:
    raise SystemExit('STOP 40.6.23: Notion fallback URL lost')
if 'href="#forge-aerith"' not in final_index:
    raise SystemExit('STOP 40.6.23: Forge route lost')
for p,b in protected_before.items():
    if (ROOT/p).read_bytes() != b:
        raise SystemExit(f'STOP 40.6.23: protected file changed: {p}')
if str(load('build.json').get('engine')) != ENGINE:
    raise SystemExit('STOP 40.6.23: Market Core drift')

# --- Clean upload -----------------------------------------------------------
outdir = Path('coordination/inter_ai_dialogues/agent_crypto'); outdir.mkdir(parents=True,exist_ok=True)
out = outdir/'AGENT_CRYPTO_BUILD_40_6_23_AERITH10_PORTAL_FALLBACK_CLEAN_UPLOAD_6_FILES.zip'
rels = ['index.html','aerith10-portal-406023.css','build.json','administrator-version.json','version.json','RELEASE_40_6_23.md']
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for rel in rels:
        z.write(ROOT/rel,(Path('public/agent_crypto_erith_ia/administrator')/rel).as_posix())
digest = sha(out)
Path(str(out)+'.sha256').write_text(f'{digest}  {out.name}\n',encoding='utf-8')
print(json.dumps({'ok':True,'build':BUILD,'parent':PARENT,'zip':str(out),'sha256':digest},ensure_ascii=False))
