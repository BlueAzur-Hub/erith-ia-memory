# SEVEN HEAVEN · AGENT-CRYPTO — Strategy Profile 07
## GESTION DU RISQUE — Stop-loss, take-profit, taille de position, ratio rendement/risque et drawdown

**Édition :** 7 novembre 2026 · **Public :** Christophe, Yoann · **Statut :** DOCUMENTAIRE — RECHERCHE, aucune modification d'ordre ou de portefeuille réel.

> **Question :** que regarde un trader avant même de se demander combien il pourrait gagner ?

## 1. Un signal ne constitue pas un plan de risque

- **Stop-loss :** condition ou ordre destiné à sortir d'une position si un prix défavorable est atteint. Un stop au marché **ne garantit pas** son prix d'exécution ; un stop-limit peut ne pas être rempli.
- **Take-profit :** objectif ou mécanisme visant à encaisser un profit. Il ne garantit pas que l'objectif sera atteint, ni un remplissage parfait.
- **Taille de position :** montant d'actif effectivement exposé à la variation du marché.
- **Budget de risque :** perte que le plan se propose de ne pas dépasser *dans son scénario de prix et de liquidité*. Ce n'est **pas** une assurance de perte maximale.
- **Ratio rendement/risque (R:R) :** gain envisagé divisé par perte envisagée selon un jeu précis de niveaux et de coûts.
- **Drawdown :** baisse du capital depuis son plus haut antérieur. Un backtest peut finir dans le vert en ayant subi une très grande perte temporaire.

**Analogie :** avant de prendre la route, décider de la destination ne suffit pas. Il faut aussi savoir quelle réserve on a, quelles voies sont dangereuses et quand rebrousser chemin.

## 2. Exemple chiffré détaillé — 1 000 USDC fictifs

Données **inventées**, aucun lien avec une cotation actuelle :

| Paramètre | Hypothèse |
|---|---:|
| Capital total | 1 000 USDC |
| Budget de risque pédagogique | 1 % du capital, soit **10 USDC** |
| Entrée théorique BTC | 75 000 USDC |
| Stop théorique | 73 500 USDC (**−2,00 %** en prix) |
| Objectif théorique | 78 000 USDC (**+4,00 %** en prix) |
| Frais | 0,10 % à l'entrée, 0,10 % à la sortie |
| Glissement hypothétique | 0,05 % à l'entrée, 0,05 % à la sortie |

**Sans coûts :** acheter 500 USDC de BTC donne approximativement 10 USDC de perte si le prix perd 2 %. Cela revient à risquer 1 % du compte pour une position de 50 % du capital.

**Avec les coûts supposés :** pour une dépense d'entrée de 100 USDC, la sortie au prix-stop hypothétique restituerait environ **97,7064 USDC** ; la perte représente donc **2,2936 % de la mise**, pas seulement 2 %.

Pour **10 USDC de risque théorique**, le budget d'achat devient environ **436,00 USDC**, soit environ **0,00580467 BTC**, avec les hypothèses de frais et de glissement précitées. La perte serait alors proche de 10 USDC *si* le stop était exécuté aux conditions imaginées.

À l'objectif fictif de 78 000, le gain net théorique représente environ **3,6885 %** de la mise ; le rapport net est donc autour de **1,61:1**, et non 2:1. La friction de marché compte.

**Limite cruciale :** 10 USDC n'est pas une perte maximale garantie. La chute peut être plus rapide que l'exécution, le carnet peut manquer de liquidité, l'exchange ou le réseau peut être indisponible, et le glissement réel peut dépasser 0,05 %.

## 3. Pourquoi un risque de 1 % n'est pas « seulement 1 % investi »

Une allocation de 436 USDC n'est pas une perte prévue de 436 USDC ; le scénario d'invalidation est censé en limiter le risque à environ 10 USDC **dans notre modèle simplifié**. Cependant le capital investi reste exposé en cas d'événement extrême. À l'inverse, mettre seulement 10 USDC dans une position ne signifie pas risquer exactement 10 USDC dans chaque scénario.

L'idée pédagogique n'est pas d'imposer **1 %** comme norme universelle. Le trader doit choisir une exposition adaptée à ses moyens, à la liquidité, au marché et au risque de rupture de modèle. Le risque agrégé de plusieurs positions corrélées doit également être surveillé.

## 4. Lire le drawdown sans se laisser séduire par le capital final

Notre Coffre contient un exemple très parlant : dans la simulation RSI 14 (achat sous 30, sortie au-dessus de 55), l'année **2022** finit à **+7,96 %**, mais le portefeuille a connu une baisse maximale d'environ **−40,35 %** depuis un sommet précédent. Cette stratégie pourrait donc être psychologiquement et financièrement difficile à supporter malgré un résultat annuel positif.

Autre exemple : en **2024**, notre SuperTrend 10×3 finit à **+50,00 %**, avec un drawdown théorique d'environ **−40,72 %**. Un chiffre de performance annuelle ne décrit pas le chemin suivi ni les risques pris.

Ce sont des simulations **BTC/USDT Binance Spot** indépendantes et pédagogiques, entre le 22 janvier et le 31 décembre, 1 000 USDT fictifs réinitialisés au début de chaque année ; frais de 0,10 % et glissement 0,05 % par côté. Aucun stop intrajournalier ni gestion de portefeuille professionnelle n'y est implicitement ajouté.

## 5. Ce que le trader suit vraiment dans un journal

| Mesure | Question utile |
|---|---|
| Capital avant / après | Quelle est la variation **nette** ? |
| Drawdown maximal | Jusqu'où le capital est-il descendu depuis son sommet ? |
| Pertes en série | Combien de signaux trompeurs successifs ? |
| Ratio gain/perte | Qu'est-ce qui était visé vs réellement obtenu ? |
| Frais, spread, glissement | Quelle part des résultats vient des coûts ? |
| Exposition et corrélation | Plusieurs positions risquent-elles de chuter en même temps ? |
| Écarts d'exécution | À quel prix l'ordre aurait-il réellement été rempli ? |
| Robustesse | Les résultats résistent-ils aux changements d'années et de paramètres ? |

Ne pas confondre **probabilité historique de gain** et **certitude future**. Une stratégie qui gagne souvent peut perdre beaucoup sur une seule position. Une stratégie qui gagne rarement peut dépendre de quelques grands mouvements.

## 6. Profil documentaire transversal — non exécutable

| Champ | `Seven Research 07 — Risk & Drawdown Review` |
|---|---|
| Périmètre | Toutes les stratégies étudiées en PAPER |
| Capital référence | 1 000 USDT/USDC fictifs selon la source ; ne pas confondre les deux |
| Budget pédagogique de perte | Exemple 1 % du compte, **pas une valeur par défaut du Trader** |
| Frais / glissement | Afficher en pourcentage et préciser le nombre de côtés |
| Règles obligatoires pour comparer | Même période, mêmes coûts, même base de capital |
| Limite des données 1d | Stop et objectif touchés dans la même journée : ordre inconnu |
| Critères d'arrêt de la recherche | Source incomplète, impossible de séquencer, paramètre non documenté |
| Statut | `EDUCATIONAL / NO LIVE TRADING / NO IMPORTABLE PRESET` |

## 7. Questions et conclusion

1. Une taille de position de 436 USDC signifie-t-elle une perte maximale garantie de 10 USDC ? **Non.**
2. Pourquoi un objectif de +4 % et un stop de −2 % ne donnent-ils pas exactement 2:1 après frais ?
3. Que manque-t-il à un backtest quotidien pour prouver un stop touché avant un take-profit dans une même bougie ?
4. Pourquoi un bot affichant de nombreuses petites victoires peut-il être très risqué ?

**À retenir :** une stratégie n'est pas seulement sa règle d'entrée. Elle comprend aussi sa sortie, sa taille, ses coûts, le niveau de perte supportable et les situations où le modèle peut échouer. Ici, nous apprenons à lire et à mesurer ; **nous ne configurons aucun compte réel**.

## Sources

- CME Group, *Proper Position Size* : https://www.cmegroup.com/education/courses/trade-and-risk-management/proper-position-size
- CME Group, *The 2% Rule* (exemple pédagogique et seuil arbitraire, pas une obligation) : https://www.cmegroup.com/education/courses/trade-and-risk-management/the-2-percent-rule
- CME Group, *Risk Management and Your Trade Plan* : https://www.cmegroup.com/education/courses/building-a-trade-plan/risk-management-and-your-trade-plan
- CFA Institute, *Measuring and Managing Market Risk* : https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/measuring-managing-market-risk
- Coffre BTC, index réconcilié : https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/btc_native_daily_reconciliation/index.json