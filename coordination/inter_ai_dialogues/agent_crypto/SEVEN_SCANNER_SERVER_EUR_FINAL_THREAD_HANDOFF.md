# Seven Heaven — Passation finale du fil Scanner EUR / RAIN
Date : 28 octobre 2026 · État vérifié dans GitHub et Notion.

## Mission / règle de sécurité
Faire fonctionner Hausses 5 / Baisses 5 et leurs historiques 24 h EUR/USD sans graphique inventé, sans remplacer le cinquième actif, sans retrait d'historiques, sans toucher au Market Core 38.15.11, Trader, Operator, Bridge privé ou Coffre. Administrator affiché : build 40.6.640. USD par défaut, EUR sélectionnable. Les modifications de code restent sur des branches de test ; ne pas fusionner sans preuve Firefox et validations.

## Preuve Firefox obtenue
Sur prévisualisation combinée #696 + #699 : Baisses 5, 24 h, EUR, résultat 4/5 : QNT, XMR, FIGR_HELOC et RLUSD tracés ; RAIN absent. Bandeau supérieur désormais synchronisé avec QNT (et non BTC), fiche cohérente. Légende visible : `Diagnostic 4/5 : RAIN : collecte/validation · CoinGecko navigateur : NetworkError when attempting to fetch resource · Bridge : NetworkError when attempting to fetch resource · Binance navigateur : ...`. Les deux NetworkError ne prouvent ni HTTP 429 ni une panne fournisseur. Aucune substitution, pas de cinquième série fabriquée. La sélection venait d'un Market Frame public à 03:20:56, devenu périmé au moment de la capture. Le scanner termine sa transaction à 4/5 ; patienter n'implique aucune récupération autonome.

Identifiant CoinGecko de Rain confirmé : `rain`. Le cinq-ID observé sur cette capture : `quant-network`, `monero`, `figure-heloc`, `rain`, `ripple-usd`. Ne pas en faire un panier permanent : prendre les cinq IDs réellement figés au moment de toute prochaine acquisition.

## Branches et PRs vérifiées
- [PR #695](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/695) : intégrité/fraîcheur Market et identité des historiques EUR/USD, OPEN DRAFT, pas fusionnée.
- [PR #696](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/696) : synchronisation du bandeau compact avec la Lecture Technique, OPEN DRAFT ; capture QNT visuellement favorable en prévisualisation combinée.
- [PR #699](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/699) : observabilité de 4/5 et mémorisation du dernier diagnostic, OPEN DRAFT ; 15/15 tests GitHub passés, pas de certification complète Firefox pour un retour 4/5 vers 5/5 du même panier.
- [PR #700](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/700) : **livraison du prototype serveur générique**, branche `test/scanner-server-eur-evidence-20261028`, commit `08593c4a95d1c6312a14e5077872fada3c2332bd`, OPEN DRAFT, pas fusionnée.
- [PR #698](https://github.com/BlueAzur-Hub/erith-ia-memory/pull/698) : autre diagnostic partiel également OPEN DRAFT, vérifier chevauchement avec #699 avant toute intégration.
- Branche de prévisualisation QNT + scanner : `test/scanner-technical-reading-combined-20261028`, révision vérifiée `354b87d8730188465071ca8dd9466bbb35f0e087` (charge le snapshot public depuis main ; **pas de validation Firefox certifiée de cette révision**).

## Livrables PR #700 réellement publiés
1. `.github/workflows/administrator-scanner-server-eur-evidence.yml` : tests sur PR et acquisition **manuelle opt-in** seulement ; l'acquisition n'est pas exécutée automatiquement.
2. `public/agent_crypto_erith_ia/tools/scanner_verified_history.cjs` : reçoit exactement cinq CoinGecko IDs uniques, Market Frame ID, période 24 h, requêtes séquentielles `/coins/{id}/market_chart?vs_currency=eur&days=1&precision=full` ; conserve prix réels horodatés, code HTTP, provenance, identités, limites de couverture. Aucune conversion USD/USDT et aucun ajout d'actif.
3. `public/agent_crypto_erith_ia/tools/test_scanner_verified_history.cjs` : cas d'ID dupliqué, couverture 24 h, timestamps/prix malformés, 429/404/500, NetworkError sans faux code HTTP, série incomplète, basket 4/5 et 5/5.

[Workflow #40644396125](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/40644396125) : **13 tests / 13 PASS, zéro échec**, vérifié dans les logs GitHub. Job `acquire` = SKIPPED : **aucun historique EUR réel de RAIN acquis/certifié par le serveur**. Le SHA-256 de l'artifact atteste seulement la cohérence du JSON collecté, non une signature CoinGecko. Pas de lecteur navigateur relié au prototype.

## Prochaine action UNIQUE de la prochaine Aerith
Exécuter/inspecter une acquisition **serveur réelle et autorisée** pour un Market Frame récent et **exactement les cinq IDs réellement choisis à cet instant**. Vérifier la sortie et le statut HTTP individuel de RAIN, la fenêtre historique EUR 24 h, la provenance, la fraîcheur, l'intégrité et l'artifact de preuve ; conserver un échec honnête 4/5 si la série ne passe pas. Ne pas lancer des retries aveugles. Aucune intégration du lecteur navigateur avant ces preuves. Ensuite seulement envisager une PR distincte de lecture fail-closed et les tests Firefox.

## Memory / discipline
Bureau humain : [AETHER · AGENT-CRYPTO INTERFACE](https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099). La note #700 et l'audit RAIN ont déjà été inscrits dans cette page. L'utilisateur travaille sous Firefox, souffre d'interruptions de connexion et souhaite **une action à la fois, sans F12 ni Ctrl+F5, aucune nouvelle refonte**. Ne demander aucun nouveau test tant qu'une version branchée/qualifiée n'est pas prête. Le dépôt partagé est le support de continuité entre IA.

Statut de clôture : collecteur prototype livré / CI vérifiée ; preuve live RAIN et branchement navigateur NON RÉALISÉS ; aucune fusion de code dans main.
