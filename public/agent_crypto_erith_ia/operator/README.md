# Agent-Crypto Operator — canonical repository pointer

The live Yohan Operator lineage is **not owned by this MASTER repository**.

Canonical repository:

`BlueAzur-Hub/agent-crypto-operator`

Canonical project root:

`public/agent_crypto_erith_ia/`

Public Yohan entry:

`https://blueazur-hub.github.io/agent-crypto-operator/public/agent_crypto_erith_ia/administrator/yohan.html`

## Architecture lock

- MASTER / Administrator stays in `BlueAzur-Hub/erith-ia-memory`.
- Yohan Operator stays in the separate repository `BlueAzur-Hub/agent-crypto-operator`.
- Internal project paths are intentionally mirrored to ease selective synchronization.
- Do not create a second live Operator runtime inside MASTER.
- Do not blindly copy MASTER over Operator: preserve the Yohan profile, local Bridge contract and Operator-specific handoff.
- A URL/query parameter is not authorization.
- View names (Classique / Intermédiaire / Administration) remain separate from roles (public / operator / owner).

This directory is therefore only a compatibility pointer/history surface.
