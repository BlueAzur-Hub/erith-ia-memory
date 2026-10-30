# Agent-Crypto — Build 28.3.18 — Version Manifest Separation Lock

## Mission

Séparer l’historique des Builds du manifeste actif `version.json`, sans modification fonctionnelle volontaire de l’application.

## Base

- Base exacte : Build 28.3.17 — Human Code Architecture Foundation Lock.
- La copie locale 28.3.17 a été comparée aux blobs GitHub publics avant modification.
- `app.js`, `index.html`, `style.css` et `version.json` correspondaient aux fichiers publics 28.3.17.

## Modification

### `version.json`

- avant : 1723 lignes ;
- après : 53 lignes ;
- 72 clés de premier niveau avant ;
- 8 clés de premier niveau après.

Clés conservées pour cette étape :

- `schema`
- `release`
- `build`
- `asset_token`
- `published_at`
- `assets`
- `registries`
- `coherence_contract`

Le contrôleur actuel lit uniquement les informations de Build/token (et leurs alias de compatibilité). `assets`, `registries` et `coherence_contract` restent volontairement en place dans cette Build afin de ne pas mélanger la séparation de configuration avec l’extraction historique.

### `build_history.md`

Nouveau fichier documentaire, en minuscules, placé à la racine du projet public :

`public/agent_crypto_erith_ia/build_history.md`

Il reçoit 64 sections historiques retirées du manifeste. Les valeurs ont été conservées exactement et vérifiées par relecture JSON de chaque bloc.

## Préservation stricte

Aucune nouvelle fonctionnalité.

Après neutralisation mécanique de l’identité 28.3.18 → 28.3.17 :

- `web/app.js` redevient exactement la 28.3.17 ;
- `web/index.html` redevient exactement la 28.3.17 ;
- `web/style.css` redevient exactement la 28.3.17.

Le moteur de version n’est pas réécrit. Seules les valeurs d’identité de publication passent à 28.3.18 conformément au mécanisme actuel validé.

## Vérification ciblée

21 contrôles ciblés : 21 réussis, 0 échec.

Ils couvrent notamment :

- syntaxe JavaScript ;
- validité JSON ;
- équivalence app/index/style après neutralisation de l’identité ;
- Build/token uniques dans index/app/style ;
- lecture du manifeste par le contrôleur ;
- présence exacte du fichier `build_history.md` en minuscules ;
- présence des 64 sections déplacées ;
- conservation exacte de chacune des 64 valeurs JSON ;
- absence des strates historiques dans le nouveau manifeste ;
- réduction 1723 → 53 lignes.

## Limite de validation

Cette Build n’introduit aucun changement de comportement volontaire, mais la validation finale du cycle de publication reste le test réel Firefox après mise en ligne : détection du Build 28.3.18, installation, confirmation puis état courant.

## Fichiers à publier

1. `public/agent_crypto_erith_ia/README.md`
2. `public/agent_crypto_erith_ia/build_history.md`
3. `public/agent_crypto_erith_ia/web/app.js`
4. `public/agent_crypto_erith_ia/web/index.html`
5. `public/agent_crypto_erith_ia/web/style.css`
6. `public/agent_crypto_erith_ia/web/version.json`

## Commit proposé

`refactor agent-crypto build 28.3.18 separate version manifest from build history`
