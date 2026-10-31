# Agent-Crypto Administrator 40.6.715 — HAUSSES 5 · REPRISE CANONIQUE

Date : 31 octobre 2026. Etat : CORRECTIF CANDIDAT LOCAL, AUCUNE VALIDATION FIREFOX, AUCUNE PUBLICATION GITHUB.

## Objectif utilisateur (NE PAS DEVIER)
Obtenir Hausses 5 à **5 historiques réels sur 5**, 24h, USD natif, pour les cinq actifs classés sur le même snapshot. Aucune interpolation, aucun remplacement d’actif, aucun USD/USDT/USDC confondu. Ne pas détourner la mission vers des messages d’erreur ou une révision du dernier graphique.

## Etat observé utilisateur
- Top 5 fonctionnait 5/5 en cache puis Hausses 5 est tombé à 4/5 (STX NetworkError).
- Après Réinitialiser puis Hausses 5, capture 31/10 ~08:42 : **2/5 historiques compatibles**, cache 0/5, réseau 7/7, manquants **OP, STX, GLM**. Détails : OP série 24h non couverte (286 points sur fenêtre indiquée) ; STX NetworkError ; GLM NetworkError. L'écran montre Solo BTC, ce n'est PAS le graphique Hausses 5.
- Atlas passé sur MANUEL ; Redivider simulations stoppées. Bridge R27 1.9.21 / Backend 1.4.6 local fonctionnent indépendamment; leur ancienne route /history renvoie des historiques EUR, pas USD.
- LS QuotaExceededError observé ; ne pas effacer les archives ni caches pour tenter une réparation.

## Source de ce correctif
Base exacte : `AGENT_CRYPTO_ADMINISTRATOR_40.6.715_HAUSSES5_NATIVE_USD_CACHE_ALIGNMENT_2_FILES.zip` (app.js). Différence supplémentaire ciblée dans `administrator/app.js`.

## Modifications ciblées
1. Lorsque le collecteur USD CoinGecko échoue pour **optimism/OP**, **stacks/STX**, **golem/GLM**, acquérir les chandelles via Coinbase Exchange Spot OP-USD, STX-USD, GLM-USD en lecture seule ; paires confirmées dans les marchés CoinGecko publics au 31/10/2026.
2. Vérifier product.id/base_currency/quote_currency USD/status online/trading_disabled, puis charger les vraies chandelles à intervalle 300s sur la fenêtre figée du scanner (24h+15 min de marge).
3. Exiger la validation d'intégrité et de couverture 24h déjà présente dans l'Administrator, sans échantillonnage artificiel, et conserver la provenance exacte Coinbase dans un cache USD séparé de CoinGecko et EUR.
4. Étendre strictement la lecture de provenance Coinbase Spot USD au couple source/instrument, sans traiter OP/USDT comme OP/USD.
5. Conserver la lecture du cache canonique USD commune au graphique Solo / scanner, apportée par le correctif précédent.

## Vérifications réelles effectuées sur ce candidat
- `node --check` sur app.js complet : PASS.
- Test isolé avec réponses HTTP **simulées** : NetworkError CoinGecko -> Coinbase OP/USD -> résultat accepté ; paire erronée / fausse étiquette USDT refusées : PASS.
- Fonction réelle de couverture 24 h : fenêtre complète acceptée et historique amputé de quatre heures refusé : PASS.
- SHA256 de l'archive ci-dessous; aucun historique de marché réel ne figure dans le ZIP.

## Limites non négociables
- **Aucun clic Hausses 5 testé sur Firefox de l'utilisateur**; pas de confirmation 5/5.
- Accès CORS Coinbase depuis Firefox Pages non validé, débit fournisseur réel non validé. Pour une paire non proposée, le scanner reste sur CoinGecko sans substitution.
- Pas de nouvelle version publiée, pas de commit GitHub, pas de modification du Bridge, du Backend, du Market Core, des fichiers Core privés ou des archives historiques.
- L'état du site publié/main et de la PR #715 doit être vérifié séparément avant tout déploiement ; aucun merge automatique.
- Le chargé minimal de Seven Heaven / verrou Fil Crypto est obligatoire avant toute nouvelle intervention; ne PAS refaire des interrogations GitHub si les copies locales canoniques suffisent.

## Critères d’acceptation futurs
Hausses 5, 24h USD : cinq identités exactes du snapshot, cinq séries réelles de couverture temporelle compatible, provenance USD vérifiée pour chacune, premier clic concluant ou panne de source non maquillée; Top 5 inchangé; EUR et USD distincts; Firefox Windows réel validé.

## Reprise rapide prochaine IA
Lire le verrou en fin de Fil.Inteface.Crypto.GPT.md et charger **intégralement le socle obligatoire**, en privilégiant l'archive locale Aerith.Seven.Heaven.zip puis GitHub pour les manquants. **Ne pas annoncer que les 19 Core suffisent à eux seuls aux Creator Memory, Constellation et compétences du verrou.** Mission exacte Hausses 5 fonctionnel 5/5. Ne pas toucher à Atlas ni au Bridge pour expliquer le graphique vide; l'échec réel reste l'obtention de cinq séries. Ne pas demander de nouveau reset/clic tant que la preuve n'est pas prête.

Commit suggéré (NON CREE) : `Add verified native USD Coinbase spot fallback for scanner gainers`
