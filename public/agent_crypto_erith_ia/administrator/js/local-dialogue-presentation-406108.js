/* Agent-Crypto @erith.IA — 40.6.108 Local Dialogue Presentation Truth
   Visual/readability layer for the existing Atlas/Aerith local dialogue.
   Separates market-snapshot time from analytical CURRENT completion time.
   No analytical mutation. No recurring timer. No observer. No storage/network write. */
(() => {
  "use strict";

  const RELEASE = "40.6.108";
  const OWNER = "local-dialogue-presentation-406108";
  const STYLE_ID = "agentCryptoLocalDialoguePresentation406108Style";
  const STEPS_ATTR = "data-ac-local-dialogue-steps-406108";

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return false;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .ac-local-dialogue-stage-406108{
        position:relative;margin-top:14px;padding:18px 18px 16px;border:1px solid rgba(105,232,255,.34);
        border-radius:14px;background:linear-gradient(135deg,rgba(11,31,49,.96),rgba(12,24,40,.92) 58%,rgba(35,26,58,.86));
        box-shadow:inset 0 1px 0 rgba(255,255,255,.045),0 10px 28px rgba(0,0,0,.18);
        color:#dff8ff;font-size:16px!important;line-height:1.45!important;font-weight:800!important;letter-spacing:.01em;
      }
      .ac-local-dialogue-stage-406108::before{
        content:"PIPELINE LOCAL";display:block;margin-bottom:7px;color:#a9f4ff;font:900 10px/1.1 system-ui,sans-serif;
        letter-spacing:.18em;text-transform:uppercase;
      }
      [${STEPS_ATTR}]{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:7px;margin:10px 0 2px}
      [${STEPS_ATTR}] .ac-step-406108{display:flex;align-items:center;justify-content:center;gap:5px;min-height:34px;padding:6px 8px;
        border:1px solid rgba(255,255,255,.10);border-radius:9px;background:rgba(255,255,255,.025);color:#8296a6;
        font:850 10px/1.15 system-ui,sans-serif;text-align:center}
      [${STEPS_ATTR}] .ac-step-406108[data-state="done"]{border-color:rgba(76,235,183,.34);background:rgba(31,157,126,.12);color:#bdfbe5}
      [${STEPS_ATTR}] .ac-step-406108[data-state="active"]{border-color:rgba(105,232,255,.48);background:rgba(48,170,207,.14);color:#d7f9ff;box-shadow:0 0 0 1px rgba(105,232,255,.06) inset}
      .ac-local-dialogue-meter-406108{height:5px;margin:9px 0 2px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden}
      .ac-local-dialogue-meter-406108>i{display:block;height:100%;width:var(--ac-local-dialogue-progress,0%);border-radius:inherit;
        background:linear-gradient(90deg,#51d9ff,#69f0d0 62%,#ffe58a);transition:width .22s ease}
      .ac-local-provenance-406108{display:block!important;margin-top:8px!important;padding:9px 12px!important;border:1px solid rgba(92,227,203,.25)!important;
        border-radius:9px!important;background:rgba(11,43,49,.58)!important;color:#aef5e8!important;font-size:13px!important;line-height:1.45!important;
        letter-spacing:.01em!important;white-space:normal!important}
      .ac-conserved-synthesis-time-406108{display:block!important;margin:10px 0!important;padding:11px 13px!important;border:1px solid rgba(91,221,255,.25)!important;
        border-radius:10px!important;background:linear-gradient(90deg,rgba(18,55,71,.74),rgba(20,38,58,.64))!important;color:#d9f8ff!important;
        font-size:13px!important;line-height:1.5!important;font-weight:750!important;letter-spacing:.01em!important;white-space:normal!important}
      @media(max-width:900px){[${STEPS_ATTR}]{grid-template-columns:repeat(3,minmax(0,1fr))}}
    `;
    document.head.appendChild(style);
    return true;
  }

  function smallestContaining(tokens, root = document) {
    const candidates = [];
    root.querySelectorAll?.("p,small,div,footer,section,article,output,strong").forEach(node => {
      const text = String(node.textContent || "").replace(/\s+/g, " ").trim();
      if (!text) return;
      if (tokens.every(token => text.includes(token))) candidates.push({ node, size: text.length });
    });
    candidates.sort((a, b) => a.size - b.size);
    return candidates[0]?.node || null;
  }

  function parseAtlasProgress(text) {
    const value = String(text || "");
    const countMatch = value.match(/(\d)\s*\/\s*4\s+rapports?/i);
    const percentMatch = value.match(/(\d{1,3})\s*%/);
    const chainDone = /Chaîne terminée/i.test(value) && /NØX/i.test(value) && /Aerith/i.test(value);
    const reports = chainDone ? 4 : Math.max(0, Math.min(4, Number(countMatch?.[1] || 0)));
    const percent = chainDone ? 100 : Math.max(0, Math.min(100, Number(percentMatch?.[1] || (reports * 25))));
    return { reports, percent, nox: chainDone || /NØX\s*(?:validé|✓|OK)/i.test(value), aerith: chainDone || /Aerith\s*(?:validée|✓|OK)/i.test(value) };
  }

  function renderSteps(statusNode) {
    if (!statusNode?.parentNode) return false;
    const state = parseAtlasProgress(statusNode.textContent || "");
    let steps = statusNode.parentNode.querySelector?.(`[${STEPS_ATTR}]`);
    if (!steps) {
      steps = document.createElement("div");
      steps.setAttribute(STEPS_ATTR, "true");
      statusNode.insertAdjacentElement("afterend", steps);
    }
    const labels = ["01 · Marché", "02 · Top 5", "03 · Math", "04 · Contradictions", "NØX", "Aerith"];
    steps.innerHTML = labels.map((label, index) => {
      let stepState = "waiting";
      if (index < 4) stepState = index < state.reports ? "done" : index === state.reports ? "active" : "waiting";
      if (index === 4) stepState = state.nox ? "done" : state.reports >= 4 ? "active" : "waiting";
      if (index === 5) stepState = state.aerith ? "done" : state.nox ? "active" : "waiting";
      return `<span class="ac-step-406108" data-state="${stepState}">${label}</span>`;
    }).join("") + `<div class="ac-local-dialogue-meter-406108" style="grid-column:1/-1;--ac-local-dialogue-progress:${state.percent}%"><i></i></div>`;
    return true;
  }

  function syncStage() {
    let node = smallestContaining(["Dialogue local prêt avec", "Atlas-10"]);
    if (!node) node = smallestContaining(["Chaîne terminée", "Atlas 4/4", "Aerith"]);
    if (!node) return false;
    node.classList.add("ac-local-dialogue-stage-406108");
    node.dataset.localDialoguePresentationOwner = OWNER;
    renderSteps(node);
    return true;
  }

  function analyticalLatestAt() {
    try {
      const stats = globalThis.atlasAnalyticalMemoryStats394?.();
      return stats?.latestAt || stats?.latest?.saved_at || stats?.latest?.source_time || "";
    } catch (_) { return ""; }
  }

  function formatTimestamp(value) {
    const raw = String(value || "").trim();
    if (!raw) return "—";
    if (/^\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2}$/.test(raw)) return raw;
    const date = new Date(raw);
    if (!Number.isFinite(date.getTime())) return raw;
    return date.toLocaleString("fr-FR", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit", second:"2-digit", hour12:false });
  }

  function syncProvenance() {
    const node = smallestContaining(["Aerith-10", "contrat Bridge validé"]);
    if (!node) return false;
    const currentAt = formatTimestamp(analyticalLatestAt());
    let text = String(node.textContent || "").replace(/\s+/g, " ").trim();
    text = text.replace(/\bsnapshot\s+(?!marché\s*:)/i, "snapshot marché : ");
    text = text.replace(/\s*·\s*CURRENT produit\s*:\s*[^·]+/i, "");
    if (currentAt !== "—") text += ` · CURRENT produit : ${currentAt}`;
    node.textContent = text;
    node.classList.add("ac-local-provenance-406108");
    node.dataset.localDialoguePresentationOwner = OWNER;
    return true;
  }

  function parseConservedLine(text) {
    const clean = String(text || "").replace(/\s+/g, " ").trim();
    const original = clean.match(/SYNTHÈSE CONSERVÉE\s*·\s*lecture seule\s*·\s*source\s+([^·]+)\s*·\s*(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})/i);
    if (original) return { source: original[1].trim(), marketAt: original[2].trim() };
    const market = clean.match(/snapshot marché\s*:\s*(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})/i)?.[1] || "";
    const source = clean.match(/source\s*:\s*([^·]+)/i)?.[1] || "";
    return market && source ? { source: source.trim(), marketAt: market.trim() } : null;
  }

  function syncConservedTimeTruth() {
    const node = smallestContaining(["SYNTHÈSE CONSERVÉE", "ne compte jamais comme CURRENT local"]);
    if (!node) return false;
    const parsed = {
      source: node.dataset.marketSnapshotSource406108 || "",
      marketAt: node.dataset.marketSnapshotAt406108 || ""
    };
    const discovered = parsed.source && parsed.marketAt ? parsed : parseConservedLine(node.textContent || "");
    if (!discovered) return false;
    node.dataset.marketSnapshotSource406108 = discovered.source;
    node.dataset.marketSnapshotAt406108 = discovered.marketAt;
    const currentAt = formatTimestamp(analyticalLatestAt());
    const currentPart = currentAt !== "—" ? ` · CURRENT produit : ${currentAt}` : "";
    node.textContent = `SYNTHÈSE CONSERVÉE · snapshot marché : ${discovered.marketAt}${currentPart} · source : ${discovered.source} · lecture seule · ne compte jamais comme CURRENT local si le fingerprint diffère`;
    node.classList.add("ac-conserved-synthesis-time-406108");
    node.dataset.localDialoguePresentationOwner = OWNER;
    return true;
  }

  function sync(reason = "manual") {
    installStyles();
    const result = Object.freeze({
      stage: syncStage(),
      provenance: syncProvenance(),
      conserved_time_truth: syncConservedTimeTruth(),
      reason
    });
    document.documentElement.dataset.localDialoguePresentation406108 = "1";
    return result;
  }

  function selfTest() {
    const p = parseAtlasProgress("Dialogue local prêt avec gpt-oss:20b-32k · Atlas-10 75 % · 3/4 rapports prêts.");
    const c = parseConservedLine("SYNTHÈSE CONSERVÉE · lecture seule · source ryzen7-christophe · 13/09/2026 08:45:07 · ne compte jamais comme CURRENT local si le fingerprint diffère");
    const rewritten = parseConservedLine("SYNTHÈSE CONSERVÉE · snapshot marché : 13/09/2026 08:45:07 · CURRENT produit : 13/09/2026 10:36:33 · source : ryzen7-christophe · lecture seule · ne compte jamais comme CURRENT local si le fingerprint diffère");
    const checks = Object.freeze({
      atlas_progress_3_of_4: p.reports === 3 && p.percent === 75,
      market_snapshot_time_parsed: c?.marketAt === "13/09/2026 08:45:07",
      source_and_rewritten_line_stable: c?.source === "ryzen7-christophe" && rewritten?.source === "ryzen7-christophe" && rewritten?.marketAt === c?.marketAt,
      historical_time_not_replaced_by_now: formatTimestamp("13/09/2026 08:45:07") === "13/09/2026 08:45:07"
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

  globalThis.AgentCryptoLocalDialoguePresentation406108 = Object.freeze({
    build: RELEASE,
    owner: OWNER,
    parseAtlasProgress,
    parseConservedLine,
    formatTimestamp,
    sync,
    selfTest,
    visual_only: true,
    analytical_state_changed: false,
    recurring_timer: false,
    observer: false,
    storage_write: false,
    network_request: false,
    market_core_changed: false,
    trading_changed: false
  });

  defer("install");
})();
