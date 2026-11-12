# Seven Heaven — BTC/ETH 50/50 native Bitstamp vs Binance : protocole figé avant replay

**12 novembre 2026 · Recherche PAPER seulement · Pré-enregistrement AVANT récupération de BTC/USD Bitstamp natif et avant les résultats du portefeuille combiné.**

## Question scientifique
Les résultats historiques du portefeuille de **deux poches indépendantes BTC 50 % / ETH 50 %**, filtrées par EMA10/30, sont-ils reproduits avec des **OHLCV natifs Bitstamp Spot BTC/USD + ETH/USD**, sur les mêmes journées, par rapport au témoin **Binance Spot BTC/USDT + ETH/USDT** du Coffre ? Mesurer la fiabilité des signaux, les risques communs et la robustesse des rendements sans ajuster les paramètres.

## Sources et critères d'arrêt
1. **Bitstamp ETH/USD natif** déjà publié par GitHub Actions, fichier `native_bitstamp_eth_2024_2026_evidence/bitstamp_ethusd_daily_2023_2026.csv` dans ce répertoire, Git blob SHA-1 `49e8f3e8f89fdc2929d2e37d1cc5e4904813621e`, SHA-256 exact des octets `881227ba20481322b6829c19d97b799d11a73ae155be8868cf5ec943039c6b49`. Protocole de collecte ETH figé au commit `75a7c15`.
2. **Bitstamp BTC/USD natif** : endpoint officiel public `https://www.bitstamp.net/api/v2/ohlc/btcusd/`, `step=86400`, `limit=1000`, pagination UTC `end` en remontant par journée, mêmes vérifications que le collecteur ETH. Épingler les empreintes de chaque réponse API et du CSV de sortie ; **pas** de substitution par le miroir `daniegitx1` ou par des prix Binance.
3. **Binance historique comparateur** : `SEVEN_HEAVEN_BTC_ETH_EQUAL_DATE_EMA_DUAL_PORTFOLIO_REPLAY_2026_11_12_EQUITY_DAILY.csv`, Git blob SHA-1 `c8ed2a206ea616ea87eeb83e31f7138d5b131588`, et `SEVEN_HEAVEN_BTC_ETH_EQUAL_DATE_EMA_DUAL_PORTFOLIO_REPLAY_2026_11_12_PROOFS.json`, Git blob SHA-1 `43aba5f666df19c9369a58866165c5684b77ecba`. Comparer `btc_exposed`, `eth_exposed`, `btc_ema`, `eth_ema`, `dual_ema`, `dual_hold` aux nouveaux calculs, sans faire passer Binance pour Bitstamp.
4. **Complétude stricte** : 1 310 jours UTC par actif du **2023-04-01 au 2026-10-31**. Les **275 premiers jours** ne servent qu'à préchauffer les EMA. 1 035 journées PAPER du **2024-01-01 au 2026-10-31**. Dates uniques consécutives, OHLC bornées, volumes non négatifs. Aucun remplissage de données ; abandon des chiffres comparatifs si une source manque.
5. Noter que les réponses API Bitstamp non signées n'ont pas de garantie cryptographique par la plateforme ; l'empreinte SHA-256 de notre archivage ne certifie que la copie reçue.

## Règles de simulation immuables
- Clôture UTC quotidienne ; EMA10 et EMA30 amorcées au close du 1er avril 2023, `EMA_N(t)=EMA_N(t-1)+2/(N+1)*(close(t)-EMA_N(t-1))`.
- Signal à la clôture t : `EMA10(t)>EMA30(t) AND close(t)>EMA30(t)`. Achat/vente fictifs exclusivement à **l'ouverture UTC t+1**. Long spot ou liquidités, pas de short, pas de levier, pas de trading réel.
- **1 000 USD fictifs totaux** sur Bitstamp, divisés en deux poches autonomes de **500 USD** initiales. Chaque poche applique son propre EMA, conserve son cash ; **aucun rebalancement, aucun transfert** entre les poches. Buy & Hold 50/50 de deux poches à 500 USD. Benchmark cash USD 100 %.
- **Coût de base** par côté : frais 0,10 % + glissement 0,05 % du cours d'ouverture. Valorisation liquidable au close moins frais et glissement de vente pour les BTC ou ETH encore détenus. **Coûts doublés** : 0,20 % + 0,10 % par côté. Ne modifier aucun coefficient après les résultats.
- Agréger les deux simulations indépendantes `capital_mixte=(equity_BTC_1000+equity_ETH_1000)/2` chaque journée ; cette formule reflète deux poches à 500 USD et non une réallocation quotidienne.
- Mesurer rendements nets, drawdown maximum sur les courbes de capital, volatilités des variations quotidiennes (population), jours avec deux poches en cash, jours avec deux positions, désaccords de signal par actif par jour entre plateformes, 1 034 variations quotidiennes et corrélation BTC/ETH.
- Comparer **des rendements en %**, et non 1 USD = 1 USDT sans écart : Binance quote USDT, Bitstamp quote USD, différences d'actif de cotation et risques d'émetteur non modélisés.
- Vérifier la causalité : signal `t-1` uniquement, cohérence `(BTC+ETH)/2`, enregistrement des compteurs et SHA. Les courbes doivent être stockées à dates identiques.

## Décision de recherche
Une concordance des résultats sur deux exchanges **montre une robustesse descriptive au fournisseur**, mais ne teste **ni un régime temporel inédit ni une rentabilité future**. Le portefeuille n'est pas automatiquement plus sûr que BTC seul. Mettre en évidence toute aggravation du risque lorsque BTC et ETH chutent ensemble ; ne pas attribuer la réduction du drawdown à la seule diversification en ignorant les périodes cash.

## Livraison
Dans `coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/` : script Python auditable, workflow ponctuel, résultats JSON, CSV BTC Bitstamp, CSV courbes quotidiennes, rapport critique lisible, contrôle des entrées + SHA, mise à jour de `SEVEN_HEAVEN_CRYPTO_STRATEGY_RESEARCH_HANDOFF_2026_11_11.md`.

Pas d'ordres réels, pas de permission de trading, aucune modification de l'Administrator, de l'Operator, du Trader ou du Bridge.