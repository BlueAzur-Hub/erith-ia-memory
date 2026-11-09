# Seven Heaven — Dossiers terrain BTC/USDC et ETH/USDC : observation et preuves

**Relevé daté du 9 novembre 2026 · Lecture seule · Travail documentaire sans modification du programme.**
Complément des [50 dossiers existants](./SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md) et de leur [audit indépendant](./SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_50_EVIDENCE_CONTRACTS_OKX_PAPER_AUDIT_2026_11_08.md). La [fiche JSON de provenance](../data/crypto/research/seven_heaven_btc_eth_spot_field_evidence_2026_11_09.json) contient les valeurs d'origine. Aucun portefeuille ni secret privé ne figure ici.

> **Décision :** le dossier BTC dispose d'une observation de carnet public dans les captures ; ETH dispose d'un marché CoinGecko daté et d'une paire OKX repérée, **sans carnet ETH équivalent dans les pièces examinées**. Les deux restent *non certifiés PAPER*. Aucune exécution réelle, aucun ordre, aucune prévision.

## A. Provenance exacte — éviter les faux rapprochements

| Couche | Observation | Quote | Ce qu'elle prouve |
|---|---|---|---|
| CoinGecko / GitHub | `2026-11-09T07:53:59.646Z` (08:53:59 Paris), actif `lastUpdated=2026-11-09T07:52:59.000Z` | USD | Prix et variations BTC/ETH au **même** instantané |
| Graphique BTC du navigateur | Capture du 09/11 vers 15:07 ; série 60 jours horodatée 15:04 Paris | USD | 1 440 points présentés, **pas** 1 440 bougies de 1m Binance |
| Microscope BTC | Capture du 09/11 vers 15:10 Paris | USDC | 300 bougies OKX en 15 minutes, non exportées en bloc |
| Carnet BTC | Capture du 09/11, source affichée « 15:10:23 » Paris | USDC | Prix bid et ask à un **instant** |
| Archive native | Index GitHub des lots mensuels Binance Spot | USDT | Métadonnées d'historiques 1m pour BTCUSDT et ETHUSDT |
| Présence UI OKX | Écrans utilisateur du 08/11 | USDC | BTC-USDC et ETH-USDC vus dans l'interface, pas permissions du compte |

**Règle :** les lectures de 08:53, 15:04 et 15:10 ne sont pas synchrones ; **USD ≠ USDT ≠ USDC ≠ EUR**. Une variation CoinGecko n'est pas un prix d'ordre OKX.

**Sources vérifiées :**
- [CoinGecko, JSON du commit figé](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/77b753216fa97c6f1eecfef9cde72750105e4f8b/public/agent_crypto_erith_ia/data/crypto/latest.json) · blob Git `4f1f33162f2bf729f5772562e15a60fdb7017075`.
- [Index natif Binance Spot 1m](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/77b753216fa97c6f1eecfef9cde72750105e4f8b/public/agent_crypto_erith_ia/data/historical_archive_prototype/top250_multisource_coverage/index.json) · blob Git `71b25904a652fbd8cdea1ac6bb942c9789e930c3`.
- [Registre OKX issu de captures](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/77b753216fa97c6f1eecfef9cde72750105e4f8b/public/agent_crypto_erith_ia/data/crypto/research/okx-spot-screen-candidates.json) · blob Git `ab1498c692eaaedb6f5a940f555fee13afa45ab4`.
- [Coffre historique consultable](../administrator/historical-vault.html).
- [Documentation officielle OKX : instruments Spot, minSz, lotSz, tickSz, state](https://www.okx.com/docs-v5/en/) ; [archives publiques Binance et CHECKSUM](https://github.com/binance/binance-public-data/blob/master/README.md).

## B. BTC — fiche de terrain prioritaire

**Identité :** `bitcoin` / BTC, instrument étudié **BTC-USDC** sur OKX. Présence de paire sur les captures du 08/11 ; droit de passer un ordre **non attesté**.

| Mesure du snapshot CoinGecko | Valeur |
|---|---:|
| BTC, USD | 73953,12 USD |
| 24 heures | -2,57 % |
| 7 jours | -5,15 % |
| 30 jours | -10,28 % |
| Capitalisation publiée | 1,49 Bn USD |
| Volume 24 h global publié | 24,04 Md USD |

### Le carnet BTC-USDC affiché vers 15 h 10

| Mesure tirée de la capture | Valeur |
|---|---:|
| Best bid | 74453,9 USDC/BTC |
| Best ask | 74454,0 USDC/BTC |
| Écart bid–ask | 0,1 USDC |
| Milieu de carnet calculé | 74453,95 USDC/BTC |
| Spread relatif, calcul dérivé | ≈ 0,0134 pb |

La source est **une capture d'écran de la conversation**, pas un carnet brut signé ni rejouable. Le badge « FRESH » est celui de l'interface ; nous ne certifions pas indépendamment les horodatages exchange. Les tailles visibles au carnet ne prouvent pas un remplissage futur, un glissement garanti ou un coût total.

**Historique BTC indexé :** `85` mois, **3 731 040 bougies natives 1m** sur `BTCUSDT`, archive Binance Spot **en USDT**. Ce dossier a contrôlé l'index, **pas le contenu de chaque ZIP**, ni la continuité, ni chaque SHA-256 de lot. Les 1 440 points CoinGecko sur 60 jours ne sont pas cette archive.

**Question de travail :** comment évoluent volatilité, drawdown, spread, profondeur et frais pendant une baisse ? Le carnet unique du 9 novembre fournit une observation de départ, pas une réponse statistique.

## C. ETH — deuxième fiche, comparaison au même instantané

**Identité :** `ethereum` / ETH, instrument à examiner **ETH-USDC**. Paire repérée dans les captures, statut du compte personnel non prouvé.

| Mesure du snapshot commun CoinGecko | BTC | ETH | ETH moins BTC |
|---|---:|---:|---:|
| Prix USD | 73953,12 | 2091,39 | Non comparable en niveau |
| 24 h | -2,57 % | -6,56 % | -3,98 points |
| 7 j | -5,15 % | -7,74 % | -2,59 points |
| 30 j | -10,28 % | -15,38 % | -5,10 points |

**Fait :** ETH a davantage baissé que BTC sur les trois horizons de ce snapshot. **Interprétation :** faiblesse relative observée, **ni prédiction ni causalité**. Ne pas mélanger cette comparaison alignée avec les prix du carnet BTC relevés six heures plus tard.

**Historique ETH indexé :** `85` mois, **3 731 040 bougies 1m** sur `ETHUSDT`, archive Binance Spot en **USDT**. Aucun historique minute complet n'a été décompressé pendant cette note.

**Preuve manquante :** carnet `ETH-USDC` daté, best bid/ask, taille à chaque niveau, état instrument, règle de quantité, frais compte et autorisation de la paire. **Aucune de ces valeurs ne doit être copiée depuis BTC.**

## D. Registre des contrôles — la progression réelle

| Contrôle | BTC-USDC | ETH-USDC |
|---|---|---|
| CoinGecko ID et snapshot USD datés | Vérifié dans le fichier public | Vérifié dans le même fichier |
| Paire visible dans les captures OKX | Observée | Observée |
| Carnet OKX daté dans les pièces | Un instantané en capture | Absent |
| Règles Spot natives `state/minSz/lotSz/tickSz` au 09/11 | Non collectées ici | Non collectées ici |
| Frais réellement appliqués au compte | Non certifiés | Non certifiés |
| Archive native 1m et quote | Index BTCUSDT/USDT | Index ETHUSDT/USDT |
| ZIPs vérifiés individuellement / gaps certifiés | Non | Non |
| Droit de négociation propre au compte | Non prouvé | Non prouvé |
| Expérience PAPER reproductible certifiée | **Non** | **Non** |

Une hypothèse de frais taker **0,10 % par côté** est utilisable pour une sensibilité **fictive et explicitement datée**, pas comme frais réellement facturés. Le spread, le slippage, le taker et la taille minimum sont des contrôles distincts. Aucune performance PAPER n'est déduite ici.

## E. Prochaines opérations documentaires, sans toucher à l'Administrator

1. **Instrument BTC-USDC** : constater par `GET /api/v5/public/instruments` l'instrument Spot exact, état `live` ou autre, `tickSz`, `lotSz`, `minSz`, avec horodatage de collecte. Vérifier carnet et timestamp exchange séparément.
2. **Instrument ETH-USDC** : appliquer le même protocole et obtenir son premier carnet daté. Aucune estimation de profondeur à partir d'une autre paire.
3. **Coffre** : vérifier SHA-256, trous, doublons, bornes UTC et quote pour des lots `BTCUSDT` et `ETHUSDT` comparables ; distinguer archive et conditions de marché actuelles.
4. **Étude comparative** : examiner variations, drawdowns et volatilité sur fenêtres UTC alignées ; les frais et coûts sont ensuite ajoutés selon la quote et la venue, sans conversion cachée.
5. **PAPER** : uniquement après preuve du dataset, de la profondeur utilisée, des hypothèses de frais, des règles d'ordre, des limites et du journal reproductible. Aucune opération réelle.

**STOP POINT :** les deux fiches existantes disposent d'un complément de terrain. BTC a un carnet ponctuel ; ETH n'en a pas dans les pièces reçues. Aucun ordre ni test du compte OKX n'est requis à ce stade.

---
*Documentation de recherche en lecture seule. Programme MASTER, Bridge R31, Trader et modules techniques inchangés.*
