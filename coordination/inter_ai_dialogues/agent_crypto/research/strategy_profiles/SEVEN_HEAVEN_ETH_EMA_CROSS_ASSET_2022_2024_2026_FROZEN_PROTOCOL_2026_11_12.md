# Seven Heaven — ETH/USDT, test inter-actifs de l’EMA : protocole figé

**12 novembre 2026 · Protocole de recherche PAPER publié avant tout calcul de rendement ETH.**

## Question et périmètre

Transférer **sans ajuster les paramètres** la politique EMA étudiée sur Bitcoin vers **Ethereum ETH/USDT Spot Binance**. L’objectif n’est pas de trouver une EMA gagnante, mais de savoir si les résultats restent comparables sur un autre actif et plusieurs états du marché.

Les années **2018–2021 ne sont pas complètes pour ETH dans les shards horaires publiés** (mois entiers absents). Elles ne seront **pas reconstruites artificiellement**. Les périodes retenues, accessibles par shards horaires d'origine minute :

1. **2022** : janvier 2022 réservé au calcul de l’EMA et au chauffage ; **portefeuille du 1er février au 31 décembre 2022**, 333 jours.
2. **2024–2026 continu** : avril–décembre 2023 réservé au chauffage de l’EMA, **portefeuille du 1er janvier 2024 au 31 octobre 2026**, 1 035 jours, sans remise à zéro.
3. Témoins annuels séparés : 2024, 2025, janvier–octobre 2026, **1 000 USDT réinitialisés au premier jour de chaque période pour comparaison seulement** ; EMA toujours calculée à partir d’avril 2023.

## Sources et empreintes à vérifier

Registre source : `public/agent_crypto_erith_ia/data/historical_archive_prototype/calendar_year_hourly_shards/index.json`, entrée `ethereum` (85 mois vérifiés sur l'ensemble des shards). Les **cinq** fichiers sources autorisés et leurs SHA-256 sur octets gzip :
- `ethereum-2022-span12-eeb3dbbe089f0d7d409918be1568fd4bc58ee6c11725f358cac7e65c408d40e0.json.gz` → `eeb3dbbe089f0d7d409918be1568fd4bc58ee6c11725f358cac7e65c408d40e0`, 8 760 heures.
- `ethereum-2023-span13-fec387cb9835e9679094b40dd1430b7ba75492b59b7a9e483a8bce8d0a982294.json.gz` → `fec387cb9835e9679094b40dd1430b7ba75492b59b7a9e483a8bce8d0a982294`, 6 600 heures, avril–décembre.
- `ethereum-2024-span13-12f5c738eac80ba281614e1f20fb42d3d255514a87bb1af90828a917e8133f4e.json.gz` → `12f5c738eac80ba281614e1f20fb42d3d255514a87bb1af90828a917e8133f4e`, 8 784 heures.
- `ethereum-2025-span13-a1abd476dd694759650799a51c6450c4614a085623b1b7c8e7a17b7ba4640ba6.json.gz` → `a1abd476dd694759650799a51c6450c4614a085623b1b7c8e7a17b7ba4640ba6`, 8 760 heures.
- `ethereum-2026-span13-a9d1e5f3fb13b6a55fb0a28195f8eaee62f924a0245e0029ffb1de42d054ed64.json.gz` → `a9d1e5f3fb13b6a55fb0a28195f8eaee62f924a0245e0029ffb1de42d054ed64`, 7 296 heures, janvier–octobre.

Lecture du schéma selon le fichier (non présumer les noms des colonnes avant lecture). Agréger les **24 heures UTC consécutives** pour chaque bougie quotidienne : open de la première heure, high maximal, low minimal, close de la dernière heure, somme des volumes de base. Rejeter les journées incomplètes et toute discontinuité d’heures dans ces fenêtres. Ne pas interpoler des prix manquants. Vérifier SHA-256, compte horaire et chronologie.

## Politique figée et témoins

- EMA10 et EMA30 calculées récursivement sur **clôture quotidienne UTC**, alpha `2/(n+1)`, initialisées par le premier close de leur segment de chauffage.
- État **BTC/ETH risk-on** : `EMA10(t)>EMA30(t)` **et** `close(t)>EMA30(t)`. Ici cela signifie exclusivement **ETH exposé** ou cash USDT.
- Signal de la clôture t, ordre fictif à **l'ouverture du lendemain t+1**, jamais plus tôt.
- Portefeuille sans levier, sans short, ni apports ; 1 000 USDT initiaux. 100 % ETH lorsque risk-on ; 100 % USDT sinon. Aucun trade si l'état ne change pas.
- Coût normal **0,10 % frais + 0,05 % glissement par côté** ; coût stress **doublé**. Valeur liquidable à chaque clôture : USDT + ETH * close * (1−fee)*(1−slippage). Vente et achat hypothétiques, pas d'ordre réel, ni carnet Binance/OKX rejoué.
- Témoins aux **mêmes dates** : Buy & Hold ETH 100 %, Buy & Hold ETH 50 % + USDT 50 %, 100 % USDT (sans taux d’intérêt).
- Pour chaque période : rendement net et capital final, baisse maximale sur valeur liquidable, nombre de transactions, journées ETH, plus longue période cash, coût doublé. Série quotidienne de capital, journal d'ordres hypothétiques.

## Interprétation et diffusion

2022 correspond à un marché baissier important ; 2024–2026 inclut hausse, baisse et consolidation. Ce sont des historiques de périodes connues, **une validation inter-actifs exploratoire, pas un essai prospectif ni une preuve de rentabilité future**. Ne pas prétendre que les shards ETH reconstituent toutes les minutes du marché. USDT présente un risque de contrepartie non simulé.

Livraison obligatoire sous `coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/` : code Python autonome, preuve JSON, CSV capital et transactions, rapport de résultats, mise à jour de l'index et de la passation inter-IA. Aucun changement des interfaces Administrator, Operator, Trader ni Bridge.
