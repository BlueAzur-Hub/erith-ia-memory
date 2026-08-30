from pathlib import Path
import re,json,hashlib,subprocess,argparse
parser=argparse.ArgumentParser()
parser.add_argument('--root', default='.')
args=parser.parse_args()
root=Path(args.root).resolve()
adm=root/'public/agent_crypto_erith_ia/administrator'
build='40.4.106'
release='CHRONOS STABLE ID · AETHER 90S READABILITY · NEWS FEED CLEAN LOCK'
status='candidate_chronos_stable_id_aether_90s_news_feed_operator_validation_required'
prepared='2026-08-30T14:22:34Z'

def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()

BASE_EXPECTED={'index.html': '91e2a3e80c0f6f6d8bc31568a4e9f9fa50eff27a06a6a575fbf2297641a4ae3d', 'app.js': '534fab998151a57494d989a6938b1cc1c635ee804fb786704833e6ebc907f90d', 'js/app.js': 'e3be286d323cf14d7f163cff7288d21fc306e46d7697b007bb5f2cdc9f9a373a', 'js/aether.js': '30a44515262a3ca152f8745dbf0a48c6f657431f6121a4afb3c4ea32594e6065', 'admin-chronos.css': 'c41425f55fcfe2d1b1083d9d0909432186b07abd7957504e9a595bd0e3284aa0', 'admin-ribbons.css': '37517595ceb6addbbd983831a9cc34fd76343c2cf1d8407d0ab3616be4928b55', 'administrator-version.json': '85b441ea03b6cb8ee2b5582612c0683979e1c2f63683a22fac9a2c6cad0608d0', 'version.json': '654f1604cbc985064d7f6377c5beec7f986ee894b45fd552bc9651423774675a'}
for rel,want in BASE_EXPECTED.items():
    got=sha(adm/rel)
    if got!=want: raise SystemExit(f'base drift {rel}: {got} != {want}')

def replace_once(s,old,new,label):
    c=s.count(old)
    if c!=1: raise SystemExit(f'{label}: expected 1, got {c}')
    return s.replace(old,new,1)

# INDEX: build identity + stable Chronos public DOM id. No other Chronos internals renamed.
p=adm/'index.html'; s=p.read_text(encoding='utf-8')
if s.count('40.4.105') != 11: raise SystemExit(f'index 40.4.105 count drift {s.count("40.4.105")}')
s=s.replace('40.4.105',build)
s=s.replace('AETHER FRENCH NEWS · CHRONOS CANONICAL OWNER · VERSION TRUTH LOCK',release)
s=s.replace('atlasCelestialClockHeader4055','atlasCelestialClockHeader')
p.write_text(s,encoding='utf-8')

# CHRONOS: stable selector + one geometric fix at the grid item itself.
p=adm/'admin-chronos.css'; s=p.read_text(encoding='utf-8')
s=s.replace('40.4.105 — canonical single-owner alignment.','40.4.106 — stable public ID + grid-item centering owner.')
s=s.replace('atlasCelestialClockHeader4055','atlasCelestialClockHeader')
needle='''  display:flex !important;\n  align-items:center !important;\n  justify-content:center !important;\n  flex-wrap:nowrap !important;\n'''
insert='''  display:flex !important;\n  grid-column:1 / -1 !important;\n  justify-self:center !important;\n  align-items:center !important;\n  justify-content:center !important;\n  flex-wrap:nowrap !important;\n'''
s=replace_once(s,needle,insert,'chronos grid centering')
p.write_text(s,encoding='utf-8')

# AETHER RIBBONS: 90s operator cadence. 30s native, 15s info, 36s feed, 9s system.
p=adm/'admin-ribbons.css'; s=p.read_text(encoding='utf-8')
s=s.replace('40.4.103 — AETHER NEWS SENTINEL CONTEXT FEED · SOFT OPERATOR PRESENTATION LOCK','40.4.106 — AETHER NEWS SENTINEL CONTEXT FEED · 90S READABILITY LOCK')
s=s.replace('Cadence remains 18 s NORMAL · 9 s INFO · 27 s FEED · 6 s SYSTEM = 60 s.','Cadence: 30 s NORMAL · 15 s INFO · 36 s FEED · 9 s SYSTEM = 90 s.')
old='''@keyframes atlasStatusNativePhase{\n  0%,29.999%{opacity:1;visibility:visible}\n  30%,100%{opacity:0;visibility:hidden}\n}\n@keyframes atlasAetherBandPhase{\n  0%,29.999%{opacity:0;visibility:hidden}\n  30%,100%{opacity:1;visibility:visible}\n}\n@keyframes atlasAetherInfoPhase{\n  0%,29.999%{opacity:0;visibility:hidden}\n  30%,44.999%{opacity:1;visibility:visible}\n  45%,100%{opacity:0;visibility:hidden}\n}\n@keyframes atlasAetherVeillePhase{\n  0%,44.999%{opacity:0;visibility:hidden}\n  45%,89.999%{opacity:1;visibility:visible}\n  90%,100%{opacity:0;visibility:hidden}\n}\n@keyframes atlasAetherSystemPhase{\n  0%,89.999%{opacity:0;visibility:hidden}\n  90%,100%{opacity:1;visibility:visible}\n}\n@keyframes atlasAetherVeilleTicker4087{\n  0%,49.999%{transform:translateX(0)}\n  50%{transform:translateX(0)}\n  83.333%,99.999%{transform:translateX(-50%)}\n  100%{transform:translateX(0)}\n}\n'''
new='''@keyframes atlasStatusNativePhase{\n  0%,33.332%{opacity:1;visibility:visible}\n  33.333%,100%{opacity:0;visibility:hidden}\n}\n@keyframes atlasAetherBandPhase{\n  0%,33.332%{opacity:0;visibility:hidden}\n  33.333%,100%{opacity:1;visibility:visible}\n}\n@keyframes atlasAetherInfoPhase{\n  0%,33.332%{opacity:0;visibility:hidden}\n  33.333%,49.999%{opacity:1;visibility:visible}\n  50%,100%{opacity:0;visibility:hidden}\n}\n@keyframes atlasAetherVeillePhase{\n  0%,49.999%{opacity:0;visibility:hidden}\n  50%,89.999%{opacity:1;visibility:visible}\n  90%,100%{opacity:0;visibility:hidden}\n}\n@keyframes atlasAetherSystemPhase{\n  0%,89.999%{opacity:0;visibility:hidden}\n  90%,100%{opacity:1;visibility:visible}\n}\n@keyframes atlasAetherVeilleTicker4087{\n  0%,54.444%{transform:translateX(0)}\n  83.333%,99.999%{transform:translateX(-50%)}\n  100%{transform:translateX(0)}\n}\n'''
s=replace_once(s,old,new,'aether keyframes')
s=s.replace('animation:atlasStatusNativePhase 60s steps(1,end) infinite!important','animation:atlasStatusNativePhase 90s steps(1,end) infinite!important')
s=s.replace('animation:atlasAetherBandPhase 60s steps(1,end) infinite!important','animation:atlasAetherBandPhase 90s steps(1,end) infinite!important')
s=s.replace('animation:atlasAetherInfoPhase 60s steps(1,end) infinite!important','animation:atlasAetherInfoPhase 90s steps(1,end) infinite!important')
s=s.replace('animation:atlasAetherVeillePhase 60s steps(1,end) infinite!important','animation:atlasAetherVeillePhase 90s steps(1,end) infinite!important')
s=s.replace('animation:atlasAetherSystemPhase 60s steps(1,end) infinite!important','animation:atlasAetherSystemPhase 90s steps(1,end) infinite!important')
s=s.replace('animation:atlasAetherVeilleTicker4087 60s linear infinite!important','animation:atlasAetherVeilleTicker4087 90s linear infinite!important')
p.write_text(s,encoding='utf-8')

# AETHER runtime: clean feed payload, 90s metadata, no new timer/fetch.
p=adm/'js/aether.js'; s=p.read_text(encoding='utf-8')
s=replace_once(s,'Build: 40.4.104','Build: 40.4.106','aether build comment')
s=s.replace('Revision: French News presentation — VEILLE / CONTEXTE prefer headline_fr with canonical English fallback; SYSTEM unchanged.','Revision: stable 90 s operator cadence; VEILLE / CONTEXTE keep French-first News presentation and only the informative payload scrolls.')
old='''    const detail=[snapshot.label,snapshot.decision,headline,evidence?`preuve ${evidence}/100`:null,action,freshness,source].filter(Boolean).join(" · ");'''
new='''    const detail=[headline,evidence?`preuve ${evidence}/100`:null,action,freshness,source].filter(Boolean).join(" · ");'''
s=replace_once(s,old,new,'alert detail clean')
s=s.replace('The 60 s CSS timeline holds the new headline until VEILLE appears,','The 90 s CSS timeline holds the new headline until VEILLE appears,')
s=replace_once(s,'build:"40.4.104"','build:"40.4.106"','aether api build')
s=replace_once(s,'cadence_seconds:60,\n    normal_seconds:18,\n    info_seconds:9,\n    veille_seconds:27,\n    system_seconds:6,','cadence_seconds:90,\n    normal_seconds:30,\n    info_seconds:15,\n    veille_seconds:36,\n    system_seconds:9,','aether api cadence')
p.write_text(s,encoding='utf-8')

# Main build identities.
p=adm/'app.js'; s=p.read_text(encoding='utf-8'); s=replace_once(s,'const ATLAS_BUILD = "40.4.105";','const ATLAS_BUILD = "40.4.106";','root app build'); p.write_text(s,encoding='utf-8')
p=adm/'js/app.js'; s=p.read_text(encoding='utf-8'); s=replace_once(s,'const ADMIN_BUILD = "40.4.105";','const ADMIN_BUILD = "40.4.106";','admin js build'); s=replace_once(s,'const ADMIN_RELEASE = "AETHER FRENCH NEWS · CHRONOS CANONICAL OWNER · VERSION TRUTH LOCK";',f'const ADMIN_RELEASE = "{release}";','admin js release'); p.write_text(s,encoding='utf-8')

# Manifests after content hashes.
changed={
 'index.html':sha(adm/'index.html'),
 'app.js':sha(adm/'app.js'),
 'js/app.js':sha(adm/'js/app.js'),
 'js/aether.js':sha(adm/'js/aether.js'),
 'admin-chronos.css':sha(adm/'admin-chronos.css'),
 'admin-ribbons.css':sha(adm/'admin-ribbons.css'),
}
release_note='40.4.106 — CHRONOS STABLE ID · AETHER 90S READABILITY · NEWS FEED CLEAN LOCK: replaces the build-stamped Chronos public DOM id with #atlasCelestialClockHeader, centers the complete Chronos grid item across the full sourceTimeCard grid, slows the Aether single-lane cycle to 90 s (30/15/36/9), and removes duplicate status/decision text from the scrolling VEILLE payload. French-first News fallback, Market Core 38.15.11, Graph/Top5, CURRENT, Atlas, Oracle, Learning, Bridge and Window Manager are unchanged.'
feature={
 'build':build,
 'chronos_public_id':'atlasCelestialClockHeader',
 'chronos_build_suffix_removed':True,
 'chronos_grid_column':'1 / -1',
 'chronos_justify_self':'center',
 'aether_cadence_seconds':90,
 'aether_normal_seconds':30,
 'aether_info_seconds':15,
 'aether_feed_seconds':36,
 'aether_system_seconds':9,
 'aether_feed_hold_seconds':4,
 'aether_feed_scroll_seconds':26,
 'aether_feed_breathe_seconds':6,
 'aether_only_payload_scrolls':True,
 'aether_duplicate_status_decision_removed_from_scroll':True,
 'veille_context_alternation_preserved':True,
 'headline_fr_preferred':True,
 'new_browser_fetch':False,
 'new_browser_timer':False,
 'market_core_changed':False,
 'graph_top5_changed':False,
 'current_changed':False,
 'atlas_changed':False,
 'oracle_changed':False,
 'learning_changed':False,
 'bridge_changed':False,
 'window_manager_changed':False,
}

def common(d):
    d['build']=build; d['release']=release; d['status']=status; d['prepared_at']=prepared; d['published_at']=None
    if 'global_versioning' in d: d['global_versioning']=build
    d['asset_token']=f'market-core-v2.0-alpha-build-{build}'
    d['parent_build']='40.4.105'
    d['lineage']=d.get('lineage','')+' → 40.4.106 Chronos stable public ID + full-grid centering + Aether 90s readability/feed clean lock'
    d.setdefault('release_notes',[]).insert(0,release_note)
    d.setdefault('files',{}).update(changed)
    integ=d.setdefault('integrity',{})
    pub=integ.setdefault('publication_identity',{})
    pub.update({'build':build,'asset_token':f'market-core-v2.0-alpha-build-{build}','status':status,'app_sha256':changed['app.js']})
    integ['chronos_stable_id_aether_90s_feed_clean_404106']=feature.copy()
    d.setdefault('features',{})['chronos_stable_id_aether_90s_feed_clean_404106']=feature.copy()
    return d

ap=adm/'administrator-version.json'; d=common(json.loads(ap.read_text(encoding='utf-8'))); ap.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8'); adminsha=sha(ap)
vp=adm/'version.json'; d=common(json.loads(vp.read_text(encoding='utf-8'))); d['integrity']['publication_identity']['administrator_version_sha256']=adminsha; vp.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

# Tests
assert 'atlasCelestialClockHeader4055' not in (adm/'index.html').read_text(encoding='utf-8')
assert 'atlasCelestialClockHeader4055' not in (adm/'admin-chronos.css').read_text(encoding='utf-8')
assert (adm/'index.html').read_text(encoding='utf-8').count('atlasCelestialClockHeader')==2
assert 'grid-column:1 / -1 !important;' in (adm/'admin-chronos.css').read_text(encoding='utf-8')
assert 'justify-self:center !important;' in (adm/'admin-chronos.css').read_text(encoding='utf-8')
css=(adm/'admin-ribbons.css').read_text(encoding='utf-8')
for token in ['atlasStatusNativePhase 90s','atlasAetherBandPhase 90s','atlasAetherInfoPhase 90s','atlasAetherVeillePhase 90s','atlasAetherSystemPhase 90s','atlasAetherVeilleTicker4087 90s']:
    assert token in css, token
js=(adm/'js/aether.js').read_text(encoding='utf-8')
for token in ['cadence_seconds:90','normal_seconds:30','info_seconds:15','veille_seconds:36','system_seconds:9']:
    assert token in js, token
assert '[snapshot.label,snapshot.decision,headline' not in js
assert '[headline,evidence?' in js

for f in ['index.html','app.js','js/app.js','js/aether.js','admin-chronos.css','admin-ribbons.css','administrator-version.json','version.json']:
    pp=adm/f
    print(f, pp.stat().st_size, sha(pp))
