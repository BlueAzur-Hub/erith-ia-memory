from pathlib import Path
import hashlib
import json

ROOT = Path('public/agent_crypto_erith_ia/administrator')
BUILD = '40.6.86'
ENGINE = '38.15.11'
OWNER = 'js/version-truth-406086-authority-lock.js'
TOKEN = f'market-core-v2.0-alpha-build-{BUILD}'


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read(path: Path) -> str:
    return path.read_text(encoding='utf-8')


def write(path: Path, text: str) -> None:
    path.write_text(text, encoding='utf-8')


# Hard stop unless we are operating on the already-published 40.6.86 line.
build_path = ROOT / 'build.json'
build = json.loads(read(build_path))
if str(build.get('build')) != BUILD or str(build.get('engine')) != ENGINE:
    raise SystemExit(f'STOP: expected build {BUILD} / engine {ENGINE}, got {build.get("build")} / {build.get("engine")}')

# Dedicated immutable owner. It deliberately does not derive the loaded build from mutable DOM state.
owner_js = r'''/* Agent-Crypto @erith.IA — 40.6.86 maintenance authority lock
   Single visible version owner for Build 40.6.86.
   No recurring timer. No observer. No storage write. */
(() => {
  "use strict";
  const BUILD = "40.6.86";
  const ENGINE = "38.15.11";
  const OWNER = "version-truth-406086-authority-lock";
  const MANIFEST = "./build.json";
  const REFRESH_PARAM = "ac-refresh";

  const parts = value => String(value || "").split(".").map(x => Number.parseInt(x, 10) || 0);
  const compare = (a, b) => {
    const A = parts(a), B = parts(b), n = Math.max(A.length, B.length);
    for (let i = 0; i < n; i += 1) {
      const d = (A[i] || 0) - (B[i] || 0);
      if (d) return d;
    }
    return 0;
  };

  const forceMetaTruth = () => {
    const admin = document.querySelector('meta[name="administrator-build"]');
    const atlas = document.querySelector('meta[name="atlas-build"]');
    if (admin) admin.content = BUILD;
    if (atlas) atlas.content = BUILD;
  };

  forceMetaTruth();

  // Replace the visible node itself so stale listeners/references from older owners cannot repaint it.
  const previous = document.getElementById("atlasVersionTruthControl");
  const control = previous ? previous.cloneNode(true) : null;
  if (previous && control) previous.replaceWith(control);
  const text = control?.querySelector("#atlasVersionTruthText") || document.getElementById("atlasVersionTruthText");

  const legacyControl = document.getElementById("atlasVersionControl");
  const legacyText = document.getElementById("atlasVersionControlText");
  if (legacyControl) {
    legacyControl.hidden = true;
    legacyControl.setAttribute("aria-hidden", "true");
    legacyControl.style.display = "none";
    legacyControl.dataset.versionTruthLegacySink = "true";
  }
  if (legacyText) legacyText.dataset.versionTruthLegacySink = "true";

  let remote = null;
  let state = "current";
  let busy = false;

  const validRemote = value => !!value
    && typeof value === "object"
    && String(value.build || "").trim()
    && String(value.engine || "").trim() === ENGINE;

  function render(next = remote, error = null, mode = null) {
    remote = validRemote(next) ? next : null;
    const published = remote ? String(remote.build).trim() : BUILD;
    const newer = !!remote && compare(published, BUILD) > 0;
    state = mode || ((error && !newer) ? "failed" : newer ? "update-available" : "current");

    const label = state === "checking" ? `Build ${BUILD} · vérification…`
      : state === "applying" ? `Build ${published} · chargement…`
      : state === "propagating" ? `Build ${BUILD} · ${published} en propagation`
      : state === "update-available" ? `Build ${BUILD} · ${published} disponible`
      : state === "failed" ? `Build ${BUILD} · vérification indisponible`
      : `Build ${BUILD} · Administrator`;

    if (text) text.textContent = label;
    if (control) {
      control.dataset.versionTruthOwner = OWNER;
      control.dataset.loadedBuild = BUILD;
      control.dataset.publishedBuild = published;
      control.dataset.versionTruthState = state;
      control.dataset.falsePropagation = "false";
      control.disabled = state === "checking" || state === "applying";
      control.toggleAttribute("aria-busy", control.disabled);
      control.classList.toggle("warn", state === "update-available" || state === "propagating");
      control.classList.toggle("ok", state !== "update-available" && state !== "propagating");
      control.setAttribute("aria-label", state === "update-available"
        ? `Version chargée ${BUILD}. Version ${published} disponible. Cliquer pour charger.`
        : `Version Agent-Crypto chargée : Build ${BUILD}, mode Administrator.`);
      control.title = state === "update-available"
        ? `Build ${published} disponible · cliquer pour mettre à jour`
        : `Build ${BUILD} chargé · aucune mise à jour détectée`;
    }

    document.documentElement.dataset.versionTruthBuild = BUILD;
    document.documentElement.dataset.versionTruthPublished = published;
    document.documentElement.dataset.versionTruthState = state;
    return Object.freeze({ loaded: BUILD, published, state, update_available: newer });
  }

  async function fetchManifest() {
    const response = await fetch(`${MANIFEST}?v=${BUILD}&t=${Date.now()}`, {
      cache: "no-store",
      credentials: "same-origin"
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    if (!validRemote(result)) throw new Error("manifest-invalide");
    return result;
  }

  async function check(show = false) {
    if (busy) return false;
    busy = true;
    if (show) render(remote, null, "checking");
    try {
      const result = await fetchManifest();
      const snapshot = render(result);
      return snapshot.update_available;
    } catch (error) {
      render(remote, error);
      return false;
    } finally {
      busy = false;
    }
  }

  const entryUrl = build => new URL(`./index-${build}.html`, location.href);

  async function probeEntry(url, build) {
    try {
      const probe = new URL(url);
      probe.searchParams.set("ac-probe", `${build}-${Date.now()}`);
      const response = await fetch(probe.toString(), { cache: "no-store", credentials: "same-origin" });
      if (!response.ok) return false;
      const html = await response.text();
      const match = html.match(/<meta\s+name="administrator-build"\s+content="([^"]+)"/i);
      return String(match?.[1] || "").trim() === build;
    } catch (_) {
      return false;
    }
  }

  async function applyAvailableUpdate() {
    if (busy || state !== "update-available") return false;
    busy = true;
    render(remote, null, "applying");
    try {
      const result = await fetchManifest();
      const published = String(result.build || "").trim();
      if (compare(published, BUILD) <= 0) {
        render(result);
        return false;
      }
      const target = entryUrl(published);
      if (!await probeEntry(target, published)) {
        render(result, null, "propagating");
        return false;
      }
      target.searchParams.set(REFRESH_PARAM, `${published}-${Date.now()}`);
      location.replace(target.toString());
      return true;
    } catch (error) {
      render(remote, error);
      return false;
    } finally {
      busy = false;
    }
  }

  async function onClick(event) {
    event?.preventDefault?.();
    event?.stopPropagation?.();
    event?.stopImmediatePropagation?.();
    if (busy) return false;
    if (state === "update-available") return applyAvailableUpdate();
    return check(true);
  }

  render();
  control?.addEventListener("click", onClick, { capture: true });
  void check(false);

  globalThis.ErithVersionTruth = Object.freeze({
    owner: OWNER,
    build: BUILD,
    engine: ENGINE,
    manifest: MANIFEST,
    snapshot: () => Object.freeze({ loaded: BUILD, published: String(remote?.build || BUILD), state }),
    refresh: check,
    applyAvailableUpdate,
    single_visible_owner: true,
    immutable_owner_script: true,
    dom_meta_is_not_loaded_build_authority: true,
    stale_listener_detached_by_node_replacement: true,
    current_click_reloads: false,
    update_available_click_reloads: true,
    recurring_timer: false,
    observer: false,
    storage_write: false
  });
})();
'''
owner_path = ROOT / OWNER
write(owner_path, owner_js)

# Point both canonical and immutable HTML to the new immutable owner, at the absolute end of body.
for html_name in ('index.html', f'index-{BUILD}.html'):
    path = ROOT / html_name
    html = read(path)
    old = f'<script src="./js/version-truth.js?v={BUILD}"></script>'
    if old not in html:
        raise SystemExit(f'STOP: version owner reference missing in {html_name}')
    html = html.replace(old, '', 1)
    marker = '</body>'
    if marker not in html:
        raise SystemExit(f'STOP: body end missing in {html_name}')
    html = html.replace(marker, f'  <script src="./{OWNER}?v=maint-1"></script>\n{marker}', 1)
    # First-paint truth remains frozen on the same Build.
    if f'name="administrator-build" content="{BUILD}"' not in html:
        raise SystemExit(f'STOP: {html_name} administrator meta drift')
    if f'<span id="atlasVersionTruthText">Build {BUILD}</span>' not in html:
        raise SystemExit(f'STOP: {html_name} first paint badge drift')
    write(path, html)

# Runtime manifest documentation. Build number intentionally unchanged.
cvt = build.setdefault('current_version_truth', {})
cvt.update({
    'visible_owner': OWNER,
    'loaded_build': BUILD,
    'published_manifest': 'build.json',
    'maintenance_revision': 'V21.1',
    'loaded_build_authority': 'hardcoded immutable owner script for 40.6.86',
    'dom_meta_is_not_loaded_build_authority': True,
    'legacy_visible_listener_detached': True,
    'manual_click_current_reloads': False,
    'manual_click_update_available_reloads': True,
    'immutable_entry_first': True,
    'propagation_loop_forbidden': True,
    'recurring_timer': False,
    'observer': False,
})
build['maintenance_40_6_86_version_owner_lock'] = {
    'build_bump': False,
    'reason': 'Firefox field proof: immutable 40.6.86 page repainted visible badge as 40.6.83',
    'single_visible_owner': OWNER,
    'canonical_index_modified': True,
    'immutable_index_modified': True,
    'market_core_modified': False,
    'window_manager_modified': False,
    'aether_modified': False,
    'technical_reading_modified': False,
    'business_runtime_modified': False,
    'new_timer': False,
    'new_observer': False,
    'new_storage_owner': False,
}
write(build_path, json.dumps(build, ensure_ascii=False, indent=2) + '\n')

# Canonical version manifest had a proven stale nested loaded_build=40.6.64. Repair only that truth and hash authority.
version_path = ROOT / 'version.json'
version = json.loads(read(version_path))
if str(version.get('build')) != BUILD or str(version.get('engine')) != ENGINE:
    raise SystemExit('STOP: version.json top-level truth drift')
vcvt = version.setdefault('current_version_truth', {})
vcvt.update({
    'visible_owner': OWNER,
    'loaded_build': BUILD,
    'maintenance_revision': 'V21.1',
    'loaded_build_authority': 'hardcoded immutable owner script for 40.6.86',
    'dom_meta_is_not_loaded_build_authority': True,
    'legacy_visible_listener_detached': True,
})
files = version.setdefault('files', {})
files[OWNER] = sha(owner_path)
files[f'index-{BUILD}.html'] = sha(ROOT / f'index-{BUILD}.html')
write(version_path, json.dumps(version, ensure_ascii=False, indent=2) + '\n')

# Final acceptance gates.
for html_name in ('index.html', f'index-{BUILD}.html'):
    html = read(ROOT / html_name)
    ref = f'./{OWNER}?v=maint-1'
    if html.count(ref) != 1:
        raise SystemExit(f'STOP: {html_name} immutable owner count={html.count(ref)}')
    if './js/version-truth.js?v=40.6.86' in html:
        raise SystemExit(f'STOP: {html_name} still loads legacy visible owner')

if 'const BUILD = "40.6.86";' not in read(owner_path):
    raise SystemExit('STOP: hardcoded build authority absent')
if json.loads(read(version_path))['current_version_truth']['loaded_build'] != BUILD:
    raise SystemExit('STOP: version.json nested loaded_build still stale')
if json.loads(read(build_path))['current_version_truth']['visible_owner'] != OWNER:
    raise SystemExit('STOP: build.json owner not consolidated')

print(json.dumps({
    'ok': True,
    'build': BUILD,
    'maintenance_revision': 'V21.1',
    'owner': OWNER,
    'version_json_loaded_build': BUILD,
    'market_core': ENGINE,
}, ensure_ascii=False))
