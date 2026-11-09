# Seven Heaven — XRP/USDC : carnet OKX, archives et comparaison BTC/ETH

**Dossier complémentaire · 9 novembre 2026 · Lecture seule.** Étude ajoutée à la [bibliothèque existante des 50 actifs](./SEVEN_HEAVEN_CRYPTO_RESEARCH_TOP_5_TOP_10_TOP_50_MARKET_OKX_HISTORICAL_VAULT.md). Ce document ne remplace pas la monographie XRP du 8 novembre. Voir aussi le [dossier terrain BTC/ETH](./SEVEN_HEAVEN_AGENT_CRYPTO_BTC_USDC_ETH_USDC_SPOT_FIELD_EVIDENCE_2026_11_09.md) et le [registre de preuves JSON](../data/crypto/research/seven_heaven_xrp_usdc_spot_evidence_2026_11_09.json).

> **Bilan :** XRP subit une faiblesse relative plus marquée que BTC et ETH sur les 24 h, 7 j et 30 j du même instantané CoinGecko du matin ; l'archive contient 20 relevés publics XRP-USDC des 27–28 octobre, dont 15 retenus par la synthèse qualifiée ; l'historique natif XRPUSDT possède des trous source documentés sur trois mois ciblés. **Ce n'est ni un signal d'achat ou de vente, ni une certification PAPER.**

## 1. Conventions de lecture et identification

- **Actif :** `ripple` (ID CoinGecko), `XRP` actif natif du XRP Ledger ; la monographie précédente mentionne un rang CoinGecko **#5** au snapshot du 8 novembre. Au snapshot distinct du 9 novembre, le rang observé est **#6**. Ne jamais réécrire le rang historique : ce ne sont pas les mêmes dates.
- **Marché global :** cotations en **USD**, source CoinGecko, données des trois actifs à `2026-11-09T07:52:59.000Z`, snapshot publié `2026-11-09T07:53:59.646Z`.
- **Marché de carnet :** `XRP-USDC`, devises natives **XRP/USDC**, ancien carnet public OKX EEA. Pas de conversion cachée entre USD, USDC et USDT.
- **Historique natif :** `XRPUSDT` Binance Spot, quote **USDT**, index couvrant `80` mois et `3 510 720` bougies natives 1 minute. Le présent rapport n'a pas re-téléchargé les ZIP.
- **Paire repérée sur OKX :** capture fournie par l'utilisateur le 8 novembre : `XRP-USDC`. C'est une **preuve d'affichage**, pas une preuve d'autorisation à passer un ordre sur un compte.

### Fichiers source et empreintes Git

| Jeu de preuve | Source | Blob Git |
|---|---|---|
| Marché CoinGecko au 09/11 | [Snapshot USD](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/latest.json) | `4f1f33162f2bf729f5772562e15a60fdb7017075` |
| Historique natif | [Index Binance 1m](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/top250_multisource_coverage/index.json) | `71b25904a652fbd8cdea1ac6bb942c9789e930c3` |
| Paires OKX affichées | [Registre de captures](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/research/okx-spot-screen-candidates.json) | `ab1498c692eaaedb6f5a940f555fee13afa45ab4` |
| OKX 27/10 | [Relevés horaires](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/okx-hourly/2026-10-27.json) | `9509de1c7d65d0e74b3a60f8cfcb550d95c83aef` |
| OKX 28/10 | [Relevés horaires](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/okx-hourly/2026-10-28.json) | `09c15414acf17d6f5154ed8475b54b45e116b209` |
| Synthèse horaire | [Index 15 carnets](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/crypto/okx-hourly/research-latest.json) | `3e20270ca0df74825a47a980f1d8b8ea8dd07d05` |
| Source native et trous | [Audit des mois ciblés](https://github.com/BlueAzur-Hub/erith-ia-memory/blob/main/public/agent_crypto_erith_ia/data/historical_archive_prototype/top5_original_gap_audit/index.json) | `f4f159ff099683b3a70a0090d5fe34fb65d55880` |

## 2. Comparaison synchronisée du marché — snapshot du 9 novembre

| Actif | Prix USD | Variation 24 h | Variation 7 jours | Variation 30 jours |
|---|---:|---:|---:|---:|
| BTC | 73953,12 | -2,57 % | -5,15 % | -10,28 % |
| ETH | 2091,39 | -6,56 % | -7,74 % | -15,38 % |
| **XRP** | **1,0853** | **-6,81 %** | **-12,97 %** | **-22,60 %** |

Les écarts de **variation**, en points de pourcentage, se calculent sur des horizons et horodatages identiques :

| Horizon | XRP moins BTC | XRP moins ETH |
|---|---:|---:|
| 24 h | -4,24 points | -0,25 points |
| 7 j | -7,83 points | -5,23 points |
| 30 j | -12,32 points | -7,22 points |

**Fait :** XRP sous-performe BTC et ETH aux trois horizons de ce snapshot. **Hypothèse à tester :** XRP est plus sensible au régime de risque du marché ou à des facteurs spécifiques au réseau/actif ; **aucune causalité n'est établie**. N'utiliser ni les prix absolus de trois actifs distincts pour mesurer la force relative, ni la baisse passée comme probabilité de poursuite.

Le volume global XRP du même snapshot était `1,953` Md USD ; il ne correspond pas à la profondeur du marché OKX XRP-USDC.

## 3. Carnets XRP-USDC — preuves historiques OKX des 27–28 octobre

Le collecteur public `OKX_EEA_PUBLIC_REST` archive **20** instantanés horaires comportant chacun un carnet à cinq niveaux pour `XRP-USDC` ; le registre comparatif n'en qualifie que **15**, entre `2026-10-27T10:36:07Z` et `2026-10-28T08:34:18Z`. Les cinq relevés supplémentaires, plus anciens, ne sont pas comptés comme une extension du périmètre qualifié.

### Dernier carnet de la fenêtre qualifiée — `2026-10-28T08:34:18Z`

| Mesure du carnet `book5` | Valeur native |
|---|---:|
| Premier bid (prix d'achat visible) | 1,3322 USDC/XRP |
| Premier ask (prix de vente visible) | 1,3325 USDC/XRP |
| Quantité au premier bid | 13382,155 XRP |
| Quantité au premier ask | 1183,228 XRP |
| Milieu du carnet, calculé | 1,33235 USDC/XRP |
| Spread absolu, calculé | 0,0003 USDC/XRP |
| Spread relatif, calculé | ≈ 2,252 points de base |

Le registre de recherche affiche un spread médian de `2.25` pb et un maximum de `2.32` pb sur les **15 observations retenues**. Ce sont des statistiques de **ces relevés ponctuels**, pas une moyenne continue ni une propriété éternelle de XRP. Le spread BTC-USDC archivé à une période comparable est de `0.01` pb, tandis qu'ETH-USDC affiche `0.04` pb : XRP était donc moins serré dans cette fenêtre, sans que cela suffise à calculer un slippage pour une taille de transaction.

**Point de qualité :** sur **7/20 enregistrements**, les meilleurs prix `book5` et `ticker` diffèrent. Ces endpoints peuvent être capturés à des instants différents ; ne pas remplacer les bids/asks du carnet par ceux du ticker ni considérer les paires comme des erreurs sans examen des horodatages. Les `book5.market_fill_proven` sont tous `false`.

### Règles Spot observées en octobre, non garanties au 9 novembre

Sur les 20 lignes archivées, les mêmes règles sont inscrites :

- `minSz=1` XRP : quantité minimale indiquée dans la source d'octobre ;
- `lotSz=0.001` XRP : incrément de quantité ;
- `tickSz=0.0001` USDC : incrément de prix.

**Pas de preuve actuelle** de `state=live`, de la `tradeQuoteCcyList` applicable au compte européen, des règles du jour ou de l'autorisation personnelle à trader. L'endpoint public OKX d'instruments n'a pas fourni de réponse exploitable lors de cette recherche : **les valeurs d'octobre ne sont pas promues au statut actuel**.

## 4. XRP Ledger — fonctionnement et risques à contrôler

**XRP est l'actif natif du XRP Ledger**, pas un ERC-20 et pas la même chose que tous les actifs émis sur ce registre. Le protocole emploie la validation des registres par consensus. Les transactions imposent des frais en XRP généralement détruits, notamment pour limiter le spam. Les frais réseau ne sont **pas** les frais de négociation sur OKX.

Sources primaires : [XRP Ledger — XRP](https://xrpl.org/about/xrp), [consensus et validation](https://xrpl.org/docs/concepts/consensus-protocol/consensus-structure) et [frais de transaction](https://xrpl.org/docs/concepts/transactions/transaction-cost).

**Axes d'étude à documenter séparément :**
- Nombre de transactions validées, activité ajustée des entités, paiements et coûts du réseau : une statistique on-chain ou une annonce de partenariat ne prouve pas une demande proportionnelle de XRP.
- Dépendance à la réglementation par juridiction, disponibilité de services et concentrations de détention : pas d'affirmation de droit courant sans texte officiel daté.
- Résistance relative à BTC et ETH sur fenêtres synchronisées, volatilité mesurée et profondeur **à date identique**, sans mélanger quote, venue et timestamp.

## 5. Audit source XRPUSDT — lacunes sur trois mois ciblés

L'audit d'archives **déjà présent dans le Coffre** signale les minutes 1m absentes suivantes pour `XRPUSDT` :

| Mois | Fenêtre UTC sans bougies natives | Minutes manquantes |
|---|---|---:|
| Août 2021 | 13/08/2021, 02:00 → 06:30 | 270 |
| Septembre 2021 | 29/09/2021, 07:00 → 09:00 | 120 |
| Mars 2023 | 24/03/2023, 12:40 → 14:00 | 80 |
| **Total** | **3 mois étudiés sur 80 indexés** | **470** |

Ces données et SHA-256 figurent dans l'audit source antérieur ; **ce tour n'a pas retéléchargé les ZIP ni recalculé les empreintes**. La présence d'un trou n'autorise ni à interpoler des bougies ni à conclure à une absence de transactions. Les 77 autres mois ne sont pas couverts par **ce sous-audit**.

## 6. État des preuves et seuil d'entrée PAPER

| Contrôle | XRP | Niveau |
|---|---|---|
| Identité d'actif et source du protocole | XRP natif, ID `ripple` | Documenté |
| Comparaison du marché avec BTC/ETH | Même CoinGecko USD et instantané | Documenté |
| Découverte `XRP-USDC` sur OKX | Captures du 08/11 | UI observée uniquement |
| Carnet OKX | 20 historiques, 15 retenus dans la synthèse | Historique public seulement |
| Règles `minSz/lotSz/tickSz` | 20 archives concordantes des 27–28/10 | Pas de vérification actuelle |
| Statut courant `state` et droit de l'ordre sur le compte | Inconnus | Non certifié |
| Frais maker/taker réels et glissement | Non calculés | Non certifié |
| Archive XRPUSDT 1m | 80 mois indexés, trois mois audités avec trous | Audit partiel |
| PAPER avec journaux reproductibles | Aucun essai réalisé | **Non certifié** |

**Décision de travail :** XRP rejoint les dossiers comparatifs *documentés* avec BTC et ETH, mais **n'est pas prêt pour une qualification PAPER**. Le prochain relevé doit être un carnet public XRP-USDC récent, les règles Spot courantes et, plus tard, une comparaison des trois actifs sur historiques de même intervalle et même source. Ne pas demander de clés ni accéder à un portefeuille.

---
*Recherche documentaire seulement. MASTER Administrator, Trader, Bridge R31 et R28 inchangés. PR de recherche, aucune fusion sur `main`.*
