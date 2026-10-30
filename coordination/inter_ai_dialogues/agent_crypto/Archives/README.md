# Archives — legacy build packages

This directory contains historical ZIP delivery packages and their SHA-256 companions relocated during a maintenance review. Original file names and Git blob SHA identities are preserved. No application, runtime, history file, or current handoff was moved.

**Important link behavior:** moving a GitHub file changes the URL when it points to a branch such as `main`. Before a merge into `main`, all pre-existing links on `main` continue working. After a merge, old branch-relative links would break, but permanent URLs bound to commit `a4695de55150d7ad5e87fb2d08837ab1e8e07bf7` remain available via Git history. Thus the move is staged in an isolated branch for review, not applied to `main`.

See [MANIFEST.md](MANIFEST.md) for the exact old-to-new mapping. The Git history is not rewritten and objects are not deleted.

- Original direct entries in agent_crypto: 1,073 (1,055 files; 18 folders)
- Historical artifacts staged for relocation: 203 (109 ZIP, 94 checksums)
- Expected direct entries after promotion: 871
- Current Administrator source and all code paths: unchanged
- A merge into main must be approved only after checking links outside this repository.
