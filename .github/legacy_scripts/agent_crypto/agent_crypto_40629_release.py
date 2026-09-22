from pathlib import Path
import json, hashlib, datetime, re, zipfile

ROOT = Path('public/agent_crypto_erith_ia/administrator')
INDEX = ROOT/'index.html'
AETHER = ROOT/'js/aether.js'
RIBBONS = ROOT/'admin-ribbons.css'
ARCHIVE_DIR = Path('coordination/inter_ai_dialogues/agent_crypto')
ARCHIVE_NAME = 'AGENT_CRYPTO_BUILD_40_6_29_AETHER_WATCH_EXPANDED_STATE_CONTAINMENT_CLEAN_UPLOAD_7_FILES.zip'
ARCHIVE = ARCHIVE_DIR/ARCHIVE_NAME
SHA_FILE = ARCHIVE_DIR/(ARCHIVE_NAME + '.sha256')

PROTECTED = [
    AETHER,
    ROOT/'admin-chronos.css',
    ROOT/'js/version-truth.js',
    ROOT/'oracle-presentation-405010.css',
    ROOT/'oracle-fx-406013.css',
    ROOT/'js/oracle-fx-406013.js',
    ROOT/'js/footer-version-truth-406026.js',
    ROOT/'js/core/admin-window-manager.js',
    ROOT/'views/atlas.html',
    ROOT/'js/strategy-a-paper-lifecycle-404295.js',
    ROOT/'js/strategy-a-after-cost-metrics-404298.js',
    ROOT/'app.js',
]

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def load_json(path):
    return json.loads(path.read_text(encoding='utf-8'))

def write_json(path, data):
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

before = {str(p): sha(p) for p in PROTECTED if p.exists()}

# --- index: version truth + cache tokens only ---
html = INDEX.read_text(encoding='utf-8')
assert '<meta name="administrator-build" content="40.6.28"' in html, '40.6.28 checkpoint missing'
assert '<meta name="administrator-release" content="AETHER ATTENTION WATCH · COMPACT NO-SCROLL · NATIVE DISCLOSURE LOCK"' in html, '40.6.28 release checkpoint missing'
assert "Version : Parker Lewis Can't Lose" in html, 'Parker fallback signature missing before surgery'
html = html.replace('<meta name="atlas-build" content="40.6.28" />','<meta name="atlas-build" content="40.6.29" />',1)
html = html.replace('<meta name="administrator-build" content="40.6.28" />','<meta name="administrator-build" content="40.6.29" />',1)
html = html.replace('<meta name="administrator-release" content="AETHER ATTENTION WATCH · COMPACT NO-SCROLL · NATIVE DISCLOSURE LOCK" />','<meta name="administrator-release" content="AETHER WATCH · EXPANDED STATE CONTAINMENT · TIMELINE GEOMETRY LOCK" />',1)
html = html.replace('<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.6.28" />','<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.6.29" />',1)
html = html.replace('<title>Agent-Crypto @erith.IA — Build 40.6.28 · Administrator</title>','<title>Agent-Crypto @erith.IA — Build 40.6.29 · Administrator</title>',1)
html, n = re.subn(r'(\./admin-ribbons\.css\?v=administrator-build-)[^"\']+', r'\g<1>40.6.29', html, count=1)
assert n == 1, 'admin-ribbons cache owner not found'
html, n = re.subn(r'(\./js/aether\.js\?v=administrator-build-)[^"\']+', r'\g<1>40.6.29', html, count=1)
assert n == 1, 'aether.js cache owner not found'
INDEX.write_text(html, encoding='utf-8')

# --- CSS-only owner surgery: contain the expanded timeline without touching Aether data/runtime ---
css = RIBBONS.read_text(encoding='utf-8')
assert '40.6.27 → 40.6.28 — AETHER WATCH · EVENT TIMELINE / COMPACT DISCLOSURE' in css, '40.6.28 compact timeline CSS checkpoint missing'
assert '40.6.29 — AETHER WATCH · EXPANDED STATE CONTAINMENT' not in css, '40.6.29 CSS already present'
css += r'''

/* 40.6.29 — AETHER WATCH · EXPANDED STATE CONTAINMENT
   Firefox geometry repair only. The timeline card owns one vertical lane;
   opening the full runtime-session history no longer creates an implicit
   74px grid column or a giant empty surface. No data/runtime owner changed. */
#atlasAetherStatusPanel4084 article[data-aether-timeline-card-406027]{
  display:block!important;
  grid-template-columns:none!important;
  width:100%!important;
  min-width:0!important;
  box-sizing:border-box!important;
}
#atlasAetherStatusPanel4084 article[data-aether-timeline-card-406027] > span{
  display:block!important;
  width:100%!important;
  margin:0 0 5px!important;
}
#atlasAetherStatusPanel4084 article[data-aether-timeline-card-406027] > [data-aether-timeline-preview-406028],
#atlasAetherStatusPanel4084 article[data-aether-timeline-card-406027] > [data-aether-timeline-disclosure-406028]{
  display:block!important;
  width:100%!important;
  min-width:0!important;
  box-sizing:border-box!important;
}
#atlasAetherStatusPanel4084 article[data-aether-timeline-card-406027] > [data-aether-timeline-preview-406028]{
  display:grid!important;
}
#atlasAetherStatusPanel4084 article[data-aether-timeline-card-406027]:has([data-aether-timeline-disclosure-406028][open]) > [data-aether-timeline-preview-406028]{
  display:none!important;
}
#atlasAetherStatusPanel4084 [data-aether-timeline-disclosure-406028][open]{
  width:100%!important;
  min-width:0!important;
}
#atlasAetherStatusPanel4084 [data-aether-timeline-disclosure-406028][open] > summary{
  width:100%!important;
  box-sizing:border-box!important;
}
#atlasAetherStatusPanel4084 [data-aether-timeline-disclosure-406028][open] [data-aether-timeline-406027]{
  display:grid!important;
  width:100%!important;
  max-width:100%!important;
  max-height:min(210px,28vh)!important;
  overflow-y:auto!important;
  overflow-x:hidden!important;
  box-sizing:border-box!important;
  scrollbar-gutter:stable!important;
}
#atlasAetherStatusPanel4084 [data-aether-timeline-disclosure-406028][open] .aether-timeline-row-406027{
  width:100%!important;
  min-width:0!important;
  box-sizing:border-box!important;
}
@media(max-height:760px){
  #atlasAetherStatusPanel4084 [data-aether-timeline-disclosure-406028][open] [data-aether-timeline-406027]{max-height:170px!important}
}
'''
RIBBONS.write_text(css, encoding='utf-8')

# --- manifests ---
now = datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z')
release = 'AETHER WATCH · EXPANDED STATE CONTAINMENT · TIMELINE GEOMETRY LOCK'
status = 'aether_watch_expanded_state_containment_timeline_geometry_lock_406029'
cascade = {
    'parent_build':'40.6.28',
    'release':release,
    'status':status,
    'owner':'admin-ribbons.css only + version metadata',
    'firefox_geometry_repair':True,
    'timeline_card_single_vertical_lane':True,
    'timeline_preview_hidden_while_full_history_open':True,
    'timeline_full_history_internal_scroll_only':True,
    'timeline_full_history_max_height_px':210,
    'timeline_runtime_session_preserved':True,
    'timeline_max_entries':8,
    'aether_js_modified':False,
    'new_timer':False,
    'new_storage':False,
    'new_fetch':False,
    'new_network_owner':False,
    'parker_signature_preserved_verbatim':True,
    'market_core_modified':False,
    'oracle_modified':False,
    'graph_modified':False,
    'technical_reading_modified':False,
    'chronos_modified':False,
    'version_truth_modified':False,
    'window_manager_modified':False,
    'paper_safety_modified':False,
    'automatic_order':False,
    'real_order':False,
}
for name in ['build.json','administrator-version.json','version.json']:
    path=ROOT/name; data=load_json(path)
    assert str(data.get('build')) == '40.6.28', f'{name}: expected 40.6.28 parent checkpoint'
    data['build']='40.6.29'; data['release']=release; data['status']=status
    if 'administrator_build' in data:data['administrator_build']='40.6.29'
    if 'build_label' in data:data['build_label']='Build 40.6.29'
    if 'release_status' in data:data['release_status']=release
    if 'asset_token' in data:data['asset_token']='market-core-v2.0-alpha-build-40.6.29'
    if 'parent_build' in data:data['parent_build']='40.6.28'
    if 'timestamp' in data:data['timestamp']=now
    if 'prepared_at' in data:data['prepared_at']=now
    if 'published_at' in data:data['published_at']=now
    if 'current_version_truth' in data and isinstance(data['current_version_truth'],dict):data['current_version_truth']['loaded_build']='40.6.29'
    data['cascade_40_6_29']=cascade
    write_json(path,data)

release_path=ROOT/'RELEASE_40_6_29.md'
release_path.write_text(f'''# Agent-Crypto 40.6.29 — AETHER WATCH · EXPANDED STATE CONTAINMENT\n\nParent: **40.6.28**  \nMarket Core: **38.15.11 — protected**  \nGenerated: **{now}**\n\n## Scope\n- Repair only the expanded-state geometry of the existing AETHER · ATTENTION WATCH timeline.\n- Force the timeline card into one vertical lane so Firefox cannot place the disclosure in the inherited 74 px article label column.\n- When the full timeline opens, hide the duplicated 3-row preview and keep the full 8-event history inside a bounded internal scroll area.\n- Preserve the compact resting state introduced in 40.6.28.\n- No Aether JS/data/runtime change.\n- No new timer, storage, fetch or network owner.\n\n## Protected\nAether runtime logic, Oracle 40.6.13 + FX, Graphique, Lecture Technique, Chronos, Version Truth, Window Manager, Paper/Safety 40.6.14→40.6.19, Footer/Parker and Market Core 38.15.11.\n\n## Signature\n`Version : Parker Lewis Can't Lose` preserved verbatim.\n''',encoding='utf-8')

# --- anti-destruction hashes ---
after = {str(p): sha(p) for p in PROTECTED if p.exists()}
assert before == after, 'protected owner changed during 40.6.29 surgery'
assert "Version : Parker Lewis Can't Lose" in (ROOT/'js/footer-version-truth-406026.js').read_text(encoding='utf-8'), 'Parker signature changed'
assert "Version : Parker Lewis Can't Lose" in INDEX.read_text(encoding='utf-8'), 'Parker fallback changed'
assert '40.6.29 — AETHER WATCH · EXPANDED STATE CONTAINMENT' in RIBBONS.read_text(encoding='utf-8')

# --- clean upload ZIP: preserve seven-file delivery contract ---
ARCHIVE_DIR.mkdir(parents=True,exist_ok=True)
files=[INDEX,RIBBONS,AETHER,ROOT/'build.json',ROOT/'administrator-version.json',ROOT/'version.json',release_path]
with zipfile.ZipFile(ARCHIVE,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for p in files:z.write(p,arcname=str(p.relative_to(Path('public/agent_crypto_erith_ia'))))
archive_sha=sha(ARCHIVE)
SHA_FILE.write_text(f'{archive_sha}  {ARCHIVE.name}\n',encoding='utf-8')
print('40.6.29 prepared', archive_sha)
