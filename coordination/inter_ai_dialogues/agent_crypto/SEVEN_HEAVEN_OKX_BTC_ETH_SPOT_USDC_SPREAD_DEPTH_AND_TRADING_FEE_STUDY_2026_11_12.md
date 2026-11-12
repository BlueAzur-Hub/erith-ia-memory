# Seven Heaven — OKX Spot BTC/ETH-USDC: Study of Order-Book Depth, Spread and Trading Fees

**Date:** 12 novembre 2026  
**Statut:** recherche documentaire et recalcul indépendant à partir des CSV publics déjà publiés ; **PAPER / lecture seule**.  
**Périmètre:** BTC-USDC et ETH-USDC, trois journées UTC isolées : 15 août, 15 septembre et 15 octobre 2026.  
**Aucune transaction réelle, aucune clé privée, aucun changement du Trader, de l'Administrator, de l'Operator ou du Bridge.**

## 1. Objectif et sources

L'étude précédente établissait les spreads et leur persistance à la minute. Cette étude complémentaire répond à une question plus pratique :

> Quel est, pour différents montants, le coût théorique d'acheter et de revendre au carnet, et quelle part est due au spread, à la profondeur et aux commissions ?

**Sources numériques contrôlées dans le dépôt public `BlueAzur-Hub/erith-ia-memory` :**

- `coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_OKX_L2_BTC_ETH_AUGUST_SEPTEMBER_OCTOBER_2026_96_QUARTER_HOUR_PAIRED_DEPTH_COSTS_2880_ROWS_2026_11_12.csv`
  - Blob Git SHA-1 : `4cc4d6e6cfda04da29a36ea23fb490ccd03e9238`
- `coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles/SEVEN_HEAVEN_OKX_L2_BTC_ETH_AUGUST_SEPTEMBER_OCTOBER_2026_96_QUARTER_HOUR_PAIRED_SPREADS_288_ROWS_2026_11_12.csv`
  - Blob Git SHA-1 : `1cd617b6229e23e6d1ef7b1b62d4ee6a691ab659`
- Rapport scientifique d'origine : `SEVEN_HEAVEN_OKX_L2_BTC_ETH_AUGUST_SEPTEMBER_OCTOBER_2026_96_QUARTER_HOUR_MULTI_DATE_SCIENTIFIC_REPORT_2026_11_12.md`
- Rapport de persistance minute/événements : `SEVEN_HEAVEN_OKX_BTC_ETH_AUGUST_SEPTEMBER_OCTOBER_ONE_MINUTE_EVENT_TIME_SPREAD_PERSISTENCE_SCIENTIFIC_AUDIT_2026_11_12.md`

Ces documents sont dans le même répertoire `strategy_profiles/` :  
https://github.com/BlueAzur-Hub/erith-ia-memory/tree/main/coordination/inter_ai_dialogues/agent_crypto/research/strategy_profiles

Les CSV comportent **288 horaires fixes** (96 par journée), **2 actifs**, **5 tailles** et **2 côtés** : 2 880 lignes de comparaison BTC/ETH pour les coûts, soit **5 760 coûts individuels**. Tous les statuts de profondeur du CSV sont `complete`. Il s'agit de 96 états de carnet par jour et actif, **pas** d'une reconstruction continue des coûts sur toutes les secondes.

## 2. Méthode : ne pas compter le spread deux fois

Chaque prix moyen d'exécution fictif (VWAP) est calculé depuis le **prix médian `mid`** d'un carnet historique figé.

Pour un même horaire, une taille donnée et un actif :

- `coût carnet achat (bp)` : écart entre le VWAP des asks consommés et le mid ;
- `coût carnet vente (bp)` : écart entre le mid et le VWAP des bids consommés ;
- `coût carnet des deux côtés (bp)` = coût achat + coût vente ;
- `impact additionnel de profondeur (bp)` = coût carnet des deux côtés − spread relatif (bp).

**Identité de décomposition :** `coût carnet deux côtés = spread + impact additionnel de profondeur`.

Le spread est donc **déjà compris** dans les coûts de carnet. Il serait faux de l'ajouter une deuxième fois.

Les deux côtés sont évalués au **même instantané de carnet**, sans évolution du prix entre achat et vente : c'est une **friction hypothétique** au même instant, *pas* une simulation de stratégie exécutée dans le temps.

Pour convertir les points de base : **1 bp = 0,01 %**. Un coût de `40 bp` équivaut à `0,40 %` du notionnel.

## 3. Résultats — décomposition des coûts de carnet, hors frais

Moyenne arithmétique sur **288 horaires appariés** par montant. Toutes les valeurs sont en **points de base (bp)** :

| Notionnel par côté | BTC : spread | BTC : impact profondeur | BTC : total carnet | ETH : spread | ETH : impact profondeur | ETH : total carnet |
|---:|---:|---:|---:|---:|---:|---:|
| 10 USDC | 0,151452 | 0,001418 | **0,152870** | 0,783644 | 0,005886 | **0,789531** |
| 100 USDC | 0,151452 | 0,018247 | **0,169698** | 0,783644 | 0,034731 | **0,818375** |
| 1 000 USDC | 0,151452 | 0,123586 | **0,275038** | 0,783644 | 0,322725 | **1,106369** |
| 10 000 USDC | 0,151452 | 0,725106 | **0,876557** | 0,783644 | 1,332564 | **2,116209** |
| 100 000 USDC | 0,151452 | 3,335582 | **3,487034** | 0,783644 | 9,343618 | **10,127262** |

**Observation vérifiée :** lorsque le montant augmente, le prix fictif consomme davantage de niveaux de carnet et son impact supplémentaire croît. Le spread de départ est indépendant du montant **pour un carnet donné** ; son importance relative décroît avec la taille de l'ordre.

**Profondeur mobilisée :**

| Notionnel | BTC : côtés consommant un seul niveau | ETH : côtés consommant un seul niveau | Nombre moyen de niveaux BTC / ETH |
|---:|---:|---:|---:|
| 10 USDC | 99,13 % | 98,96 % | 1,01 / 1,01 |
| 100 USDC | 95,83 % | 95,49 % | 1,06 / 1,06 |
| 1 000 USDC | 78,47 % | 54,69 % | 1,34 / 1,57 |
| 10 000 USDC | 19,10 % | 6,25 % | 3,45 / 3,59 |
| 100 000 USDC | 3,13 % | 0 % | 12,68 / 20,85 |

Un montant fictif de 100 000 USDC est une **expérience de résistance de profondeur**, non une proposition d'investissement ni une validation d'ordre admissible sur un compte.

## 4. Les commissions OKX : deux barèmes EEE à distinguer

Sources officielles consultées le 12 novembre 2026 :

1. Barème annoncé à compter du **25 septembre 2026, 10 h UTC+2**, pour les comptes **EEE Spot sans produits dérivés** : niveau standard **maker 0,10 % / taker 0,20 %**.  
   https://www.okx.com/fr-fr/help/important-notice-upcoming-spot-fee-adjustment-eea
2. Barème antérieur EEE Spot standard sans dérivés, en vigueur après les changements d'avril : **maker 0,20 % / taker 0,35 %**.  
   https://www.okx.com/fr-fr/help/notice-updates-to-okx-eea-trading-fees
3. L'OKX FAQ indique de consulter **Actifs > Mes frais de trading** pour connaître le tarif **réel de son compte et de chaque paire** :  
   https://www.okx.com/fr-fr/help/trading-fee-rules-faq

Ces tarifs **ne sont pas attestés pour un compte utilisateur précis**. Les comptes possédant un accès X-Perps, certains niveaux VIP, promotions ou marchés spécifiques peuvent avoir d'autres frais.

Pour une comparaison **taker/taker au même instant** au barème standard Spot sans dérivés :

- Au **15 août et au 15 septembre 2026** : 0,35 % × 2 ≈ **70 bp** de commission pour deux côtés.
- Au **15 octobre 2026** : 0,20 % × 2 ≈ **40 bp** de commission pour deux côtés.
- Pour un **scénario de frais constant au barème récent**, utiliser 40 bp pour les trois dates afin de ne pas confondre variation des frais et variation de la liquidité.

**Attention :** les simulations du carnet consomment les bids/asks, donc correspondent à un scénario **taker**. Ne pas les convertir mécaniquement en hypothèse maker : un ordre maker attend dans la file et son exécution, son délai et son prix ne sont pas modélisés par ce fichier.

## 5. Simulation de frais + carnet pour 1 000 USDC par côté

*Comparaison descriptive, somme des deux coûts du carnet à un instant et de deux commissions hypothétiques. Le capital, l'actif et les frais effectivement versés en crypto peuvent différer en pratique.*

| Journée | BTC : carnet | ETH : carnet | Frais taker/taker Spot standard EEE à la date | BTC : total approximatif | ETH : total approximatif |
|---|---:|---:|---:|---:|---:|
| 15 août | 0,19688 bp | 1,15532 bp | 70 bp | **7,0197 USDC** | **7,1155 USDC** |
| 15 septembre | 0,44037 bp | 1,47154 bp | 70 bp | **7,0440 USDC** | **7,1472 USDC** |
| 15 octobre | 0,18786 bp | 0,69224 bp | 40 bp | **4,0188 USDC** | **4,0692 USDC** |

Le changement entre septembre et octobre ne peut pas être attribué uniquement à la profondeur du carnet : **le taux de commission standard hypothétique a lui-même changé**.

### Scénario constant avec les frais Spot standards récents : 0,20 % taker par côté

Calcul sur les 288 instants agrégés :

| Notionnel par côté | BTC : frais + carnet, en bp | BTC : coût approximatif | ETH : frais + carnet, en bp | ETH : coût approximatif |
|---:|---:|---:|---:|---:|
| 100 USDC | 40,169698 | 0,4017 USDC | 40,818375 | 0,4082 USDC |
| 1 000 USDC | 40,275038 | 4,0275 USDC | 41,106369 | 4,1106 USDC |

**Pour 1 000 USDC en BTC**, la commission hypothétique de deux ordres taker (4 USDC) constitue environ **99,3 %** du total estimé à partir de ces carnets. Pour ETH, c'est environ **97,3 %**. Ce calcul est une **moyenne descriptive** et n'intègre aucune évolution du cours.

**Seuil indicatif pour un aller-retour spéculatif :** un mouvement brut de prix d'environ **0,403 % (BTC)** ou **0,411 % (ETH)** serait nécessaire pour seulement compenser ce scénario de coûts moyens à notionnel constant. Ces chiffres ne sont **ni des seuils d'achat ni des garanties de seuil de rentabilité réel** : dans la pratique, le prix varie entre l'entrée et la sortie, les deux carnets et les montants sont différents, les commissions peuvent être facturées en actifs différents, et des délais/annulations restent possibles.

## 6. Contrôles et limites

- **Vérifié ici :** rapprochement par date et horaire des deux CSV, 2 880 lignes de coûts `complete`, 288 observations de spread, identité `carnet = spread + impact` sans résidu négatif significatif au-delà de l'arrondi.
- **Vérifié dans le travail antérieur :** six archives historiques, SHA/CRC et workflows de reproduction ; pas de preuve de chaîne amont `seqId/prevSeqId`.
- **Non vérifié :** le niveau de frais d'un compte réel, les exonérations éventuelles, l'état d'exécution des ordres réels et la continuité logique de chaque update d'OKX avant archivage.
- **Échantillon limité :** seulement les 15 août, 15 septembre et 15 octobre 2026, 96 instantanés par jour. Ce ne sont ni 3 mois consécutifs, ni un tarif universel, ni une preuve prospective de rentabilité.
- **Périmètre devise et plateforme :** OKX Spot **USDC** uniquement. Ne pas transférer ces valeurs directement aux replays EMA historiques sur Bitstamp **USD**, ni mélanger avec EUR sans conversion sourcée.
- **Aucun double comptage :** le « coût carnet » inclut déjà le spread.
- **Aucune action de marché :** exclusivement calcul papier, aucune écriture sur le compte OKX.

## 7. Décision de recherche et prochaine étape unique

**Résultat de cette phase :** nous avons séparé quantitativement (1) le spread, (2) la consommation supplémentaire de niveaux de carnet avec la taille et (3) les commissions Spot théoriques. Pour de petits montants, les commissions taker dominent fortement ; pour de très gros ordres, la profondeur devient de plus en plus importante.

**Prochaine étape scientifique utile :** avant d'intégrer des frais dans une stratégie PAPER, vérifier le **barème exact par juridiction, niveau et paire**, puis fixer un coût constant et conservateur pour les différentes périodes historiques, afin de comparer les méthodes sans introduire un changement tarifaire artificiel.

**Point d'arrêt :** aucune modification du Trader ni du Bridge ; aucune publication sur GitHub ou écriture Notion sans instruction de ce type.