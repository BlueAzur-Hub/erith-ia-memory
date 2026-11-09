# Seven Heaven — SOL/USDC : marché comparé, liquidité et sources Solana

**Étude de terrain du 9 novembre 2026 · Archive et recherche uniquement · Pas de modification de l'Administrator.**
Complément à la [monographie SOL du Top 50](./SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md) ; voir les dossiers [BTC/ETH](./SEVEN_HEAVEN_AGENT_CRYPTO_BTC_USDC_ETH_USDC_SPOT_FIELD_EVIDENCE_2026_11_09.md), [XRP](./SEVEN_HEAVEN_AGENT_CRYPTO_XRP_USDC_SPOT_RESEARCH_2026_11_09.md) et le [registre JSON des preuves SOL](../data/crypto/research/seven_heaven_sol_usdc_spot_evidence_2026_11_09.json).

> **Synthèse :** le prix de SOL montre une baisse à 24 heures, 7 jours et 30 jours dans le snapshot public du matin du 9 novembre. Une série de carnets **historiques** OKX SOL-USDC existe déjà (20 stockés, 15 dans l'index qualifié). Les règles d'octobre et la profondeur visible ne démontrent ni droit actuel à l'ordre, ni coûts d'exécution, ni résultat PAPER.

## 1. Sources, devises et dates : les préserver

| Couche | Horodatage et périmètre | Devise | Ce que l'on sait |
|---|---|---|---|
| Marché global | CoinGecko, `2026-11-09T07:53:59.646Z`, données `2026-11-09T07:52:59.000Z` | **USD** | Rendements BTC/ETH/XRP/SOL issus d'un même snapshot |
| Ordres visibles OKX | 27–28 octobre 2026 ; derniers niveaux `2026-10-28T08:34:17Z` | **USDC** | Livre public à cinq niveaux pour SOL-USDC, vieux de douze jours au 9 novembre |
| Découverte de marché | Capture de la plateforme OKX par l'utilisateur, 08/11/2026 | **USDC** | Paire SOL-USDC affichée, pas autorisation de compte |
| Historique | Index des archives mensuelles Binance Spot | **USDT** | SOLUSDT : 64 mois et 2 809 440 bougies natives 1m, intégrité ZIP non reconfirmée ici |
| Audit partiel | Archives originales Binance Spot ; cinq mois ciblés | **USDT** | Lacunes documentées, sans interpolation ni validation des 64 mois entiers |

**Règle de lecture : USD ≠ USDC ≠ USDT.** Le prix CoinGecko du matin et le carnet OKX du 28 octobre ne sont pas synchrones ; les comparer ne révèle aucun arbitrage ni aucune opération profitable.

### Provenance fixée par le Git et les sources officielles

- [Snapshot public CoinGecko](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/latest.json), SHA blob `4f1f33162f2bf729f5772562e15a60fdb7017075`.
- [Index des archives Spot natives](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/top250_multisource_coverage/index.json), SHA `71b25904a652fbd8cdea1ac6bb942c9789e930c3`.
- [Paires OKX observées en capture](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/research/okx-spot-screen-candidates.json), SHA `ab1498c692eaaedb6f5a940f555fee13afa45ab4`.
- [Collectes publiques du 27 octobre](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/okx-hourly/2026-10-27.json) et [du 28 octobre](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/okx-hourly/2026-10-28.json), SHAs `9509de1c7d65d0e74b3a60f8cfcb550d95c83aef` et `09c15414acf17d6f5154ed8475b54b45e116b209`.
- [Index des 15 carnets qualifiés](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/okx-hourly/research-latest.json), SHA `3e20270ca0df74825a47a980f1d8b8ea8dd07d05`.
- [Audit des écarts Binance 1m](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/top5_original_gap_audit/index.json), SHA `f4f159ff099683b3a70a0090d5fe34fb65d55880`.
- [Solana — frais de transaction](https://solana.com/docs/core/fees), [staking](https://solana.com/docs/references/staking), [recherche sur le réseau](https://solana.com/research).
- [OKX — données d'instruments Spot : state, minSz, lotSz, tickSz, tradeQuoteCcyList](https://app.okx.com/docs-v5/en/).

## 2. Marché comparatif — quatre actifs au même instantané du 09/11

| Actif | Rang du snapshot | Prix USD | 24 h | 7 jours | 30 jours |
|---|---:|---:|---:|---:|---:|
| BTC | 1 | 73953,12 | -2,57 % | -5,15 % | -10,28 % |
| ETH | 2 | 2091,39 | -6,56 % | -7,74 % | -15,38 % |
| XRP | 6 | 1,0853 | -6,81 % | -12,97 % | -22,60 % |
| SOL | 7 | 85,54 | -4,13 % | -9,22 % | -21,83 % |

### SOL moins les autres actifs (écart de variation en points)

| Horizon | SOL − BTC | SOL − ETH | SOL − XRP |
|---|---:|---:|---:|
| 24 h | -1,56 | 2,42 | 2,68 |
| 7 jours | -4,08 | -1,49 | 3,75 |
| 30 jours | -11,55 | -6,45 | 0,77 |

**Lecture factuelle :** SOL recule moins que ETH et XRP sur 24 h, mais davantage que BTC. Sur 7 jours, SOL fait moins bien que BTC et ETH, mieux que XRP. Sur 30 jours, SOL fait moins bien que BTC et ETH, légèrement mieux que XRP. Un classement de résistance relative **dépend de la période** et ne constitue pas un signal de prévision.

Volume global SOL déclaré par CoinGecko : 2,412 Md USD sur 24 h ; ce chiffre n'est **pas** le volume ou la profondeur effectivement exécutable sur OKX SOL-USDC.

## 3. Marché OKX SOL-USDC — carnets d'octobre, non actuels

Le collecteur `OKX_EEA_PUBLIC_REST` conserve **20** relevés SOL-USDC à cinq niveaux. Le dossier de synthèse en qualifie **15** entre `2026-10-27T10:36:06Z` et `2026-10-28T08:34:17Z`. Les cinq autres restent des archives accessibles mais ne sont pas intégrés aux indicateurs de cette fenêtre qualifiée.

### Dernier livre de la fenêtre : `2026-10-28T08:34:17Z`

| Champ du carnet `book5` | Valeur native |
|---|---:|
| Premier meilleur bid (prix) | 102,88 USDC/SOL |
| Quantité disponible affichée au premier bid | 3,92205 SOL |
| Premier meilleur ask (prix) | 102,90 USDC/SOL |
| Quantité disponible affichée au premier ask | 9,88608 SOL |
| Mid dérivé du carnet | 102,890 USDC/SOL |
| Spread absolu | 0,02 USDC/SOL |
| Spread relatif calculé | ≈ 1,9438 pb |

Sur les **15** carnets retenus dans l'index du 27–28 octobre, spread médian déclaré `1.98` pb, maximum `2.99` pb. **Cela ne représente pas une moyenne continue** de la cotation. Les spreads médians des trois autres paires USDC sur la même fenêtre sont : BTC `0.01` pb ; ETH `0.04` pb ; XRP `2.25` pb. Ce classement ne décrit pas le marché au 9 novembre.

**Contrôle de qualité :** sur 3 des 20 enregistrements, les prix du ticker et ceux du carnet ne correspondent pas exactement. Les endpoints sont des observations distinctes : ne jamais écraser le carnet par le ticker ni qualifier automatiquement ces différences d'erreur. Le champ `market_fill_proven` est `false` pour tous les livres étudiés.

### Règles conservées dans les archives du 27–28 octobre

| Champ | Valeur archivée | Précaution |
|---|---:|---|
| `minSz` | 0.01 SOL | Minimum historique, non vérifié au 9/11 |
| `lotSz` | 0.00001 SOL | Incrément de quantité historique |
| `tickSz` | 0.01 USDC | Incrément de prix historique |
| `state` | Non conservé comme champ natif actuel | Le statut interne `VERIFIED_PUBLIC_BOOK` **n'est pas** `state=live` |
| `tradeQuoteCcyList` et droit du compte | Non vérifiés | L'accès EEA public ne garantit pas la permission sur le compte personnel |

La récupération actuelle de `/api/v5/public/instruments?instType=SPOT&instId=SOL-USDC` n'a pas donné de réponse exploitable dans l'environnement de recherche. On **ne réétiquette pas** les règles d'octobre comme des règles récentes.

## 4. Solana : observations fondamentales, risques et métriques à réunir

**Identité :** SOL, actif natif du réseau Solana. Il sert au paiement des frais de transaction et au staking auprès de validateurs. La documentation du protocole distingue les frais de base et les frais de priorisation, qui servent des objectifs différents. **Aucun de ces frais réseau n'est un tarif maker/taker OKX**, et l'activité d'une application Solana n'est pas mécaniquement un revenu pour tout détenteur de SOL.

Sources primaires : [structure des frais Solana](https://solana.com/docs/core/fees/fee-structure) et [staking](https://solana.com/docs/references/staking). Ces sources décrivent le protocole ; elles ne mesurent pas l'utilisation à la date du carnet OKX.

**Cinq axes vérifiables :**
1. Réseau : compter et dater les interruptions confirmées, la disponibilité des nœuds RPC et les dégradations ; ne pas en déduire une panne à partir d'une seule anomalie de prix.
2. Usage : isoler transactions non liées aux votes, comptes et opérations répétitives, volumes de règlements, stablecoins et échanges réels ; aucune mesure on-chain n'est calculée ici.
3. Coûts : mesurer frais réseau, frais de priorité, commission staking, frais exchange et slippage dans **cinq colonnes différentes**.
4. Distribution : suivre concentration de stake, commissions et diversité des validateurs sur des données officielles horodatées ; les taux affichés ne sont pas une garantie de rendement futur.
5. Marché : mettre en regard volumes natifs de la paire, profondeur SOL-USDC et volatilité d'une série OHLCV alignée, sans convertir l'archive SOLUSDT en USD à parité implicite.

Il s'agit d'un **plan de recherche fondamentale**, pas de mesures déjà acquises ni de recommandation d'investissement.

## 5. Audit du Coffre SOLUSDT : trous des cinq mois ciblés

Un audit **préexistant** des ZIP originaux Binance Spot a identifié les lacunes suivantes, en **USDT** :

| Mois ciblé | Fenêtre manquante, UTC | Minutes |
|---|---|---:|
| Août 2021 | 13/08, 02:00–06:30 | 270 |
| Septembre 2021 | 29/09, 07:00–09:00 | 120 |
| Décembre 2021 | Aucun trou répertorié pour ce mois | 0 |
| Février 2023 | 14/02, 16:39–16:40 | 1 |
| Mars 2023 | 24/03, 12:40–14:00 | 80 |
| **Total des cinq mois** | **Sous-ensemble seulement** | **471** |

L'audit consigne les checksums des ZIP originaux et le statut `source_verified` des mois. **Nous n'avons ni téléchargé ni revalidé les ZIP pendant cette étude**. Les autres 59 mois ne sont pas certifiés par ce sous-audit. Aucun remplissage synthétique, aucune hypothèse « minute absente = zéro transaction ».

## 6. État des preuves et condition PAPER

| Critère | SOL/USDC aujourd'hui dans le dossier |
|---|---|
| Identité CoinGecko et fondamentaux | Identité `solana` et sources primaires repérées |
| Marché synchronisé BTC/ETH/XRP | Snapshot USD archivé au 09/11 |
| Paire OKX affichée | Oui, dans capture du 08/11, droit du compte inconnu |
| Carnets et règles publiques historiques | 20 relevés à cinq niveaux, règles d'octobre documentées |
| Instrument natif Spot actuel `state/minSz/lotSz/tickSz` | **Non vérifié au 09/11** |
| Frais privés, taille, profondeur actuelle, execution | **Non vérifiés** |
| Historique minute | 64 mois indexés, cinq mois avec audit partiel de trous |
| PAPER reproductible, simulation prouvée | **Non** |

**Décision :** SOL/USDC rejoint les dossiers comparatifs **documentés** BTC/ETH/XRP. Il ne rejoint pas une liste d'actifs **certifiés PAPER**. Prochain contrôle indépendant : nouvelle capture publique horodatée du carnet et des règles Spot, puis validation du sous-ensemble historique utilisé pour une éventuelle étude de simulation.

---
*Recherche documentaire : aucun ordre, aucune lecture de portefeuille privé, aucune clé, aucune retouche de l'Administrator, du Trader ou du Bridge R31.*
