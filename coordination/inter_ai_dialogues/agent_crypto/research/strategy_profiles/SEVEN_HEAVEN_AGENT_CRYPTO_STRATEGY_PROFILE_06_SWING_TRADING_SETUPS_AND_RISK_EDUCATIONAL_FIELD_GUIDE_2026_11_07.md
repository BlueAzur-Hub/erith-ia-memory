# SEVEN HEAVEN · AGENT-CRYPTO — Strategy Profile 06
## SWING TRADING — Travailler les mouvements de plusieurs jours sans confondre durée et signal

**Édition :** 7 novembre 2026 · **Public :** Christophe, Yoann · **Statut :** DOCUMENTAIRE — RECHERCHE, pas d'exécution réelle.

> **Question :** comment un trader organise-t-il une position qu'il peut conserver quelques jours à plusieurs semaines ?

## 1. Le swing trading n'est pas un indicateur

Le **swing trading** désigne surtout un *horizon de détention* et une méthode de gestion : rechercher une portion d'un mouvement de marché sur plusieurs séances. Ce n'est **pas** une règle unique du type « RSI 30 = acheter ». Deux swing traders peuvent utiliser des règles opposées.

| Horizon | Échelle indicative | Ce qu'il cherche généralement |
|---|---|---|
| Scalping | Secondes/minutes | Petits écarts répétés ; microstructure importante |
| Day trading | Intrajournalier | Fermer souvent avant la séance suivante ; crypto : marchés 24/7 |
| **Swing trading** | **Jours à semaines** | Mouvement intermédiaire, correction, reprise ou cassure |
| Position trading | Semaines/mois | Grandes tendances et contexte macro |
| Buy & Hold | Mois/années | Exposition de long terme plutôt qu'entrées/sorties fréquentes |

Ces durées sont des repères pédagogiques ; il n'existe pas une frontière universelle. Le marché crypto fonctionne également le week-end et la nuit.

## 2. Trois configurations que l'on peut étudier

### A. Swing de tendance : attendre un repli

Une tendance haussière comporte des sommets et creux ascendants. Le trader surveille un retour du cours vers une zone de support possible, et **attend un signal de reprise défini**. Il peut se tromper : le repli peut être le début d'une baisse durable.

### B. Swing de cassure : accompagner une sortie de range

Le trader définit une résistance ou un plus haut de période, puis recherche une clôture de cassure. Il doit préciser comment il sort si le prix revient sous la zone. Voir la fiche 05 pour une variante historique 20/10.

### C. Swing de retour à la moyenne : étudier un excès

Le trader repère un éloignement important des cours par rapport à une moyenne ou une bande, puis cherche un retour. RSI et Bollinger aident à lire cette situation mais ne suffisent pas, seuls, à définir l'entrée, la taille et la sortie. Voir fiche 03.

## 3. Exemple fictif BTC-USDC — sans recommandation

- Capital de simulation : **1 000 USDC** fictifs.
- Prix d'entrée théorique : **75 000 USDC/BTC**.
- Niveau d'invalidation de l'idée : **73 500 USDC/BTC** (écart de **2 %** avant frais).
- Niveau de prise de bénéfice envisagé : **78 000 USDC/BTC** (écart de **4 %** avant frais).
- Ratio rendement/risque de prix avant coûts : **2:1** (4 % de gain visé pour 2 % de perte théorique).

**Ce 2:1 ne tient pas une fois les frais, le glissement et les gaps intégrés.** Notre hypothèse habituelle de 0,10 % de frais + 0,05 % de glissement par côté donne environ **1,61:1 net** si les sorties s'effectuent exactement aux niveaux indiqués. Une sortie plus mauvaise reste possible.

Les niveaux sont totalement inventés et n'expriment aucune attente sur Bitcoin.

## 4. Les cinq questions que pose un plan de swing

1. **Contexte :** sur le graphique quotidien, le marché montre-t-il tendance, hésitation ou volatilité inhabituelle ?
2. **Signal exact :** clôture au-dessus d'un niveau, confirmation d'un repli, retournement d'un indicateur ?
3. **Invalidation :** à quel niveau le scénario n'a-t-il plus de sens ?
4. **Capital exposé :** quelle perte représente le scénario, y compris avec les frais et un glissement défavorable ?
5. **Sortie :** objectif, stop, expiration temporelle de l'idée, conditions de désengagement ?

Le journal de recherche note également la date de décision, la bougie effectivement clôturée, les paramètres, le raisonnement et les écarts entre hypothèses et résultats.

## 5. Ce que notre Coffre permet de faire et ne permet pas de conclure

**Faits :** l'archive locale donne des bougies quotidiennes Binance Spot BTC/USDT et nous avons déjà étudié EMA, MACD, RSI, Bollinger, Breakout, SuperTrend et Buy & Hold sur plusieurs années. Ces méthodes peuvent servir de *composants* de stratégies swing.

**Non établi :** il n'existe pas encore dans cette série de fiches un backtest unique baptisé « Swing Trading » avec son jeu complet de règles d'entrée, sortie, durée maximale et gestion de position. **Nous n'inventons donc aucun rendement Swing.**

Pour un backtest swing crédible, un protocole doit fixer notamment : signal à la clôture, date d'exécution suivante, taille, limites, frais, stop, take-profit, traitement des gaps, temps maximal en position et benchmark. Avec uniquement une bougie OHLC par jour, on ne sait pas toujours si stop et objectif ont été touchés dans quel ordre **au cours d'une même journée** : il faut soit des données intrajournalières, soit une règle conservatrice clairement annoncée.

## 6. Profil de recherche — non exécutable

| Champ | `Seven Research 06 — Swing Trend / Pullback Observation` |
|---|---|
| Famille | Horizon multi-jours, tendance/pullback (variante à définir) |
| Actif de démonstration | BTC Spot, source à fixer avant test |
| Contexte | Jour / 4 heures à titre indicatif ; ne pas simuler du 4h avec du quotidien |
| Précondition | Identifier la tendance et une zone de risque, **sans prétendre les connaître d'avance** |
| Entrée | Non définie tant que les règles ne sont pas validées |
| Sortie | Invalidation, objectif, durée maximale : à préciser et tester |
| Démonstration de gestion | Exemple 75 000 / 73 500 / 78 000 ; valeurs inventées |
| Mesures | P&L net, drawdown, durée des positions, coût, moyenne gain/perte |
| Statut | `RESEARCH ONLY / NO REAL ORDER / NOT BACKTESTED AS A SINGLE STRATEGY` |

## 7. Ce que distingue un trader rigoureux

Un *setup* est une situation intéressante ; un *trigger* est la condition exacte qui déclencherait une opération ; une *sortie* répond à la question « comment savoir si l'idée est invalidée ou terminée ? ». Ces trois éléments ne sont pas interchangeables.

**Questions :** le swing trading est-il une stratégie unique ? Pourquoi une opportunité apparente peut-elle ne pas être tradable ? Pourquoi un stop théorique n'est-il pas une perte maximale garantie ?

**Stop documentaire :** aucune modification du Trader, aucune stratégie déployée, aucun ordre OKX.

## Sources

- CME Group, *Trading Strategies in Your Trade Plan* : https://www.cmegroup.com/education/courses/building-a-trade-plan/trading-strategies-in-your-trade-plan
- CME Group, *Risk Management and Your Trade Plan* : https://www.cmegroup.com/education/courses/building-a-trade-plan/risk-management-and-your-trade-plan
- Fidelity, *Technical Analysis Indicator Guide* : https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide
- Référence du Coffre : https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/index.json