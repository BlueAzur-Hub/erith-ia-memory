#!/usr/bin/env python3
from pathlib import Path
from urllib.parse import urlsplit
import json, re, subprocess, hashlib

REPO=Path('.')
ADMIN=REPO/'public/agent_crypto_erith_ia/administrator'
SYSTEM=ADMIN/'views/system.html'
APP=ADMIN/'app.js'
GUARD=REPO/'.github/scripts/agent_crypto_version_truth_guard.py'
DOCS=REPO/'coordination/inter_ai_dialogues/agent_crypto'
WORKFLOW=REPO/'.github/workflows/agent-crypto-40-4-221-simulation-release.yml'
SELF=REPO/'.github/scripts/_tmp_agent_crypto_404221_release.py'

TMP_FILES=[
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

run('python','.github/scripts/agent_crypto_version_truth_guard.py','--expected-build','40.4.220')
if not SYSTEM.is_file(): raise SystemExit('STOP views/system.html missing')
if not APP.is_file(): raise SystemExit('STOP app.js missing')

# --- PROTECTED RUNTIME CONTRACT: inspect, do not rewrite Simulation engine. ---
app_before=APP.read_text(encoding='utf-8')
required_engine=(
  'solo_beginner_100_v1_1_alpha_13',
  'solo_progression_1000_v1',
  'function switchSimulationProfile(profileKey)',
  'localStorage.setItem(SIM_ACTIVE_PROFILE_STORAGE_KEY, SIM_PROFILE.key)',
  'document.querySelectorAll("[data-sim-profile]")',
  'if (els.simProfileCapital) els.simProfileCapital.textContent = `${fmtEUR.format(SIM_PROFILE.startCash)} virtuels`',
  'if (els.simProfileTicket) els.simProfileTicket.textContent = fmtEUR.format(SIM_PROFILE.defaultAmount)',
  'if (els.simProfileMaxOperation) els.simProfileMaxOperation.textContent = fmtEUR.format(SIM_PROFILE.maxPerOperation)',
  'if (els.simProfileMaxExposure) els.simProfileMaxExposure.textContent = fmtEUR.format(SIM_PROFILE.maxExposure)',
  'if (els.simProfileMinReserve) els.simProfileMinReserve.textContent = fmtEUR.format(SIM_PROFILE.minReserve)',
  'function renderSchoolProfileLabels()',
  'const unit = SIM_PROFILE.maxExposure / 3',
  'const safeAmount = SIM_PROFILE.defaultAmount',
  'const tooBigAmount = SIM_PROFILE.maxPerOperation * 5',
)
for marker in required_engine:
    if marker not in app_before: raise SystemExit(f'STOP protected Simulation runtime contract missing: {marker}')

# Runtime primitive budget must not grow through the presentation surgery.
primitive_keys=('fetch(','setInterval(','setTimeout(','new MutationObserver(','new IntersectionObserver(','new WebSocket(','requestAnimationFrame(','addEventListener(')
primitive_before={k:app_before.count(k) for k in primitive_keys}

# --- ONE OWNER / ONE SURGERY: reconnect views/system.html to existing dual-profile runtime. ---
s=SYSTEM.read_text(encoding='utf-8')

s=once(s,
'''          <p class="sim-intro">
            Portefeuille virtuel local avec profil débutant 100 €. Aucun ordre réel, aucune clé API, aucun wallet connecté. Sert à apprendre avant toute future connexion Kraken.
          </p>''',
'''          <p class="sim-intro">
            Simulation Agent-Crypto à deux profils locaux isolés : École 100 € et Progression 1 000 €. Aucun ordre réel, aucune clé API, aucun wallet connecté. Les états, journaux et preuves restent séparés par profil ; Kraken Paper reste une couche de contrôle en lecture seule.
          </p>''',
'Simulation intro dual-profile truth')

s=once(s,
'''        <span class="pill warn">Profil 100 €</span>''',
'''        <span class="pill warn" id="simProfileBadge">Profil 100 €</span>''',
'profile badge hook')

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
s=once(s,old_panel,new_panel,'dual-profile surface panel')

school_replacements=(
 ('<span>BTC 5 € · doit être accepté</span>','<span id="schoolSafeLabel">BTC 5 € · doit être accepté</span>','school safe hook'),
 ('<span>BTC 50 € · doit être refusé</span>','<span id="schoolTooBigLabel">BTC 50 € · doit être refusé</span>','school too-big hook'),
 ('<span>DOGE 5 € · doit être refusé</span>','<span id="schoolForbiddenLabel">DOGE 5 € · doit être refusé</span>','school forbidden hook'),
 ('<span>BTC 10 € + ETH 10 € + SOL 10 €</span>','<span id="schoolFillLabel">BTC 10 € + ETH 10 € + SOL 10 €</span>','school fill hook'),
 ('<span>Après 30 € exposés, BTC 5 € doit être refusé</span>','<span id="schoolExceedLabel">Après 30 € exposés, BTC 5 € doit être refusé</span>','school exceed hook'),
 ('<b>Remettre le simulateur à 100 €</b>','<b id="schoolResetTitle">Remettre le simulateur à 100 €</b>','school reset title hook'),
 ('<span>Repartir proprement</span>','<span id="schoolResetLabel">Réinitialiser uniquement Solo Débutant 100 €</span>','school reset label hook'),
)
for old,new,label in school_replacements: s=once(s,old,new,label)

SYSTEM.write_text(s,encoding='utf-8')

# --- Cache coherence: the System view itself changed, so its loader token must change. ---
owner_matches=[]
for p in ADMIN.rglob('*.js'):
    text=p.read_text(encoding='utf-8',errors='replace')
    if 'views/system.html' not in text: continue
    found=list(re.finditer(r'views/system\.html\?v=([^"\'`\\)\s]+)',text))
    if found: owner_matches.append((p,text,found))
if len(owner_matches)!=1:
    raise SystemExit(f'STOP expected exactly one versioned views/system.html owner, found {[(str(p),len(ms)) for p,_,ms in owner_matches]}')
owner_path,owner_text,owner_hits=owner_matches[0]
if len(owner_hits)!=1: raise SystemExit(f'STOP System view loader token multiplicity: {len(owner_hits)}')
old_url=owner_hits[0].group(0)
new_url='views/system.html?v=administrator-build-40.4.221'
owner_text=owner_text.replace(old_url,new_url,1)
owner_path.write_text(owner_text,encoding='utf-8')
print('SYSTEM_VIEW_OWNER',owner_path,'CACHE',old_url,'->',new_url)

# --- Put the changed presentation payload under canonical SHA-256 authority. ---
manifest_path=ADMIN/'version.json'
manifest=json.loads(manifest_path.read_text(encoding='utf-8'))
files=manifest.get('files')
if not isinstance(files,dict) or not files: raise SystemExit('STOP version.json files map missing')
files.setdefault('views/system.html','PENDING_RELEASE_DRIVER_HASH')
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

# --- Structural proof before publication. ---
final_system=SYSTEM.read_text(encoding='utf-8')
required_surface=(
 'id="simProfileBadge"', 'id="simProfileTitle"', 'id="simProfileStatus"',
 'id="simProfileCapital"', 'id="simProfileTicket"', 'id="simProfileMaxOperation"',
 'id="simProfileMaxExposure"', 'id="simProfileMinReserve"', 'id="simProfileAllowedAssets"',
 'data-sim-profile="solo_beginner_100_v1_1_alpha_13"',
 'data-sim-profile="solo_progression_1000_v1"',
 'id="schoolSafeLabel"','id="schoolTooBigLabel"','id="schoolForbiddenLabel"',
 'id="schoolFillLabel"','id="schoolExceedLabel"','id="schoolResetTitle"','id="schoolResetLabel"',
)
for marker in required_surface:
    if final_system.count(marker)!=1: raise SystemExit(f'STOP .221 surface marker count != 1: {marker} -> {final_system.count(marker)}')
# Existing state/wallet/log IDs are preserved, not duplicated.
for idv in ('simCash','simPositionsValue','simTotalValue','simPnL','simLog','schoolResult'):
    if final_system.count(f'id="{idv}"')!=1: raise SystemExit(f'STOP protected Simulation DOM id drift: {idv}')

# --- Permanent Version Truth guard for the recovered surface/runtime contract. ---
guard=GUARD.read_text(encoding='utf-8')
anchor='''    files = manifest.get("files")'''
insert='''    if current_num >= (40, 4, 221):
        system_view = read(base / "views/system.html")
        required_simulation_surface = (
            'id="simProfileBadge"',
            'id="simProfileTitle"',
            'id="simProfileCapital"',
            'id="simProfileTicket"',
            'id="simProfileMaxOperation"',
            'id="simProfileMaxExposure"',
            'id="simProfileMinReserve"',
            'id="simProfileAllowedAssets"',
            'data-sim-profile="solo_beginner_100_v1_1_alpha_13"',
            'data-sim-profile="solo_progression_1000_v1"',
            'id="schoolSafeLabel"',
            'id="schoolTooBigLabel"',
            'id="schoolForbiddenLabel"',
            'id="schoolFillLabel"',
            'id="schoolExceedLabel"',
            'id="schoolResetTitle"',
            'id="schoolResetLabel"',
        )
        for marker in required_simulation_surface:
            if system_view.count(marker) != 1:
                fail(f"40.4.221 Simulation dual-profile surface regression: {marker} count={system_view.count(marker)}")
        required_simulation_runtime = (
            "solo_beginner_100_v1_1_alpha_13",
            "solo_progression_1000_v1",
            "function switchSimulationProfile(profileKey)",
            "localStorage.setItem(SIM_ACTIVE_PROFILE_STORAGE_KEY, SIM_PROFILE.key)",
            'document.querySelectorAll("[data-sim-profile]")',
            "function renderSchoolProfileLabels()",
            "const unit = SIM_PROFILE.maxExposure / 3",
        )
        for marker in required_simulation_runtime:
            if marker not in root:
                fail(f"40.4.221 protected Simulation runtime contract missing: {marker}")
        if "views/system.html" not in files:
            fail("40.4.221 System presentation payload escaped version manifest hash authority")
        system_loader_files = []
        for candidate in base.rglob("*.js"):
            payload = read(candidate)
            if "views/system.html" in payload:
                system_loader_files.append((candidate, payload))
        versioned_loader_hits = []
        for candidate, payload in system_loader_files:
            if "views/system.html?v=administrator-build-40.4.221" in payload:
                versioned_loader_hits.append(candidate)
        if len(versioned_loader_hits) != 1:
            fail(f"40.4.221 System view cache owner mismatch: {versioned_loader_hits}")

    files = manifest.get("files")'''
if guard.count(anchor)!=1: raise SystemExit(f'STOP guard files anchor count={guard.count(anchor)}')
guard=guard.replace(anchor,insert,1)
GUARD.write_text(guard,encoding='utf-8')

# --- Continuity documents: only record what was actually changed. ---
release_manifest=DOCS/'AGENT_CRYPTO_RELEASE_MANIFEST.md'
t=release_manifest.read_text(encoding='utf-8')
t=once(t,'Release courante : **40.4.220**','Release courante : **40.4.221**','release manifest version')
t=once(t,'commit final 40.4.220','commit final 40.4.221','release manifest archive')
if '40.4.221 est une release de **Simulation Dual Profile Surface Truth**' not in t:
    t += '\n40.4.221 est une release de **Simulation Dual Profile Surface Truth** : la sous-vue `views/system.html` est reconnectée au moteur dual-profile déjà présent. Les sélecteurs École 100 € / Progression 1 000 €, les valeurs de profil et les libellés du Mode École redeviennent dynamiques. Les deux portefeuilles, journaux, sauvegardes, IndexedDB, workspaces Kraken Paper, onze leçons et calculs de simulation restent inchangés.\n'
release_manifest.write_text(t,encoding='utf-8')

prompt=DOCS/'PROMPT_REPRISE_AETHER_AGENT_CRYPTO.md'
t=prompt.read_text(encoding='utf-8')
t=once(t,'Version de reprise : **40.4.220**','Version de reprise : **40.4.221**','prompt version')
if '40.4.221 reconnecte la **façade Simulation dual-profile**' not in t:
    t += '\n40.4.221 reconnecte la **façade Simulation dual-profile** au runtime historique : `solo_beginner_100_v1_1_alpha_13` et `solo_progression_1000_v1` restent deux états locaux isolés. `views/system.html` porte de nouveau les hooks dynamiques du profil et du Mode École ; aucune reconstruction du moteur, des 11 leçons, du journal, d’IndexedDB ou de Kraken Paper.\n'
prompt.write_text(t,encoding='utf-8')

ledger=DOCS/'AGENT_CRYPTO_FIN_DE_FIL_AETHER.md'
t=ledger.read_text(encoding='utf-8')
t=once(t,'Version canonique de clôture : **40.4.220**','Version canonique de clôture : **40.4.221**','ledger version')
t=once(t,'## 1. Cascade finale 40.4.205 → 40.4.220','## 1. Cascade finale 40.4.205 → 40.4.221','ledger cascade')
if '- **40.4.221** — Simulation Dual Profile Surface Truth' not in t:
    marker='''- **40.4.220** — Atlas Heartbeat Owner Guard : le contrat one-shot CURRENT 40.4.212 devient invariant de CI ; propriétaire canonique, fallback existant et absence de primitives récurrentes/réseau sont vérifiés à chaque release.\n'''
    addition='''- **40.4.221** — Simulation Dual Profile Surface Truth : reconnexion de la sous-vue System aux deux profils déjà existants (École 100 € / Progression 1 000 €), aux valeurs dynamiques et aux libellés du Mode École ; moteur, journaux, IndexedDB, Kraken Paper et 11 modules protégés.\n'''
    t=once(t,marker,marker+addition,'ledger .221 append')
ledger.write_text(t,encoding='utf-8')

contract={
  'build':'40.4.221','scope':'simulation_dual_profile_surface_truth','market_core':'38.15.11',
  'simulation_engine_change':False,'simulation_profile_definitions_change':False,
  'simulation_storage_change':False,'simulation_journal_change':False,'indexeddb_change':False,
  'learning_modules_change':False,'kraken_paper_change':False,'atlas_change':False,
  'system_view_change':True,'dual_profile_controls_restored':True,'profile_dynamic_hooks_restored':True,
  'school_dynamic_hooks_restored':True,'system_view_cache_token_advanced':True,
  'system_view_manifest_hashed':True,'data_change':False,'geometry_engine_change':False,
  'fetch_added':False,'timer_added':False,'observer_added':False,'websocket_added':False,'raf_added':False
}
cp=Path('/tmp/contract404221.json'); cp.write_text(json.dumps(contract,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
run('python','.github/scripts/agent_crypto_release_driver.py',
    '--build','40.4.221','--parent','40.4.220',
    '--release','SIMULATION DUAL PROFILE SURFACE TRUTH · 100/1000 SCHOOL RECONNECT LOCK',
    '--status','simulation_dual_profile_surface_truth_404221_operator_validation_required',
    '--contract-key','simulation_dual_profile_surface_truth_404221','--contract-json',str(cp),
    '--lineage-note','40.4.221 reconnects the extracted System/Simulation presentation to the already-existing 100 EUR / 1000 EUR isolated profile engine and dynamic School labels; simulation business/storage owners remain unchanged.')

# --- Publication proof. ---
run('node','--check',str(ADMIN/'app.js')); run('node','--check',str(ADMIN/'js/app.js'))
run('python','-m','py_compile','.github/scripts/agent_crypto_version_truth_guard.py','.github/scripts/agent_crypto_release_driver.py')
run('python','.github/scripts/agent_crypto_version_truth_guard.py','--expected-build','40.4.221')

# Confirm release driver produced a valid System view hash and did not mutate project data.
fm=json.loads(manifest_path.read_text(encoding='utf-8'))
h=str((fm.get('files') or {}).get('views/system.html') or '')
if not re.fullmatch(r'[0-9a-f]{64}',h): raise SystemExit(f'STOP invalid views/system.html manifest hash: {h}')
if h!=sha(SYSTEM): raise SystemExit('STOP views/system.html hash mismatch after release driver')
changed=subprocess.run(['git','diff','--name-only'],capture_output=True,text=True,check=True).stdout.splitlines()
if any(x.startswith('public/agent_crypto_erith_ia/data/') for x in changed): raise SystemExit('STOP market data files changed')
# Protected runtime contract remains after release identity update.
app_after=APP.read_text(encoding='utf-8')
for marker in required_engine:
    if marker not in app_after: raise SystemExit(f'STOP protected Simulation runtime changed/missing after release: {marker}')
primitive_after={k:app_after.count(k) for k in primitive_keys}
if primitive_after!=primitive_before: raise SystemExit(f'STOP app runtime primitive budget drift: {primitive_before} -> {primitive_after}')
run('git','diff','--check')

# Final commit must contain no temporary audit/release machinery.
run('git','config','user.name','Aether Release'); run('git','config','user.email','41898282+github-actions[bot]@users.noreply.github.com')
for p in [WORKFLOW,SELF,*TMP_FILES]:
    if p.exists(): run('git','rm',str(p))
for p in (GUARD,SYSTEM,owner_path,ADMIN/'app.js',ADMIN/'js/app.js',ADMIN/'index.html',ADMIN/'version.json',ADMIN/'administrator-version.json',ADMIN/'build.json',release_manifest,prompt,ledger):
    if p.exists(): run('git','add',str(p))
run('git','commit','-m','release(agent-crypto): 40.4.221 reconnect Simulation dual-profile surface')
run('git','pull','--rebase','origin','main')
run('python','.github/scripts/agent_crypto_version_truth_guard.py','--expected-build','40.4.221')
run('git','push','origin','HEAD:main')
print(json.dumps({'ok':True,'build':'40.4.221','market_core':'38.15.11','system_view':str(SYSTEM),'system_loader':str(owner_path),'profile_engine_changed':False},ensure_ascii=False))
