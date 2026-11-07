# SEVEN HEAVEN · AGENT-CRYPTO — Strategy Profile 04
## MACD ET SUPERTREND — Étudier la tendance et comprendre les faux départs

**Édition :** 7 novembre 2026 · **Public :** Christophe, Yoann, Administrator / Operator · **Statut :** DOCUMENTAIRE — LECTURE SEULE · **Aucun ordre réel, aucune automatisation, aucun import exécutable.**

**Destination de coordination envisagée (non publiée) :** `BlueAzur-Hub/erith-ia-memory/coordination/inter_ai_dialogues/agent_crypto/`.

> **Question étudiée :** lorsqu'un marché commence à monter ou descendre, comment un trader essaie-t-il d'identifier le sens dominant sans prétendre prédire son prochain mouvement ?

## 1. Principe en une minute : deux indicateurs de tendance, deux lectures

### MACD — Moving Average Convergence/Divergence

Le **MACD** étudie la dynamique d'une tendance à travers des moyennes mobiles exponentielles. Les réglages courants sont **12 / 26 / 9** :

- La **ligne MACD** est la différence entre EMA 12 et EMA 26.
- La **ligne de signal** est une EMA 9 de la ligne MACD.
- L'**histogramme** représente l'écart entre ces deux lignes.

Un croisement MACD **au-dessus** de sa ligne de signal peut être interprété comme une accélération relative vers le haut ; un croisement **en dessous** comme un affaiblissement. **Ce n'est pas une certitude de hausse ou de baisse.** La position du MACD par rapport à zéro est un contexte supplémentaire ; les signaux de notre étude reposent sur les **croisements avec la ligne de signal**, pas sur le seul franchissement de zéro.

### SuperTrend — Indicateur de tendance fondé sur l'ATR

Le **SuperTrend** superpose au graphique une ligne qui dépend de la volatilité (ATR, *Average True Range*). Les paramètres souvent étudiés sont **ATR 10 × multiplicateur 3**. Selon la direction de la tendance calculée, la ligne se positionne au-dessous ou au-dessus du cours.

Un changement de côté de la ligne peut être lu comme un **changement de régime**. La méthode peut suivre une tendance prolongée, mais risque d'enchaîner les inversions inutiles lorsque Bitcoin oscille sans direction claire.

**Analogie :** MACD ressemble à un capteur d'accélération ; SuperTrend à un balisage du sens de circulation. Le premier étudie la variation de la dynamique ; le second tente de suivre une direction en tenant compte de l'amplitude des mouvements.

## 2. Exemple fictif — ne pas confondre le signal avec l'exécution

Imaginons quatre bougies quotidiennes :

| Moment | MACD fictif | SuperTrend fictif | Lecture possible |
|---|---|---|---|
| J1 | MACD sous signal | Ligne au-dessus du prix | Momentum et tendance défavorables |
| J2 | MACD croise au-dessus du signal **à la clôture** | Toujours négatif | Première amélioration, non confirmée par SuperTrend |
| J3 | MACD reste positif | SuperTrend passe sous le prix **à la clôture** | Les deux lectures deviennent favorables, mais tardivement |
| J4 | Le prix baisse brutalement | Peut rester positif jusqu'au nouveau calcul | Signal précédent invalidé par les faits : aucune garantie |

Si une stratégie décide d'agir après le signal de J2 ou de J3, elle ne doit **pas** simuler un achat à un prix déjà passé. Notre laboratoire prend comme hypothèse une exécution fictive à **l'ouverture de la bougie suivante**, avec frais et glissement. Une bougie non clôturée n'a pas encore confirmé son signal.

## 3. Paramètres et règles de recherche distincts

| Élément | MACD 12/26/9 | SuperTrend 10 × 3 |
|---|---|---|
| Mesure | Écart et dynamique des EMA | Tendance avec adaptation à la volatilité ATR |
| Paramètres | EMA rapide, EMA lente, ligne signal | Période ATR, multiplicateur |
| Entrée de recherche | Croisement MACD au-dessus du signal à la clôture | Basculement SuperTrend à la hausse à la clôture |
| Sortie de recherche | Croisement MACD en dessous du signal | Basculement SuperTrend à la baisse |
| Exécution de notre laboratoire | Ouverture suivante, Spot long only | Ouverture suivante, Spot long only |
| Risque typique | Croisements répétés en range | Basculements répétés et volatilité imprévisible |
| Particularité | Indicateur distinct de MACD zéro / divergences | **Variantes de calcul possibles selon la plateforme** |

**Ne pas confondre :** ces profils ne sont pas des conseils de paramétrage réel. « MACD + SuperTrend » ne constitue pas une stratégie unique sans préciser les conditions **ET / OU**, les périodes de confirmation, les sorties, les coûts et les positions déjà détenues.

## 4. Résultats déjà calculés dans notre Coffre (lecture critique)

Ces chiffres **reprennent nos simulations pédagogiques antérieures** sur des bougies quotidiennes **Binance BTC/USDT**, et non des ordres OKX ni un moteur autonome validé commercialement. Les 1 000 USDT fictifs sont réinitialisés chaque année ; période commune **22 janvier–31 décembre** ; frais **0,10 % de chaque côté** et glissement **0,05 % de chaque côté** ; exécution fictive à l'ouverture suivant un signal clôturé ; liquidation théorique en fin de période pour évaluer les positions ouvertes.

| Année | MACD 12/26/9 | SuperTrend 10×3 | Acheter et conserver |
|---|---:|---:|---:|
| 2022 | −28,32 % | −45,17 % | −54,75 % |
| 2023 | +25,59 % | +59,19 % | +85,03 % |
| 2024 | **+77,62 %** | +50,00 % | +124,37 % |
| 2025 | −17,02 % | −14,40 % | −17,67 % |

| Année | Drawdown MACD à la clôture | Drawdown SuperTrend à la clôture |
|---|---:|---:|
| 2022 | −38,40 % | −45,88 % |
| 2023 | −16,43 % | −20,03 % |
| 2024 | −15,46 % | **−40,72 %** |
| 2025 | −22,25 % | −16,91 % |

**À lire avec prudence :** ce sont des résultats **exploratoires, dépendants des règles précises du modèle**, non des performances de stratégies « officielles ». Le SuperTrend de notre rapport historique utilise une **implémentation pédagogique simplifiée de bandes ATR 10 × 3** ; ses changements de direction peuvent différer des résultats de TradingView, d'OKX ou d'autres logiciels. Avant de publier un classement, il faudrait valider les calculs bougie par bougie sur des jeux de référence. Les drawdowns sont mesurés **à la clôture** et peuvent sous-estimer les pertes intrajournalières.

### Un exemple de piège très parlant

En 2024, SuperTrend finit à **+50,00 %**, ce qui paraît spectaculaire. Pourtant il a subi environ **−40,72 % de drawdown** sur la période. Dans notre modèle, il a terminé en gain **malgré** une forte baisse intermédiaire.

MACD affiche +77,62 % en 2024 avec un drawdown de −15,46 %, mais il ne s'ensuit **pas** que MACD est intrinsèquement supérieur : d'autres années, il a très mal fonctionné. Sur notre fenêtre 2024, Acheter et conserver a fait mieux que les deux méthodes.

## 5. Ce que pourrait observer un trader professionnel

1. **Le régime du marché.** Le BTC construit-il des plus hauts et des plus bas ascendants, ou oscille-t-il dans une zone ?
2. **La durée des signaux.** Depuis combien de bougies le signal MACD ou SuperTrend reste-t-il dans le même sens ?
3. **La confirmation.** Le volume, la structure des sommets/creux et la clôture confirment-ils ou contredisent-ils le signal ?
4. **Le coût total.** Le nombre d'allers-retours fictifs et les frais réduisent-ils l'avantage apparent ?
5. **La perte intermédiaire.** Jusqu'où le portefeuille s'est-il enfoncé avant son éventuelle reprise ?
6. **La stabilité hors-échantillon.** Les paramètres restent-ils compréhensibles et plausibles sur des années différentes, sans être choisis uniquement après avoir vu les résultats ?

### Le problème des marchés sans tendance

Quand le marché évolue en *range*, les oscillations peuvent faire franchir plusieurs fois les lignes de signal ou le SuperTrend. Le trader peut alors acheter haut, revendre bas, puis recommencer. Ce phénomène est parfois appelé **whipsaw** (faux signaux en série). Réduire le nombre d'ordres n'améliore pas automatiquement le résultat : il faut comparer rendement, risque, exposition et occasions manquées.

## 6. Profil de recherche PAPER — non exécutable

| Champ | Profil 04A | Profil 04B |
|---|---|---|
| Nom | `Seven Research 04A — MACD Trend Observation` | `Seven Research 04B — SuperTrend ATR Observation` |
| Paramètres étudiés | MACD 12/26/9 | ATR 10 × 3 |
| Objectif | Étudier le momentum de tendance | Étudier la direction pondérée par la volatilité |
| Déclencheur fictif | Croisement ligne MACD / signal clôturé | Changement de sens de SuperTrend clôturé |
| Source historique | Binance BTC/USDT 1j | Binance BTC/USDT 1j |
| Frais hypothétiques | 0,10 % + 0,05 % de glissement par côté | Identique |
| À documenter | Croisements, opérations, retards, drawdown | Variante exacte de calcul ATR/bandes, opérations, drawdown |
| Comparatif | Acheter et conserver, mêmes dates | Acheter et conserver, mêmes dates |
| État | `RESEARCH_ONLY — NO IMPORT` | `RESEARCH_ONLY — INDICATOR VALIDATION REQUIRED` |

Ces fiches ne doivent pas être collées dans l'Operator comme des règles exécutables. Pour Yoann, elles peuvent servir de **références de recherche** avant de formaliser sa propre stratégie dans TRADUS.

## 7. Questions de compréhension et arrêt propre

1. Pourquoi MACD n'est-il pas « deux EMA 5 et 13 » sous un autre nom ?
2. Que mesure l'ATR dans SuperTrend, et pourquoi son multiplicateur change-t-il la sensibilité de la ligne ?
3. Pourquoi un croisement confirmé seulement à la clôture ne peut-il pas être exécuté rétroactivement au plus bas de cette bougie ?
4. Quel est le danger d'une stratégie qui a gagné +50 % sur un an tout en subissant −40 % de perte temporaire ?

**Conclusion Seven :** MACD et SuperTrend aident à **lire une tendance**, mais ne donnent aucun avenir certain. Notre laboratoire doit distinguer l'indicateur, la règle écrite, le moteur de backtest et la validation historique. **Aucune modification du programme Trader, de Notion ou du compte OKX.**

## Sources et provenance

- [Fidelity — MACD, lignes, croisements, cas de range](https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide/macd).
- [TradingView — Supertrend, ATR, bandes, règles de tendance](https://fr.tradingview.com/support/solutions/43000634738/).
- [Seven Heaven — Encyclopédie des stratégies et résultats exploratoires du Coffre](./SEVEN_HEAVEN_AGENT_CRYPTO_STRATEGY_FIELD_GUIDE_COFFRE_SIMULATIONS_AND_PAPER_PROFILES_2026_11_07.md) — guide de référence archivé dans ce même dossier GitHub.
- [Coffre BTC — index de l'archive réconciliée](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/index.json).