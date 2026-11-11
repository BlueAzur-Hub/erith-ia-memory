# Seven Heaven — Retournements du Bitcoin : latence EMA, SuperTrend, volatilité et coût des sorties

**Date :** 11 novembre 2026 · **Statut :** étude rétrospective PAPER, lecture seule, aucun ordre réel.
**Instrument étudié :** Binance Spot BTC/USDT en bougies natives de 1 minute, et non OKX BTC/USDC de l’Administrator.

## Question

Les EMA, le SuperTrend et la volatilité peuvent-ils réagir aux retournements à temps, **sur la base des seules journées déjà clôturées**, et que valent les portefeuilles fictifs en tenant compte des allers-retours et des frais ?

Cette étude isole le **signal directionnel** en étudiant un arbitrage fictif *100 % BTC / 100 % liquidités* ; **aucune grille d’ordres n’est simulée ici**. Les études antérieures de Spot Grid restent distinctes.

## Provenance et contrôles

- Les 16 ZIP de bougies natives Binance Spot BTC/USDT déjà fournis ont été ouverts, vérifiés SHA-256 et contrôlés ligne à ligne : **698 400 minutes**, sans lacune, au sein des trois plages disjointes (2024 T1 : 131 040 min, 2025 T1 : 129 600 min, 2026 janvier–octobre : 437 760 min).
- Bougies quotidiennes OHLC UTC dérivées de ces données natives ; le calcul ne fait intervenir aucune actualité, API de compte ou ordre.
- Chaque période utilise **janvier pour le chauffage des indicateurs** et commence le portefeuille fictif à **1 000 USDT au 1er février à 00:00 UTC**, afin de comparer les méthodes avec le même capital initial et le même horizon.
- Le signal du jour D utilise la clôture de D et les jours antérieurs ; une opération hypothétique s’effectue uniquement à **l’ouverture de D+1**, jamais à la clôture qui produit le signal.
- Coûts fictifs : commission de **0,10 % par côté** et glissement **0,05 % par côté** (achat/vente) ; scénario de stress à coûts ×2 ; valorisation quotidienne liquidable nette des coûts de vente estimés.
- **152 assertions de causalité** : recalcul d’indicateurs et d’états sur des préfixes tronqués (sans les jours futurs), résultats identiques aux calculs complets.

## Politiques non optimisées

1. **Buy & Hold** : achat BTC le 1er février, pas de sortie avant la fin.
2. **EMA 10/30** : long BTC si EMA10 > EMA30 et clôture > EMA30 ; sinon tout en liquidités.
3. **SuperTrend** : long BTC lorsque le SuperTrend quotidien utilisant ATR Wilder 14 ×3 est haussier ; sinon liquidités. **Même convention illustrative que l’étude précédente**, sans équivalence certifiée avec le graphique 15 min/1 h de l’Administrator.
4. **ATR > 5 %** : long BTC si ATR14/clôture ≤ 5 %, sinon liquidités. L’ATR mesure la volatilité et **n’indique pas la direction**.
5. **Protection 30 jours** : dernier plus haut de clôture sur 30 jours ; passage en cash quand le drawdown de clôture atteint 10 %, réentrée lorsque le drawdown s’améliore au-dessus de −5 %. Cette règle n’est pas un stop intraminute et n’a pas été choisie par optimisation du rendement.

Ces choix sont pédagogiques, préfixés dans le code de cette étude ; ils ont été conçus après connaissance générale des périodes, donc **pas de validation hors échantillon / prospective**.

## Résultats nets des portefeuilles fictifs

| Politique | 2024 fév.–mars | 2025 fév.–mars | 2026 fév.–oct. | Transactions 2026 (achats + ventes) |
|---|---:|---:|---:|---:|
| Buy & Hold 100 % BTC | +66.90 % | -19.65 % | -1.77 % | 1 |
| EMA 10/30 | +45.86 % | -5.78 % | +3.24 % | 24 |
| SuperTrend ATR 14 × 3 | +31.02 % | -25.93 % | +15.80 % | 4 |
| ATR 14 > 5 % : position cash | +66.20 % | -20.58 % | -13.48 % | 5 |
| Stop drawdown 30j (−10 % ; reprise −5 %) | +55.50 % | -10.89 % | +13.58 % | 6 |

### Risque et stress 2026

| Politique | Pire baisse quotidienne | Coûts normaux | Coûts ×2 |
|---|---:|---:|---:|
| Buy & Hold 100 % BTC | -28.69 % | -1.77 % | -2.06 % |
| EMA 10/30 | -11.76 % | +3.24 % | -0.42 % |
| SuperTrend ATR 14 × 3 | -14.78 % | +15.80 % | +15.11 % |
| ATR 14 > 5 % : position cash | -34.62 % | -13.48 % | -14.25 % |
| Stop drawdown 30j (−10 % ; reprise −5 %) | -13.04 % | +13.58 % | +12.56 % |

**Discernement :** en 2026, SuperTrend affiche +15,80 % avec seulement quatre transactions fictives, tandis que l’EMA effectue 24 transactions et son +3,24 % devient **−0,42 %** lorsque les coûts sont doublés. C’est le risque de va-et-vient (*whipsaw*) ; cela ne prouve pas que SuperTrend aura les mêmes qualités à l’avenir.

## Épisodes de baisse : les retards mesurés

**Définition du repère d’évaluation :** premier jour où la clôture baisse d’au moins 10 % sous le plus haut des 30 clôtures précédentes (jour courant inclus). L’épisode se termine lorsque le drawdown repasse au-dessus de −5 %. Ces seuils sont calculables au jour le jour ; le regroupement a posteriori ne sert qu’à décrire les résultats.

| Date du seuil −10 % | Baisse réelle depuis pic de clôture 30j | EMA au seuil | SuperTrend au seuil | ATR >5 % au seuil |
|---|---:|---|---|---|
| 2024-03-16 | -10.64 % | Retrait après 3 j | Retrait après 3 j | Déjà en retrait |
| 2025-02-24 | -12.58 % | Déjà en retrait | Déjà en retrait | Retrait après 7 j |
| 2026-02-01 | -20.61 % | Déjà en retrait | Déjà en retrait | Retrait après 4 j |
| 2026-03-27 | -11.32 % | Déjà en retrait | Pas de signal dans la fenêtre observée | Pas de signal dans la fenêtre observée |
| 2026-05-28 | -10.45 % | Déjà en retrait | Déjà en retrait | Pas de signal dans la fenêtre observée |
| 2026-10-30 | -10.59 % | Déjà en retrait | Déjà en retrait | Pas de signal dans la fenêtre observée |

**Attention au vocabulaire :** « déjà en retrait » décrit **l’état de l’indicateur au soir du seuil**. L’exécution fictive peut avoir eu lieu avant, sur l’ouverture suivante, ou il pouvait ne jamais y avoir eu d’achat. Le détail réel des transactions est conservé dans le JSON. Les événements de fin octobre 2026 sont **censurés à la fin des données** : « pas de signal » ne signifie pas « jamais ».

### Exemple : février–mars 2025, retournement puis faux rebond

- Le **1er février 2025**, clôture BTC/USDT : **100 635,65 USDT**. L’EMA constate un état baissier en fin de journée et le portefeuille EMA vend fictivement **le 2 février**, puis rachète le 4 et revend le 5.
- Le SuperTrend reste haussier jusqu’au **24 février** et ne vend fictivement que **le 25 février**, à un cours d’ouverture de **91 552,88 USDT**.
- La différence entre la clôture du 1er février et ce prix de sortie atteint **−9,03 %**, soit environ **−90,25 USDT** de variation sur une position théorique constante de 1 000 USDT, avant frais. **Ce chiffre est illustratif, non la perte complète du portefeuille SuperTrend**.
- Le SuperTrend **rachète le 3 mars**, puis **revend le 11 mars** après une nouvelle baisse : ce va-et-vient explique en partie sa mauvaise performance finale (**−25,93 %** sur la fenêtre), contre **−19,65 %** pour le témoin Buy & Hold démarrant lui aussi le 1er février.
- Le seul filtre ATR >5 % n’active sa sortie que le **3 mars au soir**, avec vente fictive le **4 mars à l’ouverture** vers **86 221,16 USDT** : **−14,32 %** de variation du prix depuis la clôture du 1er février (en dehors des frais).

### Exemple : mars 2024, baisse rapide après un sommet

- Pic de clôture du **13 mars : 73 072,41 USDT** ; seuil de baisse franchi le **16 mars**, clôture **65 300,63 USDT** (**−10,64 %**).
- EMA et SuperTrend restent haussiers au soir du 16 mars et deviennent baissiers **le 19 mars**, soit **trois jours après** le seuil. L’ouverture hypothétique de sortie est le 20 mars. Entre la clôture du 16 et celle du 19, le cours recule encore de **5,15 %**.
- L’ATR >5 % avait activé un passage en liquidités plus tôt, avec une vente fictive **le 16 mars**. Cela n’implique pas que la volatilité aurait toujours anticipé les autres retournements.

### Exemple : 2026, peu d’allers-retours mais pas de couverture universelle

- La méthode EMA a produit **24 transactions fictives** en neuf mois, contre **4** pour SuperTrend : moins de croisements réduit ici les coûts sans constituer une preuve de rentabilité future.
- Le **27 mars 2026**, le retrait de 11,32 % depuis un pic mobile est détecté alors que SuperTrend est encore haussier ; il ne bascule pas en risque-off dans les 30 jours observés après ce seuil. Cette baisse n’est pas nécessairement le commencement d’un marché durablement baissier.
- L’ATR >5 % tarde ou ne déclenche rien lors de plusieurs baisses 2026, illustrant qu’une mesure de volatilité seule ne suffit pas à détecter la direction.

## Limites et risques de surinterprétation

- Trois **fenêtres historiques non indépendantes de la conception des règles** ; janvier de chaque période n’est pas inclus dans le capital de ce test car utilisés pour chauffer les indicateurs. Les résultats ne peuvent pas être fusionnés avec ceux du précédent backtest janvier–mars.
- **SuperTrend initialise sa tendance selon la convention du moteur précédent** ; une autre bibliothèque ou une interface graphique peut donner d’autres bascules. Aucun raccordement à l’Administrator.
- Les niveaux d’ATR 5 %, drawdown 10 %, relance à 5 % sont des seuils de test **non optimisés**, non validés prospectivement.
- Les transactions quotidiennes sont exécutées fictivement au cours d’ouverture du lendemain ; vrais carnets, queues d’ordres, latences, spread et minima OKX ne sont pas vérifiés. Fiscalité exclue.
- Drawdown maximal mesuré **sur les valeurs liquidables de fin de journée**, pas sur le plus bas intraminute.
- Le seuil −10 % n’est **pas** une sortie au sommet ; comparer un prix de sortie à un pic connu rétrospectivement serait une norme inatteignable. Les exemples de prix de vente sont des illustrations de retard, pas des P&L attribuables à une décision optimale.
- Aucun signal n’est un conseil ou une instruction d’achat/vente. Ce sont des tests PAPER et des indicateurs, non une validation en conditions réelles.

## Vérification et fichiers publiables

- `SEVEN_HEAVEN_BTC_REVERSAL_LATENCY_EMA_SUPERTREND_VOLATILITY_2026_11_11.py` : script reproductible, vérifications SHA et minute, génération des indicateurs, état journalier, opérations fictives, contrôle de préfixe contre les fuites de futur.
- `SEVEN_HEAVEN_BTC_REVERSAL_LATENCY_EMA_SUPERTREND_VOLATILITY_2026_11_11_PROOFS.json` : sources, trois périodes, résultats détaillés, 152 assertions de causalité, transactions fictives, événements évalués, stress des coûts.
- `SEVEN_HEAVEN_BTC_REVERSAL_LATENCY_EMA_SUPERTREND_VOLATILITY_2026_11_11_EQUITY_DAILY.csv` : valeurs quotidiennes nettes et exposition BTC des cinq politiques.
- `SEVEN_HEAVEN_BTC_REVERSAL_LATENCY_EMA_SUPERTREND_VOLATILITY_2026_11_11_DRAWDOWN_EVENTS.csv` : événements −10 % contrôlés, sans interprétation causale de marché.

**Règle d’arrêt :** pas de sélection d’un « gagnant » tant qu’un test réellement hors échantillon et une observation PAPER prospective n’ont pas confirmé les résultats. Aucun changement de l’Administrator, de l’Operator, du Trader ni du Bridge R31.
