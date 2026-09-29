# Agent-Crypto 40.6.457 — PRIVATE SOURCE MOUNT CONTRACT HARDENING

## Objet unique
Fermer le cas résiduel où le loader pouvait continuer après un `mount() === false`, et supprimer le double appel de montage du propriétaire Source Truth déjà chargé.

## Cause prouvée
Dans `js/views/private-source-demand-loader.js`, le contrat 40.6.456 vérifiait seulement la présence de l'API `mount`, puis appelait `owner.mount()` sans exploiter son booléen. Le propriétaire canonique `private-backend-sources.js` renvoie pourtant explicitement `false` si son host Backend n'est pas montable.

Le chemin `ensure()` appelait aussi `mount()` une première fois avant `sourceOwnerReady()`, qui le rappelait immédiatement.

## Correction
READY exige maintenant :
1. API propriétaire disponible ;
2. `mount() === true` ;
3. Freshness Guard actif ;
4. downstream borné = `ready`.

`mount() === false` ou exception :
- `state=error` ;
- `ensure()=false` ;
- aucun downstream ;
- aucun événement `erith:private-source-runtime-loaded`.

Le double pre-mount est supprimé : une demande effectue une seule tentative de montage du propriétaire.

## Observabilité
`snapshot()` distingue désormais :
- `source_owner_api_ready` ;
- `source_owner_mounted` ;
- `source_owner_ready` ;
- `freshness_guard_ready` ;
- `downstream_state`.

## Protégé
Market Core 38.15.11 · Source Truth métier · Strategy · Oracle · Aether · Execution Cost · Risk · Paper.

Aucun nouveau timer, observer, storage owner, endpoint métier ou ordre réel.
