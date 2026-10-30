# Seven Heaven — CT/USDC : liaison Bridge feeType → Trader PAPER

20 octobre 2026. Passation publique : aucun solde, jeton, identifiant ou journal privé.

## Point de départ
La capture Windows utilisateur montre Aether Control 2.3.2R24, Bridge 1.9.18 et Backend 1.4.6 actifs et prêts, avec autocontrôles OK. Elle ne prouve pas que GET /okx/fee-type a effectivement lu le compte. Le Trader 40.6.640 ne consommait pas encore cette route.

## Livraison
- PR #549 fusionnée : https://github.com/BlueAzur-Hub/erith-ia-memory/pull/549
- Commit de fusion : https://github.com/BlueAzur-Hub/erith-ia-memory/commit/e09ec7d9cbeaf1fd9b5033d751b97873e11cdff3
- Quatre fichiers : trader-okx-account.js, trader-paper-decision-core.js, trader-paper-decision-view.js, test-paper-decision.cjs.
- L'unique propriétaire Aether Trust lit GET /okx/fee-type sur demande humaine via le ticket CT-USDC. Aucune deuxième authentification et aucun appel privé dans le composant d'affichage.
- Validation stricte : source OKX Private REST /api/v5/account/config, lecture seule, pas d'ordres, scope exact, timestamp 120s, mode 0 ou 1 et devise CT ou USDC cohérente. Sinon NON CONFIRMÉ.
- Le ticket montre le mode et sa date. Pour feeType=1, la simulation PAPER réduit la quantité brute en lots et inclut les frais estimés USDC dans le budget. Pour feeType=0, les frais estimés en CT réduisent la quantité reçue. Mode non connu : hypothèse CT affichée comme hypothèse.
- Les arrondis exacts des vrais fills, le minimum notionnel, les filtres de prix, les réservations de solde et l'acceptation d'ordre ne sont pas prouvés. Aucun ordre, transfert ni permission ajoutés.

## Preuves de code
- PR #549 : trois workflows réussis (Trader Current, Pages, incremental patch).
- Post-fusion : Trader Current réussi : https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/39497590979
- Pages post-fusion : https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/39497590796 (ne déclarer réussi qu'après consultation de son statut).
- ZIP patch automatique dans le run PR : https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/39497330914 (artifact agent-crypto-trader-clean-upload, sha256 a5db3c04fc65bf2d74f52ca9f76ad507e2416c2a41f8e4cc2dc28040f6cb28ca).

## Recette Firefox terrain encore nécessaire
1. Conserver Bridge R24 actif, compte OKX connecté via Aether Trust. Ne pas transmettre de mot de passe/token.
2. Après Pages, Ctrl+F5 dans le Trader, sélectionner CT Solo, puis Laboratoire PAPER -> Préparer un ticket OKX LIMIT -> Vérifier ce scénario (aucun ordre).
3. Résultat attendu : feeType=0 / frais d'achat CT, ou feeType=1 / frais d'achat USDC, avec horodatage. Si échec : NON CONFIRMÉ, pas de supposition.
4. Si mode 1, la simulation fictive inclut les frais USDC et n'excède pas le budget. CT-USDT (graphique) ne doit jamais être confondu avec CT-USDC (ticket).
5. Vérifier AUCUN ORDRE POSSIBLE DEPUIS CE TICKET. Ne passer aucun ordre.

Point d'arrêt : GitHub intégration réalisée ; valeur feeType du compte et test Windows/Firefox non certifiés sans relevé local.