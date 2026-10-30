# Atlas-10 Crypto Bridge R16 / V1.9.12 — Source Lock for Agent-Crypto 40.6.484

## Canonical base

R16 was produced from the user-supplied complete R15 source archive corresponding to:

- Control Center 2.3.2R15
- Bridge V1.9.11
- Private Backend V1.4.2
- Windows GUI / no host console

A historical R15 bundle is retained in this repository at:

`coordination/inter_ai_dialogues/agent_crypto/AGENT_CRYPTO_BRIDGE_R15_V2_3_2_BRIDGE_V1_9_11_BACKEND_V1_4_2_OKX_WAVE1_READ_ONLY_CLEAN_BUNDLE.zip`

R16 is a bounded source evolution of that family. It does not introduce a third local process.

## Active runtime after R16

- Seven Vault: `127.0.0.1:8780` — independent / outside scope.
- Atlas-10 Crypto Bridge V1.9.12: `127.0.0.1:8787`.
- Private Backend V1.4.2: `127.0.0.1:8790` — unchanged, read-only.
- Ollama: existing local runtime, unchanged.

The 40.6.483 standalone Oracle Evidence owner on `8791` is superseded before operator installation.

## Modified source owners

### bridge/bridge.py

Source SHA-256 after R16:
`479d6945021b0c084af497dc659d2e4acc0e06265c33650e8d225942b0aa6ac5`

Added owner-only capabilities:
- `oracle_evidence.read`
- `oracle_evidence.publish`

Added authenticated routes:
- `GET /oracle-evidence/status`
- `POST /oracle-evidence/ingest`

The implementation reuses:
- existing Administrator Bridge sessions;
- existing capability policy / refusal-default contract;
- existing server-side GitHub credential resolution;
- existing security audit.

Cold archive path:
`public/agent_crypto_erith_ia/data/oracle_evidence`

Protocol:
bundle validation → atomic chunk + PENDING manifest commit → exact GitHub commit readback → SHA/count/JSON verification → VERIFIED manifest commit.

No force push. If `main` moved before a commit, the Bridge fails closed.

### bridge/bridge_config.json

Source SHA-256:
`e5479a1865a12c4eea35bc561ae8a673610b2979e1f18f122779bc35dc5dc795`

Adds the two Oracle Evidence capabilities to owner and documents the bounded cold-archive contract.

### source/main.go

Source SHA-256:
`cd70c4f54813aac7a3dffd4a589a47e175d6434666a2cc9991c60a62d5e5f67c`

Version contract:
- Control Center `2.3.2R16`
- Bridge `1.9.12`
- Backend `1.4.2`
- interface target `40.6.484 · Administrator`

### source/payload.zip

SHA-256:
`17cc4ed118bc7a8fd8d50802d2cfd588ae7609d4ecf3d1cc137b6cbff843ace1`

The embedded Bridge/config/backend copies were verified byte-identical to the visible R16 source tree.

## Preserved byte truth

Private Backend V1.4.2 SHA-256 before and after:
`77a69691932ebcfb82bc43c6e0da9289bad08054753280a8f80e6ab8d5a8bc7f`

Sample Atlas profile SHA before/after:
`7930bcd5848c50e00829bc62ca2c51797e85a173329aeeabbe6dc5688201be04`

Sample Aerith profile SHA before/after:
`f6138c6ac3b716cccb61c724ef15204ceda9a9f03b69f937b4348c6518756ccf`

## Windows build proof

Build contract:
`GOOS=windows GOARCH=amd64 CGO_ENABLED=0 go build -trimpath -ldflags "-H windowsgui -s -w"`

R16 EXE SHA-256:
`6e4ffd5812c2f39d3d583364b96b7fdcd5d63bcb9b97f9f1503d6ab7f7f15f40`

PE inspection:
- PE32+ x86-64
- Windows GUI subsystem
- no host console

A second rebuild from the same R16 sources produced the exact same SHA-256.

## Safety lock

R16 / 40.6.484:
- embeds no GitHub secret in browser code;
- gives no generic GitHub-write capability to browser;
- exposes no local Evidence delete API;
- does not reduce local retention;
- does not modify the Private Backend write contract;
- does not modify Market Core 38.15.11;
- does not modify Strategy A business rules;
- does not modify Oracle Math;
- produces no real order.

Wine execution was not available in the build environment and is therefore not claimed as PASS. Final runtime proof belongs to the Ryzen Windows machine.
