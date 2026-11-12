# Seven Heaven — Une minute et persistance en temps d'événements OKX L2

Instrument : ETH-USDC, journée UTC 2026-08-15.
Statut : full_archive_replayed_one_minute_with_event_time_persistence
Relevés minute : 1440/1440.
Vérifications des 96 anciennes snapshots : 96/96.
Archives SHA/CRC dans la preuve JSON ; aucun ordre réel.

Durée observée événement à événement : 86399775 ms.
Spread moyen pondéré par durée des événements (bp) : 0.9006069028994581
Seuils : strictement supérieurs aux valeurs indiquées, sans extrapolation à 24:00.

| Seuil bp | Durée cumulée ms | Part du temps couvert | Épisodes positifs | Épisode max ms |
|---|---:|---:|---:|---:|
| >0.1 | 74351973 | 0.86055748 | 1485 | 2158792 |
| >0.5 | 66475235 | 0.76939130 | 2257 | 1122590 |
| >1.0 | 44757446 | 0.51802734 | 4883 | 466590 |
| >2.0 | 126590 | 0.00146517 | 1157 | 12930 |

Limite : la lecture SHA-256/CRC ne prouve pas qu'aucun événement manque en amont de l'archive.
