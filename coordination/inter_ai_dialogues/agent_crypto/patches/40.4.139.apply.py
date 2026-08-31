from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, re, zipfile

REPO=Path('.')
ROOT=REPO/'public/agent_crypto_erith_ia/administrator'
REQ=REPO/'coordination/inter_ai_dialogues/agent_crypto/patches/40.4.139.request.json'
CLOCK=REPO/'.github/workflows/atlas-public-crypto-market-clock.yml'
BUILD='40.4.139'
PARENT='40.4.138'
RELEASE='ATLAS FAMILY DEFAULT COLLAPSE · HOT CORE PRESERVED · CANONICAL PRODUCER REARM'
STATUS='candidate_atlas_family_collapse_producer_rearm_operator_validation_required'
ART=REPO/'coordination/inter_ai_dialogues/agent_crypto'
ZIP=ART/'AGENT_CRYPTO_BUILD_40_4_139_ATLAS_FAMILY_COLLAPSE_CANONICAL_PRODUCER_REARM.zip'
REPORT=ART/'AGENT_CRYPTO_40_4_139_VALIDATION_REPORT.md'
SHA_FILE=ART/(ZIP.name+'.sha256')

def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def replace_once(path, old, new, label):
    text=path.read_text(encoding='utf-8')
    n=text.count(old)
    if n!=1: raise SystemExit(f'STOP {label}: expected 1, found {n}')
    path.write_text(text.replace(old,new,1),encoding='utf-8')

req=json.loads(REQ.read_text(encoding='utf-8'))
if req.get('schema')!='agent_crypto_404139_final_recovery_v1' or req.get('build')!=BUILD or req.get('parent_build')!=PARENT:
    raise SystemExit('STOP request schema/build mismatch')
ver=json.loads((ROOT/'version.json').read_text(encoding='utf-8'))
if ver.get('build')!=PARENT or str((ver.get('engine') or {}).get('reference_build'))!='38.15.11':
    raise SystemExit('STOP parent build / Market Core mismatch')
markers=('setInterval(','MutationObserver','IntersectionObserver','new WebSocket','localStorage.setItem')
budget_before={rel:{m:(ROOT/rel).read_text(encoding='utf-8',errors='replace').count(m) for m in markers} for rel in ('app.js','js/app.js')}

js=ROOT/'js/app.js'
t=js.read_text(encoding='utf-8')
replace_pairs=[
('const ADMIN_BUILD = "40.4.138";','const ADMIN_BUILD = "40.4.139";','ADMIN_BUILD'),
('''  function ensureAdministratorAtlasVisible(manager, reason = "role-transition") {\n    if (!manager || presentationRole40312() !== "administrator") return false;\n    try { manager.minimize?.(ADMIN_ATLAS_PRIMARY_FAMILY, false); } catch (_) {}\n\n    const family = q(".atlas-layout-family-intelligence");''','''  function ensureAdministratorAtlasVisible(manager, reason = "role-transition") {\n    if (!manager || presentationRole40312() !== "administrator") return false;\n    // 40.4.139 — visible does not mean forced expanded. Family 02 keeps the\n    // canonical compact/minimized boot state while remaining unhidden.\n    const family = q(".atlas-layout-family-intelligence");''','Atlas visibility does not force expand'),
('''    const directFamily = administratorHashFamily40361();\n    const bootRoleForAtlasPrimaryFamily = presentationRole40312();\n    const staged = [];''','''    const directFamily = administratorHashFamily40361();\n    const staged = [];''','remove boot-role exception'),
('''      const directTarget = directFamily === id;\n      const atlasPrimaryAtAdminBoot =\n        id === ADMIN_ATLAS_PRIMARY_FAMILY && bootRoleForAtlasPrimaryFamily === "administrator";\n      const next = {\n        ...saved,\n        floating: false,\n        minimized: !(directTarget || atlasPrimaryAtAdminBoot),''','''      const directTarget = directFamily === id;\n      const next = {\n        ...saved,\n        floating: false,\n        minimized: !directTarget,''','family 02 obeys default collapse'),
('''    globalThis.ErithAdministratorAtlasVisibility = Object.freeze({\n      owner: "administrator-atlas-primary-family-visibility",''','''    globalThis.ErithAdministratorAtlasVisibility = Object.freeze({\n      build: "40.4.139",\n      compact_boot_preserved: true,\n      owner: "administrator-atlas-primary-family-visibility",''','visibility metadata')]
for old,new,label in replace_pairs:
    n=t.count(old)
    if n!=1: raise SystemExit(f'STOP {label}: expected 1, found {n}')
    t=t.replace(old,new,1)
js.write_text(t,encoding='utf-8')

replace_once(ROOT/'app.js','const ATLAS_BUILD = "40.4.138";','const ATLAS_BUILD = "40.4.139";','ATLAS_BUILD')
index=ROOT/'index.html'; text=index.read_text(encoding='utf-8'); text=text.replace('40.4.138','40.4.139'); index.write_text(text,encoding='utf-8')
aether=ROOT/'js/aether.js'; text=aether.read_text(encoding='utf-8'); text=text.replace('Build: 40.4.138','Build: 40.4.139',1); text=text.replace('build:"40.4.138"','build:"40.4.139"',1); aether.write_text(text,encoding='utf-8')
fam=ROOT/'js/views/atlas-family-demand-residency.js'; text=fam.read_text(encoding='utf-8'); text=text.replace('40.4.138 · Atlas collapsed UI / HOT core residency boundary','40.4.139 · Atlas collapsed UI / HOT core residency boundary',1); text=text.replace('build:"40.4.138"','build:"40.4.139"',1); text=text.replace('pending_wake_404137_preserved:true,','pending_wake_404137_preserved:true,\n    family_02_compact_boot_404139:true,',1); fam.write_text(text,encoding='utf-8')

now=datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00','Z')
changed=['index.html','app.js','js/app.js','js/aether.js','js/views/atlas-family-demand-residency.js']
for fn in ('version.json','administrator-version.json'):
    p=ROOT/fn; d=json.loads(p.read_text(encoding='utf-8'))
    d['release']=RELEASE; d['build']=BUILD; d['asset_token']=f'market-core-v2.0-alpha-build-{BUILD}'; d['status']=STATUS
    d['prepared_at']=now; d['published_at']=now; d['global_versioning']=BUILD; d['parent_build']=PARENT
    d['lineage']=str(d.get('lineage','')).rstrip()+f' → {BUILD} family 02 default compact restoration + canonical producer clock rearm; Atlas HOT core and 40.4.137 pending wake preserved.'
    integ=d.setdefault('integrity',{}); pub=integ.setdefault('publication_identity',{})
    pub.update({'build':BUILD,'asset_token':f'market-core-v2.0-alpha-build-{BUILD}','status':STATUS})
    integ['atlas_family_default_collapse_404139']={'build':BUILD,'public_parent':PARENT,'family':'intelligence-memoire-creation','administrator_boot_compact':True,'direct_hash_can_open':True,'family_hidden':False,'atlas_hot_core_preserved':True,'atlas_pending_wake_404137_preserved':True,'window_manager_implementation_changed':False,'firefox_operator_validation_required':True}
    integ['canonical_producer_clock_rearm_404139']={'build':BUILD,'owner':'.github/workflows/atlas-public-crypto-market-clock.yml','new_scheduler':False,'new_collector':False,'bootstrap_revision':2,'observed_stale_canonical_local_time':'2026-08-31 21:38:06 Europe/Paris','recurrence_requires_github_runtime_proof':True}
    files=d.setdefault('files',{})
    for rel in changed: files[rel]=sha(ROOT/rel)
    files['../../../.github/workflows/atlas-public-crypto-market-clock.yml']=sha(CLOCK)
    if fn=='administrator-version.json': pub['app_sha256']=sha(ROOT/'app.js')
    p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
admin_sha=sha(ROOT/'administrator-version.json')
p=ROOT/'version.json'; d=json.loads(p.read_text(encoding='utf-8')); d['integrity']['publication_identity']['app_sha256']=sha(ROOT/'app.js'); d['integrity']['publication_identity']['administrator_version_sha256']=admin_sha; p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

js_text=(ROOT/'js/app.js').read_text(encoding='utf-8')
assert 'manager.minimize?.(ADMIN_ATLAS_PRIMARY_FAMILY, false)' not in js_text
assert 'atlasPrimaryAtAdminBoot' not in js_text and 'bootRoleForAtlasPrimaryFamily' not in js_text
assert 'minimized: !directTarget' in js_text and 'compact_boot_preserved: true' in js_text
fam_text=(ROOT/'js/views/atlas-family-demand-residency.js').read_text(encoding='utf-8')
assert 'const HOT_ROOT="#atlas-local-ai-collapse"' in fam_text and 'hot_root_registered_for_detach:false' in fam_text
root_text=(ROOT/'app.js').read_text(encoding='utf-8')
assert '40.4.137 — ATLAS AUTO RESIDENT WAKE RECOVERY' in root_text
ids=re.findall(r'\bid=["\']([^"\']+)["\']',(ROOT/'index.html').read_text(encoding='utf-8'))
if len(ids)!=len(set(ids)): raise SystemExit('STOP duplicate HTML ids')
for rel in ('app.js','js/app.js'):
    after=(ROOT/rel).read_text(encoding='utf-8',errors='replace')
    for m in markers:
        if after.count(m)>budget_before[rel][m]: raise SystemExit(f'STOP runtime budget increased {rel} {m}')
for fn in ('version.json','administrator-version.json'):
    d=json.loads((ROOT/fn).read_text(encoding='utf-8'))
    if d.get('build')!=BUILD or d.get('global_versioning')!=BUILD or d.get('parent_build')!=PARENT: raise SystemExit('STOP manifest identity')
if json.loads((ROOT/'version.json').read_text(encoding='utf-8')).get('engine',{}).get('reference_build')!='38.15.11': raise SystemExit('STOP Market Core changed')

ART.mkdir(parents=True,exist_ok=True)
package=[ROOT/'version.json',ROOT/'administrator-version.json',ROOT/'app.js',ROOT/'index.html',ROOT/'js/app.js',ROOT/'js/aether.js',ROOT/'js/views/atlas-family-demand-residency.js',CLOCK]
with zipfile.ZipFile(ZIP,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for q in package: z.write(q,q.relative_to(REPO).as_posix())
zip_sha=sha(ZIP); SHA_FILE.write_text(f'{zip_sha}  {ZIP.name}\n',encoding='utf-8')
REPORT.write_text(f'''# Agent-Crypto 40.4.139 — Validation Report\n\n- Parent: `{PARENT}`\n- Market Core: `38.15.11` protected\n- Release: `{RELEASE}`\n- Published candidate prepared: `{now}`\n- ZIP SHA-256: `{zip_sha}`\n\n## Reproduced failures\n\n1. Family `02 · Intelligence, mémoire & création` was forced expanded in Administrator by `ensureAdministratorAtlasVisible()` and `atlasPrimaryAtAdminBoot`.\n2. Canonical `data/crypto/latest.json` remained at 31/08/2026 21:38:06 Europe/Paris while direct Graph/Scanner data continued to advance.\n\n## Surgery\n\n- Family 02 starts docked compact/minimized unless an explicit hash targets it.\n- Administrator visibility recovery no longer expands family 02.\n- Inner Atlas HOT core remains resident while presentation is collapsed.\n- 40.4.137 pending-canonical wake is preserved.\n- Existing canonical market clock rearmed at bootstrap revision 2; no new scheduler or collector.\n\n## Gates\n\n- JS syntax gate: executed by workflow after this script.\n- HTML IDs unique: PASS.\n- Forced family-02 expansion removed: PASS.\n- Atlas HOT root non-detachable: PASS.\n- Pending wake preserved: PASS.\n- Runtime recurring-owner budget: unchanged.\n- Market Core 38.15.11: protected.\n\n## Firefox gate\n\nPASS requires a new canonical `data/crypto/latest.json` followed, in already-open Firefox with family 02 compact, by exactly one `Atlas 0/4 → 4/4 → NØX → Aerith → CURRENT → REPOS` cycle without F5 or opening Atlas.\n''',encoding='utf-8')
print({'build':BUILD,'zip_sha256':zip_sha,'clock_sha256':sha(CLOCK)})
