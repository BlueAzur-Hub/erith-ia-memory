# Seven Heaven — Public Interface / Visuals / Pages / Oracle

## Goal (14 October 2026)
Keep Trader / Administrator / Market Core unchanged. Move **original** PNG images
with exactly the same Git blob identity:
- 29 Lecture Technique PNG -> assets/images/technical-reading/
- 10 other large visual PNG -> assets/images/visual/
Do not compress, resize or generate images. User image uploads in IndexedDB
are unchanged. Browser code is only updated to use the new relative URLs.

This is an **internal relocation in the SAME public repository**. It reduces
the size of public/agent_crypto_erith_ia by 147,215,543 bytes but NOT the
size of the whole Git repo or Pages unless deployment includes fewer files.

## Candidate selective Pages build (not a live deployment)
Workflow: .github/workflows/agent-crypto-selective-pages.yml
Script: tools/build-selective-pages.py

Keep public/ and assets/ web resources. Exclude from the Pages *artifact*:
- coordination/, private/, Phoenix/, legacy release packages
- ZIP/installers and upload bundles
- administrator/index-[historical-version].html
- oracle_evidence/**/*.jsonl (but retain its manifest and README)
- no existing R9/Univers/Top50/Long history GZIP is excluded yet

The Git repository, its history and GitHub raw URLs do NOT become private.
GitHub Pages source and publication are NOT changed by this branch.
Do not promote this workflow until CI, HTTP URL checks, cache-miss tests,
manual Firefox proof and unrelated public-page smoke tests all pass.

## Oracle Evidence: classification and limits
Path: public/agent_crypto_erith_ia/data/oracle_evidence/
- 239,506,598 tracked bytes, 75 JSONL chunks + manifest + README.
- manifest declares 36,474 archived observations, 75 VERIFIED chunks.
- payload sample fields contain market snapshots, Oracle forecast envelopes,
  model labels, source health and observed outcomes.
- Firefox/IndexedDB is HOT; Bridge 8787 controls ingestion; GitHub cold stores
  independently verified chunks.
- The manifest declares NO deletion of the local HOT copies.
- Existing data remain on the PUBLIC Git repository and accessible via raw URLs.
  Excluding from Pages does NOT secure/confidentialize the data.
- No exhaustive sensitive-data or licensing audit has been completed.
  Do not copy personal OKX account data to Oracle evidence.


## CRITICAL - three delivery tiers (user decision)
1. **CLEAN_UPLOAD PATCH**: `tools/build-code-patch.py` compares exact Git refs, includes changed runtime code only, ZIP with per-file SHA-256 and deletion manifest; routine budget 1,000,000 bytes. Initial one-time PNG relocation remains a separate external asset migration and is flagged as a dependency in patch metadata. Uploading a code patch without the moved images would break the view.
2. **PAGES SITE**: entire static served bundle, not a patch. Earlier candidate around 790 MB is still too large for routine re-packaging. CI on pull_request now builds only the small code patch. `tools/build-selective-pages.py` runs only on an explicit manual `workflow_dispatch` for inspect-only; never silently deploy. To truly deploy thin, relocate/archive historical data serving off Pages with SHA/CORS tests, then validate Firefox.
3. **COLD VAULT**: history and 75 Oracle JSONL chunks remain unchanged in GitHub public and are excluded from the Page artifact only. Their future use as "Les Yeux de l'Oracle" requires T0-versus-outcome evaluation; it is not a trading signal.

The full Crypto conversation records old UPLOAD ONLY / CLEAN_UPLOAD releases with only ~6-8 modified files, sometimes a 20 KB emergency ZIP. Their small patch size must never be conflated with a ~790 MB Pages artifact.

## Validation checklist before merging to main
- Verify all 39 destination blobs have identical SHA as original blobs.
- Check 5 updated active source files and all relative image URLs.
- Keep Market Core 38.15.11 and current build 40.6.640 unchanged.
- Check Technical Reading AUTO/AUBE/JOUR/SOIR/NUIT/LUNE/RND, custom local image,
  image fallback, Graph office background and independent visual badges.
- Check CT/USDT charts vs CT/USDC private account and all existing trader views.
- Check cold cache in Firefox private window and after Ctrl+F5.
- Keep PAGES source unchanged until a separate, approved cutover.
- No financial orders; no changes to account API privileges.

If verification fails, close PR without merging; main and its Pages remain intact.
