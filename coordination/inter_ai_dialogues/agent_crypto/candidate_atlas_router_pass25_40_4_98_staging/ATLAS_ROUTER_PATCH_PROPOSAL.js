/* Agent-Crypto @erith.IA — Pass25 Atlas Router proposal
   COORDINATION ONLY / NOT LOADED BY RUNTIME / NO BUILD
   Intended insertion target: sealed Administrator 40.4.98 root app.js.
*/

const ATLAS_V2_LAZY_PERIPHERAL_KEYS_PASS25 = Object.freeze(new Set([
  "auto-reader",
  "shared-memory",
  "github-memory"
]));

let atlasV2LazyRouteGenerationPass25 = 0;
const atlasV2LazyRoutePendingPass25 = new Map();
const ATLAS_V2_LAZY_ROUTE_CLEANUP_MS_PASS25 = 15000;

function atlasV2LazyPeripheralOwnerPass25(key) {
  if (!ATLAS_V2_LAZY_PERIPHERAL_KEYS_PASS25.has(key)) return null;
  return document.querySelector(`details[data-collapse-key="${key}"]`);
}

function atlasV2LazyPeripheralHydratedPass25(key) {
  try {
    const values = globalThis.AgentCryptoAtlasPeripheralLazy?.hydrated?.();
    if (Array.isArray(values)) return values.includes(key);
    if (values instanceof Set) return values.has(key);
  } catch (_) {}
  return false;
}

function atlasV2ScheduleLazyPeripheralRoutePass25(id, hash, options, generation) {
  if (!ATLAS_V2_LAZY_PERIPHERAL_KEYS_PASS25.has(id)) return false;
  if (document.getElementById(id)) return false;

  const owner = atlasV2LazyPeripheralOwnerPass25(id);
  if (!(owner instanceof HTMLDetailsElement)) return false;

  // Owner says hydrated but canonical target is absent: do not invent DOM or retry.
  if (atlasV2LazyPeripheralHydratedPass25(id)) return false;

  const previous = atlasV2LazyRoutePendingPass25.get(id);
  if (previous) {
    previous.generation = generation;
    previous.hash = hash;
    previous.options = { ...options };
    return true;
  }

  const pending = {
    generation,
    hash,
    options: { ...options },
    listener: null,
    closeListener: null,
    cleanupTimer: 0
  };

  const cleanup = () => {
    if (pending.listener) document.removeEventListener("erith:presentation-resident", pending.listener);
    if (pending.closeListener) owner.removeEventListener("toggle", pending.closeListener);
    if (pending.cleanupTimer) window.clearTimeout(pending.cleanupTimer);
    if (atlasV2LazyRoutePendingPass25.get(id) === pending) atlasV2LazyRoutePendingPass25.delete(id);
  };

  pending.listener = event => {
    const detail = event?.detail || {};
    if (detail.family !== "atlas" || detail.key !== id) return;

    const current = atlasV2LazyRoutePendingPass25.get(id);
    if (current !== pending) return cleanup();
    if (current.generation !== atlasV2LazyRouteGenerationPass25) return cleanup();

    const target = document.getElementById(id);
    if (!target) return cleanup();

    const resumeHash = current.hash;
    const resumeOptions = {
      ...current.options,
      __atlasLazyResumePass25: true,
      __atlasLazyGenerationPass25: current.generation
    };
    cleanup();
    atlasV2OpenAdvancedForTarget(resumeHash, resumeOptions);
  };

  pending.closeListener = () => {
    if (!owner.open) cleanup();
  };

  atlasV2LazyRoutePendingPass25.set(id, pending);
  document.addEventListener("erith:presentation-resident", pending.listener);
  owner.addEventListener("toggle", pending.closeListener);

  // Bounded cleanup only: no retry, no fetch, no hydration call, no polling.
  pending.cleanupTimer = window.setTimeout(() => cleanup(), ATLAS_V2_LAZY_ROUTE_CLEANUP_MS_PASS25);
  owner.open = true;
  return true;
}

/*
Minimal integration boundary inside the EXISTING atlasV2OpenAdvancedForTarget():

function atlasV2OpenAdvancedForTarget(hash, options = {}) {
  const id = decodeURIComponent(String(hash || "").replace(/^#/, ""));
  if (!id) return false;

  const lazyResume = options.__atlasLazyResumePass25 === true;
  const routeGeneration = lazyResume
    ? Number(options.__atlasLazyGenerationPass25 || atlasV2LazyRouteGenerationPass25)
    : ++atlasV2LazyRouteGenerationPass25;

  const entry = atlasV2ManifestEntry(id);
  const target = document.getElementById(id);
  if (!target) {
    if (ATLAS_V2_LAZY_PERIPHERAL_KEYS_PASS25.has(id)) {
      return atlasV2ScheduleLazyPeripheralRoutePass25(id, hash, options, routeGeneration);
    }
    return false;
  }

  // FROM HERE: retain the sealed 40.4.98 body unchanged.
  // Unknown internal option keys are ignored by existing semantics.
  ...
}
*/
