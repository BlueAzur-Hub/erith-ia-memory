from pathlib import Path
import json, hashlib, datetime, re, zipfile

ROOT = Path('public/agent_crypto_erith_ia/administrator')
INDEX = ROOT/'index.html'
AETHER = ROOT/'js/aether.js'
RIBBONS = ROOT/'admin-ribbons.css'
ARCHIVE_DIR = Path('coordination/inter_ai_dialogues/agent_crypto')
ARCHIVE_NAME = 'AGENT_CRYPTO_BUILD_40_6_30_AETHER_FIRST_GLANCE_LARGE_TEXT_WEATHER_SINGLE_DETAIL_ZONE_CLEAN_UPLOAD_7_FILES.zip'
ARCHIVE = ARCHIVE_DIR/ARCHIVE_NAME
SHA_FILE = ARCHIVE_DIR/(ARCHIVE_NAME + '.sha256')

PROTECTED = [
    ROOT/'admin-chronos.css', ROOT/'js/version-truth.js', ROOT/'oracle-presentation-405010.css',
    ROOT/'oracle-fx-406013.css', ROOT/'js/oracle-fx-406013.js', ROOT/'js/footer-version-truth-406026.js',
    ROOT/'js/core/admin-window-manager.js', ROOT/'views/atlas.html',
    ROOT/'js/strategy-a-paper-lifecycle-404295.js', ROOT/'js/strategy-a-after-cost-metrics-404298.js', ROOT/'app.js'
]

def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def load_json(path): return json.loads(path.read_text(encoding='utf-8'))
def write_json(path, data): path.write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')

before = {str(p): sha(p) for p in PROTECTED if p.exists()}

# ---- Index/version truth ----
html = INDEX.read_text(encoding='utf-8')
assert '<meta name="administrator-build" content="40.6.29"' in html, '40.6.29 checkpoint missing'
assert "Version : Parker Lewis Can't Lose" in html, 'Parker fallback missing'
html = html.replace('<meta name="atlas-build" content="40.6.29" />','<meta name="atlas-build" content="40.6.30" />',1)
html = html.replace('<meta name="administrator-build" content="40.6.29" />','<meta name="administrator-build" content="40.6.30" />',1)
html = html.replace('<meta name="administrator-release" content="AETHER WATCH · EXPANDED STATE CONTAINMENT · TIMELINE GEOMETRY LOCK" />','<meta name="administrator-release" content="AETHER WATCH · FIRST GLANCE · LARGE TEXT · WEATHER · SINGLE DETAIL ZONE" />',1)
html = html.replace('<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.6.29" />','<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.6.30" />',1)
html = html.replace('<title>Agent-Crypto @erith.IA — Build 40.6.29 · Administrator</title>','<title>Agent-Crypto @erith.IA — Build 40.6.30 · Administrator</title>',1)
html, n = re.subn(r'(\./admin-ribbons\.css\?v=administrator-build-)[^"\']+', r'\g<1>40.6.30', html, count=1); assert n==1
html, n = re.subn(r'(\./js/aether\.js\?v=administrator-build-)[^"\']+', r'\g<1>40.6.30', html, count=1); assert n==1
INDEX.write_text(html, encoding='utf-8')

# ---- Aether presentation/runtime owner: first-glance + single secondary zone ----
js = AETHER.read_text(encoding='utf-8')
assert 'AETHER_TIMELINE_PREVIEW_406028=3' in js
assert '40.6.30' not in js

render_start = js.index('  function aetherTimelineRender406027(panel){')
panel_start = js.index('  function aetherPanelEnsure4084(){', render_start)
new_helpers = r'''  function aetherTimelineRender406027(panel){
    const preview=panel?.querySelector('[data-aether-timeline-preview-406028]');
    const full=panel?.querySelector('[data-aether-timeline-406027]');
    if(!preview&&!full)return;
    const entries=aetherTimelineState406027.entries;
    aetherTimelineFill406028(preview,entries.slice(0,AETHER_TIMELINE_PREVIEW_406028));
    aetherTimelineFill406028(full,entries);
    const count=panel?.querySelector('[data-aether-history-count-406030]');
    if(count)count.textContent=`${entries.length}/${aetherTimelineState406027.max}`;
  }
  function aetherWeatherFirstGlance406030(){
    try{
      const days=Array.isArray(aetherSystemState4086.weather?.daily)?aetherSystemState4086.weather.daily:[];
      if(!days.length)return 'Prévision 5 j indisponible';
      const compact=(value,today=false)=>{
        let text=String(value||'').replace(/\s+/g,' ').trim();
        if(today)text=text.replace(/^[^\s]+\s+\d{2}\s+/,'AUJ. ');
        else text=text.replace(/\s+·\s+raf\.\s+\d+\s+km\/h.*$/i,'').replace(/\s+·\s+pluie\s+(\d+)%/i,' · $1%');
        return text;
      };
      const first=compact(days[0]?.text,true);
      const next=days.slice(1,4).map(day=>compact(day?.text,false)).join('  ·  ');
      return next?`${first}\n${next}`:first;
    }catch(_){return 'Prévision 5 j indisponible';}
  }
  function aetherPanelFocus406030(mode,panel=document.getElementById('atlasAetherStatusPanel4084')){
    if(!panel)return;
    const target=['glance','history','details'].includes(mode)?mode:'glance';
    panel.dataset.aetherFocus406030=target;
    panel.querySelectorAll('[data-aether-focus-view-406030]').forEach(node=>{node.hidden=node.getAttribute('data-aether-focus-view-406030')!==target;});
    panel.querySelectorAll('[data-aether-focus-button-406030]').forEach(button=>{
      const active=button.getAttribute('data-aether-focus-button-406030')===target;
      button.setAttribute('aria-pressed',active?'true':'false');
      button.dataset.active=active?'1':'0';
    });
  }
'''
js = js[:render_start] + new_helpers + js[panel_start:]

# Replace only the panel markup owner.
markup_start = js.index('    panel.innerHTML=`', js.index('  function aetherPanelEnsure4084(){'))
markup_end = js.index('`;\n    document.body.appendChild(panel);', markup_start)
new_markup = r'''    panel.innerHTML=`<div class="atlas-aether-panel-head-4084"><b>♥ AETHER · ATTENTION WATCH</b><button type="button" data-aether-close-4084 aria-label="Fermer">×</button></div><div class="atlas-aether-panel-grid-4084 aether-first-glance-grid-406030"><article data-aether-wide-4084 data-aether-watch-summary-406026 data-aether-level-406030><span>Niveau d’attention</span><b data-aether-row-4084="level">—</b></article><article data-aether-third-406030><span>Convergence</span><b data-aether-row-4084="convergence">—</b></article><article data-aether-third-406030><span>Divergence</span><b data-aether-row-4084="divergence">—</b></article><article data-aether-third-406030><span>Marché</span><b data-aether-row-4084="market">—</b></article><article data-aether-wide-4084 data-aether-action-406030><span>À surveiller maintenant</span><b data-aether-row-4084="watch">—</b><small data-aether-row-4084="note">—</small></article><section data-aether-wide-4084 data-aether-focus-shell-406030><div class="aether-focus-toolbar-406030"><b>VUE AETHER</b><div><button type="button" data-aether-focus-button-406030="glance" aria-pressed="true">Vue</button><button type="button" data-aether-focus-button-406030="history" aria-pressed="false">Historique <span data-aether-history-count-406030>0/8</span></button><button type="button" data-aether-focus-button-406030="details" aria-pressed="false">Détails</button></div></div><div class="aether-focus-viewport-406030"><div data-aether-focus-view-406030="glance"><article data-aether-timeline-card-406027><span>Événements récents</span><div data-aether-timeline-preview-406028 aria-live="polite"></div></article><article data-aether-weather-406030><span>☁ Météo 5 j · Maintenon</span><b data-aether-row-4084="weather">—</b><small data-aether-row-4084="weather_risk">—</small></article></div><div data-aether-focus-view-406030="history" hidden><div class="aether-focus-view-head-406030">Historique de session · 8 événements maximum</div><div data-aether-timeline-406027 aria-live="polite"></div></div><div data-aether-focus-view-406030="details" hidden><div class="aether-details-grid-406030"><article><span>Pourquoi Aether attire ton attention ?</span><b data-aether-row-4084="why">—</b></article><article><span>Lecture News → Marché</span><b data-aether-row-4084="semantic">—</b></article><article><span>Attention</span><b data-aether-row-4084="attention">—</b></article><article><span>Dernière veille</span><b data-aether-row-4084="news">—</b></article></div></div></div></section><section data-aether-wide-4084 data-aether-status-grid-406030><article><span>Atlas</span><b data-aether-row-4084="atlas">—</b><small data-aether-row-4084="atlas_auto">—</small></article><article><span>Oracle</span><b data-aether-row-4084="oracle">—</b></article><article><span>Sources</span><b data-aether-row-4084="sources">—</b></article><article><span>Système</span><b data-aether-row-4084="system">—</b></article></section></div>`'''
js = js[:markup_start] + new_markup + js[markup_end:]

old_append = '    document.body.appendChild(panel);panel.querySelector("[data-aether-close-4084]")?.addEventListener("click",()=>aetherPanelSet4084(false));return panel;'
new_append = '''    document.body.appendChild(panel);\n    panel.querySelector("[data-aether-close-4084]")?.addEventListener("click",()=>aetherPanelSet4084(false));\n    panel.querySelectorAll("[data-aether-focus-button-406030]").forEach(button=>button.addEventListener("click",()=>aetherPanelFocus406030(button.getAttribute("data-aether-focus-button-406030"),panel)));\n    aetherPanelFocus406030("glance",panel);\n    return panel;'''
assert old_append in js, 'panel append/bind owner missing'
js = js.replace(old_append,new_append,1)

old_set = '  function aetherPanelSet4084(open){const button=document.getElementById("atlasAetherStatusToggle4084");const panel=open?aetherPanelEnsure4084():document.getElementById("atlasAetherStatusPanel4084");if(panel)panel.hidden=!open;if(button)button.setAttribute("aria-expanded",open?"true":"false");if(open)renderAether4084();}'
new_set = '  function aetherPanelSet4084(open){const button=document.getElementById("atlasAetherStatusToggle4084");const panel=open?aetherPanelEnsure4084():document.getElementById("atlasAetherStatusPanel4084");if(panel)panel.hidden=!open;if(button)button.setAttribute("aria-expanded",open?"true":"false");if(open){aetherPanelFocus406030("glance",panel);renderAether4084();}}'
assert old_set in js, 'panel set owner missing'
js = js.replace(old_set,new_set,1)

assert 'row("weather",aetherWeatherOutlook40133());' in js
js = js.replace('row("weather",aetherWeatherOutlook40133());','row("weather",aetherWeatherFirstGlance406030());',1)

api_marker = '    aether_attention_compact_new_network_owner:false,\n'
api_add = '''    aether_attention_first_glance:true,\n    aether_attention_first_glance_build:"40.6.30",\n    aether_attention_large_text:true,\n    aether_attention_weather_first_glance:true,\n    aether_attention_single_detail_zone:true,\n    aether_attention_focus_modes:"glance|history|details",\n    aether_attention_panel_resets_to_glance_on_open:true,\n    aether_attention_first_glance_new_timer:false,\n    aether_attention_first_glance_new_storage:false,\n    aether_attention_first_glance_new_network_owner:false,\n'''
assert api_marker in js
js = js.replace(api_marker,api_marker+api_add,1)
AETHER.write_text(js,encoding='utf-8')

# ---- CSS: one fixed first-glance viewport; history/details replace it instead of stacking ----
css = RIBBONS.read_text(encoding='utf-8')
assert '40.6.29 — AETHER WATCH · EXPANDED STATE CONTAINMENT' in css
assert '40.6.30 — AETHER WATCH · FIRST GLANCE' not in css
css += r'''

/* 40.6.30 — AETHER WATCH · FIRST GLANCE · LARGE TEXT · WEATHER · SINGLE DETAIL ZONE
   One readable dashboard at rest. History and Details replace the same bounded focus viewport.
   Desktop panel itself does not scroll; only the active secondary view may own internal scroll. */
#atlasAetherStatusPanel4084{
  width:min(840px,calc(100vw - 34px))!important;
  max-height:calc(100vh - 30px)!important;
  overflow:hidden!important;
}
#atlasAetherStatusPanel4084 .atlas-aether-panel-head-4084 b{font-size:16px!important;letter-spacing:.08em!important}
#atlasAetherStatusPanel4084 .aether-first-glance-grid-406030{grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:8px!important}
#atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article{grid-column:span 2!important;padding:9px 10px!important}
#atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article[data-aether-wide-4084],
#atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > section[data-aether-wide-4084]{grid-column:1/-1!important}
#atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article > span,
#atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article > span,
#atlasAetherStatusPanel4084 [data-aether-weather-406030] > span,
#atlasAetherStatusPanel4084 [data-aether-timeline-card-406027] > span{
  font-size:11.5px!important;line-height:1.2!important;letter-spacing:.045em!important
}
#atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article > b,
#atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article > b{
  font-size:13.5px!important;line-height:1.28!important
}
#atlasAetherStatusPanel4084 [data-aether-level-406030] [data-aether-row-4084="level"]{font-size:15px!important;line-height:1.3!important}
#atlasAetherStatusPanel4084 [data-aether-action-406030]{display:grid!important;grid-template-columns:150px minmax(0,1fr)!important;column-gap:10px!important;row-gap:4px!important;align-items:start!important}
#atlasAetherStatusPanel4084 [data-aether-action-406030] > span{grid-row:1/3!important}
#atlasAetherStatusPanel4084 [data-aether-action-406030] > b{font-size:13.5px!important;color:#f5df91!important}
#atlasAetherStatusPanel4084 [data-aether-action-406030] > small{font-size:12.5px!important;line-height:1.3!important;color:#f1c6e4!important;font-weight:700!important}
#atlasAetherStatusPanel4084 [data-aether-focus-shell-406030]{min-width:0!important;border:1px solid rgba(125,155,210,.18);border-radius:10px;background:rgba(3,12,24,.18);overflow:hidden!important}
#atlasAetherStatusPanel4084 .aether-focus-toolbar-406030{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:7px 9px;border-bottom:1px solid rgba(125,155,210,.16)}
#atlasAetherStatusPanel4084 .aether-focus-toolbar-406030 > b{font-size:11.5px!important;color:#a9dfff!important;letter-spacing:.06em!important}
#atlasAetherStatusPanel4084 .aether-focus-toolbar-406030 > div{display:flex;gap:6px;flex-wrap:wrap}
#atlasAetherStatusPanel4084 [data-aether-focus-button-406030]{appearance:none;border:1px solid rgba(125,155,210,.28);border-radius:8px;background:rgba(7,23,34,.72);color:#d9e8f5;padding:6px 10px;font-size:12px;font-weight:800;cursor:pointer}
#atlasAetherStatusPanel4084 [data-aether-focus-button-406030][data-active="1"]{border-color:rgba(127,240,223,.65);background:rgba(25,96,101,.36);color:#bffff2}
#atlasAetherStatusPanel4084 .aether-focus-viewport-406030{height:246px;min-height:246px;max-height:246px;padding:8px;box-sizing:border-box;overflow:hidden!important}
#atlasAetherStatusPanel4084 [data-aether-focus-view-406030][hidden]{display:none!important}
#atlasAetherStatusPanel4084 [data-aether-focus-view-406030="glance"]{display:grid;grid-template-columns:minmax(0,1.62fr) minmax(270px,.88fr);gap:8px;height:100%;min-height:0}
#atlasAetherStatusPanel4084 [data-aether-focus-view-406030="glance"] > article{min-width:0;min-height:0;margin:0!important;padding:8px 9px!important;border:1px solid rgba(125,155,210,.16);border-radius:9px;background:rgba(3,12,24,.24)}
#atlasAetherStatusPanel4084 [data-aether-timeline-preview-406028]{display:grid!important;gap:6px!important;margin-top:6px!important}
#atlasAetherStatusPanel4084 .aether-timeline-row-406027{grid-template-columns:58px 64px 68px minmax(0,1fr)!important;gap:7px!important;padding:6px 8px!important;font-size:12.5px!important;line-height:1.28!important}
#atlasAetherStatusPanel4084 .aether-timeline-time-406027{font-size:11.5px!important}
#atlasAetherStatusPanel4084 .aether-timeline-type-406027,
#atlasAetherStatusPanel4084 .aether-timeline-level-406027{font-size:12px!important}
#atlasAetherStatusPanel4084 .aether-timeline-detail-406027{font-size:12.5px!important;line-height:1.28!important}
#atlasAetherStatusPanel4084 [data-aether-weather-406030]{display:flex!important;flex-direction:column!important;gap:8px!important}
#atlasAetherStatusPanel4084 [data-aether-weather-406030] > b{white-space:pre-line!important;font-size:13.5px!important;line-height:1.5!important;color:#eef7ff!important}
#atlasAetherStatusPanel4084 [data-aether-weather-406030] > small{font-size:12.5px!important;line-height:1.42!important;color:#bfe9ff!important;font-weight:700!important}
#atlasAetherStatusPanel4084 [data-aether-focus-view-406030="history"],
#atlasAetherStatusPanel4084 [data-aether-focus-view-406030="details"]{height:100%;min-height:0;overflow:hidden!important}
#atlasAetherStatusPanel4084 .aether-focus-view-head-406030{font-size:11.5px;font-weight:800;color:#a9dfff;letter-spacing:.04em;margin:0 0 6px}
#atlasAetherStatusPanel4084 [data-aether-focus-view-406030="history"] [data-aether-timeline-406027]{height:calc(100% - 24px);max-height:none!important;overflow-y:auto!important;overflow-x:hidden!important;scrollbar-gutter:stable!important;padding-right:4px}
#atlasAetherStatusPanel4084 .aether-details-grid-406030{height:100%;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;overflow-y:auto!important;overflow-x:hidden!important;scrollbar-gutter:stable!important;padding-right:4px;box-sizing:border-box}
#atlasAetherStatusPanel4084 .aether-details-grid-406030 article{min-width:0;margin:0!important;padding:8px 9px!important;border:1px solid rgba(125,155,210,.16);border-radius:8px;background:rgba(3,12,24,.22)}
#atlasAetherStatusPanel4084 .aether-details-grid-406030 article > span{font-size:11.5px!important;line-height:1.2!important}
#atlasAetherStatusPanel4084 .aether-details-grid-406030 article > b{font-size:13px!important;line-height:1.35!important}
#atlasAetherStatusPanel4084 [data-aether-status-grid-406030]{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;min-width:0}
#atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article{min-width:0;margin:0!important;padding:8px 9px!important;border:1px solid rgba(125,155,210,.16);border-radius:8px;background:rgba(3,12,24,.2)}
#atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article > small{display:block;margin-top:4px;font-size:11.5px!important;line-height:1.25!important;color:#8dffd0!important;font-weight:700!important}
@media(max-width:980px){
  #atlasAetherStatusPanel4084{width:min(760px,calc(100vw - 24px))!important}
  #atlasAetherStatusPanel4084 [data-aether-focus-view-406030="glance"]{grid-template-columns:minmax(0,1fr)!important;overflow-y:auto!important}
  #atlasAetherStatusPanel4084 .aether-focus-viewport-406030{height:300px;min-height:300px;max-height:300px}
  #atlasAetherStatusPanel4084 [data-aether-status-grid-406030]{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media(max-height:760px){#atlasAetherStatusPanel4084{overflow-y:auto!important;max-height:calc(100vh - 20px)!important}}
'''
RIBBONS.write_text(css,encoding='utf-8')

# ---- manifests ----
now = datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z')
release = 'AETHER WATCH · FIRST GLANCE · LARGE TEXT · WEATHER · SINGLE DETAIL ZONE'
status = 'aether_watch_first_glance_large_text_weather_single_detail_zone_406030'
cascade = {
  'parent_build':'40.6.29','release':release,'status':status,
  'first_glance':True,'large_text':True,'weather_first_glance':True,'single_detail_zone':True,
  'focus_modes':['glance','history','details'],'panel_scroll_resting_state':False,
  'history_internal_scroll_only':True,'details_internal_scroll_only':True,
  'timeline_runtime_session_preserved':True,'timeline_max_entries':8,'timeline_preview_entries':3,
  'market_core_modified':False,'oracle_modified':False,'graph_modified':False,'technical_reading_modified':False,
  'chronos_modified':False,'version_truth_modified':False,'window_manager_modified':False,'paper_safety_modified':False,
  'new_timer':False,'new_storage':False,'new_network_owner':False,'automatic_order':False,'real_order':False
}
for name in ['build.json','administrator-version.json','version.json']:
    path=ROOT/name; data=load_json(path)
    assert str(data.get('build'))=='40.6.29', f'{name}: expected 40.6.29 parent checkpoint'
    data['build']='40.6.30'; data['release']=release; data['status']=status
    if 'administrator_build' in data:data['administrator_build']='40.6.30'
    if 'build_label' in data:data['build_label']='Build 40.6.30'
    if 'release_status' in data:data['release_status']=release
    if 'asset_token' in data:data['asset_token']='market-core-v2.0-alpha-build-40.6.30'
    if 'parent_build' in data:data['parent_build']='40.6.29'
    if 'timestamp' in data:data['timestamp']=now
    if 'prepared_at' in data:data['prepared_at']=now
    if 'published_at' in data:data['published_at']=now
    if 'current_version_truth' in data and isinstance(data['current_version_truth'],dict):data['current_version_truth']['loaded_build']='40.6.30'
    data['cascade_40_6_30']=cascade
    write_json(path,data)

release_path=ROOT/'RELEASE_40_6_30.md'
release_path.write_text(f'''# Agent-Crypto 40.6.30 — AETHER WATCH · FIRST GLANCE\n\nParent: **40.6.29**  \nMarket Core: **38.15.11 — protected**  \nGenerated: **{now}**\n\n## Destination\nMake Aether readable at first glance: larger typography, weather kept in the primary view, three recent events, and one bounded secondary viewport shared by History and Details.\n\n## Scope\n- Larger operator text throughout Aether Watch.\n- First-glance weather card stays visible without opening Details.\n- Default view: attention, convergence, divergence, market breadth, current watch instruction, Aether note, three events, weather, Atlas, Oracle, Sources and System.\n- History and Details no longer stack under the panel. They replace the same fixed-height focus viewport.\n- Only the active History or Details view may own internal scrolling.\n- Opening Aether always returns to the first-glance view.\n- Runtime-session timeline remains capped at 8 events.\n- No new timer, storage, fetch or network owner.\n\n## Protected\nOracle 40.6.13 + FX, Graphique, Lecture Technique, Chronos, Version Truth, Window Manager, Paper/Safety, Footer/Parker and Market Core 38.15.11.\n\n## Signature\n`Version : Parker Lewis Can't Lose` preserved verbatim.\n''',encoding='utf-8')

# ---- gates ----
after = {str(p): sha(p) for p in PROTECTED if p.exists()}
assert before == after, 'protected owner changed during 40.6.30 surgery'
assert "Version : Parker Lewis Can't Lose" in (ROOT/'js/footer-version-truth-406026.js').read_text(encoding='utf-8')
assert "Version : Parker Lewis Can't Lose" in INDEX.read_text(encoding='utf-8')
newjs=AETHER.read_text(encoding='utf-8')
assert 'aetherPanelFocus406030' in newjs and 'aetherWeatherFirstGlance406030' in newjs
assert 'data-aether-focus-view-406030="glance"' in newjs and 'data-aether-focus-view-406030="history"' in newjs and 'data-aether-focus-view-406030="details"' in newjs
assert 'aether_attention_first_glance_build:"40.6.30"' in newjs

# ---- clean upload ZIP ----
ARCHIVE_DIR.mkdir(parents=True,exist_ok=True)
files=[INDEX,RIBBONS,AETHER,ROOT/'build.json',ROOT/'administrator-version.json',ROOT/'version.json',release_path]
with zipfile.ZipFile(ARCHIVE,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for p in files:z.write(p,arcname=str(p.relative_to(Path('public/agent_crypto_erith_ia'))))
archive_sha=sha(ARCHIVE)
SHA_FILE.write_text(f'{archive_sha}  {ARCHIVE.name}\n',encoding='utf-8')
print('40.6.30 prepared', archive_sha)
