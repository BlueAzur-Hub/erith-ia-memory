# ERITH.IA · Seven Heaven — Recette BTC réelle, fenêtre 2–10 novembre 2026

**Date : 10 novembre 2026. Statut : RECETTE PRÉLIMINAIRE sur données publiques, pas certification OKX native.**

## Contexte et architecture

Les actualités restent dans l'Interface Administrator ; le Trader conserve les graphiques et PAPER. Ce dossier exploite le moteur déjà publié dans le laboratoire, sans modifier le Trader, l'Interface, le Bridge ni un compte réel. Reprise par une autre IA possible sans image.

## Sources et différence de confiance

- [ChartExchange, vue OKX BTC/USDC](https://chartexchange.com/symbol/crypto-btcusdc/historical?exchange=okx) : 36 lignes OHLCV journalières UTC transcrites du 5 octobre au 9 novembre. **Source secondaire seulement** : l'étiquette OKX du relais ne constitue pas une réponse originale d'API OKX vérifiée. Les chiffres du Trader en 1j, potentiellement ancrés à une autre heure, ne sont pas équivalents.
- [Farside, flux ETF Bitcoin Spot américains](https://farside.co.uk/btc/) : six séances du 2 au 9 novembre, en millions de dollars, distinctes des volumes Spot OKX. Attention aux révisions.
- [Archive de l'Interface, news/latest.json](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/news/latest.json) : collecte du 10 novembre à 08:52:17 UTC, **9 articles sélectionnés** parmi 120, et non le corpus complet. Certains articles parlent d'un événement antérieur à leur date de publication.
- [État de la collecte](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/news/status.json) : 14/15 sources disponibles, `leverage=0` événements qualifiés sur 72h ; **cela ne signifie pas zéro liquidation sur les marchés**.

## Observations quotidiennes

| Date UTC | BTC/USDC clôture (USDC/BTC) | Variation ouverture/clôture | Volume journalier BTC* | Flux ETF US, M$ |
|---|---:|---:|---:|---:|
| 2 nov. | 76 710,10 | −2,00 % | 1 044 | −398,6 |
| 3 nov. | 77 367,20 | +0,85 % | 552 | −115,6 |
| 4 nov. | 80 451,40 | +3,98 % | 1 163 | +74,6 |
| 5 nov. | 75 994,30 | −5,52 % | 1 686 | −430,2 |
| 6 nov. | 75 756,80 | −0,32 % | 756 | −411,9 |
| 7 nov. | 75 777,40 | +0,03 % | 245 | **ETF fermés** |
| 8 nov. | 74 774,40 | −1,31 % | 926 | **ETF fermés** |
| 9 nov. | 74 825,00 | +0,06 % | 700 | −201,0 (revérifier les révisions) |

*Volumes selon ChartExchange, vus comme BTC et non comme dollars de liquidations. Total ETF 2–6 novembre : **−1 281,7 M$**.

**5 novembre :** simultanéité d'une forte bougie baissière et de sorties ETF. Volume 1 686 BTC contre 1 163 BTC la veille (×1,45). Aucun fait ne permet d'attribuer cette bougie à la vente d'un ETF particulier.

**Dimanche 8 novembre :** plus bas BTC/USDC indiqué **73 380 USDC** ; volume 926 BTC contre 245 BTC samedi (×3,78), tandis que le marché ETF américain était fermé. Il faudrait des données de liquidations dérivées horodatées pour qualifier une éventuelle cascade.

## Recette informatique exécutée

Lecture de 36 bougies réelles et 9 articles BTC, puis appel au moteur `SEVEN_HEAVEN_AGENT_CRYPTO_BTC_MARKET_NEWS_READ_ONLY_ANALYSIS_CORE.js` déjà publié.

- `status=MATCHED`, `market_candles=36`, `btc_events_qualified=9`, **7 fenêtres disponibles et 2 sans bougie postérieure complète** (articles du 9 novembre).
- EMA 5/13/34 = **75 622,10 / 77 134,97 / 80 106,51 USDC** (9 novembre) ; EMA5 < EMA13, **aucun nouveau croisement sur les deux dernières clôtures**. Amorçage EMA34 minimal sur 36 jours : valeurs non certifiées identiques au graphique de 300 bougies.
- Les 7 rapprochements **NE SONT PAS 7 CAUSES**. Le moteur ne mesure pas une réaction à la minute ; un article du 5 novembre à 16:29 est comparé à des bougies complètes de jours ultérieurs. Un article dominical sur les ETF peut relater le vendredi précédent.
- `quantitative_etf_flows_verified=false` et `quantitative_derivatives_liquidations_verified=false` restent faux **dans le moteur** : les chiffres Farside sont une table externe et la recherche de liquidations natives n'a pas été achevée.
- **31 tests automatisés passés localement** : 24 du prototype + 7 du jeu réel dans le ZIP de la recette. Le fichier `run_seven_real_market_recipe.cjs` publié est reproductible hors réseau.

## Comment reproduire

Depuis le dossier du prototype contenant le module principal :

    node real_data_recipe/run_seven_real_market_recipe.cjs

Le script lit les CSV/TSV publics, contrôle 7 rapprochements et 2 absences, refuse les ordres réels et génère le résultat JSON. Il ne télécharge rien et ne touche pas aux comptes.

## Ce qui reste à certifier

1. Données Spot **BTC-USDC natives de l'API OKX**, avec horaire d'ancrage et bit `confirm`; version horaire 1h ou minute, source et empreinte.
2. Flux ETF et périodes d'exécution : Farside agrège par séance, ne fournit pas l'heure de chaque trade sur OKX.
3. Liquidations de dérivés horodatées et identifiées par plateforme : ne pas déduire leur montant des volumes Spot.
4. Recette Firefox sur l'application : non réalisée ; aucune intégration Trader, Administrator ou Bridge.

**Décision :** prototype analytique validé avec jeu réel secondaire ; preuve de causalité et certification OKX native **NON établies**. Pas de signal d'achat ni d'ordre. Reprendre l'audit avec l'API OKX native et des bougies 1h.
