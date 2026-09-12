/* Agent-Crypto @erith.IA — 40.6.103
   Generated Report Version Truth.
   Corrects user-facing generated Markdown/report build labels without changing
   the protected legacy ATLAS_BUILD constant or analytical fingerprints.
   No timer, observer, network owner, storage write, trading or wallet. */
(() => {
  "use strict";
  const PATCH = "40.6.103";
  const ENTRY_RE = /(?:^|\/)index-(\d+\.\d+\.\d+)\.html$/i;
  const BUILD_RE = /^\d+\.\d+\.\d+$/;
  const params = new URLSearchParams(location.search || "");
  const entryBuild = String(location.pathname || "").match(ENTRY_RE)?.[1] || "";
  const requestedBuild = String(params.get("ac-build") || "").trim();
  const metaBuild = String(document.querySelector('meta[name="administrator-build"]')?.content || "").trim();
  const BUILD = String(globalThis.ErithVersionTruth?.build || entryBuild || (BUILD_RE.test(requestedBuild) ? requestedBuild : metaBuild) || "UNKNOWN").trim();
  const LABEL = BUILD_RE.test(BUILD) ? `Build ${BUILD} · Administrator` : "Build UNKNOWN · Administrator";
  const STALE_RELEASE_RE = /Build\s+\d+\.\d+\.\d+\s*·\s*Administrator/g;
  const TARGETS = Object.freeze([
    "atlasMemoryIntelligenceMarkdown",
    "buildLearningJournalMarkdown",
    "buildMemoryReportMarkdown",
    "buildAutomaticLearningJournalMarkdown",
    "buildWakePlanText",
    "buildCollectionPlanMarkdown"
  ]);
  const originals = new Map();

  const normalize = value => typeof value === "string" ? value.replace(STALE_RELEASE_RE, LABEL) : value;

  function wrap(name) {
    const current = globalThis[name];
    if (typeof current !== "function") return false;
    if (current.__generated_report_version_truth_406103 === true) return true;
    const original = current;
    const wrapped = function(...args) { return normalize(original.apply(this, args)); };
    Object.defineProperty(wrapped, "__generated_report_version_truth_406103", { value: true });
    Object.defineProperty(wrapped, "__generated_report_version_truth_original", { value: original });
    originals.set(name, original);
    globalThis[name] = wrapped;
    return true;
  }

  function syncVisibleGeneratedJournal() {
    const node = document.getElementById("simLearningOutput");
    if (!node || typeof node.textContent !== "string") return false;
    const current = node.textContent;
    const next = normalize(current);
    if (next !== current) node.textContent = next;
    return next !== current;
  }

  function install() {
    let wrapped = 0;
    for (const name of TARGETS) if (wrap(name)) wrapped += 1;
    const visibleJournalCorrected = syncVisibleGeneratedJournal();
    document.documentElement.dataset.generatedReportVersionTruth406103 = wrapped === TARGETS.length ? "active" : "partial";
    document.documentElement.dataset.generatedReportVersionTruthBuild406103 = BUILD;
    document.documentElement.dataset.generatedReportVersionTruthWrapped406103 = String(wrapped);
    return Object.freeze({ build: BUILD, label: LABEL, wrapped, expected: TARGETS.length, visible_journal_corrected: visibleJournalCorrected });
  }

  const onReady = () => { try { install(); } catch (_) {} };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", onReady, { once: true });
  else queueMicrotask(onReady);
  window.addEventListener("erith:system-hydrated", onReady, { once: true, passive: true });

  globalThis.AgentCryptoGeneratedReportVersionTruth406103 = Object.freeze({
    patch: PATCH,
    build: BUILD,
    label: LABEL,
    targets: TARGETS,
    install,
    normalize,
    recurring_timer: false,
    observer: false,
    network_owner: false,
    storage_write: false,
    trading: false,
    wallet: false
  });
})();
