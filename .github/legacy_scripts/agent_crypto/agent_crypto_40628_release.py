from pathlib import Path
import json, hashlib, datetime, re, zipfile

ROOT = Path('public/agent_crypto_erith_ia/administrator')
INDEX = ROOT/'index.html'
AETHER = ROOT/'js/aether.js'
RIBBONS = ROOT/'admin-ribbons.css'
ARCHIVE_DIR = Path('coordination/inter_ai_dialogues/agent_crypto')
ARCHIVE_NAME = 'AGENT_CRYPTO_BUILD_40_6_28_AETHER_ATTENTION_WATCH_COMPACT_NO_SCROLL_CLEAN_UPLOAD_7_FILES.zip'
ARCHIVE = ARCHIVE_DIR/ARCHIVE_NAME
SHA_FILE = ARCHIVE_DIR/(ARCHIVE_NAME + '.sha256')

PROTECTED = [
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
assert '<meta name="administrator-build" content="40.6.27"' in html, '40.6.27 checkpoint missing'
assert "Version : Parker Lewis Can't Lose" in html, 'Parker fallback signature missing before surgery'
html = html.replace('<meta name="atlas-build" content="40.6.27" />','<meta name="atlas-build" content="40.6.28" />',1)
html = html.replace('<meta name="administrator-build" content="40.6.27" />','<meta name="administrator-build" content="40.6.28" />',1)
html = html.replace('<meta name="administrator-release" content="AETHER WATCH · EVENT TIMELINE · RUNTIME SESSION MEMORY LOCK" />','<meta name="administrator-release" content="AETHER ATTENTION WATCH · COMPACT NO-SCROLL · NATIVE DISCLOSURE LOCK" />',1)
html = html.replace('<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.6.27" />','<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.6.28" />',1)
html = html.replace('<title>Agent-Crypto @erith.IA — Build 40.6.27 · Administrator</title>','<title>Agent-Crypto @erith.IA — Build 40.6.28 · Administrator</title>',1)
html, n = re.subn(r'(\./admin-ribbons\.css\?v=administrator-build-)[^"\']+', r'\g<1>40.6.28', html, count=1)
assert n == 1, 'admin-ribbons cache owner not found'
html, n = re.subn(r'(\./js/aether\.js\?v=administrator-build-)[^"\']+', r'\g<1>40.6.28', html, count=1)
assert n == 1, 'aether.js cache owner not found'
INDEX.write_text(html, encoding='utf-8')

# --- Aether owner: compact watch presentation, timeline/data logic preserved ---
js = AETHER.read_text(encoding='utf-8')
assert 'function aetherTimelineCapture406027' in js, '40.6.27 timeline owner missing'
assert 'data-aether-timeline-card-406027' in js, '40.6.27 timeline panel missing'
assert 'AETHER_TIMELINE_PREVIEW_406028' not in js, '40.6.28 compact watch already present'

start = js.index('  function aetherTimelineRender406027(panel){')
end = js.index('  function aetherPanelEnsure4084(){', start)
new_timeline = r'''  const AETHER_TIMELINE_PREVIEW_406028=3;
  function aetherTimelineRow406028(entry){
    const row=document.createElement("div");row.className="aether-timeline-row-406027";
    const time=document.createElement("span");time.className="aether-timeline-time-406027";time.textContent=new Date(entry.at).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
    const type=document.createElement("b");type.className="aether-timeline-type-406027";type.textContent=entry.type;
    const level=document.createElement("span");level.className="aether-timeline-level-406027";level.textContent=entry.level;
    const detail=document.createElement("span");detail.className="aether-timeline-detail-406027";detail.textContent=entry.detail;
    row.append(time,type,level,detail);return row;
  }
  function aetherTimelineFill406028(host,entries){
    if(!host)return;
    host.replaceChildren();
    if(!entries.length){
      const empty=document.createElement("span");empty.className="aether-timeline-empty-406027";empty.textContent="Aucun changement significatif enregistré dans cette session.";host.appendChild(empty);return;
    }
    entries.forEach(entry=>host.appendChild(aetherTimelineRow406028(entry)));
  }
  function aetherTimelineRender406027(panel){
    const preview=panel?.querySelector('[data-aether-timeline-preview-406028]');
    const full=panel?.querySelector('[data-aether-timeline-406027]');
    if(!preview&&!full)return;
    const entries=aetherTimelineState406027.entries;
    aetherTimelineFill406028(preview,entries.slice(0,AETHER_TIMELINE_PREVIEW_406028));
    aetherTimelineFill406028(full,entries);
    const disclosure=panel?.querySelector('[data-aether-timeline-disclosure-406028]');
    const count=panel?.querySelector('[data-aether-timeline-count-406028]');
    const hasMore=entries.length>AETHER_TIMELINE_PREVIEW_406028;
    if(disclosure){disclosure.hidden=!hasMore;if(!hasMore)disclosure.open=false;}
    if(count)count.textContent=hasMore?`Voir les ${entries.length}`:`${entries.length} événement${entries.length>1?"s":""}`;
  }
'''
js = js[:start] + new_timeline + js[end:]

old_markup = r'''<div class="atlas-aether-panel-head-4084"><b>♥ AETHER · ATTENTION · OPERATOR WATCH</b><button type="button" data-aether-close-4084 aria-label="Fermer">×</button></div><div class="atlas-aether-panel-grid-4084"><article data-aether-wide-4084><span>Pourquoi Aether attire ton attention ?</span><b data-aether-row-4084="why">—</b></article><article data-aether-wide-4084><span>Lecture News → Marché</span><b data-aether-row-4084="semantic">—</b></article><article data-aether-wide-4084 data-aether-watch-summary-406026><span>Niveau d’attention</span><b data-aether-row-4084="level">—</b></article><article><span>Convergence</span><b data-aether-row-4084="convergence">—</b></article><article><span>Divergence</span><b data-aether-row-4084="divergence">—</b></article><article data-aether-wide-4084><span>À surveiller maintenant</span><b data-aether-row-4084="watch">—</b></article><article data-aether-wide-4084 data-aether-note-406026><span>Aether Note</span><b data-aether-row-4084="note">—</b></article><article data-aether-wide-4084 data-aether-timeline-card-406027><span>Chronologie récente</span><div data-aether-timeline-406027 aria-live="polite"></div></article><article data-aether-wide-4084><span>Attention</span><b data-aether-row-4084="attention">—</b></article><article><span>Marché</span><b data-aether-row-4084="market">—</b></article><article><span>Atlas AUTO</span><b data-aether-row-4084="atlas_auto">—</b></article><article><span>Atlas</span><b data-aether-row-4084="atlas">—</b></article><article><span>Oracle</span><b data-aether-row-4084="oracle">—</b></article><article><span>Sources</span><b data-aether-row-4084="sources">—</b></article><article><span>Système</span><b data-aether-row-4084="system">—</b></article><article data-aether-wide-4084><span>Météo 5 j</span><b data-aether-row-4084="weather">—</b></article><article data-aether-wide-4084><span>Risque météo</span><b data-aether-row-4084="weather_risk">—</b></article><article data-aether-wide-4084><span>Dernière veille</span><b data-aether-row-4084="news">—</b></article></div>'''
new_markup = r'''<div class="atlas-aether-panel-head-4084"><b>♥ AETHER · ATTENTION WATCH</b><button type="button" data-aether-close-4084 aria-label="Fermer">×</button></div><div class="atlas-aether-panel-grid-4084"><article data-aether-wide-4084 data-aether-watch-summary-406026><span>Niveau d’attention</span><b data-aether-row-4084="level">—</b></article><article data-aether-half-406028><span>Convergence</span><b data-aether-row-4084="convergence">—</b></article><article data-aether-half-406028><span>Divergence</span><b data-aether-row-4084="divergence">—</b></article><article data-aether-wide-4084><span>À surveiller maintenant</span><b data-aether-row-4084="watch">—</b></article><article data-aether-wide-4084 data-aether-note-406026><span>Aether Note</span><b data-aether-row-4084="note">—</b></article><article data-aether-wide-4084 data-aether-timeline-card-406027><span>Événements récents</span><div data-aether-timeline-preview-406028 aria-live="polite"></div><details data-aether-timeline-disclosure-406028><summary data-aether-timeline-count-406028>Voir les événements</summary><div data-aether-timeline-406027></div></details></article><article><span>Marché</span><b data-aether-row-4084="market">—</b></article><article><span>Atlas AUTO</span><b data-aether-row-4084="atlas_auto">—</b></article><article><span>Atlas</span><b data-aether-row-4084="atlas">—</b></article><article><span>Oracle</span><b data-aether-row-4084="oracle">—</b></article><article><span>Sources</span><b data-aether-row-4084="sources">—</b></article><article><span>Système</span><b data-aether-row-4084="system">—</b></article><details data-aether-wide-4084 data-aether-details-406028><summary>Détails · météo · veille · diagnostic</summary><div class="aether-details-grid-406028"><article><span>Pourquoi Aether attire ton attention ?</span><b data-aether-row-4084="why">—</b></article><article><span>Lecture News → Marché</span><b data-aether-row-4084="semantic">—</b></article><article><span>Attention</span><b data-aether-row-4084="attention">—</b></article><article><span>Météo 5 j</span><b data-aether-row-4084="weather">—</b></article><article><span>Risque météo</span><b data-aether-row-4084="weather_risk">—</b></article><article><span>Dernière veille</span><b data-aether-row-4084="news">—</b></article></div></details></div>'''
assert old_markup in js, '40.6.27 Aether panel markup not found'
js = js.replace(old_markup,new_markup,1)

api_marker = '    aether_attention_event_timeline_build:"40.6.27",\n'
api_add = '    aether_attention_compact_watch:true,\n    aether_attention_compact_watch_build:"40.6.28",\n    aether_attention_timeline_preview:3,\n    aether_attention_native_disclosures:true,\n    aether_attention_normal_state_no_permanent_scrollbar:true,\n    aether_attention_compact_new_timer:false,\n    aether_attention_compact_new_storage:false,\n    aether_attention_compact_new_network_owner:false,\n'
assert api_marker in js, 'Aether timeline API marker missing'
js = js.replace(api_marker,api_marker+api_add,1)
AETHER.write_text(js,encoding='utf-8')

# --- CSS owner consolidation: compact desktop Watch, fallback scroll only when viewport/details require it ---
css = RIBBONS.read_text(encoding='utf-8')
old_owner = '''/* 40.4.133 — AETHER ATTENTION OPERATOR WATCH */\n#atlasAetherStatusPanel4084{width:min(590px,calc(100vw - 36px))!important;max-height:min(76vh,740px)!important;overflow:auto!important;scrollbar-gutter:stable!important}\n#atlasAetherStatusPanel4084 .atlas-aether-panel-grid-4084{grid-template-columns:repeat(2,minmax(0,1fr))!important;align-items:start!important}\n#atlasAetherStatusPanel4084 .atlas-aether-panel-grid-4084 article{min-width:0!important;align-content:start!important}\n#atlasAetherStatusPanel4084 .atlas-aether-panel-grid-4084 article[data-aether-wide-4084]{grid-column:1/-1!important}\n'''
new_owner = '''/* 40.4.133 → 40.6.28 — AETHER ATTENTION WATCH · COMPACT NO-SCROLL OWNER */\n#atlasAetherStatusPanel4084{width:min(760px,calc(100vw - 36px))!important;max-height:calc(100vh - 34px)!important;overflow-x:hidden!important;overflow-y:auto!important;scrollbar-gutter:auto!important}\n#atlasAetherStatusPanel4084 .atlas-aether-panel-grid-4084{grid-template-columns:repeat(6,minmax(0,1fr))!important;align-items:start!important;gap:7px!important}\n#atlasAetherStatusPanel4084 .atlas-aether-panel-grid-4084 article{grid-column:span 2;min-width:0!important;align-content:start!important}\n#atlasAetherStatusPanel4084 .atlas-aether-panel-grid-4084 article[data-aether-wide-4084],\n#atlasAetherStatusPanel4084 .atlas-aether-panel-grid-4084 details[data-aether-wide-4084]{grid-column:1/-1!important}\n#atlasAetherStatusPanel4084 .atlas-aether-panel-grid-4084 article[data-aether-half-406028]{grid-column:span 3!important}\n'''
assert old_owner in css, '40.4.133 Aether panel owner block not found'
css = css.replace(old_owner,new_owner,1)

marker = '/* 40.6.27 — AETHER WATCH · EVENT TIMELINE'
assert marker in css, '40.6.27 timeline CSS marker missing'
cut = css.index(marker)
css = css[:cut] + r'''/* 40.6.27 → 40.6.28 — AETHER WATCH · EVENT TIMELINE / COMPACT DISCLOSURE
   Same runtime-session memory. Three newest events stay visible; full history opens on demand. */
#atlasAetherStatusPanel4084 [data-aether-timeline-card-406027]{
  border-color:rgba(136,113,228,.28)!important;
  background:linear-gradient(90deg,rgba(112,84,205,.055),rgba(5,16,29,.08))!important;
}
#atlasAetherStatusPanel4084 [data-aether-timeline-preview-406028],
#atlasAetherStatusPanel4084 [data-aether-timeline-406027]{display:grid;gap:4px;margin-top:6px}
#atlasAetherStatusPanel4084 .aether-timeline-row-406027{
  display:grid;grid-template-columns:56px 66px 76px minmax(0,1fr);gap:6px;
  padding:4px 7px;border:1px solid rgba(125,155,210,.14);border-radius:7px;
  background:rgba(3,12,24,.25);font-size:10.5px;line-height:1.22;
}
#atlasAetherStatusPanel4084 .aether-timeline-time-406027{color:#7fa3ba}
#atlasAetherStatusPanel4084 .aether-timeline-type-406027{color:#a9dfff;font-weight:800}
#atlasAetherStatusPanel4084 .aether-timeline-level-406027{color:#f5df9c;font-weight:800}
#atlasAetherStatusPanel4084 .aether-timeline-detail-406027{color:#e8f2fb;min-width:0;overflow-wrap:anywhere}
#atlasAetherStatusPanel4084 .aether-timeline-empty-406027{color:#829aae;font-size:10.5px}
#atlasAetherStatusPanel4084 [data-aether-timeline-disclosure-406028],
#atlasAetherStatusPanel4084 [data-aether-details-406028]{
  min-width:0;border:1px solid rgba(125,155,210,.16);border-radius:8px;background:rgba(3,12,24,.18)
}
#atlasAetherStatusPanel4084 [data-aether-timeline-disclosure-406028]{margin-top:6px}
#atlasAetherStatusPanel4084 [data-aether-timeline-disclosure-406028] > summary,
#atlasAetherStatusPanel4084 [data-aether-details-406028] > summary{
  cursor:pointer;list-style:none;padding:6px 9px;color:#a9dfff;font-size:10.5px;font-weight:800;letter-spacing:.03em
}
#atlasAetherStatusPanel4084 [data-aether-timeline-disclosure-406028] > summary::-webkit-details-marker,
#atlasAetherStatusPanel4084 [data-aether-details-406028] > summary::-webkit-details-marker{display:none}
#atlasAetherStatusPanel4084 [data-aether-timeline-disclosure-406028] > summary::after,
#atlasAetherStatusPanel4084 [data-aether-details-406028] > summary::after{content:' +';float:right;color:#7ff0df}
#atlasAetherStatusPanel4084 [data-aether-timeline-disclosure-406028][open] > summary::after,
#atlasAetherStatusPanel4084 [data-aether-details-406028][open] > summary::after{content:' −'}
#atlasAetherStatusPanel4084 [data-aether-timeline-disclosure-406028] [data-aether-timeline-406027]{padding:0 7px 7px;max-height:310px;overflow:auto}
#atlasAetherStatusPanel4084 [data-aether-details-406028]{padding:0}
#atlasAetherStatusPanel4084 .aether-details-grid-406028{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;padding:0 7px 7px}
#atlasAetherStatusPanel4084 .aether-details-grid-406028 article{grid-column:auto!important;margin:0!important}
#atlasAetherStatusPanel4084 [data-aether-row-4084="why"],
#atlasAetherStatusPanel4084 [data-aether-row-4084="semantic"],
#atlasAetherStatusPanel4084 [data-aether-row-4084="news"]{font-size:10.5px!important;line-height:1.28!important}
@media(min-width:721px) and (min-height:760px){
  #atlasAetherStatusPanel4084:not(:has([data-aether-details-406028][open])):not(:has([data-aether-timeline-disclosure-406028][open])){overflow-y:hidden!important}
}
@media(max-width:900px){
  #atlasAetherStatusPanel4084{width:min(650px,calc(100vw - 24px))!important}
  #atlasAetherStatusPanel4084 .atlas-aether-panel-grid-4084{grid-template-columns:repeat(2,minmax(0,1fr))!important}
  #atlasAetherStatusPanel4084 .atlas-aether-panel-grid-4084 article{grid-column:span 1!important}
  #atlasAetherStatusPanel4084 .atlas-aether-panel-grid-4084 article[data-aether-wide-4084],
  #atlasAetherStatusPanel4084 .atlas-aether-panel-grid-4084 article[data-aether-half-406028],
  #atlasAetherStatusPanel4084 .atlas-aether-panel-grid-4084 details[data-aether-wide-4084]{grid-column:1/-1!important}
}
@media(max-width:720px){
  #atlasAetherStatusPanel4084 .aether-timeline-row-406027{grid-template-columns:52px 62px minmax(0,1fr)}
  #atlasAetherStatusPanel4084 .aether-timeline-detail-406027{grid-column:1/-1}
  #atlasAetherStatusPanel4084 .aether-details-grid-406028{grid-template-columns:minmax(0,1fr)}
}
'''
RIBBONS.write_text(css,encoding='utf-8')

# --- manifests ---
now = datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z')
release = 'AETHER ATTENTION WATCH · COMPACT NO-SCROLL · NATIVE DISCLOSURE LOCK'
status = 'aether_attention_watch_compact_no_scroll_native_disclosure_lock_406028'
cascade = {
    'parent_build':'40.6.27',
    'release':release,
    'status':status,
    'owner':'js/aether.js + admin-ribbons.css',
    'compact_watch':True,
    'normal_state_no_permanent_scrollbar':True,
    'timeline_runtime_session_preserved':True,
    'timeline_max_entries':8,
    'timeline_preview_entries':3,
    'timeline_full_history_native_disclosure':True,
    'secondary_details_native_disclosure':True,
    'timeline_new_timer':False,
    'timeline_new_storage':False,
    'timeline_new_network_owner':False,
    'aether_convergence_406026_preserved':True,
    'aether_timeline_406027_preserved':True,
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
    assert str(data.get('build')) == '40.6.27', f'{name}: expected 40.6.27 parent checkpoint'
    data['build']='40.6.28'; data['release']=release; data['status']=status
    if 'administrator_build' in data:data['administrator_build']='40.6.28'
    if 'build_label' in data:data['build_label']='Build 40.6.28'
    if 'release_status' in data:data['release_status']=release
    if 'asset_token' in data:data['asset_token']='market-core-v2.0-alpha-build-40.6.28'
    if 'parent_build' in data:data['parent_build']='40.6.27'
    if 'timestamp' in data:data['timestamp']=now
    if 'prepared_at' in data:data['prepared_at']=now
    if 'published_at' in data:data['published_at']=now
    if 'current_version_truth' in data and isinstance(data['current_version_truth'],dict):data['current_version_truth']['loaded_build']='40.6.28'
    data['cascade_40_6_28']=cascade
    write_json(path,data)

release_path=ROOT/'RELEASE_40_6_28.md'
release_path.write_text(f'''# Agent-Crypto 40.6.28 — AETHER ATTENTION WATCH · COMPACT NO-SCROLL\n\nParent: **40.6.27**  \nMarket Core: **38.15.11 — protected**  \nGenerated: **{now}**\n\n## Scope\n- Recompose the existing AETHER · ATTENTION panel as an operator Watch rather than a long vertical technical sheet.\n- Keep the current attention level, convergence, divergence, watch instruction and Aether Note visible immediately.\n- Keep only the three newest runtime-session events visible in the resting state; expose the full session timeline through a native disclosure.\n- Move secondary explanation, weather, risk and long News detail behind a native details disclosure without deleting data.\n- Target normal desktop state: no permanent vertical scrollbar. A fallback scroll remains available only when a small viewport or an explicitly opened disclosure requires it.\n- No new timer, storage, fetch or network owner.\n\n## Protected\nOracle 40.6.13 + FX, Graphique, Lecture Technique, Chronos, Version Truth, Window Manager, Paper/Safety 40.6.14→40.6.19, Footer/Parker and Market Core 38.15.11.\n\n## Signature\n`Version : Parker Lewis Can't Lose` preserved verbatim.\n''',encoding='utf-8')

# --- anti-destruction hashes ---
after = {str(p): sha(p) for p in PROTECTED if p.exists()}
assert before == after, 'protected owner changed during 40.6.28 surgery'
assert "Version : Parker Lewis Can't Lose" in (ROOT/'js/footer-version-truth-406026.js').read_text(encoding='utf-8'), 'Parker signature changed'
assert "Version : Parker Lewis Can't Lose" in INDEX.read_text(encoding='utf-8'), 'Parker fallback changed'
assert 'AETHER_TIMELINE_PREVIEW_406028=3' in AETHER.read_text(encoding='utf-8')
assert 'data-aether-details-406028' in AETHER.read_text(encoding='utf-8')
assert 'data-aether-timeline-disclosure-406028' in AETHER.read_text(encoding='utf-8')

# --- clean upload ZIP: same seven-file contract ---
ARCHIVE_DIR.mkdir(parents=True,exist_ok=True)
files=[INDEX,RIBBONS,AETHER,ROOT/'build.json',ROOT/'administrator-version.json',ROOT/'version.json',release_path]
with zipfile.ZipFile(ARCHIVE,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for p in files:z.write(p,arcname=str(p.relative_to(Path('public/agent_crypto_erith_ia'))))
archive_sha=sha(ARCHIVE)
SHA_FILE.write_text(f'{archive_sha}  {ARCHIVE.name}\n',encoding='utf-8')
print('40.6.28 prepared', archive_sha)
