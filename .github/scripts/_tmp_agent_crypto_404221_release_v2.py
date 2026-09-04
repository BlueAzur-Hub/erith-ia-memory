#!/usr/bin/env python3
from pathlib import Path
import json, re, subprocess, hashlib

REPO=Path('.')
ADMIN=REPO/'public/agent_crypto_erith_ia/administrator'
SYSTEM=ADMIN/'views/system.html'
PRESENTATION=ADMIN/'js/views/system-presentation.js'
APP=ADMIN/'app.js'
INDEX=ADMIN/'index.html'
GUARD=REPO/'.github/scripts/agent_crypto_version_truth_guard.py'
DOCS=REPO/'coordination/inter_ai_dialogues/agent_crypto'
WORKFLOW=REPO/'.github/workflows/agent-crypto-40-4-221-simulation-release.yml'
SELF=REPO/'.github/scripts/_tmp_agent_crypto_404221_release_v2.py'
TMP_FILES=[
 REPO/'.github/scripts/_tmp_agent_crypto_404221_release.py',
 REPO/'.github/scripts/_tmp_agent_crypto_404221_simulation_audit.py',
 REPO/'.github/workflows/agent-crypto-40-4-221-simulation-audit.yml',
 REPO/'.github/_tmp_agent_crypto_404221_simulation_audit.txt',
 REPO/'.github/scripts/_tmp_agent_crypto_404221_simulation_focus.py',
 REPO/'.github/workflows/agent-crypto-40-4-221-simulation-focus.yml',
 REPO/'.github/_tmp_agent_crypto_404221_simulation_focus.txt',
]

def run(*args):
    print('+',*map(str,args),flush=True)
    subprocess.run([str(x) for x in args],check=True)

def once(text,old,new,label):
    n=text.count(old)
    if n!=1: raise SystemExit(f'STOP {label}: expected 1 occurrence, got {n}')
    return text.replace(old,new,1)

def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def esc_html_fragment(value):
    return value.replace('\\','\\\\').replace('"','\\"').replace('\n','\\n')

run('python','.github/scripts/agent_crypto_version_truth_guard.py','--expected-build','40.4.220')
for p in (SYSTEM,PRESENTATION,APP,INDEX):
    if not p.is_file(): raise SystemExit(f'STOP required file missing: {p}')

# Protected Simulation engine: inspection only.
app_before=APP.read_text(encoding='utf-8')
required_engine=(
 'solo_beginner_100_v1_1_alpha_13','solo_progression_1000_v1',
 'function switchSimulationProfile(profileKey)',
 'localStorage.setItem(SIM_ACTIVE_PROFILE_STORAGE_KEY, SIM_PROFILE.key)',
 'document.querySelectorAll("[data-sim-profile]")',
 'function renderSchoolProfileLabels()',
 'const unit = SIM_PROFILE.maxExposure / 3',
 'const safeAmount = SIM_PROFILE.defaultAmount',
 'const tooBigAmount = SIM_PROFILE.maxPerOperation * 5',
)
for marker in required_engine:
    if marker not in app_before: raise SystemExit(f'STOP protected Simulation runtime contract missing: {marker}')
primitives=('fetch(','setInterval(','setTimeout(','new MutationObserver(','new IntersectionObserver(','new WebSocket(','requestAnimationFrame(','addEventListener(')
primitive_before={k:app_before.count(k) for k in primitives}

# Canonical presentation fragments. Both views/system.html and the parser-mounted
# shellHtml in js/views/system-presentation.js must carry the same hooks.
old_intro='''          <p class="sim-intro">
            Portefeuille virtuel local avec profil débutant 100 €. Aucun ordre réel, aucune clé API, aucun wallet connecté. Sert à apprendre avant toute future connexion Kraken.
          </p>'''
new_intro='''          <p class="sim-intro">
            Simulation Agent-Crypto à deux profils locaux isolés : École 100 € et Progression 1 000 €. Aucun ordre réel, aucune clé API, aucun wallet connecté. Les états, journaux et preuves restent séparés par profil ; Kraken Paper reste une couche de contrôle en lecture seule.
          </p>'''
old_panel='''      <div class="sim-profile-panel" id="simProfilePanel">
        <div class="sim-profile-head">
          <b>Profil actif : Solo Débutant 100 €</b>
          <span id="simProfileStatus">BTC / ETH / SOL · ticket 5 € · maximum 10 € · exposition 30 €</span>
        </div>
        <div class="sim-profile-grid">
          <div><b>Capital</b><span>100 € virtuels</span></div>
          <div><b>Ticket conseillé</b><span>5 €</span></div>
          <div><b>Maximum opération</b><span>10 €</span></div>
          <div><b>Exposition maximale</b><span>30 €</span></div>
          <div><b>Réserve minimale</b><span>70 €</span></div>
          <div><b>Cryptos autorisées</b><span>BTC · ETH · SOL</span></div>
        </div>
      </div>'''
new_panel='''      <div class="sim-profile-panel" id="simProfilePanel">
        <div class="sim-profile-head">
          <b id="simProfileTitle">Profil actif : Solo Débutant 100 €</b>
          <span id="simProfileStatus">BTC / ETH / SOL · ticket 5 € · maximum 10 € · exposition 30 €</span>
        </div>
        <div class="atlas-storage-health-actions" role="group" aria-label="Choisir le profil de simulation">
          <button type="button" data-sim-profile="solo_beginner_100_v1_1_alpha_13" aria-pressed="true">École 100 €</button>
          <button type="button" data-sim-profile="solo_progression_1000_v1" aria-pressed="false">Progression 1 000 €</button>
        </div>
        <div class="sim-profile-grid">
          <div><b>Capital</b><span id="simProfileCapital">100 € virtuels</span></div>
          <div><b>Ticket conseillé</b><span id="simProfileTicket">5 €</span></div>
          <div><b>Maximum opération</b><span id="simProfileMaxOperation">10 €</span></div>
          <div><b>Exposition maximale</b><span id="simProfileMaxExposure">30 €</span></div>
          <div><b>Réserve minimale</b><span id="simProfileMinReserve">70 €</span></div>
          <div><b>Cryptos autorisées</b><span id="simProfileAllowedAssets">BTC · ETH · SOL</span></div>
        </div>
      </div>'''
school=(
 ('<span>BTC 5 € · doit être accepté</span>','<span id="schoolSafeLabel">BTC 5 € · doit être accepté</span>'),
 ('<span>BTC 50 € · doit être refusé</span>','<span id="schoolTooBigLabel">BTC 50 € · doit être refusé</span>'),
 ('<span>DOGE 5 € · doit être refusé</span>','<span id="schoolForbiddenLabel">DOGE 5 € · doit être refusé</span>'),
 ('<span>BTC 10 € + ETH 10 € + SOL 10 €</span>','<span id="schoolFillLabel">BTC 10 € + ETH 10 € + SOL 10 €</span>'),
 ('<span>Après 30 € exposés, BTC 5 € doit être refusé</span>','<span id="schoolExceedLabel">Après 30 € exposés, BTC 5 € doit être refusé</span>'),
 ('<b>Remettre le simulateur à 100 €</b>','<b id="schoolResetTitle">Remettre le simulateur à 100 €</b>'),
 ('<span>Repartir proprement</span>','<span id="schoolResetLabel">Réinitialiser uniquement Solo Débutant 100 €</span>'),
)

def patch_html_surface(text,label):
    text=once(text,old_intro,new_intro,f'{label} dual-profile intro')
    text=once(text,'<span class="pill warn">Profil 100 €</span>','<span class="pill warn" id="simProfileBadge">Profil 100 €</span>',f'{label} profile badge')
    text=once(text,old_panel,new_panel,f'{label} dual-profile panel')
    for i,(old,new) in enumerate(school,1): text=once(text,old,new,f'{label} school hook {i}')
    return text

system_text=patch_html_surface(SYSTEM.read_text(encoding='utf-8'),'views/system.html')
SYSTEM.write_text(system_text,encoding='utf-8')

presentation=PRESENTATION.read_text(encoding='utf-8')
# The System true-lazy owner fetches the canonical source only for peripheral bodies;
# cache-bust that source because this release changes the presentation contract.
presentation=once(presentation,'const SOURCE="./views/system.html";','const SOURCE="./views/system.html?v=administrator-build-40.4.221";','System source cache token')
# Patch only the encoded shellHtml fragments, not runtime/lazy owner behavior.
presentation=once(presentation,esc_html_fragment(old_intro),esc_html_fragment(new_intro),'parser shell dual-profile intro')
presentation=once(presentation,esc_html_fragment('<span class="pill warn">Profil 100 €</span>'),esc_html_fragment('<span class="pill warn" id="simProfileBadge">Profil 100 €</span>'),'parser shell profile badge')
presentation=once(presentation,esc_html_fragment(old_panel),esc_html_fragment(new_panel),'parser shell dual-profile panel')
for i,(old,new) in enumerate(school,1):
    presentation=once(presentation,esc_html_fragment(old),esc_html_fragment(new),f'parser shell school hook {i}')
PRESENTATION.write_text(presentation,encoding='utf-8')

# Cache-bust the loaded system-presentation owner itself; no other asset URL changes.
index=INDEX.read_text(encoding='utf-8')
hits=list(re.finditer(r'([^"\']*system-presentation\.js\?v=)([^"\']+)',index))
if len(hits)!=1: raise SystemExit(f'STOP expected one system-presentation.js cache URL in index, got {len(hits)}')
old_url=hits[0].group(0)
new_url=hits[0].group(1)+'administrator-build-40.4.221'
index=index.replace(old_url,new_url,1)
INDEX.write_text(index,encoding='utf-8')
print('SYSTEM_PRESENTATION_CACHE',old_url,'->',new_url)

# Put views/system.html under manifest SHA authority; system-presentation.js is already
# part of the loaded JS/CSS hash authority and will be refreshed by the release driver.
manifest_path=ADMIN/'version.json'
manifest=json.loads(manifest_path.read_text(encoding='utf-8'))
files=manifest.get('files')
if not isinstance(files,dict) or not files: raise SystemExit('STOP version.json files map missing')
files.setdefault('views/system.html','PENDING_RELEASE_DRIVER_HASH')
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

# Structural parity proof before publication.
required_html=(
 'id="simProfileBadge"','id="simProfileTitle"','id="simProfileStatus"',
 'id="simProfileCapital"','id="simProfileTicket"','id="simProfileMaxOperation"',
 'id="simProfileMaxExposure"','id="simProfileMinReserve"','id="simProfileAllowedAssets"',
 'data-sim-profile="solo_beginner_100_v1_1_alpha_13"','data-sim-profile="solo_progression_1000_v1"',
 'id="schoolSafeLabel"','id="schoolTooBigLabel"','id="schoolForbiddenLabel"',
 'id="schoolFillLabel"','id="schoolExceedLabel"','id="schoolResetTitle"','id="schoolResetLabel"',
)
for marker in required_html:
    if SYSTEM.read_text(encoding='utf-8').count(marker)!=1: raise SystemExit(f'STOP system source marker count: {marker}')
    encoded=esc_html_fragment(marker)
    if PRESENTATION.read_text(encoding='utf-8').count(encoded)!=1: raise SystemExit(f'STOP parser shell marker count: {marker}')
for idv in ('simCash','simPositionsValue','simTotalValue','simPnL','simLog','schoolResult'):
    if SYSTEM.read_text(encoding='utf-8').count(f'id="{idv}"')!=1: raise SystemExit(f'STOP protected System DOM id drift: {idv}')

# Permanent CI guard: two presentation copies must remain connected to one runtime.
guard=GUARD.read_text(encoding='utf-8')
anchor='''    files = manifest.get("files")'''
insert='''    if current_num >= (40, 4, 221):
        system_view = read(base / "views/system.html")
        system_presentation = read(base / "js/views/system-presentation.js")
        required_simulation_surface = (
            'id="simProfileBadge"','id="simProfileTitle"','id="simProfileCapital"','id="simProfileTicket"',
            'id="simProfileMaxOperation"','id="simProfileMaxExposure"','id="simProfileMinReserve"','id="simProfileAllowedAssets"',
            'data-sim-profile="solo_beginner_100_v1_1_alpha_13"','data-sim-profile="solo_progression_1000_v1"',
            'id="schoolSafeLabel"','id="schoolTooBigLabel"','id="schoolForbiddenLabel"','id="schoolFillLabel"',
            'id="schoolExceedLabel"','id="schoolResetTitle"','id="schoolResetLabel"',
        )
        for marker in required_simulation_surface:
            if system_view.count(marker) != 1:
                fail(f"40.4.221 System source Simulation hook regression: {marker} count={system_view.count(marker)}")
            encoded = marker.replace('\\\\','\\\\\\\\').replace('"','\\\\"')
            if system_presentation.count(encoded) != 1:
                fail(f"40.4.221 parser shell Simulation hook regression: {marker}")
        required_simulation_runtime = (
            "solo_beginner_100_v1_1_alpha_13","solo_progression_1000_v1",
            "function switchSimulationProfile(profileKey)",
            "localStorage.setItem(SIM_ACTIVE_PROFILE_STORAGE_KEY, SIM_PROFILE.key)",
            'document.querySelectorAll("[data-sim-profile]")',
            "function renderSchoolProfileLabels()","const unit = SIM_PROFILE.maxExposure / 3",
        )
        for marker in required_simulation_runtime:
            if marker not in root:
                fail(f"40.4.221 protected Simulation runtime contract missing: {marker}")
        if 'const SOURCE="./views/system.html?v=administrator-build-40.4.221";' not in system_presentation:
            fail("40.4.221 System source cache token regression")
        if "system-presentation.js?v=administrator-build-40.4.221" not in index:
            fail("40.4.221 System presentation cache token regression")
        if "views/system.html" not in files:
            fail("40.4.221 System source escaped version manifest hash authority")

    files = manifest.get("files")'''
if guard.count(anchor)!=1: raise SystemExit(f'STOP guard anchor count={guard.count(anchor)}')
guard=guard.replace(anchor,insert,1)
GUARD.write_text(guard,encoding='utf-8')

# Continuity docs.
release_manifest=DOCS/'AGENT_CRYPTO_RELEASE_MANIFEST.md'
t=release_manifest.read_text(encoding='utf-8')
t=once(t,'Release courante : **40.4.220**','Release courante : **40.4.221**','manifest version')
t=once(t,'commit final 40.4.220','commit final 40.4.221','manifest archive')
t += '\n40.4.221 est une release de **Simulation Dual Profile Surface Truth** : la sous-vue `views/system.html` ET son shell parser canonique `js/views/system-presentation.js` sont reconnectés au moteur dual-profile déjà présent. Les sélecteurs École 100 € / Progression 1 000 €, les valeurs de profil et les libellés du Mode École redeviennent dynamiques. Les deux portefeuilles, journaux, sauvegardes, IndexedDB, workspaces Kraken Paper, onze leçons et calculs de simulation restent inchangés.\n'
release_manifest.write_text(t,encoding='utf-8')

prompt=DOCS/'PROMPT_REPRISE_AETHER_AGENT_CRYPTO.md'
t=prompt.read_text(encoding='utf-8')
t=once(t,'Version de reprise : **40.4.220**','Version de reprise : **40.4.221**','prompt version')
t += '\n40.4.221 reconnecte la **façade Simulation dual-profile** au runtime historique : `solo_beginner_100_v1_1_alpha_13` et `solo_progression_1000_v1` restent deux états locaux isolés. La source `views/system.html` et le shell parser `js/views/system-presentation.js` portent de nouveau les hooks dynamiques du profil et du Mode École ; aucune reconstruction du moteur, des 11 leçons, du journal, d’IndexedDB ou de Kraken Paper.\n'
prompt.write_text(t,encoding='utf-8')

ledger=DOCS/'AGENT_CRYPTO_FIN_DE_FIL_AETHER.md'
t=ledger.read_text(encoding='utf-8')
t=once(t,'Version canonique de clôture : **40.4.220**','Version canonique de clôture : **40.4.221**','ledger version')
t=once(t,'## 1. Cascade finale 40.4.205 → 40.4.220','## 1. Cascade finale 40.4.205 → 40.4.221','ledger heading')
marker='''- **40.4.220** — Atlas Heartbeat Owner Guard : le contrat one-shot CURRENT 40.4.212 devient invariant de CI ; propriétaire canonique, fallback existant et absence de primitives récurrentes/réseau sont vérifiés à chaque release.\n'''
addition='''- **40.4.221** — Simulation Dual Profile Surface Truth : reconnexion de la source System et de son shell parser aux deux profils déjà existants (École 100 € / Progression 1 000 €), aux valeurs dynamiques et aux libellés du Mode École ; moteur, journaux, IndexedDB, Kraken Paper et 11 modules protégés.\n'''
t=once(t,marker,marker+addition,'ledger append')
ledger.write_text(t,encoding='utf-8')

contract={
 'build':'40.4.221','scope':'simulation_dual_profile_surface_truth','market_core':'38.15.11',
 'system_source_change':True,'system_parser_shell_change':True,'dual_profile_controls_restored':True,
 'profile_dynamic_hooks_restored':True,'school_dynamic_hooks_restored':True,
 'simulation_engine_change':False,'simulation_profile_definitions_change':False,'simulation_storage_change':False,
 'simulation_journal_change':False,'indexeddb_change':False,'learning_modules_change':False,'kraken_paper_change':False,
 'atlas_change':False,'data_change':False,'fetch_added':False,'timer_added':False,'observer_added':False,
 'websocket_added':False,'raf_added':False
}
cp=Path('/tmp/contract404221.json'); cp.write_text(json.dumps(contract,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
run('python','.github/scripts/agent_crypto_release_driver.py',
 '--build','40.4.221','--parent','40.4.220',
 '--release','SIMULATION DUAL PROFILE SURFACE TRUTH · 100/1000 SCHOOL RECONNECT LOCK',
 '--status','simulation_dual_profile_surface_truth_404221_operator_validation_required',
 '--contract-key','simulation_dual_profile_surface_truth_404221','--contract-json',str(cp),
 '--lineage-note','40.4.221 reconnects both System presentation copies to the already-existing isolated 100 EUR / 1000 EUR profile engine and dynamic School labels; Simulation business/storage owners remain unchanged.')

run('node','--check',str(APP)); run('node','--check',str(ADMIN/'js/app.js')); run('node','--check',str(PRESENTATION))
run('python','-m','py_compile','.github/scripts/agent_crypto_version_truth_guard.py','.github/scripts/agent_crypto_release_driver.py')
run('python','.github/scripts/agent_crypto_version_truth_guard.py','--expected-build','40.4.221')
fm=json.loads(manifest_path.read_text(encoding='utf-8'))
for rel,path in (('views/system.html',SYSTEM),('js/views/system-presentation.js',PRESENTATION)):
    h=str((fm.get('files') or {}).get(rel) or '')
    if not re.fullmatch(r'[0-9a-f]{64}',h): raise SystemExit(f'STOP invalid manifest hash: {rel} {h}')
    if h!=sha(path): raise SystemExit(f'STOP manifest hash mismatch: {rel}')
changed=subprocess.run(['git','diff','--name-only'],capture_output=True,text=True,check=True).stdout.splitlines()
if any(x.startswith('public/agent_crypto_erith_ia/data/') for x in changed): raise SystemExit('STOP market data changed')
app_after=APP.read_text(encoding='utf-8')
for marker in required_engine:
    if marker not in app_after: raise SystemExit(f'STOP protected Simulation runtime missing after release: {marker}')
if {k:app_after.count(k) for k in primitives}!=primitive_before: raise SystemExit('STOP root app runtime primitive budget changed')
run('git','diff','--check')

run('git','config','user.name','Aether Release'); run('git','config','user.email','41898282+github-actions[bot]@users.noreply.github.com')
for p in [WORKFLOW,SELF,*TMP_FILES]:
    if p.exists(): run('git','rm',str(p))
for p in (GUARD,SYSTEM,PRESENTATION,INDEX,ADMIN/'app.js',ADMIN/'js/app.js',ADMIN/'version.json',ADMIN/'administrator-version.json',ADMIN/'build.json',release_manifest,prompt,ledger):
    if p.exists(): run('git','add',str(p))
run('git','commit','-m','release(agent-crypto): 40.4.221 reconnect Simulation dual-profile surface')
run('git','pull','--rebase','origin','main')
run('python','.github/scripts/agent_crypto_version_truth_guard.py','--expected-build','40.4.221')
run('git','push','origin','HEAD:main')
print(json.dumps({'ok':True,'build':'40.4.221','market_core':'38.15.11','engine_changed':False,'system_source':True,'parser_shell':True},ensure_ascii=False))
