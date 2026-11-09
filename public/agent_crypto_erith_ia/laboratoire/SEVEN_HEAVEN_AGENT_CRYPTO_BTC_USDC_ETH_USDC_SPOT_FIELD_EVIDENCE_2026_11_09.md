# Seven Heaven — Dossiers terrain BTC/USDC et ETH/USDC : observation et preuves

**Relevé daté du 9 novembre 2026 · Lecture seule · Travail documentaire sans modification du programme.**
Complément des [50 dossiers existants](./SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md) et de leur [audit indépendant](./SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_50_EVIDENCE_CONTRACTS_OKX_PAPER_AUDIT_2026_11_08.md). La [fiche JSON de provenance](../data/crypto/research/seven_heaven_btc_eth_spot_field_evidence_2026_11_09.json) contient les valeurs d'origine. Aucun portefeuille ni secret privé ne figure ici.

> **Décision :** le dossier BTC dispose d'une observation de carnet public dans les captures ; ETH dispose d'un marché CoinGecko daté et d'une paire OKX repérée, **sans carnet ETH daté du 9 novembre ; des carnets historiques d'octobre existent dans le Coffre (section F)**. Les deux restent *non certifiés PAPER*. Aucune exécution réelle, aucun ordre, aucune prévision.

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

**Preuve manquante au 9 novembre :** carnet `ETH-USDC` contemporain, état natif de l'instrument, règles courantes, frais du compte et permission de la paire. Les archives publiques d'octobre (section F) apportent des mesures historiques, mais ne remplissent pas ce manque d'actualité.

## D. Registre des contrôles — la progression réelle

| Contrôle | BTC-USDC | ETH-USDC |
|---|---|---|
| CoinGecko ID et snapshot USD datés | Vérifié dans le fichier public | Vérifié dans le même fichier |
| Paire visible dans les captures OKX | Observée | Observée |
| Carnet OKX daté dans les pièces | Un instantané en capture (9 novembre) | 15 carnets qualifiés d'octobre dans le Coffre ; aucun du 9 novembre |
| Règles Spot natives `state/minSz/lotSz/tickSz` au 09/11 | Non collectées ici | Non collectées ici |
| Frais réellement appliqués au compte | Non certifiés | Non certifiés |
| Archive native 1m et quote | Index BTCUSDT/USDT | Index ETHUSDT/USDT |
| ZIPs vérifiés individuellement / gaps certifiés | Non | Non |
| Droit de négociation propre au compte | Non prouvé | Non prouvé |
| Expérience PAPER reproductible certifiée | **Non** | **Non** |

Une hypothèse de frais taker **0,10 % par côté** est utilisable pour une sensibilité **fictive et explicitement datée**, pas comme frais réellement facturés. Le spread, le slippage, le taker et la taille minimum sont des contrôles distincts. Aucune performance PAPER n'est déduite ici.

## E. Prochaines opérations documentaires, sans toucher à l'Administrator

1. **Instrument BTC-USDC** : constater par `GET /api/v5/public/instruments` l'instrument Spot exact, état `live` ou autre, `tickSz`, `lotSz`, `minSz`, avec horodatage de collecte. Vérifier carnet et timestamp exchange séparément.
2. **Instrument ETH-USDC** : compléter le carnet historique daté d'octobre par un carnet **actuel** et vérifier `state/minSz/lotSz/tickSz` à sa propre date de collecte. Aucune extrapolation depuis BTC.
3. **Coffre** : vérifier SHA-256, trous, doublons, bornes UTC et quote pour des lots `BTCUSDT` et `ETHUSDT` comparables ; distinguer archive et conditions de marché actuelles.
4. **Étude comparative** : examiner variations, drawdowns et volatilité sur fenêtres UTC alignées ; les frais et coûts sont ensuite ajoutés selon la quote et la venue, sans conversion cachée.
5. **PAPER** : uniquement après preuve du dataset, de la profondeur utilisée, des hypothèses de frais, des règles d'ordre, des limites et du journal reproductible. Aucune opération réelle.

**STOP POINT :** BTC a un carnet ponctuel du 9 novembre ; ETH a désormais une série publique de carnets d'octobre, mais pas de carnet du 9 novembre. Aucun ordre ni test de compte privé n'est nécessaire à ce stade.

## F. Addendum du 09/11 — archives ETH/USDC publiques retrouvées

**Nouvelle pièce retrouvée :** le projet possède déjà des données publiques historiques de carnet `ETH-USDC`. Elles viennent du collecteur public OKX EEA, **pas du Bridge privé de l'utilisateur** et **pas du 9 novembre**. Le statut du couple `ETH-USDC` au moment de chaque relevé est `VERIFIED_PUBLIC_BOOK` dans nos archives, **ce qui n'est pas un contrôle courant du champ natif OKX `state=live` ni des droits du compte personnel**.

**Sources archivées et empreintes Git :**
- [Collecte du 27 octobre](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/okx-hourly/2026-10-27.json) — `9509de1c7d65d0e74b3a60f8cfcb550d95c83aef`, 15 enregistrements horaires `ETH-USDC`.
- [Collecte du 28 octobre](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/okx-hourly/2026-10-28.json) — `09c15414acf17d6f5154ed8475b54b45e116b209`, 5 enregistrements horaires `ETH-USDC`.
- [Synthèse qualifiée des 15 carnets](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/okx-hourly/research-latest.json) — `3e20270ca0df74825a47a980f1d8b8ea8dd07d05`, fenêtre du **27/10 à 10:36:05 UTC** au **28/10 à 08:34:16 UTC**. Les cinq enregistrements du début du 27 octobre figurent dans les fichiers, mais pas dans cette fenêtre de synthèse. Ne pas annoncer « 20 relevés certifiés par l'index des 15 ».
- [Audit original de trous de bougies ETHUSDT](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/top5_original_gap_audit/index.json) — `f4f159ff099683b3a70a0090d5fe34fb65d55880`.

### F1. Carnet cinq niveaux ETH/USDC, dernier instantané du 28 octobre (source historique)

| Champ | Valeur horodatée 28/10/2026 à 08:34:16 UTC |
|---|---:|
| Achat, premier niveau du carnet `book5.bids[0]` | 2371.37 USDC/ETH · 0.069 ETH |
| Vente, premier niveau du carnet `book5.asks[0]` | 2371.38 USDC/ETH · 0.069 ETH |
| Milieu calculé à partir du carnet | 2371.375 USDC/ETH |
| Spread calculé à partir du carnet | 0,04217 pb |
| Médiane de spread, fenêtre qualifiée de 15 relevés | 0.04 pb (valeur arrondie de l'index) |
| Maximum observé sur la même fenêtre | 1.22 pb |
| Champ `book5.market_fill_proven` | `false` |

**Point de qualité :** le ticker associé au même enregistrement porte bid 2371.44 et ask 2371.45 USDC, différents du `book5` (2371.37 / 2371.38). **Comparer les séries de même endpoint et le `source_at_utc` exact**, sans remplacer les niveaux du carnet par ceux du ticker. Aucun prix rempli n'est prouvé.

### F2. Règles Spot observées dans ces archives — non actuelles

Sur les **20 enregistrements horaires stockés**, les champs natifs conservés sont constants : `minSz=0.001` ETH, `lotSz=0.000001` ETH, `tickSz=0.01` USDC. Provenance : observations publiques **27–28 octobre 2026**. **Ces valeurs ne sont pas reconfirmées au 9 novembre.** La lecture directe des endpoints publics OKX du 9 novembre n'a pas abouti depuis cet environnement ; aucun état `live` récent ni nouvelle règle n'est affirmé.

### F3. Lacunes ETHUSDT dans les archives Binance Spot

L'audit de sources originales examine **3 mois ciblés sur les 85 mois indexés** :

| Mois | Fenêtre UTC manquante | Minutes | Preuve |
|---|---|---:|---|
| Août 2021 | 13/08 02:00 → 06:30 | 270 | ZIP source + checksum consignés |
| Septembre 2021 | 29/09 07:00 → 09:00 | 120 | ZIP source + checksum consignés |
| Mars 2023 | 24/03 12:40 → 14:00 | 80 | ZIP source + checksum consignés |
| **Total sur ces trois mois** | | **470** | **Les autres mois ne sont pas certifiés par ce sous-audit** |

Ce bilan est **repris d'un audit existant**, sans téléchargement ni vérification SHA-256 supplémentaire pendant cette reprise. Une minute manquante n'est pas la preuve d'absence de transactions. Aucune bougie synthétique ne doit remplir les trous.

### F4. Décision de recherche

- **Acquis :** existence de carnets ETH/USDC historiques, 15 éléments qualifiés (sur 20 enregistrements présents), règles Spot observées en octobre, lacunes natives ETHUSDT documentées.
- **Encore absent :** carnet et règles Spot **actuels** de la paire ETH/USDC au 9 novembre, frais réels du profil, éligibilité effective du compte, preuve de continuité intégrale et test PAPER reproductible.
- **Suites :** une nouvelle collecte publique ponctuelle des règles et du carnet, sous l'horodatage réel de récupération ; jamais de substitution avec des valeurs anciennes.

**Lecture seule, zéro ordre, zéro changement de programme.**

---
*Documentation de recherche en lecture seule. Programme MASTER, Bridge R31, Trader et modules techniques inchangés.*
