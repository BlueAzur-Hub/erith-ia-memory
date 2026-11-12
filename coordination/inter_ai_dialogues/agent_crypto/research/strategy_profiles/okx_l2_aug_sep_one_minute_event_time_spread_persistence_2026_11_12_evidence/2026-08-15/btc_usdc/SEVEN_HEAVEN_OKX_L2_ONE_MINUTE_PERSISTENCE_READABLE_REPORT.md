# Seven Heaven — Une minute et persistance en temps d'événements OKX L2

Instrument : BTC-USDC, journée UTC 2026-08-15.
Statut : full_archive_replayed_one_minute_with_event_time_persistence
Relevés minute : 1440/1440.
Vérifications des 96 anciennes snapshots : 96/96.
Archives SHA/CRC dans la preuve JSON ; aucun ordre réel.

Durée observée événement à événement : 86396511 ms.
Spread moyen pondéré par durée des événements (bp) : 0.09501680439872943
Seuils : strictement supérieurs aux valeurs indiquées, sans extrapolation à 24:00.

| Seuil bp | Durée cumulée ms | Part du temps couvert | Épisodes positifs | Épisode max ms |
|---|---:|---:|---:|---:|
| >0.1 | 21796675 | 0.25228652 | 6276 | 360830 |
| >0.5 | 3164343 | 0.03662582 | 3956 | 73260 |
| >1.0 | 56040 | 0.00064864 | 844 | 1040 |
| >2.0 | 200 | 0.00000231 | 19 | 20 |

Limite : la lecture SHA-256/CRC ne prouve pas qu'aucun événement manque en amont de l'archive.
