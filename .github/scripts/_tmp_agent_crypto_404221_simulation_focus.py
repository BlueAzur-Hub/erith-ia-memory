#!/usr/bin/env python3
from pathlib import Path
import re, subprocess

ROOT=Path('public/agent_crypto_erith_ia/administrator')
APP=ROOT/'app.js'
INDEX=ROOT/'index.html'

subprocess.run(['python','.github/scripts/agent_crypto_version_truth_guard.py','--expected-build','40.4.220'],check=True)

def show_range(path,start,end,label):
    lines=path.read_text(encoding='utf-8',errors='replace').splitlines()
    print(f'\n===== {label} · {path}:{start}-{end} =====')
    for i in range(start,min(end,len(lines))+1):
        print(f'{i:06d}: {lines[i-1]}')

def show_function(text,name,radius=80):
    lines=text.splitlines()
    for i,l in enumerate(lines,1):
        if re.search(rf'\bfunction\s+{re.escape(name)}\s*\(',l):
            show_range(APP,max(1,i-8),min(len(lines),i+radius),name)
            return i
    print(f'FUNCTION_NOT_FOUND {name}')
    return None

app=APP.read_text(encoding='utf-8',errors='replace')
index=INDEX.read_text(encoding='utf-8',errors='replace')

# Exact suspicious reset + dual-profile core.
show_range(APP,34695,34815,'FULL LEARNING RESET / PROFILE RESET CONTEXT')
show_range(APP,35228,35365,'DUAL PROFILE + WORKSPACE STORAGE OWNERS')
for fn in (
    'setSimulationProfile',
    'loadSimulation',
    'renderSimulation',
    'renderSimulationReadiness404152',
    'renderSimulationAcceptance404153',
    'renderSchoolProfileLabels',
    'runSchoolTest',
    'memoryLearningConclusion',
    'renderLearningCockpit',
):
    show_function(app,fn,95)

# Locate all writers/uses of key surface ids.
ids=(
 'simProfileTitle','simProfileBadge','simProfileCapital','simProfileTicket',
 'simProfileMaxOperation','simProfileMaxExposure','simProfileMinReserve',
 'simProfileAllowedAssets','simCash','simPositionsValue','simTotal','simPnl',
 'learningCockpitProfile','learningCockpitPortfolio','simulationReadiness404152',
 'simulationAcceptance404153'
)
print('\n===== SURFACE ID OWNERS =====')
lines=app.splitlines()
for token in ids:
    hits=[i for i,l in enumerate(lines,1) if token in l]
    print(f'\n### {token} hits={hits}')
    for ln in hits:
        lo=max(1,ln-3); hi=min(len(lines),ln+5)
        for j in range(lo,hi+1): print(f'{j:06d}: {lines[j-1]}')

# Literal stale profile/snapshot/project copy owners.
print('\n===== STALE LITERAL OWNERS =====')
for literal in (
 'Solo Débutant 100 €','Solo Progression 1 000 €','Profil 100 €','Profil 1 000 €',
 'Créer un 3e snapshot plus tard','Préparer V1.2-local-plan après repos','AGENTS À VENIR',
 'Préparation visuelle seulement','future machine privée','Kraken plus tard'
):
    for path,text in ((APP,app),(INDEX,index)):
        pos=0; count=0
        while True:
            k=text.find(literal,pos)
            if k<0: break
            count+=1; ln=text.count('\n',0,k)+1
            src=text.splitlines(); lo=max(1,ln-4); hi=min(len(src),ln+7)
            print(f'\n--- {path.name}:{ln} {literal!r} ---')
            for j in range(lo,hi+1): print(f'{j:06d}: {src[j-1]}')
            pos=k+len(literal)
            if count>=12: break

# HTML simulation section by known heading.
idx_lines=index.splitlines()
anchors=[i for i,l in enumerate(idx_lines,1) if 'Simulation micro-transactions' in l]
for ln in anchors[:2]: show_range(INDEX,max(1,ln-45),min(len(idx_lines),ln+220),'SIMULATION HTML SURFACE')

# Invariant facts.
print('\n===== FOCUSED FACTS =====')
print('dual_profiles', app.count('solo_progression_1000_v1'), app.count('solo_beginner_100_v1_1_alpha_13'))
print('profile_storage_key', 'agent_crypto_erith_ia_active_sim_profile_28_2_80' in app)
print('workspace_profile_keying', 'simulationStorageKeyForWorkspace404142(profile = SIM_PROFILE' in app)
print('profile_switch_persists', 'localStorage.setItem(SIM_ACTIVE_PROFILE_STORAGE_KEY, SIM_PROFILE.key)' in app)
print('render_profile_dynamic', 'els.simProfileCapital.textContent = `${fmtEUR.format(SIM_PROFILE.startCash)} virtuels`' in app)
print('school_profile_dynamic', 'const unit = SIM_PROFILE.maxExposure / 3' in app)
print('full_reset_forces_default_count', app.count('SIM_PROFILE = SIM_PROFILES[SIM_DEFAULT_PROFILE_KEY];'))

for p in sorted(ROOT.rglob('*.js')):
    r=subprocess.run(['node','--check',str(p)],capture_output=True,text=True)
    if r.returncode:
        print(r.stderr); raise SystemExit(2)
print('NODE_OK')
print('FOCUS_404221_OK')
