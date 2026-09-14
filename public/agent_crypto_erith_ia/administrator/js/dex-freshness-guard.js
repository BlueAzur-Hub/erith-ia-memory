/* Agent-Crypto @erith.IA — canonical DEX freshness guard.
   Introduced as the active canonical filename in Build 40.6.111.
   Git carries history; the active functional filename does not carry a build number.

   Contract:
   - DEX observations with unknown freshness or age beyond the declared bound
     lose read-side Atlas eligibility;
   - stale/unknown observations remain observable for diagnostics;
   - no DEX price is promoted to canonical price;
   - no fetch, timer, observer, storage, trading or wallet path is added.

   Aether note: aether.js already owns PENDING-before-REPOS. This file does not
   re-own or rewrite Aether state. */
(() => {
  "use strict";

  const RELEASE = "40.6.111";
  const FALLBACK_MAX_AGE_SECONDS = 600;
  let wrapped = false;
  let originalApi = null;

  const toMs = value => {
    if (value === null || value === undefined || value === "") return null;
    if (Number.isFinite(Number(value))) {
      const n = Number(value);
      return n > 1e12 ? n : n > 1e9 ? n * 1000 : null;
    }
    const parsed = Date.parse(String(value));
    return Number.isFinite(parsed) ? parsed : null;
  };

  function providerTimestamp(provider) {
    if (!provider || typeof provider !== "object") return null;
    const values = [
      provider.observed_at,
      provider.fetched_at,
      provider.updated_at,
      provider.timestamp,
      provider.as_of,
      provider.data_timestamp,
      provider.quote_timestamp,
      provider.last_seen_at,
      provider?.meta?.observed_at,
      provider?.meta?.fetched_at,
      provider?.meta?.updated_at,
      provider?.meta?.timestamp
    ];
    for (const value of values) {
      const ms = toMs(value);
      if (ms !== null) return ms;
    }
    return null;
  }

  function maxAgeSeconds(context, api = originalApi) {
    const candidates = [
      context?.dex_max_age_seconds,
      context?.freshness?.dex_max_age_seconds,
      api?.dex_max_age_seconds,
      api?.freshness_max_age_seconds
    ];
    for (const value of candidates) {
      const n = Number(value);
      if (Number.isFinite(n) && n > 0) return n;
    }
    return FALLBACK_MAX_AGE_SECONDS;
  }

  function clone(value) {
    try { return structuredClone(value); }
    catch (_) {
      try { return JSON.parse(JSON.stringify(value)); }
      catch (__) { return value; }
    }
  }

  function sanitizeContext(context, now = Date.now()) {
    if (!context || !Array.isArray(context.assets)) return context;
    const out = clone(context);
    const limit = maxAgeSeconds(context);
    const stale = [];

    out.assets = out.assets.map(row => {
      const next = { ...row };
      const identity = { ...(row?.identity || {}) };
      const providers = [
        ["dexscreener", row?.dexscreener],
        ["geckoterminal", row?.geckoterminal]
      ];
      const providerState = providers.map(([name, provider]) => {
        if (String(provider?.status || "").toLowerCase() !== "ok") {
          return { name, ok: false, stale: false, age_seconds: null, reason: "NOT_OK" };
        }
        const timestamp = providerTimestamp(provider);
        const age = timestamp === null ? null : Math.max(0, (now - timestamp) / 1000);
        const isStale = age === null || age > limit;
        return {
          name,
          ok: true,
          stale: isStale,
          age_seconds: age,
          reason: age === null ? "FRESHNESS_UNKNOWN" : isStale ? "STALE" : "FRESH"
        };
      });
      const staleProviders = providerState.filter(provider => provider.ok && provider.stale);
      if (staleProviders.length) {
        identity.atlas_eligible = false;
        identity.freshness_review = true;
        identity.freshness_reason = staleProviders.map(provider => `${provider.name}:${provider.reason}`).join("+");
        identity.freshness_max_age_seconds = limit;
        stale.push({ asset: String(row?.asset || ""), providers: staleProviders });
      }
      next.identity = identity;
      next.dex_freshness = providerState;
      return next;
    });

    out.dex_freshness = {
      max_age_seconds: limit,
      stale_assets: stale.length,
      fail_closed: true,
      generated_at: new Date(now).toISOString()
    };
    return out;
  }

  function sanitizeIntelligence(intelligence, context, now = Date.now()) {
    if (!intelligence || typeof intelligence !== "object") return intelligence;
    const cleanContext = sanitizeContext(context, now);
    if (!cleanContext || !Array.isArray(cleanContext.assets)) return intelligence;
    const out = clone(intelligence);
    const eligible = cleanContext.assets.filter(row => row?.identity?.atlas_eligible === true).length;
    const staleAssets = Number(cleanContext?.dex_freshness?.stale_assets || 0);
    if (out.dex && typeof out.dex === "object") {
      out.dex = { ...out.dex, atlas_eligible: eligible, freshness_stale_assets: staleAssets };
    }
    if (staleAssets > 0 && String(out.state || "").toLowerCase() === "ready") out.state = "partial";
    out.dex_freshness = cleanContext.dex_freshness;
    return out;
  }

  function bindSourceApi() {
    if (wrapped) return true;
    const api = globalThis.ErithPrivateBackendSources;
    if (!api || typeof api.contextSnapshot !== "function") return false;
    originalApi = api;
    const originalContext = api.contextSnapshot.bind(api);
    const originalIntelligence = typeof api.sourceIntelligence === "function"
      ? api.sourceIntelligence.bind(api)
      : null;
    try {
      const proxy = new Proxy(api, {
        get(target, prop, receiver) {
          if (prop === "contextSnapshot") return () => sanitizeContext(originalContext());
          if (prop === "sourceIntelligence" && originalIntelligence) {
            return () => sanitizeIntelligence(originalIntelligence(), originalContext());
          }
          return Reflect.get(target, prop, receiver);
        }
      });
      globalThis.ErithPrivateBackendSources = proxy;
      wrapped = true;
      document.documentElement.dataset.dexFreshnessGuard = "active";
      return true;
    } catch (_) {
      return false;
    }
  }

  function aetherInvariant() {
    let pending = null;
    let current = null;
    try {
      if (typeof globalThis.atlasCurrentPendingMarket137 === "function") pending = globalThis.atlasCurrentPendingMarket137() || null;
    } catch (_) {}
    try {
      if (typeof globalThis.atlasCurrentStateRead === "function") current = globalThis.atlasCurrentStateRead() || null;
    } catch (_) {}
    const status = String(current?.status || "").trim().toUpperCase();
    return Object.freeze({
      pending: Boolean(pending),
      current_status: status || null,
      expected_operator_state: pending ? "PENDING" : status === "CURRENT" ? "REPOS" : status || "INCONNU",
      repos_allowed: !pending && status === "CURRENT"
    });
  }

  bindSourceApi();
  document.addEventListener("erith:dex-defi-context", () => { bindSourceApi(); }, { passive: true });
  window.addEventListener("erith:system-hydrated", () => { bindSourceApi(); }, { once: true, passive: true });

  function selfTest() {
    const now = Date.now();
    const fresh = new Date(now - 60_000).toISOString();
    const stale = new Date(now - 3_600_000).toISOString();
    const ctx = {
      dex_max_age_seconds: 600,
      assets: [
        { asset: "BTC", dexscreener: { status: "ok", updated_at: fresh }, geckoterminal: { status: "ok", updated_at: fresh }, identity: { atlas_eligible: true } },
        { asset: "ETH", dexscreener: { status: "ok", updated_at: stale }, geckoterminal: { status: "ok", updated_at: fresh }, identity: { atlas_eligible: true } },
        { asset: "SOL", dexscreener: { status: "ok" }, geckoterminal: { status: "ok", updated_at: fresh }, identity: { atlas_eligible: true } }
      ]
    };
    const out = sanitizeContext(ctx, now);
    const by = Object.fromEntries(out.assets.map(row => [row.asset, row]));
    const checks = [
      by.BTC.identity.atlas_eligible === true,
      by.ETH.identity.atlas_eligible === false,
      by.SOL.identity.atlas_eligible === false,
      out.dex_freshness.stale_assets === 2
    ];
    return Object.freeze({ pass: checks.every(Boolean), total: checks.length, passed: checks.filter(Boolean).length, checks: Object.freeze(checks) });
  }

  globalThis.AgentCryptoDexFreshnessGuard = Object.freeze({
    release: RELEASE,
    canonical_file: "js/dex-freshness-guard.js",
    active: true,
    context_wrapped: () => wrapped,
    max_age_fallback_seconds: FALLBACK_MAX_AGE_SECONDS,
    sanitizeContext,
    sanitizeIntelligence,
    bindSourceApi,
    aetherInvariant,
    selfTest,
    dex_fail_closed: true,
    aether_state_owner_changed: false,
    aether_pending_precedes_repos_verified: true,
    canonical_price_changed: false,
    fetch: false,
    recurring_timer: false,
    observer: false,
    storage_write: false,
    trading: false,
    wallet: false
  });
})();
