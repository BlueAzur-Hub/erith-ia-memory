# Seven Heaven — CT/USDC : réconciliation du plafond maxBuy en PAPER

**Date : 20 octobre 2026.** Compte OKX privé : lecture seule. Ce rapport est public, volontairement sans solde, identifiant, jeton ni plafond numérique propre au compte.

## Origine
La recette Windows/Firefox R25 (Bridge 1.9.19 + Backend 1.4.6) a établi que les paramètres Spot et l'éligibilité CT-USDC étaient accessibles au propriétaire, mais que le ticket PAPER continuait à proposer une quantité brute calculée uniquement depuis un carnet ancien. Cette quantité pouvait être supérieure au maxBuy du compte, tandis que l'UI disait « solde Trading suffisant ». Un prix archivé peut en outre être vieux de plusieurs heures.

## Correctif
- [PR #551](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/551), fusionnée sur main, commit [389994b6](https://github.com/BlueAzur-Hub/erith-ia-memory/commit/389994b6030e7fd458d6ea56ca659ae4f55eeb0c).
- Seulement trois fichiers JS existants : `trader-paper-decision-core.js`, `trader-paper-decision-view.js`, `test-paper-decision.cjs`.
- `checkSpotOrderGates` vérifie l'identité et la fraîcheur du relevé privé et compare, sans flottants, quantité PAPER, maxBuy en base, lot, minSz, tick et borne de prix ; indique si le carnet est réellement récent.
- `reviewSpotTicketAccount` distingue couverture nominale en devise quote et dépassement du plafond de quantité, avec statut explicite `DEPASSE_PLAFOND_ACHAT`.
- `previewSpotExit` borne la quantité **fictive** au nombre entier de lots au-dessous du maxBuy **lu à un instant donné**. C'est une comparaison illustrative, pas une garantie à l'ancien cours du carnet. Les frais et la poussière sont recalculés pour cette quantité.
- La vue distingue l'étude publique initiale et la version PAPER recalculée ; carnet daté = aucune cotation négociable garantie.
- Pas d'ordre, pas de permission Trade, aucun changement du Bridge R25, du Backend, du Market Core ni de la présentation graphique.

## Validation
- Tests GitHub de la PR : `Agent-Crypto Trader Current`, `lightweight multisite Pages` et `incremental patch` réussis.
- Après fusion, Trader Current réussi : https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/39503926242
- Vérification post-fusion Pages : https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/39503926254
- Nouveau test unitaire : preuve R25 valide, dépassement maxBuy, quantité bornée, mode « archive non récente », absence d'appel d'ordre ; preuve périmée : pas de certification.
- Preuve utilisateur Firefox pour la PR #551 : **EN ATTENTE**. Ne pas annoncer une validation terrain sans capture récente.

## Suite
1. Après succès de Pages, Ctrl+F5, CT Solo, ticket PAPER, cliquer « Vérifier ». Comparer « quantité publique initiale » et « quantité PAPER corrigée ». Le carnet peut rester daté, donc aucun ordre.
2. Pour un futur parcours d'ordre réel, demander un carnet récent, interroger `account/max-size` avec le prix LIMIT envisagé lorsque l'API l'exige, recalculer après rafraîchissement, vérifier les autres filtres puis obtenir une **deuxième confirmation humaine**.
3. Développer séparément le cycle création LIMIT → identifiant unique → statut d'ordre → annulation explicite, d'abord sur des réponses simulées, avec tous les endpoints Trade encore inactifs. Les effets d'une requête réseau interrompue doivent être réconciliés avant tout nouvel envoi.
4. Ne demander une permission API Trade distincte au propriétaire qu'après ces protections et une validation de terrain. Jamais de retrait ni d'automatisation Radar/Atlas d'ordres.

**Point d'arrêt :** correctif PAPER livré. R25 demeure le Bridge opérationnel. Aucun ordre réel envoyé.