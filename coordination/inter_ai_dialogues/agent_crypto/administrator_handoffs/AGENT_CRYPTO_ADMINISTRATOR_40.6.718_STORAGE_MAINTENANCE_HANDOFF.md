# Administrator 40.6.718 — Scanner storage maintenance

## Proven browser state
On Firefox, localStorage 218 keys, 5.01 MiB, QuotaExceededError. A 2.93 MiB historical localStorage Scanner archive has 240 rows; 240 rows also exist in verified IndexedDB PRIMARY. Operator performed backup twice. The earlier operator-only retire command repeatedly stopped with SCANNER_PERSISTENCE_BUSY without deleting data.

## Correction
- The canonical Scanner persistence now accepts an explicit operator-only maintenance lease. Captures and new Bridge flushes are deferred during maintenance, then resumed.
- Drain queued Scanner archive/pending payloads in maintenance even if the foreground would otherwise defer idle persistence.
- Wait for the separate IndexedDB async write queue to commit before revalidating the primary copy under the same lock.
- Execute existing retireVerified safeguards with no generic clearing or auto deletion.
- Release maintenance on success, error, or abort. Recover deferred captures.
- Rename touched module file storage-primary-truth.js and public runtime API AgentCryptoStoragePrimaryTruth, removing version numbers from those names. Update both post-boot loader references; cache-bust active loader.

## Acceptance / limits
Code SHA and Node isolated maintenance checks pass. This does NOT prove a live Firefox operation; quota recovery is still pending the owner's approval and test. Do not declare success before localStorage is measured at about 2.08 MiB and IndexedDB PRIMARY is still intact.
One canonical incremental ZIP contains six changed source files; the prior numbered module path is removed from Git main.
No bridge, market core, historical vault, trading, source history, evidence, or other localStorage keys are changed.
