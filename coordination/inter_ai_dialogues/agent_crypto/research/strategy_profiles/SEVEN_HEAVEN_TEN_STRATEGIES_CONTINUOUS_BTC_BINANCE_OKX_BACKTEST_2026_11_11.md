# Seven Heaven — Backtest CONTINU : dix méthodes Bitcoin, puis contrôle OKX

**Datation : 11 novembre 2026.** Statut : backtest pédagogique indépendant, recherche rétrospective, jamais une preuve de performance future.

## Corpus et protocole

- **Archive canonique Binance Spot BTC/USDT** : 3 075 bougies 1 jour, du 1er mai 2018 au 30 septembre 2026, SHA-256 contrôlé.
- **Période continue principale** : 1er janvier 2019 – 30 septembre 2026, **2 830 journées**, portefeuille fictif de 1 000 USDT **jamais réinitialisé** chaque année.
- **OKX BTC/USDC** : 447 bougies 1Dutc déjà qualifiées et enregistrées ; mêmes dates de préchauffage (21 août 2025), comparaison Binance–OKX **1er avril – 30 septembre 2026 (183 jours)**.
- Le test continu OKX couvre aussi avril – 10 novembre 2026 (224 jours) sans réinitialisation le 1er octobre.
- Signaux exclusivement sur **clôtures déjà connues** ; ventes/achats simulés à **l'ouverture du jour suivant**. Les achats calendrier Buy & Hold et DCA sont planifiés à l'avance et exécutés à l'ouverture du jour connu.
- Capital fictif de départ 1 000 unités de cotation ; profils **100 % et 25 % d'allocation** (pour les signaux : fraction des liquidités au moment de chaque entrée). Frais **0,10 % / côté**, glissement supposé **0,05 % / côté**, coûts doublés comme stress. Liquidités non investies sans rendement ni risque d'émetteur.
- DCA12 : **une fois**, douze mensualités de 1/12 du budget initial, chaque 22 du mois ; **aucun versement externe**. Sur 224 jours la fenêtre n'en contient que 7 ou 8 : le DCA reste partiellement déployé ; ne pas le comparer comme un DCA perpétuel.
- Toutes les positions restantes sont clôturées **fictivement** en fin de fenêtre pour comparer le capital net, sans implication de vente réelle.
- Nous conservons **les dix méthodes P01–P10** et un témoin liquidités. Ce nouveau moteur réimplémente explicitement leurs règles pédagogiques, **mais ne revendique PAS une reproduction bit-à-bit du moteur original de novembre 7**, qui n'a pas été retrouvé sous forme exécutable. Résultats anciens annuels et nouveaux résultats continus doivent rester séparés.

## Paramètres précis à connaître

- EMA 5/13 et EMA 10/20 : croisement haussier des deux EMA pour entrer, croisement baissier pour sortir.
- SMA 50/200 : croisements de deux moyennes simples.
- MACD 12/26/9 : croisement de la ligne MACD et de la ligne signal EMA9.
- RSI14 Wilder : achat si RSI < 30 et sortie si RSI > 55 (signal à la clôture).
- Bollinger 20/2 : achat si clôture sous moyenne - 2 écarts types population ; vente après clôture au-dessus de SMA20.
- Breakout 20/10 : achat si clôture dépasse le plus haut des **20 bougies précédentes**, sortie sous plus bas des **10 bougies précédentes** ; sans anticipation.
- SuperTrend 10×3 : ATR Wilder 10 jours et bandes médianes ×3 ; transition bearish→bullish uniquement sur franchissement à la clôture de la bande finale **précédente**, et vice versa. Initialisation bearish, implémentation illustrative. Une autre convention SuperTrend peut donner des résultats différents.
- Aucun arrêt-loss supplémentaire n'a été inventé pour les règles qui n'en avaient pas.

## Résultats de la période Binance continue (2019 à septembre 2026)

| Méthode | Rendement 100 % | Drawdown max. 100 % | Rendement 25 % | Drawdown max. 25 % | Entrées à 100 % | Plus longue période sous sommet à 25 % |
|---|---:|---:|---:|---:|---:|---:|
| Buy & Hold | +2152.576% | -76.629% | +538.144% | -65.780% | 1 | 846 j |
| DCA: 12 mensualités, budget initial fixe | +1213.378% | -76.629% | +303.345% | -59.733% | 12 | 846 j |
| EMA 5/13 | +2245.868% | -48.553% | +175.262% | -15.374% | 89 | 753 j |
| EMA 10/20 | +2667.927% | -62.392% | +222.763% | -21.473% | 55 | 827 j |
| SMA 50/200 | +663.162% | -66.812% | +121.834% | -35.059% | 9 | 1996 j |
| MACD 12/26/9 | +979.944% | -54.252% | +112.679% | -15.990% | 103 | 1087 j |
| RSI14 achat sous 30, sortie au-dessus 55 | +51.745% | -49.191% | +15.306% | -13.644% | 16 | 1154 j |
| Bollinger 20/2 | -6.744% | -53.152% | +3.304% | -16.189% | 44 | 1237 j |
| Cassure haut 20j / sortie bas 10j | +1458.786% | -54.182% | +191.692% | -20.345% | 39 | 1086 j |
| SuperTrend 10×3 (convention explicitée) | +988.979% | -53.807% | +142.661% | -20.151% | 33 | 1144 j |
| Liquidités fictives — témoin | +0.000% | 0.000% | +0.000% | 0.000% | 0 | 0 j |

**Attention :** un modèle investi 25 % des liquidités à chaque signal n'a pas la même exposition qu'un portefeuille alloué une seule fois à 25 %, ni qu'un DCA financé chaque mois par de nouveaux versements.

## Contrôle indépendant : mêmes 183 jours Binance / OKX

| Méthode | Binance 25 % | OKX 25 % | DD OKX à 25 % | Nombre d'achats OKX |
|---|---:|---:|---:|---:|
| Buy & Hold | +5.524% | +5.580% | -8.230% | 1 |
| DCA: 12 mensualités, budget initial fixe | +1.589% | +1.587% | -1.315% | 6 |
| EMA 5/13 | +8.668% | +8.773% | -1.815% | 5 |
| EMA 10/20 | +5.800% | +5.736% | -3.052% | 4 |
| SMA 50/200 | +1.567% | +1.549% | -0.988% | 1 |
| MACD 12/26/9 | +4.311% | +4.306% | -3.175% | 9 |
| RSI14 achat sous 30, sortie au-dessus 55 | -0.716% | -0.708% | -3.109% | 1 |
| Bollinger 20/2 | -2.738% | -2.724% | -5.392% | 2 |
| Cassure haut 20j / sortie bas 10j | +4.223% | +4.190% | -3.007% | 3 |
| SuperTrend 10×3 (convention explicitée) | +6.637% | +6.589% | -3.644% | 2 |
| Liquidités fictives — témoin | +0.000% | +0.000% | 0.000% | 0 |

## Contrôle OKX continu : 1er avril – 10 novembre 2026

| Méthode | Rendement 25 % | DD max. 25 % | Achats | Années touchées |
|---|---:|---:|---:|---|
| Buy & Hold | +1.974% | -8.230% | 1 | 2026 |
| DCA: 12 mensualités, budget initial fixe | -0.335% | -2.390% | 7 | 2026 |
| EMA 5/13 | +7.198% | -2.357% | 6 | 2026 |
| EMA 10/20 | +5.021% | -3.052% | 4 | 2026 |
| SMA 50/200 | -1.581% | -3.996% | 1 | 2026 |
| MACD 12/26/9 | +4.306% | -3.175% | 9 | 2026 |
| RSI14 achat sous 30, sortie au-dessus 55 | -0.708% | -3.109% | 1 | 2026 |
| Bollinger 20/2 | -1.992% | -5.392% | 3 | 2026 |
| Cassure haut 20j / sortie bas 10j | +3.622% | -3.506% | 3 | 2026 |
| SuperTrend 10×3 (convention explicitée) | +4.439% | -3.644% | 2 | 2026 |
| Liquidités fictives — témoin | +0.000% | 0.000% | 0 | 2026 |

## Réserves / ce qui reste à vérifier

- Toutes les données historiques ont déjà été vues par les chercheurs. Ce test est **rétrospectif et in-sample sur les hypothèses générales**, pas une validation prospective.
- La courte fenêtre commune n'offre pas assez d'opérations pour juger statistiquement les méthodes peu actives ; un zéro opération n'est pas une stratégie « sans risque ».
- Aucun test d'exécution réelle des stops, carnet d'ordres, impact de marché ou arbitrage de prix entre BTC/USDT et BTC/USDC.
- Une bonne année 2022 ou un cycle complet favorable ne prouve rien pour une future correction du BTC.
- Le patrimoine personnel conservé en Swing Trading / Buy & Hold n'est pas modélisé, car les dates et montants réels de tous les achats ne sont pas nécessaires à cette étude générale.
- Ajouter un protocole prospectif figé, et réconcilier méthodologiquement chaque méthode avec les simulations annuelles anciennes avant de parler de réplication exacte.

## Traçabilité / partages

- Script : SEVEN_HEAVEN_TEN_STRATEGIES_CONTINUOUS_BTC_BINANCE_OKX_BACKTEST_2026_11_11.py
- Tableau et journal des opérations, provenance : SEVEN_HEAVEN_TEN_STRATEGIES_CONTINUOUS_BTC_BINANCE_OKX_BACKTEST_2026_11_11.json
- Courbes continues Binance 25 % : SEVEN_HEAVEN_TEN_STRATEGIES_CONTINUOUS_BTC_BINANCE_OKX_BACKTEST_2026_11_11.csv
- Ancien dossier des dix méthodes, protocoles annuels différents : SEVEN_HEAVEN_AGENT_CRYPTO_STRATEGY_FIELD_GUIDE_COFFRE_SIMULATIONS_AND_PAPER_PROFILES_2026_11_07.md
- Archive historique et contrôle OKX : voir les liens de provenance contenus dans le JSON.
