# Agent-Crypto · Operator 40.6.99

Cette livraison donne à Operator une entrée stable et directe sans dupliquer le runtime Administrator.

## Entrée

- Entrée canonique Operator : `public/agent_crypto_erith_ia/operator/index-40.6.99.html`
- Entrée courante Operator : `public/agent_crypto_erith_ia/operator/index.html`
- Runtime partagé : `../administrator/index-40.6.99.html?view=intermediate`
- Market Core : `38.15.11`

## Bridge

Le runtime partagé charge déjà `administrator/js/aether-operator-bridge-406002.js`.

Ce Bridge est un pont d'interface/opérateur : il réutilise le Livecheck canonique au cold boot, permet le retour vers la ligne opérateur native depuis VEILLE et n'ajoute aucun propriétaire réseau, timer récurrent, observer, stockage, état de trading ou algorithme de marché.

## Autorité

Operator reste un rôle de présentation et de workspace. `?view=intermediate` n'est pas une authentification et n'élève pas l'autorité.

Ordre de précédence :

1. session Administrator locale valide → Administrator ;
2. sinon `?view=intermediate` → Operator ;
3. sinon → Public.

Operator ne reçoit pas de Bridge write, d'écriture fichiers/GitHub, de wallet, d'ordre réel ni d'API privée d'exchange.

## Version

Cette livraison reste sur le runtime validé `40.6.99`. Elle ne crée volontairement pas `40.6.100` : aucun changement du moteur partagé n'est nécessaire pour donner à Operator son entrée et son contrat Bridge propres.

## Canonical delivery commit

`21dcca7b6784325b960edccddc69cd25cda45025`
