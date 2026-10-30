# Seven Heaven — CT/USDC : cycle d'ordre LIMIT simulé dans le Trader

**21 octobre 2026.** Passation publique à l'équipe IA. **Simulation PAPER uniquement ; aucun ordre réel, permission Trade, API privée supplémentaire ou déplacement de fonds.**

## Origine et architecture préservée
- Après [PR #553](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/553), Firefox a confirmé le carnet local CT/USDC OKX récent et `LOCAL_OK`, avec un faible écart d'horloge admis. Le Bridge R25 / 1.9.19 et Backend 1.4.6 sont donc conservés.
- Le Trader disposait déjà d'un brouillon CT/USDC distinct dans `ct-order-draft.js` / `ct-order-ticket.js` (panneau IA Concrete). **Ne pas le détruire ni créer de troisième page**. Le cycle ci-dessous est une section repliable dans le ticket PAPER existant, qui consomme ses preuves qualifiées.
- Trader 40.6.640 maintenu, Market Core 38.15.11 protégé ; pas de changement de numéro ni de nom de fichier source.

## Livraison réalisée
- [PR #554](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/554) fusionnée sur `main`, commit [5117b73a](https://github.com/BlueAzur-Hub/erith-ia-memory/commit/5117b73a6adad8e6367a1012a0326d587f85345a).
- `trader-paper-decision-core.js` : machine à états pure en mémoire `startPaperLimitCycle` + `advancePaperLimitCycle`. Entrée unique : ticket CT-USDC PAPER qualifié, carnet Backend datant de moins de 20 s, règles du compte R25 datées, frais du compte, devise de débit et budget fictif. Archive ancienne, mauvaise paire ou règles périmées : refus de départ.
- Création **manuelle**, puis saisie volontaire du mot `SIMULER` dans les deux minutes pour déclencher une **soumission fictive**. Les états sont tous préfixés `PAPER_*` et ne représentent jamais la réponse réelle d'OKX.
- États : `PAPER_DRAFT`, `PAPER_SUBMITTED`, `PAPER_ACCEPTED`, `PAPER_PARTIAL`, `PAPER_FILLED`, `PAPER_REJECTED`, `PAPER_CANCELLED`, `PAPER_UNKNOWN`. En état incertain : **aucun nouvel envoi** ; résolution seulement via les trois actions explicites de réconciliation. Une transition interdite échoue sans modifier le scénario.
- Remplissage partiel manuel en CT, sans dépassement et par lots. Calcul fictif de la quantité CT nette après frais, de la quantité revendable par lots et de la poussière. **Un fill partiel sous `minSz` signale clairement l'impossibilité de le revendre isolément**. Annulation après remplissage partiel : la partie déjà simulée comme exécutée subsiste.
- `trader-paper-decision-view.js` : une section repliable intitulée « Cycle d'ordre LIMIT fictif », sous le résumé lisible ; pas de panneau concurrent, pas de requête d'ordre et pas de stockage navigateur. Les commandes sont activées seulement lorsque la transition est autorisée.
- `test-paper-decision.cjs` : cas de confirmation invalide, soumission fictive, acceptation/refus, fill partiel, annulation, fill complet, état incertain, réconciliation, mauvais marché, données périmées, et contrôle d'absence d'API Trade.

## Preuves de livraison
- Trois workflows de PR réussis : `Agent-Crypto Trader Current`, `lightweight multisite Pages`, `incremental patch`.
- CI post-fusion [Trader](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/39510426223) et [Pages](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/39510426231) : à vérifier après clôture avant déclaration de succès.
- **Pas encore de validation Firefox de la PR #554**. Les tests CI ne valident pas la fenêtre Windows de l'utilisateur.

## Recette humaine courte
1. Garder le Bridge R25. Dans Firefox, `Ctrl+F5`, sélectionner CT Solo et ouvrir le ticket PAPER CT-USDC.
2. Cliquer sur **Vérifier ce scénario (aucun ordre)**, puis ouvrir **Cycle d'ordre LIMIT fictif** et cliquer **Préparer scénario PAPER**. Un carnet ancien ou une preuve périmée doit bloquer la préparation.
3. Écrire `SIMULER`, cliquer **Confirmer simulation**, puis **Accepter fictivement**. Entrer une quantité partielle, par exemple `3,00 CT`, et cliquer **Exécution partielle fictive**. Vérifier le message « sous le minimum revendable » ; cliquer **Annuler fictivement** : les 3 CT simulés restent comptabilisés comme remplis.
4. Refaire une étude fraîche ; préparer et confirmer une nouvelle simulation. Tester **État inconnu** puis **Réconcilier : ouvert** ou **Réconcilier : refusé**. Aucun réessai automatique.
5. Vérifier à chaque étape les libellés **SIMULATION UNIQUEMENT** et **aucun ordre envoyé**.

## Étape suivante, non réalisée
Le futur parcours d'ordres **réels** ne doit pas réutiliser cette simulation comme faux acquittement d'OKX. Il faudra : permissions Trade volontairement séparées, contrôles d'instrument et prix exact avant chaque ordre, identifiant client réellement unique, confirmation forte finale, mécanisme de rapprochement des requêtes indéterminées, statut d'exécution/annulation lu chez OKX, gestion du fill partiel et des restes < `minSz`, arrêt d'urgence et audit. Aucun accès Trade ni route POST n'a été ajouté par cette PR.

**Point d'arrêt : moteur livré sur GitHub, test terrain Firefox en attente.**
