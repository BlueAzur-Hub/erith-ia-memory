/* Agent-Crypto @erith.IA — 40.6.143 ATLAS AUTO READER UX TRUTH
   Presentation only. Mirrors existing Auto Reader DOM truth into the collapsed
   summary. No collector cadence, storage, fetch, timer or business logic change. */
(() => {
  "use strict";

  const BUILD = "40.6.143";
  const STYLE_ID = "agentCryptoAutoReaderPresentation143Style";
  const READOUT_ID = "agentCryptoAutoReaderSummary143";
  let observer = null;

  const text = id => document.getElementById(id)?.textContent?.replace(/\s+/g, " ").trim() || "—";

  function root() {
    return document.querySelector('details[data-collapse-key="auto-reader"]');
  }

  function installStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${READOUT_ID}{margin-left:auto;display:flex;align-items:center;gap:7px;min-width:0;padding-left:10px}
      #${READOUT_ID}>b,#${READOUT_ID}>span{display:inline-flex;align-items:center;min-height:24px;padding:4px 8px;border:1px solid rgba(119,205,224,.18);border-radius:999px;background:rgba(3,15,25,.58);font:900 8.5px/1 system-ui,sans-serif;white-space:nowrap}
      #${READOUT_ID}>b{color:#c9f8e1;border-color:rgba(103,226,179,.30);background:rgba(30,135,105,.10)}
      #${READOUT_ID}>span{max-width:240px;color:#9eb5c0;overflow:hidden;text-overflow:ellipsis}
      #${READOUT_ID}[data-state="live"]>b{color:#b9ff99;border-color:rgba(156,246,93,.38);background:rgba(100,164,49,.10)}
      #${READOUT_ID}[data-state="rest"]>b{color:#ffe0a1;border-color:rgba(255,205,103,.34);background:rgba(166,111,35,.10)}
      #${READOUT_ID}[data-state="waiting"]>b{color:#c7d6df;border-color:rgba(150,180,198,.24)}
      @media(max-width:980px){#${READOUT_ID}>span{display:none}}
      @media(max-width:720px){#${READOUT_ID}{width:100%;margin-left:42px;padding-left:0;flex-wrap:wrap}}
    `;
    document.head.appendChild(style);
  }

  function ensureReadout() {
    const details = root();
    const summary = details?.querySelector(":scope > summary");
    if (!summary) return null;
    let node = document.getElementById(READOUT_ID);
    if (!node) {
      node = document.createElement("span");
      node.id = READOUT_ID;
      node.dataset.owner = "auto-reader-presentation";
      node.dataset.presentationOnly = "true";
      node.innerHTML = '<b data-auto-reader-summary-mode>ÉTAT EN ATTENTE</b><span data-auto-reader-summary-last>Dernière lecture · —</span>';
      summary.appendChild(node);
    }
    return node;
  }

  function render() {
    installStyle();
    const node = ensureReadout();
    if (!node) return false;

    const mode = text("autoReaderTruth");
    const visibility = text("autoVisibilityTruth");
    const last = text("autoLastRead");
    const modeNorm = mode.toLowerCase();
    const visibilityNorm = visibility.toLowerCase();
    const active = modeNorm.includes("actif") || modeNorm.includes("on");
    const visible = visibilityNorm.includes("visible") && !visibilityNorm.includes("non visible");
    const state = active && visible ? "live" : (!active || !visible) ? "rest" : "waiting";

    node.dataset.state = state;
    const modeNode = node.querySelector("[data-auto-reader-summary-mode]");
    const lastNode = node.querySelector("[data-auto-reader-summary-last]");
    if (modeNode) modeNode.textContent = `${mode} · ${visibility}`;
    if (lastNode) lastNode.textContent = `Dernière lecture · ${last}`;
    node.title = `Atlas Auto Reader — ${mode} — ${visibility} — dernière lecture ${last}`;
    return true;
  }

  function bindObserver() {
    const details = root();
    if (!details || observer) return;
    const targets = ["autoReaderTruth", "autoVisibilityTruth", "autoLastRead", "autoNextRead"]
      .map(id => document.getElementById(id)).filter(Boolean);
    if (!targets.length) return;
    observer = new MutationObserver(render);
    for (const target of targets) observer.observe(target, { childList: true, characterData: true, subtree: true });
    details.addEventListener("toggle", render);
    document.addEventListener("visibilitychange", render);
  }

  function bind() {
    const ok = render();
    bindObserver();
    return ok;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind, { once: true });
  else bind();

  globalThis.AgentCryptoAutoReaderPresentation = Object.freeze({
    build: BUILD,
    owner: "auto-reader-presentation",
    presentation_only: true,
    collector_logic_changed: false,
    cadence_changed: false,
    fetch_added: false,
    storage_added: false,
    timer_added: false,
    bounded_observer: true,
    render
  });
})();
