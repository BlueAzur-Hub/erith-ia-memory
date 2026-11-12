# Seven Heaven — Une minute et persistance en temps d'événements OKX L2

Instrument : BTC-USDC, journée UTC 2026-10-15.
Statut : full_archive_replayed_one_minute_with_event_time_persistence
Relevés minute : 1440/1440.
Vérifications des 96 anciennes snapshots : 96/96.
Archives SHA/CRC dans la preuve JSON ; aucun ordre réel.

Durée observée événement à événement : 86399930 ms.
Spread moyen pondéré par durée des événements (bp) : 0.0352768728952588
Seuils : strictement supérieurs aux valeurs indiquées, sans extrapolation à 24:00.

| Seuil bp | Durée cumulée ms | Part du temps couvert | Épisodes positifs | Épisode max ms |
|---|---:|---:|---:|---:|
| >0.1 | 2717864 | 0.03145678 | 64350 | 6710 |
| >0.5 | 1618952 | 0.01873789 | 37205 | 1030 |
| >1.0 | 695735 | 0.00805249 | 16598 | 850 |
| >2.0 | 62705 | 0.00072575 | 1995 | 420 |

Limite : la lecture SHA-256/CRC ne prouve pas qu'aucun événement manque en amont de l'archive.
