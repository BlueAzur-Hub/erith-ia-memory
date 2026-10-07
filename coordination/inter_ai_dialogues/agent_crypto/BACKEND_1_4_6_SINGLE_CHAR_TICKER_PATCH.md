# Backend 1.4.6 — Single-character ticker patch

Target: existing **Aether Control 2.3.2R19**.

- Bridge **1.9.13**: unchanged.
- Private Backend **1.4.6**: same version, one validator repaired.
- Market Core **38.15.11**: unchanged.

## Root cause

The integrated R19 Backend rejected one-character asset tickers:

```python
if not (2 <= len(asset) <= 16 and asset.isalnum()):
```

40.6.620 changes only the lower bound:

```python
if not (1 <= len(asset) <= 16 and asset.isalnum()):
```

Browser owner `administrator/js/okx-market-pair-resolver.js` is repaired in the same release.

Expected MemeCore truth:

`M → M-USDC → M-USDT`

Never `MEMECORE-*`.

## Install on the existing R19

1. In Aether Control, click **Arrêter Backend**.
2. Close Aether Control.
3. Open the technical folder shown by Aether Control:
   `%LOCALAPPDATA%\ERITH.IA\AtlasCryptoBridge\2.3.2R19\backend\`
4. Replace only `private_backend.py` with the file from the delivered conversation patch ZIP:
   `AGENT_CRYPTO_40.6.620_SINGLE_CHAR_TICKER_PATCH.zip`
5. Relaunch `ATLAS_CRYPTO_BRIDGE_CONTROL_CENTER.exe`.
6. Verify:
   - Bridge V1.9.13 active / ready
   - Private Backend V1.4.6 active / ready
7. Firefox → Ctrl+F5 → TRADER 40.6.620.
8. Test MemeCore (M), then OKB regression.

Patch ZIP SHA-256:
`0c7fd9462543c3999d1969be12063f77217567d71d48a9e2a2fa16fb3be1b7fa`

Patched `private_backend.py` SHA-256:
`bd4396cdc82532525deadc129058a33a2ef0aa6fdd45cddbebdd395483839cff`

No order, wallet, withdrawal or exchange private key.
