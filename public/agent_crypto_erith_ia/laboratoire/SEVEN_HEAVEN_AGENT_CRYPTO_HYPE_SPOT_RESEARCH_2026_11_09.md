# Seven Heaven — HYPE / Hyperliquid : dossier Top 10, liquidité OKX et frontières du protocole

**Étude du 9 novembre 2026 · Rang 8 de notre Top 10 canonique · Lecture seule.**
Complément à la monographie HYPE déjà présente dans la [bibliothèque des 50 actifs](./SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md) et au [dossier source préexistant](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/research/hyperliquid.json), blob `63bd59f3e1ee080657c2e6ffd4f15866f9c280ff`.

> **Décision :** 59 carnets publics Spot `HYPE-USDC` d'OKX sont conservés et 299 bougies par intervalle sont indexées dans une archive roulante. Ces pièces ne sont pas des carnets de la plateforme Hyperliquid elle-même. Elles ne démontrent ni un remplissage réel, ni des frais propres au compte, ni un PAPER reproductible certifié.

## 1. Marché du 9 novembre : comparer à un horodatage commun

[Source CoinGecko MASTER](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/latest.json), blob `4f1f33162f2bf729f5772562e15a60fdb7017075`, snapshot `2026-11-09T07:53:59.646Z`, actif actualisé `2026-11-09T07:52:59Z`.

- HYPE : **73,0254 USD**, rang CoinGecko **#11** dans ce snapshot (différent du rang documentaire 8).
- Variation HYPE : **−5,48221 %** sur 24 h ; **−15,4329 %** sur 7 jours ; **−12,1970 %** sur 30 jours.
- Variation BTC au même instant : −2,57318 %, −5,1455 % et −10,2806 %.
- Écarts HYPE − BTC : **−2,90903 points** sur 24 h ; **−10,2874 points** sur 7 j ; **−1,9164 point** sur 30 j.

La sous-performance de HYPE, particulièrement sur sept jours, est **descriptive**. Elle ne prouve ni liquidations dans une position particulière, ni une trajectoire future. Les prix CoinGecko sont en **USD**, les carnets OKX étudiés en **USDC**.

## 2. Carnets historiques HYPE-USDC sur OKX (24–28 octobre)

Les cinq fichiers datés du collecteur `OKX_EEA_PUBLIC_REST` donnent **59 instantanés Spot à cinq niveaux**, tous en lecture seule (`orders_enabled=false`, `real_orders=0`, `market_fill_proven=false`).

| Jour | Carnets | Source Git et SHA |
|---|---:|---|
| 24/10 | 11 | [Fichier](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/okx-hourly/hype-spot-books/2026-10-24.json) · `f383b5f3a470970f7ec34cb11f0119b19d99701d` |
| 25/10 | 15 | [Fichier](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/okx-hourly/hype-spot-books/2026-10-25.json) · `112539b5bdd05e27fe960cf1a633f0b950791d53` |
| 26/10 | 13 | [Fichier](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/okx-hourly/hype-spot-books/2026-10-26.json) · `8d1db0e80a1ca89eeb979d8c6345697c591a50d2` |
| 27/10 | 15 | [Fichier](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/okx-hourly/hype-spot-books/2026-10-27.json) · `81d6caad237c9e79b85642d4a8bfcd74140f2c94` |
| 28/10 | 5 | [Fichier](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/okx-hourly/hype-spot-books/2026-10-28.json) · `0e20c8b76b05e9bc604da1770d77ce4bb8df4adc` |

**Fenêtre historique :** première capture `2026-10-24T07:37:27Z` ; dernière `2026-10-28T08:34:12Z`. Ce sont des relevés isolés, non une cotation continue.

| Mesure des 59 carnets | Résultat |
|---|---:|
| Spread minimum observé | 0,13 point de base |
| Spread médian des 59 observations | 2,07 points de base |
| Spread maximum observé | 12,18 points de base |
| Dernier meilleur bid du 28/10 à 08:34:12 UTC | 81,601 USDC/HYPE |
| Dernier meilleur ask du même instant | 81,625 USDC/HYPE |
| Quantité au premier bid | 9,44 HYPE |
| Quantité au premier ask | 36,9911 HYPE |
| Spread du dernier carnet | 2,94 points de base (valeur archivée) |

Un spread inférieur à 1 pb sur un relevé ne garantit aucun prix d'exécution. Le maximum de 12,18 pb dans la même collection montre l'importance de **mesurer la liquidité à chaque instant**, plutôt que de réutiliser un prix ancien.

### Règles instrument historiques

Le dossier source public du **24 octobre** consigne `minSz=0.01 HYPE`, `lotSz=0.0001 HYPE`, `tickSz=0.001 USDC`. Ces valeurs furent contrôlées dans le cadre d'une observation **historique**. Ni `state=live`, ni `tradeQuoteCcyList`, ni les frais et permissions du compte français ne sont revalidés au 9 novembre.

## 3. Bougies HYPE-USDC : archivage OKX et turnover

[Archive native OKX HYPE-USDC](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/okx-hourly/hype-spot-candles.json), blob `9e6acd23ee0363ada3b83ef7d329470d7140bec2`, produite à `2026-10-28T08:34:12Z`.

| Intervalle d'archive roulante | Bougies |
|---|---:|
| 15 minutes | 299 |
| 1 heure | 299 |
| 1 jour UTC | 299 |

**Sept bougies quotidiennes UTC closes du 17 au 23 octobre 2026 :** somme du volume en quote native **78 275 624,325035 USDC** selon les champs source et le calcul enregistré dans le dossier existant. C'est une mesure **de la paire OKX** sur **sept jours précis**, ni un volume global d'exchanges ni une quantité qui pourrait être exécutée à un même prix. Le présent dossier réutilise ce calcul documenté, il ne reconstitue pas des bougies plus anciennes.

Le [catalogue historique Binance Spot](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/top250_multisource_coverage/index.json), blob `71b25904a652fbd8cdea1ac6bb942c9789e930c3`, affiche **un mois** et **44 640 bougies minute `HYPEUSDT`**, **en USDT**. Cette série n'est ni l'archive OKX HYPE-USDC en USDC ni un historique de prix perpétuels. Les ZIP et la couverture minute ne sont pas intégralement audités ici.

## 4. HyperCore, HyperEVM et risques spécifiques

La documentation du projet distingue **HyperCore**, infrastructure de carnet, trading et staking, et **HyperEVM**, environnement de contrats. Les volumes de perpétuels, de Spot natif Hyperliquid et du Spot **OKX HYPE-USDC** sont trois périmètres **différents**. Ils ne doivent jamais être additionnés sans identités, quotes et fenêtres compatibles.

- [Documentation officielle Hyperliquid](https://hyperliquid.gitbook.io/hyperliquid-docs).
- [Staking officiel HyperCore](https://hyperliquid.gitbook.io/hyperliquid-docs/hypercore/staking).
- [OKX — annonce historique de cotation Spot HYPE/USDT (novembre 2025)](https://www.okx.com/fr/help/okx-to-list-hyperliquid-hype-for-spot-trading).
- [OKX — annonce de classement tarifaire HYPE-USDC (été 2026)](https://www.okx.com/en-br/help/upcoming-token-pair-groups-adjustment-eea).
- [OKX Europe — liste publique des marchés USDC, dont HYPE](https://www.okx.com/en-eu/markets/spot/usdc-all).

**Risques à qualifier :** liquidité variable et slippage, concentration de stake, dépendance à l'infrastructure, liquidations et mécanismes propres aux dérivés, éventuels déblocages de jetons à dater depuis des documents primaires. Une activité importante sur les dérivés n'est pas une preuve de rendement garanti du jeton.

## 5. État de qualification

**Confirmé documentairement :** identité HYPE, marché CoinGecko daté, 59 carnets historiques Spot OKX HYPE-USDC, trois fenêtres roulantes de 299 bougies et un calcul sur sept jours clos.

**Non vérifié :** carnet et règles du 9 novembre, permissions personnelles EEE, tarif maker/taker, minimum notionnel et prix réellement exécutés. Une étude PAPER exige des critères **prédéfinis**, un historique vérifié et un journal reproductible ; le livre historique ne suffit pas.

**Statut : RECHERCHE DOCUMENTÉE, PAPER NON CERTIFIÉ.** Aucun ordre réel, aucune donnée de compte privée, aucune modification de l'Administrator, du Trader ou du Bridge R31.
