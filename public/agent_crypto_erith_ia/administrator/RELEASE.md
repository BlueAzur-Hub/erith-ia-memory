# Agent-Crypto — Recovery Functional Residency

Build **40.6.400** · parent **40.6.399** · Market Core **38.15.11**.

40.6.399 reste gelée sur Firefox : Auto Reader ~43 s, Strategy Evidence ~238/264 s, runtimes secondaires prêts ~545 s. Strategy A n'est pas KO : AUTO A ACTIF / ATTENTE MOUVEMENT RENTABLE ; Cost Gate normal. Aucun seuil métier modifié.

- 10 modules Strategy support existants deviennent Strategy Core prioritaire.
- Aucun autostart nouveau.
- Plus d'attente de silence opérateur dans le post-boot.
- Strategy Evidence : explicit-demand-only, aucun background post-boot.
- Auto Reader : présentation hydratée au boot ; Shared/GitHub Memory restent lazy.

Terrain Firefox : PENDING. Régression = STOP.
