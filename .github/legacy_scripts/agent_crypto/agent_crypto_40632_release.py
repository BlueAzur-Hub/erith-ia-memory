from pathlib import Path
import json, hashlib, datetime, re, zipfile

ROOT = Path('public/agent_crypto_erith_ia/administrator')
INDEX = ROOT/'index.html'
CSS = ROOT/'admin-ribbons.css'
AETHER = ROOT/'js/aether.js'
ASSET = ROOT/'assets/aether/aether-observatory-background-406032.webp'
OLD_ASSET = ROOT/'assets/aether/aether-observatory-radial-406031.svg'
ARCHIVE_DIR = Path('coordination/inter_ai_dialogues/agent_crypto')
ARCHIVE_NAME = 'AGENT_CRYPTO_BUILD_40_6_32_AETHER_EXACT_BACKGROUND_LIVE_OVERLAY_CLEAN_UPLOAD_7_FILES.zip'
ARCHIVE = ARCHIVE_DIR/ARCHIVE_NAME
SHA_FILE = ARCHIVE_DIR/(ARCHIVE_NAME+'.sha256')

PROTECTED = [
 ROOT/'admin-chronos.css', ROOT/'js/version-truth.js', ROOT/'oracle-presentation-405010.css',
 ROOT/'oracle-fx-406013.css', ROOT/'js/oracle-fx-406013.js', ROOT/'js/footer-version-truth-406026.js',
 ROOT/'js/core/admin-window-manager.js', ROOT/'views/atlas.html', ROOT/'app.js', AETHER,
 ROOT/'js/strategy-a-paper-lifecycle-404295.js', ROOT/'js/strategy-a-after-cost-metrics-404298.js'
]

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def load(p): return json.loads(p.read_text(encoding='utf-8'))
def dump(p,d): p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

before={str(p):sha(p) for p in PROTECTED if p.exists()}

assert ASSET.exists(), 'exact Aether background asset missing'
assert sha(ASSET) == 'a081fd1695aa08c79a73eb67673141ac0b77a7b6b81402373caa9a40424fb89e', 'background asset digest mismatch'

html=INDEX.read_text(encoding='utf-8')
assert '<meta name="administrator-build" content="40.6.31"' in html, '40.6.31 checkpoint missing'
assert "Version : Parker Lewis Can't Lose" in html, 'Parker fallback missing'
html=html.replace('<meta name="atlas-build" content="40.6.31" />','<meta name="atlas-build" content="40.6.32" />',1)
html=html.replace('<meta name="administrator-build" content="40.6.31" />','<meta name="administrator-build" content="40.6.32" />',1)
html=html.replace('<meta name="administrator-release" content="AETHER CENTRAL OBSERVATORY · BACKGROUND LAYER · LIVE RADIAL UI" />','<meta name="administrator-release" content="AETHER CENTRAL OBSERVATORY · EXACT BACKGROUND · LIVE GLASS OVERLAY" />',1)
html=html.replace('<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.6.31" />','<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.6.32" />',1)
html=html.replace('<title>Agent-Crypto @erith.IA — Build 40.6.31 · Administrator</title>','<title>Agent-Crypto @erith.IA — Build 40.6.32 · Administrator</title>',1)
html,n=re.subn(r'(\./admin-ribbons\.css\?v=administrator-build-)[^"\']+',r'\g<1>40.6.32',html,count=1); assert n==1
html,n=re.subn(r'(\./js/aether\.js\?v=administrator-build-)[^"\']+',r'\g<1>40.6.32',html,count=1); assert n==1
INDEX.write_text(html,encoding='utf-8')

css=CSS.read_text(encoding='utf-8')
assert '40.6.31 — AETHER CENTRAL OBSERVATORY' in css
assert 'aether-observatory-radial-406031.svg' in css
assert '40.6.32 — AETHER EXACT BACKGROUND' not in css
css=css.replace("background:url('./assets/aether/aether-observatory-radial-406031.svg') center 58%/cover no-repeat;opacity:.9","background:url('./assets/aether/aether-observatory-background-406032.webp') center 56%/cover no-repeat;opacity:1;filter:saturate(.96) brightness(.86)",1)
css += r'''

/* 40.6.32 — AETHER EXACT BACKGROUND · LIVE GLASS OVERLAY */
#atlasAetherStatusPanel4084{background:#010711!important;border-color:rgba(62,205,255,.32)!important}
#atlasAetherStatusPanel4084::after{background:linear-gradient(rgba(2,10,22,.94),rgba(2,10,22,.94)) right 1.2% top 1.4%/18.5% 12.8% no-repeat,radial-gradient(circle at 50% 49%,rgba(1,8,20,.12) 0 23%,rgba(1,8,20,.20) 42%,rgba(1,8,20,.34) 72%,rgba(1,8,20,.44) 100%),linear-gradient(180deg,rgba(1,7,16,.08),rgba(1,7,16,.20))!important}
#atlasAetherStatusPanel4084 .atlas-aether-panel-head-4084 b{display:none!important}
#atlasAetherStatusPanel4084 [data-aether-close-4084]{right:6px!important;top:0!important;background:rgba(2,12,25,.86)!important;border-color:rgba(92,216,255,.42)!important}
#atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article,#atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article,#atlasAetherStatusPanel4084 [data-aether-focus-view-406030="glance"] > article{border:1px solid rgba(72,214,255,.42)!important;background:linear-gradient(145deg,rgba(3,18,35,.93),rgba(2,11,25,.88))!important;backdrop-filter:blur(9px) saturate(1.08)!important;-webkit-backdrop-filter:blur(9px) saturate(1.08)!important;box-shadow:0 8px 26px rgba(0,0,0,.30),inset 0 0 28px rgba(32,155,230,.055)!important}
#atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article:has([data-aether-row-4084="convergence"]){left:50%!important;top:5.2%!important;transform:translateX(-50%)!important;width:24.6%!important;height:14.6%!important}
#atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article:has([data-aether-row-4084="divergence"]){right:10.7%!important;top:15.2%!important;width:24.0%!important;height:14.7%!important}
#atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article:has([data-aether-row-4084="market"]){right:9.0%!important;top:31.8%!important;width:23.5%!important;height:21.8%!important}
#atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article:has([data-aether-row-4084="system"]){left:11.2%!important;top:15.3%!important;width:23.8%!important;height:14.8%!important}
#atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article:has([data-aether-row-4084="sources"]){left:11.5%!important;top:32.7%!important;width:22.7%!important;height:16.2%!important}
#atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article:has([data-aether-row-4084="atlas"]){left:11.6%!important;top:52.7%!important;width:22.9%!important;height:22.0%!important}
#atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article:has([data-aether-row-4084="oracle"]){left:24.0%!important;bottom:7.1%!important;width:22.0%!important;height:13.7%!important}
#atlasAetherStatusPanel4084 [data-aether-timeline-card-406027]{right:10.7%!important;top:56.4%!important;width:23.3%!important;height:18.3%!important}
#atlasAetherStatusPanel4084 [data-aether-weather-406030]{right:24.3%!important;bottom:7.1%!important;width:22.0%!important;height:13.7%!important}
#atlasAetherStatusPanel4084 [data-aether-level-406030]{left:50%!important;top:43.0%!important;width:320px!important;height:166px!important;background:radial-gradient(circle,rgba(2,11,27,.96) 0 58%,rgba(2,11,27,.88) 72%,rgba(2,11,27,.10) 100%)!important;backdrop-filter:blur(7px)!important;-webkit-backdrop-filter:blur(7px)!important;padding:34px 18px 8px!important}
#atlasAetherStatusPanel4084 [data-aether-level-406030]::before{content:"AETHER\A ATTENTION WATCH"!important;font-size:20px!important;margin-bottom:7px!important}
#atlasAetherStatusPanel4084 [data-aether-action-406030]{left:50%!important;top:59.5%!important;width:338px!important;height:108px!important;background:rgba(2,11,27,.91)!important;backdrop-filter:blur(7px)!important;-webkit-backdrop-filter:blur(7px)!important}
#atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 article > span,#atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article > span{font-size:11px!important}
#atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 article > b,#atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article > b{font-size:12.8px!important;line-height:1.26!important}
#atlasAetherStatusPanel4084 [data-aether-level-406030] [data-aether-row-4084="level"]{font-size:18px!important}
#atlasAetherStatusPanel4084 .aether-timeline-row-406027{font-size:9.8px!important}
#atlasAetherStatusPanel4084 .aether-timeline-detail-406027{font-size:9.8px!important}
@media(max-width:1180px),(max-height:720px){#atlasAetherStatusPanel4084::before{background-position:center 56%!important;filter:saturate(.90) brightness(.62)!important}#atlasAetherStatusPanel4084 .atlas-aether-panel-head-4084 b{display:block!important;font-size:14px!important}}
'''
CSS.write_text(css,encoding='utf-8')
if OLD_ASSET.exists(): OLD_ASSET.unlink()

now=datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z')
release='AETHER CENTRAL OBSERVATORY · EXACT BACKGROUND · LIVE GLASS OVERLAY'
status='aether_central_observatory_exact_background_live_glass_overlay_406032'
cascade={'parent_build':'40.6.31','release':release,'status':status,'exact_user_selected_background':True,'background_asset':'assets/aether/aether-observatory-background-406032.webp','generated_svg_active':False,'live_dom_owner_preserved':True,'aether_js_modified':False,'market_core_modified':False,'oracle_modified':False,'graph_modified':False,'technical_reading_modified':False,'chronos_modified':False,'version_truth_modified':False,'window_manager_modified':False,'paper_safety_modified':False,'new_timer':False,'new_observer':False,'new_storage_owner':False,'new_network_owner':False,'automatic_order':False,'real_order':False,'parker_signature_preserved_verbatim':True}
for name in ['build.json','administrator-version.json','version.json']:
    p=ROOT/name; d=load(p); assert str(d.get('build'))=='40.6.31'
    d['build']='40.6.32'; d['release']=release; d['status']=status
    if 'administrator_build' in d:d['administrator_build']='40.6.32'
    if 'build_label' in d:d['build_label']='Build 40.6.32'
    if 'release_status' in d:d['release_status']=release
    if 'asset_token' in d:d['asset_token']='market-core-v2.0-alpha-build-40.6.32'
    if 'parent_build' in d:d['parent_build']='40.6.31'
    if 'timestamp' in d:d['timestamp']=now
    if 'prepared_at' in d:d['prepared_at']=now
    if 'published_at' in d:d['published_at']=now
    if 'current_version_truth' in d and isinstance(d['current_version_truth'],dict):d['current_version_truth']['loaded_build']='40.6.32'
    d['cascade_40_6_32']=cascade; dump(p,d)
release_md=ROOT/'RELEASE_40_6_32.md'
release_md.write_text(f'''# Agent-Crypto 40.6.32 — AETHER CENTRAL OBSERVATORY · EXACT BACKGROUND\n\nParent: **40.6.31**  \nMarket Core: **38.15.11 — protected**  \nGenerated: **{now}**\n\n## Correction\n40.6.31 is visually rejected because it substituted a generated SVG for the selected Observatory artwork.\n\n40.6.32 uses the selected Aether Observatory artwork itself as the actual background layer. Live cards are translucent HTML/CSS overlays aligned to the artwork and mask its baked values with glass/blur. All readable runtime values remain DOM data.\n\n## Scope\n- Exact selected artwork used as `assets/aether/aether-observatory-background-406032.webp`.\n- Rejected generated SVG removed from the active build.\n- Live System, Sources, Atlas, Oracle, Weather, Convergence, Divergence, Market and Events cards aligned to the artwork.\n- Center Aether level/action remains live.\n- History/Details behavior preserved.\n- `js/aether.js` remains byte-for-byte unchanged.\n- No new timer, observer, storage, fetch or network owner.\n\n## Signature\n`Version : Parker Lewis Can't Lose` preserved verbatim.\n''',encoding='utf-8')
after={str(p):sha(p) for p in PROTECTED if p.exists()}; assert before==after
assert 'aether-observatory-background-406032.webp' in CSS.read_text(encoding='utf-8')
assert 'aether-observatory-radial-406031.svg' not in CSS.read_text(encoding='utf-8')
ARCHIVE_DIR.mkdir(parents=True,exist_ok=True)
files=[INDEX,CSS,ASSET,ROOT/'build.json',ROOT/'administrator-version.json',ROOT/'version.json',release_md]
with zipfile.ZipFile(ARCHIVE,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for p in files:z.write(p,arcname=str(p.relative_to(Path('public/agent_crypto_erith_ia'))))
archive_sha=sha(ARCHIVE); SHA_FILE.write_text(f'{archive_sha}  {ARCHIVE.name}\n',encoding='utf-8')
print('40.6.32 prepared', archive_sha)
