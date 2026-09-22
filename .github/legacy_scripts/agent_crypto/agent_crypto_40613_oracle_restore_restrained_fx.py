#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, re, subprocess, zipfile

ROOT = Path('public/agent_crypto_erith_ia/administrator')
BUILD='40.6.13'; PARENT='40.6.12'; ENGINE='38.15.11'
RELEASE='ORACLE STRUCTURE RESTORE · RESTRAINED SEMANTIC FX · CORE FREEZE'
STATUS='oracle_structure_restore_restrained_semantic_fx_core_freeze_406013'
TOKEN=f'market-core-v2.0-alpha-build-{BUILD}'
NOW=datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z')
STABLE_ORACLE_CSS_COMMIT='a34fdada77aa1f7f5cab15c7578a98cd76cbba2f'  # 40.6.10, before semantic coloration
STABLE_ORACLE_HTML_COMMIT='cf65c782f3994ee4a03c127299236dd4b16adecd' # 40.6.11, Oracle visibly functional


def load(name):
    data=json.loads((ROOT/name).read_text(encoding='utf-8'))
    if not isinstance(data,dict): raise SystemExit(f'STOP {BUILD}: invalid {name}')
    return data

def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def git_show(commit, rel):
    return subprocess.check_output(['git','show',f'{commit}:{rel}'])

if str(load('version.json').get('build')) != PARENT:
    raise SystemExit(f'STOP {BUILD}: expected parent {PARENT}')
if str(load('build.json').get('engine')) != ENGINE:
    raise SystemExit(f'STOP {BUILD}: Market Core drift')

index_path=ROOT/'index.html'; css_path=ROOT/'oracle-presentation-405010.css'
chronos=ROOT/'admin-chronos.css'; version_truth=ROOT/'js/version-truth.js'; app=ROOT/'js/app.js'; wm=ROOT/'js/core/admin-window-manager.js'
freeze={p: p.read_bytes() for p in (chronos,version_truth,app,wm)}

# ------------------------------------------------------------------
# 1) RESTORE VALIDATED ORACLE STRUCTURE, NOT A PATCH ON .12
# ------------------------------------------------------------------
stable_css=git_show(STABLE_ORACLE_CSS_COMMIT,'public/agent_crypto_erith_ia/administrator/oracle-presentation-405010.css')
css_path.write_bytes(stable_css)

index=index_path.read_text(encoding='utf-8')
stable_index=git_show(STABLE_ORACLE_HTML_COMMIT,'public/agent_crypto_erith_ia/administrator/index.html').decode('utf-8')
hero_rx=re.compile(r'<div class="atlas-oracle-hero">\s*<small>Lecture Oracle</small>\s*<div class="atlas-oracle-hero-row">[\s\S]*?<div class="atlas-oracle-hero-meta">[\s\S]*?</div>\s*</div>')
stable_match=hero_rx.search(stable_index)
if not stable_match: raise SystemExit(f'STOP {BUILD}: stable Oracle hero block not found')
stable_hero=stable_match.group(0)

current_hero_rx=re.compile(r'<div class="atlas-oracle-hero">[\s\S]*?<div class="atlas-oracle-hero-row">[\s\S]*?<div class="atlas-oracle-hero-meta">[\s\S]*?</div>\s*</div>')
current_matches=list(current_hero_rx.finditer(index))
if len(current_matches)!=1: raise SystemExit(f'STOP {BUILD}: current Oracle hero not unique: {len(current_matches)}')
index=index[:current_matches[0].start()]+stable_hero+index[current_matches[0].end():]

# Remove .12 and any old semantic runtime wiring. Historical files may remain archived but are not executed.
index=re.sub(r'\s*<script defer src="\./js/oracle-fx-406012\.js\?v=[^"]+"></script>','',index)
index=re.sub(r'\s*<script defer src="\./js/oracle-semantic-bias-406011\.js\?v=[^"]+"></script>','',index)

# Base CSS cache owner + isolated FX presentation/runtime owner.
index=re.sub(r'<link rel="stylesheet" href="\./oracle-presentation-405010\.css\?v=[^"]+" />',
             '<link rel="stylesheet" href="./oracle-presentation-405010.css?v=administrator-build-40.6.13" />\n  <link rel="stylesheet" href="./oracle-fx-406013.css?v=administrator-build-40.6.13" />\n  <script defer src="./js/oracle-fx-406013.js?v=administrator-build-40.6.13"></script>',index,count=1)

repls={
 '<meta name="atlas-build" content="40.6.12" />':'<meta name="atlas-build" content="40.6.13" />',
 '<meta name="administrator-build" content="40.6.12" />':'<meta name="administrator-build" content="40.6.13" />',
 '<meta name="administrator-release" content="ORACLE FX LIGHT SURFACE · PRICE TICK FLASH · CORE FREEZE" />':f'<meta name="administrator-release" content="{RELEASE}" />',
 '<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.6.12" />':f'<meta name="atlas-asset-token" content="{TOKEN}" />',
 '<title>Agent-Crypto @erith.IA — Build 40.6.12 · Administrator</title>':'<title>Agent-Crypto @erith.IA — Build 40.6.13 · Administrator</title>',
}
for old,new in repls.items():
    if old not in index: raise SystemExit(f'STOP {BUILD}: missing token {old}')
    index=index.replace(old,new,1)
index,n1=re.subn(r'(id="atlasVersionTruthControl"[\s\S]{0,700}?aria-label="Version Agent-Crypto installée : Build )[^,\"]+(, mode Administrator\")',r'\g<1>40.6.13\g<2>',index,count=1)
index,n2=re.subn(r'(<span id="atlasVersionTruthText">Build )[^<]+(</span>)',r'\g<1>40.6.13\g<2>',index,count=1)
if n1!=1 or n2!=1: raise SystemExit(f'STOP {BUILD}: version badge mismatch')
index_path.write_text(index,encoding='utf-8')

# ------------------------------------------------------------------
# 2) RESTRAINED FX OWNER — NO ORACLE GEOMETRY / WINDOW RULES
# ------------------------------------------------------------------
fx_css=ROOT/'oracle-fx-406013.css'
fx_css.write_text(r'''/* Agent-Crypto 40.6.13 — ORACLE RESTRAINED SEMANTIC FX
   Isolated presentation owner. No Oracle/window geometry. */
#atlasOracleV0 .atlas-oracle-hero{position:relative}
#atlasOracleV0 .atlas-oracle-fx-toggle-406013{
  position:absolute;z-index:4;top:5px;right:7px;display:inline-flex;align-items:center;gap:4px;
  padding:2px 6px;border-radius:999px;border:1px solid rgba(129,196,221,.20);
  background:rgba(5,17,27,.56);color:#a9bdc9;font:950 7px/1 system-ui,sans-serif;
  letter-spacing:.08em;cursor:pointer;box-shadow:none
}
#atlasOracleV0 .atlas-oracle-fx-toggle-406013 .dot{font-size:8px;color:#72dfff;text-shadow:0 0 5px rgba(114,223,255,.22)}
#atlasOracleV0 .atlas-oracle-fx-toggle-406013[aria-pressed="false"]{opacity:.58;border-color:rgba(255,255,255,.10)}
#atlasOracleV0 .atlas-oracle-fx-toggle-406013[aria-pressed="false"] .dot{color:#71818a;text-shadow:none}

/* Functional cards: green means hausse, red means baisse. No whole-column tint. */
body.atlas-administrator-mirror #atlasOracleV0 .atlas-oracle-card.is-bull,
body.atlas-admin-v3 #atlasOracleV0 .atlas-oracle-card.is-bull{
  border-color:rgba(127,238,154,.48)!important;background:linear-gradient(115deg,rgba(55,150,88,.055),rgba(255,255,255,.012))!important
}
body.atlas-administrator-mirror #atlasOracleV0 .atlas-oracle-card.is-bear,
body.atlas-admin-v3 #atlasOracleV0 .atlas-oracle-card.is-bear{
  border-color:rgba(255,112,135,.48)!important;background:linear-gradient(115deg,rgba(157,47,67,.055),rgba(255,255,255,.012))!important
}
body.atlas-administrator-mirror #atlasOracleV0 .atlas-oracle-card.is-bull b,
body.atlas-admin-v3 #atlasOracleV0 .atlas-oracle-card.is-bull b{color:#a8f5b8!important}
body.atlas-administrator-mirror #atlasOracleV0 .atlas-oracle-card.is-bear b,
body.atlas-admin-v3 #atlasOracleV0 .atlas-oracle-card.is-bear b{color:#ffabb8!important}

/* Hero / crypto price follows dominant Oracle balance, but only this card. */
#atlasOracleV0[data-oracle-bias-state="bull"] .atlas-oracle-hero{border-color:rgba(105,232,159,.38)!important}
#atlasOracleV0[data-oracle-bias-state="bear"] .atlas-oracle-hero{border-color:rgba(255,130,148,.38)!important}
#atlasOracleV0[data-oracle-bias-state="neutral"] .atlas-oracle-hero{border-color:rgba(98,236,255,.20)!important}
#atlasOracleV0[data-oracle-bias-state="bull"] #atlasOraclePrice{color:#a9f7c8!important}
#atlasOracleV0[data-oracle-bias-state="bear"] #atlasOraclePrice{color:#ffb0bd!important}
#atlasOracleV0[data-oracle-bias-state="neutral"] #atlasOraclePrice{color:#dff9ff!important}

/* FX only adds a restrained glow; semantic colors remain when FX is off. */
#atlasOracleV0[data-oracle-fx="on"][data-oracle-bias-state="bull"] .atlas-oracle-hero{box-shadow:inset 0 0 12px rgba(82,223,142,.035)!important}
#atlasOracleV0[data-oracle-fx="on"][data-oracle-bias-state="bear"] .atlas-oracle-hero{box-shadow:inset 0 0 12px rgba(255,98,126,.035)!important}
#atlasOracleV0[data-oracle-fx="on"] .atlas-oracle-card.is-bull{box-shadow:inset 0 0 10px rgba(82,223,142,.025)!important}
#atlasOracleV0[data-oracle-fx="on"] .atlas-oracle-card.is-bear{box-shadow:inset 0 0 10px rgba(255,98,126,.025)!important}
''',encoding='utf-8')

fx_js=ROOT/'js/oracle-fx-406013.js'
fx_js.write_text(r'''(() => {
  "use strict";
  const BUILD="40.6.13", STORAGE_KEY="agent_crypto_oracle_fx_enabled_v1";
  let bullObserver=null, priceObserver=null, lastPrice=null;
  const root=()=>document.getElementById("atlasOracleV0");
  const bull=()=>document.getElementById("atlasOracleBull");
  const price=()=>document.getElementById("atlasOraclePrice");
  const hero=()=>root()?.querySelector(".atlas-oracle-hero")||null;
  const readEnabled=()=>{try{const v=localStorage.getItem(STORAGE_KEY);return v===null?true:v==="1"}catch(_){return true}};
  const writeEnabled=v=>{try{localStorage.setItem(STORAGE_KEY,v?"1":"0")}catch(_){}};
  function strength(){const m=String(bull()?.textContent||"").replace(",",".").match(/Force\s+(-?\d+(?:\.\d+)?)\s*\/\s*100/i);return m&&Number.isFinite(Number(m[1]))?Number(m[1]):null}
  function bias(){const n=strength();return n===null||n===50?"neutral":n>50?"bull":"bear"}
  function parsePrice(){let s=String(price()?.textContent||"").replace(/[\s\u00a0\u202f]/g,"").replace(/[^0-9,.-]/g,"");if(!s)return null;if(s.includes(","))s=s.replace(/\./g,"").replace(",",".");const n=Number(s);return Number.isFinite(n)?n:null}
  function applyBias(){const r=root();if(!r)return false;r.dataset.oracleBiasState=bias();return true}
  function applyFx(v=readEnabled()){const r=root(),b=document.getElementById("atlasOracleFxToggle406013");if(r)r.dataset.oracleFx=v?"on":"off";if(b){b.setAttribute("aria-pressed",v?"true":"false");b.title=v?"Effets Oracle : ON":"Effets Oracle : OFF"}return v}
  function injectToggle(){const h=hero();if(!h)return null;let b=document.getElementById("atlasOracleFxToggle406013");if(b)return b;b=document.createElement("button");b.id="atlasOracleFxToggle406013";b.className="atlas-oracle-fx-toggle-406013";b.type="button";b.innerHTML='<span>FX</span><span class="dot" aria-hidden="true">●</span>';b.addEventListener("click",()=>{const v=!readEnabled();writeEnabled(v);applyFx(v)});h.appendChild(b);return b}
  function priceTick(){const el=price(),n=parsePrice();if(!el||n===null)return;const prev=lastPrice;lastPrice=n;if(prev===null||n===prev||!readEnabled())return;const up=n>prev;if(typeof el.animate==="function"){el.getAnimations?.().forEach(a=>a.cancel());el.animate([{color:up?"#79ffad":"#ff8296",textShadow:up?"0 0 10px rgba(88,255,157,.52)":"0 0 10px rgba(255,93,122,.52)"},{color:"",textShadow:""}],{duration:320,easing:"ease-out"})}}
  function bind(){const r=root(),b=bull(),p=price();if(!r||!b||!p||!injectToggle())return false;applyBias();applyFx();lastPrice=parsePrice();bullObserver=new MutationObserver(applyBias);bullObserver.observe(b,{childList:true,subtree:true,characterData:true});priceObserver=new MutationObserver(priceTick);priceObserver.observe(p,{childList:true,subtree:true,characterData:true});document.documentElement.dataset.oracleFx406013="ready";return true}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});else bind();
  globalThis.ErithOracleFx406013=Object.freeze({build:BUILD,bind,presentation_only:true,source_structure_modified:false,window_manager_modified:false,oracle_model_modified:false,oracle_canvas_modified:false,network_request_added:false,recurring_timer_added:false});
})();
''',encoding='utf-8')

# ------------------------------------------------------------------
# RELEASE NOTE + MANIFESTS
# ------------------------------------------------------------------
release=ROOT/'RELEASE_40_6_13.md'
release.write_text(f'''# Agent-Crypto @erith.IA — Build {BUILD}\n\n## {RELEASE}\n\nParent: **{PARENT}**  \nMarket Core: **{ENGINE} protected**\n\n### Correction prioritaire\n40.6.12 avait modifié le HTML interne de la carte Lecture Oracle pour placer FX dans le flux. 40.6.13 restaure le bloc Oracle validé de 40.6.11 et retire ce changement structurel.\n\n### Présentation retenue\n- colonne Lecture Oracle : neutre ;\n- Oracle Hausse : vert ;\n- Oracle Baisse : rouge ;\n- carte/prix crypto : teinte selon balance Oracle ;\n- `FX ●` injecté hors flux, en position absolue ;\n- FX ON : micro-glow + flash du prix sur tick réel ;\n- FX OFF : aucune animation/glow, couleurs fonctionnelles conservées.\n\n### Anti-destruction\nOracle canvas/model, Window Manager, Graphique, Lecture Technique, Chronos 40.6.9, Version Truth 40.6.8, largeur 40.6.10, Strategy A et Market Core sont gelés.\n''',encoding='utf-8')

docs={n:load(n) for n in ('build.json','administrator-version.json','version.json')}
for n,d in docs.items():
    d['build']=BUILD; d['release']=RELEASE; d['status']=STATUS; d['parent_build']=PARENT; d['asset_token']=TOKEN
    if 'administrator_build' in d:d['administrator_build']=BUILD
    if 'build_label' in d:d['build_label']=f'Build {BUILD}'
    if 'release_status' in d:d['release_status']=RELEASE
    for k in ('timestamp','prepared_at','published_at'):
        if k in d:d[k]=NOW
    if isinstance(d.get('current_version_truth'),dict): d['current_version_truth']['loaded_build']=BUILD
    d['cascade_40_6_13']={
      'parent_build':PARENT,'release':RELEASE,'oracle_structure_restored_from':'40.6.11',
      'oracle_base_css_restored_from':'40.6.10','oracle_fx_406012_wiring_retired':True,
      'fx_injected_out_of_flow':True,'whole_readout_tint':False,'bull_card_green':True,'bear_card_red':True,
      'hero_price_semantic_color':True,'real_price_tick_flash_fx_only':True,'window_manager_modified':False,
      'oracle_model_modified':False,'oracle_canvas_modified':False,'market_core_modified':False,
      'chronos_modified':False,'version_truth_modified':False,'strategy_a_modified':False
    }
for n in ('build.json','administrator-version.json'):(ROOT/n).write_text(json.dumps(docs[n],ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
ver=docs['version.json']; files=ver.setdefault('files',{})
for rel in ('index.html','oracle-presentation-405010.css','oracle-fx-406013.css','js/oracle-fx-406013.js','build.json','administrator-version.json','RELEASE_40_6_13.md'):
    files[rel]=sha(ROOT/rel)
(ROOT/'version.json').write_text(json.dumps(ver,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

# ------------------------------------------------------------------
# HARD PROOFS
# ------------------------------------------------------------------
for p,before in freeze.items():
    if p.read_bytes()!=before: raise SystemExit(f'STOP {BUILD}: protected owner changed: {p}')
final=index_path.read_text(encoding='utf-8')
if 'atlas-oracle-hero-head-406012' in final or 'atlasOracleFxToggle406012' in final or 'oracle-fx-406012.js' in final:
    raise SystemExit(f'STOP {BUILD}: 40.6.12 structural/runtime wiring still active')
if stable_hero not in final: raise SystemExit(f'STOP {BUILD}: stable Oracle hero not restored')
if final.count('oracle-fx-406013.css')!=1 or final.count('oracle-fx-406013.js')!=1: raise SystemExit(f'STOP {BUILD}: FX owner wiring invalid')
if 'grid-template-columns:minmax(128px,.66fr) minmax(124px,.66fr) minmax(170px,.94fr) minmax(255px,1.35fr) minmax(410px,2.05fr)!important;' not in final:
    raise SystemExit(f'STOP {BUILD}: 40.6.10 width contract missing')
if str(load('build.json').get('engine'))!=ENGINE: raise SystemExit(f'STOP {BUILD}: Market Core drift')

outdir=Path('coordination/inter_ai_dialogues/agent_crypto');outdir.mkdir(parents=True,exist_ok=True)
out=outdir/'AGENT_CRYPTO_BUILD_40_6_13_ORACLE_STRUCTURE_RESTORE_RESTRAINED_FX_CLEAN_UPLOAD_8_FILES.zip'
rels=['index.html','oracle-presentation-405010.css','oracle-fx-406013.css','js/oracle-fx-406013.js','build.json','administrator-version.json','version.json','RELEASE_40_6_13.md']
with zipfile.ZipFile(out,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for rel in rels:z.write(ROOT/rel,(Path('public/agent_crypto_erith_ia/administrator')/rel).as_posix())
digest=sha(out);Path(str(out)+'.sha256').write_text(f'{digest}  {out.name}\n',encoding='utf-8')
print(json.dumps({'ok':True,'build':BUILD,'zip':str(out),'sha256':digest,'stable_html_restored':True,'window_manager_modified':False},ensure_ascii=False))
