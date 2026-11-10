# Seven Heaven — Stratégies Bitcoin : étude des réussites ET des échecs, sans sélection opportuniste

**Date :** 10 novembre 2026. **Statut :** résultats de simulation historique calculés et contrôlés sur la source publique, **aucune stratégie validée pour des ordres réels**.  
**Périmètre :** laboratoire documentaire pour les IA, sans modification d'Administrator, Trader, Bridge ou portefeuille.  
**Question centrale :** pour rechercher une méthode durable, quelles stratégies perdent de l'argent, quand perdent-elles, quels risques prennent-elles, et quels bénéfices du marché manquent-elles ?

## Ce que l'étude établit

**12 stratégies expérimentales + 2 témoins**, toutes définies avant le calcul de cette série, sur **2 830 journées UTC** du 1er janvier 2019 au 30 septembre 2026, Binance Spot BTC/USDT. Les **12 stratégies affichent un rendement cumulé positif** sur cette période très favorable à la détention longue de Bitcoin ; **une seule des 12** dépasse le Buy & Hold en rendement total. Ce n'est absolument pas la preuve que les 11 autres seraient sans intérêt, ni que cette première est viable.

**Le test le plus intéressant : EMA20 > EMA50** : **+2432.82 % cumulés**, contre **+2152.58 % en Buy & Hold**, avec toutefois **12 opérations perdantes sur 22**, une baisse maximale de **−51,68 %**, et **−39,13 % en 2022**. Il faut la traiter comme une **hypothèse intéressante mais non validée**, et non comme une stratégie gagnante découverte.

**Un échec est une observation à conserver.** Les critères « perte absolue sur la période », « année négative », « perte maximale du portefeuille », « sous-performance face à Buy & Hold » et « coûts de transaction » sont séparés. Beaucoup de méthodes gagnent en cumul mais perdent dans plusieurs années.

## Méthodologie commune, sans résultats arrangés

- Source : fichier Binance BTC-USDT Spot 1 jour, archive figée de 3 075 bougies continues du 1er mai 2018 au 30 septembre 2026, SHA-256 du gzip `812acb4a087cc43163760a6b397506bb7cb4bbcf8eca692fc686ef9f618b8bfd`.
- Période : **2 830 jours** (2019–30 septembre 2026), indicateurs amorcés sur les données antérieures. Le capital de départ fictif est **1 000 USDT** et **n'est pas réinitialisé au 1er janvier** ; les rendements annuels représentent la variation du même portefeuille.
- Long ou liquidités **uniquement**, capital intégral mobilisable, sans levier ni vente à découvert. Signal décidé sur la **clôture** de la veille, transaction fictive à l'**ouverture suivante**. Les stops ATR sont simulés sur les plus bas journaliers avec dégradation si l'ouverture est sous le stop.
- Frais standard **0,10 % par côté** et glissement fictif **0,05 % par côté**. Stress : **frais 0,20 % et glissement 0,10 % par côté**. Pas de carnet historique permettant de certifier les prix d'exécution.
- **14 modèles affichés, pas 14 recettes indépendantes** : les méthodes sont corrélées et certaines sont des variantes exploratoires. Les règles ont été fixées avant le calcul de ce lot, mais le marché 2019–2026 a déjà été étudié dans le projet. **Il n'existe donc PAS de période totalement inédite et aveugle pour prétendre à une validation hors échantillon.**

## Tableau complet — rendements cumulés, risques et pertes

*Tous les rendements sont des variations du portefeuille fictif initial de 1 000 USDT sur toute la période, composées dans le temps. G/P = opérations gagnantes/perdantes. Le DD maximal est mesuré sur les valeurs quotidiennes estimées, pas sur la totalité des risques d'exécution intrajournaliers. Les rendements cumulés très élevés reflètent aussi les fortes hausses historiques du Bitcoin.*

| Méthode | Rendement net 2019–2026 | DD maximal | Opérations G/P | Exposition temps | Rendement frais doublés | Écart vs Buy & Hold |
|---|---:|---:|---:|---:|---:|---:|
| Liquidités, témoin | 0.00 % | 0.00 % | 0 (0G/0P) | 0.0 % | 0.00 % | -2152.58 % |
| Acheter et conserver, témoin | +2152.58 % | -76.63 % | 1 (1G/0P) | 100.0 % | +2145.82 % | 0.00 % |
| Tendance EMA20 > EMA50 | +2432.82 % | -51.68 % | 22 (10G/12P) | 55.9 % | +2270.90 % | +280.25 % |
| Tendance EMA50 > EMA200 | +863.06 % | -71.43 % | 7 (5G/2P) | 64.3 % | +843.03 % | -1289.52 % |
| Clôture au-dessus de EMA200 | +1264.15 % | -56.41 % | 42 (11G/31P) | 60.6 % | +1102.50 % | -888.43 % |
| Momentum positif 90 jours | +985.85 % | -66.66 % | 48 (15G/33P) | 56.9 % | +840.09 % | -1166.73 % |
| Momentum positif 180 jours | +874.37 % | -64.86 % | 27 (13G/14P) | 60.6 % | +798.49 % | -1278.20 % |
| Cassure 20 j, sortie 10 j | +515.41 % | -51.87 % | 51 (20G/31P) | 38.6 % | +429.50 % | -1637.17 % |
| Cassure 55 j, sortie 20 j | +387.12 % | -33.53 % | 29 (16G/13P) | 29.2 % | +347.49 % | -1765.46 % |
| Cassure 20 j avec filtre EMA50/200 | +190.36 % | -45.26 % | 36 (14G/22P) | 25.1 % | +161.19 % | -1962.22 % |
| Repli EMA10 avec filtre EMA50/200 | +314.38 % | -44.90 % | 79 (25G/54P) | 24.7 % | +226.87 % | -1838.20 % |
| Rebond RSI35 au-dessus de EMA200 | +15.24 % | -15.87 % | 12 (6G/6P) | 2.4 % | +11.23 % | -2137.33 % |
| Rebond RSI35 sans filtre EMA200 (ablation) | +14.56 % | -24.98 % | 38 (23G/15P) | 9.8 % | +2.26 % | -2138.02 % |
| Retour à la moyenne, écart-type 2 sur 20 j | +38.78 % | -55.84 % | 71 (38G/33P) | 18.3 % | +11.43 % | -2113.79 % |

**Le chiffre déterminant n'est pas seulement le rendement final :** le témoin Buy & Hold expose 100 % du temps et a traversé une baisse maximale simulée de **−76,63 %**. Certaines stratégies limitent l'exposition, mais la plupart ont perdu une partie considérable de la hausse historique.

## Tableau complet — résultats de chaque année (2026 partiel)

*Capital suivi en continu : pas d'achat/vente fictif de réinitialisation au 1er janvier. Les cases négatives sont des pertes historiques du modèle ; elles ne sont ni retirées ni compensées dans la présentation.*

| Méthode | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | Jan.–sept. 2026 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Liquidités, témoin | 0.00 % | 0.00 % | 0.00 % | 0.00 % | 0.00 % | 0.00 % | 0.00 % | 0.00 % |
| Acheter et conserver, témoin | +93.82 % | +301.98 % | +59.79 % | -64.21 % | +155.61 % | +121.31 % | -6.33 % | -4.59 % |
| Tendance EMA20 > EMA50 | +119.43 % | +232.82 % | +93.64 % | -39.13 % | +80.27 % | +58.41 % | -0.80 % | +3.87 % |
| Tendance EMA50 > EMA200 | +37.28 % | +77.02 % | +13.98 % | -9.51 % | +63.30 % | +121.31 % | -1.45 % | +7.89 % |
| Clôture au-dessus de EMA200 | +73.71 % | +174.29 % | +7.13 % | -8.09 % | +64.20 % | +71.37 % | -8.70 % | +13.18 % |
| Momentum positif 90 jours | +144.13 % | +45.41 % | +46.53 % | -34.55 % | +59.79 % | +98.77 % | +13.72 % | -11.70 % |
| Momentum positif 180 jours | +7.47 % | +182.84 % | +13.92 % | -17.73 % | +45.42 % | +90.92 % | +1.87 % | +20.93 % |
| Cassure 20 j, sortie 10 j | +35.30 % | +172.47 % | +28.70 % | -37.44 % | +66.51 % | +24.92 % | -7.66 % | +7.95 % |
| Cassure 55 j, sortie 20 j | +67.41 % | +56.39 % | +19.76 % | -10.70 % | +27.38 % | +48.17 % | -4.03 % | -3.96 % |
| Cassure 20 j avec filtre EMA50/200 | +0.00 % | +86.65 % | -7.68 % | 0.00 % | +51.76 % | +24.92 % | -7.66 % | -3.75 % |
| Repli EMA10 avec filtre EMA50/200 | +49.39 % | +78.85 % | -6.57 % | 0.00 % | +10.64 % | +38.12 % | +9.25 % | -0.58 % |
| Rebond RSI35 au-dessus de EMA200 | +6.31 % | -3.46 % | +13.45 % | 0.00 % | +7.32 % | +1.73 % | -9.35 % | 0.00 % |
| Rebond RSI35 sans filtre EMA200 (ablation) | -5.77 % | +5.35 % | +8.22 % | -2.66 % | +8.58 % | +13.32 % | -7.49 % | -3.76 % |
| Retour à la moyenne, écart-type 2 sur 20 j | -1.55 % | +20.49 % | +25.31 % | -45.45 % | +49.63 % | +24.21 % | +19.89 % | -23.20 % |

## Les vraies leçons des échecs

**1. Perdant n'est pas synonyme de « bilan final négatif ».** Sur ce marché fortement haussier sur 7 ans et 9 mois, aucun de nos douze modèles n'a perdu de l'argent en cumul. Pourtant, **chacun a eu au moins une année négative** et onze ont sous-performé Buy & Hold au total. Une « bonne performance » sur une année ne justifie donc aucune conclusion définitive.

**2. EMA20/EMA50 : candidat intéressant, risque encore excessif.** Le rendement cumulé dépasse le Buy & Hold sur cet échantillon, et reste au-dessus avec les coûts doublés (**+2270.90 %** contre **+2145.82 %**). Mais il subit −39,13 % en 2022, 12 pertes sur 22 opérations et −51,68 % de drawdown. Sa supériorité apparente peut être un effet de sélection parmi 12 hypothèses. Il faut la tester sur une période **future non consultée** et idéalement plusieurs marchés.

**3. Filtre lent EMA50/200 : moins d'opérations, mais une hausse souvent ratée.** +863.06 % cumulés contre +2152.58 % pour l'achat-conservation, malgré seulement 7 opérations. Les filtres lents réduisent parfois l'exposition pendant des chutes ; ils n'évitent pas nécessairement des pertes importantes.

**4. Repli EMA10 : bon exemple de stratégie qui « gagne » mais ne bat pas le marché.** +314.38 % en cumul, **54 positions perdantes sur 79**, exposition d'environ 25 % du temps. Elle a gagné +9,25 % en 2025, mais la hausse 2023–2024 a beaucoup mieux profité au Buy & Hold. Une stratégie rentable ponctuellement n'est pas nécessairement une stratégie supérieure.

**5. Rebond RSI : connaître le coût de l'attente et les signaux rares.** Les compteurs indépendants trouvent **13** signaux RSI35 filtrés par la moyenne EMA200 et **57** sans ce filtre sur la période totale ; ils aboutissent à **12** et **38** opérations fictives. Le filtre réduit l'exposition et le nombre d'opérations, mais les gains cumulés restent faibles (**+15.24 %**, **+14.56 %** sans filtre). Supprimer un filtre après coup n'est pas une validation d'amélioration.

**6. Retour à la moyenne : perte sévère durant certaines tendances.** Le modèle à deux écarts-types perd **−45,45 % en 2022** et **−23,20 % sur janvier–septembre 2026**, malgré un bilan cumulé légèrement positif. Les « rebonds attendus » peuvent ne jamais venir avant l'activation des stops.

**7. Les frais révèlent les stratégies fragiles.** Exemple : repli +314.38 % → +226.87 % lorsque les coûts doublent ; retour à la moyenne +38.78 % → +11.43 %. Un calcul sans coûts serait trompeur.

## Décision de recherche pour les IA

Ne PAS sélectionner automatiquement le modèle au rendement maximal. Conserver l'inventaire intégral, y compris les échecs. Qualifier chaque futur candidat selon : rendement absolu, écart Buy & Hold à exposition comparable, pire perte, nombre de pertes et de gains, frais, dépendance aux années haussières/baissières, et existence de tests indépendants. Un modèle efficace uniquement dans des données déjà explorées reste **une hypothèse**.

**Candidat à vérifier sans toucher au Trader :** EMA20/EMA50. **Contre-exemples instructifs :** retour à la moyenne en 2022, cassure filtrée en 2025–2026, RSI rebond sur cycles entiers, et repli qui manque les grandes hausses. N'ajouter aucun ordre réel ; ne pas transformer ces simulations en conseils.

## Sources et preuves

- [Preuve intégrale des 14 simulations et des coûts doublés](./SEVEN_HEAVEN_BTC_SWING_WIN_LOSS_VERIFIED_EVIDENCE_2026_11_10.json) ; [méthode de recherche reproductible](./SEVEN_HEAVEN_BTC_SWING_WIN_LOSS_CATALOG_2026_11_10.py) ; [exécution GitHub Actions validée](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/42904207046).
- [Études précédentes Swing](./SEVEN_HEAVEN_BTC_SWING_EVIDENCE_BASED_REASSESSMENT_2026_11_10.md), [contrôle croisé Binance/OKX](./SEVEN_HEAVEN_OKX_BINANCE_CROSSVENUE_BTC_SWING_VERIFICATION_REPORT_2026_11_10.md). Le contrôle multi-source antérieur portait seulement sur trois méthodes et une fenêtre de six mois : il ne valide **pas** les 12 méthodes de ce rapport.
- [Charles Schwab, Swing Trading, 11 août 2026](https://www.schwab.com/learn/story/swing-trading-strategies) : pratiques courantes, risques de perte et discipline.
- [CFA Institute, Backtesting & Simulation, curriculum 2026](https://www.cfainstitute.org/insights/professional-learning/refresher-readings/2026/backtesting-and-simulation) : sensibilité aux hypothèses, scénarios et biais d'anticipation.
- [Bailey et López de Prado, *How Backtest Overfitting in Finance Leads to False Discoveries* (2021)](https://academic.oup.com/jrssig/article/18/6/22/7038278) : tester de nombreuses stratégies augmente le risque de faux gagnants.

**Limite fondamentale :** aucune collection finie ne représente « toutes les stratégies perdantes » possibles. Cette étude couvre **12 variantes déclarées et comparables**, conserve leurs pertes et propose une méthode pour élargir l'inventaire sans falsifier les conclusions.
