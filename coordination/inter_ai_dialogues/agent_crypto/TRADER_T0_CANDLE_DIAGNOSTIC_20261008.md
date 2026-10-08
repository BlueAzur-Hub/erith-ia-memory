# Trader — T0 / diagnostic détaillé des bougies — 08 octobre 2026

Livraison en deux commits : correction du diagnostic T0 `fa45de1` et restauration du contrat exact de la page Trader `f327dde`. La seconde correction répond au test CI `mirror_loaded` qui exige `src="./trader-runtime-mirror.js"` sans argument de cache.

**Changement métier** : aucun. Le module T0 affiche désormais séparément la paire attendue et chargée, le nombre de bougies, OHLCV invalides, horodatages non croissants, ruptures temporelles, bougies non confirmées (informatives), dernière ouverture, réception, âge et seuil (2,2 fois l'intervalle). Les refus spécifiques remplacent une phrase globale. `candleOk` conserve strictement ses conditions initiales. G1 est `EVIDENCE_REQUIRED` tant que Strategy A ne le change pas.

**Entrypoint** : `trading-desk.html` garde son script original `trader-runtime-mirror.js` sans query pour satisfaire le contrat `Trader Current`. Le miroir utilise un argument de cache seulement pour le module `trader-paper-t0.js` afin de rafraîchir l'interface en cas de rechargement complet de Firefox.

**Tests internes** : 13/13 assertions ciblées réussies sur la logique de diagnostic, mise en forme et garde-fous, avec données horodatées de test. `Trader Current` doit être revalidé après la restauration de l'entrypoint. Historique R9 inchangé.

**Protections** : aucun moteur Bougies/Carnet, Bridge, Backend, Market Core 38.15.11, R9, gouverneur, stratégie, exécution ou stockage modifié. Build Trader/Administrator 40.6.624 intact.

**Opérateur Firefox** : une fois CI/Pages SUCCESS, recharge forcée de la page si nécessaire (`Ctrl+Maj+R`), ouvre le dossier Paper et clique une fois sur `Capturer T0`. La nouvelle section « DIAGNOSTIC BOUGIES » nomme la condition exacte plutôt que masquer le motif.
