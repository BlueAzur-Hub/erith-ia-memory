# Seven Heaven — Contrôle BTC EMA 10/30 sur Bitstamp : protocole figé avant calcul

**Date : 12 novembre 2026.** Recherche historique, portefeuille PAPER exclusivement. Protocole établi **avant le calcul Bitstamp**. La période Binance et les règles EMA ont déjà servi à d'autres recherches : ce n'est pas un test chronologique hors échantillon.

## Question
Avec des paramètres absolument inchangés, les résultats du filtre EMA 10/30 sur **Binance Spot BTC/USDT** résistent-ils à un nouveau calcul sur **Bitstamp Spot BTC/USD** pour les mêmes dates UTC ? Identifier la dépendance au lieu de cotation, la concordance des décisions, le rôle du cash et les écarts de rendement.

## Sources à versionner
- Témoin Binance : `coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_BTC_ETH_EQUAL_DATE_EMA_DUAL_PORTFOLIO_REPLAY_2026_11_12_EQUITY_DAILY.csv`, Git blob SHA-1 `c8ed2a206ea616ea87eeb83e31f7138d5b131588`. Valeurs et états d'exposition BTC issus de la simulation Binance officielle du Coffre.
- Nouvelle source Bitstamp : `daniegitx1/btc-price-history/data/btc_usd_daily.csv`, Git blob SHA-1 `0bd9a80472f46cbf47a678e9f17d6c5a9edab7f5`, miroir public alimenté par l'API Bitstamp OHLC. Les données de ce miroir sont des **copies tierces** : leur empreinte confirme la copie consultée, non une signature de l'exchange.
- Noter les dates couvertes, séries manquantes ou répétées, unicité UTC et cohérence OHLC. Arrêter si une journée 2023-04-01→2026-10-31 manque, si le hash ne correspond pas, ou si les OHLC sont invalides.

## Règles reprises sans modification
- EMA 10 et EMA 30 sur **clôtures 1j UTC**, amorcées à la première clôture du **1er avril 2023**.
- `bull(t) = EMA10(t) > EMA30(t) AND close(t) > EMA30(t)`.
- À chaque ouverture du jour **t+1**, détenir BTC intégralement si `bull(t)`, sinon rester 100 % en USD sur Bitstamp ; aucune vente à découvert, aucun levier. Aucun accès à `close(t+1)` pour décider un ordre.
- Capital initial 1 000 **USD fictifs**, simulation continue du **1er janvier 2024 au 31 octobre 2026 inclus** (1 035 jours).
- Prix exécuté fictivement à l'ouverture UTC quotidienne ; **frais 0,10 % + glissement 0,05 % de chaque côté** (ouverture achat : `qty=cash*(1-fee)/(open*(1+slip))` ; vente : `cash=qty*open*(1-slip)*(1-fee)`).
- Valorisation liquidable : `equity=cash + qty*close*(1-fee)*(1-slip)` ; tracer haut historique depuis capital initial et baisse maximale.
- Comparateurs indépendants : EMA, Buy & Hold BTC, cash ; sensibilité frais+glissement **doublés** (sans sélection opportuniste).
- Contrôler **1 035 états d'exposition** contre le champ `btc_exposed` de Binance, et comparer les rendements quotidiens Bitstamp close/close au témoin Binance HOLD equity/equity (hors jour initial), la corrélation et les différences absolues.

## Méthode de décision
Comparaison avant toute interprétation : nombre d'entrées, changements d'état, jours de désaccord, capital terminal, drawdown, coûts doublés ; comparer la performance **sur chaque source séparément**, pas un profit réel transférable d'une plateforme à l'autre. USD et USDT sont des unités de cotation différentes, sans conversion automatique 1:1 de monnaie réelle.

## Verdict admissible
- Résultats semblables : **robustesse descriptive au changement de source** sur dates déjà explorées, pas preuve de stratégie gagnante.
- Divergences : investiguer dates et différences de prix, ne pas optimiser les EMA après coup.
- Accès incomplet : publier un diagnostic de limites, pas inventer de résultats.
- Aucune intégration Administrator / Operator / Trader / Bridge ; aucun ordre réel.

## Publication
Rapport, code source autonome, preuves JSON et passation inter-IA dans `coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/`. Enregistrer les SHA des fichiers réellement lus. 