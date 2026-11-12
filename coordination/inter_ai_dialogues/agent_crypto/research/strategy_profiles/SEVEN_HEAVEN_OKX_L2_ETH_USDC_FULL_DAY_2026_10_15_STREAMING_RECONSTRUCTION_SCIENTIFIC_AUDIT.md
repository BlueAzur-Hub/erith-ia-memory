# Seven Heaven — ETH/USDC OKX : 3,17 millions d'événements L2 reconstitués en flux

**Rapport du 12 novembre 2026** · Archive publique du **15 octobre 2026** · Étude PAPER à lecture seule, aucun compte et aucun ordre réel.

## Synthèse

Le même pipeline que notre étude BTC a **reconstruit intégralement la journée ETH/USDC du 15 octobre 2026** en lisant l'archive officielle `ETH-USDC-L2orderbook-400lv-2026-10-15.tar.gz` en flux, sans produire de fichier `.data` intermédiaire géant ni inscrire l'archive complète au dépôt.

- **3 172 868 événements JSON acceptés** dans l'ordre temporel : **96 snapshots** et **3 172 772 mises à jour**.
- **9 874 583 niveaux supprimés** à partir de deltas à taille zéro.
- Première timestamp UTC **00:00:00.001**, dernière **23:59:59.966**, plus grand écart de temps entre événements : **3 470 ms**.
- Les **20 premiers événements ETH** correspondent exactement aux **20 SHA-256 épinglés** de notre contrôle de préfixe.
- **4 échantillons de carnet prédéfinis** à 00/06/12/18 UTC et **40 simulations de marche de carnet** (4 horaires × 5 montants × achat/vente).
- **0 lien de séquence vérifiable `seqId/prevSeqId`** : réussite technique du rejeu dans l'ordre des enregistrements, **sans preuve d'exhaustivité logique des updates en amont de l'archive**.

## 1. Intégrité du fichier entier

| Contrôle | Valeur vérifiée |
|---|---|
| Octets `.tar.gz` lus intégralement | **98 150 849** |
| SHA-256 de l'archive compressée **complète** | `048d039eed1d6a18c166f022e8fe02359308445be682d1405df09b61fbc03546` |
| Octets du membre `.data` décompressé entier | **776 655 177** |
| SHA-256 du membre `.data` **complet** | `a47f70abc79c28bdb52831e0dfdce32e1bf48ca962c3d2f5e8bc9e233a430d5d` |
| Gzip lu jusqu'au footer, CRC validé | Oui |
| SHA-256 des 20 premiers JSON vs préflight | Concordants, 20/20 |
| GitHub Actions compilation, autotest, lecture et publication | **SUCCESS** |

La différence entre **93,60 Mo annoncés par l'API** et **98,15 millions d'octets réellement lus** est une différence de comptage et de présentation possible (Mo/Mio). La taille utilisée comme preuve est **le nombre d'octets lu**, pas l'arrondi annoncé.

**Important :** SHA-256 et CRC prouvent seulement l'intégrité de **cette copie traitée**, pas qu'aucun événement source n'a été omis avant l'archivage. Aucune signature cryptographique du fournisseur n'a été vérifiée.

## 2. Spread relatif aux mêmes quatre heures UTC que BTC

Les échantillons sont les **premiers états du carnet reconstruits à ou juste après** les heures préenregistrées. Les délais sont de **1 à 8 ms**.

| Cible UTC | Événement UTC | Meilleur bid ETH/USDC | Meilleur ask ETH/USDC | Spread (bp) |
|---|---:|---:|---:|---:|
| 00 h | 00:00:00.001 | 2 419,07 | 2 419,08 | **0,04133811** |
| 06 h | 06:00:00.004 | 2 347,02 | 2 347,03 | **0,04260713** |
| 12 h | 12:00:00.008 | 2 360,99 | 2 361,00 | **0,04235502** |
| 18 h | 18:00:00.006 | 2 444,02 | 2 444,03 | **0,04091611** |

Un bp correspond à 0,01 % ; ici le spread est calculé par `(best_ask-best_bid)/mid×10000`. **Quatre valeurs proches ne sont pas la distribution quotidienne** : elles ne concernent que quatre instants sur une journée.

## 3. Coût théorique de carnet avant frais, par côté

Les **40 estimations** suivent le protocole gelé : achat de `notionnel_USDC` par les asks ; vente d'une quantité d'ETH égale à `notionnel_USDC/mid` par les bids. Résultat : écart de prix moyen depuis le mid, en bp. Ce n'est pas un ordre exécuté.

| Heure UTC | Achat 1 000 USDC | Vente 1 000 USDC | Achat 100 000 USDC | Vente 100 000 USDC |
|---|---:|---:|---:|---:|
| 00 h | 0,020669 | 0,020669 | **4,274536** | 3,525876 |
| 06 h | **0,855252** | **0,715530** | 3,840668 | 3,221909 |
| 12 h | 0,021178 | 0,058833 | 3,933518 | **4,030083** |
| 18 h | 0,129106 | 0,020458 | 3,317729 | 3,141212 |

Les coûts plus élevés à 100 000 USDC résultent du passage sur davantage de niveaux de carnet. Par exemple, à 12 h, un achat fictif de 100 000 USDC aurait utilisé **25 niveaux ask**, contre **36 niveaux bid** pour vendre l'équivalent.

Tous les montants prédéfinis ont trouvé une profondeur visible suffisante à ces quatre instants, **sans garantie d'exécution réelle**, sans contraintes propres au compte, et **sans frais de plateforme**.

## 4. Méthode et traçabilité

- [**Protocole ETH full-day figé avant toute lecture intégrale**](./SEVEN_HEAVEN_OKX_L2_ETH_USDC_FULL_DAY_STREAMING_FOUR_ANCHORS_FROZEN_PROTOCOL_2026_11_12.md), commit `a24df8ebc60573d1a0a5f119ecf64ace8debcf13`.
- [**Préflight ETH : 20 JSON complets validés**](./SEVEN_HEAVEN_OKX_L2_ETH_FIRST_TWENTY_EVENTS_LOCAL_RECONSTRUCTION_AUDIT_2026_11_12.md), [preuve JSON 20 SHA](./okx_l2_eth_usdc_complete_event_prefix_2026_11_12_evidence/SEVEN_HEAVEN_OKX_L2_ETH_COMPLETE_EVENT_PREFIX_PROOFS.json), Git blob `8edbfef935c47f23d39e09600564497f2c4d309e`.
- [**Code Python streaming de la journée ETH**](./SEVEN_HEAVEN_OKX_L2_ETH_USDC_FULL_DAY_STREAMING_FOUR_ANCHORS_2026_11_12.py).
- [**Preuves JSON : SHA de l'archive et du membre entiers, comptages, quatre horaires, coûts**](./okx_l2_eth_usdc_full_day_four_anchors_2026_11_12_evidence/SEVEN_HEAVEN_OKX_ETH_L2_FULL_DAY_FOUR_ANCHORS_PROOFS.json), Git blob `621c7edd2367d1cc9acb3bb13d6c11838df0fb86`.
- [**CSV des 40 estimations de profondeur**](./okx_l2_eth_usdc_full_day_four_anchors_2026_11_12_evidence/SEVEN_HEAVEN_OKX_ETH_L2_FULL_DAY_FOUR_ANCHORS_COSTS.csv).
- [**GitHub Actions ETH full-day : SUCCESS**](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43260608990).

## 5. Portée et prochaine étude

L'intégrité des octets archivés est vérifiée. La **continuité logique de chacun des deltas reste non certifiable** car les événements n'exposent pas les compteurs de séquence. Le coût instantané théorique ne représente pas le glissement exécuté, ni une moyenne du marché, ni les frais du compte OKX EEE.

Notre archive BTC **et** notre archive ETH portent désormais sur **la même journée du 15 octobre 2026**, même instrument de cotation USDC, mêmes ancres 00/06/12/18 UTC et mêmes cinq montants. Cela autorise une [comparaison descriptive préenregistrée](./SEVEN_HEAVEN_OKX_L2_BTC_ETH_USDC_FOUR_ANCHORS_CROSS_ASSET_COMPARISON_FROZEN_PROTOCOL_2026_11_12.md) de ces seuls quatre instants, **pas** des extrapolations annuelles.

Aucun résultat ne modifie les EMA 10/30, le Trader, l'Administrator, l'Operator ou le Bridge. **Aucune opération réelle.**