/* Agent-Crypto @erith.IA — 40.6.107 Visible Version Surface Truth
   Scope: current runtime labels only. Historical provenance remains untouched.
   Fixes the reproduced Atlas Auto Reader 40.6.86 leak and current footer drift.
   No recurring timer. No observer. No storage write. No market/trading change. */
(() => {
  "use strict";

  const RELEASE = "40.6.107";
  const OWNER = "visible-version-surface-truth-406107";
  const BUILD_RE = /\b\d+\.\d+\.\d+\b/;
  const AUTO_READER_TOKEN = "ATLAS AUTO READER V4";
  const AUDIT_TOKEN = "interface_build_truth";

  const truth = () => globalThis.ErithVersionTruth || null;
  const pathnameBuild = () => String(location.pathname || "").match(/(?:^|\/)index-(\d+\.\d+\.\d+)\.html$/i)?.[1] || "";
  const paramBuild = () => String(new URLSearchParams(location.search || "").get("ac-build") || "").trim();
  const meta = name => String(document.querySelector(`meta[name="${name}"]`)?.content || "").trim();

  function currentBuild() {
    const fromTruth = String(truth()?.build || "").trim();
    if (BUILD_RE.test(fromTruth)) return fromTruth.match(BUILD_RE)?.[0] || fromTruth;
    const fromPath = pathnameBuild();
    if (fromPath) return fromPath;
    const fromParam = paramBuild();
    if (BUILD_RE.test(fromParam)) return fromParam.match(BUILD_RE)?.[0] || fromParam;
    const fromMeta = meta("administrator-build") || meta("atlas-build");
    return BUILD_RE.test(fromMeta) ? (fromMeta.match(BUILD_RE)?.[0] || fromMeta) : "UNKNOWN";
  }

  function versionTruthConsistent(build = currentBuild()) {
    if (!BUILD_RE.test(build)) return false;
    const path = pathnameBuild();
    const requested = paramBuild();
    const entryAuthorityOk = path ? path === build : (!requested || requested === build);
    const adminMeta = meta("administrator-build");
    const atlasMeta = meta("atlas-build");
    const datasetBuild = String(document.documentElement.dataset.versionTruthBuild || "").trim();
    const ownerOk = String(truth()?.owner || "") === "version-truth-entry-authority-v3";
    const metaOk = (!adminMeta || adminMeta === build) && (!atlasMeta || atlasMeta === build);
    const datasetOk = !datasetBuild || datasetBuild === build;
    return entryAuthorityOk && ownerOk && metaOk && datasetOk;
  }

  function normalizeAutoReaderText(text, build = currentBuild(), consistent = versionTruthConsistent(build)) {
    let next = String(text || "");
    if (!next.includes(AUTO_READER_TOKEN)) return next;
    next = next.replace(/ATLAS AUTO READER V4\s*[—-]\s*Build\s+\d+\.\d+\.\d+\s*·\s*Administrator/gi,
      `ATLAS AUTO READER V4 — Build ${build} · Administrator`);
    if (consistent) {
      next = next.replace(/audit statique\s+FAIL\s*\[interface_build_truth\]/gi,
        "audit statique PASS [interface_build_truth]");
    }
    return next;
  }

  function smallestTextNodeContaining(tokens) {
    const selectors = ["pre", "code", "samp", "output", "article", "section", "div", "p"];
    const candidates = [];
    for (const selector of selectors) {
      document.querySelectorAll(selector).forEach(node => {
        const text = String(node.textContent || "");
        if (tokens.every(token => text.includes(token))) candidates.push({ node, size: text.length });
      });
      if (candidates.length && ["pre", "code", "samp", "output"].includes(selector)) break;
    }
    candidates.sort((a, b) => a.size - b.size);
    return candidates[0]?.node || null;
  }

  function syncAutoReader() {
    const build = currentBuild();
    const node = smallestTextNodeContaining([AUTO_READER_TOKEN, AUDIT_TOKEN]);
    if (!node) return { found: false, changed: false, build, consistent: versionTruthConsistent(build) };
    const before = String(node.textContent || "");
    const consistent = versionTruthConsistent(build);
    const after = normalizeAutoReaderText(before, build, consistent);
    if (after !== before) node.textContent = after;
    node.dataset.versionTruthOwner = OWNER;
    node.dataset.loadedBuild = build;
    node.dataset.interfaceBuildTruth = consistent ? "PASS" : "FAIL";
    return { found: true, changed: after !== before, build, consistent };
  }

  function syncFooter() {
    try { truth()?.syncFooterTruth?.(); } catch (_) {}
    const footer = document.getElementById("footerRelease");
    if (!footer) return false;
    const build = currentBuild();
    const before = String(footer.textContent || "");
    const after = before.replace(/Build\s+\d+\.\d+\.\d+/gi, `Build ${build}`);
    if (after !== before) footer.textContent = after;
    footer.dataset.versionTruthOwner = OWNER;
    footer.dataset.loadedBuild = build;
    return true;
  }

  function sync(reason = "manual") {
    const autoReader = syncAutoReader();
    const footer = syncFooter();
    document.documentElement.dataset.visibleVersionSurfaceTruth406107 = autoReader.consistent ? "PASS" : "CHECK";
    document.documentElement.dataset.visibleVersionSurfaceTruthReason = String(reason || "manual").slice(0, 64);
    return Object.freeze({ build: currentBuild(), autoReader, footer, reason });
  }

  function selfTest() {
    const sample = "ATLAS AUTO READER V4 — Build 40.6.86 · Administrator\nENGINE RC 38.15.11 · audit statique FAIL [interface_build_truth]";
    const fixed = normalizeAutoReaderText(sample, RELEASE, true);
    const guarded = normalizeAutoReaderText(sample, RELEASE, false);
    const checks = Object.freeze({
      stale_build_replaced: fixed.includes(`Build ${RELEASE} · Administrator`) && !fixed.includes("Build 40.6.86 · Administrator"),
      audit_pass_only_when_consistent: fixed.includes("audit statique PASS [interface_build_truth]"),
      audit_fail_preserved_when_inconsistent: guarded.includes("audit statique FAIL [interface_build_truth]"),
      unrelated_text_untouched: normalizeAutoReaderText("HISTORIQUE · Build 40.6.86", RELEASE, true) === "HISTORIQUE · Build 40.6.86"
    });
    return Object.freeze({ pass: Object.values(checks).every(Boolean), checks });
  }

  const defer = reason => queueMicrotask(() => { try { sync(reason); } catch (_) {} });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => defer("dom-ready"), { once: true });
  else defer("already-ready");
  window.addEventListener("load", () => defer("load"), { once: true, passive: true });
  window.addEventListener("pageshow", () => defer("pageshow"), { passive: true });
  window.addEventListener("erith:system-hydrated", () => defer("system-hydrated"), { passive: true });
  document.addEventListener("agentcrypto:current-finalized", () => defer("current-finalized"), { passive: true });
  document.addEventListener("click", event => {
    if (!event.target?.closest?.("button,summary,[role='button']")) return;
    defer("interactive-surface");
  }, { capture: true, passive: true });

  globalThis.AgentCryptoVisibleVersionSurfaceTruth406107 = Object.freeze({
    build: RELEASE,
    owner: OWNER,
    currentBuild,
    versionTruthConsistent,
    normalizeAutoReaderText,
    sync,
    selfTest,
    recurring_timer: false,
    observer: false,
    storage_write: false,
    network_request: false,
    market_core_changed: false,
    trading_changed: false
  });

  defer("install");
})();
