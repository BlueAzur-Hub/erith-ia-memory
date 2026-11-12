# Seven Heaven — Validation exploratoire inter-actifs EMA 10/30 : Ethereum ETH/USDT, 2022 et 2024–2026

**12 novembre 2026 · Recherche PAPER exécutée, document de passation pour les autres IA. Aucune exécution réelle.**

## Réponse scientifique

Les critères EMA identifiés sur Bitcoin ont été appliqués **tels quels**, sans optimisation préalable sur Ethereum. La stratégie qui entre en ETH lorsque `EMA10 > EMA30` **et** `close > EMA30` a des résultats extrêmement dépendants de la période :

- **2024** : EMA -9.01 %, Buy & Hold 100 % 45.84 %, Buy & Hold 50 % 22.92 %, cash 0 %.
- **2025** : EMA 93.72 %, Buy & Hold 100 % -11.24 %, Buy & Hold 50 % -5.62 %, cash 0 %.
- **2022_FEB_DEC** : EMA -46.92 %, Buy & Hold 100 % -55.62 %, Buy & Hold 50 % -27.81 %, cash 0 %.
- **2026_JAN_OCT** : EMA 8.51 %, Buy & Hold 100 % -24.32 %, Buy & Hold 50 % -12.16 %, cash 0 %.
- **2024_2026_CONTINUOUS** : EMA 91.27 %, Buy & Hold 100 % -1.44 %, Buy & Hold 50 % -0.72 %, cash 0 %.

**La stratégie ne généralise pas de manière fiable à toutes les périodes : elle perd 46,92 % sur 2022 (moins que 100 % ETH, mais plus que 50 % ETH), et perd 9,01 % sur 2024 pendant que la conservation d'ETH gagne 45,84 %.**

Elle dépasse les témoins en 2025 et sur janvier–octobre 2026, mais les écarts ex post ne constituent pas une garantie future.

## Protocole figé en amont et qualité des données

- [**Protocole pré-enregistré**](./SEVEN_HEAVEN_ETH_EMA_CROSS_ASSET_2022_2024_2026_FROZEN_PROTOCOL_2026_11_12.md), commit initial `46bf35f4392a`. Les hypothèses (EMA10/30, clôture au-dessus de l'EMA30, achat/vente à l'ouverture suivante, frais, capital) n'ont pas changé.
- **Fichier source :** 5 shards du registre `public/agent_crypto_erith_ia/data/historical_archive_prototype/calendar_year_hourly_shards/index.json`, Binance Spot `ETHUSDT` (1h dérivée des archives Binance originales 1m).
- **SHA-256 gzip vérifiés** contre le manifeste pour les 5 shards ; **40 200 bougies horaires**. Chaque plage horaire est continue. Agrégation de 24 heures UTC par jour, contrôles de l'ouverture, maximum/minimum, clôture et volume.
- **2022 :** 365 jours UTC complets ; janvier initialise les EMA, puis **334 jours du 1er février au 31 décembre 2022**. Une erreur typographique du protocole initial indiquait 333 jours ; un erratum a été ajouté sans modifier les dates ni les critères.
- **2023-04 à 2026-10 :** 1 310 jours UTC complets, dont 275 jours d'initialisation 2023 puis 1 035 jours investis continûment 2024–2026. **Les années ETH 2018–2021 ne sont pas complètes dans cette source**, donc ne pas inventer un replay continu de ces années.
- Sources figées : 
  - `ethereum-2022-span12-eeb3dbbe089f0d7d409918be1568fd4bc58ee6c11725f358cac7e65c408d40e0.json.gz` — 8760 heures, SHA-256 `eeb3dbbe089f0d7d409918be1568fd4bc58ee6c11725f358cac7e65c408d40e0`
  - `ethereum-2023-span13-fec387cb9835e9679094b40dd1430b7ba75492b59b7a9e483a8bce8d0a982294.json.gz` — 6600 heures, SHA-256 `fec387cb9835e9679094b40dd1430b7ba75492b59b7a9e483a8bce8d0a982294`
  - `ethereum-2024-span13-12f5c738eac80ba281614e1f20fb42d3d255514a87bb1af90828a917e8133f4e.json.gz` — 8784 heures, SHA-256 `12f5c738eac80ba281614e1f20fb42d3d255514a87bb1af90828a917e8133f4e`
  - `ethereum-2025-span13-a1abd476dd694759650799a51c6450c4614a085623b1b7c8e7a17b7ba4640ba6.json.gz` — 8760 heures, SHA-256 `a1abd476dd694759650799a51c6450c4614a085623b1b7c8e7a17b7ba4640ba6`
  - `ethereum-2026-span13-a9d1e5f3fb13b6a55fb0a28195f8eaee62f924a0245e0029ffb1de42d054ed64.json.gz` — 7296 heures, SHA-256 `a9d1e5f3fb13b6a55fb0a28195f8eaee62f924a0245e0029ffb1de42d054ed64`

## Portefeuilles et conventions

- Capital initial de **1 000 USDT** par expérience, sans levier ni short.
- Signal calculé **après** la clôture de t, exécution fictive à l'ouverture t+1 (ni fuite des prix futurs ni clairvoyance d'une bougie incomplète).
- Signal EMA : **EMA10 > EMA30 et clôture > EMA30**, calculés sur les clôtures quotidiennes par formule récursive alpha = 2/(n+1) ; première clôture du segment de chauffage utilisée comme graine.
- EMA positionne **100 % ETH ou 100 % liquidités USDT** selon l'état. Témoins : Buy & Hold 100 % ETH, Buy & Hold 50 % ETH / 50 % cash, et 100 % cash.
- Coûts : **0,10 % de frais et 0,05 % de glissement de chaque côté**. Tests de sensibilité avec coûts doublés ; évaluation quotidienne à la valeur nette liquidable, incluant une liquidation fictive finale.
- **Attention :** liquidités = USDT, dont les risques d'émetteur/exchange ne sont pas modélisés. Un ordre simulé à l'ouverture n'est pas une opération confirmée en carnet.

## Résultats par période — rendement net de coûts fictifs

| Période | EMA 10/30 | Buy & Hold 100 % ETH | Buy & Hold 50 % ETH | Cash USDT |
|---|---:|---:|---:|---:|
| 2022-02-01 → 2022-12-31 | -46.92 % | -55.62 % | -27.81 % | 0.00 % |
| 2024-01-01 → 2024-12-31 | -9.01 % | 45.84 % | 22.92 % | 0.00 % |
| 2025-01-01 → 2025-12-31 | 93.72 % | -11.24 % | -5.62 % | 0.00 % |
| 2026-01-01 → 2026-10-31 | 8.51 % | -24.32 % | -12.16 % | 0.00 % |
| 2024-01-01 → 2026-10-31 | 91.27 % | -1.44 % | -0.72 % | 0.00 % |

**Lignes annuelles :** expériences indépendantes de 1 000 USDT, réinitialisées au début de la période pour comparaison. **Ligne continue :** seul portefeuille sans réinitialisation, maintenu du 1er janvier 2024 au 31 octobre 2026. Ne pas cumuler les lignes annuelles comme si elles décrivaient les transactions du portefeuille continu.

## Risque, fréquence et robustesse aux coûts

| Mesure du portefeuille 2024–2026 continu | EMA | Buy & Hold 100 % ETH | Buy & Hold 50 % ETH |
|---|---:|---:|---:|
| Capital final / 1 000 USDT | 1912.68 | 985.55 | 992.78 |
| Rendement total | 91.27 % | -1.44 % | -0.72 % |
| Baisse maximale | -53.82 % | -67.55 % | -45.84 % |
| Transactions simulées | 56 | 1 | 1 |
| Journées exposées à ETH | 42.80 % | 100 % | 100 % |
| Plus longue période en cash | 112 jours | 0 | 0 |
| Rendement avec coûts doublés | 75.84 % | -1.74 % | -0.87 % |

**Risque majeur :** malgré un résultat final EMA de +91,27 %, le drawdown de **−53,82 %** serait très difficile à supporter. Le test annuel 2024 est un contre-exemple net : EMA −9,01 % avec un drawdown de −53,82 %, alors que Buy & Hold gagne +45,84 % avec un drawdown de −45,26 %.

Sur 2022, la plus faible exposition des EMA (23,35 % des journées) **n'a pas suffi à éviter une perte de 46,92 %**. Les changements d'état peuvent provoquer achats au mauvais moment et ventes après la baisse.

## Contrôles et pièces reproductibles

- [**Script Python exécutable depuis le checkout du Coffre**](./SEVEN_HEAVEN_ETH_EMA_CROSS_ASSET_2022_2024_2026_REPLAY_2026_11_12.py) — lit directement les cinq shards gzip dans le dépôt, vérifie SHA-256 et continuité, agrége les bougies UTC, rejoue les règles. Commande :

```bash
python coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_ETH_EMA_CROSS_ASSET_2022_2024_2026_REPLAY_2026_11_12.py --repo-root . --outdir /tmp/seven_eth_ema
```

- [**Preuves JSON structurées**](./SEVEN_HEAVEN_ETH_EMA_CROSS_ASSET_2022_2024_2026_REPLAY_2026_11_12_PROOFS.json) : SHA, métriques, périodes et hypothèses. Le script propose aussi `--check-proofs /chemin/vers/SEVEN_HEAVEN_ETH_EMA_CROSS_ASSET_2022_2024_2026_REPLAY_2026_11_12_PROOFS.json` pour comparer les résultats.
- [**Capital liquidable quotidien**](./SEVEN_HEAVEN_ETH_EMA_CROSS_ASSET_2022_2024_2026_REPLAY_2026_11_12_EQUITY_DAILY.csv) : toutes les journées des portefeuilles 2022 et 2024–2026 continus, frais normaux et doublés.
- [**Journal d'opérations fictives**](./SEVEN_HEAVEN_ETH_EMA_CROSS_ASSET_2022_2024_2026_REPLAY_2026_11_12_TRADES.csv) : transactions par période et stratégie.
- L'implémentation Python a passé **compilation** et **test synthétique de 45 journées** sur les transitions EMA et la comptabilité de trois stratégies. **Les résultats historiques ont été exécutés et archivés dans le moteur de calcul de cette étude**, mais une **réexécution Python complète depuis un checkout contenant les cinq gzip reste à confronter à la preuve JSON** avant d'affirmer une identité binaire indépendante entre moteurs.
- Assertions historiques : SHA-256 de 5 shards, nombre de bougies, 24 heures par journée, 1 675 journées de source agrégées sur les deux séquences, aucune rupture d'horodatage à l'intérieur des segments, 14 vérifications de causalité des EMA.

## Interprétation et suite proposée

**Transférabilité partielle, non démonstration d'une stratégie universelle.** L'hypothèse EMA fonctionne mieux que les témoins sur certaines périodes ETH, mais échoue fortement sur d'autres. Ne pas présenter une meilleure performance ex post comme garantie de risque ou de profit.

Suite prioritaire : **contrôle croisé BTC/ETH sur les mêmes dates 2022 et 2024–2026**, avec une même mise en jeu du capital et les mêmes frais, puis mesure d'un portefeuille diversifié (sans optimiser les pondérations à posteriori). La série quotidienne BTC du Coffre s'arrête au 30 septembre 2026 ; comparer d'abord jusqu'à cette date commune plutôt que d'inventer un BTC d'octobre.

**Sécurité :** pas d'ordre, pas de recommandation individualisée, pas d'accès au compte, aucune modification du Trader, de l'Administrator, de l'Operator ni du Bridge.
