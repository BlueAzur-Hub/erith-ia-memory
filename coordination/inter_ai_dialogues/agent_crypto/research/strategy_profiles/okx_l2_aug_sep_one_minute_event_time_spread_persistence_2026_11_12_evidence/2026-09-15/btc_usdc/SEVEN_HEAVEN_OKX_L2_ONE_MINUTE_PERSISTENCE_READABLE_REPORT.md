# Seven Heaven — Une minute et persistance en temps d'événements OKX L2

Instrument : BTC-USDC, journée UTC 2026-09-15.
Statut : full_archive_replayed_one_minute_with_event_time_persistence
Relevés minute : 1440/1440.
Vérifications des 96 anciennes snapshots : 96/96.
Archives SHA/CRC dans la preuve JSON ; aucun ordre réel.

Durée observée événement à événement : 86399986 ms.
Spread moyen pondéré par durée des événements (bp) : 0.39343530882757954
Seuils : strictement supérieurs aux valeurs indiquées, sans extrapolation à 24:00.

| Seuil bp | Durée cumulée ms | Part du temps couvert | Épisodes positifs | Épisode max ms |
|---|---:|---:|---:|---:|
| >0.1 | 42939370 | 0.49698353 | 37087 | 112680 |
| >0.5 | 23766329 | 0.27507330 | 56171 | 50760 |
| >1.0 | 10759010 | 0.12452560 | 71619 | 30680 |
| >2.0 | 3406384 | 0.03942575 | 39083 | 10800 |

Limite : la lecture SHA-256/CRC ne prouve pas qu'aucun événement manque en amont de l'archive.
