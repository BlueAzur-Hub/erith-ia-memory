# Seven Heaven — OKX Spot BTC/ETH USDC : 96 snapshots par actif, vraie variabilité intrajournalière du 15 octobre 2026

**Date de publication : 12 novembre 2026**. Recherche de carnets d'ordres historiques en lecture publique. Aucune transaction, aucun ordre, aucun accès à un compte ni modification du Trader, Bridge, Operator ou Administrator.

## Résumé scientifique

Nous avons relu **les deux archives officielles complètes L2 OKX Spot du 15 octobre 2026**, BTC-USDC et ETH-USDC, et reconstruit les carnets dans l'ordre des événements. Les archives comportent **96 événements snapshot chacune** ; leurs timestamps se trouvent exactement sur la grille 00:00, 00:15, …, 23:45 UTC avec un retard de **1 à 9 millisecondes**. L'étude retient les **96 premiers états valides à ou juste après chaque quart d'heure** pour chaque actif, selon le [protocole gelé avant cette analyse](./SEVEN_HEAVEN_OKX_L2_BTC_ETH_2026_10_15_96_QUARTER_HOUR_STATES_FROZEN_PROTOCOL_2026_11_12.md).

Au lieu de **quatre spreads** par actif, nous disposons de **96 valeurs**. Cela change l'interprétation : les quatre points de référence du premier replay avaient des spreads presque constants, alors que la grille de 96 points révèle des élargissements ponctuels importants **sur cette journée**.

**Ce n'est toujours pas une distribution représentative du marché sur plusieurs jours**, ni l'ensemble des millions de carnets entre les snapshots.

## 1. Intégrité et contrôles

| Critère | BTC-USDC | ETH-USDC |
|---|---:|---:|
| Archive entière vérifiée (SHA-256, gzip CRC) | Oui | Oui |
| Membre `.data` entier vérifié (SHA-256) | Oui | Oui |
| Événements JSON traités | **2 346 486** | **3 172 868** |
| Snapshots observées dans l'archive | **96** | **96** |
| États retenus sur la grille de 15 minutes | **96** | **96** |
| Retard des snapshots vs leurs horaires cibles | 1–9 ms | 1–9 ms |
| Les **quatre** observations déjà publiées correspondent **exactement** (date, prix, spread, coûts) | 4/4 | 4/4 |
| Continuité logique de tous les messages certifiée par `seqId/prevSeqId` | **Non** | **Non** |

- Les SHA-256 intégraux et le CRC gzip valident **les octets de la copie téléchargée et traitée**, pas l'absence d'événements perdus avant archivage.
- Les sources n'exposent pas les numéros de séquence suffisants pour prouver l'exhaustivité logique du flux ; aucune interpolation ni carnet croisé accepté.
- Les 192 états échantillonnés sont bien des événements `action:snapshot` à chacune des 96 ancres pour chaque actif. Les paires sont **observées à quelques millisecondes de distance**, pas atomiquement synchronisées.
- La validation ne repose pas simplement sur nos statistiques : le [contrôle Python indépendant](./SEVEN_HEAVEN_OKX_L2_BTC_ETH_96_QUARTER_HOURS_INDEPENDENT_AUDIT_2026_11_12.py) a vérifié **les blobs Git sources, les deux archives épinglées, 96 paires de spreads et 960 paires de coûts**. [GitHub Actions : SUCCESS](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43267697197).

## 2. Distributions empiriques sur 96 relevés à 15 minutes

Les points de base (bp) valent **0,01 %**. `spread = (best_ask - best_bid)/mid × 10 000`. Les percentiles empiriques utilisent une interpolation linéaire **type 7** sur les **96 valeurs**, sans représenter la distribution continue de tous les carnets.

| Statistique **des 96 seuls instants** | BTC-USDC (bp) | ETH-USDC (bp) |
|---|---:|---:|
| Moyenne | **0,023063** | **0,245866** |
| Médiane | 0,012281 | 0,042243 |
| 10e percentile | 0,012144 | 0,040801 |
| 90e percentile | **0,012384** | **0,669417** |
| Minimum | 0,012132 | 0,040633 |
| Maximum | **0,887892** | **2,603805** |
| Horodatage du maximum (UTC) | **15:15** | **02:30** |
| Nombre de points dont spread dépasse 0,1 bp | **2/96** | **21/96** |
| Nombre de points dont spread dépasse 0,5 bp | **1/96** | **13/96** |

**L'écart entre moyenne et médiane est significatif descriptivement** : quelques élargissements du spread pèsent sensiblement sur la moyenne, en particulier ETH. Pour BTC, le 90e percentile reste proche du spread minimum tandis qu'un maximum isolé à 15:15 atteint 0,8879 bp. Ce chiffre est un **instant historique observé**, pas un niveau garanti ou prévisible.

### Événements atypiques vérifiés sur notre grille

| Heure UTC | Spread BTC (bp) | Spread ETH (bp) | Commentaire |
|---|---:|---:|---|
| 02:30 | 0,012384 | **2,603805** | Plus grand spread ETH du jour sur la grille |
| 12:30 | **0,172901** | 0,042262 | Une des deux exceptions BTC plus large qu'ETH |
| 15:15 | **0,887892** | 0,454246 | Plus grand spread BTC, deuxième exception |
| 00:45 | 0,012277 | **2,234544** | Autre élargissement ETH observé |

Il serait excessif d'affirmer pourquoi ces écarts se produisent : **pas de causalité recherchée** (annonces, liquidations, événement de marché, latence de diffusion ou anomalie du carnet). Pour diagnostiquer les épisodes, il faudrait une inspection ciblée des mises à jour **avant, pendant et après** ces horaires, en tenant compte du manque de compteurs de séquence.

## 3. BTC/ETH : comparaison simultanée approximative

- **94 des 96** quarts d'heure : ETH a un spread relatif **plus large** que BTC.
- **2 des 96** quarts d'heure : BTC est plus large qu'ETH, à **12:30 et 15:15 UTC**.
- Différence moyenne ETH moins BTC : **0,222803 bp sur 96 points appariés**, médiane de la différence **0,029898 bp**.
- Décalage maximal **entre les timestamps de la paire de snapshots** : **7 ms**. Les prix ne sont pas capturés de manière atomiquement identique.
- Le rapport des spreads ETH/BTC fluctue énormément quand le spread BTC est presque à son pas minimal : **ne pas transformer un rapport ponctuel en constante de liquidité**.

Les 94/96 observations indiquent une relation **dans cette journée et cette grille**, pas une loi de marché applicable à toute heure, ni une mesure de liquidité générale définitive.

## 4. Coûts théoriques des carnets, hors frais

Achat : consommer les niveaux asks pour un budget notionnel en USDC. Vente : céder la quantité de BTC ou ETH égale à `notionnel/mid` en consommant les bids. La mesure est le **VWAP théorique vs mid**, par côté, en bp. Elle suppose la profondeur visible **immobile**, sans file d'attente, frais taker, autorisation de compte ou garantie d'exécution.

**Moyennes sur les 96 observations seulement :**

| Notionnel et côté | BTC-USDC (bp) | ETH-USDC (bp) |
|---|---:|---:|
| **1 000 USDC — achat** | 0,103240 | 0,348859 |
| **1 000 USDC — vente** | 0,084618 | 0,343385 |
| **100 000 USDC — achat** | **1,468508** | **3,842660** |
| **100 000 USDC — vente** | **1,114550** | **3,972840** |

**90e percentiles empiriques des mêmes coûts**, encore uniquement des 96 observations :

| Notionnel et côté | BTC-USDC (bp) | ETH-USDC (bp) |
|---|---:|---:|
| 1 000 USDC — achat | 0,311537 | 1,060543 |
| 1 000 USDC — vente | 0,240188 | 1,057738 |
| 100 000 USDC — achat | 2,567372 | 4,980433 |
| 100 000 USDC — vente | 2,540223 | 5,349747 |

Ces valeurs sont **des variations moyennes de prix du carnet**, **pas** des frais d'OKX, pas des spreads directement, pas des exécutions de marché réelles.

## 5. Pourquoi les quatre premières observations étaient insuffisantes

Les moyennes sur les quatre instants **00, 06, 12, 18 UTC**, obtenues lors de notre première recherche du même 15 octobre, étaient BTC **0,012295 bp** et ETH **0,041804 bp**. Ces chiffres étaient exacts pour ces quatre heures, mais **ne capturaient pas les élargissements observés aux autres quarts d'heure**.

Les moyennes des **96 quarts d'heure** deviennent BTC **0,023063 bp** et ETH **0,245866 bp**. Il serait néanmoins erroné d'appeler cette nouvelle moyenne « spread moyen réalisé du jour entier » : les carnets évoluent rapidement entre les instantanés. Nous avons amélioré la couverture temporelle **des observations**, pas transformé notre grille en un flux continu validé en chaque milliseconde.

## 6. Reproductibilité et publications

- [**Protocole figé avant l'étude, 96 horaires et méthodes de validation**](./SEVEN_HEAVEN_OKX_L2_BTC_ETH_2026_10_15_96_QUARTER_HOUR_STATES_FROZEN_PROTOCOL_2026_11_12.md), commit `52ab24810279e3cba30a7bab8d54676c5100e481`.
- [**Programme Python de streaming des deux archives L2 (gzip/tar/NDJSON, snapshots, grilles et profondeur)**](./SEVEN_HEAVEN_OKX_L2_BTC_ETH_2026_10_15_96_QUARTER_HOUR_FULL_DAY_STREAMING_AUDIT.py).
- [**Preuves BTC : archive complète, 96 spreads, 960 simulations, 96 timestamps snapshot**](./okx_l2_96_quarter_hour_2026_10_15_evidence/btc_usdc/SEVEN_HEAVEN_OKX_L2_96_STATES_SOURCE_PROOFS.json), Git blob `ca8f55de07bee5ef73663bd1613d6b56a655e4a4`.
- [**Preuves ETH : mêmes éléments**](./okx_l2_96_quarter_hour_2026_10_15_evidence/eth_usdc/SEVEN_HEAVEN_OKX_L2_96_STATES_SOURCE_PROOFS.json), Git blob `b3be3c7fea85042b770c5f1bb6cdc0d8749cf530`.
- [**CSV des 96 spreads BTC**](./okx_l2_96_quarter_hour_2026_10_15_evidence/btc_usdc/SEVEN_HEAVEN_OKX_L2_96_STATES_SPREADS.csv) et [**CSV des 96 spreads ETH**](./okx_l2_96_quarter_hour_2026_10_15_evidence/eth_usdc/SEVEN_HEAVEN_OKX_L2_96_STATES_SPREADS.csv).
- [**Tableau numérique apparié des 96 écarts BTC/ETH et leurs statistiques**](./SEVEN_HEAVEN_OKX_L2_BTC_ETH_2026_10_15_96_QUARTER_HOUR_PAIRED_COMPARISON_PROOFS.json), Git blob `59d400de7b9fc6dbe31a17c1e9b313312241fb7a`.
- [**CSV des 96 spreads couplés**](./SEVEN_HEAVEN_OKX_L2_BTC_ETH_2026_10_15_96_QUARTER_HOUR_PAIRED_SPREADS.csv) et [**CSV des 960 coûts appariés (1 920 coûts individuels)**](./SEVEN_HEAVEN_OKX_L2_BTC_ETH_2026_10_15_96_QUARTER_HOUR_PAIRED_COSTS.csv).
- [**Programme Python de reproduction indépendante, sans réseau**](./SEVEN_HEAVEN_OKX_L2_BTC_ETH_96_QUARTER_HOURS_INDEPENDENT_AUDIT_2026_11_12.py) et [**preuve indépendante JSON**](./okx_l2_96_quarter_hour_independent_verification_2026_11_12_evidence/SEVEN_HEAVEN_OKX_L2_96_SNAPSHOT_PAIR_INDEPENDENT_PROOFS.json), Git blob `c278bbe6bfe2ea2a208c01811731d6d38f192d7f`.
- [**GitHub Actions L2 streaming : SUCCESS deux actifs + publication**](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43266680887) ; [**GitHub Actions reproduction indépendante : SUCCESS**](https://github.com/BlueAzur-Hub/erith-ia-memory/actions/runs/43267697197).

## 7. Limites et étape suivante

L'étude couvre **une seule journée**, bien que ses 96 quarts d'heure couvrent toute l'horloge UTC. Elle n'établit pas les effets d'un régime de marché, les quantiles de tous les événements L2, ni les coûts réalisés. Elle ne change pas notre évaluation des EMA 10/30 : **OKX/USDC en octobre 2026** n'est pas l'historique **Bitstamp/USD de 2024–2026**, et les tarifs d'un compte particulier ne sont pas observés.

**Étape de recherche suivante recommandée :** appliquer exactement cette grille **96 snapshots par jour** aux archives du **15 août et du 15 septembre 2026** déjà identifiées, en conservant les mêmes critères et sans changer de dates. Notre comparaison porterait alors sur **3 journées × 2 actifs × 96 observations = 576 états**, et permettrait des descriptifs croisés plus solides. Il faudra garder la prudence sur la représentativité de trois journées seulement et l'absence de chaîne `seqId`.

**Aucune surveillance récurrente activée, aucun ordre réel, aucune modification du Trader ou du Bridge.**
