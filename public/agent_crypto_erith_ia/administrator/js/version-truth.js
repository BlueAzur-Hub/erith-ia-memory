(() => {
  "use strict";

  const meta = name => document.querySelector(`meta[name="${name}"]`)?.content || "";
  const loaded = meta("administrator-build") || meta("atlas-build") || "UNKNOWN";
  const engine = meta("atlas-engine-build") || "UNKNOWN";

  function parts(v) {
    return String(v || "").split(".").map(n => Number.parseInt(n, 10)).filter(Number.isFinite);
  }

  function compare(a, b) {
    const aa = parts(a), bb = parts(b), n = Math.max(aa.length, bb.length);
    for (let i = 0; i < n; i++) {
      const d = (aa[i] || 0) - (bb[i] || 0);
      if (d) return d;
    }
    return 0;
  }

  function versionText(remote) {
    if (!remote || remote.engine !== engine || !remote.build) return `Build ${loaded} chargé`;
    return compare(remote.build, loaded) > 0
      ? `Build ${loaded} chargé · ${remote.build} disponible`
      : `Build ${loaded} chargé`;
  }

  function patchLeafText(text) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const matches = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const value = String(node.nodeValue || "");
      if (/Build\s+\d+\.\d+\.\d+\s+chargé(?:\s*·\s*→?\s*\d+\.\d+\.\d+\s+propagation)?/i.test(value)) matches.push(node);
    }
    for (const node of matches) {
      node.nodeValue = String(node.nodeValue).replace(
        /Build\s+\d+\.\d+\.\d+\s+chargé(?:\s*·\s*→?\s*\d+\.\d+\.\d+\s+propagation)?/ig,
        text
      );
    }
  }

  function patchVersionControl(remote) {
    const versionNode = document.getElementById("atlasVersionControlText");
    const control = document.getElementById("atlasVersionControl");
    const newer = !!(remote?.build && remote?.engine === engine && compare(remote.build, loaded) > 0);
    if (versionNode) {
      versionNode.textContent = newer
        ? `Build ${loaded} · ${remote.build} disponible`
        : `Build ${loaded} · Administrator`;
    }
    if (control) {
      control.dataset.loadedBuild = loaded;
      control.dataset.publishedBuild = remote?.build || loaded;
      control.dataset.versionTruthState = newer ? "update-available" : "loaded";
      control.setAttribute("aria-label", newer
        ? `Version chargée ${loaded}. Version publiée ${remote.build} disponible.`
        : `Version Agent-Crypto chargée : Build ${loaded}.`);
      control.title = newer
        ? `Build ${loaded} chargé · Build ${remote.build} publié · Market Core ${engine} inchangé`
        : `Build ${loaded} chargé · Market Core ${engine}`;
    }
    document.documentElement.dataset.versionTruthBuild = loaded;
    document.documentElement.dataset.versionTruthPublished = remote?.build || loaded;
    document.documentElement.dataset.versionTruthState = newer ? "update-available" : "loaded";
  }

  async function run() {
    let remote = null;
    try {
      const response = await fetch(`./build.json?v=${encodeURIComponent(loaded)}`, {
        cache: "no-store",
        credentials: "same-origin"
      });
      if (response.ok) remote = await response.json();
    } catch (_) {}
    patchLeafText(versionText(remote));
    patchVersionControl(remote);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run, { once: true });
  else run();

  globalThis.ErithVersionTruth = Object.freeze({
    loaded,
    engine,
    manifest: "./build.json",
    distinguishes_loaded_from_published: true,
    recurring_timer: false,
    observer: false,
    network_calls_per_page: 1
  });
})();