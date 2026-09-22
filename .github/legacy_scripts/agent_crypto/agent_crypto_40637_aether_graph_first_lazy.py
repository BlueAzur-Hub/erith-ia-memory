from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import subprocess
import zipfile

ROOT = Path('public/agent_crypto_erith_ia/administrator')
CSS = ROOT / 'admin-ribbons.css'
INDEX = ROOT / 'index.html'
BUILD = ROOT / 'build.json'
ADMIN_VERSION = ROOT / 'administrator-version.json'
VERSION = ROOT / 'version.json'
AETHER_JS = ROOT / 'js/aether.js'
ASSET = ROOT / 'assets/aether/aether-observatory-background-406032.webp'
RELEASE_MD = ROOT / 'RELEASE_40_6_37.md'
ZIP = Path('coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_BUILD_40_6_37_AETHER_GRAPH_FIRST_LAZY_HYDRATION_CLEAN_UPLOAD_7_FILES.zip')
SHA = Path(str(ZIP) + '.sha256')

PARENT = '40.6.36'
BUILD_NO = '40.6.37'
ENGINE = '38.15.11'
RELEASE = 'AETHER GRAPH-FIRST LAZY HYDRATION · INTERACTION-ON-DEMAND LOCK'
STATUS = 'aether_graph_first_lazy_hydration_interaction_on_demand_406037'
ASSET_SHA = '5c4d61e9410d4a701372e2d30640d6523938dfe603f65902d493b354c5f2e7b2'
AETHER_PARENT_SHA = '2620262676958c0e4c10f6f70427f353624e35cf6ed2794bea32a33bb13cf87d'
CSS_MARKER = '/* 40.6.36 — AETHER TYPOGRAPHY CALIBRATION · PAINTED-LANE LOCK */'
JS_MARKER = '/* 40.6.37 — GRAPH-FIRST LAZY HYDRATION · INTERACTION-ON-DEMAND LOCK */'


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def require(ok, message):
    if not ok:
        raise SystemExit(message)


def replace_once(text: str, old: str, new: str, label: str) -> str:
    require(old in text, f'missing patch anchor: {label}')
    require(text.count(old) == 1, f'non-unique patch anchor: {label} ({text.count(old)})')
    return text.replace(old, new, 1)


truth = json.loads(BUILD.read_text(encoding='utf-8'))
require(truth.get('build') == PARENT, f'parent build drift: {truth.get("build")}')
require(truth.get('engine') == ENGINE, 'Market Core drift')
require(sha256(AETHER_JS) == AETHER_PARENT_SHA, f'Aether parent runtime drift: {sha256(AETHER_JS)}')
require(sha256(ASSET) == ASSET_SHA, 'exact artwork drift')
require(CSS_MARKER in CSS.read_text(encoding='utf-8'), '40.6.36 typography checkpoint missing')

js = AETHER_JS.read_text(encoding='utf-8')
require(JS_MARKER not in js, '40.6.37 already applied')

old_timeline = '''  function aetherTimelineRender406027(panel){
    const preview=panel?.querySelector('[data-aether-timeline-preview-406028]');
    const full=panel?.querySelector('[data-aether-timeline-406027]');
    if(!preview&&!full)return;
    const entries=aetherTimelineState406027.entries;
    aetherTimelineFill406028(preview,entries.slice(0,AETHER_TIMELINE_PREVIEW_406028));
    aetherTimelineFill406028(full,entries);
    const count=panel?.querySelector('[data-aether-history-count-406030]');
    if(count)count.textContent=`${entries.length}/${aetherTimelineState406027.max}`;
  }
'''
new_timeline = '''  /* 40.6.37 — GRAPH-FIRST LAZY HYDRATION · INTERACTION-ON-DEMAND LOCK */
  function aetherTimelineRender406027(panel,{includeFull=false}={}){
    const preview=panel?.querySelector('[data-aether-timeline-preview-406028]');
    const full=panel?.querySelector('[data-aether-timeline-406027]');
    if(!preview&&!full)return;
    const entries=aetherTimelineState406027.entries;
    aetherTimelineFill406028(preview,entries.slice(0,AETHER_TIMELINE_PREVIEW_406028));
    if(includeFull)aetherTimelineFill406028(full,entries);
    const count=panel?.querySelector('[data-aether-history-count-406030]');
    if(count)count.textContent=`${entries.length}/${aetherTimelineState406027.max}`;
  }
'''
js = replace_once(js, old_timeline, new_timeline, 'timeline preview-only default')

old_focus = '''    panel.querySelectorAll('[data-aether-focus-button-406030]').forEach(button=>{
      const active=button.getAttribute('data-aether-focus-button-406030')===target;
      button.setAttribute('aria-pressed',active?'true':'false');
      button.dataset.active=active?'1':'0';
    });
  }
'''
new_focus = '''    panel.querySelectorAll('[data-aether-focus-button-406030]').forEach(button=>{
      const active=button.getAttribute('data-aether-focus-button-406030')===target;
      button.setAttribute('aria-pressed',active?'true':'false');
      button.dataset.active=active?'1':'0';
    });
    // Full history and explanatory details are intentionally materialized only on operator intent.
    if(target==='history')aetherTimelineRender406027(panel,{includeFull:true});
    if(target==='details')aetherDetailsRender406037(panel);
  }
  function aetherDetailsRender406037(panel=document.getElementById('atlasAetherStatusPanel4084')){
    if(!panel)return;
    const row=(key,value)=>{const node=panel.querySelector(`[data-aether-row-4084="${key}"]`);if(node)node.textContent=value;};
    row('why',aetherOperatorWhy405012());
    row('semantic',aetherNewsMarketSemantic405013());
    row('attention',aetherAttention40133());
    row('news',aetherSnapshot4084().news);
    panel.dataset.aetherDetailsHydrated406037='1';
  }
'''
js = replace_once(js, old_focus, new_focus, 'focus lazy history/details')

old_panel_set = '''  function aetherPanelSet4084(open){const button=document.getElementById("atlasAetherStatusToggle4084");const panel=open?aetherPanelEnsure4084():document.getElementById("atlasAetherStatusPanel4084");if(panel)panel.hidden=!open;if(button)button.setAttribute("aria-expanded",open?"true":"false");if(open){aetherPanelFocus406030("glance",panel);renderAether4084();}}
'''
new_panel_set = '''  function aetherPanelSet4084(open){const button=document.getElementById("atlasAetherStatusToggle4084");const panel=open?aetherPanelEnsure4084():document.getElementById("atlasAetherStatusPanel4084");if(panel)panel.hidden=!open;if(button)button.setAttribute("aria-expanded",open?"true":"false");if(open){aetherPanelFocus406030("glance",panel);aetherCorePaint406037();if(aetherMarketDataReady406037())aetherMarkMarketReady406037("operator-open");}}
'''
js = replace_once(js, old_panel_set, new_panel_set, 'panel open uses core paint')

old_panel_render = '''    const watch406027=aetherOperatorWatch406026();aetherTimelineCapture406027(watch406027);const panel=document.getElementById("atlasAetherStatusPanel4084");if(panel&&!panel.hidden){const row=(k,v)=>{const n=panel.querySelector(`[data-aether-row-4084="${k}"]`);if(n)n.textContent=v;};row("why",aetherOperatorWhy405012());row("semantic",aetherNewsMarketSemantic405013());const watch406026=aetherOperatorWatch406026();row("level",watch406026.level);row("convergence",watch406026.convergence);row("divergence",watch406026.divergence);row("watch",watch406026.watch);row("note",watch406026.note);aetherTimelineRender406027(panel);row("attention",aetherAttention40133());row("market",aetherMarketBreadth40133());row("atlas_auto",aetherAtlasAuto40133());row("atlas",`${s.atlas} · Graphe ${s.graph}`);row("oracle",s.oracle);row("sources",`${s.sources} · Book ${s.book}`);row("system",aetherSystemBrief40133());row("weather",aetherWeatherFirstGlance406030());row("weather_risk",aetherWeatherRisk40133());row("news",s.news);}
'''
new_panel_render = '''    const watch406027=aetherOperatorWatch406026();aetherTimelineCapture406027(watch406027);const panel=document.getElementById("atlasAetherStatusPanel4084");if(panel&&!panel.hidden){const row=(k,v)=>{const n=panel.querySelector(`[data-aether-row-4084="${k}"]`);if(n)n.textContent=v;};const watch406026=aetherOperatorWatch406026();row("level",watch406026.level);row("convergence",watch406026.convergence);row("divergence",watch406026.divergence);row("watch",watch406026.watch);row("note",watch406026.note);aetherTimelineRender406027(panel,{includeFull:panel.dataset.aetherFocus406030==="history"});row("market",aetherMarketBreadth40133());row("atlas_auto",aetherAtlasAuto40133());row("atlas",`${s.atlas} · Graphe ${s.graph}`);row("oracle",s.oracle);row("sources",`${s.sources} · Book ${s.book}`);row("system",aetherSystemBrief40133());row("weather",aetherWeatherFirstGlance406030());row("weather_risk",aetherWeatherRisk40133());if(panel.dataset.aetherFocus406030==="details")aetherDetailsRender406037(panel);}
'''
js = replace_once(js, old_panel_render, new_panel_render, 'panel render skips hidden detail/full history')

old_hooks = '''  function aetherBindOracleCompletion4088(){
    if(globalThis.__AGENT_CRYPTO_AETHER_ORACLE_RENDER_HOOK_4088__===true)return true;
    try{
      if(typeof atlasRenderOracleV0!=="function")return false;
      const base=atlasRenderOracleV0;
      atlasRenderOracleV0=function atlasRenderOracleV0Aether4088(){
        const result=base.apply(this,arguments);
        queueMicrotask(()=>{try{renderAether4084();}catch(_){}});
        return result;
      };
      globalThis.__AGENT_CRYPTO_AETHER_ORACLE_RENDER_HOOK_4088__=true;
      return true;
    }catch(_){return false;}
  }

  function aetherBindMarketCompletion4086(){
    if(globalThis.__AGENT_CRYPTO_AETHER_MARKET_COMPLETION_HOOK_4086__===true)return true;
    try{
      if(typeof atlasAfterLivecheck!=="function")return false;
      const base=atlasAfterLivecheck;
      atlasAfterLivecheck=function atlasAfterLivecheckAether4086(options={}){
        const result=base.apply(this,arguments);
        queueMicrotask(()=>{try{renderAether4084();renderAetherSystem4086();}catch(_){}});
        return result;
      };
      globalThis.__AGENT_CRYPTO_AETHER_MARKET_COMPLETION_HOOK_4086__=true;
      return true;
    }catch(_){return false;}
  }


  function refreshAether({force=false}={}){
    renderAether4084();
    renderAetherVeille4087();
    void aetherWakeNewsSentinel4088();
    return aetherSystemRefresh4086({force});
  }
'''
new_hooks = '''  const aetherLazyState406037={marketReady:false,corePainted:false,networkScheduled:false,newsScheduled:false,reason:"boot"};
  function aetherMarketDataReady406037(){
    try{return typeof state!=="undefined"&&Array.isArray(state?.coins)&&state.coins.length>0;}catch(_){return false;}
  }
  function aetherIdle406037(callback){
    if(typeof window.requestIdleCallback==="function")return window.requestIdleCallback(()=>callback(),{timeout:1200});
    return window.requestAnimationFrame(()=>window.requestAnimationFrame(()=>callback()));
  }
  function aetherCorePaint406037(){
    aetherLazyState406037.corePainted=true;
    renderAether4084();
    renderAetherSystem4086();
    renderAetherVeille4087();
  }
  function aetherScheduleNews406037(){
    if(aetherLazyState406037.newsScheduled)return;
    aetherLazyState406037.newsScheduled=true;
    aetherIdle406037(()=>{void aetherWakeNewsSentinel4088();});
  }
  function aetherScheduleNetwork406037({force=false}={}){
    if(aetherLazyState406037.networkScheduled||document.hidden)return;
    aetherLazyState406037.networkScheduled=true;
    aetherIdle406037(()=>{
      aetherLazyState406037.networkScheduled=false;
      Promise.resolve(aetherSystemRefresh4086({force})).finally(()=>aetherScheduleNews406037());
    });
  }
  function aetherMarkMarketReady406037(reason="market"){
    aetherLazyState406037.marketReady=true;
    aetherLazyState406037.reason=reason;
    aetherCorePaint406037();
    aetherScheduleNetwork406037({force:false});
  }
  function aetherBindOracleCompletion4088(){
    if(globalThis.__AGENT_CRYPTO_AETHER_ORACLE_RENDER_HOOK_4088__===true)return true;
    try{
      if(typeof atlasRenderOracleV0!=="function")return false;
      const base=atlasRenderOracleV0;
      atlasRenderOracleV0=function atlasRenderOracleV0Aether4088(){
        const result=base.apply(this,arguments);
        if(aetherLazyState406037.corePainted)queueMicrotask(()=>{try{renderAether4084();}catch(_){}});
        return result;
      };
      globalThis.__AGENT_CRYPTO_AETHER_ORACLE_RENDER_HOOK_4088__=true;
      return true;
    }catch(_){return false;}
  }

  function aetherBindMarketCompletion4086(){
    if(globalThis.__AGENT_CRYPTO_AETHER_MARKET_COMPLETION_HOOK_4086__===true)return true;
    try{
      if(typeof atlasAfterLivecheck!=="function")return false;
      const base=atlasAfterLivecheck;
      atlasAfterLivecheck=function atlasAfterLivecheckAether4086(options={}){
        const result=base.apply(this,arguments);
        const settle=()=>{try{aetherMarkMarketReady406037("atlasAfterLivecheck");}catch(_){}};
        if(result&&typeof result.finally==="function")result.finally(settle);else queueMicrotask(settle);
        return result;
      };
      globalThis.__AGENT_CRYPTO_AETHER_MARKET_COMPLETION_HOOK_4086__=true;
      return true;
    }catch(_){return false;}
  }


  function refreshAether({force=false}={}){
    // Explicit/manual refresh keeps the historical public API contract; automatic boot does not call it.
    aetherCorePaint406037();
    void aetherWakeNewsSentinel4088();
    return aetherSystemRefresh4086({force});
  }
'''
js = replace_once(js, old_hooks, new_hooks, 'graph-first scheduler and hooks')

old_bind_tail = '''    aetherBindMarketCompletion4086();
    aetherBindOracleCompletion4088();
    refreshAether({force:true});
  }
'''
new_bind_tail = '''    aetherBindMarketCompletion4086();
    aetherBindOracleCompletion4088();
    // 40.6.37: do not wake Aether/Weather/News on DOMContentLoaded. Market/graph gets first useful paint.
    if(aetherMarketDataReady406037())aetherMarkMarketReady406037("state-ready");
    else window.addEventListener("load",()=>{if(aetherMarketDataReady406037())aetherMarkMarketReady406037("window-load-ready");},{once:true,passive:true});
  }
'''
js = replace_once(js, old_bind_tail, new_bind_tail, 'bind no eager refresh')

old_api = '''    aether_attention_first_glance_new_network_owner:false,
    aether_attention_timeline_max:8,
'''
new_api = '''    aether_attention_first_glance_new_network_owner:false,
    aether_attention_graph_first_lazy:true,
    aether_attention_graph_first_lazy_build:"40.6.37",
    aether_attention_boot_order:"market_graph -> aether_core -> system_weather -> news_history_on_demand",
    aether_attention_boot_eager_refresh:false,
    aether_attention_history_dom_lazy:true,
    aether_attention_details_dom_lazy:true,
    aether_attention_new_recurring_timer:false,
    aether_attention_timeline_max:8,
'''
js = replace_once(js, old_api, new_api, 'API lazy contract metadata')

AETHER_JS.write_text(js, encoding='utf-8')
new_aether_sha = sha256(AETHER_JS)
require(new_aether_sha != AETHER_PARENT_SHA, 'Aether runtime patch did not change bytes')
require(JS_MARKER in js, 'lazy marker missing after patch')

index = INDEX.read_text(encoding='utf-8')
for old, new in [
    ('content="40.6.36"', 'content="40.6.37"'),
    ('AETHER OBSERVATORY · TYPOGRAPHY CALIBRATION · PAINTED-LANE LOCK', RELEASE),
    ('market-core-v2.0-alpha-build-40.6.36', 'market-core-v2.0-alpha-build-40.6.37'),
    ('Build 40.6.36 · Administrator', 'Build 40.6.37 · Administrator'),
    ('admin-ribbons.css?v=administrator-build-40.6.36', 'admin-ribbons.css?v=administrator-build-40.6.37'),
    ('js/aether.js?v=administrator-build-40.6.32', 'js/aether.js?v=administrator-build-40.6.37'),
]:
    require(old in index, f'index token missing: {old}')
    index = index.replace(old, new)
INDEX.write_text(index, encoding='utf-8')

now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z')
for path in (BUILD, ADMIN_VERSION, VERSION):
    data = json.loads(path.read_text(encoding='utf-8'))
    require(data.get('build') == PARENT, f'{path.name}: parent build drift')
    data['build'] = BUILD_NO
    data['release'] = RELEASE
    data['status'] = STATUS
    data['parent_build'] = PARENT
    if 'asset_token' in data:
        data['asset_token'] = 'market-core-v2.0-alpha-build-40.6.37'
    if 'administrator_build' in data:
        data['administrator_build'] = BUILD_NO
    if 'build_label' in data:
        data['build_label'] = 'Build 40.6.37'
    if 'release_status' in data:
        data['release_status'] = RELEASE
    if 'timestamp' in data:
        data['timestamp'] = now
    if 'prepared_at' in data:
        data['prepared_at'] = now
    if 'published_at' in data:
        data['published_at'] = now
    if isinstance(data.get('current_version_truth'), dict):
        data['current_version_truth']['loaded_build'] = BUILD_NO
    data['cascade_40_6_37'] = {
        'parent_build': PARENT,
        'release': RELEASE,
        'status': STATUS,
        'scope': 'aether_boot_scheduling_and_hidden_view_materialization',
        'graph_first': True,
        'eager_aether_boot_refresh_removed': True,
        'system_weather_after_market_idle': True,
        'news_wake_after_core_idle': True,
        'history_dom_materialized_on_click': True,
        'details_dom_materialized_on_click': True,
        'view_default': 'glance',
        'exact_artwork_preserved': True,
        'typography_406036_preserved': True,
        'market_core_modified': False,
        'graph_runtime_modified': False,
        'oracle_runtime_modified': False,
        'window_manager_modified': False,
        'aether_runtime_modified': True,
        'aether_parent_sha256': AETHER_PARENT_SHA,
        'aether_sha256': new_aether_sha,
        'new_recurring_timer': False,
        'new_observer': False,
        'new_storage_owner': False,
        'new_network_owner': False,
        'automatic_order': False,
        'real_order': False,
    }
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

RELEASE_MD.write_text(f'''# Agent-Crypto 40.6.37 — AETHER GRAPH-FIRST LAZY HYDRATION · INTERACTION-ON-DEMAND LOCK

Parent: **{PARENT}**  
Market Core: **{ENGINE} — protected**  
Generated: **{now}**

## Why
Firefox inspection of 40.6.36 confirms the Observatory presentation is close to final, but Aether still performs an eager `refreshAether(force:true)` at DOMContentLoaded. That starts Aether synthesis, local system telemetry, weather and the existing News Sentinel wake while the market graph is still reaching its first useful paint.

## 40.6.37 contract
- The market/graph remains the first useful workload.
- Aether binds controls at DOMContentLoaded but performs no eager heavy refresh.
- Existing `atlasAfterLivecheck` becomes the graph/market completion signal; only after it settles does Aether paint its core and schedule secondary hydration during browser idle time.
- System + weather hydrate after market readiness.
- The existing News Sentinel owner is woken only after Aether core/system scheduling, never before the graph.
- Aether panel still opens immediately on explicit user intent using currently available data.
- Full History rows are materialized only when `Historique` is clicked.
- Explanatory Details are materialized only when `Détails` is clicked.
- `Vue` remains the default focus.
- The historical public `AgentCryptoAether.refresh()` API remains explicit/immediate for manual diagnostics.

## Protected
- Market Core 38.15.11 unchanged.
- Graph runtime itself unchanged: Aether only listens to the existing completion owner.
- Oracle runtime semantics unchanged.
- 40.6.36 painted-lane CSS unchanged.
- Exact Observatory artwork unchanged (SHA-256 `{ASSET_SHA}`).
- No recurring timer, MutationObserver, storage owner, new fetch owner or automatic/real order added.

## Runtime hashes
- Parent Aether: `{AETHER_PARENT_SHA}`
- 40.6.37 Aether: `{new_aether_sha}`

## Firefox acceptance
1. Ctrl+F5 and observe the Graphique/market becoming useful before Aether secondary hydration.
2. Open Aether: `Vue` must appear immediately.
3. Click `Historique`: full 8-row session timeline should materialize then, not at boot.
4. Click `Détails`: explanatory blocks should materialize then.
5. Return to `Vue`, close/reopen, and verify geometry/typography from 40.6.36 is unchanged.
''', encoding='utf-8')

require(sha256(ASSET) == ASSET_SHA, 'artwork changed')
require(CSS_MARKER in CSS.read_text(encoding='utf-8'), '40.6.36 CSS checkpoint lost')
require(JS_MARKER in AETHER_JS.read_text(encoding='utf-8'), '40.6.37 runtime marker missing')
require('refreshAether({force:true});' not in AETHER_JS.read_text(encoding='utf-8'), 'eager boot refresh still present')
require('aether_attention_graph_first_lazy_build:"40.6.37"' in AETHER_JS.read_text(encoding='utf-8'), 'lazy API contract missing')

final_index = INDEX.read_text(encoding='utf-8')
require('content="40.6.37"' in final_index, 'index build token missing')
require('admin-ribbons.css?v=administrator-build-40.6.37' in final_index, 'CSS cache token missing')
require('js/aether.js?v=administrator-build-40.6.37' in final_index, 'Aether JS cache token missing')
for path in (BUILD, ADMIN_VERSION, VERSION):
    data = json.loads(path.read_text(encoding='utf-8'))
    require(data.get('build') == BUILD_NO, f'{path.name}: build update failed')
require(json.loads(BUILD.read_text(encoding='utf-8')).get('engine') == ENGINE, 'build.json Market Core drift')

subprocess.run(['node', '--check', str(AETHER_JS)], check=True)
subprocess.run(['git', 'diff', '--check'], check=True)

ZIP.parent.mkdir(parents=True, exist_ok=True)
if ZIP.exists():
    ZIP.unlink()
files = {
    'administrator/admin-ribbons.css': CSS,
    'administrator/index.html': INDEX,
    'administrator/build.json': BUILD,
    'administrator/administrator-version.json': ADMIN_VERSION,
    'administrator/version.json': VERSION,
    'administrator/js/aether.js': AETHER_JS,
    'administrator/RELEASE_40_6_37.md': RELEASE_MD,
}
with zipfile.ZipFile(ZIP, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
    for arcname, src in files.items():
        zf.write(src, arcname)
with zipfile.ZipFile(ZIP) as zf:
    packed = [n for n in zf.namelist() if not n.endswith('/')]
    require(len(packed) == 7, f'ZIP file-count gate failed: {packed}')
    require(zf.testzip() is None, 'ZIP integrity gate failed')

zip_sha = sha256(ZIP)
SHA.write_text(f'{zip_sha}  {ZIP.name}\n', encoding='utf-8')
print(f'{BUILD_NO} prepared: {RELEASE}')
print(f'Aether parent SHA256: {AETHER_PARENT_SHA}')
print(f'Aether 40.6.37 SHA256: {new_aether_sha}')
print(f'Artwork SHA256 preserved: {sha256(ASSET)}')
print(f'ZIP SHA256: {zip_sha}')