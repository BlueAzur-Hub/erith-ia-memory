# Seven Heaven — OKX BTC-USDC 15 October 2026: EMA 5/13 V5 versus pre-open historical L2

**Research date:** 13 novembre 2026 (heure de France ; pipeline GitHub exécuté le 12 novembre UTC). **Périmètre :** une seule journée UTC et une seule paire OKX Spot USDC ; période de bougies **15m** ; capital initial fictif **1 000 USDC** ; référence de profondeur **1 000 USDC par côté**. **PAPER / lecture seule, aucun ordre réel.**

## 1. Résultat de cette nouvelle étude

**Premier appariement strictement pré-ouverture réussi, et indépendamment vérifié avec le moteur V5 original.**

- **300 bougies OKX Spot BTC-USDC de 15 minutes**, consécutives et clôturées, du **12 octobre 2026 à 21:00 UTC** au **15 octobre à 23:45 UTC**, obtenues directement sur l'API publique OKX en trois pages, puis figées dans le fichier de preuves.
- **EMA rapides 5 et lentes 13** : 32 croisements sur la fenêtre de 300 bougies, calculés selon la formule du module V4 et les règles d'exécution long-only de V5.
- Sur le **15 octobre**, **12 décisions exécutables fictives** (6 achats, 6 ventes, soit **6 allers-retours**) et **12 carnets L2 historiques appariés strictement AVANT l'ouverture de la bougie suivante**.
- **9/12** carnets de moins de **100 ms**, **12/12** de moins de **1 s**. Âge minimal **3 ms**, maximal **253 ms**, moyen **68.75 ms**.
- L'archive officielle quotidienne **BTC-USDC 15/10** a été relue intégralement en flux : **2 346 486 événements L2**, **96 snapshots** ; SHA-256 compressé et membre décompressé vérifiés, CRC gzip et **4/4 ancres de référence** concordantes.
- [**GitHub Actions — tous les contrôles SUCCESS, y compris un rejeu du véritable module V5 JS pour les timestamps achat/vente**](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43327600503).

Il s'agit d'une avancée par rapport à l'audit précédent : celui-ci avait démontré que les **premiers carnets après T** ne prouvaient rien sur une exécution à T. Le nouveau replay conserve au contraire, pour chacun des instants T, **le dernier état L2 strictement antérieur à T**, puis vérifie son âge.

## 2. Sources gelées et vérifiables

| Source | Preuve |
|---|---|
| [Programme Python, version publiée sur `main`](./SEVEN_HEAVEN_BTC_USDC_V5_EMA5_13_2026_10_15_CAUSAL_L2_REPLAY.py) | Code public ; réutilisation du reconstructeur existant, sans modification du Trader |
| [Preuve JSON complète, incluant les 300 OHLC, 32 événements et les 12 appariements](./SEVEN_HEAVEN_BTC_USDC_V5_EMA5_13_2026_10_15_CAUSAL_L2_PROOFS.json) | Git blob SHA-1 `a103f3a65e9cf5fbe2e22b93d27f51286d37cb0f` |
| Source L2 archive officielle | SHA-256 `3b543b7333a6c71f4a8bf0ddf4e058fa84f61ad58092b3250784acc0964c7b44` |
| Fichier `.data` interne | SHA-256 `a8a3231d34d03a0d261ac9952f1ba2a953a4d31986e04c8bbbbdc61c06264963` |
| OHLC 300 bougies validées | SHA-256 canonique `d84adf7cae0cd11fdf89f0d1def9a6d586854caae4ea18c80e23840f60a4c421` |
| [Workflow GitHub Actions de reproduction et vérification V5 JS](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/.github/workflows/seven-heaven-okx-btc-v5-ema15m-preopen-l2-causal-replay.yml) | [Exécution SUCCESS](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43327600503) |
| Frais du compte | [Notion `OKX MEMORY CORE → 01 Trading Fees`](https://app.notion.com/p/3e07754fe08481eb95c7cdc4fd8ff099) : Spot maker 0,08 %, taker 0,10 % observés les 06/09/12 novembre |

La période OHLC est **strictement la même paire et la même devise que le carnet**. Aucun résultat Bitstamp/USD, Binance/USDT ou cours converti n'est injecté.

**Règle de date :** on ne prétend **pas** que les frais taker observés en novembre étaient le tarif réellement facturé sur la paire en octobre. Le taux 0,10 % est utilisé **comme scénario de coût actuel du compte**.

## 3. Les douze carnets précédant exactement les ouvertures V5

Les prix fictifs ci-dessous sont calculés depuis les bids/asks du dernier carnet strictement **antérieur** à l'ouverture, pour un **notionnel de référence 1 000 USDC**. La friction `mid → VWAP` contient **déjà le demi-spread + la profondeur**, hors commissions. La colonne « défavorable vs OHLC » est signée **dans le sens de l'ordre** (positive = prix de carnet moins favorable que l'ouverture OHLC ; négative = plus favorable). Ce n'est **pas** du glissement réellement exécuté.

| Ouverture UTC | Sens | Âge carnet (ms) | Friction depuis mid (bp) | Écart défavorable vs ouverture OHLC (bp) | VWAP de carnet (USDC/BTC) |
|---|---|---:|---:|---:|---:|
| 00:30 | Achat | 49 | 0.100329 | 0.817 | 81688.670 |
| 00:45 | Vente | 9 | 0.006138 | 0.012 | 81456.200 |
| 01:45 | Achat | 23 | 1.011898 | 2.902 | 81759.522 |
| 02:00 | Vente | 253 | 0.006131 | 0.454 | 81549.800 |
| 05:00 | Achat | 18 | 0.006135 | 0.000 | 81501.600 |
| 05:30 | Vente | 17 | 0.006171 | 0.000 | 81028.500 |
| 07:45 | Achat | 19 | 0.006149 | -1.230 | 81318.800 |
| 10:15 | Vente | 3 | 0.006172 | -1.148 | 81015.700 |
| 14:30 | Achat | 4 | 0.141973 | 0.148 | 81087.501 |
| 21:00 | Vente | 82 | 0.006095 | 0.000 | 82033.800 |
| 22:00 | Achat | 103 | 0.204895 | -1.015 | 82348.437 |
| 23:30 | Vente | 245 | 0.006086 | -0.986 | 82149.500 |

**Répartition descriptive des 12 ouvertures** :

- Friction moyenne **mid → VWAP** : **0.125681 bp** par opération ; maximum **1.011898 bp**.
- **Achats (n=6)** : moyenne **0.245230 bp**, maximum **1.011898 bp** ; **ventes (n=6)** : moyenne **0.006132 bp**, maximum **0.006172 bp**.
- Écart **absolu** du prix carnet fictif au prix d'ouverture OHLC : moyenne **0.726011 bp**, maximum **2.902325 bp**. L'écart peut être favorable ou défavorable selon le côté.
- Les **12 frictions mid → VWAP observées** restent inférieures au forfait **5 bp** de V5 sur cet échantillon ; cela **n'établit pas que 5 bp couvre toujours le vrai slippage de V5**, notamment hors de cette journée ou sous latence.

## 4. Simulation économique comparative — mêmes 6 allers-retours, frais constants

Deux constructions PAPER suivent **les mêmes signaux** avec un **capital initial fictif de 1 000 USDC**, réinvesti au fil des six allers-retours, et les **mêmes frais hypothétiques taker de 0,10 % par côté** :

1. **V5 originel :** achat à `next.open × 1,0005` ; vente à `next.open × 0,9995`, frais de 0,10 % par côté ; c'est le modèle actuel avec glissement fixe de 0,05 %.
2. **Contrefactuel carnet pré-ouverture :** achat/vente au VWAP du **dernier carnet avant T**, pour un **notionnel de référence fixé à 1 000 USDC**, puis mêmes frais. Le modèle **ne simule pas** la latence de l'ordre envoyé après T, et son notionnel de référence de carnet **n'évolue pas avec le capital** ; il ne saurait être qualifié de véritable exécution V6 ou de nouveau prix réel.

| Scénario | Capital final fictif | PnL net fictif | Rendement sur cette journée |
|---|---:|---:|---:|
| V5, 0,05 % de glissement/côté | **976.48576 USDC** | **-23.51424 USDC** | **-2.3514 %** |
| Carnet strictement avant T, VWAP hypothétique | **982.36687 USDC** | **-17.63313 USDC** | **-1.7633 %** |
| Écart contrefactuel − V5 | **5.88111 USDC** | — | **0.5881 point(s)** |

Les chiffres proviennent d'un **recalcul arithmétique indépendant des 12 lignes de preuve**. Le workflow a directement recoupé **les timestamps d'exécution V5 JS** ; ce tableau de PnL n'est **pas une mesure de frais ou de performance réalisée sur un compte**.

| Aller-retour (UTC) | PnL V5 fictif (USDC) | PnL carnet pré-T fictif (USDC) |
|---|---:|---:|
| 00:30–00:45 | -5.750 | -4.838 |
| 01:45–02:00 | -5.189 | -4.536 |
| 05:00–05:30 | -8.687 | -7.718 |
| 07:45–10:15 | -6.811 | -5.620 |
| 14:30–21:00 | 8.426 | 9.430 |
| 22:00–23:30 | -5.502 | -4.350 |

**Interprétation :** sur cette seule journée, les **deux scénarios sont perdants**. Le contrefactuel fondé sur les carnets strictement antérieurs coûte moins cher que le forfait V5 pour ces douze estimations, mais **ne devient pas une meilleure stratégie validée** : un carnet à T−ms peut changer avant le remplissage effectif de l'ordre à T+latence.

## 5. Intégrité scientifique et ce qui reste inconnu

- Le programme a vérifié le SHA-256 du **fichier L2 entier** et de son membre interne, le CRC gzip, les premiers événements épinglés et les quatre anciennes ancres ; les **2 346 486 événements** ont été relus. **L'absence de chaîne `seqId/prevSeqId` exploitable empêche de prouver l'exhaustivité amont** du flux.
- Les **12 dates et sens d'opérations** ont été contrôlés indépendamment par le **vrai module V5 JavaScript** sur les 300 OHLC figées ; les prix de carnet proviennent du reconstructeur L2 épinglé, pas d'un carnet contemporain.
- **Aucun look-ahead dans la sélection des carnets** : `last L2 ts < next bar open ts` pour toutes les lignes appariées. L'ordre réel de publication/réception réseau avant T **n'est pas démontré** par les seuls timestamps source.
- Les premières 00:00 UTC de l'archive quotidienne n'ont pas de carnet L2 antérieur disponible dans ce seul fichier ; aucun des douze signaux retenus n'exige de carnet à 00:00.
- Les 300 OHLC couvrent **une seule fenêtre figée** de trois jours et 3 heures ; ce n'est ni une évaluation de 2019–2026, ni un échantillon hors période choisi à l'avance.
- Les frais **0,10 %** appliqués ici correspondent aux captures de novembre ; frais effectivement prélevés en octobre, remises, exceptions de paire et devise de perception **non établis**.
- Le contrefactuel fixe le **notionnel du carnet à 1 000 USDC** à chaque étape alors que le capital simulé évolue : l'écart de taille réel aurait un impact supplémentaire à recalculer avant toute calibration de production.

## 6. Décision et prochaine étude

**Acquis :** la reconstitution historique **sans carnet postérieur** et la concordance des **12 dates V5 JS** sont démontrées, pour BTC-USDC 15m / EMA 5/13 sur le 15 octobre 2026.

**Non acquis :** un véritable tarif historique de compte, une exécution possible à l'ouverture OHLC, le prix du premier trade timestampé, la priorité d'ordre, la latence et la qualité hors échantillon. **Conserver les paramètres V5 actuels : frais taker 0,10 % et glissement forfaitaire 0,05 % par côté** pour les simulations standard.

**Direction scientifique unique :** reproduire **la même méthode, strictement sans changer les seuils ni les règles**, sur les journées **15 août et 15 septembre 2026**, puis sur **ETH-USDC** si les sources OHLC et L2 natives sont suffisantes. Pour éviter une nouvelle étude fragile, évaluer les résultats sur plusieurs dates **avant** de décider de recalibrer le glissement V5. Les nouveaux essais doivent rester documentés et réutiliser les archives source déjà épinglées.

**Aucune modification de l'Administrator, de l'Operator, du Trader ou du Bridge ; aucun ordre, aucune nouvelle clé API, aucune surveillance récurrente.**
