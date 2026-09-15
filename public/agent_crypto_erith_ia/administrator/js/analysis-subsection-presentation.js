/* Agent-Crypto @erith.IA — 40.6.147 ANALYSIS SUBSECTION HIERARCHY
   Presentation only. Harmonises the collapsed Analysis/Oracle/Sentinel subsections
   with the validated 40.6.146 two-line hierarchy: larger title, descriptive copy
   below, more breathing room. No data, engine, fetch, timer, storage or business logic. */
(() => {
  "use strict";

  const BUILD = "40.6.147";
  const STYLE_ID = "agentCryptoAnalysisSubsectionPresentation147";
  const KEYS = Object.freeze([
    "astrocycle",
    "celestial-sentinel",
    "news-sentinel",
    "news-market-explanation",
    "news-plan",
    "lecture-verrou",
    "mode-debutant-avance",
    "watch-risques",
    "impact",
    "nofomo-news",
    "oracle-models-calibration",
    "oracle-sources-runtime",
    "oracle-evidence-explorer"
  ]);

  function selectors(suffix = "") {
    return KEYS.map(key => `details[data-collapse-key="${key}"]${suffix}`).join(",\n");
  }

  function install() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      ${selectors("")}{margin:11px 0!important}

      ${selectors(" > summary.atlas-collapse-summary")}{
        min-height:84px!important;
        padding:14px 18px!important;
        gap:14px!important;
        align-items:center!important;
        box-sizing:border-box!important;
      }

      ${selectors(" > summary .atlas-collapse-copy")}{
        display:flex!important;
        flex-direction:column!important;
        align-items:flex-start!important;
        justify-content:center!important;
        gap:4px!important;
        min-width:0!important;
        text-align:left!important;
      }

      ${selectors(" > summary .atlas-collapse-title")}{
        display:block!important;
        min-width:0!important;
        margin:0!important;
        font-size:clamp(17px,1.18vw,20px)!important;
        line-height:1.16!important;
        font-weight:950!important;
        letter-spacing:.006em!important;
        white-space:normal!important;
        overflow:visible!important;
        text-overflow:clip!important;
      }

      ${selectors(" > summary .atlas-collapse-subtitle")}{
        display:block!important;
        min-width:0!important;
        margin:0!important;
        color:#aebfd1!important;
        font-size:clamp(12px,.88vw,14px)!important;
        line-height:1.38!important;
        font-weight:500!important;
        white-space:normal!important;
        overflow:visible!important;
        text-overflow:clip!important;
      }

      ${selectors(" > summary > .atlas-collapse-icon")},
      ${selectors(" > summary > .atlas-news-report-summary-icon")}{
        width:36px!important;
        height:36px!important;
        min-width:36px!important;
        flex:0 0 36px!important;
        align-self:center!important;
      }

      ${selectors(" > summary .atlas-collapse-state")}{
        align-self:center!important;
        justify-self:end!important;
        min-width:64px!important;
        margin-left:auto!important;
        font-size:11px!important;
      }

      details[data-collapse-key="news-sentinel"] > summary .news-collapse-live{
        align-self:center!important;
        min-width:170px!important;
      }
      details[data-collapse-key="news-sentinel"] > summary .news-collapse-live b{
        font-size:12px!important;
        line-height:1.2!important;
      }
      details[data-collapse-key="news-sentinel"] > summary .news-collapse-live small{
        font-size:10.5px!important;
        line-height:1.3!important;
      }

      @media(max-width:980px){
        ${selectors(" > summary.atlas-collapse-summary")}{
          min-height:88px!important;
          padding:13px 14px!important;
        }
        ${selectors(" > summary .atlas-collapse-title")}{font-size:16px!important}
        ${selectors(" > summary .atlas-collapse-subtitle")}{font-size:11.5px!important}
        details[data-collapse-key="news-sentinel"] > summary .news-collapse-live{
          min-width:0!important;
          margin-top:4px!important;
        }
      }
    `;
    document.head.appendChild(style);
    document.documentElement.dataset.analysisSubsectionPresentation = BUILD;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }

  globalThis.AgentCryptoAnalysisSubsectionPresentation = Object.freeze({
    build: BUILD,
    owner: "analysis-subsection-presentation",
    presentation_only: true,
    target_keys: KEYS.slice(),
    business_logic_changed: false,
    engine_changed: false,
    fetch_added: false,
    timer_added: false,
    observer_added: false,
    storage_added: false,
    install
  });
})();