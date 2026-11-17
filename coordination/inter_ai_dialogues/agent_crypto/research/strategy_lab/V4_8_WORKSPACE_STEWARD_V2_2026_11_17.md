# Seven Heaven Strategy Lab — V4.8 Workspace Steward V2 — 2026-11-17

## Décision

À partir de cette étape, le `workspace/` canonique est une **sortie reconstruite par Seven**, et non une collection d'essais créés manuellement par le propriétaire.

Règle centrale :

> **exploration ≠ preuve canonique**

Les clics utilisateur servent à explorer le Lab et à réceptionner l'ergonomie. Ils ne doivent plus polluer la base scientifique utilisée pour les comparaisons futures.

## Parent

Parent direct : `SEVEN_HEAVEN_STRATEGY_LAB_V4_8_AUDIT_FIXED_HISTORICAL_VAULT_WORKSPACE_REBUILD_V1_DEV.zip`.

Le moteur PAPER canonique reste inchangé :

`src/engine.py` SHA-256 : `f4de4a9cb8dbfd17a665785b6b06cfff3473039624457e721d3f3fd9e2aeb7c2`.

## Workspace Steward V2

Quand `CANONICAL_REBUILD_MANIFEST.json` est présent :

- le serveur normal passe en **mode exploration** ;
- `/api/run`, `/api/compare` et le rejeu StrategySpec calculent normalement mais ne créent plus de nouveaux fichiers de preuve ;
- les sauvegardes manuelles de profils et de StrategySpecs sont désactivées ;
- le Coffre affiche `WORKSPACE CANONIQUE · GÉRÉ PAR SEVEN` ;
- les expériences canoniques restent rechargeables ;
- `tools/workspace_rebuild_v1.py --execute` est la seule voie autorisée pour reconstruire les preuves et démarre le serveur avec `SEVEN_LAB_WORKSPACE_WRITE_MODE=canonical`.

## Workspace canonique V2

Rebuild complet vérifié :

- 43 fichiers source préservés byte-for-byte ;
- 22 sources dans le catalogue local ;
- 12 profils ;
- 12 StrategySpecs ;
- 12 simulations PAPER ;
- 6 comparaisons ;
- Scientific / Research restent éphémères.

Une simulation et une comparaison manuelles ont été exécutées après le rebuild en mode normal : le nombre de fichiers est resté **12 résultats / 6 comparaisons**.

## Recette

- `153 passed, 12 subtests passed` ;
- `node --check web/app.js` : PASS ;
- `node --check web/lab-help-layer.js` : PASS ;
- rebuild du workspace V2 : PASS ;
- sources préservées : PASS ;
- test HTTP mode exploration : PASS ;
- test DOM Chromium injecté avec réponses réelles du serveur : badge géré par Seven, 12 résultats, 6 comparaisons, sauvegardes manuelles désactivées, 0 erreur JavaScript.

La navigation directe de Chromium vers `127.0.0.1` reste bloquée par la politique administrateur de l'environnement de recette ; le DOM est donc testé avec le vrai HTML/CSS/JS et les réponses réelles du serveur local injectées dans le navigateur.

## Finitions UI

Corrections ciblées sans refonte :

- alignement vertical des entrées du Coffre ;
- gestion des libellés longs ;
- alignement des cartes Historical Vault ;
- alignement des avertissements moteur ;
- badge de workspace canonique plus lisible ;
- StrategySpec longs plus stables visuellement.

## Paquets

### DEV

`SEVEN_HEAVEN_STRATEGY_LAB_V4_8_WORKSPACE_STEWARD_V2_DEV.zip`

SHA-256 :

`57114a663ff9880a621b1f11eb46bedffe4951c10e63aef9157c59dc25a6dc4b`

### Workspace canonique

`SEVEN_HEAVEN_STRATEGY_LAB_WORKSPACE_CANONICAL_V2_2026_11_17.zip`

SHA-256 :

`51548e425a3cb4045d9f6537061221978a3b579136e1fb1597915c0e5dd75220`

## Statut

DEV. Réception Firefox Windows du propriétaire encore requise pour cette couche de protection du workspace.

Le prochain chantier scientifique reste Historical Vault / historiques longs / multi-actifs, mais il doit désormais écrire ses résultats de référence **uniquement via le rebuild canonique**.
