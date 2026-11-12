# Seven Heaven — ETH : passage du miroir Yahoo aux bougies natives Bitstamp

**12 novembre 2026** · **Validation native obtenue et publiée** après correction de l'export CSV. L'état ci-dessous contient le journal de préparation et le bilan final.

## Bilan définitif après le correctif GitHub Actions

Le dossier complet est dans [l'audit Bitstamp vs Binance](./SEVEN_HEAVEN_ETH_BITSTAMP_NATIVE_VS_BINANCE_EMA10_30_COMPARATIVE_AUDIT_2026_11_12.md) : **1 310 jours natifs**, **1 035 jours PAPER**, Bitstamp **+89,55 %** EMA et **−54,10 %** de drawdown, **1 034/1 035 positions** concordantes avec Binance, **54 opérations fictives**. [Run GitHub Actions #3 réussi](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43234052193). Le correctif porte **uniquement sur les fins de ligne CSV** ; aucun paramètre EMA modifié.

## Pourquoi une nouvelle étape ?

L'étude précédente a constaté une concordance EMA **309/309 journées** entre une série Yahoo Finance ETH-USD (miroir SeedFlora) et la référence Binance ETH-USDT, avec un rendement fictif **−21,77 % EMA** contre **−51,73 % Buy & Hold** sur cette période. Ces résultats sont **valables uniquement pour la fenêtre 2025-09-26→2026-07-31**, et la série Yahoo consultée présente **40 jours absents** plus tard en 2026. Cette validation de signaux ne vaut pas test d'un exchange ETH/USD indépendant sur toute la période.

### Recherche de nouvelles sources (documents consultés)

- **Bitstamp public API OHLC**, documentation officielle https://www.bitstamp.net/api/ : endpoint `GET /api/v2/ohlc/{market_symbol}/`, `ethusd`, `step=86400` pour bougies quotidiennes, `limit` maximum 1 000, `end` (timestamp Unix) pour remonter dans le passé.
- **Kraken**, documentation officielle https://support.kraken.com/in/articles/360047124832-downloadable-historical-ohlcvt-open-high-low-close-volume-trades-data : données OHLCVT historiques complètes, fichiers 1 440 minutes, archive de plusieurs gigaoctets et mises à jour trimestrielles avec empreintes ; non téléchargée ici.
- **CryptoDataDownload Bitstamp**, https://www.cryptodatadownload.com/data/bitstamp/ : fichiers historiques annoncés, mais aucun CSV ETH/USD complet récupéré et vérifié ici.

**Choix :** employer l'API OHLC officielle publique Bitstamp comme prochaine source de prix, plutôt qu'inventer ou reconstruire les jours manquants.

## Livraison dans le répertoire inter-IA

1. [**Protocole gelé avant toute récupération réelle**](./SEVEN_HEAVEN_ETH_BITSTAMP_NATIVE_DAILY_EMA10_30_2024_2026_FROZEN_PROTOCOL_2026_11_12.md), commit `75a7c15`.
2. [**Collecteur et simulateur Python natif, en lecture seule**](./SEVEN_HEAVEN_ETH_BITSTAMP_NATIVE_REPLAY_2026_11_12.py) — correctif LF publié, commit `24de90d`.
3. [**Tests hors ligne de pagination, trou dans l'historique et OHLC invalide**](./test_seven_heaven_eth_bitstamp_native_replay.py) : **3 tests passés localement**, plus `--selftest` et simulation synthétique sur 1 310 journées complètes.
4. [**Workflow GitHub Actions de collecte isolée**](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/workflows/seven-heaven-eth-bitstamp-native-research.yml).

Workflow : https://github.com/BlueAzur-Hub/erith-ia-memory/actions/workflows/seven-heaven-eth-bitstamp-native-research.yml

Ce workflow est déclenchable une fois par changement du code/workflow ou manuellement, **sans planification récurrente**. Si une exécution validée aboutit, elle écrit uniquement dans :
`coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/native_bitstamp_eth_2024_2026_evidence/`

La sortie attendue est le CSV des **1 310 journées quotidiennes UTC contrôlées**, un JSON indiquant les empreintes SHA-256 du CSV et des réponses API, une simulation EMA10/30 et Buy & Hold (avec coûts doublés), un CSV des dates de désaccord avec Binance, et un rapport lisible.

## État effectivement vérifié

- [x] Documentation officielle API/archives repérée ; paramètres d'API et limites documentés.
- [x] Protocole et programme publiés sur GitHub `main` ; contenu du programme GitHub égal au fichier local testé (même Git blob SHA-1).
- [x] Compilation Python et auto-tests élémentaires réussis en local.
- [x] **Trois tests hors ligne** réussis, y compris pagination fictive de 1 310 jours et rejet des trous.
- [x] Workflow créé et mis à jour pour exiger ces tests avant collecte.
- [x] **CSV Bitstamp natif de 1 310 jours publié et contrôlé**, du 2023-04-01 au 2026-10-31 ; SHA-256 `881227ba20481322b6829c19d97b799d11a73ae155be8868cf5ec943039c6b49`.
- [x] **Exécution native API et replay de bout en bout réussis dans GitHub Actions #3** ; Bitstamp EMA +89,55 % (PAPER), comparaison Binance +91,27 %, même calendrier.
- [x] **Preuves JSON, CSV et rapport publiés**, corrélation des rendements 0,999923, une seule différence de position le 2025-06-19.

L'API n'était pas accessible directement depuis l'environnement local initial, mais **GitHub Actions a téléchargé les cours officiels Bitstamp et exécuté le replay**. Voir [run #3 réussi](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43234052193), [preuve JSON](./native_bitstamp_eth_2024_2026_evidence/eth_ema_bitstamp_native_proofs.json) et [audit comparatif complet](./SEVEN_HEAVEN_ETH_BITSTAMP_NATIVE_VS_BINANCE_EMA10_30_COMPARATIVE_AUDIT_2026_11_12.md). Le run #2 avait échoué **uniquement à la publication** à cause de CSV CRLF ; les calculs et contrôles étaient déjà passés. **Aucune nouvelle affirmation de rentabilité prospective :** ce sont les mêmes dates historiques.

## Méthode et sécurité

Les EMA demeurent `EMA10 > EMA30` ET `close > EMA30`, initialisées depuis 2023-04-01 ; entrée/sortie au prochain open après clôture UTC, capital fictif 1 000 USD pour Bitstamp, frais 0,10 % + glissement 0,05 % par côté, coûts ×2. Période d'essai **2024-01-01→2026-10-31**, dates communes Binance et Bitstamp seulement après contrôle des 1 035 journées.

**Aucune transaction, aucun Bridge, aucun changement Administrator/Trader/Operator.** Les données Bitstamp natives et le replay 2024–2026 ont été **obtenus, contrôlés et publiés**. Les performances restent rétrospectives et fictives.
