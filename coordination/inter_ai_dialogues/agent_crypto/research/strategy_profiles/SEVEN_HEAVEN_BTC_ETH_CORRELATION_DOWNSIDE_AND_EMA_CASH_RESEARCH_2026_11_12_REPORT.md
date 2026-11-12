# Seven Heaven — Corrélation BTC/ETH, baisses simultanées et protection des portefeuilles EMA

**Date :** 12 novembre 2026  
**Nature :** prolongement documentaire d'une simulation PAPER historique, lecture seule  
**Statut :** calcul complémentaire sur la courbe quotidienne déjà publiée ; aucun nouvel ordre ni modification de paramètres

## Question conservée du fil Crypto

> Les signaux BTC et ETH deviennent-ils baissiers en même temps ? Et combien de risque la diversification élimine-t-elle réellement lorsque les deux cryptomonnaies chutent ensemble ?

Il faut distinguer trois objets : (1) corrélation des baisses de prix BTC et ETH ; (2) diversification par deux positions buy-and-hold, initialement 50/50 mais **jamais rééquilibrées** ; (3) filtrage EMA 10/30 propre à chaque poche, qui peut la remettre en liquidités USDT. Il serait erroné d'attribuer toute réduction de drawdown à la seule diversification.

## Source et contrôle

- **Série quotidienne originale de l'étude précédente :** [CSV, 1 035 jours](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_BTC_ETH_EQUAL_DATE_EMA_DUAL_PORTFOLIO_REPLAY_2026_11_12_EQUITY_DAILY.csv).
- **Rapport de simulation source :** [BTC + ETH, EMA 50/50](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_BTC_ETH_EQUAL_DATE_EMA_DUAL_PORTFOLIO_REPLAY_2026_11_12_REPORT.md).
- **Règles figées avant cette simulation :** [protocole du 12 novembre](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_BTC_ETH_EQUAL_DATE_EMA_DUAL_PORTFOLIO_FROZEN_PROTOCOL_2026_11_12.md).
- **Source secondaire calculée aujourd'hui :** GitHub `main`, blob SHA-1 du CSV `c8ed2a206ea616ea87eeb83e31f7138d5b131588`, contenu de 88 734 caractères, 1 035 lignes de données, 2024-01-01 au 2026-10-31. Égalité arithmétique des deux poches de la série mixte contrôlée à une erreur d'arrondi près.
- **Précaution :** les variations quotidiennes des lignes `btc_hold` et `eth_hold` sont utilisées comme substituts des variations Spot : les quantités de pièces du Buy & Hold ne changent pas, de sorte que les ratios de valeurs successives se simplifient en ratios de prix. Le rendement du premier jour n'est pas calculable sans la veille ; cela donne **1 034 paires de rendements quotidiens**. Les huit archives sources et leurs SHA-256 sont documentés dans le rapport précédent, **mais n'ont pas été téléchargés à nouveau dans cette étude**.

## 1. BTC et ETH baissent très souvent ensemble

| Fenêtre UTC | Paires de rendements quotidiens | Corrélation de Pearson BTC/ETH | Journées où les deux baissent |
|---|---:|---:|---:|
| 2024 (02/01–31/12) | 365 | **0,795** | 138 |
| 2025 | 365 | **0,816** | 143 |
| Janv.–oct. 2026 | 304 | **0,912** | 136 |
| **Total** | **1 034** | **0,820** | **417** |

Sur les 1 034 observations comparables, BTC baisse **512** journées, ETH baisse **507** journées, et les deux baissent simultanément **417** journées. Lorsque BTC baisse, ETH baisse aussi dans **81,45 %** des cas constatés ; ce taux est une fréquence historique descriptive, **pas** une probabilité future calibrée. La corrélation très élevée en janvier–octobre 2026 montre que les deux séries ont été particulièrement synchronisées durant cette fenêtre.

**Stress quantile :** sur les **52 pires journées de rendement BTC** (seuil historique environ −3,64 %), ETH recule **51 fois**. Le rendement ETH moyen de ces journées est **−6,65 %**. Pendant ces mêmes journées, la variation moyenne du portefeuille Buy & Hold 50/50 est **−5,75 %** et celle du portefeuille EMA 50/50, **−1,92 %**. Ces valeurs comparent les trajectoires historiques, elles ne sont pas des prévisions.

## 2. Que protège réellement la diversification 50/50 ?

Mesure : dispersion (écart-type non annualisé) des variations quotidiennes de valorisation, sans rééquilibrage du portefeuille mixte.

| Série | Volatilité quotidienne observée | Drawdown maximal déjà documenté |
|---|---:|---:|
| BTC Buy & Hold seul | **2,45 %** | **−52,97 %** |
| ETH Buy & Hold seul | **3,52 %** | **−67,55 %** |
| BTC/ETH Buy & Hold 50/50 | **2,71 %** | **−58,50 %** |
| BTC/ETH EMA 50/50 | **1,66 %** | **−41,92 %** |

Le mélange 50/50 réduit le risque mesuré **par rapport à ETH seul**, mais augmente ici la volatilité et la perte maximale **par rapport à BTC seul**. La corrélation élevée limite la protection qu'apporte l'association des deux actifs. Il s'agit de la trajectoire réellement simulée, avec poids qui dérivent, **pas d'une estimation pour un portefeuille rééquilibré 50/50 chaque jour**.

## 3. EMA : protection par réduction d'exposition, et non par magie de diversification

Dans les **1 035 lignes quotidiennes du fichier**, la ventilation des positions est :

| État des deux poches EMA | Jours | Part des jours |
|---|---:|---:|
| BTC et ETH tous les deux en liquidités | **473** | **45,70 %** |
| BTC et ETH tous les deux exposés | **367** | **35,46 %** |
| BTC seul exposé | 119 | 11,50 % |
| ETH seul exposé | 76 | 7,34 % |

Le filtre EMA laisse les deux poches en USDT près de la moitié du temps. Ce mécanisme explique une partie substantielle de la baisse des fluctuations ; il apporte aussi **un risque de sous-performance lors des rebonds, des frais de rotation et un risque USDT non modélisé**.

Deux exemples historiques décrits par les séries, sans causalité attribuée :

- **5 février 2026 :** BTC **−14,02 %**, ETH **−14,96 %**, Buy & Hold mixte **−14,35 %** ; la courbe EMA mixte est **inchangée ce jour-là** parce que le portefeuille était en liquidités.
- **19 mars 2024 :** BTC **−8,39 %**, ETH **−10,28 %**, Buy & Hold mixte **−9,32 %** et EMA mixte **−9,27 %** ; le filtre n'a donc **pas** évité cette baisse.

Les états `btc_exposed` / `eth_exposed` sont des traces de la simulation d'origine, pas des recommandations ni des signaux opérationnels actuels.

## 4. Conclusion scientifique

**Question 1 — Baissent-ils ensemble ?** Oui, fréquemment dans cet échantillon : corrélation **0,820**, 417 séances de baisse simultanée, et 51 baisses ETH parmi les 52 pires journées BTC. 2026 présente une synchronisation particulièrement forte (**0,912**).

**Question 2 — Le 50/50 élimine-t-il beaucoup de risque ?** **Non, pas le risque de marché commun.** Il atténue les résultats extrêmes d'ETH mais n'a pas mieux protégé le capital que BTC seul sur cette période. Le portefeuille non rééquilibré 50/50 présente une perte maximale de **58,50 %**.

**Question 3 — Pourquoi l'EMA mixte baisse-t-elle moins ?** Elle coupe une partie de l'exposition aux actifs en les remplaçant temporairement par des liquidités, mais cette protection peut échouer pendant certaines chutes et sa rentabilité dépend fortement des frais : l'étude antérieure montre **+2,74 %** devenant **−0,24 %** en janvier–octobre 2026 avec coûts doublés.

**Limites :** simulation rétrospective sur des périodes déjà explorées, corrélation susceptible de varier selon la fenêtre, absence d'intervalle de confiance ou de validation prospective, marqueurs EMA préexistants, pas de collecte nouvelle, pas de prise en compte exhaustive du risque des stablecoins ou du slippage réel OKX. **Corrélation ≠ causalité ; aucun ordre réel.**

## Reproduction et périmètre

Un script Python autonome est fourni : `SEVEN_HEAVEN_BTC_ETH_CORRELATION_DOWNSIDE_AND_EMA_CASH_RESEARCH_2026_11_12.py`. Il récupère le CSV public ou accepte `--csv CHEMIN` et refuse un contenu ne correspondant pas au blob GitHub fixé. `--selftest` est validé localement ; **sa réexécution sur le CSV complet dans Python n'a pas été validée dans cet environnement réseau**, même si les métriques ci-dessus ont été recalculées directement sur toutes les lignes renvoyées par le connecteur GitHub.

**Publication :** ce rapport, son script Python et ses preuves structurées sont conservés dans ce même répertoire de recherche partagé. Aucune modification Notion, Administrator, Trader, Operator ou Bridge ; aucun ordre réel.