/* Agent-Crypto Administrator — canonical boot owner.
   One job: read build.json, hydrate the preserved runtime shell with that truth,
   then hand control to the application. No release number lives in this file. */
(() => {
  "use strict";

  const MANIFEST_URL = "./build.json";
  const SHELL_URL = "./runtime-shell.html";
  const BUILD_RE = /^\d+\.\d+\.\d+$/;

  const statusNode = () => document.getElementById("bootStatus");

  function fail(message) {
    document.documentElement.dataset.agentCryptoBoot = "failed";
    const node = statusNode();
    if (node) {
      node.setAttribute("role", "alert");
      node.textContent = `Agent-Crypto indisponible — ${message}`;
    }
  }

  function validateTruth(value) {
    const build = String(value?.build || "").trim();
    const engine = String(value?.engine || value?.market_core_build || value?.market_core || "").trim();
    if (!BUILD_RE.test(build)) throw new Error("build.json: build invalide");
    if (!engine) throw new Error("build.json: Market Core absent");
    return Object.freeze({ ...value, build, engine });
  }

  function patchShell(html, truth) {
    const build = truth.build;
    const release = String(truth.release || truth.release_status || "Administrator").trim();
    const engine = truth.engine;
    let out = String(html || "");
    if (!/^\s*<!doctype html>/i.test(out)) throw new Error("runtime-shell.html invalide");

    // Cache-busting tokens are presentation plumbing, not version authority.
    out = out.replace(/administrator-build-\d+\.\d+\.\d+/g, `administrator-build-${build}`);
    out = out.replace(/market-core-v2\.0-alpha-build-\d+\.\d+\.\d+/g, `market-core-v2.0-alpha-build-${build}`);

    const replaceMeta = (name, value) => {
      const re = new RegExp(`<meta\\s+name=["']${name}["']\\s+content=["'][^"']*["']\\s*\\/?\\s*>`, "i");
      const tag = `<meta name="${name}" content="${String(value).replace(/"/g, "&quot;")}" />`;
      out = re.test(out) ? out.replace(re, tag) : out.replace(/<head>/i, `<head>\n  ${tag}`);
    };

    replaceMeta("administrator-build", build);
    replaceMeta("atlas-build", build);
    replaceMeta("atlas-engine-build", engine);
    replaceMeta("administrator-release", release);
    replaceMeta("agent-crypto-boot-build", build);
    replaceMeta("agent-crypto-version-owner", "build.json");

    // First-paint visible truth comes from the same manifest as the title/meta.
    // js/version-truth.js remains the runtime owner after the shell has parsed.
    out = out.replace(/<title>[\s\S]*?<\/title>/i, `<title>Agent-Crypto @erith.IA — Build ${build} · Administrator</title>`);
    out = out.replace(/(<button\b[^>]*\bid=["']atlasVersionTruthControl["'][^>]*\baria-label=["'])[^"']*(["'])/i,
      `$1Version Agent-Crypto installée : Build ${build}, mode Administrator$2`);
    out = out.replace(/<span\s+id=["']atlasVersionTruthText["'][^>]*>[\s\S]*?<\/span>/i,
      `<span id="atlasVersionTruthText">Build ${build} · Administrator</span>`);
    out = out.replace(/<span\s+id=["']footerRelease["'][^>]*>[\s\S]*?<\/span>/i,
      `<span id="footerRelease">Agent-Crypto @erith.IA · Administrator ${build} · Market Core ${engine}</span>`);
    return out;
  }

  async function fetchText(url) {
    const response = await fetch(`${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`, {
      cache: "no-store",
      credentials: "same-origin"
    });
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
    return response.text();
  }

  async function boot() {
    document.documentElement.dataset.agentCryptoBoot = "loading";
    try {
      const manifestResponse = await fetch(`${MANIFEST_URL}?t=${Date.now()}`, {
        cache: "no-store",
        credentials: "same-origin"
      });
      if (!manifestResponse.ok) throw new Error(`build.json: HTTP ${manifestResponse.status}`);
      const truth = validateTruth(await manifestResponse.json());
      const shell = patchShell(await fetchText(SHELL_URL), truth);

      globalThis.AgentCryptoBootTruth = truth;
      document.documentElement.dataset.agentCryptoBoot = "ready";
      document.open();
      document.write(shell);
      document.close();
    } catch (error) {
      console.error("[Agent-Crypto boot]", error);
      fail(String(error?.message || error || "initialisation impossible"));
    }
  }

  void boot();
})();
