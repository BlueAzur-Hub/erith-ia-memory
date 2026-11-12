# Seven Heaven — ETH/USD Bitstamp natif vs ETH/USDT Binance : audit EMA 10/30

**12 novembre 2026 · Recherche PAPER historique en lecture seule · Exécution GitHub Actions validée.**

## Bilan vérifié

Les données journalières **Bitstamp Spot ETH/USD** ont effectivement été récupérées depuis l'API publique officielle, sur une série continue de **1 310 bougies UTC** du **1er avril 2023 au 31 octobre 2026** : 275 journées de chauffe EMA puis **1 035 jours** de simulations du 1er janvier 2024 au 31 octobre 2026. L'exécution GitHub Actions [#3, réussite](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43234052193) a publié les résultats après correction de l'export CSV (CRLF → LF). Le [run #2](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43232273835) avait **réussi la collecte et les calculs**, mais échoué seulement à `git diff --cached --check` sur les fins de ligne CRLF. **Aucun paramètre EMA n'a été modifié**.

## 1. Règles conservées

[Protocole préenregistré avant les données Bitstamp](./SEVEN_HEAVEN_ETH_BITSTAMP_NATIVE_DAILY_EMA10_30_2024_2026_FROZEN_PROTOCOL_2026_11_12.md), commit `75a7c150d5a9fe824189e78254e5160e26904a9e`. EMA 10 et EMA 30 sur clôtures UTC ; position ETH si `EMA10 > EMA30` ET `close > EMA30`, sinon cash ; décisions de la clôture t exécutées fictivement à l'ouverture t+1 ; 1 000 unités monétaires initiales ; frais 0,10 % et glissement 0,05 % de chaque côté ; scénarios coûts ×2 ; aucun levier ni short. Binance est coté **ETH/USDT**, Bitstamp **ETH/USD** : les rendements en pourcentage sont comparables avec prudence, les capitaux USD et USDT ne sont pas convertis.

## 2. Résultats historiques, période identique

| Stratégie PAPER | Bitstamp ETH/USD | Binance ETH/USDT |
|---|---:|---:|
| **EMA10/30 : rendement net** | **+89,55 %** | **+91,27 %** |
| EMA10/30 : capital final fictif | 1 895,49 USD | 1 912,68 USDT |
| EMA10/30 : baisse maximale | −54,10 % | −53,82 % |
| EMA10/30 : nombre d'opérations fictives | 54 | 56 |
| EMA10/30 : journées ETH détenu | 442 | 443 |
| EMA10/30 : rendement avec coûts ×2 | +74,79 % | +75,84 % |
| **Buy & Hold : rendement net** | **−1,62 %** | **−1,44 %** |
| Buy & Hold : baisse maximale | −67,59 % | −67,55 % |

- Différence EMA de rendement : **−1,72 point** (Bitstamp moins Binance).
- États d'exposition identiques : **1 034 sur 1 035 (99,90 %)**. **Unique date divergente : 19 juin 2025** ; Bitstamp en cash, Binance exposé.
- Corrélation des **1 034 variations quotidiennes** ETH du témoin et de la nouvelle source : **0,999923**.
- Les **54** contre **56** transactions fictives ne doivent pas être effacées : une journée de position différente peut modifier deux transactions aller/retour.
- L'EMA rapporte davantage que Buy & Hold dans les deux simulations, mais **subit une perte maximale supérieure à 53 %** ; ce n'est ni une protection complète ni une promesse de profit futur.

## 3. Sources vérifiables

Fichiers réellement publiés par le workflow, tous dans le répertoire partagé :

- [**CSV Bitstamp natif, 1 310 bougies quotidiennes**](./native_bitstamp_eth_2024_2026_evidence/bitstamp_ethusd_daily_2023_2026.csv), **SHA-256 `881227ba20481322b6829c19d97b799d11a73ae155be8868cf5ec943039c6b49`**.
- [**Preuves JSON : provenance, horodatages des deux pages Bitstamp, stratégies et divergences**](./native_bitstamp_eth_2024_2026_evidence/eth_ema_bitstamp_native_proofs.json).
- [**Rapport machine généré**](./native_bitstamp_eth_2024_2026_evidence/SEVEN_HEAVEN_ETH_BITSTAMP_NATIVE_2024_2026_REPLAY_REPORT.md).
- [**CSV des désaccords**](./native_bitstamp_eth_2024_2026_evidence/eth_ema_binance_bitstamp_disagreements.csv), une seule ligne de données : `2025-06-19,0,1`.
- [**Code Python officiel du projet et tests**](./SEVEN_HEAVEN_ETH_BITSTAMP_NATIVE_REPLAY_2026_11_12.py) ; [tests de sécurité](./test_seven_heaven_eth_bitstamp_native_replay.py).
- [**Témoin Binance, preuves archivées**](./SEVEN_HEAVEN_BTC_ETH_EQUAL_DATE_EMA_DUAL_PORTFOLIO_REPLAY_2026_11_12_PROOFS.json), Git blob `43aba5f666df19c9369a58866165c5684b77ecba`.

**Conformité :** la collecte officielle Bitstamp a transmis **deux lots de 1 000 bougies**, fusionnés sans doublon contradictoire ; seule la plage nécessaire de 1 310 journées a été conservée. Le workflow a contrôlé couverture, SHA-256 du CSV, 1 035 décisions, 1 034 rendements comparables, puis l'artefact GitHub Actions et le commit dans le Coffre.

## 4. Interprétation scientifique et limites

Ce résultat démontre une **forte reproductibilité historique des décisions EMA sur deux lieux de cotation du même actif**, avec des prix ETH/USD et ETH/USDT proches. Il ne constitue **pas un échantillon chronologique inédit** : toute la période 2024–2026 a déjà été explorée dans les études précédentes. Les coûts de carnet et d'exécution sont supposés fixes ; il n'y a pas d'ordres réels, ni de stratégie garantie ; USD et USDT sont des numéraires différents. Les réponses API publiques Bitstamp sont contrôlées et hashées par notre collecteur, mais non signées cryptographiquement par la plateforme.

**Suite scientifique :** comparer le risque des stratégies combinées BTC/ETH sur les **mêmes dates** et auditer le coût de rester en cash. **Ne pas chercher de nouveaux paramètres EMA sur ce jeu**. Vérifier si les résultats passent sur un futur jeu réellement inédit plutôt que reproduire les mêmes années sous des formats différents.

**État de livraison : terminé et publié.** Aucun changement Administrator, Trader, Operator ou Bridge ; aucune opération réelle.
