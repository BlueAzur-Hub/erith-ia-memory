# Administrator storage maintenance release request

Operator approved repair of the recurring SCANNER_PERSISTENCE_BUSY defect after verified 218 localStorage keys, 5.01 MiB, QuotaExceededError, 2.93 MiB Scanner legacy copy, 240 indexedDB PRIMARY Scanner rows, downloaded full backup, and repeated safe-blocking retire attempt.

Release 40.6.718. Source 40.6.717 locked by Git blob SHA. Change only scanner maintenance lifecycle and coordination, rename storage-primary-truth-406344.js to stable storage-primary-truth.js and stable public API, update two loader references, build and index version/cache bust. Archive six changed files with SHA256 and handoff, commit source on main, dispatch Pages. Do not touch Market Core, Bridge, Vault or evidence. Manual Firefox validation after publication.

Retry unchanged guarded release after replacing formatting-sensitive generated-source SHA assertions with functional-invariant checks. Prior run failed before writing application sources or archive.
