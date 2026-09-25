# Agent-Crypto · Operator 40.6.407

Operator est synchronisé sur le checkpoint Administrator **40.6.407** avec Market Core **38.15.11**.

## Architecture

- runtime canonique partagé : `../administrator/index-40.6.407.html` ;
- vue Operator : `?view=intermediate` ;
- profil : `yohan` ;
- aucun second moteur ;
- aucun privilège Administrator ajouté ;
- aucun wallet, clé ou ordre réel.

## Contrat hérité de 40.6.407

- Strategy A reste automatique ;
- le statut Strategy n'est plus injecté dans le header ;
- le statut est visible dans Simulation ;
- Simulation n'entraîne pas automatiquement Evidence 28/28 ;
- les 9 Gates gardent leur résumé léger ;
- Evidence complet reste sur demande explicite ;
- REDIVIDER et Market Core 38.15.11 sont préservés.

## Entrées

- `operator/index-40.6.407.html`
- `operator/index.html`

Administrator reste la source canonique. Operator est un miroir de livraison/profil.
