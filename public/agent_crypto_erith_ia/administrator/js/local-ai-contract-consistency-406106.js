/* Agent-Crypto @erith.IA — 40.6.106
   Local AI Analytical Contract Consistency.
   Extends the existing deterministic bounded-comment guard so Atlas local
   comments cannot contradict facts already present in the strict snapshot.
   Presentation/read-side only: no timer, observer, network, storage, trading or wallet. */
(() => {
  "use strict";

  const PATCH = "40.6.106";
  const previous = globalThis.atlasLocalBoundedCommentTruthGuard;
  if (typeof previous !== "function") {
    globalThis.AgentCryptoLocalAIContractConsistency406106 = Object.freeze({
      patch: PATCH,
      active: false,
      reason: "canonical_guard_missing",
      recurring_timer: false,
      observer: false,
      network_owner: false,
      storage_write: false,
      trading: false,
      wallet: false
    });
    return;
  }

  const normalize = value => String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘`]/g, "'")
    .toLocaleLowerCase("fr-FR");

  const top5State = snapshot => {
    const top5 = snapshot?.strict_contract?.canonical_top5 || {};
    const assets = Array.isArray(top5.assets) ? top5.assets : [];
    const available = assets.filter(row => row?.available === true).length;
    return Object.freeze({
      complete: top5.complete === true || (assets.length >= 5 && available >= 5),
      available,
      expected: assets.length || 5
    });
  };

  const marketState = snapshot => {
    const contract = snapshot?.strict_contract || {};
    const market = contract.market || {};
    const top5 = top5State(snapshot);
    const assetsLoaded = Number(market.assets_loaded ?? market.validated_assets ?? market.assets_count ?? 0);
    const priceRows = Array.isArray(contract.canonical_top5?.assets)
      ? contract.canonical_top5.assets.filter(row => row?.available === true && Number.isFinite(Number(row?.price_eur ?? row?.price ?? row?.eur))).length
      : 0;
    const hasMarket = market && typeof market === "object" && Object.keys(market).length > 0;
    const hasPrices = top5.complete || priceRows > 0 || assetsLoaded > 0;
    const hasVolume = Number.isFinite(Number(market.total_volume_24h_eur ?? market.total_volume_24h ?? market.volume_24h_eur ?? market.volume_24h))
      || Number.isFinite(Number(contract.math?.volume_market_cap_ratio_pct));
    return Object.freeze({ hasMarket, hasPrices, hasVolume, assetsLoaded });
  };

  const mathState = snapshot => {
    const math = snapshot?.strict_contract?.math || {};
    const risk = math.historical_risk || {};
    const values = [
      risk.realized_volatility_pct ?? risk.volatility_pct ?? math.realized_volatility_pct,
      risk.max_drawdown_pct ?? math.max_drawdown_pct,
      risk.var_95_pct ?? risk.var95_pct ?? math.var_95_pct,
      risk.expected_shortfall_95_pct ?? risk.expected_shortfall_pct ?? math.expected_shortfall_95_pct
    ];
    const coreMeasuresPresent = values.filter(value => Number.isFinite(Number(value))).length >= 3;
    const explicitComplete = math.complete === true
      || math.all_measures_calculated === true
      || math.measures_complete === true
      || risk.complete === true;
    const degraded = math.degraded === true
      || risk.degraded === true
      || (Array.isArray(math.degraded_measures) && math.degraded_measures.length > 0)
      || (Array.isArray(risk.degraded_measures) && risk.degraded_measures.length > 0)
      || (Array.isArray(math.missing_measures) && math.missing_measures.length > 0)
      || (Array.isArray(risk.missing_measures) && risk.missing_measures.length > 0);
    return Object.freeze({
      complete: (explicitComplete || coreMeasuresPresent) && !degraded,
      degraded,
      coreMeasuresPresent
    });
  };

  const conflict = (mode, body, snapshot) => {
    const text = normalize(body);
    if (!text) return "";

    const top5 = top5State(snapshot);
    if (mode === "top5" && top5.complete) {
      const deniesTop5 = [
        /top\s*5[^\n]{0,100}(?:non fourni|non transmis|non disponible|indisponible|absent|manquant)/,
        /(?:aucune|pas de) donn(?:ee|ees)[^\n]{0,100}top\s*5/,
        /(?:aucune|pas d')information[^\n]{0,100}top\s*5/,
        /(?:impossible|pas possible)[^\n]{0,140}(?:conclure|identifier|determiner)[^\n]{0,140}top\s*5/,
        /no top\s*(?:5|five)[^\n]{0,120}(?:available|provided)/,
        /top\s*(?:5|five)[^\n]{0,120}(?:unavailable|not available|missing|not provided)/
      ].some(re => re.test(text));
      if (deniesTop5) return "top5_truth_conflict_406106";
    }

    const market = marketState(snapshot);
    if (mode === "market" && market.hasMarket && market.hasPrices) {
      const deniesMarketData = [
        /aucune donn(?:ee|ees)[^\n]{0,100}(?:prix|volume)/,
        /(?:prix|volume)[^\n]{0,100}(?:non fourni|non transmis|indisponible|absent|manquant)/,
        /no (?:price|volume|market) data[^\n]{0,100}(?:available|provided)?/,
        /(?:price|volume) data[^\n]{0,100}(?:unavailable|not available|missing|not provided)/
      ].some(re => re.test(text));
      if (deniesMarketData) return "market_data_truth_conflict_406106";
    }

    const math = mathState(snapshot);
    if (mode === "math" && math.complete) {
      const claimsDegraded = [
        /(?:certaines|des) mesures[^\n]{0,100}(?:degradees|incompletes|manquantes|indisponibles)/,
        /math core[^\n]{0,120}(?:degrade|incomplet|manquant|indisponible)/,
        /(?:some|several) (?:math )?measures[^\n]{0,100}(?:degraded|missing|unavailable|incomplete)/
      ].some(re => re.test(text));
      if (claimsDegraded) return "math_completeness_truth_conflict_406106";
    }

    return "";
  };

  function extendedGuard(mode, body, snapshot) {
    const source = String(body || "").replace(/\r\n?/g, "\n");
    const canonical = previous(mode, source, snapshot);
    if (canonical?.conflict) return canonical;
    const reason = conflict(mode, source, snapshot);
    return reason
      ? { conflict: true, reason, body: source }
      : { conflict: false, reason: "", body: source };
  }

  globalThis.atlasLocalBoundedCommentTruthGuard = extendedGuard;
  globalThis.AgentCryptoLocalAIContractConsistency406106 = Object.freeze({
    patch: PATCH,
    active: true,
    owner: "atlasLocalBoundedCommentTruthGuard",
    extends_canonical_guard: true,
    top5_false_absence_guard: true,
    market_false_absence_guard: true,
    math_false_degradation_guard: true,
    fallback_owner_unchanged: "atlasLocalFrenchCommentFallback",
    recurring_timer: false,
    observer: false,
    network_owner: false,
    storage_write: false,
    trading: false,
    wallet: false
  });
})();
