# Seven Heaven — Robustesse BTC/ETH 50/50 sur deux exchanges et analyse des baisses communes

**Date : 12 novembre 2026** · Résultat PAPER historique, **publié et vérifié sur GitHub main** · Zéro ordre réel.

## Synthèse

Le replay comparatif **BTC/ETH EMA 10/30, 50/50 en deux poches indépendantes**, est maintenant complet sur les **1 035 mêmes journées UTC** de 2024-01-01 à 2026-10-31 à partir de :
- **Bitstamp Spot BTC/USD + ETH/USD** : 1 310 bougies journalières natives par actif, y compris 275 jours de chauffe depuis 2023-04-01 ;
- **Binance Spot BTC/USDT + ETH/USDT** : le même protocole de notre Coffre, déjà figé, mêmes dates.

La comparaison est une **vérification de robustesse aux sources sur un passé déjà étudié**, pas un nouveau jeu temporel prospectif ni une garantie de gain. Le changement de source n'a pas entraîné de réoptimisation des EMA.

## 1. Protocole et vérification technique

[Protocole figé avant de récupérer les nouveaux cours BTC Bitstamp](./SEVEN_HEAVEN_BTC_ETH_50_50_NATIVE_BITSTAMP_VS_BINANCE_FROZEN_PROTOCOL_2026_11_12.md) — commit `a62234ee956601fc9567813a8009928d0a2ade96`.

EMA10 et EMA30 sur clôture UTC, chacune amorcée le 1er avril 2023 ; signal `EMA10 > EMA30 AND close > EMA30` et opération **fictive à l'ouverture UTC du lendemain**. Deux poches initiales de 500 USD / 500 USDT selon la plateforme, sans échanges entre elles, sans rebalancement, sans levier et sans short. Frais fictifs **0,10 %** + glissement **0,05 % par côté**, avec stress coûts ×2. Les actifs de cotation USD et USDT sont **différents** ; leurs capitaux ne sont pas convertis à parité, seuls les taux sont mis en parallèle.

La collecte native BTC/USD a été faite par l'API publique Bitstamp via GitHub Actions. [**Exécution réussie #2 de notre nouveau protocole**](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43237341563) : 5 tests hors ligne réussis, deux pages API de 1 000 bougies, couverture complète, contrôles SHA-256 et publication. Le premier essai avait échoué sur un **test synthétique trop strict** exigeant 1 000 lignes pour la page finale d'un historique fictif qui n'en contenait que 310 ; l'attente du test a été corrigée. **Aucun prix, paramètre de stratégie, coût, signal ni période n'a été retouché à la suite de cet échec.**

## 2. Comparaison complète des portefeuilles PAPER

| Indicateur | Bitstamp BTC/USD + ETH/USD | Binance BTC/USDT + ETH/USDT |
|---|---:|---:|
| EMA10/30 50/50 : rendement net | **+77,67 %** | **+79,20 %** |
| EMA10/30 50/50 : capital fictif final | 1 776,65 USD | 1 792,03 USDT |
| EMA10/30 50/50 : baisse maximale | **−42,15 %** | **−41,92 %** |
| EMA10/30 50/50 : opérations fictives | 122 | 124 |
| EMA10/30 50/50 : coûts ×2 | +62,24 % | +63,38 % |
| Buy & Hold 50/50 : rendement net | +40,53 % | +40,74 % |
| Buy & Hold 50/50 : baisse maximale | −58,58 % | −58,50 % |

**Différence de rendement EMA Bitstamp moins Binance : −1,54 point.** La corrélation des rendements quotidiens des deux portefeuilles EMA est **0,999875** ; leurs états **conjoints** d'exposition BTC/ETH concordent sur **1 033 / 1 035 journées (99,81 %)**.

Seulement deux dates de désaccord :
- **2025-06-19 : ETH**, Bitstamp en cash, Binance exposé ;
- **2026-07-17 : BTC**, Bitstamp exposé, Binance en cash.

Ces différences proches des zones de croisement entraînent **122 contre 124 opérations fictives**. La reproductibilité descriptive est forte, mais elle n'autorise pas à supprimer les différences d'exécution.

## 3. La diversification BTC/ETH ne supprime pas la chute commune

Sur les **1 034 changements quotidiens** comparables des prix Bitstamp :
- Corrélation des rendements BTC/ETH : **0,820549**.
- **415 jours de baisse simultanée** (139 en 2024, 142 en 2025, 134 en janvier–octobre 2026).
- Sur ces 415 jours de baisse commune, le portefeuille EMA tenait **les deux actifs 141 jours**, **aucun actif 201 jours** et **un seul actif 73 jours**.
- Sur les 1 035 journées de portefeuille, les deux poches étaient toutes deux cash **474 jours**, toutes deux exposées **368 jours**, BTC seul **119 jours**, ETH seul **74 jours**.

La protection ne vient donc **pas d'une indépendance BTC/ETH** : lors de fortes baisses conjointes, les deux actifs peuvent céder simultanément. Elle vient en partie de la **réduction d'exposition grâce au filtrage EMA**, qui peut néanmoins faire manquer des rebonds importants.

Exemple particulièrement révélateur : le **5 février 2026**, BTC a perdu environ **13,98 %** et ETH **14,94 %** d'une clôture à l'autre. Le portefeuille Buy & Hold 50/50 a subi **−14,32 %** sur cette journée, tandis que le portefeuille EMA était entièrement en liquidités et sa valeur quotidienne est restée inchangée. C'est un cas historique, **pas une faculté générale de prévoir les krachs**. Le **19 mars 2024**, les deux poches EMA étaient exposées et le portefeuille a perdu environ **9,32 %** dans la journée : le filtre ne protège pas automatiquement.

## 4. Coût et profil du risque

Volatilité quotidienne des variations en 2024–octobre 2026 sur Bitstamp, calculée comme écart type de population **non annualisé** :

| Position / portefeuille | Volatilité quotidienne |
|---|---:|
| BTC Buy & Hold | 2,46 % |
| ETH Buy & Hold | 3,53 % |
| Mixte BTC/ETH Buy & Hold 50/50 | 2,72 % |
| Mixte BTC/ETH filtré EMA 50/50 | **1,67 %** |

Le **50/50 Buy & Hold est plus volatil que BTC seul**, moins qu'ETH seul. De même, EMA 50/50 diminue la baisse maximale par rapport à **ETH EMA seul (−54,10 %)**, mais l'aggrave par rapport à **BTC EMA seul (−34,48 %)**. Elle ne constitue donc pas une solution universellement moins risquée.

La baisse maximale historique du 50/50 EMA Bitstamp (**−42,15 %**) s'est étendue du sommet du **13 mars 2024** au creux du **9 octobre 2024**. En Buy & Hold 50/50, le creux maximal (**−58,58 %**) suit le sommet du 6 octobre 2025 et survient le **30 juin 2026**. Cela rappelle qu'un rendement positif final n'efface pas la difficulté d'une longue baisse temporaire.

## 5. Résultats par année civile, sur le portefeuille CONTINU

**Attention :** ces chiffres sont calculés par différence entre les valorisations de fin d'année du portefeuille **non réinitialisé** ; ce ne sont **pas** les replays annuels indépendants de notre étude antérieure. Les sous-rendements ne s'additionnent pas.

| Année | EMA 50/50 Bitstamp | EMA 50/50 Binance | Hold 50/50 Bitstamp |
|---|---:|---:|---:|
| 2024 | +26,84 % | +27,70 % | +82,93 % |
| 2025 | +36,59 % | +36,50 % | −8,15 % |
| Janv.–oct. 2026 | +2,55 % | +2,81 % | −16,36 % |

2024 démontre que **Buy & Hold dépasse largement EMA** dans une année fortement haussière. En 2026, la marge EMA reste faible. Les années ont déjà été explorées ; ne pas optimiser sur ces observations.

## 6. Preuves canoniques et contrôle de publication

- [**CSV natif Bitstamp BTC/USD, 1 310 journées, 2023–2026**](./native_bitstamp_btc_eth_2024_2026_evidence/bitstamp_btcusd_daily_2023_2026.csv). SHA-256 exact `89a85a2f419244b3140f0518fb731f37c06abc3b73734433eb3fbf4642907dbb`.
- [**CSV natif Bitstamp ETH/USD utilisé, déjà vérifié**](./native_bitstamp_eth_2024_2026_evidence/bitstamp_ethusd_daily_2023_2026.csv). SHA-256 `881227ba20481322b6829c19d97b799d11a73ae155be8868cf5ec943039c6b49`.
- [**Courbes quotidiennes des six poches/portefeuilles Bitstamp, 1 035 jours**](./native_bitstamp_btc_eth_2024_2026_evidence/bitstamp_btc_eth_50_50_daily_equity_2024_2026.csv). SHA-256 `84f6dffce2ecb1c697680bf293a06faccc1c3a4887a810f76f66f6f7ffa85434`.
- [**Preuves JSON, provenance API, résultats, risques, écarts de décisions**](./native_bitstamp_btc_eth_2024_2026_evidence/bitstamp_btc_eth_50_50_proofs.json), Git blob `ab15dc23da2e5b8adc5e72ea0eef893b79b79aeb`.
- [**Rapport machine du replay**](./native_bitstamp_btc_eth_2024_2026_evidence/SEVEN_HEAVEN_BTC_ETH_NATIVE_BITSTAMP_50_50_COMPARATIVE_REPORT.md).
- [**Programme Python de reproduction**](./SEVEN_HEAVEN_BTC_ETH_50_50_NATIVE_BITSTAMP_VS_BINANCE_REPLAY_2026_11_12.py), [**cinq tests synthétiques**](./test_seven_heaven_btc_eth_native_bitstamp_dual_replay.py) et [**workflow GitHub Actions**](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/workflows/seven-heaven-btc-eth-native-bitstamp-dual-research.yml).

La validation en ligne a effectivement obtenu **1310 jours natifs BTC, 1310 jours natifs ETH, 1035 jours PAPER et cinq tests OK** ; la publication a été contrôlée par relecture GitHub. Le workflow utilise seulement les API publiques et un dossier de recherche isolé. **Aucun compte, clé privée ou ordre.**

## 7. Conclusion Seven et prochain travail

**Ce qui est montré :** forte concordance des signaux EMA10/30 et des résultats PAPER entre deux places ; le 50/50 ne neutralise pas les baisses communes ; les périodes cash expliquent une part importante de la moindre volatilité et du drawdown.

**Ce qui n'est pas montré :** supériorité future, indépendance des marchés BTC/ETH, validité des hypothèses de prix d'exécution, fiabilité de la cotation USD/USDT à toute date, garantie de rendement ou de capital préservé. Le réglage EMA reste exploratoire : **de nouvelles dates après ce protocole seraient nécessaires** pour une validation temporelle authentique.

**Priorité scientifique suivante :** évaluer un *walk-forward* gelé sur des périodes postérieures, et comparer la disponibilité de liquidité et les coûts d'exécution réalistes avant toute idée d'utilisation. Ne pas modifier l'Administrator, l'Operator, le Trader ou le Bridge pour une étude sans validation prospective.
