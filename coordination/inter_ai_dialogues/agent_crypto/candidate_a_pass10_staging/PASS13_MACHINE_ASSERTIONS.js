/* Agent-Crypto @erith.IA — Candidate A — Pass 13 Firefox machine assertions
   NON-LIVE / READ-ONLY TEST ORACLE.
   Paste/run only in Firefox DevTools against an explicitly staged Candidate A.
   No mutation, hydration, timer, observer, fetch, WebSocket or storage write. */
(()=>{
  "use strict";

  const sorted = values => [...values].map(String).sort();
  const equal = (a,b) => JSON.stringify(sorted(a)) === JSON.stringify(sorted(b));

  const idNodes = [...document.querySelectorAll("[id]")];
  const idCounts = new Map();
  idNodes.forEach(node => idCounts.set(node.id, (idCounts.get(node.id) || 0) + 1));
  const duplicateIds = sorted([...idCounts].filter(([,count]) => count > 1).map(([id]) => id));

  const lifecycle = globalThis.ErithPresentationLifecycle;
  const residency = lifecycle?.residencySnapshot?.() || [];
  const genericFamilies = sorted(residency.map(reg => reg.id));
  const systemRegistration = residency.find(reg => reg.id === "system") || null;
  const systemGenericKeys = sorted(systemRegistration?.records?.map(record => record.key) || []);

  const protectedSelectors = Object.freeze([
    "#analyste",
    "#detailPanel",
    "#atlasStorageHealth40198",
    "#atlasGreyPlateForensic40393"
  ]);
  const protectedNodes = Object.fromEntries(protectedSelectors.map(selector => {
    const node = document.querySelector(selector);
    return [selector, Object.freeze({present:!!node, connected:node?.isConnected === true})];
  }));

  const projects = globalThis.ErithProjectsPresentation40420?.snapshot?.() || null;
  const operations = globalThis.ErithOperationsPresentation40421?.snapshot?.() || null;

  const projectAnchors = Object.freeze([
    "fonds-erith-ia",
    "association-erith-ia",
    "aerith-enfance",
    "aerith-animaux",
    "aerith-terre-vivante"
  ]);
  const operationAnchors = Object.freeze(["situation","questionnaire","briefing","planning"]);
  const anchorConnectivity = Object.freeze({
    projects:Object.freeze(Object.fromEntries(projectAnchors.map(id => [id, document.getElementById(id)?.isConnected === true]))),
    operations:Object.freeze(Object.fromEntries(operationAnchors.map(id => [id, document.getElementById(id)?.isConnected === true])))
  });

  const assertions = Object.freeze({
    lifecycle_api_present: !!lifecycle?.residencySnapshot,
    generic_families_exact: equal(genericFamilies,["atlas","system"]),
    system_generic_keys_exact: equal(systemGenericKeys,["simulation"]),
    duplicate_ids_zero: duplicateIds.length === 0,
    protected_nodes_connected: Object.values(protectedNodes).every(row => row.present && row.connected),
    project_summary_anchors_connected: Object.values(anchorConnectivity.projects).every(Boolean),
    operation_summary_anchors_connected: Object.values(anchorConnectivity.operations).every(Boolean),
    projects_true_lazy_snapshot_present: !!projects,
    operations_true_lazy_snapshot_present: !!operations
  });

  const healthy = Object.values(assertions).every(Boolean);
  const result = Object.freeze({
    oracle:"candidate-a-pass13-machine-assertions",
    read_only:true,
    healthy,
    assertions,
    observed:Object.freeze({
      generic_families:genericFamilies,
      system_generic_keys:systemGenericKeys,
      duplicate_ids:duplicateIds,
      protected_nodes:protectedNodes,
      anchor_connectivity:anchorConnectivity,
      projects_snapshot:projects,
      operations_snapshot:operations
    })
  });

  console.log("Agent-Crypto Candidate A Pass13 assertions", result);
  return result;
})();
