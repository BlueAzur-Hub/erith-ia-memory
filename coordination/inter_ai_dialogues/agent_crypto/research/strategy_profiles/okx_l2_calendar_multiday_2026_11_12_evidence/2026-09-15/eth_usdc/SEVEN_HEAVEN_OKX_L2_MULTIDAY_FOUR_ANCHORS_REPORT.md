# Seven Heaven — Archive L2 Spot sur date calendaire : analyse en flux

Statut : full_archive_replayed_four_anchors
L'archive reste externe ; SHA-256 complets et mesures compactes dans le JSON.
Il ne s'agit pas de transactions ni d'ordres réels.

| Heure fixe UTC | Heure réellement observée | Spread (bp) |
|---|---|---:|
| 2026-09-15T00:00:00+00:00 | 2026-09-15T00:00:00.008000+00:00 | 2.30607133 |
| 2026-09-15T06:00:00+00:00 | 2026-09-15T06:00:00.001000+00:00 | 0.48074227 |
| 2026-09-15T12:00:00+00:00 | 2026-09-15T12:00:00.002000+00:00 | 0.04039449 |
| 2026-09-15T18:00:00+00:00 | 2026-09-15T18:00:00.002000+00:00 | 0.5328251 |

Absence de seqId/prevSeqId dans les premières mises à jour :
le replay ordonné ne prouve pas la continuité logique du flux source.
Les quatre horaires ne constituent pas une distribution représentative.
Frais, acceptation d'ordre, latence et taille exécutable non évalués.
