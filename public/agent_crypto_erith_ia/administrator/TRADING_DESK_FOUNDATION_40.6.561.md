# Agent-Crypto Administrator 40.6.561 — TRADING DESK · READ-ONLY FOUNDATION

Parent: 40.6.560  
Market Core: 38.15.11 — protected / unchanged

## Purpose
Begin the future Trading Desk without opening the private OKX/order work.

This build creates a new isolated page:
- `trading-desk.html`
- `trading-desk.css`
- `js/trading-desk-foundation-406561.js`

## Canonical layout from the Fil Crypto
Desktop:
- Market left;
- Graph center;
- Profondeur top-right;
- Lecture Technique below Profondeur;
- Math Core / Vente / Redivider below.

Mobile uses the same HTML:
- pair header;
- Graph;
- Profondeur;
- Lecture Technique;
- Math / Vente / Redivider;
- Market becomes a drawer.

There is no Aether ticker above the workspace.

## Pair truth
One central state owns the selected pair. The foundation defaults to BTC-USDC · SPOT.
Market buttons currently prove only local routing of this single truth through the page labels.

## Safety boundary
This is deliberately read-only and mostly unwired:
- no private OKX API;
- no fetch/WebSocket;
- no API secret;
- no account data;
- no order simulation;
- no real order;
- no storage owner;
- Math / Vente / Redivider controls are disabled;
- graph/depth/LT/Math components are placeholders for later reuse of existing owners.

The next integration must reuse existing components rather than create a second graph, second depth engine or second S/R logic.
