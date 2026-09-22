# Agent-Crypto historical archive manifests

This directory separates **historical archive truth** from the live Administrator runtime.

## Runtime truth

Current published runtime identity is owned only by:

`public/agent_crypto_erith_ia/administrator/build.json`

The compatibility files `administrator/version.json` and `administrator/administrator-version.json` are historical pointers and must not be interpreted as current runtime identity.

## 40.6.86 frozen archive

`ADMINISTRATOR_40.6.86_ARCHIVE_MANIFEST.json` points to the exact source commit:

`1a0a6b1e20d02d125f3da893d02947a311edcd95`

It carries the historical file map and hashes needed to reconstruct that archive.

Exact original manifests are preserved under `frozen/`.

## Rebuild

Use the manual GitHub Actions workflow:

`.github/workflows/agent-crypto-historical-archive.yml`

It reads an explicit archive manifest, reconstructs bytes from the declared Git commit, verifies declared SHA-256 hashes when present, and uploads the result as an Actions artifact. It does **not** mutate the live Administrator tree and does **not** create an automatic archive commit.
