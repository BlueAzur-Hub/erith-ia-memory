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
