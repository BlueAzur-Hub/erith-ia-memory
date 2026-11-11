# Seven Heaven — SAR parabolique : étude des retournements BTC

**11 novembre 2026** · Recherche historique rétrospective, paramètres déclarés à l'avance, sur Spot uniquement.

## Comprendre le SAR

Le SAR de J. Welles Wilder place des points **sous** les prix lors d'une tendance haussière, et **au-dessus** lors d'une tendance baissière. Le changement de côté est un retournement hypothétique, non une prévision.
Dans l'expérience Spot : après un passage baissier→haussier sur **bougie quotidienne clôturée**, achat fictif le lendemain à l'ouverture ; après passage haussier→baissier, vente fictive à l'ouverture suivante et attente en liquidités.
**Aucun short ni vente automatique au niveau théorique SAR.** Il peut donc y avoir un écart important entre le niveau du point et l'exécution hypothétique.

## Définition / conventions figées

- Trois variantes prédéclarées, **sans optimisation postérieure** : standard 0,02/0,02/0,20 ; lente 0,01/0,01/0,10 ; rapide 0,04/0,04/0,20.
- Initialisation : direction première/ deuxième clôture ; SAR initial = extrême de la bougie précédente ; EP initial = extrême des deux premières ; facteur d'accélération remis au départ sur chaque inversion.
- À chaque bougie : candidat = SAR précédent + AF × (EP précédent − SAR précédent) ; tester retournement sur haut/bas **de cette bougie clôturée** ; sinon, clamp sur les deux bougies précédentes et mettre à jour EP/AF sur nouvel extrême.
- Cette convention est explicite, inspirée de la description de TradingView, **pas certifiée identique au SAR de l'interface Administrator** (qui peut avoir d'autres règles d'initialisation et un horizon 1h).
- La sensibilité rapide peut produire davantage d'inversions ; aucune variante n'est déclarée meilleure a priori.

## Sources, capital et témoins

- Binance Spot BTC/USDT, archive quotidienne du Coffre : 3 075 journées du 1er mai 2018 au 30 septembre 2026, vérifiée SHA-256 par le moteur existant.
- Portefeuille continu : **1er janvier 2019 – 30 septembre 2026**, 2 830 journées ; aucun redémarrage annuel.
- OKX Spot BTC/USDC : 447 journées déjà validées, du 21 août 2025 au 10 novembre 2026 ; comparaison appariée aux **183 jours avril–septembre 2026** sur Binance BTC/USDT.
- Une quatrième fenêtre suit sans redémarrage le portefeuille OKX d'avril jusqu'au 10 novembre 2026 : **224 jours**.
- Capital initial fictif 1 000 unités de cotation ; variante 100 % des liquidités ou 25 % par entrée ; frais **0,10 % par côté** et glissement **0,05 % par côté**, stress coûts doublés.
- Contrôles Buy & Hold 100 %, Buy & Hold 25 % et liquidités ; **baselines vérifiées identiques** aux résultats du moteur continu P01–P10 archivé.
- BTC/USDT et BTC/USDC sont deux paires différentes : cette comparaison ne fusionne pas leurs prix.

## Binance 2019–2026 : SAR et Buy & Hold

| Méthode | Rendement 25 % | Drawdown 25 % | Achats | Rendement 100 % | Drawdown 100 % |
|---|---:|---:|---:|---:|---:|
| SAR Wilder classique 0.02/0.02/0.20 | +67.07% | -24.79% | 119 | +298.73% | -71.21% |
| SAR plus lent 0.01/0.01/0.10 | +174.55% | -19.16% | 67 | +2509.89% | -60.03% |
| SAR plus rapide 0.04/0.04/0.20 | +86.15% | -22.99% | 182 | +485.44% | -66.41% |
| Buy & Hold 25 % | +538.14% | -65.78% | 1 | — | — |
| Buy & Hold 100 % | +2152.58% | -76.63% | 1 | — | — |
| Cash | +0.00% | 0.00% | 0 | — | — |

## 183 jours identiques, Binance / OKX

| Variante SAR à 25 % | Binance BTC/USDT | OKX BTC/USDC | Drawdown OKX | Achats OKX | Inversions de tendance OKX |
|---|---:|---:|---:|---:|---:|
| SAR Wilder classique 0.02/0.02/0.20 | +4.17% | +4.14% | -2.55% | 10 | 19 |
| SAR plus lent 0.01/0.01/0.10 | +3.03% | +3.02% | -3.59% | 5 | 9 |
| SAR plus rapide 0.04/0.04/0.20 | +3.60% | +3.56% | -2.44% | 12 | 25 |

## OKX 224 jours continus jusqu'au 10 novembre 2026

| Variante SAR à 25 % | Rendement | Drawdown | Achats | Résultat coûts doublés | SAR au 10 novembre / tendance calculée |
|---|---:|---:|---:|---:|---|
| SAR Wilder classique 0.02/0.02/0.20 | +2.97% | -2.92% | 11 | +2.12% | 78,370.01 / bearish |
| SAR plus lent 0.01/0.01/0.10 | +2.57% | -3.59% | 5 | +2.18% | 80,637.52 / bearish |
| SAR plus rapide 0.04/0.04/0.20 | +1.30% | -3.84% | 15 | +0.16% | 78,792.31 / bearish |

## Contradictions et risques

- **Aucun rendement historique** ne garantit le futur. Les trois réglages sont examinés tous, y compris en cas d'échec.
- Le SAR suit une tendance, il ne mesure pas sa force. Dans un range il peut enchaîner les faux signaux et les frais.
- Quand une bougie traverse le SAR, l'étude calcule la direction uniquement **après la clôture**, puis simule l'ouverture suivante ; elle ne suppose jamais que le stop historique est exécuté au point SAR.
- Un SAR configuré sur bougies quotidiennes n'a pas les mêmes valeurs ni les mêmes signaux que sur les bougies horaires de la capture Firefox.
- Ne pas convertir la direction calculée sur la dernière journée archivée en information du marché actuel : les prix peuvent avoir changé depuis.
- Test non prospectif, pas d'étude d'impact de marché ni des risques des stablecoins ; aucun transfert de paramètres dans le Trader.

## Provenance reproductible

- Script de ce backtest : SEVEN_HEAVEN_PARABOLIC_SAR_BTC_CONTINUOUS_BINANCE_OKX_RESEARCH_2026_11_11.py
- Journal des positions et résultats : SEVEN_HEAVEN_PARABOLIC_SAR_BTC_CONTINUOUS_BINANCE_OKX_RESEARCH_2026_11_11.json
- Capitalisation / témoins : SEVEN_HEAVEN_TEN_STRATEGIES_CONTINUOUS_BTC_BINANCE_OKX_BACKTEST_2026_11_11.py
- Source officielle de la logique : https://fr.tradingview.com/support/solutions/43000502597/
- Référence indépendante des limites : https://www.fidelity.com/learning-center/trading-investing/technical-analysis/technical-indicator-guide/PSAR
