# Agent-Crypto — canonical deployment method

Status: operational handoff, 2026-10-30. This is a procedure, not a claim that Firefox is currently executing the newest version.
Applies to Administrator / Trader frontends published by GitHub Pages. Read the current Notion AETHER Agent-Crypto interface page and latest handoff before release.
The GitHub history and the build actually served take priority over conversational memory.

## Failure demonstrated by Administrator 40.6.710

- Code was pushed to `main` by `github-actions[bot]` at commit `291331db41984503ef98dbac6c45ee47dfb2e12d` and the ZIP and SHA-256 were archived.
- The corresponding `push` did **not** launch the existing Pages workflow. This is expected when a workflow pushes using `GITHUB_TOKEN`.
- The Pages deployment was separately triggered and succeeded on commit `fa3135ff04a739c061307507a0763242c7988183` (Actions run `41021696355`).
- Firefox subsequently displayed `Build 40.6.709 · 40.6.710 disponible`: the deployed version was discoverable, but the running application was still 40.6.709 at the moment of that screenshot. **Do not label it as Firefox-validated 40.6.710.**

## Four independent release gates — never conflate them

**G1 — Code committed:** Determine the intended base SHA, check changed paths/blob SHA, run syntax and regression tests on the complete repository, then commit. Verify `index.html` and `build.json` advertise the same intended build. Never overwrite a changed SHA.

**G2 — Handoff archived:** Preserve the numbered ZIP, checksum and audit/handoff in `coordination/inter_ai_dialogues/agent_crypto/`. Check ZIP entries, CRC, SHA-256 and the source commit. Avoid identical names for archives with different bytes. An incremental ZIP is not a standalone installation.

**G3 — GitHub Pages deployed:** After a bot-authored production commit, explicitly dispatch the **existing** `.github/workflows/agent-crypto-runtime-pages.yml` via `workflow_dispatch` on `main` with boolean input `publish=true`. Do this in the same authorized release orchestration, using `actions: write` for the dispatching job. Do **not** expect a `push` made by `GITHUB_TOKEN` to trigger another workflow. Do not add a dummy comment or gratuitous commit to force Pages. Wait for `build-runtime` and `deploy-runtime` to succeed, and verify that the deployment run's source revision is the intended release commit or a descendant containing it.

GitHub REST dispatch payload for the existing workflow:

```json
{"ref":"main","inputs":{"publish":true}}
```

Endpoint: `POST /repos/BlueAzur-Hub/erith-ia-memory/actions/workflows/agent-crypto-runtime-pages.yml/dispatches`. Prefer the repository's short-lived `GITHUB_TOKEN`; do not introduce personal credentials or secrets into public files. This event is explicitly exempt from GitHub's GITHUB_TOKEN recursive-workflow suppression (GitHub Docs: https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow).

**G4 — Client actually loaded:** Compare `AGENT_CRYPTO_EMBEDDED_BUILD` / `AgentCryptoBootTruth.build` or the visible running-build badge with the build actually served in `build.json`. `40.6.709 · 40.6.710 disponible` means **running 709, update 710 available**, not running 710. After G3 success, a single controlled reload of the same Firefox tab is appropriate, then verify the loaded build again. If still old, diagnose browser cache, entry HTML, script versioning or an explicit in-app update action before touching source code. Do not clear IndexedDB/localStorage/sessionStorage, force-reset user choices, or assert that CTRL+F5 invalidates the owner's session: these are separate concerns.

## Gate results required in the final delivery

`SOURCE_COMMITTED` = git SHA + matching build manifest.
`ARCHIVE_READY` = ZIP path + checksum + handoff.
`PAGES_DEPLOYED` = successful deploy-run URL + source SHA containing release.
`FIREFOX_LOADED` = observed loaded build, separate from available update/build manifest.
`FUNCTIONALLY_VALIDATED` = observed user/browser tests (for example Top 5 annual USD 5/5 native histories). If no browser evidence, state PENDING; never synthesize a PASS.

### Recovery order

- No matching commit => fix G1 without changing untouched modules.
- Missing or incorrect archive => fix G2, do not redeploy unrelated code.
- Code + ZIP present but old Pages => dispatch Pages once, verify G3.
- Pages deployed, browser still old => investigate client boot/cache and the update banner, not re-run CI or reupload ZIP.
- Correct running build but wrong graphs => investigate application data/runtime separately; preserve proven EUR/USD history and canonical Top 5 BTC/ETH/BNB/XRP/SOL.

For every release: one version, one source commit, one authoritative ZIP and checksum, one actual Pages deploy, one loaded-build status. No redundant ZIPs, gratuitous workflow edits or speculative historical data.

GitHub Pages workflow: https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/.github/workflows/agent-crypto-runtime-pages.yml
Delivery proof: https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/41021696355
