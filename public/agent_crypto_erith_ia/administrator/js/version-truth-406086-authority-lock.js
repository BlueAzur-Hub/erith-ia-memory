/* Agent-Crypto @erith.IA — 40.6.86 maintenance authority lock
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
