# Seven Heaven — Comparaison BTC/ETH à dates identiques et portefeuille 50/50, protocole figé

**12 novembre 2026. Recherche PAPER. Ce protocole est publié avant le calcul de tout résultat du portefeuille mixte.**

## Question

Sur les **mêmes journées UTC**, le filtre EMA10/EMA30 observé séparément sur BTC/USDT et ETH/USDT réduit-il les drawdowns d'un portefeuille fixe 50 % BTC / 50 % ETH, ou ce filtrage entraîne-t-il des ventes/rachats défavorables ? Interdire toute optimisation rétrospective des pondérations.

## Source et fenêtres

- Source canonique : `public/agent_crypto_erith_ia/data/historical_archive_prototype/calendar_year_hourly_shards/index.json`.
- **8 shards** vérifiés SHA-256 : Bitcoin et Ethereum, pour 2023 **avril–décembre**, 2024 **année entière**, 2025 **année entière**, et 2026 **janvier–octobre**. Chaque shard représente des heures Spot Binance BTCUSDT ou ETHUSDT reconstruites depuis archives natives minute. Vérifier les 24 heures de chaque journée, le pair, les colonnes et les horodatages ; aucune interpolation ni fabrication de journées.
- Chauffage des EMA à partir de **1er avril 2023** ; capital fictif engagé du **1er janvier 2024 au 31 octobre 2026 inclus, 1 035 journées**. Sous-tests annuels **2024, 2025, 2026 janvier–octobre** : 1 000 USDT fictifs réinitialisés par expérience, signaux préchauffés sans redémarrage.
- Règles précisément reprises du filtre antérieur : EMA10 > EMA30 **et** clôture du jour > EMA30 ; position calculée à **la clôture du jour t**, transaction simulée à **l'ouverture du jour t+1**, BTC ou ETH sinon cash.
- **Coûts :** frais 0,10 % + glissement 0,05 % **par côté** ; coûts ×2 en sensibilité. Valeur quotidienne = cash + pièces détenues × close × (1−fee) × (1−slippage), pour valorisation liquidable. Cash USDT sans rémunération, sans intérêt ni risque de contrepartie modélisé.
- Pas de levier, short, ordres réels ou futures ; unités BTC et ETH jamais converties arbitrairement.

## Portefeuilles figés

1. **BTC_EMA** : 1 000 USDT, 100 % BTC si bullish, 100 % cash sinon.
2. **ETH_EMA** : 1 000 USDT, 100 % ETH si bullish, 100 % cash sinon.
3. **DUAL_EMA_50_50** : deux **poches indépendantes de 500 USDT** au premier jour. La poche BTC suit BTC_EMA et la poche ETH suit ETH_EMA ; chaque poche conserve son cash ; **aucun rebalancement ni transfert entre poches**, aucun apport. Il n'y a pas de transfert vers la seule crypto bullish.
4. **DUAL_HOLD_50_50** : 500 USDT investis BTC et 500 USDT investis ETH au départ, positions conservées sans rééquilibrage.
5. **BTC_HOLD_100** et **ETH_HOLD_100** : témoins 100 % sur les mêmes dates.
6. **CASH_100** : témoin 100 % USDT sans intérêt.

**Important :** DUAL_EMA_50_50 sera exactement l'addition des deux poches indépendantes, et donc sa valeur finale est la moyenne des deux capitaux finaux des portefeuilles individuels de 1 000 USDT. Son rendement final seul ne démontre aucun avantage d'algorithme ; comparer les **trajectoires de drawdown, corrélation des expositions et coûts**.

## Mesures et contrôle

- Pour chaque fenêtre : capital final, rendement net, pire drawdown quotidien liquidable, nombre d'opérations fictives, fraction de jours investis (par pièce, et cash total), fraction de journées où les deux poches sont simultanément en cash, plus longue période sans exposition, résultat sous coûts doublés.
- Contrôle arithmétique exigé à chaque jour : `DUAL_EMA_50_50_equity = (BTC_EMA_equity + ETH_EMA_equity) / 2`, même équation pour les témoins HOLD ; contrôle des écritures de transaction et de la position demandée la veille.
- Pas de randomisation ni optimisation des poids, zéro analyse future pour générer les signaux. Comparer les années sans déclarer des holdouts indépendants : BTC et ETH sur 2024–2026 ont déjà été vus séparément.
- Bien distinguer l'exécution fictive à l'ouverture Binance de la cotation OKX BTC/USDC affichée dans l'Administrator.

## Publication obligatoire

Publier dans `coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/` : script Python autonome lisant les huit shards, SHA-256 et contrôles ; preuves JSON ; courbes quotidiennes CSV, écritures de trading CSV ; rapport complet ; index README et passation inter-IA. **Le chat ne constitue pas une livraison.** Aucun changement dans Administrator, Operator, Trader, Bridge.
