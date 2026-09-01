(() => {
  "use strict";

  const BUILD = "40.4.167";
  const REVISION = "R1";
  const CONTRACT = "TRUE_MARKET_STACK_404167R1";

  function wakeMetalsOnce(stack) {
    if (!stack || stack.dataset.metalsWakeRequested === "1") return;
    stack.dataset.metalsWakeRequested = "1";
    const demand = globalThis.AtlasParallelMarketDemand40465;
    if (typeof demand?.ensure === "function") {
      Promise.resolve(demand.ensure()).catch(() => {});
    }
  }

  function installMetalsDemandGate(stack) {
    if (!stack) return;
    if (!("IntersectionObserver" in globalThis)) {
      wakeMetalsOnce(stack);
      return;
    }
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      wakeMetalsOnce(stack);
    }, { rootMargin: "900px 0px" });
    observer.observe(stack);
  }

  function keepCryptoAsPrimaryDomain(stack) {
    const marketSwitch = document.getElementById("atlasMarketDomainSwitch");
    if (!marketSwitch) return;

    try {
      if (String(marketSwitch.dataset.domain || "crypto") !== "crypto") marketSwitch.click();
    } catch (_) {}

    marketSwitch.dataset.trueMarketStack404167R1 = "crypto-primary";
    marketSwitch.setAttribute("aria-label", "Marché Crypto principal. Cliquer pour descendre au cockpit Métaux.");
    marketSwitch.title = "Voir le cockpit Métaux plus bas";

    marketSwitch.addEventListener("click", event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      stack?.scrollIntoView?.({ behavior: "smooth", block: "start" });
      wakeMetalsOnce(stack);
    }, true);
  }

  function buildStack() {
    if (document.getElementById("atlasTrueMarketStackMetals404167R1")) return;

    const cryptoDeck = document.getElementById("analyste");
    const cryptoRibbons = document.getElementById("market-workspace");
    const foundation = document.getElementById("atlasParallelMarketFoundation");
    const metalsDetail = document.getElementById("atlasMetalsDetailPanel");
    const metalsToolbar = document.getElementById("atlasMetalsUnifiedToolbar");
    const metalsStatus = document.getElementById("atlasMetalsDomainStatus");

    if (!cryptoDeck || !cryptoRibbons || !foundation || !metalsDetail || !metalsToolbar) {
      document.documentElement.dataset.trueMarketStack404167R1 = "missing-owner";
      return;
    }

    document.getElementById("atlasMarketCascade404167")?.remove();

    const stack = document.createElement("section");
    stack.className = "atlas-true-market-stack-metals-404167r1";
    stack.id = "atlasTrueMarketStackMetals404167R1";
    stack.dataset.marketDomain = "metals";
    stack.dataset.marketStackBuild = BUILD;
    stack.dataset.marketStackRevision = REVISION;
    stack.setAttribute("aria-label", "Cockpit Métaux précieux et industriels");
    stack.innerHTML = `
      <header class="atlas-true-market-stack-head-404167r1">
        <div class="atlas-true-market-stack-title-404167r1">
          <span class="atlas-true-market-stack-domain-404167r1">MARCHÉ <b>MÉTAUX</b></span>
          <div>
            <small>ERITH.IA · MARKETS OBSERVATORY · 02</small>
            <strong>Métaux précieux et industriels</strong>
          </div>
        </div>
        <div class="atlas-true-market-stack-toolbar-404167r1" id="atlasTrueMarketStackToolbar404167R1"></div>
      </header>
      <div class="atlas-true-market-stack-grid-404167r1">
        <div class="atlas-true-market-stack-chart-404167r1" id="atlasTrueMarketStackChart404167R1"></div>
        <div class="atlas-true-market-stack-detail-404167r1" id="atlasTrueMarketStackDetail404167R1"></div>
      </div>
      <footer class="atlas-true-market-stack-foot-404167r1">
        <span>02 · MÉTAUX · XAU / XAG / XPT / XPD / HG</span>
        <small>Gold API · Yahoo Finance Futures · BCE · USGS / IEA / RMIS · observation uniquement</small>
      </footer>`;

    cryptoRibbons.insertAdjacentElement("afterend", stack);

    const toolbarHost = stack.querySelector("#atlasTrueMarketStackToolbar404167R1");
    const chartHost = stack.querySelector("#atlasTrueMarketStackChart404167R1");
    const detailHost = stack.querySelector("#atlasTrueMarketStackDetail404167R1");

    toolbarHost.appendChild(metalsToolbar);
    chartHost.appendChild(foundation);
    if (metalsStatus) chartHost.appendChild(metalsStatus);
    detailHost.appendChild(metalsDetail);

    metalsToolbar.hidden = false;
    foundation.hidden = false;
    metalsDetail.hidden = false;
    if (metalsStatus) metalsStatus.hidden = false;

    document.documentElement.dataset.trueMarketStack404167R1 = "ready";
    document.documentElement.dataset.marketStackPrimary = "crypto";
    document.documentElement.dataset.marketStackSecondary = "metals";

    keepCryptoAsPrimaryDomain(stack);
    installMetalsDemandGate(stack);

    requestAnimationFrame(() => {
      foundation.hidden = false;
      metalsDetail.hidden = false;
      metalsToolbar.hidden = false;
      if (metalsStatus) metalsStatus.hidden = false;
    });

    globalThis.ErithTrueMarketStack404167R1 = Object.freeze({
      build: BUILD,
      revision: REVISION,
      contract: CONTRACT,
      crypto_owner_reused: "#analyste",
      metals_chart_owner_reused: "#atlasParallelMarketFoundation / #atlasMetalsChartCanvas",
      metals_detail_owner_reused: "#atlasMetalsDetailPanel",
      metals_demand_owner_reused: "AtlasParallelMarketDemand40465.ensure",
      second_chart_engine_created: false,
      new_market_fetch_owner: false,
      recurring_observer: false,
      stack: () => document.getElementById("atlasTrueMarketStackMetals404167R1")
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildStack, { once: true });
  } else {
    buildStack();
  }
})();
