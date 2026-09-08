from pathlib import Path
import json, hashlib, datetime, re, zipfile

ROOT = Path('public/agent_crypto_erith_ia/administrator')
INDEX = ROOT/'index.html'
CSS = ROOT/'admin-ribbons.css'
AETHER = ROOT/'js/aether.js'
ASSET = ROOT/'assets/aether/aether-observatory-radial-406031.svg'
ARCHIVE_DIR = Path('coordination/inter_ai_dialogues/agent_crypto')
ARCHIVE_NAME = 'AGENT_CRYPTO_BUILD_40_6_31_AETHER_CENTRAL_OBSERVATORY_LIVE_RADIAL_UI_CLEAN_UPLOAD_7_FILES.zip'
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

# --- version truth / cache token ---
html=INDEX.read_text(encoding='utf-8')
assert '<meta name="administrator-build" content="40.6.30"' in html
assert "Version : Parker Lewis Can't Lose" in html
html=html.replace('<meta name="atlas-build" content="40.6.30" />','<meta name="atlas-build" content="40.6.31" />',1)
html=html.replace('<meta name="administrator-build" content="40.6.30" />','<meta name="administrator-build" content="40.6.31" />',1)
html=html.replace('<meta name="administrator-release" content="AETHER WATCH · FIRST GLANCE · LARGE TEXT · WEATHER · SINGLE DETAIL ZONE" />','<meta name="administrator-release" content="AETHER CENTRAL OBSERVATORY · BACKGROUND LAYER · LIVE RADIAL UI" />',1)
html=html.replace('<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.6.30" />','<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.6.31" />',1)
html=html.replace('<title>Agent-Crypto @erith.IA — Build 40.6.30 · Administrator</title>','<title>Agent-Crypto @erith.IA — Build 40.6.31 · Administrator</title>',1)
html,n=re.subn(r'(\./admin-ribbons\.css\?v=administrator-build-)[^"\']+',r'\g<1>40.6.31',html,count=1); assert n==1
html,n=re.subn(r'(\./js/aether\.js\?v=administrator-build-)[^"\']+',r'\g<1>40.6.31',html,count=1); assert n==1
INDEX.write_text(html,encoding='utf-8')

# --- code-native background layer: no baked labels/data ---
ASSET.parent.mkdir(parents=True,exist_ok=True)
ASSET.write_text(r'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
<defs>
 <radialGradient id="space" cx="50%" cy="54%" r="72%"><stop offset="0" stop-color="#082143"/><stop offset=".42" stop-color="#04152c"/><stop offset="1" stop-color="#010711"/></radialGradient>
 <radialGradient id="hub" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#102c62" stop-opacity=".48"/><stop offset=".65" stop-color="#05152f" stop-opacity=".22"/><stop offset="1" stop-color="#020914" stop-opacity="0"/></radialGradient>
 <linearGradient id="cyan" x1="0" x2="1"><stop stop-color="#39e6ff"/><stop offset=".5" stop-color="#6e8cff"/><stop offset="1" stop-color="#c16cff"/></linearGradient>
 <filter id="glow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
 <pattern id="stars" width="78" height="64" patternUnits="userSpaceOnUse"><circle cx="8" cy="14" r="1" fill="#6bdfff" opacity=".52"/><circle cx="51" cy="37" r=".8" fill="#fff4c4" opacity=".4"/><circle cx="72" cy="9" r=".7" fill="#8c8cff" opacity=".45"/></pattern>
</defs>
<rect width="1600" height="900" fill="url(#space)"/><rect width="1600" height="900" fill="url(#stars)" opacity=".48"/>
<g opacity=".42" fill="none" stroke="#21cfff" stroke-width="1"><path d="M0 175 Q400 20 800 175 T1600 175"/><path d="M0 760 Q400 900 800 760 T1600 760"/><path d="M120 90 Q800 480 1480 90"/><path d="M120 830 Q800 430 1480 830"/></g>
<g opacity=".36" fill="none" stroke="#d7a94a" stroke-width="1.4"><path d="M0 290 Q250 150 520 420"/><path d="M0 590 Q280 760 560 510"/><path d="M1600 290 Q1350 150 1080 420"/><path d="M1600 590 Q1320 760 1040 510"/></g>
<!-- side globes -->
<g opacity=".43" fill="none" stroke="#2aaeff"><circle cx="-25" cy="480" r="260" stroke-width="3"/><ellipse cx="-25" cy="480" rx="108" ry="260"/><ellipse cx="-25" cy="480" rx="220" ry="260"/><path d="M-280 430 H230M-270 520H230M-230 350H185M-210 610H175"/></g>
<g opacity=".43" fill="none" stroke="#2aaeff"><circle cx="1625" cy="480" r="260" stroke-width="3"/><ellipse cx="1625" cy="480" rx="108" ry="260"/><ellipse cx="1625" cy="480" rx="220" ry="260"/><path d="M1370 430 H1880M1370 520H1870M1415 350H1830M1425 610H1810"/></g>
<g opacity=".42" fill="#ffc968"><circle cx="94" cy="352" r="3"/><circle cx="148" cy="420" r="2"/><circle cx="89" cy="570" r="2.5"/><circle cx="1508" cy="355" r="3"/><circle cx="1450" cy="425" r="2"/><circle cx="1510" cy="568" r="2.5"/></g>
<!-- central observatory -->
<circle cx="800" cy="485" r="310" fill="url(#hub)"/>
<g fill="none" filter="url(#glow)"><circle cx="800" cy="485" r="250" stroke="#31dfff" stroke-width="2.5" opacity=".66"/><circle cx="800" cy="485" r="225" stroke="#5b75ff" stroke-width="2" opacity=".72"/><circle cx="800" cy="485" r="195" stroke="#c78bff" stroke-width="1" opacity=".35"/><circle cx="800" cy="485" r="275" stroke="#d9a94b" stroke-width="1" opacity=".28"/></g>
<g fill="#ffd06a" filter="url(#glow)"><circle cx="800" cy="210" r="5"/><circle cx="800" cy="760" r="5"/><circle cx="525" cy="485" r="5"/><circle cx="1075" cy="485" r="5"/><circle cx="606" cy="291" r="4"/><circle cx="994" cy="291" r="4"/><circle cx="606" cy="679" r="4"/><circle cx="994" cy="679" r="4"/></g>
<g opacity=".44" stroke="url(#cyan)" fill="none"><path d="M800 210V95"/><path d="M525 485H350"/><path d="M1075 485H1250"/><path d="M606 291L470 175"/><path d="M994 291L1130 175"/><path d="M606 679L510 805"/><path d="M994 679L1090 805"/></g>
<!-- clean dark masks behind live cards -->
<g fill="#020b18" opacity=".26"><rect x="145" y="115" width="360" height="150" rx="28"/><rect x="110" y="305" width="355" height="150" rx="28"/><rect x="125" y="500" width="355" height="160" rx="28"/><rect x="1095" y="115" width="360" height="150" rx="28"/><rect x="1135" y="305" width="355" height="165" rx="28"/><rect x="1110" y="505" width="365" height="160" rx="28"/></g>
</svg>''',encoding='utf-8')

# --- CSS-only radial remap of the existing LIVE 40.6.30 DOM ---
css=CSS.read_text(encoding='utf-8')
assert '40.6.30 — AETHER WATCH · FIRST GLANCE' in css
assert '40.6.31 — AETHER CENTRAL OBSERVATORY' not in css
css += r'''

/* 40.6.31 — AETHER CENTRAL OBSERVATORY · BACKGROUND LAYER · LIVE RADIAL UI
   Presentation-only remap. Existing Aether DOM/runtime remains the live data owner. */
#atlasAetherStatusPanel4084{
  position:fixed!important;left:10px!important;right:10px!important;top:202px!important;bottom:10px!important;
  width:auto!important;height:auto!important;max-height:none!important;overflow:hidden!important;
  padding:0!important;border:1px solid rgba(92,208,255,.28)!important;border-radius:16px!important;
  background:#020914!important;box-shadow:0 24px 80px rgba(0,0,0,.52)!important;isolation:isolate!important;
}
#atlasAetherStatusPanel4084::before{content:"";position:absolute;inset:0;z-index:-3;background:url('./assets/aether/aether-observatory-radial-406031.svg') center 58%/cover no-repeat;opacity:.9}
#atlasAetherStatusPanel4084::after{content:"";position:absolute;inset:0;z-index:-2;pointer-events:none;background:radial-gradient(circle at 50% 54%,rgba(1,8,20,.08) 0 28%,rgba(1,8,20,.26) 55%,rgba(1,8,20,.48) 100%),linear-gradient(180deg,rgba(2,9,20,.15),rgba(2,9,20,.34))}
#atlasAetherStatusPanel4084 .atlas-aether-panel-head-4084{position:absolute!important;left:22px;right:22px;top:14px;z-index:8;background:transparent!important;border:0!important;padding:0!important;pointer-events:none}
#atlasAetherStatusPanel4084 .atlas-aether-panel-head-4084 b{font-size:15px!important;letter-spacing:.12em!important;color:#d8ddff!important;text-shadow:0 0 14px rgba(119,164,255,.65)}
#atlasAetherStatusPanel4084 [data-aether-close-4084]{pointer-events:auto!important;position:absolute!important;right:0!important;top:-3px!important;width:30px!important;height:30px!important;border-radius:50%!important;background:rgba(2,12,25,.72)!important;border:1px solid rgba(91,210,255,.35)!important}
#atlasAetherStatusPanel4084 .aether-first-glance-grid-406030{position:absolute!important;inset:0!important;display:block!important;margin:0!important;padding:0!important}
#atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article,
#atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article,
#atlasAetherStatusPanel4084 [data-aether-focus-view-406030="glance"] > article{position:absolute!important;margin:0!important;box-sizing:border-box!important;border:1px solid rgba(69,202,255,.34)!important;border-radius:18px!important;background:linear-gradient(145deg,rgba(4,20,38,.90),rgba(2,12,26,.78))!important;box-shadow:0 10px 28px rgba(0,0,0,.28),inset 0 0 28px rgba(29,139,220,.05)!important;backdrop-filter:blur(5px)!important;padding:10px 13px!important;overflow:hidden!important}
#atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 article > span,
#atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article > span{display:block!important;margin:0 0 5px!important;font-size:10.5px!important;line-height:1.15!important;letter-spacing:.08em!important;color:#63ddff!important;text-transform:uppercase!important;font-weight:800!important}
#atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 article > b,
#atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article > b{font-size:12.5px!important;line-height:1.28!important;color:#f1f7ff!important}
/* central hub */
#atlasAetherStatusPanel4084 [data-aether-level-406030]{left:50%!important;top:39%!important;transform:translate(-50%,-50%)!important;width:330px!important;height:188px!important;z-index:5!important;text-align:center!important;border:0!important;background:radial-gradient(circle,rgba(4,18,42,.82),rgba(2,10,24,.54) 72%,transparent)!important;box-shadow:none!important;padding:38px 18px 8px!important}
#atlasAetherStatusPanel4084 [data-aether-level-406030]::before{content:"AETHER\A ATTENTION WATCH";white-space:pre;display:block;margin-bottom:9px;font-family:Georgia,serif;font-size:21px;line-height:1.03;letter-spacing:.08em;color:#dce8ff;text-shadow:0 0 15px rgba(80,177,255,.75)}
#atlasAetherStatusPanel4084 [data-aether-level-406030] > span{font-size:9.5px!important;color:#f4cc69!important}
#atlasAetherStatusPanel4084 [data-aether-level-406030] [data-aether-row-4084="level"]{font-size:17px!important;line-height:1.15!important;color:#ffd875!important}
#atlasAetherStatusPanel4084 [data-aether-action-406030]{left:50%!important;top:58%!important;transform:translate(-50%,-50%)!important;width:330px!important;height:116px!important;z-index:5!important;text-align:center!important;border:0!important;background:rgba(2,10,24,.45)!important;box-shadow:none!important;padding:9px 14px!important;display:block!important}
#atlasAetherStatusPanel4084 [data-aether-action-406030] > span{font-size:9.5px!important;color:#f4cc69!important}
#atlasAetherStatusPanel4084 [data-aether-action-406030] > b{display:block!important;font-size:11.5px!important;line-height:1.25!important;color:#8deeff!important;max-height:44px;overflow:hidden}
#atlasAetherStatusPanel4084 [data-aether-action-406030] > small{display:block!important;margin-top:4px;font-size:10.5px!important;line-height:1.2!important;color:#ffc4e5!important;max-height:30px;overflow:hidden}
/* top orbit */
#atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article:has([data-aether-row-4084="convergence"]){left:50%!important;top:8%!important;transform:translateX(-50%)!important;width:330px!important;height:104px!important}
#atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article:has([data-aether-row-4084="divergence"]){right:8%!important;top:15%!important;width:300px!important;height:118px!important}
#atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article:has([data-aether-row-4084="market"]){right:5.5%!important;top:36%!important;width:320px!important;height:132px!important}
/* status grid flattened into orbit */
#atlasAetherStatusPanel4084 [data-aether-status-grid-406030]{display:contents!important}
#atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article:has([data-aether-row-4084="system"]){left:8%!important;top:15%!important;width:300px!important;height:112px!important}
#atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article:has([data-aether-row-4084="sources"]){left:5.5%!important;top:36%!important;width:300px!important;height:120px!important}
#atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article:has([data-aether-row-4084="atlas"]){left:7%!important;top:58%!important;width:300px!important;height:126px!important}
#atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article:has([data-aether-row-4084="oracle"]){left:26%!important;bottom:3%!important;width:300px!important;height:92px!important}
#atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article > small{display:block!important;margin-top:4px;font-size:9.5px!important;line-height:1.2!important;color:#76f0ce!important}
/* focus shell is transparent plumbing in default radial view */
#atlasAetherStatusPanel4084 [data-aether-focus-shell-406030]{position:static!important;border:0!important;background:transparent!important;overflow:visible!important}
#atlasAetherStatusPanel4084 .aether-focus-toolbar-406030{position:absolute!important;right:18px!important;bottom:12px!important;z-index:9!important;border:0!important;background:rgba(2,12,25,.64)!important;border-radius:10px!important;padding:4px!important}
#atlasAetherStatusPanel4084 .aether-focus-toolbar-406030 > b{display:none!important}
#atlasAetherStatusPanel4084 [data-aether-focus-button-406030]{font-size:10px!important;padding:5px 8px!important}
#atlasAetherStatusPanel4084 .aether-focus-viewport-406030{position:static!important;width:auto!important;height:auto!important;min-height:0!important;max-height:none!important;padding:0!important;overflow:visible!important}
#atlasAetherStatusPanel4084 [data-aether-focus-view-406030="glance"]{display:contents!important}
#atlasAetherStatusPanel4084 [data-aether-timeline-card-406027]{right:7%!important;top:58%!important;width:315px!important;height:126px!important}
#atlasAetherStatusPanel4084 [data-aether-weather-406030]{right:27%!important;bottom:3%!important;width:300px!important;height:92px!important;display:block!important}
#atlasAetherStatusPanel4084 [data-aether-weather-406030] > b{white-space:pre-line!important;font-size:11px!important;line-height:1.28!important}
#atlasAetherStatusPanel4084 [data-aether-weather-406030] > small{font-size:9.5px!important;line-height:1.2!important;color:#b8eaff!important}
#atlasAetherStatusPanel4084 [data-aether-timeline-preview-406028]{display:grid!important;gap:3px!important;margin-top:3px!important}
#atlasAetherStatusPanel4084 .aether-timeline-row-406027{grid-template-columns:48px 47px 50px minmax(0,1fr)!important;gap:4px!important;padding:3px 4px!important;font-size:9.5px!important;line-height:1.12!important;background:rgba(1,9,20,.3)!important}
#atlasAetherStatusPanel4084 .aether-timeline-detail-406027{white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;font-size:9.5px!important}
/* History/Details reuse one bounded central overlay; never stack */
#atlasAetherStatusPanel4084 [data-aether-focus-view-406030="history"],
#atlasAetherStatusPanel4084 [data-aether-focus-view-406030="details"]{position:absolute!important;left:50%!important;top:50%!important;transform:translate(-50%,-50%)!important;width:min(680px,54vw)!important;height:300px!important;z-index:12!important;padding:12px!important;border:1px solid rgba(81,210,255,.42)!important;border-radius:16px!important;background:rgba(2,12,27,.95)!important;box-shadow:0 18px 55px rgba(0,0,0,.55)!important;overflow:hidden!important}
#atlasAetherStatusPanel4084 [data-aether-focus-view-406030="history"] [data-aether-timeline-406027],
#atlasAetherStatusPanel4084 .aether-details-grid-406030{height:calc(100% - 25px)!important;overflow-y:auto!important;scrollbar-gutter:stable!important}
#atlasAetherStatusPanel4084 .aether-details-grid-406030{grid-template-columns:repeat(2,minmax(0,1fr))!important}
#atlasAetherStatusPanel4084 .aether-details-grid-406030 article{position:static!important;padding:8px!important}
/* compact fallback: radial becomes scroll-safe cards */
@media(max-width:1180px),(max-height:720px){
 #atlasAetherStatusPanel4084{top:165px!important;overflow-y:auto!important}
 #atlasAetherStatusPanel4084::before{background-position:center 58%!important;opacity:.62!important}
 #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030{position:relative!important;inset:auto!important;display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;padding:52px 10px 12px!important}
 #atlasAetherStatusPanel4084 .aether-first-glance-grid-406030 > article,
 #atlasAetherStatusPanel4084 [data-aether-status-grid-406030] article,
 #atlasAetherStatusPanel4084 [data-aether-focus-view-406030="glance"] > article{position:static!important;transform:none!important;width:auto!important;height:auto!important;min-height:82px!important}
 #atlasAetherStatusPanel4084 [data-aether-level-406030],#atlasAetherStatusPanel4084 [data-aether-action-406030]{grid-column:1/-1!important}
 #atlasAetherStatusPanel4084 [data-aether-level-406030]{padding-top:14px!important;text-align:left!important}
 #atlasAetherStatusPanel4084 [data-aether-level-406030]::before{font-size:16px!important}
 #atlasAetherStatusPanel4084 [data-aether-status-grid-406030]{display:contents!important}
 #atlasAetherStatusPanel4084 [data-aether-focus-shell-406030]{display:contents!important}
 #atlasAetherStatusPanel4084 [data-aether-focus-view-406030="glance"]{display:contents!important}
 #atlasAetherStatusPanel4084 .aether-focus-toolbar-406030{position:static!important;grid-column:1/-1!important;justify-self:end!important}
}
'''
CSS.write_text(css,encoding='utf-8')

# --- manifests ---
now=datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z')
release='AETHER CENTRAL OBSERVATORY · BACKGROUND LAYER · LIVE RADIAL UI'
status='aether_central_observatory_background_layer_live_radial_ui_406031'
cascade={
 'parent_build':'40.6.30','release':release,'status':status,
 'scope':'presentation_only_existing_live_dom_remap','background_asset':'assets/aether/aether-observatory-radial-406031.svg',
 'background_has_baked_data':False,'existing_aether_runtime_owner':'js/aether.js','aether_js_modified':False,
 'live_bindings_preserved':True,'timeline_runtime_session_preserved':True,'weather_runtime_preserved':True,
 'market_core_modified':False,'oracle_modified':False,'graph_modified':False,'technical_reading_modified':False,
 'chronos_modified':False,'version_truth_modified':False,'window_manager_modified':False,'paper_safety_modified':False,
 'new_recurring_timer':False,'new_observer':False,'new_storage_owner':False,'new_network_owner':False,
 'automatic_order':False,'real_order':False,'parker_signature_preserved_verbatim':True
}
for name in ['build.json','administrator-version.json','version.json']:
 p=ROOT/name; d=load(p); assert str(d.get('build'))=='40.6.30',f'{name}: parent mismatch'
 d['build']='40.6.31'; d['release']=release; d['status']=status
 if 'administrator_build' in d:d['administrator_build']='40.6.31'
 if 'build_label' in d:d['build_label']='Build 40.6.31'
 if 'release_status' in d:d['release_status']=release
 if 'asset_token' in d:d['asset_token']='market-core-v2.0-alpha-build-40.6.31'
 if 'parent_build' in d:d['parent_build']='40.6.30'
 if 'timestamp' in d:d['timestamp']=now
 if 'prepared_at' in d:d['prepared_at']=now
 if 'published_at' in d:d['published_at']=now
 if isinstance(d.get('current_version_truth'),dict):d['current_version_truth']['loaded_build']='40.6.31'
 d['cascade_40_6_31']=cascade; dump(p,d)

release_md=ROOT/'RELEASE_40_6_31.md'
release_md.write_text(f'''# Agent-Crypto 40.6.31 — AETHER CENTRAL OBSERVATORY\n\nParent: **40.6.30**  \nMarket Core: **38.15.11 — protected**  \nGenerated: **{now}**\n\n## Destination\nTurn the Aether popup into a central Observatory surface: radial first-glance composition over a dedicated visual background layer while all readable values remain live DOM/runtime data.\n\n## Scope\n- Full central Observatory surface below the Administrator header/Veille zone.\n- Code-native radial background with no baked labels or market values.\n- Existing 40.6.30 live DOM is remapped by CSS only: Convergence, Divergence, Market, Events, Weather, Oracle, Atlas, Sources and System orbit the Aether center.\n- Existing History/Details remain one bounded secondary overlay.\n- Desktop first-glance avoids panel scrolling; compact fallback is scroll-safe.\n- **js/aether.js is byte-for-byte protected and unchanged.**\n- No new timer, observer, storage, fetch or network owner.\n\n## Protected\nMarket Core 38.15.11, Oracle/FX, Graphique, Lecture Technique, Chronos, Version Truth, Window Manager, Paper/Safety and Footer/Parker.\n\n## Signature\n`Version : Parker Lewis Can't Lose` preserved verbatim.\n''',encoding='utf-8')

# --- anti-destruction ---
after={str(p):sha(p) for p in PROTECTED if p.exists()}
assert before==after,'protected owner changed during 40.6.31 surgery'
assert "Version : Parker Lewis Can't Lose" in INDEX.read_text(encoding='utf-8')
assert "Version : Parker Lewis Can't Lose" in (ROOT/'js/footer-version-truth-406026.js').read_text(encoding='utf-8')
assert '40.6.31 — AETHER CENTRAL OBSERVATORY' in CSS.read_text(encoding='utf-8')
assert ASSET.exists() and ASSET.stat().st_size>3000

# --- clean upload: 7 files ---
ARCHIVE_DIR.mkdir(parents=True,exist_ok=True)
files=[INDEX,CSS,ASSET,ROOT/'build.json',ROOT/'administrator-version.json',ROOT/'version.json',release_md]
with zipfile.ZipFile(ARCHIVE,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
 for p in files:z.write(p,arcname=str(p.relative_to(Path('public/agent_crypto_erith_ia'))))
archive_sha=sha(ARCHIVE)
SHA_FILE.write_text(f'{archive_sha}  {ARCHIVE.name}\n',encoding='utf-8')
print('40.6.31 prepared',archive_sha,'aether.js protected',before[str(AETHER)])
