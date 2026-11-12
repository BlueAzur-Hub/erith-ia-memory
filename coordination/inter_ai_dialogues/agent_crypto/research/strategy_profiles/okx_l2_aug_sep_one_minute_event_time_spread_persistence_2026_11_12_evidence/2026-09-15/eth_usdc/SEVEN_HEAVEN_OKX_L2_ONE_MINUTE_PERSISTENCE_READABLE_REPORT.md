# Seven Heaven — Une minute et persistance en temps d'événements OKX L2

Instrument : ETH-USDC, journée UTC 2026-09-15.
Statut : full_archive_replayed_one_minute_with_event_time_persistence
Relevés minute : 1440/1440.
Vérifications des 96 anciennes snapshots : 96/96.
Archives SHA/CRC dans la preuve JSON ; aucun ordre réel.

Durée observée événement à événement : 86399939 ms.
Spread moyen pondéré par durée des événements (bp) : 1.1939703292785138
Seuils : strictement supérieurs aux valeurs indiquées, sans extrapolation à 24:00.

| Seuil bp | Durée cumulée ms | Part du temps couvert | Épisodes positifs | Épisode max ms |
|---|---:|---:|---:|---:|
| >0.1 | 80653439 | 0.93348954 | 11626 | 369700 |
| >0.5 | 75899115 | 0.87846260 | 17075 | 369600 |
| >1.0 | 52679845 | 0.60972086 | 56376 | 62300 |
| >2.0 | 7896127 | 0.09139042 | 60455 | 10910 |

Limite : la lecture SHA-256/CRC ne prouve pas qu'aucun événement manque en amont de l'archive.
