# AUDIT — Forge d’Aerith V1.0-alpha.2 → V1.0-alpha.3

## Constat du site

La capture affichait encore V1.0-alpha.1 alors que le dépôt `main` contenait V1.0-alpha.2.
La V1.0-alpha.3 ajoute une empreinte de build et un diagnostic visible en cas de mélange HTML / JavaScript mis en cache.

## Corrections de code

- libellé Flower Girls aligné sur la limite réelle de trois sélections au total ;
- détection des sources privées corrigée pour les noms répétés comme `README.md` ;
- imports de dossiers avec conservation du chemin relatif ;
- doublons d’import ignorés ;
- collisions de noms empêchées dans le ZIP ;
- manifeste enrichi avec le statut réel des fichiers ;
- audit de complétude avant export ;
- arbre copié identique au paquet final ;
- choix, profil, étape et routage persistés localement ;
- bouton de réinitialisation restauré ;
- aucun Core ou Persona privé inventé.
