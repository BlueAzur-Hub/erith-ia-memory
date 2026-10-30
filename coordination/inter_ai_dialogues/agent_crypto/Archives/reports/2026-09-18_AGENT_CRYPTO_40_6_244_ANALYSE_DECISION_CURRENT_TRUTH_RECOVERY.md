# AGENT-CRYPTO 40.6.244 — ANALYSE & DECISION CURRENT-TRUTH RECOVERY

Date: 2026-09-18
Release: **40.6.244**
Parent: **40.6.243**
Market Core: **38.15.11**
Mode: **PAPER ONLY**
G3: **PENDING**
G9: **LOCKED**

## Finding

Firefox showed live News in Aether while Decision Intelligence and News→Market stayed frozen on their startup empty state.

The canonical News owner still exists in `app.js` as `AgentCryptoNewsEventSource`.

A second compatibility regression was found: Decision Intelligence acceptance reads
`ErithVersionTruth.snapshot().false_propagation`, but the current version-truth snapshot no longer exposed that field.

## Repair

- restore `false_propagation:false` and `single_visible_owner:true` in the version-truth snapshot contract;
- add `js/analysis-family-recovery-406244.js`;
- reuse the current News source and current render owners;
- refresh Analyse/Decision after News load, News selection, explicit disclosure open, or presentation residency restore.

No new data source, model, recurring timer, observer, storage owner or order path.

## Commits

- Version Truth compatibility: `43077d356a3151dc60db9cf30841ed66a3702c54`
- Analysis recovery module: `081ff11cfae9280f29113cc273906ffac55f4266`
- Canonical load: `e9b8d3a32e1c8cdaddaf69e1cfd7650aa427ea54`
- Release: `45b2758286d5539f44104c412e264c3294fc1625`

## Firefox proof

Reload to Build 40.6.244.
Open Decision Intelligence and News Sentinel context once.
