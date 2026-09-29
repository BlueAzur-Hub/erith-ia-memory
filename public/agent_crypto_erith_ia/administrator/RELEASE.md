# Agent-Crypto 40.6.468 — EVIDENCE RECONCILIATION + RUNTIME GAP TRUTH

Le rapport 40.6.467 prouve deux incohérences de présentation, pas une perte de données.

## Identité after-cost ↔ PAPER

40.6.467 Reconciliation affichait 0 lien / 4 after-cost orphelins / 9 PAPER orphelins parce qu'elle ne comparait qu'un ID primaire.

Le Crosswalk affichait simultanément la vérité plus complète :
- 4 after-cost;
- 9 PAPER;
- 4 liens 1↔1 uniques;
- 4 MULTI_ID_MATCH;
- 0 after-cost vraiment orphelin;
- 5 PAPER vraiment orphelins.

40.6.468 aligne Reconciliation sur les mêmes champs Multi-ID :
`execution_id · reconciliation_id · trade_id · identity`.

La comparaison primaire est conservée dans l'export pour diagnostic, mais n'est plus présentée comme vérité d'identité.

## Gaps runtime

40.6.467 montrait 531 gaps, dont 50 ouverts. Le store historique est conservé intégralement.

40.6.468 distingue sans écrire dans IndexedDB :
- gaps ouverts **actifs dans la page courante**;
- gaps ouverts **historiques**, commencés avant `performance.timeOrigin`;
- gaps ouverts non classables;
- gaps fermés.

Un ancien PAGEHIDE non fermé reste visible comme historique mais ne devient plus automatiquement un défaut actif de la session présente.

Aucune suppression de gap, aucun backfill, aucune fusion de preuve, aucun seuil modifié, aucun ordre réel. Market Core 38.15.11 intact.
