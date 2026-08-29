/* Agent-Crypto @erith.IA — Pass25 Atlas Router proposal
   PASS26 STATIC STATUS: REJECTED / FROZEN / DO NOT INTEGRATE
   COORDINATION ONLY / NOT LOADED BY RUNTIME / NO BUILD
   Intended insertion target: sealed Administrator 40.4.98 root app.js.

   Pass26 proved this proposal schedules owner.open=true before the canonical
   mode/auth transaction, because sealed atlasV2OpenAdvancedForTarget() resolves
   the DOM target before those gates. That changes access semantics for cold
   advanced targets. The proposal is retained only as an audit artifact.

   Pass26 also proved the current owner emits success only. Terminal hydration
   error is represented by data-atlas-hydration40425="error" with no failure
   event. The fixed 15 s timer below is therefore not a semantic owner signal:
   it can clean a true failure, but can also abandon a legitimate slow success.
   Under the zero-observer/zero-polling/no-owner-change constraint there is no
   exact replacement signal. Do not ship this shape.
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

  // Pass26: retained for forensic review only; this is NOT a safe runtime truth.
  pending.cleanupTimer = window.setTimeout(() => cleanup(), ATLAS_V2_LAZY_ROUTE_CLEANUP_MS_PASS25);
  owner.open = true;
  return true;
}

/*
PASS26: THIS INTEGRATION SHAPE IS STATICALLY REJECTED.

Minimal integration boundary originally proposed inside the EXISTING
atlasV2OpenAdvancedForTarget():

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
      // REJECTED: this schedules owner.open=true before canonical mode/auth gates.
      return atlasV2ScheduleLazyPeripheralRoutePass25(id, hash, options, routeGeneration);
    }
    return false;
  }

  // FROM HERE: sealed 40.4.98 performs mode/auth/visibility/details/persistence/hash/scroll.
  ...
}
*/
