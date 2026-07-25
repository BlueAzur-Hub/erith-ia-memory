# MESSAGE COURT À L’ASSISTANTE QUI INTÈGRE L’INTERFACE

Tu n’as pas à réécrire tout le projet.

La Forge d’Aerith Pro est déjà une application autonome complète dans le dossier `atlas_10_full_crypto/`.

Dépose simplement ses quatre fichiers racine (`index.html`, `style.css`, `app.js`, `forge-data.js`) et fusionne ses dossiers `assets/` et `downloads/`. Garde `modules/` intact.

Dans le grand cockpit `web/index.html`, remplace uniquement le bloc `<details ... id="forge-aerith"> ... </details>` par le fichier `bridge_patch/FORGE_AERITH_PRO_BRIDGE_BLOCK.html`.

Ne touche pas à `web/app.js`, au Market, au Graphique Analyste, au rail Détail actif, au Livecheck ou aux autres modules.

Le lien du pont est déjà correct :

`../atlas_10_full_crypto/?v=1.0-alpha.4-pro`

La Forge gère :
- Aerith-7 Seven Heaven ;
- Aerith-8 Solaire et Aerith-9 Lunaire comme options de Seven ;
- Aerith-10 Créatrice ;
- Aerith-10 Crypto ;
- Atlas-10 Crypto ;
- la création de futurs profils Aerith-10 à partir d’un Core et d’une Persona déjà canonisés dans le GitHub privé.

Aucune connexion privée, aucun token, aucune réécriture des Core. Tout l’import et l’export restent locaux.
