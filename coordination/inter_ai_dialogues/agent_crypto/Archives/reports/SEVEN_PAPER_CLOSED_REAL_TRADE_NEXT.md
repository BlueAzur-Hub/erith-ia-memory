# Seven Heaven — Clôture du cycle LIMIT fictif et ouverture du connecteur réel

**21 octobre 2026 · contrôle de livraison technique.** Aucun achat, vente, transfert ni changement de permission OKX réalisé.

## Pourquoi clôturer le simulateur
Les captures Firefox de l'utilisateur montrent le parcours `PAPER_DRAFT → PAPER_SUBMITTED → PAPER_ACCEPTED`, mais le cycle comportait trop de boutons visibles en permanence, la saisie obligatoire de `SIMULER` et un délai artificiel. Le bouton « Refuser fictivement » était visible après acceptation, alors que **le refus est seulement possible avant l'acceptation** ; après acceptation, c'est l'annulation du restant qui convient. Ces incohérences ergonomiques ont rendu la recette pénible et détourné le travail du véritable Trader.

## Dernière livraison PAPER
- [PR #556](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/556), fusionnée sur `main`, commit [e93a034c](https://github.com/BlueAzur-Hub/erith-ia-memory/commit/e93a034c2d9aefe6c905c40367ebf959106cb17b).
- Trois fichiers modifiés dans `public/agent_crypto_erith_ia/trader/` : `trader-paper-decision-view.js`, `trader-paper-decision-core.js`, `test-paper-decision.cjs` (noms stables sans suffixes).
- UI du ticket existant : une section de simulation compacte ; **uniquement les boutons valides pour l'état courant** ; « Refuser (avant acceptation) » disparaît dès acceptation, « Annuler (après acceptation) » apparaît alors ; le champ de remplissage partiel n'apparaît qu'après acceptation.
- Aucune saisie répétée `SIMULER` : un clic explicite de soumission fictive fournit au moteur ce marqueur **interne**, sans aucune requête réseau. Plus d'expiration arbitraire de deux minutes après préparation pour un clic fictif.
- Possibilité d'abandonner un brouillon PAPER. Les états et données fictives restent en mémoire uniquement, sans clé ni transport d'ordre.
- Invariant corrigé : un état inconnu avec des CT déjà remplis fictivement ne peut pas être réconcilié en **rejet intégral** ; l'annulation conserve la partie déjà exécutée fictivement.
- CI PR : trois workflows verts (Trader Current, lightweight Pages, incremental patch). Un nouveau test vérifie l'absence d'API Trade, la visibilité contextuelle, le clic volontaire sans saisie, l'attente humaine et la préservation d'un fill partiel.

## Statut de preuve
- **Code intégré et CI réussie** ; la dernière interface PR #556 n'est PAS encore attestée par capture Firefox. Ne pas prétendre que la recette navigateur est effectuée.
- **Décision de produit** : geler le développement fonctionnel du simulateur, hormis éventuelle régression bloquante. Ne pas imposer de nouveau marathon de clics à l'utilisateur.
- Bridge R25 / 1.9.19, Backend 1.4.6, Market Core 38.15.11 conservés. Les résultats PAPER n'ont pas qualité d'ordres OKX.

## Nouveau chantier prioritaire : ordre réel OKX
- [Issue #557](https://github.com/BlueAzur-Hub/erith-ia-memory/issues/557) : contrat technique pour Bridge Trade distinct du compte READ, prévalidation CT-USDC à prix exact, double confirmation humaine réelle, status persistent, fills partiels, annulation et rapprochement après timeout sans réessai automatique.
- Source officielle [OKX API V5](https://www.okx.com/docs-v5/en/) : permission Trade pour `POST /api/v5/trade/order`, `tdMode=cash`, `ordType=limit`; `GET /api/v5/trade/order` pour le suivi ; `POST /api/v5/trade/cancel-order` pour demander l'annulation.
- **Attention** : `clOrdId` n'est pas un garant d'idempotence historique chez OKX ; son unicité serveur concerne les ordres encore ouverts. Conserver une unicité locale forte et rapprocher les ordres incertains avant tout nouvel envoi.
- Le futur mode réel doit être **fermé par défaut**, sans déclenchement par le Radar/Atlas, et jamais activé sans clé Trade volontaire, audit de sécurité et validation humaine explicite. Aucune activation de Trade n'est faite ici.

**POINT D'ARRÊT :** PR #556 livrée ; simulation en gel fonctionnel. Le développement opérationnel du connecteur réel commence avec l'issue #557, dans une PR indépendante ; ne pas ajouter de nouvelles simulations au ticket existant.
