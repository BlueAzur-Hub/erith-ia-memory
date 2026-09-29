# Agent-Crypto 40.6.472 — OKX OUTCOME COVERAGE TRUTH

40.6.471 a validé la baseline durable :
- 144/144 COST WAIT;
- 16/16 OKX POTENTIAL;
- REFERENCE_REPLAY_READY;
- T+5 : 0/5 certifiés au-dessus du plancher;
- T+15 : 0/3;
- T+60 : 0/7.

Le problème restant est la couverture incomplète des horizons.

## 40.6.472

Nouveau panneau read-only après l'audit .471.

Pour chaque cycle et horizon, classement strict :
- CERTIFIED_COVERED : endpoint certifié dans la tolérance 150 s et MFE >= 0,6109 %;
- CERTIFIED_BELOW : endpoint certifié et MFE < 0,6109 %;
- OBSERVED_CROSS_PARTIAL : un échantillon durable avant l'horizon a effectivement dépassé le plancher, mais l'endpoint n'est pas certifié;
- PARTIAL_NO_CROSS : des échantillons existent mais aucun franchissement observé; conclusion = INCONNU;
- ARCHIVE_END_NO_SAMPLE : archive terminée avant l'horizon;
- TARGET_GAP_NO_SAMPLE : aucun échantillon durable disponible avant l'horizon.

Aucune interpolation. Tolérance 150 s inchangée. Aucun prix inventé. Aucun snapshot OKX live. Aucun seuil ou gate modifié.
