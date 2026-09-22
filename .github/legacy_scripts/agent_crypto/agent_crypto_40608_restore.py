#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import re
import subprocess
import zipfile

ROOT = Path("public/agent_crypto_erith_ia/administrator")
BUILD = "40.6.8"
PARENT = "40.6.7"
ENGINE = "38.15.11"
SOURCE_COMMIT = "c0333b4d2ce1e7080b6ae27c7d1de21f68c49f53"
RELEASE = "HISTORICAL FUNCTIONAL CONTRACT RESTORE · VERSION + CHRONOS"
STATUS = "historical_functional_contract_restore_version_chronos_406008"
TOKEN = f"market-core-v2.0-alpha-build-{BUILD}"
NOW = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def load(name: str) -> dict:
    data = json.loads((ROOT / name).read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise SystemExit(f"STOP 40.6.8: invalid JSON root {name}")
    return data


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


current = load("version.json")
if str(current.get("build") or "") != PARENT:
    raise SystemExit(f"STOP 40.6.8: expected parent {PARENT}, found {current.get('build')}")

# 1) CHRONOS — exact rollback to the last pre-readability checkpoint.
chronos_rel = "public/agent_crypto_erith_ia/administrator/admin-chronos.css"
historical_css = subprocess.check_output(["git", "show", f"{SOURCE_COMMIT}:{chronos_rel}"])
(ROOT / "admin-chronos.css").write_bytes(historical_css)
if (ROOT / "admin-chronos.css").read_bytes() != historical_css:
    raise SystemExit("STOP 40.6.8: Chronos restore is not byte-for-byte 40.6.5")

# 2) VERSION BUTTON — historical selective-update semantics, kept under the
# validated single visible owner introduced in 40.5.19.
version_truth = r'''/* Agent-Crypto @erith.IA — 40.6.8 historical version-control contract restore */
(() => {
  "use strict";
  const OWNER="version-truth-40608";
  const MANIFEST="./build.json";
  const INDEX="./index.html";
  const REFRESH_PARAM="ac-refresh";
  const meta=n=>String(document.querySelector(`meta[name="${n}"]`)?.content||"").trim();
  const loaded=meta("administrator-build")||meta("atlas-build")||"UNKNOWN";
  const engine=meta("atlas-engine-build")||"UNKNOWN";
  const control=document.getElementById("atlasVersionTruthControl");
  const text=document.getElementById("atlasVersionTruthText");
  const legacyControl=document.getElementById("atlasVersionControl");
  const legacyText=document.getElementById("atlasVersionControlText");
  const parts=v=>String(v||"").split(".").map(x=>Number.parseInt(x,10)||0);
  function compare(a,b){
    const A=parts(a),B=parts(b),n=Math.max(A.length,B.length);
    for(let i=0;i<n;i+=1){const d=(A[i]||0)-(B[i]||0);if(d)return d;}
    return 0;
  }
  function valid(remote){
    return !!remote&&typeof remote==="object"&&String(remote.build||"").trim()&&String(remote.engine||"").trim()===engine;
  }
  let remote=null;
  let state="current";
  let busy=false;
  function render(next=remote,error=null,mode=null){
    remote=valid(next)?next:null;
    const published=remote?String(remote.build).trim():loaded;
    const newer=!!remote&&compare(published,loaded)>0;
    state=mode||((error&&!newer)?"failed":newer?"update-available":"current");
    const label=state==="checking"?`Build ${loaded} · vérification…`
      :state==="applying"?`Build ${published} · chargement…`
      :state==="update-available"?`Build ${loaded} · ${published} disponible`
      :state==="failed"?`Build ${loaded} · vérification indisponible`
      :`Build ${loaded} · Administrator`;
    if(text)text.textContent=label;
    if(control){
      control.dataset.versionTruthOwner=OWNER;
      control.dataset.loadedBuild=loaded;
      control.dataset.publishedBuild=published;
      control.dataset.versionTruthState=state;
      control.dataset.falsePropagation="false";
      const blocked=state==="checking"||state==="applying";
      control.disabled=blocked;
      control.toggleAttribute("aria-busy",blocked);
      control.classList.toggle("warn",state==="update-available");
      control.classList.toggle("ok",state!=="update-available");
      control.setAttribute("aria-label",state==="update-available"
        ?`Version chargée ${loaded}. Version ${published} disponible. Cliquer pour charger.`
        :state==="failed"
          ?`Build ${loaded} chargé. Vérification indisponible. Cliquer pour réessayer.`
          :`Version Agent-Crypto chargée : Build ${loaded}, mode Administrator. Cliquer pour vérifier GitHub.`);
      control.title=state==="update-available"
        ?`Build ${published} disponible · cliquer pour mettre à jour`
        :`Build ${loaded} chargé · aucune mise à jour détectée`;
    }
    if(legacyControl){
      legacyControl.dataset.versionTruthLegacySink="true";
      legacyControl.dataset.canonicalVisibleOwner=OWNER;
    }
    if(legacyText)legacyText.dataset.versionTruthLegacySink="true";
    document.documentElement.dataset.versionTruthBuild=loaded;
    document.documentElement.dataset.versionTruthPublished=published;
    document.documentElement.dataset.versionTruthState=state;
    return Object.freeze({loaded,published,state,update_available:newer});
  }
  async function fetchManifest(){
    const response=await fetch(`${MANIFEST}?v=${encodeURIComponent(loaded)}&t=${Date.now()}`,{cache:"no-store",credentials:"same-origin"});
    if(!response.ok)throw new Error(`HTTP ${response.status}`);
    const result=await response.json();
    if(!valid(result))throw new Error("manifest-invalide");
    return result;
  }
  async function check(show=false){
    if(busy)return false;
    busy=true;
    if(show)render(remote,null,"checking");
    try{
      const result=await fetchManifest();
      const snapshot=render(result);
      return snapshot.update_available;
    }catch(error){
      render(null,error);
      return false;
    }finally{busy=false;}
  }
  async function publishedIndexMatches(build){
    const response=await fetch(`${INDEX}?_version_check=${Date.now()}`,{cache:"no-store",credentials:"same-origin"});
    if(!response.ok)return false;
    const html=await response.text();
    const match=html.match(/<meta\s+name="administrator-build"\s+content="([^"]+)"/i)||html.match(/<meta\s+name="atlas-build"\s+content="([^"]+)"/i);
    return String(match?.[1]||"").trim()===build;
  }
  async function applyAvailableUpdate(){
    if(busy||state!=="update-available")return false;
    busy=true;
    render(remote,null,"applying");
    try{
      const result=await fetchManifest();
      const published=String(result.build||"").trim();
      if(compare(published,loaded)<=0){render(result);return false;}
      if(!(await publishedIndexMatches(published))){render(result);return false;}
      const url=new URL(location.href);
      url.searchParams.set(REFRESH_PARAM,`${published}-${Date.now()}`);
      location.replace(url.toString());
      return true;
    }catch(error){
      render(remote,error);
      return false;
    }finally{busy=false;}
  }
  async function onControlClick(event){
    event?.preventDefault?.();
    event?.stopPropagation?.();
    if(busy)return false;
    if(state==="update-available")return applyAvailableUpdate();
    return check(true);
  }
  render();
  if(control)control.addEventListener("click",onControlClick,{capture:true});
  void check(false);
  globalThis.ErithVersionTruth=Object.freeze({
    owner:OWNER,build:loaded,engine,manifest:MANIFEST,
    snapshot:()=>Object.freeze({loaded,published:String(remote?.build||loaded),state}),
    refresh:check,applyAvailableUpdate,
    single_visible_owner:true,false_propagation_lock:true,
    historical_click_contract_restored:true,
    current_click_reloads:false,update_available_click_reloads:true,
    recurring_timer:false,observer:false
  });
})();
'''
(ROOT / "js/version-truth.js").write_text(version_truth, encoding="utf-8")

# 3) PUBLICATION IDENTITY — only the surfaces owned by the 40.6.x release layer.
index_path = ROOT / "index.html"
index = index_path.read_text(encoding="utf-8")
replacements = {
    '<meta name="atlas-build" content="40.6.7" />': '<meta name="atlas-build" content="40.6.8" />',
    '<meta name="administrator-build" content="40.6.7" />': '<meta name="administrator-build" content="40.6.8" />',
    '<meta name="administrator-release" content="CHRONOS CANONICAL OWNER · DATE READABILITY RESTORE" />': f'<meta name="administrator-release" content="{RELEASE}" />',
    '<meta name="atlas-asset-token" content="market-core-v2.0-alpha-build-40.6.7" />': f'<meta name="atlas-asset-token" content="{TOKEN}" />',
    '<title>Agent-Crypto @erith.IA — Build 40.6.7 · Administrator</title>': '<title>Agent-Crypto @erith.IA — Build 40.6.8 · Administrator</title>',
    './admin-chronos.css?v=administrator-build-40.6.7': './admin-chronos.css?v=administrator-build-40.6.8',
    './js/version-truth.js?v=40.6.7': './js/version-truth.js?v=40.6.8',
}
for old, new in replacements.items():
    if old not in index:
        raise SystemExit(f"STOP 40.6.8: missing index token: {old}")
    index = index.replace(old, new, 1)
index, n1 = re.subn(
    r'(id="atlasVersionTruthControl"[\s\S]{0,700}?aria-label="Version Agent-Crypto installée : Build )[^,\"]+(, mode Administrator\")',
    r'\g<1>40.6.8\g<2>', index, count=1,
)
index, n2 = re.subn(
    r'(<span id="atlasVersionTruthText">Build )[^<]+(</span>)',
    r'\g<1>40.6.8\g<2>', index, count=1,
)
if n1 != 1 or n2 != 1:
    raise SystemExit(f"STOP 40.6.8: first-paint badge mismatch {n1}/{n2}")
index_path.write_text(index, encoding="utf-8")

release_path = ROOT / "RELEASE_40_6_8.md"
release_path.write_text(f'''# Agent-Crypto @erith.IA — Build {BUILD}

## {RELEASE}

Parent: **{PARENT}**  
Market Core: **{ENGINE} protected**

Cette version restaure au lieu de compenser.

- `admin-chronos.css` : restauration **octet pour octet** depuis 40.6.5 (`{SOURCE_COMMIT[:8]}…`). Les interventions typographiques 40.6.6/40.6.7 sont retirées.
- Bouton Build : contrat historique restauré sous le propriétaire unique validé depuis 40.5.19.
  - build courante + clic = vérification seulement ; **aucun rechargement** si rien de nouveau ;
  - build plus récente = état `disponible` ;
  - clic sur `disponible` = revalidation puis **une seule** navigation.
- Aucun timer récurrent, aucun MutationObserver, aucun nouveau propriétaire de stockage.
- Market Core 38.15.11, Graphique, Lecture Technique, Atlas, Oracle, Aether/News, Strategy A/Paper et Window Manager sont hors chirurgie.

### Firefox
1. Charger 40.6.8 une fois.
2. Chronos doit retrouver exactement la présentation du checkpoint 40.6.5.
3. Cliquer Build lorsque 40.6.8 est courant : la page ne doit pas repartir.
4. À la prochaine build publiée, le badge doit annoncer `disponible`; un clic la charge une fois.
''', encoding="utf-8")

# 4) MANIFESTS.
docs = {name: load(name) for name in ("build.json", "administrator-version.json", "version.json")}
for name, data in docs.items():
    data["build"] = BUILD
    data["release"] = RELEASE
    data["status"] = STATUS
    data["parent_build"] = PARENT
    data["asset_token"] = TOKEN
    if "administrator_build" in data:
        data["administrator_build"] = BUILD
    if "build_label" in data:
        data["build_label"] = f"Build {BUILD}"
    if "release_status" in data:
        data["release_status"] = RELEASE
    for key in ("timestamp", "prepared_at", "published_at"):
        if key in data:
            data[key] = NOW
    truth = data.get("current_version_truth")
    if not isinstance(truth, dict):
        truth = {}
        data["current_version_truth"] = truth
    for key in ("manual_click_safe_reload", "manual_click_network_calls", "manual_click_awaits_manifest"):
        truth.pop(key, None)
    truth.update({
        "visible_owner": "js/version-truth.js",
        "loaded_build": BUILD,
        "published_manifest": "build.json",
        "false_propagation_lock": True,
        "legacy_ids_hidden_sink": True,
        "historical_click_contract_restored": True,
        "manual_click_current_reloads": False,
        "manual_click_update_available_reloads": True,
        "manual_current_click_network_calls": 1,
        "manual_update_click_rechecks_manifest": True,
        "manual_update_click_requires_published_index_match": True,
        "recurring_timer": False,
        "observer": False,
    })
    data["cascade_40_6_8"] = {
        "parent_build": PARENT,
        "release": RELEASE,
        "restoration_only": True,
        "chronos_source_build": "40.6.5",
        "chronos_source_commit": SOURCE_COMMIT,
        "chronos_byte_for_byte_restored": True,
        "version_break_identified_at": "40.5.19",
        "single_visible_owner_preserved": True,
        "historical_selective_update_contract_restored": True,
        "reload_when_current": False,
        "reload_only_when_newer_build_available": True,
        "market_core_modified": False,
        "graph_modified": False,
        "technical_reading_modified": False,
        "atlas_modified": False,
        "oracle_modified": False,
        "new_recurring_timer": False,
        "new_observer": False,
        "new_storage_owner": False,
    }

for name in ("build.json", "administrator-version.json"):
    (ROOT / name).write_text(json.dumps(docs[name], ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

version = docs["version.json"]
files = version.get("files")
if not isinstance(files, dict):
    files = {}
    version["files"] = files
for rel in (
    "index.html",
    "admin-chronos.css",
    "js/version-truth.js",
    "build.json",
    "administrator-version.json",
    "RELEASE_40_6_8.md",
):
    files[rel] = sha256(ROOT / rel)
if isinstance(version.get("integrity"), dict) and isinstance(version["integrity"].get("files"), int):
    version["integrity"]["files"] = len(files)
(ROOT / "version.json").write_text(json.dumps(version, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

# 5) STATIC RESTORATION PROOFS.
vt = (ROOT / "js/version-truth.js").read_text(encoding="utf-8")
if "safeReload" in vt or vt.count("location.replace(") != 1:
    raise SystemExit("STOP 40.6.8: unconditional reload path survived")
for marker in (
    "historical_click_contract_restored:true",
    "current_click_reloads:false",
    "update_available_click_reloads:true",
):
    if marker not in vt:
        raise SystemExit(f"STOP 40.6.8: missing {marker}")
if "setInterval(" in vt or "MutationObserver" in vt:
    raise SystemExit("STOP 40.6.8: new recurring owner found")
for name in ("build.json", "administrator-version.json", "version.json"):
    if str(load(name).get("build") or "") != BUILD:
        raise SystemExit(f"STOP 40.6.8: build drift {name}")
if str(load("build.json").get("engine") or "") != ENGINE:
    raise SystemExit("STOP 40.6.8: Market Core drift")

# 6) CLEAN UPLOAD committed next to the inter-AI archives.
outdir = Path("coordination/inter_ai_dialogues/agent_crypto")
outdir.mkdir(parents=True, exist_ok=True)
out = outdir / "AGENT_CRYPTO_BUILD_40_6_8_HISTORICAL_FUNCTIONAL_RESTORE_CLEAN_UPLOAD_7_FILES.zip"
rels = [
    "index.html",
    "admin-chronos.css",
    "build.json",
    "administrator-version.json",
    "version.json",
    "RELEASE_40_6_8.md",
    "js/version-truth.js",
]
with zipfile.ZipFile(out, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for rel in rels:
        archive.write(ROOT / rel, (Path("public/agent_crypto_erith_ia/administrator") / rel).as_posix())
digest = sha256(out)
Path(str(out) + ".sha256").write_text(f"{digest}  {out.name}\n", encoding="utf-8")
print(json.dumps({
    "ok": True,
    "build": BUILD,
    "chronos": "40.6.5 byte-for-byte",
    "version_button": "historical selective update",
    "market_core": ENGINE,
    "zip": out.as_posix(),
    "sha256": digest,
}, ensure_ascii=False))
