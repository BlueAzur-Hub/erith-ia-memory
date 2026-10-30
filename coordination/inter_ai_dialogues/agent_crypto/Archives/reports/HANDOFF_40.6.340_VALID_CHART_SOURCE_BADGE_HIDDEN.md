# Agent-Crypto 40.6.340 — Valid chart source badge hidden

Date: 2026-09-22
Parent: 40.6.339
Market Core: 38.15.11 unchanged
Safe frozen global checkpoint: 40.6.336
Phone terrain: deferred by operator

## Operator decision

Christophe explicitly chose the simplest visual outcome: no green Source Truth capsule over a valid Crypto chart. The feature may be revisited later if needed.

## Change

For the valid Crypto real-chart pseudo-element only:

```css
.atlas-market-zone #analyste
.chart-shell[data-chart-state="valid"][data-real-chart]::before {
  display: none !important;
}
```

This removes the visual capsule rather than trying to resize it again.

## Preserved

- chart Source Truth data attributes remain present for diagnostics and Atlas;
- chart state, provider, freshness and origin remain computed;
- loading message remains available;
- blocked/unavailable message remains available;
- Market Core 38.15.11 unchanged;
- Aether 40.6.322 unchanged;
- Oracle, Lecture Technique, Strategy A, Gates, Storage and Shared Memory unchanged;
- no timer, observer, fetch or business logic added.

## Validation policy

Blackview has already completed the key Aether tests and is intentionally not being powered on for this secondary visual check now. Phone validation is deferred. The code-level effect is deterministic: the valid source pseudo-element is not rendered while the underlying Source Truth data remains intact.
