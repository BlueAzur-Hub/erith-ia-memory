# Agent-Crypto 40.6.178 — Strategy A Evidence Placement

## Terrain truth from 40.6.177
- Build 40.6.177 is visible in Firefox.
- The canonical evidence host is visible, but it is below Sources/global footer.
- Terrain counter: `0 / 3 PANNEAUX`. No supplemental panel is claimed mounted.
- Exported terrain shows the Strategy A PAPER V2 bridge immediately before TRADUS.

## Change
- Keep canonical wiring in `administrator/index.html`.
- Place `strategyAEvidenceSupplements178` immediately after `strategyAPaperV2ProofBridge`.
- Keep the host outside the Proof Bridge subtree rewritten by `ProofBridge.render()`.
- Use standalone `strategyADossier` only as a fallback anchor.
- Hide the host while no safe anchor exists, instead of showing it at the page footer.
- Add a passive `DOSSIER LEGACY ABSENT` diagnostic when current G3 renderers cannot create their panels.

## Invariants
- No Strategy A threshold or business-logic change.
- No Market Core / Web Classique / Aether / Atlas CURRENT / Oracle / Lecture Technique / TRADUS change.
- No recurring timer, MutationObserver, storage owner, network business request, automatic self-test or real-order path.
- G3 remains PENDING.
- G9 remains LOCKED.
- Firefox placement and refresh-survival proof remain pending.
