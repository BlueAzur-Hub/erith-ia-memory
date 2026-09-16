/* Agent-Crypto @erith.IA — 40.6.167 FOUNDATION APPLICABILITY TRUTH
   Separates historical receipt, current module applicability and the latest
   explicit test result. Missing required self_test/preflight methods are
   INCOMPLETE, never PASS. The latest explicit result is stored in sessionStorage
   only so a reload in the same operator session cannot resurrect an older PASS. */
(() => {
  "use strict";

  const BUILD = "40.6.167";
  const STORAGE_KEY = "agent_crypto_foundation_strict_406167";
  const original = globalThis.AgentCryptoStrategyASafetyCertification || null;
  if (!original) return;

  const clone = value => { try { return JSON.parse(JSON.stringify(value)); } catch (_) { return null; } };
  const safe = (fn, fallback = null) => { try { return typeof fn === "function" ? fn() : fallback; } catch (_) { return fallback; } };

  function moduleFacts() {
    const defs = [
      ["deterministic_replay", globalThis.AgentCryptoStrategyAReplay, ["self_test"]],
      ["paper_lifecycle", globalThis.AgentCryptoStrategyAPaperLifecycle, ["self_test"]],
      ["after_cost_metrics", globalThis.AgentCryptoStrategyAAfterCostMetrics, ["self_test"]],
      ["auto_lifecycle_bridge", globalThis.AgentCryptoStrategyAAutoLifecycleBridge, ["self_test", "preflight"]]
    ];
    const out = {};
    for (const [name, api, required] of defs) {
      const missing = required.filter(method => typeof api?.[method] !== "function");
      out[name] = {
        name,
        available: !!api,
        build: api?.build || null,
        required_methods: required,
        missing_methods: missing,
        compatible: !!api && missing.length === 0
      };
    }
    return out;
  }

  function readLatest() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.schema === "agent_crypto_foundation_strict_result_v1" ? parsed : null;
    } catch (_) { return null; }
  }

  function persistLatest(result) {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result)); return true; }
    catch (_) { return false; }
  }

  function foundationTruth() {
    const receipt = safe(original.foundation_receipt, null);
    const modules = moduleFacts();
    const applicable = Object.values(modules).every(row => row.compatible === true);
    const latest = readLatest();
    const explicitKnown = !!latest;
    const pass = explicitKnown ? latest.pass === true : receipt?.pass === true && applicable;
    const source = explicitKnown
      ? "SESSION_PERSISTED_EXPLICIT_TEST"
      : receipt?.pass === true
        ? (applicable ? "HISTORICAL_RECEIPT_APPLICABLE" : "HISTORICAL_RECEIPT_NOT_APPLICABLE")
        : "NO_FOUNDATION_PROOF";
    return {
      schema: "agent_crypto_foundation_applicability_truth_v1",
      build: BUILD,
      pass,
      source,
      historical_receipt: clone(receipt),
      historical_receipt_pass: receipt?.pass === true,
      current_modules: modules,
      applicability_complete: applicable,
      latest_explicit_test: clone(latest),
      explicit_result_persists_across_reload_in_session: true,
      missing_method_is_pass: false,
      implicit_tests_executed: false,
      storage_scope: "sessionStorage"
    };
  }

  function strictCall(name, api, extra = null) {
    if (!api) return { name, pass: false, status: "INCOMPLETE", reason: "UNAVAILABLE" };
    if (typeof api.self_test !== "function") return { name, pass: false, status: "INCOMPLETE", reason: "SELF_TEST_MISSING" };
    try {
      const result = api.self_test();
      if (result?.pass !== true) return { name, pass: false, status: "FAIL", result: clone(result) };
      if (typeof extra === "function") {
        const extraResult = extra(api);
        if (extraResult?.pass !== true) return { name, pass: false, status: "INCOMPLETE", reason: extraResult?.reason || "PREFLIGHT_NOT_READY", result: clone(result) };
      }
      return { name, pass: true, status: "PASS", result: clone(result) };
    } catch (error) {
      return { name, pass: false, status: "FAIL", error: String(error?.message || error) };
    }
  }

  function runFoundationTests() {
    const modules = {
      deterministic_replay: strictCall("deterministic_replay", globalThis.AgentCryptoStrategyAReplay),
      paper_lifecycle: strictCall("paper_lifecycle", globalThis.AgentCryptoStrategyAPaperLifecycle),
      after_cost_metrics: strictCall("after_cost_metrics", globalThis.AgentCryptoStrategyAAfterCostMetrics),
      auto_lifecycle_bridge: strictCall("auto_lifecycle_bridge", globalThis.AgentCryptoStrategyAAutoLifecycleBridge, api => {
        if (typeof api.preflight !== "function") return { pass: false, reason: "PREFLIGHT_MISSING" };
        const p = api.preflight();
        return { pass: p?.ready === true, reason: p?.ready === true ? null : String(p?.blocked_reason || "PREFLIGHT_NOT_READY") };
      })
    };
    const pass = Object.values(modules).every(row => row.pass === true);
    const result = {
      schema: "agent_crypto_foundation_strict_result_v1",
      build: BUILD,
      at: new Date().toISOString(),
      pass,
      status: pass ? "PASS" : Object.values(modules).some(row => row.status === "INCOMPLETE") ? "INCOMPLETE" : "FAIL",
      modules,
      source: "EXPLICIT_OPERATOR_ACTION",
      historical_receipt_used_as_test_result: false
    };
    persistLatest(result);
    render();
    try { document.dispatchEvent(new CustomEvent("agent-crypto:evidence-data-changed", { detail: { owner: "foundation-applicability", build: BUILD } })); } catch (_) {}
    return clone(result);
  }

  function certificationMatrix() {
    const base = safe(original.certification_matrix, { gates: [] }) || { gates: [] };
    const truth = foundationTruth();
    const gates = (Array.isArray(base.gates) ? base.gates : []).map(row => ({ ...row }));
    const currentState = truth.pass === true ? "FOUNDATION_PASS" : truth.applicability_complete ? "EVIDENCE_REQUIRED" : "INCOMPLETE";
    for (const gateNumber of [2, 7]) {
      const gate = gates.find(row => Number(row.gate) === gateNumber);
      if (!gate) continue;
      gate.state = currentState;
      gate.note = truth.pass === true
        ? `Fondation applicable : ${truth.source}.`
        : truth.applicability_complete
          ? `Fondation non soldée : ${truth.source}.`
          : `Fondation INCOMPLETE : module ou méthode requise indisponible. Receipt historique conservé séparément.`;
    }
    return {
      ...base,
      build: BUILD,
      gates,
      modules: truth.current_modules,
      foundation_proof: truth,
      certified_for_live: false,
      paper_only: true,
      real_orders: false,
      implicit_self_tests: false
    };
  }

  function snapshot() {
    const base = safe(original.snapshot, {}) || {};
    return { ...base, build: BUILD, foundation_truth: foundationTruth(), micro_live_locked: true, real_orders: false };
  }

  function patchView() {
    const panel = document.getElementById("strategyASafety");
    if (!panel) return false;
    const truth = foundationTruth();
    const proof = panel.querySelector("[data-foundation-proof]");
    if (proof) {
      const latest = truth.latest_explicit_test;
      proof.textContent = latest
        ? `Fondation actuelle : ${latest.status} · test explicite ${latest.at} · résultat conservé pendant la session`
        : truth.applicability_complete
          ? `Fondation historique : PASS 40.6.159 · applicabilité actuelle vérifiée · aucun test relancé`
          : `Fondation historique : PASS 40.6.159 · applicabilité actuelle INCOMPLETE · aucun PASS courant déduit`;
    }
    const matrix = certificationMatrix();
    const nodes = panel.querySelectorAll(".sac-g");
    for (const node of nodes) {
      const label = node.querySelector("span")?.textContent || "";
      const match = label.match(/GATE\s+(\d+)/i);
      const gate = matrix.gates.find(row => Number(row.gate) === Number(match?.[1]));
      if (gate) {
        const b = node.querySelector("b");
        if (b) b.textContent = gate.state;
      }
    }
    panel.dataset.foundationApplicabilityBuild = BUILD;
    panel.dataset.foundationApplicability = truth.applicability_complete ? "COMPLETE" : "INCOMPLETE";
    return true;
  }

  function render() {
    try { original.render?.(); } catch (_) {}
    return patchView();
  }

  function interceptRunTests(event) {
    const button = event?.target?.closest?.("[data-safety]");
    if (!button || button.dataset.safety !== "RUN_TESTS") return;
    event.preventDefault();
    event.stopImmediatePropagation();
    runFoundationTests();
  }

  const wrapped = Object.freeze({
    ...original,
    build: BUILD,
    snapshot,
    certification_matrix: certificationMatrix,
    run_foundation_tests: runFoundationTests,
    foundation_truth: foundationTruth,
    render,
    foundation_applicability_truth_406167: true,
    explicit_result_session_persistence: true,
    missing_self_test_is_pass: false
  });
  globalThis.AgentCryptoStrategyASafetyCertification = wrapped;

  document.addEventListener("click", interceptRunTests, true);
  document.addEventListener("agent-crypto:runtime-modules-ready", render, { once: true });
  document.addEventListener("erith:system-hydrated", render, { passive: true });
  window.addEventListener("pageshow", render);
  queueMicrotask(render);
})();