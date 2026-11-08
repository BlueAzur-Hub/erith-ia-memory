# Seven Heaven — Audit des 50 dossiers Crypto : identité, sources, archives, OKX, PAPER

**État de la vérification : 8 novembre 2026 · lecture seule.** Audit du document de travail [Top 5 / 10 / 50](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md). Le rapport ne constitue ni une validation d'investissement ni un relevé des permissions personnelles OKX.

## Verdict — ce qui est réellement vérifié

| Contrôle | Résultat | Limite |
|---|---:|---|
| Dossiers, correspondances symbole / CoinGecko ID / nom / rang / ancres | **50/50** | Réconciliation contre la **version figée** du Market |
| Prix USD, variation 24 h, volume USD des tableaux | **50/50** | Identité de valeur et arrondis, pas une certification externe |
| Couverture historique minute | **41 actifs** | Présence dans l'index, pas inspection de tous les ZIP |
| Couverture historique jour | **8 actifs** | Place, devise et série distinctes des cours USD |
| Sans présence dans les deux index natifs | **WBT** | Ne prouve pas l'absence d'historique ailleurs |
| Identifiés sur les 21 captures OKX | **7 actifs** | BTC, ETH, XRP, SOL, DOGE, BCH et OKB ; marchés USDC |
| Permissions Spot du compte Europe contrôlées par paire | **0** | **Le compte existe** ; ce site ne vérifie pas les autorisations |
| Contrats identifiés par documentation officielle dans cet audit | **2 fiches** | ONDO et MORPHO ; pas de contrôle on-chain |
| Références documentaires externes extraites | **108** | Pas de relecture intégrale de toutes les pages ni contrôle de chaque affirmation |
| Actifs pouvant être déclarés « PAPER validé » | **0** | Frais, profondeur, liquidité, trous historiques et recette à vérifier |

**Périmètre crucial :** il s'agit de **50 actifs de recherche CoinGecko**, et **non de 50 instruments autorisés sur OKX Europe**. Les 43 actifs sans correspondance dans les 21 captures sont « non observés dans cet échantillon », **pas indisponibles**.

## Anomalie réellement détectée — `latest.json` est mouvant

L'audit ne compare pas les prix historiques de la bibliothèque au `latest.json` actuel, qui a changé pendant cette session ! Il compare les 50 dossiers à **l'instantané exact** utilisé pour les rédiger :

- **Commit de référence immuable :** [`ed32ae3605ef5e594a3c1b74dbd383b315171526`](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/ed32ae3605ef5e594a3c1b74dbd383b315171526/public/agent_crypto_erith_ia/data/crypto/latest.json).
- **SHA du contenu :** `79250181f46cd1f21d07b5d3886d3784e02d9f15`.
- **Snapshot CoinGecko :** `2026-11-08T16:04:58.911Z`.
- **Le `latest.json` sur `main` s'actualise** via les publications du Market. Les variations d'une version à l'autre ne constituent pas une incohérence intrinsèque.
- **Market étendu Top 1000 :** snapshot distinct, daté `2026-11-08T16:03:56.432Z`. Les actifs classés au-delà du Top 250 restent hors des dossiers historiques Top 50. La capture où JCT passe de rang 245 à 229 reflète deux relevés différents et ne change pas rétroactivement le rang archivé.

## Provenance des fichiers du contrôle

| Type | URL | SHA GitHub |
|---|---|---|
| library | [Ouvrir la source](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md) | `e5044e43c485ea2963d4b4529e7a8a1b5460f50a` |
| market | [Version figée](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/ed32ae3605ef5e594a3c1b74dbd383b315171526/public/agent_crypto_erith_ia/data/crypto/latest.json) | `79250181f46cd1f21d07b5d3886d3784e02d9f15` |
| minute | [Ouvrir la source](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/top250_multisource_coverage/index.json) | `71b25904a652fbd8cdea1ac6bb942c9789e930c3` |
| daily | [Ouvrir la source](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/top250_multiresolution_sources/index.json) | `b0081d8085b4deb9b1ec17e41e291d5cbba4f959` |
| okx | [Ouvrir la source](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/research/okx-spot-screen-candidates.json) | `ab1498c692eaaedb6f5a940f555fee13afa45ab4` |
| extended | [Ouvrir la source](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/extended.json) | `5c82f01bfa02ff37c60be2b2072cbd549240b831` |

## Matrice des 50 dossiers : vérification de source

La colonne « Captures OKX » n'établit que la présence dans le *catalogue de 21 paires screenshot* du projet ; elle n'atteste ni le compte courant, ni les frais, ni la disponibilité effective d'une paire.

| N° | Crypto | ID CoinGecko exact | Rang CG historique | Séries natives | Captures OKX | Références externes | Contrat |
|---:|---|---|---:|---|---|---:|---|
| 1 | [BTC](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#1-btc) | `bitcoin` | 1 | 1m | BTC-USDC | 1 | À qualifier |
| 2 | [ETH](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#2-eth) | `ethereum` | 2 | 1m | ETH-USDC | 1 | À qualifier |
| 3 | [BNB](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#3-bnb) | `binancecoin` | 4 | 1m | Non observé dans les captures | 1 | À qualifier |
| 4 | [XRP](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#4-xrp) | `ripple` | 5 | 1m | XRP-USDC | 1 | À qualifier |
| 5 | [SOL](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#5-sol) | `solana` | 7 | 1m | SOL-USDC | 1 | À qualifier |
| 6 | [TRX](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#6-trx) | `tron` | 8 | 1m | Non observé dans les captures | 1 | À qualifier |
| 7 | [ZEC](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#7-zec) | `zcash` | 10 | 1m | Non observé dans les captures | 1 | À qualifier |
| 8 | [HYPE](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#8-hype) | `hyperliquid` | 11 | 1m | Non observé dans les captures | 1 | À qualifier |
| 9 | [XMR](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#9-xmr) | `monero` | 12 | 1m | Non observé dans les captures | 1 | À qualifier |
| 10 | [DOGE](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#10-doge) | `dogecoin` | 13 | 1m | DOGE-USDC | 1 | À qualifier |
| 11 | [WBT](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#11-wbt) | `whitebit` | 15 | — | Non observé dans les captures | 2 | À qualifier |
| 12 | [LEO](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#12-leo) | `leo-token` | 16 | 1j | Non observé dans les captures | 3 | À qualifier |
| 13 | [LINK](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#13-link) | `chainlink` | 17 | 1m | Non observé dans les captures | 2 | À qualifier |
| 14 | [ADA](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#14-ada) | `cardano` | 18 | 1m | Non observé dans les captures | 3 | À qualifier |
| 15 | [XLM](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#15-xlm) | `stellar` | 19 | 1m | Non observé dans les captures | 2 | À qualifier |
| 16 | [BCH](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#16-bch) | `bitcoin-cash` | 20 | 1m | BCH-USDC | 1 | À qualifier |
| 17 | [NEAR](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#17-near) | `near` | 22 | 1m | Non observé dans les captures | 3 | À qualifier |
| 18 | [UNI](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#18-uni) | `uniswap` | 24 | 1m | Non observé dans les captures | 3 | À qualifier |
| 19 | [LTC](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#19-ltc) | `litecoin` | 25 | 1m | Non observé dans les captures | 2 | À qualifier |
| 20 | [RAIN](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#20-rain) | `rain` | 26 | 1j | Non observé dans les captures | 3 | À qualifier |
| 21 | [CC](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#21-cc) | `canton-network` | 27 | 1j | Non observé dans les captures | 2 | À qualifier |
| 22 | [AVAX](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#22-avax) | `avalanche-2` | 28 | 1m | Non observé dans les captures | 2 | À qualifier |
| 23 | [SUI](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#23-sui) | `sui` | 29 | 1m | Non observé dans les captures | 2 | À qualifier |
| 24 | [GRAM](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#24-gram) | `the-open-network` | 32 | 1m | Non observé dans les captures | 3 | À qualifier |
| 25 | [HBAR](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#25-hbar) | `hedera-hashgraph` | 33 | 1m | Non observé dans les captures | 2 | À qualifier |
| 26 | [QNT](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#26-qnt) | `quant-network` | 34 | 1m | Non observé dans les captures | 3 | À qualifier |
| 27 | [TAO](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#27-tao) | `bittensor` | 38 | 1m | Non observé dans les captures | 3 | À qualifier |
| 28 | [SHIB](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#28-shib) | `shiba-inu` | 39 | 1m | Non observé dans les captures | 3 | À qualifier |
| 29 | [CRO](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#29-cro) | `crypto-com-chain` | 40 | 1j | Non observé dans les captures | 3 | À qualifier |
| 30 | [OKB](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#30-okb) | `okb` | 42 | 1j | OKB-USDC | 3 | À qualifier |
| 31 | [PEPE](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#31-pepe) | `pepe` | 43 | 1m | Non observé dans les captures | 1 | À qualifier |
| 32 | [ENA](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#32-ena) | `ethena` | 45 | 1m | Non observé dans les captures | 3 | À qualifier |
| 33 | [AAVE](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#33-aave) | `aave` | 46 | 1m | Non observé dans les captures | 2 | À qualifier |
| 34 | [M](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#34-m) | `memecore` | 48 | 1j | Non observé dans les captures | 2 | À qualifier |
| 35 | [ONDO](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#35-ondo) | `ondo-finance` | 52 | 1m | Non observé dans les captures | 2 | Documenté |
| 36 | [ASTER](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#36-aster) | `aster-2` | 53 | 1m | Non observé dans les captures | 2 | À qualifier |
| 37 | [PUMP](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#37-pump) | `pump-fun` | 54 | 1m | Non observé dans les captures | 3 | À qualifier |
| 38 | [BTW](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#38-btw) | `bitway` | 55 | 1m | Non observé dans les captures | 2 | À qualifier |
| 39 | [DOT](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#39-dot) | `polkadot` | 57 | 1m | Non observé dans les captures | 2 | À qualifier |
| 40 | [SKY](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#40-sky) | `sky` | 59 | 1m | Non observé dans les captures | 3 | À qualifier |
| 41 | [MNT](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#41-mnt) | `mantle` | 60 | 1j | Non observé dans les captures | 2 | À qualifier |
| 42 | [WLFI](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#42-wlfi) | `world-liberty-financial` | 61 | 1m | Non observé dans les captures | 3 | À qualifier |
| 43 | [MORPHO](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#43-morpho) | `morpho` | 62 | 1m | Non observé dans les captures | 3 | Documenté |
| 44 | [HTX](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#44-htx) | `htx-dao` | 63 | 1j | Non observé dans les captures | 2 | À qualifier |
| 45 | [ICP](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#45-icp) | `internet-computer` | 64 | 1m | Non observé dans les captures | 3 | À qualifier |
| 46 | [WLD](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#46-wld) | `worldcoin-wld` | 66 | 1m | Non observé dans les captures | 2 | À qualifier |
| 47 | [BGB](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#47-bgb) | `bitget-token` | 67 | 1m | Non observé dans les captures | 2 | À qualifier |
| 48 | [ARB](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#48-arb) | `arbitrum` | 68 | 1m | Non observé dans les captures | 3 | À qualifier |
| 49 | [JST](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#49-jst) | `just` | 69 | 1m | Non observé dans les captures | 3 | À qualifier |
| 50 | [ETC](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/laboratoire/SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md#50-etc) | `ethereum-classic` | 71 | 1m | Non observé dans les captures | 3 | À qualifier |

## Deux identités contractuelles documentées

**ONDO :** jeton de gouvernance sur **Ethereum**, adresse ERC-20 `0xfAbA6f8e4a5E8Ab82F62fe7C39859FA577269BE3` publiée par [Ondo Foundation](https://docs.ondo.foundation/ondo-token). Le token n'est pas un titre représentatif des fonds tokenisés de l'écosystème.

**MORPHO :** sur **Ethereum**, adresse actuelle `0x58D97B57BB95320F9a05dC918Aef65434969c2B2`, adresse legacy `0x9994E35Db50125E0DF82e4c2dde62496CE330999`, wrapper `0x9D03bb2092270648d7480049d0E58d2FcF0E5123`. [Liste des contrats officiels Morpho](https://docs.morpho.org/developers/contracts/addresses/). Le jeton de gouvernance et les contrats de Morpho Blue ne sont pas interchangeables.

Pour les monnaies natives (BTC, SOL, ETC, etc.), **une adresse ERC-20 n'est pas l'identifiant natif de l'actif**. Les contrats encapsulés, pontés ou dérivés exigent une étude séparée par réseau. Les adresses ci-dessus sont **vérifiées en documentation officielle**, pas par analyse des états on-chain.

## Fiabilité des cinquante études : quatre niveaux distincts

1. **Identité et données de marché :** vérification positive pour les 50 dossiers **sur le snapshot figé** ; les détails chiffrés peuvent être obsolètes pour toute décision actuelle.
2. **Historique natif :** index vérifiés, pas la totalité des ZIP. Les lacunes, checksums de contenus compressés, doublons, frais, exactitude des quotes et amplitudes temporelles nécessitent la recette spécifique du Coffre.
3. **Sources et fondamentaux :** chaque dossier cite des liens de projet ou de documentation ; **leur présence ne valide pas automatiquement l'adoption, les recettes, les burns, le staking ou les droits**. La relecture indépendante intégrale des 108 références n'a pas été effectuée. RAIN présente une divergence déjà identifiée entre sa communication et son livre blanc. PEPE manque de source primaire confirmée de fonction de protocole ; il ne faut pas inventer une utilité.
4. **Négociabilité / exécution :** aucune preuve d'éligibilité par paire du compte OKX, ni test de PAPER avec carnet et coûts réels. Le compte européen du titulaire est établi par ses captures ; la preuve par instrument reste à fournir.

## Registre des dettes et seuils de sortie

| Priorité | Dette | Critère de sortie observable |
|---|---|---|
| **P0** | Qualifier les instruments OKX Europe | Réseau et identifiant, market Spot exact, statut listing public, devise, instrument courant, et droits du compte contrôlés séparément |
| **P0** | Recette PAPER V5/V6 | Source des bougies, horodatage UTC, gaps, frais maker/taker, taille minimale, profondeur bid/ask, slippage et résultats reproductibles ; aucune opération simulée déclarée sans preuve |
| **P1** | Registre réseaux / contrats sur les 48 autres fiches | Identité native ou contrat, réseau, rôle wrapped/bridged, source officielle, date ; aucun contrat deviné depuis un ticker |
| **P1** | Validation détaillée des liens | Relire les passages qui soutiennent les affirmations, marquer proposition vs exécution, dater la version et signaler toute contradiction |
| **P1** | Vérification effective des archives GitHub Releases | SHA-256 du lot, bougies natives, tranches couvertes, trous et source d'instrument exact |
| **P2** | WBT | Localiser une archive native légitime sans synthétiser de prix |
| **P2** | Études économiques indépendantes | Recettes, clients réels, vesting, burns effectués, règles de prêt et sécurité avec sources tierces datées |

**Frontière conservée :** GitHub Master, Administrator et Trader préservés ; pas d'accès privé, aucune clé demandée, aucun ordre, aucune simulation PAPER inventée.

*Les informations du rapport sont des relevés historiques et une analyse de sources. Elles ne sont pas des signaux de trading.*
