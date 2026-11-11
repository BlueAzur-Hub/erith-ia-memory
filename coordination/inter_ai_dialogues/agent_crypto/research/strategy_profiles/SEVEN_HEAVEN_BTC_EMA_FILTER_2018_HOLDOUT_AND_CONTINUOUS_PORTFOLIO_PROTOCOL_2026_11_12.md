# Seven Heaven — EMA 10/30: test 2018 inédit et portefeuilles continus, protocole figé

**12 novembre 2026 — phase PAPER, protocole écrit et archivé avant calcul des performances 2018.**

## Question centrale

Le regroupement exploratoire 2019–2026 des reprises BTC après trois clôtures a observé un contraste descriptif favorable aux EMA. Est-ce reproductible sur les données **2018 non utilisées dans cette sélection** ? Une politique d'exposition BTC/USDT régie par les EMA est-elle effectivement meilleure qu'un Buy & Hold lorsqu'on tient compte de toutes les journées, frais, liquidités et baisse maximale ?

**2018 (31 mai–31 décembre) est le contrôle hors sélection ; 2019, 2020, 2021 sont des extensions descriptives historiquement déjà étudiées, non de nouveaux holdouts.** Les règles d'exposition sont de nouvelles hypothèses et ne constituent pas une reproduction des stratégies de l'étude de rebond.

## Source et qualité

Fichier canonique `public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/bitcoin-Max.json.gz` ; SHA-256 gzip `812acb4a087cc43163760a6b397506bb7cb4bbcf8eca692fc686ef9f618b8bfd`, registre `btc_daily_reference/index.json`. Binance Spot BTCUSDT, UTC 1d, source quotidienne dérivée de minute complète ou récupérée via archives originales Binance 1d. Vérifier 3 075 journées continues mai 2018–sept. 2026. La source conserve des minutes natives manquantes : **ne pas l'appeler archive 1m complète**.

## Indicateur et règles immuables

- EMA10 et EMA30 sur **clôtures quotidiennes uniquement**, `alpha=2/(n+1)`, initialisation par première clôture du 1er mai 2018, calcul récursif sans données futures.
- Un état **bull** après la clôture UTC `t` si `EMA10(t)>EMA30(t)` ET `close(t)>EMA30(t)` ; sinon **cash**. Décision de jour t exécutée fictivement à l'**ouverture t+1**.
- Portefeuille **100 % BTC ou 100 % USDT** (aucun short, aucun levier, aucun ordre réel) ; achat en totalité lors du passage à bull, vente totale lors du passage à cash ; aucune transaction si état inchangé.
- Départ 1 000 USDT. Frais 0,10 % par transaction et glissement 0,05 % sur l'ouverture par côté ; stress coûts doublés. Valeur quotidienne liquidable = USDT + BTC * clôture * (1−slippage)*(1−frais) ; si cash, USDT seul. Liquidation hypothétique incluse à la fin. Les coûts sont des hypothèses, pas des fills historiques.
- Témoins : **Buy & Hold 100 % BTC**, **Buy & Hold 50 % BTC / 50 % cash**, et **100 % cash** aux mêmes premières ouvertures, avec les mêmes frais et liquidation.
- Étudier un **portefeuille continu** du **31 mai 2018 au 31 décembre 2021**, sans apport ni remise à zéro. En complément, quatre expériences annuelles de 1 000 USDT au départ (2018 mai–déc., 2019, 2020, 2021) avec EMA calculées continûment depuis mai 2018 ; aucun redémarrage de l'EMA aux années.
- Mesures : capital final, rendement, drawdown maximal quotidien sur valeur liquidable, nombre de transactions, fraction des journées exposées BTC, plus longue période en USDT, variation des performances avec coûts doublés, comparaison aux témoins. Vérifier causalité par relecture de préfixes et équations comptables, séparation du calcul de signal et de la transaction.

## Test événementiel de la même hypothèse, année 2018 uniquement

À partir de la première clôture montante après recul de ≥2,5 % depuis les 30 dernières clôtures, espacement 11 jours, produire les reprises candidates 2018 sur fenêtres historiques disponibles ; J0, J+1, J+2 doivent monter pour confirmer **C3**. À J+2, **EMA bull** tel que défini ci-dessus. Comparez les sous-groupes C3+EMA oui / non, et leur résultat net isolé d'un achat fictif à l'ouverture J+3 jusqu'à la clôture J+10. Exclure les événements sans dixième jour clôturé ; ne pas composer les épisodes. Le faible nombre de C3 doit être affiché en entier.

## Limites et interprétation

La politique « BTC ou cash » teste une **nouvelle politique de décision EMA**, pas directement l'amélioration observée du filtre événementiel C3+EMA ; ne pas confondre. 2018 est un unique segment baissier : pas de supériorité universelle, et absence d'optimisation ne constitue pas une preuve prospective. La série quotidienne réconciliée contient 26 journées récupérées en native 1d et signale 5 881 minutes natives manquantes ; la précision intraminute et les ordres OKX BTC/USDC ne sont **pas** testés. La détention USDT comporte un risque d'émetteur et de plateforme non modélisé.

## Livraison exigée

Publier sous `coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles` : `*_REPORT.md`, `*_PROOFS.json`, `*_EQUITY_DAILY.csv` et **source Python autonome** relisant directement la source gzip du Coffre ; indexer dans `README.md` et la passation inter-IA. Les résultats du chat ne constituent pas une livraison. Aucune modification des interfaces, du Trader, d'Operator ou du Bridge.
