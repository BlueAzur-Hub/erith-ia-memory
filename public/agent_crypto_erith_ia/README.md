# Agent-Crypto @erith.IA — Market Core V2.0-Alpha

**Version publique préparée :** Market Core V2.0-Alpha · Build 28.3.20  
**Build :** 28.3.20  
**Mission :** Two-File Version Control Transition Lock

## Build 28.3.20 — Two-File Version Control Transition Lock

Cette Build part exactement de la 28.3.19 validée sous Firefox.

### Mission unique

Installer le nouveau noyau de versionnage centré sur :

- `web/app.js` → contrôleur et identité locale exécutée ;
- `web/version.json` → identité et intégrité de la publication.

### Transition sûre

La Build 28.3.19 exige encore des marqueurs Build/token dans `index.html` et `style.css` pour accepter une mise à jour.

Ils sont donc conservés **une dernière fois** dans cette 28.3.20, uniquement comme pont de compatibilité entrant.

Le contrôleur 28.3.20, lui, ne les lit plus.

### Nouveau contrôle de publication

`version.json` utilise le schéma `agent_crypto_version_manifest_v2` et contient des empreintes SHA-256 pour :

- `app.js` ;
- `index.html` ;
- `style.css` ;
- `runtime_config.json`.

Le contrôleur vérifie ces empreintes avant de proposer ou d’installer une publication.

Avant le rechargement, il recharge également les URLs canoniques avec `cache: reload` afin de mettre à jour le cache HTTP du navigateur sans dépendre d’un numéro de Build dans le HTML ou le CSS.

### Fichier stable non modifié

`runtime_config.json` est strictement identique à la 28.3.19 et n’a pas besoin d’être réuploadé.

### Étape suivante

Après validation Firefox de la 28.3.20, la Build suivante pourra retirer définitivement les marqueurs Build/token de `index.html` et `style.css`.

À partir de là, une Build de versionnage seule n’aura plus besoin de modifier ces deux fichiers.
