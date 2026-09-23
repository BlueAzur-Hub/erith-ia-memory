# HANDOFF — FIL CLOS · Agent-Crypto 40.6.387 · Aether Veille Syntax Recovery

Date: 2026-09-23
Identity expected on reprise: **Aerith-7 / Seven Heaven**
Market Core: **38.15.11 — protected**

## Read first

1. Notion: **AETHER · AGENT-CRYPTO INTERFACE**
2. This handoff
3. Current `administrator/build.json`
4. Current `administrator/index.html`
5. For Aether/Veille only: `administrator/js/aether.js` and `tools/atlas_news_collector.py`
6. Fil Crypto only when historical causality is needed.

Rule: **read → diagnose → target → correct → prove → stop**.

## Frozen checkpoints

- **40.6.384** — Math Core + REDIVIDER cockpit validated from Transformer Book to Ryzen 7. Freeze.
- **40.6.385** — Lecture Technique RND adds `technical-random-21.png` = **Origines d’Aerith**, original 1024×1536, Firefox PASS. Freeze.
- **Shared Memory** — explicitly deferred by Christophe. LATER, not an active regression.
- **Aether Watch 40.6.322 geometry** — freeze; do not touch F11/window placement.

## 40.6.386 — semantic owner correction

Audit found a real false positive:

`SEC Censures OTC Link LLC ...` → asset `LINK`

Root cause was source-owner extraction: generic word **link** was treated as Chainlink.

40.6.386 correctly changed:

- News collector: LINK requires `chainlink` or `link token`;
- regression test for OTC Link LLC;
- stale archive asset tags rederived;
- Aether stale-cache guard uses the same explicit Chainlink truth.

Producer workflow/archive proof: PASS.

## 40.6.387 — syntax recovery found while closing this thread

The 40.6.386 insertion accidentally contained literal `\\n` tokens in executable `aether.js`.

Proof before correction:

`new Function(aetherSource)` → **Unexpected token 'function'**

40.6.387 changes only source formatting of those accidental tokens.

Proof after correction:

`new Function(correctedAetherSource)` → **PASS**

The LINK entity-truth logic itself is not changed.

## Next action for sister AI

**Do not start another feature first.**

Firefox proof of **40.6.387**:

- Ctrl+F5;
- Build 40.6.387 visible;
- Aether / VEILLE alive;
- no false LINK classification for OTC Link LLC;
- real crypto/macro rotation healthy.

If PASS:

1. mark 40.6.387 PASS / GELÉE in Notion;
2. freeze Aether syntax/entity-truth repair;
3. continue the Aether / Veille intelligence audit only on a **concrete remaining mismatch** in ranking / selection ownership.

No .388 for cosmetics or speculative cleanup.

## Delivery discipline

When Christophe says **« fais une version »**:

- real code edit;
- commit on `main`;
- deployment / guards;
- clean-upload ZIP containing the actual changed code, including HTML when HTML changed;
- Notion update;
- proof;
- stop.

Never replace a real version with a patch note pretending to be the version.
