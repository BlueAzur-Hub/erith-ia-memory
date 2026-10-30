# Agent-Crypto — Build 28.3.17 — Human Code Architecture Foundation Lock

## Mission

Refactoring structurel de la Build 28.3.16 validée, sans nouvelle fonctionnalité et sans changement volontaire de comportement, de données ou d’interface.

## Ce qui a été restructuré

- `index.html` : grands blocs humains suivant l’ordre visuel ; inventaire des 868 identifiants HTML conservé et structure des 3 685 éléments conservée.
- `style.css` : règles rangées par zone fonctionnelle au lieu de l’historique des Builds ; anciens commentaires chronologiques retirés ; une seule identité active 28.3.17 conservée pour le contrôleur actuel.
- `app.js` : fonctions regroupées par responsabilité ; anciennes strates d’override V96/V97, R12/R13 et V56/V57 consolidées ; aucune réassignation top-level de fonction restante.
- Version Control : 36 corps de fonctions du contrôleur restauré sont octet pour octet identiques à la 28.3.16 ; toutes les fonctions `atlasVersion*` sont maintenant regroupées dans `14 — VERSION CONTROL — PROTECTED CORE`.
- `version.json` : contrat et historique fonctionnel conservés ; seule l’identité active passe à 28.3.17. Sa simplification sera une mission distincte afin de ne pas mélanger refactoring et changement de protocole.

## Preuves de non-régression

- 421/421 contrôles automatisés exécutés et réussis.
- CSS : comparaison Build 28.3.16 ↔ 28.3.17 sur 3 684 éléments DOM à 7 largeurs (1440, 1280, 1100, 900, 760, 620, 390 px) : 0 différence calculée de style/géométrie après stabilisation.
- Versionnage navigateur injecté : 15/15, y compris Build supérieur, refus du même Build avec token différent, réparation locale historique et refus d’un manifeste inférieur.
- Node `--check` et JSON : OK.
- IndexedDB natif Firefox : non exécuté dans le conteneur et non compté. La validation finale reste le test public Firefox après publication.

## Important

La Build 28.3.16 reste le rollback absolu. La 28.3.17 ne doit être publiée que comme un ensemble cohérent des cinq fichiers indiqués dans `UPLOAD_FILES_BUILD_28_3_17.txt`.
