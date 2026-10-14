# Seven Heaven — Agent-Crypto uniquement, Coffre indépendant

**Périmètre canonique imposé par le propriétaire :**
`public/agent_crypto_erith_ia/`

Aucun autre projet du dépôt `erith-ia-memory` n'entre dans le nouvel artefact Pages.
Cela exclut notamment `public/lego/`, `public/liora-jardin-reves-doux/`, les fichiers HTML/CSS/JS de la racine et tout autre répertoire `public/` frère.

## Mesure de correction du 14 octobre 2026
- Ancien candidat trop large : **1 393 fichiers / 142 424 617 octets** comptés dans l'arbre Git (avant les transformations HTML).
- **66 218 153 octets** concernaient **117 fichiers hors du répertoire Agent-Crypto**. Cette erreur de périmètre est corrigée.
- Sélection Agent-Crypto seule, hors archives : **1 276 fichiers / 76 206 464 octets** comptés dans l'arbre Git de la branche ; ce n'est pas encore une mesure d'artefact Pages final construit.
- Source canonique inchangée ; aucune donnée ni image supprimée de Git.

## Constructeur
- `tools/build-runtime-pages.py` sélectionne exclusivement `public/agent_crypto_erith_ia/`, par garde stricte.
- Il **exclut** le dossier `data/`, les ZIP/GZIP/JSONL, les copies historiques `administrator/index-*.html`, `downloads/` et `releases/`.
- Le constructeur rejette toute sortie extérieure au répertoire cible, sauf le contrôle GitHub Pages nécessaire `.nojekyll`.
- Le rapport est interne : `public/agent_crypto_erith_ia/runtime-publication.json`.
- Les images originales de `assets/images` (hors périmètre Pages) restent dans le dépôt Git et sont lues à la demande depuis GitHub Raw.
- Le routeur `public/agent_crypto_erith_ia/web/vault-data-router.js` envoie exclusivement les `fetch GET/HEAD` de données publiques `data/**` vers GitHub Raw. Les ordres privés OKX ne sont pas concernés.

## Routine légère et activation
- Les PR exécutent des tests unitaires et des accès Raw/CORS sans construire le site complet ; un test dans un mini-dépôt Git prouve qu'aucune ressource d'un autre projet n'est empaquetée.
- Les collectes qui modifient seulement `public/agent_crypto_erith_ia/data/**` ne déclenchent pas le futur pipeline Pages.
- Avant toute publication : `Settings > Pages > Source = GitHub Actions` **et** variable de dépôt `AGENT_CRYPTO_RUNTIME_PAGES_ENABLED=true`. Le second verrou est maintenu volontairement afin de ne pas construire/déployer le site avant autorisation.
- Une mise à jour réelle de l'Interface impliquera encore un artefact Pages complet du seul périmètre Agent-Crypto, **pas** un patch Pages incrémental de 160 Ko.

## Avertissement essentiel sur le partage du domaine Pages
GitHub Pages pour ce dépôt est **un site unique**. Publier uniquement Agent-Crypto via GitHub Actions rendra les autres pages de `erith-ia-memory` non disponibles via ce même site Pages, même si leurs fichiers demeurent dans Git.
Ne changer ni la source Pages ni fusionner la PR sans accord sur ce résultat ou plan indépendant pour les autres projets. Le site actif reste en l'état.

## Recette avant fusion
Vérifier la publication cible et les dépendances par Firefox (LT AUTO/AUBE/JOUR/SOIR/NUIT/LUNE/RND, F11, BTC/CT/Q, carnet/profondeur, historicité et SHA, éventuels XHR ou liens directs). Conserver Market Core 38.15.11 et Trader 40.6.640. Aucune exécution réelle d'ordre ni transfert de secret. Prévoir retour arrière.
