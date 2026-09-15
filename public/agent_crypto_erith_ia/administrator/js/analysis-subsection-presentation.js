/* Agent-Crypto @erith.IA — 40.6.148 SUBSECTION HIERARCHY CONSOLIDATION
   Presentation only. Extends the validated two-line hierarchy to Analysis/Oracle/
   Sentinel plus Operations/System subsection summaries: larger title, descriptive
   copy below, more breathing room. No data, engine, fetch, timer, storage or business logic. */
(() => {
  "use strict";

  const BUILD = "40.6.148";
  const STYLE_ID = "agentCryptoSubsectionPresentation148";
  const ANALYSIS_KEYS = Object.freeze([
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
  const STANDARD_KEYS = Object.freeze([
    "situation",
    "questionnaire",
    "briefing",
    "planning",
    "simulation",
    "commandes",
    "backend",
    "safety",
    "physical-security"
  ]);
  const KEYS = Object.freeze([...ANALYSIS_KEYS, ...STANDARD_KEYS]);

  function selectors(keys, suffix = "") {
    return keys.map(key => `details[data-collapse-key="${key}"]${suffix}`).join(",\n");
  }

  function install() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      ${selectors(KEYS)}{margin:11px 0!important}

      ${selectors(KEYS, " > summary.atlas-collapse-summary")}{
        min-height:84px!important;
        padding:14px 18px!important;
        gap:14px!important;
        align-items:center!important;
        box-sizing:border-box!important;
      }

      ${selectors(ANALYSIS_KEYS, " > summary .atlas-collapse-copy")}{
        display:flex!important;
        flex-direction:column!important;
        align-items:flex-start!important;
        justify-content:center!important;
        gap:4px!important;
        min-width:0!important;
        text-align:left!important;
      }

      ${selectors(STANDARD_KEYS, " > summary.atlas-collapse-summary")}{
        display:grid!important;
        grid-template-columns:38px minmax(0,1fr) auto!important;
        grid-template-rows:auto auto!important;
        column-gap:14px!important;
        row-gap:4px!important;
      }
      ${selectors(STANDARD_KEYS, " > summary > .atlas-collapse-icon")}{
        grid-column:1!important;
        grid-row:1 / span 2!important;
        align-self:center!important;
      }
      ${selectors(STANDARD_KEYS, " > summary > .atlas-collapse-title")}{
        grid-column:2!important;
        grid-row:1!important;
        align-self:end!important;
      }
      ${selectors(STANDARD_KEYS, " > summary > .atlas-collapse-subtitle")}{
        grid-column:2!important;
        grid-row:2!important;
        align-self:start!important;
      }
      ${selectors(STANDARD_KEYS, " > summary > .atlas-collapse-state")}{
        grid-column:3!important;
        grid-row:1 / span 2!important;
        align-self:center!important;
        justify-self:end!important;
      }

      ${selectors(KEYS, " > summary .atlas-collapse-title")}{
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

      ${selectors(KEYS, " > summary .atlas-collapse-subtitle")}{
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

      ${selectors(KEYS, " > summary > .atlas-collapse-icon")},
      ${selectors(ANALYSIS_KEYS, " > summary > .atlas-news-report-summary-icon")}{
        width:36px!important;
        height:36px!important;
        min-width:36px!important;
        flex:0 0 36px!important;
        align-self:center!important;
      }

      ${selectors(KEYS, " > summary .atlas-collapse-state")}{
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
        ${selectors(KEYS, " > summary.atlas-collapse-summary")}{
          min-height:88px!important;
          padding:13px 14px!important;
        }
        ${selectors(KEYS, " > summary .atlas-collapse-title")}{font-size:16px!important}
        ${selectors(KEYS, " > summary .atlas-collapse-subtitle")}{font-size:11.5px!important}
        ${selectors(STANDARD_KEYS, " > summary.atlas-collapse-summary")}{
          grid-template-columns:34px minmax(0,1fr)!important;
          grid-template-rows:auto auto auto!important;
        }
        ${selectors(STANDARD_KEYS, " > summary > .atlas-collapse-state")}{
          grid-column:2!important;
          grid-row:3!important;
          justify-self:start!important;
          margin:4px 0 0!important;
        }
        details[data-collapse-key="news-sentinel"] > summary .news-collapse-live{
          min-width:0!important;
          margin-top:4px!important;
        }
      }
    `;
    document.head.appendChild(style);
    document.documentElement.dataset.subsectionPresentation = BUILD;
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
    analysis_keys: ANALYSIS_KEYS.slice(),
    operations_system_keys: STANDARD_KEYS.slice(),
    business_logic_changed: false,
    engine_changed: false,
    fetch_added: false,
    timer_added: false,
    observer_added: false,
    storage_added: false,
    install
  });
})();