# Agent-Crypto 40.4.274 — Atlas Resident CURRENT Snapshot · Source-State Visibility Decoupling

- Parent: 40.4.273
- Protected Market Core: 38.15.11
- Release: ATLAS RESIDENT CURRENT SNAPSHOT · SOURCE-STATE VISIBILITY DECOUPLING LOCK

## Corrected owner audit
The abandoned release attempt targeted a non-existent `atlasLoadPublicCryptoMarket()` function. The canonical 40.4.273 runtime instead owns the public snapshot through `SourceAdapter.publicCryptoMarket()` called by `runLivecheck()`.

`atlasPulseVisible()` means browser document visibility (`document.visibilityState != hidden`); it is not the Atlas disclosure/open-state predicate. The existing Atlas CURRENT scheduler already states that analysis authorization is independent from which UI view is open, and 40.4.137 remains the single pending CURRENT owner.

## Actual upstream loss point
When Firefox moved the Administrator document to hidden state, `atlasPauseMarketPulse()` cancelled/aborted the public-market cadence, `scheduleAutoRead()` refused to keep a market timer, `refreshMarketOnly()` refused hidden work, and `runLivecheck()` rejected both at entry and after fetch. A newer canonical JSON therefore could remain unknown to resident CURRENT until a visibility-return event rearmed market ingestion.

## Surgery
- Keep the existing 5-minute public-market timer/controller alive as resident source-state work while the document is hidden.
- Reuse the existing `runLivecheck -> SourceAdapter.publicCryptoMarket` fetch owner; no second fetch owner is created.
- Remove document-visibility rejection from canonical market fetch/commit.
- Suppress the selected-chart refresh while running resident-only hidden market work.
- Continue pausing spot/chart presentation pulses while hidden.
- Reuse `atlasAfterLivecheck` and therefore the existing 40.4.137 `atlasCurrentPendingMarket137` reconciliation path.
- Advance the existing System parser-shell cache tokens to the same Administrator build; no System behavior changes.
- No new timer, observer, WebSocket or storage owner.
- Atlas readiness, Bridge auth recovery and report sequencing are unchanged.
- Market Core remains 38.15.11; Oracle and Strategy A are untouched.

## Firefox acceptance target
1. Open Administrator and let the normal market/Atlas state initialize.
2. Leave AUTO market cadence enabled.
3. Put the Administrator browser tab/window in a genuinely hidden state (switch tab or minimize); merely collapsing the Atlas disclosure is not this test.
4. Allow a newer canonical `data/crypto/latest.json` snapshot to be published while hidden.
5. Return to Administrator and verify that resident market state/pending CURRENT has advanced without requiring Ctrl+F5 or opening Atlas first.
6. Verify the existing chain continues through readiness -> Atlas 1/4..4/4 -> NØX -> Aerith -> CURRENT -> REPOS.
7. Confirm visible graph/spot presentation resumes normally after visibility return.

This build does not add a second scheduler or a second pending CURRENT owner.
