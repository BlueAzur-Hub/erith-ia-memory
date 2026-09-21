# HANDOFF — Operator / Yohan · runtime 40.6.335

## Doctrine relue dans le Fil Crypto
- Operator **n'est pas une troisième lignée de build**.
- Runtime visible = **Administrator 40.6.335**.
- Market Core = **38.15.11**.
- Profil Yohan = couche de présentation / workspace, sans privilège Administrator.
- Le package final 40.6.121 avait déjà abandonné le masquage Projects/Portfolio et le forçage d'une vue réduite.
- L'authentification distante Yohan reste un chantier séparé : aucune clé, aucun secret, aucun mot de passe public, aucun droit réel dans GitHub Pages.

## État maître
- Administrator 40.6.335 = **PASS Firefox opérateur**.
- Help Layer V2 = PASS visuel.
- Période graphique 24h = persistance confirmée après reload.
- Entrée immutable maître ajoutée : `administrator/index-40.6.335.html`.
- Entrée Operator générique maître synchronisée : `operator/index-40.6.335.html`.
- Commit maître : `b4c5145efd56ed1e8c5836a31f2fa0ada2a93efb`.

## Destination Yohan
Dépôt cible :
`BlueAzur-Hub/agent-crypto-operator`

État actuel vérifié avant livraison :
- dernier commit public : `c1aa234e4549a82024ed9c19576250d446179aae`
- livraison active : **40.6.121**
- runtime partagé : Administrator 40.6.121
- profil Yohan non destructif
- aucune autorisation Administrator
- authentification Bridge séparée

## Livraison préparée 40.6.335
Fichiers à porter dans le dépôt Operator :
- `public/agent_crypto_erith_ia/operator/build.json`
- `public/agent_crypto_erith_ia/operator/index.html`
- `public/agent_crypto_erith_ia/operator/index-40.6.335.html`
- `public/agent_crypto_erith_ia/administrator/yohan.html`
- `public/agent_crypto_erith_ia/administrator/js/yohan-operator-profile.js`

Contrat :
- pointe vers le runtime canonique maître **40.6.335** ;
- conserve le profil Yohan ;
- ne masque pas Projects/Portfolio ;
- ne force pas une vue réduite ;
- n'accorde aucune session Administrator ;
- n'accorde aucun ordre réel ni wallet ;
- n'embarque aucun secret ;
- Help Layer V2 disponible via le runtime maître.

## Limitation de publication
Le connecteur GitHub courant autorise l'écriture sur `erith-ia-memory` mais répond **403 Resource not accessible by integration** sur `BlueAzur-Hub/agent-crypto-operator` pour create branch et update file.

Donc :
- le runtime maître / Operator générique 40.6.335 est publié ;
- le paquet Yohan 40.6.335 est préparé et archivé ;
- le dépôt séparé Yohan reste **40.6.121** tant que le paquet n'est pas importé dans ce dépôt.

Ne jamais déclarer le dépôt Yohan 40.6.335 publié avant preuve GitHub réelle.

## Test terrain après import
1. ouvrir `/operator/index-40.6.335.html` du dépôt Yohan ;
2. vérifier que le badge runtime affiche **Build 40.6.335 · Administrator** ;
3. vérifier Help Layer V2 ;
4. vérifier Projects/Portfolio visibles comme dans le runtime partagé ;
5. vérifier qu'aucun droit Administrator n'est accordé ;
6. vérifier qu'aucun secret / wallet / ordre réel n'existe ;
7. vérifier Aether et Graphique 24h sans régression.

STOP après preuve.
