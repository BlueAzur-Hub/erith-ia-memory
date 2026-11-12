# Seven Heaven — BTC contre ETH : carnets historiques OKX Spot USDC du 15 octobre 2026

**Rapport du 12 novembre 2026** · Deux archives L2 400 niveaux intégralement traitées, même journée UTC, mêmes quatre heures et mêmes montants · **PAPER seulement : aucun ordre ni opération réelle**.

## Conclusion scientifique

Sur les quatre instants **préenregistrés** du 15 octobre 2026 (00:00, 06:00, 12:00, 18:00 UTC), le spread **ETH/USDC est environ 3,37 à 3,43 fois celui de BTC/USDC** en points de base relatifs. À **100 000 USDC par côté**, l'écart moyen de prix depuis le mid est aussi plus important sur ETH que sur BTC dans tous les couples horaires achat et vente examinés. À **1 000 USDC**, les coûts théoriques restent petits à certains instants mais peuvent varier notablement selon la profondeur disponible.

Ce sont des observations **de quatre instants d'une seule journée**, pas une caractérisation de « la liquidité typique » de l'année, des tarifs de compte ou une prévision des rendements.

## 1. Contrôles de qualité et provenance

Le [protocole de comparaison a été publié AVANT la disponibilité du replay ETH intégral](./SEVEN_HEAVEN_OKX_L2_BTC_ETH_USDC_FOUR_ANCHORS_CROSS_ASSET_COMPARISON_FROZEN_PROTOCOL_2026_11_12.md), commit `5253e6d34b11c7ab9651a8ebb1a4e8a34dc7c039`. Les heures et montants n'ont pas été changés.

| Contrôle de source | BTC-USDC | ETH-USDC |
|---|---:|---:|
| Archive compressée complète, octets | **56 920 312** | **98 150 849** |
| Membre `.data` décompressé complet, octets | **457 277 836** | **776 655 177** |
| Événements L2 reconstruits | **2 346 486** | **3 172 868** |
| Photographies initiales/reprises | 96 | 96 |
| Mises à jour traitées | 2 346 390 | 3 172 772 |
| Gzip footer/CRC et empreinte archive/membre SHA-256 | OK | OK |
| Les 20 premiers SHA des événements correspondent au préflight | OK | OK |
| Chaîne `seqId/prevSeqId` permettant de prouver la continuité logique | **Non** | **Non** |

SHA-256 **des archives entières** :
- BTC `3b543b7333a6c71f4a8bf0ddf4e058fa84f61ad58092b3250784acc0964c7b44`.
- ETH `048d039eed1d6a18c166f022e8fe02359308445be682d1405df09b61fbc03546`.

SHA-256 **des membres décompressés entiers** :
- BTC `a8a3231d34d03a0d261ac9952f1ba2a953a4d31986e04c8bbbbdc61c06264963`.
- ETH `a47f70abc79c28bdb52831e0dfdce32e1bf48ca962c3d2f5e8bc9e233a430d5d`.

**Les fichiers sources ont été effectivement lus et vérifiés par nos programmes**, mais ces empreintes ne constituent pas une signature du fournisseur ni une preuve qu'aucune mise à jour n'a été omise avant leur archivage.

## 2. Spread relatif au même instant UTC

Les deux mesures se trouvent à quelques **millisecondes** de l'heure cible (BTC 3–9 ms, ETH 1–8 ms) ; elles ne sont **pas atomiquement synchronisées**.

| Heure cible UTC | BTC/USDC (bp) | ETH/USDC (bp) | ETH/BTC, rapport |
|---|---:|---:|---:|
| 00 h | **0,01225670** | **0,04133811** | 3,373 |
| 06 h | **0,01242110** | **0,04260713** | 3,430 |
| 12 h | **0,01236121** | **0,04235502** | 3,426 |
| 18 h | **0,01214241** | **0,04091611** | 3,370 |

Moyenne **des quatre points uniquement** : BTC **0,01229535 bp**, ETH **0,04180409 bp**. Médiane des mêmes quatre points : BTC **0,01230895 bp**, ETH **0,04184657 bp**.

Aucune inférence sur une moyenne quotidienne, mensuelle, sur « le spread habituel » ni sur l'évolution par heure n'est défendable avec quatre échantillons.

## 3. Marcher les deux carnets, même notionnel, hors frais

Pour chaque paire et chaque heure : acheter théoriquement un notionnel USDC en consommant les `asks`, ou vendre une quantité d'actif de base équivalente à `notionnel/mid` en consommant les `bids`. Les chiffres sont le **coût de prix moyen depuis le mid** en **bp par côté**, **avant les frais de plateforme** et en supposant le carnet immobile.

### Ordres fictifs de 1 000 USDC

| Heure | BTC achat | BTC vente | ETH achat | ETH vente |
|---|---:|---:|---:|---:|
| 00 h | 0,006128 | 0,006128 | 0,020669 | 0,020669 |
| 06 h | 0,006211 | 0,006211 | **0,855252** | **0,715530** |
| 12 h | 0,026487 | 0,006181 | 0,021178 | 0,058833 |
| 18 h | 0,006071 | 0,025892 | 0,129106 | 0,020458 |

À 06 h, **l'ETH affiche un coût de carnet plus élevé pour ce notionnel**, malgré un spread relatif initial inférieur à 0,05 bp : la profondeur au-delà du meilleur prix influe sur le VWAP.

### Ordres fictifs de 100 000 USDC

| Heure | BTC achat | BTC vente | ETH achat | ETH vente |
|---|---:|---:|---:|---:|
| 00 h | 1,665300 | 0,006128 | **4,274536** | **3,525876** |
| 06 h | 0,813917 | 1,828092 | **3,840668** | **3,221909** |
| 12 h | 1,588897 | 0,388429 | **3,933518** | **4,030083** |
| 18 h | 0,567519 | 1,038869 | **3,317729** | **3,141212** |

Moyennes **des quatre ancres seulement** à 100 000 USDC :
- Achat : BTC **1,158908 bp**, ETH **3,841613 bp**.
- Vente : BTC **0,815380 bp**, ETH **3,479770 bp**.

Sur ces quatre horaires et ce montant, les deux côtés du carnet ETH étaient donc plus coûteux en **variation de prix théorique**. Les cinq montants de 10, 100, 1 000, 10 000 et 100 000 USDC sont détaillés **pour chaque côté et heure** dans les preuves numériques.

## 4. Pourquoi ce n'est pas encore un modèle des frais d'exécution

- **Quatre observations fixes sur un seul jour** : pas de quantile robuste, pas de loi de liquidité en crise, aucune preuve sur les jours haussiers/baissiers ni sur les spreads durant toutes les heures intermédiaires.
- **Carnets L2 archivés, non transactions effectuées** : la profondeur affichée peut changer avant qu'un ordre atteigne le marché ; aucune priorité d'exécution, latence ou « partial fill » n'est reproduite.
- **Aucune donnée personnelle du compte OKX EEE** n'est utilisée ; frais maker/taker, restrictions, limites de marché, minimum notionnel et taxation ne sont pas connus.
- **Pas de preuve de continuité par numéros de séquence** malgré une reconstruction et une validation de l'intégrité byte du fichier réussi sur les deux actifs.
- **Les historiques EMA de Bitstamp/USD sont différents de ces deux carnets OKX/USDC**. Ne pas attribuer ces quatre coûts de 2026 aux opérations PAPER de 2024–2026 ni les utiliser pour calculer une rentabilité future.
- Les échantillons sont à quelques millisecondes de différence entre BTC et ETH. **La comparaison est approximativement temporelle mais pas atomique**.

## 5. Preuves publiées et calculs reproductibles

- [**Fichier JSON compact des quatre spreads couplés, des 40 coûts appariés, des synthèses et des hashes des sources**](./SEVEN_HEAVEN_OKX_L2_BTC_ETH_USDC_SAME_DAY_FOUR_ANCHORS_COMPARISON_EVIDENCE_2026_11_12.json), publié sur `main` après vérification des deux preuves canoniques.
- [**Archive BTC complète : preuves SHA-256, 2,35 M d'événements et 4 ancres**](./okx_l2_btc_usdc_full_day_four_anchors_2026_11_12_evidence/SEVEN_HEAVEN_OKX_BTC_L2_FULL_DAY_FOUR_ANCHORS_PROOFS.json), blob `a80617f03e2c00856c2e8ccb2ec2c7eb26fcbf40`, [workflow SUCCESS](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43258907031).
- [**Archive ETH complète : preuves SHA-256, 3,17 M d'événements et 4 ancres**](./okx_l2_eth_usdc_full_day_four_anchors_2026_11_12_evidence/SEVEN_HEAVEN_OKX_ETH_L2_FULL_DAY_FOUR_ANCHORS_PROOFS.json), blob `621c7edd2367d1cc9acb3bb13d6c11838df0fb86`, [workflow SUCCESS](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43260608990).
- [**Rapport approfondi de la journée BTC**](./SEVEN_HEAVEN_OKX_L2_BTC_USDC_FULL_DAY_2026_10_15_STREAMING_RECONSTRUCTION_SCIENTIFIC_AUDIT.md).
- [**Rapport approfondi de la journée ETH**](./SEVEN_HEAVEN_OKX_L2_ETH_USDC_FULL_DAY_2026_10_15_STREAMING_RECONSTRUCTION_SCIENTIFIC_AUDIT.md).
- [**Protocole de comparaison figé avant résultats ETH**](./SEVEN_HEAVEN_OKX_L2_BTC_ETH_USDC_FOUR_ANCHORS_CROSS_ASSET_COMPARISON_FROZEN_PROTOCOL_2026_11_12.md).

## 6. Suite scientifique

**L'étape de reconstruction d'une journée entière pour BTC et ETH est accomplie.** Pour tester les variations de coût sous différentes conditions de marché, la suite pertinente est un **échantillonnage multi-jours préenregistré**, incluant des journées contrastées selon des critères définis AVANT lecture des résultats L2, en maintenant les mêmes horaires et les mêmes notions d'achat/vente. Pour une distribution intrajournalière, il faudra en plus davantage de points **au sein de chaque jour**, choisis selon une grille fixe.

Ne pas réoptimiser EMA10/30, ne pas lancer de suivi automatique et ne pas exécuter d'ordres. Les archives volumineuses restent sur le CDN officiel OKX ; seuls preuves compactes, programmes et rapports sont conservés dans GitHub.