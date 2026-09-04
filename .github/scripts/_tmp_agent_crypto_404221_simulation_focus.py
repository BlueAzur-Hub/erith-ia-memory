#!/usr/bin/env python3
from pathlib import Path
import re, subprocess, json

ROOT=Path('public/agent_crypto_erith_ia/administrator')
APP=ROOT/'app.js'; INDEX=ROOT/'index.html'
subprocess.run(['python','.github/scripts/agent_crypto_version_truth_guard.py','--expected-build','40.4.220'],check=True)
app=APP.read_text(encoding='utf-8',errors='replace')
index=INDEX.read_text(encoding='utf-8',errors='replace')
app_lines=app.splitlines(); idx_lines=index.splitlines()

def ctx(lines,ln,b=4,a=7):
    lo=max(1,ln-b); hi=min(len(lines),ln+a)
    for j in range(lo,hi+1): print(f'{j:06d}: {lines[j-1]}')

def hits(text,token):
    return [i for i,l in enumerate(text.splitlines(),1) if token in l]

print('===== PROFILE SURFACE HTML ID CARDINALITY =====')
ids=['simProfileTitle','simProfileBadge','simProfileCapital','simProfileTicket','simProfileMaxOperation','simProfileMaxExposure','simProfileMinReserve','simProfileAllowedAssets','simCash','simPositionsValue','simTotalValue','simPnL','simProfileStatus','learningCockpitProfile','learningCockpitPortfolio']
for idv in ids:
    exact=re.findall(rf'\bid=["\']{re.escape(idv)}["\']',index,re.I)
    print(idv,'count',len(exact))
    for ln in hits(index,idv): ctx(idx_lines,ln,2,3)

print('\n===== PROFILE SURFACE APP WRITERS =====')
for idv in ids:
    hs=hits(app,idv)
    print('\n',idv,'hits',hs)
    for ln in hs: ctx(app_lines,ln,3,5)

print('\n===== ALL SIM_PROFILE ASSIGNMENTS =====')
for i,l in enumerate(app_lines,1):
    if re.search(r'\bSIM_PROFILE\s*=',l): ctx(app_lines,i,5,8)

print('\n===== ALL STATE.SIM ASSIGNMENTS =====')
for i,l in enumerate(app_lines,1):
    if re.search(r'\bstate\.sim\s*=',l): ctx(app_lines,i,3,5)

print('\n===== PROFILE SWITCH LISTENERS / BUTTONS =====')
for token in ('data-sim-profile','switchSimulationProfile','SIM_ACTIVE_PROFILE_STORAGE_KEY'):
    print('\nTOKEN',token)
    for ln in hits(app,token): ctx(app_lines,ln,4,7)
    for ln in hits(index,token): ctx(idx_lines,ln,3,5)

print('\n===== FULL RESET STORAGE TARGETS =====')
for token in ('function agentCryptoResetLocalStorageTargets','SIM_ACTIVE_PROFILE_STORAGE_KEY','SIM_STORAGE_PREFIX'):
    hs=hits(app,token)
    print(token,hs)
    for ln in hs[:12]: ctx(app_lines,ln,6,12)

print('\n===== PROFILE STATUS / COCKPIT OWNERS =====')
for token in ('function getSimulationProfileStatus','function renderLearningJourneyCockpit','learningCockpitProfile','learningCockpitPortfolio','function renderSimulation()'):
    hs=hits(app,token); print(token,hs)
    for ln in hs[:8]: ctx(app_lines,ln,8,28)

print('\n===== STATIC PROFILE COPY CANDIDATES =====')
for literal in ('100 €','1 000 €','Solo Débutant','Solo Progression','ticket 50','ticket 5','max 100','max 10','réserve min 700','réserve min 70'):
    ah=hits(app,literal); ih=hits(index,literal)
    print(literal,'app',ah,'index',ih)
    for ln in ah[:8]: ctx(app_lines,ln,2,3)
    for ln in ih[:8]: ctx(idx_lines,ln,2,3)

print('\n===== PROFILE STORAGE INTEGRITY FACTS =====')
facts={
 'dual_profiles': all(x in app for x in ('solo_progression_1000_v1','solo_beginner_100_v1_1_alpha_13')),
 'stored_profile_boot': 'SIM_PROFILES[getStoredSimulationProfileKey()]' in app,
 'switch_saves_old': 'if (state.sim) saveSimulation();' in app,
 'switch_persists_profile': 'localStorage.setItem(SIM_ACTIVE_PROFILE_STORAGE_KEY, SIM_PROFILE.key)' in app,
 'switch_nulls_state': 'state.sim = null;' in app,
 'profile_workspace_storage': 'simulationStorageKeyForWorkspace404142(profile = SIM_PROFILE' in app,
 'render_profile_dynamic': 'els.simProfileCapital.textContent = `${fmtEUR.format(SIM_PROFILE.startCash)} virtuels`' in app,
 'render_wallet_from_state': 'setText(els.simCash, fmtEUR.format(atlasZeroCurrency(state.sim.cash)))' in app,
 'school_dynamic': 'const unit = SIM_PROFILE.maxExposure / 3' in app,
}
print(json.dumps(facts,ensure_ascii=False,indent=2))

for p in sorted(ROOT.rglob('*.js')):
    r=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
    if r.returncode: print(r.stderr); raise SystemExit(2)
print('NODE_OK')
print('FOCUS2_404221_OK')
