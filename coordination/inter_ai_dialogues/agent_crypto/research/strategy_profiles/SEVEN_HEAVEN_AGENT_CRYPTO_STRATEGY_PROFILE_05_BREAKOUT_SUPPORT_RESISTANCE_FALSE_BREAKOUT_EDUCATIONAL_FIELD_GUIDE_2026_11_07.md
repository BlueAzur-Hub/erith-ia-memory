# SEVEN HEAVEN · AGENT-CRYPTO — Strategy Profile 05
## BREAKOUT & SUPPORT / RÉSISTANCE — Lire les cassures sans confondre un franchissement et une certitude

**Édition :** 7 novembre 2026 · **Public :** Christophe, Yoann, Administrator / Operator · **Statut :** DOCUMENTAIRE — PAPER / RECHERCHE, aucune exécution réelle.

> **Question :** pourquoi un trader s'intéresse-t-il à la cassure d'une zone de prix, et comment reconnaître qu'il peut s'agir d'une fausse cassure ?

## 1. Comprendre support, résistance et breakout

- **Support :** zone dans laquelle la pression acheteuse a déjà freiné une baisse. Ce n'est ni un plancher garanti ni un prix magique.
- **Résistance :** zone dans laquelle des ventes ont déjà freiné une hausse. Une résistance peut être franchie et éventuellement devenir une nouvelle zone de support ; ce n'est jamais automatique.
- **Range :** succession d'oscillations entre deux zones de prix.
- **Breakout :** sortie du prix d'une zone ou du plus haut / plus bas suivi par le trader. Une cassure haussière *potentielle* n'est pas une promesse de poursuite.
- **Retest :** retour éventuel vers le niveau franchi ; il peut échouer ou ne jamais se produire.
- **Fausse cassure :** prix au-delà d'un niveau, puis retour dans l'ancienne zone. Une cassure baissière peut également être fausse.

**Image mentale :** un marché cogne plusieurs fois à un plafond. Il finit par le traverser : on ne sait pas encore s'il a trouvé un nouvel étage ou s'il va retomber aussitôt.

## 2. Exemple fictif BTC-USDC — deux scénarios

Imaginons une zone comprise entre **72 000** (support) et **76 000 USDC/BTC** (résistance). Ces chiffres sont **inventés** et ne représentent pas le marché actuel.

**Scénario A :** BTC clôture à 76 500 au-dessus de la résistance ; une règle de recherche peut attendre la clôture confirmée et envisager une entrée à l'ouverture de la bougie suivante. Si le cours poursuit vers 79 000, cette entrée aurait suivi un mouvement. Il faut encore retrancher frais, glissement et risques de prix.

**Scénario B :** BTC clôture à 76 500, puis revient à 74 500 le lendemain. C'est une cassure qui ne s'est pas maintenue. Une règle dépourvue de sortie risque d'acheter trop tard et de subir le retour dans le range.

Le fait de voir **76 500 au plus haut de la bougie** ne prouve pas qu'une clôture au-dessus de 76 000 a eu lieu. Le **plus haut** n'est pas une **clôture**.

## 3. Comment un trader écrit ses règles

| Élément | Exemple pédagogique, pas une instruction de trading |
|---|---|
| Unité de temps | 1 jour, prix clôturés uniquement |
| Niveau étudié | Plus haut des **20 bougies précédentes**, sans regarder la bougie courante |
| Signal d'entrée | Clôture au-dessus de ce plus haut |
| Exécution théorique | Ouverture de la bougie suivante, avec coûts |
| Sortie | Clôture sous le plus bas des **10 bougies précédentes**, puis ouverture suivante |
| Volume | Filtre possible, mais **absent** du test 20/10 ci-dessous |
| Stops | Aucun stop intrajournalier dans le test existant ; ne pas le supposer |
| Vérification | Capital final, drawdown, transactions et frais, pas uniquement taux de réussite |

Ce profil 20/10 est une **variante de recherche**, non la définition universelle du breakout. Il est possible de chercher une cassure de résistance, un canal de Donchian, un niveau hebdomadaire, une cassure avec retest ou un filtre de volume, mais ce sont des règles différentes.

## 4. Ce que le Coffre a déjà mesuré — Breakout 20/10

**Provenance :** simulation documentaire antérieure et indépendante sur Binance Spot BTC/USDT, bougies quotidiennes ; 1 000 USDT fictifs réinitialisés chaque année ; fenêtre du **22 janvier au 31 décembre** ; frais **0,10 % par côté**, glissement **0,05 % par côté** ; sans levier, long uniquement, signal calculé à la clôture puis exécution fictive à l'ouverture suivante ; valorisation finale de liquidation théorique. Les paramètres n'ont pas été optimisés ni validés hors échantillon.

| Année | Breakout 20/10, variation | Acheter et conserver | Drawdown maximal Breakout |
|---|---:|---:|---:|
| 2022 | −38,36 % | −54,75 % | −39,16 % |
| 2023 | +26,59 % | +85,03 % | −11,98 % |
| 2024 | +59,79 % | +124,37 % | −30,70 % |
| 2025 | −15,62 % | −17,67 % | −29,27 % |

En 2024, l'approche finit à +59,79 % mais subit environ **−30,70 %** de baisse temporaire. En 2022, notre version clôture **cinq allers-retours perdants** dans le modèle, malgré une perte finale moins grave qu'Acheter et conserver. Une stratégie de cassure peut donc échouer plusieurs fois avant une éventuelle tendance significative.

**Attention :** l'archive utilisée est BTC/USDT Binance, pas un carnet OKX BTC/USDC. Les résultats ne sont pas les performances d'un bot OKX, et les données quotidiennes ne permettent pas de mesurer exactement tous les remplissages et gaps.

## 5. Les pièges que le trader surveille

1. **Fausse cassure :** hausse fugace et retour dans la zone.
2. **Niveau calculé avec le futur :** par erreur, inclure le plus haut du jour où l'on prétend déjà avoir pris une décision ; c'est du biais de regard vers le futur (*look-ahead bias*).
3. **Signal = exécution :** une clôture à 76 500 n'est pas une exécution garantie à 76 500 ; l'ouverture suivante peut être bien différente.
4. **Marché sans tendance :** de nombreuses entrées / sorties consomment les gains en frais.
5. **Stop trop proche ou absent :** pertes en cas de retournement, et risque de glissement supplémentaire en cas de gap.
6. **Sélection trompeuse :** choisir après coup une seule période favorable ne valide pas une stratégie.

## 6. Profil documentaire — à étudier, non importable

| Champ | Profil `Seven Research 05 — Breakout 20/10` |
|---|---|
| Type | Spot BTC, suivi de tendance / cassure |
| Signal | Close > plus haut intrajournalier (`high`) des **20 jours précédents** |
| Sortie | Close < plus bas des 10 jours précédents |
| Exécution | Bougie quotidienne suivante, open hypothétique |
| Frais / glissement | 0,10 % + 0,05 % de chaque côté, hypothèses |
| À mesurer | Rendement net, drawdown, nombre de cassures ratées, exposition |
| Statut | `EDUCATIONAL / RESEARCH ONLY / NO LIVE ORDER` |

**Questions de compréhension :** pourquoi le high ne remplace-t-il pas le close ? Qu'est-ce qui distingue une cassure validée de son exécution effective ? Pourquoi une stratégie qui échoue cinq fois peut-elle malgré tout finir moins mal qu'une détention passive ?

**Stop documentaire :** ne pas activer le Trader, ne pas imposer un seuil au compte OKX.

## Sources

- Fidelity Investments, *Identifying Chart Patterns with Technical Analysis*, section sur les fausses cassures : https://www.fidelity.com/bin-public/060_www_fidelity_com/documents/learning-center/Idenitfying-Chart-Patterns.pdf
- Fidelity, *Technical Analysis Indicator Guide* : https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide
- CME Group, *Trading Strategies in Your Trade Plan* : https://www.cmegroup.com/education/courses/building-a-trade-plan/trading-strategies-in-your-trade-plan
- Coffre BTC de référence : https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/index.json