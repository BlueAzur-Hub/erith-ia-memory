from pathlib import Path
import json, hashlib, datetime, re, zipfile

ROOT = Path('public/agent_crypto_erith_ia/administrator')
INDEX = ROOT/'index.html'
AETHER = ROOT/'js/aether.js'
RIBBONS = ROOT/'admin-ribbons.css'
ARCHIVE_DIR = Path('coordination/inter_ai_dialogues/agent_crypto')
ARCHIVE_NAME = 'AGENT_CRYPTO_BUILD_40_6_27_AETHER_EVENT_TIMELINE_CLEAN_UPLOAD_7_FILES.zip'
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

# --- index: version truth and cache tokens only ---
html = INDEX.read_text(encoding='utf-8')
assert '<meta name="administrator-build" content="40.6.26"' in html, '40.6.26 checkpoint missing'
assert "Version : Parker Lewis Can't Lose" in html, 'Parker fallback signature missing before surgery'
html = html.replace('<meta name="atlas-build" content="40.6.26" />','<meta name="atlas-build" content="40.6.27" />',1)
html = html.replace('<meta name="administrator-build" content="40.6.26" />','<meta name="administrator-build" content="40.6.27" />',1)
html = html.replace('<meta name="administrator-release" content="AETHER OPERATOR WATCH · CONVERGENCE MATRIX · PARKER SIGNATURE LOCK" />','<meta name="administrator-release" content="AETHER WATCH · EVENT TIMELINE · RUNTIME SESSION MEMORY LOCK" />',1)
html = html.replace('<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.6.26" />','<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.6.27" />',1)
html = html.replace('<title>Agent-Crypto @erith.IA — Build 40.6.26 · Administrator</title>','<title>Agent-Crypto @erith.IA — Build 40.6.27 · Administrator</title>',1)
html, n = re.subn(r'(\./admin-ribbons\.css\?v=administrator-build-)[^"\']+', r'\g<1>40.6.27', html, count=1)
assert n == 1, 'admin-ribbons cache owner not found'
html, n = re.subn(r'(\./js/aether\.js\?v=administrator-build-)[^"\']+', r'\g<1>40.6.27', html, count=1)
assert n == 1, 'aether.js cache owner not found'
INDEX.write_text(html, encoding='utf-8')

# --- Aether owner: add runtime-session event timeline ---
js = AETHER.read_text(encoding='utf-8')
assert 'function aetherOperatorWatch406026' in js, '40.6.26 convergence owner missing'
assert 'aetherTimelineCapture406027' not in js, '40.6.27 timeline already present'
marker = '  function aetherPanelEnsure4084(){\n'
assert marker in js, 'Aether panel owner marker missing'
helper = r'''  const aetherTimelineState406027={entries:[],last:null,max:8};
  function aetherTimelineClip406027(value,max=150){
    const text=String(value??"").replace(/\s+/g," ").trim();
    return text.length>max?`${text.slice(0,max-1)}…`:text;
  }
  function aetherTimelineNewsKey406027(){
    try{
      const feed=aetherVeilleCurrent4087(),event=feed?.event||{};
      return aetherTimelineClip406027(event?.id||event?.event_id||event?.fingerprint||event?.display_headline||event?.headline||feed?.headline||"",180);
    }catch(_){return "";}
  }
  function aetherTimelineSnapshot406027(watch){
    return {
      news:aetherTimelineNewsKey406027(),
      market:aetherMarketDirection406026(),
      atlas:aetherAtlasDirection406026(),
      oracle:aetherOracleDirection406026(),
      level:String(watch?.level||"").split("·")[0].trim()||"N/D"
    };
  }
  function aetherTimelinePush406027(type,level,detail){
    const entry=Object.freeze({at:Date.now(),type:String(type||"AETHER"),level:String(level||"N/D"),detail:aetherTimelineClip406027(detail||"État actualisé")});
    aetherTimelineState406027.entries.unshift(entry);
    if(aetherTimelineState406027.entries.length>aetherTimelineState406027.max)aetherTimelineState406027.entries.length=aetherTimelineState406027.max;
  }
  function aetherTimelineCapture406027(watch){
    try{
      const current=aetherTimelineSnapshot406027(watch),previous=aetherTimelineState406027.last;
      if(!previous){
        aetherTimelinePush406027("AETHER",current.level,watch?.convergence||"Surveillance initialisée");
        aetherTimelineState406027.last=current;
        return;
      }
      let type="",detail="";
      if(current.news&&current.news!==previous.news){type="NEWS";detail=aetherVeilleCurrent4087()?.event?.display_headline||aetherVeilleCurrent4087()?.event?.headline||aetherVeilleCurrent4087()?.headline||"Nouvelle veille";}
      else if(current.oracle!==previous.oracle){type="ORACLE";detail=aetherOracleBrief4088();}
      else if(current.market!==previous.market){type="MARCHÉ";detail=aetherMarketBreadth40133();}
      else if(current.atlas!==previous.atlas){type="ATLAS";detail=aetherAtlasBrief4088();}
      else if(current.level!==previous.level){type="AETHER";detail=watch?.convergence||watch?.divergence||"Niveau d’attention modifié";}
      if(type)aetherTimelinePush406027(type,current.level,detail);
      aetherTimelineState406027.last=current;
    }catch(_){}
  }
  function aetherTimelineRender406027(panel){
    const host=panel?.querySelector('[data-aether-timeline-406027]');
    if(!host)return;
    host.replaceChildren();
    const entries=aetherTimelineState406027.entries;
    if(!entries.length){
      const empty=document.createElement("span");empty.className="aether-timeline-empty-406027";empty.textContent="Aucun changement significatif enregistré dans cette session.";host.appendChild(empty);return;
    }
    entries.forEach(entry=>{
      const row=document.createElement("div");row.className="aether-timeline-row-406027";
      const time=document.createElement("span");time.className="aether-timeline-time-406027";time.textContent=new Date(entry.at).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
      const type=document.createElement("b");type.className="aether-timeline-type-406027";type.textContent=entry.type;
      const level=document.createElement("span");level.className="aether-timeline-level-406027";level.textContent=entry.level;
      const detail=document.createElement("span");detail.className="aether-timeline-detail-406027";detail.textContent=entry.detail;
      row.append(time,type,level,detail);host.appendChild(row);
    });
  }
'''
js = js.replace(marker, helper + marker, 1)

old_panel = '<article data-aether-wide-4084 data-aether-note-406026><span>Aether Note</span><b data-aether-row-4084="note">—</b></article><article data-aether-wide-4084><span>Attention</span><b data-aether-row-4084="attention">—</b></article>'
new_panel = '<article data-aether-wide-4084 data-aether-note-406026><span>Aether Note</span><b data-aether-row-4084="note">—</b></article><article data-aether-wide-4084 data-aether-timeline-card-406027><span>Chronologie récente</span><div data-aether-timeline-406027 aria-live="polite"></div></article><article data-aether-wide-4084><span>Attention</span><b data-aether-row-4084="attention">—</b></article>'
assert old_panel in js, 'timeline panel insertion point missing'
js = js.replace(old_panel,new_panel,1)

old_gate = 'const panel=document.getElementById("atlasAetherStatusPanel4084");if(panel&&!panel.hidden){'
new_gate = 'const watch406027=aetherOperatorWatch406026();aetherTimelineCapture406027(watch406027);const panel=document.getElementById("atlasAetherStatusPanel4084");if(panel&&!panel.hidden){'
assert old_gate in js, 'render panel gate missing'
js = js.replace(old_gate,new_gate,1)
old_note = 'row("note",watch406026.note);row("attention",aetherAttention40133());'
new_note = 'row("note",watch406026.note);aetherTimelineRender406027(panel);row("attention",aetherAttention40133());'
assert old_note in js, 'timeline render insertion point missing'
js = js.replace(old_note,new_note,1)

api_marker = '    aether_attention_new_timer:false,\n'
api_add = '    aether_attention_event_timeline:true,\n    aether_attention_event_timeline_build:"40.6.27",\n    aether_attention_timeline_max:8,\n    aether_attention_timeline_persistence:"runtime-session-only",\n    aether_attention_timeline_new_timer:false,\n    aether_attention_timeline_new_storage:false,\n    aether_attention_timeline_new_network_owner:false,\n    timeline:()=>aetherTimelineState406027.entries.map(row=>Object.freeze({...row})),\n'
assert api_marker in js, 'Aether API insertion point missing'
js = js.replace(api_marker,api_add+api_marker,1)
AETHER.write_text(js,encoding='utf-8')

# --- isolated timeline presentation ---
css = RIBBONS.read_text(encoding='utf-8')
assert 'aether-timeline-row-406027' not in css, '40.6.27 CSS already present'
css += r'''

/* 40.6.27 — AETHER WATCH · EVENT TIMELINE
   Runtime-session presentation only; no new timer, storage or network owner. */
#atlasAetherStatusPanel4084 [data-aether-timeline-card-406027]{
  border-color:rgba(136,113,228,.28)!important;
  background:linear-gradient(90deg,rgba(112,84,205,.055),rgba(5,16,29,.08))!important;
}
#atlasAetherStatusPanel4084 [data-aether-timeline-406027]{display:grid;gap:6px;margin-top:7px}
#atlasAetherStatusPanel4084 .aether-timeline-row-406027{
  display:grid;grid-template-columns:64px 84px 92px minmax(0,1fr);gap:8px;
  padding:6px 8px;border:1px solid rgba(125,155,210,.14);border-radius:8px;
  background:rgba(3,12,24,.25);font-size:11px;line-height:1.28;
}
#atlasAetherStatusPanel4084 .aether-timeline-time-406027{color:#7fa3ba}
#atlasAetherStatusPanel4084 .aether-timeline-type-406027{color:#a9dfff;font-weight:800}
#atlasAetherStatusPanel4084 .aether-timeline-level-406027{color:#f5df9c;font-weight:800}
#atlasAetherStatusPanel4084 .aether-timeline-detail-406027{color:#e8f2fb;min-width:0}
#atlasAetherStatusPanel4084 .aether-timeline-empty-406027{color:#829aae;font-size:11px}
@media(max-width:720px){
  #atlasAetherStatusPanel4084 .aether-timeline-row-406027{grid-template-columns:58px 78px minmax(0,1fr)}
  #atlasAetherStatusPanel4084 .aether-timeline-detail-406027{grid-column:1/-1}
}
'''
RIBBONS.write_text(css,encoding='utf-8')

# --- manifests ---
now = datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z')
release = 'AETHER WATCH · EVENT TIMELINE · RUNTIME SESSION MEMORY LOCK'
status = 'aether_watch_event_timeline_runtime_session_memory_lock_406027'
cascade = {
    'parent_build':'40.6.26',
    'release':release,
    'status':status,
    'owner':'js/aether.js + admin-ribbons.css',
    'timeline_scope':'runtime-session-only',
    'timeline_max_entries':8,
    'timeline_deduplicated':True,
    'timeline_new_timer':False,
    'timeline_new_storage':False,
    'timeline_new_network_owner':False,
    'aether_convergence_406026_preserved':True,
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
    data['build']='40.6.27'; data['release']=release; data['status']=status
    if 'administrator_build' in data:data['administrator_build']='40.6.27'
    if 'build_label' in data:data['build_label']='Build 40.6.27'
    if 'release_status' in data:data['release_status']=release
    if 'asset_token' in data:data['asset_token']='market-core-v2.0-alpha-build-40.6.27'
    if 'parent_build' in data:data['parent_build']='40.6.26'
    if 'timestamp' in data:data['timestamp']=now
    if 'prepared_at' in data:data['prepared_at']=now
    if 'published_at' in data:data['published_at']=now
    if 'current_version_truth' in data and isinstance(data['current_version_truth'],dict):data['current_version_truth']['loaded_build']='40.6.27'
    data['cascade_40_6_27']=cascade
    write_json(path,data)

release_path=ROOT/'RELEASE_40_6_27.md'
release_path.write_text(f'''# Agent-Crypto 40.6.27 — AETHER WATCH · EVENT TIMELINE\n\nParent: **40.6.26**  \nMarket Core: **38.15.11 — protected**  \nGenerated: **{now}**\n\n## Scope\n- Add a compact, deduplicated event timeline inside the existing AETHER · ATTENTION panel.\n- Entries are runtime-session only: no localStorage, no backend, no new network owner.\n- Capture occurs only when the existing Aether render cadence already runs.\n- Maximum: 8 events.\n- Priority: NEWS → ORACLE → MARCHÉ → ATLAS → AETHER level.\n\n## Protected\nOracle 40.6.13 + FX, Graphique, Lecture Technique, Chronos, Version Truth, Window Manager, Paper/Safety 40.6.14→40.6.19, Footer/Parker and Market Core 38.15.11.\n\n## Signature\n`Version : Parker Lewis Can't Lose` preserved verbatim.\n''',encoding='utf-8')

# --- anti-destruction hashes ---
after = {str(p): sha(p) for p in PROTECTED if p.exists()}
assert before == after, 'protected owner changed during 40.6.27 surgery'
assert "Version : Parker Lewis Can't Lose" in (ROOT/'js/footer-version-truth-406026.js').read_text(encoding='utf-8'), 'Parker signature changed'
assert "Version : Parker Lewis Can't Lose" in INDEX.read_text(encoding='utf-8'), 'Parker fallback changed'

# --- clean upload ZIP: only seven runtime/release files ---
ARCHIVE_DIR.mkdir(parents=True,exist_ok=True)
files=[INDEX,RIBBONS,AETHER,ROOT/'build.json',ROOT/'administrator-version.json',ROOT/'version.json',release_path]
with zipfile.ZipFile(ARCHIVE,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for p in files:z.write(p,arcname=str(p.relative_to(Path('public/agent_crypto_erith_ia'))))
archive_sha=sha(ARCHIVE)
SHA_FILE.write_text(f'{archive_sha}  {ARCHIVE.name}\n',encoding='utf-8')
print('40.6.27 prepared', archive_sha)
