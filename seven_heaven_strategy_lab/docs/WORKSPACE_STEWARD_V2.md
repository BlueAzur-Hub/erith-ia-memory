# Workspace Steward V2 — 17 novembre 2026

Le workspace canonique est une sortie reconstruite par Seven. Les clics de l’utilisateur servent à explorer et valider l’ergonomie, pas à constituer la base scientifique.

- Si `CANONICAL_REBUILD_MANIFEST.json` existe, le serveur normal passe en mode exploration.
- `/api/run`, `/api/compare` et le rejeu StrategySpec calculent toujours, mais ne créent aucun nouveau JSON de preuve.
- Les sauvegardes manuelles de profils et StrategySpecs sont désactivées.
- `tools/workspace_rebuild_v1.py --execute` démarre le serveur avec `SEVEN_LAB_WORKSPACE_WRITE_MODE=canonical` et reste la voie autorisée pour reconstruire les preuves.
- Les sources vérifiées restent protégées byte-for-byte.

Cette séparation **exploration ≠ preuve canonique** évite de polluer le Coffre avec des essais de développement.
