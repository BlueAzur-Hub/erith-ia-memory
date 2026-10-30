# Agent Crypto — Atlas Math Core / Redivider alignment requirement

Status: UI requirement for a future explicitly scoped version. NOT implemented in Administrator 40.6.711.

Evidence: Firefox screenshots supplied 2026-10-30 09:21 of the normal dashboard with right-side Technical Reading and the maximized graph where the sidebar is collapsed. Math Core circular control appears at bottom-left; Redivider circular control shifts vertically at bottom-right and lacks a shared baseline.

Acceptance criteria:
- Atlas Math Core at bottom-left of the chart shell and Redivider at bottom-right.
- Both controls visually harmonized: identical bottom reference line, coherent visual sizes/margins, no overlap with chart legend, axis, footer, status strips, or each other.
- Alignment remains stable when right Technical Reading is expanded, collapsed or hidden; when graph enlarges; and at supported Firefox desktop sizes. Respect safe padding and responsive behavior.
- Control remains clickable, keyboard-accessible, focusable, and preserves current positioning of draggable panels and real historical data.
- Screenshot validation in both layouts required. No speculative positioning patch or change to graph code in this release.

Owner: Administrator presentation; protect Trader and Operator. Requirement recorded from user screenshots.

## Code-level cause documented after further Firefox screenshots (09:26–09:42)

Actual owner loaded by `administrator/index.html`: `./js/operator-dashboard.js?v=40.6.400` (not the historical `operator-dashboard-406382.js`).
The active dashboard injects a full-screen `#agentCryptoOperatorDashboard406384` overlay. Both outer wings have `position:absolute;bottom:18px`; this **does not align their visible centers or text**. Their contents use different internal geometries:

- `.math-stage`: `min-height:132px` and `.math-ring`: `94px`.
- `.redivider-stage`: `min-height:148px` and `.kill-ring`: `108px`.
- Each has its own heading/body, balance rails and state-dependent normal/mini/hidden layout. The compact wings both use a nominal 104px box, but their content and hover/mini variants still require a shared reference geometry.
- Thus assigning both wings the same `bottom` is insufficient. Establish a **shared baseline for the actual circular controls and matching typography/visual scale**, rather than an arbitrary offset of the full panels.
- The HUD overlay uses a very high z-index and can cover chart overlays, the ticker or Technical Reading when the viewport/screen mode changes. Preserve clicking, keyboard access, and the Redivider safety control.
- Compare screenshots with Technical Reading open and collapsed, and the enlarged graph. Require screenshots of both modes with a horizontal guide across the visual circle bottom/center, plus non-overlap with the Top 5 ticker.

This is a specification update only: no UI code change was authorized or published by this note.
