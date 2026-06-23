# Night Vault Public Browser Edition

Ce dossier est une édition statique de Night Vault conçue pour être placée dans :

private/night-vault/

Elle conserve l’interface rose / noir / magenta Night Vault, mais retire tout ce qui dépend d’un serveur local ou d’un dépôt privé :

- aucun Python ;
- aucun DPAPI ;
- aucun fichier `.nvault` ;
- aucun token GitHub ;
- aucune synchronisation Git automatique ;
- aucune mémoire personnelle incluse.

## Actions disponibles

- créer des fiches dans le navigateur via LocalStorage ;
- relire, modifier, chercher ou supprimer ces fiches ;
- télécharger une fiche en Markdown ;
- télécharger / importer une archive JSON locale ;
- changer les thèmes et le visualiseur décoratif.

## Important : `private/` n’est pas une protection

Dans un dépôt GitHub **public**, tout ce qui est placé sous `private/night-vault/` est public. Le nom du dossier est une convention d’organisation, pas un verrou de confidentialité.

Ne place jamais dans ce dossier :

- souvenirs personnels réels ;
- exports privés ;
- fichiers `.nvault` ;
- clés ;
- tokens ;
- chemins Windows personnels ;
- contenus que tu ne veux pas rendre publics.

## Export Markdown

Le bouton `📄 Exporter en .md` télécharge le fichier dans le navigateur. Pour le publier volontairement, placer ensuite ce Markdown dans :

private/night-vault/exports/

Puis faire le commit et le push avec Git. L’interface publique ne possède aucun droit d’écriture sur GitHub.

## Déploiement GitHub Pages

1. Copier le contenu de cette archive dans le dépôt `BlueAzur-Hub/erith-ia-memory` en préservant le chemin `private/night-vault/`.
2. Vérifier que GitHub Pages sert bien la branche et le répertoire contenant `private/night-vault/index.html`.
3. Ouvrir l’URL correspondant au chemin `/private/night-vault/`.

Pour une URL Pages plus simple, déplacer plus tard ce dossier vers un chemin dédié de site public, par exemple `public/night-vault/` ou `docs/night-vault/`.
