# Seven Heaven — Une minute et persistance en temps d'événements OKX L2

Instrument : ETH-USDC, journée UTC 2026-10-15.
Statut : full_archive_replayed_one_minute_with_event_time_persistence
Relevés minute : 1440/1440.
Vérifications des 96 anciennes snapshots : 96/96.
Archives SHA/CRC dans la preuve JSON ; aucun ordre réel.

Durée observée événement à événement : 86399965 ms.
Spread moyen pondéré par durée des événements (bp) : 0.293646714060778
Seuils : strictement supérieurs aux valeurs indiquées, sans extrapolation à 24:00.

| Seuil bp | Durée cumulée ms | Part du temps couvert | Épisodes positifs | Épisode max ms |
|---|---:|---:|---:|---:|
| >0.1 | 23683788 | 0.27411803 | 147981 | 107530 |
| >0.5 | 14954123 | 0.17308020 | 142240 | 10740 |
| >1.0 | 9471416 | 0.10962291 | 113351 | 7580 |
| >2.0 | 2406583 | 0.02785398 | 39653 | 2320 |

Limite : la lecture SHA-256/CRC ne prouve pas qu'aucun événement manque en amont de l'archive.
