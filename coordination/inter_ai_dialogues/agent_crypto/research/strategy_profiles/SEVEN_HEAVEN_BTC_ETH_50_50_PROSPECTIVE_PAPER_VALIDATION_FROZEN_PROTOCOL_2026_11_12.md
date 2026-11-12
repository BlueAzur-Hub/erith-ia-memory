# Seven Heaven — Validation PAPER prospective BTC/ETH 50/50 : protocole gelé

**Protocole publié le 12 novembre 2026, AVANT le premier jour d'évaluation.**
**Statut : préenregistré uniquement ; AUCUN résultat prospectif calculé, AUCUN traitement récurrent activé.**

## Question de recherche
Le portefeuille BTC/ETH 50/50 filtré EMA 10/30 apporte-t-il une stabilité hors échantillon temporel avec des données Spot natives nouvelles, sans aucun réajustement des règles ni optimisation après avoir observé les résultats 2024–octobre 2026 ?

## Un échantillon réellement non observé lors de la fixation

**Début de l'échantillon évalué : 14 novembre 2026 (journée UTC).** Le protocole est publié le 12 novembre, bien avant le signal de clôture du 13 novembre qui pourra décider de la première exposition du 14 novembre.

Contrôle de calendrier préfixé :
- **30 journées**, du 2026-11-14 au **2026-12-13**, bilan intermédiaire descriptif.
- **90 journées**, du 2026-11-14 au **2027-02-11**, premier bilan décisionnel limité à la validation scientifique (aucun ordre).
- **365 journées**, du 2026-11-14 au **2027-11-13**, bilan prolongé destiné aux différences de régimes.

**NE PAS** remplacer des journées manquantes par des prix interpolés ; ne pas prétendre disposer du résultat avant les dates de clôture. Les analyses futures n'existent pas à la date de ce protocole. Aucune surveillance automatique, aucun programme récurrent et aucune promesse de publication autonome ne sont déclenchés par ce document.

## Prix, clôtures et vérifications

- Prix natifs **Bitstamp Spot BTC/USD** et **ETH/USD** via l'API publique `https://www.bitstamp.net/api/v2/ohlc/btcusd/` et `https://www.bitstamp.net/api/v2/ohlc/ethusd/`, `step=86400` ; uniquement journées UTC clôturées. Pour la qualification des périodes, vérifier `timestamp`, continuité des jours, bornes OHLC et volumes non négatifs.
- Démarrer les deux EMA à partir du **close 2023-04-01** et les dérouler **sans rupture** jusqu'au 2026-11-13. Les anciennes archives Bitstamp `2023-04-01→2026-10-31` sont déjà publiées et vérifiées ; récupérer uniquement les clôtures novembre manquantes pour établir le signal au 13 novembre, sans entraîner un nouveau choix d'indicateurs.
- Archiver réponses publiques, requêtes, date de récupération, SHA-256 des fichiers et code exact ; si les deux séries ne couvrent pas les mêmes dates, marquer la validation **INCOMPLÈTE** et ne pas substituer Binance/USDT à Bitstamp/USD.
- USD et USDT ne sont pas interchangeables : comparer à un témoin Binance **facultatif**, seulement avec un historique complet à dates strictement communes, sans fausse parité.

## Portefeuilles et politiques strictement fixés

- **EMA10/30** sur clôture quotidienne UTC : `EMA10(t)>EMA30(t) AND close(t)>EMA30(t)`; émission du signal après la clôture t ; portefeuille BTC ou cash et ETH ou cash à l'ouverture t+1.
- Portefeuille principal **1 000 USD fictifs** initialement au 2026-11-14, **500 USD BTC** et **500 USD ETH** en poches indépendantes ; pas de rééquilibrage, levier, short, lending ou intérêts.
- Buy & Hold BTC/ETH **50/50 sans rééquilibrage** sur la même date initiale, témoin additionnel 100 % BTC et liquidités 100 % ; aucune sélection rétrospective de témoin.
- Scénarios fixes de coût sur chaque côté de transaction, **frais 0,10 % et glissement 0,05 %** (référence), **×2, ×3, ×4** (hypothèses de stress). Conserver un essai zéro coût comme point de contrôle, sans le présenter comme exécutable.
- Règles d'exécution fictive et de liquidation **identiques à la simulation publiée le 12 novembre** `SEVEN_HEAVEN_BTC_ETH_50_50_EMA_TRANSACTION_COST_STRESS_FROZEN_PROTOCOL_2026_11_12.md`. Ne pas réestimer les EMA, ne pas déplacer les horaires en voyant les prix.

## Mesures à publier pour chaque horizon, pas avant

Rendement net EMA / Hold / BTC / cash, baisse maximale en capital, volatilité des rendements journaliers, jours cash et exposés, nombre d'opérations fictives, pertes et journées de baisse commune, différence de performance par niveau de coût, liste des jours manquants, empreintes SHA et intégrité du calendrier. Comparer la trajectoire à la base 2024–octobre 2026 **en tant que référence historique externe**, non en recalculant des paramètres sur le nouveau jeu.

## Portée et arrêt

L'horizon de **30 jours ne permet pas de démontrer une robustesse de régime**, 90 jours peuvent encore être dominés par une tendance ; même 365 jours ne prouvent pas un rendement garanti. Documenter l'incertitude et ne pas déclarer « réussite » à cause d'un seul bon résultat. Si le protocole doit être modifié à l'avenir, publier un **nouveau protocole avant l'évaluation** et conserver l'ancien pour la traçabilité, sans remplacer silencieusement les règles.

**Emplacement canonique de la recherche** : `coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/`. Aucune action de marché, aucun compte, aucun Bridge ni changement Administrator/Operator/Trader.
