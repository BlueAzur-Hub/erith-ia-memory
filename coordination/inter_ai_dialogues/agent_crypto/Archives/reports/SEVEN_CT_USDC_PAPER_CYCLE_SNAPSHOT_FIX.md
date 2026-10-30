# Seven Heaven — Correction du cycle LIMIT PAPER CT/USDC

**21 octobre 2026 · Recette opérateur après PR #554 et reprise immédiate.**

## Anomalie reproduite
L'opérateur a ouvert le nouveau simulateur, saisi SIMULER, puis cliqué `Préparer scénario PAPER`. Le simulateur a renvoyé `DIAGNOSTIC : Prix, quantité, frais ou preuves datées incompatibles.` tandis que le ticket montrait un carnet local OKX récent et des contrôles du compte. Aucun ordre réel n'a été envoyé.

**Cause de code :** le ticket qualifiait le carnet lors de la vérification, mais `startPaperLimitCycle` recommençait la vérification de fraîcheur des **20 secondes** au moment où l'utilisateur cliquait sur Préparer. Après quelques dizaines de secondes de lecture, le test échouait alors que la simulation est une étude non exécutable. Le message mélangeait ce problème avec les prix, quantités et frais.

## Correction livrée
- [PR #555](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/555) fusionnée sur main, [commit 09037721](https://github.com/BlueAzur-Hub/erith-ia-memory/commit/0903772167eca75db200b8d80e04d9f4c8979313).
- Au moment de `previewSpotExit`, le Trader mémorise **en mémoire seulement** `qualifiedAt`, l'instant de validation de cette étude. Le cycle PAPER vérifie que carnet (20 s) et règles de compte (120 s) étaient frais **à cette date**, et accepte ensuite la préparation dans les **15 minutes** suivantes.
- Si la photographie dépasse 15 minutes, l'utilisateur doit refaire Vérifier ce scénario ; **cette tolérance ne s'applique jamais à un ordre réel**.
- Le simulateur affiche `Photographie PAPER validée à ...`, son âge lors de la préparation et rappelle que ce n'est **pas une cotation actuelle**.
- Les causes de rejet sont séparées : qualification, carnet, preuve de compte, tick prix, quantité/lot, maxBuy et frais.
- Le changement de marché Solo invalide `cyclePlan`. Aucun autre propriétaire du graphique ou du compte n'est modifié.

## Tests et sécurité
- Nouveau test explicite : préparer un cycle fictif **140 secondes après** une vérification réussie ; photographie acceptée et marquée `snapshot_only`, `not_a_live_quote`, `orders_enabled=false`, `send_attempts=0`.
- Étude >15 minutes, mauvaise identité, carnet périmé **lors de la validation initiale**, et simulation sans preuve : refus.
- Trois workflows PR verts : `Agent-Crypto Trader Current`, `lightweight multisite Pages`, `incremental patch`.
- Aucune route POST OKX, pas de permission Trade, pas de transaction, pas de stockage d'ordres, aucun Bridge R26. R25/Bridge 1.9.19, Backend 1.4.6 et Market Core 38.15.11 préservés.

## Validation utilisateur à effectuer
1. Après déploiement Pages, Firefox Ctrl+F5 ; CT Solo → ticket PAPER CT-USDC → Vérifier ce scénario.
2. Ouvrir `Cycle d'ordre LIMIT fictif`, prendre son temps (mais moins de 15 minutes), puis cliquer `Préparer scénario PAPER`.
3. Le résultat attendu est `PAPER_DRAFT` avec date de la photographie, pas un refus générique. Ensuite saisir `SIMULER` et cliquer `Confirmer simulation` dans les deux minutes, puis `Accepter fictivement`, injecter un remplissage partiel fictif et tester l'annulation.
4. Si une autre condition échoue, reporter uniquement le **nouveau diagnostic précis**, sans publier de soldes ou jetons.

**POINT D'ARRÊT :** GitHub correctif fusionné ; tests CI réussis ; recette Firefox de ce correctif encore EN ATTENTE.
