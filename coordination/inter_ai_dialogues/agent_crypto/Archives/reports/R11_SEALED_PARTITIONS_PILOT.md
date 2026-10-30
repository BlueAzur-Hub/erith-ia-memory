# Seven Heaven · R11 — prototype de partitions scellées

Date : 08/10/2026. Statut : **pilote hors production**. R10.1 est validée dans Firefox ; ce chantier ne remplace aucun lecteur ni collecte.

## Pourquoi

R8 utilise un R2 immuable + des deltas gzip immuables, plafonnés à **100**, tandis que R9 recalcule à chaque collecte ses 21 blocs complets. Conserver chaque génération de bloc peut grossir le dépôt à long terme. Il faut une preuve de reconstruction et de continuité avant tout changement du flux existant.

## Stratégie testée

- 24h / 5 min : blocs scellés par **jour UTC**.
- 7j / 1 h : blocs scellés par **semaine UTC (lundi)**.
- 30j / 4 h : blocs scellés par **mois UTC**.
- Une partition n'est scellée que si sa dernière bougie clôt la période **et** si l'instant de référence vérifié est après la clôture ; aucune chandelle manquante n'est inventée.
- Les blocs gzip portent un SHA-256 complet et un nom content-addressed. En cas de collision avec un contenu différent, arrêt.
- Les périodes non scellées ne sont **pas publiées** comme blocs immuables : seul un résumé/digest est proposé ; leurs données restent dans les sources R8/R9.
- Reconstruction : concaténer les blocs scellés vérifiés + les lignes pending relues depuis R8, comparer **les 8 valeurs de chaque chandelle** à la source vérifiée, valider la chronologie sans trous/doublons et les bornes de chaque série.

## Commandes sur la branche principale (lecture seule)

Depuis la racine du dépôt :

```sh
python public/agent_crypto_erith_ia/tools/build_historical_partitions_r11.py --self-test
python public/agent_crypto_erith_ia/tools/build_historical_partitions_r11.py --plan
python public/agent_crypto_erith_ia/tools/build_historical_partitions_r11.py --build --target /tmp/partitions_r11
python public/agent_crypto_erith_ia/tools/build_historical_partitions_r11.py --verify --target /tmp/partitions_r11
```

Le workflow indépendant `.github/workflows/agent-crypto-historical-partitions-r11.yml` exécute ces tests sur le dépôt, **en lecture seule** : permission `contents: read`, cible temporaire du runner, aucun push, aucune migration, aucun déploiement de nouveaux blocs. Il contrôle également le replay de R8, la vérification du catalogue R9 et les tests Node des lecteurs historiques déjà en place.

## Protections et prochaine étape

Ne pas modifier R10, R2, R4, R8, R9, Reader Firefox, Graphique Ligne/Bougies, Trader, Market Core 38.15.11, Administrator 40.6.624, Bridge, Backend, IndexedDB. Ne pas relever la borne de 100 deltas.

**La publication/connexion automatique de R11 doit faire l'objet d'une validation séparée**, après preuve CI et examen du budget de stockage. L'automatisation horaire R10 `schedule: 17 * * * *` reste un contrôle indépendant non démontré par les succès `push`.
