from pathlib import Path
import hashlib
import json
import re
from datetime import datetime, timezone

ROOT = Path('public/agent_crypto_erith_ia/administrator')
BUILD = '40.6.86'
PARENT = '40.6.85'
RELEASE = 'VERSION AUTHORITY CONSOLIDATION · IMMUTABLE ENTRY LOCK'
STATUS = 'version_authority_consolidation_immutable_entry_lock_406086'
TOKEN = f'market-core-v2.0-alpha-build-{BUILD}'
ENGINE = '38.15.11'
REVISION = 'V21'
NOW = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z')


def read(path: Path) -> str:
    return path.read_text(encoding='utf-8')


def write(path: Path, text: str) -> None:
    path.write_text(text, encoding='utf-8')


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def replace_one(text: str, pattern: str, repl, label: str, flags: int = 0) -> str:
    out, count = re.subn(pattern, repl, text, count=1, flags=flags)
    if count != 1:
        raise SystemExit(f'STOP: {label} expected 1 replacement, got {count}')
    return out


build_truth_path = ROOT / 'build.json'
current_build_truth = json.loads(read(build_truth_path))
if str(current_build_truth.get('build') or '').strip() != PARENT:
    raise SystemExit(f'STOP: build.json parent is {current_build_truth.get("build")!r}, expected {PARENT}')

index_path = ROOT / 'index.html'
index = read(index_path)
if f'name="administrator-build" content="{PARENT}"' not in index:
    raise SystemExit('STOP: canonical index is not 40.6.85')

# Canonical HTML identity. Fixes the proven 40.6.64 first-paint drift.
index = replace_one(index, r'(<meta\s+name="atlas-build"\s+content=")[^"]+("\s*/?>)', rf'\g<1>{BUILD}\g<2>', 'meta atlas-build')
index = replace_one(index, r'(<meta\s+name="administrator-build"\s+content=")[^"]+("\s*/?>)', rf'\g<1>{BUILD}\g<2>', 'meta administrator-build')
index = replace_one(index, r'(<meta\s+name="administrator-revision"\s+content=")[^"]+("\s*/?>)', rf'\g<1>{REVISION}\g<2>', 'meta administrator-revision')
index = replace_one(index, r'(<meta\s+name="administrator-release"\s+content=")[^"]+("\s*/?>)', rf'\g<1>{RELEASE}\g<2>', 'meta administrator-release')
index = replace_one(index, r'(<meta\s+name="atlas-asset-token"\s+content=")[^"]+("\s*/?>)', rf'\g<1>{TOKEN}\g<2>', 'meta asset token')
index = replace_one(index, r'<title>Agent-Crypto @erith\.IA — Build [^ ]+ · Administrator</title>', f'<title>Agent-Crypto @erith.IA — Build {BUILD} · Administrator</title>', 'title')
index = replace_one(index, r'(id="atlasVersionTruthControl"[\s\S]*?aria-label="Version Agent-Crypto installée : Build )[^,\"]+(, mode Administrator")', rf'\g<1>{BUILD}\g<2>', 'first paint aria')
index = replace_one(index, r'(<span\s+id="atlasVersionTruthText">Build )[^<]+(</span>)', rf'\g<1>{BUILD}\g<2>', 'first paint badge')
index = replace_one(index, r'<span\s+id="footerRelease">[^<]*</span>', f'<span id="footerRelease">Administrator {BUILD} · Market Core {ENGINE} · Web Classic · vérification… · Version : Parker Lewis Can\'t Lose</span>', 'footer release')
index = re.sub(r'(\?v=administrator-build-)\d+\.\d+\.\d+', rf'\g<1>{BUILD}', index)
index = replace_one(index, r'(\./js/version-truth\.js\?v=)[^"\']+', rf'\g<1>{BUILD}', 'version truth cache token')
write(index_path, index)

# Immutable entry: unique build-specific HTML path, independent of stale canonical index caches.
immutable_path = ROOT / f'index-{BUILD}.html'
write(immutable_path, index)

# Root runtime identity only. Business logic untouched.
root_app_path = ROOT / 'app.js'
root_app = read(root_app_path)
root_app = replace_one(root_app, r'(const\s+ATLAS_BUILD\s*=\s*["\'])[^"\']+(["\']\s*;)', rf'\g<1>{BUILD}\g<2>', 'ATLAS_BUILD')
root_app = replace_one(root_app, r'(const\s+ATLAS_RELEASE\s*=\s*["\'])[^"\']+(["\']\s*;)', lambda m: m.group(1) + RELEASE + m.group(2), 'ATLAS_RELEASE')
root_app = replace_one(root_app, r'(const\s+ATLAS_ASSET_TOKEN\s*=\s*["\'])[^"\']+(["\']\s*;)', rf'\g<1>{TOKEN}\g<2>', 'ATLAS_ASSET_TOKEN')
write(root_app_path, root_app)

# Existing System lazy-source cache token is part of the canonical version guard.
system_path = ROOT / 'js/views/system-presentation.js'
system = read(system_path)
system = replace_one(system, r'(const\s+SOURCE="\./views/system\.html\?v=administrator-build-)[^"]+(";)', rf'\g<1>{BUILD}\g<2>', 'System presentation source token')
write(system_path, system)

# Version controller: exact immutable target first; never reload an unproven target forever.
version_truth = f'''/* Agent-Crypto @erith.IA — {BUILD}
   VERSION AUTHORITY CONSOLIDATION · IMMUTABLE ENTRY LOCK
   Explicit operator check only. No recurring timer, no observer. */
(() => {{
  "use strict";
  const OWNER="version-truth-406086";
  const MANIFEST="./build.json";
  const REFRESH_PARAM="ac-refresh";
  const meta=n=>String(document.querySelector(`meta[name="${{n}}"]`)?.content||"").trim();
  const loaded=meta("administrator-build")||meta("atlas-build")||"UNKNOWN";
  const engine=meta("atlas-engine-build")||"UNKNOWN";
  const control=document.getElementById("atlasVersionTruthControl");
  const text=document.getElementById("atlasVersionTruthText");
  const legacyControl=document.getElementById("atlasVersionControl");
  const legacyText=document.getElementById("atlasVersionControlText");
  const parts=v=>String(v||"").split(".").map(x=>Number.parseInt(x,10)||0);
  function compare(a,b){{const A=parts(a),B=parts(b),n=Math.max(A.length,B.length);for(let i=0;i<n;i+=1){{const d=(A[i]||0)-(B[i]||0);if(d)return d;}}return 0;}}
  function valid(remote){{return !!remote&&typeof remote==="object"&&String(remote.build||"").trim()&&String(remote.engine||"").trim()===engine;}}
  let remote=null,state="current",busy=false;
  function render(next=remote,error=null,mode=null){{
    remote=valid(next)?next:null;
    const published=remote?String(remote.build).trim():loaded;
    const newer=!!remote&&compare(published,loaded)>0;
    state=mode||((error&&!newer)?"failed":newer?"update-available":"current");
    const label=state==="checking"?`Build ${{loaded}} · vérification…`
      :state==="applying"?`Build ${{published}} · chargement…`
      :state==="propagating"?`Build ${{loaded}} · ${{published}} en propagation`
      :state==="update-available"?`Build ${{loaded}} · ${{published}} disponible`
      :state==="failed"?`Build ${{loaded}} · vérification indisponible`
      :`Build ${{loaded}} · Administrator`;
    if(text)text.textContent=label;
    if(control){{
      control.dataset.versionTruthOwner=OWNER;
      control.dataset.loadedBuild=loaded;
      control.dataset.publishedBuild=published;
      control.dataset.versionTruthState=state;
      control.dataset.falsePropagation="false";
      const blocked=state==="checking"||state==="applying";
      control.disabled=blocked;
      control.toggleAttribute("aria-busy",blocked);
      control.classList.toggle("warn",state==="update-available"||state==="propagating");
      control.classList.toggle("ok",state!=="update-available"&&state!=="propagating");
      control.setAttribute("aria-label",state==="update-available"
        ?`Version chargée ${{loaded}}. Version ${{published}} disponible. Cliquer pour charger.`
        :state==="propagating"
          ?`Version ${{published}} publiée mais entrée HTML pas encore propagée. Cliquer pour revérifier.`
          :state==="failed"
            ?`Build ${{loaded}} chargé. Vérification indisponible. Cliquer pour réessayer.`
            :`Version Agent-Crypto chargée : Build ${{loaded}}, mode Administrator. Cliquer pour vérifier GitHub.`);
      control.title=state==="update-available"
        ?`Build ${{published}} disponible · cliquer pour mettre à jour`
        :state==="propagating"
          ?`Build ${{published}} en propagation GitHub Pages · cliquer pour revérifier`
          :`Build ${{loaded}} chargé · aucune mise à jour détectée`;
    }}
    if(legacyControl){{legacyControl.dataset.versionTruthLegacySink="true";legacyControl.dataset.canonicalVisibleOwner=OWNER;}}
    if(legacyText)legacyText.dataset.versionTruthLegacySink="true";
    document.documentElement.dataset.versionTruthBuild=loaded;
    document.documentElement.dataset.versionTruthPublished=published;
    document.documentElement.dataset.versionTruthState=state;
    return Object.freeze({{loaded,published,state,update_available:newer}});
  }}
  async function fetchManifest(){{
    const response=await fetch(`${{MANIFEST}}?v=${{encodeURIComponent(loaded)}}&t=${{Date.now()}}`,{{cache:"no-store",credentials:"same-origin"}});
    if(!response.ok)throw new Error(`HTTP ${{response.status}}`);
    const result=await response.json();
    if(!valid(result))throw new Error("manifest-invalide");
    return result;
  }}
  async function check(show=false){{
    if(busy)return false;
    busy=true;
    if(show)render(remote,null,"checking");
    try{{const result=await fetchManifest();const snapshot=render(result);return snapshot.update_available;}}
    catch(error){{render(null,error);return false;}}
    finally{{busy=false;}}
  }}
  function entryUrl(build,immutable=true){{return new URL(immutable?`./index-${{build}}.html`:`./index.html`,location.href);}}
  async function probeEntry(url,build){{
    try{{
      const probe=new URL(url);
      probe.searchParams.set("ac-probe",`${{build}}-${{Date.now()}}`);
      const response=await fetch(probe.toString(),{{cache:"no-store",credentials:"same-origin"}});
      if(!response.ok)return false;
      const html=await response.text();
      const match=html.match(/<meta\\s+name="administrator-build"\\s+content="([^"]+)"/i)||html.match(/<meta\\s+name="atlas-build"\\s+content="([^"]+)"/i);
      return String(match?.[1]||"").trim()===build;
    }}catch(_){{return false;}}
  }}
  async function applyAvailableUpdate(){{
    if(busy||state!=="update-available")return false;
    busy=true;
    render(remote,null,"applying");
    try{{
      const result=await fetchManifest();
      const published=String(result.build||"").trim();
      if(compare(published,loaded)<=0){{render(result);return false;}}
      const immutable=entryUrl(published,true);
      if(await probeEntry(immutable,published)){{
        immutable.searchParams.set(REFRESH_PARAM,`${{published}}-${{Date.now()}}`);
        location.replace(immutable.toString());
        return true;
      }}
      const canonical=entryUrl(published,false);
      if(await probeEntry(canonical,published)){{
        canonical.searchParams.set(REFRESH_PARAM,`${{published}}-${{Date.now()}}`);
        location.replace(canonical.toString());
        return true;
      }}
      render(result,null,"propagating");
      return false;
    }}catch(error){{render(remote,error);return false;}}
    finally{{busy=false;}}
  }}
  async function onControlClick(event){{
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if(busy)return false;
    if(state==="update-available")return applyAvailableUpdate();
    return check(true);
  }}
  render();
  if(control)control.addEventListener("click",onControlClick,{{capture:true}});
  void check(false);
  globalThis.ErithVersionTruth=Object.freeze({{
    owner:OWNER,build:loaded,engine,manifest:MANIFEST,
    snapshot:()=>Object.freeze({{loaded,published:String(remote?.build||loaded),state}}),
    refresh:check,applyAvailableUpdate,
    single_visible_owner:true,false_propagation_lock:true,
    historical_click_contract_restored:true,
    current_click_reloads:false,update_available_click_reloads:true,
    immutable_entry_first:true,canonical_entry_requires_probe:true,
    propagation_loop_forbidden:true,
    recurring_timer:false,observer:false
  }});
}})();
'''
write(ROOT / 'js/version-truth.js', version_truth)

# Runtime build truth.
build_truth = current_build_truth
build_truth.update({
    'build': BUILD,
    'engine': ENGINE,
    'release': RELEASE,
    'published': True,
    'status': STATUS,
    'parent_build': PARENT,
    'asset_token': TOKEN,
    'administrator_build': BUILD,
    'build_label': f'Build {BUILD} · Administrator',
    'release_status': STATUS,
    'timestamp': NOW,
})
cvt = build_truth.setdefault('current_version_truth', {})
cvt.update({
    'visible_owner': 'js/version-truth.js',
    'loaded_build': BUILD,
    'published_manifest': 'build.json',
    'manual_click_current_reloads': False,
    'manual_click_update_available_reloads': True,
    'immutable_entry_first': True,
    'canonical_entry_requires_probe': True,
    'propagation_loop_forbidden': True,
    'silent_noop_on_index_preflight_mismatch': False,
    'recurring_timer': False,
    'observer': False,
})
build_truth['cascade_40_6_86'] = {
    'parent_build': PARENT,
    'release': RELEASE,
    'status': STATUS,
    'scope': 'version_authority_and_delivery_only',
    'canonical_manifest_owner': 'version.json',
    'mirror_manifest': 'administrator-version.json',
    'runtime_manifest': 'build.json',
    'immutable_entry': f'index-{BUILD}.html',
    'first_paint_identity_aligned': True,
    'eternal_reload_loop_removed': True,
    'pages_propagation_state_explicit': True,
    'market_core': ENGINE,
    'market_core_modified': False,
    'window_manager_modified': False,
    'aether_visual_modified': False,
    'technical_reading_modified': False,
    'web_classic_business_runtime_modified': False,
    'new_recurring_timer': False,
    'new_observer': False,
    'new_network_owner': False,
    'new_storage_owner': False,
}
write(build_truth_path, json.dumps(build_truth, ensure_ascii=False, indent=2) + '\n')

# Administrator mirror identity first so version.json can hash its final bytes.
mirror_path = ROOT / 'administrator-version.json'
mirror = json.loads(read(mirror_path))
mirror.update({
    'build': BUILD,
    'global_versioning': BUILD,
    'release': RELEASE,
    'status': STATUS,
    'parent_build': PARENT,
    'asset_token': TOKEN,
    'prepared_at': NOW,
    'published_at': NOW,
    'revision': REVISION,
})
mirror_files = mirror.get('files')
if isinstance(mirror_files, dict):
    for rel in list(mirror_files):
        if rel in ('version.json', 'administrator-version.json'):
            continue
        p = ROOT / rel
        if p.is_file():
            mirror_files[rel] = sha(p)
    mirror_files[f'index-{BUILD}.html'] = sha(immutable_path)
write(mirror_path, json.dumps(mirror, ensure_ascii=False, indent=2) + '\n')

# Canonical manifest. Preserve history, repair current identity and every payload digest.
manifest_path = ROOT / 'version.json'
manifest = json.loads(read(manifest_path))
manifest.update({
    'build': BUILD,
    'release': RELEASE,
    'status': STATUS,
    'parent_build': PARENT,
    'asset_token': TOKEN,
    'prepared_at': NOW,
    'published_at': NOW,
    'revision': REVISION,
    'mode': 'Administrator',
})
if isinstance(manifest.get('engine'), dict):
    manifest['engine']['reference_build'] = ENGINE
else:
    manifest['engine'] = ENGINE

files = manifest.get('files')
if not isinstance(files, dict) or not files:
    raise SystemExit('STOP: version.json files hash map missing')
if 'version.json' in files:
    raise SystemExit('STOP: version.json cannot hash itself')
files[f'index-{BUILD}.html'] = sha(immutable_path)
for rel in list(files):
    p = ROOT / rel
    if not p.is_file():
        raise SystemExit(f'STOP: manifest payload missing: {rel}')
    files[rel] = sha(p)

integrity = manifest.get('integrity')
if isinstance(integrity, dict):
    pub = integrity.get('publication_identity')
    if isinstance(pub, dict):
        pub['build'] = BUILD
        pub['asset_token'] = TOKEN
        pub['status'] = STATUS
        if 'app_sha256' in pub:
            pub['app_sha256'] = sha(root_app_path)
        if 'root_app_sha256' in pub:
            pub['root_app_sha256'] = sha(root_app_path)
        if 'index_sha256' in pub:
            pub['index_sha256'] = sha(index_path)
        if 'js_app_sha256' in pub:
            pub['js_app_sha256'] = sha(ROOT / 'js/app.js')
        if 'administrator_version_sha256' in pub:
            pub['administrator_version_sha256'] = sha(mirror_path)
        if 'version_truth_sha256' in pub:
            pub['version_truth_sha256'] = sha(ROOT / 'js/version-truth.js')

write(manifest_path, json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')

# Final local identity proof before CI guard.
canonical = read(index_path)
immutable = read(immutable_path)
for name, html in [('index.html', canonical), (immutable_path.name, immutable)]:
    for needle in (
        f'name="administrator-build" content="{BUILD}"',
        f'<span id="atlasVersionTruthText">Build {BUILD}</span>',
        f'./js/version-truth.js?v={BUILD}',
        f'Administrator {BUILD} · Market Core {ENGINE} ·',
    ):
        if needle not in html:
            raise SystemExit(f'STOP: {name} missing {needle}')

print(json.dumps({
    'build': BUILD,
    'parent': PARENT,
    'immutable': immutable_path.name,
    'manifest_payloads': len(files),
    'market_core': ENGINE,
}, ensure_ascii=False, indent=2))
