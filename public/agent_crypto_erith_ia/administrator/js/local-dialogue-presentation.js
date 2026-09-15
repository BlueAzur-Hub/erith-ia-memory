/* Agent-Crypto @erith.IA — canonical Local Dialogue Presentation owner.
   Introduced by Administrator 40.6.112.
   Presentation/readability only for the existing Atlas/Aerith local dialogue.
   No analytical mutation. No recurring timer. No observer. No storage/network write. */
(() => {
  "use strict";

  const OWNER = "local-dialogue-presentation";
  const STYLE_ID = "agentCryptoLocalDialoguePresentationStyle";
  const SUMMARY_CLASS = "ac-local-dialogue-summary";
  const PROVENANCE_CLASS = "ac-local-provenance-v2";

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return false;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .${SUMMARY_CLASS}{
        position:relative;margin-top:14px;padding:16px 16px 14px;border:1px solid rgba(94,228,255,.34);
        border-radius:14px;background:
          radial-gradient(circle at 88% 12%,rgba(76,213,255,.10),transparent 28%),
          linear-gradient(135deg,rgba(7,28,44,.97),rgba(9,23,38,.95) 58%,rgba(30,24,52,.90));
        box-shadow:inset 0 1px 0 rgba(255,255,255,.045),0 10px 26px rgba(0,0,0,.18);
        color:#e5fbff!important;font-size:15px!important;line-height:1.45!important;font-weight:820!important;
      }
      .${SUMMARY_CLASS}::before{
        content:"LOCAL AI · ÉTAT";display:block;margin-bottom:8px;color:#93efff;
        font:900 10px/1.1 system-ui,sans-serif;letter-spacing:.18em;text-transform:uppercase;
      }
      .ac-local-dialogue-v2-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
      .ac-local-dialogue-v2-title{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
      .ac-local-dialogue-v2-title strong{font:950 18px/1.05 system-ui,sans-serif;color:#fff0b9;letter-spacing:.01em}
      .ac-local-dialogue-v2-title span{font:850 12px/1.1 system-ui,sans-serif;color:#b7d4df}
      .ac-local-dialogue-v2-state{padding:6px 10px;border-radius:999px;border:1px solid rgba(100,245,202,.34);background:rgba(35,171,131,.12);color:#aef9dd;font:950 11px/1 system-ui,sans-serif;letter-spacing:.06em}
      .ac-local-dialogue-v2-state[data-mode="active"]{border-color:rgba(104,227,255,.42);background:rgba(54,176,212,.13);color:#c8f7ff}
      .ac-local-dialogue-v2-state[data-mode="waiting"]{border-color:rgba(255,216,121,.34);background:rgba(190,137,34,.10);color:#ffe6a8}
      .ac-local-dialogue-v2-meter{height:8px;margin:12px 0 10px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden;box-shadow:inset 0 0 0 1px rgba(255,255,255,.035)}
      .ac-local-dialogue-v2-meter>i{display:block;height:100%;width:var(--ac-local-progress,0%);border-radius:inherit;background:linear-gradient(90deg,#4bd8ff,#63efd0 62%,#ffe37d);box-shadow:0 0 18px rgba(84,226,223,.24);transition:width .22s ease}
      .ac-local-dialogue-v2-steps{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:7px}
      .ac-local-dialogue-v2-step{min-height:42px;display:flex;align-items:center;justify-content:center;gap:5px;padding:7px 8px;border:1px solid rgba(255,255,255,.10);border-radius:10px;background:rgba(255,255,255,.025);color:#718a9b;font:850 10px/1.15 system-ui,sans-serif;text-align:center}
      .ac-local-dialogue-v2-step[data-state="done"]{border-color:rgba(76,235,183,.32);background:rgba(31,157,126,.12);color:#bffbe6}
      .ac-local-dialogue-v2-step[data-state="active"]{border-color:rgba(105,232,255,.48);background:rgba(48,170,207,.14);color:#ddfbff;box-shadow:0 0 0 1px rgba(105,232,255,.055) inset}
      .ac-local-dialogue-v2-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:10px;color:#9db8c5;font:750 11px/1.35 system-ui,sans-serif}
      .ac-local-dialogue-v2-foot b{color:#cbeef5;font-weight:900}
      .${PROVENANCE_CLASS}{display:block!important;margin-top:10px!important;padding:14px!important;border:1px solid rgba(92,227,203,.28)!important;border-radius:12px!important;background:linear-gradient(135deg,rgba(9,40,48,.78),rgba(16,31,47,.78))!important;color:#d9fbf5!important;font-size:14px!important;line-height:1.4!important;white-space:normal!important}
      .ac-local-prov-label{display:block;margin-bottom:10px;color:#91efe1;font:950 10px/1 system-ui,sans-serif;letter-spacing:.17em;text-transform:uppercase}
      .ac-local-prov-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
      .ac-local-prov-cell{padding:10px 11px;border:1px solid rgba(255,255,255,.09);border-radius:10px;background:rgba(255,255,255,.025)}
      .ac-local-prov-cell small{display:block;margin-bottom:5px;color:#7fa3af;font:900 9px/1 system-ui,sans-serif;letter-spacing:.11em;text-transform:uppercase}
      .ac-local-prov-cell strong{display:block;color:#f2ffff;font:950 13px/1.25 system-ui,sans-serif;overflow-wrap:anywhere}
      .ac-local-prov-note{margin-top:9px;color:#95b8c0;font:750 11px/1.35 system-ui,sans-serif}
      @media(max-width:1000px){.ac-local-dialogue-v2-steps{grid-template-columns:repeat(3,minmax(0,1fr))}.ac-local-prov-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
    return true;
  }

  function cleanText(node) {
    return String(node?.textContent || "").replace(/\s+/g, " ").trim();
  }

  function smallestContaining(tokens, root = document) {
    const candidates = [];
    root.querySelectorAll?.("p,small,div,footer,section,article,output,strong,span").forEach(node => {
      const text = cleanText(node);
      if (!text) return;
      if (tokens.every(token => text.includes(token))) candidates.push({ node, size: text.length });
    });
    candidates.sort((a, b) => a.size - b.size);
    return candidates[0]?.node || null;
  }

  function dialogueHost() {
    const anchor = smallestContaining(["Interroger Atlas-10 ou Aerith-10"]);
    if (!anchor) return null;
    return anchor.closest("section,article,.admin-window,.admin-card,.admin-subsection") || anchor.parentElement?.parentElement || null;
  }

  function currentStateText(root) {
    const candidates = [];
    root.querySelectorAll?.("p,small,div,output,strong,span").forEach(node => {
      const text = cleanText(node);
      if (!text || text.length > 550) return;
      if (/Dialogue local prêt avec|CURRENT validé|Atlas\s*\d\s*\/\s*4|rapports? prêts?|moteur local au repos/i.test(text)) candidates.push(text);
    });
    return candidates.join(" · ");
  }

  function parseProgress(text) {
    const value = String(text || "");
    const reportMatches = [...value.matchAll(/Atlas(?:-10)?\s*(\d)\s*\/\s*4|(?:Atlas-10\s*)?(\d)\s*\/\s*4\s+rapports?/gi)];
    let reports = 0;
    for (const match of reportMatches) reports = Math.max(reports, Number(match[1] || match[2] || 0));
    const percentMatches = [...value.matchAll(/(?:Atlas-10\s*)?(\d{1,3})\s*%/gi)];
    let percent = 0;
    for (const match of percentMatches) percent = Math.max(percent, Number(match[1] || 0));
    const currentClosed = /CURRENT\s+(?:validé|fermé|restauré)/i.test(value) && /moteur(?: local)? au repos|REPOS/i.test(value);
    const nox = /NØX\s*(?:validé|validée|✓|OK|No-FOMO passé)/i.test(value) || currentClosed;
    const aerith = /Aerith\s*(?:validé|validée|✓|OK|Synthèse disponible)/i.test(value) || currentClosed;
    if (currentClosed) reports = 4;
    if (!percent) percent = reports * 25;
    if (nox && reports >= 4) percent = Math.max(percent, 88);
    if (aerith && reports >= 4) percent = 100;
    percent = Math.max(0, Math.min(100, percent));
    return { reports: Math.max(0, Math.min(4, reports)), percent, nox, aerith, currentClosed };
  }

  function modelName(root) {
    const text = currentStateText(root);
    return text.match(/gpt-oss:20b-32k/i)?.[0] || "gpt-oss:20b-32k";
  }

  function renderSummary() {
    const root = dialogueHost();
    if (!root) return false;
    const sourceText = currentStateText(root);
    const state = parseProgress(sourceText);
    const status = [...root.querySelectorAll?.("p,small,div,output,strong") || []]
      .filter(node => /Dialogue local prêt avec/i.test(cleanText(node)))
      .sort((a, b) => cleanText(a).length - cleanText(b).length)[0]
      || smallestContaining(["Dialogue local prêt avec"], root)
      || smallestContaining(["CURRENT validé", "moteur local au repos"], root);
    if (!status?.parentNode) return false;

    const hosts = [...document.querySelectorAll(`.${SUMMARY_CLASS}`)];
    let host = root.querySelector?.(`.${SUMMARY_CLASS}`) || hosts[0] || null;
    if (!host) {
      host = document.createElement("div");
      host.className = SUMMARY_CLASS;
      host.dataset.localDialoguePresentationOwner = OWNER;
    }
    if (host.parentNode !== status.parentNode || status.nextElementSibling !== host) {
      status.insertAdjacentElement("afterend", host);
    }
    hosts.filter(node => node !== host).forEach(node => node.remove());

    const steps = ["01 · Marché", "02 · Top 5", "03 · Math", "04 · Contradictions", "NØX", "Aerith"];
    const stepHtml = steps.map((label, index) => {
      let stepState = "waiting";
      if (index < 4) stepState = index < state.reports ? "done" : index === state.reports && !state.currentClosed ? "active" : "waiting";
      if (index === 4) stepState = state.nox ? "done" : state.reports >= 4 ? "active" : "waiting";
      if (index === 5) stepState = state.aerith ? "done" : state.nox ? "active" : "waiting";
      return `<span class="ac-local-dialogue-v2-step" data-state="${stepState}">${label}</span>`;
    }).join("");

    const stateLabel = state.currentClosed ? "CURRENT VALIDÉ" : state.reports ? `ATLAS ${state.reports}/4` : "PRÊT";
    const stateMode = state.currentClosed ? "done" : state.reports ? "active" : "waiting";
    host.innerHTML = `
      <div class="ac-local-dialogue-v2-head">
        <div class="ac-local-dialogue-v2-title"><strong>ATLAS · ${state.reports}/4 · ${state.percent} %</strong><span>${modelName(root)}</span></div>
        <span class="ac-local-dialogue-v2-state" data-mode="${stateMode}">${stateLabel}</span>
      </div>
      <div class="ac-local-dialogue-v2-meter" style="--ac-local-progress:${state.percent}%"><i></i></div>
      <div class="ac-local-dialogue-v2-steps">${stepHtml}</div>
      <div class="ac-local-dialogue-v2-foot"><span>Pipeline <b>Marché → Top 5 → Math → Contradictions → NØX → Aerith</b></span><span>${state.currentClosed ? "REPOS · lecture seule" : "Analyse locale en cours"}</span></div>`;
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

  function provenanceParts(text) {
    const clean = String(text || "").replace(/\s+/g, " ").trim();
    const snapshot = clean.match(/snapshot marché\s*:\s*(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})/i)?.[1]
      || clean.match(/snapshot\s+(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})/i)?.[1] || "—";
    const current = clean.match(/CURRENT produit\s*:\s*(\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}:\d{2})/i)?.[1]
      || formatTimestamp(analyticalLatestAt());
    const reports = clean.match(/(\d)\s+rapports Atlas-10/i)?.[1] || "4";
    const source = clean.match(/source\s*:?\s*([^·]+)/i)?.[1]?.trim() || "Ryzen7-Christophe";
    const bridge = /contrat Bridge validé/i.test(clean) ? "Bridge validé" : "Bridge local";
    return { snapshot, current: current || "—", reports, source, bridge };
  }

  function renderProvenance() {
    const node = smallestContaining(["Aerith-10", "contrat Bridge validé"]);
    if (!node) return false;
    const parts = provenanceParts(cleanText(node));
    node.classList.add(PROVENANCE_CLASS);
    node.dataset.localDialoguePresentationOwner = OWNER;
    node.innerHTML = `
      <span class="ac-local-prov-label">Provenance analytique</span>
      <div class="ac-local-prov-grid">
        <div class="ac-local-prov-cell"><small>Snapshot marché</small><strong>${parts.snapshot}</strong></div>
        <div class="ac-local-prov-cell"><small>CURRENT produit</small><strong>${parts.current}</strong></div>
        <div class="ac-local-prov-cell"><small>Chaîne locale</small><strong>Atlas ${parts.reports}/4 · ${parts.bridge}</strong></div>
      </div>
      <div class="ac-local-prov-note">${parts.source} · lecture seule · snapshot marché et CURRENT volontairement séparés.</div>`;
    return true;
  }

  function sync(reason = "manual") {
    installStyles();
    const result = Object.freeze({ summary: renderSummary(), provenance: renderProvenance(), reason });
    document.documentElement.dataset.localDialoguePresentation = "canonical";
    return result;
  }

  function selfTest() {
    const active = parseProgress("Dialogue local prêt avec gpt-oss:20b-32k · Atlas-10 75 % · 3/4 rapports prêts");
    const done = parseProgress("CURRENT restauré · Atlas 4/4 · NØX validé · Aerith validée · moteur local au repos");
    const prov = provenanceParts("Aerith-10 · ollama · gpt-oss:20b-32k · snapshot marché : 13/09/2026 08:45:07 · 4 rapports Atlas-10 · contrat Bridge validé · CURRENT produit : 13/09/2026 10:36:33");
    const checks = Object.freeze({
      active_3_of_4_is_75: active.reports === 3 && active.percent === 75,
      completed_chain_is_100: done.reports === 4 && done.percent === 100 && done.currentClosed,
      snapshot_and_current_separated: prov.snapshot === "13/09/2026 08:45:07" && prov.current === "13/09/2026 10:36:33",
      bridge_and_reports_preserved: prov.bridge === "Bridge validé" && prov.reports === "4"
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

  globalThis.AgentCryptoLocalDialoguePresentation = Object.freeze({
    owner: OWNER,
    canonical_active_filename: "js/local-dialogue-presentation.js",
    parseProgress,
    provenanceParts,
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