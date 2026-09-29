# Agent-Crypto 40.6.465 — EXECUTION COST EVIDENCE CAPTURE RENDER RECOVERY

40.6.464 reste FAIL terrain : Build 40.6.464 était visible, les diagnostics .460/.461/.462 étaient présents, mais le panneau EXECUTION COST EVIDENCE CAPTURE restait absent.

Cause exacte supplémentaire trouvée sur main :
`strategy-a-execution-cost-evidence-capture.js` appelle `ensureStyle()`, qui utilisait `ROOT+"Style"` alors qu'aucune constante `ROOT` n'était déclarée dans ce module. L'exception était avalée par les try/catch de rendez-vous de rendu, ce qui rendait l'échec silencieux.

Correction 40.6.465 :
- déclaration `const ROOT="strategyAExecutionCostEvidenceCapture";`;
- cache-bust 40.6.465 sur les deux chemins de livraison Capture;
- BUILD 40.6.465 dans les loaders concernés;
- harness CI DOM qui exécute réellement le chemin `render() → ensureStyle() → création du panneau`;
- aucune modification des calculs, seuils, données, schéma IndexedDB ou ordres.

Invariants : aucun backfill historique; after-cost injection OFF; PAPER ONLY; Market Core 38.15.11 intact; aucun ordre réel.

Test terrain unique :
Ctrl+F5 → Build 40.6.465 → Section 04 → Simulation → rechercher EXECUTION COST EVIDENCE CAPTURE.
Attendu sans PAPER actif : ARMED · PAPER suivis 0 · Entrées 0 · Sorties 0 · Entrée+sortie 0 · After-cost injection OFF.
