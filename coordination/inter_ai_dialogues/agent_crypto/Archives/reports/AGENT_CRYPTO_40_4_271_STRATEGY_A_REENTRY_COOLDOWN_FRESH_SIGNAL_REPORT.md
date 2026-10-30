# Agent-Crypto 40.4.271 — Strategy A Re-entry Guard

- Parent: 40.4.270
- Market Core: 38.15.11 (protected)
- Paper-only, session-local
- Re-entry cooldown after close: 15 minutes
- MIXTE fresh-signal rule after cooldown: direction +3 points OR BTC 24h +0.05 percentage point versus prior entry
- HAUSSIER may re-enter after cooldown
- Existing Risk Governor, Paper execution and reconciliation math unchanged
- No Kraken network, credentials, wallet, persistence or real orders
- ZIP SHA-256: `ecd0dc860055853349339787b05578d7b74c99500a3c8c63cd05b2a9d5f89fc1`
